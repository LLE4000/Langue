/**
 * Ma progression : le palier (A0 → B2), ce qu'il reste pour le suivant, les compétences, l'évolution.
 * Chaque nombre est donné avec son total ; « acquis » ne baisse jamais, « à réviser » dit ce qui faiblit.
 */
import { Link } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { useStore } from '@/app/store';
import { useProgress } from '@/app/hooks';
import { SKILL_META, TIER_STORY, TIERS, remainingLine, tierLine } from '@/engine/progress';
import { Icon } from '@/components/ui';
import { ProgressSpark, SkillBars, TierLadder, TierRing } from '@/components/Progress';

export function ProgressScreen() {
  usePage('Ma progression', { back: '/profile' });
  const p = useProgress();
  const log = useStore((s) => s.progressLog);
  const story = TIER_STORY[p.tier];
  const todo = p.skills.filter((s) => p.relevant.includes(s.id) && !s.ok);
  const nextStory = p.next ? TIER_STORY[p.next] : null;
  return (
    <>
      <div className="tierhead">
        <TierRing p={p} size={86} />
        <div className="mid">
          <div className="t">{story.title}</div>
          <div className="s">{story.text}</div>
          <div className="l">{tierLine(p)}</div>
        </div>
      </div>
      <TierLadder p={p} />

      {nextStory && p.next !== 'B2' && (
        <>
          <div className="h2">Pour atteindre {p.next} <span className="sp" /><span className="sm mut">{remainingLine(p)}</span></div>
          <p className="note-under">{nextStory.text}</p>
          {todo.length ? (
            <div className="list">
              {todo.map((s) => {
                const meta = SKILL_META.find((m) => m.id === s.id)!;
                return <div key={s.id} className="row"><span className="ico"><Icon name="flag" size={18} /></span><span className="mid"><span className="t">{meta.label}</span><span className="s">Aujourd’hui {s.detail} · il faut {s.needLabel}</span></span><span className="end b">{s.value} %</span></div>;
              })}
            </div>
          ) : <div className="note info sm">Toutes les compétences sont au niveau : le palier {p.next} est à vous dès la prochaine mise à jour.</div>}
        </>
      )}
      {p.next === 'B2' && <div className="note plain sm mt-4">{TIER_STORY.B2.text}</div>}

      <div className="h2">Mes compétences <span className="sp" /><span className="sm mut">{p.overall} % en moyenne</span></div>
      <SkillBars p={p} />
      <div className="statline mt-3">
        <span><b>{p.counts.wordsAcquired}</b> mots acquis</span>
        <span><b>{p.counts.lessonsDone}</b> / {p.counts.lessonsTotal} leçons</span>
        {p.counts.toReview > 0 && <Link to="/review"><b>{p.counts.toReview}</b> à réviser ›</Link>}
      </div>

      <div className="h2">Mon évolution</div>
      <ProgressSpark log={log} />

      <div className="h2">Le chemin</div>
      <div className="list">
        {TIERS.map((t) => {
          const st = TIER_STORY[t];
          const idx = TIERS.indexOf(t), cur = TIERS.indexOf(p.tier);
          return <div key={t} className={`row ${idx < cur ? 'done' : ''}`}><span className={`ico ${idx === cur ? 'cur' : ''}`}>{idx < cur ? '✓' : t}</span><span className="mid"><span className="t">{st.title}</span><span className="s">{st.text}</span></span></div>;
        })}
      </div>
      <p className="foot-note mt-4">Les paliers suivent l’esprit du CECRL (A1 à B2), adaptés au thaï : lettres, tons et compréhension de l’oral comptent autant que le vocabulaire. Votre niveau déclaré à l’inscription sert de point de départ ; ce que vous faites dans l’application le fait évoluer.</p>
    </>
  );
}
