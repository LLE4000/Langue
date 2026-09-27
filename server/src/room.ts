/**
 * Une salle = un Durable Object (un par code). Il garde l'état dans son stockage, accepte les WebSockets en mode
 * « hibernation » (il peut s'endormir entre deux messages sans couper les connexions, donc ne coûte presque rien) et
 * se réveille par une alarme à chaque échéance (fin du compte à rebours, de la manche, de la révélation) ou pour
 * s'effacer quand elle est abandonnée.
 */
import { DurableObject } from 'cloudflare:workers';
import { apply, disconnect, expired, info, newRoom, nextAlarm, parseClientMsg, tick, view, type Room as RoomState } from './game';
import type { ServerMsg } from './protocol';
import type { Env } from './env';

interface Attachment { id: string | null }

export class Room extends DurableObject<Env> {
  private state: RoomState | null | undefined;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    // battement de cœur des appareils : répondu sans réveiller l'objet (gratuit, ne compte pas comme activité)
    ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('ping', 'pong'));
  }

  private async load(): Promise<RoomState | null> {
    if (this.state === undefined) this.state = (await this.ctx.storage.get<RoomState>('room')) ?? null;
    return this.state;
  }

  private async save(room: RoomState) {
    this.state = room;
    await this.ctx.storage.put('room', room);
    await this.ctx.storage.setAlarm(nextAlarm(room));
  }

  private async wipe() {
    for (const ws of this.ctx.getWebSockets()) { try { ws.close(4404, 'salle fermée'); } catch { /* déjà fermée */ } }
    this.state = null;
    await this.ctx.storage.deleteAll();
    await this.ctx.storage.deleteAlarm();
  }

  private send(ws: WebSocket, msg: ServerMsg) {
    try { ws.send(JSON.stringify(msg)); } catch { /* connexion perdue : elle sera fermée */ }
  }

  private broadcast(room: RoomState) {
    const now = Date.now();
    for (const ws of this.ctx.getWebSockets()) {
      const a = ws.deserializeAttachment() as Attachment | null;
      if (a?.id) this.send(ws, { t: 'state', room: view(room, a.id, now) });
    }
  }

  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const code = url.searchParams.get('code') ?? '';
    const room = await this.load();
    if (url.pathname === '/init') {
      if (room) return new Response('exists', { status: 409 });
      await this.save(newRoom(code, Date.now()));
      return new Response('created', { status: 201 });
    }
    if (!room) return Response.json({ error: 'gone' }, { status: 404 });
    if (url.pathname === '/info') return Response.json(info(room));
    if (url.pathname === '/ws') {
      if (req.headers.get('Upgrade') !== 'websocket') return new Response('WebSocket attendu', { status: 426 });
      const { 0: client, 1: server } = new WebSocketPair();
      this.ctx.acceptWebSocket(server);
      server.serializeAttachment({ id: null } satisfies Attachment);
      return new Response(null, { status: 101, webSocket: client });
    }
    return new Response('introuvable', { status: 404 });
  }

  async webSocketMessage(ws: WebSocket, raw: string | ArrayBuffer) {
    const room = await this.load();
    if (!room) { this.send(ws, { t: 'error', code: 'gone', msg: 'Cette salle n’existe plus.' }); ws.close(4404, 'salle fermée'); return; }
    const msg = parseClientMsg(typeof raw === 'string' ? raw : null);
    if (!msg) { this.send(ws, { t: 'error', code: 'bad-msg', msg: 'Message illisible.' }); return; }
    const now = Date.now();
    if (msg.t === 'ping') { this.send(ws, { t: 'pong', now }); return; }
    const att = (ws.deserializeAttachment() as Attachment | null) ?? { id: null };
    if (msg.t === 'join' && att.id && att.id !== msg.id) { this.send(ws, { t: 'error', code: 'bad-msg', msg: 'Déjà présenté.' }); return; }
    const out = apply(room, att.id, msg, now);
    if (out.error) { this.send(ws, { t: 'error', ...out.error }); return; }
    if (msg.t === 'join') {
      // même joueur sur une connexion plus ancienne (onglet rouvert, réseau revenu) : on ferme l'ancienne
      for (const other of this.ctx.getWebSockets()) {
        if (other !== ws && (other.deserializeAttachment() as Attachment | null)?.id === msg.id) { other.serializeAttachment({ id: null } satisfies Attachment); try { other.close(4000, 'remplacée'); } catch { /* déjà fermée */ } }
      }
      ws.serializeAttachment({ id: msg.id } satisfies Attachment);
    }
    if (out.room === room) return; // rien n'a changé (réponse tardive…)
    await this.save(out.room);
    this.broadcast(out.room);
  }

  async webSocketClose(ws: WebSocket) { await this.closed(ws); }
  async webSocketError(ws: WebSocket) { await this.closed(ws); }

  private async closed(ws: WebSocket) {
    const id = (ws.deserializeAttachment() as Attachment | null)?.id;
    ws.serializeAttachment({ id: null } satisfies Attachment);
    const room = await this.load();
    if (!room || !id) return;
    // une autre connexion du même joueur reste ouverte : il n'est pas parti
    if (this.ctx.getWebSockets().some((o) => o !== ws && (o.deserializeAttachment() as Attachment | null)?.id === id)) return;
    const next = disconnect(room, id, Date.now());
    if (next === room) return;
    await this.save(next);
    this.broadcast(next);
  }

  async alarm() {
    const room = await this.load();
    if (!room) return;
    const now = Date.now();
    if (expired(room, now)) { await this.wipe(); return; }
    const next = tick(room, now);
    await this.save(next); // reprogramme l'alarme même si rien n'a changé (échéance d'effacement)
    if (next !== room) this.broadcast(next);
  }
}
