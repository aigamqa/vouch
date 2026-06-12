import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { MobileShell } from '@/components/shared/MobileShell'
import { Button } from '@/components/shared/Button'
import { useTask } from '@/features/tasks/api'
import { supabase } from '@/lib/supabase'

const TONE_BG: Record<string, string> = {
  supportive: '#D4F0E0', playful: '#FFF2CC', hardcore: '#FFE4E1',
}
const STATUS_LABEL: Record<string, { text: string; color: string; bg: string }> = {
  pending:      { text: 'Waiting for Guardian', color: '#6B7C9F', bg: '#E8EEFA' },
  submitted:    { text: 'Awaiting verdict',     color: '#92400E', bg: '#FFF2CC' },
  approved:     { text: 'Approved ✓',           color: '#166534', bg: '#D4F0E0' },
  rejected:     { text: 'Rejected',             color: '#991B1B', bg: '#FFE4E1' },
  ghost_failed: { text: 'Ghost failed',         color: '#6B7C9F', bg: '#E8EEFA' },
}

export default function TaskDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data: task, isLoading, error } = useTask(id ?? '')

  // ── Realtime: watch for Guardian verdict ─────────────────────
  useEffect(() => {
    if (!id) return
    const channel = supabase
      .channel(`task-${id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tasks', filter: `id=eq.${id}` },
        (payload) => {
          const status = (payload.new as { status: string }).status
          qc.invalidateQueries({ queryKey: ['task', id] })
          qc.invalidateQueries({ queryKey: ['tasks'] })
          if (status === 'approved') navigate(`/app/tasks/${id}/approved`, { replace: true })
          if (status === 'rejected') navigate(`/app/tasks/${id}/rejected`, { replace: true })
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [id, navigate, qc])

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-[#6B7C9F] animate-pulse">Loading…</p>
    </div>
  )
  if (error || !task) return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-4xl mb-4">🔍</p>
        <p className="font-bold text-[#0F1B3C]">Task not found</p>
        <button onClick={() => navigate('/app')} className="text-sm text-[#FF5E5B] mt-3">← Dashboard</button>
      </div>
    </div>
  )

  const deadline = new Date(task.deadline).toLocaleString('en', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
  const isOverdue = new Date(task.deadline) < new Date()
  const tone = task.tone ?? 'supportive'
  const status = STATUS_LABEL[task.status] ?? STATUS_LABEL.pending
  const guardianName = task.guardian?.display_name ?? 'Guardian'
  const stakeName = task.stake?.name ?? null

  return (
    <MobileShell>
      <div className="flex flex-col flex-1">
        <div className="px-6 pt-14 pb-8 flex flex-col gap-4" style={{ background: TONE_BG[tone] }}>
          <button onClick={() => navigate('/app')} className="text-[#6B7C9F] text-sm flex items-center gap-1 w-fit">
            ← Dashboard
          </button>
          <h1 className="font-display text-2xl font-bold text-[#0F1B3C] leading-snug">{task.title}</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5">
              <div className="w-5 h-5 rounded-full bg-[#FF5E5B] flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">{guardianName[0]}</span>
              </div>
              <span className="text-xs font-semibold text-[#0F1B3C]">{guardianName}</span>
            </div>
            <span className="text-xs font-semibold" style={{ color: isOverdue ? '#991B1B' : '#6B7C9F' }}>
              {isOverdue ? '⚠️ Overdue' : `⏰ ${deadline}`}
            </span>
            {stakeName && (
              <span className="text-xs font-bold bg-white text-[#991B1B] rounded-full px-3 py-1">🔥 {stakeName}</span>
            )}
          </div>
        </div>

        <div className="px-6 pt-6 pb-10 flex flex-col gap-5 flex-1">
          <div className="rounded-2xl border border-[#E8EEFA] bg-white p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-[#6B7C9F] font-medium mb-1">Status</p>
              <p className="font-bold text-[#0F1B3C] capitalize">{task.status.replace('_', ' ')}</p>
            </div>
            <span className="text-xs font-bold rounded-full px-3 py-1"
              style={{ color: status.color, background: status.bg }}>
              {status.text}
            </span>
          </div>

          {task.status === 'submitted' && (
            <div className="rounded-2xl bg-[#FFF2CC] px-4 py-3 flex items-center gap-3">
              <span className="text-xl">⏳</span>
              <div>
                <p className="text-sm font-semibold text-[#92400E]">Waiting for {guardianName}'s verdict</p>
                <p className="text-xs text-[#92400E] opacity-70 mt-0.5">You'll be notified automatically</p>
              </div>
            </div>
          )}

          {task.status === 'submitted' && task.guardian_seen_at && (
            <div className="rounded-2xl bg-[#D4F0E0] px-4 py-3 flex items-center gap-3">
              <span className="text-xl">👀</span>
              <p className="text-sm font-semibold text-[#166534]">{guardianName} opened your evidence</p>
            </div>
          )}

          {task.evidence_url && (
            <div className="rounded-2xl border border-[#E8EEFA] overflow-hidden">
              {task.evidence_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img src={task.evidence_url} alt="Your evidence" className="w-full object-cover max-h-52" />
              ) : (
                <a href={task.evidence_url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 px-4 py-4 bg-[#F7F8FA] text-[#FF5E5B] font-semibold text-sm">
                  🔗 View evidence link
                </a>
              )}
            </div>
          )}

          {task.status === 'rejected' && task.guardian_note && (
            <div className="rounded-2xl bg-[#FFE4E1] px-4 py-4 flex flex-col gap-2">
              <p className="text-xs font-bold text-[#991B1B] uppercase tracking-wide">Guardian's note</p>
              <p className="text-sm text-[#0F1B3C]">"{task.guardian_note}"</p>
            </div>
          )}

          {task.status === 'approved' && (
            <div className="rounded-2xl bg-[#D4F0E0] px-4 py-4 flex items-center gap-3">
              <span className="text-3xl">🏆</span>
              <div>
                <p className="font-bold text-[#166534]">Task approved!</p>
                <p className="text-sm text-[#166534] opacity-80">{guardianName} confirmed you did it.</p>
              </div>
            </div>
          )}

          <div className="mt-auto flex flex-col gap-3">
            {(task.status === 'pending' || task.status === 'submitted') && (
              <Button onClick={() => navigate(`/app/tasks/${task.id}/upload`)}>
                {task.status === 'submitted' ? 'Update evidence 📸' : 'Upload evidence 📸'}
              </Button>
            )}
            {task.status === 'rejected' && (
              <Button onClick={() => navigate(`/app/tasks/${task.id}/upload`)}>
                Try again — upload new evidence
              </Button>
            )}
          </div>
        </div>
      </div>
    </MobileShell>
  )
}
