/**
 * Controlador principal del Panel de Administrador (/admin)
 */
import { ADMIN_EMAIL, isFirebaseConfigured } from './config/firebase.js';
import {
  isAuthorizedAdminEmail,
  loginWithGoogle,
  loginLocalDemoMode,
  logoutAdmin,
  subscribeToAuthChanges,
} from './services/authService.js';
import { fetchAllPortalData } from './services/dbService.js';
import {
  renderLoginScreen,
  renderAccessDeniedScreen,
  renderAdminDashboard,
} from './ui/renderAdmin.js';

const adminState = {
  user: null,
  activeTab: 'prompts',
  editingItem: null,
  data: null,
};

function updateConnectionBadge() {
  const badge = document.getElementById('admin-connection-badge');
  if (!badge) return;
  if (isFirebaseConfigured) {
    badge.textContent = 'Firebase Conectado';
    badge.className = 'admin-mode-badge admin-mode-badge--firebase';
  } else {
    badge.textContent = 'Modo Seed / Local (.env pendiente)';
    badge.className = 'admin-mode-badge admin-mode-badge--local';
  }
}

async function refreshDataAndRender() {
  const root = document.getElementById('admin-main-root');
  const logoutBtn = document.getElementById('admin-logout-btn');
  if (!root) return;

  if (!adminState.user) {
    if (logoutBtn) logoutBtn.hidden = true;
    renderLoginScreen(root, {
      adminEmail: ADMIN_EMAIL,
      isFirebaseReady: isFirebaseConfigured,
      onGoogleLogin: async () => {
        try {
          await loginWithGoogle();
        } catch (err) {
          if (err.message === 'FIREBASE_NOT_CONFIGURED') {
            alert(
              'Para usar el popup de Google Auth en producción, agrega tus credenciales de Firebase en el archivo .env (mira el README.md). Mientras tanto puedes usar el botón "Probar" del modo local justo debajo.'
            );
          } else {
            alert(`Error al iniciar sesión: ${err.message}`);
          }
        }
      },
      onDemoLogin: (emailInput) => {
        adminState.user = loginLocalDemoMode(emailInput);
        refreshDataAndRender();
      },
    });
    return;
  }

  if (logoutBtn) logoutBtn.hidden = false;

  // Verificar si el correo coincide exactamente con VITE_ADMIN_EMAIL
  if (!isAuthorizedAdminEmail(adminState.user.email)) {
    renderAccessDeniedScreen(root, {
      userEmail: adminState.user.email,
      adminEmail: ADMIN_EMAIL,
      onLogout: async () => {
        await logoutAdmin();
        adminState.user = null;
        refreshDataAndRender();
      },
    });
    return;
  }

  adminState.data = await fetchAllPortalData({ includeDrafts: true });
  renderAdminDashboard(root, {
    state: adminState,
    onRefreshData: refreshDataAndRender,
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateConnectionBadge();

  const logoutBtn = document.getElementById('admin-logout-btn');
  logoutBtn?.addEventListener('click', async () => {
    await logoutAdmin();
    adminState.user = null;
    refreshDataAndRender();
  });

  const previewDialog = document.getElementById('admin-preview-dialog');
  const closePreviewBtn = document.getElementById('close-preview-dialog');
  closePreviewBtn?.addEventListener('click', () => previewDialog?.close());
  previewDialog?.addEventListener('click', (e) => {
    if (e.target === previewDialog) previewDialog.close();
  });

  subscribeToAuthChanges((user) => {
    adminState.user = user;
    refreshDataAndRender();
  });
});
