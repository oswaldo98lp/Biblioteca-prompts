/**
 * Interfaz del Panel de Administrador (/admin)
 * Soporta CRUD completo, reordenamiento, estado Borrador/Publicado y Vista Previa
 * para Prompts, Archivos (.pdf, .xlsx, .csv o enlace Drive), Enlaces, Tarjetas PARTS, Bloques y Configuración.
 */
import {
  escapeHtml,
  renderPromptCardHtml,
  renderFileCardHtml,
  renderLinkCardHtml,
  bindCopyPromptButtons,
} from './renderPublic.js';
import {
  saveCollectionItem,
  deleteCollectionItem,
  moveCollectionItemOrder,
  saveSiteSettings,
  resetOrSeedDatabase,
} from '../services/dbService.js';
import {
  uploadResourceFile,
  normalizeGoogleDriveLink,
} from '../services/storageService.js';
import { showToast } from './clipboard.js';

const STICKER_OPTIONS = [
  { label: 'Estrella 3D Multicolor', path: '/assets/Stickers/Gemini_Generated_Image_297rci297rci297r.png' },
  { label: 'Birrete Azul Universitario', path: '/assets/Stickers/Gemini_Generated_Image_2ldzud2ldzud2ldz.png' },
  { label: 'Laptop Plateada Gemini', path: '/assets/Stickers/Gemini_Generated_Image_ (8).png' },
  { label: 'Bombilla Voxel Multicolor', path: '/assets/Stickers/Gemini_Generated_Image_941lkv941lkv941l.png' },
  { label: 'Cohete Voxel', path: '/assets/Stickers/Gemini_Generated_Image_9rooq29rooq29roo.png' },
  { label: 'Globo Terráqueo Verde', path: '/assets/Stickers/Gemini_Generated_Image_ (10).png' },
  { label: 'Audífonos Voxel', path: '/assets/Stickers/Gemini_Generated_Image_ (2) (1).png' },
  { label: 'Smartphone Gemini Live', path: '/assets/Stickers/Gemini_Generated_Image_ (75).png' },
  { label: 'Megáfono Multicolor', path: '/assets/Stickers/Gemini_Generated_Image_ (7).png' },
  { label: 'Telescopio Cromado', path: '/assets/Stickers/Gemini_Generated_Image_q3tclbq3tclbq3tc.png' },
];

export function renderLoginScreen(root, { adminEmail, isFirebaseReady, onGoogleLogin, onDemoLogin }) {
  root.innerHTML = `
    <section class="auth-card" aria-labelledby="login-heading">
      <img
        src="/assets/Stickers/Gemini_Generated_Image_297rci297rci297r.png"
        alt=""
        width="72"
        height="72"
        style="margin: 0 auto;"
      />
      <h1 id="login-heading" class="auth-card__title">Acceso de Administrador</h1>
      <p style="color: var(--text-secondary); font-size: 0.94rem; margin-bottom: 24px;">
        Inicia sesión con la cuenta de Google autorizada (<code>${escapeHtml(
          adminEmail
        )}</code>) para agregar, editar o reordenar el contenido del taller.
      </p>

      <button type="button" id="btn-google-login" class="btn-pill-black" style="width: 100%; margin-bottom: 16px;">
        <span class="material-symbols-outlined" aria-hidden="true">account_circle</span>
        <span>Iniciar sesión con Google</span>
      </button>

      ${
        !isFirebaseReady
          ? `<div style="margin-top: 22px; padding-top: 20px; border-top: 1px solid var(--border-light); text-align: left;">
               <div style="font-size: 0.82rem; font-weight: 700; color: #B06000; margin-bottom: 8px;">
                 MODO DEMO LOCAL (Sin credenciales .env de Firebase aún)
               </div>
               <p style="font-size: 0.84rem; color: var(--text-secondary); margin-bottom: 12px;">
                 Ingresa un correo para probar la validación de <code>VITE_ADMIN_EMAIL</code>. Si ingresas <strong>${escapeHtml(
                   adminEmail
                 )}</strong> entrarás al panel; cualquier otro correo mostrará "Acceso denegado".
               </p>
               <form id="demo-login-form" style="display: flex; gap: 8px;">
                 <input
                   type="email"
                   id="demo-email-input"
                   value="${escapeHtml(adminEmail)}"
                   placeholder="correo@ejemplo.com"
                   required
                   style="flex: 1; padding: 9px 12px; border: 1px solid var(--border-medium); border-radius: var(--radius-sm);"
                 />
                 <button type="submit" class="btn-pill-blue">Probar</button>
               </form>
             </div>`
          : ''
      }
    </section>
  `;

  const googleBtn = root.querySelector('#btn-google-login');
  if (googleBtn) {
    googleBtn.addEventListener('click', onGoogleLogin);
  }

  const demoForm = root.querySelector('#demo-login-form');
  if (demoForm) {
    demoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = root.querySelector('#demo-email-input').value;
      onDemoLogin(val);
    });
  }
}

export function renderAccessDeniedScreen(root, { userEmail, adminEmail, onLogout }) {
  root.innerHTML = `
    <section class="auth-card auth-card--denied" aria-labelledby="denied-heading">
      <span class="material-symbols-outlined" aria-hidden="true" style="font-size: 3.4rem; color: var(--google-red);">
        gpp_bad
      </span>
      <h1 id="denied-heading" class="auth-card__title" style="color: var(--google-red);">
        Acceso denegado
      </h1>
      <p style="color: var(--text-primary); font-size: 0.96rem; margin-bottom: 12px;">
        La cuenta <strong>${escapeHtml(userEmail)}</strong> no tiene permisos de administrador en este portal.
      </p>
      <p style="color: var(--text-secondary); font-size: 0.88rem; margin-bottom: 26px;">
        Este panel está restringido exclusivamente al correo configurado en <code>ADMIN_EMAIL</code>.
      </p>
      <button type="button" id="denied-switch-account" class="btn-pill-black" style="width: 100%;">
        <span class="material-symbols-outlined" aria-hidden="true">switch_account</span>
        <span>Cambiar de cuenta</span>
      </button>
    </section>
  `;

  root.querySelector('#denied-switch-account')?.addEventListener('click', onLogout);
}

/**
 * Renderiza el Dashboard completo del Administrador con pestañas CRUD
 */
export function renderAdminDashboard(root, { state, onRefreshData }) {
  const tabs = [
    { id: 'prompts', label: 'Prompts', icon: 'terminal', count: state.data.prompts.length },
    { id: 'files', label: 'Archivos (PDF/Excel/CSV)', icon: 'folder_zip', count: state.data.files.length },
    { id: 'links', label: 'Enlaces', icon: 'link', count: state.data.links.length },
    { id: 'parts', label: 'Metodología PARTS', icon: 'extension', count: state.data.partsCards.length },
    { id: 'blocks', label: 'Bloques por Sección', icon: 'view_agenda', count: state.data.blocks.length },
    { id: 'faqs', label: 'FAQ', icon: 'help', count: state.data.faqs.length },
    { id: 'settings', label: 'Inicio y Práctica', icon: 'tune' },
  ];

  root.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:20px;flex-wrap:wrap;">
      <div>
        <h1 style="font-size:1.55rem;font-weight:800;color:var(--text-primary);">
          Bienvenido, ${escapeHtml(state.user.displayName || state.user.email)}
        </h1>
        <p style="font-size:0.9rem;color:var(--text-secondary);">
          Sesión activa como administrador único (<code>${escapeHtml(state.user.email)}</code>). Todos los cambios se reflejan en el portal.
        </p>
      </div>
      <button type="button" id="btn-seed-reset" class="btn-pill-outline" title="Restaurar o sincronizar los datos iniciales de ejemplo">
        <span class="material-symbols-outlined" aria-hidden="true" style="font-size:1.1rem">sync</span>
        <span>Restaurar / Sincronizar Seed Inicial</span>
      </button>
    </div>

    <div class="admin-tabs" role="tablist" aria-label="Secciones de administración">
      ${tabs
        .map(
          (t) => `
        <button
          type="button"
          role="tab"
          class="admin-tab-btn"
          data-admin-tab="${t.id}"
          aria-selected="${state.activeTab === t.id ? 'true' : 'false'}"
        >
          <span class="material-symbols-outlined" aria-hidden="true" style="font-size:1.15rem">${t.icon}</span>
          <span>${escapeHtml(t.label)}</span>
          ${t.count !== undefined ? `<span style="opacity:0.75;">(${t.count})</span>` : ''}
        </button>
      `
        )
        .join('')}
    </div>

    <div id="admin-tab-panel"></div>
  `;

  root.querySelectorAll('[data-admin-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.activeTab = btn.getAttribute('data-admin-tab');
      state.editingItem = null;
      renderAdminDashboard(root, { state, onRefreshData });
    });
  });

  root.querySelector('#btn-seed-reset')?.addEventListener('click', async () => {
    if (confirm('¿Deseas restaurar y sincronizar los datos de ejemplo iniciales (seed)?')) {
      await resetOrSeedDatabase();
      showToast('Datos iniciales sincronizados correctamente.');
      await onRefreshData();
    }
  });

  const panel = root.querySelector('#admin-tab-panel');
  switch (state.activeTab) {
    case 'prompts':
      renderPromptsAdminTab(panel, state, onRefreshData);
      break;
    case 'files':
      renderFilesAdminTab(panel, state, onRefreshData);
      break;
    case 'links':
      renderLinksAdminTab(panel, state, onRefreshData);
      break;
    case 'parts':
      renderPartsAdminTab(panel, state, onRefreshData);
      break;
    case 'blocks':
      renderBlocksAdminTab(panel, state, onRefreshData);
      break;
    case 'faqs':
      renderFaqsAdminTab(panel, state, onRefreshData);
      break;
    case 'settings':
      renderSettingsAdminTab(panel, state, onRefreshData);
      break;
  }
}

/* ==========================================================================
   MODAL DE VISTA PREVIA
   ========================================================================== */
function openPreviewModal(title, htmlContent) {
  const dialog = document.getElementById('admin-preview-dialog');
  const titleEl = document.getElementById('preview-dialog-title');
  const bodyEl = document.getElementById('admin-preview-body');
  if (!dialog || !bodyEl) return;

  if (titleEl) titleEl.textContent = title;
  bodyEl.innerHTML = htmlContent;
  bindCopyPromptButtons(bodyEl);
  dialog.showModal();
}

/* ==========================================================================
   1. GESTIÓN DE PROMPTS
   ========================================================================== */
function renderPromptsAdminTab(panel, state, onRefreshData) {
  const editing = state.editingItem || {};
  const tagsStr = Array.isArray(editing.tags) ? editing.tags.join(', ') : editing.tags || '';

  panel.innerHTML = `
    <section class="admin-panel-card">
      <div class="admin-panel-card__header">
        <h2 style="font-size:1.2rem;font-weight:800;">
          ${editing.id ? 'Editar Prompt' : 'Agregar Nuevo Prompt'}
        </h2>
        ${
          editing.id
            ? `<button type="button" id="cancel-edit-btn" class="btn-pill-outline">Cancelar edición</button>`
            : ''
        }
      </div>

      <form id="prompt-admin-form">
        <div class="admin-form-grid">
          <div class="form-field">
            <label for="p-title">Título del Prompt *</label>
            <input type="text" id="p-title" required value="${escapeHtml(editing.title || '')}" placeholder="Ej. Dashboard Interactivo desde CSV" />
          </div>

          <div class="form-field">
            <label for="p-category">Categoría / Sección *</label>
            <select id="p-category" required>
              <option value="parts" ${editing.category === 'parts' ? 'selected' : ''}>Metodología PARTS</option>
              <option value="apps-conectadas" ${editing.category === 'apps-conectadas' ? 'selected' : ''}>Apps conectadas (@)</option>
              <option value="notebooklm" ${editing.category === 'notebooklm' ? 'selected' : ''}>NotebookLM</option>
              <option value="canvas" ${editing.category === 'canvas' ? 'selected' : ''}>Canvas</option>
              <option value="canvas-db" ${editing.category === 'canvas-db' ? 'selected' : ''}>Canvas + Base de datos</option>
              <option value="gemini-live" ${editing.category === 'gemini-live' ? 'selected' : ''}>Gemini Live</option>
            </select>
          </div>

          <div class="form-field">
            <label for="p-tags">Etiquetas (separadas por coma)</label>
            <input type="text" id="p-tags" value="${escapeHtml(tagsStr)}" placeholder="PARTS, CSV, Dashboard, Examen" />
          </div>

          <div class="form-field">
            <label for="p-file">¿Qué archivo usar con este prompt? (Opcional)</label>
            <input type="text" id="p-file" value="${escapeHtml(editing.recommendedFile || '')}" placeholder="Ej. dataset-proyectos-universitarios.csv" />
          </div>

          <div class="form-field form-field--full">
            <label for="p-text">Texto del Prompt (multilínea) *</label>
            <textarea id="p-text" rows="6" required placeholder="[PERSONA]: Actúa como...">${escapeHtml(
              editing.promptText || ''
            )}</textarea>
          </div>

          <div class="form-field">
            <label for="p-status">Estado de publicación</label>
            <select id="p-status">
              <option value="true" ${editing.published !== false ? 'selected' : ''}>Publicado (Visible al público)</option>
              <option value="false" ${editing.published === false ? 'selected' : ''}>Borrador (Oculto)</option>
            </select>
          </div>
        </div>

        <div style="display:flex;gap:12px;flex-wrap:wrap;">
          <button type="submit" class="btn-pill-blue">
            <span class="material-symbols-outlined" aria-hidden="true">save</span>
            <span>${editing.id ? 'Guardar Cambios' : 'Crear Prompt'}</span>
          </button>
          <button type="button" id="preview-prompt-btn" class="btn-pill-outline">
            <span class="material-symbols-outlined" aria-hidden="true">visibility</span>
            <span>Vista Previa antes de publicar</span>
          </button>
        </div>
      </form>
    </section>

    <section class="admin-panel-card">
      <div class="admin-panel-card__header">
        <h2 style="font-size:1.15rem;font-weight:800;">Prompts Registrados (${state.data.prompts.length})</h2>
      </div>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Orden</th>
              <th>Título</th>
              <th>Categoría</th>
              <th>Archivo sugerido</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${state.data.prompts
              .map(
                (p, idx) => `
              <tr>
                <td>#${idx + 1}</td>
                <td><strong>${escapeHtml(p.title)}</strong></td>
                <td>${escapeHtml(p.category)}</td>
                <td>${escapeHtml(p.recommendedFile || '—')}</td>
                <td>
                  <span class="status-badge ${
                    p.published !== false ? 'status-badge--published' : 'status-badge--draft'
                  }">
                    ${p.published !== false ? 'Publicado' : 'Borrador'}
                  </span>
                </td>
                <td>
                  <div class="action-btns">
                    <button type="button" class="icon-btn" data-move-up="${escapeHtml(p.id)}" title="Subir posición" aria-label="Subir posición">
                      <span class="material-symbols-outlined" aria-hidden="true">arrow_upward</span>
                    </button>
                    <button type="button" class="icon-btn" data-move-down="${escapeHtml(p.id)}" title="Bajar posición" aria-label="Bajar posición">
                      <span class="material-symbols-outlined" aria-hidden="true">arrow_downward</span>
                    </button>
                    <button type="button" class="icon-btn" data-preview-item="${escapeHtml(p.id)}" title="Vista previa" aria-label="Vista previa">
                      <span class="material-symbols-outlined" aria-hidden="true">visibility</span>
                    </button>
                    <button type="button" class="icon-btn" data-toggle-pub="${escapeHtml(p.id)}" title="Publicar/Ocultar" aria-label="Cambiar estado de publicación">
                      <span class="material-symbols-outlined" aria-hidden="true">${
                        p.published !== false ? 'visibility_off' : 'publish'
                      }</span>
                    </button>
                    <button type="button" class="icon-btn" data-edit-item="${escapeHtml(p.id)}" title="Editar" aria-label="Editar">
                      <span class="material-symbols-outlined" aria-hidden="true">edit</span>
                    </button>
                    <button type="button" class="icon-btn icon-btn--danger" data-delete-item="${escapeHtml(p.id)}" title="Eliminar" aria-label="Eliminar">
                      <span class="material-symbols-outlined" aria-hidden="true">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;

  const getDraftFromForm = () => ({
    id: editing.id || `prompt-${Date.now()}`,
    title: panel.querySelector('#p-title').value.trim(),
    category: panel.querySelector('#p-category').value,
    tags: panel
      .querySelector('#p-tags')
      .value.split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    recommendedFile: panel.querySelector('#p-file').value.trim(),
    promptText: panel.querySelector('#p-text').value,
    published: panel.querySelector('#p-status').value === 'true',
    order: editing.order ?? state.data.prompts.length + 1,
  });

  panel.querySelector('#cancel-edit-btn')?.addEventListener('click', () => {
    state.editingItem = null;
    renderPromptsAdminTab(panel, state, onRefreshData);
  });

  panel.querySelector('#preview-prompt-btn')?.addEventListener('click', () => {
    const draft = getDraftFromForm();
    openPreviewModal('Vista Previa del Prompt', renderPromptCardHtml(draft));
  });

  panel.querySelector('#prompt-admin-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const item = getDraftFromForm();
    await saveCollectionItem('prompts', item);
    state.editingItem = null;
    showToast('Prompt guardado correctamente.');
    await onRefreshData();
  });

  bindCollectionTableActions(panel, 'prompts', state.data.prompts, state, onRefreshData, (item) =>
    openPreviewModal(`Vista Previa: ${item.title}`, renderPromptCardHtml(item))
  );
}

/* ==========================================================================
   2. GESTIÓN DE ARCHIVOS (.PDF, .XLSX, .CSV) + ALTERNATIVA GOOGLE DRIVE
   ========================================================================== */
function renderFilesAdminTab(panel, state, onRefreshData) {
  const editing = state.editingItem || {};
  let uploadedFileMeta = null;

  panel.innerHTML = `
    <section class="admin-panel-card">
      <div class="admin-panel-card__header">
        <h2 style="font-size:1.2rem;font-weight:800;">
          ${editing.id ? 'Editar Recurso Descargable' : 'Subir o Vincular Archivo (.PDF, .XLSX, .CSV)'}
        </h2>
        ${
          editing.id
            ? `<button type="button" id="cancel-file-edit" class="btn-pill-outline">Cancelar edición</button>`
            : ''
        }
      </div>

      <form id="file-admin-form">
        <!-- Opción A: Drag & Drop desde el navegador -->
        <div class="dropzone" id="file-dropzone" tabindex="0" role="button" aria-label="Arrastra y suelta un archivo PDF, XLSX o CSV o haz clic para seleccionarlo">
          <span class="material-symbols-outlined" aria-hidden="true" style="font-size:2.4rem;color:var(--google-blue)">cloud_upload</span>
          <p style="font-weight:700;margin-top:6px;">
            Arrastra y suelta aquí tu archivo (.PDF, .XLSX, .CSV · máx. 10 MB)
          </p>
          <p style="font-size:0.85rem;color:var(--text-secondary);" id="dropzone-status-text">
            O haz clic para explorar en tu computadora. También puedes pegar un enlace de Google Drive abajo si no usas Cloud Storage.
          </p>
          <input type="file" id="file-input-hidden" accept=".pdf,.xlsx,.csv" hidden />
        </div>

        <div class="admin-form-grid" style="margin-top:20px;">
          <div class="form-field">
            <label for="f-title">Título del Archivo *</label>
            <input type="text" id="f-title" required value="${escapeHtml(editing.title || '')}" placeholder="Ej. Dataset Proyectos Universitarios" />
          </div>

          <div class="form-field">
            <label for="f-category">Categoría *</label>
            <select id="f-category" required>
              <option value="canvas-db" ${editing.category === 'canvas-db' ? 'selected' : ''}>Canvas + Base de datos</option>
              <option value="notebooklm" ${editing.category === 'notebooklm' ? 'selected' : ''}>NotebookLM</option>
              <option value="canvas" ${editing.category === 'canvas' ? 'selected' : ''}>Canvas</option>
              <option value="gemini-live" ${editing.category === 'gemini-live' ? 'selected' : ''}>Gemini Live</option>
              <option value="parts" ${editing.category === 'parts' ? 'selected' : ''}>Metodología PARTS</option>
            </select>
          </div>

          <div class="form-field">
            <label for="f-type">Formato de archivo *</label>
            <select id="f-type" required>
              <option value="CSV" ${editing.fileType === 'CSV' ? 'selected' : ''}>CSV</option>
              <option value="XLSX" ${editing.fileType === 'XLSX' ? 'selected' : ''}>XLSX (Excel)</option>
              <option value="PDF" ${editing.fileType === 'PDF' ? 'selected' : ''}>PDF</option>
            </select>
          </div>

          <div class="form-field">
            <label for="f-size">Tamaño del archivo</label>
            <input type="text" id="f-size" value="${escapeHtml(editing.fileSize || '2.0 KB')}" placeholder="Ej. 1.8 MB" />
          </div>

          <div class="form-field form-field--full">
            <label for="f-url">URL del Archivo o Enlace de Google Drive (Cualquiera con el enlace) *</label>
            <input type="text" id="f-url" required value="${escapeHtml(editing.url || '')}" placeholder="Se llena al subir archivo o pega aquí https://drive.google.com/file/d/..." />
          </div>

          <div class="form-field form-field--full">
            <label for="f-desc">Descripción para el estudiante *</label>
            <textarea id="f-desc" rows="3" required placeholder="Explica cómo usar este archivo en Gemini...">${escapeHtml(
              editing.description || ''
            )}</textarea>
          </div>

          <div class="form-field">
            <label for="f-status">Estado</label>
            <select id="f-status">
              <option value="true" ${editing.published !== false ? 'selected' : ''}>Publicado</option>
              <option value="false" ${editing.published === false ? 'selected' : ''}>Borrador</option>
            </select>
          </div>
        </div>

        <div style="display:flex;gap:12px;flex-wrap:wrap;">
          <button type="submit" class="btn-pill-blue">
            <span class="material-symbols-outlined" aria-hidden="true">save</span>
            <span>${editing.id ? 'Actualizar Recurso' : 'Guardar Recurso'}</span>
          </button>
          <button type="button" id="preview-file-btn" class="btn-pill-outline">
            <span class="material-symbols-outlined" aria-hidden="true">visibility</span>
            <span>Vista Previa</span>
          </button>
        </div>
      </form>
    </section>

    <section class="admin-panel-card">
      <h2 style="font-size:1.15rem;font-weight:800;margin-bottom:16px;">Archivos Disponibles (${state.data.files.length})</h2>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Orden</th>
              <th>Título</th>
              <th>Tipo / Tamaño</th>
              <th>Categoría</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${state.data.files
              .map(
                (f, idx) => `
              <tr>
                <td>#${idx + 1}</td>
                <td><strong>${escapeHtml(f.title)}</strong></td>
                <td>${escapeHtml(f.fileType)} · ${escapeHtml(f.fileSize)}</td>
                <td>${escapeHtml(f.category)}</td>
                <td>
                  <span class="status-badge ${
                    f.published !== false ? 'status-badge--published' : 'status-badge--draft'
                  }">
                    ${f.published !== false ? 'Publicado' : 'Borrador'}
                  </span>
                </td>
                <td>
                  <div class="action-btns">
                    <button type="button" class="icon-btn" data-move-up="${escapeHtml(f.id)}" title="Subir"><span class="material-symbols-outlined">arrow_upward</span></button>
                    <button type="button" class="icon-btn" data-move-down="${escapeHtml(f.id)}" title="Bajar"><span class="material-symbols-outlined">arrow_downward</span></button>
                    <button type="button" class="icon-btn" data-preview-item="${escapeHtml(f.id)}" title="Vista previa"><span class="material-symbols-outlined">visibility</span></button>
                    <button type="button" class="icon-btn" data-toggle-pub="${escapeHtml(f.id)}" title="Publicar/Ocultar"><span class="material-symbols-outlined">${
                  f.published !== false ? 'visibility_off' : 'publish'
                }</span></button>
                    <button type="button" class="icon-btn" data-edit-item="${escapeHtml(f.id)}" title="Editar"><span class="material-symbols-outlined">edit</span></button>
                    <button type="button" class="icon-btn icon-btn--danger" data-delete-item="${escapeHtml(f.id)}" title="Eliminar"><span class="material-symbols-outlined">delete</span></button>
                  </div>
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;

  // Configurar Drag & Drop
  const dropzone = panel.querySelector('#file-dropzone');
  const fileInput = panel.querySelector('#file-input-hidden');
  const statusText = panel.querySelector('#dropzone-status-text');

  const handleSelectedFile = async (file) => {
    try {
      statusText.textContent = `Procesando "${file.name}"...`;
      uploadedFileMeta = await uploadResourceFile(file);
      panel.querySelector('#f-url').value = uploadedFileMeta.url;
      panel.querySelector('#f-type').value = uploadedFileMeta.fileType;
      panel.querySelector('#f-size').value = uploadedFileMeta.fileSize;
      if (!panel.querySelector('#f-title').value) {
        panel.querySelector('#f-title').value = file.name.replace(/\.[^/.]+$/, '');
      }
      statusText.textContent = `¡Listo! Archivo "${file.name}" (${uploadedFileMeta.fileSize}) cargado.`;
      showToast(`Archivo ${file.name} preparado correctamente.`);
    } catch (err) {
      alert(err.message);
      statusText.textContent = err.message;
    }
  };

  dropzone?.addEventListener('click', () => fileInput?.click());
  dropzone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('is-dragover');
  });
  dropzone?.addEventListener('dragleave', () => dropzone.classList.remove('is-dragover'));
  dropzone?.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('is-dragover');
    if (e.dataTransfer.files?.length) {
      handleSelectedFile(e.dataTransfer.files[0]);
    }
  });
  fileInput?.addEventListener('change', (e) => {
    if (e.target.files?.length) {
      handleSelectedFile(e.target.files[0]);
    }
  });

  const getDraftFile = () => ({
    id: editing.id || `file-${Date.now()}`,
    title: panel.querySelector('#f-title').value.trim(),
    category: panel.querySelector('#f-category').value,
    fileType: panel.querySelector('#f-type').value,
    fileSize: panel.querySelector('#f-size').value.trim(),
    url: normalizeGoogleDriveLink(panel.querySelector('#f-url').value),
    fileName: uploadedFileMeta?.fileName || editing.fileName || panel.querySelector('#f-title').value.trim(),
    description: panel.querySelector('#f-desc').value.trim(),
    published: panel.querySelector('#f-status').value === 'true',
    order: editing.order ?? state.data.files.length + 1,
  });

  panel.querySelector('#cancel-file-edit')?.addEventListener('click', () => {
    state.editingItem = null;
    renderFilesAdminTab(panel, state, onRefreshData);
  });

  panel.querySelector('#preview-file-btn')?.addEventListener('click', () => {
    openPreviewModal('Vista Previa del Recurso Descargable', renderFileCardHtml(getDraftFile()));
  });

  panel.querySelector('#file-admin-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveCollectionItem('files', getDraftFile());
    state.editingItem = null;
    showToast('Recurso descargable guardado.');
    await onRefreshData();
  });

  bindCollectionTableActions(panel, 'files', state.data.files, state, onRefreshData, (item) =>
    openPreviewModal(`Vista Previa: ${item.title}`, renderFileCardHtml(item))
  );
}

/* ==========================================================================
   3. GESTIÓN DE ENLACES
   ========================================================================== */
function renderLinksAdminTab(panel, state, onRefreshData) {
  const editing = state.editingItem || {};

  panel.innerHTML = `
    <section class="admin-panel-card">
      <div class="admin-panel-card__header">
        <h2 style="font-size:1.2rem;font-weight:800;">
          ${editing.id ? 'Editar Enlace' : 'Nuevo Enlace Externo'}
        </h2>
        ${
          editing.id
            ? `<button type="button" id="cancel-link-edit" class="btn-pill-outline">Cancelar</button>`
            : ''
        }
      </div>
      <form id="link-admin-form">
        <div class="admin-form-grid">
          <div class="form-field">
            <label for="l-title">Título *</label>
            <input type="text" id="l-title" required value="${escapeHtml(editing.title || '')}" placeholder="Ej. Google NotebookLM" />
          </div>
          <div class="form-field">
            <label for="l-url">URL *</label>
            <input type="url" id="l-url" required value="${escapeHtml(editing.url || '')}" placeholder="https://..." />
          </div>
          <div class="form-field">
            <label for="l-cat">Categoría *</label>
            <select id="l-cat">
              <option value="inicio" ${editing.category === 'inicio' ? 'selected' : ''}>Inicio</option>
              <option value="notebooklm" ${editing.category === 'notebooklm' ? 'selected' : ''}>NotebookLM</option>
              <option value="canvas" ${editing.category === 'canvas' ? 'selected' : ''}>Canvas</option>
              <option value="canvas-db" ${editing.category === 'canvas-db' ? 'selected' : ''}>Canvas + Base de datos</option>
              <option value="gemini-live" ${editing.category === 'gemini-live' ? 'selected' : ''}>Gemini Live</option>
            </select>
          </div>
          <div class="form-field">
            <label for="l-status">Estado</label>
            <select id="l-status">
              <option value="true" ${editing.published !== false ? 'selected' : ''}>Publicado</option>
              <option value="false" ${editing.published === false ? 'selected' : ''}>Borrador</option>
            </select>
          </div>
          <div class="form-field form-field--full">
            <label for="l-desc">Descripción *</label>
            <textarea id="l-desc" rows="2" required>${escapeHtml(editing.description || '')}</textarea>
          </div>
        </div>
        <div style="display:flex;gap:12px;">
          <button type="submit" class="btn-pill-blue">Guardar Enlace</button>
          <button type="button" id="preview-link-btn" class="btn-pill-outline">Vista Previa</button>
        </div>
      </form>
    </section>

    <section class="admin-panel-card">
      <h2 style="font-size:1.15rem;font-weight:800;margin-bottom:16px;">Enlaces (${state.data.links.length})</h2>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Orden</th>
              <th>Título</th>
              <th>URL</th>
              <th>Categoría</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${state.data.links
              .map(
                (l, idx) => `
              <tr>
                <td>#${idx + 1}</td>
                <td><strong>${escapeHtml(l.title)}</strong></td>
                <td><a href="${escapeHtml(l.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(l.url)}</a></td>
                <td>${escapeHtml(l.category)}</td>
                <td><span class="status-badge ${l.published !== false ? 'status-badge--published' : 'status-badge--draft'}">${l.published !== false ? 'Publicado' : 'Borrador'}</span></td>
                <td>
                  <div class="action-btns">
                    <button type="button" class="icon-btn" data-move-up="${escapeHtml(l.id)}"><span class="material-symbols-outlined">arrow_upward</span></button>
                    <button type="button" class="icon-btn" data-move-down="${escapeHtml(l.id)}"><span class="material-symbols-outlined">arrow_downward</span></button>
                    <button type="button" class="icon-btn" data-preview-item="${escapeHtml(l.id)}"><span class="material-symbols-outlined">visibility</span></button>
                    <button type="button" class="icon-btn" data-toggle-pub="${escapeHtml(l.id)}"><span class="material-symbols-outlined">${l.published !== false ? 'visibility_off' : 'publish'}</span></button>
                    <button type="button" class="icon-btn" data-edit-item="${escapeHtml(l.id)}"><span class="material-symbols-outlined">edit</span></button>
                    <button type="button" class="icon-btn icon-btn--danger" data-delete-item="${escapeHtml(l.id)}"><span class="material-symbols-outlined">delete</span></button>
                  </div>
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;

  const getDraft = () => ({
    id: editing.id || `link-${Date.now()}`,
    title: panel.querySelector('#l-title').value.trim(),
    url: panel.querySelector('#l-url').value.trim(),
    category: panel.querySelector('#l-cat').value,
    description: panel.querySelector('#l-desc').value.trim(),
    published: panel.querySelector('#l-status').value === 'true',
    order: editing.order ?? state.data.links.length + 1,
  });

  panel.querySelector('#cancel-link-edit')?.addEventListener('click', () => {
    state.editingItem = null;
    renderLinksAdminTab(panel, state, onRefreshData);
  });

  panel.querySelector('#preview-link-btn')?.addEventListener('click', () => {
    openPreviewModal('Vista Previa del Enlace', renderLinkCardHtml(getDraft()));
  });

  panel.querySelector('#link-admin-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveCollectionItem('links', getDraft());
    state.editingItem = null;
    showToast('Enlace guardado.');
    await onRefreshData();
  });

  bindCollectionTableActions(panel, 'links', state.data.links, state, onRefreshData, (item) =>
    openPreviewModal(`Vista Previa: ${item.title}`, renderLinkCardHtml(item))
  );
}

/* ==========================================================================
   4. GESTIÓN DE METODOLOGÍA PARTS (TARJETAS P-A-R-T-S)
   ========================================================================== */
function renderPartsAdminTab(panel, state, onRefreshData) {
  const editing = state.editingItem || {};

  panel.innerHTML = `
    <section class="admin-panel-card">
      <div class="admin-panel-card__header">
        <h2 style="font-size:1.2rem;font-weight:800;">
          ${editing.id ? `Editar Tarjeta PARTS (${editing.letter})` : 'Agregar / Editar Tarjeta de Metodología PARTS'}
        </h2>
        ${
          editing.id
            ? `<button type="button" id="cancel-parts-edit" class="btn-pill-outline">Cancelar</button>`
            : ''
        }
      </div>

      <form id="parts-admin-form">
        <div class="admin-form-grid">
          <div class="form-field">
            <label for="parts-letter">Letra *</label>
            <input type="text" id="parts-letter" maxlength="2" required value="${escapeHtml(editing.letter || 'P')}" />
          </div>
          <div class="form-field">
            <label for="parts-title">Concepto (Título en Azul) *</label>
            <input type="text" id="parts-title" required value="${escapeHtml(editing.title || '')}" placeholder="PERSONA / ACCIÓN / RESULTADO / TONO / SOPORTE" />
          </div>
          <div class="form-field">
            <label for="parts-icon">Ícono Material Symbols</label>
            <input type="text" id="parts-icon" value="${escapeHtml(editing.icon || 'person_add')}" placeholder="person_add, track_changes, burst_mode, groups, checklist" />
          </div>
          <div class="form-field">
            <label for="parts-sub">Pregunta / Subtítulo en negritas *</label>
            <input type="text" id="parts-sub" required value="${escapeHtml(editing.subtitle || '')}" />
          </div>
          <div class="form-field form-field--full">
            <label for="parts-desc">Explicación detallada *</label>
            <textarea id="parts-desc" rows="2" required>${escapeHtml(editing.description || '')}</textarea>
          </div>
          <div class="form-field form-field--full">
            <label for="parts-ex">Ejemplo práctico para mostrar en la tarjeta</label>
            <textarea id="parts-ex" rows="2">${escapeHtml(editing.example || '')}</textarea>
          </div>
        </div>
        <button type="submit" class="btn-pill-blue">Guardar Tarjeta PARTS</button>
      </form>
    </section>

    <section class="admin-panel-card">
      <h2 style="font-size:1.15rem;font-weight:800;margin-bottom:16px;">Tarjetas de la Metodología PARTS (${state.data.partsCards.length})</h2>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Letra</th>
              <th>Título</th>
              <th>Subtítulo</th>
              <th>Explicación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${state.data.partsCards
              .map(
                (c) => `
              <tr>
                <td><strong>${escapeHtml(c.letter)}</strong></td>
                <td><strong style="color:var(--google-blue)">${escapeHtml(c.title)}</strong></td>
                <td>${escapeHtml(c.subtitle)}</td>
                <td>${escapeHtml(c.description)}</td>
                <td>
                  <div class="action-btns">
                    <button type="button" class="icon-btn" data-move-up="${escapeHtml(c.id)}"><span class="material-symbols-outlined">arrow_upward</span></button>
                    <button type="button" class="icon-btn" data-move-down="${escapeHtml(c.id)}"><span class="material-symbols-outlined">arrow_downward</span></button>
                    <button type="button" class="icon-btn" data-edit-item="${escapeHtml(c.id)}"><span class="material-symbols-outlined">edit</span></button>
                    <button type="button" class="icon-btn icon-btn--danger" data-delete-item="${escapeHtml(c.id)}"><span class="material-symbols-outlined">delete</span></button>
                  </div>
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;

  panel.querySelector('#cancel-parts-edit')?.addEventListener('click', () => {
    state.editingItem = null;
    renderPartsAdminTab(panel, state, onRefreshData);
  });

  panel.querySelector('#parts-admin-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const item = {
      id: editing.id || `parts-${Date.now()}`,
      letter: panel.querySelector('#parts-letter').value.trim().toUpperCase(),
      title: panel.querySelector('#parts-title').value.trim().toUpperCase(),
      icon: panel.querySelector('#parts-icon').value.trim() || 'auto_awesome',
      subtitle: panel.querySelector('#parts-sub').value.trim(),
      description: panel.querySelector('#parts-desc').value.trim(),
      example: panel.querySelector('#parts-ex').value.trim(),
      published: true,
      order: editing.order ?? state.data.partsCards.length + 1,
    };
    await saveCollectionItem('partsCards', item);
    state.editingItem = null;
    showToast('Tarjeta PARTS actualizada.');
    await onRefreshData();
  });

  bindCollectionTableActions(panel, 'partsCards', state.data.partsCards, state, onRefreshData);
}

/* ==========================================================================
   5. GESTIÓN DE BLOQUES DE TEXTO POR SECCIÓN (CATEGORÍAS 4 A 7)
   ========================================================================== */
function renderBlocksAdminTab(panel, state, onRefreshData) {
  const editing = state.editingItem || {};

  panel.innerHTML = `
    <section class="admin-panel-card">
      <div class="admin-panel-card__header">
        <h2 style="font-size:1.2rem;font-weight:800;">
          ${editing.id ? 'Editar Bloque de Contenido' : 'Agregar Bloque de Contenido a una Sección'}
        </h2>
        ${
          editing.id
            ? `<button type="button" id="cancel-block-edit" class="btn-pill-outline">Cancelar</button>`
            : ''
        }
      </div>

      <form id="block-admin-form">
        <div class="admin-form-grid">
          <div class="form-field">
            <label for="b-sec">Sección destino *</label>
            <select id="b-sec" required>
              <option value="apps-conectadas" ${editing.section === 'apps-conectadas' ? 'selected' : ''}>Apps conectadas (@)</option>
              <option value="notebooklm" ${editing.section === 'notebooklm' ? 'selected' : ''}>NotebookLM</option>
              <option value="canvas" ${editing.section === 'canvas' ? 'selected' : ''}>Canvas</option>
              <option value="canvas-db" ${editing.section === 'canvas-db' ? 'selected' : ''}>Canvas + Base de datos</option>
              <option value="gemini-live" ${editing.section === 'gemini-live' ? 'selected' : ''}>Gemini Live</option>
            </select>
          </div>
          <div class="form-field">
            <label for="b-title">Título del Bloque *</label>
            <input type="text" id="b-title" required value="${escapeHtml(editing.title || '')}" />
          </div>
          <div class="form-field">
            <label for="b-sticker">Sticker de /assets (Opcional)</label>
            <select id="b-sticker">
              <option value="">Sin sticker</option>
              ${STICKER_OPTIONS.map(
                (st) =>
                  `<option value="${escapeHtml(st.path)}" ${
                    editing.sticker === st.path ? 'selected' : ''
                  }>${escapeHtml(st.label)}</option>`
              ).join('')}
            </select>
          </div>
          <div class="form-field">
            <label for="b-status">Estado</label>
            <select id="b-status">
              <option value="true" ${editing.published !== false ? 'selected' : ''}>Publicado</option>
              <option value="false" ${editing.published === false ? 'selected' : ''}>Borrador</option>
            </select>
          </div>
          <div class="form-field form-field--full">
            <label for="b-content">Contenido explicativo / pasos *</label>
            <textarea id="b-content" rows="4" required>${escapeHtml(editing.content || '')}</textarea>
          </div>
        </div>
        <button type="submit" class="btn-pill-blue">Guardar Bloque</button>
      </form>
    </section>

    <section class="admin-panel-card">
      <h2 style="font-size:1.15rem;font-weight:800;margin-bottom:16px;">Bloques por Sección (${state.data.blocks.length})</h2>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Sección</th>
              <th>Título</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${state.data.blocks
              .map(
                (b) => `
              <tr>
                <td><strong>${escapeHtml(b.section)}</strong></td>
                <td>${escapeHtml(b.title)}</td>
                <td><span class="status-badge ${b.published !== false ? 'status-badge--published' : 'status-badge--draft'}">${b.published !== false ? 'Publicado' : 'Borrador'}</span></td>
                <td>
                  <div class="action-btns">
                    <button type="button" class="icon-btn" data-move-up="${escapeHtml(b.id)}"><span class="material-symbols-outlined">arrow_upward</span></button>
                    <button type="button" class="icon-btn" data-move-down="${escapeHtml(b.id)}"><span class="material-symbols-outlined">arrow_downward</span></button>
                    <button type="button" class="icon-btn" data-toggle-pub="${escapeHtml(b.id)}"><span class="material-symbols-outlined">${b.published !== false ? 'visibility_off' : 'publish'}</span></button>
                    <button type="button" class="icon-btn" data-edit-item="${escapeHtml(b.id)}"><span class="material-symbols-outlined">edit</span></button>
                    <button type="button" class="icon-btn icon-btn--danger" data-delete-item="${escapeHtml(b.id)}"><span class="material-symbols-outlined">delete</span></button>
                  </div>
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;

  panel.querySelector('#cancel-block-edit')?.addEventListener('click', () => {
    state.editingItem = null;
    renderBlocksAdminTab(panel, state, onRefreshData);
  });

  panel.querySelector('#block-admin-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const item = {
      id: editing.id || `block-${Date.now()}`,
      section: panel.querySelector('#b-sec').value,
      title: panel.querySelector('#b-title').value.trim(),
      sticker: panel.querySelector('#b-sticker').value,
      content: panel.querySelector('#b-content').value.trim(),
      published: panel.querySelector('#b-status').value === 'true',
      order: editing.order ?? state.data.blocks.length + 1,
    };
    await saveCollectionItem('blocks', item);
    state.editingItem = null;
    showToast('Bloque guardado.');
    await onRefreshData();
  });

  bindCollectionTableActions(panel, 'blocks', state.data.blocks, state, onRefreshData);
}

/* ==========================================================================
   6. GESTIÓN DE PREGUNTAS FRECUENTES (FAQ)
   ========================================================================== */
function renderFaqsAdminTab(panel, state, onRefreshData) {
  const editing = state.editingItem || {};

  panel.innerHTML = `
    <section class="admin-panel-card">
      <div class="admin-panel-card__header">
        <h2 style="font-size:1.2rem;font-weight:800;">
          ${editing.id ? 'Editar Pregunta Frecuente' : 'Nueva Pregunta Frecuente'}
        </h2>
      </div>
      <form id="faq-admin-form">
        <div class="admin-form-grid">
          <div class="form-field form-field--full">
            <label for="faq-q">Pregunta *</label>
            <input type="text" id="faq-q" required value="${escapeHtml(editing.question || '')}" />
          </div>
          <div class="form-field form-field--full">
            <label for="faq-a">Respuesta *</label>
            <textarea id="faq-a" rows="3" required>${escapeHtml(editing.answer || '')}</textarea>
          </div>
        </div>
        <button type="submit" class="btn-pill-blue">Guardar FAQ</button>
      </form>
    </section>

    <section class="admin-panel-card">
      <h2 style="font-size:1.15rem;font-weight:800;margin-bottom:16px;">Preguntas Frecuentes (${state.data.faqs.length})</h2>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Pregunta</th>
              <th>Respuesta</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${state.data.faqs
              .map(
                (f) => `
              <tr>
                <td><strong>${escapeHtml(f.question)}</strong></td>
                <td>${escapeHtml(f.answer)}</td>
                <td>
                  <div class="action-btns">
                    <button type="button" class="icon-btn" data-edit-item="${escapeHtml(f.id)}"><span class="material-symbols-outlined">edit</span></button>
                    <button type="button" class="icon-btn icon-btn--danger" data-delete-item="${escapeHtml(f.id)}"><span class="material-symbols-outlined">delete</span></button>
                  </div>
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;

  panel.querySelector('#faq-admin-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveCollectionItem('faqs', {
      id: editing.id || `faq-${Date.now()}`,
      question: panel.querySelector('#faq-q').value.trim(),
      answer: panel.querySelector('#faq-a').value.trim(),
      published: true,
      order: editing.order ?? state.data.faqs.length + 1,
    });
    state.editingItem = null;
    showToast('FAQ guardada.');
    await onRefreshData();
  });

  bindCollectionTableActions(panel, 'faqs', state.data.faqs, state, onRefreshData);
}

/* ==========================================================================
   7. CONFIGURACIÓN DE INICIO Y PRÁCTICA DE PRUEBA (FORMS + CANVAS GAME)
   ========================================================================== */
function renderSettingsAdminTab(panel, state, onRefreshData) {
  const s = state.data.siteSettings;

  panel.innerHTML = `
    <section class="admin-panel-card">
      <h2 style="font-size:1.2rem;font-weight:800;margin-bottom:18px;">
        Configuración de Inicio, Perfil de Embajador y Práctica de Prueba
      </h2>
      <form id="settings-admin-form">
        <div class="admin-form-grid">
          <div class="form-field form-field--full">
            <label for="s-welcome-title">Título Principal de Inicio</label>
            <input type="text" id="s-welcome-title" value="${escapeHtml(s.welcomeTitle || '')}" />
          </div>
          <div class="form-field form-field--full">
            <label for="s-p1">Párrafo 1 de Bienvenida</label>
            <textarea id="s-p1" rows="3">${escapeHtml(s.welcomeParagraph1 || '')}</textarea>
          </div>
          <div class="form-field form-field--full">
            <label for="s-p2">Párrafo 2 de Bienvenida</label>
            <textarea id="s-p2" rows="2">${escapeHtml(s.welcomeParagraph2 || '')}</textarea>
          </div>
          <div class="form-field form-field--full">
            <label for="s-p3">Párrafo 3 de Bienvenida</label>
            <textarea id="s-p3" rows="2">${escapeHtml(s.welcomeParagraph3 || '')}</textarea>
          </div>

          <div class="form-field">
            <label for="s-form-embed">URL de Embed del Google Forms (Iframe)</label>
            <input type="url" id="s-form-embed" value="${escapeHtml(s.googleFormUrl || '')}" />
          </div>
          <div class="form-field">
            <label for="s-form-ext">URL externa del Google Forms (Botón pestaña nueva)</label>
            <input type="url" id="s-form-ext" value="${escapeHtml(s.googleFormExternalUrl || '')}" />
          </div>
          <div class="form-field">
            <label for="s-canvas-title">Título del Juego en Gemini Canvas</label>
            <input type="text" id="s-canvas-title" value="${escapeHtml(s.canvasGameTitle || '')}" />
          </div>
          <div class="form-field">
            <label for="s-canvas-url">Enlace del Juego compartido en Gemini Canvas</label>
            <input type="url" id="s-canvas-url" value="${escapeHtml(s.canvasGameUrl || '')}" />
          </div>
          <div class="form-field form-field--full">
            <label for="s-canvas-desc">Descripción de la dinámica en Gemini Canvas</label>
            <textarea id="s-canvas-desc" rows="2">${escapeHtml(s.canvasGameDescription || '')}</textarea>
          </div>
        </div>
        <button type="submit" class="btn-pill-blue">
          <span class="material-symbols-outlined" aria-hidden="true">save</span>
          <span>Guardar Configuración del Sitio</span>
        </button>
      </form>
    </section>
  `;

  panel.querySelector('#settings-admin-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveSiteSettings({
      welcomeTitle: panel.querySelector('#s-welcome-title').value.trim(),
      welcomeParagraph1: panel.querySelector('#s-p1').value.trim(),
      welcomeParagraph2: panel.querySelector('#s-p2').value.trim(),
      welcomeParagraph3: panel.querySelector('#s-p3').value.trim(),
      googleFormUrl: panel.querySelector('#s-form-embed').value.trim(),
      googleFormExternalUrl: panel.querySelector('#s-form-ext').value.trim(),
      canvasGameTitle: panel.querySelector('#s-canvas-title').value.trim(),
      canvasGameUrl: panel.querySelector('#s-canvas-url').value.trim(),
      canvasGameDescription: panel.querySelector('#s-canvas-desc').value.trim(),
    });
    showToast('Configuración general actualizada.');
    await onRefreshData();
  });
}

/* ==========================================================================
   HELPERS PARA ACCIONES EN TABLAS CRUD
   ========================================================================== */
function bindCollectionTableActions(panel, collectionName, items, state, onRefreshData, onPreview) {
  panel.querySelectorAll('[data-edit-item]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-edit-item');
      state.editingItem = items.find((i) => i.id === id) || null;
      const root = document.getElementById('admin-main-root');
      renderAdminDashboard(root, { state, onRefreshData });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  panel.querySelectorAll('[data-delete-item]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-delete-item');
      if (confirm('¿Seguro que deseas eliminar este elemento?')) {
        await deleteCollectionItem(collectionName, id);
        showToast('Elemento eliminado.');
        await onRefreshData();
      }
    });
  });

  panel.querySelectorAll('[data-toggle-pub]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-toggle-pub');
      const target = items.find((i) => i.id === id);
      if (!target) return;
      target.published = target.published === false ? true : false;
      await saveCollectionItem(collectionName, target);
      showToast(target.published ? 'Elemento publicado.' : 'Elemento cambiado a borrador.');
      await onRefreshData();
    });
  });

  panel.querySelectorAll('[data-move-up]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-move-up');
      await moveCollectionItemOrder(collectionName, id, 'up');
      await onRefreshData();
    });
  });

  panel.querySelectorAll('[data-move-down]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-move-down');
      await moveCollectionItemOrder(collectionName, id, 'down');
      await onRefreshData();
    });
  });

  if (onPreview) {
    panel.querySelectorAll('[data-preview-item]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-preview-item');
        const target = items.find((i) => i.id === id);
        if (target) onPreview(target);
      });
    });
  }
}
