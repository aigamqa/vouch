export type Tone = 'supportive' | 'playful' | 'hardcore'
export type TaskStatus = 'pending' | 'submitted' | 'approved' | 'rejected' | 'ghost_failed'

export interface Profile {
  id: string
  email: string
  first_name: string
  tone_default: Tone
  hardcore_consent_at: string | null
  privacy_accepted_at: string
  pwa_installed_at: string | null
  created_at: string
}

export interface Guardian {
  id: string
  user_id: string
  invite_token: string
  display_name: string | null
  accepted_at: string | null
  declined_at: string | null
  swapped_at: string | null
  created_at: string
}

export interface Stake {
  id: string
  name: string
  description: string
  icon: string
  tone_min: 'playful' | 'hardcore'
  category: string
  active: boolean
}

export interface Task {
  id: string
  user_id: string
  guardian_id: string
  title: string
  deadline: string
  tone: Tone
  stake_id: string | null
  status: TaskStatus
  evidence_url: string | null
  evidence_uploaded_at: string | null
  guardian_seen_at: string | null
  verdict_at: string | null
  guardian_note: string | null
  created_at: string
  guardian?: Guardian
  stake?: Stake | null
}
