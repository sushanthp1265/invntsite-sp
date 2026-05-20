import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'

export function useAuth() {
  // undefined = still resolving, null = logged out, object = logged in
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    if (!auth) {
      // Firebase not configured — use a mock user so the app still works
      setUser({ uid: 'local-user', email: 'local@invntsite.app' })
      return
    }
    return onAuthStateChanged(auth, setUser)
  }, [])

  return { user, loading: user === undefined }
}
