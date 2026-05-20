import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'

const AUTH_ERRORS = {
  'auth/user-not-found':      'No account found with this email.',
  'auth/wrong-password':      'Incorrect password. Please try again.',
  'auth/invalid-credential':  'Invalid email or password.',
  'auth/invalid-email':       'Please enter a valid email address.',
  'auth/too-many-requests':   'Too many attempts. Please try again later.',
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

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignIn(e) {
    e.preventDefault()
    if (!auth) {
      // Auth not configured — skip straight to app
      navigate('/', { replace: true })
      return
    }
    setError('')
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(AUTH_ERRORS[err.code] ?? 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

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
          Sign in to your account
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          disabled={loading || !email || !password}
          style={{
            background: loading || !email || !password ? '#D1D5DB' : '#1D9E75',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: loading || !email || !password ? 'not-allowed' : 'pointer',
            minHeight: '56px',
            marginTop: '4px',
            transition: 'background 0.15s',
          }}
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      {/* Register link */}
      <p style={{ textAlign: 'center', marginTop: '28px', fontSize: '15px', color: '#6B7280' }}>
        Don't have an account?{' '}
        <Link
          to="/register"
          style={{ color: '#1D9E75', fontWeight: '700', textDecoration: 'none' }}
        >
          Create Account
        </Link>
      </p>
    </div>
  )
}
