/** Textes de lecture ajoutés après la maquette. */
import type { Reading } from '../types';

const t = (thai: string, rom: string, fr: string) => ({ thai, rom, gloss: { fr } });

export const EXTRA_READINGS: Reading[] = [
  {
    id: 'r:r17', level: 2, title: { fr: 'À la plage' },
    sentences: [
      { tr: { fr: 'Aujourd’hui, il fait beau.' }, tokens: [t('วันนี้', 'wan-níi', 'aujourd’hui'), t('อากาศ', 'aa-kàat', 'le temps (météo)'), t('ดี', 'dii', 'bon')] },
      { tr: { fr: 'Nous allons à la mer.' }, tokens: [t('เรา', 'rao', 'nous'), t('ไป', 'pai', 'aller'), t('ทะเล', 'thá-lee', 'mer')] },
      { tr: { fr: 'L’eau de mer est très claire.' }, tokens: [t('น้ำทะเล', 'náam thá-lee', 'eau de mer'), t('ใส', 'sǎi', 'clair, limpide'), t('มาก', 'mâak', 'très')] },
      { tr: { fr: 'Les enfants jouent dans le sable.' }, tokens: [t('เด็กๆ', 'dèk-dèk', 'les enfants'), t('เล่น', 'lên', 'jouer'), t('ทราย', 'saai', 'sable')] },
      { tr: { fr: 'Le soir, nous regardons le coucher de soleil.' }, tokens: [t('ตอนเย็น', 'tɔɔn-yen', 'le soir'), t('เรา', 'rao', 'nous'), t('ดู', 'duu', 'regarder'), t('พระอาทิตย์ตก', 'phrá-aa-thít tòk', 'coucher de soleil')] },
      { tr: { fr: 'C’est magnifique.' }, tokens: [t('สวย', 'sǔai', 'beau'), t('มาก', 'mâak', 'très')] },
    ],
  },
  {
    id: 'r:r18', level: 3, title: { fr: 'Au temple' },
    sentences: [
      { tr: { fr: 'Ce matin, nous sommes allés au temple.' }, tokens: [t('เช้านี้', 'cháao-níi', 'ce matin'), t('เรา', 'rao', 'nous'), t('ไป', 'pai', 'aller'), t('วัด', 'wát', 'temple')] },
      { tr: { fr: 'Avant d’entrer, nous enlevons nos chaussures.' }, tokens: [t('ก่อน', 'kɔ̀ɔn', 'avant'), t('เข้า', 'khâo', 'entrer'), t('เรา', 'rao', 'nous'), t('ถอด', 'thɔ̀ɔt', 'enlever'), t('รองเท้า', 'rɔɔng-tháao', 'chaussures')] },
      { tr: { fr: 'Dans la chapelle, il y a une grande statue de Bouddha.' }, tokens: [t('ใน', 'nai', 'dans'), t('โบสถ์', 'bòot', 'chapelle du temple'), t('มี', 'mii', 'il y a'), t('พระพุทธรูป', 'phrá-phút-thá-rûup', 'statue de Bouddha'), t('ใหญ่', 'yài', 'grand')] },
      { tr: { fr: 'Les Thaïlandais viennent faire des mérites.' }, tokens: [t('คนไทย', 'khon thai', 'les Thaïlandais'), t('มา', 'maa', 'venir'), t('ทำบุญ', 'tham-bun', 'faire des mérites')] },
      { tr: { fr: 'Mon ami nous apprend à faire le wai.' }, tokens: [t('เพื่อน', 'phʉ̂an', 'ami'), t('สอน', 'sɔ̌ɔn', 'apprendre à, enseigner'), t('เรา', 'rao', 'nous'), t('ไหว้', 'wâai', 'saluer les mains jointes')] },
      { tr: { fr: 'Le temple est calme et beau.' }, tokens: [t('วัด', 'wát', 'temple'), t('เงียบ', 'ngîap', 'calme'), t('และ', 'lɛ́', 'et'), t('สวย', 'sǔai', 'beau')] },
    ],
  },
  {
    id: 'r:r19', level: 3, title: { fr: 'Les fruits du marché' },
    sentences: [
      { tr: { fr: 'Au marché du matin, il y a beaucoup de fruits.' }, tokens: [t('ตลาดเช้า', 'tà-làat cháao', 'marché du matin'), t('มี', 'mii', 'il y a'), t('ผลไม้', 'phǒn-lá-máai', 'fruits'), t('เยอะ', 'yə́', 'beaucoup')] },
      { tr: { fr: 'La vendeuse vend des mangues et des bananes.' }, tokens: [t('แม่ค้า', 'mɛ̂ɛ-kháa', 'vendeuse'), t('ขาย', 'khǎai', 'vendre'), t('มะม่วง', 'má-mûang', 'mangue'), t('และ', 'lɛ́', 'et'), t('กล้วย', 'klûai', 'banane')] },
      { tr: { fr: 'Les mangues mûres sont très sucrées.' }, tokens: [t('มะม่วง', 'má-mûang', 'mangue'), t('สุก', 'sùk', 'mûr'), t('หวาน', 'wǎan', 'sucré'), t('มาก', 'mâak', 'très')] },
      { tr: { fr: 'Nous en achetons deux kilos.' }, tokens: [t('เรา', 'rao', 'nous'), t('ซื้อ', 'sʉ́ʉ', 'acheter'), t('สอง', 'sɔ̌ɔng', 'deux'), t('กิโล', 'kì-loo', 'kilo')] },
      { tr: { fr: 'Le durian sent fort, mais il est délicieux.' }, tokens: [t('ทุเรียน', 'thú-rian', 'durian'), t('เหม็น', 'měn', 'sentir mauvais'), t('แต่', 'tɛ̀ɛ', 'mais'), t('อร่อย', 'à-rɔ̀i', 'délicieux')] },
      { tr: { fr: 'Manger des fruits chaque jour est bon pour la santé.' }, tokens: [t('กิน', 'kin', 'manger'), t('ผลไม้', 'phǒn-lá-máai', 'fruits'), t('ทุกวัน', 'thúk-wan', 'chaque jour'), t('ดี', 'dii', 'bon'), t('ต่อ', 'tɔ̀ɔ', 'pour'), t('สุขภาพ', 'sùk-khà-phâap', 'santé')] },
    ],
  },
];
