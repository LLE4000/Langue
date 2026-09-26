/** Mot à mot en couleurs : chaque mot thaï, sa transcription et son sens portent la même couleur. */
import { useMemo } from 'react';
import { lexicon } from '@/content/th';
import { wbwSplit } from '@/engine/wbw';
import { resolveTokens } from '@/engine/tokens';
import { useTokens } from './ui';

export function useWbw(thai: string, rom: string) {
  const tok = useTokens();
  return useMemo(() => {
    try {
      const seg = wbwSplit(resolveTokens(thai, tok), resolveTokens(rom, tok), lexicon());
      if (!seg || seg.length < 2) return null;
      let c = -1;
      return seg.map((x) => ({ ...x, cls: x.fr == null ? 'wx' : 'w' + (c = (c + 1) % 6) }));
    } catch { return null; }
  }, [thai, rom, tok]);
}

export function WordByWord({ thai, rom, chips = true, big }: { thai: string; rom: string; chips?: boolean; big?: boolean }) {
  const seg = useWbw(thai, rom);
  const tok = useTokens();
  if (!seg) return <><span className="th" lang="th">{resolveTokens(thai, tok)}</span><span className="rom block">{resolveTokens(rom, tok)}</span></>;
  return (
    <>
      <span className={`th ${big ? 'big s4' : ''}`} lang="th">{seg.map((s, i) => <span key={i} className={s.cls}>{s.t}</span>)}</span>
      <span className="rom block b">{seg.map((s, i) => <span key={i} className={s.cls}>{s.r}{i < seg.length - 1 ? ' ' : ''}</span>)}</span>
      {chips && <div className="wchips">{seg.map((s, i) => <span key={i} className={`wchip ${s.cls}`}><b lang="th">{s.t}</b><em>{s.r}</em><i>{s.fr == null ? '·' : s.fr}</i></span>)}</div>}
    </>
  );
}
