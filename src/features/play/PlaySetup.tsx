/** Réglages communs des jeux : joueurs, nombre de questions, source des mots. */
import { useMemo, useState } from 'react';
import { useStore } from '@/app/store';
import { readRegistry } from '@/app/profiles';
import { th } from '@/content/th';
import { Segmented } from '@/components/ui';
import { defaultSource, poolFor, type PlaySource } from './quiz';

export interface PlayConfig { players: string[]; count: number; source: PlaySource; layout: 'face' | 'side' }

export function usePlayerDefaults(n: number): string[] {
  const me = useStore((s) => s.profile?.name ?? '');
  return useMemo(() => {
    const others = readRegistry().list.map((p) => p.name).filter((x) => x && x !== me);
    const names = [me || 'Joueur 1', ...others];
    while (names.length < n) names.push(`Joueur ${names.length + 1}`);
    return names.slice(0, n);
  }, [me, n]);
}

export function SourcePicker({ value, onChange }: { value: PlaySource; onChange: (s: PlaySource) => void }) {
  const srs = useStore((s) => s.srs);
  const known = poolFor({ kind: 'known' }, srs).length;
  return (
    <>
      <label className="f">Les mots du jeu</label>
      <div className="chips" style={{ paddingBottom: 6 }}>
        <button className={`chip ${value.kind === 'known' ? 'on' : ''}`} disabled={known < 4} onClick={() => onChange({ kind: 'known' })}>Ce que je connais · {known}</button>
        <button className={`chip ${value.kind === 'numbers' ? 'on' : ''}`} onClick={() => onChange({ kind: 'numbers' })}>Nombres</button>
        <button className={`chip ${value.kind === 'theme' ? 'on' : ''}`} onClick={() => onChange({ kind: 'theme', theme: value.theme ?? 'sal' })}>Un thème</button>
      </div>
      {value.kind === 'theme' && (
        <select className="field" value={value.theme ?? 'sal'} onChange={(e) => onChange({ kind: 'theme', theme: e.target.value })} aria-label="Thème">
          {th.THEME_ORDER.map((id) => th.VOCAB_THEMES.find((t) => t.id === id)).filter(Boolean).map((t) => <option key={t!.id} value={t!.id}>{t!.icon} {t!.name.fr} · {t!.items.length}</option>)}
        </select>
      )}
      {known < 4 && value.kind !== 'theme' && value.kind !== 'numbers' && <p className="xs mut">Faites d’abord une leçon pour jouer avec vos propres mots ; en attendant, un thème ou les nombres.</p>}
    </>
  );
}

export function PlaySetup({ minPlayers, maxPlayers, withLayout, onStart, startLabel = 'Commencer' }: { minPlayers: number; maxPlayers: number; withLayout?: boolean; onStart: (c: PlayConfig) => void; startLabel?: string }) {
  const srs = useStore((s) => s.srs);
  const defaults = usePlayerDefaults(minPlayers);
  const [players, setPlayers] = useState<string[]>(defaults);
  const [count, setCount] = useState(10);
  const [source, setSource] = useState<PlaySource>(() => defaultSource(srs));
  const [layout, setLayout] = useState<'face' | 'side'>('face');
  const pool = poolFor(source, srs);
  const ok = pool.length >= 4 && players.every((p) => p.trim());
  return (
    <>
      <label className="f">{maxPlayers > 2 ? `Joueurs (${minPlayers} à ${maxPlayers})` : 'Les deux joueurs'}</label>
      <div className="stack">
        {players.map((p, i) => (
          <div key={i} className="row-flex">
            <span className="tag" style={{ minWidth: 34, justifyContent: 'center' }}>{i + 1}</span>
            <input className="field" value={p} onChange={(e) => setPlayers(players.map((x, k) => (k === i ? e.target.value : x)))} placeholder={`Joueur ${i + 1}`} aria-label={`Nom du joueur ${i + 1}`} />
            {players.length > minPlayers && <button className="ib sm" aria-label="Retirer" onClick={() => setPlayers(players.filter((_, k) => k !== i))}>✕</button>}
          </div>
        ))}
        {players.length < maxPlayers && <button className="btn ghost sm" onClick={() => setPlayers([...players, `Joueur ${players.length + 1}`])}>+ Ajouter un joueur</button>}
      </div>
      <label className="f">Nombre de questions</label>
      <Segmented value={count} options={[10, 15, 20].map((n) => ({ v: n, label: String(n) }))} onChange={setCount} />
      <SourcePicker value={source} onChange={setSource} />
      {withLayout && (
        <>
          <label className="f">Position</label>
          <Segmented value={layout} options={[{ v: 'face', label: 'Face à face (appareil posé)' }, { v: 'side', label: 'Côte à côte' }]} onChange={setLayout} />
          <p className="xs mut" style={{ margin: '6px 2px 0' }}>Face à face : la moitié du haut est retournée pour la personne assise en face. Côte à côte : chacun sa moitié gauche/droite.</p>
        </>
      )}
      <button className="btn" style={{ marginTop: 18 }} disabled={!ok} onClick={() => onStart({ players: players.map((p) => p.trim()), count, source, layout })}>{startLabel}</button>
    </>
  );
}
