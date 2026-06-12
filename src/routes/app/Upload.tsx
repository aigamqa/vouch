import { useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MobileShell } from '@/components/shared/MobileShell'
import { Button } from '@/components/shared/Button'
import { useSubmitEvidence, useTask } from '@/features/tasks/api'

export default function Upload() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: task } = useTask(id ?? '')

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [link, setLink] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const submit = useSubmitEvidence()

  const hasEvidence = !!file || link.length > 5

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setLink('')
  }

  async function handleSubmit() {
    if (!id) return
    try {
      await submit.mutateAsync({ taskId: id, file, link: link || undefined })
      // Go back to task detail — status is now "submitted", waiting for Guardian
      navigate(`/app/tasks/${id}`, { replace: true })
    } catch (e: any) {
      alert(`Upload failed: ${e.message}`)
    }
  }

  const guardianName = task?.guardian?.display_name ?? 'your Guardian'

  return (
    <MobileShell>
      <div className="px-6 pt-14 pb-10 flex flex-col flex-1">
        <button onClick={() => navigate(-1)} className="text-[#6B7C9F] text-sm mb-6 flex items-center gap-1 w-fit">
          ← Back
        </button>

        {task && (
          <div className="bg-[#D4F0E0] rounded-full px-4 py-2 w-fit mb-6">
            <p className="text-xs font-bold text-[#166534] truncate max-w-[280px]">{task.title}</p>
          </div>
        )}

        <h1 className="font-display text-[2rem] leading-tight font-bold text-[#0F1B3C] mb-8">
          Show {guardianName}<br />you did it. 📸
        </h1>

        {/* Camera zone */}
        {!preview ? (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full h-52 rounded-2xl border-2 border-dashed border-[#E8EEFA] flex flex-col items-center justify-center gap-3 mb-5 active:bg-[#F7F8FA] transition-colors"
          >
            <div className="w-16 h-16 rounded-full bg-[#D4F0E0] flex items-center justify-center text-3xl">📷</div>
            <p className="font-semibold text-[#6B7C9F] text-sm">Tap to take a photo or video</p>
            <p className="text-xs text-[#B0BCCF]">Camera opens directly</p>
          </button>
        ) : (
          <div className="relative w-full h-52 rounded-2xl overflow-hidden mb-5">
            <img src={preview} alt="Evidence" className="w-full h-full object-cover" />
            <button
              onClick={() => { setPreview(null); setFile(null) }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white text-sm flex items-center justify-center"
            >✕</button>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          capture="environment"
          className="hidden"
          onChange={handleFile}
        />

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-[#E8EEFA]" />
          <span className="text-xs text-[#6B7C9F] font-medium">or</span>
          <div className="flex-1 h-px bg-[#E8EEFA]" />
        </div>

        <div className="flex items-center gap-3 h-14 rounded-2xl border border-[#E8EEFA] px-4 mb-8">
          <span className="text-lg">🔗</span>
          <input
            type="url"
            value={link}
            onChange={e => { setLink(e.target.value); setPreview(null); setFile(null) }}
            placeholder="Paste a link as proof"
            className="flex-1 text-sm text-[#0F1B3C] placeholder:text-[#B0BCCF] focus:outline-none"
          />
        </div>

        <div className="mt-auto">
          <Button disabled={!hasEvidence || submit.isPending} onClick={handleSubmit}>
            {submit.isPending ? 'Submitting…' : `Submit to ${guardianName} →`}
          </Button>
          {!hasEvidence && (
            <p className="text-center text-xs text-[#B0BCCF] mt-2">Select a file or paste a link</p>
          )}
        </div>
      </div>
    </MobileShell>
  )
}
