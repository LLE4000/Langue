/** Mot à mot en couleurs : chaque mot thaï, sa transcription et son sens portent la même couleur. */
import { useMemo } from 'react';
import { lexicon } from '@/content/th';
import { wbwSplit } from '@/engine/wbw';
import { resolveTokens } from '@/engine/tokens';
import { useTokens, sizeClass, Rom } from './ui';

/** Segment « … » : une place à remplir (prénom, nombre…), pas un mot. */
const SLOT = '…';

export function useWbw(thai: string, rom: string) {
  const tok = useTokens();
  return useMemo(() => {
    try {
      const seg = wbwSplit(resolveTokens(thai, tok), resolveTokens(rom, tok), lexicon());
      if (!seg || seg.length < 2) return null;
      let c = -1;
      // Les places à remplir et les mots sans sens connu ne consomment pas de couleur
      return seg.map((x) => ({ ...x, cls: x.fr === SLOT ? 'wx slot' : x.fr == null ? 'wx' : 'w' + (c = (c + 1) % 6) }));
    } catch { return null; }
  }, [thai, rom, tok]);
}

/**
 * `lines` : afficher aussi la phrase entière colorée (thaï + transcription) au-dessus des pastilles ; faux quand la
 * phrase est déjà affichée juste au-dessus (verso de carte). `big` : la phrase est le sujet principal de la carte.
 */
export function WordByWord({ thai, rom, chips = true, big, lines = true }: { thai: string; rom: string; chips?: boolean; big?: boolean; lines?: boolean }) {
  const seg = useWbw(thai, rom);
  const tok = useTokens();
  if (!seg) {
    const t = resolveTokens(thai, tok), r = resolveTokens(rom, tok);
    // Pas de découpage possible : en grand, la phrase garde la hiérarchie d'une révélation (thaï au-dessus de la transcription)
    const sc = sizeClass(t);
    if (big) return <><div className={`big ${sc === 's1' || sc === 's2' ? 's3' : sc}`}><span className="th" lang="th">{t}</span></div>{r && <Rom text={r} className="reveal" />}</>;
    if (!lines) return null;
    return <><span className="th" lang="th">{t}</span><Rom text={r} className="block" /></>;
  }
  return (
    <>
      {lines && <span className={`th ${big ? 'big s4' : ''}`} lang="th">{seg.map((s, i) => <span key={i} className={s.cls}>{s.t}</span>)}</span>}
      {lines && <span className="rom block b">{seg.map((s, i) => <span key={i} className={s.cls}>{s.r}{i < seg.length - 1 ? ' ' : ''}</span>)}</span>}
      {chips && <div className="wchips">{seg.map((s, i) => s.fr === SLOT
        ? <span key={i} className={`wchip ${s.cls}`}><b lang="th">{s.t}</b><i>à compléter</i></span>
        : <span key={i} className={`wchip ${s.cls}`}><b lang="th">{s.t}</b><em>{s.r}</em><i>{s.fr == null ? '·' : s.fr}</i></span>)}</div>}
    </>
  );
}
