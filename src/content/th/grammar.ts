// Généré depuis la maquette d'origine par scripts/gen-content.mjs, puis maintenu à la main.
import type { GrammarPoint } from '../types';
import { EXTRA_GRAMMAR } from './grammarExtra';

export const GRAMMAR: GrammarPoint[] = [
  {
    id: "g:order", icon: "🧱", title: { fr: "L'ordre des mots" },
    rule: { fr: "Sujet, verbe, objet : comme en français. L'adjectif se place après le nom." },
    pattern: "sujet + verbe + objet  ·  nom + adjectif",
    examples: [
      { thai: "{I}กินข้าว", rom: "{i} kin khâao", meaning: { fr: "je mange (du riz)" } },
      { thai: "แมวกินปลา", rom: "mɛɛo kin plaa", meaning: { fr: "le chat mange du poisson" } },
      { thai: "บ้านใหญ่", rom: "bâan yài", meaning: { fr: "une grande maison" } },
    ],
  },
  {
    id: "g:noconj", icon: "🪶", title: { fr: "Pas de conjugaison" },
    rule: { fr: "Le verbe ne change jamais : ni personne, ni temps, ni nombre. Le contexte et quelques petits mots font tout le travail." },
    pattern: "ไป = vais, vas, va, allons, irai, suis allé…",
    examples: [
      { thai: "{I}ไป", rom: "{i} pai", meaning: { fr: "je vais" } },
      { thai: "เขาไป", rom: "khǎo pai", meaning: { fr: "il / elle va" } },
      { thai: "เราไป", rom: "rao pai", meaning: { fr: "nous allons" } },
    ],
    tip: { fr: "เขา s'écrit avec un ton montant (khǎo) mais se prononce souvent kháo à l'oral." },
  },
  {
    id: "g:past", icon: "⏪", title: { fr: "Exprimer le passé" },
    rule: { fr: "Un mot de temps suffit (hier, ce matin). แล้ว après le verbe marque que c'est fait. เคย devant le verbe : « avoir déjà fait une fois »." },
    pattern: "verbe + แล้ว  ·  เคย + verbe",
    examples: [
      { thai: "{I}กินแล้ว", rom: "{i} kin lɛ́ɛo", meaning: { fr: "j'ai déjà mangé" } },
      { thai: "เมื่อวาน{I}ไปตลาด", rom: "mʉ̂a-waan {i} pai tà-làat", meaning: { fr: "hier je suis allé au marché" } },
      { thai: "{I}เคยไปเชียงใหม่", rom: "{i} khəəi pai chiang-mài", meaning: { fr: "je suis déjà allé à Chiang Mai" } },
    ],
  },
  {
    id: "g:future", icon: "⏩", title: { fr: "Le futur : จะ" },
    rule: { fr: "จะ devant le verbe indique une action à venir ou une intention." },
    pattern: "จะ + verbe",
    examples: [
      { thai: "พรุ่งนี้{I}จะไปหน้างาน", rom: "phrûng-níi {i} jà pai nâa-ngaan", meaning: { fr: "demain j'irai sur le chantier" } },
      { thai: "{I}จะโทรหาคุณ", rom: "{i} jà thoo hǎa khun", meaning: { fr: "je vous appellerai" } },
    ],
  },
  {
    id: "g:prog", icon: "🔄", title: { fr: "En train de : กำลัง" },
    rule: { fr: "กำลัง devant le verbe, souvent renforcé par อยู่ en fin de phrase." },
    pattern: "กำลัง + verbe (+ อยู่)",
    examples: [
      { thai: "{I}กำลังกินข้าว", rom: "{i} kam-lang kin khâao", meaning: { fr: "je suis en train de manger" } },
      { thai: "เขากำลังทำงานอยู่", rom: "khǎo kam-lang tham-ngaan yùu", meaning: { fr: "il est en train de travailler" } },
    ],
  },
  {
    id: "g:neg", icon: "🚫", title: { fr: "La négation : ไม่" },
    rule: { fr: "ไม่ se place juste devant le verbe ou l'adjectif. Pour nier un nom : ไม่ใช่." },
    pattern: "ไม่ + verbe / adjectif  ·  ไม่ใช่ + nom",
    examples: [
      { thai: "{I}ไม่ไป", rom: "{i} mâi pai", meaning: { fr: "je n'y vais pas" } },
      { thai: "ไม่เผ็ด", rom: "mâi phèt", meaning: { fr: "pas épicé" } },
      { thai: "นี่ไม่ใช่กาแฟ", rom: "nîi mâi châi kaa-fɛɛ", meaning: { fr: "ceci n'est pas du café" } },
    ],
  },
  {
    id: "g:qmai", icon: "❓", title: { fr: "Poser une question : ไหม" },
    rule: { fr: "On ajoute ไหม à la fin de la phrase. On répond en répétant le verbe (oui) ou ไม่ + verbe (non)." },
    pattern: "phrase + ไหม",
    examples: [
      { thai: "เผ็ดไหม{Q}", rom: "phèt mái {q}", meaning: { fr: "c'est épicé ?" } },
      { thai: "เผ็ด{P}", rom: "phèt {p}", meaning: { fr: "oui (c'est épicé)" } },
      { thai: "คุณชอบอาหารไทยไหม{Q}", rom: "khun chɔ̂ɔp aa-hǎan thai mái {q}", meaning: { fr: "aimez-vous la cuisine thaïe ?" } },
    ],
    tip: { fr: "ไหม s'écrit avec un ton montant mais se prononce mái (ton haut) dans la conversation." },
  },
  {
    id: "g:qtag", icon: "🤔", title: { fr: "N'est-ce pas ? Ou pas ? Déjà ?" },
    rule: { fr: "ใช่ไหม demande une confirmation. หรือเปล่า : « ou pas ? ». หรือยัง : « déjà ou pas encore ? » — on répond …แล้ว ou ยัง." },
    pattern: "phrase + ใช่ไหม / หรือเปล่า / หรือยัง",
    examples: [
      { thai: "คุณเป็นวิศวกรใช่ไหม{Q}", rom: "khun pen wít-sà-wá-kɔɔn châi mái {q}", meaning: { fr: "vous êtes ingénieur, n'est-ce pas ?" } },
      { thai: "ไปหรือเปล่า", rom: "pai rʉ̌ʉ plàao", meaning: { fr: "tu y vas ou pas ?" } },
      { thai: "กินข้าวหรือยัง", rom: "kin khâao rʉ̌ʉ yang", meaning: { fr: "as-tu déjà mangé ?" } },
      { thai: "ยัง{P}", rom: "yang {p}", meaning: { fr: "pas encore" } },
    ],
  },
  {
    id: "g:qwords", icon: "🔎", title: { fr: "Les mots interrogatifs" },
    rule: { fr: "Le mot interrogatif se met à la place de la réponse attendue — souvent en fin de phrase." },
    pattern: "อะไร quoi · ที่ไหน où · เมื่อไหร่ quand · ใคร qui · ทำไม pourquoi · ยังไง comment · เท่าไหร่ combien",
    examples: [
      { thai: "นี่อะไร{Q}", rom: "nîi à-rai {q}", meaning: { fr: "qu'est-ce que c'est ?" } },
      { thai: "คุณไปไหน{Q}", rom: "khun pai nǎi {q}", meaning: { fr: "où allez-vous ?" } },
      { thai: "ใครมา", rom: "khrai maa", meaning: { fr: "qui vient ?" } },
      { thai: "ไปเมื่อไหร่", rom: "pai mʉ̂a-rài", meaning: { fr: "on y va quand ?" } },
      { thai: "ทำไมแพง", rom: "tham-mai phɛɛng", meaning: { fr: "pourquoi est-ce cher ?" } },
      { thai: "ไปยังไง", rom: "pai yang-ngai", meaning: { fr: "on y va comment ?" } },
    ],
  },
  {
    id: "g:polite", icon: "🙏", title: { fr: "ครับ · ค่ะ · คะ" },
    rule: { fr: "La particule de politesse termine presque toutes les phrases. Un homme dit toujours ครับ. Une femme dit ค่ะ (ton descendant) pour affirmer et คะ (ton haut) pour questionner ou après นะ. Seule, la particule veut aussi dire « oui »." },
    pattern: "phrase + ครับ / ค่ะ / คะ",
    examples: [
      { thai: "ขอบคุณครับ", rom: "khɔ̀ɔp-khun khráp", meaning: { fr: "merci (homme)" } },
      { thai: "ขอบคุณค่ะ", rom: "khɔ̀ɔp-khun khâ", meaning: { fr: "merci (femme)" } },
      { thai: "ไปไหนคะ", rom: "pai nǎi khá", meaning: { fr: "où allez-vous ? (femme)" } },
      { thai: "รอหน่อยนะคะ", rom: "rɔɔ nɔ̀i ná khá", meaning: { fr: "attendez un peu, d'accord ? (femme)" } },
    ],
  },
  {
    id: "g:soft", icon: "🌿", title: { fr: "Adoucir : นะ · หน่อย · ด้วย" },
    rule: { fr: "นะ rend la phrase plus douce, plus amicale. หน่อย (« un peu ») adoucit une demande. ด้วย en fin de demande : « s'il vous plaît, aussi »." },
    pattern: "demande + หน่อย / ด้วย (+ นะ)",
    examples: [
      { thai: "รอหน่อยนะ{Q}", rom: "rɔɔ nɔ̀i ná {q}", meaning: { fr: "attendez un peu, d'accord ?" } },
      { thai: "ขอน้ำหน่อย{P}", rom: "khɔ̌ɔ náam nɔ̀i {p}", meaning: { fr: "un peu d'eau, s'il vous plaît" } },
      { thai: "เช็กบิลด้วย{P}", rom: "chék-bin dûai {p}", meaning: { fr: "l'addition, s'il vous plaît" } },
    ],
  },
  {
    id: "g:ask", icon: "🤲", title: { fr: "Demander poliment" },
    rule: { fr: "ขอ + chose + หน่อย pour demander quelque chose. ช่วย + verbe + หน่อย pour demander un service. Verbe + ได้ไหม pour demander la permission." },
    pattern: "ขอ … หน่อย  ·  ช่วย … หน่อย  ·  … ได้ไหม",
    examples: [
      { thai: "ขอเมนูหน่อย{P}", rom: "khɔ̌ɔ mee-nuu nɔ̀i {p}", meaning: { fr: "le menu, s'il vous plaît" } },
      { thai: "ช่วยถ่ายรูปให้หน่อย{P}", rom: "chûai thàai-rûup hâi nɔ̀i {p}", meaning: { fr: "pourriez-vous me prendre en photo ?" } },
      { thai: "เข้าได้ไหม{Q}", rom: "khâo dâai mái {q}", meaning: { fr: "puis-je entrer ?" } },
    ],
  },
  {
    id: "g:poss", icon: "🔑", title: { fr: "La possession : ของ" },
    rule: { fr: "Chose + ของ + propriétaire. Dans la conversation, ของ est souvent omis." },
    pattern: "chose + (ของ) + propriétaire",
    examples: [
      { thai: "บ้านของ{I}", rom: "bâan khɔ̌ɔng {i}", meaning: { fr: "ma maison" } },
      { thai: "บ้าน{I}", rom: "bâan {i}", meaning: { fr: "ma maison (courant)" } },
      { thai: "รถของเขา", rom: "rót khɔ̌ɔng khǎo", meaning: { fr: "sa voiture" } },
      { thai: "นี่ของใคร{Q}", rom: "nîi khɔ̌ɔng khrai {q}", meaning: { fr: "c'est à qui ?" } },
    ],
  },
  {
    id: "g:clf", icon: "📦", title: { fr: "Compter : les classificateurs" },
    rule: { fr: "On ne dit pas « deux cafés » mais « café deux verres ». Chaque famille d'objets a son classificateur." },
    pattern: "nom + nombre + classificateur",
    examples: [
      { thai: "กาแฟสองแก้ว", rom: "kaa-fɛɛ sɔ̌ɔng kɛ̂ɛo", meaning: { fr: "deux cafés" } },
      { thai: "หมาสามตัว", rom: "mǎa sǎam tua", meaning: { fr: "trois chiens" } },
      { thai: "เสาสี่ต้น", rom: "sǎo sìi tôn", meaning: { fr: "quatre poteaux" } },
    ],
    tip: { fr: "Le module Classificateurs détaille les plus courants, avec exercices." },
  },
  {
    id: "g:plural", icon: "👥", title: { fr: "Le pluriel" },
    rule: { fr: "Le nom ne change pas. Le contexte, un nombre, หลาย (plusieurs) ou พวก (groupe, devant un pronom) suffisent. Quelques noms se redoublent avec ๆ." },
    pattern: "nom seul · หลาย + classificateur · พวก + pronom · nom + ๆ",
    examples: [
      { thai: "หลายคน", rom: "lǎai khon", meaning: { fr: "plusieurs personnes" } },
      { thai: "พวกเรา", rom: "phûak rao", meaning: { fr: "nous tous" } },
      { thai: "เด็กๆ", rom: "dèk-dèk", meaning: { fr: "les enfants" } },
    ],
  },
  {
    id: "g:pron", icon: "🧑", title: { fr: "Les pronoms" },
    rule: { fr: "Le thaï omet souvent le pronom quand le contexte est clair. « Je » dépend du sexe de celui qui parle. On utilise aussi พี่ (aîné) et น้อง (cadet) comme pronoms." },
    pattern: "ผม je (homme) · ฉัน je (femme) · ดิฉัน je (femme, formel) · คุณ vous · เขา il, elle · เรา nous",
    examples: [
      { thai: "ผม", rom: "phǒm", meaning: { fr: "je (homme)" } },
      { thai: "ฉัน", rom: "chǎn", meaning: { fr: "je (femme, courant)" } },
      { thai: "ดิฉัน", rom: "dì-chǎn", meaning: { fr: "je (femme, formel)" } },
      { thai: "คุณ", rom: "khun", meaning: { fr: "vous ; tu (poli)" } },
      { thai: "เขา", rom: "khǎo", meaning: { fr: "il, elle" } },
      { thai: "พวกเขา", rom: "phûak-khǎo", meaning: { fr: "ils, elles" } },
    ],
  },
  {
    id: "g:levels", icon: "🎩", title: { fr: "Les niveaux de politesse" },
    rule: { fr: "Un même sens peut avoir un mot courant, un mot poli et un mot formel. En cas de doute : mot courant + ครับ / ค่ะ, et คุณ devant le prénom." },
    pattern: "courant → poli → formel",
    examples: [
      { thai: "กิน", rom: "kin", meaning: { fr: "manger (courant)" } },
      { thai: "ทาน", rom: "thaan", meaning: { fr: "manger (poli)" } },
      { thai: "รับประทาน", rom: "ráp-prà-thaan", meaning: { fr: "manger (formel)" } },
    ],
  },
  {
    id: "g:dai", icon: "✅", title: { fr: "ได้ : pouvoir" },
    rule: { fr: "Après le verbe : pouvoir, savoir faire. Seul : « d'accord ». Devant le verbe : avoir eu l'occasion de." },
    pattern: "verbe + ได้  ·  verbe + ไม่ได้",
    examples: [
      { thai: "{I}พูดภาษาไทยได้", rom: "{i} phûut phaa-sǎa thai dâai", meaning: { fr: "je sais parler thaï" } },
      { thai: "ไปไม่ได้", rom: "pai mâi dâai", meaning: { fr: "je ne peux pas y aller" } },
      { thai: "{I}ได้ไปเชียงใหม่", rom: "{i} dâai pai chiang-mài", meaning: { fr: "j'ai eu l'occasion d'aller à Chiang Mai" } },
    ],
  },
  {
    id: "g:yaak", icon: "💭", title: { fr: "อยาก : avoir envie de" },
    rule: { fr: "อยาก + verbe. Pour vouloir une chose : อยากได้ + nom." },
    pattern: "อยาก + verbe  ·  อยากได้ + nom",
    examples: [
      { thai: "{I}อยากไปทะเล", rom: "{i} yàak pai thá-lee", meaning: { fr: "j'ai envie d'aller à la mer" } },
      { thai: "{I}อยากได้อันนี้", rom: "{i} yàak dâai an-níi", meaning: { fr: "je voudrais celui-ci" } },
      { thai: "ไม่อยากกิน", rom: "mâi yàak kin", meaning: { fr: "je n'ai pas envie de manger" } },
    ],
  },
  {
    id: "g:tong", icon: "❗", title: { fr: "ต้อง : devoir" },
    rule: { fr: "ต้อง + verbe : il faut, devoir. ไม่ต้อง : ce n'est pas la peine de." },
    pattern: "ต้อง + verbe  ·  ไม่ต้อง + verbe",
    examples: [
      { thai: "{I}ต้องไปแล้ว", rom: "{i} tɔ̂ng pai lɛ́ɛo", meaning: { fr: "je dois y aller" } },
      { thai: "ต้องตรวจสอบก่อน", rom: "tɔ̂ng trùat-sɔ̀ɔp kɔ̀ɔn", meaning: { fr: "il faut d'abord vérifier" } },
      { thai: "ไม่ต้องทอน{P}", rom: "mâi tɔ̂ng thɔɔn {p}", meaning: { fr: "pas besoin de rendre la monnaie" } },
    ],
  },
  {
    id: "g:maak", icon: "📈", title: { fr: "Très, pas tellement, trop" },
    rule: { fr: "L'intensité se place après l'adjectif — sauf ไม่ค่อย, qui se place devant." },
    pattern: "adjectif + มาก / เกินไป / นิดหน่อย  ·  ไม่ค่อย + adjectif",
    examples: [
      { thai: "อร่อยมาก", rom: "à-rɔ̀i mâak", meaning: { fr: "très bon" } },
      { thai: "ไม่ค่อยเผ็ด", rom: "mâi khɔ̂i phèt", meaning: { fr: "pas tellement épicé" } },
      { thai: "แพงเกินไป", rom: "phɛɛng kəən pai", meaning: { fr: "beaucoup trop cher" } },
      { thai: "เผ็ดนิดหน่อย", rom: "phèt nít-nɔ̀i", meaning: { fr: "un peu épicé" } },
    ],
  },
  {
    id: "g:comp", icon: "⚖️", title: { fr: "Comparer : กว่า · ที่สุด" },
    rule: { fr: "Adjectif + กว่า : plus… que. Adjectif + ที่สุด : le plus." },
    pattern: "A + adjectif + กว่า + B  ·  adjectif + ที่สุด",
    examples: [
      { thai: "อันนี้ถูกกว่า", rom: "an-níi thùuk kwàa", meaning: { fr: "celui-ci est moins cher" } },
      { thai: "คานนี้ยาวกว่าคานนั้น", rom: "khaan níi yaao kwàa khaan nán", meaning: { fr: "cette poutre est plus longue que celle-là" } },
      { thai: "อร่อยที่สุด", rom: "à-rɔ̀i thîi-sùt", meaning: { fr: "le meilleur (au goût)" } },
    ],
  },
  {
    id: "g:be", icon: "🟰", title: { fr: "Trois façons de dire « être »" },
    rule: { fr: "เป็น + nom (métier, nationalité). คือ pour identifier ou définir. อยู่ pour un lieu. Avec un adjectif : aucun verbe." },
    pattern: "เป็น · คือ · อยู่ · (rien devant un adjectif)",
    examples: [
      { thai: "{I}เป็นวิศวกร", rom: "{i} pen wít-sà-wá-kɔɔn", meaning: { fr: "je suis ingénieur" } },
      { thai: "นี่คือแบบก่อสร้าง", rom: "nîi khʉʉ bɛ̀ɛp kɔ̀ɔ-sâang", meaning: { fr: "voici les plans d'exécution" } },
      { thai: "เขาอยู่ที่โรงพยาบาล", rom: "khǎo yùu thîi roong-phá-yaa-baan", meaning: { fr: "il est à l'hôpital" } },
      { thai: "กาแฟร้อน", rom: "kaa-fɛɛ rɔ́ɔn", meaning: { fr: "le café est chaud" } },
    ],
  },
  {
    id: "g:mii", icon: "📍", title: { fr: "มี : avoir, il y a" },
    rule: { fr: "มี exprime la possession et l'existence. Négation : ไม่มี." },
    pattern: "(sujet) + มี + nom",
    examples: [
      { thai: "{I}มีคำถาม", rom: "{i} mii kham-thǎam", meaning: { fr: "j'ai une question" } },
      { thai: "มีห้องว่างไหม{Q}", rom: "mii hɔ̂ng wâang mái {q}", meaning: { fr: "y a-t-il une chambre libre ?" } },
      { thai: "ไม่มี", rom: "mâi mii", meaning: { fr: "il n'y en a pas" } },
    ],
  },
  {
    id: "g:nums", icon: "🔢", title: { fr: "Les nombres dans la phrase" },
    rule: { fr: "Le nombre vient après le nom, suivi du classificateur. Prix : nombre + บาท. Âge : อายุ + nombre + ปี." },
    pattern: "nom + nombre + classificateur",
    examples: [
      { thai: "เบียร์สองขวด", rom: "bia sɔ̌ɔng khùat", meaning: { fr: "deux bières" } },
      { thai: "สามร้อยบาท", rom: "sǎam-rɔ́ɔi bàat", meaning: { fr: "trois cents bahts" } },
      { thai: "{I}อายุสี่สิบปี", rom: "{i} aa-yú sìi-sìp pii", meaning: { fr: "j'ai quarante ans" } },
    ],
  },
  {
    id: "g:laeo", icon: "☑️", title: { fr: "แล้ว : déjà, désormais, et puis" },
    rule: { fr: "Après le verbe : c'est fait. Après un état : la situation a changé. En début de proposition (souvent แล้วก็) : et puis." },
    pattern: "verbe + แล้ว  ·  แล้วก็ + suite",
    examples: [
      { thai: "กินแล้ว", rom: "kin lɛ́ɛo", meaning: { fr: "j'ai déjà mangé" } },
      { thai: "ฝนตกแล้ว", rom: "fǒn tòk lɛ́ɛo", meaning: { fr: "il s'est mis à pleuvoir" } },
      { thai: "พอแล้ว", rom: "phɔɔ lɛ́ɛo", meaning: { fr: "ça suffit" } },
      { thai: "ตรงไป แล้วเลี้ยวซ้าย", rom: "trong pai lɛ́ɛo líao sáai", meaning: { fr: "tout droit, puis à gauche" } },
    ],
  },
  {
    id: "g:hai", icon: "🎁", title: { fr: "ให้ : donner, pour quelqu'un" },
    rule: { fr: "Verbe principal : donner. Après un autre verbe : faire l'action pour quelqu'un." },
    pattern: "ให้ + chose  ·  verbe + ให้ + personne",
    examples: [
      { thai: "ให้เงิน", rom: "hâi ngən", meaning: { fr: "donner de l'argent" } },
      { thai: "ซื้อให้แม่", rom: "sʉ́ʉ hâi mɛ̂ɛ", meaning: { fr: "acheter pour maman" } },
      { thai: "ลดให้หน่อย{P}", rom: "lót hâi nɔ̀i {p}", meaning: { fr: "faites-moi un petit prix" } },
    ],
  },
  {
    id: "g:link", icon: "🔗", title: { fr: "Relier les idées : และ · แต่ · หรือ · เพราะ · ถ้า" },
    rule: { fr: "Ces petits mots se placent entre les deux propositions, comme en français. ถ้า… (ก็)… : « si… (alors)… »." },
    pattern: "A + และ / แต่ / หรือ / เพราะ + B  ·  ถ้า A (ก็) B",
    examples: [
      { thai: "{I}ชอบกาแฟและชา", rom: "{i} chɔ̂ɔp kaa-fɛɛ lɛ́ chaa", meaning: { fr: "j'aime le café et le thé" } },
      { thai: "อร่อยแต่เผ็ด", rom: "à-rɔ̀i tɛ̀ɛ phèt", meaning: { fr: "c'est bon mais épicé" } },
      { thai: "ชาหรือกาแฟ", rom: "chaa rʉ̌ʉ kaa-fɛɛ", meaning: { fr: "thé ou café ?" } },
      { thai: "{I}ไม่ไปเพราะฝนตก", rom: "{i} mâi pai phrɔ́ fǒn tòk", meaning: { fr: "je n'y vais pas parce qu'il pleut" } },
      { thai: "ถ้าฝนตก {I}ก็ไม่ไป", rom: "thâa fǒn tòk {i} kɔ̂ɔ mâi pai", meaning: { fr: "s'il pleut, je n'y vais pas" } },
    ],
  },
  {
    id: "g:thii", icon: "🪢", title: { fr: "ที่ : qui, que" },
    rule: { fr: "ที่ relie un nom à ce qui le précise, comme « qui » ou « que ». Le même mot sert aussi à dire « à, chez » devant un lieu." },
    pattern: "nom + ที่ + précision",
    examples: [
      { thai: "คนที่ยืนอยู่ตรงนั้น", rom: "khon thîi yʉʉn yùu trong-nán", meaning: { fr: "la personne qui est debout là-bas" } },
      { thai: "อาหารที่{I}ชอบ", rom: "aa-hǎan thîi {i} chɔ̂ɔp", meaning: { fr: "le plat que j'aime" } },
      { thai: "คานที่มีรอยร้าว", rom: "khaan thîi mii rɔɔi-ráao", meaning: { fr: "la poutre qui a une fissure" } },
      { thai: "{I}อยู่ที่บ้าน", rom: "{i} yùu thîi bâan", meaning: { fr: "je suis à la maison" } },
    ],
  },
  {
    id: "g:kan", icon: "🤝", title: { fr: "กัน · ด้วยกัน : ensemble" },
    rule: { fr: "กัน après le verbe indique que l'action se fait à plusieurs, ou l'un envers l'autre. ด้วยกัน insiste sur « ensemble »." },
    pattern: "verbe + กัน  ·  verbe + ด้วยกัน",
    examples: [
      { thai: "ไปกินข้าวกัน", rom: "pai kin khâao kan", meaning: { fr: "allons manger (ensemble)" } },
      { thai: "เจอกันพรุ่งนี้", rom: "jəə kan phrûng-níi", meaning: { fr: "on se voit demain" } },
      { thai: "เราทำงานด้วยกัน", rom: "rao tham-ngaan dûai-kan", meaning: { fr: "nous travaillons ensemble" } },
      { thai: "รู้จักกันไหม", rom: "rúu-jàk kan mái", meaning: { fr: "vous vous connaissez ?" } },
    ],
  },
  {
    id: "g:loei", icon: "💥", title: { fr: "เลย : du tout, vraiment, directement" },
    rule: { fr: "Après une négation : « pas du tout ». Après un adjectif : renforce. Après un verbe : « directement, sans attendre »." },
    pattern: "ไม่ … เลย  ·  adjectif + เลย  ·  verbe + เลย",
    examples: [
      { thai: "ไม่เผ็ดเลย", rom: "mâi phèt ləəi", meaning: { fr: "pas épicé du tout" } },
      { thai: "อร่อยมากเลย", rom: "à-rɔ̀i mâak ləəi", meaning: { fr: "vraiment très bon" } },
      { thai: "ไปเลย", rom: "pai ləəi", meaning: { fr: "allez-y directement" } },
      { thai: "{I}ไม่เข้าใจเลย", rom: "{i} mâi khâo-jai ləəi", meaning: { fr: "je ne comprends pas du tout" } },
    ],
  },
];

GRAMMAR.push(...EXTRA_GRAMMAR);
