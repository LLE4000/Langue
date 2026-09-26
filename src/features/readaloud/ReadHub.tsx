/**
 * Lire à voix haute — l'accueil de l'entraînement : la séance conseillée (avec le mode), les raccourcis
 * « Mes erreurs » et « Chrono », le programme complet étape par étape, puis les textes entiers (lecture longue).
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { useStore, emptyReadAloud } from '@/app/store';
import { raProgram } from '@/engine/readaloud/program';
import { azureConfig } from '@/engine/audio/azure';
import { Icon, Segmented } from '@/components/ui';
import { nextSession, PASS, raPrefs, saveRaPrefs, weakItems, type RaPrefs } from './data';
import { longTexts } from './LongReadRunner';
import { L } from '@/i18n';

export const MODE_INFO: Record<RaPrefs['mode'], { label: string; desc: string }> = {
  listen: { label: 'Écouter + lire', desc: 'La voix thaïe d’abord, puis vous : idéal pour une séance nouvelle.' },
  read: { label: 'Lire seul', desc: 'Vous lisez, le tapis avance dès que vous vous arrêtez.' },
  auto: { label: 'Défilement', desc: 'Le tapis avance tout seul, au rythme choisi : lisez sans décrocher.' },
};

export function ReadHub() {
  usePage('Lire à voix haute', { back: '/', thai: { th: 'อ่านออกเสียง', rom: 'àan ɔ̀ɔk-sǐang' } });
  const ra = useStore((s) => s.readAloud) ?? emptyReadAloud();
  const acts = useStore((s) => s.activities);
  const nav = useNavigate();
  const [prefs, setPrefs] = useState(raPrefs());
  const set = (p: Partial<RaPrefs>) => { saveRaPrefs(p); setPrefs({ ...prefs, ...p }); };
  const program = raProgram();
  const next = nextSession(ra);
  const weak = weakItems(ra).length;
  const done = program.filter((s) => (ra.sessions[s.id]?.best ?? 0) >= PASS).length;
  const stages = [...new Set(program.map((s) => s.stage))];
  const go = (id: string, mode: string = prefs.mode) => nav(`/read/${id}?mode=${mode}`);

  return (
    <>
      <section className="ra-hero" aria-label="Séance conseillée">
        <span className="eyebrow">Séance {next.n} sur {program.length} · {next.stage}</span>
        <div className="t">{next.title}</div>
        <div className="s">{next.focus}</div>
        <div className="pills"><span>{next.items.length} lectures</span><span>≈ {next.minutes} min</span>{next.fresh.length > 0 && <span>{next.fresh.length} signes nouveaux</span>}</div>
        <Segmented value={prefs.mode} options={(Object.keys(MODE_INFO) as RaPrefs['mode'][]).map((m) => ({ v: m, label: MODE_INFO[m].label }))} onChange={(mode) => set({ mode })} />
        <p className="mdesc">{MODE_INFO[prefs.mode].desc}</p>
        {prefs.mode === 'auto' && <Segmented value={prefs.tempo} options={[{ v: 'slow', label: 'Lent' }, { v: 'mid', label: 'Moyen' }, { v: 'fast', label: 'Rapide' }]} onChange={(tempo) => set({ tempo })} />}
        <button className="btn" onClick={() => go(next.id)}><Icon name="mic" /> Commencer la séance</button>
      </section>

      <div className="ra-quick">
        <Link to="/read/errors?mode=read" className={`tile ${weak ? '' : 'muted'}`}><span className="ic"><Icon name="target" /></span><span className="t">Mes erreurs</span><span className="s">{weak ? `${weak} lecture${weak > 1 ? 's' : ''} à reprendre` : 'Rien à reprendre'}</span></Link>
        <Link to="/read/chrono?mode=chrono" className="tile"><span className="ic"><Icon name="clock" /></span><span className="t">Chrono</span><span className="s">Une minute, le plus possible, juste</span></Link>
      </div>

      <div className="h2">Le programme <span className="sp" /><span className="sm mut">{done} / {program.length} réussies</span></div>
      <p className="note-under">De « ka, ta, pa » aux phrases : 28 consonnes, les voyelles, les tons, les finales, puis de vrais mots.</p>
      {stages.map((st) => (
        <section key={st} aria-label={st}>
          <h3 className="ra-step">{st}</h3>
          <div className="list">
            {program.filter((s) => s.stage === st).map((s) => {
              const rec = ra.sessions[s.id];
              const ok = (rec?.best ?? 0) >= PASS, cur = s.id === next.id;
              return (
                <button key={s.id} className={`row ra-row ${cur ? 'cur' : ''}`} onClick={() => go(s.id)}>
                  <span className={`ico ${ok ? 'ok' : cur ? 'acc' : ''}`}>{ok ? <Icon name="check" /> : <b>{s.n}</b>}</span>
                  <span className="mid"><span className="t">{s.title}</span><span className="s">{s.sub}</span>
                    <span className="meta"><span>{s.items.length} lectures</span><span>{s.minutes} min</span>{rec && <span className={ok ? 'okc' : ''}>meilleur {rec.best} %</span>}</span></span>
                  {cur && <span className="tag gold">Conseillée</span>}
                </button>
              );
            })}
          </div>
        </section>
      ))}

      <div className="h2">Textes entiers <span className="sp" /><span className="sm mut">lecture longue</span></div>
      <p className="note-under">Lisez un texte d’un bout à l’autre : mots lus, déformés ou manqués, débit, pauses.</p>
      <div className="list">
        {longTexts().map((r) => {
          const best = acts['readtext:' + r.id]?.best;
          return (
            <Link key={r.id} className="row ra-row" to={`/read/text/${encodeURIComponent(r.id)}`}>
              <span className="ico"><Icon name="bookOpen" /></span>
              <span className="mid"><span className="t">{L(r.title)}</span><span className="meta"><span>niveau {r.level}</span><span>{r.sentences.length} phrases</span>{best != null && <span className={best >= 85 ? 'okc' : ''}>meilleur {best} %</span>}</span></span>
              <span className="end"><span className="chev">›</span></span>
            </Link>
          );
        })}
      </div>

      <details className="note plain sm mt-4">
        <summary><b>Comment la lecture est évaluée</b></summary>
        <p className="mt-2">Le micro reste ouvert pendant la série : le tapis avance dès que vous vous arrêtez de parler. En arrière-plan, la <b>reconnaissance vocale de l’appareil</b> (thaï) dit ce qu’elle a compris : si elle entend la même syllabe avec un autre ton, une autre longueur ou une consonne voisine, le bilan l’indique précisément.</p>
        <p className="mt-2">Le <b>ton</b> d’une syllabe est aussi estimé d’après la courbe de votre voix, sur l’appareil : c’est une indication, pas une mesure de laboratoire.</p>
        <p className="mt-2">{azureConfig() ? <>L’<b>évaluation Azure</b> est active : chaque bloc de six lectures est comparé au texte attendu (précision par syllabe, lectures omises). Azure ne note pas les tons en thaï.</> : <>Pour une évaluation plus fine, vous pouvez brancher <b>votre clé Azure Speech</b> (niveau gratuit) dans <Link to="/profile/settings?tab=voice">Réglages › Voix</Link> : précision par syllabe et lectures omises (Azure ne note pas les tons en thaï).</>}</p>
      </details>
    </>
  );
}
