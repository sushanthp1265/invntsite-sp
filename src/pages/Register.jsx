import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'

const AUTH_ERRORS = {
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/invalid-email':        'Please enter a valid email address.',
  'auth/weak-password':        'Password must be at least 6 characters.',
  'auth/too-many-requests':    'Too many attempts. Please try again later.',
}

const inputStyle = {
  border: '1.5px solid #E5E7EB',
  borderRadius: '10px',
  padding: '14px 16px',
  fontSize: '16px',
  width: '100%',
  boxSizing: 'border-box',
  outline: 'none',
  color: '#111827',
  background: 'white',
  minHeight: '56px',
}

export default function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (!auth) {
      navigate('/', { replace: true })
      return
    }

    setLoading(true)
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      // New user — AppRoutes will redirect to /onboarding automatically
      navigate('/', { replace: true })
    } catch (err) {
      setError(AUTH_ERRORS[err.code] ?? 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const canSubmit = email && password && confirm && !loading

  return (
    <div style={{ minHeight: '100svh', background: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 28px' }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '44px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" />
              <path d="M12 22V12" />
            </svg>
          </div>
          <span style={{ fontSize: '30px', fontWeight: '800', color: '#1D9E75', letterSpacing: '-1px' }}>
            INVNTSite
          </span>
        </div>
        <p style={{ margin: 0, fontSize: '15px', color: '#6B7280' }}>
          Create your account
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '7px' }}>
            Email
          </label>
          <input
            type="email"
            autoComplete="email"
            placeholder="you@hospital.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '7px' }}>
            Password
          </label>
          <input
            type="password"
            autoComplete="new-password"
            placeholder="Min. 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '7px' }}>
            Confirm password
          </label>
          <input
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 14px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#DC2626' }}>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            background: canSubmit ? '#1D9E75' : '#D1D5DB',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            minHeight: '56px',
            marginTop: '4px',
            transition: 'background 0.15s',
          }}
        >
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      {/* Sign in link */}
      <p style={{ textAlign: 'center', marginTop: '28px', fontSize: '15px', color: '#6B7280' }}>
        Already have an account?{' '}
        <Link
          to="/login"
          style={{ color: '#1D9E75', fontWeight: '700', textDecoration: 'none' }}
        >
          Sign In
        </Link>
      </p>
    </div>
  )
}
