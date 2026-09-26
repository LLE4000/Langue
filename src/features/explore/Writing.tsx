/**
 * Écriture au doigt : modèle en filigrane, tracé, comparaison géométrique (recouvrement).
 * L'ordre et le sens des traits ne sont pas vérifiés : la mesure affichée le dit clairement.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { CONS_ITEMS, TAUGHT_VOWELS, vowelDisplay, CONS_BY_CHAR, th } from '@/content/th';
import { useSpeaker } from '@/app/services/speech';
import { useStore } from '@/app/store';
import { T } from '@/i18n';
import { Icon, Rom, Segmented, Thai, useToast } from '@/components/ui';

type SetKind = 'cons' | 'vow' | 'dig';
type Pt = { x: number; y: number };

function coverage(mask: CanvasRenderingContext2D, user: CanvasRenderingContext2D, px: number) {
  const N = 40, cell = px / N, m = mask.getImageData(0, 0, px, px).data, u = user.getImageData(0, 0, px, px).data, M = new Uint8Array(N * N), U = new Uint8Array(N * N);
  for (let y = 0; y < px; y += 2) for (let x = 0; x < px; x += 2) { const a = (y * px + x) * 4 + 3, k = Math.min(N - 1, Math.floor(y / cell)) * N + Math.min(N - 1, Math.floor(x / cell)); if (m[a] > 60) M[k] = 1; if (u[a] > 60) U[k] = 1; }
  const near = (G: Uint8Array, k: number) => { const y = Math.floor(k / N), x = k % N; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const yy = y + dy, xx = x + dx; if (yy >= 0 && yy < N && xx >= 0 && xx < N && G[yy * N + xx]) return true; } return false; };
  let mc = 0, mh = 0, uc = 0, uo = 0;
  for (let k = 0; k < N * N; k++) { if (M[k]) { mc++; if (near(U, k)) mh++; } if (U[k]) { uc++; if (!near(M, k)) uo++; } }
  return { covered: mc ? mh / mc : 0, outside: uc ? uo / uc : 0 };
}

export function Writing() {
  const t = T();
  usePage(t.explore.writing, { back: '/explore' });
  const [sp] = useSearchParams();
  const speaker = useSpeaker();
  const toast = useToast((s) => s.show);
  const [set, setSet] = useState<SetKind>('cons');
  const [i, setI] = useState(0);
  const [model, setModel] = useState(true);
  const [answer, setAnswer] = useState(false);
  const [res, setRes] = useState<{ covered: number; outside: number } | null>(null);
  const strokes = useRef<Pt[][]>([]);
  const cur = useRef<Pt[] | null>(null);
  const bg = useRef<HTMLCanvasElement>(null), fg = useRef<HTMLCanvasElement>(null), mask = useRef<HTMLCanvasElement | null>(null);
  const modern = useStore((s) => s.settings.showModern);
  const chars = set === 'cons' ? CONS_ITEMS.map((c) => c.thai) : set === 'vow' ? TAUGHT_VOWELS.map((v) => vowelDisplay(v.form)) : th.DIGITS.map((d) => d[0]);
  const c = chars[Math.min(i, chars.length - 1)];

  useEffect(() => {
    const want = sp.get('c');
    if (!want) return;
    for (const s of ['cons', 'vow', 'dig'] as SetKind[]) {
      const list = s === 'cons' ? CONS_ITEMS.map((x) => x.thai) : s === 'vow' ? TAUGHT_VOWELS.map((v) => vowelDisplay(v.form)) : th.DIGITS.map((d) => d[0]);
      const k = list.indexOf(want);
      if (k >= 0) { setSet(s); setI(k); break; }
    }
  }, [sp]);

  const drawBg = useCallback(() => {
    const b = bg.current; if (!b) return;
    const px = b.width, ctx = b.getContext('2d')!, css = getComputedStyle(document.documentElement);
    const ink = css.getPropertyValue('--ink').trim(), line = css.getPropertyValue('--line').trim(), jade = css.getPropertyValue('--jade').trim();
    const glyph = (cx: CanvasRenderingContext2D, color: string, alpha: number) => { let fs = px * 0.62; cx.font = `500 ${fs}px "Sarabun", sans-serif`; const w = cx.measureText(c).width; if (w > px * 0.8) { fs *= (px * 0.8) / w; cx.font = `500 ${fs}px "Sarabun", sans-serif`; } cx.textAlign = 'center'; cx.textBaseline = 'alphabetic'; cx.globalAlpha = alpha; cx.fillStyle = color; cx.fillText(c, px / 2, px * 0.68); cx.globalAlpha = 1; };
    ctx.clearRect(0, 0, px, px); ctx.strokeStyle = line; ctx.lineWidth = Math.max(1, px / 300); ctx.setLineDash([px / 60, px / 60]);
    [0.3, 0.7].forEach((y) => { ctx.beginPath(); ctx.moveTo(px * 0.05, px * y); ctx.lineTo(px * 0.95, px * y); ctx.stroke(); }); ctx.setLineDash([]);
    if (answer) glyph(ctx, jade, 0.6); else if (model) glyph(ctx, ink, 0.14);
    if (!mask.current) mask.current = document.createElement('canvas');
    mask.current.width = mask.current.height = px;
    const mx = mask.current.getContext('2d', { willReadFrequently: true })!; mx.clearRect(0, 0, px, px); glyph(mx, '#000', 1);
  }, [c, model, answer]);
  const drawFg = useCallback(() => {
    const f = fg.current; if (!f) return;
    const ctx = f.getContext('2d')!, px = f.width; ctx.clearRect(0, 0, px, px);
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim(); ctx.lineWidth = px / 28; ctx.lineCap = ctx.lineJoin = 'round';
    strokes.current.forEach((s) => { ctx.beginPath(); s.forEach((p, k) => (k ? ctx.lineTo(p.x * px, p.y * px) : ctx.moveTo(p.x * px, p.y * px))); if (s.length === 1) ctx.lineTo(s[0].x * px + 0.1, s[0].y * px); ctx.stroke(); });
  }, []);
  useEffect(() => {
    const f = fg.current, b = bg.current; if (!f || !b) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5), px = Math.max(200, Math.round(f.clientWidth * dpr));
    b.width = b.height = f.width = f.height = px;
    drawBg(); drawFg();
    if (document.fonts?.load) document.fonts.load('500 80px "Sarabun"', c).then(drawBg).catch(() => {});
  }, [drawBg, drawFg, c]);
  const pt = (e: React.PointerEvent): Pt => { const r = fg.current!.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }; };
  const reset = () => { strokes.current = []; setRes(null); setAnswer(false); drawFg(); };
  const pick = (k: number) => { setI(k); reset(); };
  const check = () => {
    if (!strokes.current.length) return toast('Tracez d’abord le caractère au doigt.');
    const r = coverage(mask.current!.getContext('2d')!, fg.current!.getContext('2d', { willReadFrequently: true })!, fg.current!.width);
    setRes(r);
    useStore.getState().addXp(r.covered > 0.6 && r.outside < 0.4 ? 3 : 1);
  };
  const say = () => speaker.speak(set === 'cons' ? CONS_BY_CHAR[c].audioBase + 'อ ' + CONS_BY_CHAR[c].nameWord : c);
  return (
    <>
      <Segmented value={set} options={[{ v: 'cons', label: 'Consonnes' }, { v: 'vow', label: 'Voyelles' }, { v: 'dig', label: 'Chiffres' }]} onChange={(v) => { setSet(v); setI(0); reset(); }} />
      <div className="strip" style={{ marginTop: 8 }}>{chars.map((x, k) => <button key={x + k} className={k === i ? 'on' : ''} onClick={() => pick(k)} lang="th">{x}</button>)}</div>
      <div className="wpad">
        <canvas ref={bg} />
        <canvas ref={fg} className="fg" aria-label="Zone de dessin"
          onPointerDown={(e) => { e.preventDefault(); try { fg.current!.setPointerCapture(e.pointerId); } catch { /* ignore */ } cur.current = [pt(e)]; strokes.current.push(cur.current); setRes(null); drawFg(); }}
          onPointerMove={(e) => { if (!cur.current) return; e.preventDefault(); cur.current.push(pt(e)); drawFg(); }}
          onPointerUp={() => { cur.current = null; }} onPointerCancel={() => { cur.current = null; }} onPointerLeave={() => { cur.current = null; }} />
      </div>
      <div className="btns mt-3"><button className="ib" onClick={say} aria-label="Écouter"><Icon name="speaker" /></button><button className="btn ghost sm" aria-pressed={model} onClick={() => setModel(!model)}><Icon name="eye" size={16} /> Filigrane</button><button className="btn ghost sm" aria-pressed={answer} onClick={() => setAnswer(!answer)}><Icon name="bulb" size={16} /> Superposer</button><button className="btn ghost sm" onClick={reset}><Icon name="rotate" size={16} /> Effacer</button></div>
      {set === 'cons' && CONS_BY_CHAR[c] && <p className="sm mut ctr mt-2"><Thai text={c + ' ' + CONS_BY_CHAR[c].nameWord} className="th-s ink" /> <Rom text={CONS_BY_CHAR[c].nameRom} /></p>}
      <div className="btns mt-2"><button className="btn soft sm auto" onClick={() => pick((i - 1 + chars.length) % chars.length)} aria-label="Précédent"><Icon name="back" size={18} /></button><button className="btn sm" onClick={check}>Comparer au modèle</button><button className="btn soft sm auto" onClick={() => pick((i + 1) % chars.length)} aria-label="Suivant"><Icon name="next" size={18} /></button></div>
      {res && <div className={`note ${res.covered > 0.6 && res.outside < 0.4 ? 'info' : 'plain'}`}>{res.covered > 0.6 && res.outside < 0.4 ? <span className="verdict ok"><Icon name="check" />Bien tracé</span> : <b>À reprendre</b>} · modèle recouvert à {Math.round(res.covered * 100)} %, traits hors modèle {Math.round(res.outside * 100)} %<br /><span className="xs mut">Mesure géométrique indicative. L’ordre et le sens des traits ne sont pas vérifiés.</span></div>}
      {set === 'cons' && <div className="note info mt-3">On commence par la petite boucle (la « tête », <Thai text="หัว" />), puis on trace le reste d’un seul geste, en général de gauche à droite. Seules <Thai text="ก" /> et <Thai text="ธ" /> n’ont pas de tête.{modern && set === 'cons' ? <> Forme moderne, sans boucle : <span className="thm th-m" lang="th">{c}</span></> : null}</div>}
    </>
  );
}
