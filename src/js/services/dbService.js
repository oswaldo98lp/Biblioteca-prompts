/**
 * Servicio de Base de Datos (Firestore + Persistencia Local Híbrida con Seed Data)
 * Permite consultar y administrar Links, Prompts, Archivos, Bloques, Tarjetas PARTS, FAQs y Configuración.
 */
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase.js';
import { INITIAL_SEED_DATA } from '../data/seedData.js';

const STORAGE_KEY = 'gemini_ambassador_portal_data_v1';

/**
 * Obtiene el estado local almacenado en localStorage o inicializa con INITIAL_SEED_DATA
 */
function getLocalData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_DATA));
      return structuredClone(INITIAL_SEED_DATA);
    }
    const parsed = JSON.parse(raw);
    return {
      siteSettings: { ...INITIAL_SEED_DATA.siteSettings, ...(parsed.siteSettings || {}) },
      partsCards: parsed.partsCards || INITIAL_SEED_DATA.partsCards,
      blocks: parsed.blocks || INITIAL_SEED_DATA.blocks,
      prompts: parsed.prompts || INITIAL_SEED_DATA.prompts,
      links: parsed.links || INITIAL_SEED_DATA.links,
      files: parsed.files || INITIAL_SEED_DATA.files,
      faqs: parsed.faqs || INITIAL_SEED_DATA.faqs,
    };
  } catch (err) {
    console.warn('Error leyendo localStorage, usando seedData:', err);
    return structuredClone(INITIAL_SEED_DATA);
  }
}

function saveLocalData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Error guardando en localStorage:', err);
  }
}

/**
 * Carga todos los datos del portal (desde Firestore si está configurado, o localStorage/seed como respaldo)
 */
export async function fetchAllPortalData({ includeDrafts = false } = {}) {
  const local = getLocalData();

  if (isFirebaseConfigured && db) {
    try {
      const [settingsSnap, partsSnap, blocksSnap, promptsSnap, linksSnap, filesSnap, faqsSnap] =
        await Promise.all([
          getDoc(doc(db, 'settings', 'siteSettings')),
          getDocs(collection(db, 'partsCards')),
          getDocs(collection(db, 'blocks')),
          getDocs(collection(db, 'prompts')),
          getDocs(collection(db, 'links')),
          getDocs(collection(db, 'files')),
          getDocs(collection(db, 'faqs')),
        ]);

      const hasFirestoreContent =
        settingsSnap.exists() || !promptsSnap.empty || !partsSnap.empty;

      if (hasFirestoreContent) {
        const mapSnap = (snap, fallbackArr) => {
          if (snap.empty) return fallbackArr;
          return snap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
        };

        const merged = {
          siteSettings: settingsSnap.exists()
            ? { ...INITIAL_SEED_DATA.siteSettings, ...settingsSnap.data() }
            : local.siteSettings,
          partsCards: mapSnap(partsSnap, local.partsCards),
          blocks: mapSnap(blocksSnap, local.blocks),
          prompts: mapSnap(promptsSnap, local.prompts),
          links: mapSnap(linksSnap, local.links),
          files: mapSnap(filesSnap, local.files),
          faqs: mapSnap(faqsSnap, local.faqs),
        };

        saveLocalData(merged);
        return filterByPublished(merged, includeDrafts);
      }
    } catch (err) {
      console.warn('Usando datos locales / seed (Firestore aún sin inicializar o reglas pendientes):', err.message);
    }
  }

  return filterByPublished(local, includeDrafts);
}

function filterByPublished(data, includeDrafts) {
  const sortByOrder = (arr) => [...arr].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  if (includeDrafts) {
    return {
      siteSettings: data.siteSettings,
      partsCards: sortByOrder(data.partsCards),
      blocks: sortByOrder(data.blocks),
      prompts: sortByOrder(data.prompts),
      links: sortByOrder(data.links),
      files: sortByOrder(data.files),
      faqs: sortByOrder(data.faqs),
    };
  }
  const onlyPub = (arr) => sortByOrder(arr.filter((item) => item.published !== false));
  return {
    siteSettings: data.siteSettings,
    partsCards: onlyPub(data.partsCards),
    blocks: onlyPub(data.blocks),
    prompts: onlyPub(data.prompts),
    links: onlyPub(data.links),
    files: onlyPub(data.files),
    faqs: onlyPub(data.faqs),
  };
}

/**
 * Guarda o actualiza un documento en una colección (prompts, links, files, blocks, partsCards, faqs)
 */
export async function saveCollectionItem(collectionName, item) {
  const local = getLocalData();
  const list = local[collectionName] || [];
  const itemWithId = {
    ...item,
    id: item.id || `${collectionName}-${Date.now()}`,
    order: Number(item.order ?? list.length + 1),
    published: item.published !== false,
    updatedAt: new Date().toISOString(),
  };

  const idx = list.findIndex((i) => i.id === itemWithId.id);
  if (idx >= 0) {
    list[idx] = itemWithId;
  } else {
    list.push(itemWithId);
  }
  local[collectionName] = list;
  saveLocalData(local);

  if (isFirebaseConfigured && db) {
    await setDoc(doc(db, collectionName, itemWithId.id), itemWithId, { merge: true });
  }

  return itemWithId;
}

/**
 * Elimina un elemento de una colección
 */
export async function deleteCollectionItem(collectionName, itemId) {
  const local = getLocalData();
  local[collectionName] = (local[collectionName] || []).filter((i) => i.id !== itemId);
  saveLocalData(local);

  if (isFirebaseConfigured && db) {
    await deleteDoc(doc(db, collectionName, itemId));
  }
}

/**
 * Cambia el orden de un elemento (subir o bajar posición)
 */
export async function moveCollectionItemOrder(collectionName, itemId, direction) {
  const local = getLocalData();
  const list = [...(local[collectionName] || [])].sort(
    (a, b) => (a.order ?? 999) - (b.order ?? 999)
  );
  const index = list.findIndex((i) => i.id === itemId);
  if (index === -1) return;

  const swapIndex = direction === 'up' ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= list.length) return;

  // Normalizar órdenes secuenciales y hacer swap
  list.forEach((item, idx) => {
    item.order = idx + 1;
  });
  const tempOrder = list[index].order;
  list[index].order = list[swapIndex].order;
  list[swapIndex].order = tempOrder;

  local[collectionName] = list;
  saveLocalData(local);

  if (isFirebaseConfigured && db) {
    const batch = writeBatch(db);
    batch.set(doc(db, collectionName, list[index].id), list[index], { merge: true });
    batch.set(doc(db, collectionName, list[swapIndex].id), list[swapIndex], { merge: true });
    await batch.commit();
  }
}

/**
 * Guarda la configuración general de Inicio y Práctica de prueba
 */
export async function saveSiteSettings(newSettings) {
  const local = getLocalData();
  local.siteSettings = { ...local.siteSettings, ...newSettings };
  saveLocalData(local);

  if (isFirebaseConfigured && db) {
    await setDoc(doc(db, 'settings', 'siteSettings'), local.siteSettings, { merge: true });
  }
  return local.siteSettings;
}

/**
 * Restaura o sincroniza los datos iniciales (Seed) hacia localStorage y Firestore
 */
export async function resetOrSeedDatabase() {
  saveLocalData(structuredClone(INITIAL_SEED_DATA));

  if (isFirebaseConfigured && db) {
    const batch = writeBatch(db);
    batch.set(doc(db, 'settings', 'siteSettings'), INITIAL_SEED_DATA.siteSettings);

    const collections = ['partsCards', 'blocks', 'prompts', 'links', 'files', 'faqs'];
    for (const col of collections) {
      for (const item of INITIAL_SEED_DATA[col]) {
        batch.set(doc(db, col, item.id), item);
      }
    }
    await batch.commit();
  }
  return structuredClone(INITIAL_SEED_DATA);
}
