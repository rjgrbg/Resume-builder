'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { uploadResume } from '@/lib/resume/actions'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/card'

export function UploadResumeForm() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function submitFile(file: File) {
    setError(null)

    const formData = new FormData()
    formData.set('file', file)

    setPending(true)
    const result = await uploadResume(formData)
    setPending(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    router.push(`/resumes/${result.data.resumeId}`)
  }

  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      setFileName(file.name)
      submitFile(file)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <label
        htmlFor="resume-file"
        onDragOver={(e) => {
          e.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-colors ${
          dragActive
            ? 'border-brand bg-success-bg'
            : 'border-border-strong hover:border-ink-subtle hover:bg-surface-raised'
        }`}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-ink-muted">
          ↑
        </div>
        <span className="text-sm font-medium">
          {pending
            ? 'Uploading…'
            : fileName
              ? fileName
              : 'Drag & drop your resume, or click to browse'}
        </span>
        <span className="text-xs text-ink-subtle">PDF or DOCX, up to 10 MB</span>
        <input
          ref={inputRef}
          id="resume-file"
          name="file"
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          disabled={pending}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              setFileName(file.name)
              submitFile(file)
            }
          }}
        />
      </label>

      {error && <Alert>{error}</Alert>}

      {!pending && !fileName && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="self-start"
          onClick={() => inputRef.current?.click()}
        >
          Choose file
        </Button>
      )}
    </div>
  )
}
