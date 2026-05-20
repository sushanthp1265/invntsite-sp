import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db, ORG_ID } from '../firebase'
import { mockOrg } from '../data/mockData'

export function useOrganization() {
  const [org, setOrg] = useState(mockOrg)
  const [loading, setLoading] = useState(!!db)

  useEffect(() => {
    if (!db) return
    return onSnapshot(
      doc(db, 'organizations', ORG_ID),
      (snap) => {
        if (snap.exists()) setOrg({ id: snap.id, ...snap.data() })
        setLoading(false)
      },
      (err) => {
        console.error('useOrganization:', err)
        setLoading(false)
      }
    )
  }, [])

  return { org, loading }
}
