import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ORG_ID } from '../firebase'

const navButtons = [
  {
    label: 'Supplies',
    sublabel: 'View & manage inventory',
    to: '/supplies',
    bg: '#FEF3C7',
    border: '#FCD34D',
    iconColor: '#D97706',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
      </svg>
    ),
  },
  {
    label: 'Daily Patients',
    sublabel: 'Log patient count by shift',
    to: '/daily-patients',
    bg: '#FEE2E2',
    border: '#FCA5A5',
    iconColor: '#DC2626',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: 'Supply Check',
    sublabel: 'Daily and weekly inventory checks',
    to: '/supply-check',
    bg: '#DBEAFE',
    border: '#93C5FD',
    iconColor: '#2563EB',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" />
      </svg>
    ),
  },
  {
    label: 'Analytics',
    sublabel: 'Usage trends & order forecasts',
    to: '/analytics',
    bg: '#D1FAE5',
    border: '#6EE7B7',
    iconColor: '#059669',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
    ),
  },
]

export default function Home() {
  const navigate = useNavigate()
  const { org, supplies, shiftLogs, selectedUnit, setSelectedUnit } = useApp()
  const isHospital = org.facilityType === 'hospital'

  const today = new Date().toISOString().split('T')[0]
  const deterministicId = `${ORG_ID}-${today}-${selectedUnit}`
  const todayLogCandidates = shiftLogs.filter(
    (log) => log.date === today && log.unit === selectedUnit
  )
  const todayLog =
    todayLogCandidates.find((log) => log.id === deterministicId) ??
    todayLogCandidates.sort((a, b) => (b.id > a.id ? 1 : -1))[0]
  const todayLevels = todayLog?.supplyLevels ?? {}

  const lowSupplyIds = new Set(
    supplies
      .filter((s) => s.currentQuantity <= s.reorderLevel || (s.id in todayLevels && todayLevels[s.id] <= 25))
      .map((s) => s.id)
  )
  const lowStockCount = lowSupplyIds.size

  console.log('[Home] todayLog found:', todayLog?.id ?? 'none', '| lowStockCount:', lowStockCount)

  const lastWeeklyCheckDate = localStorage.getItem('lastWeeklyCheckDate')
  const weeklyCheckOverdue = !lastWeeklyCheckDate || (
    Date.now() - new Date(lastWeeklyCheckDate).getTime() > 7 * 24 * 60 * 60 * 1000
  )
  const daysSinceWeeklyCheck = lastWeeklyCheckDate
    ? Math.floor((Date.now() - new Date(lastWeeklyCheckDate).getTime()) / (1000 * 60 * 60 * 24))
    : null

  const todayLogged = shiftLogs.some(
    (log) => log.date === today && (!isHospital || log.unit === selectedUnit)
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100svh', background: 'white' }}>
      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid #F3F4F6',
          background: 'white',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#1D9E75', letterSpacing: '-0.5px' }}>
            INVNTSite
          </h1>
          <p style={{ margin: 0, fontSize: '12px', color: '#6B7280', marginTop: '1px' }}>{org.name}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isHospital && (
            <>
              <label style={{ fontSize: '13px', color: '#6B7280', fontWeight: '500' }}>Unit</label>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                style={{
                  border: '1.5px solid #1D9E75',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1D9E75',
                  background: '#E8F7F2',
                  outline: 'none',
                  minWidth: '110px',
                  minHeight: '40px',
                }}
              >
                {org.units.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </>
          )}

          {/* Gear / Settings */}
          <button
            onClick={() => navigate('/settings')}
            aria-label="Settings"
            style={{
              background: 'none',
              border: '1.5px solid #E5E7EB',
              borderRadius: '8px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#6B7280',
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Alert Banner */}
      {lowStockCount > 0 && (
        <div
          style={{
            margin: '12px 16px 0',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '10px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span style={{ fontSize: '18px' }}>⚠️</span>
          <div>
            <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: '#DC2626' }}>
              {lowStockCount} supply{lowStockCount > 1 ? ' items' : ''} low on stock
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#EF4444', marginTop: '1px' }}>
              Tap Supplies to review
            </p>
          </div>
        </div>
      )}

      {/* Weekly check reminder banner */}
      {weeklyCheckOverdue && (
        <div
          style={{
            margin: '12px 16px 0',
            background: '#FFFBEB',
            border: '1px solid #FCD34D',
            borderRadius: '10px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span style={{ fontSize: '18px', flexShrink: 0 }}>📋</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: '#D97706' }}>
              Weekly supply check due
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#B45309', marginTop: '1px' }}>
              {daysSinceWeeklyCheck !== null
                ? `Last checked ${daysSinceWeeklyCheck} day${daysSinceWeeklyCheck !== 1 ? 's' : ''} ago`
                : 'No check recorded yet'}
            </p>
          </div>
          <button
            onClick={() => navigate('/supply-check')}
            style={{
              background: '#FCD34D',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: '700',
              color: '#92400E',
              cursor: 'pointer',
              flexShrink: 0,
              minHeight: '36px',
            }}
          >
            Start
          </button>
        </div>
      )}

      {/* Status row */}
      <div style={{ padding: '12px 16px 4px', display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1, background: '#F9FAFB', borderRadius: '10px', padding: '10px 12px', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Today's Log</p>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: todayLogged ? '#059669' : '#D97706', marginTop: '3px' }}>
            {todayLogged ? '✓ Complete' : 'Pending'}
          </p>
        </div>
        <div style={{ flex: 1, background: '#F9FAFB', borderRadius: '10px', padding: '10px 12px', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Low Stock</p>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: lowStockCount > 0 ? '#DC2626' : '#1D9E75', marginTop: '3px' }}>
            {lowStockCount > 0 ? `${lowStockCount} Low` : 'All OK'}
          </p>
        </div>
        <div style={{ flex: 1, background: '#F9FAFB', borderRadius: '10px', padding: '10px 12px', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Supplies</p>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1D9E75', marginTop: '3px' }}>{supplies.length}</p>
        </div>
      </div>

      {/* Nav Buttons */}
      <main style={{ flex: 1, padding: '8px 16px 100px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {navButtons.map((btn) => (
          <button
            key={btn.to}
            onClick={() => navigate(btn.to)}
            style={{
              background: btn.bg,
              border: `1.5px solid ${btn.border}`,
              borderRadius: '14px',
              padding: '20px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              cursor: 'pointer',
              minHeight: '80px',
              textAlign: 'left',
              width: '100%',
              transition: 'opacity 0.15s',
            }}
            onTouchStart={(e) => (e.currentTarget.style.opacity = '0.85')}
            onTouchEnd={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {btn.icon}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#111827' }}>{btn.label}</p>
              <p style={{ margin: 0, fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>{btn.sublabel}</p>
            </div>
            <svg
              style={{ marginLeft: 'auto', flexShrink: 0 }}
              width="20" height="20" viewBox="0 0 24 24"
              fill="none" stroke="#9CA3AF" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        ))}
      </main>
    </div>
  )
}
