import { createContext, useContext, useState } from 'react'
import { doc, collection, setDoc, getDocs, deleteDoc, query, where } from 'firebase/firestore'
import { db, ORG_ID } from '../firebase'
import { useAuth } from '../hooks/useAuth'
import { useOrganization } from '../hooks/useOrganization'
import { useSupplies } from '../hooks/useSupplies'
import { useShiftLogs } from '../hooks/useShiftLogs'
import { mockOrg } from '../data/mockData'
import { getCatalog } from '../data/supplyCatalogs'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const { user, loading: authLoading } = useAuth()

  // Firestore-backed data (falls back to mock when db is null)
  const { org: fsOrg, loading: orgLoading } = useOrganization()
  const { supplies: fsSupplies, loading: suppliesLoading } = useSupplies()
  const { shiftLogs: fsLogs, loading: logsLoading } = useShiftLogs()

  // Local-only additions for the no-db case. When db is connected, onSnapshot
  // owns the source of truth so these stay empty.
  const [orgOverride, setOrgOverride] = useState(null)
  const [localSupplies, setLocalSupplies] = useState([])
  const [localLogs, setLocalLogs] = useState([])

  const [selectedUnit, setSelectedUnitState] = useState(
    () => localStorage.getItem('selectedUnit') ?? mockOrg.units[0]
  )

  function setSelectedUnit(unit) {
    localStorage.setItem('selectedUnit', unit)
    setSelectedUnitState(unit)
  }

  const org = orgOverride ?? fsOrg
  // In no-db mode: once the catalog is seeded (localSupplies non-empty), use it exclusively
  // so mock data doesn't mix with the selected specialty's catalog.
  const supplies = db ? fsSupplies : (localSupplies.length > 0 ? localSupplies : fsSupplies)
  // In no-db mode: use only locally saved logs, not mockShiftLogs.
  // mockShiftLogs use S001/S002 IDs that don't match the seeded catalog IDs,
  // which would cause the pre-population effect to default everything to Full.
  const shiftLogs = db ? fsLogs : localLogs
  const loading = orgLoading || suppliesLoading || logsLoading

  async function setOrg(newOrg) {
    const data = user?.uid ? { ...newOrg, createdBy: user.uid } : newOrg
    if (db) {
      await setDoc(doc(db, 'organizations', ORG_ID), data)
    } else {
      setOrgOverride(data)
    }
    return ORG_ID
  }

  async function addSupply(supply) {
    if (db) {
      const { id, ...data } = supply
      await setDoc(doc(db, 'supplies', id), data)
    } else {
      setLocalSupplies((prev) => [...prev, supply])
    }
  }

  async function seedCatalogSupplies(facilityType, specialty, orgId) {
    const catalog = getCatalog(facilityType, specialty)
    if (catalog.length === 0) return
    const catalogSupplies = catalog.map((template) => {
      const slug = template.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      return { ...template, id: `${orgId}-${slug}`, orgId, currentQuantity: template.parLevel }
    })
    if (db) {
      const existing = await getDocs(query(collection(db, 'supplies'), where('orgId', '==', orgId)))
      await Promise.all(existing.docs.map((d) => deleteDoc(doc(db, 'supplies', d.id))))
      await Promise.all(catalogSupplies.map(({ id, ...data }) => setDoc(doc(db, 'supplies', id), data)))
    } else {
      setLocalSupplies(catalogSupplies)
    }
  }

  async function updateSupply(supply) {
    const { id, ...data } = supply
    if (db) {
      await setDoc(doc(db, 'supplies', id), data)
    } else {
      setLocalSupplies((prev) => prev.map((s) => (s.id === id ? supply : s)))
    }
  }

  async function deleteSupply(id) {
    if (db) {
      await deleteDoc(doc(db, 'supplies', id))
    } else {
      setLocalSupplies((prev) => prev.filter((s) => s.id !== id))
    }
  }

  async function saveShiftLog(log) {
    const { id, ...data } = log
    console.log('[AppContext] saveShiftLog — doc id:', id)
    console.log('[AppContext] saveShiftLog — data:', JSON.stringify(data, null, 2))
    if (db) {
      await setDoc(doc(db, 'shiftLogs', id), data)
      console.log('[AppContext] saveShiftLog — Firestore write complete')
    } else {
      setLocalLogs((prev) => [...prev.filter((l) => l.id !== log.id), log])
      console.log('[AppContext] saveShiftLog — local state updated')
    }
  }

  return (
    <AppContext.Provider
      value={{
        user, authLoading,
        org, setOrg,
        supplies, addSupply, updateSupply, deleteSupply, seedCatalogSupplies,
        shiftLogs, saveShiftLog,
        selectedUnit, setSelectedUnit,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
