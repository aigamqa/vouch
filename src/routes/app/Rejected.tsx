import { useNavigate, useParams } from 'react-router-dom'
import { MobileShell } from '@/components/shared/MobileShell'
import { Button } from '@/components/shared/Button'

export default function Rejected() {
  const { id } = useParams()
  const navigate = useNavigate()

  return (
    <MobileShell>
      <div className="px-6 pt-14 pb-10 flex flex-col flex-1">
        {/* Hero */}
        <div className="w-full rounded-2xl bg-[#FFE4E1] flex items-center justify-center py-10 mb-6 text-7xl">
          😞
        </div>

        <h1 className="font-display text-[2.8rem] font-bold text-[#0F1B3C] mb-2">Not yet.</h1>
        <p className="text-[#6B7C9F] text-base mb-8">Jess wants a bit more from you.</p>

        {/* Guardian note */}
        <div className="rounded-2xl border border-[#E8EEFA] bg-white p-5 flex flex-col gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FFF2CC] flex items-center justify-center font-bold text-[#0F1B3C]">
              J
            </div>
            <p className="font-bold text-[#0F1B3C] text-sm">Jess says:</p>
          </div>
          <p className="text-base text-[#0F1B3C] leading-relaxed">
            "Looks like the auth module isn't deployed yet — clearer screenshot?"
          </p>
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <Button onClick={() => navigate(`/app/tasks/${id}/upload`)}>
            Try again →
          </Button>
          <button
            onClick={() => navigate('/app')}
            className="w-full h-14 rounded-full border border-[#E8EEFA] text-[#B0BCCF] font-semibold text-base"
          >
            Give up this one
          </button>
        </div>
      </div>
    </MobileShell>
  )
}
