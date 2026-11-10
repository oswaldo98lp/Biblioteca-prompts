/**
 * Inicialización de Firebase (Authentication, Firestore, Cloud Storage)
 * Incluye detección automática de credenciales para funcionar con datos seed/localStorage
 * desde el primer segundo si aún no se ha configurado el archivo .env
 */
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Correo del único administrador permitido (definido en variable de entorno VITE_ADMIN_EMAIL)
export const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || 'oswaldo98lp@gmail.com').trim().toLowerCase();

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== 'TU_API_KEY'
);

let app = null;
let auth = null;
let db = null;
let storage = null;
let googleProvider = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  } catch (err) {
    console.warn('No se pudo inicializar Firebase, usando almacenamiento local con datos seed:', err);
  }
}

export { app, auth, db, storage, googleProvider };
