/** Conversations ajoutées après la maquette (fruits, temple, loisirs, week-end). */
import type { Dialog } from '../types';

export const EXTRA_DIALOG_FOR_THEME: Record<string, string> = { fruit: 'd:fruits', culture: 'd:temple', hobby: 'd:hobby', nature: 'd:weekend' };

export const EXTRA_DIALOGS: Dialog[] = [
  {
    id: 'd:fruits', title: { fr: 'Au marché aux fruits' }, icon: '🍉', other: { fr: 'Vendeuse' },
    lines: [
      { who: 'me', thai: 'มะม่วงสุกไหม{Q}', rom: 'má-mûang sùk mái {q}', tr: { fr: 'Les mangues sont-elles mûres ?' } },
      { who: 'other', thai: 'สุกแล้วค่ะ หวานมาก ชิมดูก่อนได้ค่ะ', rom: 'sùk lɛ́ɛo khâ wǎan mâak chim duu kɔ̀ɔn dâai khâ', tr: { fr: 'Oui, bien mûres et très sucrées. Vous pouvez goûter d’abord.' } },
      { who: 'me', thai: 'อร่อยจริงๆ กิโลละเท่าไหร่{Q}', rom: 'à-rɔ̀i jing-jing kì-loo lá thâo-rài {q}', tr: { fr: 'Vraiment délicieux. Combien le kilo ?' } },
      { who: 'other', thai: 'กิโลละแปดสิบบาทค่ะ', rom: 'kì-loo lá pɛ̀ɛt-sìp bàat khâ', tr: { fr: 'Quatre-vingts bahts le kilo.' } },
      { who: 'me', thai: 'เอาสองกิโล{P} แล้วก็เงาะอีกครึ่งกิโล', rom: 'ao sɔ̌ɔng kì-loo {p} lɛ́ɛo-kɔ̂ɔ ngɔ́ ìik khrʉ̂ng kì-loo', tr: { fr: 'J’en prends deux kilos, et aussi un demi-kilo de ramboutans.' } },
      { who: 'other', thai: 'ได้ค่ะ ทั้งหมดสองร้อยบาทค่ะ', rom: 'dâai khâ tháng-mòt sɔ̌ɔng-rɔ́ɔi bàat khâ', tr: { fr: 'D’accord. Deux cents bahts en tout.' } },
      { who: 'me', thai: 'ขอถุงหน่อย{P}', rom: 'khɔ̌ɔ thǔng nɔ̀i {p}', tr: { fr: 'Un sac, s’il vous plaît.' } },
      { who: 'other', thai: 'นี่ค่ะ ขอบคุณค่ะ', rom: 'nîi khâ khɔ̀ɔp-khun khâ', tr: { fr: 'Voilà. Merci.' } },
    ],
  },
  {
    id: 'd:temple', title: { fr: 'Visite au temple' }, icon: '🛕', other: { fr: 'Ami thaï' },
    lines: [
      { who: 'other', thai: 'ก่อนเข้าโบสถ์ต้องถอดรองเท้านะครับ', rom: 'kɔ̀ɔn khâo bòot tɔ̂ng thɔ̀ɔt rɔɔng-tháao ná khráp', tr: { fr: 'Avant d’entrer dans la chapelle, il faut enlever ses chaussures.' } },
      { who: 'me', thai: 'ได้{P} แล้วต้องแต่งตัวยังไง{Q}', rom: 'dâai {p} lɛ́ɛo tɔ̂ng tɛ̀ng-tua yang-ngai {q}', tr: { fr: 'D’accord. Et comment faut-il s’habiller ?' } },
      { who: 'other', thai: 'ใส่กางเกงขายาวและปิดไหล่ครับ', rom: 'sài kaang-keeng khǎa-yaao lɛ́ pìt lài khráp', tr: { fr: 'Un pantalon long, et les épaules couvertes.' } },
      { who: 'me', thai: 'ถ่ายรูปข้างในได้ไหม{Q}', rom: 'thàai-rûup khâang-nai dâai mái {q}', tr: { fr: 'Peut-on prendre des photos à l’intérieur ?' } },
      { who: 'other', thai: 'ได้ครับ แต่อย่าหันหลังให้พระพุทธรูป', rom: 'dâai khráp tɛ̀ɛ yàa hǎn lǎng hâi phrá-phút-thá-rûup', tr: { fr: 'Oui, mais ne tournez pas le dos à la statue de Bouddha.' } },
      { who: 'me', thai: 'เข้าใจแล้ว{P} คนไทยมาทำบุญบ่อยไหม{Q}', rom: 'khâo-jai lɛ́ɛo {p} khon thai maa tham-bun bɔ̀i mái {q}', tr: { fr: 'Compris. Les Thaïlandais viennent-ils souvent faire des mérites ?' } },
      { who: 'other', thai: 'บ่อยครับ โดยเฉพาะวันพระ', rom: 'bɔ̀i khráp dooi-chà-phɔ́ wan-phrá', tr: { fr: 'Souvent, surtout les jours saints bouddhiques.' } },
      { who: 'me', thai: 'สวยมาก{P} ขอบคุณที่พามา', rom: 'sǔai mâak {p} khɔ̀ɔp-khun thîi phaa maa', tr: { fr: 'C’est magnifique. Merci de m’avoir amené ici.' } },
    ],
  },
  {
    id: 'd:hobby', title: { fr: 'Parler de ses loisirs' }, icon: '⚽', other: { fr: 'Collègue' },
    lines: [
      { who: 'other', thai: 'เวลาว่างคุณชอบทำอะไรครับ', rom: 'wee-laa wâang khun chɔ̂ɔp tham à-rai khráp', tr: { fr: 'Que faites-vous pendant votre temps libre ?' } },
      { who: 'me', thai: '{I}ชอบว่ายน้ำและอ่านหนังสือ{P}', rom: '{i} chɔ̂ɔp wâai-náam lɛ́ àan nǎng-sʉ̌ʉ {p}', tr: { fr: 'J’aime nager et lire.' } },
      { who: 'other', thai: 'ว่ายน้ำบ่อยไหมครับ', rom: 'wâai-náam bɔ̀i mái khráp', tr: { fr: 'Vous nagez souvent ?' } },
      { who: 'me', thai: 'อาทิตย์ละสองครั้ง{P} แล้วคุณล่ะ{Q}', rom: 'aa-thít lá sɔ̌ɔng khráng {p} lɛ́ɛo khun lâ {q}', tr: { fr: 'Deux fois par semaine. Et vous ?' } },
      { who: 'other', thai: 'ผมเล่นฟุตบอลกับเพื่อนทุกเย็นวันเสาร์', rom: 'phǒm lên fút-bɔɔn kàp phʉ̂an thúk yen wan-sǎo', tr: { fr: 'Je joue au football avec des amis tous les samedis soir.' } },
      { who: 'me', thai: 'สนุกไหม{Q} {I}อยากลองบ้าง', rom: 'sà-nùk mái {q} {i} yàak lɔɔng bâang', tr: { fr: 'C’est amusant ? J’aimerais essayer aussi.' } },
      { who: 'other', thai: 'มาเล่นด้วยกันสิครับ เสาร์นี้หกโมงเย็น', rom: 'maa lên dûai-kan sì khráp sǎo níi hòk moong yen', tr: { fr: 'Venez jouer avec nous ! Ce samedi, à six heures du soir.' } },
      { who: 'me', thai: 'ตกลง{P} เจอกันเสาร์นี้', rom: 'tòk-long {p} jəə kan sǎo níi', tr: { fr: 'D’accord, à samedi.' } },
    ],
  },
  {
    id: 'd:weekend', title: { fr: 'Projets pour le week-end' }, icon: '🏝️', other: { fr: 'Amie' },
    lines: [
      { who: 'other', thai: 'เสาร์อาทิตย์นี้จะไปไหนคะ', rom: 'sǎo-aa-thít níi jà pai nǎi khá', tr: { fr: 'Où vas-tu ce week-end ?' } },
      { who: 'me', thai: '{I}จะไปทะเลที่หัวหิน{P}', rom: '{i} jà pai thá-lee thîi hǔa-hǐn {p}', tr: { fr: 'Je vais à la mer, à Hua Hin.' } },
      { who: 'other', thai: 'ดีจัง ไปกับใครคะ', rom: 'dii jang pai kàp khrai khá', tr: { fr: 'Super ! Avec qui ?' } },
      { who: 'me', thai: 'ไปกับเพื่อนสองคน{P} จะไปดูพระอาทิตย์ตกที่ชายหาด', rom: 'pai kàp phʉ̂an sɔ̌ɔng khon {p} jà pai duu phrá-aa-thít tòk thîi chaai-hàat', tr: { fr: 'Avec deux amis. On va regarder le coucher de soleil sur la plage.' } },
      { who: 'other', thai: 'อย่าลืมเอาครีมกันแดดไปนะคะ แดดแรงมาก', rom: 'yàa lʉʉm ao khriim-kan-dɛ̀ɛt pai ná khá dɛ̀ɛt rɛɛng mâak', tr: { fr: 'N’oublie pas la crème solaire, le soleil tape fort.' } },
      { who: 'me', thai: 'ขอบคุณ{P} แล้วคุณล่ะ{Q} มีแผนอะไรไหม', rom: 'khɔ̀ɔp-khun {p} lɛ́ɛo khun lâ {q} mii phɛ̌ɛn à-rai mái', tr: { fr: 'Merci. Et toi, tu as des projets ?' } },
      { who: 'other', thai: 'อยู่บ้านพักผ่อน อาจจะไปเดินเล่นที่สวนตอนเย็น', rom: 'yùu bâan phák-phɔ̀n àat-jà pai dəən-lên thîi sǔan tɔɔn-yen', tr: { fr: 'Je reste me reposer à la maison, avec peut-être une promenade au parc le soir.' } },
      { who: 'me', thai: 'ขอให้สนุกนะ{P} เจอกันวันจันทร์', rom: 'khɔ̌ɔ hâi sà-nùk ná {p} jəə kan wan-jan', tr: { fr: 'Amuse-toi bien. À lundi.' } },
    ],
  },
];
