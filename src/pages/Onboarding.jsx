import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const CLINIC_SPECIALTIES = [
  'Family Medicine',
  'Pediatrics',
  'OB/GYN',
  'Orthopedics',
  'Dermatology',
  'Urgent Care',
  'Psychiatry',
  'Physical Therapy',
]

const inputBase = {
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

// ── Logo strip shown on every step ───────────────────────────────────────────
function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div
        style={{
          width: '44px', height: '44px', borderRadius: '12px', background: '#1D9E75',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
          <path d="m3.3 7 8.7 5 8.7-5" />
          <path d="M12 22V12" />
        </svg>
      </div>
      <span style={{ fontSize: '26px', fontWeight: '800', color: '#1D9E75', letterSpacing: '-0.5px' }}>
        INVNTSite
      </span>
    </div>
  )
}

// ── Unit tag with × remove button ────────────────────────────────────────────
function UnitTag({ label, onRemove }) {
  return (
    <div
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        background: '#E8F7F2', border: '1.5px solid #1D9E75',
        color: '#065F46', borderRadius: '10px',
        padding: '10px 12px 10px 14px', fontSize: '14px', fontWeight: '600',
        minHeight: '44px',
      }}
    >
      {label}
      <button
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#6B7280', padding: '0', lineHeight: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '20px', height: '20px', borderRadius: '4px',
          fontSize: '18px',
        }}
      >
        ×
      </button>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Onboarding() {
  const navigate = useNavigate()
  const { setOrg, seedCatalogSupplies, user } = useApp()

  const [step, setStep] = useState(1)
  const [facilityType, setFacilityType] = useState(null)
  const [name, setName] = useState('')
  const [specialty, setSpecialty] = useState(CLINIC_SPECIALTIES[0])
  const [units, setUnits] = useState(['ED', 'ICU', 'Med-Surg'])
  const [unitInput, setUnitInput] = useState('')
  const [saving, setSaving] = useState(false)

  function removeUnit(u) {
    setUnits((prev) => prev.filter((x) => x !== u))
  }

  function addUnit() {
    const trimmed = unitInput.trim()
    if (trimmed && !units.includes(trimmed)) {
      setUnits((prev) => [...prev, trimmed])
    }
    setUnitInput('')
  }

  async function handleFinish() {
    setSaving(true)
    try {
      const orgId = await setOrg({
        id: 'org-001',
        name: name.trim() || 'My Facility',
        facilityType,
        specialty: facilityType === 'clinic' ? specialty : null,
        units: facilityType === 'hospital' ? units : [],
      })
      await seedCatalogSupplies(facilityType, facilityType === 'clinic' ? specialty : null, orgId)
    } catch (err) {
      console.error('Setup failed, continuing with local data:', err)
    }
    localStorage.setItem(`onboardingComplete_${user.uid}`, 'true')
    navigate('/', { replace: true })
  }

  const canFinish = name.trim().length > 0 && !saving

  return (
    <div style={{ minHeight: '100svh', background: 'white', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

      {/* ── Header ── */}
      <div style={{ padding: '52px 28px 0' }}>
        <Logo />

        {step === 1 && (
          <p style={{ margin: '12px 0 36px', fontSize: '15px', color: '#6B7280', lineHeight: '1.6' }}>
            Smart inventory tracking for clinical teams.
          </p>
        )}

        {step === 2 && (
          <>
            {/* Progress bar — step 1 done, step 2 active */}
            <div style={{ display: 'flex', gap: '6px', margin: '20px 0 28px' }}>
              {[0, 1].map((i) => (
                <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i === 0 ? '#1D9E75' : '#A7F3D0' }} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, padding: '0 28px 52px' }}>

        {/* ─── Step 1: facility type ─────────────────────────────────────── */}
        {step === 1 && (
          <>
            <h2 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: '700', color: '#111827' }}>
              What kind of facility are you?
            </h2>
            <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#6B7280' }}>
              This determines how your inventory and shifts are tracked.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                {
                  type: 'hospital',
                  label: 'Hospital',
                  sub: 'Multiple units · Shift-based logging · High volume',
                  icon: (
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                      <line x1="12" y1="5" x2="12" y2="9" />
                      <line x1="10" y1="7" x2="14" y2="7" />
                    </svg>
                  ),
                },
                {
                  type: 'clinic',
                  label: 'Clinic',
                  sub: 'Single location · End-of-day logging · Lower volume',
                  icon: (
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  ),
                },
              ].map(({ type, label, sub, icon }) => (
                <button
                  key={type}
                  onClick={() => { setFacilityType(type); setStep(2) }}
                  style={{
                    border: '1.5px solid #E5E7EB', background: 'white',
                    borderRadius: '16px', padding: '20px',
                    display: 'flex', alignItems: 'center', gap: '16px',
                    cursor: 'pointer', minHeight: '88px',
                    textAlign: 'left', width: '100%',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1D9E75'; e.currentTarget.style.background = '#F0FDF9' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = 'white' }}
                  onTouchStart={(e) => { e.currentTarget.style.borderColor = '#1D9E75'; e.currentTarget.style.background = '#F0FDF9' }}
                  onTouchEnd={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = 'white' }}
                >
                  <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#E8F7F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827' }}>{label}</p>
                    <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#6B7280', lineHeight: '1.4' }}>{sub}</p>
                  </div>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              ))}
            </div>
          </>
        )}

        {/* ─── Step 2: details (both paths) ─────────────────────────────── */}
        {step === 2 && (
          <>
            <h2 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: '700', color: '#111827' }}>
              {facilityType === 'hospital' ? 'Set up your hospital' : 'Set up your clinic'}
            </h2>
            <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#6B7280' }}>
              Enter your facility details to get started.
            </p>

            {/* Facility name */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '7px' }}>
                Facility name <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder={facilityType === 'hospital' ? "e.g. St. Mary's Hospital" : 'e.g. Westside Family Clinic'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                style={inputBase}
              />
            </div>

            {/* ── Hospital: units section ── */}
            {facilityType === 'hospital' && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '7px' }}>
                  Units
                </label>
                <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#6B7280' }}>
                  Add the units in your hospital. Tap × to remove.
                </p>

                {/* Current unit tags */}
                {units.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                    {units.map((u) => (
                      <UnitTag key={u} label={u} onRemove={() => removeUnit(u)} />
                    ))}
                  </div>
                )}

                {units.length === 0 && (
                  <p style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '12px', fontStyle: 'italic' }}>
                    No units added yet.
                  </p>
                )}

                {/* Add unit row */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Add a unit (e.g. Radiology)"
                    value={unitInput}
                    onChange={(e) => setUnitInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addUnit() } }}
                    style={{ ...inputBase, flex: 1 }}
                  />
                  <button
                    onClick={addUnit}
                    disabled={!unitInput.trim()}
                    aria-label="Add unit"
                    style={{
                      width: '56px', flexShrink: 0, minHeight: '56px',
                      background: unitInput.trim() ? '#1D9E75' : '#E5E7EB',
                      color: unitInput.trim() ? 'white' : '#9CA3AF',
                      border: 'none', borderRadius: '10px',
                      fontSize: '26px', fontWeight: '300',
                      cursor: unitInput.trim() ? 'pointer' : 'default',
                      transition: 'background 0.15s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* ── Clinic: specialty dropdown ── */}
            {facilityType === 'clinic' && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '7px' }}>
                  Specialty
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    style={{ ...inputBase, paddingRight: '44px', appearance: 'none' }}
                  >
                    {CLINIC_SPECIALTIES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <svg
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                    width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            )}

            {/* Back + Get Started */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '32px' }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  flex: 1, border: '1.5px solid #E5E7EB', background: 'white',
                  borderRadius: '12px', padding: '15px', fontSize: '15px',
                  fontWeight: '600', cursor: 'pointer', color: '#374151', minHeight: '56px',
                }}
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                disabled={!canFinish}
                style={{
                  flex: 2,
                  background: canFinish ? '#1D9E75' : '#D1D5DB',
                  color: 'white', border: 'none', borderRadius: '12px',
                  padding: '15px', fontSize: '15px', fontWeight: '700',
                  cursor: canFinish ? 'pointer' : 'not-allowed', minHeight: '56px',
                  transition: 'background 0.15s',
                }}
              >
                {saving ? 'Saving…' : 'Get Started'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
