/** Composants de progression : pastille d'en-tête, anneau du palier, barres de compétences, courbe. */
import { Link } from 'react-router-dom';
import { useStore, streakDays } from '@/app/store';
import { useProgress } from '@/app/hooks';
import { SKILL_META, TIER_MARK, TIERS, tierLine, type Progress as P, type SkillProgress } from '@/engine/progress';
import { Icon } from './ui';

/** Pastille compacte, toujours visible dans la barre du haut : palier, avancement, série. */
export function ProgressPill() {
  const p = useProgress();
  const days = useStore((s) => s.days);
  const streak = streakDays(days);
  const pct = Math.round(p.toNext * 100);
  return (
    <Link to="/profile/progress" className="ppill" aria-label={`Ma progression : ${tierLine(p)}${streak ? `, ${streak} jours de suite` : ''}`} data-testid="progress-pill">
      <span className="mring" style={{ ['--p' as string]: pct }}><span>{p.tier}</span></span>
      <span>{p.next && p.next !== 'B2' ? `${pct} %` : '✓'}</span>
      {streak > 0 && <span className="pp-s"><Icon name="flame" size={14} />{streak}</span>}
    </Link>
  );
}

/** Anneau du palier : A1 au centre, l'arc = avancement vers le suivant. */
export function TierRing({ p, size = 78 }: { p: P; size?: number }) {
  const pct = Math.round(p.toNext * 100);
  return <div className="cring" style={{ ['--p' as string]: pct, width: size, height: size }}><b>{p.tier}</b><small>{p.next && p.next !== 'B2' ? `→ ${p.next}` : 'atteint'}</small></div>;
}

/** Échelle A0 → B2 : paliers franchis, palier en cours (rempli au prorata), paliers à venir. */
export function TierLadder({ p }: { p: P }) {
  const cur = TIERS.indexOf(p.tier);
  const pct = Math.round(p.toNext * 100);
  return (
    <div>
      <div className="ladder" aria-hidden="true">{TIERS.slice(1).map((t, i) => <span key={t} className={i < cur ? 'done' : i === cur ? 'cur' : ''} style={i === cur ? { ['--p' as string]: pct } : undefined} />)}</div>
      <div className="ladder-l">{TIERS.map((t, i) => <span key={t} className={i === cur ? 'cur' : ''}>{t}</span>)}</div>
    </div>
  );
}

const SKILL_LINK: Partial<Record<string, string>> = { cons: '/explore/alphabet', vowels: '/explore/vowels', vocab: '/explore/vocab', grammar: '/explore/grammar', tones: '/explore/tones', reading: '/explore/readings', listening: '/explore/comprehension', speaking: '/review', conversation: '/explore/dialogs' };

/** Barres de compétences. `only` limite aux compétences concernées par l'objectif ; `mark` dessine le jalon du prochain palier. */
export function SkillBars({ p, compact, limit }: { p: P; compact?: boolean; limit?: number }) {
  const mark = p.next && p.next !== 'B2' ? TIER_MARK[p.next] : 100;
  const list = p.skills.filter((s) => p.relevant.includes(s.id)).slice(0, limit);
  return (
    <div className="skills">
      {list.map((s) => <SkillRow key={s.id} s={s} mark={mark} compact={compact} />)}
    </div>
  );
}

function SkillRow({ s, mark, compact }: { s: SkillProgress; mark: number; compact?: boolean }) {
  const meta = SKILL_META.find((m) => m.id === s.id)!;
  const to = SKILL_LINK[s.id] ?? '/profile/progress';
  return (
    <Link to={to} className={`skill ${s.ok ? 'ok' : ''}`}>
      <span className="n">{meta.label}</span>
      <span className="v">{s.value} %</span>
      <div className="bar thin"><i style={{ width: `${s.value}%` }} />{mark < 100 && <em className="mk" style={{ left: `${mark}%` }} />}</div>
      {!compact && <span className="d"><span>{s.detail}</span>{s.toReview > 0 && <span className="rev">{s.toReview} à réviser</span>}</span>}
    </Link>
  );
}

/** Courbe de la progression globale sur les derniers jours (journal quotidien). */
export function ProgressSpark({ log, days = 30 }: { log: Record<string, number[]>; days?: number }) {
  const keys = Object.keys(log).sort();
  if (keys.length < 2) return <p className="sm mut">La courbe apparaîtra après quelques jours d’étude.</p>;
  const recent = keys.slice(-days);
  const vals = recent.map((k) => log[k][0] ?? 0);
  const W = 320, H = 64, max = Math.max(10, ...vals);
  const pts = vals.map((v, i) => [(i / Math.max(1, vals.length - 1)) * W, H - 4 - (v / max) * (H - 10)] as const);
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const first = vals[0], last = vals[vals.length - 1];
  return (
    <div>
      <svg className="spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-label={`Progression globale : de ${first} à ${last} sur ${vals.length} jours`}>
        <path d={`${d} L${W},${H} L0,${H} Z`} fill="var(--acc-soft)" />
        <path d={d} fill="none" stroke="var(--acc)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <div className="kv"><span>Il y a {vals.length} jour{vals.length > 1 ? 's' : ''} : <b>{first} %</b></span><span>Aujourd’hui : <b>{last} %</b></span>{last > first && <span className="ok-t">+{last - first} points</span>}</div>
    </div>
  );
}
