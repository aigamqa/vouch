import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { MobileShell } from '@/components/shared/MobileShell'
import { Button } from '@/components/shared/Button'
import { useProfile } from '@/features/tasks/api'
import { supabase } from '@/lib/supabase'

const TONES = [
  { id: 'supportive', emoji: '🤝', label: 'Supportive', desc: 'Gentle nudges. Your friend believes in you.' },
  { id: 'playful',    emoji: '😄', label: 'Playful',    desc: 'Light stakes, fun consequences.' },
  { id: 'hardcore',   emoji: '🔥', label: 'Hardcore',   desc: 'No mercy. Stakes are real.' },
] as const

export default function Settings() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data: profile, isLoading } = useProfile()

  const [selectedTone, setSelectedTone] = useState<string | null>(null)
  const [showHardcoreModal, setShowHardcoreModal] = useState(false)
  const [hardcoreChecked, setHardcoreChecked] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const activeTone = selectedTone ?? profile?.tone_default ?? 'supportive'

  // ── Update tone ──────────────────────────────────────────────
  const updateTone = useMutation({
    mutationFn: async (tone: string) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase
        .from('profiles')
        .update({
          tone_default: tone,
          hardcore_consent_at: tone === 'hardcore' ? new Date().toISOString() : null,
        })
        .eq('id', user.id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  })

  function handleToneSelect(tone: string) {
    if (tone === 'hardcore' && activeTone !== 'hardcore') {
      setSelectedTone(tone)
      setShowHardcoreModal(true)
    } else {
      setSelectedTone(tone)
      updateTone.mutate(tone)
    }
  }

  function confirmHardcore() {
    if (!hardcoreChecked) return
    updateTone.mutate('hardcore')
    setShowHardcoreModal(false)
  }

  // ── Logout ───────────────────────────────────────────────────
  async function logout() {
    await supabase.auth.signOut()
    sessionStorage.clear()
    navigate('/', { replace: true })
  }

  // ── Delete account ───────────────────────────────────────────
  const deleteAccount = useMutation({
    mutationFn: async () => {
      // Delete profile row — cascade deletes all user data
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)
      if (error) throw error
      await supabase.auth.signOut()
    },
    onSuccess: () => {
      sessionStorage.clear()
      navigate('/', { replace: true })
    },
    onError: (e: any) => alert(e.message),
  })

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-[#6B7C9F] animate-pulse">Loading…</p>
    </div>
  )

  return (
    <MobileShell>
      <div className="px-6 pt-14 pb-16 flex flex-col flex-1">
        <button onClick={() => navigate('/app')} className="text-[#6B7C9F] text-sm mb-8 flex items-center gap-1 w-fit">
          ← Dashboard
        </button>
        <h1 className="font-display text-[2rem] font-bold text-[#0F1B3C] mb-8">Settings</h1>

        {/* ── Tone section ── */}
        <section className="flex flex-col gap-3 mb-8">
          <h2 className="text-xs font-bold text-[#6B7C9F] uppercase tracking-wide">Default tone</h2>
          {TONES.map(t => {
            const isActive = activeTone === t.id
            return (
              <button
                key={t.id}
                onClick={() => handleToneSelect(t.id)}
                className="w-full rounded-2xl p-4 text-left flex items-center gap-4 transition-all"
                style={{
                  background: isActive ? '#FFE4E1' : '#F7F8FA',
                  outline: isActive ? '2px solid #FF5E5B' : '2px solid transparent',
                }}
              >
                <span className="text-2xl">{t.emoji}</span>
                <div className="flex-1">
                  <p className="font-bold text-[#0F1B3C] text-sm">{t.label}</p>
                  <p className="text-xs text-[#6B7C9F] mt-0.5">{t.desc}</p>
                </div>
                {isActive && (
                  <span className="text-xs font-bold text-[#FF5E5B] bg-white rounded-full px-2 py-0.5 shrink-0">Active</span>
                )}
              </button>
            )
          })}
          {updateTone.isPending && (
            <p className="text-xs text-[#B0BCCF] text-center">Saving…</p>
          )}
          {updateTone.isSuccess && (
            <p className="text-xs text-[#166534] text-center">Tone updated ✓</p>
          )}
        </section>

        {/* ── Account section ── */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold text-[#6B7C9F] uppercase tracking-wide">Account</h2>

          <div className="rounded-2xl border border-[#E8EEFA] bg-white px-4 py-4 flex flex-col gap-1">
            <p className="text-xs text-[#B0BCCF] font-medium">Email</p>
            <p className="text-sm font-semibold text-[#0F1B3C]">{profile?.email ?? '—'}</p>
          </div>

          <button
            onClick={logout}
            className="w-full h-14 rounded-2xl border border-[#E8EEFA] bg-white font-bold text-[#0F1B3C] text-sm active:bg-[#F7F8FA] transition-colors"
          >
            Log out
          </button>

          {!deleteConfirm ? (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="w-full h-12 rounded-2xl font-semibold text-[#991B1B] text-sm"
            >
              Delete my account
            </button>
          ) : (
            <div className="rounded-2xl bg-[#FFE4E1] p-4 flex flex-col gap-3">
              <p className="text-sm font-bold text-[#991B1B]">This deletes all your tasks and data. Cannot be undone.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="flex-1 h-11 rounded-full bg-white text-[#6B7C9F] text-sm font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteAccount.mutate()}
                  disabled={deleteAccount.isPending}
                  className="flex-1 h-11 rounded-full bg-[#991B1B] text-white text-sm font-bold"
                >
                  {deleteAccount.isPending ? 'Deleting…' : 'Yes, delete'}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ── Hardcore consent modal ── */}
      {showHardcoreModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full max-w-[430px] mx-auto rounded-t-3xl px-6 pt-8 pb-10 flex flex-col gap-5">
            <div className="w-12 h-1.5 bg-[#E8EEFA] rounded-full mx-auto mb-2" />
            <h2 className="font-display text-[1.6rem] font-bold text-[#0F1B3C]">Hardcore mode</h2>
            <p className="text-[#6B7C9F] text-sm leading-relaxed">
              Stakes are real consequences. Your Guardian will enforce them. No excuses. Are you sure?
            </p>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hardcoreChecked}
                onChange={e => setHardcoreChecked(e.target.checked)}
                className="mt-0.5 accent-[#FF5E5B] w-4 h-4"
              />
              <span className="text-sm text-[#0F1B3C]">I understand this is real accountability with real consequences.</span>
            </label>
            <Button
              disabled={!hardcoreChecked || updateTone.isPending}
              onClick={confirmHardcore}
            >
              {updateTone.isPending ? 'Saving…' : 'Switch to Hardcore 🔥'}
            </Button>
            <button
              onClick={() => { setShowHardcoreModal(false); setSelectedTone(null) }}
              className="text-center text-sm text-[#B0BCCF]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </MobileShell>
  )
}
