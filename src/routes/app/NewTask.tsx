import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { MobileShell } from '@/components/shared/MobileShell'
import { Button } from '@/components/shared/Button'
import { useStakes, useCreateTask } from '@/features/tasks/api'

const schema = z.object({
  title: z.string().min(3, 'Describe the task'),
  deadline: z.string().min(1, 'Set a deadline'),
})
type FormData = z.infer<typeof schema>

export default function NewTask() {
  const navigate = useNavigate()
  const [stakeOpen, setStakeOpen] = useState(false)
  const [selectedStake, setSelectedStake] = useState<string | null>(null)

  const { data: stakes = [] } = useStakes()
  const createTask = useCreateTask()

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const title = watch('title')
  const deadline = watch('deadline')
  const isValid = title?.length >= 3 && deadline

  async function onSubmit(data: FormData) {
    try {
      const result = await createTask.mutateAsync({
        title: data.title,
        deadline: new Date(data.deadline).toISOString(),
        stake_id: selectedStake,
      })
      sessionStorage.setItem('vouch_invite_token', result.invite_token)
      sessionStorage.setItem('vouch_task', JSON.stringify({ title: data.title, deadline: data.deadline, stake_id: selectedStake }))
      navigate('/app/tasks/new/guardian')
    } catch (e: any) {
      alert(e.message)
    }
  }

  const selectedStakeData = stakes.find(s => s.id === selectedStake)

  return (
    <MobileShell>
      <div className="px-6 pt-14 pb-10 flex flex-col flex-1">
        <button onClick={() => navigate(-1)} className="text-[#6B7C9F] text-sm mb-8 flex items-center gap-1 w-fit">
          ← Back
        </button>
        <h1 className="font-display text-[2rem] leading-tight font-bold text-[#0F1B3C] mb-8">
          What's the task?
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 flex-1">
          <div className="flex flex-col gap-1.5">
            <textarea
              {...register('title')}
              placeholder="Ship the auth module..."
              rows={3}
              className="w-full rounded-2xl border border-[#E8EEFA] px-4 py-4 text-[#0F1B3C] text-base placeholder:text-[#B0BCCF] focus:outline-none focus:border-[#FF5E5B] transition-colors resize-none"
            />
            {errors.title && <p className="text-xs text-[#FF5E5B]">{errors.title.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#6B7C9F] uppercase tracking-wide">Deadline</label>
            <input
              {...register('deadline')}
              type="datetime-local"
              className="w-full h-14 rounded-2xl border border-[#E8EEFA] px-4 text-[#0F1B3C] text-base focus:outline-none focus:border-[#FF5E5B] transition-colors"
            />
            {errors.deadline && <p className="text-xs text-[#FF5E5B]">{errors.deadline.message}</p>}
          </div>

          <button
            type="button"
            onClick={() => setStakeOpen(v => !v)}
            className="w-full h-14 rounded-2xl border border-[#E8EEFA] px-4 flex items-center justify-between text-left"
          >
            <span className="text-base" style={{ color: selectedStakeData ? '#0F1B3C' : '#B0BCCF' }}>
              {selectedStakeData ? `${selectedStakeData.icon} ${selectedStakeData.name}` : '+ Add a stake  (optional)'}
            </span>
            <span className="text-[#B0BCCF] text-lg">{stakeOpen ? '∨' : '›'}</span>
          </button>
          <p className="text-xs text-[#B0BCCF] -mt-3">Most users skip stakes — they're optional.</p>

          {stakeOpen && stakes.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {stakes.map(stake => (
                <button
                  key={stake.id}
                  type="button"
                  onClick={() => { setSelectedStake(stake.id === selectedStake ? null : stake.id); setStakeOpen(false) }}
                  className="rounded-2xl p-3 text-left flex flex-col gap-1.5 transition-all"
                  style={{
                    background: selectedStake === stake.id ? '#FFE4E1' : '#F7F8FA',
                    outline: selectedStake === stake.id ? '2px solid #FF5E5B' : '2px solid transparent',
                  }}
                >
                  <span className="text-2xl">{stake.icon}</span>
                  <p className="text-xs font-bold text-[#0F1B3C] leading-snug">{stake.name}</p>
                  <p className="text-[11px] text-[#6B7C9F] leading-snug">{stake.description}</p>
                </button>
              ))}
            </div>
          )}

          <div className="mt-auto pt-4">
            <Button type="submit" disabled={!isValid || createTask.isPending}>
              {createTask.isPending ? 'Creating…' : 'Next: Pick your Guardian →'}
            </Button>
          </div>
        </form>
      </div>
    </MobileShell>
  )
}
