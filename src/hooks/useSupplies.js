import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db, ORG_ID } from '../firebase'
import { mockSupplies } from '../data/mockData'

export function useSupplies() {
  const [supplies, setSupplies] = useState(mockSupplies)
  const [loading, setLoading] = useState(!!db)

  useEffect(() => {
    if (!db) return
    const q = query(
      collection(db, 'supplies'),
      where('orgId', '==', ORG_ID)
    )
    return onSnapshot(
      q,
      (snap) => {
        setSupplies(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      (err) => {
        console.error('useSupplies:', err)
        setLoading(false)
      }
    )
  }, [])

  return { supplies, loading }
}
