import { useState } from 'react'
import { useApp } from '../context/AppContext'

const CATEGORY_COLORS = {
  IV:          { bg: '#DBEAFE', text: '#1D4ED8', border: '#93C5FD' },
  PPE:         { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' },
  Medication:  { bg: '#EDE9FE', text: '#5B21B6', border: '#C4B5FD' },
  Equipment:   { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
  Consumable:  { bg: '#FFE4E6', text: '#9F1239', border: '#FDA4AF' },
}

const EDIT_CATEGORIES = ['IV', 'PPE', 'Medication', 'Equipment', 'Consumable']

function CategoryBadge({ category }) {
  const colors = CATEGORY_COLORS[category] || { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB' }
  return (
    <span
      style={{
        background: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        borderRadius: '6px',
        padding: '2px 8px',
        fontSize: '11px',
        fontWeight: '600',
        whiteSpace: 'nowrap',
      }}
    >
      {category}
    </span>
  )
}

function EditSupplyModal({ supply, onClose, onUpdate, onDelete }) {
  const [form, setForm] = useState({
    name:            supply.name ?? '',
    category:        supply.category ?? 'IV',
    currentQuantity: supply.currentQuantity ?? 0,
    parLevel:        supply.parLevel ?? 0,
    reorderLevel:    supply.reorderLevel ?? 0,
    costPerUnit:     supply.costPerUnit ?? 0,
    location:        supply.location ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const reorderError =
    form.parLevel !== '' && form.reorderLevel !== '' &&
    Number(form.reorderLevel) >= Number(form.parLevel)
      ? 'Reorder level must be less than par level'
      : null

  const canSave = form.name.trim() !== '' && !reorderError && !saving

  const field = {
    border: '1.5px solid #E5E7EB', borderRadius: '8px',
    padding: '12px', fontSize: '15px', width: '100%',
    boxSizing: 'border-box', outline: 'none', color: '#111827', background: 'white',
  }

  const label = {
    display: 'block', fontSize: '12px', fontWeight: '600', color: '#6B7280',
    marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em',
  }

  async function handleSave() {
    if (!canSave) return
    setSaving(true)
    setSaveError(null)
    try {
      await onUpdate({
        ...supply,
        name:            form.name.trim(),
        category:        form.category,
        currentQuantity: Number(form.currentQuantity),
        parLevel:        Number(form.parLevel),
        reorderLevel:    Number(form.reorderLevel),
        costPerUnit:     Number(form.costPerUnit),
        location:        form.location,
      })
      onClose()
    } catch (err) {
      console.error('[EditSupply] save failed:', err)
      setSaveError('Save failed — check your connection and try again.')
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await onDelete(supply.id)
      onClose()
    } catch (err) {
      console.error('[EditSupply] delete failed:', err)
      setSaveError('Delete failed — check your connection and try again.')
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        zIndex: 100, display: 'flex', alignItems: 'flex-end',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: 'white', borderRadius: '20px 20px 0 0',
          width: '100%', maxWidth: '768px', margin: '0 auto',
          maxHeight: '90svh', overflowY: 'auto',
          padding: '24px 20px 40px',
        }}
      >
        {/* Sheet header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827' }}>Edit Supply</h2>
          <button
            onClick={onClose}
            style={{ border: 'none', background: '#F3F4F6', borderRadius: '8px', width: '36px', height: '36px', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ×
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Name */}
          <div>
            <span style={label}>Name</span>
            <input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Supply name"
              style={field}
            />
          </div>

          {/* Category pills */}
          <div>
            <span style={label}>Category</span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {EDIT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => set('category', cat)}
                  style={{
                    border: form.category === cat ? '1.5px solid #1D9E75' : '1.5px solid #E5E7EB',
                    background: form.category === cat ? '#E8F7F2' : 'white',
                    color: form.category === cat ? '#1D9E75' : '#6B7280',
                    borderRadius: '20px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    minHeight: '36px',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Current Quantity */}
          <div>
            <span style={label}>Current Quantity</span>
            <input
              type="number" min="0"
              value={form.currentQuantity}
              onChange={(e) => set('currentQuantity', e.target.value)}
              style={field}
            />
          </div>

          {/* Par Level + Reorder Level */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <span style={label}>Par Level</span>
              <input
                type="number" min="0"
                value={form.parLevel}
                onChange={(e) => set('parLevel', e.target.value)}
                style={field}
              />
            </div>
            <div>
              <span style={label}>Reorder Level</span>
              <input
                type="number" min="0"
                value={form.reorderLevel}
                onChange={(e) => set('reorderLevel', e.target.value)}
                style={{ ...field, border: reorderError ? '1.5px solid #FCA5A5' : '1.5px solid #E5E7EB' }}
              />
            </div>
          </div>
          {reorderError && (
            <p style={{ margin: '-8px 0 0', fontSize: '12px', color: '#DC2626', fontWeight: '500' }}>
              {reorderError}
            </p>
          )}

          {/* Cost + Location */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <span style={label}>Cost / Unit ($)</span>
              <input
                type="number" min="0" step="0.01"
                value={form.costPerUnit}
                onChange={(e) => set('costPerUnit', e.target.value)}
                style={field}
              />
            </div>
            <div>
              <span style={label}>Location</span>
              <input
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                placeholder="e.g. Cabinet A"
                style={field}
              />
            </div>
          </div>

          {saveError && (
            <p style={{ margin: 0, fontSize: '13px', color: '#DC2626', fontWeight: '500' }}>{saveError}</p>
          )}

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={!canSave}
            style={{
              background: canSave ? '#1D9E75' : '#9CA3AF',
              color: 'white', border: 'none', borderRadius: '10px',
              padding: '16px', fontSize: '16px', fontWeight: '700',
              cursor: canSave ? 'pointer' : 'not-allowed',
              marginTop: '4px', minHeight: '56px',
            }}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>

          {/* Delete */}
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              style={{
                background: 'none', border: 'none', color: '#DC2626',
                fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                padding: '8px 0', textAlign: 'center',
              }}
            >
              Delete Supply
            </button>
          ) : (
            <div
              style={{
                background: '#FEF2F2', border: '1px solid #FECACA',
                borderRadius: '10px', padding: '14px', textAlign: 'center',
              }}
            >
              <p style={{ margin: '0 0 12px', fontSize: '14px', color: '#DC2626', fontWeight: '600' }}>
                Are you sure? This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setConfirmDelete(false)}
                  style={{
                    flex: 1, background: '#F3F4F6', color: '#374151', border: 'none',
                    borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: '600',
                    cursor: 'pointer', minHeight: '44px',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{
                    flex: 1, background: '#DC2626', color: 'white', border: 'none',
                    borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: '600',
                    cursor: deleting ? 'not-allowed' : 'pointer', minHeight: '44px',
                  }}
                >
                  {deleting ? 'Deleting…' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AddSupplyModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    name: '', category: 'IV', parLevel: '', reorderLevel: '', costPerUnit: '', location: '',
  })

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  function handleSubmit(e) {
    e.preventDefault()
    const id = `S${String(Date.now()).slice(-4)}`
    onAdd({
      id,
      name: form.name,
      category: form.category,
      parLevel: Number(form.parLevel),
      reorderLevel: Number(form.reorderLevel),
      currentQuantity: Number(form.parLevel),
      location: form.location,
      costPerUnit: Number(form.costPerUnit),
      orgId: 'org-001',
    })
    onClose()
  }

  const field = {
    border: '1.5px solid #E5E7EB', borderRadius: '8px',
    padding: '12px', fontSize: '15px', width: '100%',
    boxSizing: 'border-box', outline: 'none', color: '#111827',
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        zIndex: 100, display: 'flex', alignItems: 'flex-end',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: 'white', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: '768px', margin: '0 auto', padding: '24px 20px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827' }}>Add Supply</h2>
          <button onClick={onClose} style={{ border: 'none', background: '#F3F4F6', borderRadius: '8px', width: '36px', height: '36px', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input required placeholder="Supply name" value={form.name} onChange={(e) => set('name', e.target.value)} style={field} />
          <select value={form.category} onChange={(e) => set('category', e.target.value)} style={field}>
            <option>IV</option>
            <option>PPE</option>
            <option>Medication</option>
            <option>Equipment</option>
          </select>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <input required type="number" placeholder="Par level" value={form.parLevel} onChange={(e) => set('parLevel', e.target.value)} style={field} />
            <input required type="number" placeholder="Reorder level" value={form.reorderLevel} onChange={(e) => set('reorderLevel', e.target.value)} style={field} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <input required type="number" step="0.01" placeholder="Cost/unit ($)" value={form.costPerUnit} onChange={(e) => set('costPerUnit', e.target.value)} style={field} />
            <input placeholder="Location" value={form.location} onChange={(e) => set('location', e.target.value)} style={field} />
          </div>
          <button
            type="submit"
            style={{
              background: '#1D9E75', color: 'white', border: 'none', borderRadius: '10px',
              padding: '16px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', marginTop: '4px',
            }}
          >
            Add Supply
          </button>
        </form>
      </div>
    </div>
  )
}

export default function Supplies() {
  const { org, supplies, addSupply, updateSupply, deleteSupply } = useApp()
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedSupply, setSelectedSupply] = useState(null)

  const isClinic = org.facilityType === 'clinic'
  const categories = ['All', 'IV', 'PPE', 'Medication', 'Equipment', 'Consumable'].filter(
    (c) => c !== 'IV' || !isClinic
  )

  const filtered = supplies.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase())
    const matchCat = filterCategory === 'All' || s.category === filterCategory
    return matchSearch && matchCat
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100svh', background: 'white' }}>
      {/* Header */}
      <header style={{ padding: '16px 20px 12px', borderBottom: '1px solid #F3F4F6', background: 'white', position: 'sticky', top: 0, zIndex: 10 }}>
        <h1 style={{ margin: '0 0 12px', fontSize: '20px', fontWeight: '700', color: '#111827' }}>Supplies</h1>
        <input
          type="search"
          placeholder="Search supplies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%', boxSizing: 'border-box',
            border: '1.5px solid #E5E7EB', borderRadius: '10px',
            padding: '12px 14px', fontSize: '15px', outline: 'none', color: '#111827',
          }}
        />
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingTop: '10px', paddingBottom: '2px' }}>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilterCategory(c)}
              style={{
                border: filterCategory === c ? '1.5px solid #1D9E75' : '1.5px solid #E5E7EB',
                background: filterCategory === c ? '#E8F7F2' : 'white',
                color: filterCategory === c ? '#1D9E75' : '#6B7280',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                minHeight: '36px',
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </header>

      {/* Supply List */}
      <main style={{ flex: 1, padding: '0 0 100px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 80px',
            padding: '10px 20px',
            background: '#F9FAFB',
            borderBottom: '1px solid #F3F4F6',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Name</span>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right' }}>Stock</span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9CA3AF' }}>No supplies found</div>
        ) : (
          filtered.map((s) => {
            const isLow = s.currentQuantity <= s.reorderLevel
            return (
              <div
                key={s.id}
                onClick={() => setSelectedSupply(s)}
                onTouchStart={(e) => (e.currentTarget.style.background = isLow ? '#FFE4E4' : '#F9FAFB')}
                onTouchEnd={(e) => (e.currentTarget.style.background = isLow ? '#FFF7F7' : 'white')}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 80px',
                  alignItems: 'center',
                  padding: '14px 20px',
                  borderBottom: '1px solid #F3F4F6',
                  background: isLow ? '#FFF7F7' : 'white',
                  cursor: 'pointer',
                }}
              >
                <div style={{ paddingRight: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {isLow && (
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', display: 'inline-block', flexShrink: 0 }} />
                    )}
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{s.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    <CategoryBadge category={s.category} />
                    <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Par: {s.parLevel}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: isLow ? '#DC2626' : '#111827' }}>
                    {s.currentQuantity}
                  </span>
                  {isLow && (
                    <p style={{ margin: 0, fontSize: '10px', color: '#EF4444', fontWeight: '600' }}>LOW</p>
                  )}
                </div>
              </div>
            )
          })
        )}
      </main>

      {/* Add FAB */}
      <button
        onClick={() => setShowAddModal(true)}
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#1D9E75',
          border: 'none',
          color: 'white',
          fontSize: '28px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(29,158,117,0.4)',
          zIndex: 20,
        }}
      >
        +
      </button>

      {showAddModal && (
        <AddSupplyModal onClose={() => setShowAddModal(false)} onAdd={addSupply} />
      )}

      {selectedSupply && (
        <EditSupplyModal
          supply={selectedSupply}
          onClose={() => setSelectedSupply(null)}
          onUpdate={updateSupply}
          onDelete={deleteSupply}
        />
      )}
    </div>
  )
}
