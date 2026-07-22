import OpenAI from 'openai'
import type { ResumeDocument } from './types'
import { ResumeParseError } from './parser'

const PARSE_TIMEOUT_MS = 60_000

const SCHEMA_DESCRIPTION =
  '{ contact: { name: string, email?: string, phone?: string, address?: string, linkedin?: string, website?: string }, ' +
  'summary?: string, ' +
  'workExperience?: { company: string, title: string, startDate?: string, endDate?: string, location?: string, bullets: string[] }[], ' +
  'education?: { institution: string, degree?: string, field?: string, startDate?: string, endDate?: string }[], ' +
  'skills?: string[], ' +
  'certifications?: { name: string, issuer?: string, date?: string }[], ' +
  'references?: { name: string, title?: string, contact?: string }[] }'

/**
 * AI-assisted structuring of raw resume text into a ResumeDocument.
 *
 * Regex/heuristic parsing cannot reliably tell a job title from a company
 * name, detect date ranges in varied formats, or recognize sections like
 * certifications and references. An LLM reads the text the way a human
 * would and returns accurately structured fields. Falls back to the
 * heuristic parser (parser.ts) only when no API key is configured.
 */
export async function parseResumeWithAI(text: string): Promise<ResumeDocument> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new ResumeParseError('AI parsing is not configured.')
  }

  const client = new OpenAI({ apiKey })
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), PARSE_TIMEOUT_MS)

  try {
    const completion = await client.chat.completions.create(
      {
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        temperature: 0,
        messages: [
          {
            role: 'system',
            content:
              'You extract structured data from raw resume text. Read the text carefully and identify each ' +
              'field accurately: correctly distinguish job titles from company names, parse date ranges ' +
              '(including "Present"/"Current") into startDate/endDate, and correctly group bullet points ' +
              'under the right role. Recognize sections such as work experience, education, skills, ' +
              'certifications, and references even if their headings are non-standard or grouped under a ' +
              'broader heading (e.g. skills subsections). Do not invent, guess, or add information that is ' +
              'not present in the source text. Only include a field or section if it is actually present. ' +
              `Respond with ONLY a JSON object matching this TypeScript type exactly:\n${SCHEMA_DESCRIPTION}`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
      },
      { signal: controller.signal }
    )

    const raw = completion.choices[0]?.message?.content
    if (!raw) {
      throw new ResumeParseError('The AI model returned an empty response.')
    }

    const parsed = JSON.parse(raw) as ResumeDocument
    if (!parsed.contact?.name) {
      throw new ResumeParseError('Could not identify a name in this resume.')
    }

    return parsed
  } catch (err) {
    if (err instanceof ResumeParseError) throw err
    throw new ResumeParseError(
      err instanceof Error ? err.message : 'AI parsing failed.'
    )
  } finally {
    clearTimeout(timeout)
  }
}
