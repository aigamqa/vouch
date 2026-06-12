import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'

import Landing from '@/routes/Landing'
import SignUp from '@/routes/auth/SignUp'
import CheckEmail from '@/routes/auth/CheckEmail'
import AuthCallback from '@/routes/auth/AuthCallback'
import Welcome from '@/routes/onboarding/Welcome'
import ToneSelector from '@/routes/onboarding/ToneSelector'
import HardcoreConsent from '@/routes/onboarding/HardcoreConsent'
import Privacy from '@/routes/onboarding/Privacy'
import Dashboard from '@/routes/app/Dashboard'
import NewTask from '@/routes/app/NewTask'
import TaskDetail from '@/routes/app/TaskDetail'
import Approved from '@/routes/app/Approved'
import Rejected from '@/routes/app/Rejected'
import Settings from '@/routes/app/Settings'
import GuardianView from '@/routes/guardian/GuardianView'
import GuardianInvite from '@/routes/app/GuardianInvite'
import Waiting from '@/routes/app/Waiting'
import Upload from '@/routes/app/Upload'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth/signup" element={<SignUp />} />
          <Route path="/auth/check-email" element={<CheckEmail />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/onboarding/welcome" element={<Welcome />} />
          <Route path="/onboarding/tone" element={<ToneSelector />} />
          <Route path="/onboarding/hardcore-consent" element={<HardcoreConsent />} />
          <Route path="/onboarding/privacy" element={<Privacy />} />
          <Route path="/app" element={<Dashboard />} />
          <Route path="/app/tasks/new" element={<NewTask />} />
          <Route path="/app/tasks/new/guardian" element={<GuardianInvite />} />
          <Route path="/app/tasks/waiting" element={<Waiting />} />
          <Route path="/app/tasks/:id" element={<TaskDetail />} />
          <Route path="/app/tasks/:id/approved" element={<Approved />} />
          <Route path="/app/tasks/:id/rejected" element={<Rejected />} />
          <Route path="/app/tasks/:id/upload" element={<Upload />} />
          <Route path="/app/settings" element={<Settings />} />
          <Route path="/g/:invite_token" element={<GuardianView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
