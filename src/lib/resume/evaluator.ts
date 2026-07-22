import type {
  EvaluationCriterionResult,
  EvaluationResult,
  ResumeDocument,
} from './types'

/**
 * Deterministic, rule-based ATS_Evaluator (Requirement 3).
 * Given identical ResumeDocument content, always produces the same
 * ATS_Score and Evaluation_Report (Requirement 3.3).
 */
export function evaluateResume(doc: ResumeDocument): EvaluationResult {
  const criteria: EvaluationCriterionResult[] = [
    evaluateContactCompleteness(doc),
    evaluateSectionPresence(doc),
    evaluateWorkExperienceDetail(doc),
    evaluateQuantifiedAchievements(doc),
    evaluateSkillsPresence(doc),
    evaluateSummaryPresence(doc),
    evaluateLength(doc),
    evaluateCertifications(doc),
  ]

  const totalPoints = criteria.reduce((sum, c) => sum + c.points, 0)
  const maxPoints = criteria.reduce((sum, c) => sum + c.maxPoints, 0)
  const score = Math.round((totalPoints / maxPoints) * 100)

  return { score, report: { criteria } }
}

function evaluateContactCompleteness(
  doc: ResumeDocument
): EvaluationCriterionResult {
  const { contact } = doc
  const hasEmail = !!contact.email
  const hasPhone = !!contact.phone
  const filled = [contact.name, hasEmail, hasPhone].filter(Boolean).length

  if (hasEmail && hasPhone && contact.name) {
    return {
      id: 'contact_completeness',
      label: 'Contact information completeness',
      status: 'pass',
      points: 15,
      maxPoints: 15,
    }
  }
  if (filled >= 2) {
    return {
      id: 'contact_completeness',
      label: 'Contact information completeness',
      status: 'partial',
      points: 8,
      maxPoints: 15,
      suggestion: 'Add a phone number and email so ATS systems and recruiters can reach you.',
    }
  }
  return {
    id: 'contact_completeness',
    label: 'Contact information completeness',
    status: 'fail',
    points: 0,
    maxPoints: 15,
    suggestion: 'Add your name, email, and phone number at the top of your resume.',
  }
}

function evaluateSectionPresence(
  doc: ResumeDocument
): EvaluationCriterionResult {
  const sectionsPresent = [
    doc.summary,
    doc.workExperience?.length,
    doc.education?.length,
    doc.skills?.length,
  ].filter(Boolean).length

  if (sectionsPresent === 4) {
    return {
      id: 'section_presence',
      label: 'Standard resume sections present',
      status: 'pass',
      points: 15,
      maxPoints: 15,
    }
  }
  if (sectionsPresent >= 2) {
    return {
      id: 'section_presence',
      label: 'Standard resume sections present',
      status: 'partial',
      points: 9,
      maxPoints: 15,
      suggestion:
        'Include all standard sections: summary, work experience, education, and skills.',
    }
  }
  return {
    id: 'section_presence',
    label: 'Standard resume sections present',
    status: 'fail',
    points: 0,
    maxPoints: 15,
    suggestion:
      'Your resume is missing most standard sections. Add a summary, work experience, education, and skills.',
  }
}

function evaluateWorkExperienceDetail(
  doc: ResumeDocument
): EvaluationCriterionResult {
  const entries = doc.workExperience ?? []
  const withBullets = entries.filter((e) => e.bullets.length > 0)

  if (entries.length === 0) {
    return {
      id: 'work_experience_detail',
      label: 'Work experience detail',
      status: 'fail',
      points: 0,
      maxPoints: 20,
      suggestion: 'Add your work experience with details for each role.',
    }
  }
  if (withBullets.length === entries.length) {
    return {
      id: 'work_experience_detail',
      label: 'Work experience detail',
      status: 'pass',
      points: 20,
      maxPoints: 20,
    }
  }
  return {
    id: 'work_experience_detail',
    label: 'Work experience detail',
    status: 'partial',
    points: 10,
    maxPoints: 20,
    suggestion:
      'Add bullet points describing your responsibilities and achievements for each role.',
  }
}

function evaluateQuantifiedAchievements(
  doc: ResumeDocument
): EvaluationCriterionResult {
  const bullets = (doc.workExperience ?? []).flatMap((e) => e.bullets)
  const numberRe = /\d/
  const quantified = bullets.filter((b) => numberRe.test(b))

  if (bullets.length === 0) {
    return {
      id: 'quantified_achievements',
      label: 'Quantified achievements',
      status: 'fail',
      points: 0,
      maxPoints: 15,
      suggestion:
        'Add measurable achievements (e.g. "increased sales by 20%") to your work experience.',
    }
  }
  const ratio = quantified.length / bullets.length
  if (ratio >= 0.5) {
    return {
      id: 'quantified_achievements',
      label: 'Quantified achievements',
      status: 'pass',
      points: 15,
      maxPoints: 15,
    }
  }
  if (ratio > 0) {
    return {
      id: 'quantified_achievements',
      label: 'Quantified achievements',
      status: 'partial',
      points: 7,
      maxPoints: 15,
      suggestion:
        'Quantify more of your achievements with numbers, percentages, or metrics.',
    }
  }
  return {
    id: 'quantified_achievements',
    label: 'Quantified achievements',
    status: 'fail',
    points: 0,
    maxPoints: 15,
    suggestion:
      'Add measurable achievements (e.g. "increased sales by 20%") to your work experience.',
  }
}

function evaluateSkillsPresence(
  doc: ResumeDocument
): EvaluationCriterionResult {
  const count = doc.skills?.length ?? 0
  if (count >= 5) {
    return {
      id: 'skills_presence',
      label: 'Relevant skills listed',
      status: 'pass',
      points: 15,
      maxPoints: 15,
    }
  }
  if (count > 0) {
    return {
      id: 'skills_presence',
      label: 'Relevant skills listed',
      status: 'partial',
      points: 7,
      maxPoints: 15,
      suggestion: 'List at least 5 relevant skills to improve keyword matching.',
    }
  }
  return {
    id: 'skills_presence',
    label: 'Relevant skills listed',
    status: 'fail',
    points: 0,
    maxPoints: 15,
    suggestion: 'Add a skills section listing your relevant technical and professional skills.',
  }
}

function evaluateSummaryPresence(
  doc: ResumeDocument
): EvaluationCriterionResult {
  const length = doc.summary?.trim().length ?? 0
  if (length >= 80) {
    return {
      id: 'summary_presence',
      label: 'Professional summary',
      status: 'pass',
      points: 10,
      maxPoints: 10,
    }
  }
  if (length > 0) {
    return {
      id: 'summary_presence',
      label: 'Professional summary',
      status: 'partial',
      points: 5,
      maxPoints: 10,
      suggestion: 'Expand your summary to 2-3 sentences highlighting your experience and goals.',
    }
  }
  return {
    id: 'summary_presence',
    label: 'Professional summary',
    status: 'fail',
    points: 0,
    maxPoints: 10,
    suggestion: 'Add a professional summary at the top of your resume.',
  }
}

function evaluateLength(doc: ResumeDocument): EvaluationCriterionResult {
  const bulletCount = (doc.workExperience ?? []).flatMap((e) => e.bullets).length
  if (bulletCount >= 3 && bulletCount <= 30) {
    return {
      id: 'content_length',
      label: 'Appropriate content length',
      status: 'pass',
      points: 5,
      maxPoints: 5,
    }
  }
  return {
    id: 'content_length',
    label: 'Appropriate content length',
    status: 'partial',
    points: 2,
    maxPoints: 5,
    suggestion: 'Aim for a concise resume with 3-30 detailed bullet points across your roles.',
  }
}

function evaluateCertifications(doc: ResumeDocument): EvaluationCriterionResult {
  const count = doc.certifications?.length ?? 0
  if (count > 0) {
    return {
      id: 'certifications',
      label: 'Relevant certifications',
      status: 'pass',
      points: 5,
      maxPoints: 5,
    }
  }
  return {
    id: 'certifications',
    label: 'Relevant certifications',
    status: 'partial',
    points: 3,
    maxPoints: 5,
    suggestion:
      'If you hold any relevant certifications or completed courses, add them — they can boost keyword matches.',
  }
}
