import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { MobileShell } from '@/components/shared/MobileShell'
import { Button } from '@/components/shared/Button'

type Step = 'accept' | 'review' | 'verdict' | 'done'

const SOFT_REJECTIONS = [
  "Looks like it's not quite done yet — clearer screenshot?",
  "I can see the effort but the task isn't complete yet.",
  "Almost! Show me the final result and I'll approve.",
  "The deadline passed but I didn't see evidence — try again?",
]

export default function GuardianView() {
  const { invite_token } = useParams()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('accept')
  const [verdict, setVerdict] = useState<'approve' | 'reject' | null>(null)
  const [selectedNote, setSelectedNote] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const qc = useQueryClient()

  // Load task via invite_token
  const { data, isLoading, error } = useQuery({
    queryKey: ['guardian-task', invite_token],
    queryFn: async () => {
      const { data: guardian, error: gErr } = await supabase
        .from('guardians')
        .select('*, tasks(*)')
        .eq('invite_token', invite_token)
        .single()
      if (gErr) throw gErr
      const task = Array.isArray(guardian.tasks) ? guardian.tasks[0] : guardian.tasks
      return { guardian, task }
    },
    enabled: !!invite_token,
  })

  const acceptMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('guardians')
        .update({ accepted_at: new Date().toISOString(), display_name: 'Guardian' })
        .eq('invite_token', invite_token)
      if (error) throw error
    },
    onSuccess: () => setStep('review'),
  })

  const verdictMutation = useMutation({
    mutationFn: async ({ decision, note }: { decision: 'approve' | 'reject'; note?: string }) => {
      if (!data) return
      const { error: vErr } = await supabase
        .from('verdicts')
        .insert({
          task_id: data.task.id,
          guardian_id: data.guardian.id,
          decision,
          note: note ?? null,
        })
      if (vErr) throw vErr
      const { error: tErr } = await supabase
        .from('tasks')
        .update({
          status: decision === 'approve' ? 'approved' : 'rejected',
          verdict_at: new Date().toISOString(),
          guardian_note: note ?? null,
        })
        .eq('id', data.task.id)
      if (tErr) throw tErr
    },
    onSuccess: () => setStep('done'),
  })

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-[#6B7C9F] animate-pulse">Loading…</p>
    </div>
  )

  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-4xl mb-4">🔗</p>
        <p className="font-bold text-[#0F1B3C]">Link not found</p>
        <p className="text-sm text-[#6B7C9F] mt-2">This invite link is invalid or expired.</p>
      </div>
    </div>
  )

  const { task } = data
  const deadline = new Date(task.deadline).toLocaleString('en', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  // ── Accept ────────────────────────────────────────────────────
  if (step === 'accept') return (
    <MobileShell>
      <div className="px-6 pt-14 pb-10 flex flex-col flex-1">
        <p className="font-display text-xl font-bold text-[#0F1B3C] mb-10">Vouch</p>
        <div className="flex-1 flex flex-col justify-center gap-6">
          <div className="rounded-2xl bg-[#D4F0E0] p-5 flex flex-col gap-3">
            <p className="text-xs font-bold text-[#166534] uppercase tracking-wide">The task</p>
            <p className="font-bold text-[#0F1B3C] text-xl leading-snug">{task.title}</p>
            <span className="text-sm text-[#6B7C9F]">⏰ {deadline}</span>
          </div>
          <div className="rounded-2xl border border-[#E8EEFA] bg-white p-4 flex flex-col gap-3">
            <p className="text-xs font-bold text-[#6B7C9F] uppercase tracking-wide">What you're signing up for</p>
            {['✓ Review evidence they upload', '✓ Approve if done, reject if not', '✓ No account needed — one tap'].map(i => (
              <p key={i} className="text-sm text-[#0F1B3C]">{i}</p>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3 pt-6">
          <Button onClick={() => acceptMutation.mutate()} disabled={acceptMutation.isPending}>
            {acceptMutation.isPending ? 'Accepting…' : "I'll be their Guardian 🤝"}
          </Button>
          <button onClick={() => navigate('/')} className="text-center text-sm text-[#B0BCCF]">Decline</button>
        </div>
      </div>
    </MobileShell>
  )

  // ── Review ────────────────────────────────────────────────────
  if (step === 'review') return (
    <MobileShell>
      <div className="px-6 pt-14 pb-10 flex flex-col flex-1">
        <button onClick={() => setStep('accept')} className="text-[#6B7C9F] text-sm mb-6 flex items-center gap-1 w-fit">← Back</button>
        <h1 className="font-display text-[1.8rem] font-bold text-[#0F1B3C] mb-6">Did they do it?</h1>
        <div className="rounded-2xl bg-[#E8EEFA] px-4 py-3 mb-5 flex items-center justify-between">
          <p className="font-semibold text-[#0F1B3C] text-sm">{task.title}</p>
          <span className="text-xs text-[#6B7C9F]">⏰ {deadline}</span>
        </div>
        {task.evidence_url ? (
          task.evidence_url.startsWith('http') && !task.evidence_url.match(/\.(jpg|jpeg|png|gif|webp|mp4|mov)$/i)
            ? <a href={task.evidence_url} target="_blank" rel="noreferrer"
                className="w-full rounded-2xl border border-[#E8EEFA] bg-[#F7F8FA] h-40 flex items-center justify-center gap-2 text-[#FF5E5B] font-semibold text-sm mb-6">
                🔗 Open link evidence
              </a>
            : <img src={task.evidence_url} alt="Evidence"
                className="w-full rounded-2xl object-cover h-52 mb-6" />
        ) : (
          <div className="w-full rounded-2xl border-2 border-dashed border-[#E8EEFA] h-48 flex flex-col items-center justify-center gap-3 mb-6">
            <span className="text-3xl">⏳</span>
            <p className="text-sm text-[#6B7C9F] font-semibold">No evidence uploaded yet</p>
            <p className="text-xs text-[#B0BCCF] text-center px-4">Ask them to upload, then tap Refresh</p>
            <button
              onClick={() => qc.invalidateQueries({ queryKey: ['guardian-task', invite_token] })}
              className="mt-1 px-5 py-2 rounded-full bg-[#E8EEFA] text-[#6B7C9F] text-sm font-bold active:scale-95 transition-transform"
            >
              ↻ Refresh
            </button>
          </div>
        )}
        <div className="flex flex-col gap-3 mt-auto">
          <button onClick={() => { setVerdict('approve'); setStep('verdict') }}
            className="w-full h-14 rounded-full bg-[#D4F0E0] text-[#166534] font-bold text-base">
            ✓ Looks done — Approve
          </button>
          <button onClick={() => { setVerdict('reject'); setStep('verdict') }}
            className="w-full h-14 rounded-full bg-[#FFE4E1] text-[#991B1B] font-bold text-base">
            ✗ Not quite — Reject
          </button>
        </div>
      </div>
    </MobileShell>
  )

  // ── Verdict ───────────────────────────────────────────────────
  if (step === 'verdict') {
    const isApprove = verdict === 'approve'
    return (
      <MobileShell>
        <div className="px-6 pt-14 pb-10 flex flex-col flex-1">
          <button onClick={() => setStep('review')} className="text-[#6B7C9F] text-sm mb-8 flex items-center gap-1 w-fit">← Change mind</button>
          <div className="w-full rounded-2xl flex items-center justify-center py-10 text-6xl mb-6"
            style={{ background: isApprove ? '#D4F0E0' : '#FFE4E1' }}>
            {isApprove ? '🏆' : '😬'}
          </div>
          <h1 className="font-display text-[1.8rem] font-bold text-[#0F1B3C] mb-2">
            {isApprove ? 'Approve the task?' : 'Reject the task?'}
          </h1>
          <p className="text-[#6B7C9F] text-sm mb-6">
            {isApprove ? 'They will get a notification and the task is marked done.' : 'Pick a soft note to send.'}
          </p>
          {!isApprove && (
            <div className="flex flex-col gap-2 mb-6">
              {SOFT_REJECTIONS.map(note => (
                <button key={note} onClick={() => setSelectedNote(note)}
                  className="w-full rounded-2xl px-4 py-3 text-left text-sm transition-all"
                  style={{
                    background: selectedNote === note ? '#FFE4E1' : '#F7F8FA',
                    outline: selectedNote === note ? '2px solid #FF5E5B' : '2px solid transparent',
                    color: '#0F1B3C',
                  }}>
                  "{note}"
                </button>
              ))}
            </div>
          )}
          <div className="mt-auto">
            <Button
              disabled={(!isApprove && !selectedNote) || verdictMutation.isPending}
              onClick={() => verdictMutation.mutate({ decision: verdict!, note: selectedNote ?? undefined })}
              style={{ background: isApprove ? '#22C55E' : '#FF5E5B' } as React.CSSProperties}
            >
              {verdictMutation.isPending ? 'Sending…' : isApprove ? 'Confirm Approve ✓' : 'Send rejection'}
            </Button>
          </div>
        </div>
      </MobileShell>
    )
  }

  // ── Done ──────────────────────────────────────────────────────
  return (
    <MobileShell>
      <div className="px-6 pt-20 pb-10 flex flex-col flex-1 items-center text-center">
        <div className="w-28 h-28 rounded-full flex items-center justify-center text-6xl mb-6"
          style={{ background: verdict === 'approve' ? '#D4F0E0' : '#FFE4E1' }}>
          {verdict === 'approve' ? '🎉' : '💬'}
        </div>
        <h1 className="font-display text-[2rem] font-bold text-[#0F1B3C] mb-3">
          {verdict === 'approve' ? 'They will be thrilled!' : 'Feedback sent.'}
        </h1>
        <p className="text-[#6B7C9F] text-base mb-10 max-w-xs">
          {verdict === 'approve'
            ? "You just held someone accountable. That's rare."
            : "They got your note. Hopefully they'll push through."}
        </p>
        <div className="w-full rounded-2xl border border-[#E8EEFA] bg-white p-5 flex flex-col gap-3 mb-8">
          <p className="font-bold text-[#0F1B3C]">Want someone to hold YOU accountable?</p>
          <p className="text-sm text-[#6B7C9F]">Create a free account in 30 seconds.</p>
          <button onClick={() => navigate('/auth/signup')}
            className="w-full h-12 rounded-full bg-[#FF5E5B] text-white font-bold text-sm">
            Try Vouch for free →
          </button>
        </div>
      </div>
    </MobileShell>
  )
}
