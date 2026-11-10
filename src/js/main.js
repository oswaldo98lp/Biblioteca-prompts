/**
 * Punto de entrada del portal público (index.html)
 * Gestiona la navegación entre las 10 secciones, el drawer móvil accesible y el buscador global.
 */
import { fetchAllPortalData } from './services/dbService.js';
import {
  renderNavigationLists,
  renderActiveSection,
  renderGlobalSearchResults,
} from './ui/renderPublic.js';
import { SECTIONS_META } from './data/seedData.js';

let portalData = null;
let currentSectionId = 'inicio';
const promptSearchState = {
  query: '',
  category: 'all',
};

async function initPortal() {
  // Leer hash inicial si existe (#parts, #biblioteca, etc.)
  const hashId = window.location.hash.replace('#', '').trim();
  if (SECTIONS_META.some((s) => s.id === hashId)) {
    currentSectionId = hashId;
  }

  portalData = await fetchAllPortalData({ includeDrafts: false });

  setupMobileDrawer();
  setupGlobalSearch();
  setupHomeButton();
  navigateToSection(currentSectionId, { pushHash: false });

  window.addEventListener('hashchange', () => {
    const newHash = window.location.hash.replace('#', '').trim();
    if (SECTIONS_META.some((s) => s.id === newHash) && newHash !== currentSectionId) {
      navigateToSection(newHash, { pushHash: false });
    }
  });
}

function navigateToSection(sectionId, { pushHash = true } = {}) {
  currentSectionId = sectionId;
  if (pushHash) {
    history.replaceState(null, '', `#${sectionId}`);
  }

  renderNavigationLists(currentSectionId, (selectedId) => {
    closeMobileDrawerIfNeeded();
    navigateToSection(selectedId);
  });

  renderActiveSection({
    sectionId: currentSectionId,
    data: portalData,
    onNavigate: (targetId) => navigateToSection(targetId),
    promptSearchState,
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setupHomeButton() {
  const homeBtn = document.getElementById('sidebar-home-btn');
  if (homeBtn) {
    homeBtn.addEventListener('click', () => navigateToSection('inicio'));
  }
}

/* ==========================================================================
   DRAWER MÓVIL ACCESIBLE (<dialog> con scroll-snap e IntersectionObserver)
   ========================================================================== */
let closeDrawerFn = null;

function closeMobileDrawerIfNeeded() {
  if (closeDrawerFn) closeDrawerFn();
}

function setupMobileDrawer() {
  const drawer = document.getElementById('mobile-drawer');
  const openBtn = document.getElementById('mobile-menu-open');
  const closeBtn = document.getElementById('mobile-menu-close');
  if (!drawer || !openBtn || !closeBtn) return;

  const scroller = drawer.querySelector('.mobile-drawer__scroller');
  const sheet = drawer.querySelector('.mobile-drawer__sheet');

  async function openDrawer() {
    if (drawer.open) return;
    drawer.showModal();

    if (!CSS.supports('scroll-initial-target', 'nearest')) {
      scroller.scrollTo({ left: scroller.offsetWidth, behavior: 'instant' });
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    }
    scroller.scrollTo({ left: 0, behavior: 'auto' });
  }

  function closeDrawer() {
    if (!drawer.open) return;
    scroller.scrollTo({ left: scroller.offsetWidth, behavior: 'auto' });
    // Respaldo seguro por si el usuario tiene animaciones desactivadas o hace clic rápido
    setTimeout(() => {
      if (drawer.open) {
        drawer.close();
        openBtn.setAttribute('aria-expanded', 'false');
      }
    }, 260);
  }

  closeDrawerFn = closeDrawer;

  const visibleThreshold = 1 / Math.max(window.innerWidth, 320);
  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries.at(-1);
      if (!entry) return;
      if (entry.intersectionRatio < visibleThreshold && drawer.open) {
        drawer.close();
        openBtn.setAttribute('aria-expanded', 'false');
      } else if (entry.intersectionRatio >= 0.95) {
        openBtn.setAttribute('aria-expanded', 'true');
      }
    },
    { root: drawer, threshold: [visibleThreshold, 0.95] }
  );
  observer.observe(sheet);

  if (!CSS.supports('animation-timeline: scroll()')) {
    scroller.addEventListener('scroll', () => {
      const ratio = 1 - scroller.scrollLeft / Math.max(sheet.offsetWidth, 1);
      drawer.style.setProperty('--drawer-backdrop', Math.max(0, Math.min(1, ratio)));
    });
  }

  openBtn.addEventListener('click', openDrawer);
  closeBtn.addEventListener('click', closeDrawer);

  drawer.addEventListener('click', (event) => {
    if (!sheet.contains(event.target)) closeDrawer();
  });

  drawer.addEventListener('cancel', (event) => {
    if (event.cancelable) {
      event.preventDefault();
      closeDrawer();
    }
  });
}

/* ==========================================================================
   BUSCADOR GLOBAL
   ========================================================================== */
function setupGlobalSearch() {
  const searchBar = document.getElementById('global-search-bar');
  const searchInput = document.getElementById('global-search-input');
  const searchClose = document.getElementById('global-search-close');
  const triggers = document.querySelectorAll('[data-open-global-search]');

  if (!searchBar || !searchInput) return;

  const openSearch = () => {
    searchBar.hidden = false;
    searchInput.focus();
  };

  const closeSearch = () => {
    searchInput.value = '';
    searchBar.hidden = true;
    navigateToSection(currentSectionId, { pushHash: false });
  };

  triggers.forEach((btn) => btn.addEventListener('click', openSearch));
  if (searchClose) searchClose.addEventListener('click', closeSearch);

  searchInput.addEventListener('input', (e) => {
    const val = e.target.value;
    if (!val.trim()) {
      navigateToSection(currentSectionId, { pushHash: false });
      return;
    }
    renderGlobalSearchResults(val, portalData, (secId) => {
      searchInput.value = '';
      searchBar.hidden = true;
      navigateToSection(secId);
    });
  });

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openSearch();
    } else if (e.key === 'Escape' && !searchBar.hidden) {
      closeSearch();
    }
  });
}

document.addEventListener('DOMContentLoaded', initPortal);
