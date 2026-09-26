/**
 * Premier démarrage, en trois écrans : qui êtes-vous (prénom, particules de politesse), votre objectif
 * (parler / lire et écrire / les deux, avec les niveaux repliés derrière « J'ai déjà des bases »), votre rythme.
 * Si d'autres personnes utilisent déjà l'appareil, on peut reprendre leur profil.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/app/store';
import { PACKS } from '@/content/packs';
import { readRegistry, reloadToHome, switchProfile } from '@/app/profiles';
import { T } from '@/i18n';
import { SKILLS, goalSkills, type Goals, type Level, type Skill } from '@/curriculum/types';
import type { SkillLevels } from '@/curriculum/path';
import { Icon, Thai } from '@/components/ui';
import { PlacementTest } from './PlacementTest';

const LEVEL_KEYS: Record<Skill, 'listening' | 'speaking' | 'reading' | 'writing'> = { listening: 'listening', speaking: 'speaking', reading: 'reading', writing: 'writing' };

export function LevelPicker({ levels, onChange, skills = SKILLS }: { levels: SkillLevels; onChange: (l: SkillLevels) => void; skills?: Skill[] }) {
  const t = T();
  const [placement, setPlacement] = useState(false);
  return (
    <>
      {skills.map((sk) => (
        <div className="skillcard" key={sk}>
          <h3>{t.skills[sk]}<small>{t.levels.generic[levels[sk]]}</small></h3>
          <p>{t.levels[LEVEL_KEYS[sk]][levels[sk]]}</p>
          <div className="lvl" role="radiogroup" aria-label={t.skills[sk]}>
            {[0, 1, 2, 3, 4].map((n) => (
              <button key={n} role="radio" aria-checked={levels[sk] === n} className={levels[sk] === n ? 'on' : ''} onClick={() => onChange({ ...levels, [sk]: n as Level })}>{['0', 'A1', 'A2', 'B1', 'B2+'][n]}</button>
            ))}
          </div>
          {sk === 'reading' && <button className="btn ghost sm mt-3" onClick={() => setPlacement(true)}><Icon name="search" size={16} /> {t.onboarding.placement}</button>}
        </div>
      ))}
      {placement && <PlacementTest onClose={() => setPlacement(false)} onResult={(lvl) => { onChange({ ...levels, reading: lvl, writing: Math.min(levels.writing, lvl) as Level }); setPlacement(false); }} />}
    </>
  );
}

/** `icon` : nom d'une icône du jeu d'icônes (voir `Icon`). */
export const GOAL_OPTIONS: { key: 'speak' | 'read' | 'both'; icon: string; title: string; desc: string; goals: Goals }[] = [
  { key: 'both', icon: 'target', title: 'Parler, lire et écrire', desc: 'Le parcours complet : conversation et écriture s’entrelacent. Recommandé.', goals: { speak: true, read: true } },
  { key: 'speak', icon: 'chat', title: 'Parler et comprendre', desc: 'Uniquement l’oral : mots, phrases, conversations, avec la phonétique. Pas de leçon d’écriture (elle reste consultable dans Explorer).', goals: { speak: true, read: false } },
  { key: 'read', icon: 'bookOpen', title: 'Lire et écrire', desc: 'Pour qui parle déjà : l’alphabet, les tons, la lecture de mots et de textes.', goals: { speak: false, read: true } },
];
export const goalKey = (g: Goals) => (g.speak && g.read ? 'both' : g.speak ? 'speak' : 'read');

export function GoalPicker({ value, onChange }: { value: Goals; onChange: (g: Goals) => void }) {
  const cur = goalKey(value);
  return (
    <div className="stack" role="radiogroup" aria-label="Objectif">
      {GOAL_OPTIONS.map((o) => (
        <button key={o.key} role="radio" aria-checked={cur === o.key} className={`opt goal ${cur === o.key ? 'on' : ''}`} onClick={() => onChange(o.goals)}>
          <span className="ico"><Icon name={o.icon} /></span>
          <span><span className="ot">{o.title}</span><small>{o.desc}</small></span>
        </button>
      ))}
    </div>
  );
}

export function Onboarding() {
  const t = T();
  const nav = useNavigate();
  const setProfile = useStore((s) => s.setProfile);
  const updateSettings = useStore((s) => s.updateSettings);
  const [step, setStep] = useState(0);
  const [pack, setPack] = useState(PACKS[0].id);
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'m' | 'f' | ''>('');
  const [goals, setGoals] = useState<Goals>({ speak: true, read: true });
  const [levels, setLevels] = useState<SkillLevels>({ listening: 0, speaking: 0, reading: 0, writing: 0 });
  const [showLevels, setShowLevels] = useState(false);
  const [goal, setGoal] = useState(15);
  const reg = readRegistry();
  const others = reg.list.filter((p) => p.name && p.id !== reg.active);
  const hasBases = SKILLS.some((sk) => levels[sk] > 0);

  const finish = () => {
    const p = PACKS.find((x) => x.id === pack)!;
    const skills = goalSkills(goals);
    const lv: SkillLevels = { ...levels };
    SKILLS.forEach((sk) => { if (!skills.includes(sk)) lv[sk] = 0; });
    setProfile({ name: name.trim(), gender: gender || 'm', source: p.source, target: p.target, levels: lv, createdAt: Date.now(), dailyGoalMinutes: goal, goals });
    if (!goals.read) updateSettings({ translit: 'always' });
    nav('/', { replace: true });
  };
  const steps = 3;
  const Dots = () => <div className="steps dots" aria-hidden="true">{Array.from({ length: steps }, (_, k) => <i key={k} className={k < step ? 'done' : k === step ? 'cur' : ''} />)}</div>;

  return (
    <div className="app">
      <main className="view no-tabs welcome">
        {step === 0 && (
          <>
            <div className="logo" lang="th">ภาษาไทย</div>
            <h2>{t.app.tagline}</h2>
            <p className="lead">{t.onboarding.intro}</p>
            {others.length > 0 && (
              <div className="note plain sm mt-0">
                <b>Déjà un profil sur cet appareil ?</b>
                <div className="chips">{others.map((p) => <button key={p.id} className="chip" onClick={() => { switchProfile(p.id); reloadToHome(); }}>{p.name}</button>)}</div>
              </div>
            )}
            {PACKS.length > 1 && (
              <>
                <label className="f">{t.onboarding.pair}</label>
                {PACKS.map((p) => (
                  <button key={p.id} className={`opt ${pack === p.id ? 'on' : ''}`} onClick={() => setPack(p.id)}><span className="e">{p.flag}</span><span>{p.label.fr}<small>Interface en français</small></span></button>
                ))}
              </>
            )}
            <label className="f" htmlFor="obname">{t.onboarding.name}</label>
            <input id="obname" className="field" autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Prénom" />
            <label className="f">{t.onboarding.gender} <span className="xs">({t.onboarding.genderHint})</span></label>
            <div className="btns">
              <button className={`opt ${gender === 'm' ? 'on' : ''}`} onClick={() => setGender('m')}><span>{t.onboarding.man}<small><Thai text="ครับ · ผม" /></small></span></button>
              <button className={`opt ${gender === 'f' ? 'on' : ''}`} onClick={() => setGender('f')}><span>{t.onboarding.woman}<small><Thai text="ค่ะ / คะ · ฉัน" /></small></span></button>
            </div>
            <div className="sp gap" />
            <button className="btn" disabled={!name.trim() || !gender} onClick={() => setStep(1)}>{t.common.continue} <Icon name="next" size={18} /></button>
          </>
        )}
        {step === 1 && (
          <>
            <Dots />
            <h2 className="sm-title">Votre objectif</h2>
            <p className="lead">Le thaï se parle et s’écrit très différemment. On peut très bien apprendre à parler sans lire une seule lettre, ou apprendre à lire quand on parle déjà. Vous pourrez changer d’avis plus tard.</p>
            <GoalPicker value={goals} onChange={setGoals} />
            {!showLevels ? (
              <button className="btn ghost sm mt-4" onClick={() => setShowLevels(true)}>J’ai déjà des bases : régler mes niveaux</button>
            ) : (
              <>
                <div className="h2 mt-6">{t.onboarding.levelsTitle}</div>
                <p className="note-under">{goals.read && goals.speak ? 'Soyez précis : le parcours saute ce que vous savez déjà.' : goals.speak ? 'Où en êtes-vous à l’oral ? Le parcours saute ce que vous savez déjà.' : 'Où en êtes-vous en lecture ? Le petit test peut vous aider à vous situer.'}</p>
                <LevelPicker levels={levels} onChange={setLevels} skills={goalSkills(goals)} />
              </>
            )}
            <div className="sp gap" />
            <div className="btns mt-3">
              <button className="btn ghost" onClick={() => setStep(0)}>{t.common.back}</button>
              <button className="btn" onClick={() => setStep(2)}>{t.common.continue}</button>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <Dots />
            <h2 className="sm-title">{t.onboarding.dailyGoal}</h2>
            <p className="lead">Une leçon dure 5 à 15 minutes. Vous pourrez toujours en faire plus : rien ne bloque la suivante.</p>
            <div className="seg">
              {[5, 10, 15, 30].map((g) => <button key={g} className={goal === g ? 'on' : ''} onClick={() => setGoal(g)}>{g} min</button>)}
            </div>
            <div className="note info mt-5">
              <b>Ce que l’application fait de vos réponses.</b> Elle construit un parcours à partir de votre objectif{hasBases ? ' et de vos niveaux' : ''} : {hasBases ? 'ce que vous savez déjà est considéré acquis, ' : ''}ce qui manque vient dans l’ordre logique (on ne vous demandera jamais de lire une lettre qui n’a pas été enseignée). Tout est modifiable dans Profil.
            </div>
            <div className="sp gap" />
            <div className="btns">
              <button className="btn ghost" onClick={() => setStep(1)}>{t.common.back}</button>
              <button className="btn" onClick={finish}>{t.onboarding.done}</button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
