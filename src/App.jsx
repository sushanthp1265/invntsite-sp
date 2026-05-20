import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Supplies from './pages/Supplies'
import DailyPatients from './pages/DailyPatients'
import DailySupplyTracker from './pages/DailySupplyTracker'
import SupplyCheck from './pages/SupplyCheck'
import WeeklySupplyCheck from './pages/WeeklySupplyCheck'
import Analytics from './pages/Analytics'
import Onboarding from './pages/Onboarding'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Register from './pages/Register'

const NO_NAV_ROUTES = ['/onboarding', '/settings', '/login', '/register']

function AppRoutes() {
  const location = useLocation()
  const { user, authLoading } = useApp()

  if (authLoading) {
    return (
      <div style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #E5E7EB', borderTopColor: '#1D9E75', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  // Unauthenticated: only allow /login and /register
  if (!user) {
    if (location.pathname === '/register') return <Routes><Route path="/register" element={<Register />} /></Routes>
    return <Routes><Route path="*" element={<Login />} /></Routes>
  }

  // Authenticated: check onboarding
  const onboarded = localStorage.getItem(`onboardingComplete_${user.uid}`) === 'true'

  if (!onboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }
  if (onboarded && location.pathname === '/onboarding') {
    return <Navigate to="/" replace />
  }

  const hideNav = NO_NAV_ROUTES.includes(location.pathname)

  return (
    <>
      <Routes>
        <Route path="/"               element={<Home />} />
        <Route path="/supplies"       element={<Supplies />} />
        <Route path="/daily-patients" element={<DailyPatients />} />
        <Route path="/daily-supply-tracker" element={<DailySupplyTracker />} />
        <Route path="/supply-check"        element={<SupplyCheck />} />
        <Route path="/weekly-check"        element={<WeeklySupplyCheck />} />
        <Route path="/analytics"      element={<Analytics />} />
        <Route path="/settings"       element={<Settings />} />
        <Route path="/onboarding"     element={<Onboarding />} />
      </Routes>
      {!hideNav && <BottomNav />}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  )
}
