# INVNTSite

**Smart inventory tracking for clinical teams.**

A full-stack web application designed for hospitals and clinics to manage, track, and audit medical supplies across daily and weekly workflows. Built with React and Firebase, deployed to production on Firebase Hosting.

**Live Demo:** [https://invntsite.web.app](https://invntsite.web.app)

---

## Features

- **Authentication** — Secure sign up and sign in with Firebase Auth
- **Facility Onboarding** — Configures inventory and shift tracking based on facility type (Hospital or Clinic)
- **Dashboard** — At-a-glance view of today's log status, low stock alerts, total supplies tracked, and weekly check reminders
- **Supplies Management** — View, search, and filter inventory by category (PPE, Medication, Equipment, Consumable) with par-level tracking
- **Daily Supply Check** — Log supply volume levels by shift and save to Firestore with deterministic document IDs
- **Weekly Supply Check** — Count supplies by category against par levels with discrepancy detection and progress saving
- **Analytics** — Track average daily patients, supplies needing reorder, weekly check history, and usage trends

---

## Tech Stack

**Frontend:** React, Recharts

**Backend:** Firebase, Firestore

**Deployment:** Firebase Hosting

---

## Screenshots

| Dashboard | Supplies | Weekly Check |
|-----------|----------|--------------|
| ![Dashboard](screenshots/dashboard.png) | ![Supplies](screenshots/supplies.png) | ![Weekly Check](screenshots/weekly-check.png) |

---

## Getting Started

### Prerequisites

- Node.js
- Firebase CLI (`npm install -g firebase-tools`)

### Installation

```bash
git clone https://github.com/sushanthp1265/invntsite-sp.git
cd invntsite-sp
npm install
```

### Running Locally

```bash
npm run dev
```

### Deployment

```bash
npm run build
firebase deploy --only hosting
```

---

## Project Status

Actively in development. Core inventory tracking screens are fully built and deployed. Upcoming features include AI-powered shift handoff summaries, smart reorder predictions, multi-organization support, and a React Native mobile app.

---

## Author

Sushanth Penumala — [p.sushanth26@gmail.com](mailto:p.sushanth26@gmail.com) — [LinkedIn](https://linkedin.com)
