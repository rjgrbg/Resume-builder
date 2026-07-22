'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { extractText, parseResumeText, ResumeParseError } from './parser'
import { parseResumeWithAI } from './ai-parser'
import { evaluateResume } from './evaluator'
import { enhanceResume, EnhancementError } from './enhancer'
import type { ResumeDocument } from './types'
import type { Json } from '@/lib/supabase/database.types'

/** Supabase's generated Json type requires structural conversion for our interfaces. */
function toJson<T>(value: T): Json {
  return value as unknown as Json
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB (Requirement 1.3)
const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string }

/**
 * Requirement 1: Resume File Upload.
 * Validates, stores the file, persists metadata, then triggers parsing.
 */
export async function uploadResume(
  formData: FormData
): Promise<ActionResult<{ resumeId: string }>> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user
  if (!user) {
    return { ok: false, error: 'You must be signed in to upload a resume.' }
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return { ok: false, error: 'No file was provided.' }
  }

  if (!SUPPORTED_MIME_TYPES.includes(file.type)) {
    return {
      ok: false,
      error: 'Unsupported file type. Please upload a PDF or DOCX file.',
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      ok: false,
      error: 'File is too large. The maximum allowed size is 10 MB.',
    }
  }

  const resumeId = crypto.randomUUID()
  const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_')
  const filePath = `${user.id}/${resumeId}/${safeName}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await supabase.storage
    .from('resumes')
    .upload(filePath, buffer, { contentType: file.type })

  if (uploadError) {
    return {
      ok: false,
      error: 'Upload failed due to a storage error. Please try again.',
    }
  }

  const { error: insertError } = await supabase.from('resumes').insert({
    id: resumeId,
    user_id: user.id,
    file_path: filePath,
    file_name: file.name,
    status: 'uploaded',
  })

  if (insertError) {
    await supabase.storage.from('resumes').remove([filePath])
    return { ok: false, error: 'Upload failed. Please try again.' }
  }

  // Requirement 1.5: trigger parsing.
  await parseAndEvaluateResume(resumeId, buffer, file.type)

  revalidatePath('/')
  return { ok: true, data: { resumeId } }
}

/**
 * Requirement 2 + 3: parses the uploaded file into an Original_Resume and
 * evaluates it against the Scoring_Criteria.
 */
async function parseAndEvaluateResume(
  resumeId: string,
  buffer: Buffer,
  mimeType: string
) {
  const supabase = await createClient()

  await supabase
    .from('resumes')
    .update({ status: 'parsing' })
    .eq('id', resumeId)

  try {
    const text = await extractText(buffer, mimeType)

    // Prefer AI-based structuring for accuracy (correctly distinguishes
    // job titles from companies, parses date ranges, recognizes sections
    // like certifications/references). Fall back to the heuristic
    // regex-based parser if AI parsing isn't configured or fails.
    let document: ResumeDocument
    try {
      document = await parseResumeWithAI(text)
    } catch (aiErr) {
      console.warn(
        '[resume-actions] AI parsing unavailable, falling back to heuristic parser:',
        aiErr
      )
      document = parseResumeText(text)
    }

    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user!.id

    const { data: docRow, error: docError } = await supabase
      .from('resume_documents')
      .insert({
        resume_id: resumeId,
        user_id: userId,
        kind: 'original',
        content: toJson(document),
      })
      .select('id')
      .single()

    if (docError || !docRow) {
      throw new Error('Failed to persist the parsed resume.')
    }

    await supabase
      .from('resumes')
      .update({ status: 'parsed' })
      .eq('id', resumeId)

    await runEvaluation(docRow.id, document)
  } catch (err) {
    console.error('[resume-actions] parseAndEvaluateResume failed:', err)

    await supabase
      .from('resumes')
      .update({ status: 'parse_failed' })
      .eq('id', resumeId)

    if (!(err instanceof ResumeParseError)) {
      throw err
    }
  }
}

/**
 * Requirement 3: runs the ATS_Evaluator and persists (replacing any prior)
 * ATS_Score and Evaluation_Report for the given Resume_Document.
 */
async function runEvaluation(resumeDocumentId: string, document: ResumeDocument) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData.user!.id

  const result = evaluateResume(document)

  await supabase.from('evaluations').upsert(
    {
      resume_document_id: resumeDocumentId,
      user_id: userId,
      score: result.score,
      report: toJson(result.report),
    },
    { onConflict: 'resume_document_id' }
  )
}

/**
 * Requirement 2.2: allows the User to create a Resume_Document manually
 * through the Resume_Editor when the Resume_Parser could not extract any
 * content from the uploaded file.
 */
export async function createResumeManually(resumeId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user
  if (!user) {
    return { ok: false, error: 'You must be signed in.' }
  }

  const { data: resume } = await supabase
    .from('resumes')
    .select('id')
    .eq('id', resumeId)
    .eq('user_id', user.id)
    .single()

  if (!resume) {
    return { ok: false, error: 'Resume not found.' }
  }

  const blank: ResumeDocument = { contact: { name: '' } }

  const { data: docRow, error: docError } = await supabase
    .from('resume_documents')
    .upsert(
      {
        resume_id: resumeId,
        user_id: user.id,
        kind: 'original',
        content: toJson(blank),
      },
      { onConflict: 'resume_id,kind' }
    )
    .select('id')
    .single()

  if (docError || !docRow) {
    return { ok: false, error: 'Failed to create the resume. Please try again.' }
  }

  await supabase.from('resumes').update({ status: 'parsed' }).eq('id', resumeId)
  await runEvaluation(docRow.id, blank)

  revalidatePath(`/resumes/${resumeId}`)
  return { ok: true, data: undefined }
}

/**
 * Requirement 4: AI-Powered Resume Enhancement.
 */
export async function enhanceResumeAction(
  resumeId: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user
  if (!user) {
    return { ok: false, error: 'You must be signed in.' }
  }

  const { data: original } = await supabase
    .from('resume_documents')
    .select('id, content')
    .eq('resume_id', resumeId)
    .eq('kind', 'original')
    .single()

  if (!original) {
    return { ok: false, error: 'Original resume not found.' }
  }

  try {
    const enhanced = await enhanceResume(original.content as unknown as ResumeDocument)

    const { data: docRow, error: docError } = await supabase
      .from('resume_documents')
      .upsert(
        {
          resume_id: resumeId,
          user_id: user.id,
          kind: 'enhanced',
          content: toJson(enhanced),
        },
        { onConflict: 'resume_id,kind' }
      )
      .select('id')
      .single()

    if (docError || !docRow) {
      return { ok: false, error: 'Failed to save the enhanced resume.' }
    }

    await runEvaluation(docRow.id, enhanced)

    revalidatePath(`/resumes/${resumeId}`)
    return { ok: true, data: undefined }
  } catch (err) {
    if (err instanceof EnhancementError) {
      return { ok: false, error: err.message }
    }
    return { ok: false, error: 'AI enhancement failed. Please try again.' }
  }
}

/**
 * Requirement 5: Editing Resume Content.
 */
export async function saveResumeDocument(
  resumeDocumentId: string,
  content: ResumeDocument
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user
  if (!user) {
    return { ok: false, error: 'You must be signed in.' }
  }

  const hasName = !!content.contact.name?.trim()
  const hasContactMethod = !!(
    content.contact.phone?.trim() ||
    content.contact.email?.trim() ||
    content.contact.address?.trim()
  )

  if (!hasName) {
    return { ok: false, error: 'Name is required.' }
  }
  if (!hasContactMethod) {
    return {
      ok: false,
      error: 'At least one contact method (phone, email, or address) is required.',
    }
  }

  const { data: docRow, error: updateError } = await supabase
    .from('resume_documents')
    .update({ content: toJson(content) })
    .eq('id', resumeDocumentId)
    .eq('user_id', user.id)
    .select('id, resume_id')
    .single()

  if (updateError || !docRow) {
    return { ok: false, error: 'Failed to save your changes. Please try again.' }
  }

  try {
    await runEvaluation(docRow.id, content)
  } catch {
    return {
      ok: false,
      error: 'Saved, but the updated ATS score could not be generated.',
    }
  }

  revalidatePath(`/resumes/${docRow.resume_id}`)
  return { ok: true, data: undefined }
}

/**
 * Requirement 6: deletes a resume the user owns, including its file,
 * documents, and evaluations (via cascade).
 */
export async function deleteResume(resumeId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user
  if (!user) {
    return { ok: false, error: 'You must be signed in.' }
  }

  const { data: resume } = await supabase
    .from('resumes')
    .select('id, file_path, user_id')
    .eq('id', resumeId)
    .eq('user_id', user.id)
    .single()

  if (!resume) {
    return { ok: false, error: 'Resume not found.' }
  }

  await supabase.storage.from('resumes').remove([resume.file_path])
  await supabase.from('resumes').delete().eq('id', resumeId).eq('user_id', user.id)

  revalidatePath('/')
  return { ok: true, data: undefined }
}
