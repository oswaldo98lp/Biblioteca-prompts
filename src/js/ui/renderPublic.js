/**
 * Renderizado dinámico de las 10 secciones del portal público,
 * buscador global, tarjetas de prompts, archivos descargables y acordeones FAQ.
 */
import { SECTIONS_META } from '../data/seedData.js';
import { copyTextToClipboard, showToast } from './clipboard.js';

const CATEGORY_LABELS = {
  inicio: 'Inicio',
  practica: 'Práctica de prueba',
  parts: 'Metodología PARTS',
  notebooklm: 'NotebookLM',
  canvas: 'Canvas',
  'canvas-db': 'Canvas + Base de datos',
  'gemini-live': 'Gemini Live',
  general: 'General',
};

export function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function getGeminiSparkSvg() {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="geminiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4285F4"/>
        <stop offset="50%" stop-color="#EA4335"/>
        <stop offset="100%" stop-color="#FBBC04"/>
      </linearGradient>
    </defs>
    <path d="M12 2C12 7.52 16.48 12 22 12C16.48 12 12 16.48 12 22C12 16.48 7.52 12 2 12C7.52 12 12 7.52 12 2Z" fill="url(#geminiGrad)"/>
  </svg>`;
}

/**
 * Renderiza los botones de navegación en la barra lateral de escritorio y el drawer móvil
 */
export function renderNavigationLists(activeSectionId, onSelectSection) {
  const desktopNav = document.getElementById('desktop-nav-list');
  const mobileNav = document.getElementById('mobile-nav-list');

  const createItemsHtml = () =>
    SECTIONS_META.map((sec) => {
      const isCurrent = sec.id === activeSectionId ? 'aria-current="page"' : '';
      return `
        <li>
          <button type="button" class="sidebar__nav-btn" data-section="${sec.id}" ${isCurrent}>
            <span class="material-symbols-outlined" aria-hidden="true">${sec.icon}</span>
            <span>${escapeHtml(sec.label)}</span>
          </button>
        </li>
      `;
    }).join('');

  if (desktopNav) desktopNav.innerHTML = createItemsHtml();
  if (mobileNav) mobileNav.innerHTML = createItemsHtml();

  document.querySelectorAll('[data-section]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetSection = btn.getAttribute('data-section');
      onSelectSection(targetSection);
    });
  });
}

/**
 * Renderiza una tarjeta de Prompt individual (usada en vistas de categoría, biblioteca y vista previa admin)
 */
export function renderPromptCardHtml(prompt) {
  const catLabel = CATEGORY_LABELS[prompt.category] || prompt.category || 'General';
  const tags = Array.isArray(prompt.tags)
    ? prompt.tags
    : String(prompt.tags || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

  const recommendedFileHtml = prompt.recommendedFile
    ? `<div class="prompt-card__file-hint">
         <span class="material-symbols-outlined" aria-hidden="true" style="font-size:1.1rem">attach_file</span>
         <span>Archivo sugerido: <strong>${escapeHtml(prompt.recommendedFile)}</strong></span>
       </div>`
    : '';

  const tagsHtml = tags
    .map((t) => `<span class="tag-chip">#${escapeHtml(t)}</span>`)
    .join('');

  const codeCaptionId = `prompt-title-${escapeHtml(prompt.id)}`;

  return `
    <article class="prompt-card" data-prompt-id="${escapeHtml(prompt.id)}">
      <div class="prompt-card__header">
        <h3 class="prompt-card__title" id="${codeCaptionId}">${escapeHtml(prompt.title)}</h3>
        <span class="prompt-card__category">${escapeHtml(catLabel)}</span>
      </div>
      ${recommendedFileHtml}
      <pre class="prompt-card__pre" role="region" aria-labelledby="${codeCaptionId}" tabindex="0"><code>${escapeHtml(
    prompt.promptText
  )}</code></pre>
      <div class="prompt-card__footer">
        <div class="prompt-card__tags">${tagsHtml}</div>
        <button type="button" class="btn-copy-prompt" data-copy-text="${encodeURIComponent(
          prompt.promptText
        )}" aria-label="Copiar prompt ${escapeHtml(prompt.title)}">
          <span class="material-symbols-outlined" aria-hidden="true" style="font-size:1.1rem">content_copy</span>
          <span class="btn-copy-label">Copiar prompt</span>
        </button>
      </div>
    </article>
  `;
}

/**
 * Renderiza una tarjeta de archivo descargable con ícono según tipo (PDF, XLSX, CSV) y tamaño
 */
export function renderFileCardHtml(fileItem) {
  const ext = (fileItem.fileType || 'PDF').toUpperCase();
  const typeClass =
    ext === 'PDF' ? 'file-type-icon--pdf' : ext === 'XLSX' ? 'file-type-icon--xlsx' : 'file-type-icon--csv';
  const iconName = ext === 'PDF' ? 'picture_as_pdf' : 'table_view';
  const catLabel = CATEGORY_LABELS[fileItem.category] || fileItem.category || 'Recurso';

  return `
    <article class="file-card">
      <div class="file-card__top">
        <div class="file-type-icon ${typeClass}" aria-hidden="true">
          <span class="material-symbols-outlined">${iconName}</span>
        </div>
        <div>
          <div class="file-card__meta">${escapeHtml(ext)} · ${escapeHtml(
    fileItem.fileSize || '2 KB'
  )} · ${escapeHtml(catLabel)}</div>
          <h3 style="font-size:1.08rem;font-weight:700;margin-top:2px;">${escapeHtml(fileItem.title)}</h3>
        </div>
      </div>
      <p style="font-size:0.92rem;color:var(--text-secondary);flex:1;">${escapeHtml(
        fileItem.description
      )}</p>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:6px;">
        <a href="${escapeHtml(fileItem.url)}" download="${escapeHtml(
    fileItem.fileName || fileItem.title
  )}" target="_blank" rel="noopener noreferrer" class="btn-pill-blue" style="width:100%;">
          <span class="material-symbols-outlined" aria-hidden="true">download</span>
          <span>Descargar (${escapeHtml(ext)})</span>
        </a>
      </div>
    </article>
  `;
}

/**
 * Renderiza una tarjeta de enlace externo
 */
export function renderLinkCardHtml(linkItem) {
  const catLabel = CATEGORY_LABELS[linkItem.category] || linkItem.category || 'Enlace';
  return `
    <article class="file-card">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
        <span class="prompt-card__category">${escapeHtml(catLabel)}</span>
        <span class="material-symbols-outlined" aria-hidden="true" style="color:var(--google-blue)">open_in_new</span>
      </div>
      <h3 style="font-size:1.1rem;font-weight:700;">${escapeHtml(linkItem.title)}</h3>
      <p style="font-size:0.92rem;color:var(--text-secondary);flex:1;">${escapeHtml(
        linkItem.description
      )}</p>
      <a href="${escapeHtml(
        linkItem.url
      )}" target="_blank" rel="noopener noreferrer" class="btn-pill-outline" style="width:100%;">
        <span>Abrir enlace oficial</span>
        <span class="material-symbols-outlined" aria-hidden="true" style="font-size:1.1rem">arrow_outward</span>
      </a>
    </article>
  `;
}

/**
 * Conecta los botones "Copiar prompt" dentro del contenedor actual
 */
export function bindCopyPromptButtons(container = document) {
  container.querySelectorAll('.btn-copy-prompt').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const rawText = decodeURIComponent(btn.getAttribute('data-copy-text') || '');
      const ok = await copyTextToClipboard(rawText);
      if (ok) {
        const labelEl = btn.querySelector('.btn-copy-label');
        const iconEl = btn.querySelector('.material-symbols-outlined');
        const originalText = labelEl ? labelEl.textContent : 'Copiar prompt';

        btn.classList.add('is-copied');
        if (labelEl) labelEl.textContent = '¡Copiado!';
        if (iconEl) iconEl.textContent = 'check';
        showToast('¡Prompt copiado! Listo para pegar en Google Gemini.');

        setTimeout(() => {
          btn.classList.remove('is-copied');
          if (labelEl) labelEl.textContent = originalText;
          if (iconEl) iconEl.textContent = 'content_copy';
        }, 2200);
      }
    });
  });
}

/**
 * Renderiza la sección activa en el contenedor principal
 */
export function renderActiveSection({
  sectionId,
  data,
  onNavigate,
  promptSearchState,
}) {
  const container = document.getElementById('main-content-area');
  if (!container) return;

  const { siteSettings, partsCards, blocks, prompts, links, files, faqs } = data;

  // Actualizar imagen de encabezado superior si fue personalizada
  const heroImg = document.getElementById('hero-banner-img');
  if (heroImg && siteSettings.headerImage) {
    heroImg.src = siteSettings.headerImage;
  }

  switch (sectionId) {
    case 'inicio':
      container.innerHTML = renderInicioSection(siteSettings, links);
      container.querySelectorAll('[data-jump-section]').forEach((card) => {
        card.addEventListener('click', () => {
          onNavigate(card.getAttribute('data-jump-section'));
        });
      });
      break;

    case 'practica':
      container.innerHTML = renderPracticaSection(siteSettings);
      break;

    case 'parts':
      container.innerHTML = renderPartsSection(partsCards, prompts, files);
      bindCopyPromptButtons(container);
      break;

    case 'notebooklm':
    case 'canvas':
    case 'canvas-db':
    case 'gemini-live':
      container.innerHTML = renderCategoryWorkshopSection(sectionId, blocks, prompts, links, files);
      bindCopyPromptButtons(container);
      break;

    case 'biblioteca':
      container.innerHTML = renderBibliotecaSection(prompts, promptSearchState);
      bindBibliotecaFilters(container, prompts, promptSearchState);
      bindCopyPromptButtons(container);
      break;

    case 'recursos':
      container.innerHTML = renderRecursosSection(files, links);
      break;

    case 'faq':
      container.innerHTML = renderFaqSection(faqs, siteSettings);
      break;

    default:
      container.innerHTML = renderInicioSection(siteSettings, links);
  }
}

/* ==========================================================================
   VISTAS DE CADA SECCIÓN
   ========================================================================== */

function renderInicioSection(s, links) {
  const homeLinks = links.filter((l) => l.category === 'inicio');
  return `
    <section aria-labelledby="welcome-heading">
      <!-- Bloque superior idéntico al sitio de referencia -->
      <div class="home-welcome-grid">
        <div class="home-welcome__visual">
          <img
            src="${escapeHtml(s.welcomeSticker || '/assets/Stickers/Gemini_Generated_Image_297rci297rci297r.png')}"
            alt="Estrella multicolor oficial de Google Gemini"
            class="home-welcome__star-img"
            width="220"
            height="220"
          />
          <a
            href="${escapeHtml(s.geminiButtonUrl || 'https://gemini.google.com/')}"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-pill-black"
          >
            <span>Accede</span>
            ${getGeminiSparkSvg()}
            <span>Google Gemini</span>
          </a>
        </div>

        <div class="home-welcome__content">
          <h1 id="welcome-heading" class="section-title">${escapeHtml(s.welcomeTitle)}</h1>
          <p>${escapeHtml(s.welcomeParagraph1)}</p>
          <p>${escapeHtml(s.welcomeParagraph2)}</p>
          <p>${escapeHtml(s.welcomeParagraph3)}</p>
        </div>
      </div>

      <!-- Tarjeta de Presentación del Estudiante Embajador (Mi perfil.png) -->
      <div class="ambassador-showcase" aria-label="Presentación del Estudiante Embajador">
        <div class="ambassador-showcase__header">
          <span class="ambassador-showcase__badge">
            <span class="material-symbols-outlined" aria-hidden="true" style="font-size:1.1rem">verified</span>
            Anfitrión del Taller · Estudiante Embajador de Google
          </span>
          <span style="font-size:0.82rem;color:#BDC1C6;">Cohorte 2026</span>
        </div>
        <div class="ambassador-showcase__body">
          <div>
            <img
              src="${escapeHtml(s.profileImage || '/assets/Stickers/Mi perfil.png')}"
              alt="Tarjeta de perfil de ${escapeHtml(s.ambassadorName)}, Estudiante Embajador de Google en ${escapeHtml(s.ambassadorUni)}"
              class="ambassador-showcase__img"
              width="640"
              height="360"
            />
          </div>
          <div class="ambassador-showcase__info">
            <h3>${escapeHtml(s.ambassadorName)}</h3>
            <p><strong>${escapeHtml(s.ambassadorUni)}</strong><br/>${escapeHtml(s.ambassadorMajor)}</p>
            <p style="font-size:0.92rem;color:#BDC1C6;">
              Bienvenido al portal interactivo del taller. Aquí tienes acceso libre a todas las plantillas, prompts con estructura PARTS y bases de datos de práctica para que construyas tus propios proyectos con Google Gemini.
            </p>
            <div class="ambassador-showcase__socials">
              <a href="${escapeHtml(s.ambassadorInstagram)}" target="_blank" rel="noopener noreferrer" class="social-pill">
                <span class="material-symbols-outlined" aria-hidden="true" style="font-size:1.1rem">photo_camera</span>
                <span>Instagram: ${escapeHtml(s.ambassadorInstagramHandle)}</span>
              </a>
              <a href="${escapeHtml(s.ambassadorLinkedin)}" target="_blank" rel="noopener noreferrer" class="social-pill">
                <span class="material-symbols-outlined" aria-hidden="true" style="font-size:1.1rem">work</span>
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Mapa rápido de módulos del taller con Stickers oficiales de /assets -->
      <div class="section-header" style="margin-bottom:20px;">
        <span class="section-badge">Ruta del Taller</span>
        <h2 class="section-title" style="font-size:1.6rem;">EXPLORA LAS ESTACIONES DE PRÁCTICA</h2>
        <p class="section-subtitle">Selecciona cualquier módulo para abrir sus guías, copiar sus prompts o descargar los archivos de trabajo.</p>
      </div>

      <div class="quick-modules-grid">
        <button type="button" class="module-card" data-jump-section="practica">
          <div class="module-card__top">
            <img src="/assets/Stickers/Gemini_Generated_Image_2ldzud2ldzud2ldz.png" alt="" class="module-card__sticker" loading="lazy" width="54" height="54" />
            <span class="material-symbols-outlined" aria-hidden="true" style="color:var(--google-blue)">arrow_forward</span>
          </div>
          <div class="module-card__title">1. Práctica de Prueba</div>
          <p class="module-card__desc">Registra tus datos en el Google Forms y míralos cobrar vida en un juego en Gemini Canvas.</p>
        </button>

        <button type="button" class="module-card" data-jump-section="parts">
          <div class="module-card__top">
            <img src="/assets/Stickers/Gemini_Generated_Image_9rooq29rooq29roo.png" alt="" class="module-card__sticker" loading="lazy" width="54" height="54" />
            <span class="material-symbols-outlined" aria-hidden="true" style="color:var(--google-blue)">arrow_forward</span>
          </div>
          <div class="module-card__title">2. Metodología PARTS</div>
          <p class="module-card__desc">Persona, Acción, Resultado, Tono y Soporte: la anatomía del comando avanzado.</p>
        </button>

        <button type="button" class="module-card" data-jump-section="notebooklm">
          <div class="module-card__top">
            <img src="/assets/Stickers/Gemini_Generated_Image_941lkv941lkv941l.png" alt="" class="module-card__sticker" loading="lazy" width="54" height="54" />
            <span class="material-symbols-outlined" aria-hidden="true" style="color:var(--google-blue)">arrow_forward</span>
          </div>
          <div class="module-card__title">3. NotebookLM</div>
          <p class="module-card__desc">Convierte tus PDFs y apuntes en guías de estudio, podcasts y exámenes con citas verificadas.</p>
        </button>

        <button type="button" class="module-card" data-jump-section="canvas">
          <div class="module-card__top">
            <img src="/assets/Stickers/Gemini_Generated_Image_ (8).png" alt="" class="module-card__sticker" loading="lazy" width="54" height="54" />
            <span class="material-symbols-outlined" aria-hidden="true" style="color:var(--google-blue)">arrow_forward</span>
          </div>
          <div class="module-card__title">4. Gemini Canvas</div>
          <p class="module-card__desc">Crea aplicaciones web, simuladores interactivos y portafolios ejecutables en segundos.</p>
        </button>

        <button type="button" class="module-card" data-jump-section="canvas-db">
          <div class="module-card__top">
            <img src="/assets/Stickers/Gemini_Generated_Image_ (10).png" alt="" class="module-card__sticker" loading="lazy" width="54" height="54" />
            <span class="material-symbols-outlined" aria-hidden="true" style="color:var(--google-blue)">arrow_forward</span>
          </div>
          <div class="module-card__title">5. Canvas + Base de Datos</div>
          <p class="module-card__desc">Descarga archivos CSV/Excel y transfórmalos en Dashboards con gráficas y filtros dinámicos.</p>
        </button>

        <button type="button" class="module-card" data-jump-section="gemini-live">
          <div class="module-card__top">
            <img src="/assets/Stickers/Gemini_Generated_Image_ (75).png" alt="" class="module-card__sticker" loading="lazy" width="54" height="54" />
            <span class="material-symbols-outlined" aria-hidden="true" style="color:var(--google-blue)">arrow_forward</span>
          </div>
          <div class="module-card__title">6. Gemini Live</div>
          <p class="module-card__desc">Practica entrevistas técnicas y defensas de proyecto por voz en tiempo real desde tu celular.</p>
        </button>
      </div>

      ${
        homeLinks.length > 0
          ? `<div style="margin-top:44px;">
               <h2 class="section-title" style="font-size:1.35rem;margin-bottom:18px;">ACCESOS DIRECTOS OFICIALES</h2>
               <div class="links-grid">${homeLinks.map(renderLinkCardHtml).join('')}</div>
             </div>`
          : ''
      }
    </section>
  `;
}

function renderPracticaSection(s) {
  return `
    <section aria-labelledby="practice-heading">
      <div class="section-header">
        <span class="section-badge">Dinámica Interactiva</span>
        <h1 id="practice-heading" class="section-title">${escapeHtml(s.practiceTitle)}</h1>
        <p class="section-subtitle">${escapeHtml(s.practiceSubtitle)}</p>
      </div>

      <div class="practice-steps">
        <div class="step-card">
          <span class="step-card__number">1</span>
          <h2 style="font-size:1.08rem;font-weight:700;margin-bottom:6px;">Llena el Google Forms</h2>
          <p style="font-size:0.92rem;color:var(--text-secondary);">${escapeHtml(s.practiceStep1)}</p>
        </div>
        <div class="step-card">
          <span class="step-card__number" style="background-color:var(--google-green);">2</span>
          <h2 style="font-size:1.08rem;font-weight:700;margin-bottom:6px;">Sincronización de Datos</h2>
          <p style="font-size:0.92rem;color:var(--text-secondary);">${escapeHtml(s.practiceStep2)}</p>
        </div>
        <div class="step-card">
          <span class="step-card__number" style="background-color:var(--google-yellow);color:#202124;">3</span>
          <h2 style="font-size:1.08rem;font-weight:700;margin-bottom:6px;">Explora el Juego en Canvas</h2>
          <p style="font-size:0.92rem;color:var(--text-secondary);">${escapeHtml(s.practiceStep3)}</p>
        </div>
      </div>

      <div class="practice-arena">
        <!-- Columna 1: Google Forms -->
        <div class="embed-panel">
          <div class="embed-panel__header">
            <div class="embed-panel__title">
              <span class="material-symbols-outlined" aria-hidden="true" style="color:var(--google-blue)">assignment</span>
              <span>Paso 1: Formulario de Registro</span>
            </div>
            <a href="${escapeHtml(s.googleFormExternalUrl || s.googleFormUrl)}" target="_blank" rel="noopener noreferrer" class="btn-pill-outline">
              <span>Abrir en pestaña nueva</span>
              <span class="material-symbols-outlined" aria-hidden="true" style="font-size:1.05rem">open_in_new</span>
            </a>
          </div>
          <div class="embed-panel__iframe-container">
            <iframe
              src="${escapeHtml(s.googleFormUrl)}"
              title="Formulario de práctica de Google Forms"
              class="embed-panel__iframe"
              loading="lazy"
            >Cargando formulario...</iframe>
          </div>
        </div>

        <!-- Columna 2: Juego en Gemini Canvas -->
        <div class="embed-panel">
          <div class="embed-panel__header">
            <div class="embed-panel__title">
              <span class="material-symbols-outlined" aria-hidden="true" style="color:var(--google-green)">sports_esports</span>
              <span>Paso 2: ${escapeHtml(s.canvasGameTitle || 'Juego en Gemini Canvas')}</span>
            </div>
            <a href="${escapeHtml(s.canvasGameUrl)}" target="_blank" rel="noopener noreferrer" class="btn-pill-blue">
              <span>Abrir Juego en Canvas</span>
              <span class="material-symbols-outlined" aria-hidden="true" style="font-size:1.05rem">rocket_launch</span>
            </a>
          </div>
          <div style="padding:28px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;flex:1;background:linear-gradient(180deg, #F8FAFF 0%, #EEF4FF 100%);">
            <img
              src="/assets/Stickers/Gemini_Generated_Image_9rooq29rooq29roo.png"
              alt="Cohete voxel de Google Gemini"
              width="130"
              height="130"
              style="margin-bottom:18px;object-fit:contain;"
            />
            <h3 style="font-size:1.3rem;font-weight:800;color:var(--google-blue-dark);margin-bottom:10px;">
              ${escapeHtml(s.canvasGameTitle)}
            </h3>
            <p style="font-size:0.96rem;color:var(--text-secondary);max-width:440px;margin-bottom:24px;">
              ${escapeHtml(s.canvasGameDescription)}
            </p>
            <a href="${escapeHtml(s.canvasGameUrl)}" target="_blank" rel="noopener noreferrer" class="btn-pill-black">
              <span>Jugar ahora en Gemini Canvas</span>
              <span class="material-symbols-outlined" aria-hidden="true">open_in_new</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderPartsSection(partsCards, prompts, files) {
  const partsPrompts = prompts.filter((p) => p.category === 'parts');
  const partsFiles = files.filter((f) => f.title.toLowerCase().includes('parts'));

  return `
    <section aria-labelledby="parts-heading">
      <div class="section-header">
        <span class="section-badge">Metodología Oficial de Prompting</span>
        <h1 id="parts-heading" class="section-title">METODOLOGÍA PARTS</h1>
        <p class="section-subtitle">
          Domina los 5 componentes esenciales para estructurar instrucciones avanzadas en Google Gemini y obtener respuestas precisas al primer intento.
        </p>
      </div>

      <!-- Bloque Visual Oscuro inspirado exactamente en la lámina "ANATOMÍA DEL COMANDO AVANZADO" -->
      <div class="parts-showcase">
        <h2 class="parts-showcase__heading">ANATOMÍA DEL <span>COMANDO AVANZADO</span></h2>
        <div class="parts-grid">
          ${partsCards
            .map(
              (c) => `
            <article class="parts-card">
              <div class="parts-card__icon-wrap">
                <span class="material-symbols-outlined parts-card__icon" aria-hidden="true">${escapeHtml(
                  c.icon || 'auto_awesome'
                )}</span>
                <span class="parts-card__letter-badge" aria-label="Letra ${escapeHtml(c.letter)}">${escapeHtml(
                c.letter
              )}</span>
              </div>
              <h3 class="parts-card__title">${escapeHtml(c.title)}</h3>
              <p class="parts-card__subtitle">${escapeHtml(c.subtitle)}</p>
              <p class="parts-card__description">${escapeHtml(c.description)}</p>
              ${
                c.example
                  ? `<div class="parts-card__example">
                       <strong>Ejemplo práctico:</strong>
                       <span>${escapeHtml(c.example)}</span>
                     </div>`
                  : ''
              }
            </article>
          `
            )
            .join('')}
        </div>
      </div>

      ${
        partsPrompts.length > 0
          ? `<div style="margin-top:36px;">
               <h2 class="section-title" style="font-size:1.45rem;margin-bottom:18px;">PLANTILLAS CON ESTRUCTURA PARTS LISTAS PARA COPIAR</h2>
               <div class="prompts-grid">${partsPrompts.map(renderPromptCardHtml).join('')}</div>
             </div>`
          : ''
      }

      ${
        partsFiles.length > 0
          ? `<div style="margin-top:36px;">
               <h2 class="section-title" style="font-size:1.45rem;margin-bottom:18px;">MATERIAL DESCARGABLE DE APOYO</h2>
               <div class="files-grid">${partsFiles.map(renderFileCardHtml).join('')}</div>
             </div>`
          : ''
      }
    </section>
  `;
}

function renderCategoryWorkshopSection(sectionId, blocks, prompts, links, files) {
  const meta = {
    notebooklm: {
      badge: 'Investigación y Estudio con IA',
      title: 'NOTEBOOKLM: TU CUADERNO DE INVESTIGACIÓN INTELIGENTE',
      subtitle:
        'Sube tus PDFs, presentaciones y apuntes universitarios para estudiar con resúmenes en audio, mapas conceptuales y respuestas con citas exactas.',
    },
    canvas: {
      badge: 'Creación Interactiva y Código',
      title: 'GEMINI CANVAS: DE UN PROMPT A UNA APLICACIÓN EN VIVO',
      subtitle:
        'Diseña interfaces, simuladores interactivos, juegos educativos y documentos colaborativos viendo el resultado ejecutarse en tiempo real.',
    },
    'canvas-db': {
      badge: 'Visualización y Análisis de Datos',
      title: 'CANVAS + BASE DE DATOS (EXCEL / CSV)',
      subtitle:
        'Descarga nuestras bases de datos de prueba, adjúntalas en Gemini y construye Dashboards ejecutivos interactivos sin escribir código desde cero.',
    },
    'gemini-live': {
      badge: 'Voz y Multimodalidad en Tiempo Real',
      title: 'GEMINI LIVE: TU MENTOR PERSONAL POR VOZ Y CÁMARA',
      subtitle:
        'Ensaya entrevistas laborales, practica exposiciones orales y resuelve dudas mostrando tu pantalla o cuaderno desde la app móvil de Gemini.',
    },
  }[sectionId];

  const secBlocks = blocks.filter((b) => b.section === sectionId);
  const secPrompts = prompts.filter((p) => p.category === sectionId);
  const secFiles = files.filter((f) => f.category === sectionId);
  const secLinks = links.filter((l) => l.category === sectionId);

  return `
    <section aria-labelledby="cat-heading-${sectionId}">
      <div class="section-header">
        <span class="section-badge">${escapeHtml(meta.badge)}</span>
        <h1 id="cat-heading-${sectionId}" class="section-title">${escapeHtml(meta.title)}</h1>
        <p class="section-subtitle">${escapeHtml(meta.subtitle)}</p>
      </div>

      ${
        secBlocks.length > 0
          ? `<div class="blocks-stack">
               ${secBlocks
                 .map(
                   (b) => `
                 <article class="content-block-card" style="display:flex;align-items:center;gap:24px;flex-wrap:wrap;">
                   ${
                     b.sticker
                       ? `<img src="${escapeHtml(b.sticker)}" alt="" width="76" height="76" style="object-fit:contain;flex-shrink:0;" loading="lazy" />`
                       : ''
                   }
                   <div style="flex:1;min-width:240px;">
                     <h3>${escapeHtml(b.title)}</h3>
                     <p>${escapeHtml(b.content)}</p>
                   </div>
                 </article>
               `
                 )
                 .join('')}
             </div>`
          : ''
      }

      ${
        secFiles.length > 0
          ? `<div style="margin-top:32px;">
               <h2 class="section-title" style="font-size:1.4rem;margin-bottom:16px;">ARCHIVOS PARA DESCARGAR Y USAR EN ESTE EJERCICIO</h2>
               <div class="files-grid">${secFiles.map(renderFileCardHtml).join('')}</div>
             </div>`
          : ''
      }

      ${
        secPrompts.length > 0
          ? `<div style="margin-top:32px;">
               <h2 class="section-title" style="font-size:1.4rem;margin-bottom:16px;">PROMPTS DE PRÁCTICA (${escapeHtml(
                 CATEGORY_LABELS[sectionId]
               )})</h2>
               <div class="prompts-grid">${secPrompts.map(renderPromptCardHtml).join('')}</div>
             </div>`
          : ''
      }

      ${
        secLinks.length > 0
          ? `<div style="margin-top:32px;">
               <h2 class="section-title" style="font-size:1.4rem;margin-bottom:16px;">ENLACES Y HERRAMIENTAS</h2>
               <div class="links-grid">${secLinks.map(renderLinkCardHtml).join('')}</div>
             </div>`
          : ''
      }
    </section>
  `;
}

function renderBibliotecaSection(prompts, promptSearchState) {
  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'parts', label: 'Metodología PARTS' },
    { id: 'notebooklm', label: 'NotebookLM' },
    { id: 'canvas', label: 'Canvas' },
    { id: 'canvas-db', label: 'Canvas + Base de datos' },
    { id: 'gemini-live', label: 'Gemini Live' },
  ];

  return `
    <section aria-labelledby="library-heading">
      <div class="section-header">
        <span class="section-badge">Repositorio Completo</span>
        <h1 id="library-heading" class="section-title">BIBLIOTECA DE PROMPTS</h1>
        <p class="section-subtitle">
          Busca por palabra clave o filtra por herramienta. Todos los prompts incluyen botón de copiado rápido optimizado para móvil y escritorio.
        </p>
      </div>

      <search class="filter-bar" aria-label="Filtrar prompts de la biblioteca">
        <div class="filter-bar__search">
          <span class="material-symbols-outlined" aria-hidden="true" style="color:var(--text-secondary)">search</span>
          <input
            type="search"
            id="library-search-input"
            placeholder="Buscar por título, palabra clave o etiqueta..."
            value="${escapeHtml(promptSearchState.query)}"
            aria-label="Buscar prompts"
          />
        </div>
        <div class="category-pills" role="group" aria-label="Categorías de prompts">
          ${categories
            .map(
              (c) => `
            <button
              type="button"
              class="category-pill"
              data-filter-cat="${c.id}"
              aria-pressed="${promptSearchState.category === c.id ? 'true' : 'false'}"
            >
              ${escapeHtml(c.label)}
            </button>
          `
            )
            .join('')}
        </div>
      </search>

      <div id="library-prompts-results" class="prompts-grid">
        ${filterPromptsList(prompts, promptSearchState)}
      </div>
    </section>
  `;
}

function filterPromptsList(prompts, { query, category }) {
  const q = (query || '').trim().toLowerCase();
  const filtered = prompts.filter((p) => {
    const matchCat = category === 'all' || p.category === category;
    if (!matchCat) return false;
    if (!q) return true;
    const haystack = `${p.title} ${p.promptText} ${(p.tags || []).join(' ')} ${
      p.recommendedFile || ''
    }`.toLowerCase();
    return haystack.includes(q);
  });

  if (filtered.length === 0) {
    return `
      <div style="grid-column:1/-1;text-align:center;padding:48px 20px;background:var(--surface-subtle);border-radius:var(--radius-md);">
        <span class="material-symbols-outlined" aria-hidden="true" style="font-size:2.5rem;color:var(--text-secondary)">search_off</span>
        <p style="font-weight:700;margin-top:8px;">No encontramos prompts que coincidan con tu filtro.</p>
        <p style="font-size:0.9rem;color:var(--text-secondary);">Prueba con otra palabra clave o selecciona la categoría "Todos".</p>
      </div>
    `;
  }

  return filtered.map(renderPromptCardHtml).join('');
}

function bindBibliotecaFilters(container, prompts, promptSearchState) {
  const searchInput = container.querySelector('#library-search-input');
  const resultsEl = container.querySelector('#library-prompts-results');
  const catButtons = container.querySelectorAll('[data-filter-cat]');

  const refresh = () => {
    if (!resultsEl) return;
    resultsEl.innerHTML = filterPromptsList(prompts, promptSearchState);
    bindCopyPromptButtons(resultsEl);
  };

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      promptSearchState.query = e.target.value;
      refresh();
    });
  }

  catButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      promptSearchState.category = btn.getAttribute('data-filter-cat');
      catButtons.forEach((b) =>
        b.setAttribute(
          'aria-pressed',
          b.getAttribute('data-filter-cat') === promptSearchState.category ? 'true' : 'false'
        )
      );
      refresh();
    });
  });
}

function renderRecursosSection(files, links) {
  return `
    <section aria-labelledby="resources-heading">
      <div class="section-header">
        <span class="section-badge">Archivos de Trabajo (.PDF, .XLSX, .CSV)</span>
        <h1 id="resources-heading" class="section-title">RECURSOS DESCARGABLES</h1>
        <p class="section-subtitle">
          Descarga estos conjuntos de datos y guías en PDF para adjuntarlos directamente en Google Gemini y NotebookLM durante los ejercicios prácticos.
        </p>
      </div>

      <div class="files-grid">
        ${files.map(renderFileCardHtml).join('')}
      </div>

      <div style="margin-top:44px;">
        <h2 class="section-title" style="font-size:1.45rem;margin-bottom:18px;">DIRECTORIO DE ENLACES DEL TALLER</h2>
        <div class="links-grid">
          ${links.map(renderLinkCardHtml).join('')}
        </div>
      </div>
    </section>
  `;
}

function renderFaqSection(faqs, s) {
  return `
    <section aria-labelledby="faq-heading">
      <div class="section-header">
        <span class="section-badge">Resolución de Dudas</span>
        <h1 id="faq-heading" class="section-title">PREGUNTAS FRECUENTES Y APOYO</h1>
        <p class="section-subtitle">
          Respuestas rápidas a las dudas más comunes durante el taller universitario de Google Gemini.
        </p>
      </div>

      <section class="faq-list" aria-label="Preguntas frecuentes del taller">
        ${faqs
          .map(
            (faq, idx) => `
          <details class="faq-item" name="workshop-faq" ${idx === 0 ? 'open' : ''}>
            <summary>
              <span>${escapeHtml(faq.question)}</span>
              <span class="material-symbols-outlined" aria-hidden="true" style="color:var(--google-blue)">expand_more</span>
            </summary>
            <div class="faq-item__body">
              <p>${escapeHtml(faq.answer)}</p>
            </div>
          </details>
        `
          )
          .join('')}
      </section>

      <div class="content-block-card" style="margin-top:40px;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;">
        <div>
          <h3>¿Necesitas apoyo directo con tu cuenta o ejercicio?</h3>
          <p>Levanta la mano durante el taller o escríbeme por redes sociales para ayudarte a configurar tu entorno con Google Gemini.</p>
        </div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;">
          <a href="${escapeHtml(s.ambassadorInstagram || 'https://instagram.com/oswaldo.0')}" target="_blank" rel="noopener noreferrer" class="btn-pill-black">
            <span>Contactar a ${escapeHtml(s.ambassadorName || 'Oswaldo Lucas')}</span>
            <span class="material-symbols-outlined" aria-hidden="true">open_in_new</span>
          </a>
        </div>
      </div>
    </section>
  `;
}

/**
 * Renderiza los resultados del Buscador Global en todo el portal
 */
export function renderGlobalSearchResults(query, data, onNavigateSection) {
  const container = document.getElementById('main-content-area');
  if (!container) return;
  const q = query.trim().toLowerCase();

  const matchingPrompts = data.prompts.filter((p) =>
    `${p.title} ${p.promptText} ${(p.tags || []).join(' ')}`.toLowerCase().includes(q)
  );
  const matchingFiles = data.files.filter((f) =>
    `${f.title} ${f.description} ${f.fileType}`.toLowerCase().includes(q)
  );
  const matchingBlocks = data.blocks.filter((b) =>
    `${b.title} ${b.content}`.toLowerCase().includes(q)
  );
  const matchingFaqs = data.faqs.filter((f) =>
    `${f.question} ${f.answer}`.toLowerCase().includes(q)
  );

  const total =
    matchingPrompts.length + matchingFiles.length + matchingBlocks.length + matchingFaqs.length;

  container.innerHTML = `
    <section aria-labelledby="search-results-heading">
      <div class="section-header">
        <span class="section-badge">Buscador Global</span>
        <h1 id="search-results-heading" class="section-title">RESULTADOS PARA "${escapeHtml(
          query
        )}" (${total})</h1>
        <p class="section-subtitle">Mostrando coincidencias en Prompts, Recursos descargables, Guías y Preguntas Frecuentes.</p>
      </div>

      ${
        total === 0
          ? `<div class="content-block-card">
               <h3>Sin coincidencias exactas</h3>
               <p>Intenta con términos como <strong>PARTS</strong>, <strong>CSV</strong>, <strong>Canvas</strong>, <strong>NotebookLM</strong> o <strong>Entrevista</strong>.</p>
             </div>`
          : ''
      }

      ${
        matchingPrompts.length > 0
          ? `<h2 class="section-title" style="font-size:1.35rem;margin:24px 0 14px;">PROMPTS (${matchingPrompts.length})</h2>
             <div class="prompts-grid">${matchingPrompts.map(renderPromptCardHtml).join('')}</div>`
          : ''
      }

      ${
        matchingFiles.length > 0
          ? `<h2 class="section-title" style="font-size:1.35rem;margin:32px 0 14px;">ARCHIVOS DESCARGABLES (${matchingFiles.length})</h2>
             <div class="files-grid">${matchingFiles.map(renderFileCardHtml).join('')}</div>`
          : ''
      }

      ${
        matchingBlocks.length > 0
          ? `<h2 class="section-title" style="font-size:1.35rem;margin:32px 0 14px;">GUÍAS Y MÓDULOS (${matchingBlocks.length})</h2>
             <div class="blocks-stack">
               ${matchingBlocks
                 .map(
                   (b) => `
                 <article class="content-block-card">
                   <h3>${escapeHtml(b.title)}</h3>
                   <p>${escapeHtml(b.content)}</p>
                   <button type="button" class="btn-pill-outline" data-goto-sec="${escapeHtml(
                     b.section
                   )}" style="margin-top:12px;">
                     <span>Ir a la sección ${escapeHtml(
                       CATEGORY_LABELS[b.section] || b.section
                     )}</span>
                     <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                   </button>
                 </article>
               `
                 )
                 .join('')}
             </div>`
          : ''
      }
    </section>
  `;

  bindCopyPromptButtons(container);
  container.querySelectorAll('[data-goto-sec]').forEach((btn) => {
    btn.addEventListener('click', () => {
      onNavigateSection(btn.getAttribute('data-goto-sec'));
    });
  });
}
