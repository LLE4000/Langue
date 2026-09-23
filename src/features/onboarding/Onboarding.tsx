/**
 * Premier démarrage : couple de langues, prénom, particules de politesse, niveau par compétence
 * (avec un petit test de lecture facultatif), objectif quotidien.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/app/store';
import { PACKS } from '@/content/packs';
import { T } from '@/i18n';
import { SKILLS, type Level, type Skill } from '@/curriculum/types';
import type { SkillLevels } from '@/curriculum/path';
import { Icon, Thai } from '@/components/ui';
import { PlacementTest } from './PlacementTest';

const LEVEL_KEYS: Record<Skill, 'listening' | 'speaking' | 'reading' | 'writing'> = { listening: 'listening', speaking: 'speaking', reading: 'reading', writing: 'writing' };

export function LevelPicker({ levels, onChange }: { levels: SkillLevels; onChange: (l: SkillLevels) => void }) {
  const t = T();
  const [placement, setPlacement] = useState(false);
  return (
    <>
      {SKILLS.map((sk) => (
        <div className="skillcard" key={sk}>
          <h3>{t.skills[sk]}<small>{t.levels.generic[levels[sk]]}</small></h3>
          <p>{t.levels[LEVEL_KEYS[sk]][levels[sk]]}</p>
          <div className="lvl" role="radiogroup" aria-label={t.skills[sk]}>
            {[0, 1, 2, 3, 4].map((n) => (
              <button key={n} role="radio" aria-checked={levels[sk] === n} className={levels[sk] === n ? 'on' : ''} onClick={() => onChange({ ...levels, [sk]: n as Level })}>{['0', 'A1', 'A2', 'B1', 'B2+'][n]}</button>
            ))}
          </div>
          {sk === 'reading' && <button className="btn ghost sm" style={{ marginTop: 10 }} onClick={() => setPlacement(true)}>🔎 {t.onboarding.placement}</button>}
        </div>
      ))}
      {placement && <PlacementTest onClose={() => setPlacement(false)} onResult={(lvl) => { onChange({ ...levels, reading: lvl, writing: Math.min(levels.writing, lvl) as Level }); setPlacement(false); }} />}
    </>
  );
}

export function Onboarding() {
  const t = T();
  const nav = useNavigate();
  const setProfile = useStore((s) => s.setProfile);
  const [step, setStep] = useState(0);
  const [pack, setPack] = useState(PACKS[0].id);
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'m' | 'f' | ''>('');
  const [levels, setLevels] = useState<SkillLevels>({ listening: 0, speaking: 0, reading: 0, writing: 0 });
  const [goal, setGoal] = useState(15);

  const finish = () => {
    const p = PACKS.find((x) => x.id === pack)!;
    setProfile({ name: name.trim(), gender: gender || 'm', source: p.source, target: p.target, levels, createdAt: Date.now(), dailyGoalMinutes: goal });
    nav('/', { replace: true });
  };

  return (
    <div className="app">
      <main className="view no-tabs welcome">
        {step === 0 && (
          <>
            <div className="logo" lang="th">ภาษาไทย</div>
            <h2>{t.app.tagline}</h2>
            <p className="lead">{t.onboarding.intro}</p>
            <label className="f">{t.onboarding.pair}</label>
            {PACKS.map((p) => (
              <button key={p.id} className={`opt ${pack === p.id ? 'on' : ''}`} onClick={() => setPack(p.id)}><span className="e">{p.flag}</span><span>{p.label.fr}<small>Interface en français</small></span></button>
            ))}
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
            <h2 style={{ fontSize: 24 }}>{t.onboarding.levelsTitle}</h2>
            <p className="lead">{t.onboarding.levelsIntro}</p>
            <LevelPicker levels={levels} onChange={setLevels} />
            <div className="gap" />
            <div className="btns" style={{ marginTop: 12 }}>
              <button className="btn ghost" onClick={() => setStep(0)}>{t.common.back}</button>
              <button className="btn" onClick={() => setStep(2)}>{t.common.continue}</button>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <h2 style={{ fontSize: 24 }}>{t.onboarding.dailyGoal}</h2>
            <p className="lead">Une leçon dure 5 à 15 minutes. Vous pourrez toujours en faire plus : rien ne bloque la suivante.</p>
            <div className="seg">
              {[5, 10, 15, 30].map((g) => <button key={g} className={goal === g ? 'on' : ''} onClick={() => setGoal(g)}>{g} min</button>)}
            </div>
            <div className="note info" style={{ marginTop: 18 }}>
              <b>Ce que l’application fait de vos réponses.</b> Elle construit un parcours à partir de vos niveaux : ce que vous savez déjà est considéré acquis, ce qui manque vient dans l’ordre logique (on ne vous demandera jamais de lire une lettre qui n’a pas été enseignée). Vous pourrez ajuster vos niveaux à tout moment dans Profil.
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
