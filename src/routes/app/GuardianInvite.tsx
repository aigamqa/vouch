import { useNavigate } from 'react-router-dom'
import { MobileShell } from '@/components/shared/MobileShell'
import { Button } from '@/components/shared/Button'

export default function GuardianInvite() {
  const navigate = useNavigate()
  const raw = sessionStorage.getItem('vouch_task')
  const task = raw ? JSON.parse(raw) : { title: 'Your task', deadline: '' }
  const invite_token = sessionStorage.getItem('vouch_invite_token')

  const deadline = task.deadline
    ? new Date(task.deadline).toLocaleString('en', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—'

  const shareUrl = invite_token
    ? `https://vouch-sepia.vercel.app/g/${invite_token}`
    : null

  function share() {
    if (!shareUrl) {
      alert('Invite token not found — please recreate the task.')
      return
    }
    const text = `Hey! Can you be my Guardian for this task?\n\n"${task.title}"\nDeadline: ${deadline}\n\n${shareUrl}`
    if (navigator.share) {
      navigator.share({ title: 'Vouch — be my Guardian', text }).catch(() => {})
    } else {
      navigator.clipboard.writeText(text)
      alert('Link copied to clipboard!')
    }
    navigate('/app/tasks/waiting')
  }

  function copyLink() {
    if (!shareUrl) return
    navigator.clipboard.writeText(shareUrl)
    alert('Link copied!')
  }

  return (
    <MobileShell>
      <div className="px-6 pt-14 pb-10 flex flex-col flex-1">
        <button onClick={() => navigate(-1)} className="text-[#6B7C9F] text-sm mb-8 flex items-center gap-1 w-fit">
          ← Back
        </button>

        <h1 className="font-display text-[2rem] leading-tight font-bold text-[#0F1B3C] mb-2">
          Pick the friend<br />who'll keep you honest.
        </h1>
        <p className="text-[#6B7C9F] text-sm mb-8">
          They get a link. Zero install required.
        </p>

        {/* Share card preview */}
        <div className="rounded-2xl border border-[#E8EEFA] bg-white p-5 flex flex-col gap-3 mb-4">
          <p className="text-[10px] font-bold text-[#B0BCCF] uppercase tracking-widest">
            Share card preview
          </p>
          <div className="h-px bg-[#E8EEFA]" />
          <p className="font-bold text-[#0F1B3C] text-lg leading-snug">{task.title}</p>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#6B7C9F]">⏰ {deadline}</span>
            <span className="text-sm text-[#6B7C9F]">
              👤 {sessionStorage.getItem('vouch_name') ?? 'You'}
            </span>
          </div>
          {task.stake_id && (
            <span className="text-xs font-semibold bg-[#FFE4E1] text-[#991B1B] rounded-full px-3 py-1 w-fit">
              Stake active 🔥
            </span>
          )}
        </div>

        {/* Copy link row */}
        {shareUrl && (
          <button
            onClick={copyLink}
            className="w-full rounded-2xl border border-[#E8EEFA] bg-[#F7F8FA] px-4 py-3 flex items-center justify-between mb-6 active:bg-[#E8EEFA] transition-colors"
          >
            <span className="text-xs text-[#6B7C9F] truncate max-w-[260px]">{shareUrl}</span>
            <span className="text-xs font-bold text-[#FF5E5B] ml-2">Copy</span>
          </button>
        )}

        <div className="mt-auto">
          <Button onClick={share}>
            ↑ Share with a friend
          </Button>
          <p className="text-center text-xs text-[#6B7C9F] mt-3">
            Opens your phone's share sheet (Telegram, WhatsApp…)
          </p>
        </div>
      </div>
    </MobileShell>
  )
}
