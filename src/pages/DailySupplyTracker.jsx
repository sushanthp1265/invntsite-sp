import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ORG_ID } from '../firebase'

const VOLUME_OPTIONS = [
  { label: 'Full',   value: 100 },
  { label: '3/4',    value: 75  },
  { label: '1/2',    value: 50  },
  { label: '1/4',    value: 25  },
  { label: 'Empty',  value: 0   },
]

function CompletionScreen({ onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2000)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'white', zIndex: 200,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '80px', height: '80px', borderRadius: '50%', background: '#D1FAE5',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px',
        }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h2 style={{ margin: '0 0 8px', fontSize: '26px', fontWeight: '800', color: '#1D9E75' }}>
        Invntsite Complete
      </h2>
      <p style={{ margin: '0 0 8px', fontSize: '16px', color: '#6B7280' }}>
        Today's supply check has been saved.
      </p>
      <p style={{ margin: '0 0 32px', fontSize: '13px', color: '#9CA3AF' }}>
        Returning to home…
      </p>
    </div>
  )
}

export default function DailySupplyTracker() {
  const navigate = useNavigate()
  const location = useLocation()
  const { org, supplies, shiftLogs, loading, saveShiftLog, selectedUnit } = useApp()
  const patientsData = location.state?.patientsData ?? []

  // Start empty — the effect below populates from today's saved log (or all-100 if none exists).
  const [levels, setLevels] = useState({})
  // Ref (not state) so that a dropdown change never triggers the seeding effect.
  // Using useState for dirty caused the effect to fire on every change, creating
  // a race window where a concurrent Firestore snapshot could overwrite the nurse's choices.
  const dirtyRef = useRef(false)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  // Re-runs when data loads or updates. Skips if the nurse has already started editing.
  useEffect(() => {
    if (loading || dirtyRef.current) return
    const today = new Date().toISOString().split('T')[0]
    const deterministicId = `${ORG_ID}-${today}-${selectedUnit}`
    const candidates = shiftLogs.filter(
      (log) => log.date === today && log.unit === selectedUnit
    )
    const todayLog =
      candidates.find((log) => log.id === deterministicId) ??
      candidates.sort((a, b) => (b.id > a.id ? 1 : -1))[0]
    const savedLevels = todayLog?.supplyLevels ?? {}
    setLevels(Object.fromEntries(supplies.map((s) => [s.id, savedLevels[s.id] ?? 100])))
  }, [loading, shiftLogs, supplies, selectedUnit])

  function setLevel(id, value) {
    console.log('[SupplyTracker] onChange → supplyId:', id, '| value:', value)
    dirtyRef.current = true
    setLevels((prev) => ({ ...prev, [id]: value }))
  }

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    try {
      const today = new Date().toISOString().split('T')[0]
      const todayEntry = patientsData?.[0] ?? {}
      console.log('[Save] doc id will be:', `${ORG_ID}-${today}-${selectedUnit}`)
      console.log('[Save] org.id is:', org.id, '| ORG_ID is:', ORG_ID)
      const log = {
        id: `${ORG_ID}-${today}-${selectedUnit}`,
        date: today,
        shift: todayEntry.shift ?? 'Day',
        unit: selectedUnit,
        patientCount: Number(todayEntry.patientCount ?? 0),
        supplyLevels: { ...levels },
        orgId: ORG_ID,
      }
      await saveShiftLog(log)
      dirtyRef.current = false
      setSaved(true)
    } catch (err) {
      console.error('[DailySupplyTracker] save failed:', err)
      setSaveError('Save failed — please check your connection and try again.')
      setSaving(false)
    }
  }

  if (saved) {
    return <CompletionScreen onDone={() => navigate('/')} />
  }

  const alertCount = supplies.filter((s) => levels[s.id] <= 25).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100svh', background: 'white' }}>
      {/* Header */}
      <header style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6', background: 'white', position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => navigate('/supply-check')}
          aria-label="Back"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 0, display: 'flex', alignItems: 'center' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#111827' }}>Daily Supply Check</h1>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6B7280' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </header>

      {saveError && (
        <div style={{ margin: '12px 16px 0', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#DC2626', display: 'inline-block', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: '#DC2626', fontWeight: '600' }}>{saveError}</span>
          </div>
          <button
            onClick={() => setSaveError(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', fontSize: '16px', lineHeight: 1, padding: '0 2px', flexShrink: 0 }}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {alertCount > 0 && (
        <div style={{ margin: '12px 16px 0', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', display: 'inline-block', flexShrink: 0 }} />
          <span style={{ fontSize: '13px', color: '#DC2626', fontWeight: '600' }}>
            {alertCount} supply{alertCount > 1 ? ' items' : ''} at 1/4 or Empty
          </span>
        </div>
      )}

      {/* Column headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 160px',
          padding: '10px 20px',
          background: '#F9FAFB',
          borderBottom: '1px solid #F3F4F6',
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Supply Name</span>
        <span style={{ fontSize: '11px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }}>Volume</span>
      </div>

      <main style={{ flex: 1, padding: '0 0 140px' }}>
        {supplies.map((s) => {
          const level = levels[s.id] ?? 100
          const isAlert = level <= 25
          return (
            <div
              key={s.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 160px',
                alignItems: 'center',
                padding: '14px 20px',
                borderBottom: '1px solid #F3F4F6',
                background: isAlert ? '#FFF7F7' : 'white',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '8px' }}>
                {isAlert && (
                  <span
                    style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', display: 'inline-block', flexShrink: 0 }}
                    title="Low stock alert"
                  />
                )}
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827', lineHeight: '1.3' }}>
                  {s.name}
                </span>
              </div>

              <select
                value={level}
                onChange={(e) => setLevel(s.id, Number(e.target.value))}
                style={{
                  border: isAlert ? '1.5px solid #FCA5A5' : '1.5px solid #E5E7EB',
                  borderRadius: '8px',
                  padding: '10px 8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: isAlert ? '#DC2626' : '#111827',
                  background: isAlert ? '#FEF2F2' : 'white',
                  outline: 'none',
                  minHeight: '44px',
                  width: '100%',
                }}
              >
                {VOLUME_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )
        })}
      </main>

      {/* Save Button */}
      <div
        style={{
          position: 'fixed',
          bottom: '72px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '768px',
          padding: '12px 20px',
          background: 'white',
          borderTop: '1px solid #F3F4F6',
          boxSizing: 'border-box',
        }}
      >
        {alertCount > 0 && (
          <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#EF4444', textAlign: 'center', fontWeight: '600' }}>
            ⚠ {alertCount} item{alertCount > 1 ? 's' : ''} need restocking
          </p>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%',
            background: saving ? '#9CA3AF' : '#1D9E75',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: saving ? 'not-allowed' : 'pointer',
            minHeight: '56px',
          }}
        >
          {saving ? 'Saving…' : "Save Today's Supply Check"}
        </button>
      </div>
    </div>
  )
}
