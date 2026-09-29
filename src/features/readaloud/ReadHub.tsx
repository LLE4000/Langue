/**
 * Lire à voix haute — l'accueil de l'entraînement, en deux volets (contrôle segmenté en haut, retenu dans l'adresse) :
 * « Syllabes » : la séance conseillée (avec le mode), la grille de lecture, les raccourcis « Lectures à reprendre » et
 * « Lecture chrono · 1 min », puis le programme complet étape par étape — chaque séance verrouillée tant que les leçons
 * n'ont pas enseigné ses lettres ; « Textes entiers » : la lecture longue. L'explication de l'évaluation est dans
 * Réglages › Voix, à un toucher.
 */
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { useStore, emptyReadAloud } from '@/app/store';
import { useKnown, usePath } from '@/app/hooks';
import { raProgram } from '@/engine/readaloud/program';
import { azureConfig } from '@/engine/audio/azure';
import { Icon, Segmented, ThInl } from '@/components/ui';
import { isUnlocked, nextSession, PASS, raPrefs, saveRaPrefs, unlockLesson, weakItems, type RaPrefs } from './data';
import { longTexts } from './LongReadRunner';
import { L, frTypo } from '@/i18n';

export const MODE_INFO: Record<RaPrefs['mode'], { label: string; desc: string }> = {
  listen: { label: 'Écouter + lire', desc: 'La voix thaïe d’abord, puis vous : idéal pour une séance nouvelle.' },
  read: { label: 'Lire seul', desc: 'Vous lisez, le tapis avance dès que vous vous arrêtez.' },
  auto: { label: 'Défilement', desc: 'Le tapis avance tout seul, au rythme choisi : lisez sans décrocher.' },
};

export function ReadHub() {
  usePage('Lire à voix haute', { back: '/path', thai: { th: 'อ่านออกเสียง', rom: 'àan ɔ̀ɔk-sǐang' } });
  const ra = useStore((s) => s.readAloud) ?? emptyReadAloud();
  const acts = useStore((s) => s.activities);
  const known = useKnown().concepts;
  const lessons = usePath().map((p) => p.lesson);
  const nav = useNavigate();
  const [qs, setQs] = useSearchParams();
  const tab = qs.get('tab') === 'texts' ? 'texts' : 'syl';
  const [prefs, setPrefs] = useState(raPrefs());
  const set = (p: Partial<RaPrefs>) => { saveRaPrefs(p); setPrefs({ ...prefs, ...p }); };
  const program = raProgram();
  const next = nextSession(ra, known);
  const nextOpen = isUnlocked(next, known);
  const weak = weakItems(ra).length;
  const done = program.filter((s) => (ra.sessions[s.id]?.best ?? 0) >= PASS).length;
  const stages = [...new Set(program.map((s) => s.stage))];
  const texts = longTexts();
  const go = (id: string, mode: string = prefs.mode) => nav(`/read/${id}?mode=${mode}`);
  const after = (s: (typeof program)[number]) => { const l = unlockLesson(s, lessons, known); return frTypo(l ? `après « ${L(l.title)} »` : 'après les leçons de lecture'); };
  const nextLesson = nextOpen ? undefined : unlockLesson(next, lessons, known);

  return (
    <>
      <Segmented value={tab} options={[{ v: 'syl', label: 'Syllabes' }, { v: 'texts', label: `Textes entiers (${texts.length})` }]} onChange={(v) => setQs(v === 'texts' ? { tab: 'texts' } : {}, { replace: true })} />

      {tab === 'syl' ? (
        <>
          <section className="ra-hero mt-3" aria-label="Séance conseillée">
            <span className="eyebrow">Séance {next.n} sur {program.length} · {next.stage}</span>
            <div className="t"><ThInl text={next.title} /></div>
            <div className="s"><ThInl text={next.focus} /></div>
            <div className="pills"><span>{next.items.length} lectures</span><span>≈ {next.minutes} min</span>{next.fresh.length > 0 && <span>{next.fresh.length} signes nouveaux</span>}</div>
            {!nextOpen && <p className="ra-lockline"><Icon name="lock" size={14} /> <ThInl text={frTypo(nextLesson ? `Ses lettres s’apprennent dans la leçon « ${L(nextLesson.title)} » : vous pouvez déjà essayer.` : 'Certaines de ses lettres ne sont pas encore enseignées : vous pouvez déjà essayer.')} /></p>}
            <Segmented value={prefs.mode} options={(Object.keys(MODE_INFO) as RaPrefs['mode'][]).map((m) => ({ v: m, label: MODE_INFO[m].label }))} onChange={(mode) => set({ mode })} />
            <p className="mdesc">{MODE_INFO[prefs.mode].desc}</p>
            {prefs.mode === 'auto' && <Segmented value={prefs.tempo} options={[{ v: 'slow', label: 'Lent' }, { v: 'mid', label: 'Moyen' }, { v: 'fast', label: 'Rapide' }]} onChange={(tempo) => set({ tempo })} />}
            <button className="btn" onClick={() => go(next.id)}><Icon name="mic" /> Commencer la séance</button>
          </section>

          <Link to="/read/grid" className="row ra-gridrow"><span className="ico acc"><Icon name="grid" /></span><span className="mid"><span className="t">Grille de lecture</span><span className="s">Consonnes et voyelles tirées au sort, comme au tableau : lisez toute la grille (<span lang="th" className="thi">ขา ขี ขู เข…</span>)</span></span><span className="end"><span className="chev"><Icon name="next" size={18} /></span></span></Link>
          <div className="ra-quick">
            <Link to="/read/errors?mode=read" className={`tile ${weak ? '' : 'muted'}`}><span className="ic"><Icon name="target" /></span><span className="t">Lectures à reprendre</span><span className="s">{weak ? `${weak} lecture${weak > 1 ? 's' : ''} ratée${weak > 1 ? 's' : ''}` : 'Rien à reprendre'}</span></Link>
            <Link to="/read/chrono?mode=chrono" className="tile"><span className="ic"><Icon name="clock" /></span><span className="t">Lecture chrono · 1 min</span><span className="s">Le plus de syllabes possible, justes</span></Link>
          </div>

          <div className="h2">Le programme <span className="sp" /><span className="sm mut">{done} / {program.length} réussies</span></div>
          <p className="note-under">De <ThInl text="กา ตา ปา" /> aux phrases : 28 consonnes, les voyelles, les tons, les finales, puis de vrais mots. Chaque séance s’ouvre avec la leçon qui enseigne ses lettres.</p>
          {stages.map((st) => (
            <section key={st} aria-label={st}>
              <h3 className="ra-step">{st}</h3>
              <div className="list">
                {program.filter((s) => s.stage === st).map((s) => {
                  const rec = ra.sessions[s.id];
                  const ok = (rec?.best ?? 0) >= PASS, cur = s.id === next.id, open = isUnlocked(s, known);
                  return (
                    <button key={s.id} className={`row ra-row ${cur ? 'cur' : ''} ${open ? '' : 'lock'}`} onClick={() => go(s.id)}>
                      <span className={`ico ${ok ? 'ok' : cur ? 'acc' : ''}`}>{ok ? <Icon name="check" /> : open ? <b>{s.n}</b> : <Icon name="lock" />}</span>
                      <span className="mid"><span className="t"><ThInl text={s.title} /></span><span className="s"><ThInl text={s.sub} /></span>
                        <span className="meta">{!open && <span><ThInl text={after(s)} /></span>}<span>{s.items.length} lectures</span><span>{s.minutes} min</span>{rec && <span className={ok ? 'okc' : ''}>meilleur {rec.best} %</span>}</span></span>
                      {cur && <span className="tag gold">Conseillée</span>}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </>
      ) : (
        <>
          <p className="note-under mt-3">Lisez un texte d’un bout à l’autre : mots lus, déformés ou manqués, débit, pauses.</p>
          <div className="list">
            {texts.map((r) => {
              const best = acts['readtext:' + r.id]?.best;
              return (
                <Link key={r.id} className="row ra-row" to={`/read/text/${encodeURIComponent(r.id)}`}>
                  <span className="ico"><Icon name="bookOpen" /></span>
                  <span className="mid"><span className="t">{L(r.title)}</span><span className="meta"><span>niveau {r.level}</span><span>{r.sentences.length} phrases</span>{best != null && <span className={best >= 85 ? 'okc' : ''}>meilleur {best} %</span>}</span></span>
                  <span className="end"><span className="chev"><Icon name="next" size={18} /></span></span>
                </Link>
              );
            })}
          </div>
        </>
      )}

      <Link to="/profile/settings?tab=voice&fold=eval" className="row ra-evalrow mt-4">
        <span className="ico"><Icon name="info" /></span>
        <span className="mid"><span className="t">Comment la lecture est évaluée</span><span className="s">{azureConfig() ? 'Micro, reconnaissance vocale, courbe du ton et Azure' : 'Micro, reconnaissance vocale et courbe du ton'}</span></span>
        <span className="end"><span className="chev"><Icon name="next" size={18} /></span></span>
      </Link>
    </>
  );
}
