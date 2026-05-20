export const mockOrg = {
  id: 'org-001',
  name: 'General Hospital',
  facilityType: 'hospital', // 'hospital' | 'clinic'
  specialty: 'General Medicine',
  units: ['ED', 'ICU', 'Med-Surg'],
}

export const mockSupplies = [
  { id: 'S001', name: 'IV Catheter 18G',      category: 'IV',         parLevel: 100, reorderLevel: 30, currentQuantity: 85,  location: 'Supply Room A', costPerUnit: 1.25,  orgId: 'org-001' },
  { id: 'S002', name: 'IV Tubing Set',         category: 'IV',         parLevel: 80,  reorderLevel: 25, currentQuantity: 12,  location: 'Supply Room A', costPerUnit: 2.10,  orgId: 'org-001' },
  { id: 'S003', name: 'Normal Saline 0.9%',    category: 'IV',         parLevel: 60,  reorderLevel: 20, currentQuantity: 45,  location: 'Supply Room B', costPerUnit: 3.50,  orgId: 'org-001' },
  { id: 'S004', name: 'Nitrile Gloves (M)',     category: 'PPE',        parLevel: 500, reorderLevel: 150, currentQuantity: 8,  location: 'PPE Cabinet',   costPerUnit: 0.15,  orgId: 'org-001' },
  { id: 'S005', name: 'Surgical Masks',         category: 'PPE',        parLevel: 300, reorderLevel: 100, currentQuantity: 220, location: 'PPE Cabinet',  costPerUnit: 0.35,  orgId: 'org-001' },
  { id: 'S006', name: 'Isolation Gowns',        category: 'PPE',        parLevel: 150, reorderLevel: 50,  currentQuantity: 40,  location: 'PPE Cabinet',  costPerUnit: 1.80,  orgId: 'org-001' },
  { id: 'S007', name: 'Morphine 2mg/mL',        category: 'Medication', parLevel: 50,  reorderLevel: 15,  currentQuantity: 32,  location: 'Med Room',      costPerUnit: 8.00,  orgId: 'org-001' },
  { id: 'S008', name: 'Heparin 5000u/mL',       category: 'Medication', parLevel: 40,  reorderLevel: 12,  currentQuantity: 5,   location: 'Med Room',      costPerUnit: 6.50,  orgId: 'org-001' },
  { id: 'S009', name: 'Insulin Regular 100u',   category: 'Medication', parLevel: 30,  reorderLevel: 10,  currentQuantity: 18,  location: 'Med Fridge',    costPerUnit: 12.00, orgId: 'org-001' },
  { id: 'S010', name: 'Pulse Oximeter Probes',  category: 'Equipment',  parLevel: 20,  reorderLevel: 6,   currentQuantity: 15,  location: 'Equipment Bay', costPerUnit: 4.50,  orgId: 'org-001' },
  { id: 'S011', name: 'Foley Catheter 16Fr',    category: 'Equipment',  parLevel: 30,  reorderLevel: 10,  currentQuantity: 22,  location: 'Supply Room A', costPerUnit: 5.25,  orgId: 'org-001' },
  { id: 'S012', name: 'Nasogastric Tube 16Fr',  category: 'Equipment',  parLevel: 20,  reorderLevel: 6,   currentQuantity: 3,   location: 'Supply Room B', costPerUnit: 3.75,  orgId: 'org-001' },
]

// Last 7 days of shift logs
const today = new Date()
const dateStr = (daysAgo) => {
  const d = new Date(today)
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().split('T')[0]
}

export const mockShiftLogs = [
  {
    id: 'log-001', date: dateStr(0), shift: 'Day',     unit: 'ED',       patientCount: 42,
    supplyLevels: { 'S001': 75, 'S002': 25, 'S003': 50, 'S004': 0, 'S005': 75, 'S006': 50, 'S007': 75, 'S008': 25, 'S009': 50, 'S010': 75, 'S011': 100, 'S012': 25 }, orgId: 'org-001',
  },
  {
    id: 'log-002', date: dateStr(0), shift: 'Evening', unit: 'ED',       patientCount: 38,
    supplyLevels: { 'S001': 50, 'S002': 25, 'S003': 50, 'S004': 0, 'S005': 50, 'S006': 25, 'S007': 50, 'S008': 0,  'S009': 50, 'S010': 75, 'S011': 75,  'S012': 0  }, orgId: 'org-001',
  },
  {
    id: 'log-003', date: dateStr(1), shift: 'Day',     unit: 'ICU',      patientCount: 12,
    supplyLevels: { 'S001': 100, 'S002': 75, 'S003': 75, 'S004': 50, 'S005': 100, 'S006': 75, 'S007': 100, 'S008': 75, 'S009': 75, 'S010': 100, 'S011': 100, 'S012': 75 }, orgId: 'org-001',
  },
  {
    id: 'log-004', date: dateStr(1), shift: 'Day',     unit: 'Med-Surg', patientCount: 28,
    supplyLevels: { 'S001': 75, 'S002': 50, 'S003': 75, 'S004': 25, 'S005': 75, 'S006': 50, 'S007': 75, 'S008': 50, 'S009': 75, 'S010': 75, 'S011': 75, 'S012': 50 }, orgId: 'org-001',
  },
  {
    id: 'log-005', date: dateStr(2), shift: 'Day',     unit: 'ED',       patientCount: 45,
    supplyLevels: { 'S001': 75, 'S002': 50, 'S003': 50, 'S004': 25, 'S005': 75, 'S006': 25, 'S007': 75, 'S008': 25, 'S009': 50, 'S010': 100, 'S011': 75, 'S012': 50 }, orgId: 'org-001',
  },
  {
    id: 'log-006', date: dateStr(3), shift: 'Day',     unit: 'ED',       patientCount: 35,
    supplyLevels: { 'S001': 100, 'S002': 75, 'S003': 75, 'S004': 50, 'S005': 100, 'S006': 75, 'S007': 100, 'S008': 75, 'S009': 75, 'S010': 100, 'S011': 100, 'S012': 75 }, orgId: 'org-001',
  },
  {
    id: 'log-007', date: dateStr(4), shift: 'Day',     unit: 'ED',       patientCount: 39,
    supplyLevels: { 'S001': 75, 'S002': 75, 'S003': 75, 'S004': 75, 'S005': 75, 'S006': 75, 'S007': 75, 'S008': 75, 'S009': 75, 'S010': 75, 'S011': 75, 'S012': 75 }, orgId: 'org-001',
  },
]

export const mockLowStockAlerts = mockSupplies.filter(
  (s) => s.currentQuantity <= s.reorderLevel
)
