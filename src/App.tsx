import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { SignInPage } from './pages/SignInPage'
import { CreateAccountPage } from './pages/CreateAccountPage'
import { CompleteSetupPage } from './pages/CompleteSetupPage'
import { GateGetterDashboard } from './features/gategetter/ui/GateGetterDashboard'

export default function App() {
  return (
    <Routes>
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/create-account" element={<CreateAccountPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/complete-setup" element={<CompleteSetupPage />} />
        <Route path="/" element={<GateGetterDashboard />} />
      </Route>
    </Routes>
  )
}
