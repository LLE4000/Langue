/** Fiches de grammaire ajoutées après la maquette. */
import type { GrammarPoint } from '../types';

export const EXTRA_GRAMMAR: GrammarPoint[] = [
  {
    id: 'g:yang', icon: '🔁', title: { fr: 'ยัง : encore, pas encore' },
    rule: { fr: 'ยัง devant le verbe : « encore, toujours ». ยังไม่ : « pas encore ». À une question en …หรือยัง ? (« déjà… ? »), on répond แล้ว (déjà) ou ยัง (pas encore).' },
    pattern: 'ยัง + verbe  ·  ยังไม่ + verbe  ·  … หรือยัง ?',
    examples: [
      { thai: '{I}ยังหิวอยู่', rom: '{i} yang hǐu yùu', meaning: { fr: 'j’ai encore faim' } },
      { thai: '{I}ยังไม่ได้กินข้าว', rom: '{i} yang mâi dâai kin khâao', meaning: { fr: 'je n’ai pas encore mangé' } },
      { thai: 'กินข้าวหรือยัง{Q}', rom: 'kin khâao rʉ̌ʉ-yang {q}', meaning: { fr: 'avez-vous déjà mangé ?' } },
      { thai: 'ยัง{P}', rom: 'yang {p}', meaning: { fr: 'pas encore' } },
    ],
    tip: { fr: 'ยัง tout seul suffit comme réponse : ยังครับ / ยังค่ะ = « pas encore ». La question กินข้าวหรือยัง est aussi une façon courante de dire bonjour.' },
  },
  {
    id: 'g:prob', icon: '🤔', title: { fr: 'Peut-être, sans doute : อาจจะ · คง · น่าจะ' },
    rule: { fr: 'Trois degrés de certitude, toujours devant le verbe : อาจจะ (peut-être, une chance sur deux), คง / คงจะ (sans doute), น่าจะ (devrait, probablement).' },
    pattern: 'อาจจะ / คงจะ / น่าจะ + verbe',
    examples: [
      { thai: 'พรุ่งนี้อาจจะฝนตก', rom: 'phrûng-níi àat-jà fǒn tòk', meaning: { fr: 'il pleuvra peut-être demain' } },
      { thai: 'เขาคงจะมาสาย', rom: 'khǎo khong-jà maa sǎai', meaning: { fr: 'il sera sans doute en retard' } },
      { thai: 'ร้านน่าจะเปิดแล้ว', rom: 'ráan nâa-jà pə̀ət lɛ́ɛo', meaning: { fr: 'le magasin devrait être ouvert' } },
    ],
    tip: { fr: 'Pour répondre « peut-être » d’un mot : อาจจะ ou บางที.' },
  },
  {
    id: 'g:when', icon: '🕰️', title: { fr: 'Situer dans le temps : ตอน · ก่อน · หลังจาก · เมื่อ' },
    rule: { fr: 'ตอน + moment (ตอนเช้า le matin, ตอนที่… au moment où). ก่อน + action ou nom : avant de. หลังจาก + action ou nom : après. เมื่อ + événement passé : quand (เมื่อวาน hier).' },
    pattern: 'ตอน + moment  ·  ก่อน + action  ·  หลังจาก + action',
    examples: [
      { thai: 'ตอนเช้า{I}ดื่มกาแฟ', rom: 'tɔɔn-cháao {i} dʉ̀ʉm kaa-fɛɛ', meaning: { fr: 'le matin, je bois du café' } },
      { thai: 'ก่อนนอน{I}อ่านหนังสือ', rom: 'kɔ̀ɔn nɔɔn {i} àan nǎng-sʉ̌ʉ', meaning: { fr: 'avant de dormir, je lis' } },
      { thai: 'หลังจากกินข้าวเราไปเดินเล่น', rom: 'lǎng-jàak kin khâao rao pai dəən-lên', meaning: { fr: 'après le repas, nous allons nous promener' } },
      { thai: 'เมื่อวานฝนตก', rom: 'mʉ̂a-waan fǒn tòk', meaning: { fr: 'hier, il a plu' } },
    ],
  },
];
