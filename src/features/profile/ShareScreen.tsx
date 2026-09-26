/**
 * Partager ma progression : une carte image générée localement (canvas), partageable via le partage natif
 * ou téléchargeable. Aucune donnée n'est envoyée à un serveur.
 */
import { useEffect, useRef, useState } from 'react';
import { usePage } from '@/app/Shell';
import { useStore, streakDays } from '@/app/store';
import { useProgress } from '@/app/hooks';
import { tierLine } from '@/engine/progress';
import { T } from '@/i18n';
import { Icon, useToast } from '@/components/ui';

export function ShareScreen() {
  const t = T();
  usePage(t.profile.share, { back: '/profile' });
  const profile = useStore((s) => s.profile)!;
  const days = useStore((s) => s.days);
  const p = useProgress();
  const toast = useToast((s) => s.show);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const streak = streakDays(days);
  const level = tierLine(p);
  const words = p.counts.wordsAcquired, letters = p.counts.consAcquired, lessons = p.counts.lessonsDone;
  const text = `${profile.name} apprend le thaï 🇹🇭\n${level}\n${words} mots acquis · ${letters} lettres acquises\n${lessons} leçons · Série : ${streak} jour${streak > 1 ? 's' : ''}`;

  useEffect(() => {
    const c = canvas.current; if (!c) return;
    const W = 1080, H = 1350; c.width = W; c.height = H;
    const ctx = c.getContext('2d')!;
    const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#10806B'); g.addColorStop(0.5, '#0B6B5A'); g.addColorStop(1, '#06392F');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // ruban des tons
    const ribbons: [string, number[]][] = [['#C9D6D2', [60, 58, 62, 60]], ['#9DB0F5', [78, 80, 96, 100]], ['#F09A92', [44, 8, 18, 106]], ['#EBC765', [50, 46, 30, 12]], ['#6FD3BA', [94, 112, 70, 20]]];
    ctx.globalAlpha = 0.35; ctx.lineWidth = 10; ctx.lineCap = 'round';
    ribbons.forEach(([col, ys]) => { ctx.strokeStyle = col; ctx.beginPath(); ctx.moveTo(-20, 900 + ys[0] * 3); ctx.bezierCurveTo(300, 900 + ys[1] * 3, 700, 900 + ys[2] * 3, W + 20, 900 + ys[3] * 3); ctx.stroke(); });
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.beginPath(); ctx.roundRect(70, 70, W - 140, H - 140, 48); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'left';
    ctx.font = '600 150px Sarabun, sans-serif'; ctx.fillText('ภาษาไทย', 120, 290);
    ctx.font = '700 64px "Bricolage Grotesque Variable", system-ui, sans-serif'; ctx.fillText(`${profile.name} apprend le thaï`, 120, 400);
    ctx.font = '500 40px system-ui, sans-serif'; ctx.globalAlpha = .85; ctx.fillText(level, 120, 470); ctx.globalAlpha = 1;
    const stats: [string, string][] = [[String(words), 'mots acquis'], [String(letters), 'lettres acquises'], [String(lessons), 'leçons validées'], [`${streak} j`, 'de suite']];
    stats.forEach(([v, k], i) => { const x = 120 + (i % 2) * 440, y = 620 + Math.floor(i / 2) * 230; ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.beginPath(); ctx.roundRect(x, y - 110, 400, 190, 32); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '700 96px system-ui, sans-serif'; ctx.fillText(v, x + 36, y); ctx.font = '500 34px system-ui, sans-serif'; ctx.globalAlpha = .85; ctx.fillText(k, x + 36, y + 52); ctx.globalAlpha = 1; });
    ctx.font = '600 44px Sarabun, sans-serif'; ctx.fillText('สู้ ๆ นะ · courage !', 120, 1180);
    ctx.font = '500 30px system-ui, sans-serif'; ctx.globalAlpha = .7; ctx.fillText('Langue · apprendre le thaï, un pas après l’autre', 120, 1240); ctx.globalAlpha = 1;
    c.toBlob((b) => setBlob(b), 'image/png');
  }, [profile.name, level, words, letters, lessons, streak]);

  const share = async () => {
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    const aborted = (e: unknown) => (e as Error)?.name === 'AbortError';
    if (blob && nav.share && nav.canShare?.({ files: [new File([blob], 'langue.png', { type: 'image/png' })] })) {
      try { await nav.share({ files: [new File([blob], 'langue.png', { type: 'image/png' })], text }); return; } catch (e) { if (aborted(e)) return; }
    }
    if (nav.share) { try { await nav.share({ text }); return; } catch (e) { if (aborted(e)) return; } }
    try { await navigator.clipboard.writeText(text); toast('Résumé copié dans le presse-papiers.'); } catch { toast('Partage et copie impossibles ici : téléchargez l’image.'); }
  };
  const download = () => { if (!blob) return; const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'langue-progression.png'; a.click(); };
  return (
    <>
      <p className="lead">Une carte générée sur votre appareil, à envoyer à qui vous voulez. Rien n’est publié automatiquement.</p>
      <div className="sharecard"><canvas ref={canvas} aria-label="Carte de progression" /></div>
      <div className="btns mt-3"><button className="btn" onClick={share}><Icon name="share" size={18} /> Partager</button><button className="btn soft" onClick={download}><Icon name="download" size={18} /> Image</button></div>
      <pre className="note plain sm">{text}</pre>
      <div className="note info sm">Envie de vous mesurer à quelqu’un ? Comparez vos cartes chaque dimanche, ou lancez le même « Défi chrono » et comparez les scores. Un mode duel synchronisé pourra s’appuyer sur le format d’export.</div>
    </>
  );
}
