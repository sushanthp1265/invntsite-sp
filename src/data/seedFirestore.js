import { doc, setDoc, collection, addDoc, getDoc } from 'firebase/firestore'
import { db, ORG_ID } from '../firebase'
import { mockOrg, mockSupplies, mockShiftLogs } from './mockData'

/**
 * Seeds Firestore with the mock data if the collections are empty.
 * Run once from the browser console after adding real Firebase credentials:
 *   import('/src/data/seedFirestore.js').then(m => m.seedFirestore())
 */
export async function seedFirestore() {
  if (!db) {
    console.warn('[seed] Firebase not configured — update src/firebase.js first.')
    return
  }

  // Seed organization
  const orgRef = doc(db, 'organizations', ORG_ID)
  const orgSnap = await getDoc(orgRef)
  if (!orgSnap.exists()) {
    await setDoc(orgRef, {
      name: mockOrg.name,
      facilityType: mockOrg.facilityType,
      specialty: mockOrg.specialty,
      units: mockOrg.units,
    })
    console.log('[seed] organization written')
  } else {
    console.log('[seed] organization already exists — skipped')
  }

  // Seed supplies (uses supply id as doc id)
  for (const supply of mockSupplies) {
    const { id, ...data } = supply
    const ref = doc(db, 'supplies', id)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      await setDoc(ref, data)
      console.log(`[seed] supply ${id} written`)
    }
  }

  // Seed shift logs (auto-generated doc ids)
  const existingCheck = await getDoc(doc(db, 'shiftLogs', mockShiftLogs[0].id))
  if (!existingCheck.exists()) {
    for (const log of mockShiftLogs) {
      const { id, ...data } = log
      await setDoc(doc(db, 'shiftLogs', id), data)
    }
    console.log('[seed] shift logs written')
  } else {
    console.log('[seed] shift logs already exist — skipped')
  }

  console.log('[seed] done')
}
