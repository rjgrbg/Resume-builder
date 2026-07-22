import OpenAI from 'openai'
import type { ResumeDocument } from './types'

export class EnhancementError extends Error {}

const ENHANCE_TIMEOUT_MS = 60_000

/**
 * AI_Enhancer: transforms an Original_Resume into an Enhanced_Resume using
 * an AI model, applying ATS best practices (Requirement 4).
 *
 * Preserves factual identity fields (name and contact information)
 * unchanged (Requirement 4.2), and fails with EnhancementError if the
 * model errors or does not respond within 60 seconds (Requirement 4.5).
 */
export async function enhanceResume(
  original: ResumeDocument
): Promise<ResumeDocument> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new EnhancementError('AI enhancement is not configured.')
  }

  const client = new OpenAI({ apiKey })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), ENHANCE_TIMEOUT_MS)

  try {
    const completion = await client.chat.completions.create(
      {
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        temperature: 0.4,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert resume writer specializing in Applicant Tracking System (ATS) optimization. ' +
              'Rewrite the given resume JSON to maximize ATS compatibility: use standard section headings, ' +
              'strong action verbs, quantified achievements, and relevant keywords for the roles implied by ' +
              'the content. Do not fabricate employers, dates, degrees, or job titles that are not implied ' +
              'by the source. Respond with ONLY a JSON object matching this TypeScript type exactly:\n' +
              '{ contact: { name: string, email?: string, phone?: string, address?: string, linkedin?: string, website?: string }, ' +
              'summary?: string, ' +
              'workExperience?: { company: string, title: string, startDate?: string, endDate?: string, location?: string, bullets: string[] }[], ' +
              'education?: { institution: string, degree?: string, field?: string, startDate?: string, endDate?: string }[], ' +
              'skills?: string[], ' +
              'certifications?: { name: string, issuer?: string, date?: string }[], ' +
              'references?: { name: string, title?: string, contact?: string }[] }\n' +
              'Preserve the "certifications" and "references" arrays exactly as given, including all fields ' +
              'within each entry, unless a field within them is clearly missing information the summary or ' +
              'experience could reasonably clarify.\n' +
              'The "contact.name", "contact.email", "contact.phone", "contact.address", "contact.linkedin", ' +
              'and "contact.website" fields MUST be copied verbatim from the input, unchanged.',
          },
          {
            role: 'user',
            content: JSON.stringify(original),
          },
        ],
      },
      { signal: controller.signal }
    )

    const raw = completion.choices[0]?.message?.content
    if (!raw) {
      throw new EnhancementError('The AI model returned an empty response.')
    }

    const enhanced = JSON.parse(raw) as ResumeDocument

    // Requirement 4.2: identity fields must remain unchanged.
    enhanced.contact = { ...original.contact }

    return enhanced
  } catch (err) {
    if (err instanceof EnhancementError) throw err
    throw new EnhancementError(
      err instanceof Error ? err.message : 'AI enhancement failed.'
    )
  } finally {
    clearTimeout(timeout)
  }
}
