/// <reference types="vite/client" />
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics'
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY,
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID,
  measurementId: (import.meta as any).env.VITE_FIREBASE_MEASUREMENT_ID,
}

function hasValidConfig(config: typeof firebaseConfig) {
  return Boolean(
    config.apiKey &&
    config.authDomain &&
    config.projectId &&
    config.appId,
  )
}

// may be set to false if firebaseConfig is not properly set or need to skip firebase initialization
export const isFirebaseConfigured = (hasValidConfig(firebaseConfig) && true) // <-- Set to true if firebaseConfig is properly set

function initFirebaseApp(): FirebaseApp | undefined {
  if (!isFirebaseConfigured) return undefined
  if (getApps().length) {
    return getApp()
  }
  return initializeApp(firebaseConfig)
}

export const app = initFirebaseApp()
export const auth = app ? getAuth(app) : undefined
export const db = app ? getFirestore(app) : undefined
export const storage = app ? getStorage(app) : undefined
export const provider = auth ? new GoogleAuthProvider() : undefined

let analyticsInstance: Analytics | undefined
if (app && typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analyticsInstance = getAnalytics(app)
    }
  }).catch((err) => {
    console.warn('Firebase analytics not supported in this environment', err)
  })
}

export const analytics = analyticsInstance

if (provider) {
  provider.setCustomParameters({ prompt: 'select_account' })
}
