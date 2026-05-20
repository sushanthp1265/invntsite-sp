import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const SHIFTS = ['Day', 'Evening', 'Night']

function formatDate(daysAgo) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().split('T')[0]
}

function displayDate(iso) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function DailyPatients() {
  const navigate = useNavigate()
  const { org, selectedUnit } = useApp()
  const isHospital = org.facilityType === 'hospital'

  const today = formatDate(0)

  const [rows, setRows] = useState(() =>
    SHIFTS.map((shift) => ({ date: today, shift, patientCount: '' }))
  )

  function updateRow(idx, key, value) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [key]: value } : r)))
  }

  function handleNext() {
    navigate('/daily-supply-tracker', { state: { patientsData: rows, unit: selectedUnit } })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100svh', background: 'white' }}>
      {/* Header */}
      <header style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6', background: 'white', position: 'sticky', top: 0, zIndex: 10 }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#111827' }}>Daily Patients</h1>
        {isHospital && (
          <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#6B7280' }}>Unit: {selectedUnit}</p>
        )}
      </header>

      <main style={{ flex: 1, padding: '0 0 120px' }}>
        {/* Table header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            padding: '10px 20px',
            background: '#F9FAFB',
            borderBottom: '1px solid #F3F4F6',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date</span>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Shift</span>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Patients</span>
        </div>

        {rows.map((row, idx) => (
          <div
            key={row.shift}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              alignItems: 'center',
              padding: '12px 20px',
              borderBottom: '1px solid #F3F4F6',
              gap: '8px',
              background: 'white',
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#1D9E75' }}>
                {displayDate(row.date)}
              </p>
              <p style={{ margin: 0, fontSize: '11px', color: '#1D9E75' }}>Today</p>
            </div>

            <div
              style={{
                border: '1.5px solid #E5E7EB',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#111827',
                background: '#F9FAFB',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {row.shift}
            </div>

            <input
              type="number"
              min="0"
              placeholder="0"
              value={row.patientCount}
              onChange={(e) => updateRow(idx, 'patientCount', e.target.value)}
              style={{
                border: '1.5px solid #E5E7EB',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '16px',
                fontWeight: '600',
                color: '#111827',
                background: 'white',
                outline: 'none',
                minHeight: '44px',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
          </div>
        ))}
      </main>

      {/* Next Button */}
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
        <button
          onClick={handleNext}
          style={{
            width: '100%',
            background: '#1D9E75',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: 'pointer',
            minHeight: '56px',
          }}
        >
          Next: Supply Level Check →
        </button>
      </div>
    </div>
  )
}
