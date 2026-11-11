/**
 * Servicio de Archivos (Firebase Cloud Storage + Alternativa Google Drive / Local DataURL)
 * Valida extensión (.pdf, .xlsx, .csv) y tamaño máximo (10 MB).
 */
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, isFirebaseConfigured } from '../config/firebase.js';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_EXTENSIONS = ['pdf', 'xlsx', 'csv'];

export function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes)) return '10 KB';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

export function validateWorkshopFile(file) {
  if (!file) {
    throw new Error('Selecciona un archivo válido.');
  }
  const ext = file.name.split('.').pop().toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error('Formato no permitido. Solo se aceptan archivos .PDF, .XLSX o .CSV');
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('El archivo supera el límite máximo permitido de 10 MB.');
  }
  return ext.toUpperCase();
}

/**
 * Sube el archivo a Firebase Cloud Storage si está disponible;
 * si Cloud Storage no está activo en el plan, genera un DataURL local o permite usar enlace de Google Drive.
 */
export async function uploadResourceFile(file) {
  const fileType = validateWorkshopFile(file);
  const fileSize = formatFileSize(file.size);
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

  if (isFirebaseConfigured && storage) {
    try {
      const storageRef = ref(storage, `workshop-resources/${safeName}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return {
        url: downloadUrl,
        fileName: file.name,
        fileType,
        fileSize,
      };
    } catch (err) {
      console.warn(
        'Cloud Storage no disponible en el plan actual, usando almacenamiento local para demostración:',
        err.message
      );
    }
  }

  // Fallback para modo sin Cloud Storage (plan gratuito Spark): DataURL hasta 700KB cabe dentro del límite de 1MB por documento de Firestore
  if (file.size <= 700 * 1024) {
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    return {
      url: dataUrl,
      fileName: file.name,
      fileType,
      fileSize,
    };
  }

  return {
    url: URL.createObjectURL(file),
    fileName: file.name,
    fileType,
    fileSize,
  };
}

/**
 * Normaliza un enlace compartido de Google Drive para facilitar su descarga o apertura directa
 */
export function normalizeGoogleDriveLink(rawUrl) {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();
  const match = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/uc?export=download&id=${match[1]}`;
  }
  return trimmed;
}
