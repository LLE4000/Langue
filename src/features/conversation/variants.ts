/**
 * Autres formulations acceptées pour chaque réplique « Vous » des dialogues (conversation parlée).
 * Rédigées puis relues par un second passage linguistique (thaï naturel, ton et registre, phonétique de l'app) ;
 * jetons {P} {Q} {I} résolus selon l'apprenant, comme dans les dialogues. Clé : identifiant du dialogue → rang de la réplique.
 */
import type { Reply } from '@/engine/conversation';

export const REPLY_VARIANTS: Record<string, Record<number, Reply[]>> = {
  "d:market": {
    0: [
      { thai: "อันนี้ราคาเท่าไหร่{Q}", rom: "an-níi raa-khaa thâo-rài {q}", fr: "Quel est le prix de ceci ?" },
      { thai: "อันนี้กี่บาท{Q}", rom: "an-níi kìi bàat {q}", fr: "Ceci fait combien de bahts ?" },
      { thai: "ตัวนี้เท่าไหร่{Q}", rom: "tua níi thâo-rài {q}", fr: "Combien coûte celui-ci ?" },
    ],
    2: [
      { thai: "แพงไปนิด ลดให้หน่อยได้ไหม{Q}", rom: "phɛɛng pai nít lót hâi nɔ̀i dâai mái {q}", fr: "Un peu cher, vous pouvez me faire une réduction ?" },
      { thai: "แพงจัง ลดหน่อยได้ไหม{Q}", rom: "phɛɛng jang lót nɔ̀i dâai mái {q}", fr: "C’est cher ! Vous pouvez baisser un peu ?" },
      { thai: "ลดราคาได้ไหม{Q} แพงไปหน่อย", rom: "lót raa-khaa dâai mái {q} phɛɛng pai nɔ̀i", fr: "Vous pouvez baisser le prix ? C’est un peu cher." },
    ],
    4: [
      { thai: "สองร้อยบาทได้ไหม{Q}", rom: "sɔ̌ɔng-rɔ́ɔi bàat dâai mái {q}", fr: "Deux cents bahts, c’est possible ?" },
      { thai: "ลดเหลือสองร้อยได้ไหม{Q}", rom: "lót lʉ̌a sɔ̌ɔng-rɔ́ɔi dâai mái {q}", fr: "Vous pouvez descendre à deux cents ?" },
      { thai: "ขายสองร้อยได้ไหม{Q}", rom: "khǎai sɔ̌ɔng-rɔ́ɔi dâai mái {q}", fr: "Vous me le vendez à deux cents ?" },
    ],
    6: [
      { thai: "ขอสองตัว{P}", rom: "khɔ̌ɔ sɔ̌ɔng tua {p}", fr: "Deux, s’il vous plaît." },
      { thai: "สองตัว{P}", rom: "sɔ̌ɔng tua {p}", fr: "Deux." },
      { thai: "{I}เอาสองตัว{P}", rom: "{i} ao sɔ̌ɔng tua {p}", fr: "Moi, j’en prends deux." },
    ],
  },
  "d:resto": {
    1: [
      { thai: "มาสองคน{P}", rom: "maa sɔ̌ɔng khon {p}", fr: "Nous sommes deux." },
      { thai: "มากันสองคน{P}", rom: "maa kan sɔ̌ɔng khon {p}", fr: "Nous sommes venus à deux." },
      { thai: "สองที่{P}", rom: "sɔ̌ɔng thîi {p}", fr: "Deux places / deux couverts." },
    ],
    3: [
      { thai: "เอาผัดไทยกุ้งหนึ่งจาน กับข้าวผัดไก่หนึ่งจาน{P}", rom: "ao phàt-thai kûng nʉ̀ng jaan kàp khâao-phàt kài nʉ̀ng jaan {p}", fr: "Je prends un pad thaï aux crevettes et un riz sauté au poulet." },
      { thai: "ขอผัดไทยกุ้งจานหนึ่ง แล้วก็ข้าวผัดไก่จานหนึ่ง{P}", rom: "khɔ̌ɔ phàt-thai kûng jaan nʉ̀ng lɛ́ɛo-kɔ̂ɔ khâao-phàt kài jaan nʉ̀ng {p}", fr: "Un pad thaï aux crevettes, et puis un riz sauté au poulet." },
      { thai: "ผัดไทยกุ้งหนึ่งจาน ข้าวผัดไก่หนึ่งจาน{P}", rom: "phàt-thai kûng nʉ̀ng jaan khâao-phàt kài nʉ̀ng jaan {p}", fr: "Un pad thaï aux crevettes, un riz sauté au poulet." },
    ],
    5: [
      { thai: "ไม่เอาเผ็ด{P} ขอน้ำเปล่าสองขวดด้วย", rom: "mâi ao phèt {p} khɔ̌ɔ náam-plàao sɔ̌ɔng khùat dûai", fr: "Pas épicé. Deux bouteilles d’eau aussi, s’il vous plaît." },
      { thai: "ไม่เผ็ด{P} แล้วเอาน้ำเปล่าสองขวด{P}", rom: "mâi phèt {p} lɛ́ɛo ao náam-plàao sɔ̌ɔng khùat {p}", fr: "Pas épicé. Et je prends deux bouteilles d’eau." },
      { thai: "ขอไม่เผ็ด{P} แล้วก็น้ำเปล่าสองขวด{P}", rom: "khɔ̌ɔ mâi phèt {p} lɛ́ɛo-kɔ̂ɔ náam-plàao sɔ̌ɔng khùat {p}", fr: "Pas épicé, s’il vous plaît, et deux bouteilles d’eau." },
    ],
    7: [
      { thai: "เก็บเงินด้วย{P}", rom: "kèp ngən dûai {p}", fr: "L’addition, s’il vous plaît." },
      { thai: "คิดเงินด้วย{P}", rom: "khít ngən dûai {p}", fr: "Vous pouvez faire l’addition ?" },
      { thai: "ขอบิลด้วย{P}", rom: "khɔ̌ɔ bin dûai {p}", fr: "La note, s’il vous plaît." },
    ],
  },
  "d:taxi": {
    0: [
      { thai: "ไปสุวรรณภูมิ{P}", rom: "pai sù-wan-ná-phuum {p}", fr: "À Suvarnabhumi, s’il vous plaît." },
      { thai: "ไปสนามบินสุวรรณภูมิได้ไหม{Q}", rom: "pai sà-nǎam-bin sù-wan-ná-phuum dâai mái {q}", fr: "Vous allez à l’aéroport Suvarnabhumi ?" },
      { thai: "{I}จะไปสนามบินสุวรรณภูมิ{P}", rom: "{i} jà pai sà-nǎam-bin sù-wan-ná-phuum {p}", fr: "Je vais à l’aéroport Suvarnabhumi." },
    ],
    2: [
      { thai: "ขึ้นทางด่วน{P} ใช้เวลาเท่าไหร่{Q}", rom: "khʉ̂n thaang-dùan {p} chái wee-laa thâo-rài {q}", fr: "Oui, prenez la voie express. Ça prend combien de temps ?" },
      { thai: "ขึ้น{P} ใช้เวลากี่นาที{Q}", rom: "khʉ̂n {p} chái wee-laa kìi naa-thii {q}", fr: "Oui. Ça prend combien de minutes ?" },
      { thai: "ขึ้นเลย{P} ประมาณกี่นาที{Q}", rom: "khʉ̂n ləəi {p} prà-maan kìi naa-thii {q}", fr: "Allez-y. Environ combien de minutes ?" },
    ],
    4: [
      { thai: "ช่วยเปิดมิเตอร์ด้วย{P}", rom: "chûai pə̀ət mí-təə dûai {p}", fr: "Mettez le compteur, s’il vous plaît." },
      { thai: "กดมิเตอร์ด้วยนะ{Q}", rom: "kòt mí-təə dûai ná {q}", fr: "Enclenchez le compteur, d’accord ?" },
      { thai: "ใช้มิเตอร์นะ{Q}", rom: "chái mí-təə ná {q}", fr: "On utilise le compteur, d’accord ?" },
    ],
    6: [
      { thai: "จอดตรงนี้เลย{P} กี่บาท{Q}", rom: "jɔ̀ɔt trong-níi ləəi {p} kìi bàat {q}", fr: "Arrêtez-vous juste ici. Combien de bahts ?" },
      { thai: "จอดที่นี่{P} เท่าไหร่{Q}", rom: "jɔ̀ɔt thîi-nîi {p} thâo-rài {q}", fr: "Arrêtez-vous ici. C’est combien ?" },
      { thai: "ขอลงตรงนี้{P} ทั้งหมดเท่าไหร่{Q}", rom: "khɔ̌ɔ long trong-níi {p} tháng-mòt thâo-rài {q}", fr: "Je descends ici. Ça fait combien en tout ?" },
    ],
    8: [
      { thai: "ไม่ต้องทอนแล้ว{P} ขอบคุณ{P}", rom: "mâi tɔ̂ng thɔɔn lɛ́ɛo {p} khɔ̀ɔp-khun {p}", fr: "Pas besoin de rendre la monnaie. Merci." },
      { thai: "ขอบคุณ{P} ไม่ต้องทอน{P}", rom: "khɔ̀ɔp-khun {p} mâi tɔ̂ng thɔɔn {p}", fr: "Merci. Gardez la monnaie." },
      { thai: "ไม่ต้องทอนนะ{P} ขอบคุณมาก{P}", rom: "mâi tɔ̂ng thɔɔn ná {p} khɔ̀ɔp-khun mâak {p}", fr: "Gardez la monnaie. Merci beaucoup." },
    ],
  },
  "d:hosp": {
    0: [
      { thai: "ขอโทษ{P} {I}มาเยี่ยมผู้ป่วย{P}", rom: "khɔ̌ɔ-thôot {p} {i} maa yîam phûu-pùai {p}", fr: "Excusez-moi, je viens voir un patient (formel)." },
      { thai: "ขอโทษ{P} มาเยี่ยมคนไข้{P}", rom: "khɔ̌ɔ-thôot {p} maa yîam khon-khâi {p}", fr: "Excusez-moi, je viens rendre visite à un patient." },
      { thai: "ขอโทษ{P} {I}มาเยี่ยมไข้{P}", rom: "khɔ̌ɔ-thôot {p} {i} maa yîam khâi {p}", fr: "Excusez-moi, je viens rendre visite à un malade." },
    ],
    2: [
      { thai: "ชื่อตามนี้{P}", rom: "chʉ̂ʉ taam níi {p}", fr: "Le nom, c’est celui-ci." },
      { thai: "คนนี้{P}", rom: "khon níi {p}", fr: "Cette personne-ci." },
    ],
    4: [
      { thai: "ลิฟต์อยู่ตรงไหน{Q}", rom: "líp yùu trong-nǎi {q}", fr: "L’ascenseur est où exactement ?" },
      { thai: "ลิฟต์ไปทางไหน{Q}", rom: "líp pai thaang nǎi {q}", fr: "L’ascenseur, c’est par où ?" },
      { thai: "ขึ้นลิฟต์ตรงไหน{Q}", rom: "khʉ̂n líp trong-nǎi {q}", fr: "Où prend-on l’ascenseur ?" },
    ],
    6: [
      { thai: "เวลาเยี่ยมถึงกี่โมง{Q}", rom: "wee-laa yîam thʉ̌ng kìi moong {q}", fr: "Les visites, c’est jusqu’à quelle heure ?" },
      { thai: "เข้าเยี่ยมได้ถึงกี่โมง{Q}", rom: "khâo yîam dâai thʉ̌ng kìi moong {q}", fr: "On peut rendre visite jusqu’à quelle heure ?" },
      { thai: "อยู่ได้ถึงกี่โมง{Q}", rom: "yùu dâai thʉ̌ng kìi moong {q}", fr: "On peut rester jusqu’à quelle heure ?" },
    ],
    8: [
      { thai: "ขอบคุณมากเลย{P}", rom: "khɔ̀ɔp-khun mâak ləəi {p}", fr: "Merci vraiment beaucoup." },
      { thai: "ขอบคุณ{P}", rom: "khɔ̀ɔp-khun {p}", fr: "Merci." },
    ],
  },
  "d:intro": {
    3: [
      { thai: "{I}มาจากเบลเยียม{P}", rom: "{i} maa jàak ben-yîam {p}", fr: "Je viens de Belgique." },
      { thai: "มาจากเบลเยียม{P}", rom: "maa jàak ben-yîam {p}", fr: "De Belgique." },
      { thai: "{I}เป็นคนเบลเยียม{P}", rom: "{i} pen khon ben-yîam {p}", fr: "Je suis belge." },
    ],
    5: [
      { thai: "เป็นวิศวกรโครงสร้าง{P}", rom: "pen wít-sà-wá-kɔɔn khroong-sâang {p}", fr: "Ingénieur en structure." },
      { thai: "{I}ทำงานเป็นวิศวกรโครงสร้าง{P}", rom: "{i} tham-ngaan pen wít-sà-wá-kɔɔn khroong-sâang {p}", fr: "Je travaille comme ingénieur en structure." },
      { thai: "{I}เป็นวิศวกรด้านโครงสร้าง{P}", rom: "{i} pen wít-sà-wá-kɔɔn dâan khroong-sâang {p}", fr: "Je suis ingénieur, spécialité structure." },
    ],
    7: [
      { thai: "ขอบคุณ{P} {I}พูดไทยได้นิดหน่อย{P}", rom: "khɔ̀ɔp-khun {p} {i} phûut thai dâai nít-nɔ̀i {p}", fr: "Merci. Je parle un peu thaï." },
      { thai: "ขอบคุณ{P} พูดได้นิดหน่อยเอง{P}", rom: "khɔ̀ɔp-khun {p} phûut dâai nít-nɔ̀i eeng {p}", fr: "Merci. Je parle seulement un peu." },
      { thai: "ขอบคุณมาก{P} {I}พูดได้นิดเดียว{P}", rom: "khɔ̀ɔp-khun mâak {p} {i} phûut dâai nít diao {p}", fr: "Merci beaucoup. Je ne parle qu’un tout petit peu." },
    ],
  },
  "d:hotel": {
    0: [
      { thai: "สวัสดี{P} {I}จองห้องไว้{P}", rom: "sà-wàt-dii {p} {i} jɔɔng hɔ̂ng wái {p}", fr: "Bonjour, j’ai réservé une chambre." },
      { thai: "สวัสดี{P} จองไว้แล้ว{P}", rom: "sà-wàt-dii {p} jɔɔng wái lɛ́ɛo {p}", fr: "Bonjour, j’ai déjà réservé." },
      { thai: "สวัสดี{P} {I}จองห้องพักไว้{P}", rom: "sà-wàt-dii {p} {i} jɔɔng hɔ̂ng-phák wái {p}", fr: "Bonjour, j’ai réservé une chambre d’hôtel." },
    ],
    2: [
      { thai: "นี่หนังสือเดินทาง{P}", rom: "nîi nǎng-sʉ̌ʉ dəən-thaang {p}", fr: "Voici le passeport." },
      { thai: "นี่พาสปอร์ต{P}", rom: "nîi pháat-sà-pɔ̀ɔt {p}", fr: "Voici le passeport (mot courant)." },
      { thai: "ได้{P} นี่{P}", rom: "dâai {p} nîi {p}", fr: "Bien sûr. Voici." },
    ],
    4: [
      { thai: "ใช่{P} รวมอาหารเช้าด้วยไหม{Q}", rom: "châi {p} ruam aa-hǎan cháao dûai mái {q}", fr: "Oui. Le petit déjeuner est compris ?" },
      { thai: "ถูกต้อง{P} มีอาหารเช้าด้วยไหม{Q}", rom: "thùuk-tɔ̂ng {p} mii aa-hǎan cháao dûai mái {q}", fr: "C’est exact. Il y a aussi un petit déjeuner ?" },
      { thai: "ใช่{P} อาหารเช้ามีไหม{Q}", rom: "châi {p} aa-hǎan cháao mii mái {q}", fr: "Oui. Le petit déjeuner, il y en a ?" },
    ],
    7: [
      { thai: "รหัสไวไฟคืออะไร{Q}", rom: "rá-hàt waai-faai khʉʉ à-rai {q}", fr: "C’est quoi, le mot de passe du wifi ?" },
      { thai: "ขอรหัสไวไฟหน่อย{P}", rom: "khɔ̌ɔ rá-hàt waai-faai nɔ̀i {p}", fr: "Le mot de passe du wifi, s’il vous plaît." },
      { thai: "ไวไฟรหัสอะไร{Q}", rom: "waai-faai rá-hàt à-rai {q}", fr: "Le wifi, c’est quel mot de passe ?" },
    ],
  },
  "d:site": {
    0: [
      { thai: "สวัสดี{P} วันนี้{I}มาตรวจโครงสร้าง{P}", rom: "sà-wàt-dii {p} wan-níi {i} maa trùat khroong-sâang {p}", fr: "Bonjour. Aujourd’hui je viens contrôler la structure." },
      { thai: "สวัสดี{P} วันนี้มาตรวจสอบโครงสร้าง{P}", rom: "sà-wàt-dii {p} wan-níi maa trùat-sɔ̀ɔp khroong-sâang {p}", fr: "Bonjour. Je viens inspecter la structure aujourd’hui." },
      { thai: "สวัสดี{P} {I}มาตรวจสอบโครงสร้างวันนี้{P}", rom: "sà-wàt-dii {p} {i} maa trùat-sɔ̀ɔp khroong-sâang wan-níi {p}", fr: "Bonjour. Je viens inspecter la structure aujourd’hui." },
    ],
    2: [
      { thai: "คานนี้ร้าว เห็นไหม{Q}", rom: "khaan níi ráao hěn mái {q}", fr: "Cette poutre est fissurée, vous voyez ?" },
      { thai: "คานตัวนี้มีรอยร้าว เห็นไหม{Q}", rom: "khaan tua níi mii rɔɔi-ráao hěn mái {q}", fr: "Cette poutre-ci a une fissure, vous voyez ?" },
      { thai: "เห็นไหม{Q} คานนี้มีรอยร้าว", rom: "hěn mái {q} khaan níi mii rɔɔi-ráao", fr: "Vous voyez ? Cette poutre a une fissure." },
    ],
    4: [
      { thai: "ต้องคำนวณใหม่ก่อน{P} ขอดูแบบด้วย{P}", rom: "tɔ̂ng kham-nuan mài kɔ̀ɔn {p} khɔ̌ɔ duu bɛ̀ɛp dûai {p}", fr: "Il faut d’abord recalculer. Je voudrais voir les plans aussi." },
      { thai: "ต้องคำนวณใหม่ก่อน{P} เอาแบบมาให้ดูหน่อย{P}", rom: "tɔ̂ng kham-nuan mài kɔ̀ɔn {p} ao bɛ̀ɛp maa hâi duu nɔ̀i {p}", fr: "Il faut d’abord recalculer. Apportez-moi les plans, s’il vous plaît." },
      { thai: "ก่อนอื่นต้องคำนวณใหม่{P} ขอดูแบบหน่อย{P}", rom: "kɔ̀ɔn ʉ̀ʉn tɔ̂ng kham-nuan mài {p} khɔ̌ɔ duu bɛ̀ɛp nɔ̀i {p}", fr: "Avant tout, il faut recalculer. Puis-je voir les plans ?" },
    ],
    6: [
      { thai: "เหล็กเสริมใช้ขนาดเท่าไหร่{Q}", rom: "lèk-sə̌əm chái khà-nàat thâo-rài {q}", fr: "Quelle taille d’armatures utilisez-vous ?" },
      { thai: "เหล็กเสริมขนาดกี่มิล{Q}", rom: "lèk-sə̌əm khà-nàat kìi min {q}", fr: "Les armatures font combien de millimètres ?" },
      { thai: "เหล็กเสริมกี่มิล{Q}", rom: "lèk-sə̌əm kìi min {q}", fr: "Les armatures, combien de millimètres ?" },
    ],
    8: [
      { thai: "ยังไม่ต้องเทคอนกรีตนะ{Q} รอผลตรวจก่อน", rom: "yang mâi tɔ̂ng thee khɔɔn-krìit ná {q} rɔɔ phǒn trùat kɔ̀ɔn", fr: "Ne coulez pas encore le béton. Attendez d’abord le résultat du contrôle." },
      { thai: "อย่าเพิ่งเทปูนนะ{Q} รอผลตรวจก่อน", rom: "yàa phə̂ng thee puun ná {q} rɔɔ phǒn trùat kɔ̀ɔn", fr: "Ne coulez pas encore le béton. Attendez le résultat du contrôle." },
      { thai: "รอผลตรวจก่อน{P} อย่าเพิ่งเทคอนกรีต", rom: "rɔɔ phǒn trùat kɔ̀ɔn {p} yàa phə̂ng thee khɔɔn-krìit", fr: "Attendez d’abord le résultat du contrôle, ne coulez pas encore le béton." },
    ],
  },
  "d:meeting": {
    1: [
      { thai: "สิบโมง{P} ผู้รับเหมามาหรือยัง{Q}", rom: "sìp moong {p} phûu-ráp-mǎo maa rʉ̌ʉ yang {q}", fr: "À dix heures. L’entrepreneur est là ?" },
      { thai: "เริ่มสิบโมง{P} ผู้รับเหมามาถึงหรือยัง{Q}", rom: "rə̂əm sìp moong {p} phûu-ráp-mǎo maa thʉ̌ng rʉ̌ʉ yang {q}", fr: "À dix heures. L’entrepreneur est-il arrivé ?" },
      { thai: "ประชุมเริ่มสิบโมง{P} ผู้รับเหมามาแล้วยัง{Q}", rom: "prà-chum rə̂əm sìp moong {p} phûu-ráp-mǎo maa lɛ́ɛo yang {q}", fr: "La réunion commence à dix heures. L’entrepreneur est déjà là ?" },
    ],
    3: [
      { thai: "วันนี้จะคุยเรื่องฐานรากกับเสาเข็ม{P}", rom: "wan-níi jà khui rʉ̂ang thǎan-râak kàp sǎo-khěm {p}", fr: "Aujourd’hui on parlera des fondations et des pieux." },
      { thai: "วันนี้เราจะคุยกันเรื่องฐานรากและเสาเข็ม{P}", rom: "wan-níi rao jà khui kan rʉ̂ang thǎan-râak lɛ́ sǎo-khěm {p}", fr: "Aujourd’hui nous discuterons ensemble des fondations et des pieux." },
      { thai: "วันนี้เราจะประชุมเรื่องฐานรากกับเสาเข็ม{P}", rom: "wan-níi rao jà prà-chum rʉ̂ang thǎan-râak kàp sǎo-khěm {p}", fr: "Aujourd’hui la réunion porte sur les fondations et les pieux." },
    ],
    5: [
      { thai: "เปลี่ยน{P} เราต้องเพิ่มเสาอีกสองต้น", rom: "plìan {p} rao tɔ̂ng phə̂əm sǎo ìik sɔ̌ɔng tôn", fr: "Oui. Nous devons ajouter deux poteaux." },
      { thai: "เปลี่ยนแล้ว{P} ต้องเพิ่มเสาอีกสองต้น", rom: "plìan lɛ́ɛo {p} tɔ̂ng phə̂əm sǎo ìik sɔ̌ɔng tôn", fr: "Elles ont changé. Il faut ajouter deux poteaux." },
      { thai: "เปลี่ยน{P} ต้องเพิ่มเสาสองต้น{P}", rom: "plìan {p} tɔ̂ng phə̂əm sǎo sɔ̌ɔng tôn {p}", fr: "Oui. Il faut ajouter deux poteaux." },
    ],
    7: [
      { thai: "ส่งพรุ่งนี้{P}", rom: "sòng phrûng-níi {p}", fr: "Je l’envoie demain." },
      { thai: "พรุ่งนี้ส่งให้{P}", rom: "phrûng-níi sòng hâi {p}", fr: "Je vous l’envoie demain." },
      { thai: "ได้พรุ่งนี้{P}", rom: "dâai phrûng-níi {p}", fr: "Ce sera prêt demain." },
    ],
  },
  "d:way": {
    0: [
      { thai: "ขอโทษ{P} สถานีรถไฟฟ้าอยู่ตรงไหน{Q}", rom: "khɔ̌ɔ-thôot {p} sà-thǎa-nii rót-fai-fáa yùu trong-nǎi {q}", fr: "Excusez-moi, la station de métro aérien est où exactement ?" },
      { thai: "ขอโทษ{P} ไปสถานีรถไฟฟ้าทางไหน{Q}", rom: "khɔ̌ɔ-thôot {p} pai sà-thǎa-nii rót-fai-fáa thaang nǎi {q}", fr: "Excusez-moi, pour aller à la station de métro aérien, c’est par où ?" },
      { thai: "ขอโทษ{P} สถานีรถไฟฟ้าไปทางไหน{Q}", rom: "khɔ̌ɔ-thôot {p} sà-thǎa-nii rót-fai-fáa pai thaang nǎi {q}", fr: "Excusez-moi, la station de métro aérien, c’est de quel côté ?" },
    ],
    2: [
      { thai: "อยู่ไกลไหม{Q}", rom: "yùu klai mái {q}", fr: "C’est loin ?" },
      { thai: "ไกลจากที่นี่ไหม{Q}", rom: "klai jàak thîi-nîi mái {q}", fr: "C’est loin d’ici ?" },
      { thai: "เดินไกลไหม{Q}", rom: "dəən klai mái {q}", fr: "C’est loin à pied ?" },
    ],
    4: [
      { thai: "ขอบคุณมากเลย{P}", rom: "khɔ̀ɔp-khun mâak ləəi {p}", fr: "Merci vraiment beaucoup." },
      { thai: "ขอบคุณ{P}", rom: "khɔ̀ɔp-khun {p}", fr: "Merci." },
    ],
  },
  "d:grab": {
    1: [
      { thai: "{I}รออยู่หน้าโรงแรม{P} ใส่เสื้อสีขาว", rom: "{i} rɔɔ yùu nâa roong-rɛɛm {p} sài sʉ̂a sǐi-khǎao", fr: "J’attends devant l’hôtel. Je porte un haut blanc." },
      { thai: "อยู่หน้าโรงแรม{P} {I}ใส่เสื้อสีขาว", rom: "yùu nâa roong-rɛɛm {p} {i} sài sʉ̂a sǐi-khǎao", fr: "Devant l’hôtel. Je porte un haut blanc." },
      { thai: "{I}ยืนอยู่หน้าโรงแรม{P} ใส่เสื้อขาว", rom: "{i} yʉʉn yùu nâa roong-rɛɛm {p} sài sʉ̂a khǎao", fr: "Je me tiens devant l’hôtel. Je porte un haut blanc." },
    ],
    3: [
      { thai: "รถคุณสีอะไร{Q}", rom: "rót khun sǐi à-rai {q}", fr: "Votre voiture est de quelle couleur ?" },
      { thai: "รถเป็นสีอะไร{Q}", rom: "rót pen sǐi à-rai {q}", fr: "La voiture est de quelle couleur ?" },
      { thai: "รถของคุณสีอะไร{Q}", rom: "rót khɔ̌ng khun sǐi à-rai {q}", fr: "De quelle couleur est votre voiture ?" },
    ],
    5: [
      { thai: "รออยู่{P}", rom: "rɔɔ yùu {p}", fr: "J’attends." },
      { thai: "{I}รออยู่นะ{P}", rom: "{i} rɔɔ yùu ná {p}", fr: "Je vous attends, hein." },
      { thai: "ได้{P} รออยู่{P}", rom: "dâai {p} rɔɔ yùu {p}", fr: "D’accord. J’attends." },
    ],
  },
  "d:friends": {
    1: [
      { thai: "ว่างนะ มีอะไรเหรอ", rom: "wâang ná mii à-rai rə̌ə", fr: "Oui, je suis libre, il y a quelque chose ?" },
      { thai: "ว่างสิ ทำไมเหรอ", rom: "wâang sì tham-mai rə̌ə", fr: "Bien sûr, pourquoi ?" },
      { thai: "ว่าง มีอะไรหรือเปล่า", rom: "wâang mii à-rai rʉ̌ʉ-plàao", fr: "Oui, il y a quelque chose ?" },
    ],
    3: [
      { thai: "ได้สิ จะกินอะไรกัน", rom: "dâai sì jà kin à-rai kan", fr: "D’accord ! On mange quoi ?" },
      { thai: "ไปสิ อยากกินอะไร", rom: "pai sì yàak kin à-rai", fr: "Allons-y ! Tu veux manger quoi ?" },
      { thai: "ไปๆ กินอะไรดี", rom: "pai pai kin à-rai dii", fr: "On y va ! On mange quoi ?" },
    ],
    5: [
      { thai: "ดีเลย {I}ชอบส้มตำ", rom: "dii ləəi {i} chɔ̂ɔp sôm-tam", fr: "Super, j’aime la salade de papaye." },
      { thai: "ได้เลย {I}ชอบกินส้มตำ", rom: "dâai ləəi {i} chɔ̂ɔp kin sôm-tam", fr: "D’accord, j’aime manger la salade de papaye." },
      { thai: "ดีสิ ชอบส้มตำมาก", rom: "dii sì chɔ̂ɔp sôm-tam mâak", fr: "Oui, j’adore la salade de papaye." },
    ],
    7: [
      { thai: "โอเค เจอกัน", rom: "oo-khee jəə kan", fr: "OK, à tout à l’heure." },
      { thai: "ได้ เจอกันนะ", rom: "dâai jəə kan ná", fr: "D’accord, à plus tard." },
      { thai: "เจอกันหกโมงเย็นนะ", rom: "jəə kan hòk moong yen ná", fr: "À dix-huit heures alors." },
    ],
  },
  "d:pharm": {
    0: [
      { thai: "สวัสดี{P} ขอยาแก้ปวดหัวหน่อย{P}", rom: "sà-wàt-dii {p} khɔ̌ɔ yaa kɛ̂ɛ pùat-hǔa nɔ̀i {p}", fr: "Bonjour, un médicament contre le mal de tête, s’il vous plaît." },
      { thai: "สวัสดี{P} มียาแก้ปวดหัวขายไหม{Q}", rom: "sà-wàt-dii {p} mii yaa kɛ̂ɛ pùat-hǔa khǎai mái {q}", fr: "Bonjour, vendez-vous un médicament contre le mal de tête ?" },
      { thai: "สวัสดี{P} {I}ปวดหัว มียาแก้ปวดไหม{Q}", rom: "sà-wàt-dii {p} {i} pùat-hǔa mii yaa kɛ̂ɛ pùat mái {q}", fr: "Bonjour, j’ai mal à la tête, avez-vous un antidouleur ?" },
    ],
    2: [
      { thai: "เป็นมาตั้งแต่เมื่อวาน{P}", rom: "pen maa tâng-tɛ̀ɛ mʉ̂a-waan {p}", fr: "Ça a commencé hier." },
      { thai: "ปวดตั้งแต่เมื่อวาน{P}", rom: "pùat tâng-tɛ̀ɛ mʉ̂a-waan {p}", fr: "J’ai mal depuis hier." },
      { thai: "ตั้งแต่เมื่อวานแล้ว{P}", rom: "tâng-tɛ̀ɛ mʉ̂a-waan lɛ́ɛo {p}", fr: "Depuis hier déjà." },
    ],
    4: [
      { thai: "ไม่มีไข้{P} แต่ไอนิดหน่อย", rom: "mâi mii khâi {p} tɛ̀ɛ ai nít-nɔ̀i", fr: "Pas de fièvre, mais je tousse un peu." },
      { thai: "ไม่มี{P} แต่มีไอนิดหน่อย", rom: "mâi mii {p} tɛ̀ɛ mii ai nít-nɔ̀i", fr: "Non, mais j’ai un peu de toux." },
      { thai: "ไม่มีไข้{P} ไอนิดหน่อยเอง", rom: "mâi mii khâi {p} ai nít-nɔ̀i eeng", fr: "Pas de fièvre, je tousse juste un peu." },
    ],
    6: [
      { thai: "ไม่แพ้อะไร{P}", rom: "mâi phɛ́ɛ à-rai {p}", fr: "Je ne suis allergique à rien." },
      { thai: "ไม่แพ้ยา{P}", rom: "mâi phɛ́ɛ yaa {p}", fr: "Pas d’allergie aux médicaments." },
      { thai: "ไม่แพ้ยาอะไรเลย{P}", rom: "mâi phɛ́ɛ yaa à-rai ləəi {p}", fr: "Allergique à aucun médicament." },
    ],
    8: [
      { thai: "ทั้งหมดเท่าไหร่{Q}", rom: "tháng-mòt thâo-rài {q}", fr: "Ça fait combien en tout ?" },
      { thai: "ราคาเท่าไหร่{Q}", rom: "raa-khaa thâo-rài {q}", fr: "Quel est le prix ?" },
      { thai: "กี่บาท{Q}", rom: "kìi bàat {q}", fr: "Combien de bahts ?" },
    ],
  },
  "d:cafe": {
    1: [
      { thai: "ขอกาแฟเย็นหนึ่งแก้ว{P}", rom: "khɔ̌ɔ kaa-fɛɛ yen nʉ̀ng kɛ̂ɛo {p}", fr: "Un café glacé, s’il vous plaît." },
      { thai: "ขอกาแฟเย็นแก้วนึง{P}", rom: "khɔ̌ɔ kaa-fɛɛ yen kɛ̂ɛo nʉng {p}", fr: "Un café glacé, s’il vous plaît." },
      { thai: "กาแฟเย็นหนึ่งแก้ว{P}", rom: "kaa-fɛɛ yen nʉ̀ng kɛ̂ɛo {p}", fr: "Un café glacé." },
    ],
    3: [
      { thai: "ขอหวานน้อย{P}", rom: "khɔ̌ɔ wǎan nɔ́ɔi {p}", fr: "Peu sucré, s’il vous plaît." },
      { thai: "เอาหวานน้อย{P}", rom: "ao wǎan nɔ́ɔi {p}", fr: "Je le prends peu sucré." },
      { thai: "ไม่ต้องหวานมาก{P}", rom: "mâi tɔ̂ng wǎan mâak {p}", fr: "Pas trop sucré." },
    ],
    5: [
      { thai: "เอากลับบ้าน{P}", rom: "ao klàp bâan {p}", fr: "À emporter." },
      { thai: "ซื้อกลับบ้าน{P}", rom: "sʉ́ʉ klàp bâan {p}", fr: "C’est à emporter." },
    ],
    7: [
      { thai: "สแกนได้ไหม{Q}", rom: "sà-kɛɛn dâai mái {q}", fr: "Je peux scanner ?" },
      { thai: "จ่ายผ่านคิวอาร์ได้ไหม{Q}", rom: "jàai phàan khiu-aa dâai mái {q}", fr: "Puis-je payer par QR code ?" },
      { thai: "มีคิวอาร์ให้สแกนไหม{Q}", rom: "mii khiu-aa hâi sà-kɛɛn mái {q}", fr: "Avez-vous un QR code à scanner ?" },
    ],
  },
  "d:visit": {
    0: [
      { thai: "เป็นไงบ้าง ดีขึ้นหรือยัง", rom: "pen ngai bâang dii-khʉ̂n rʉ̌ʉ-yang", fr: "Ça va ? Tu vas mieux ?" },
      { thai: "เป็นยังไงบ้าง ดีขึ้นบ้างไหม", rom: "pen yang-ngai bâang dii-khʉ̂n bâang mái", fr: "Comment ça va ? Un peu mieux ?" },
      { thai: "อาการเป็นยังไงบ้าง ดีขึ้นยัง", rom: "aa-kaan pen yang-ngai bâang dii-khʉ̂n yang", fr: "Comment tu te sens ? Ça va mieux ?" },
    ],
    2: [
      { thai: "ยังเจ็บอยู่หรือเปล่า", rom: "yang jèp yùu rʉ̌ʉ-plàao", fr: "Tu as encore mal ?" },
      { thai: "ยังเจ็บไหม", rom: "yang jèp mái", fr: "Ça fait encore mal ?" },
      { thai: "ตอนนี้ยังเจ็บอยู่ไหม", rom: "tɔɔn-níi yang jèp yùu mái", fr: "Tu as encore mal maintenant ?" },
    ],
    4: [
      { thai: "กินข้าวได้หรือเปล่า", rom: "kin khâao dâai rʉ̌ʉ-plàao", fr: "Tu arrives à manger ?" },
      { thai: "ทานข้าวได้ไหม", rom: "thaan khâao dâai mái", fr: "Tu peux manger ?" },
      { thai: "กินข้าวได้บ้างไหม", rom: "kin khâao dâai bâang mái", fr: "Tu arrives à manger un peu ?" },
    ],
    6: [
      { thai: "{I}ซื้อผลไม้มาฝาก", rom: "{i} sʉ́ʉ phǒn-lá-máai maa fàak", fr: "Je t’ai acheté des fruits." },
      { thai: "เอาผลไม้มาฝากนะ", rom: "ao phǒn-lá-máai maa fàak ná", fr: "Je t’ai apporté des fruits." },
      { thai: "นี่ผลไม้ เอามาฝาก", rom: "nîi phǒn-lá-máai ao maa fàak", fr: "Tiens, des fruits pour toi." },
    ],
    8: [
      { thai: "เมื่อไหร่จะได้กลับบ้าน", rom: "mʉ̂a-rài jà dâai klàp bâan", fr: "Quand est-ce que tu rentres chez toi ?" },
      { thai: "กลับบ้านได้เมื่อไหร่", rom: "klàp bâan dâai mʉ̂a-rài", fr: "Quand pourras-tu rentrer ?" },
      { thai: "จะได้ออกจากโรงพยาบาลเมื่อไหร่", rom: "jà dâai ɔ̀ɔk jàak roong-phá-yaa-baan mʉ̂a-rài", fr: "Quand pourras-tu sortir de l’hôpital ?" },
    ],
    10: [
      { thai: "พักผ่อนเยอะๆนะ ขอให้หายเร็วๆ", rom: "phák-phɔ̀n yə́-yə́ ná khɔ̌ɔ hâi hǎai reo-reo", fr: "Repose-toi bien. Je te souhaite de guérir vite." },
      { thai: "หายเร็วๆนะ พักผ่อนเยอะๆ", rom: "hǎai reo-reo ná phák-phɔ̀n yə́-yə́", fr: "Guéris vite, repose-toi bien." },
      { thai: "พักเยอะๆนะ หายไวๆ", rom: "phák yə́-yə́ ná hǎai wai-wai", fr: "Repose-toi bien, guéris vite." },
    ],
  },
  "d:office": {
    0: [
      { thai: "ขอโทษ{P} มีแบบโครงสร้างล่าสุดไหม{Q}", rom: "khɔ̌ɔ-thôot {p} mii bɛ̀ɛp khroong-sâang lâa-sùt mái {q}", fr: "Excusez-moi, avez-vous les derniers plans de structure ?" },
      { thai: "ขอโทษ{P} ขอแบบโครงสร้างล่าสุดหน่อย{P}", rom: "khɔ̌ɔ-thôot {p} khɔ̌ɔ bɛ̀ɛp khroong-sâang lâa-sùt nɔ̀i {p}", fr: "Excusez-moi, je voudrais les derniers plans de structure." },
      { thai: "ขอโทษ{P} มีแบบโครงสร้างฉบับล่าสุดไหม{Q}", rom: "khɔ̌ɔ-thôot {p} mii bɛ̀ɛp khroong-sâang chà-bàp lâa-sùt mái {q}", fr: "Excusez-moi, avez-vous la dernière version des plans de structure ?" },
    ],
    2: [
      { thai: "ขอบคุณ{P} แล้วรายการคำนวณมีหรือยัง{Q}", rom: "khɔ̀ɔp-khun {p} lɛ́ɛo raai-kaan kham-nuan mii rʉ̌ʉ-yang {q}", fr: "Merci. Et la note de calcul, vous l’avez déjà ?" },
      { thai: "ขอบคุณ{P} แล้วรายการคำนวณเสร็จหรือยัง{Q}", rom: "khɔ̀ɔp-khun {p} lɛ́ɛo raai-kaan kham-nuan sèt rʉ̌ʉ-yang {q}", fr: "Merci. Et la note de calcul est-elle terminée ?" },
    ],
    4: [
      { thai: "ได้{P} ไม่รีบเลย", rom: "dâai {p} mâi rîip ləəi", fr: "Oui, ce n’est pas pressé du tout." },
      { thai: "ได้{P} ไม่ต้องรีบ", rom: "dâai {p} mâi tɔ̂ng rîip", fr: "Oui, inutile de vous presser." },
      { thai: "ไม่เป็นไร{P} ไม่รีบ", rom: "mâi pen rai {p} mâi rîip", fr: "Pas de souci, ce n’est pas pressé." },
    ],
    6: [
      { thai: "ช่วยนัดประชุมกับผู้รับเหมาให้หน่อยได้ไหม{Q}", rom: "chûai nát prà-chum kàp phûu-ráp-mǎo hâi nɔ̀i dâai mái {q}", fr: "Pourriez-vous fixer une réunion avec l’entrepreneur ?" },
      { thai: "ฝากนัดประชุมกับผู้รับเหมาหน่อย{P}", rom: "fàak nát prà-chum kàp phûu-ráp-mǎo nɔ̀i {p}", fr: "Je vous laisse fixer une réunion avec l’entrepreneur." },
      { thai: "ช่วยนัดผู้รับเหมามาประชุมให้หน่อย{P}", rom: "chûai nát phûu-ráp-mǎo maa prà-chum hâi nɔ̀i {p}", fr: "Pourriez-vous convoquer l’entrepreneur à une réunion ?" },
    ],
    8: [
      { thai: "ได้เลย{P} ขอบคุณ{P}", rom: "dâai ləəi {p} khɔ̀ɔp-khun {p}", fr: "Parfait, merci." },
      { thai: "ดี{P} ขอบคุณมาก{P}", rom: "dii {p} khɔ̀ɔp-khun mâak {p}", fr: "Bien, merci beaucoup." },
      { thai: "ดีเลย{P} ขอบคุณ{P}", rom: "dii ləəi {p} khɔ̀ɔp-khun {p}", fr: "Très bien, merci." },
    ],
  },
  "d:sim": {
    0: [
      { thai: "สวัสดี{P} ขอซื้อซิมหน่อย{P}", rom: "sà-wàt-dii {p} khɔ̌ɔ sʉ́ʉ sim nɔ̀i {p}", fr: "Bonjour, je voudrais acheter une carte SIM." },
      { thai: "สวัสดี{P} {I}อยากได้ซิมการ์ด{P}", rom: "sà-wàt-dii {p} {i} yàak dâai sim-káat {p}", fr: "Bonjour, je voudrais une carte SIM." },
      { thai: "สวัสดี{P} มีซิมขายไหม{Q}", rom: "sà-wàt-dii {p} mii sim khǎai mái {q}", fr: "Bonjour, vendez-vous des cartes SIM ?" },
    ],
    2: [
      { thai: "สองสัปดาห์{P} มีเน็ตไม่อั้นไหม{Q}", rom: "sɔ̌ɔng sàp-daa {p} mii nét mâi-ân mái {q}", fr: "Deux semaines. Avez-vous de l’Internet illimité ?" },
      { thai: "ใช้สองอาทิตย์{P} มีแพ็กเกจเน็ตไม่อั้นไหม{Q}", rom: "chái sɔ̌ɔng aa-thít {p} mii phɛ́k-kèet nét mâi-ân mái {q}", fr: "Pour deux semaines. Avez-vous un forfait Internet illimité ?" },
      { thai: "สองอาทิตย์{P} มีอินเทอร์เน็ตไม่จำกัดไหม{Q}", rom: "sɔ̌ɔng aa-thít {p} mii in-thəə-nét mâi jam-kàt mái {q}", fr: "Deux semaines. Y a-t-il de l’Internet illimité ?" },
    ],
    4: [
      { thai: "ขออันนี้{P} ช่วยใส่ซิมให้หน่อยได้ไหม{Q}", rom: "khɔ̌ɔ an-níi {p} chûai sài sim hâi nɔ̀i dâai mái {q}", fr: "Celle-ci, s’il vous plaît. Pourriez-vous l’installer ?" },
      { thai: "เอาอันนี้{P} ใส่ซิมให้เลยได้ไหม{Q}", rom: "ao an-níi {p} sài sim hâi ləəi dâai mái {q}", fr: "Je prends celle-ci. Vous pouvez l’installer tout de suite ?" },
    ],
    6: [
      { thai: "นี่{P} เบอร์เท่าไหร่{Q}", rom: "nîi {p} bəə thâo-rài {q}", fr: "Voici. Quel est le numéro ?" },
      { thai: "นี่{P} ได้เบอร์อะไร{Q}", rom: "nîi {p} dâai bəə à-rai {q}", fr: "Voici. J’ai quel numéro ?" },
    ],
  },
  "d:seven": {
    1: [
      { thai: "ไม่มีบัตร{P}", rom: "mâi mii bàt {p}", fr: "Je n’ai pas de carte." },
      { thai: "ไม่ได้เป็นสมาชิก{P}", rom: "mâi dâai pen sà-maa-chík {p}", fr: "Je ne suis pas membre." },
    ],
    3: [
      { thai: "อุ่นให้ด้วย{P}", rom: "ùn hâi dûai {p}", fr: "Réchauffez-le, s’il vous plaît." },
      { thai: "ช่วยอุ่นให้หน่อย{P}", rom: "chûai ùn hâi nɔ̀i {p}", fr: "Pourriez-vous le réchauffer ?" },
    ],
    5: [
      { thai: "ไม่เอา{P}", rom: "mâi ao {p}", fr: "Non, je n’en veux pas." },
      { thai: "ไม่ต้อง{P}", rom: "mâi tɔ̂ng {p}", fr: "Pas besoin." },
      { thai: "ไม่ต้องใส่ถุง{P}", rom: "mâi tɔ̂ng sài thǔng {p}", fr: "Pas besoin de sac." },
    ],
    7: [
      { thai: "สแกนได้ไหม{Q}", rom: "sà-kɛɛn dâai mái {q}", fr: "Je peux scanner ?" },
      { thai: "จ่ายผ่านคิวอาร์ได้ไหม{Q}", rom: "jàai phàan khiu-aa dâai mái {q}", fr: "Puis-je payer par QR code ?" },
      { thai: "มีคิวอาร์ให้สแกนไหม{Q}", rom: "mii khiu-aa hâi sà-kɛɛn mái {q}", fr: "Avez-vous un QR code à scanner ?" },
    ],
  },
  "d:train": {
    0: [
      { thai: "เอาตั๋วไปเชียงใหม่หนึ่งใบ{P}", rom: "ao tǔa pai chiang-mài nʉ̀ng bai {p}", fr: "Un billet pour Chiang Mai, s’il vous plaît." },
      { thai: "ขอตั๋วไปเชียงใหม่ใบนึง{P}", rom: "khɔ̌ɔ tǔa pai chiang-mài bai nʉng {p}", fr: "Un billet pour Chiang Mai, s’il vous plaît." },
      { thai: "ขอซื้อตั๋วไปเชียงใหม่หนึ่งใบ{P}", rom: "khɔ̌ɔ sʉ́ʉ tǔa pai chiang-mài nʉ̀ng bai {p}", fr: "Je voudrais acheter un billet pour Chiang Mai." },
    ],
    2: [
      { thai: "พรุ่งนี้{P} รถไฟออกกี่โมง{Q}", rom: "phrûng-níi {p} rót-fai ɔ̀ɔk kìi moong {q}", fr: "Demain. À quelle heure part le train ?" },
      { thai: "ไปพรุ่งนี้{P} รถไฟออกกี่โมง{Q}", rom: "pai phrûng-níi {p} rót-fai ɔ̀ɔk kìi moong {q}", fr: "Demain. Le train part à quelle heure ?" },
      { thai: "พรุ่งนี้{P} ออกกี่โมง{Q}", rom: "phrûng-níi {p} ɔ̀ɔk kìi moong {q}", fr: "Demain. Il part à quelle heure ?" },
    ],
    4: [
      { thai: "มีตู้นอนหรือเปล่า{Q}", rom: "mii tûu-nɔɔn rʉ̌ʉ-plàao {q}", fr: "Y a-t-il un wagon-lit ?" },
      { thai: "มีรถนอนไหม{Q}", rom: "mii rót-nɔɔn mái {q}", fr: "Y a-t-il des couchettes ?" },
      { thai: "ขอตู้นอนได้ไหม{Q}", rom: "khɔ̌ɔ tûu-nɔɔn dâai mái {q}", fr: "Puis-je avoir le wagon-lit ?" },
    ],
    6: [
      { thai: "เที่ยวเดียว{P} เอาที่นั่งริมหน้าต่าง", rom: "thîao diao {p} ao thîi-nâng rim nâa-tàang", fr: "Aller simple. Je prends une place côté fenêtre." },
      { thai: "เที่ยวเดียว{P} ขอที่นั่งติดหน้าต่าง", rom: "thîao diao {p} khɔ̌ɔ thîi-nâng tìt nâa-tàang", fr: "Aller simple. Une place près de la fenêtre." },
      { thai: "เที่ยวเดียว{P} ขอที่ริมหน้าต่างหน่อย", rom: "thîao diao {p} khɔ̌ɔ thîi rim nâa-tàang nɔ̀i", fr: "Aller simple. Côté fenêtre, s’il vous plaît." },
    ],
  },
  "d:massage": {
    0: [
      { thai: "นวดไทยหนึ่งชั่วโมงราคาเท่าไหร่{Q}", rom: "nûat thai nʉ̀ng chûa-moong raa-khaa thâo-rài {q}", fr: "Quel est le prix d’une heure de massage thaï ?" },
      { thai: "นวดไทยชั่วโมงนึงเท่าไหร่{Q}", rom: "nûat thai chûa-moong nʉng thâo-rài {q}", fr: "Une heure de massage thaï, c’est combien ?" },
      { thai: "นวดไทยชั่วโมงละเท่าไหร่{Q}", rom: "nûat thai chûa-moong lá thâo-rài {q}", fr: "Le massage thaï, c’est combien de l’heure ?" },
    ],
    2: [
      { thai: "{I}ปวดหลังกับไหล่{P}", rom: "{i} pùat lǎng kàp lài {p}", fr: "J’ai mal au dos et aux épaules." },
      { thai: "{I}ปวดหลังแล้วก็ปวดไหล่{P}", rom: "{i} pùat lǎng lɛ́ɛo kɔ̂ɔ pùat lài {p}", fr: "J’ai mal au dos, et aussi aux épaules." },
      { thai: "ปวดหลังปวดไหล่{P}", rom: "pùat lǎng pùat lài {p}", fr: "Mal au dos et aux épaules." },
    ],
    4: [
      { thai: "เจ็บนิดหน่อย ขอเบาๆ หน่อย{P}", rom: "jèp nít-nɔ̀i khɔ̌ɔ bao-bao nɔ̀i {p}", fr: "Un peu. Plus doucement, s’il vous plaît." },
      { thai: "เจ็บนิดหน่อย เบาลงหน่อย{P}", rom: "jèp nít-nɔ̀i bao long nɔ̀i {p}", fr: "Un peu. Un peu moins fort, s’il vous plaît." },
      { thai: "เจ็บนิดหน่อย นวดเบาๆ ได้ไหม{Q}", rom: "jèp nít-nɔ̀i nûat bao-bao dâai mái {q}", fr: "Un peu. Vous pouvez masser plus doucement ?" },
    ],
    6: [
      { thai: "ดีมาก{P} สบายมาก", rom: "dii mâak {p} sà-baai mâak", fr: "Très bien, c’est très agréable." },
      { thai: "กำลังดี{P} สบายมาก", rom: "kam-lang dii {p} sà-baai mâak", fr: "C’est parfait, très agréable." },
      { thai: "ดี{P} สบายจัง", rom: "dii {p} sà-baai jang", fr: "Oui, qu’est-ce que c’est agréable." },
    ],
  },
  "d:scooter": {
    0: [
      { thai: "ขอเช่ามอเตอร์ไซค์{P} วันละเท่าไหร่{Q}", rom: "khɔ̌ɔ châo mɔɔ-təə-sai {p} wan lá thâo-rài {q}", fr: "Je voudrais louer un scooter. C’est combien par jour ?" },
      { thai: "เช่ามอเตอร์ไซค์วันละเท่าไหร่{Q}", rom: "châo mɔɔ-təə-sai wan lá thâo-rài {q}", fr: "Louer un scooter, c’est combien par jour ?" },
      { thai: "{I}อยากเช่ารถมอเตอร์ไซค์{P} ราคาวันละเท่าไหร่{Q}", rom: "{i} yàak châo rót mɔɔ-təə-sai {p} raa-khaa wan lá thâo-rài {q}", fr: "Je voudrais louer un scooter. Quel est le prix par jour ?" },
    ],
    2: [
      { thai: "เอาสามวัน{P} มีหมวกกันน็อกไหม{Q}", rom: "ao sǎam wan {p} mii mùak kan-nɔ́k mái {q}", fr: "Je le prends trois jours. Avez-vous un casque ?" },
      { thai: "สามวัน{P} มีหมวกกันน็อกให้ไหม{Q}", rom: "sǎam wan {p} mii mùak kan-nɔ́k hâi mái {q}", fr: "Trois jours. Vous fournissez un casque ?" },
      { thai: "เช่าสามวัน{P} ได้หมวกกันน็อกด้วยไหม{Q}", rom: "châo sǎam wan {p} dâai mùak kan-nɔ́k dûai mái {q}", fr: "Trois jours. Le casque est-il compris ?" },
    ],
    4: [
      { thai: "นี่{P} ต้องวางมัดจำไหม{Q}", rom: "nîi {p} tɔ̂ng waang mát-jam mái {q}", fr: "Voici. Faut-il laisser une caution ?" },
      { thai: "นี่{P} ต้องจ่ายมัดจำไหม{Q}", rom: "nîi {p} tɔ̂ng jàai mát-jam mái {q}", fr: "Voici. Faut-il payer une caution ?" },
      { thai: "นี่{P} มีค่ามัดจำไหม{Q}", rom: "nîi {p} mii khâa mát-jam mái {q}", fr: "Voici. Y a-t-il une caution ?" },
    ],
    6: [
      { thai: "ต้องเอารถมาคืนกี่โมง{Q}", rom: "tɔ̂ng ao rót maa khʉʉn kìi moong {q}", fr: "À quelle heure faut-il ramener le scooter ?" },
      { thai: "ต้องคืนรถก่อนกี่โมง{Q}", rom: "tɔ̂ng khʉʉn rót kɔ̀ɔn kìi moong {q}", fr: "Il faut le rendre avant quelle heure ?" },
      { thai: "คืนรถได้ถึงกี่โมง{Q}", rom: "khʉʉn rót dâai thʉ̌ng kìi moong {q}", fr: "Jusqu’à quelle heure peut-on rendre le scooter ?" },
    ],
  },
  "d:doctor": {
    1: [
      { thai: "{I}ปวดท้องแล้วก็ท้องเสีย{P}", rom: "{i} pùat-thɔ́ɔng lɛ́ɛo-kɔ̂ɔ thɔ́ɔng-sǐa {p}", fr: "J’ai mal au ventre et aussi la diarrhée." },
      { thai: "ปวดท้องกับท้องเสีย{P}", rom: "pùat-thɔ́ɔng kàp thɔ́ɔng-sǐa {p}", fr: "Mal au ventre et diarrhée." },
      { thai: "{I}ท้องเสียแล้วก็ปวดท้อง{P}", rom: "{i} thɔ́ɔng-sǐa lɛ́ɛo-kɔ̂ɔ pùat-thɔ́ɔng {p}", fr: "J’ai la diarrhée et mal au ventre." },
    ],
    3: [
      { thai: "เป็นตั้งแต่เมื่อคืน{P}", rom: "pen tâng-tɛ̀ɛ mʉ̂a-khʉʉn {p}", fr: "Ça a commencé hier soir." },
      { thai: "ตั้งแต่เมื่อคืนนี้{P}", rom: "tâng-tɛ̀ɛ mʉ̂a-khʉʉn níi {p}", fr: "Depuis hier soir." },
      { thai: "เมื่อคืน{P}", rom: "mʉ̂a-khʉʉn {p}", fr: "Hier soir." },
    ],
    5: [
      { thai: "ไม่แพ้อะไร{P}", rom: "mâi phɛ́ɛ à-rai {p}", fr: "Je ne suis allergique à rien." },
      { thai: "ไม่แพ้ยา{P}", rom: "mâi phɛ́ɛ yaa {p}", fr: "Je ne suis allergique à aucun médicament." },
      { thai: "ไม่มี{P}", rom: "mâi mii {p}", fr: "Non, aucune." },
    ],
    8: [
      { thai: "ขอบคุณมาก{P}คุณหมอ", rom: "khɔ̀ɔp-khun mâak {p} khun mɔ̌ɔ", fr: "Merci beaucoup, docteur." },
      { thai: "ขอบคุณมากนะ{P}คุณหมอ", rom: "khɔ̀ɔp-khun mâak ná {p} khun mɔ̌ɔ", fr: "Merci beaucoup, docteur." },
    ],
  },
  "d:exchange": {
    0: [
      { thai: "ขอแลกเงินหน่อย{P} วันนี้ยูโรละเท่าไหร่{Q}", rom: "khɔ̌ɔ lɛ̂ɛk ngən nɔ̀i {p} wan-níi yuu-roo lá thâo-rài {q}", fr: "Je voudrais changer de l’argent. Combien l’euro aujourd’hui ?" },
      { thai: "{I}อยากแลกเงินยูโร{P} วันนี้เรตเท่าไหร่{Q}", rom: "{i} yàak lɛ̂ɛk ngən yuu-roo {p} wan-níi rêet thâo-rài {q}", fr: "Je voudrais changer des euros. Quel est le taux aujourd’hui ?" },
      { thai: "{I}อยากแลกเงิน{P} ยูโรวันนี้เท่าไหร่{Q}", rom: "{i} yàak lɛ̂ɛk ngən {p} yuu-roo wan-níi thâo-rài {q}", fr: "Je voudrais changer de l’argent. L’euro est à combien aujourd’hui ?" },
    ],
    2: [
      { thai: "ขอแลกสองร้อยยูโร{P}", rom: "khɔ̌ɔ lɛ̂ɛk sɔ̌ɔng-rɔ́ɔi yuu-roo {p}", fr: "Je voudrais changer deux cents euros." },
      { thai: "{I}จะแลกสองร้อยยูโร{P}", rom: "{i} jà lɛ̂ɛk sɔ̌ɔng-rɔ́ɔi yuu-roo {p}", fr: "Je vais changer deux cents euros." },
      { thai: "สองร้อยยูโร{P}", rom: "sɔ̌ɔng-rɔ́ɔi yuu-roo {p}", fr: "Deux cents euros." },
    ],
    4: [
      { thai: "นี่{P} ขอแบงก์ย่อยด้วย{P}", rom: "nîi {p} khɔ̌ɔ bɛ́ng yɔ̂i dûai {p}", fr: "Voici. Des petites coupures aussi, s’il vous plaît." },
      { thai: "นี่{P} ขอแบงก์ย่อยบ้างได้ไหม{Q}", rom: "nîi {p} khɔ̌ɔ bɛ́ng yɔ̂i bâang dâai mái {q}", fr: "Voici. Puis-je avoir quelques petites coupures ?" },
      { thai: "นี่หนังสือเดินทาง{P} ขอแบงก์ย่อยด้วยได้ไหม{Q}", rom: "nîi nǎng-sʉ̌ʉ dəən-thaang {p} khɔ̌ɔ bɛ́ng yɔ̂i dûai dâai mái {q}", fr: "Voici le passeport. Puis-je avoir aussi des petites coupures ?" },
    ],
    6: [
      { thai: "ครบแล้ว{P} ขอบคุณ{P}", rom: "khróp lɛ́ɛo {p} khɔ̀ɔp-khun {p}", fr: "Le compte y est. Merci." },
      { thai: "ครบ{P} ขอบคุณมาก{P}", rom: "khróp {p} khɔ̀ɔp-khun mâak {p}", fr: "C’est complet. Merci beaucoup." },
      { thai: "ถูกต้อง{P} ขอบคุณมาก{P}", rom: "thùuk-tɔ̂ng {p} khɔ̀ɔp-khun mâak {p}", fr: "C’est exact. Merci beaucoup." },
    ],
  },
  "d:lunch": {
    1: [
      { thai: "ไปสิ รอแป๊บนะ งานยังไม่เสร็จเลย", rom: "pai sì rɔɔ pɛ́p ná ngaan yang mâi sèt ləəi", fr: "Oui ! Attends un peu, je n’ai pas encore fini." },
      { thai: "ได้สิ รอแป๊บนึงนะ ยังทำงานไม่เสร็จ", rom: "dâai sì rɔɔ pɛ́p nʉng ná yang tham-ngaan mâi sèt", fr: "Bien sûr. Attends une minute, je n’ai pas fini mon travail." },
      { thai: "ไปๆ รอเดี๋ยวนะ งานยังไม่เสร็จ", rom: "pai pai rɔɔ dǐao ná ngaan yang mâi sèt", fr: "Allez ! Attends un instant, le travail n’est pas fini." },
    ],
    3: [
      { thai: "ไปร้านข้าวมันไก่ไหม อยู่ใกล้ๆ นี่เอง", rom: "pai ráan khâao-man-kài mái yùu klâi-klâi nîi eeng", fr: "On va au resto de riz au poulet ? C’est tout près." },
      { thai: "กินข้าวมันไก่ดีไหม ร้านอยู่ใกล้ๆ นี่เอง", rom: "kin khâao-man-kài dii mái ráan yùu klâi-klâi nîi eeng", fr: "Du riz au poulet, ça te va ? Le resto est tout près." },
      { thai: "ข้าวมันไก่ดีไหม ร้านใกล้ๆ นี่เอง", rom: "khâao-man-kài dii mái ráan klâi-klâi nîi eeng", fr: "Riz au poulet ? Le resto est tout près." },
    ],
    5: [
      { thai: "วันนี้{I}เลี้ยงนะ", rom: "wan-níi {i} líang ná", fr: "Aujourd’hui, je t’invite." },
      { thai: "มื้อนี้{I}เลี้ยงเอง", rom: "mʉ́ʉ níi {i} líang eeng", fr: "Ce repas, c’est moi qui invite." },
      { thai: "วันนี้ให้{I}เลี้ยงนะ", rom: "wan-níi hâi {i} líang ná", fr: "Aujourd’hui, laisse-moi t’inviter." },
    ],
  },
  "d:pour": {
    0: [
      { thai: "วันนี้จะเทคอนกรีตกี่โมง{Q}", rom: "wan-níi jà thee khɔɔn-krìit kìi moong {q}", fr: "À quelle heure va-t-on couler le béton aujourd’hui ?" },
      { thai: "เทคอนกรีตวันนี้กี่โมง{Q}", rom: "thee khɔɔn-krìit wan-níi kìi moong {q}", fr: "Le coulage du béton aujourd’hui, c’est à quelle heure ?" },
      { thai: "วันนี้เทปูนกี่โมง{Q}", rom: "wan-níi thee puun kìi moong {q}", fr: "À quelle heure coule-t-on le béton aujourd’hui ?" },
    ],
    2: [
      { thai: "ตรวจเหล็กเสริมแล้วยัง{Q}", rom: "trùat lèk-sə̌əm lɛ́ɛo yang {q}", fr: "Les armatures sont contrôlées ?" },
      { thai: "เหล็กเสริมตรวจแล้วหรือยัง{Q}", rom: "lèk-sə̌əm trùat lɛ́ɛo rʉ̌ʉ yang {q}", fr: "Les armatures, elles ont été contrôlées ?" },
      { thai: "เช็กเหล็กเสริมแล้วหรือยัง{Q}", rom: "chék lèk-sə̌əm lɛ́ɛo rʉ̌ʉ yang {q}", fr: "A-t-on vérifié les armatures ?" },
    ],
    4: [
      { thai: "อย่าลืมเก็บตัวอย่างปูนนะ{Q}", rom: "yàa lʉʉm kèp tua-yàang puun ná {q}", fr: "N’oubliez pas de prélever des échantillons de béton." },
      { thai: "ช่วยเก็บตัวอย่างคอนกรีตด้วยนะ{Q}", rom: "chûai kèp tua-yàang khɔɔn-krìit dûai ná {q}", fr: "Pensez à prélever des échantillons de béton." },
    ],
    6: [
      { thai: "ดี{P} แล้วอย่าลืมบ่มคอนกรีตเจ็ดวันด้วย", rom: "dii {p} lɛ́ɛo yàa lʉʉm bòm khɔɔn-krìit jèt wan dûai", fr: "Bien. Et n’oubliez pas la cure du béton de sept jours." },
      { thai: "ดี{P} แล้วต้องบ่มปูนเจ็ดวันด้วยนะ", rom: "dii {p} lɛ́ɛo tɔ̂ng bòm puun jèt wan dûai ná", fr: "Bien. Et il faut aussi faire la cure du béton sept jours." },
      { thai: "โอเค{P} แล้วต้องบ่มคอนกรีตเจ็ดวันด้วย", rom: "oo-khee {p} lɛ́ɛo tɔ̂ng bòm khɔɔn-krìit jèt wan dûai", fr: "OK. Et il faut aussi une cure du béton de sept jours." },
    ],
  },
  "d:phone": {
    1: [
      { thai: "สวัสดี{P} ขอพูดกับคุณสมชายหน่อย{P}", rom: "sà-wàt-dii {p} khɔ̌ɔ phûut kàp khun sǒm-chaai nɔ̀i {p}", fr: "Bonjour. Je voudrais parler à Khun Somchai." },
      { thai: "สวัสดี{P} คุณสมชายอยู่ไหม{Q}", rom: "sà-wàt-dii {p} khun sǒm-chaai yùu mái {q}", fr: "Bonjour. Khun Somchai est-il là ?" },
      { thai: "สวัสดี{P} ขอสายคุณสมชายได้ไหม{Q}", rom: "sà-wàt-dii {p} khɔ̌ɔ sǎai khun sǒm-chaai dâai mái {q}", fr: "Bonjour. Puis-je parler à Khun Somchai ?" },
    ],
    5: [
      { thai: "ขอฝากข้อความได้ไหม{Q}", rom: "khɔ̌ɔ fàak khɔ̂ɔ-khwaam dâai mái {q}", fr: "Puis-je laisser un message ?" },
      { thai: "ฝากข้อความไว้ได้ไหม{Q}", rom: "fàak khɔ̂ɔ-khwaam wái dâai mái {q}", fr: "Puis-je lui laisser un message ?" },
      { thai: "{I}ขอฝากข้อความหน่อยได้ไหม{Q}", rom: "{i} khɔ̌ɔ fàak khɔ̂ɔ-khwaam nɔ̀i dâai mái {q}", fr: "Pourrais-je laisser un message ?" },
    ],
    7: [
      { thai: "ช่วยบอกเขาให้โทรกลับหา{I}ด้วย{P} ขอบคุณ{P}", rom: "chûai bɔ̀ɔk khǎo hâi thoo klàp hǎa {i} dûai {p} khɔ̀ɔp-khun {p}", fr: "Dites-lui de me rappeler, s’il vous plaît. Merci." },
      { thai: "ฝากบอกให้โทรกลับด้วย{P} ขอบคุณ{P}", rom: "fàak bɔ̀ɔk hâi thoo klàp dûai {p} khɔ̀ɔp-khun {p}", fr: "Dites-lui de rappeler, s’il vous plaît. Merci." },
      { thai: "รบกวนบอกเขาให้โทรกลับด้วย{P} ขอบคุณมาก{P}", rom: "róp-kuan bɔ̀ɔk khǎo hâi thoo klàp dûai {p} khɔ̀ɔp-khun mâak {p}", fr: "Pourriez-vous lui dire de rappeler ? Merci beaucoup." },
    ],
  },
  "d:chat": {
    1: [
      { thai: "มาทำงาน{P} แล้วก็มาหาเพื่อนด้วย", rom: "maa tham-ngaan {p} lɛ́ɛo-kɔ̂ɔ maa hǎa phʉ̂an dûai", fr: "Pour le travail, et aussi pour voir un ami." },
      { thai: "{I}มาทำงาน{P} แล้วก็มาเยี่ยมเพื่อนด้วย", rom: "{i} maa tham-ngaan {p} lɛ́ɛo-kɔ̂ɔ maa yîam phʉ̂an dûai", fr: "Je suis là pour le travail, et aussi pour voir un ami." },
      { thai: "มาทำงาน{P} แล้วก็แวะเยี่ยมเพื่อนด้วย", rom: "maa tham-ngaan {p} lɛ́ɛo-kɔ̂ɔ wɛ́ yîam phʉ̂an dûai", fr: "Pour le travail, et j’en profite pour passer voir un ami." },
    ],
    3: [
      { thai: "อยู่สองอาทิตย์{P}", rom: "yùu sɔ̌ɔng aa-thít {p}", fr: "Je reste deux semaines." },
      { thai: "สองสัปดาห์{P}", rom: "sɔ̌ɔng sàp-daa {p}", fr: "Deux semaines." },
      { thai: "ไม่นาน{P} แค่สองอาทิตย์", rom: "mâi naan {p} khɛ̂ɛ sɔ̌ɔng aa-thít", fr: "Pas longtemps, juste deux semaines." },
    ],
    5: [
      { thai: "ขอบคุณ{P} ยังเรียนอยู่{P}", rom: "khɔ̀ɔp-khun {p} yang rian yùu {p}", fr: "Merci. J’apprends encore." },
      { thai: "ขอบคุณ{P} กำลังเรียนภาษาไทยอยู่{P}", rom: "khɔ̀ɔp-khun {p} kam-lang rian phaa-sǎa thai yùu {p}", fr: "Merci. J’apprends le thaï en ce moment." },
      { thai: "ขอบคุณ{P} {I}กำลังหัดพูดอยู่{P}", rom: "khɔ̀ɔp-khun {p} {i} kam-lang hàt phûut yùu {p}", fr: "Merci. Je m’entraîne à parler." },
    ],
    7: [
      { thai: "ชอบมาก{P} แต่กินเผ็ดไม่เก่ง", rom: "chɔ̂ɔp mâak {p} tɛ̀ɛ kin phèt mâi kèng", fr: "Beaucoup. Mais je ne supporte pas bien le piment." },
      { thai: "ชอบมาก{P} แต่{I}กินเผ็ดไม่ค่อยได้", rom: "chɔ̂ɔp mâak {p} tɛ̀ɛ {i} kin phèt mâi khɔ̂i dâai", fr: "J’aime beaucoup. Mais je supporte mal le piment." },
    ],
  },
  "d:fruits": {
    0: [
      { thai: "มะม่วงสุกหรือยัง{Q}", rom: "má-mûang sùk rʉ̌ʉ yang {q}", fr: "Les mangues sont-elles déjà mûres ?" },
      { thai: "มะม่วงนี่สุกไหม{Q}", rom: "má-mûang nîi sùk mái {q}", fr: "Ces mangues sont-elles mûres ?" },
    ],
    2: [
      { thai: "อร่อยมาก กิโลละเท่าไหร่{Q}", rom: "à-rɔ̀i mâak kì-loo lá thâo-rài {q}", fr: "Très bon. Combien le kilo ?" },
      { thai: "อร่อยจริงๆ ขายกิโลละเท่าไหร่{Q}", rom: "à-rɔ̀i jing-jing khǎai kì-loo lá thâo-rài {q}", fr: "Vraiment délicieux. Vous les vendez combien le kilo ?" },
      { thai: "หวานอร่อยจริงๆ กิโลเท่าไหร่{Q}", rom: "wǎan à-rɔ̀i jing-jing kì-loo thâo-rài {q}", fr: "Vraiment sucré et bon. Combien le kilo ?" },
    ],
    4: [
      { thai: "ขอสองกิโล{P} แล้วก็เงาะอีกครึ่งกิโล", rom: "khɔ̌ɔ sɔ̌ɔng kì-loo {p} lɛ́ɛo-kɔ̂ɔ ngɔ́ ìik khrʉ̂ng kì-loo", fr: "Deux kilos, s’il vous plaît, et aussi un demi-kilo de ramboutans." },
      { thai: "เอามะม่วงสองกิโล{P} แล้วก็เอาเงาะครึ่งกิโลด้วย", rom: "ao má-mûang sɔ̌ɔng kì-loo {p} lɛ́ɛo-kɔ̂ɔ ao ngɔ́ khrʉ̂ng kì-loo dûai", fr: "Je prends deux kilos de mangues, et un demi-kilo de ramboutans aussi." },
      { thai: "เอาสองกิโล{P} เงาะอีกครึ่งกิโลด้วย", rom: "ao sɔ̌ɔng kì-loo {p} ngɔ́ ìik khrʉ̂ng kì-loo dûai", fr: "Deux kilos, et un demi-kilo de ramboutans en plus." },
    ],
    6: [
      { thai: "ขอถุงด้วย{P}", rom: "khɔ̌ɔ thǔng dûai {p}", fr: "Un sac aussi, s’il vous plaît." },
      { thai: "ขอถุงใส่หน่อย{P}", rom: "khɔ̌ɔ thǔng sài nɔ̀i {p}", fr: "Un sac pour les mettre, s’il vous plaît." },
      { thai: "มีถุงไหม{Q}", rom: "mii thǔng mái {q}", fr: "Vous avez un sac ?" },
    ],
  },
  "d:temple": {
    1: [
      { thai: "โอเค{P} แล้วต้องแต่งตัวยังไง{Q}", rom: "oo-khee {p} lɛ́ɛo tɔ̂ng tɛ̀ng-tua yang-ngai {q}", fr: "OK. Et comment faut-il s’habiller ?" },
      { thai: "ได้{P} แล้วต้องแต่งตัวแบบไหน{Q}", rom: "dâai {p} lɛ́ɛo tɔ̂ng tɛ̀ng-tua bɛ̀ɛp nǎi {q}", fr: "D’accord. Et quelle tenue faut-il porter ?" },
      { thai: "เข้าใจแล้ว{P} แล้วต้องใส่อะไร{Q}", rom: "khâo-jai lɛ́ɛo {p} lɛ́ɛo tɔ̂ng sài à-rai {q}", fr: "Compris. Et qu’est-ce qu’il faut porter ?" },
    ],
    3: [
      { thai: "ข้างในถ่ายรูปได้ไหม{Q}", rom: "khâang-nai thàai-rûup dâai mái {q}", fr: "À l’intérieur, on peut prendre des photos ?" },
      { thai: "ถ่ายรูปในโบสถ์ได้ไหม{Q}", rom: "thàai-rûup nai bòot dâai mái {q}", fr: "Peut-on prendre des photos dans la chapelle ?" },
      { thai: "ขอถ่ายรูปข้างในได้ไหม{Q}", rom: "khɔ̌ɔ thàai-rûup khâang-nai dâai mái {q}", fr: "Puis-je prendre des photos à l’intérieur ?" },
    ],
    5: [
      { thai: "เข้าใจแล้ว{P} คนไทยมาทำบุญที่วัดบ่อยไหม{Q}", rom: "khâo-jai lɛ́ɛo {p} khon thai maa tham-bun thîi wát bɔ̀i mái {q}", fr: "Compris. Les Thaïlandais viennent-ils souvent faire des mérites au temple ?" },
      { thai: "โอเค{P} คนไทยมาทำบุญบ่อยหรือเปล่า{Q}", rom: "oo-khee {p} khon thai maa tham-bun bɔ̀i rʉ̌ʉ-plào {q}", fr: "OK. Les Thaïlandais viennent-ils souvent faire des mérites ?" },
      { thai: "เข้าใจแล้ว{P} คนไทยเข้าวัดทำบุญบ่อยไหม{Q}", rom: "khâo-jai lɛ́ɛo {p} khon thai khâo wát tham-bun bɔ̀i mái {q}", fr: "Compris. Les Thaïlandais vont-ils souvent au temple faire des mérites ?" },
    ],
    7: [
      { thai: "สวยมาก{P} ขอบคุณที่พามานะ", rom: "sǔai mâak {p} khɔ̀ɔp-khun thîi phaa maa ná", fr: "C’est magnifique. Merci de m’avoir amené." },
      { thai: "สวยจริงๆ{P} ขอบคุณที่พามา", rom: "sǔai jing-jing {p} khɔ̀ɔp-khun thîi phaa maa", fr: "C’est vraiment beau. Merci de m’avoir amené." },
      { thai: "สวยมาก{P} ขอบคุณมากที่พา{I}มา", rom: "sǔai mâak {p} khɔ̀ɔp-khun mâak thîi phaa {i} maa", fr: "Magnifique. Merci beaucoup de m’avoir amené ici." },
    ],
  },
  "d:hobby": {
    1: [
      { thai: "{I}ชอบว่ายน้ำกับอ่านหนังสือ{P}", rom: "{i} chɔ̂ɔp wâai-náam kàp àan nǎng-sʉ̌ʉ {p}", fr: "J’aime nager et lire." },
      { thai: "ชอบว่ายน้ำแล้วก็อ่านหนังสือ{P}", rom: "chɔ̂ɔp wâai-náam lɛ́ɛo-kɔ̂ɔ àan nǎng-sʉ̌ʉ {p}", fr: "J’aime nager, et aussi lire." },
      { thai: "{I}ชอบอ่านหนังสือกับว่ายน้ำ{P}", rom: "{i} chɔ̂ɔp àan nǎng-sʉ̌ʉ kàp wâai-náam {p}", fr: "J’aime lire et nager." },
    ],
    3: [
      { thai: "ว่ายอาทิตย์ละสองครั้ง{P} แล้วคุณล่ะ{Q}", rom: "wâai aa-thít lá sɔ̌ɔng khráng {p} lɛ́ɛo khun lâ {q}", fr: "Je nage deux fois par semaine. Et vous ?" },
      { thai: "สัปดาห์ละสองครั้ง{P} แล้วคุณล่ะ{Q}", rom: "sàp-daa lá sɔ̌ɔng khráng {p} lɛ́ɛo khun lâ {q}", fr: "Deux fois par semaine. Et vous ?" },
      { thai: "อาทิตย์ละสองครั้ง{P} คุณล่ะ ชอบทำอะไร{Q}", rom: "aa-thít lá sɔ̌ɔng khráng {p} khun lâ chɔ̂ɔp tham à-rai {q}", fr: "Deux fois par semaine. Et vous, qu’aimez-vous faire ?" },
    ],
    5: [
      { thai: "สนุกไหม{Q} {I}อยากลองเล่นบ้าง", rom: "sà-nùk mái {q} {i} yàak lɔɔng lên bâang", fr: "C’est amusant ? J’aimerais essayer de jouer aussi." },
      { thai: "สนุกไหม{Q} {I}ก็อยากลองดูบ้าง", rom: "sà-nùk mái {q} {i} kɔ̂ɔ yàak lɔɔng duu bâang", fr: "C’est amusant ? Moi aussi j’aimerais essayer." },
      { thai: "สนุกหรือเปล่า{Q} อยากลองดูจัง", rom: "sà-nùk rʉ̌ʉ-plào {q} yàak lɔɔng duu jang", fr: "C’est amusant ? J’ai bien envie d’essayer." },
    ],
    7: [
      { thai: "ได้เลย{P} เจอกันเสาร์นี้", rom: "dâai ləəi {p} jəə kan sǎo níi", fr: "Avec plaisir, à samedi." },
      { thai: "ตกลง{P} แล้วเจอกันวันเสาร์นี้นะ", rom: "tòk-long {p} lɛ́ɛo jəə kan wan-sǎo níi ná", fr: "D’accord, alors à ce samedi." },
      { thai: "โอเค{P} เสาร์นี้เจอกัน", rom: "oo-khee {p} sǎo níi jəə kan", fr: "OK, on se voit samedi." },
    ],
  },
  "d:weekend": {
    1: [
      { thai: "จะไปเที่ยวทะเลที่หัวหิน{P}", rom: "jà pai thîao thá-lee thîi hǔa-hǐn {p}", fr: "Je vais à la mer, à Hua Hin." },
      { thai: "{I}จะไปหัวหิน{P} ไปทะเล", rom: "{i} jà pai hǔa-hǐn {p} pai thá-lee", fr: "Je vais à Hua Hin, à la mer." },
      { thai: "ไปทะเลที่หัวหิน{P}", rom: "pai thá-lee thîi hǔa-hǐn {p}", fr: "À la mer, à Hua Hin." },
    ],
    3: [
      { thai: "ไปกับเพื่อนสองคน{P} จะไปดูพระอาทิตย์ตกที่หาด", rom: "pai kàp phʉ̂an sɔ̌ɔng khon {p} jà pai duu phrá-aa-thít tòk thîi hàat", fr: "Avec deux amis. On va voir le coucher de soleil à la plage." },
      { thai: "กับเพื่อนสองคน{P} ว่าจะไปดูพระอาทิตย์ตกที่ชายหาด", rom: "kàp phʉ̂an sɔ̌ɔng khon {p} wâa jà pai duu phrá-aa-thít tòk thîi chaai-hàat", fr: "Avec deux amis. On compte regarder le coucher de soleil sur la plage." },
      { thai: "ไปกับเพื่อนอีกสองคน{P} จะไปนั่งดูพระอาทิตย์ตกที่ชายหาด", rom: "pai kàp phʉ̂an ìik sɔ̌ɔng khon {p} jà pai nâng duu phrá-aa-thít tòk thîi chaai-hàat", fr: "Avec deux autres amis. On va s’asseoir sur la plage pour voir le coucher de soleil." },
    ],
    5: [
      { thai: "ขอบคุณ{P} แล้วคุณมีแผนอะไรไหม{Q}", rom: "khɔ̀ɔp-khun {p} lɛ́ɛo khun mii phɛ̌ɛn à-rai mái {q}", fr: "Merci. Et toi, tu as des projets ?" },
      { thai: "ขอบคุณ{P} แล้วคุณล่ะ{Q} เสาร์อาทิตย์นี้ทำอะไร", rom: "khɔ̀ɔp-khun {p} lɛ́ɛo khun lâ {q} sǎo-aa-thít níi tham à-rai", fr: "Merci. Et toi, tu fais quoi ce week-end ?" },
      { thai: "ขอบคุณที่เตือน{P} แล้วคุณล่ะ{Q} มีแผนอะไรไหม", rom: "khɔ̀ɔp-khun thîi tʉan {p} lɛ́ɛo khun lâ {q} mii phɛ̌ɛn à-rai mái", fr: "Merci du rappel. Et toi, tu as des projets ?" },
    ],
    7: [
      { thai: "ขอให้สนุกนะ{P} แล้วเจอกันวันจันทร์", rom: "khɔ̌ɔ hâi sà-nùk ná {p} lɛ́ɛo jəə kan wan-jan", fr: "Amuse-toi bien. On se voit lundi." },
      { thai: "ขอให้มีความสุขนะ{P} เจอกันวันจันทร์", rom: "khɔ̌ɔ hâi mii khwaam-sùk ná {p} jəə kan wan-jan", fr: "Passe un bon moment. À lundi." },
      { thai: "พักผ่อนให้สบายนะ{P} เจอกันวันจันทร์", rom: "phák-phɔ̀n hâi sà-baai ná {p} jəə kan wan-jan", fr: "Repose-toi bien. À lundi." },
    ],
  },
  "ld:a1-cafe": {
    1: [
      { thai: "เอากาแฟเย็นหนึ่งแก้ว กับชาเขียวร้อนหนึ่งแก้ว{P}", rom: "ao kaa-fɛɛ yen nʉ̀ng kɛ̂ɛo kàp chaa-khǐao rɔ́ɔn nʉ̀ng kɛ̂ɛo {p}", fr: "Je prends un café glacé et un thé vert chaud." },
      { thai: "กาแฟเย็นแก้วนึง ชาเขียวร้อนแก้วนึง{P}", rom: "kaa-fɛɛ yen kɛ̂ɛo nʉng chaa-khǐao rɔ́ɔn kɛ̂ɛo nʉng {p}", fr: "Un café glacé, un thé vert chaud." },
      { thai: "ขอกาแฟเย็นกับชาเขียวร้อนอย่างละแก้ว{P}", rom: "khɔ̌ɔ kaa-fɛɛ yen kàp chaa-khǐao rɔ́ɔn yàang lá kɛ̂ɛo {p}", fr: "Un café glacé et un thé vert chaud, un de chaque." },
    ],
    3: [
      { thai: "ใส่นิดเดียว{P} ไม่เอาหวานมาก", rom: "sài nít diao {p} mâi ao wǎan mâak", fr: "Juste un peu, pas trop sucré." },
      { thai: "ใส่น้ำตาลนิดหน่อย{P}", rom: "sài náam-taan nít-nɔ̀i {p}", fr: "Un petit peu de sucre." },
      { thai: "หวานน้อย{P}", rom: "wǎan nɔ́ɔi {p}", fr: "Peu sucré." },
    ],
    5: [
      { thai: "ขอน้ำแข็งน้อย{P}", rom: "khɔ̌ɔ náam-khɛ̌ng nɔ́ɔi {p}", fr: "Peu de glace, s’il vous plaît." },
      { thai: "ใส่น้ำแข็งน้อยๆ{P}", rom: "sài náam-khɛ̌ng nɔ́ɔi-nɔ́ɔi {p}", fr: "Mettez peu de glace." },
      { thai: "ไม่เยอะ{P}", rom: "mâi yə́ {p}", fr: "Pas beaucoup." },
    ],
    7: [
      { thai: "เอาแก้วเล็ก{P} มีเค้กอะไรบ้าง{Q}", rom: "ao kɛ̂ɛo lék {p} mii khéek à-rai bâang {q}", fr: "Une petite. Vous avez quels gâteaux ?" },
      { thai: "ขอแก้วเล็ก{P} แล้วมีเค้กอะไรบ้าง{Q}", rom: "khɔ̌ɔ kɛ̂ɛo lék {p} lɛ́ɛo mii khéek à-rai bâang {q}", fr: "Une petite, s’il vous plaît. Et quels gâteaux avez-vous ?" },
    ],
    9: [
      { thai: "ขอเค้กมะพร้าวหนึ่งชิ้น{P}", rom: "khɔ̌ɔ khéek má-phráao nʉ̀ng chín {p}", fr: "Une part de gâteau à la noix de coco, s’il vous plaît." },
      { thai: "เค้กมะพร้าวชิ้นนึง{P}", rom: "khéek má-phráao chín nʉng {p}", fr: "Une part de gâteau à la noix de coco." },
    ],
    11: [
      { thai: "งั้นขอเค้กกล้วยหอมแทน{P}", rom: "ngán khɔ̌ɔ khéek klûai-hɔ̌ɔm thɛɛn {p}", fr: "Alors le gâteau à la banane à la place, s’il vous plaît." },
      { thai: "ไม่เป็นไร{P} เอาเค้กกล้วยหอมก็ได้", rom: "mâi pen rai {p} ao khéek klûai-hɔ̌ɔm kɔ̂ɔ dâai", fr: "Pas grave, je prendrai le gâteau à la banane." },
      { thai: "งั้นเค้กกล้วยหอมแทนก็ได้{P}", rom: "ngán khéek klûai-hɔ̌ɔm thɛɛn kɔ̂ɔ dâai {p}", fr: "Alors le gâteau à la banane, ça ira." },
    ],
    13: [
      { thai: "นี่ห้าร้อยบาท{P}", rom: "nîi hâa-rɔ́ɔi bàat {p}", fr: "Voici cinq cents bahts." },
      { thai: "ห้าร้อย{P}", rom: "hâa-rɔ́ɔi {p}", fr: "Cinq cents." },
    ],
    15: [
      { thai: "ขอบคุณมาก{P}", rom: "khɔ̀ɔp-khun mâak {p}", fr: "Merci beaucoup." },
    ],
  },
  "ld:a1-taxi-hotel": {
    0: [
      { thai: "สวัสดี{P} ไปโรงแรมบ้านสวนไหม{Q}", rom: "sà-wàt-dii {p} pai rong-rɛɛm bâan-sǔan mái {q}", fr: "Bonjour, vous allez à l’hôtel Baan Suan ?" },
      { thai: "สวัสดี{P} ช่วยไปส่งที่โรงแรมบ้านสวนหน่อยได้ไหม{Q}", rom: "sà-wàt-dii {p} chûai pai sòng thîi rong-rɛɛm bâan-sǔan nɔ̀i dâai mái {q}", fr: "Bonjour, vous pouvez me déposer à l’hôtel Baan Suan ?" },
      { thai: "สวัสดี{P} {I}จะไปโรงแรมบ้านสวน{P}", rom: "sà-wàt-dii {p} {i} jà pai rong-rɛɛm bâan-sǔan {p}", fr: "Bonjour, je vais à l’hôtel Baan Suan." },
    ],
    2: [
      { thai: "สุขุมวิท ซอยยี่สิบสาม{P}", rom: "sù-khǔm-wít sɔɔi yîi-sìp-sǎam {p}", fr: "Sukhumvit, soi 23." },
      { thai: "อยู่ที่สุขุมวิท ซอยยี่สิบสาม{P}", rom: "yùu thîi sù-khǔm-wít sɔɔi yîi-sìp-sǎam {p}", fr: "C’est à Sukhumvit, soi 23." },
      { thai: "ถนนสุขุมวิท ซอยยี่สิบสาม{P}", rom: "thà-nǒn sù-khǔm-wít sɔɔi yîi-sìp-sǎam {p}", fr: "Rue Sukhumvit, soi 23." },
    ],
    4: [
      { thai: "ไม่ใช่สามสิบสาม{P} ซอยยี่สิบสาม", rom: "mâi châi sǎam-sìp-sǎam {p} sɔɔi yîi-sìp-sǎam", fr: "Pas trente-trois, le soi 23." },
      { thai: "ไม่ใช่{P} ซอยยี่สิบสาม{P}", rom: "mâi châi {p} sɔɔi yîi-sìp-sǎam {p}", fr: "Non, le soi 23." },
    ],
    6: [
      { thai: "ช่วยเปิดมิเตอร์ด้วย{P}", rom: "chûai pə̀ət mí-tə̂ə dûai {p}", fr: "Mettez le compteur, s’il vous plaît." },
      { thai: "เปิดมิเตอร์หน่อยนะ{P}", rom: "pə̀ət mí-tə̂ə nɔ̀i ná {p}", fr: "Allumez le compteur, s’il vous plaît." },
      { thai: "ไปตามมิเตอร์นะ{P}", rom: "pai taam mí-tə̂ə ná {p}", fr: "On y va au compteur, d’accord ?" },
    ],
    8: [
      { thai: "ประมาณกี่นาที{Q}", rom: "prà-maan kìi naa-thii {q}", fr: "Environ combien de minutes ?" },
      { thai: "ไปโรงแรมใช้เวลาประมาณกี่นาที{Q}", rom: "pai rong-rɛɛm chái wee-laa prà-maan kìi naa-thii {q}", fr: "Jusqu’à l’hôtel, ça prend environ combien de minutes ?" },
      { thai: "ประมาณกี่นาทีถึง{Q}", rom: "prà-maan kìi naa-thii thʉ̌ng {q}", fr: "On arrive dans combien de minutes environ ?" },
    ],
    10: [
      { thai: "ไม่เป็นไร{P} {I}ไม่ได้รีบ", rom: "mâi pen rai {p} {i} mâi dâai rîip", fr: "Pas grave, je ne suis pas pressé(e)." },
      { thai: "ไม่เป็นไร{P} ไม่ต้องรีบ", rom: "mâi pen rai {p} mâi tɔ̂ng rîip", fr: "Pas grave, pas besoin de se presser." },
    ],
    12: [
      { thai: "ทั้งหมดเท่าไหร่{Q}", rom: "tháng-mòt thâo-rài {q}", fr: "Ça fait combien en tout ?" },
      { thai: "กี่บาท{Q}", rom: "kìi bàat {q}", fr: "Combien de bahts ?" },
    ],
    14: [
      { thai: "สองร้อยห้าสิบ{P} ไม่ต้องทอน{P}", rom: "sɔ̌ɔng-rɔ́ɔi-hâa-sìp {p} mâi tɔ̂ng thɔɔn {p}", fr: "Deux cent cinquante, gardez la monnaie." },
      { thai: "นี่{P} สองร้อยห้าสิบ เงินทอนเก็บไว้เลย{P}", rom: "nîi {p} sɔ̌ɔng-rɔ́ɔi-hâa-sìp ngən-thɔɔn kèp wái ləəi {p}", fr: "Tenez, deux cent cinquante, gardez la monnaie." },
      { thai: "สองร้อยห้าสิบบาท{P} ไม่ต้องทอนนะ{P}", rom: "sɔ̌ɔng-rɔ́ɔi-hâa-sìp bàat {p} mâi tɔ̂ng thɔɔn ná {p}", fr: "Deux cent cinquante bahts, pas besoin de rendre la monnaie." },
    ],
  },
  "ld:a1-voisine": {
    1: [
      { thai: "ใช่{P} {I}ย้ายมาเมื่อวานนี้เอง", rom: "châi {p} {i} yáai maa mʉ̂a-waan-níi eeng", fr: "Oui, j’ai emménagé pas plus tard qu’hier." },
      { thai: "ใช่{P} เพิ่งมาอยู่เมื่อวาน{P}", rom: "châi {p} phə̂ng maa yùu mʉ̂a-waan {p}", fr: "Oui, je suis arrivé(e) hier." },
    ],
    3: [
      { thai: "{I}เป็นคนฝรั่งเศส{P}", rom: "{i} pen khon fà-ràng-sèet {p}", fr: "Je suis français(e)." },
      { thai: "ฝรั่งเศส{P}", rom: "fà-ràng-sèet {p}", fr: "La France." },
      { thai: "ประเทศฝรั่งเศส{P}", rom: "prà-thêet fà-ràng-sèet {p}", fr: "De France (le pays)." },
    ],
    5: [
      { thai: "อยู่มาสองปีแล้ว{P} ก่อนนี้อยู่เชียงใหม่", rom: "yùu maa sɔ̌ɔng pii lɛ́ɛo {p} kɔ̀ɔn níi yùu chiang-mài", fr: "Ça fait deux ans. Avant, j’étais à Chiang Mai." },
      { thai: "สองปีแล้ว{P} เมื่อก่อน{I}อยู่ที่เชียงใหม่", rom: "sɔ̌ɔng pii lɛ́ɛo {p} mʉ̂a-kɔ̀ɔn {i} yùu thîi chiang-mài", fr: "Deux ans. Avant, je vivais à Chiang Mai." },
    ],
    7: [
      { thai: "{I}สอนภาษาฝรั่งเศส{P}", rom: "{i} sɔ̌ɔn phaa-sǎa fà-ràng-sèet {p}", fr: "J’enseigne le français." },
      { thai: "{I}เป็นครูภาษาฝรั่งเศส{P}", rom: "{i} pen khruu phaa-sǎa fà-ràng-sèet {p}", fr: "Je suis prof de français." },
    ],
    9: [
      { thai: "คุณอยู่ชั้นที่เท่าไหร่{Q}", rom: "khun yùu chán thîi thâo-rài {q}", fr: "Vous habitez au combientième étage ?" },
      { thai: "ห้องคุณอยู่ชั้นไหน{Q}", rom: "hɔ̂ng khun yùu chán nǎi {q}", fr: "Votre appartement est à quel étage ?" },
      { thai: "คุณพักอยู่ชั้นไหน{Q}", rom: "khun phák yùu chán nǎi {q}", fr: "Vous logez à quel étage ?" },
    ],
    11: [
      { thai: "{I}อยู่ห้องหกศูนย์สอง ชั้นหก{P}", rom: "{i} yùu hɔ̂ng hòk-sǔun-sɔ̌ɔng chán hòk {p}", fr: "Je suis au 602, au sixième." },
      { thai: "ชั้นหก{P} ห้องหกศูนย์สอง", rom: "chán hòk {p} hɔ̂ng hòk-sǔun-sɔ̌ɔng", fr: "Au sixième, appartement 602." },
    ],
    13: [
      { thai: "จริงเหรอ{Q} ถ้าเสียงดัง บอกได้เลยนะ{P}", rom: "jing rə̌ə {q} thâa sǐang dang bɔ̀ɔk dâai ləəi ná {p}", fr: "Vraiment ? S’il y a du bruit, n’hésitez pas à le dire." },
      { thai: "จริงเหรอ{Q} ถ้า{I}ทำเสียงดัง ก็บอก{I}นะ{P}", rom: "jing rə̌ə {q} thâa {i} tham sǐang dang kɔ̂ɔ bɔ̀ɔk {i} ná {p}", fr: "C’est vrai ? Si je fais du bruit, dites-le-moi." },
      { thai: "จริงเหรอ{Q} ถ้าดังเกินไป บอก{I}ได้เลย{P}", rom: "jing rə̌ə {q} thâa dang kəən pai bɔ̀ɔk {i} dâai ləəi {p}", fr: "Vraiment ? Si c’est trop bruyant, dites-le-moi." },
    ],
    15: [
      { thai: "ขอบคุณ{P} ยินดีที่ได้รู้จักนะ{P}", rom: "khɔ̀ɔp-khun {p} yin-dii thîi dâai rúu-jàk ná {p}", fr: "Merci, ravi(e) de vous connaître." },
      { thai: "ขอบคุณมาก{P} ดีใจที่ได้รู้จัก{P}", rom: "khɔ̀ɔp-khun mâak {p} dii-jai thîi dâai rúu-jàk {p}", fr: "Merci beaucoup, content(e) de vous connaître." },
    ],
  },
  "ld:a1-marche-fruits": {
    0: [
      { thai: "มังคุดโลละเท่าไหร่{Q}", rom: "mang-khút loo lá thâo-rài {q}", fr: "Combien le kilo de mangoustans ?" },
      { thai: "มังคุดขายยังไง{Q}", rom: "mang-khút khǎai yang-ngai {q}", fr: "Vous vendez les mangoustans à combien ?" },
    ],
    2: [
      { thai: "ขอชิมหน่อยได้ไหม{Q}", rom: "khɔ̌ɔ chim nɔ̀i dâai mái {q}", fr: "Je peux goûter un peu ?" },
      { thai: "ลองชิมได้ไหม{Q}", rom: "lɔɔng chim dâai mái {q}", fr: "Je peux essayer d’en goûter un ?" },
      { thai: "ขอชิมหน่อย{P}", rom: "khɔ̌ɔ chim nɔ̀i {p}", fr: "Laissez-moi goûter, s’il vous plaît." },
    ],
    4: [
      { thai: "อร่อย{P} แล้วส้มเท่าไหร่{Q}", rom: "à-rɔ̀i {p} lɛ́ɛo sôm thâo-rài {q}", fr: "C’est bon. Et les oranges, combien ?" },
      { thai: "อร่อยจัง{P} ส้มล่ะ{Q}", rom: "à-rɔ̀i jang {p} sôm lâ {q}", fr: "Délicieux ! Et les oranges ?" },
      { thai: "อร่อยมาก{P} แล้วส้มกิโลละเท่าไหร่{Q}", rom: "à-rɔ̀i mâak {p} lɛ́ɛo sôm kì-loo lá thâo-rài {q}", fr: "Très bon. Et les oranges, c’est combien le kilo ?" },
    ],
    6: [
      { thai: "ซื้อมังคุดสามกิโล ลดได้ไหม{Q}", rom: "sʉ́ʉ mang-khút sǎam kì-loo lót dâai mái {q}", fr: "J’achète trois kilos de mangoustans, vous baissez le prix ?" },
      { thai: "ถ้าเอามังคุดสามกิโล ลดให้หน่อยได้ไหม{Q}", rom: "thâa ao mang-khút sǎam kì-loo lót hâi nɔ̀i dâai mái {q}", fr: "Si je prends trois kilos de mangoustans, vous me faites une réduction ?" },
      { thai: "มังคุดสามกิโล ลดราคาหน่อยได้ไหม{Q}", rom: "mang-khút sǎam kì-loo lót raa-khaa nɔ̀i dâai mái {q}", fr: "Trois kilos de mangoustans, vous pouvez baisser un peu le prix ?" },
    ],
    8: [
      { thai: "ลดเหลือร้อยสี่สิบได้ไหม{Q}", rom: "lót lʉ̌a rɔ́ɔi-sìi-sìp dâai mái {q}", fr: "Vous pouvez descendre à cent quarante ?" },
      { thai: "ขอร้อยสี่สิบได้ไหม{Q}", rom: "khɔ̌ɔ rɔ́ɔi-sìi-sìp dâai mái {q}", fr: "Vous me le faites à cent quarante ?" },
      { thai: "ร้อยสี่สิบไม่ได้เหรอ{Q}", rom: "rɔ́ɔi-sìi-sìp mâi dâai rə̌ə {q}", fr: "Cent quarante, ce n’est pas possible ?" },
    ],
    10: [
      { thai: "สามกิโลเยอะไป เอาสองกิโลได้ไหม{Q}", rom: "sǎam kì-loo yə́ pai ao sɔ̌ɔng kì-loo dâai mái {q}", fr: "Trois kilos, c’est trop. Je peux en prendre deux ?" },
      { thai: "อืม สามกิโลเยอะไปหน่อย เอาแค่สองกิโลได้ไหม{Q}", rom: "ʉʉm sǎam kì-loo yə́ pai nɔ̀i ao khɛ̂ɛ sɔ̌ɔng kì-loo dâai mái {q}", fr: "Hmm, trois kilos, c’est un peu trop. Juste deux kilos, c’est possible ?" },
      { thai: "สามกิโลเยอะเกินไป เอาแค่สองกิโลพอ{P}", rom: "sǎam kì-loo yə́ kəən pai ao khɛ̂ɛ sɔ̌ɔng kì-loo phɔɔ {p}", fr: "Trois kilos, c’est trop, deux kilos suffiront." },
    ],
    12: [
      { thai: "งั้นเอาสามกิโลก็ได้{P} ร้อยห้าสิบ", rom: "ngán ao sǎam kì-loo kɔ̂ɔ dâai {p} rɔ́ɔi-hâa-sìp", fr: "Alors je prends les trois kilos, à cent cinquante." },
      { thai: "งั้นสามกิโลร้อยห้าสิบดีกว่า{P}", rom: "ngán sǎam kì-loo rɔ́ɔi-hâa-sìp dii-kwàa {p}", fr: "Alors plutôt trois kilos à cent cinquante." },
      { thai: "โอเค{P} เอาสามกิโล ร้อยห้าสิบ", rom: "oo-khee {p} ao sǎam kì-loo rɔ́ɔi-hâa-sìp", fr: "D’accord, trois kilos à cent cinquante." },
    ],
    14: [
      { thai: "นี่{P} สองร้อยบาท", rom: "nîi {p} sɔ̌ɔng-rɔ́ɔi bàat", fr: "Tenez, deux cents bahts." },
    ],
  },
  "ld:a1-metro": {
    0: [
      { thai: "ขอโทษ{P} สถานีเอ็มอาร์ทีสีลมอยู่ตรงไหน{Q}", rom: "khɔ̌ɔ-thôot {p} sà-thǎa-nii em-aa-thii sǐi-lom yùu trong-nǎi {q}", fr: "Excusez-moi, où se trouve la station MRT Silom ?" },
      { thai: "ขอโทษ{P} ไปสถานีรถไฟใต้ดินสีลมยังไง{Q}", rom: "khɔ̌ɔ-thôot {p} pai sà-thǎa-nii rót-fai tâi-din sǐi-lom yang-ngai {q}", fr: "Excusez-moi, comment aller à la station de métro Silom ?" },
      { thai: "ขอโทษ{P} รถไฟใต้ดินสถานีสีลมไปทางไหน{Q}", rom: "khɔ̌ɔ-thôot {p} rót-fai tâi-din sà-thǎa-nii sǐi-lom pai thaang nǎi {q}", fr: "Excusez-moi, la station de métro Silom, c’est par où ?" },
    ],
    2: [
      { thai: "ใช่แล้ว{P}", rom: "châi lɛ́ɛo {p}", fr: "Oui, c’est ça." },
    ],
    4: [
      { thai: "เลี้ยวซ้ายที่ไฟแดง แล้วต่อไปล่ะ{Q}", rom: "líao sáai thîi fai-dɛɛng lɛ́ɛo tɔ̀ɔ pai lâ {q}", fr: "À gauche au feu rouge, et après ?" },
      { thai: "ไฟแดงเลี้ยวซ้าย แล้วยังไงต่อ{Q}", rom: "fai-dɛɛng líao sáai lɛ́ɛo yang-ngai tɔ̀ɔ {q}", fr: "Au feu rouge à gauche, et ensuite ?" },
      { thai: "เลี้ยวซ้ายตรงไฟแดง แล้วไปทางไหนต่อ{Q}", rom: "líao sáai trong fai-dɛɛng lɛ́ɛo pai thaang nǎi tɔ̀ɔ {q}", fr: "Je tourne à gauche au feu, puis je vais par où ?" },
    ],
    6: [
      { thai: "เดินไปใช้เวลากี่นาที{Q}", rom: "dəən pai chái wee-laa kìi naa-thii {q}", fr: "À pied, ça prend combien de minutes ?" },
      { thai: "เดินไปประมาณกี่นาที{Q}", rom: "dəən pai prà-maan kìi naa-thii {q}", fr: "Environ combien de minutes à pied ?" },
    ],
    8: [
      { thai: "นั่งแท็กซี่ดีไหม{Q}", rom: "nâng thɛ́k-sîi dii mái {q}", fr: "C’est mieux de prendre un taxi ?" },
      { thai: "ไปแท็กซี่ดีกว่าไหม{Q}", rom: "pai thɛ́k-sîi dii kwàa mái {q}", fr: "Il vaut mieux y aller en taxi ?" },
      { thai: "เรียกแท็กซี่ดีไหม{Q}", rom: "rîak thɛ́k-sîi dii mái {q}", fr: "Je devrais appeler un taxi ?" },
    ],
    11: [
      { thai: "เลี้ยวซ้ายที่ไฟแดงที่สอง แล้วสถานีอยู่ทางขวา ใช่ไหม{Q}", rom: "líao sáai thîi fai-dɛɛng thîi sɔ̌ɔng lɛ́ɛo sà-thǎa-nii yùu thaang khwǎa châi mái {q}", fr: "À gauche au deuxième feu, et la station est à droite, c’est ça ?" },
      { thai: "ไฟแดงที่สองเลี้ยวซ้าย สถานีอยู่ขวามือ ใช่ไหม{Q}", rom: "fai-dɛɛng thîi sɔ̌ɔng líao sáai sà-thǎa-nii yùu khwǎa-mʉʉ châi mái {q}", fr: "Deuxième feu à gauche, la station sur la droite, c’est bien ça ?" },
      { thai: "ต้องเลี้ยวซ้ายที่ไฟแดงที่สอง แล้วสถานีอยู่ทางขวา ถูกไหม{Q}", rom: "tɔ̂ng líao sáai thîi fai-dɛɛng thîi sɔ̌ɔng lɛ́ɛo sà-thǎa-nii yùu thaang khwǎa thùuk mái {q}", fr: "Il faut tourner à gauche au deuxième feu, et la station est à droite, correct ?" },
    ],
    13: [
      { thai: "ขอบคุณมากเลย{P}", rom: "khɔ̀ɔp-khun mâak ləəi {p}", fr: "Merci vraiment beaucoup." },
      { thai: "ขอบคุณ{P}", rom: "khɔ̀ɔp-khun {p}", fr: "Merci." },
    ],
  },
  "ld:a1-pharmacie": {
    1: [
      { thai: "ปวดหัว แล้วก็มีไข้ด้วย{P}", rom: "pùat hǔa lɛ́ɛo-kɔ̂ɔ mii khâi dûai {p}", fr: "J’ai mal à la tête, et de la fièvre aussi." },
      { thai: "{I}มีไข้ แล้วก็ปวดหัว{P}", rom: "{i} mii khâi lɛ́ɛo-kɔ̂ɔ pùat hǔa {p}", fr: "J’ai de la fièvre et mal à la tête." },
      { thai: "{I}ปวดหัว ตัวร้อนมีไข้{P}", rom: "{i} pùat hǔa tua rɔ́ɔn mii khâi {p}", fr: "J’ai mal à la tête, je suis brûlant(e) de fièvre." },
    ],
    3: [
      { thai: "ตั้งแต่เมื่อวานเย็น{P}", rom: "tâng-tɛ̀ɛ mʉ̂a-waan yen {p}", fr: "Depuis hier soir." },
      { thai: "เป็นมาตั้งแต่เมื่อวานเย็น{P}", rom: "pen maa tâng-tɛ̀ɛ mʉ̂a-waan yen {p}", fr: "Ça dure depuis hier soir." },
      { thai: "เมื่อวานตอนเย็น{P}", rom: "mʉ̂a-waan tɔɔn-yen {p}", fr: "Hier soir." },
    ],
    5: [
      { thai: "เมื่อคืนสามสิบแปดจุดห้า{P}", rom: "mʉ̂a-khʉʉn sǎam-sìp-pɛ̀ɛt jùt hâa {p}", fr: "Cette nuit, 38,5." },
      { thai: "เมื่อคืนไข้สามสิบแปดจุดห้าองศา{P}", rom: "mʉ̂a-khʉʉn khâi sǎam-sìp-pɛ̀ɛt jùt hâa ong-sǎa {p}", fr: "Cette nuit, j’avais 38,5 degrés de fièvre." },
      { thai: "สูง{P} เมื่อคืนสามสิบแปดจุดห้าองศา", rom: "sǔung {p} mʉ̂a-khʉʉn sǎam-sìp-pɛ̀ɛt jùt hâa ong-sǎa", fr: "Oui, forte : cette nuit, 38,5 degrés." },
    ],
    7: [
      { thai: "ไม่ได้ไอ แต่เจ็บคอนิดหน่อย{P}", rom: "mâi dâai ai tɛ̀ɛ jèp khɔɔ nít-nɔ̀i {p}", fr: "Je ne tousse pas, mais j’ai un peu mal à la gorge." },
      { thai: "ไม่ไอ{P} แต่เจ็บคอนิดๆ", rom: "mâi ai {p} tɛ̀ɛ jèp khɔɔ nít-nít", fr: "Pas de toux, mais la gorge un peu irritée." },
      { thai: "เจ็บคอนิดหน่อย แต่ไม่ไอ{P}", rom: "jèp khɔɔ nít-nɔ̀i tɛ̀ɛ mâi ai {p}", fr: "Un peu mal à la gorge, mais je ne tousse pas." },
    ],
    9: [
      { thai: "ครั้งละสองเม็ด วันละสามครั้ง{P}", rom: "khráng lá sɔ̌ɔng mét wan lá sǎam khráng {p}", fr: "Deux comprimés à la fois, trois fois par jour." },
      { thai: "วันละสามครั้ง ครั้งละสองเม็ด ใช่ไหม{Q}", rom: "wan lá sǎam khráng khráng lá sɔ̌ɔng mét châi mái {q}", fr: "Trois fois par jour, deux comprimés à chaque fois, c’est ça ?" },
      { thai: "สองเม็ด วันละสามครั้ง{P}", rom: "sɔ̌ɔng mét wan lá sǎam khráng {p}", fr: "Deux comprimés, trois fois par jour." },
    ],
    11: [
      { thai: "มียาอมแก้เจ็บคอด้วยไหม{Q}", rom: "mii yaa-om kɛ̂ɛ jèp khɔɔ dûai mái {q}", fr: "Vous avez aussi des pastilles pour la gorge ?" },
      { thai: "มียาอมแก้เจ็บคอขายไหม{Q}", rom: "mii yaa-om kɛ̂ɛ jèp khɔɔ khǎai mái {q}", fr: "Vous vendez des pastilles pour la gorge ?" },
      { thai: "ยาอมแก้เจ็บคอมีไหม{Q}", rom: "yaa-om kɛ̂ɛ jèp khɔɔ mii mái {q}", fr: "Des pastilles pour la gorge, vous en avez ?" },
    ],
    13: [
      { thai: "ขอยาพาราสองแผง กับยาอมหนึ่งกล่อง{P}", rom: "khɔ̌ɔ yaa phaa-raa sɔ̌ɔng phɛ̌ɛng kàp yaa-om nʉ̀ng klɔ̀ng {p}", fr: "Deux plaquettes de paracétamol et une boîte de pastilles, s’il vous plaît." },
      { thai: "ยาพาราสองแผง ยาอมกล่องนึง{P}", rom: "yaa phaa-raa sɔ̌ɔng phɛ̌ɛng yaa-om klɔ̀ng nʉng {p}", fr: "Deux plaquettes de paracétamol, une boîte de pastilles." },
      { thai: "เอายาอมหนึ่งกล่อง แล้วก็ยาพาราสองแผง{P}", rom: "ao yaa-om nʉ̀ng klɔ̀ng lɛ́ɛo-kɔ̂ɔ yaa phaa-raa sɔ̌ɔng phɛ̌ɛng {p}", fr: "Je prends une boîte de pastilles et deux plaquettes de paracétamol." },
    ],
    15: [
      { thai: "ได้{P} นี่เงิน{P}", rom: "dâai {p} nîi ngən {p}", fr: "D’accord, voici l’argent." },
      { thai: "โอเค{P} นี่{P}", rom: "oo-khee {p} nîi {p}", fr: "OK, tenez." },
      { thai: "ร้อยยี่สิบ{P} นี่{P}", rom: "rɔ́ɔi-yîi-sìp {p} nîi {p}", fr: "Cent vingt, tenez." },
    ],
  },
  "ld:a1-reservation": {
    1: [
      { thai: "สวัสดี{P} ขอจองโต๊ะหน่อย{P}", rom: "sà-wàt-dii {p} khɔ̌ɔ jɔɔng tó nɔ̀i {p}", fr: "Bonjour, je voudrais réserver une table, s’il vous plaît." },
      { thai: "สวัสดี{P} จะจองโต๊ะ{P}", rom: "sà-wàt-dii {p} jà jɔɔng tó {p}", fr: "Bonjour, c’est pour réserver une table." },
      { thai: "สวัสดี{P} จองโต๊ะได้ไหม{Q}", rom: "sà-wàt-dii {p} jɔɔng tó dâai mái {q}", fr: "Bonjour, je peux réserver une table ?" },
    ],
    3: [
      { thai: "เสาร์นี้{P}", rom: "sǎo níi {p}", fr: "Ce samedi." },
      { thai: "จองวันเสาร์นี้{P}", rom: "jɔɔng wan-sǎo níi {p}", fr: "Pour ce samedi." },
    ],
    5: [
      { thai: "ทุ่มนึง{P}", rom: "thûm nʉng {p}", fr: "À 19 heures." },
      { thai: "ตอนหนึ่งทุ่ม{P}", rom: "tɔɔn nʉ̀ng thûm {p}", fr: "À 19 heures." },
      { thai: "เจ็ดโมงเย็น{P}", rom: "jèt moong yen {p}", fr: "À 7 heures du soir." },
    ],
    7: [
      { thai: "ทั้งหมดสี่คน{P}", rom: "tháng-mòt sìi khon {p}", fr: "Quatre personnes en tout." },
      { thai: "มากันสี่คน{P}", rom: "maa kan sìi khon {p}", fr: "Nous venons à quatre." },
      { thai: "สี่ที่{P}", rom: "sìi thîi {p}", fr: "Quatre couverts." },
    ],
    9: [
      { thai: "งั้นสองทุ่ม{P}", rom: "ngán sɔ̌ɔng thûm {p}", fr: "Alors 20 heures." },
      { thai: "งั้นขอสองทุ่ม{P}", rom: "ngán khɔ̌ɔ sɔ̌ɔng thûm {p}", fr: "Alors 20 heures, s’il vous plaît." },
      { thai: "งั้นสองทุ่มก็ได้{P}", rom: "ngán sɔ̌ɔng thûm kɔ̂ɔ dâai {p}", fr: "Alors 20 heures, ça ira." },
    ],
    11: [
      { thai: "{I}ชื่อแซม{P}", rom: "{i} chʉ̂ʉ sɛɛm {p}", fr: "Je m’appelle Sam." },
      { thai: "แซม{P}", rom: "sɛɛm {p}", fr: "Sam." },
    ],
    13: [
      { thai: "ขอโทษ{P} เปลี่ยนเป็นห้าคนได้ไหม{Q}", rom: "khɔ̌ɔ-thôot {p} plìan pen hâa khon dâai mái {q}", fr: "Pardon, on peut passer à cinq personnes ?" },
      { thai: "ขอโทษ{P} ขอเพิ่มเป็นห้าคนได้ไหม{Q}", rom: "khɔ̌ɔ-thôot {p} khɔ̌ɔ phə̂əm pen hâa khon dâai mái {q}", fr: "Pardon, je peux passer à cinq personnes ?" },
      { thai: "ขอโทษ{P} ขอแก้เป็นห้าคนได้ไหม{Q}", rom: "khɔ̌ɔ-thôot {p} khɔ̌ɔ kɛ̂ɛ pen hâa khon dâai mái {q}", fr: "Pardon, je peux corriger pour cinq personnes ?" },
    ],
    15: [
      { thai: "เบอร์ศูนย์แปดเก้า หนึ่งสองสาม สี่ห้าหกเจ็ด{P}", rom: "bəə sǔun pɛ̀ɛt kâao nʉ̀ng sɔ̌ɔng sǎam sìi hâa hòk jèt {p}", fr: "Le numéro, c’est zéro huit neuf, un deux trois, quatre cinq six sept." },
    ],
    17: [
      { thai: "ขอบคุณมาก{P}", rom: "khɔ̀ɔp-khun mâak {p}", fr: "Merci beaucoup." },
    ],
  },
  "ld:a2-hua-hin": {
    1: [
      { thai: "ดีเลย จะไปยังไงดี นั่งรถไฟหรือรถบัส", rom: "dii ləəi jà pai yang-ngai dii nâng rót-fai rʉ̌ʉ rót-bát", fr: "Super ! On y va comment ? On prend le train ou le bus ?" },
      { thai: "ไปสิ ไปรถไฟหรือรถบัสดี", rom: "pai sì pai rót-fai rʉ̌ʉ rót-bát dii", fr: "Allons-y ! Plutôt en train ou en bus ?" },
      { thai: "ดีเลย แล้วไปรถไฟหรือรถบัสดี", rom: "dii ləəi lɛ́ɛo pai rót-fai rʉ̌ʉ rót-bát dii", fr: "Génial. Et on y va en train ou en bus ?" },
    ],
    3: [
      { thai: "ตั้งสี่ชั่วโมงเลยเหรอ แล้วรถบัสล่ะ", rom: "tâng sìi chûa-moong ləəi rə̌ə lɛ́ɛo rót-bát lâ", fr: "Quatre heures entières ? Et le bus ?" },
      { thai: "สี่ชั่วโมงนานจัง ถ้าไปรถบัสล่ะ", rom: "sìi chûa-moong naan jang thâa pai rót-bát lâ", fr: "Quatre heures, c’est long ! Et si on prend le bus ?" },
      { thai: "สี่ชั่วโมงเลยเหรอ รถบัสใช้เวลาเท่าไหร่", rom: "sìi chûa-moong ləəi rə̌ə rót-bát chái wee-laa thâo-rài", fr: "Quatre heures ? Et le bus, ça prend combien de temps ?" },
    ],
    5: [
      { thai: "งั้นไปรถไฟดีกว่า ถูกกว่า วิวก็สวย รถไฟออกกี่โมง", rom: "ngán pai rót-fai dii kwàa thùuk kwàa wiu kɔ̂ɔ sǔai rót-fai ɔ̀ɔk kìi moong", fr: "Alors plutôt le train : moins cher, et la vue est belle. Il part à quelle heure ?" },
      { thai: "งั้นเอารถไฟ ถูกกว่าแล้ววิวสวยด้วย ออกกี่โมง", rom: "ngán ao rót-fai thùuk kwàa lɛ́ɛo wiu sǔai dûai ɔ̀ɔk kìi moong", fr: "Alors on prend le train, c’est moins cher et la vue est belle. Il part quand ?" },
      { thai: "งั้นนั่งรถไฟกันเถอะ ถูกกว่าแถมวิวสวย รถไฟออกกี่โมง", rom: "ngán nâng rót-fai kan thə̀ thùuk kwàa thɛ̌ɛm wiu sǔai rót-fai ɔ̀ɔk kìi moong", fr: "Alors prenons le train, moins cher et en plus belle vue. Il part à quelle heure ?" },
    ],
    7: [
      { thai: "โอเค แล้วเรื่องที่พักล่ะ นอนที่ไหนดี", rom: "oo-khee lɛ́ɛo rʉ̂ang thîi-phák lâ nɔɔn thîi-nǎi dii", fr: "OK. Et côté logement ? On dort où ?" },
      { thai: "ได้ แล้วจะพักที่ไหนดี", rom: "dâai lɛ́ɛo jà phák thîi-nǎi dii", fr: "D’accord. Et on loge où ?" },
      { thai: "โอเค แล้วเราจะนอนที่ไหนกัน", rom: "oo-khee lɛ́ɛo rao jà nɔɔn thîi-nǎi kan", fr: "OK, et on va dormir où ?" },
    ],
    9: [
      { thai: "หารสองก็คนละหกร้อย ไม่แพงเลย", rom: "hǎan sɔ̌ɔng kɔ̂ɔ khon lá hòk-rɔ́ɔi mâi phɛɛng ləəi", fr: "Divisé par deux, ça fait six cents chacun, pas cher du tout." },
      { thai: "ถ้าแชร์กันก็คนละหกร้อย ถูกดีนะ", rom: "thâa chɛɛ kan kɔ̂ɔ khon lá hòk-rɔ́ɔi thùuk dii ná", fr: "Si on partage, six cents chacun, c’est bon marché." },
      { thai: "ตกคนละหกร้อยเอง ไม่แพงเลย", rom: "tòk khon lá hòk-rɔ́ɔi eeng mâi phɛɛng ləəi", fr: "Ça revient à six cents chacun seulement, pas cher du tout." },
    ],
    11: [
      { thai: "แล้วรวมทั้งหมดต้องใช้คนละเท่าไหร่", rom: "lɛ́ɛo ruam tháng-mòt tɔ̂ng chái khon lá thâo-rài", fr: "Et en tout, il faut combien par personne ?" },
      { thai: "ทั้งหมดต้องเตรียมเงินคนละเท่าไหร่", rom: "tháng-mòt tɔ̂ng triam ngən khon lá thâo-rài", fr: "Au total, il faut prévoir combien chacun ?" },
      { thai: "แล้วรวมๆ แล้วตกคนละเท่าไหร่", rom: "lɛ́ɛo ruam-ruam lɛ́ɛo tòk khon lá thâo-rài", fr: "Et en gros, ça revient à combien chacun ?" },
    ],
    13: [
      { thai: "โอเค เดี๋ยว{I}จองตั๋วรถไฟเอง", rom: "oo-khee dǐao {i} jɔɔng tǔa rót-fai eeng", fr: "OK, je me charge de réserver les billets de train." },
      { thai: "ได้ เดี๋ยวจองตั๋วรถไฟให้", rom: "dâai dǐao jɔɔng tǔa rót-fai hâi", fr: "D’accord, je réserve les billets de train." },
      { thai: "โอเค ตั๋วรถไฟเดี๋ยว{I}จัดการให้นะ", rom: "oo-khee tǔa rót-fai dǐao {i} jàt-kaan hâi ná", fr: "OK, les billets de train, je m’en occupe." },
    ],
    14: [
      { thai: "แย่แล้ว รอบเก้าโมงเต็มแล้ว เหลือแค่รอบบ่ายสอง", rom: "yɛ̂ɛ lɛ́ɛo rɔ̂ɔp kâao moong tem lɛ́ɛo lʉ̌a khɛ̂ɛ rɔ̂ɔp bàai sɔ̌ɔng", fr: "Zut, le train de 9 heures est complet, il ne reste que celui de 14 heures." },
      { thai: "เอ๊ะ ตั๋วรถไฟเก้าโมงหมดแล้วอ่ะ มีแต่รอบบ่ายสองโมง", rom: "é tǔa rót-fai kâao moong mòt lɛ́ɛo à mii tɛ̀ɛ rɔ̂ɔp bàai sɔ̌ɔng moong", fr: "Oh, il n’y a plus de billets pour 9 heures, seulement pour 14 heures." },
      { thai: "แย่แล้ว รถไฟเก้าโมงไม่มีตั๋วแล้ว เหลือรอบบ่ายสองโมงอย่างเดียว", rom: "yɛ̂ɛ lɛ́ɛo rót-fai kâao moong mâi mii tǔa lɛ́ɛo lʉ̌a rɔ̂ɔp bàai sɔ̌ɔng moong yàang diao", fr: "Aïe, plus de billets pour le train de 9 heures, il ne reste que celui de 14 heures." },
    ],
    16: [
      { thai: "งั้นไปรถบัสแทนไหม แพงกว่านิดหน่อย แต่เร็วกว่า", rom: "ngán pai rót-bát thɛɛn mái phɛɛng kwàa nít-nɔ̀i tɛ̀ɛ reo kwàa", fr: "Alors on prend le bus à la place ? Un peu plus cher, mais plus rapide." },
      { thai: "งั้นเปลี่ยนเป็นรถบัสดีไหม แพงขึ้นนิดหน่อย แต่ถึงเร็วกว่า", rom: "ngán plìan pen rót-bát dii mái phɛɛng khʉ̂n nít-nɔ̀i tɛ̀ɛ thʉ̌ng reo kwàa", fr: "Et si on passait au bus ? Un peu plus cher, mais on arrive plus vite." },
      { thai: "งั้นเอารถบัสแทนดีไหม แพงกว่านิดนึง แต่เร็วกว่านะ", rom: "ngán ao rót-bát thɛɛn dii mái phɛɛng kwàa nít-nʉng tɛ̀ɛ reo kwàa ná", fr: "Alors le bus à la place ? Un poil plus cher, mais plus rapide." },
    ],
    18: [
      { thai: "เจ็ดโมงเช้าเลยเหรอ เช้าจัง แต่ก็ได้", rom: "jèt moong cháao ləəi rə̌ə cháao jang tɛ̀ɛ kɔ̂ɔ dâai", fr: "7 heures du matin ? C’est tôt… mais ça marche." },
      { thai: "เจ็ดโมงเช้าเหรอ เช้าไปหน่อย แต่ก็โอเคนะ", rom: "jèt moong cháao rə̌ə cháao pai nɔ̀i tɛ̀ɛ kɔ̂ɔ oo-khee ná", fr: "7 heures ? Un peu tôt, mais d’accord." },
      { thai: "เจ็ดโมงเช้า เช้ามากเลยนะ แต่ได้ ไม่เป็นไร", rom: "jèt moong cháao cháao mâak ləəi ná tɛ̀ɛ dâai mâi pen rai", fr: "7 heures du matin, c’est très tôt, mais bon, pas de souci." },
    ],
    20: [
      { thai: "ดีเลย เดี๋ยว{I}เช็กให้ เจอกันที่ขนส่งหกโมงครึ่งนะ", rom: "dii ləəi dǐao {i} chék hâi jəə kan thîi khǒn-sòng hòk moong khrʉ̂ng ná", fr: "Bonne idée, je vérifie. Rendez-vous à la gare routière à 6 h 30." },
      { thai: "ไอเดียดี เดี๋ยวดูตั๋วให้ งั้นเจอกันที่สถานีขนส่งหกโมงครึ่ง", rom: "ai-dia dii dǐao duu tǔa hâi ngán jəə kan thîi sà-thǎa-nii khǒn-sòng hòk moong khrʉ̂ng", fr: "Bonne idée, je regarde les billets. On se voit à la gare routière à 6 h 30." },
      { thai: "โอเค เดี๋ยว{I}ดูให้นะ นัดกันที่สถานีขนส่งตอนหกโมงครึ่ง", rom: "oo-khee dǐao {i} duu hâi ná nát kan thîi sà-thǎa-nii khǒn-sòng tɔɔn hòk moong khrʉ̂ng", fr: "OK, je regarde. Rendez-vous à la gare routière à 6 h 30." },
    ],
  },
  "ld:a2-medecin": {
    1: [
      { thai: "เจ็บคอ ไอ แล้วก็มีไข้นิดหน่อย{P}", rom: "jèp khɔɔ ai lɛ́ɛo-kɔ̂ɔ mii khâi nít-nɔ̀i {p}", fr: "Mal à la gorge, de la toux et un peu de fièvre." },
      { thai: "{I}ไอแล้วก็เจ็บคอ{P} มีไข้นิดหน่อยด้วย", rom: "{i} ai lɛ́ɛo-kɔ̂ɔ jèp khɔɔ {p} mii khâi nít-nɔ̀i dûai", fr: "Je tousse et j’ai mal à la gorge, avec un peu de fièvre." },
      { thai: "{I}เจ็บคอกับไอ{P} แล้วก็มีไข้อ่อนๆ ด้วย", rom: "{i} jèp khɔɔ kàp ai {p} lɛ́ɛo-kɔ̂ɔ mii khâi ɔ̀ɔn-ɔ̀ɔn dûai", fr: "J’ai mal à la gorge et je tousse, et aussi une petite fièvre." },
    ],
    3: [
      { thai: "เป็นมาสามวันแล้ว{P} ตั้งแต่วันจันทร์", rom: "pen maa sǎam wan lɛ́ɛo {p} tâng-tɛ̀ɛ wan-jan", fr: "Ça dure depuis trois jours, depuis lundi." },
      { thai: "สามวัน{P} เริ่มเป็นวันจันทร์", rom: "sǎam wan {p} rə̂əm pen wan-jan", fr: "Trois jours. Ça a commencé lundi." },
      { thai: "ตั้งแต่วันจันทร์{P} สามวันแล้ว", rom: "tâng-tɛ̀ɛ wan-jan {p} sǎam wan lɛ́ɛo", fr: "Depuis lundi, ça fait trois jours." },
    ],
    5: [
      { thai: "ไม่ค่อยปวดหัว{P} แต่ไอทั้งคืน เลยนอนไม่ค่อยหลับ", rom: "mâi khɔ̂i pùat hǔa {p} tɛ̀ɛ ai tháng khʉʉn ləəi nɔɔn mâi khɔ̂i làp", fr: "Pas trop mal à la tête, mais je tousse toute la nuit, donc je dors mal." },
      { thai: "ไม่ค่อยปวด{P} แต่ไอทั้งคืนจนนอนไม่ค่อยหลับ", rom: "mâi khɔ̂i pùat {p} tɛ̀ɛ ai tháng khʉʉn jon nɔɔn mâi khɔ̂i làp", fr: "Pas vraiment, mais je tousse toute la nuit au point de mal dormir." },
      { thai: "ไม่ค่อย{P} แต่นอนไม่หลับเพราะไอทั้งคืน", rom: "mâi khɔ̂i {p} tɛ̀ɛ nɔɔn mâi làp phrɔ́ ai tháng khʉʉn", fr: "Pas trop, mais je n’arrive pas à dormir parce que je tousse toute la nuit." },
    ],
    7: [
      { thai: "{I}แพ้ยาเพนิซิลลิน{P}", rom: "{i} phɛ́ɛ yaa phee-ní-sin-lin {p}", fr: "Je suis allergique à la pénicilline." },
      { thai: "แพ้{P} แพ้เพนิซิลลิน", rom: "phɛ́ɛ {p} phɛ́ɛ phee-ní-sin-lin", fr: "Oui, à la pénicilline." },
    ],
    9: [
      { thai: "อย่างนี้ใช่ไหม{Q}", rom: "yàang-níi châi mái {q}", fr: "Comme ceci, c’est ça ?" },
      { thai: "แบบนี้โอเคไหม{Q}", rom: "bɛ̀ɛp níi oo-khee mái {q}", fr: "Comme ça, ça va ?" },
      { thai: "แบบนี้ใช่ไหม{Q}", rom: "bɛ̀ɛp níi châi mái {q}", fr: "Comme ça, c’est bien ?" },
    ],
    11: [
      { thai: "ต้องทานยาฆ่าเชื้อไหม{Q}", rom: "tɔ̂ng thaan yaa khâa chʉ́a mái {q}", fr: "Dois-je prendre un antibiotique ?" },
      { thai: "{I}ต้องกินยาปฏิชีวนะไหม{Q}", rom: "{i} tɔ̂ng kin yaa pà-tì-chii-wá-ná mái {q}", fr: "Est-ce que je dois prendre des antibiotiques ?" },
      { thai: "ต้องกินยาฆ่าเชื้อด้วยไหม{Q}", rom: "tɔ̂ng kin yaa khâa chʉ́a dûai mái {q}", fr: "Faut-il aussi prendre un antibiotique ?" },
    ],
    13: [
      { thai: "ต้องกินยังไง{Q}", rom: "tɔ̂ng kin yang-ngai {q}", fr: "Comment faut-il les prendre ?" },
      { thai: "ทานยังไง{Q}", rom: "thaan yang-ngai {q}", fr: "Comment les prendre ?" },
      { thai: "ยานี้กินยังไง{Q}", rom: "yaa níi kin yang-ngai {q}", fr: "Ces médicaments, je les prends comment ?" },
    ],
    15: [
      { thai: "ต้องลางานไหม{Q}", rom: "tɔ̂ng laa ngaan mái {q}", fr: "Je dois prendre congé ?" },
      { thai: "ควรหยุดงานไหม{Q}", rom: "khuan yùt ngaan mái {q}", fr: "Je devrais m’arrêter de travailler ?" },
      { thai: "ต้องหยุดงานด้วยไหม{Q}", rom: "tɔ̂ng yùt ngaan dûai mái {q}", fr: "Faut-il aussi que j’arrête de travailler ?" },
    ],
    17: [
      { thai: "ขอบคุณ{P} แล้วถ้ายังไม่ดีขึ้นล่ะ{Q}", rom: "khɔ̀ɔp-khun {p} lɛ́ɛo thâa yang mâi dii khʉ̂n lâ {q}", fr: "Merci. Et si ça ne va toujours pas mieux ?" },
      { thai: "ขอบคุณ{P} ถ้าอาการไม่ดีขึ้นควรทำยังไง{Q}", rom: "khɔ̀ɔp-khun {p} thâa aa-kaan mâi dii khʉ̂n khuan tham yang-ngai {q}", fr: "Merci. Si les symptômes ne s’améliorent pas, que dois-je faire ?" },
      { thai: "ขอบคุณ{P} ถ้าไม่หาย{I}ต้องทำยังไง{Q}", rom: "khɔ̀ɔp-khun {p} thâa mâi hǎai {i} tɔ̂ng tham yang-ngai {q}", fr: "Merci. Si je ne guéris pas, je fais quoi ?" },
    ],
    19: [
      { thai: "ได้{P} จ่ายเงินตรงไหน{Q}", rom: "dâai {p} jàai ngən trong-nǎi {q}", fr: "D’accord. Je paie où ?" },
      { thai: "ได้{P} ต้องไปจ่ายเงินที่ไหน{Q}", rom: "dâai {p} tɔ̂ng pai jàai ngən thîi-nǎi {q}", fr: "D’accord. Où dois-je aller payer ?" },
      { thai: "โอเค{P} ชำระเงินที่ไหน{Q}", rom: "oo-khee {p} cham-rá ngən thîi-nǎi {q}", fr: "OK. Où se fait le paiement ?" },
    ],
  },
  "ld:a2-appartement": {
    0: [
      { thai: "สวัสดี{P} {I}ที่โทรมาถามเรื่องห้องเช่า{P}", rom: "sà-wàt-dii {p} {i} thîi thoo maa thǎam rʉ̂ang hɔ̂ng châo {p}", fr: "Bonjour, c’est moi qui ai appelé pour me renseigner sur la location." },
      { thai: "สวัสดี{P} {I}มาดูห้องตามที่โทรนัดไว้{P}", rom: "sà-wàt-dii {p} {i} maa duu hɔ̂ng taam thîi thoo nát wái {p}", fr: "Bonjour, je viens voir l’appartement, comme convenu au téléphone." },
    ],
    2: [
      { thai: "ห้องสวยมาก ค่าเช่าเดือนละเท่าไหร่{Q}", rom: "hɔ̂ng sǔai mâak khâa châo dʉan lá thâo-rài {q}", fr: "Il est très joli. Le loyer est de combien par mois ?" },
      { thai: "ห้องสวยจังเลย เดือนละเท่าไหร่{Q}", rom: "hɔ̂ng sǔai jang ləəi dʉan lá thâo-rài {q}", fr: "Il est vraiment beau ! C’est combien par mois ?" },
      { thai: "สวยจัง ค่าเช่าต่อเดือนเท่าไหร่{Q}", rom: "sǔai jang khâa châo tɔ̀ɔ dʉan thâo-rài {q}", fr: "Très joli. Quel est le loyer mensuel ?" },
    ],
    4: [
      { thai: "รวมค่าน้ำค่าไฟหรือยัง{Q}", rom: "ruam khâa náam khâa fai rʉ̌ʉ yang {q}", fr: "L’eau et l’électricité sont incluses ?" },
      { thai: "ค่าน้ำค่าไฟรวมด้วยไหม{Q}", rom: "khâa náam khâa fai ruam dûai mái {q}", fr: "L’eau et l’électricité, c’est compris ?" },
      { thai: "ราคานี้รวมค่าน้ำค่าไฟไหม{Q}", rom: "raa-khaa níi ruam khâa náam khâa fai mái {q}", fr: "Ce prix comprend l’eau et l’électricité ?" },
    ],
    6: [
      { thai: "แล้วมีอินเทอร์เน็ตไหม{Q}", rom: "lɛ́ɛo mii in-thəə-nét mái {q}", fr: "Et il y a internet ?" },
      { thai: "แล้วเน็ตล่ะ{Q}", rom: "lɛ́ɛo nét lâ {q}", fr: "Et le net ?" },
      { thai: "อินเทอร์เน็ตมีไหม{Q}", rom: "in-thəə-nét mii mái {q}", fr: "Internet, il y en a ?" },
    ],
    8: [
      { thai: "{I}ทำงานที่บ้าน คงต้องติดเน็ตเอง{P} แล้วเงินประกันเท่าไหร่{Q}", rom: "{i} tham-ngaan thîi bâan khong tɔ̂ng tìt nét eeng {p} lɛ́ɛo ngən prà-kan thâo-rài {q}", fr: "Je travaille à la maison, je vais sûrement faire installer internet. Et la caution, c’est combien ?" },
      { thai: "{I}ทำงานอยู่บ้าน น่าจะต้องติดเอง{P} ต้องจ่ายค่ามัดจำเท่าไหร่{Q}", rom: "{i} tham-ngaan yùu bâan nâa-jà tɔ̂ng tìt eeng {p} tɔ̂ng jàai khâa mát-jam thâo-rài {q}", fr: "Je travaille chez moi, je devrai sans doute l’installer. Il faut payer combien de dépôt ?" },
      { thai: "งั้นคงต้องติดเอง{P} เพราะ{I}ทำงานที่บ้าน ต้องวางเงินประกันเท่าไหร่{Q}", rom: "ngán khong tɔ̂ng tìt eeng {p} phrɔ́ {i} tham-ngaan thîi bâan tɔ̂ng waang ngən prà-kan thâo-rài {q}", fr: "Alors je vais devoir l’installer, car je travaille à la maison. Combien de caution faut-il verser ?" },
    ],
    10: [
      { thai: "ทั้งหมดสองหมื่นห้าพันห้าร้อยบาท ใช่ไหม{Q}", rom: "tháng-mòt sɔ̌ɔng-mʉ̀ʉn hâa-phan hâa-rɔ́ɔi bàat châi mái {q}", fr: "En tout, 25 500 bahts, c’est ça ?" },
      { thai: "งั้นรวมเป็นสองหมื่นห้าพันห้าร้อย ใช่ไหม{Q}", rom: "ngán ruam pen sɔ̌ɔng-mʉ̀ʉn hâa-phan hâa-rɔ́ɔi châi mái {q}", fr: "Donc ça fait 25 500 au total, c’est bien ça ?" },
      { thai: "ก็คือสองหมื่นห้าพันห้าร้อยบาท ถูกไหม{Q}", rom: "kɔ̂ɔ khʉʉ sɔ̌ɔng-mʉ̀ʉn hâa-phan hâa-rɔ́ɔi bàat thùuk mái {q}", fr: "Ça fait donc 25 500 bahts, correct ?" },
    ],
    12: [
      { thai: "ได้{P} แล้วมีเครื่องซักผ้าไหม{Q}", rom: "dâai {p} lɛ́ɛo mii khrʉ̂ang sák-phâa mái {q}", fr: "D’accord. Et il y a une machine à laver ?" },
      { thai: "โอเค{P} ในห้องมีเครื่องซักผ้าไหม{Q}", rom: "oo-khee {p} nai hɔ̂ng mii khrʉ̂ang sák-phâa mái {q}", fr: "OK. Il y a une machine à laver dans l’appartement ?" },
      { thai: "ได้{P} เครื่องซักผ้ามีไหม{Q}", rom: "dâai {p} khrʉ̂ang sák-phâa mii mái {q}", fr: "D’accord. Une machine à laver, il y en a une ?" },
    ],
    14: [
      { thai: "ย้ายเข้าวันที่หนึ่งเดือนหน้าได้ไหม{Q}", rom: "yáai khâo wan-thîi nʉ̀ng dʉan nâa dâai mái {q}", fr: "Je peux emménager le 1er du mois prochain ?" },
      { thai: "{I}ขอย้ายเข้าวันที่หนึ่งเดือนหน้าได้ไหม{Q}", rom: "{i} khɔ̌ɔ yáai khâo wan-thîi nʉ̀ng dʉan nâa dâai mái {q}", fr: "Est-ce que je pourrais emménager le 1er du mois prochain ?" },
      { thai: "{I}อยากเข้าอยู่วันที่หนึ่งเดือนหน้า ได้ไหม{Q}", rom: "{i} yàak khâo yùu wan-thîi nʉ̀ng dʉan nâa dâai mái {q}", fr: "J’aimerais m’installer le 1er du mois prochain, c’est possible ?" },
    ],
    16: [
      { thai: "ไม่เป็นไร{P} วันที่เจ็ดได้เลย", rom: "mâi pen rai {p} wan-thîi jèt dâai ləəi", fr: "Pas de problème, le 7, c’est bon." },
      { thai: "ได้{P} งั้นย้ายเข้าวันที่เจ็ด", rom: "dâai {p} ngán yáai khâo wan-thîi jèt", fr: "D’accord, alors j’emménage le 7." },
      { thai: "ไม่เป็นไร{P} วันที่เจ็ดก็โอเค", rom: "mâi pen rai {p} wan-thîi jèt kɔ̂ɔ oo-khee", fr: "Pas grave, le 7, ça me va aussi." },
    ],
    18: [
      { thai: "ได้{P} กี่โมง{Q}", rom: "dâai {p} kìi moong {q}", fr: "Oui. À quelle heure ?" },
      { thai: "ได้{P} ให้มากี่โมง{Q}", rom: "dâai {p} hâi maa kìi moong {q}", fr: "Oui. Je viens à quelle heure ?" },
      { thai: "สะดวก{P} กี่โมงดี{Q}", rom: "sà-dùak {p} kìi moong dii {q}", fr: "Ça me convient. À quelle heure ?" },
    ],
    20: [
      { thai: "ได้{P} ขอบคุณมาก{P}", rom: "dâai {p} khɔ̀ɔp-khun mâak {p}", fr: "D’accord, merci beaucoup." },
      { thai: "ได้เลย{P} ไม่ลืมแน่นอน ขอบคุณ{P}", rom: "dâai ləəi {p} mâi lʉʉm nɛ̂ɛ-nɔɔn khɔ̀ɔp-khun {p}", fr: "Entendu, je n’oublierai pas, merci." },
      { thai: "โอเค{P} ขอบคุณมาก{P}", rom: "oo-khee {p} khɔ̀ɔp-khun mâak {p}", fr: "OK, merci beaucoup." },
    ],
  },
  "ld:a2-chantier-reporte": {
    1: [
      { thai: "ทำไมถึงเลื่อน{Q}", rom: "tham-mai thʉ̌ng lʉ̂an {q}", fr: "Pourquoi c’est reporté ?" },
      { thai: "อ้าว เลื่อนเพราะอะไร{Q}", rom: "âao lʉ̂an phrɔ́ à-rai {q}", fr: "Ah bon ? Reporté à cause de quoi ?" },
    ],
    3: [
      { thai: "แล้วพื้นชั้นสามเทเสร็จแล้วหรือยัง{Q}", rom: "lɛ́ɛo phʉ́ʉn chán sǎam thee sèt lɛ́ɛo rʉ̌ʉ yang {q}", fr: "Et la dalle du troisième, elle est coulée ?" },
      { thai: "เทพื้นชั้นสามเสร็จยัง{Q}", rom: "thee phʉ́ʉn chán sǎam sèt yang {q}", fr: "La dalle du troisième, c’est fini ?" },
    ],
    5: [
      { thai: "แสดงว่าวันพฤหัสก็ยังไม่มีอะไรให้ดู{P}", rom: "sà-dɛɛng wâa wan-phá-rʉ́-hàt kɔ̂ɔ yang mâi mii à-rai hâi duu {p}", fr: "Ça veut dire que jeudi il n’y aura encore rien à voir." },
      { thai: "งั้นวันพฤหัสไปก็ไม่มีอะไรให้ดูเลย", rom: "ngán wan-phá-rʉ́-hàt pai kɔ̂ɔ mâi mii à-rai hâi duu ləəi", fr: "Alors jeudi, il n’y aurait rien à voir." },
    ],
    7: [
      { thai: "{I}ไม่ว่างวันศุกร์{P} ต้องไปประชุมกับลูกค้าที่ระยอง", rom: "{i} mâi wâang wan-sùk {p} tɔ̂ng pai prà-chum kàp lûuk-kháa thîi rá-yɔɔng", fr: "Je ne suis pas libre vendredi : réunion avec un client à Rayong." },
      { thai: "วันศุกร์ไม่ได้{P} {I}มีประชุมกับลูกค้าที่ระยอง", rom: "wan-sùk mâi dâai {p} {i} mii prà-chum kàp lûuk-kháa thîi rá-yɔɔng", fr: "Vendredi, impossible : j’ai une réunion avec un client à Rayong." },
    ],
    9: [
      { thai: "ใช่ ทั้งวันเลย{P} กลับมาก็ดึกแล้ว เปลี่ยนเป็นวันจันทร์ได้ไหม{Q}", rom: "châi tháng wan ləəi {p} klàp maa kɔ̂ɔ dʉ̀k lɛ́ɛo plìan pen wan-jan dâai mái {q}", fr: "Oui, toute la journée, je rentre tard. On peut passer à lundi ?" },
      { thai: "ทั้งวัน{P} กลับมาถึงก็ดึกแล้ว เลื่อนไปวันจันทร์ได้ไหม{Q}", rom: "tháng wan {p} klàp maa thʉ̌ng kɔ̂ɔ dʉ̀k lɛ́ɛo lʉ̂an pai wan-jan dâai mái {q}", fr: "Toute la journée, je rentre tard. On peut reporter à lundi ?" },
    ],
    11: [
      { thai: "บ่ายสองโมงได้ไหม{Q}", rom: "bàai sɔ̌ɔng moong dâai mái {q}", fr: "Quatorze heures, c’est possible ?" },
      { thai: "เอาบ่ายสองโมงดีไหม{Q}", rom: "ao bàai sɔ̌ɔng moong dii mái {q}", fr: "On dit quatorze heures ?" },
    ],
    13: [
      { thai: "ขอบคุณ{P} แล้วช่วยบอกเขาให้เก็บตัวอย่างคอนกรีตไว้ทดสอบด้วยนะ", rom: "khɔ̀ɔp-khun {p} lɛ́ɛo chûai bɔ̀ɔk kháo hâi kèp tua-yàang khɔn-krìit wái thót-sɔ̀ɔp dûai ná", fr: "Merci. Et dis-leur de garder des échantillons de béton pour les essais." },
      { thai: "ขอบคุณ{P} ฝากบอกเขาด้วยนะ ให้เก็บตัวอย่างคอนกรีตไว้ทดสอบ", rom: "khɔ̀ɔp-khun {p} fàak bɔ̀ɔk kháo dûai ná hâi kèp tua-yàang khɔn-krìit wái thót-sɔ̀ɔp", fr: "Merci. Dis-leur de ma part de garder des échantillons de béton pour les essais." },
    ],
    15: [
      { thai: "ดีมาก{P} แล้วค่าปรับล่ะ โรงงานจะรับผิดชอบหรือเปล่า{Q}", rom: "dii mâak {p} lɛ́ɛo khâa-pràp là roong-ngaan jà ráp-phìt-chɔ̂ɔp rʉ̌ʉ-plào {q}", fr: "Très bien. Et les pénalités, la centrale les assume ?" },
      { thai: "ดีมาก{P} แล้วโรงงานจะรับผิดชอบค่าปรับไหม{Q}", rom: "dii mâak {p} lɛ́ɛo roong-ngaan jà ráp-phìt-chɔ̂ɔp khâa-pràp mái {q}", fr: "Très bien. Et la centrale va payer les pénalités ?" },
    ],
    17: [
      { thai: "ได้ห้าเปอร์เซ็นต์ก็ยังดี{P}", rom: "dâai hâa pəə-sen kɔ̂ɔ yang dii {p}", fr: "Avoir cinq pour cent, c’est déjà ça." },
      { thai: "ก็ยังดี{P} ห้าเปอร์เซ็นต์ก็ดีกว่าไม่ได้อะไรเลย", rom: "kɔ̂ɔ yang dii {p} hâa pəə-sen kɔ̂ɔ dii kwàa mâi dâai à-rai ləəi", fr: "C’est déjà ça : cinq pour cent, c’est mieux que rien." },
    ],
    19: [
      { thai: "ได้{P} ถ้ามีอะไรเปลี่ยน โทรบอก{I}ได้เลยนะ", rom: "dâai {p} thâa mii à-rai plìan thoo bɔ̀ɔk {i} dâai ləəi ná", fr: "D’accord. Si quelque chose change, appelle-moi pour me le dire." },
      { thai: "โอเค{P} ถ้ามีอะไรเปลี่ยนก็โทรมาได้เลยนะ", rom: "oo-khee {p} thâa mii à-rai plìan kɔ̂ɔ thoo maa dâai ləəi ná", fr: "OK. S’il y a un changement, n’hésite pas à appeler." },
    ],
  },
  "ld:a2-train-chiang-mai": {
    0: [
      { thai: "สวัสดี{P} เอาตั๋วรถไฟไปเชียงใหม่หนึ่งใบ{P}", rom: "sà-wàt-dii {p} ao tǔa rót-fai pai chiang-mài nʉ̀ng bai {p}", fr: "Bonjour. Je prends un billet de train pour Chiang Mai." },
      { thai: "สวัสดี{P} {I}อยากซื้อตั๋วรถไฟไปเชียงใหม่หนึ่งใบ{P}", rom: "sà-wàt-dii {p} {i} yàak sʉ́ʉ tǔa rót-fai pai chiang-mài nʉ̀ng bai {p}", fr: "Bonjour. Je voudrais acheter un billet de train pour Chiang Mai." },
      { thai: "สวัสดี{P} ขอตั๋วไปเชียงใหม่ใบหนึ่ง{P}", rom: "sà-wàt-dii {p} khɔ̌ɔ tǔa pai chiang-mài bai nʉ̀ng {p}", fr: "Bonjour. Un billet pour Chiang Mai, s’il vous plaît." },
    ],
    2: [
      { thai: "คืนนี้{P} มีตู้นอนไหม{Q}", rom: "khʉʉn níi {p} mii tûu nɔɔn mái {q}", fr: "Ce soir. Il y a une voiture-couchettes ?" },
      { thai: "คืนนี้{P} มีขบวนรถนอนไหม{Q}", rom: "khʉʉn níi {p} mii khà-buan rót nɔɔn mái {q}", fr: "Ce soir. Il y a un train de nuit ?" },
    ],
    4: [
      { thai: "ขบวนสองทุ่มครึ่งไปถึงเชียงใหม่กี่โมง{Q}", rom: "khà-buan sɔ̌ɔng thûm khrʉ̂ng pai thʉ̌ng chiang-mài kìi moong {q}", fr: "Le train de 20 h 30 arrive à Chiang Mai à quelle heure ?" },
      { thai: "ถ้าขึ้นขบวนสองทุ่มครึ่ง จะถึงเชียงใหม่กี่โมง{Q}", rom: "thâa khʉ̂n khà-buan sɔ̌ɔng thûm khrʉ̂ng jà thʉ̌ng chiang-mài kìi moong {q}", fr: "Si je prends celui de 20 h 30, j’arrive à quelle heure ?" },
    ],
    6: [
      { thai: "งั้นเอาขบวนนั้น{P} เตียงล่างยังเหลือไหม{Q}", rom: "ngán ao khà-buan nán {p} tiang lâang yang lʉ̌a mái {q}", fr: "Alors je prends celui-là. Il reste des couchettes basses ?" },
      { thai: "ขอเป็นขบวนนั้น{P} ยังมีเตียงล่างว่างไหม{Q}", rom: "khɔ̌ɔ pen khà-buan nán {p} yang mii tiang lâang wâang mái {q}", fr: "Celui-là, s’il vous plaît. Il y a encore une couchette basse libre ?" },
    ],
    8: [
      { thai: "เตียงบนเท่าไหร่{Q}", rom: "tiang bon thâo-rài {q}", fr: "La couchette haute, c’est combien ?" },
      { thai: "เตียงบนกี่บาท{Q}", rom: "tiang bon kìi bàat {q}", fr: "La couchette haute, combien de bahts ?" },
    ],
    10: [
      { thai: "ขบวนหกโมงเย็นล่ะ มีเตียงล่างเหลือไหม{Q}", rom: "khà-buan hòk moong yen lâ mii tiang lâang lʉ̌a mái {q}", fr: "Et le train de 18 h, il reste des couchettes basses ?" },
      { thai: "แล้วขบวนหกโมงเย็นเตียงล่างยังว่างไหม{Q}", rom: "lɛ́ɛo khà-buan hòk moong yen tiang lâang yang wâang mái {q}", fr: "Et dans celui de 18 h, les couchettes basses sont libres ?" },
    ],
    12: [
      { thai: "ไม่ทันแน่{P} {I}ต้องกลับไปเอากระเป๋าที่โรงแรมก่อน", rom: "mâi than nɛ̂ɛ {p} {i} tɔ̂ng klàp pai ao krà-pǎo thîi roong-rɛɛm kɔ̀ɔn", fr: "Je n’aurai sûrement pas le temps, je dois d’abord récupérer ma valise à l’hôtel." },
      { thai: "คงไปไม่ทัน{P} กระเป๋า{I}ยังอยู่ที่โรงแรม ต้องกลับไปเอาก่อน", rom: "khong pai mâi than {p} krà-pǎo {i} yang yùu thîi roong-rɛɛm tɔ̂ng klàp pai ao kɔ̀ɔn", fr: "Je n’y arriverai pas, ma valise est encore à l’hôtel, je dois aller la chercher." },
    ],
    14: [
      { thai: "ได้{P} รับบัตรเครดิตไหม{Q}", rom: "dâai {p} ráp bàt khree-dìt mái {q}", fr: "D’accord. Vous acceptez la carte de crédit ?" },
      { thai: "โอเค{P} จ่ายด้วยบัตรเครดิตได้ไหม{Q}", rom: "oo-khee {p} jàai dûai bàt khree-dìt dâai mái {q}", fr: "OK. Je peux payer avec une carte de crédit ?" },
    ],
    16: [
      { thai: "รถไฟออกจากชานชาลาไหน{Q}", rom: "rót-fai ɔ̀ɔk jàak chaan-chaa-laa nǎi {q}", fr: "Le train part de quel quai ?" },
      { thai: "ต้องไปขึ้นที่ชานชาลาไหน{Q}", rom: "tɔ̂ng pai khʉ̂n thîi chaan-chaa-laa nǎi {q}", fr: "Je dois monter à quel quai ?" },
    ],
    18: [
      { thai: "ถ้าเปลี่ยนชานชาลา {I}จะรู้ได้ยังไง{Q}", rom: "thâa plìan chaan-chaa-laa {i} jà rúu dâai yang-ngai {q}", fr: "Si le quai change, comment je le saurai ?" },
      { thai: "แล้วถ้าเปลี่ยน จะดูได้ที่ไหน{Q}", rom: "lɛ́ɛo thâa plìan jà duu dâai thîi-nǎi {q}", fr: "Et s’il change, où est-ce que je peux le voir ?" },
    ],
  },
  "ld:a2-hotel-clim": {
    0: [
      { thai: "สวัสดี{P} {I}อยู่ห้องห้าหนึ่งสอง แอร์เสีย{P}", rom: "sà-wàt-dii {p} {i} yùu hɔ̂ng hâa-nʉ̀ng-sɔ̌ɔng ɛɛ sǐa {p}", fr: "Bonjour. Je suis à la chambre 512, la clim est en panne." },
      { thai: "สวัสดี{P} แอร์ห้องห้าหนึ่งสองเสีย{P}", rom: "sà-wàt-dii {p} ɛɛ hɔ̂ng hâa-nʉ̀ng-sɔ̌ɔng sǐa {p}", fr: "Bonjour. La clim de la chambre 512 est en panne." },
      { thai: "สวัสดี{P} ห้องห้าหนึ่งสอง แอร์ไม่ทำงาน{P}", rom: "sà-wàt-dii {p} hɔ̂ng hâa-nʉ̀ng-sɔ̌ɔng ɛɛ mâi tham-ngaan {p}", fr: "Bonjour. Chambre 512, la clim ne marche pas." },
    ],
    2: [
      { thai: "เสียตั้งแต่เมื่อคืน{P} แอร์ไม่เย็นเลย แถมเสียงดังมาก {I}นอนไม่หลับเลย", rom: "sǐa tâng-tɛ̀ɛ mʉ̂a-khʉʉn {p} ɛɛ mâi yen ləəi thɛ̌m sǐang dang mâak {i} nɔɔn mâi làp ləəi", fr: "En panne depuis hier soir : elle ne refroidit pas et en plus elle est très bruyante, je n’ai pas dormi." },
      { thai: "ตั้งแต่เมื่อคืน{P} แอร์ไม่เย็น แล้วก็ดังมาก ทำให้{I}นอนไม่หลับ", rom: "tâng-tɛ̀ɛ mʉ̂a-khʉʉn {p} ɛɛ mâi yen lɛ́ɛo-kɔ̂ɔ dang mâak tham-hâi {i} nɔɔn mâi làp", fr: "Depuis hier soir. Elle ne refroidit pas et fait beaucoup de bruit, du coup je n’ai pas pu dormir." },
    ],
    4: [
      { thai: "ช่างจะมากี่โมง{Q}", rom: "châang jà maa kìi moong {q}", fr: "Le technicien vient à quelle heure ?" },
      { thai: "ช่างมาได้เมื่อไหร่{Q}", rom: "châang maa dâai mʉ̂a-rài {q}", fr: "Quand est-ce que le technicien peut venir ?" },
    ],
    6: [
      { thai: "พรุ่งนี้เหรอ คืนนี้ร้อนแย่เลย ขอย้ายห้องได้ไหม{Q}", rom: "phrûng-níi rə̌ə khʉʉn-níi rɔ́ɔn yɛ̂ɛ ləəi khɔ̌ɔ yáai hɔ̂ng dâai mái {q}", fr: "Demain ? Cette nuit il va faire horriblement chaud. Je peux changer de chambre ?" },
      { thai: "ต้องรอถึงพรุ่งนี้เลยเหรอ คืนนี้ร้อนมากแน่ๆ เปลี่ยนห้องให้{I}ได้ไหม{Q}", rom: "tɔ̂ng rɔɔ thʉ̌ng phrûng-níi ləəi rə̌ə khʉʉn-níi rɔ́ɔn mâak nɛ̂ɛ-nɛ̂ɛ plìan hɔ̂ng hâi {i} dâai mái {q}", fr: "Il faut attendre jusqu’à demain ? Cette nuit il fera très chaud. Vous pouvez me changer de chambre ?" },
    ],
    8: [
      { thai: "ต้องรอนานแค่ไหน{Q}", rom: "tɔ̂ng rɔɔ naan khɛ̂ɛ-nǎi {q}", fr: "Il faut attendre combien de temps ?" },
      { thai: "อีกนานไหม{Q}", rom: "ìik naan mái {q}", fr: "Ça va être long ?" },
    ],
    10: [
      { thai: "ต้องเสียเงินเพิ่มไหม{Q}", rom: "tɔ̂ng sǐa ngən phə̂əm mái {q}", fr: "Je dois payer en plus ?" },
      { thai: "ต้องจ่ายเพิ่มหรือเปล่า{Q}", rom: "tɔ̂ng jàai phə̂əm rʉ̌ʉ-plào {q}", fr: "Il y a un supplément à payer ?" },
      { thai: "มีค่าใช้จ่ายเพิ่มไหม{Q}", rom: "mii khâa-chái-jàai phə̂əm mái {q}", fr: "Y a-t-il des frais supplémentaires ?" },
    ],
    12: [
      { thai: "ดีเลย{P} งั้นขอห้องเจ็ดศูนย์แปด{P}", rom: "dii ləəi {p} ngán khɔ̌ɔ hɔ̂ng jèt-sǔun-pɛ̀ɛt {p}", fr: "Parfait, alors la chambre 708, s’il vous plaît." },
      { thai: "ดีมาก{P} {I}ย้ายไปห้องเจ็ดศูนย์แปดแล้วกัน{P}", rom: "dii mâak {p} {i} yáai pai hɔ̂ng jèt-sǔun-pɛ̀ɛt lɛ́ɛo kan {p}", fr: "Très bien, je vais dans la chambre 708." },
    ],
    14: [
      { thai: "ขอบคุณ{P} ห้องอาหารอยู่ชั้นไหน เปิดกี่โมง{Q}", rom: "khɔ̀ɔp-khun {p} hɔ̂ng-aa-hǎan yùu chán nǎi pə̀ət kìi moong {q}", fr: "Merci. Le restaurant est à quel étage, il ouvre à quelle heure ?" },
      { thai: "ใจดีจัง{P} แล้วห้องอาหารเช้าอยู่ชั้นไหน เปิดตั้งแต่กี่โมง{Q}", rom: "jai-dii jang {p} lɛ́ɛo hɔ̂ng-aa-hǎan cháao yùu chán nǎi pə̀ət tâng-tɛ̀ɛ kìi moong {q}", fr: "C’est gentil. La salle du petit-déjeuner est à quel étage, et ouvre à partir de quelle heure ?" },
    ],
    16: [
      { thai: "{I}มีกระเป๋าใหญ่สองใบ ช่วยหาคนมายกให้หน่อยได้ไหม{Q}", rom: "{i} mii krà-pǎo yài sɔ̌ɔng bai chûai hǎa khon maa yók hâi nɔ̀i dâai mái {q}", fr: "J’ai deux grosses valises, vous pouvez m’envoyer quelqu’un pour les porter ?" },
    ],
    18: [
      { thai: "ได้ แล้วคีย์การ์ดห้องเก่าต้องทำยังไง{Q}", rom: "dâai lɛ́ɛo khii-káat hɔ̂ng kàao tɔ̂ng tham yang-ngai {q}", fr: "D’accord. Et je fais quoi de la carte de l’ancienne chambre ?" },
      { thai: "โอเค แล้วคีย์การ์ดอันเก่าต้องคืนไหม{Q}", rom: "oo-khee lɛ́ɛo khii-káat an kàao tɔ̂ng khʉʉn mái {q}", fr: "OK. Et je dois rendre l’ancienne carte ?" },
    ],
    20: [
      { thai: "ไม่เป็นไร{P} ขอบคุณที่ช่วยนะ", rom: "mâi pen rai {p} khɔ̀ɔp-khun thîi chûai ná", fr: "Ce n’est rien. Merci de votre aide." },
    ],
  },
  "ld:a2-anniversaire": {
    1: [
      { thai: "ว่าง{P} ทำไมเหรอ{Q}", rom: "wâang {p} tham-mai rə̌ə {q}", fr: "Oui. Pourquoi ?" },
      { thai: "ว่าง{P} มีอะไรหรือเปล่า{Q}", rom: "wâang {p} mii à-rai rʉ̌ʉ-plào {q}", fr: "Oui. Il y a quelque chose ?" },
    ],
    3: [
      { thai: "ดีเลย จัดที่บ้านหรือเปล่า{Q}", rom: "dii ləəi jàt thîi bâan rʉ̌ʉ-plào {q}", fr: "Génial. C’est à la maison ?" },
      { thai: "ดีจัง ปาร์ตี้ที่บ้านเหรอ{Q}", rom: "dii jang paa-tîi thîi bâan rə̌ə {q}", fr: "Super ! La fête est à la maison ?" },
    ],
    5: [
      { thai: "{I}ต้องไปถึงกี่โมง{Q}", rom: "{i} tɔ̂ng pai thʉ̌ng kìi moong {q}", fr: "Je dois arriver à quelle heure ?" },
      { thai: "ควรไปถึงที่ร้านกี่โมงดี{Q}", rom: "khuan pai thʉ̌ng thîi ráan kìi moong dii {q}", fr: "À quelle heure vaut-il mieux arriver au restaurant ?" },
    ],
    7: [
      { thai: "ไม่บอกเขาหรอก{P} แล้วมีใครไปบ้าง{Q}", rom: "mâi bɔ̀ɔk kháo rɔ̀ɔk {p} lɛ́ɛo mii khrai pai bâang {q}", fr: "Je ne lui dirai rien. Et qui vient ?" },
      { thai: "สัญญาว่าไม่บอก{P} ใครไปบ้าง{Q}", rom: "sǎn-yaa wâa mâi bɔ̀ɔk {p} khrai pai bâang {q}", fr: "Promis, je ne dis rien. Qui y va ?" },
    ],
    9: [
      { thai: "{I}ไม่รู้ว่าพี่ต้นชอบอะไร ซื้อของขวัญอะไรให้เขาดี{Q}", rom: "{i} mâi rúu wâa phîi tôn chɔ̂ɔp à-rai sʉ́ʉ khɔ̌ɔng-khwǎn à-rai hâi kháo dii {q}", fr: "Je ne sais pas ce que Ton aime. Qu’est-ce qu’on lui offre ?" },
      { thai: "ควรซื้อของขวัญอะไรให้พี่ต้นดี{Q} {I}ไม่รู้เลยว่าเขาชอบอะไร", rom: "khuan sʉ́ʉ khɔ̌ɔng-khwǎn à-rai hâi phîi tôn dii {q} {i} mâi rúu ləəi wâa kháo chɔ̂ɔp à-rai", fr: "Quel cadeau acheter à Ton ? Je n’ai aucune idée de ce qu’il aime." },
    ],
    11: [
      { thai: "ดีเลย{P} เดี๋ยวคืนนี้โอนให้นะ แล้วต้องเอาอะไรไปไหม{Q}", rom: "dii ləəi {p} dǐao khʉʉn-níi oon hâi ná lɛ́ɛo tɔ̂ng ao à-rai pai mái {q}", fr: "Parfait, je te vire ça ce soir. Et je dois apporter quelque chose ?" },
      { thai: "โอเค{P} คืนนี้{I}โอนเงินให้ แล้วให้{I}เอาอะไรไปด้วยไหม{Q}", rom: "oo-khee {p} khʉʉn-níi {i} oon ngən hâi lɛ́ɛo hâi {i} ao à-rai pai dûai mái {q}", fr: "OK, je fais le virement ce soir. Tu veux que j’apporte quelque chose ?" },
    ],
    13: [
      { thai: "งั้น{I}ซื้อไวน์ไปสักขวดดีไหม{Q}", rom: "ngán {i} sʉ́ʉ waai pai sàk khùat dii mái {q}", fr: "Alors, j’achète une bouteille de vin ?" },
      { thai: "ถ้างั้น{I}เอาไวน์ไปหนึ่งขวดได้ไหม{Q}", rom: "thâa-ngán {i} ao waai pai nʉ̀ng khùat dâai mái {q}", fr: "Dans ce cas, je peux apporter une bouteille de vin ?" },
    ],
    15: [
      { thai: "ได้{P} เอารสอะไรดี{Q}", rom: "dâai {p} ao rót à-rai dii {q}", fr: "D’accord. Je prends quel parfum ?" },
      { thai: "โอเค{P} พี่ต้นชอบไอศกรีมรสอะไร{Q}", rom: "oo-khee {p} phîi tôn chɔ̂ɔp ai-sà-kriim rót à-rai {q}", fr: "OK. Ton aime quel parfum de glace ?" },
    ],
    17: [
      { thai: "ได้ แล้วร้านนั้นชื่ออะไร{Q}", rom: "dâai lɛ́ɛo ráan nán chʉ̂ʉ à-rai {q}", fr: "D’accord. Et ce restaurant s’appelle comment ?" },
      { thai: "โอเค ร้านอาหารชื่ออะไรนะ{Q}", rom: "oo-khee ráan-aa-hǎan chʉ̂ʉ à-rai ná {q}", fr: "OK. Le restaurant s’appelle comment, déjà ?" },
    ],
    19: [
      { thai: "ขอบคุณ{P} งั้นเจอกันวันเสาร์ ห้าโมงครึ่งนะ", rom: "khɔ̀ɔp-khun {p} ngán jəə kan wan-sǎo hâa moong khrʉ̂ng ná", fr: "Merci. Alors à samedi, 17 h 30." },
      { thai: "ขอบใจนะ แล้วเจอกันห้าโมงครึ่งวันเสาร์{P}", rom: "khɔ̀ɔp-jai ná lɛ́ɛo jəə kan hâa moong khrʉ̂ng wan-sǎo {p}", fr: "Merci. On se voit samedi à 17 h 30." },
    ],
  },
  "ld:b1-bangkok-campagne": {
    1: [
      { thai: "จริงเหรอ {I}คิดว่าคุณชอบอยู่กรุงเทพฯ มาก ทำไมถึงอยากย้าย{Q}", rom: "jing rə̌ə {i} khít wâa khun chɔ̂ɔp yùu krung-thêep mâak tham-mai thʉ̌ng yàak yáai {q}", fr: "Vraiment ? Je pensais que tu aimais beaucoup vivre à Bangkok. Pourquoi veux-tu partir ?" },
      { thai: "จริงเหรอ นึกว่าคุณชอบชีวิตที่กรุงเทพฯ ซะอีก อยากย้ายเพราะอะไร{Q}", rom: "jing rə̌ə nʉ́k wâa khun chɔ̂ɔp chii-wít thîi krung-thêep sá ìik yàak yáai phrɔ́ à-rai {q}", fr: "Vraiment ? Moi qui croyais que tu adorais la vie à Bangkok. Pourquoi tu veux déménager ?" },
    ],
    3: [
      { thai: "จริง{P} แต่งานดีๆ ส่วนมากอยู่ในกรุงเทพฯ นะ แล้วงานที่บริษัทจะทำยังไง{Q}", rom: "jing {p} tɛ̀ɛ ngaan dii-dii sùan-mâak yùu nai krung-thêep ná lɛ́ɛo ngaan thîi bɔɔ-rí-sàt jà tham yang-ngai {q}", fr: "C’est vrai. Mais la plupart des bons emplois sont à Bangkok. Et ton travail à l’entreprise ?" },
      { thai: "ก็ใช่{P} แต่งานดีๆ ส่วนใหญ่อยู่กรุงเทพฯ แล้วงานปัจจุบันของคุณล่ะ จะทำยังไง{Q}", rom: "kɔ̂ɔ châi {p} tɛ̀ɛ ngaan dii-dii sùan-yài yùu krung-thêep lɛ́ɛo ngaan pàt-jù-ban khɔ̌ɔng khun lâ jà tham yang-ngai {q}", fr: "C’est sûr. Mais les bons emplois sont surtout à Bangkok. Et ton poste actuel, tu fais comment ?" },
    ],
    5: [
      { thai: "โชคดีจัง{P} แล้วเงินเดือนยังเท่าเดิมหรือเปล่า{Q}", rom: "chôok dii jang {p} lɛ́ɛo ngən-dʉan yang thâo dəəm rʉ̌ʉ-plào {q}", fr: "Quelle chance ! Et ton salaire reste le même ?" },
      { thai: "โชคดีมาก{P} แต่เงินเดือนลดไหม{Q}", rom: "chôok dii mâak {p} tɛ̀ɛ ngən-dʉan lót mái {q}", fr: "Super chance ! Mais ton salaire baisse ?" },
    ],
    7: [
      { thai: "ก็ยังถูกกว่าอยู่ที่นี่อยู่ดี{P} แต่สำหรับ{I} กรุงเทพฯ ดีกว่า มีทุกอย่าง โรงพยาบาลดีๆ ร้านอาหารทุกชาติ เดินทางก็สะดวก", rom: "kɔ̂ɔ yang thùuk kwàa yùu thîi-nîi yùu dii {p} tɛ̀ɛ sǎm-ràp {i} krung-thêep dii kwàa mii thúk yàang roong-phá-yaa-baan dii-dii ráan-aa-hǎan thúk châat dəən-thaang kɔ̂ɔ sà-dùak", fr: "Ça reste moins cher que de vivre ici. Mais pour moi, Bangkok, c’est mieux : il y a tout, bons hôpitaux, cuisines du monde, transports faciles." },
    ],
    9: [
      { thai: "เรื่องนี้{I}เห็นด้วย เสียงกับฝุ่นแย่มากจริงๆ แต่{I}เคยอยู่หมู่บ้านเล็กๆ ในฝรั่งเศสสามปี ช่วงแรกก็สบาย แต่หลังๆ เหงามาก ไม่มีอะไรให้ทำเลย{P}", rom: "rʉ̂ang níi {i} hěn-dûai sǐang kàp fùn yɛ̂ɛ mâak jing-jing tɛ̀ɛ {i} khəəi yùu mùu-bâan lék-lék nai fà-ràng-sèet sǎam pii chûang rɛ̂ɛk kɔ̂ɔ sà-baai tɛ̀ɛ lǎng-lǎng ngǎo mâak mâi mii à-rai hâi tham ləəi {p}", fr: "Là-dessus je suis d’accord, le bruit et la poussière c’est terrible. Mais j’ai vécu trois ans dans un petit village en France : au début c’était agréable, ensuite je me sentais très seul(e), rien à faire." },
    ],
    11: [
      { thai: "อ๋อ ถ้าเป็นเพราะครอบครัว {I}คิดว่านี่คือเหตุผลที่สำคัญที่สุด แล้วที่อุดรมีโรงพยาบาลดีๆ หรือเปล่า{Q}", rom: "ɔ̌ɔ thâa pen phrɔ́ khrɔ̂ɔp-khrua {i} khít wâa nîi khʉʉ hèet-phǒn thîi sǎm-khan thîi-sùt lɛ́ɛo thîi ù-dɔɔn mii roong-phá-yaa-baan dii-dii rʉ̌ʉ-plào {q}", fr: "Ah, si c’est pour la famille, je pense que c’est la raison la plus importante. Et il y a de bons hôpitaux à Udon ?" },
      { thai: "เข้าใจแล้ว เรื่องครอบครัวสำคัญที่สุด{P} แต่อุดรมีโรงพยาบาลดีๆ ไหม{Q}", rom: "khâo-jai lɛ́ɛo rʉ̂ang khrɔ̂ɔp-khrua sǎm-khan thîi-sùt {p} tɛ̀ɛ ù-dɔɔn mii roong-phá-yaa-baan dii-dii mái {q}", fr: "Je comprends, la famille passe avant tout. Mais Udon a de bons hôpitaux ?" },
    ],
    13: [
      { thai: "ฟังดูดีนะ{P} แต่{I}ยังเป็นห่วงงานของคุณในอนาคต ถ้าหัวหน้าคนนี้ลาออก หัวหน้าคนใหม่อาจให้กลับมาเข้าออฟฟิศทุกวันก็ได้", rom: "fang duu dii ná {p} tɛ̀ɛ {i} yang pen-hùang ngaan khɔ̌ɔng khun nai à-naa-khót thâa hǔa-nâa khon níi laa-ɔ̀ɔk hǔa-nâa khon mài àat hâi klàp maa khâo ɔ́p-fít thúk wan kɔ̂ɔ dâai", fr: "Ça a l’air bien. Mais je m’inquiète pour ton travail plus tard : si ce chef part, le nouveau pourrait te faire revenir au bureau tous les jours." },
    ],
    15: [
      { thai: "คิดมาดีนะ แล้วจะลองอยู่นานเท่าไหร่{Q}", rom: "khít maa dii ná lɛ́ɛo jà lɔɔng yùu naan thâo-rài {q}", fr: "C’est bien pensé. Et tu vas essayer combien de temps ?" },
      { thai: "รอบคอบดีจัง แล้วจะลองอยู่ที่อุดรนานแค่ไหน{Q}", rom: "rɔ̂ɔp-khɔ̂ɔp dii jang lɛ́ɛo jà lɔɔng yùu thîi ù-dɔɔn naan khɛ̂ɛ-nǎi {q}", fr: "C’est prudent. Et tu vas tester Udon pendant combien de temps ?" },
    ],
    17: [
      { thai: "สรุปว่า คุณเหมาะกับต่างจังหวัด แต่{I}ยังเหมาะกับกรุงเทพฯ มากกว่า เพราะ{I}ยังโสด แล้วก็ชอบเที่ยวกลางคืน{P}", rom: "sà-rùp wâa khun mɔ̀ kàp tàang-jang-wàt tɛ̀ɛ {i} yang mɔ̀ kàp krung-thêep mâak kwàa phrɔ́ {i} yang sòot lɛ́ɛo-kɔ̂ɔ chɔ̂ɔp thîao klaang-khʉʉn {p}", fr: "Bref : toi, la province te convient, mais moi c’est encore Bangkok, parce que je suis célibataire et que j’aime sortir le soir." },
    ],
    19: [
      { thai: "งั้นอาทิตย์ที่ต้องเข้ากรุงเทพฯ มานอนที่ห้อง{I}ก็ได้นะ", rom: "ngán aa-thít thîi tɔ̂ng khâo krung-thêep maa nɔɔn thîi hɔ̂ng {i} kɔ̂ɔ dâai ná", fr: "Alors, la semaine où tu dois venir à Bangkok, tu peux dormir chez moi." },
      { thai: "ถ้างั้นเวลามากรุงเทพฯ มาพักกับ{I}ได้เลย{P}", rom: "thâa-ngán wee-laa maa krung-thêep maa phák kàp {i} dâai ləəi {p}", fr: "Dans ce cas, quand tu viens à Bangkok, tu peux loger chez moi." },
    ],
    21: [
      { thai: "ได้เลย{P} แต่เอาแหนมกับไส้กรอกอีสานมาเยอะๆ นะ", rom: "dâai ləəi {p} tɛ̀ɛ ao nɛ̌ɛm kàp sâi-krɔ̀ɔk ii-sǎan maa yə́-yə́ ná", fr: "Avec plaisir ! Mais apporte plein de naem et de saucisses isan." },
      { thai: "ตกลง{P} ขอเป็นแหนมกับไส้กรอกอีสานเยอะๆ แล้วกัน", rom: "tòk-long {p} khɔ̌ɔ pen nɛ̌ɛm kàp sâi-krɔ̀ɔk ii-sǎan yə́-yə́ lɛ́ɛo kan", fr: "Marché conclu. Alors plein de naem et de saucisses isan." },
    ],
  },
  "ld:b1-chantier-delai": {
    0: [
      { thai: "สวัสดี{P} วันนี้{I}อยากคุยเรื่องแผนงานหน่อย ตามสัญญาโครงสร้างต้องเสร็จวันที่สิบห้าตุลาคม แต่ตอนนี้พื้นชั้นสองยังไม่ได้เทเลย", rom: "sà-wàt-dii {p} wan-níi {i} yàak khui rʉ̂ang phɛ̌ɛn-ngaan nɔ̀i taam sǎn-yaa khroong-sâang tɔ̂ng sèt wan-thîi sìp-hâa tù-laa-khom tɛ̀ɛ tɔɔn-níi phʉ́ʉn chán sɔ̌ɔng yang mâi dâai thee ləəi", fr: "Bonjour. Je voudrais parler du planning : selon le contrat, la structure doit être finie le 15 octobre, mais la dalle du premier n’est pas encore coulée." },
      { thai: "สวัสดี{P} {I}ขอคุยเรื่องแผนงาน{P} ในสัญญาเขียนว่าโครงสร้างต้องเสร็จวันที่สิบห้าตุลาคม แต่พื้นชั้นสองยังไม่ได้เทเลย", rom: "sà-wàt-dii {p} {i} khɔ̌ɔ khui rʉ̂ang phɛ̌ɛn-ngaan {p} nai sǎn-yaa khǐan wâa khroong-sâang tɔ̂ng sèt wan-thîi sìp-hâa tù-laa-khom tɛ̀ɛ phʉ́ʉn chán sɔ̌ɔng yang mâi dâai thee ləəi", fr: "Bonjour. J’aimerais parler du planning : le contrat dit que la structure doit être finie le 15 octobre, mais la dalle du premier n’est toujours pas coulée." },
    ],
    2: [
      { thai: "สามอาทิตย์เยอะไป{P} {I}ดูบันทึกหน้างานแล้ว ฝนตกหนักจนทำงานไม่ได้แค่หกวันเอง ไม่ใช่ทุกวัน", rom: "sǎam aa-thít yə́ pai {p} {i} duu ban-thʉ́k nâa-ngaan lɛ́ɛo fǒn tòk nàk jon tham-ngaan mâi dâai khɛ̂ɛ hòk wan eeng mâi châi thúk wan", fr: "Trois semaines, c’est trop. J’ai vu le journal de chantier : seulement six jours de pluie bloquante, pas tous les jours." },
      { thai: "สามอาทิตย์นานไป{P} ในบันทึกหน้างาน มีแค่หกวันที่ทำงานไม่ได้เพราะฝน ไม่ได้ตกทุกวัน", rom: "sǎam aa-thít naan pai {p} nai ban-thʉ́k nâa-ngaan mii khɛ̂ɛ hòk wan thîi tham-ngaan mâi dâai phrɔ́ fǒn mâi dâai tòk thúk wan", fr: "Trois semaines, c’est long. Dans le journal de chantier, il n’y a que six jours perdus à cause de la pluie, il n’a pas plu tous les jours." },
    ],
    4: [
      { thai: "เข้าใจ{P} แต่ยังมีอีกเรื่อง อาทิตย์ที่แล้ววิศวกรมาตรวจ บอกว่าไม้แบบพื้นไม่แข็งแรง ต้องรื้อทำใหม่ เรื่องนี้ไม่เกี่ยวกับฝนนะ", rom: "khâo-jai {p} tɛ̀ɛ yang mii ìik rʉ̂ang aa-thít-thîi-lɛ́ɛo wít-sà-wá-kɔɔn maa trùat bɔ̀ɔk wâa mái-bɛ̀ɛp phʉ́ʉn mâi khɛ̌ng-rɛɛng tɔ̂ng rʉ́ʉ tham mài rʉ̂ang níi mâi kìao kàp fǒn ná", fr: "Je comprends. Mais autre chose : la semaine dernière, l’ingénieur a dit que le coffrage n’était pas solide et qu’il fallait le refaire. Ça n’a rien à voir avec la pluie." },
    ],
    6: [
      { thai: "ขอบคุณที่ยอมรับ{P} อีกเรื่องที่{I}เป็นห่วงมากคือความปลอดภัย เมื่อวานคนงานหลายคนไม่ใส่หมวกนิรภัย แล้วนั่งร้านข้างหลังก็ไม่มีราวกันตก", rom: "khɔ̀ɔp-khun thîi yɔɔm-ráp {p} ìik rʉ̂ang thîi {i} pen-hùang mâak khʉʉ khwaam-plɔ̀ɔt-phai mʉ̂a-waan khon-ngaan lǎai khon mâi sài mùak ní-rá-phai lɛ́ɛo nâng-ráan khâang-lǎng kɔ̂ɔ mâi mii raao kan tòk", fr: "Merci de le reconnaître. Ce qui m’inquiète aussi, c’est la sécurité : hier plusieurs ouvriers étaient sans casque, et l’échafaudage arrière n’a pas de garde-corps." },
    ],
    8: [
      { thai: "ดีมาก{P} ถ้าเกิดอุบัติเหตุ งานต้องหยุดหมด แล้วจะยิ่งช้าไปอีก เรื่องเวลา {I}ให้ได้สิบวัน ไม่มีค่าปรับ", rom: "dii mâak {p} thâa kə̀ət ù-bàt-tì-hèet ngaan tɔ̂ng yùt mòt lɛ́ɛo jà yîng cháa pai ìik rʉ̂ang wee-laa {i} hâi dâai sìp wan mâi mii khâa-pràp", fr: "Très bien. En cas d’accident, tout s’arrête et on prend encore plus de retard. Pour le délai, je peux accorder dix jours, sans pénalités." },
      { thai: "ดีมาก{P} มีอุบัติเหตุเมื่อไหร่ ทุกอย่างต้องหยุด แล้วจะช้ากว่าเดิม กลับมาเรื่องเวลา {I}ขยายให้สิบวัน โดยไม่คิดค่าปรับ", rom: "dii mâak {p} mii ù-bàt-tì-hèet mʉ̂a-rài thúk yàang tɔ̂ng yùt lɛ́ɛo jà cháa kwàa dəəm klàp maa rʉ̂ang wee-laa {i} khà-yǎai hâi sìp wan dooi mâi khít khâa-pràp", fr: "Très bien. Au moindre accident, tout s’arrête et on sera encore plus en retard. Pour le délai, je prolonge de dix jours sans pénalités." },
    ],
    10: [
      { thai: "ในสัญญา ค่าปรับวันละห้าพันบาท{P} ถ้าช้าสิบแปดวัน {I}จะเปิดร้านกาแฟไม่ทันปีใหม่", rom: "nai sǎn-yaa khâa-pràp wan lá hâa-phan bàat {p} thâa cháa sìp-pɛ̀ɛt wan {i} jà pə̀ət ráan kaa-fɛɛ mâi than pii-mài", fr: "Dans le contrat, la pénalité est de 5 000 bahts par jour. Avec 18 jours de retard, je n’ouvrirai pas mon café avant le Nouvel An." },
      { thai: "ค่าปรับตามสัญญาคือวันละห้าพันบาท{P} ถ้าช้าไปสิบแปดวัน ร้านกาแฟของ{I}ก็เปิดไม่ทันปีใหม่", rom: "khâa-pràp taam sǎn-yaa khʉʉ wan lá hâa-phan bàat {p} thâa cháa pai sìp-pɛ̀ɛt wan ráan kaa-fɛɛ khɔ̌ɔng {i} kɔ̂ɔ pə̀ət mâi than pii-mài", fr: "La pénalité contractuelle est de 5 000 bahts par jour. Si on a 18 jours de retard, mon café ne pourra pas ouvrir pour le Nouvel An." },
    ],
    12: [
      { thai: "สิบสี่วัน แปลว่าส่งงานโครงสร้างวันที่ยี่สิบเก้าตุลาคมใช่ไหม{Q}", rom: "sìp-sìi wan plɛɛ wâa sòng ngaan khroong-sâang wan-thîi yîi-sìp-kâo tù-laa-khom châi mái {q}", fr: "Quatorze jours, ça signifie livrer la structure le 29 octobre, c’est ça ?" },
      { thai: "ถ้าสิบสี่วัน โครงสร้างก็ต้องเสร็จวันที่ยี่สิบเก้าตุลาคมใช่ไหม{Q}", rom: "thâa sìp-sìi wan khroong-sâang kɔ̂ɔ tɔ̂ng sèt wan-thîi yîi-sìp-kâo tù-laa-khom châi mái {q}", fr: "Avec quatorze jours, la structure doit être finie le 29 octobre, c’est bien ça ?" },
    ],
    14: [
      { thai: "ได้{P} {I}ตกลงสิบสี่วัน แต่มีเงื่อนไขสองข้อ หนึ่ง ต้องเทพื้นชั้นสองให้เสร็จภายในวันอังคารหน้า ถ้าฝนไม่ตก สอง ส่งรายงานความคืบหน้าพร้อมรูปให้{I}ทุกวันศุกร์", rom: "dâai {p} {i} tòk-long sìp-sìi wan tɛ̀ɛ mii ngʉ̂an-khǎi sɔ̌ɔng khɔ̂ɔ nʉ̀ng tɔ̂ng thee phʉ́ʉn chán sɔ̌ɔng hâi sèt phaai-nai wan-ang-khaan nâa thâa fǒn mâi tòk sɔ̌ɔng sòng raai-ngaan khwaam-khʉ̂ʉp-nâa phrɔ́ɔm rûup hâi {i} thúk wan-sùk", fr: "D’accord, quatorze jours, à deux conditions : un, couler la dalle du premier d’ici mardi prochain s’il ne pleut pas ; deux, m’envoyer un rapport d’avancement avec photos chaque vendredi." },
    ],
    16: [
      { thai: "ถ้าฝนตกหนักจนทำงานไม่ได้ และบันทึกหน้างานยืนยันได้ วันนั้นจะไม่นับ{P} แต่ถ้าช้าเพราะเรื่องอื่น เกินวันที่ยี่สิบเก้าไป ต้องจ่ายค่าปรับวันละห้าพันตามสัญญา{P}", rom: "thâa fǒn tòk nàk jon tham-ngaan mâi dâai lɛ́ ban-thʉ́k nâa-ngaan yʉʉn-yan dâai wan nán jà mâi náp {p} tɛ̀ɛ thâa cháa phrɔ́ rʉ̂ang ʉ̀ʉn kəən wan-thîi yîi-sìp-kâo pai tɔ̂ng jàai khâa-pràp wan lá hâa-phan taam sǎn-yaa {p}", fr: "S’il pleut au point de bloquer le travail et que le journal le confirme, ce jour ne compte pas. Mais pour tout autre retard après le 29, c’est 5 000 par jour de pénalité, selon le contrat." },
    ],
    18: [
      { thai: "ไม่ได้{P} ห้าพันเขียนไว้ในสัญญาแล้ว เปลี่ยนไม่ได้ แต่ถ้าเสร็จก่อนวันที่ยี่สิบห้า {I}ให้โบนัสหนึ่งหมื่นบาท{P}", rom: "mâi dâai {p} hâa-phan khǐan wái nai sǎn-yaa lɛ́ɛo plìan mâi dâai tɛ̀ɛ thâa sèt kɔ̀ɔn wan-thîi yîi-sìp-hâa {i} hâi boo-nát nʉ̀ng-mʉ̀ʉn bàat {p}", fr: "Non. Cinq mille, c’est écrit dans le contrat, on ne peut pas changer. Mais si vous finissez avant le 25, je donne une prime de 10 000 bahts." },
      { thai: "ลดไม่ได้{P} ห้าพันเป็นตัวเลขในสัญญา แต่ถ้าเสร็จก่อนวันที่ยี่สิบห้า {I}จะให้โบนัสหมื่นบาท{P}", rom: "lót mâi dâai {p} hâa-phan pen tua-lêek nai sǎn-yaa tɛ̀ɛ thâa sèt kɔ̀ɔn wan-thîi yîi-sìp-hâa {i} jà hâi boo-nát mʉ̀ʉn bàat {p}", fr: "Impossible de baisser : 5 000, c’est le chiffre du contrat. Mais si c’est fini avant le 25, je vous donne une prime de 10 000 bahts." },
    ],
    20: [
      { thai: "ถูกต้อง ต้องเร็วแต่ปลอดภัย{P} {I}จะแก้สัญญา แล้วส่งให้เซ็นพรุ่งนี้เช้า{P}", rom: "thùuk-tɔ̂ng tɔ̂ng reo tɛ̀ɛ plɔ̀ɔt-phai {p} {i} jà kɛ̂ɛ sǎn-yaa lɛ́ɛo sòng hâi sen phrûng-níi cháao {p}", fr: "Exact : vite, mais en sécurité. Je modifie le contrat et je vous l’envoie à signer demain matin." },
      { thai: "ใช่ เร็วก็ได้ แต่ความปลอดภัยต้องมาก่อน{P} พรุ่งนี้เช้า{I}จะส่งสัญญาที่แก้แล้วไปให้เซ็น{P}", rom: "châi reo kɔ̂ɔ dâai tɛ̀ɛ khwaam-plɔ̀ɔt-phai tɔ̂ng maa kɔ̀ɔn {p} phrûng-níi cháao {i} jà sòng sǎn-yaa thîi kɛ̂ɛ lɛ́ɛo pai hâi sen {p}", fr: "Oui, vite, mais la sécurité d’abord. Demain matin, je vous envoie le contrat modifié à signer." },
    ],
    22: [
      { thai: "ได้{P} {I}จะมาประมาณบ่ายสามโมง{P}", rom: "dâai {p} {i} jà maa prà-maan bàai sǎam moong {p}", fr: "D’accord, je viendrai vers 15 h." },
      { thai: "ได้เลย{P} ประมาณบ่ายสามโมง{I}จะแวะไปดู{P}", rom: "dâai ləəi {p} prà-maan bàai sǎam moong {i} jà wɛ́ pai duu {p}", fr: "Entendu, je passerai voir vers 15 h." },
    ],
  },
  "ld:b1-voyage-rate": {
    1: [
      { thai: "สนุก{P} แต่ตอนแรกแย่มากเลย", rom: "sà-nùk {p} tɛ̀ɛ tɔɔn-rɛ̂ɛk yɛ̂ɛ mâak ləəi", fr: "C’était bien, mais le début a été horrible." },
      { thai: "ช่วงแรกแย่มาก{P} แต่สุดท้ายก็สนุกดี", rom: "chûang rɛ̂ɛk yɛ̂ɛ mâak {p} tɛ̀ɛ sùt-tháai kɔ̂ɔ sà-nùk dii", fr: "Le début a été horrible, mais finalement c’était bien." },
    ],
    3: [
      { thai: "เครื่องของ{I}จะออกวันศุกร์ตอนสองทุ่ม{P} {I}ไปถึงดอนเมืองตั้งแต่หกโมงเย็น", rom: "khrʉ̂ang khɔ̌ɔng {i} jà ɔ̀ɔk wan-sùk tɔɔn sɔ̌ɔng thûm {p} {i} pai thʉ̌ng dɔɔn-mʉang tâng-tɛ̀ɛ hòk moong yen", fr: "Mon avion devait partir vendredi à 20 h. J’étais à Don Mueang dès 18 h." },
      { thai: "{I}มีไฟลต์วันศุกร์ตอนสองทุ่ม{P} เลยไปถึงสนามบินดอนเมืองตั้งแต่หกโมงเย็น", rom: "{i} mii fái wan-sùk tɔɔn sɔ̌ɔng thûm {p} ləəi pai thʉ̌ng sà-nǎam-bin dɔɔn-mʉang tâng-tɛ̀ɛ hòk moong yen", fr: "J’avais un vol vendredi à 20 h, donc je suis arrivé(e) à l’aéroport de Don Mueang dès 18 h." },
    ],
    5: [
      { thai: "ตอนแรกประกาศว่าดีเลย์สองชั่วโมง ออกสี่ทุ่ม{P} แต่พอห้าทุ่มก็ประกาศยกเลิกเลย", rom: "tɔɔn-rɛ̂ɛk prà-kàat wâa dii-lee sɔ̌ɔng chûa-moong ɔ̀ɔk sìi thûm {p} tɛ̀ɛ phɔɔ hâa thûm kɔ̂ɔ prà-kàat yók-lə̂ək ləəi", fr: "D’abord, ils ont annoncé deux heures de retard, départ à 22 h. Puis à 23 h, ils ont tout annulé." },
      { thai: "แรกๆ เขาบอกว่าเลื่อนไปสองชั่วโมง เป็นสี่ทุ่ม{P} แล้วพอห้าทุ่มก็ยกเลิกเที่ยวบินเลย", rom: "rɛ̂ɛk-rɛ̂ɛk khǎo bɔ̀ɔk wâa lʉ̂an pai sɔ̌ɔng chûa-moong pen sìi thûm {p} lɛ́ɛo phɔɔ hâa thûm kɔ̂ɔ yók-lə̂ək thîao-bin ləəi", fr: "Au début, ils ont dit que c’était décalé de deux heures, à 22 h. Et à 23 h, ils ont annulé le vol." },
    ],
    7: [
      { thai: "เปล่า{P} เครื่องไม่ได้เสีย ที่กระบี่มีพายุแรงมาก เครื่องเลยลงไม่ได้", rom: "plào {p} khrʉ̂ang mâi dâai sǐa thîi krà-bìi mii phaa-yú rɛɛng mâak khrʉ̂ang ləəi long mâi dâai", fr: "Non, l’avion n’était pas en panne. Il y avait une grosse tempête à Krabi, donc impossible d’atterrir." },
      { thai: "ไม่ได้เสีย{P} แต่ที่กระบี่มีพายุแรงมาก เครื่องบินเลยลงจอดไม่ได้", rom: "mâi dâai sǐa {p} tɛ̀ɛ thîi krà-bìi mii phaa-yú rɛɛng mâak khrʉ̂ang-bin ləəi long jɔ̀ɔt mâi dâai", fr: "Pas en panne, mais il y avait une grosse tempête à Krabi, les avions ne pouvaient pas atterrir." },
    ],
    9: [
      { thai: "เขาให้แค่คูปองอาหารสามร้อยบาทเอง{P} แล้วโรงแรมแถวสนามบินก็เต็มหมด", rom: "khǎo hâi khɛ̂ɛ khuu-pɔɔng aa-hǎan sǎam-rɔ́ɔi bàat eeng {p} lɛ́ɛo roong-rɛɛm thɛ̌ɛo sà-nǎam-bin kɔ̂ɔ tem mòt", fr: "Ils ont juste donné un bon repas de 300 bahts. Et les hôtels près de l’aéroport étaient complets." },
      { thai: "ไม่ได้หาให้{P} ได้แค่คูปองอาหารสามร้อยบาท โรงแรมใกล้สนามบินก็เต็มหมดเลย", rom: "mâi dâai hǎa hâi {p} dâai khɛ̂ɛ khuu-pɔɔng aa-hǎan sǎam-rɔ́ɔi bàat roong-rɛɛm klâi sà-nǎam-bin kɔ̂ɔ tem mòt ləəi", fr: "Non, juste un bon repas de 300 bahts. Et tous les hôtels près de l’aéroport étaient pleins." },
    ],
    11: [
      { thai: "ก็ต้องนอนบนเก้าอี้ในสนามบินทั้งคืน{P} แอร์เย็นมาก หนาวจนแทบไม่ได้หลับเลย", rom: "kɔ̂ɔ tɔ̂ng nɔɔn bon kâo-îi nai sà-nǎam-bin tháng khʉʉn {p} ɛɛ yen mâak nǎao jon thɛ̂ɛp mâi dâai làp ləəi", fr: "J’ai dû dormir sur des chaises de l’aéroport toute la nuit. La clim était glaciale, j’ai à peine fermé l’œil." },
      { thai: "นอนเก้าอี้ในสนามบินทั้งคืนเลย{P} หนาวมากเพราะแอร์แรง แทบไม่ได้นอน", rom: "nɔɔn kâo-îi nai sà-nǎam-bin tháng khʉʉn ləəi {p} nǎao mâak phrɔ́ ɛɛ rɛɛng thɛ̂ɛp mâi dâai nɔɔn", fr: "J’ai dormi sur les chaises de l’aéroport toute la nuit, il faisait très froid à cause de la clim, j’ai presque pas dormi." },
    ],
    13: [
      { thai: "ได้บินวันเสาร์หกโมงเช้า{P} แต่พอไปถึงกระบี่ กระเป๋า{I}ไม่มาด้วย", rom: "dâai bin wan-sǎo hòk moong cháao {p} tɛ̀ɛ phɔɔ pai thʉ̌ng krà-bìi krà-pǎo {i} mâi maa dûai", fr: "J’ai pu partir samedi à 6 h. Mais à Krabi, ma valise n’était pas là." },
      { thai: "เช้าวันเสาร์ตอนหกโมง{P} แต่ถึงกระบี่แล้ว กระเป๋าของ{I}ไม่ได้มากับเครื่อง", rom: "cháao wan-sǎo tɔɔn hòk moong {p} tɛ̀ɛ thʉ̌ng krà-bìi lɛ́ɛo krà-pǎo khɔ̌ɔng {i} mâi dâai maa kàp khrʉ̂ang", fr: "Samedi matin à 6 h. Mais arrivé(e) à Krabi, ma valise n’était pas dans l’avion." },
    ],
    15: [
      { thai: "ใช่{P} เขาบอกว่ากระเป๋ายังค้างอยู่ที่กรุงเทพฯ {I}ไม่มีเสื้อผ้าเลย ต้องไปซื้อที่ตลาด เสียไปแปดร้อยบาท", rom: "châi {p} khǎo bɔ̀ɔk wâa krà-pǎo yang kháang yùu thîi krung-thêep {i} mâi mii sʉ̂a-phâa ləəi tɔ̂ng pai sʉ́ʉ thîi tà-làat sǐa pai pɛ̀ɛt-rɔ́ɔi bàat", fr: "Oui. Ils ont dit qu’elle était restée à Bangkok. Je n’avais aucun vêtement, j’ai dû en acheter au marché : 800 bahts." },
    ],
    17: [
      { thai: "ได้{P} เขาเอามาส่งให้ที่โรงแรมตอนเย็นวันอาทิตย์ ของไม่หายสักชิ้น", rom: "dâai {p} khǎo ao maa sòng hâi thîi roong-rɛɛm tɔɔn yen wan-aa-thít khɔ̌ɔng mâi hǎai sàk chín", fr: "Oui, ils me l’ont livrée à l’hôtel dimanche soir, rien n’avait disparu." },
      { thai: "ได้คืนแล้ว{P} วันอาทิตย์ตอนเย็นเขาส่งมาที่โรงแรม ของครบทุกอย่าง", rom: "dâai khʉʉn lɛ́ɛo {p} wan-aa-thít tɔɔn yen khǎo sòng maa thîi roong-rɛɛm khɔ̌ɔng khróp thúk yàang", fr: "Je l’ai récupérée : dimanche soir, ils l’ont envoyée à l’hôtel, il ne manquait rien." },
    ],
    19: [
      { thai: "จ่าย{P} ได้ค่าชดเชยสองพันบาท พอจ่ายค่าเสื้อผ้าพอดี", rom: "jàai {p} dâai khâa chót-chəəi sɔ̌ɔng-phan bàat phɔɔ jàai khâa sʉ̂a-phâa phɔɔ-dii", fr: "Oui, j’ai eu 2 000 bahts de dédommagement, juste de quoi payer les vêtements." },
      { thai: "ได้{P} เขาชดเชยให้สองพันบาท เลยพอค่าเสื้อผ้า", rom: "dâai {p} khǎo chót-chəəi hâi sɔ̌ɔng-phan bàat ləəi phɔɔ khâa sʉ̂a-phâa", fr: "Oui, ils m’ont dédommagé(e) de 2 000 bahts, ça a couvert les vêtements." },
    ],
    21: [
      { thai: "สนุกจริง{P} คืนที่นอนในสนามบิน {I}ได้เจอคู่รักชาวสวิสคู่หนึ่ง เขาก็จะไปกระบี่เหมือนกัน", rom: "sà-nùk jing {p} khʉʉn thîi nɔɔn nai sà-nǎam-bin {i} dâai jəə khûu-rák chaao sà-wít khûu nʉ̀ng khǎo kɔ̂ɔ jà pai krà-bìi mʉ̌an-kan", fr: "Vraiment bien. La nuit à l’aéroport, j’ai rencontré un couple de Suisses qui allait aussi à Krabi." },
    ],
    23: [
      { thai: "ใช่{P} วันจันทร์เรานั่งเรือไปเกาะพีพีด้วยกัน อากาศดี ทะเลสวยมาก ทุกวันนี้ยังคุยกันทุกวันอยู่เลย", rom: "châi {p} wan-jan rao nâng rʉa pai kɔ̀ pii-pii dûai-kan aa-kàat dii thá-lee sǔai mâak thúk-wan-níi yang khui kan thúk wan yùu ləəi", fr: "Oui, lundi on est allés ensemble en bateau aux îles Phi Phi, beau temps, mer superbe. On se parle encore tous les jours." },
      { thai: "ใช่{P} วันจันทร์ไปเกาะพีพีด้วยกันทางเรือ อากาศดีมาก ทะเลสวยสุดๆ ตอนนี้ยังคุยกันทุกวัน", rom: "châi {p} wan-jan pai kɔ̀ pii-pii dûai-kan thaang rʉa aa-kàat dii mâak thá-lee sǔai sùt-sùt tɔɔn-níi yang khui kan thúk wan", fr: "Oui, lundi on a fait Phi Phi ensemble en bateau, très beau temps, mer magnifique. On se parle toujours chaque jour." },
    ],
  },
  "ld:b1-sante-sport": {
    1: [
      { thai: "ไม่ค่อยมีแรง{P} บ่ายๆ ทำงานก็ง่วงตลอด แต่นายช่วงนี้ดูแข็งแรงขึ้นมากเลยนะ แล้วก็ผอมลงด้วย", rom: "mâi khɔ̂i mii rɛɛng {p} bàai-bàai tham-ngaan kɔ̂ɔ ngûang tà-lɔ̀ɔt tɛ̀ɛ naai chûang-níi duu khɛ̌ng-rɛɛng khʉ̂n mâak ləəi ná lɛ́ɛo-kɔ̂ɔ phɔ̌ɔm long dûai", fr: "Pas beaucoup d’énergie, l’après-midi au travail j’ai toujours sommeil. Mais toi, tu as l’air bien plus en forme, et tu as minci." },
      { thai: "รู้สึกไม่มีแรงเลย{P} ตอนบ่ายง่วงทั้งบ่าย แต่นายดูฟิตขึ้นเยอะนะ ผอมลงด้วย", rom: "rúu-sʉ̀k mâi mii rɛɛng ləəi {p} tɔɔn bàai ngûang tháng bàai tɛ̀ɛ naai duu fít khʉ̂n yə́ ná phɔ̌ɔm long dûai", fr: "Je me sens sans énergie, j’ai sommeil tout l’après-midi. Mais toi, tu as l’air beaucoup plus en forme, et plus mince." },
    ],
    3: [
      { thai: "หกกิโลเลยเหรอ ทำได้ยังไง{Q}", rom: "hòk kì-loo ləəi rə̌ə tham dâai yang-ngai {q}", fr: "Six kilos ?! Comment tu y es arrivé ?" },
      { thai: "ลดตั้งหกกิโล ทำยังไงบ้าง{Q}", rom: "lót tâng hòk kì-loo tham yang-ngai bâang {q}", fr: "Six kilos de moins ! Tu as fait comment ?" },
    ],
    5: [
      { thai: "{I}ได้นอนแค่วันละห้าชั่วโมง{P} ชอบเล่นโทรศัพท์บนเตียงจนดึก", rom: "{i} dâai nɔɔn khɛ̂ɛ wan lá hâa chûa-moong {p} chɔ̂ɔp lên thoo-rá-sàp bon tiang jon dʉ̀k", fr: "Je ne dors que cinq heures par jour, je traîne sur mon téléphone au lit jusqu’à tard." },
      { thai: "{I}นอนคืนละห้าชั่วโมงเท่านั้น{P} เพราะเล่นมือถือบนเตียงจนดึกทุกคืน", rom: "{i} nɔɔn khʉʉn lá hâa chûa-moong thâo-nán {p} phrɔ́ lên mʉʉ-thʉ̌ʉ bon tiang jon dʉ̀k thúk khʉʉn", fr: "Je dors seulement cinq heures par nuit, parce que je reste sur mon portable au lit tard chaque soir." },
    ],
    7: [
      { thai: "แล้วตื่นเช้าขนาดนั้นเพื่อไปวิ่งทุกวันเหรอ{Q}", rom: "lɛ́ɛo tʉ̀ʉn cháao khà-nàat nán phʉ̂a pai wîng thúk wan rə̌ə {q}", fr: "Et tu te lèves aussi tôt pour aller courir tous les jours ?" },
      { thai: "ตื่นเช้าแบบนั้น ไปวิ่งทุกวันเลยหรือเปล่า{Q}", rom: "tʉ̀ʉn cháao bɛ̀ɛp nán pai wîng thúk wan ləəi rʉ̌ʉ-plào {q}", fr: "Levé si tôt, tu vas courir chaque jour ?" },
    ],
    9: [
      { thai: "แล้ววันที่เหลือทำอะไร{Q}", rom: "lɛ́ɛo wan thîi lʉ̌a tham à-rai {q}", fr: "Et les jours qui restent, tu fais quoi ?" },
      { thai: "วันอื่นล่ะ ทำอะไรบ้าง{Q}", rom: "wan ʉ̀ʉn lâ tham à-rai bâang {q}", fr: "Et les autres jours, tu fais quoi ?" },
    ],
    11: [
      { thai: "แล้วเรื่องกิน ต้องเลิกกินข้าวไหม{Q}", rom: "lɛ́ɛo rʉ̂ang kin tɔ̂ng lə̂ək kin khâao mái {q}", fr: "Et pour manger, il faut arrêter le riz ?" },
      { thai: "แล้วอาหารล่ะ ต้องงดข้าวด้วยหรือเปล่า{Q}", rom: "lɛ́ɛo aa-hǎan lâ tɔ̂ng ngót khâao dûai rʉ̌ʉ-plào {q}", fr: "Et l’alimentation ? Il faut supprimer le riz ?" },
    ],
    13: [
      { thai: "ชาเย็นแก้วเดียวน้ำตาลเยอะมากเลยใช่ไหม{Q}", rom: "chaa-yen kɛ̂ɛo diao náam-taan yə́ mâak ləəi châi mái {q}", fr: "Un seul thé glacé, c’est plein de sucre, non ?" },
    ],
    15: [
      { thai: "น่าสนใจนะ{P} แต่{I}ไม่เคยวิ่งมาก่อนเลย กลัวจะวิ่งห้ากิโลไม่ไหว", rom: "nâa-sǒn-jai ná {p} tɛ̀ɛ {i} mâi khəəi wîng maa kɔ̀ɔn ləəi klua jà wîng hâa kì-loo mâi wǎi", fr: "Intéressant. Mais je n’ai jamais couru, j’ai peur de ne pas tenir cinq kilomètres." },
      { thai: "ฟังดูดี{P} แต่{I}ไม่เคยวิ่ง ห้ากิโลคงไม่ไหวแน่", rom: "fang duu dii {p} tɛ̀ɛ {i} mâi khəəi wîng hâa kì-loo khong mâi wǎi nɛ̂ɛ", fr: "Ça a l’air bien, mais je n’ai jamais couru, cinq kilomètres, je ne tiendrai sûrement pas." },
    ],
    17: [
      { thai: "งั้นขอไปวิ่งด้วยคนได้ไหม{Q} เริ่มวันพุธนี้เลย", rom: "ngán khɔ̌ɔ pai wîng dûai khon dâai mái {q} rə̂əm wan-phút níi ləəi", fr: "Alors je peux venir courir avec toi ? On commence ce mercredi." },
      { thai: "วันพุธนี้{I}ไปวิ่งด้วยได้ไหม{Q}", rom: "wan-phút níi {i} pai wîng dûai dâai mái {q}", fr: "Ce mercredi, je peux venir courir avec toi ?" },
    ],
    19: [
      { thai: "ได้{P} นัดกี่โมง ที่ไหน{Q}", rom: "dâai {p} nát kìi moong thîi-nǎi {q}", fr: "D’accord. Rendez-vous à quelle heure, et où ?" },
      { thai: "โอเค{P} เจอกันที่ไหน กี่โมง{Q}", rom: "oo-khee {p} jəə kan thîi-nǎi kìi moong {q}", fr: "OK. On se retrouve où, et à quelle heure ?" },
    ],
    21: [
      { thai: "ได้{P} คืนนี้{I}จะวางมือถือก่อนนอนเลย", rom: "dâai {p} khʉʉn-níi {i} jà waang mʉʉ-thʉ̌ʉ kɔ̀ɔn nɔɔn ləəi", fr: "D’accord. Ce soir, je pose mon téléphone avant de dormir." },
      { thai: "โอเค{P} เริ่มคืนนี้เลย {I}จะไม่เล่นมือถือก่อนนอน", rom: "oo-khee {p} rə̂əm khʉʉn-níi ləəi {i} jà mâi lên mʉʉ-thʉ̌ʉ kɔ̀ɔn nɔɔn", fr: "OK. Dès ce soir, plus de téléphone avant de dormir." },
    ],
  },
  "ld:b1-songkran-famille": {
    0: [
      { thai: "ปีนี้สงกรานต์กลับบ้านไหม{Q}", rom: "pii-níi sǒng-kraan klàp bâan mái {q}", fr: "Cette année, tu rentres chez toi pour Songkran ?" },
      { thai: "สงกรานต์ปีนี้กลับบ้านหรือเปล่า{Q}", rom: "sǒng-kraan pii-níi klàp bâan rʉ̌ʉ-plào {q}", fr: "Pour Songkran cette année, tu rentres chez toi ?" },
    ],
    2: [
      { thai: "สงกรานต์คือวันที่สิบสามถึงสิบห้าเมษาใช่ไหม{Q}", rom: "sǒng-kraan khʉʉ wan-thîi sìp-sǎam thʉ̌ng sìp-hâa mee-sǎa châi mái {q}", fr: "Songkran, c’est du 13 au 15 avril, non ?" },
      { thai: "สงกรานต์ตรงกับวันที่สิบสามถึงสิบห้าเมษายนใช่ไหม{Q}", rom: "sǒng-kraan trong kàp wan-thîi sìp-sǎam thʉ̌ng sìp-hâa mee-sǎa-yon châi mái {q}", fr: "Songkran tombe du 13 au 15 avril, c’est ça ?" },
    ],
    4: [
      { thai: "จะไปรถทัวร์เหรอ{Q}", rom: "jà pai rót-thua rə̌ə {q}", fr: "Tu vas y aller en car ?" },
      { thai: "นั่งรถทัวร์ไปหรือเปล่า{Q}", rom: "nâng rót-thua pai rʉ̌ʉ-plào {q}", fr: "Tu prends le car ?" },
    ],
    6: [
      { thai: "พอไปถึงหมู่บ้านแล้ว ทำอะไรกันบ้าง{Q}", rom: "phɔɔ pai thʉ̌ng mùu-bâan lɛ́ɛo tham à-rai kan bâang {q}", fr: "Une fois au village, vous faites quoi ?" },
      { thai: "ที่หมู่บ้านมีกิจกรรมอะไรบ้าง{Q}", rom: "thîi mùu-bâan mii kìt-jà-kam à-rai bâang {q}", fr: "Qu’est-ce qu’il y a comme activités au village ?" },
    ],
    8: [
      { thai: "ส่วนเธอล่ะ ทำอะไรบ้าง{Q}", rom: "sùan thəə lâ tham à-rai bâang {q}", fr: "Et toi, tu fais quoi ?" },
      { thai: "แล้วเธอต้องทำอะไรบ้าง{Q}", rom: "lɛ́ɛo thəə tɔ̂ng tham à-rai bâang {q}", fr: "Et toi, qu’est-ce que tu dois faire ?" },
    ],
    10: [
      { thai: "รดน้ำดำหัวคืออะไรเหรอ{Q}", rom: "rót náam dam hǔa khʉʉ à-rai rə̌ə {q}", fr: "Le « rod nam dam hua », c’est quoi ?" },
      { thai: "รดน้ำดำหัวทำยังไง{Q}", rom: "rót náam dam hǔa tham yang-ngai {q}", fr: "Le « rod nam dam hua », ça se fait comment ?" },
    ],
    12: [
      { thai: "น่ารักมาก{P} แล้วมีเล่นสาดน้ำด้วยไหม{Q}", rom: "nâa-rák mâak {p} lɛ́ɛo mii lên sàat náam dûai mái {q}", fr: "C’est très mignon. Et il y a aussi des batailles d’eau ?" },
      { thai: "น่ารักจัง{P} แล้วเล่นน้ำกันด้วยหรือเปล่า{Q}", rom: "nâa-rák jang {p} lɛ́ɛo lên náam kan dûai rʉ̌ʉ-plào {q}", fr: "Adorable. Et vous vous arrosez aussi ?" },
    ],
    14: [
      { thai: "สนุกมากเลย{P} {I}อยากเห็นสงกรานต์แบบนี้จัง ที่กรุงเทพฯ มีแต่นักท่องเที่ยว", rom: "sà-nùk mâak ləəi {p} {i} yàak hěn sǒng-kraan bɛ̀ɛp níi jang thîi krung-thêep mii tɛ̀ɛ nák-thɔ̂ng-thîao", fr: "Trop bien ! J’aimerais tellement voir un Songkran comme ça ; à Bangkok, il n’y a que des touristes." },
      { thai: "ฟังดูสนุกมาก{P} อยากลองสงกรานต์แบบนี้บ้าง เพราะที่กรุงเทพฯ มีแต่นักท่องเที่ยว", rom: "fang duu sà-nùk mâak {p} yàak lɔɔng sǒng-kraan bɛ̀ɛp níi bâang phrɔ́ thîi krung-thêep mii tɛ̀ɛ nák-thɔ̂ng-thîao", fr: "Ça a l’air génial. J’aimerais vivre un Songkran comme ça, parce qu’à Bangkok il n’y a que des touristes." },
    ],
    16: [
      { thai: "จริงเหรอ{Q} แต่{I}ทำงานถึงวันที่สิบสอง ไปวันที่สิบเอ็ดด้วยกันไม่ได้", rom: "jing rə̌ə {q} tɛ̀ɛ {i} tham-ngaan thʉ̌ng wan-thîi sìp-sɔ̌ɔng pai wan-thîi sìp-èt dûai-kan mâi dâai", fr: "C’est vrai ? Mais je travaille jusqu’au 12, je ne peux pas partir avec vous le 11." },
      { thai: "จริงเหรอ{Q} แต่วันที่สิบเอ็ด{I}ยังไปไม่ได้ ต้องทำงานถึงวันที่สิบสอง", rom: "jing rə̌ə {q} tɛ̀ɛ wan-thîi sìp-èt {i} yang pai mâi dâai tɔ̂ng tham-ngaan thʉ̌ng wan-thîi sìp-sɔ̌ɔng", fr: "Vraiment ? Mais le 11 je ne peux pas encore partir, je travaille jusqu’au 12." },
    ],
    18: [
      { thai: "ได้{P} แต่เช้าวันที่สิบสามทุกคนต้องไปวัดใช่ไหม{Q}", rom: "dâai {p} tɛ̀ɛ cháao wan-thîi sìp-sǎam thúk khon tɔ̂ng pai wát châi mái {q}", fr: "D’accord. Mais le matin du 13, tout le monde va au temple, c’est ça ?" },
      { thai: "โอเค{P} แต่เช้าวันที่สิบสามทุกคนอยู่ที่วัดไม่ใช่เหรอ{Q}", rom: "oo-khee {p} tɛ̀ɛ cháao wan-thîi sìp-sǎam thúk khon yùu thîi wát mâi-châi rə̌ə {q}", fr: "OK. Mais le matin du 13, vous êtes tous au temple, non ?" },
    ],
    20: [
      { thai: "แล้วควรซื้ออะไรไปฝากยายดี{Q}", rom: "lɛ́ɛo khuan sʉ́ʉ à-rai pai fàak yaai dii {q}", fr: "Et qu’est-ce que je devrais acheter pour ta grand-mère ?" },
      { thai: "{I}ควรเอาของฝากอะไรไปให้ยาย{Q}", rom: "{i} khuan ao khɔ̌ɔng-fàak à-rai pai hâi yaai {q}", fr: "Quel petit cadeau devrais-je apporter à ta grand-mère ?" },
    ],
    22: [
      { thai: "แล้วจะกลับกรุงเทพฯ วันไหน{Q}", rom: "lɛ́ɛo jà klàp krung-thêep wan nǎi {q}", fr: "Et on rentre à Bangkok quel jour ?" },
      { thai: "แล้วกลับกรุงเทพฯ วันที่เท่าไหร่{Q}", rom: "lɛ́ɛo klàp krung-thêep wan-thîi thâo-rài {q}", fr: "Et le retour à Bangkok, c’est le combien ?" },
    ],
    24: [
      { thai: "ตกลง{P} ขอบคุณมาก ปีนี้น่าจะเป็นสงกรานต์ที่พิเศษที่สุดของ{I}เลย", rom: "tòk-long {p} khɔ̀ɔp-khun mâak pii-níi nâa-jà pen sǒng-kraan thîi phí-sèet thîi-sùt khɔ̌ɔng {i} ləəi", fr: "D’accord. Merci beaucoup ! Cette année, ce sera sans doute mon Songkran le plus spécial." },
      { thai: "ได้เลย{P} ขอบคุณมากนะ สงกรานต์ปีนี้คงพิเศษที่สุดสำหรับ{I}", rom: "dâai ləəi {p} khɔ̀ɔp-khun mâak ná sǒng-kraan pii-níi khong phí-sèet thîi-sùt sǎm-ràp {i}", fr: "Avec plaisir. Merci beaucoup ! Ce Songkran sera sûrement le plus spécial pour moi." },
    ],
  },
  "ld:b1-entretien-construction": {
    1: [
      { thai: "สวัสดี{P} ขอบคุณที่ให้โอกาส{I}มาสัมภาษณ์{P}", rom: "sà-wàt-dii {p} khɔ̀ɔp-khun thîi hâi oo-kàat {i} maa sǎm-phâat {p}", fr: "Bonjour. Merci de me donner l’occasion de passer cet entretien." },
      { thai: "สวัสดี{P} ขอบคุณมากที่เชิญมา{P}", rom: "sà-wàt-dii {p} khɔ̀ɔp-khun mâak thîi chəən maa {p}", fr: "Bonjour. Merci beaucoup de m’avoir invité(e)." },
    ],
    3: [
      { thai: "{I}เป็นวิศวกรโยธา{P} ทำงานที่ฝรั่งเศสมาหกปี ส่วนมากสร้างสะพานกับถนน แล้วย้ายไปเวียดนาม ดูแลโครงการคอนโดอีกสองปี", rom: "{i} pen wít-sà-wá-kɔɔn yoo-thaa {p} tham-ngaan thîi fà-ràng-sèet maa hòk pii sùan-mâak sâang sà-phaan kàp thà-nǒn lɛ́ɛo yáai pai wîat-naam duu-lɛɛ khroo-kaan khɔn-doo ìik sɔ̌ɔng pii", fr: "Je suis ingénieur en génie civil. Six ans en France, surtout des ponts et des routes, puis le Vietnam, où j’ai supervisé un projet de condo pendant deux ans." },
    ],
    5: [
      { thai: "ภาษาแม่ของ{I}คือภาษาฝรั่งเศส{P} พูดภาษาอังกฤษคล่อง ส่วนภาษาไทยเรียนมาสองปี พูดคุยได้ แต่อ่านเอกสารเทคนิคยังไม่ค่อยได้", rom: "phaa-sǎa mɛ̂ɛ khɔ̌ɔng {i} khʉʉ phaa-sǎa fà-ràng-sèet {p} phûut phaa-sǎa ang-krìt khlɔ̂ng sùan phaa-sǎa thai rian maa sɔ̌ɔng pii phûut-khui dâai tɛ̀ɛ àan èek-kà-sǎan thék-ník yang mâi khɔ̂i dâai", fr: "Ma langue maternelle est le français, je parle couramment anglais, et le thaï je l’étudie depuis deux ans : je peux converser, mais j’ai du mal avec les documents techniques." },
    ],
    7: [
      { thai: "ใช้ได้{P} {I}ใช้ทุกวันมาแปดปีแล้ว", rom: "chái dâai {p} {i} chái thúk wan maa pɛ̀ɛt pii lɛ́ɛo", fr: "Oui, je l’utilise tous les jours depuis huit ans." },
      { thai: "ใช้คล่อง{P} ใช้ทุกวันมาตลอดแปดปี", rom: "chái khlɔ̂ng {p} chái thúk wan maa tà-lɔ̀ɔt pɛ̀ɛt pii", fr: "Je le maîtrise, je m’en sers tous les jours depuis huit ans." },
    ],
    9: [
      { thai: "เคยใช้ปีเดียว{P} ตอนทำงานที่เวียดนาม ยังไม่ค่อยคล่อง แต่{I}เรียนเร็ว", rom: "khəəi chái pii diao {p} tɔɔn tham-ngaan thîi wîat-naam yang mâi khɔ̂i khlɔ̂ng tɛ̀ɛ {i} rian reo", fr: "Je l’ai utilisé un an, quand je travaillais au Vietnam. Je ne suis pas encore à l’aise, mais j’apprends vite." },
      { thai: "ใช้แค่ปีเดียวตอนอยู่เวียดนาม{P} ยังไม่เก่ง แต่{I}เรียนรู้ได้เร็ว", rom: "chái khɛ̂ɛ pii diao tɔɔn yùu wîat-naam {p} yang mâi kèng tɛ̀ɛ {i} rian-rúu dâai reo", fr: "Seulement un an, au Vietnam. Je ne suis pas encore bon, mais j’apprends vite." },
    ],
    11: [
      { thai: "ดีเลย{P} แล้วตำแหน่งนี้ต้องประจำที่พัทยาตลอดหรือเปล่า{Q}", rom: "dii ləəi {p} lɛ́ɛo tam-nɛ̀ng níi tɔ̂ng prà-jam thîi phát-thá-yaa tà-lɔ̀ɔt rʉ̌ʉ-plào {q}", fr: "Parfait. Et ce poste est basé à Pattaya en permanence ?" },
      { thai: "ดีมาก{P} งานนี้ต้องอยู่พัทยาตลอดเลยไหม{Q}", rom: "dii mâak {p} ngaan níi tɔ̂ng yùu phát-thá-yaa tà-lɔ̀ɔt ləəi mái {q}", fr: "Très bien. Pour ce travail, il faut rester à Pattaya tout le temps ?" },
    ],
    13: [
      { thai: "เข้าใจ{P} แล้วเรื่องเงินเดือนล่ะ{Q}", rom: "khâo-jai {p} lɛ́ɛo rʉ̂ang ngən-dʉan lâ {q}", fr: "Je comprends. Et pour le salaire ?" },
      { thai: "เข้าใจแล้ว{P} แล้วเงินเดือนประมาณเท่าไหร่{Q}", rom: "khâo-jai lɛ́ɛo {p} lɛ́ɛo ngən-dʉan prà-maan thâo-rài {q}", fr: "Je vois. Et le salaire, c’est environ combien ?" },
    ],
    15: [
      { thai: "เพราะ{I}มีประสบการณ์แปดปีและพูดได้สามภาษา {I}เลยหวังไว้ที่ประมาณหนึ่งแสน{P}", rom: "phrɔ́ {i} mii prà-sòp-kaan pɛ̀ɛt pii lɛ́ phûut dâai sǎam phaa-sǎa {i} ləəi wǎng wái thîi prà-maan nʉ̀ng-sɛ̌ɛn {p}", fr: "Comme j’ai huit ans d’expérience et que je parle trois langues, j’espérais environ 100 000." },
      { thai: "{I}ทำงานมาแปดปี แล้วก็พูดได้สามภาษา เลยอยากได้ประมาณหนึ่งแสนบาท{P}", rom: "{i} tham-ngaan maa pɛ̀ɛt pii lɛ́ɛo-kɔ̂ɔ phûut dâai sǎam phaa-sǎa ləəi yàak dâai prà-maan nʉ̀ng-sɛ̌ɛn bàat {p}", fr: "J’ai huit ans de métier et je parle trois langues, alors je souhaiterais environ 100 000 bahts." },
    ],
    17: [
      { thai: "ยุติธรรมดี{P} {I}ตกลงรับข้อเสนอนี้{P}", rom: "yú-tì-tham dii {p} {i} tòk-long ráp khɔ̂ɔ-sà-nə̌ə níi {p}", fr: "C’est juste. J’accepte cette proposition." },
      { thai: "ฟังดูยุติธรรม{P} ตกลง{P}", rom: "fang duu yú-tì-tham {p} tòk-long {p}", fr: "Ça me semble juste. D’accord." },
    ],
    19: [
      { thai: "วันที่หนึ่งไม่น่าจะได้{P} {I}ต้องแจ้งบริษัทที่ทำอยู่ล่วงหน้าหนึ่งเดือน ขอเริ่มสิบห้ามิถุนายนได้ไหม{Q}", rom: "wan-thîi nʉ̀ng mâi nâa-jà dâai {p} {i} tɔ̂ng jɛ̂ɛng bɔɔ-rí-sàt thîi tham yùu lûang-nâa nʉ̀ng dʉan khɔ̌ɔ rə̂əm sìp-hâa mí-thù-naa-yon dâai mái {q}", fr: "Le 1er, ça ne sera probablement pas possible : je dois prévenir mon employeur actuel un mois à l’avance. Je peux commencer le 15 juin ?" },
      { thai: "วันที่หนึ่งคงยังไม่ได้{P} {I}ต้องบอกที่ทำงานปัจจุบันล่วงหน้าหนึ่งเดือน เริ่มวันที่สิบห้ามิถุนายนแทนได้ไหม{Q}", rom: "wan-thîi nʉ̀ng khong yang mâi dâai {p} {i} tɔ̂ng bɔ̀ɔk thîi-tham-ngaan pàt-jù-ban lûang-nâa nʉ̀ng dʉan rə̂əm wan-thîi sìp-hâa mí-thù-naa-yon thɛɛn dâai mái {q}", fr: "Le 1er, ce ne sera pas possible, je dois donner un mois de préavis à mon travail actuel. Je peux commencer le 15 juin à la place ?" },
    ],
    21: [
      { thai: "ได้{P} ต้องเตรียมเอกสารอะไรบ้าง{Q}", rom: "dâai {p} tɔ̂ng triam èek-kà-sǎan à-rai bâang {q}", fr: "D’accord. Quels documents dois-je préparer ?" },
      { thai: "ตกลง{P} แล้ว{I}ต้องเตรียมเอกสารอะไรไหม{Q}", rom: "tòk-long {p} lɛ́ɛo {i} tɔ̂ng triam èek-kà-sǎan à-rai mái {q}", fr: "Entendu. Et je dois préparer des documents ?" },
    ],
    23: [
      { thai: "ขอบคุณมาก{P} ภายในอาทิตย์นี้{I}จะส่งเอกสารให้", rom: "khɔ̀ɔp-khun mâak {p} phaai-nai aa-thít níi {i} jà sòng èek-kà-sǎan hâi", fr: "Merci beaucoup. D’ici la fin de la semaine, je vous envoie les documents." },
      { thai: "ขอบคุณ{P} {I}จะส่งเอกสารทั้งหมดมาให้ไม่เกินอาทิตย์นี้", rom: "khɔ̀ɔp-khun {p} {i} jà sòng èek-kà-sǎan tháng-mòt maa hâi mâi kəən aa-thít níi", fr: "Merci. Je vous envoie tous les documents cette semaine au plus tard." },
    ],
  },
};
