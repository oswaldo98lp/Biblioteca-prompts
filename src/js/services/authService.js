/**
 * Servicio de Autenticación para /admin
 * Restringe el acceso exclusivamente al correo configurado en VITE_ADMIN_EMAIL.
 */
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider, ADMIN_EMAIL, isFirebaseConfigured } from '../config/firebase.js';

const DEMO_AUTH_KEY = 'gemini_admin_demo_session';

export function isAuthorizedAdminEmail(email) {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL;
}

export async function loginWithGoogle() {
  if (isFirebaseConfigured && auth && googleProvider) {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  }
  throw new Error('FIREBASE_NOT_CONFIGURED');
}

export function loginLocalDemoMode(emailInput) {
  const email = (emailInput || '').trim().toLowerCase();
  const mockUser = {
    email,
    displayName: email === ADMIN_EMAIL ? 'Oswaldo Lucas (Modo Local)' : 'Usuario Invitado',
    isDemo: true,
  };
  sessionStorage.setItem(DEMO_AUTH_KEY, JSON.stringify(mockUser));
  return mockUser;
}

export async function logoutAdmin() {
  sessionStorage.removeItem(DEMO_AUTH_KEY);
  if (isFirebaseConfigured && auth) {
    await signOut(auth);
  }
}

export function subscribeToAuthChanges(callback) {
  if (isFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, (user) => {
      callback(user);
    });
  }

  // Modo demostración local si aún no se han colocado las llaves de Firebase en .env
  const raw = sessionStorage.getItem(DEMO_AUTH_KEY);
  const demoUser = raw ? JSON.parse(raw) : null;
  setTimeout(() => callback(demoUser), 0);
  return () => {};
}
