/** Niveau A2 : fiches de grammaire, rédigées puis relues (règle, formule, exemples, remarque d’usage). */
import type { GrammarPoint } from '../types';

export const A2_GRAMMAR: GrammarPoint[] = [
  {
    id: "g:tangtae", icon: "clock", title: { fr: "ตั้งแต่ : depuis, à partir de" },
    rule: { fr: "ตั้งแต่ se place devant un moment de départ (une date, une heure, une époque) : « depuis » ou « à partir de ». Le verbe ne change pas : c’est ตั้งแต่ et le contexte qui disent si l’action continue encore. Pour une action qui dure jusqu’à maintenant, on ajoute souvent มา devant ตั้งแต่." },
    pattern: "verbe (+ มา) + ตั้งแต่ + moment  ·  ตั้งแต่ A ถึง B",
    examples: [{ thai: "{I}เรียนภาษาไทยมาตั้งแต่ปีที่แล้ว", rom: "{i} rian phaa-sǎa thai maa tâng-tɛ̀ɛ pii thîi lɛ́ɛo", meaning: { fr: "j’apprends le thaï depuis l’année dernière" } }, { thai: "ร้านเปิดตั้งแต่แปดโมงเช้า", rom: "ráan pə̀ət tâng-tɛ̀ɛ pɛ̀ɛt moong cháao", meaning: { fr: "le magasin ouvre à partir de 8 h du matin" } }, { thai: "เขาอยู่ที่นี่ตั้งแต่เด็ก", rom: "khǎo yùu thîi-nîi tâng-tɛ̀ɛ dèk", meaning: { fr: "il habite ici depuis son enfance" } }, { thai: "{I}ไม่ได้กินอะไรตั้งแต่เช้า", rom: "{i} mâi dâai kin à-rai tâng-tɛ̀ɛ cháao", meaning: { fr: "je n’ai rien mangé depuis ce matin" } }],
    tip: { fr: "ตั้งแต่ s’emploie avec un point de départ, pas avec une durée. Pour « depuis trois ans », on dit verbe + มา + durée + แล้ว : เรียนมาสามปีแล้ว (« j’apprends depuis trois ans »)." },
  },
  {
    id: "g:jon", icon: "next", title: { fr: "จน · จนถึง : jusqu’à" },
    rule: { fr: "จนถึง + moment ou lieu : « jusqu’à » (une heure, un endroit). จน + action ou état : « jusqu’à ce que », « au point de », pour dire le résultat d’une action." },
    pattern: "verbe + จนถึง + moment/lieu  ·  verbe + จน + résultat",
    examples: [{ thai: "ร้านเปิดจนถึงสี่ทุ่ม", rom: "ráan pə̀ət jon-thʉ̌ng sìi thûm", meaning: { fr: "le magasin est ouvert jusqu’à 22 h" } }, { thai: "{I}ทำงานจนถึงหกโมงเย็น", rom: "{i} tham-ngaan jon-thʉ̌ng hòk moong yen", meaning: { fr: "je travaille jusqu’à 18 h" } }, { thai: "เดินไปจนถึงสี่แยก แล้วเลี้ยวซ้าย", rom: "dəən pai jon-thʉ̌ng sìi-yɛ̂ɛk lɛ́ɛo líao sáai", meaning: { fr: "marchez jusqu’au carrefour, puis tournez à gauche" } }, { thai: "{I}เหนื่อยจนเดินไม่ไหว", rom: "{i} nʉ̀ai jon dəən mâi wǎi", meaning: { fr: "je suis tellement fatigué que je n’arrive plus à marcher" } }],
    tip: { fr: "Avec ตั้งแต่, on obtient « de… à… » : ตั้งแต่เก้าโมงจนถึงห้าโมงเย็น (« de 9 h à 17 h »). À l’oral, on dit souvent juste ถึง : เปิดถึงสี่ทุ่ม." },
  },
  {
    id: "g:rawang", icon: "hourglass", title: { fr: "ระหว่าง · ขณะที่ : pendant, pendant que" },
    rule: { fr: "ระหว่าง + nom ou verbe : « pendant » (ระหว่างทาง, en chemin). Devant une phrase complète avec un sujet, on dit ระหว่างที่ ou ขณะที่ : « pendant que ». ขณะที่ est un peu plus soutenu ; à l’oral, ระหว่างที่ et ตอนที่ sont plus fréquents." },
    pattern: "ระหว่าง + nom/verbe  ·  ระหว่างที่ / ขณะที่ + sujet + verbe",
    examples: [{ thai: "ระหว่างทาง{I}แวะซื้อกาแฟ", rom: "rá-wàang thaang {i} wɛ́ sʉ́ʉ kaa-fɛɛ", meaning: { fr: "en chemin, je m’arrête pour acheter un café" } }, { thai: "ระหว่างกินข้าว อย่าเล่นโทรศัพท์", rom: "rá-wàang kin khâao yàa lên thoo-rá-sàp", meaning: { fr: "pendant le repas, ne joue pas avec ton téléphone" } }, { thai: "ระหว่างที่แม่ทำอาหาร ลูกดูทีวี", rom: "rá-wàang thîi mɛ̂ɛ tham aa-hǎan lûuk duu thii-wii", meaning: { fr: "pendant que maman fait la cuisine, l’enfant regarde la télé" } }, { thai: "ขณะที่{I}ขับรถอยู่ โทรศัพท์ก็ดังขึ้น", rom: "khà-nà thîi {i} khàp rót yùu thoo-rá-sàp kɔ̂ɔ dang khʉ̂n", meaning: { fr: "pendant que je conduisais, le téléphone a sonné" } }],
    tip: { fr: "ระหว่าง veut aussi dire « entre » : ระหว่างบ้านกับโรงเรียน (« entre la maison et l’école »). C’est le contexte qui fait la différence." },
  },
  {
    id: "g:thuuk", icon: "alert", title: { fr: "ถูก : le passif (subir quelque chose)" },
    rule: { fr: "ถูก + (auteur) + verbe forme le passif : « se faire… », « être… par… ». Il sert surtout pour quelque chose de désagréable qu’on subit : être mordu, volé, grondé. L’auteur se place juste après ถูก, sans mot pour « par »." },
    pattern: "sujet + ถูก + (auteur) + verbe",
    examples: [{ thai: "เขาถูกหมากัด", rom: "khǎo thùuk mǎa kàt", meaning: { fr: "il s’est fait mordre par un chien" } }, { thai: "{I}ถูกขโมยกระเป๋าตังค์", rom: "{i} thùuk khà-mooi krà-pǎo-tang", meaning: { fr: "on m’a volé mon portefeuille" } }, { thai: "น้องถูกแม่ดุ", rom: "nɔ́ɔng thùuk mɛ̂ɛ dù", meaning: { fr: "mon petit frère s’est fait gronder par maman" } }, { thai: "เขาถูกตำรวจปรับ", rom: "khǎo thùuk tam-rùat pràp", meaning: { fr: "il a reçu une amende de la police" } }],
    tip: { fr: "À l’oral, on dit très souvent โดน à la place de ถูก : โดนหมากัด. Pour un passif positif (être invité, recevoir un prix), on n’emploie pas ถูก mais ได้รับ. Attention : ถูก veut aussi dire « bon marché » et « juste, correct »." },
  },
  {
    id: "g:khuan", icon: "bulb", title: { fr: "ควร · ไม่ควร : il faudrait, on devrait" },
    rule: { fr: "ควร + verbe donne un conseil : « devrait », « il faudrait ». ไม่ควร + verbe : « il ne faudrait pas ». C’est plus doux que ต้อง (obligation) : on recommande, on n’oblige pas." },
    pattern: "ควร (จะ) + verbe  ·  ไม่ควร + verbe",
    examples: [{ thai: "{I}ควรนอนเร็วกว่านี้", rom: "{i} khuan nɔɔn reo kwàa níi", meaning: { fr: "je devrais me coucher plus tôt" } }, { thai: "คุณควรไปหาหมอ", rom: "khun khuan pai hǎa mɔ̌ɔ", meaning: { fr: "vous devriez aller voir le médecin" } }, { thai: "ไม่ควรดื่มน้ำก๊อก", rom: "mâi khuan dʉ̀ʉm náam kɔ́k", meaning: { fr: "il ne faudrait pas boire l’eau du robinet" } }, { thai: "เราควรออกจากบ้านตอนนี้เลย", rom: "rao khuan ɔ̀ɔk jàak bâan tɔɔn-níi ləəi", meaning: { fr: "nous devrions partir de la maison tout de suite" } }],
    tip: { fr: "Ne confondez pas ไม่ควร (« il ne faudrait pas ») et ไม่ต้อง (« ce n’est pas la peine ») : ไม่ต้องไป = inutile d’y aller, ไม่ควรไป = mieux vaut ne pas y aller." },
  },
  {
    id: "g:haam", icon: "close", title: { fr: "ห้าม : interdit de" },
    rule: { fr: "ห้าม + verbe exprime une interdiction : « interdit de… ». On le voit partout sur les panneaux. Avec une personne, ห้าม + personne + verbe veut dire « interdire à quelqu’un de… »." },
    pattern: "ห้าม + verbe  ·  ห้าม + personne + verbe",
    examples: [{ thai: "ห้ามสูบบุหรี่", rom: "hâam sùup bù-rìi", meaning: { fr: "interdit de fumer" } }, { thai: "ห้ามจอดรถ", rom: "hâam jɔ̀ɔt rót", meaning: { fr: "stationnement interdit" } }, { thai: "แม่ห้ามลูกเล่นเกมตอนกลางคืน", rom: "mɛ̂ɛ hâam lûuk lên keem tɔɔn klaang-khʉʉn", meaning: { fr: "la mère interdit à son enfant de jouer aux jeux vidéo le soir" } }, { thai: "หมอห้าม{I}ดื่มเหล้า", rom: "mɔ̌ɔ hâam {i} dʉ̀ʉm lâo", meaning: { fr: "le médecin m’interdit de boire de l’alcool" } }],
    tip: { fr: "ห้าม sonne officiel : c’est le mot des panneaux et des règlements. Pour dire directement à quelqu’un « ne fais pas ça », on emploie plutôt อย่า : อย่าไปนะ (« n’y va pas »)." },
  },
  {
    id: "g:thungmae", icon: "equal", title: { fr: "ถึงแม้ว่า … ก็ : bien que, même si" },
    rule: { fr: "ถึงแม้ว่า (ou ses formes courtes แม้ว่า, ถึงแม้) introduit une concession : « bien que, même si ». Dans la proposition principale, ก็ se place après le sujet et devant le verbe, souvent suivi de ยัง (« quand même, toujours »). On insère souvent จะ dans la concession (…จะแพง), même sans idée de futur." },
    pattern: "ถึงแม้ว่า + fait + (sujet) + ก็ (ยัง) + verbe",
    examples: [{ thai: "ถึงแม้ว่าฝนจะตก {I}ก็จะไป{P}", rom: "thʉ̌ng-mɛ́ɛ-wâa fǒn jà tòk {i} kɔ̂ɔ jà pai {p}", meaning: { fr: "même s’il pleut, j’irai" } }, { thai: "ถึงแม้ว่าเขาเหนื่อย เขาก็ยังทำงาน", rom: "thʉ̌ng-mɛ́ɛ-wâa khǎo nʉ̀ai khǎo kɔ̂ɔ yang tham-ngaan", meaning: { fr: "bien qu’il soit fatigué, il continue à travailler" } }, { thai: "ถึงแม้ว่าอาหารจะแพง {I}ก็อยากลอง{P}", rom: "thʉ̌ng-mɛ́ɛ-wâa aa-hǎan jà phɛɛng {i} kɔ̂ɔ yàak lɔɔng {p}", meaning: { fr: "bien que ce plat soit cher, j’ai envie de le goûter" } }, { thai: "แม้ว่าภาษาไทยจะยาก แต่{I}ก็ชอบเรียน{P}", rom: "mɛ́ɛ-wâa phaa-sǎa thai jà yâak tɛ̀ɛ {i} kɔ̂ɔ chɔ̂ɔp rian {p}", meaning: { fr: "bien que le thaï soit difficile, j’aime l’apprendre" } }],
    tip: { fr: "Contrairement au français, on peut ajouter แต่ (« mais ») devant la proposition principale : แม้ว่า… แต่…ก็… est tout à fait naturel en thaï, alors que « bien que… mais… » est une faute en français." },
  },
  {
    id: "g:jueng", icon: "link", title: { fr: "เพราะ … จึง / ก็เลย : donc, c’est pourquoi" },
    rule: { fr: "Pour dire la cause puis la conséquence, on met เพราะ (ou เพราะว่า) devant la cause, puis ก็เลย ou เลย devant la conséquence, après le sujet. จึง a le même sens mais appartient à la langue écrite ou soutenue. เพราะ peut être omis : ก็เลย suffit à marquer la conséquence (« du coup, alors »)." },
    pattern: "เพราะ(ว่า) + cause + (sujet) + ก็เลย / จึง + conséquence",
    examples: [{ thai: "เพราะฝนตก {I}ก็เลยไม่ได้ไป{P}", rom: "phrɔ́ fǒn tòk {i} kɔ̂ɔ ləəi mâi dâai pai {p}", meaning: { fr: "comme il pleuvait, je n’y suis pas allé" } }, { thai: "เพราะว่ารถติด เขาเลยมาสาย", rom: "phrɔ́-wâa rót tìt khǎo ləəi maa sǎai", meaning: { fr: "il y avait des bouchons, c’est pourquoi il est arrivé en retard" } }, { thai: "{I}หิวมาก ก็เลยกินข้าวสองจาน{P}", rom: "{i} hǐu mâak kɔ̂ɔ ləəi kin khâao sɔ̌ɔng jaan {p}", meaning: { fr: "j’avais très faim, alors j’ai mangé deux assiettes de riz" } }, { thai: "เพราะเขาป่วย เขาจึงไม่มาทำงาน", rom: "phrɔ́ khǎo pùai khǎo jʉng mâi maa tham-ngaan", meaning: { fr: "comme il était malade, il n’est pas venu travailler" } }],
    tip: { fr: "À l’oral, préférez ก็เลย ou เลย ; จึง sonne écrit (journaux, textes officiels). Ne confondez pas ce เลย (« du coup ») placé devant le verbe avec ไม่ … เลย (« pas du tout ») placé en fin de phrase." },
  },
  {
    id: "g:tha", icon: "help", title: { fr: "ถ้า … ก็ / จะ : exprimer une condition (approfondi)" },
    rule: { fr: "Cette fiche approfondit ถ้า … ก็ vu dans « Relier les idées ». ถ้า introduit la condition ; dans la proposition principale, ก็ vient après le sujet, souvent suivi de จะ pour un résultat futur ou de ได้ pour une permission. ถ้าไม่ … = « si ne… pas, sinon », et … ก็ได้ en fin de phrase veut dire « c’est possible aussi, ça ira »." },
    pattern: "ถ้า + condition + (sujet) + ก็ (จะ) + résultat  ·  … ก็ได้",
    examples: [{ thai: "ถ้าว่าง {I}ก็จะไปหาคุณ{P}", rom: "thâa wâang {i} kɔ̂ɔ jà pai hǎa khun {p}", meaning: { fr: "si je suis libre, je viendrai vous voir" } }, { thai: "ถ้าเหนื่อยก็พักก่อนได้นะ", rom: "thâa nʉ̀ai kɔ̂ɔ phák kɔ̀ɔn dâai ná", meaning: { fr: "si tu es fatigué, tu peux d’abord te reposer" } }, { thai: "ถ้าไม่มีเงินสด จ่ายด้วยบัตรก็ได้{P}", rom: "thâa mâi mii ngən-sòt jàai dûai bàt kɔ̂ɔ dâai {p}", meaning: { fr: "si vous n’avez pas de liquide, vous pouvez aussi payer par carte" } }, { thai: "ถ้าไม่รีบ เราก็จะไม่ทันรถไฟ", rom: "thâa mâi rîip rao kɔ̂ɔ jà mâi than rót-fai", meaning: { fr: "si on ne se dépêche pas, on va rater le train" } }],
    tip: { fr: "ก็ se place après le sujet, jamais devant : ถ้าฝนตก ผมก็ไม่ไป, et non ถ้าฝนตก ก็ผมไม่ไป. Sans sujet exprimé, ก็ suit directement la condition." },
  },
  {
    id: "g:waa", icon: "chat", title: { fr: "ว่า : rapporter une parole ou une pensée" },
    rule: { fr: "ว่า joue le rôle de « que » après les verbes de parole, de pensée ou de connaissance : บอกว่า (dire que), คิดว่า (penser que), รู้ว่า (savoir que), ได้ยินว่า (entendre dire que). La phrase rapportée garde sa forme d’origine : il n’y a aucune concordance des temps. ว่า sert aussi avec เรียก : เรียกว่า = « s’appeler, on appelle ça… »." },
    pattern: "บอก / คิด / รู้ / ได้ยิน + ว่า + phrase",
    examples: [{ thai: "{I}คิดว่าพรุ่งนี้ฝนจะตก{P}", rom: "{i} khít wâa phrûng-níi fǒn jà tòk {p}", meaning: { fr: "je pense qu’il va pleuvoir demain" } }, { thai: "เขาบอกว่าจะมาสาย", rom: "khǎo bɔ̀ɔk wâa jà maa sǎai", meaning: { fr: "il a dit qu’il serait en retard" } }, { thai: "{I}ไม่รู้ว่าร้านปิดกี่โมง{P}", rom: "{i} mâi rúu wâa ráan pìt kìi moong {p}", meaning: { fr: "je ne sais pas à quelle heure le magasin ferme" } }, { thai: "อันนี้ภาษาไทยเรียกว่าอะไร{Q}", rom: "an-níi phaa-sǎa thai rîak wâa à-rai {q}", meaning: { fr: "comment appelle-t-on ça en thaï ?" } }],
    tip: { fr: "Pas de concordance des temps : เขาบอกว่าจะมา se traduit « il a dit qu’il viendrait » (mot à mot « il dit : va venir »). Pour demander l’avis de quelqu’un, on dit simplement คุณว่ายังไง ? (« qu’en pensez-vous ? »). Attention à ne pas confondre ว่า (wâa) et ว่าง (wâang, « libre »)." },
  },
  {
    id: "g:khoei", icon: "star", title: { fr: "เคย approfondi : jamais, déjà ?, autrefois" },
    rule: { fr: "Cette fiche approfondit เคย vu dans « Exprimer le passé ». เคย + verbe indique une expérience vécue au moins une fois ; ไม่เคย + verbe veut dire « n’avoir jamais… ». Pour poser la question, on dit เคย … ไหม ? et on répond เคย (oui) ou ไม่เคย (non). Avec un mot comme เมื่อก่อน (avant), เคย exprime une habitude passée qui n’existe plus : « autrefois, je… »." },
    pattern: "เคย + verbe  ·  ไม่เคย + verbe  ·  เคย + verbe + ไหม ?",
    examples: [{ thai: "คุณเคยกินทุเรียนไหม{Q}", rom: "khun khəəi kin thú-rian mái {q}", meaning: { fr: "avez-vous déjà mangé du durian ?" } }, { thai: "เคย{P} {I}ไปมาสองครั้งแล้ว", rom: "khəəi {p} {i} pai maa sɔ̌ɔng khráng lɛ́ɛo", meaning: { fr: "oui, j’y suis déjà allé deux fois" } }, { thai: "{I}ไม่เคยไปภูเก็ต{P}", rom: "{i} mâi khəəi pai phuu-kèt {p}", meaning: { fr: "je ne suis jamais allé à Phuket" } }, { thai: "เมื่อก่อน{I}เคยสูบบุหรี่ แต่ตอนนี้เลิกแล้ว{P}", rom: "mʉ̂a-kɔ̀ɔn {i} khəəi sùup bù-rìi tɛ̀ɛ tɔɔn-níi lə̂ək lɛ́ɛo {p}", meaning: { fr: "avant, je fumais, mais maintenant j’ai arrêté" } }],
    tip: { fr: "Pour répondre, reprenez le verbe เคย ou ไม่เคย, pas ใช่ (« oui, c’est ça »). Ne confondez pas เคย (une expérience vécue, à un moment quelconque) et แล้ว (une action accomplie, qui compte maintenant) : เคยกิน = « j’en ai déjà mangé dans ma vie », กินแล้ว = « j’ai déjà mangé, c’est fait »." },
  },
  {
    id: "g:ying", icon: "trend", title: { fr: "ยิ่ง … ยิ่ง : plus … plus" },
    rule: { fr: "ยิ่ง placé devant deux verbes ou adjectifs exprime une progression parallèle : « plus on…, plus… ». On ajoute souvent ก็ devant le second ยิ่ง. L’expression ยิ่งวันยิ่ง + adjectif veut dire « de jour en jour, de plus en plus »." },
    pattern: "ยิ่ง + A + (ก็) ยิ่ง + B  ·  ยิ่งวันยิ่ง + adjectif",
    examples: [{ thai: "ยิ่งเรียนยิ่งสนุก", rom: "yîng rian yîng sà-nùk", meaning: { fr: "plus on apprend, plus c’est amusant" } }, { thai: "ยิ่งกินยิ่งอ้วน", rom: "yîng kin yîng ûan", meaning: { fr: "plus on mange, plus on grossit" } }, { thai: "{I}ยิ่งรีบ ก็ยิ่งทำผิด{P}", rom: "{i} yîng rîip kɔ̂ɔ yîng tham phìt {p}", meaning: { fr: "plus je me dépêche, plus je fais d’erreurs" } }, { thai: "อากาศยิ่งวันยิ่งร้อน", rom: "aa-kàat yîng wan yîng rɔ́ɔn", meaning: { fr: "il fait de plus en plus chaud de jour en jour" } }],
    tip: { fr: "En thaï, il n’y a pas de mot pour « on » : ยิ่งกินยิ่งอ้วน suffit, sans sujet. Sauf dans l’expression figée ยิ่งวันยิ่ง…, ยิ่ง se met juste devant le verbe ou l’adjectif. Pour dire « encore plus » à la fin d’une phrase, on utilise ยิ่งขึ้น : ดียิ่งขึ้น = « encore mieux »." },
  },
];

/** Ordre d’apparition dans le parcours (après la grammaire A1). */
export const A2_GRAMMAR_ORDER = ["g:tangtae", "g:jon", "g:rawang", "g:thuuk", "g:khuan", "g:haam", "g:thungmae", "g:jueng", "g:tha", "g:waa", "g:khoei", "g:ying"];
