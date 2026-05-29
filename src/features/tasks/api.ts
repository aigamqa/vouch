import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Task, Profile } from '@/types'

// ── Profile ──────────────────────────────────────────────────
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (error) throw error
      return data as Profile
    },
  })
}

// ── Tasks ─────────────────────────────────────────────────────
export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []
      const { data, error } = await supabase
        .from('tasks')
        .select('*, guardian:guardians(*), stake:stakes(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as Task[]
    },
  })
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, guardian:guardians(*), stake:stakes(*)')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as Task
    },
    enabled: !!id,
  })
}

// ── Stakes ────────────────────────────────────────────────────
export function useStakes() {
  return useQuery({
    queryKey: ['stakes'],
    staleTime: 3_600_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stakes')
        .select('*')
        .eq('active', true)
        .order('tone_min')
      if (error) throw error
      return data
    },
  })
}

// ── Create task ───────────────────────────────────────────────
export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      title: string
      deadline: string
      stake_id?: string | null
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: profile } = await supabase
        .from('profiles').select('tone_default').eq('id', user.id).single()

      // create guardian invite
      const { data: guardian, error: gErr } = await supabase
        .from('guardians')
        .insert({ user_id: user.id })
        .select()
        .single()
      if (gErr) throw gErr

      const { data: task, error: tErr } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          guardian_id: guardian.id,
          title: payload.title,
          deadline: payload.deadline,
          tone: profile?.tone_default ?? 'supportive',
          stake_id: payload.stake_id ?? null,
        })
        .select()
        .single()
      if (tErr) throw tErr

      return { task, invite_token: guardian.invite_token }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })
}

// ── Upload evidence ────────────────────────────────────────────
export function useSubmitEvidence() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ taskId, file, link }: {
      taskId: string; file?: File | null; link?: string
    }) => {
      let evidence_url = link ?? null

      if (file) {
        const ext = file.name.split('.').pop()
        const path = `${taskId}/${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage
          .from('evidence')
          .upload(path, file)
        if (upErr) throw upErr
        const { data: { publicUrl } } = supabase.storage
          .from('evidence').getPublicUrl(path)
        evidence_url = publicUrl
      }

      const { error } = await supabase
        .from('tasks')
        .update({
          evidence_url,
          evidence_uploaded_at: new Date().toISOString(),
          status: 'submitted',
        })
        .eq('id', taskId)
      if (error) throw error
    },
    onSuccess: (_, { taskId }) => qc.invalidateQueries({ queryKey: ['task', taskId] }),
  })
}
