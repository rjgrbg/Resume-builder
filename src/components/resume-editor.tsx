'use client'

import type {
  CertificationEntry,
  EducationEntry,
  ReferenceEntry,
  ResumeDocument,
  WorkExperienceEntry,
} from '@/lib/resume/types'
import { Input, Textarea, Field } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Props {
  value: ResumeDocument
  onChange: (value: ResumeDocument) => void
}

export function ResumeEditor({ value, onChange }: Props) {
  function updateContact(field: keyof ResumeDocument['contact'], v: string) {
    onChange({ ...value, contact: { ...value.contact, [field]: v } })
  }

  function updateWorkEntry(index: number, patch: Partial<WorkExperienceEntry>) {
    const entries = [...(value.workExperience ?? [])]
    entries[index] = { ...entries[index], ...patch }
    onChange({ ...value, workExperience: entries })
  }

  function updateBullet(entryIndex: number, bulletIndex: number, text: string) {
    const entries = [...(value.workExperience ?? [])]
    const bullets = [...entries[entryIndex].bullets]
    bullets[bulletIndex] = text
    entries[entryIndex] = { ...entries[entryIndex], bullets }
    onChange({ ...value, workExperience: entries })
  }

  function addBullet(entryIndex: number) {
    const entries = [...(value.workExperience ?? [])]
    entries[entryIndex] = {
      ...entries[entryIndex],
      bullets: [...entries[entryIndex].bullets, ''],
    }
    onChange({ ...value, workExperience: entries })
  }

  function removeBullet(entryIndex: number, bulletIndex: number) {
    const entries = [...(value.workExperience ?? [])]
    entries[entryIndex] = {
      ...entries[entryIndex],
      bullets: entries[entryIndex].bullets.filter((_, i) => i !== bulletIndex),
    }
    onChange({ ...value, workExperience: entries })
  }

  function addWorkEntry() {
    onChange({
      ...value,
      workExperience: [
        ...(value.workExperience ?? []),
        { company: '', title: '', bullets: [] },
      ],
    })
  }

  function removeWorkEntry(index: number) {
    onChange({
      ...value,
      workExperience: (value.workExperience ?? []).filter((_, i) => i !== index),
    })
  }

  function updateEducationEntry(index: number, patch: Partial<EducationEntry>) {
    const entries = [...(value.education ?? [])]
    entries[index] = { ...entries[index], ...patch }
    onChange({ ...value, education: entries })
  }

  function addEducationEntry() {
    onChange({ ...value, education: [...(value.education ?? []), { institution: '' }] })
  }

  function removeEducationEntry(index: number) {
    onChange({
      ...value,
      education: (value.education ?? []).filter((_, i) => i !== index),
    })
  }

  function updateSkills(text: string) {
    onChange({
      ...value,
      skills: text
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
    })
  }

  function updateCertification(index: number, patch: Partial<CertificationEntry>) {
    const entries = [...(value.certifications ?? [])]
    entries[index] = { ...entries[index], ...patch }
    onChange({ ...value, certifications: entries })
  }

  function addCertification() {
    onChange({
      ...value,
      certifications: [...(value.certifications ?? []), { name: '' }],
    })
  }

  function removeCertification(index: number) {
    onChange({
      ...value,
      certifications: (value.certifications ?? []).filter((_, i) => i !== index),
    })
  }

  function updateReference(index: number, patch: Partial<ReferenceEntry>) {
    const entries = [...(value.references ?? [])]
    entries[index] = { ...entries[index], ...patch }
    onChange({ ...value, references: entries })
  }

  function addReference() {
    onChange({ ...value, references: [...(value.references ?? []), { name: '' }] })
  }

  function removeReference(index: number) {
    onChange({
      ...value,
      references: (value.references ?? []).filter((_, i) => i !== index),
    })
  }

  return (
    <div className="flex flex-col gap-8">
      <Section title="Contact">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Full name">
            <Input value={value.contact.name} onChange={(e) => updateContact('name', e.target.value)} />
          </Field>
          <Field label="Email">
            <Input value={value.contact.email ?? ''} onChange={(e) => updateContact('email', e.target.value)} />
          </Field>
          <Field label="Phone">
            <Input value={value.contact.phone ?? ''} onChange={(e) => updateContact('phone', e.target.value)} />
          </Field>
          <Field label="Address">
            <Input value={value.contact.address ?? ''} onChange={(e) => updateContact('address', e.target.value)} />
          </Field>
          <Field label="LinkedIn">
            <Input value={value.contact.linkedin ?? ''} onChange={(e) => updateContact('linkedin', e.target.value)} />
          </Field>
          <Field label="Website">
            <Input value={value.contact.website ?? ''} onChange={(e) => updateContact('website', e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Summary">
        <Textarea
          rows={3}
          placeholder="A brief summary of your experience and career goals…"
          value={value.summary ?? ''}
          onChange={(e) => onChange({ ...value, summary: e.target.value })}
        />
      </Section>

      <Section
        title="Work experience"
        action={
          <Button variant="ghost" size="sm" onClick={addWorkEntry}>
            + Add role
          </Button>
        }
      >
        {(value.workExperience ?? []).length === 0 && <EmptyHint text="No roles added yet." />}
        <div className="flex flex-col gap-3">
          {(value.workExperience ?? []).map((entry, i) => (
            <div key={i} className="rounded-lg border border-border p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-ink-subtle">Role {i + 1}</span>
                <button
                  onClick={() => removeWorkEntry(i)}
                  className="text-xs text-danger hover:underline"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Job title">
                  <Input value={entry.title} onChange={(e) => updateWorkEntry(i, { title: e.target.value })} />
                </Field>
                <Field label="Company">
                  <Input value={entry.company} onChange={(e) => updateWorkEntry(i, { company: e.target.value })} />
                </Field>
                <Field label="Start date">
                  <Input value={entry.startDate ?? ''} onChange={(e) => updateWorkEntry(i, { startDate: e.target.value })} />
                </Field>
                <Field label="End date">
                  <Input value={entry.endDate ?? ''} onChange={(e) => updateWorkEntry(i, { endDate: e.target.value })} />
                </Field>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-ink-muted">Achievements</span>
                {entry.bullets.map((b, j) => (
                  <div key={j} className="flex gap-2">
                    <Input value={b} onChange={(e) => updateBullet(i, j, e.target.value)} />
                    <button
                      onClick={() => removeBullet(i, j)}
                      className="text-ink-subtle hover:text-danger px-1"
                      aria-label="Remove bullet"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="self-start" onClick={() => addBullet(i)}>
                  + Add bullet
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Education"
        action={
          <Button variant="ghost" size="sm" onClick={addEducationEntry}>
            + Add education
          </Button>
        }
      >
        {(value.education ?? []).length === 0 && <EmptyHint text="No education added yet." />}
        <div className="flex flex-col gap-3">
          {(value.education ?? []).map((entry, i) => (
            <div key={i} className="rounded-lg border border-border p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-ink-subtle">Entry {i + 1}</span>
                <button
                  onClick={() => removeEducationEntry(i)}
                  className="text-xs text-danger hover:underline"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Institution">
                  <Input
                    value={entry.institution}
                    onChange={(e) => updateEducationEntry(i, { institution: e.target.value })}
                  />
                </Field>
                <Field label="Degree">
                  <Input
                    value={entry.degree ?? ''}
                    onChange={(e) => updateEducationEntry(i, { degree: e.target.value })}
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Skills">
        <Input
          placeholder="e.g. JavaScript, Project Management, SQL"
          value={(value.skills ?? []).join(', ')}
          onChange={(e) => updateSkills(e.target.value)}
        />
        <p className="text-xs text-ink-subtle mt-1.5">Separate each skill with a comma.</p>
      </Section>

      <Section
        title="Certifications"
        action={
          <Button variant="ghost" size="sm" onClick={addCertification}>
            + Add certification
          </Button>
        }
      >
        {(value.certifications ?? []).length === 0 && (
          <EmptyHint text="No certifications added yet." />
        )}
        <div className="flex flex-col gap-3">
          {(value.certifications ?? []).map((cert, i) => (
            <div key={i} className="rounded-lg border border-border p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-ink-subtle">Certification {i + 1}</span>
                <button
                  onClick={() => removeCertification(i)}
                  className="text-xs text-danger hover:underline"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="Name">
                  <Input
                    value={cert.name}
                    onChange={(e) => updateCertification(i, { name: e.target.value })}
                  />
                </Field>
                <Field label="Issuer">
                  <Input
                    value={cert.issuer ?? ''}
                    onChange={(e) => updateCertification(i, { issuer: e.target.value })}
                  />
                </Field>
                <Field label="Date">
                  <Input
                    value={cert.date ?? ''}
                    onChange={(e) => updateCertification(i, { date: e.target.value })}
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="References"
        action={
          <Button variant="ghost" size="sm" onClick={addReference}>
            + Add reference
          </Button>
        }
      >
        {(value.references ?? []).length === 0 && <EmptyHint text="No references added yet." />}
        <div className="flex flex-col gap-3">
          {(value.references ?? []).map((ref, i) => (
            <div key={i} className="rounded-lg border border-border p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-ink-subtle">Reference {i + 1}</span>
                <button
                  onClick={() => removeReference(i)}
                  className="text-xs text-danger hover:underline"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="Name">
                  <Input value={ref.name} onChange={(e) => updateReference(i, { name: e.target.value })} />
                </Field>
                <Field label="Title / relationship">
                  <Input
                    value={ref.title ?? ''}
                    onChange={(e) => updateReference(i, { title: e.target.value })}
                  />
                </Field>
                <Field label="Contact">
                  <Input
                    value={ref.contact ?? ''}
                    onChange={(e) => updateReference(i, { contact: e.target.value })}
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

function Section({
  title,
  action,
  children,
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  )
}

function EmptyHint({ text }: { text: string }) {
  return <p className="text-sm text-ink-subtle mb-3">{text}</p>
}
