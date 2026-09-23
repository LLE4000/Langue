/** Recherche : français, thaï ou transcription (même approximative : sawatdi, khopkhun…). */
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { ITEMS, th, type LearnItem } from '@/content/th';
import { asciiRom, stripAccents } from '@/engine/util';
import { romToRTGS } from '@/engine/thai/transcription';
import { isThaiText } from '@/engine/thai/script';
import { useTokens } from '@/components/ui';
import { resolveTokens } from '@/engine/tokens';
import { L, T } from '@/i18n';
import { Empty } from '@/components/ui';
import { ItemRow } from './Vocabulary';
import { ItemDetailSheet } from '@/components/ItemCard';

export function Search() {
  const t = T();
  usePage(t.explore.search, { back: true, right: <span style={{ width: 44 }} /> });
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const [detail, setDetail] = useState<number | null>(null);
  const tok = useTokens();
  useEffect(() => { const h = setTimeout(() => setParams(q ? { q } : {}, { replace: true }), 300); return () => clearTimeout(h); }, [q, setParams]);
  const index = useMemo(() => Object.values(ITEMS).filter((it) => it.kind !== 'rule' && it.kind !== 'grammar').map((it) => { const r = resolveTokens(it.rom, tok).replace(/\.\.\./g, ' '); return { it, fr: stripAccents(resolveTokens(L(it.meaning), tok) + ' ' + (it.kind === 'cons' ? L(it.ref.nameMeaning) : '')), th: resolveTokens(it.thai, tok), r1: asciiRom(r), r2: asciiRom(romToRTGS(r)) }; }), [tok]);
  const res = useMemo(() => {
    const s = q.trim(); if (!s) return null;
    const n = stripAccents(s), qa = asciiRom(s), isTh = isThaiText(s);
    const a: LearnItem[] = [], b: LearnItem[] = [];
    for (const x of index) { if (isTh ? x.th.includes(s) : x.fr.includes(n)) a.push(x.it); else if (!isTh && qa.length >= 3 && (x.r1.includes(qa) || x.r2.includes(qa))) b.push(x.it); }
    const hit = (x: string) => stripAccents(x).includes(n);
    return {
      items: [...a, ...b].slice(0, 40),
      themes: isTh ? [] : th.VOCAB_THEMES.filter((c) => hit(c.name.fr)),
      grammar: isTh ? th.GRAMMAR.filter((g) => g.pattern.includes(s)) : th.GRAMMAR.filter((g) => hit(g.title.fr + ' ' + g.rule.fr)),
      dialogs: isTh ? [] : th.DIALOGS.filter((d) => hit(d.title.fr)),
      readings: isTh ? [] : th.READINGS.filter((r) => hit(r.title.fr)),
    };
  }, [q, index]);
  const ids = res?.items.map((i) => i.id) ?? [];
  const nothing = res && !res.items.length && !res.themes.length && !res.grammar.length && !res.dialogs.length && !res.readings.length;
  return (
    <>
      <input className="field" type="search" placeholder="Français, thaï ou transcription" value={q} onChange={(e) => setQ(e.target.value)} autoFocus autoComplete="off" />
      <div className="chips" style={{ paddingTop: 10 }}>{['bonjour', 'combien', 'poulet', 'khopkhun', 'ไป'].map((x) => <button key={x} className="chip" onClick={() => setQ(x)}>{x}</button>)}</div>
      {nothing && <Empty e="🔍">Aucun résultat pour « {q} ».</Empty>}
      {res && res.themes.length > 0 && <><div className="h2">Thèmes</div><div className="list">{res.themes.map((c) => <Link key={c.id} className="row" to={`/explore/vocab/${c.id}`}><span className="ico">{c.icon}</span><span className="mid"><span className="t">{L(c.name)}</span><span className="s">{c.items.length} éléments</span></span><span className="end"><span className="chev">›</span></span></Link>)}</div></>}
      {res && res.items.length > 0 && <><div className="h2">Mots et phrases · {res.items.length}</div><div className="list">{res.items.map((it, i) => <ItemRow key={it.id} it={it} onClick={() => setDetail(i)} />)}</div></>}
      {res && res.grammar.length > 0 && <><div className="h2">Grammaire</div><div className="list">{res.grammar.map((g) => <Link key={g.id} className="row" to={`/explore/grammar/${encodeURIComponent(g.id)}`}><span className="ico">{g.icon}</span><span className="mid"><span className="t">{L(g.title)}</span></span><span className="end"><span className="chev">›</span></span></Link>)}</div></>}
      {res && res.dialogs.length > 0 && <><div className="h2">Conversations</div><div className="list">{res.dialogs.map((d) => <Link key={d.id} className="row" to={`/explore/dialogs/${encodeURIComponent(d.id)}`}><span className="ico">{d.icon}</span><span className="mid"><span className="t">{L(d.title)}</span></span><span className="end"><span className="chev">›</span></span></Link>)}</div></>}
      {res && res.readings.length > 0 && <><div className="h2">Lectures</div><div className="list">{res.readings.map((r) => <Link key={r.id} className="row" to={`/explore/readings/${encodeURIComponent(r.id)}`}><span className="ico">📖</span><span className="mid"><span className="t">{L(r.title)}</span></span><span className="end"><span className="chev">›</span></span></Link>)}</div></>}
      {detail != null && <ItemDetailSheet ids={ids} index={detail} onClose={() => setDetail(null)} onNav={setDetail} />}
    </>
  );
}
