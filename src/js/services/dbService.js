/**
 * Servicio de Base de Datos (Firestore + Persistencia Local Híbrida con Seed Data)
 * Garantiza que los datos base (INITIAL_SEED_DATA) nunca desaparezcan al agregar un nuevo
 * prompt o archivo en una base de datos de Firestore recién creada, y sincroniza todo automáticamente.
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

const STORAGE_KEY = 'gemini_ambassador_portal_data_v3';
const DELETED_IDS_KEY = 'gemini_ambassador_deleted_ids_v3';

function getDeletedIds() {
  try {
    return JSON.parse(localStorage.getItem(DELETED_IDS_KEY) || '[]');
  } catch {
    return [];
  }
}

function addDeletedId(id) {
  const current = new Set(getDeletedIds());
  current.add(id);
  localStorage.setItem(DELETED_IDS_KEY, JSON.stringify([...current]));
}

function clearDeletedIds() {
  localStorage.removeItem(DELETED_IDS_KEY);
}

/**
 * Une de forma segura los elementos base (Seed), los locales y los de Firestore por ID,
 * sin perder nunca los elementos previamente cargados.
 */
function mergeItemsById(seedArr = [], localArr = [], remoteArr = [], deletedIds = []) {
  const deletedSet = new Set(deletedIds);
  const map = new Map();

  for (const item of seedArr) {
    if (item?.id && !deletedSet.has(item.id)) {
      map.set(item.id, { ...item });
    }
  }
  for (const item of localArr) {
    if (item?.id && !deletedSet.has(item.id)) {
      map.set(item.id, { ...(map.get(item.id) || {}), ...item });
    }
  }
  for (const item of remoteArr) {
    if (item?.id && !deletedSet.has(item.id)) {
      map.set(item.id, { ...(map.get(item.id) || {}), ...item });
    }
  }

  return [...map.values()].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
}

/**
 * Obtiene el estado local almacenado en localStorage combinado con INITIAL_SEED_DATA
 */
function getLocalData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const deletedIds = getDeletedIds();
    if (!raw) {
      const initial = structuredClone(INITIAL_SEED_DATA);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return {
      siteSettings: { ...INITIAL_SEED_DATA.siteSettings, ...(parsed.siteSettings || {}) },
      partsCards: mergeItemsById(INITIAL_SEED_DATA.partsCards, parsed.partsCards, [], deletedIds),
      blocks: mergeItemsById(INITIAL_SEED_DATA.blocks, parsed.blocks, [], deletedIds),
      prompts: mergeItemsById(INITIAL_SEED_DATA.prompts, parsed.prompts, [], deletedIds),
      links: mergeItemsById(INITIAL_SEED_DATA.links, parsed.links, [], deletedIds),
      files: mergeItemsById(INITIAL_SEED_DATA.files, parsed.files, [], deletedIds),
      faqs: mergeItemsById(INITIAL_SEED_DATA.faqs, parsed.faqs, [], deletedIds),
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
 * Carga todos los datos del portal combinando Seed + Local + Firestore para que jamás quede vacío
 */
export async function fetchAllPortalData({ includeDrafts = false } = {}) {
  const local = getLocalData();
  const deletedIds = getDeletedIds();

  if (isFirebaseConfigured && db) {
    try {
      const [settingsSnap, partsSnap, blocksSnap, promptsSnap, linksSnap, filesSnap, faqsSnap, metaSnap] =
        await Promise.all([
          getDoc(doc(db, 'settings', 'siteSettings')),
          getDocs(collection(db, 'partsCards')),
          getDocs(collection(db, 'blocks')),
          getDocs(collection(db, 'prompts')),
          getDocs(collection(db, 'links')),
          getDocs(collection(db, 'files')),
          getDocs(collection(db, 'faqs')),
          getDoc(doc(db, 'settings', 'deletedMeta')),
        ]);

      const remoteDeleted = metaSnap.exists() ? metaSnap.data().ids || [] : [];
      const allDeleted = [...new Set([...deletedIds, ...remoteDeleted])];

      const snapToArr = (snap) =>
        snap.empty ? [] : snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const merged = {
        siteSettings: settingsSnap.exists()
          ? { ...INITIAL_SEED_DATA.siteSettings, ...local.siteSettings, ...settingsSnap.data() }
          : local.siteSettings,
        partsCards: mergeItemsById(
          INITIAL_SEED_DATA.partsCards,
          local.partsCards,
          snapToArr(partsSnap),
          allDeleted
        ),
        blocks: mergeItemsById(
          INITIAL_SEED_DATA.blocks,
          local.blocks,
          snapToArr(blocksSnap),
          allDeleted
        ),
        prompts: mergeItemsById(
          INITIAL_SEED_DATA.prompts,
          local.prompts,
          snapToArr(promptsSnap),
          allDeleted
        ),
        links: mergeItemsById(
          INITIAL_SEED_DATA.links,
          local.links,
          snapToArr(linksSnap),
          allDeleted
        ),
        files: mergeItemsById(
          INITIAL_SEED_DATA.files,
          local.files,
          snapToArr(filesSnap),
          allDeleted
        ),
        faqs: mergeItemsById(
          INITIAL_SEED_DATA.faqs,
          local.faqs,
          snapToArr(faqsSnap),
          allDeleted
        ),
      };

      saveLocalData(merged);
      return filterByPublished(merged, includeDrafts);
    } catch (err) {
      console.warn('Usando datos locales / seed combinados:', err.message);
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
 * Si una colección en Firestore aún no tiene los elementos base (Seed), los sube en lote
 * junto con el nuevo elemento para que jamás se borren los anteriores.
 */
async function ensureCollectionSeededAndSave(collectionName, fullList, itemToSave) {
  if (!isFirebaseConfigured || !db) return;
  const batch = writeBatch(db);
  for (const existingItem of fullList) {
    batch.set(doc(db, collectionName, existingItem.id), existingItem, { merge: true });
  }
  batch.set(doc(db, collectionName, itemToSave.id), itemToSave, { merge: true });
  await batch.commit();
}

/**
 * Guarda o actualiza un documento en una colección (prompts, links, files, blocks, partsCards, faqs)
 * conservando todos los documentos previos.
 */
export async function saveCollectionItem(collectionName, item) {
  const local = getLocalData();
  const list = [...(local[collectionName] || [])];
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

  await ensureCollectionSeededAndSave(collectionName, list, itemWithId);

  return itemWithId;
}

/**
 * Elimina un elemento de una colección (y registra su ID como eliminado por si era del Seed)
 */
export async function deleteCollectionItem(collectionName, itemId) {
  addDeletedId(itemId);
  const local = getLocalData();
  local[collectionName] = (local[collectionName] || []).filter((i) => i.id !== itemId);
  saveLocalData(local);

  if (isFirebaseConfigured && db) {
    await deleteDoc(doc(db, collectionName, itemId));
    await setDoc(
      doc(db, 'settings', 'deletedMeta'),
      { ids: getDeletedIds() },
      { merge: true }
    );
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
    for (const item of list) {
      batch.set(doc(db, collectionName, item.id), item, { merge: true });
    }
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
 * Restaura y sincroniza todos los datos iniciales (Seed) sin borrar los nuevos creados por el admin
 */
export async function resetOrSeedDatabase() {
  clearDeletedIds();
  const local = getLocalData();
  const merged = {
    siteSettings: { ...INITIAL_SEED_DATA.siteSettings, ...local.siteSettings },
    partsCards: mergeItemsById(INITIAL_SEED_DATA.partsCards, local.partsCards, [], []),
    blocks: mergeItemsById(INITIAL_SEED_DATA.blocks, local.blocks, [], []),
    prompts: mergeItemsById(INITIAL_SEED_DATA.prompts, local.prompts, [], []),
    links: mergeItemsById(INITIAL_SEED_DATA.links, local.links, [], []),
    files: mergeItemsById(INITIAL_SEED_DATA.files, local.files, [], []),
    faqs: mergeItemsById(INITIAL_SEED_DATA.faqs, local.faqs, [], []),
  };
  saveLocalData(merged);

  if (isFirebaseConfigured && db) {
    const batch = writeBatch(db);
    batch.set(doc(db, 'settings', 'siteSettings'), merged.siteSettings);
    batch.set(doc(db, 'settings', 'deletedMeta'), { ids: [] });

    const collections = ['partsCards', 'blocks', 'prompts', 'links', 'files', 'faqs'];
    for (const col of collections) {
      for (const item of merged[col]) {
        batch.set(doc(db, col, item.id), item, { merge: true });
      }
    }
    await batch.commit();
  }
  return merged;
}
