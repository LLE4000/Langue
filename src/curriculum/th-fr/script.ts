/**
 * Piste « Lire le thaï » : de la première consonne à la lecture d'un mot inconnu.
 *
 * Chaque étape introduit quelques signes ou une règle. Les mots proposés à la lecture sont CHOISIS
 * AUTOMATIQUEMENT parmi tout le contenu : seuls les mots lisibles avec les signes déjà enseignés sont
 * retenus (voir engine/thai/reading). On ne demande donc jamais de lire un signe inconnu.
 */
import type { Localized } from '@/content/types';
import type { ActivitySpec, LessonDef, LessonKind, TheoryBlock, UnitDef } from '../types';
import { CONS_BY_CHAR, ITEMS, TONE_ITEMS, WORD_ITEMS, th } from '@/content/th';
import { readingRequirements, isOpenMonosyllable, syllableCount } from '@/engine/thai/reading';
import { toneRule } from '@/engine/thai/toneRule';
import { markTone } from '@/engine/thai/transcription';

interface Stage {
  id: string;
  unit: string;
  title: Localized; // court, une ligne
  subtitle: Localized; // en français : les sons ou la notion, sans suite de signes thaïs
  kind: LessonKind;
  badge?: string; // glyphe du badge de la carte (sinon : première lettre ou voyelle introduite)
  count?: Localized; // indicateur de contenu, quand il ne se déduit pas des lettres et voyelles
  cons?: string; // lettres introduites
  vowels?: string[]; // formes de voyelles introduites
  marks?: number[]; // marques de ton introduites
  rules?: string[]; // règles introduites (rule:…)
  intro: Localized; // texte d'ouverture
  tip?: Localized;
  readLevel: 1 | 2 | 3 | 4;
  extra?: TheoryBlock[]; // blocs de théorie supplémentaires
  toneFocus?: boolean; // ajoute des exercices de tons sur les mots lisibles
  wordCount?: number;
}

const VOWEL_ID = (form: string) => 'v:' + form;
const RULE_LIVE_DEAD = 'rule:live-dead';

export const SCRIPT_UNITS: UnitDef[] = [
  { id: 'u-script-1', track: 'script', title: { fr: 'Premières lettres' }, description: { fr: 'Les consonnes les plus fréquentes, les voyelles de base, et déjà de vrais mots.' } },
  { id: 'u-script-2', track: 'script', title: { fr: 'Les tons à l’écrit' }, description: { fr: 'Classes de consonnes, syllabes vivantes et mortes, marques de ton.' } },
  { id: 'u-script-3', track: 'script', title: { fr: 'Tout l’alphabet' }, description: { fr: 'Les autres consonnes, les voyelles composées, ห นำ, les finales.' } },
  { id: 'u-script-4', track: 'script', title: { fr: 'Lire couramment' }, description: { fr: 'Les cas particuliers, les lettres rares, et la méthode complète pour lire un mot inconnu.' } },
];

const STAGES: Stage[] = [
  { id: 'read-01', unit: 'u-script-1', title: { fr: 'Premières consonnes' }, subtitle: { fr: 'k, d, t, b, p et la voyelle « aa »' }, kind: 'letters', badge: 'ก', cons: 'กดตบป', vowels: ['–า'], readLevel: 1,
    intro: { fr: 'Le thaï s’écrit avec 44 consonnes. On commence par cinq lettres très fréquentes, toutes de la même classe (moyenne), et une voyelle longue qui s’écrit après la consonne. Cela suffit déjà pour lire trois vrais mots.' },
    tip: { fr: 'Une syllabe thaïe = une consonne + une voyelle. Ici la voyelle –า s’écrit après la consonne et se prononce « aa », long, comme dans « pâte ».' } },
  { id: 'read-02', unit: 'u-script-1', title: { fr: 'Voyelles longues' }, subtitle: { fr: '« ii », « uu », « ɔɔ », puis n, m et la lettre muette' }, kind: 'vowels', badge: 'อี', cons: 'อนม', vowels: ['–ี', '–ู', '–อ'], readLevel: 1,
    intro: { fr: 'Trois nouvelles lettres, dont อ : une consonne « silencieuse » qui porte une voyelle en début de mot… et qui sert aussi à écrire la voyelle « ɔɔ » après une consonne. Les voyelles peuvent s’écrire au-dessus (–ี) ou en dessous (–ู) de la consonne : elles se prononcent toujours après.' },
    tip: { fr: 'มา « venir », ดี « bon », มี « avoir » : ces mots comptent parmi les plus utilisés du thaï. Vous les lisez déjà.' } },
  { id: 'read-03', unit: 'u-script-1', title: { fr: 'Consonnes sonores' }, subtitle: { fr: 'r, l, ng, y, w et les voyelles courtes « i », « u »' }, kind: 'letters', badge: 'ร', cons: 'รลงยว', vowels: ['–ิ', '–ุ'], readLevel: 1,
    intro: { fr: 'Cinq consonnes de classe basse : les sonores r, l, ng, y, w. Le son « ng » de « parking » existe en début de mot en thaï (งู « serpent »). Les voyelles –ิ et –ุ sont les versions COURTES de –ี et –ู : la durée change le sens.' },
    tip: { fr: 'Comparez –ี (long) et –ิ (court) : c’est le même son, mais tenu deux fois moins longtemps. En thaï, la longueur d’une voyelle fait partie du mot.' } },
  { id: 'read-04', unit: 'u-script-1', title: { fr: 'Consonnes finales' }, subtitle: { fr: 'Quand la syllabe se termine par n, m, ng, i ou o' }, kind: 'rules', badge: 'กิน', count: { fr: '5 finales' }, rules: ['rule:final-live'], readLevel: 1,
    intro: { fr: 'Une syllabe peut se terminer par une consonne. Avec น ม ง ย ว en finale, le son se prolonge : on dit que la syllabe est « vivante ». Attention : ย et ว en finale se lisent « i » et « o » (ยาว yaao, ยาย yaai).' },
    tip: { fr: 'Lisez de gauche à droite : consonne, voyelle, puis la finale. กิน = k + i + n. Le ton reste moyen pour l’instant : toutes ces lettres sont de classe moyenne ou basse et la syllabe est vivante.' } },
  { id: 'read-05', unit: 'u-script-1', title: { fr: 'Voyelles écrites avant' }, subtitle: { fr: '« ee », « ɛɛ », « oo » : écrites devant, dites après' }, kind: 'vowels', badge: 'เอ', vowels: ['เ–', 'แ–', 'โ–'], readLevel: 1,
    intro: { fr: 'Trois voyelles longues s’écrivent devant la consonne, mais se prononcent après elle : เม se lit « mee », pas « em ». C’est la règle la plus déroutante au début ; elle devient vite naturelle.' },
    tip: { fr: 'Quand vous voyez เ แ ou โ, cherchez la consonne juste après : c’est elle qui commence la syllabe. แดง « rouge » = d + ɛɛ + ng.' } },
  { id: 'read-06', unit: 'u-script-1', title: { fr: 'Voyelles spéciales' }, subtitle: { fr: '« ai » (deux formes), « ao » et « am »' }, kind: 'vowels', badge: 'ไอ', vowels: ['ไ–', 'ใ–', 'เ–า', '–ำ'], readLevel: 1,
    intro: { fr: 'Quatre voyelles particulières. ไ– et ใ– se prononcent toutes deux « ai » : seuls vingt mots s’écrivent avec ใ (dont ใน « dans » et ใจ « cœur »). เ–า entoure la consonne et se lit « ao ». –ำ se lit « am ».' },
    tip: { fr: 'Ces voyelles sont brèves à l’oreille mais comptent comme des syllabes VIVANTES (elles finissent par un son i, o ou m). C’est important pour les tons.' } },
  { id: 'read-07', unit: 'u-script-2', title: { fr: 'Les cinq tons' }, subtitle: { fr: 'Les entendre, puis distinguer syllabes vivantes et mortes' }, kind: 'tones', count: { fr: '5 tons' }, rules: [RULE_LIVE_DEAD], readLevel: 2, toneFocus: true,
    intro: { fr: 'Chaque syllabe thaïe porte un des cinq tons, et le ton fait partie du mot : มา (moyen) « venir », ม้า (haut) « cheval », หมา (montant) « chien ». Avant les règles, on entraîne l’oreille. Puis on apprend la notion clé : une syllabe est VIVANTE (son prolongeable : voyelle longue ou finale n, m, ng, i, o) ou MORTE (voyelle courte seule, ou finale bloquée k, t, p).' },
    extra: [{ kind: 'tones' }],
    tip: { fr: 'Vous n’avez pas besoin de « chanter » : parlez normalement et laissez la voix monter ou descendre comme dans « ah ? » (montant) et « ah ! » (descendant).' } },
  { id: 'read-08', unit: 'u-script-2', title: { fr: 'Classes de consonnes' }, subtitle: { fr: 'Moyenne, haute, basse : la clé du ton' }, kind: 'tones', count: { fr: '3 classes' }, rules: ['rule:M|live', 'rule:L|live'], readLevel: 2, toneFocus: true,
    intro: { fr: 'Chaque consonne appartient à une classe : moyenne (ก จ ด ต บ ป อ), haute (ข ฉ ถ ผ ฝ ส ห…) ou basse (toutes les autres). La classe ne change pas le son de la lettre : elle sert à trouver le ton. Première règle : sans marque de ton, une syllabe vivante se dit au ton MOYEN avec une consonne moyenne ou basse.' },
    tip: { fr: 'Pour retenir les 9 consonnes moyennes : ไก่จิกเด็กตายบนปากโอ่ง « le poulet picore l’enfant mort sur le bord de la jarre » (ก จ ด ต บ ป อ, plus ฎ ฏ). Apprenez la classe avec chaque lettre, comme le genre d’un nom en français.' } },
  { id: 'read-09', unit: 'u-script-2', title: { fr: 'Deux marques de ton' }, subtitle: { fr: 'Sur une consonne moyenne : ton bas, ton descendant' }, kind: 'tones', badge: 'ก่', count: { fr: '2 marques' }, marks: [1, 2], rules: ['rule:M|m1', 'rule:M|m2'], readLevel: 2, toneFocus: true,
    intro: { fr: 'Deux petites marques au-dessus de la consonne changent le ton. Sur une consonne de classe MOYENNE, c’est simple : ่ (ไม้เอก) donne le ton BAS, ้ (ไม้โท) donne le ton DESCENDANT. ไก่ « poulet » (bas), ได้ « pouvoir » (descendant).' },
    tip: { fr: 'La marque s’écrit au-dessus de la consonne (et au-dessus d’une voyelle haute s’il y en a une : ปี่). Elle décide du ton avec la classe, quoi qu’il arrive ensuite.' } },
  { id: 'read-10', unit: 'u-script-2', title: { fr: 'Marques et consonnes basses' }, subtitle: { fr: 'Les mêmes marques décalent le ton d’un cran' }, kind: 'tones', badge: 'ม้า', count: { fr: '2 règles' }, rules: ['rule:L|m1', 'rule:L|m2'], readLevel: 2, toneFocus: true,
    intro: { fr: 'Avec une consonne de classe BASSE, les mêmes marques décalent le ton d’un cran : ่ donne le ton DESCENDANT (แม่ « mère », ไม่ « ne… pas »), ้ donne le ton HAUT (ม้า « cheval », น้ำ « eau »). C’est la seule chose à retenir pour lire correctement une grande partie du vocabulaire courant.' },
    tip: { fr: 'Moyen : ่ = bas, ้ = descendant. Basse : ่ = descendant, ้ = haut. Répétez cette paire de phrases jusqu’à ce qu’elle soit automatique.' } },
  { id: 'read-11', unit: 'u-script-3', title: { fr: 'Consonnes hautes' }, subtitle: { fr: 'j, s, h, kh et le ton montant' }, kind: 'letters', badge: 'ข', cons: 'จสหข', rules: ['rule:H|live', 'rule:H|m1', 'rule:H|m2'], readLevel: 2, toneFocus: true,
    intro: { fr: 'จ est de classe moyenne (son « j », entre « tch » et « dj »). ส ห ข sont de classe HAUTE : sans marque, une syllabe vivante se dit au ton MONTANT (ขา « jambe », สี « couleur », หู « oreille »). Avec ่ : ton bas (ไข่ « œuf »). Avec ้ : ton descendant (ข้าว « riz », ให้ « donner »).' },
    tip: { fr: 'Une consonne haute se reconnaît souvent à l’oreille : son nom se dit sur un ton montant (khɔ̌ɔ khài, sɔ̌ɔ sʉ̌a, hɔ̌ɔ hìip).' } },
  { id: 'read-12', unit: 'u-script-3', title: { fr: 'Syllabes mortes' }, subtitle: { fr: 'Finales k, t, p et voyelle courte « a » : le ton change' }, kind: 'rules', badge: 'มาก', count: { fr: '3 finales + 1 voyelle' }, vowels: ['–ะ'], rules: ['rule:final-dead', 'rule:M|dead', 'rule:H|dead', 'rule:L|dead-short', 'rule:L|dead-long'], readLevel: 2, toneFocus: true,
    intro: { fr: 'Une syllabe est MORTE quand elle finit par un son bloqué k, t, p (finales ก ด บ, mais aussi ต ป) ou par une voyelle courte sans finale (จะ). La voyelle courte « a » s’écrit –ะ en fin de mot, et devient ◌ั devant une finale (รัก rák). Sans marque de ton, une syllabe morte se dit au ton BAS (classes moyenne et haute) ; avec une consonne basse : HAUT si la voyelle est courte (รัก), DESCENDANT si elle est longue (มาก).' },
    tip: { fr: 'En finale, la consonne ne « relâche » pas : la bouche se met en position mais ne laisse pas sortir d’air. ด et ต en finale se lisent tous deux « t », บ et ป « p ».' } },
  { id: 'read-13', unit: 'u-script-3', title: { fr: 'Consonnes aspirées' }, subtitle: { fr: 'kh, th, ph, ch : prononcées avec un souffle' }, kind: 'letters', badge: 'ค', cons: 'คทพช', readLevel: 2, toneFocus: true,
    intro: { fr: 'Quatre consonnes de classe basse très fréquentes : ค « kh », ท « th », พ « ph », ช « ch ». Le petit h indique un souffle d’air après la consonne : ท se dit « t » suivi d’un souffle, jamais comme le « th » anglais. Elles suivent les règles de la classe basse que vous connaissez déjà.' },
    tip: { fr: 'Paires à ne pas confondre : ก (k sans souffle) / ค (kh avec souffle), ต / ท, ป / พ, จ / ช. Mettez la main devant la bouche : le souffle se sent.' } },
  { id: 'read-14', unit: 'u-script-3', title: { fr: 'Le h muet et le « o » caché' }, subtitle: { fr: 'Deux règles d’écriture essentielles' }, kind: 'rules', badge: 'หมา', count: { fr: '2 règles + 1 consonne' }, cons: 'ผ', rules: ['rule:hnam', 'rule:implicit-o'], readLevel: 2, toneFocus: true,
    intro: { fr: 'Deux règles d’écriture essentielles. 1) Un ห muet devant ง ญ น ม ย ร ล ว fait passer la syllabe en classe HAUTE : หมา « chien » se lit mǎa (montant). 2) Entre deux consonnes sans voyelle écrite, on prononce un « o » court : คน « personne » = khon, ผม « je » = phǒm.' },
    tip: { fr: 'Le ห de ห นำ ne se prononce pas : il sert uniquement à changer la classe, donc le ton. หนู « souris » nǔu, ใหม่ « nouveau » mài.' } },
  { id: 'read-15', unit: 'u-script-3', title: { fr: 'Voyelles « ʉ » et « əə »' }, subtitle: { fr: 'Trois sons qui n’existent pas en français' }, kind: 'vowels', badge: 'อือ', vowels: ['–ึ', '–ือ', 'เ–อ'], readLevel: 3,
    intro: { fr: 'Trois voyelles qui n’existent pas en français. –ึ / –ือ (« ʉ ») : dites « ou » en étirant les lèvres comme pour sourire. เ–อ (« əə ») : proche du e de « le », plus long. Attention aux formes fermées : devant une finale, –ือ perd son อ (คืน) et เ–อ devient เ◌ิ◌ (เงิน « argent », เดิน « marcher »).' },
    tip: { fr: 'หนึ่ง « un » réunit ห นำ, la voyelle ึ, la marque ่ et la finale ง : vous savez maintenant tout lire dedans.' } },
  { id: 'read-16', unit: 'u-script-3', title: { fr: 'Les diphtongues' }, subtitle: { fr: '« ia », « ʉa », « ua » : on glisse d’un son à l’autre' }, kind: 'vowels', badge: 'เอีย', vowels: ['เ–ีย', 'เ–ือ', '–ัว'], readLevel: 3,
    intro: { fr: 'Trois voyelles doubles : on glisse de ia, ʉa ou ua. Elles s’écrivent avec plusieurs signes autour de la consonne. Devant une finale, –ัว s’écrit simplement ว : สวน « jardin » sǔan, สวย « beau » sǔai.' },
    tip: { fr: 'Repérez d’abord la voyelle complète autour de la consonne, puis lisez la syllabe d’un bloc : เ-พ-ื-อ-น = ph + ʉa + n.' } },
  { id: 'read-17', unit: 'u-script-3', title: { fr: 'Six consonnes de plus' }, subtitle: { fr: 'th, f, ch, s, f, h : même son, autre classe' }, kind: 'letters', badge: 'ฝ', cons: 'ถฝฉซฟฮ', readLevel: 3, toneFocus: true,
    intro: { fr: 'ถ ฝ ฉ sont de classe haute (th, f, ch) ; ซ ฟ ฮ de classe basse (s, f, h). Plusieurs lettres partagent un son : ส et ซ font « s », ผ ฝ / พ ฟ font « ph / f ». Ce qui les distingue, c’est la classe, donc le ton des mots où elles apparaissent.' },
    tip: { fr: 'Même son, classe différente : ซื้อ « acheter » (basse + ้ = haut) et สื่อ « média » (haute + ่ = bas).' } },
  { id: 'read-18', unit: 'u-script-3', title: { fr: 'Finales et groupes' }, subtitle: { fr: 'Finales irrégulières, consonnes groupées, « a » caché' }, kind: 'rules', badge: 'ปลา', count: { fr: '3 règles' }, rules: ['rule:final-irregular', 'rule:cluster', 'rule:implicit-a'], readLevel: 3,
    intro: { fr: 'En fin de syllabe, beaucoup de lettres changent de son : ส จ ช ท ถ… se lisent « t » (อาหาร → aa-hǎan : ร final se lit « n »). Deux consonnes peuvent se prononcer ensemble : ปลา « poisson » plaa, ครับ khráp. Et dans ตลาด, สบาย, on glisse un « a » court entre deux consonnes : ta-làat, sa-baai.' },
    tip: { fr: 'Finales possibles en thaï : seulement k, t, p, n, m, ng, i, o. Une lettre finale se ramène toujours à l’un de ces sons.' } },
  { id: 'read-19', unit: 'u-script-3', title: { fr: 'Voyelles courtes' }, subtitle: { fr: '« e », « ɛ », « o », « ɔ », « ə » et le signe de brièveté' }, kind: 'vowels', badge: 'เอะ', vowels: ['เ–ะ', 'แ–ะ', 'โ–ะ', 'เ–าะ', 'เ–อะ'], readLevel: 3,
    intro: { fr: 'Les versions courtes de เ– แ– โ– –อ s’écrivent avec –ะ en fin de mot (และ « et », เกาะ « île »). Devant une finale, le –ะ disparaît et un petit ็ apparaît : เผ็ด « épicé » phèt, เย็น « frais » yen, เล็ก « petit » lék.' },
    tip: { fr: 'Le signe ็ (ไม้ไต่คู้) veut dire « voyelle courte ». Une syllabe qui finit par ะ est toujours morte.' } },
  { id: 'read-20', unit: 'u-script-4', title: { fr: 'Lettres savantes' }, subtitle: { fr: 'Sept consonnes du sanskrit, la lettre muette, la répétition' }, kind: 'letters', badge: 'ภ', cons: 'ญณธภศษฐ', rules: ['rule:karan', 'rule:onam', 'rule:maiyamok'], readLevel: 3,
    intro: { fr: 'Sept consonnes venues du sanskrit et du pali : elles doublent des sons connus (ณ = น, ธ = ท, ศ ษ = ส…). Le signe ◌์ rend muette la lettre qu’il surmonte (โทรศัพท์ thoo-rá-sàp). Quatre mots s’écrivent avec un อ muet devant ย : อย่า อยู่ อย่าง อยาก (classe moyenne). Le signe ๆ répète le mot précédent (ช้าๆ « lentement »).' },
    tip: { fr: 'Les lettres rares se rencontrent dans des mots très courants : ภาษา « langue », ผู้หญิง « femme », ธนาคาร « banque ». Apprenez-les par ces mots.' } },
  { id: 'read-21', unit: 'u-script-4', title: { fr: 'Derniers signes' }, subtitle: { fr: 'Deux marques de ton, lettres rares, chiffres thaïs' }, kind: 'letters', badge: 'ฆ', cons: 'ฆฌฎฏฑฒฬฃฅ', marks: [3, 4], vowels: ['ฤ', 'เ–ย'], rules: ['rule:M|m3', 'rule:M|m4', 'rule:digits', 'rule:silent-r', 'rule:ko', 'rule:paiyan'], readLevel: 4,
    intro: { fr: 'Les marques ๊ (haut) et ๋ (montant) ne s’emploient qu’avec la classe moyenne, surtout dans les emprunts et les onomatopées : โต๊ะ « table », ตั๋ว « billet ». Restent neuf consonnes rares ou obsolètes, la lettre-voyelle ฤ, la voyelle เ–ย (เคย, เลย), et les chiffres thaïs ๐–๙, visibles sur les documents officiels et les prix d’entrée.' },
    tip: { fr: 'Bravo : vous connaissez désormais tous les signes de l’écriture thaïe. La suite, c’est de la pratique : lire, lire, lire.' } },
];

// ---------------------------------------------------------------------------------------------
// Sélection automatique des mots lisibles
// ---------------------------------------------------------------------------------------------

interface Candidate { id: string; thai: string; score: number }

function candidates(): Candidate[] {
  const out: Candidate[] = [];
  const themeRank = (themes: string[]) => { const r = themes.map((t) => th.THEME_ORDER.indexOf(t)).filter((x) => x >= 0); return r.length ? Math.min(...r) : 40; };
  for (const w of WORD_ITEMS) {
    if (/[\s{…]/.test(w.thai) || w.thai.length > 14) continue;
    const syl = syllableCount(w.thai);
    if (syl > 3) continue;
    const base = w.sub ? (w.ref.themes.length ? 30 : 15) : themeRank(w.ref.themes) / 2;
    out.push({ id: w.id, thai: w.thai, score: base + (syl > 2 ? 20 : syl > 1 ? 6 : 0) });
  }
  for (const t of TONE_ITEMS) if (!ITEMS['w:' + t.thai]) out.push({ id: t.id, thai: t.thai, score: 25 });
  return out.sort((a, b) => a.score - b.score);
}

const SIMPLE_VOWELS = ['–า', '–ี', '–ู', '–อ', '–ิ', '–ุ', 'เ–', 'แ–', 'โ–', 'ไ–', 'ใ–', 'เ–า', '–ำ', '–ือ', 'เ–อ', 'เ–ีย', 'เ–ือ', '–ัว', '–ะ', '–ึ'];
const LIVE_SPECIAL = new Set(['ไ–', 'ใ–', 'เ–า', '–ำ']);

/** Transcription d'une syllabe ouverte consonne + voyelle, ton compris. */
function syllableRom(consChar: string, vowelForm: string): string {
  const c = CONS_BY_CHAR[consChar];
  const v = th.VOWELS.find((x) => x.form === vowelForm)!;
  const on = c.initial === '(muet)' ? '' : c.initial;
  const live = v.length === 'L' || LIVE_SPECIAL.has(v.form);
  const tone = toneRule(c.cls, live, v.length === 'L', 0) ?? 'M';
  return markTone(on + v.rom, tone);
}

function syllableDrill(newCons: string[], knownCons: string[], newVowels: string[], knownVowels: string[]): { thai: string; rom: string }[] {
  const out: { thai: string; rom: string }[] = [];
  const add = (c: string, v: string) => { if (out.length < 16 && SIMPLE_VOWELS.includes(v) && !/ๅ/.test(v)) out.push({ thai: v.replace('–', c), rom: syllableRom(c, v) }); };
  for (const v of newVowels) for (const c of [...newCons, ...knownCons].slice(0, 6)) add(c, v);
  for (const c of newCons) for (const v of knownVowels.slice(-3)) add(c, v);
  return out;
}

export function buildScriptTrack(): LessonDef[] {
  const known = new Set<string>();
  const knownCons: string[] = [], knownVowels: string[] = [];
  const pool = candidates();
  const used = new Set<string>();
  const lessons: LessonDef[] = [];
  let prev: string | null = null;

  for (const st of STAGES) {
    const newCons = st.cons ? [...st.cons] : [];
    const newVowels = st.vowels ?? [];
    const newConcepts: string[] = [
      ...newCons.map((c) => 'c:' + c),
      ...newVowels.map(VOWEL_ID),
      ...(st.marks ?? []).map((m) => 'm:' + m),
      ...(st.rules ?? []),
    ];
    newConcepts.forEach((c) => known.add(c));
    // La règle vivante/morte et les règles de ton sans marque ne conditionnent pas la lisibilité d'un mot :
    // les mots à ton « implicite » sont lisibles dès que leurs signes le sont (on ne demande pas encore le ton).
    const readable = pool.filter((w) => [...readingRequirements(w.thai)].every((r) => known.has(r)));
    const fresh = readable.filter((w) => !used.has(w.id));
    const usesNew = fresh.filter((w) => { const r = readingRequirements(w.thai); return newConcepts.some((c) => r.has(c)); });
    // Étapes de tons sans nouveau signe : mots lisibles (déjà vus ou non) qui portent les tons concernés
    const toneOf = (w: Candidate) => TONE_ITEMS.find((x) => x.thai === ITEMS[w.id]?.thai);
    const focus = st.toneFocus ? readable.filter((w) => { const t = toneOf(w); return t && (st.rules ?? []).includes(t.ruleKey); }) : [];
    const wordCount = st.wordCount ?? 8;
    let words: Candidate[];
    if (usesNew.length >= 3) words = usesNew.slice(0, wordCount);
    else if (focus.length >= 3) words = [...focus.filter((w) => !used.has(w.id)), ...focus.filter((w) => used.has(w.id))].slice(0, wordCount);
    else words = [...usesNew, ...fresh.filter((w) => !usesNew.includes(w))].slice(0, wordCount);
    const newWordIds = words.filter((w) => !used.has(w.id)).map((w) => w.id);
    words.forEach((w) => used.add(w.id));
    const practicePool = readable.slice(0, 40).map((w) => w.id);
    const wordIds = words.map((w) => w.id);
    const toneWords = TONE_ITEMS.filter((t) => [...readingRequirements(t.thai)].every((r) => known.has(r)) && (!st.rules || st.rules.some((r) => r === t.ruleKey) || !st.rules.some((r) => r.startsWith('rule:') && /\|/.test(r)))).map((t) => t.id);
    const drill = st.cons || st.vowels ? syllableDrill(newCons, knownCons, newVowels, knownVowels) : [];

    const blocks: TheoryBlock[] = [{ kind: 'text', text: st.intro }];
    if (st.extra) blocks.push(...st.extra);
    if (newCons.length) blocks.push({ kind: 'letters', ids: newCons.map((c) => 'c:' + c) });
    if (newVowels.length) blocks.push({ kind: 'vowels', ids: newVowels.map(VOWEL_ID) });
    if (st.marks?.length) blocks.push({ kind: 'toneMarks', ids: st.marks.map((m) => 'm:' + m) });
    for (const r of st.rules ?? []) if (/\|/.test(r) || r === RULE_LIVE_DEAD) blocks.push({ kind: 'toneRule', ruleKey: r });
    if (drill.length) blocks.push({ kind: 'syllables', syllables: drill });
    if (wordIds.length) blocks.push({ kind: 'words', ids: wordIds });
    if (st.tip) blocks.push({ kind: 'tip', text: st.tip });

    const acts: ActivitySpec[] = [{ type: 'theory', blocks }];
    const letterIds = newCons.map((c) => 'c:' + c), vowelIds = newVowels.map(VOWEL_ID);
    if (letterIds.length || vowelIds.length) acts.push({ type: 'flashcard', items: [...letterIds, ...vowelIds] });
    if (letterIds.length) {
      acts.push({ type: 'listen', items: letterIds, pool: knownCons.map((c) => 'c:' + c), count: Math.min(8, letterIds.length * 2) });
      acts.push({ type: 'read', items: letterIds, answer: 'sound', pool: knownCons.map((c) => 'c:' + c), count: Math.min(8, letterIds.length * 2) });
    }
    if (vowelIds.length) acts.push({ type: 'read', items: vowelIds, answer: 'rom', pool: knownVowels.map(VOWEL_ID), count: Math.min(6, vowelIds.length * 2) });
    if (drill.length) acts.push({ type: 'syllables', syllables: drill, count: 6 });
    if (wordIds.length) {
      acts.push({ type: 'flashcard', items: wordIds, note: { fr: 'Vous savez maintenant lire ces mots. Lisez-les à voix haute avant de retourner la carte.' } });
      acts.push({ type: 'read', items: wordIds, answer: 'meaning', pool: practicePool, count: Math.min(8, wordIds.length) });
      if (practicePool.length >= 4) acts.push({ type: 'dictation', items: wordIds, pool: practicePool, count: Math.min(6, wordIds.length) });
      if (lessons.length >= 2) acts.push({ type: 'spell', items: wordIds, count: 3 });
    }
    if (st.toneFocus && toneWords.length >= 4) acts.push({ type: 'toneExercise', items: toneWords, mode: st.id === 'read-07' ? 'ear' : 'rule', count: 8 });
    if (st.id === 'read-07') acts.push({ type: 'toneExercise', items: toneWords, mode: 'livedead', count: 6 });
    if (lessons.length >= 1) acts.push({ type: 'review', count: 4 });
    acts.push({ type: 'recap' });

    lessons.push({
      id: st.id, track: 'script', unit: st.unit, title: st.title, subtitle: st.subtitle, kind: st.kind, badge: st.badge, count: st.count, skills: ['reading', 'writing'],
      prerequisites: prev ? [prev] : [], newConcepts: [...newConcepts, ...newWordIds], activities: acts,
      minutes: 8 + Math.round(acts.length * 0.8), readLevel: st.readLevel, minScore: 0.6,
    });
    prev = st.id;
    knownCons.push(...newCons);
    knownVowels.push(...newVowels);
  }
  return lessons;
}

/** Leçons de lecture pure ajoutées après l'alphabet : chaque texte restant y trouve sa place. */
export function readingPracticeLesson(n: number, prev: string, readingIds: string[]): LessonDef {
  const id = `read-txt-${n}`;
  const acts: ActivitySpec[] = [
    { type: 'theory', blocks: [{ kind: 'text', text: { fr: 'Vous connaissez tous les signes : place à la lecture. Lisez chaque phrase à voix haute AVANT d’afficher la phonétique ou la traduction, puis vérifiez avec l’audio.' } }] },
  ];
  for (const rid of readingIds) {
    acts.push({ type: 'reading', id: rid });
    const r = th.READINGS.find((x) => x.id === rid)!;
    const idx = r.sentences.findIndex((s2) => s2.tokens.length >= 3 && s2.tokens.length <= 7);
    if (idx >= 0) acts.push({ type: 'build', sentences: [{ readingId: rid, index: idx }] });
  }
  acts.push({ type: 'review', count: 6 }, { type: 'recap' });
  return { id, track: 'script', unit: 'u-script-4', kind: 'reading', title: { fr: `Textes à lire · ${n}` }, subtitle: { fr: readingIds.map((rid) => th.READINGS.find((x) => x.id === rid)!.title.fr).join(' · ') },
    skills: ['reading'], prerequisites: [prev], newConcepts: [], activities: acts, minutes: 6 + 3 * readingIds.length, readLevel: 4, minScore: 0.5 };
}

export const SCRIPT_STAGE_IDS = STAGES.map((s) => s.id);
export { isOpenMonosyllable };
