import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db, ORG_ID } from '../firebase'

export function useShiftLogs() {
  // Start empty — in db mode, loading=true gates the seeding effect until the
  // snapshot arrives. In no-db mode, AppContext uses localLogs instead of this.
  const [shiftLogs, setShiftLogs] = useState([])
  const [loading, setLoading] = useState(!!db)

  useEffect(() => {
    if (!db) return

    // Query by orgId only (single-field auto-index — no composite index needed).
    // The previous query combined where('date', '>=') + orderBy('date') with
    // where('orgId', '=='), which requires a composite index that was never
    // created, causing onSnapshot to always error and shiftLogs to stay as
    // mockShiftLogs — making today's saved log invisible to the seeding effect.
    const q = query(
      collection(db, 'shiftLogs'),
      where('orgId', '==', ORG_ID)
    )
    return onSnapshot(
      q,
      (snap) => {
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const cutoff = sevenDaysAgo.toISOString().split('T')[0]
        const logs = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((l) => l.date >= cutoff)
          .sort((a, b) => b.date.localeCompare(a.date))
        setShiftLogs(logs)
        setLoading(false)
      },
      (err) => {
        console.error('useShiftLogs:', err)
        setLoading(false)
      }
    )
  }, [])

  return { shiftLogs, loading }
}
