// src/firebase.js
// ─────────────────────────────────────────────────────────────────────────────
// REPLACE the firebaseConfig values below with your own Firebase project config.
// 1. Go to console.firebase.google.com
// 2. Create a project → Add Web App → copy the config object here
// 3. Enable Realtime Database in the Firebase console (start in test mode)
// ─────────────────────────────────────────────────────────────────────────────
import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set, onValue, get } from 'firebase/database'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)

// ─── Data shape ──────────────────────────────────────────────────────────────
// scores/{day}/{team}/{category} = number
// e.g. scores/1/red/outdoor = 4

export const TEAMS = [
  { id: 'red',    label: 'Red',    color: '#FF3B3B', glow: '#FF3B3B55', text: '#fff' },
  { id: 'blue',   label: 'Blue',   color: '#3B8BFF', glow: '#3B8BFF55', text: '#fff' },
  { id: 'green',  label: 'Green',  color: '#2EE89A', glow: '#2EE89A55', text: '#000' },
  { id: 'yellow', label: 'Yellow', color: '#FFD600', glow: '#FFD60055', text: '#000' },
]

export const CATEGORIES = [
  { id: 'outdoor',   label: 'Outdoor Games' },
  { id: 'lobby',     label: 'Lobby Games'   },
  { id: 'stage',     label: 'Stage Games'   },
  { id: 'guests',    label: 'First Time Guests' },
  { id: 'spirit',    label: 'Spirit'        },
  { id: 'donations', label: 'Donations'     },
]

export const DAYS = [1, 2, 3, 4]

// Build empty score structure
export function emptyScores() {
  const s = {}
  DAYS.forEach(d => {
    s[d] = {}
    TEAMS.forEach(t => {
      s[d][t.id] = {}
      CATEGORIES.forEach(c => { s[d][t.id][c.id] = 0 })
    })
  })
  return s
}

// Compute total for a team across all days + categories
export function teamTotal(scores, teamId) {
  let total = 0
  DAYS.forEach(d => {
    CATEGORIES.forEach(c => {
      total += Number(scores?.[d]?.[teamId]?.[c.id] || 0)
    })
  })
  return total
}

// Compute day total for a team
export function teamDayTotal(scores, teamId, day) {
  let total = 0
  CATEGORIES.forEach(c => {
    total += Number(scores?.[day]?.[teamId]?.[c.id] || 0)
  })
  return total
}

// Save scores to Firebase
export async function saveScores(scores) {
  await set(ref(db, 'scores'), scores)
}

// Subscribe to scores
export function subscribeScores(callback) {
  const r = ref(db, 'scores')
  return onValue(r, snap => {
    const val = snap.val()
    callback(val || emptyScores())
  })
}
