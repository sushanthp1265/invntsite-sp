import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, setDoc } from 'firebase/firestore'
import { useApp } from '../context/AppContext'
import { db, ORG_ID } from '../firebase'

const CATEGORIES = ['IV', 'PPE', 'Medication', 'Equipment']
const PROGRESS_KEY = 'weeklyCheckProgress'

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '{}') } catch { return {} }
}

function CompletionScreen({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2000)
    return () => clearTimeout(t)
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
        Weekly Check Complete
      </h2>
      <p style={{ margin: '0 0 8px', fontSize: '16px', color: '#6B7280' }}>
        Inventory counts have been updated.
      </p>
      <p style={{ margin: '0 0 32px', fontSize: '13px', color: '#9CA3AF' }}>
        Returning to home…
      </p>
    </div>
  )
}

function DiscrepancyModal({ items, onConfirm, onCancel }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
      }}
    >
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', maxWidth: '420px', width: '100%' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '700', color: '#111827' }}>
          Large Discrepancy Detected
        </h3>
        <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#6B7280' }}>
          These supplies differ from current estimates by 20% or more:
        </p>
        <ul style={{ margin: '0 0 16px', padding: '0 0 0 20px' }}>
          {items.map((s) => (
            <li key={s.id} style={{ fontSize: '14px', color: '#111827', marginBottom: '4px' }}>
              {s.name}
            </li>
          ))}
        </ul>
        <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#D97706', fontWeight: '500' }}>
          Confirm these counts are correct before saving.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, background: '#F3F4F6', color: '#374151', border: 'none',
              borderRadius: '10px', padding: '14px', fontSize: '15px', fontWeight: '600',
              cursor: 'pointer', minHeight: '52px',
            }}
          >
            Go Back
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, background: '#1D9E75', color: 'white', border: 'none',
              borderRadius: '10px', padding: '14px', fontSize: '15px', fontWeight: '600',
              cursor: 'pointer', minHeight: '52px',
            }}
          >
            Save Anyway
          </button>
        </div>
      </div>
    </div>
  )
}

export default function WeeklySupplyCheck() {
  const navigate = useNavigate()
  const { supplies, loading } = useApp()
  const [counts, setCounts] = useState({})
  const [saving, setSaving] = useState(false)
  const [progressSaved, setProgressSaved] = useState(false)
  const [done, setDone] = useState(false)
  const [discrepancies, setDiscrepancies] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [saveError, setSaveError] = useState(null)

  const today = new Date().toISOString().split('T')[0]
  const displayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  useEffect(() => {
    if (loading || supplies.length === 0) return
    const saved = loadProgress()
    setCounts(
      Object.fromEntries(
        supplies.map((s) => [s.id, saved[s.id] !== undefined ? saved[s.id] : (s.currentQuantity ?? 0)])
      )
    )
  }, [loading, supplies])

  function setCount(id, raw) {
    const value = raw === '' ? '' : Math.max(0, Number(raw))
    setCounts((prev) => ({ ...prev, [id]: value }))
  }

  function handleSaveProgress() {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(counts))
    setProgressSaved(true)
    setTimeout(() => setProgressSaved(false), 2000)
  }

  async function doSave() {
    setSaving(true)
    setSaveError(null)
    try {
      if (db) {
        await Promise.all(
          supplies.map((s) =>
            setDoc(
              doc(db, 'supplies', s.id),
              { currentQuantity: Number(counts[s.id] ?? s.currentQuantity ?? 0) },
              { merge: true }
            )
          )
        )
        await setDoc(doc(db, 'weeklyChecks', `${ORG_ID}-${today}`), {
          date: today,
          orgId: ORG_ID,
          counts: Object.fromEntries(
            Object.entries(counts).map(([k, v]) => [k, Number(v) || 0])
          ),
        })
      }
      localStorage.removeItem(PROGRESS_KEY)
      localStorage.setItem('lastWeeklyCheckDate', today)
      setDone(true)
    } catch (err) {
      console.error('[WeeklySupplyCheck] save failed:', err)
      setSaveError('Save failed — check your connection and try again.')
      setSaving(false)
    }
  }

  function handleComplete() {
    const big = supplies.filter((s) => {
      const entered = Number(counts[s.id] ?? s.currentQuantity ?? 0)
      const current = s.currentQuantity ?? 0
      if (current === 0) return entered > 0
      return Math.abs(entered - current) / current >= 0.2
    })
    if (big.length > 0) {
      setDiscrepancies(big)
      setShowModal(true)
      return
    }
    doSave()
  }

  if (done) return <CompletionScreen onDone={() => navigate('/')} />

  const grouped = CATEGORIES.map((cat) => ({
    category: cat,
    items: supplies.filter((s) => s.category === cat),
  })).filter((g) => g.items.length > 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100svh', background: 'white' }}>
      {showModal && (
        <DiscrepancyModal
          items={discrepancies}
          onConfirm={() => { setShowModal(false); doSave() }}
          onCancel={() => setShowModal(false)}
        />
      )}

      {/* Header */}
      <header
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid #F3F4F6',
          background: 'white',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2px' }}>
          <button
            onClick={() => navigate(-1)}
            aria-label="Back"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 0, display: 'flex', alignItems: 'center' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#111827' }}>Weekly Supply Check</h1>
        </div>
        <p style={{ margin: '2px 0 0 34px', fontSize: '12px', color: '#6B7280' }}>{displayDate}</p>
      </header>

      {saveError && (
        <div
          style={{
            margin: '12px 16px 0', background: '#FEF2F2', border: '1px solid #FECACA',
            borderRadius: '10px', padding: '10px 14px', display: 'flex',
            alignItems: 'center', justifyContent: 'space-between', gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#DC2626', display: 'inline-block', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: '#DC2626', fontWeight: '600' }}>{saveError}</span>
          </div>
          <button
            onClick={() => setSaveError(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', fontSize: '18px', lineHeight: 1, padding: '0 2px', flexShrink: 0 }}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* Column headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 120px',
          padding: '10px 20px',
          background: '#F9FAFB',
          borderBottom: '1px solid #F3F4F6',
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Supply Name</span>
        <span style={{ fontSize: '11px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }}>Count</span>
      </div>

      <main style={{ flex: 1, padding: '0 0 160px' }}>
        {grouped.map(({ category, items }) => (
          <div key={category}>
            <div
              style={{
                padding: '8px 20px',
                background: '#F3F4F6',
                borderBottom: '1px solid #E5E7EB',
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {category}
              </span>
            </div>

            {items.map((s) => {
              const entered = counts[s.id]
              const isLow = entered !== '' && entered !== undefined && Number(entered) < s.reorderLevel
              return (
                <div
                  key={s.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 120px',
                    alignItems: 'center',
                    padding: '12px 20px',
                    borderBottom: '1px solid #F3F4F6',
                    background: isLow ? '#FFF7F7' : 'white',
                  }}
                >
                  <div style={{ paddingRight: '8px' }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#111827' }}>{s.name}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#9CA3AF' }}>
                      Par: {s.parLevel}
                    </p>
                  </div>

                  <input
                    type="number"
                    min="0"
                    value={entered ?? ''}
                    onChange={(e) => setCount(s.id, e.target.value)}
                    style={{
                      border: isLow ? '1.5px solid #FCA5A5' : '1.5px solid #E5E7EB',
                      borderRadius: '8px',
                      padding: '10px 8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: isLow ? '#DC2626' : '#111827',
                      background: isLow ? '#FEF2F2' : 'white',
                      outline: 'none',
                      minHeight: '44px',
                      width: '100%',
                      textAlign: 'center',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              )
            })}
          </div>
        ))}
      </main>

      {/* Action buttons */}
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
          display: 'flex',
          gap: '10px',
        }}
      >
        <button
          onClick={handleSaveProgress}
          style={{
            flex: 1,
            background: progressSaved ? '#D1FAE5' : '#F3F4F6',
            color: progressSaved ? '#059669' : '#374151',
            border: 'none',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            minHeight: '56px',
            transition: 'background 0.2s, color 0.2s',
          }}
        >
          {progressSaved ? '✓ Saved' : 'Save Progress'}
        </button>
        <button
          onClick={handleComplete}
          disabled={saving}
          style={{
            flex: 2,
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
          {saving ? 'Saving…' : 'Complete Check'}
        </button>
      </div>
    </div>
  )
}
