/**
 * The structured, in-app representation of a resume's content.
 * Corresponds to "Resume_Document" in the requirements glossary.
 *
 * Sections are optional and MUST be omitted (not set) when no corresponding
 * content exists in the source, per Requirement 2.1.
 */
export interface ResumeDocument {
  contact: ContactInfo
  summary?: string
  workExperience?: WorkExperienceEntry[]
  education?: EducationEntry[]
  skills?: string[]
  certifications?: CertificationEntry[]
  references?: ReferenceEntry[]
}

export interface ContactInfo {
  name: string
  email?: string
  phone?: string
  address?: string
  linkedin?: string
  website?: string
}

export interface WorkExperienceEntry {
  company: string
  title: string
  startDate?: string
  endDate?: string
  location?: string
  bullets: string[]
}

export interface EducationEntry {
  institution: string
  degree?: string
  field?: string
  startDate?: string
  endDate?: string
}

export interface CertificationEntry {
  name: string
  issuer?: string
  date?: string
}

export interface ReferenceEntry {
  name: string
  title?: string
  contact?: string
}

/** Per-criterion result within an Evaluation_Report. */
export interface EvaluationCriterionResult {
  id: string
  label: string
  status: 'pass' | 'partial' | 'fail'
  points: number
  maxPoints: number
  suggestion?: string
}

/** Structured breakdown produced by the ATS_Evaluator (Requirement 3). */
export interface EvaluationReport {
  criteria: EvaluationCriterionResult[]
}

export interface EvaluationResult {
  score: number
  report: EvaluationReport
}

export type ResumeDocumentKind = 'original' | 'enhanced'

export type ResumeStatus = 'uploaded' | 'parsing' | 'parsed' | 'parse_failed'
