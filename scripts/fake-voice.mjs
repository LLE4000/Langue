// Fabrique un fichier WAV « quelqu'un lit des syllabes » à partir des voix natives (pour tester le tapis de lecture
// avec un faux micro : chromium --use-file-for-fake-audio-capture). Usage : BASE=… node scripts/fake-voice.mjs out.wav ดา มา นา…
import { chromium } from '@playwright/test';
import { writeFileSync, existsSync } from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:4173';
const [out, ...texts] = process.argv.slice(2);
const norm = (s) => s.normalize('NFC').replace(/\.\.\.|…/g, ' ').replace(/\s+/g, ' ').trim();
function clipKey(text) {
  const t = norm(text);
  const fnv = (seed) => { let h = seed >>> 0; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(16).padStart(8, '0'); };
  return fnv(0x811c9dc5) + fnv(0x01000193);
}
const files = texts.map((t) => ({ t, k: clipKey(t) })).filter((x) => existsSync(`public/voices/m/${x.k}.mp3`));
console.log(`${files.length}/${texts.length} clips trouvés :`, files.map((f) => f.t).join(' '));
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
await page.goto(BASE + '/');
const b64 = await page.evaluate(async ({ keys, base }) => {
  const ac = new OfflineAudioContext(1, 16000, 16000);
  const bufs = [];
  for (const k of keys) { const r = await fetch(`${base}/voices/m/${k}.mp3`); bufs.push(await ac.decodeAudioData(await r.arrayBuffer())); }
  const sr = 16000, gap = Math.round(sr * 0.75), lead = sr * 2;
  const res = (b) => { const d = b.getChannelData(0), ratio = b.sampleRate / sr, n = Math.floor(d.length / ratio), o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = d[Math.floor(i * ratio)]; return o; };
  const parts = bufs.map(res);
  const total = lead + parts.reduce((a, p) => a + p.length + gap, 0);
  const x = new Float32Array(total);
  let o = lead; for (const p of parts) { x.set(p, o); o += p.length + gap; }
  const pcm = new Int16Array(x.length); for (let i = 0; i < x.length; i++) pcm[i] = Math.max(-1, Math.min(1, x[i] * 1.4)) * 0x7fff;
  const buf = new ArrayBuffer(44 + pcm.length * 2), v = new DataView(buf);
  const w = (off, s) => { for (let i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i)); };
  w(0, 'RIFF'); v.setUint32(4, 36 + pcm.length * 2, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, pcm.length * 2, true);
  new Int16Array(buf, 44).set(pcm);
  let s = ''; const u8 = new Uint8Array(buf); for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode(...u8.subarray(i, i + 0x8000));
  return btoa(s);
}, { keys: files.map((f) => f.k), base: BASE });
writeFileSync(out, Buffer.from(b64, 'base64'));
console.log('écrit', out);
await browser.close();
