/** Texte de lecture : lire sans aide d'abord ; audio, phonétique, traduction et mot à mot à la demande. */
import { useState } from 'react';
import { useSpeaker } from '@/app/services/speech';
import { READING_BY_ID, sentenceThai, sentenceRom } from '@/content/th';
import { L } from '@/i18n';
import { Icon, Thai, Rom, Fr } from './ui';

export function ReadingView({ id, onDone, doneLabel }: { id: string; onDone?: () => void; doneLabel?: string }) {
  const r = READING_BY_ID[id];
  const sp = useSpeaker();
  const [on, setOn] = useState<Record<string, boolean>>({});
  if (!r) return null;
  const tog = (k: string) => setOn({ ...on, [k]: !on[k] });
  return (
    <>
      <p className="lead">Lisez d’abord sans aide. L’audio, la phonétique et la traduction ne s’affichent que si vous les demandez.</p>
      {r.sentences.map((s, i) => {
        const thai = sentenceThai(s.tokens, r.level === 1), rom = sentenceRom(s.tokens);
        return (
          <div key={i} className={`sent ${r.level === 1 ? 'l1' : ''}`}>
            <Thai text={thai} />
            {on[i + 'rom'] && <Rom text={rom} />}
            {on[i + 'tr'] && <div className="mut" style={{ marginTop: 4 }}><Fr text={s.tr} /></div>}
            {on[i + 'w'] && <div className="wbw">{s.tokens.map((t, k) => <span key={k}><b lang="th"><Fr text={t.thai} /></b><em><Fr text={t.rom} /></em>{L(t.gloss)}</span>)}</div>}
            <div className="acts" style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              <button className="mini" onClick={() => sp.speak(thai)} aria-label="Écouter"><Icon name="speaker" /></button>
              <button className="mini" onClick={() => sp.speak(thai, { slow: true })} aria-label="Lentement"><Icon name="turtle" /></button>
              <button className={`mini ${on[i + 'rom'] ? 'on' : ''}`} onClick={() => tog(i + 'rom')} aria-label="Phonétique"><Icon name="eye" /></button>
              <button className={`mini ${on[i + 'tr'] ? 'on' : ''}`} onClick={() => tog(i + 'tr')} aria-label="Traduction">🇫🇷</button>
              <button className={`mini ${on[i + 'w'] ? 'on' : ''}`} onClick={() => tog(i + 'w')} style={{ fontSize: 12, padding: '0 8px' }}>mot à mot</button>
            </div>
          </div>
        );
      })}
      {onDone && <button className="btn" onClick={onDone}>{doneLabel ?? 'J’ai lu ce texte'}</button>}
    </>
  );
}
