import { useNavigate, useParams } from 'react-router-dom'
import { MobileShell } from '@/components/shared/MobileShell'
import { Button } from '@/components/shared/Button'

const MOCK_TASKS: Record<string, {
  id: string; title: string; guardian: string; deadline: string;
  status: string; tone: string; stake: string | null;
}> = {
  '1': { id: '1', title: 'Ship the auth module', guardian: 'Jess', deadline: '2025-05-31T21:00:00', status: 'pending', tone: 'supportive', stake: null },
  '2': { id: '2', title: 'Run 5km before Sunday', guardian: 'Anna', deadline: '2025-06-01T09:00:00', status: 'submitted', tone: 'playful', stake: 'Potato Avatar' },
  '3': { id: '3', title: 'Read 30 pages tonight', guardian: 'Kai', deadline: '2025-05-28T23:00:00', status: 'pending', tone: 'hardcore', stake: 'LinkedIn post' },
}

const TONE_BG: Record<string, string> = {
  supportive: '#D4F0E0', playful: '#FFF2CC', hardcore: '#FFE4E1',
}

export default function TaskDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const task = MOCK_TASKS[id ?? ''] ?? MOCK_TASKS['1']

  const deadline = new Date(task.deadline).toLocaleString('en', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
  const isOverdue = new Date(task.deadline) < new Date()

  return (
    <MobileShell>
      <div className="flex flex-col flex-1">
        <div className="px-6 pt-14 pb-8 flex flex-col gap-4" style={{ background: TONE_BG[task.tone] }}>
          <button onClick={() => navigate('/app')} className="text-[#6B7C9F] text-sm flex items-center gap-1 w-fit">
            ← Dashboard
          </button>
          <h1 className="font-display text-2xl font-bold text-[#0F1B3C] leading-snug">{task.title}</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5">
              <div className="w-5 h-5 rounded-full bg-[#FF5E5B] flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">{task.guardian[0]}</span>
              </div>
              <span className="text-xs font-semibold text-[#0F1B3C]">{task.guardian}</span>
            </div>
            <span className="text-xs font-semibold" style={{ color: isOverdue ? '#991B1B' : '#6B7C9F' }}>
              {isOverdue ? '⚠️ Overdue' : `⏰ ${deadline}`}
            </span>
            {task.stake && (
              <span className="text-xs font-bold bg-white text-[#991B1B] rounded-full px-3 py-1">🔥 {task.stake}</span>
            )}
          </div>
        </div>

        <div className="px-6 pt-6 pb-10 flex flex-col gap-5 flex-1">
          <div className="rounded-2xl border border-[#E8EEFA] bg-white p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-[#6B7C9F] font-medium mb-1">Status</p>
              <p className="font-bold text-[#0F1B3C] capitalize">{task.status.replace('_', ' ')}</p>
            </div>
            {task.status === 'submitted' && (
              <span className="text-xs font-bold bg-[#FFF2CC] text-[#92400E] rounded-full px-3 py-1">⏳ Awaiting verdict</span>
            )}
            {task.status === 'pending' && (
              <span className="text-xs font-bold bg-[#E8EEFA] text-[#6B7C9F] rounded-full px-3 py-1">Waiting for Guardian</span>
            )}
          </div>

          {task.status === 'submitted' && (
            <div className="rounded-2xl bg-[#D4F0E0] px-4 py-3 flex items-center gap-3">
              <span className="text-xl">👀</span>
              <p className="text-sm font-semibold text-[#166534]">{task.guardian} opened your evidence</p>
            </div>
          )}

          <div className="mt-auto flex flex-col gap-3">
            {(task.status === 'pending' || task.status === 'submitted') && (
              <Button onClick={() => navigate(`/app/tasks/${task.id}/upload`)}>
                {task.status === 'submitted' ? 'Update evidence' : 'Upload evidence 📸'}
              </Button>
            )}
            <div className="flex gap-2">
              <button onClick={() => navigate(`/app/tasks/${task.id}/approved`)} className="flex-1 h-11 rounded-full bg-[#D4F0E0] text-[#166634] text-sm font-bold">✓ Approved demo</button>
              <button onClick={() => navigate(`/app/tasks/${task.id}/rejected`)} className="flex-1 h-11 rounded-full bg-[#FFE4E1] text-[#991B1B] text-sm font-bold">✗ Rejected demo</button>
            </div>
            <p className="text-center text-[10px] text-[#B0BCCF]">Demo buttons — remove before production</p>
          </div>
        </div>
      </div>
    </MobileShell>
  )
}
