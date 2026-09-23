/**
 * Test de lecture facultatif : 10 questions de difficulté croissante (lettres, mots, tons).
 * « Je ne sais pas » est toujours proposé. Le résultat propose un niveau de lecture 0–4.
 */
import { useMemo, useState } from 'react';
import { Sheet, Thai, Icon } from '@/components/ui';
import { CONS_BY_CHAR, TONE_BY_THAI, WORD_BY_THAI } from '@/content/th';
import { toneNameFr } from '@/engine/thai/toneRule';
import { shuffle } from '@/engine/util';
import type { Level } from '@/curriculum/types';
import { T } from '@/i18n';

interface Q { thai: string; prompt: string; choices: { label: string; ok: boolean }[]; level: number }

function build(): Q[] {
  const letter = (ch: string, wrong: string[], level: number): Q => ({ thai: ch, prompt: 'Quel est le son de cette lettre ?', level, choices: shuffle([{ label: CONS_BY_CHAR[ch].initial, ok: true }, ...wrong.map((w) => ({ label: w, ok: false }))]) });
  const word = (th: string, level: number): Q => { const w = WORD_BY_THAI[th]; return { thai: th, prompt: 'Comment se lit ce mot ?', level, choices: shuffle([{ label: w.rom, ok: true }, ...['sà-baai', 'khâao', 'mʉ̂a-rài', 'nǎng-sʉ̌ʉ', 'rót-fai', 'tà-làat'].filter((x) => x !== w.rom).slice(0, 3).map((x) => ({ label: x, ok: false }))]) }; };
  const tone = (th: string, level: number): Q => { const t = TONE_BY_THAI[th]; return { thai: th, prompt: 'Quel est le ton de ce mot ?', level, choices: shuffle((['M', 'L', 'F', 'H', 'R'] as const).map((id) => ({ label: toneNameFr(id), ok: id === t.tone }))) }; };
  return [
    letter('ก', ['m', 's', 'n'], 1), letter('ม', ['k', 'p', 't'], 1), letter('ส', ['h', 'r', 'ng'], 1),
    word('มา', 2), word('กิน', 2), word('ข้าว', 2),
    word('เพื่อน', 3), tone('หมา', 3), word('ตลาด', 3),
    tone('ใกล้', 4),
  ];
}

export function PlacementTest({ onClose, onResult }: { onClose: () => void; onResult: (level: Level) => void }) {
  const t = T();
  const qs = useMemo(build, []);
  const [i, setI] = useState(0);
  const [score, setScore] = useState<Record<number, number>>({});
  const q = qs[i];
  const answer = (ok: boolean) => {
    const s = { ...score, [q.level]: (score[q.level] ?? 0) + (ok ? 1 : 0) };
    setScore(s);
    if (i + 1 < qs.length) setI(i + 1);
    else {
      // niveau atteint : le plus haut palier où au moins 2/3 des réponses sont justes
      const counts: Record<number, number> = { 1: 3, 2: 3, 3: 3, 4: 1 };
      let lvl = 0;
      for (const L of [1, 2, 3, 4]) { if ((s[L] ?? 0) / counts[L] >= 0.66) lvl = L; else break; }
      onResult(lvl as Level);
    }
  };
  return (
    <Sheet open onClose={onClose} title={t.onboarding.placementTitle}>
      <p className="lead">{t.onboarding.placementIntro}</p>
      <div className="sess"><div className="bar thin"><i style={{ width: `${(i / qs.length) * 100}%` }} /></div><span className="n">{i + 1} / {qs.length}</span></div>
      <p className="qprompt">{q.prompt}</p>
      <div className="stage compact"><div className="big s2"><Thai text={q.thai} /></div></div>
      <div className="choices c2">
        {q.choices.map((c, k) => <button key={k} className="choice" onClick={() => answer(c.ok)}><span className="rom" style={{ fontSize: 18 }}>{c.label}</span></button>)}
      </div>
      <button className="btn ghost sm" style={{ marginTop: 10 }} onClick={() => answer(false)}><Icon name="close" size={16} /> {t.onboarding.dontKnow}</button>
    </Sheet>
  );
}
