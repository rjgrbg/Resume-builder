import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { renderResumePdf } from '@/lib/resume/pdf'
import type { ResumeDocument } from '@/lib/resume/types'

/**
 * Requirement 7: Resume Export.
 * GET /resumes/:resumeId/export/:kind  (kind = "original" | "enhanced")
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ resumeId: string; kind: string }> }
) {
  const { resumeId, kind } = await params

  if (kind !== 'original' && kind !== 'enhanced') {
    return NextResponse.json({ error: 'Invalid resume kind.' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const { data: doc, error } = await supabase
    .from('resume_documents')
    .select('content')
    .eq('resume_id', resumeId)
    .eq('kind', kind)
    .eq('user_id', userData.user.id)
    .single()

  if (error || !doc) {
    return NextResponse.json({ error: 'Resume not found.' }, { status: 404 })
  }

  try {
    const pdfBuffer = await renderResumePdf(doc.content as unknown as ResumeDocument)
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="resume-${kind}.pdf"`,
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to generate the exported PDF.' },
      { status: 500 }
    )
  }
}
