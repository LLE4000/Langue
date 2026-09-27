/**
 * Connexion au serveur de Langue (server/, Worker Cloudflare) pour les salles en ligne.
 *
 * Le serveur n'existe que si l'application a été construite avec VITE_SERVER_URL ; sinon, tout ce qui est en ligne
 * est masqué et le reste de l'application fonctionne comme avant, hors ligne.
 *
 * RoomClient garde la connexion vivante : reconnexion automatique (délais croissants), présentation avec le même
 * identifiant (on retrouve sa place et son score), battement de cœur (« ping ») pour les réseaux mobiles qui coupent
 * les connexions silencieuses, et recalage de l'horloge sur celle du serveur pour les comptes à rebours.
 */
import type { ClientMsg, RoomInfo, RoomView, ServerMsg } from '../../../server/src/protocol';

export const SERVER_URL = ((import.meta.env.VITE_SERVER_URL as string | undefined) || '').replace(/\/+$/, '');
export const onlineAvailable = !!SERVER_URL;

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const ctl = new AbortController();
  const h = setTimeout(() => ctl.abort(), 8000);
  try {
    const r = await fetch(SERVER_URL + path, { ...init, signal: ctl.signal, cache: 'no-store' });
    const body = (await r.json().catch(() => ({}))) as T & { error?: string };
    if (!r.ok) throw Object.assign(new Error(body.error || `erreur ${r.status}`), { status: r.status });
    return body;
  } catch (e) {
    if ((e as Error).name === 'AbortError' || e instanceof TypeError) throw Object.assign(new Error('Serveur injoignable : vérifiez la connexion.'), { status: 0 });
    throw e;
  } finally { clearTimeout(h); }
}

export const createRoom = () => call<{ code: string }>('/rooms', { method: 'POST' });
export const roomInfo = (code: string) => call<RoomInfo>(`/rooms/${code}`);

/** Identifiant de joueur propre à cet appareil et à cette salle (retrouver sa place après une coupure). */
export function playerId(code: string): string {
  const k = `langue.online.${code}`;
  try {
    const cur = sessionStorage.getItem(k);
    if (cur) return cur;
    const id = Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, '0')).join('');
    sessionStorage.setItem(k, id);
    return id;
  } catch { return 'p' + Math.random().toString(36).slice(2, 14); }
}

export type LinkStatus = 'connecting' | 'open' | 'reconnecting' | 'closed';
export interface RoomEvents {
  state: (room: RoomView) => void;
  error: (e: Extract<ServerMsg, { t: 'error' }>) => void;
  status: (s: LinkStatus) => void;
}

export class RoomClient {
  private ws: WebSocket | null = null;
  private tries = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private beat: ReturnType<typeof setInterval> | null = null;
  private stopped = false;
  /** Décalage horloge serveur − horloge locale (ms). */
  offset = 0;

  constructor(readonly code: string, private readonly id: string, private name: string, private readonly on: RoomEvents) {}

  /** Heure du serveur estimée localement. */
  serverNow = () => Date.now() + this.offset;

  connect() {
    this.stopped = false;
    this.on.status(this.tries ? 'reconnecting' : 'connecting');
    const ws = new WebSocket(`${SERVER_URL.replace(/^http/, 'ws')}/rooms/${this.code}/ws`);
    this.ws = ws;
    ws.onopen = () => {
      this.tries = 0;
      this.on.status('open');
      this.send({ t: 'join', id: this.id, name: this.name });
      if (this.beat) clearInterval(this.beat);
      this.beat = setInterval(() => { if (ws.readyState === WebSocket.OPEN) ws.send('ping'); }, 25_000);
    };
    ws.onmessage = (e) => {
      if (e.data === 'pong') return;
      let m: ServerMsg;
      try { m = JSON.parse(String(e.data)); } catch { return; }
      if (m.t === 'state') { this.offset = m.room.now - Date.now(); this.on.state(m.room); }
      else if (m.t === 'error') { this.on.error(m); if (m.code === 'gone' || m.code === 'full') this.close(); }
    };
    ws.onclose = (e) => {
      if (this.beat) { clearInterval(this.beat); this.beat = null; }
      if (this.ws !== ws) return; // une connexion plus récente a pris le relais
      // 4404 : salle effacée ; 4000 : remplacée par une connexion plus récente du même joueur (autre onglet)
      if (this.stopped || e.code === 4404 || e.code === 4000) { this.on.status('closed'); if (e.code === 4404) this.on.error({ t: 'error', code: 'gone', msg: 'Cette salle n’existe plus.' }); return; }
      this.tries++;
      this.on.status('reconnecting');
      const delay = Math.min(10_000, 500 * 2 ** Math.min(this.tries, 5));
      this.timer = setTimeout(() => this.connect(), delay);
    };
  }

  send(m: ClientMsg) {
    if (this.ws?.readyState === WebSocket.OPEN) { this.ws.send(JSON.stringify(m)); return true; }
    return false;
  }

  rename(name: string) { this.name = name; this.send({ t: 'join', id: this.id, name }); }

  close() {
    this.stopped = true;
    if (this.timer) clearTimeout(this.timer);
    if (this.beat) clearInterval(this.beat);
    const ws = this.ws;
    this.ws = null;
    if (ws && ws.readyState <= WebSocket.OPEN) ws.close(1000, 'fin');
    this.on.status('closed');
  }
}
