import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { useApp } from '../context/AppContext'

const FACILITY_LABEL = { hospital: 'Hospital', clinic: 'Clinic' }

function Row({ label, value }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 0',
        borderBottom: '1px solid #F3F4F6',
      }}
    >
      <span style={{ fontSize: '15px', color: '#6B7280' }}>{label}</span>
      <span style={{ fontSize: '15px', fontWeight: '600', color: '#111827', textAlign: 'right', maxWidth: '55%' }}>
        {value}
      </span>
    </div>
  )
}

export default function Settings() {
  const navigate = useNavigate()
  const { org, user } = useApp()

  function handleReset() {
    if (user?.uid) localStorage.removeItem(`onboardingComplete_${user.uid}`)
    navigate('/onboarding', { replace: true })
  }

  async function handleLogout() {
    if (user?.uid) localStorage.removeItem(`onboardingComplete_${user.uid}`)
    if (auth) await signOut(auth)
    navigate('/login', { replace: true })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100svh', background: 'white' }}>
      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 20px',
          borderBottom: '1px solid #F3F4F6',
          background: 'white',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#111827',
            minWidth: '36px',
            minHeight: '36px',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827' }}>Settings</h1>
      </header>

      <main style={{ flex: 1, padding: '0 20px 40px' }}>

        {/* Facility section */}
        <div style={{ marginTop: '28px', marginBottom: '32px' }}>
          <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Your Facility
          </p>

          <Row label="Name" value={org.name || '—'} />
          <Row
            label="Type"
            value={
              <span
                style={{
                  background: '#E8F7F2',
                  color: '#1D9E75',
                  border: '1px solid #A7F3D0',
                  borderRadius: '6px',
                  padding: '3px 10px',
                  fontSize: '13px',
                  fontWeight: '700',
                }}
              >
                {FACILITY_LABEL[org.facilityType] ?? '—'}
              </span>
            }
          />
          {org.facilityType === 'clinic' && org.specialty && (
            <Row label="Specialty" value={org.specialty} />
          )}
          {org.facilityType === 'hospital' && org.units?.length > 0 && (
            <Row label="Units" value={org.units.join(', ')} />
          )}
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: '#F3F4F6', marginBottom: '32px' }} />

        {/* Account section */}
        <div>
          <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Account
          </p>

          {user?.email && (
            <p style={{ margin: '12px 0 16px', fontSize: '14px', color: '#6B7280' }}>
              Signed in as <strong style={{ color: '#111827' }}>{user.email}</strong>
            </p>
          )}

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              background: 'white',
              border: '1.5px solid #E5E7EB',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '15px',
              fontWeight: '700',
              color: '#374151',
              cursor: 'pointer',
              minHeight: '56px',
              marginBottom: '12px',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#F9FAFB')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
          >
            Sign Out
          </button>

          <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#6B7280', lineHeight: '1.5' }}>
            Resetting will clear all local settings and return you to the onboarding screen. Firestore data is not deleted.
          </p>
          <button
            onClick={handleReset}
            style={{
              width: '100%',
              background: 'white',
              border: '1.5px solid #FECACA',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '15px',
              fontWeight: '700',
              color: '#DC2626',
              cursor: 'pointer',
              minHeight: '56px',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#FEF2F2')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
          >
            Reset &amp; Start Over
          </button>
        </div>
      </main>
    </div>
  )
}
