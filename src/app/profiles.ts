/**
 * Plusieurs personnes sur le même appareil : un petit registre (localStorage, synchrone) dit quel profil
 * est actif ; chaque profil a sa propre base IndexedDB (`langue-v1` pour le premier, `langue-v1:<id>` ensuite).
 * Changer de profil = changer la clé de stockage puis recharger l'application.
 */
import { del as idbDel } from 'idb-keyval';

export interface ProfileEntry { id: string; name: string; createdAt: number }
export interface Registry { active: string; list: ProfileEntry[] }

const KEY = 'langue-profiles';
export const DEFAULT_ID = 'default';

const fresh = (): Registry => ({ active: DEFAULT_ID, list: [{ id: DEFAULT_ID, name: '', createdAt: Date.now() }] });

export function readRegistry(): Registry {
  try {
    const r = JSON.parse(localStorage.getItem(KEY) ?? '') as Registry;
    if (r && typeof r.active === 'string' && Array.isArray(r.list) && r.list.length && r.list.some((p) => p.id === r.active)) return r;
  } catch { /* pas de registre : premier profil */ }
  return fresh();
}

function write(r: Registry) { try { localStorage.setItem(KEY, JSON.stringify(r)); } catch { /* stockage indisponible : on reste sur le profil par défaut */ } }

export const storageKeyFor = (id: string) => (id === DEFAULT_ID ? 'langue-v1' : `langue-v1:${id}`);
export const activeProfileId = () => readRegistry().active;

/** Le prénom saisi dans le profil est recopié dans le registre (pour l'écran de choix). */
export function syncActiveName(name: string) {
  const r = readRegistry();
  const p = r.list.find((x) => x.id === r.active);
  if (p && p.name !== name) { p.name = name; write(r); }
}

export function createProfile(): string {
  const r = readRegistry();
  const id = 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  r.list.push({ id, name: '', createdAt: Date.now() });
  r.active = id;
  write(r);
  return id;
}

export function switchProfile(id: string) {
  const r = readRegistry();
  if (!r.list.some((p) => p.id === id)) return;
  r.active = id;
  write(r);
}

export async function deleteProfile(id: string) {
  const r = readRegistry();
  try { await idbDel(storageKeyFor(id)); } catch { /* déjà absent */ }
  r.list = r.list.filter((p) => p.id !== id);
  if (!r.list.length) r.list.push({ id: DEFAULT_ID, name: '', createdAt: Date.now() });
  if (r.active === id) r.active = r.list[0].id;
  write(r);
}

/** Recharge l'application sur l'accueil (le magasin d'état se reconstruit avec la clé du profil actif). */
export function reloadToHome() {
  location.hash = '#/';
  location.reload();
}
