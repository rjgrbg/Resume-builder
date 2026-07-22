import type { ResumeDocument, EducationEntry, WorkExperienceEntry } from './types'

export class ResumeParseError extends Error {}

// Lenient heading detection: a line counts as a section heading if it is
// short (real headings are rarely long sentences) and contains one of the
// keywords as a whole word, regardless of surrounding punctuation, case,
// or extra words (e.g. "Professional Experience", "SKILLS & TOOLS").
const SECTION_KEYWORDS: Record<string, RegExp> = {
  summary: /\b(summary|profile|objective)\b/i,
  workExperience: /\b(experience|employment|work history)\b/i,
  education: /\b(education|academic)\b/i,
  skills: /\b(skills|competenc|proficienc)\b/i,
}
const MAX_HEADING_LENGTH = 40

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
const PHONE_RE = /(\+?\d[\d\s().-]{7,}\d)/
const LINKEDIN_RE = /(linkedin\.com\/[a-zA-Z0-9\-_/]+)/i
const WEBSITE_RE = /((https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.(com|net|org|dev|io)[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=]*)/i

/**
 * Extracts raw text from a Supported_File_Type (PDF or DOCX).
 */
export async function extractText(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  try {
    if (mimeType === 'application/pdf') {
      // Import pdf-parse's internal lib file directly rather than its
      // package entry point. pdf-parse v1's index.js contains a
      // `!module.parent` "debug mode" check meant to only run when the
      // package is executed directly as a script, but Next.js's bundler
      // makes `module.parent` undefined for normal imports too — so the
      // entry point tries to read its own internal sample PDF (which
      // doesn't exist in this project) as a side effect of just being
      // imported. The internal lib file has no such check.
      // Also avoids pdf-parse v2's worker-thread requirement, which
      // Next.js's server bundle doesn't carry over.
      const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default
      const result = await pdfParse(buffer)
      return result.text
    }

    if (
      mimeType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      return result.value
    }

    throw new ResumeParseError(`Unsupported mime type: ${mimeType}`)
  } catch (err) {
    if (err instanceof ResumeParseError) throw err
    console.error('[resume-parser] extractText failed:', err)
    throw new ResumeParseError('Failed to open or read the file.')
  }
}

/**
 * Parses raw resume text into a structured ResumeDocument.
 *
 * Section detection is intentionally lenient: real-world resumes vary
 * widely in heading format, and some PDF exporters flatten whole
 * paragraphs (or the entire document) onto very few lines with no
 * newlines at all. This function is designed to ALWAYS succeed and
 * produce a usable, editable document as long as there is any
 * non-whitespace text at all — a User should only see a parse failure
 * when the file truly has no extractable text (Requirement 2.2).
 */
export function parseResumeText(text: string): ResumeDocument {
  if (text.trim().length === 0) {
    throw new ResumeParseError('No text could be extracted from this file.')
  }

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  const headerLines = lines.slice(0, 6).join(' ') || text
  const email = headerLines.match(EMAIL_RE)?.[0]
  const phone = headerLines.match(PHONE_RE)?.[0]?.trim()
  const linkedin = headerLines.match(LINKEDIN_RE)?.[0]
  const website = headerLines.match(WEBSITE_RE)?.[0]
  const name = guessName(lines, text)

  const { sections, matchedAnyHeading } = splitIntoSections(lines)

  const doc: ResumeDocument = {
    contact: {
      name,
      ...(email ? { email } : {}),
      ...(phone ? { phone } : {}),
      ...(linkedin ? { linkedin } : {}),
      ...(website && website !== linkedin ? { website } : {}),
    },
  }

  if (sections.summary?.length) {
    doc.summary = sections.summary.join(' ')
  }
  if (sections.workExperience?.length) {
    doc.workExperience = parseWorkExperience(sections.workExperience)
  }
  if (sections.education?.length) {
    doc.education = parseEducation(sections.education)
  }
  if (sections.skills?.length) {
    doc.skills = parseSkills(sections.skills)
  }

  const hasAnySection =
    doc.summary || doc.workExperience || doc.education || doc.skills

  // Fallback: no recognizable headings were found (or too little
  // structure to split into lines at all). Keep the remaining body text
  // as a summary so the User always has something to review and edit,
  // rather than a dead end.
  if (!hasAnySection) {
    const body =
      lines.length > 1
        ? lines.slice(1).join(' ').trim()
        : text.replace(name, '').trim()

    if (body.length > 0) {
      doc.summary = body
    } else if (!matchedAnyHeading) {
      // Truly nothing beyond a name-like fragment — still succeed with
      // just the contact info rather than failing the whole upload.
      doc.summary = undefined
    }
  }

  return doc
}

function guessName(lines: string[], fullText: string): string {
  if (lines.length === 0) {
    // No line breaks at all — take the first few words as a best guess.
    const words = fullText.trim().split(/\s+/).slice(0, 4)
    return words.join(' ') || 'Untitled Resume'
  }

  // The name is usually the first line, unless that line is actually
  // contact info (email/phone) that got extracted before the name.
  const first = lines[0]
  if (EMAIL_RE.test(first) || PHONE_RE.test(first)) {
    return lines[1] ?? first
  }
  return first
}

function matchHeading(line: string): string | undefined {
  if (line.length > MAX_HEADING_LENGTH) return undefined
  return Object.entries(SECTION_KEYWORDS).find(([, re]) => re.test(line))?.[0]
}

function splitIntoSections(
  lines: string[]
): { sections: Record<string, string[]>; matchedAnyHeading: boolean } {
  const sections: Record<string, string[]> = {}
  let current: string | null = null
  let matchedAnyHeading = false

  // Skip the first line (name) when scanning for headings.
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    const matchedKey = matchHeading(line)

    if (matchedKey) {
      current = matchedKey
      sections[current] ??= []
      matchedAnyHeading = true
      continue
    }

    if (current) {
      sections[current].push(line)
    }
  }

  return { sections, matchedAnyHeading }
}

function parseWorkExperience(lines: string[]): WorkExperienceEntry[] {
  const entries: WorkExperienceEntry[] = []
  let current: WorkExperienceEntry | null = null

  for (const line of lines) {
    const isBullet = /^[-•*]/.test(line)
    if (isBullet && current) {
      current.bullets.push(line.replace(/^[-•*]\s*/, ''))
      continue
    }

    const dateMatch = line.match(/(\b\d{4}\b.*?)$/)
    if (current) entries.push(current)
    current = {
      company: line,
      title: '',
      bullets: [],
      ...(dateMatch ? { endDate: dateMatch[1].trim() } : {}),
    }
  }
  if (current) entries.push(current)

  return entries.filter((e) => e.company.length > 0)
}

function parseEducation(lines: string[]): EducationEntry[] {
  return lines.filter((l) => l.length > 0).map((institution) => ({ institution }))
}

function parseSkills(lines: string[]): string[] {
  return lines
    .join(', ')
    .split(/[,•|]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}
