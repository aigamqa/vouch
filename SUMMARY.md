# Vouch — Project Summary

## Что было сделано

### 1. Wireframes (Pencil)
15 low-fidelity экранов в Pencil через MCP-агента:
- Onboarding: Landing, Sign Up, Check Email, Welcome, Tone Selector, Hardcore ToS, Privacy Explainer
- Core loop: Task Creation, Stake Selection, Guardian Invite, Waiting for Guardian
- Daily use: Task Dashboard, Upload Evidence
- Verdict: Approved (confetti), Rejected (retry)

### 2. Frontend (React PWA)
Полный стек по SAD-спецификации:

**Tech stack:**
- React 18 + Vite + TypeScript
- Tailwind CSS (design tokens: navy #0F1B3C, coral #FF5E5B, gold #FFD93D)
- React Router v6 (16 маршрутов)
- TanStack Query (server state)
- Zustand (client state)
- React Hook Form + Zod (валидация)
- Supabase JS client

**Экраны реализованы:**
- `/` — Landing page
- `/auth/signup` — Sign Up (magic link)
- `/auth/check-email` — Check Email (OTP code)
- `/auth/callback` — Auth callback
- `/onboarding/welcome` — Welcome
- `/onboarding/tone` — Tone Selector (Supportive / Playful / Hardcore)
- `/onboarding/hardcore-consent` — Hardcore ToS
- `/onboarding/privacy` — Privacy Explainer
- `/app` — Task Dashboard (real Supabase data)
- `/app/tasks/new` — Task Creation
- `/app/tasks/new/guardian` — Guardian Invite (Web Share API)
- `/app/tasks/waiting` — Waiting for Guardian
- `/app/tasks/:id` — Task Detail
- `/app/tasks/:id/upload` — Upload Evidence
- `/app/tasks/:id/approved` — Approved
- `/app/tasks/:id/rejected` — Rejected
- `/g/:invite_token` — Guardian View (anonymous, no account needed)

### 3. Backend (Supabase)
**Таблицы:**
- `profiles` — extends auth.users, tone_default, hardcore_consent
- `stakes` — библиотека из 8 стейков (seeded)
- `guardians` — invite_token, accepted_at, display_name
- `tasks` — title, deadline, tone, stake_id, status, evidence_url
- `verdicts` — approve/reject decisions

**Auth:**
- Magic link + OTP code (7-digit)
- Auto-create profile trigger on signup
- Row Level Security на всех таблицах

**API hooks (TanStack Query):**
- `useProfile`, `useTasks`, `useTask`, `useStakes`
- `useCreateTask`, `useSubmitEvidence`

### 4. Guardian Flow (end-to-end)
1. User создаёт задачу → генерируется `invite_token`
2. User шарит ссылку `/g/{token}` через Web Share API
3. Guardian открывает ссылку (без регистрации)
4. Guardian видит задачу из реальной БД
5. Guardian принимает роль → смотрит evidence
6. Guardian голосует Approve/Reject → статус обновляется в Supabase

### 5. Deploy
- **GitHub:** github.com/aigamqa/vouch
- **Production:** https://vouch-sepia.vercel.app
- **Supabase project:** fulmojnyouevlyrewwog.supabase.co

## Что осталось
- Realtime подписка (auto-update Dashboard когда Guardian голосует)
- Upload evidence в Supabase Storage
- PWA манифест + service worker (offline, install prompt)
- Hi-fi дизайн (планируется в Figma)
