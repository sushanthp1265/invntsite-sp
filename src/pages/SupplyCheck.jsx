import { useNavigate } from 'react-router-dom'

export default function SupplyCheck() {
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100svh', background: 'white' }}>
      <header
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid #F3F4F6',
          background: 'white',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <button
          onClick={() => navigate('/')}
          aria-label="Back"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 0, display: 'flex', alignItems: 'center' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#111827' }}>Supply Check</h1>
      </header>

      <main style={{ flex: 1, padding: '24px 16px 100px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <button
          onClick={() => navigate('/daily-supply-tracker')}
          style={{
            background: '#DBEAFE',
            border: '1.5px solid #93C5FD',
            borderRadius: '14px',
            padding: '24px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer',
            minHeight: '100px',
            textAlign: 'left',
            width: '100%',
          }}
          onTouchStart={(e) => (e.currentTarget.style.opacity = '0.85')}
          onTouchEnd={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="M9 12h6M9 16h4" />
            </svg>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827' }}>Daily Check</p>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6B7280' }}>Log today's supply levels</p>
          </div>
          <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>

        <button
          onClick={() => navigate('/weekly-check')}
          style={{
            background: '#EDE9FE',
            border: '1.5px solid #C4B5FD',
            borderRadius: '14px',
            padding: '24px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer',
            minHeight: '100px',
            textAlign: 'left',
            width: '100%',
          }}
          onTouchStart={(e) => (e.currentTarget.style.opacity = '0.85')}
          onTouchEnd={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <path d="m9 16 2 2 4-4" />
            </svg>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827' }}>Weekly Check</p>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6B7280' }}>Full physical inventory count</p>
          </div>
          <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </main>
    </div>
  )
}
