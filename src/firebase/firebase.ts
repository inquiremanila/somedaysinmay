import { getApp, getApps, initializeApp } from 'firebase/app';
import { browserLocalPersistence, getAuth, indexedDBLocalPersistence, initializeAuth } from 'firebase/auth';

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'somedaysinmay';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseConfigured = Object.values(firebaseConfig).every(
  (value) => typeof value === 'string' && value.trim().length > 0,
);

export const firebaseApp = firebaseConfigured
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

function persistentAuth() {
  if (!firebaseApp) return null;
  try {
    return initializeAuth(firebaseApp, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
    });
  } catch (error) {
    // Vite can reload this module after Firebase Auth has already initialized.
    if ((error as { code?: string }).code === 'auth/already-initialized') return getAuth(firebaseApp);
    throw error;
  }
}

// Both storage choices survive browser restarts. The application imposes no
// automatic sign-out timer; Firebase refreshes credentials while they are valid.
export const firebaseAuth = persistentAuth();
