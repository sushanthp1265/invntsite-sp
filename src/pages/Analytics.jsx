import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useApp } from '../context/AppContext'

function statusConfig(days) {
  if (days < 3)  return { label: 'Order Now',  bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' }
  if (days < 7)  return { label: 'Order Soon', bg: '#FFFBEB', text: '#D97706', border: '#FCD34D' }
  return           { label: 'OK',          bg: '#F0FDF4', text: '#059669', border: '#BBF7D0' }
}

function urgencyRank(days) {
  if (days < 3) return 0
  if (days < 7) return 1
  return 2
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: 'white', border: '1px solid #E5E7EB', borderRadius: '8px',
        padding: '8px 12px', fontSize: '13px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <p style={{ margin: 0, fontWeight: '600', color: '#374151' }}>{label}</p>
      <p style={{ margin: '2px 0 0', color: '#1D9E75', fontWeight: '700' }}>{payload[0].value}</p>
    </div>
  )
}

const COL_HEADER = { fontSize: '10px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }

export default function Analytics() {
  const { org, supplies, shiftLogs, selectedUnit, setSelectedUnit } = useApp()
  const isHospital = org.facilityType === 'hospital'

  // Build last-7-day date strings
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })

  // Logs scoped to unit + last 7 days
  const unitLogs = shiftLogs.filter(
    (l) => l.date >= last7Days[0] && (!isHospital || l.unit === selectedUnit)
  )
  const hasData = unitLogs.length > 0

  // --- Patient chart data ---
  const patientsByDay = last7Days.map((date) => {
    const patients = unitLogs
      .filter((l) => l.date === date)
      .reduce((sum, l) => sum + (l.patientCount || 0), 0)
    const label = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })
    return { label, patients }
  })
  const totalPatients = patientsByDay.reduce((s, d) => s + d.patients, 0)
  const avgPerDay = Math.round(totalPatients / 7)

  // --- Supply stats ---
  const supplyStats = supplies
    .map((s) => {
      const samples = unitLogs
        .map((log) => log.supplyLevels?.[s.id])
        .filter((v) => v != null)

      const avgUsed =
        samples.length > 0
          ? Math.round(
              samples.reduce((acc, pct) => acc + s.parLevel * (1 - pct / 100), 0) /
                samples.length
            )
          : 0

      const daysOfCoverage = avgUsed > 0 ? Math.round(s.currentQuantity / avgUsed) : 99

      return { ...s, avgUsed, daysOfCoverage }
    })
    .sort(
      (a, b) =>
        urgencyRank(a.daysOfCoverage) - urgencyRank(b.daysOfCoverage) ||
        a.name.localeCompare(b.name)
    )

  // Top 5 most-used for horizontal chart
  const topUsage = [...supplyStats]
    .filter((s) => s.avgUsed > 0)
    .sort((a, b) => b.avgUsed - a.avgUsed)
    .slice(0, 5)
    .map((s) => ({
      name: s.name.length > 16 ? s.name.slice(0, 15) + '…' : s.name,
      avgUsed: s.avgUsed,
    }))

  // --- Metric card values ---
  const reorderCount = supplies.filter((s) => s.currentQuantity <= s.reorderLevel).length
  const lastWeeklyCheck = localStorage.getItem('lastWeeklyCheckDate')
  const daysSinceCheck = lastWeeklyCheck
    ? Math.floor((Date.now() - new Date(lastWeeklyCheck).getTime()) / (1000 * 60 * 60 * 24))
    : null

  const metricCards = [
    {
      label: 'Avg Patients / Day',
      value: avgPerDay,
      sub: 'last 7 days',
      alert: false,
    },
    {
      label: 'Supplies Tracked',
      value: supplies.length,
      sub: 'total',
      alert: false,
    },
    {
      label: 'Need Reorder',
      value: reorderCount,
      sub: 'below reorder level',
      alert: reorderCount > 0,
    },
    {
      label: 'Weekly Check',
      value: daysSinceCheck !== null ? `${daysSinceCheck}d` : '—',
      sub: daysSinceCheck !== null ? 'days since last check' : 'never done',
      alert: daysSinceCheck === null || daysSinceCheck >= 7,
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100svh', background: '#F9FAFB' }}>
      {/* Header */}
      <header
        style={{
          padding: '16px 20px 12px',
          borderBottom: '1px solid #E5E7EB',
          background: 'white',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#111827' }}>Analytics</h1>
          {isHospital && (
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              style={{
                border: '1.5px solid #1D9E75', borderRadius: '8px', padding: '6px 10px',
                fontSize: '13px', fontWeight: '600', color: '#1D9E75', background: '#E8F7F2',
                outline: 'none', minHeight: '36px',
              }}
            >
              {org.units.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          )}
        </div>
        {isHospital && (
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6B7280' }}>
            Showing data for {selectedUnit}
          </p>
        )}
      </header>

      <main style={{ flex: 1, padding: '16px 16px 100px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Metric cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {metricCards.map((card) => (
            <div
              key={card.label}
              style={{
                background: card.alert ? '#FFF7F7' : 'white',
                border: `1px solid ${card.alert ? '#FECACA' : '#E5E7EB'}`,
                borderRadius: '12px',
                padding: '14px 16px',
              }}
            >
              <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {card.label}
              </p>
              <p style={{ margin: 0, fontSize: '26px', fontWeight: '800', lineHeight: 1.1, color: card.alert ? '#DC2626' : '#111827' }}>
                {card.value}
              </p>
              <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#9CA3AF' }}>{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {!hasData ? (
          <div
            style={{
              background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px',
              padding: '48px 24px', textAlign: 'center',
            }}
          >
            <p style={{ margin: '0 0 10px', fontSize: '36px' }}>📊</p>
            <p style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: '700', color: '#374151' }}>No data yet</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#9CA3AF' }}>
              Complete a Daily Supply Check to see analytics here.
            </p>
          </div>
        ) : (
          <>
            {/* Patients bar chart */}
            <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px' }}>
              <h2 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '700', color: '#374151' }}>
                Patients Last 7 Days
              </h2>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={patientsByDay} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: '#F9FAFB' }} />
                  <Bar dataKey="patients" fill="#1D9E75" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Supply usage horizontal bar chart */}
            {topUsage.length > 0 && (
              <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px' }}>
                <h2 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '700', color: '#374151' }}>
                  Top Supply Usage
                </h2>
                <ResponsiveContainer width="100%" height={topUsage.length * 46 + 16}>
                  <BarChart
                    data={topUsage}
                    layout="vertical"
                    margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: '#9CA3AF' }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{ fontSize: 12, fill: '#374151' }}
                      axisLine={false}
                      tickLine={false}
                      width={112}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: '#F9FAFB' }} />
                    <Bar dataKey="avgUsed" fill="#1D9E75" radius={[0, 4, 4, 0]} maxBarSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Supply status table */}
            <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 16px 10px' }}>
                <h2 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#374151' }}>Supply Status</h2>
              </div>

              {/* Column headers */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 48px 48px 52px 82px',
                  padding: '8px 16px',
                  background: '#F9FAFB',
                  borderTop: '1px solid #F3F4F6',
                  borderBottom: '1px solid #F3F4F6',
                  gap: '4px',
                }}
              >
                <span style={COL_HEADER}>Supply</span>
                <span style={{ ...COL_HEADER, textAlign: 'center' }}>Qty</span>
                <span style={{ ...COL_HEADER, textAlign: 'center' }}>Par</span>
                <span style={{ ...COL_HEADER, textAlign: 'center' }}>Days</span>
                <span style={{ ...COL_HEADER, textAlign: 'center' }}>Status</span>
              </div>

              {supplyStats.map((s) => {
                const status = statusConfig(s.daysOfCoverage)
                return (
                  <div
                    key={s.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 48px 48px 52px 82px',
                      alignItems: 'center',
                      padding: '11px 16px',
                      borderBottom: '1px solid #F3F4F6',
                      gap: '4px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '13px', fontWeight: '600', color: '#111827',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        paddingRight: '4px',
                      }}
                    >
                      {s.name}
                    </span>
                    <span
                      style={{
                        fontSize: '13px', fontWeight: '700', textAlign: 'center',
                        color: s.currentQuantity <= s.reorderLevel ? '#DC2626' : '#374151',
                      }}
                    >
                      {s.currentQuantity}
                    </span>
                    <span style={{ fontSize: '13px', color: '#9CA3AF', textAlign: 'center' }}>
                      {s.parLevel}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151', textAlign: 'center' }}>
                      {s.daysOfCoverage >= 99 ? '∞' : s.daysOfCoverage}
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <span
                        style={{
                          background: status.bg,
                          color: status.text,
                          border: `1px solid ${status.border}`,
                          borderRadius: '6px',
                          padding: '3px 7px',
                          fontSize: '11px',
                          fontWeight: '700',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {status.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
