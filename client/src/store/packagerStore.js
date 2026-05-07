/**
 * packagerStore.js
 * Dedicated store for packager registration data including uploaded documents.
 * Stored separately in localStorage under key 'pn_packager_registrations'.
 */

const STORE_KEY = 'pn_packager_registrations';

function readAll() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); } catch { return []; }
}

function writeAll(data) {
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

/** Save a packager registration with all details + documents */
export function savePackagerRegistration(registration) {
  const all = readAll();
  const existing = all.findIndex(r => r.email === registration.email);
  if (existing >= 0) {
    all[existing] = { ...all[existing], ...registration, updatedAt: Date.now() };
  } else {
    all.push({ ...registration, savedAt: Date.now() });
  }
  writeAll(all);
}

/** Get all packager registrations */
export function getAllPackagerRegistrations() {
  return readAll();
}

/** Get a single registration by email */
export function getPackagerRegistrationByEmail(email) {
  return readAll().find(r => r.email === email) || null;
}

/** Get a single registration by userId (set after backend register) */
export function getPackagerRegistrationByUserId(userId) {
  return readAll().find(r => r.userId === userId) || null;
}

/** Link a userId to a registration after backend responds */
export function linkUserIdToRegistration(email, userId) {
  const all = readAll();
  const idx = all.findIndex(r => r.email === email);
  if (idx >= 0) { all[idx].userId = userId; writeAll(all); }
}

/** Convert a File to base64 string */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, type: file.type, size: file.size, data: reader.result });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
