// Généré depuis la maquette d'origine par scripts/gen-content.mjs, puis maintenu à la main.
import type { Reading } from '../types';
import { EXTRA_READINGS } from './readingsExtra';

export const READINGS: Reading[] = [
  {
    id: "r:r1", level: 1, title: { fr: "Grand-père et le crabe" },
    sentences: [
      { tr: { fr: "Grand-père vient." }, tokens: [
        { thai: "ตา", rom: "taa", gloss: { fr: "grand-père (maternel)" } },
        { thai: "มา", rom: "maa", gloss: { fr: "venir" } },
      ] },
      { tr: { fr: "Grand-père regarde le crabe." }, tokens: [
        { thai: "ตา", rom: "taa", gloss: { fr: "grand-père" } },
        { thai: "ดู", rom: "duu", gloss: { fr: "regarder" } },
        { thai: "ปู", rom: "puu", gloss: { fr: "crabe" } },
      ] },
      { tr: { fr: "Le crabe a des pattes." }, tokens: [
        { thai: "ปู", rom: "puu", gloss: { fr: "crabe" } },
        { thai: "มี", rom: "mii", gloss: { fr: "avoir" } },
        { thai: "ขา", rom: "khǎa", gloss: { fr: "patte, jambe" } },
      ] },
      { tr: { fr: "L'oncle a une rizière." }, tokens: [
        { thai: "อา", rom: "aa", gloss: { fr: "oncle, tante (cadet du père)" } },
        { thai: "มี", rom: "mii", gloss: { fr: "avoir" } },
        { thai: "นา", rom: "naa", gloss: { fr: "rizière" } },
      ] },
    ],
  },
  {
    id: "r:r2", level: 1, title: { fr: "Papa et maman" },
    sentences: [
      { tr: { fr: "Maman vient." }, tokens: [
        { thai: "แม่", rom: "mɛ̂ɛ", gloss: { fr: "mère" } },
        { thai: "มา", rom: "maa", gloss: { fr: "venir" } },
      ] },
      { tr: { fr: "Papa va à la rizière." }, tokens: [
        { thai: "พ่อ", rom: "phɔ̂ɔ", gloss: { fr: "père" } },
        { thai: "ไป", rom: "pai", gloss: { fr: "aller" } },
        { thai: "นา", rom: "naa", gloss: { fr: "rizière" } },
      ] },
      { tr: { fr: "Maman regarde la télé." }, tokens: [
        { thai: "แม่", rom: "mɛ̂ɛ", gloss: { fr: "mère" } },
        { thai: "ดู", rom: "duu", gloss: { fr: "regarder" } },
        { thai: "ทีวี", rom: "thii-wii", gloss: { fr: "télévision" } },
      ] },
      { tr: { fr: "Papa mange (du riz)." }, tokens: [
        { thai: "พ่อ", rom: "phɔ̂ɔ", gloss: { fr: "père" } },
        { thai: "กิน", rom: "kin", gloss: { fr: "manger" } },
        { thai: "ข้าว", rom: "khâao", gloss: { fr: "riz" } },
      ] },
    ],
  },
  {
    id: "r:r3", level: 2, title: { fr: "Je me présente" },
    sentences: [
      { tr: { fr: "Je m'appelle {n}." }, tokens: [
        { thai: "{I}", rom: "{i}", gloss: { fr: "je" } },
        { thai: "ชื่อ", rom: "chʉ̂ʉ", gloss: { fr: "s'appeler ; nom" } },
        { thai: "{N}", rom: "{n}", gloss: { fr: "(votre prénom)" } },
      ] },
      { tr: { fr: "Je suis ingénieur." }, tokens: [
        { thai: "{I}", rom: "{i}", gloss: { fr: "je" } },
        { thai: "เป็น", rom: "pen", gloss: { fr: "être" } },
        { thai: "วิศวกร", rom: "wít-sà-wá-kɔɔn", gloss: { fr: "ingénieur" } },
      ] },
      { tr: { fr: "Je viens de Belgique." }, tokens: [
        { thai: "{I}", rom: "{i}", gloss: { fr: "je" } },
        { thai: "มา", rom: "maa", gloss: { fr: "venir" } },
        { thai: "จาก", rom: "jàak", gloss: { fr: "de" } },
        { thai: "เบลเยียม", rom: "ben-yîam", gloss: { fr: "Belgique" } },
      ] },
      { tr: { fr: "J'aime la cuisine thaïe." }, tokens: [
        { thai: "{I}", rom: "{i}", gloss: { fr: "je" } },
        { thai: "ชอบ", rom: "chɔ̂ɔp", gloss: { fr: "aimer bien" } },
        { thai: "อาหาร", rom: "aa-hǎan", gloss: { fr: "nourriture" } },
        { thai: "ไทย", rom: "thai", gloss: { fr: "thaï" } },
      ] },
    ],
  },
  {
    id: "r:r4", level: 2, title: { fr: "Au café" },
    sentences: [
      { tr: { fr: "J'ai envie de boire un café." }, tokens: [
        { thai: "{I}", rom: "{i}", gloss: { fr: "je" } },
        { thai: "อยาก", rom: "yàak", gloss: { fr: "avoir envie de" } },
        { thai: "ดื่ม", rom: "dʉ̀ʉm", gloss: { fr: "boire" } },
        { thai: "กาแฟ", rom: "kaa-fɛɛ", gloss: { fr: "café" } },
      ] },
      { tr: { fr: "Un café chaud." }, tokens: [
        { thai: "กาแฟ", rom: "kaa-fɛɛ", gloss: { fr: "café" } },
        { thai: "ร้อน", rom: "rɔ́ɔn", gloss: { fr: "chaud" } },
        { thai: "หนึ่ง", rom: "nʉ̀ng", gloss: { fr: "un" } },
        { thai: "แก้ว", rom: "kɛ̂ɛo", gloss: { fr: "verre (classificateur)" } },
      ] },
      { tr: { fr: "Sans sucre." }, tokens: [
        { thai: "ไม่", rom: "mâi", gloss: { fr: "ne… pas" } },
        { thai: "ใส่", rom: "sài", gloss: { fr: "mettre" } },
        { thai: "น้ำตาล", rom: "náam-taan", gloss: { fr: "sucre" } },
      ] },
      { tr: { fr: "C'est cinquante bahts." }, tokens: [
        { thai: "ห้าสิบ", rom: "hâa-sìp", gloss: { fr: "cinquante" } },
        { thai: "บาท", rom: "bàat", gloss: { fr: "baht" } },
      ] },
    ],
  },
  {
    id: "r:r5", level: 3, title: { fr: "Au marché" },
    sentences: [
      { tr: { fr: "Aujourd'hui je vais au marché." }, tokens: [
        { thai: "วันนี้", rom: "wan-níi", gloss: { fr: "aujourd'hui" } },
        { thai: "{I}", rom: "{i}", gloss: { fr: "je" } },
        { thai: "ไป", rom: "pai", gloss: { fr: "aller" } },
        { thai: "ตลาด", rom: "tà-làat", gloss: { fr: "marché" } },
      ] },
      { tr: { fr: "J'achète des fruits." }, tokens: [
        { thai: "{I}", rom: "{i}", gloss: { fr: "je" } },
        { thai: "ซื้อ", rom: "sʉ́ʉ", gloss: { fr: "acheter" } },
        { thai: "ผลไม้", rom: "phǒn-lá-máai", gloss: { fr: "fruits" } },
      ] },
      { tr: { fr: "Les mangues sont délicieuses." }, tokens: [
        { thai: "มะม่วง", rom: "má-mûang", gloss: { fr: "mangue" } },
        { thai: "อร่อย", rom: "à-rɔ̀i", gloss: { fr: "délicieux" } },
        { thai: "มาก", rom: "mâak", gloss: { fr: "très" } },
      ] },
      { tr: { fr: "Le prix n'est pas élevé." }, tokens: [
        { thai: "ราคา", rom: "raa-khaa", gloss: { fr: "prix" } },
        { thai: "ไม่", rom: "mâi", gloss: { fr: "ne… pas" } },
        { thai: "แพง", rom: "phɛɛng", gloss: { fr: "cher" } },
      ] },
      { tr: { fr: "La vendeuse est très gentille." }, tokens: [
        { thai: "แม่ค้า", rom: "mɛ̂ɛ-kháa", gloss: { fr: "vendeuse" } },
        { thai: "ใจดี", rom: "jai-dii", gloss: { fr: "gentil" } },
        { thai: "มาก", rom: "mâak", gloss: { fr: "très" } },
      ] },
    ],
  },
  {
    id: "r:r6", level: 3, title: { fr: "Ma journée" },
    sentences: [
      { tr: { fr: "Je me réveille à six heures du matin." }, tokens: [
        { thai: "{I}", rom: "{i}", gloss: { fr: "je" } },
        { thai: "ตื่น", rom: "tʉ̀ʉn", gloss: { fr: "se réveiller" } },
        { thai: "หก", rom: "hòk", gloss: { fr: "six" } },
        { thai: "โมง", rom: "moong", gloss: { fr: "heure" } },
        { thai: "เช้า", rom: "cháao", gloss: { fr: "matin" } },
      ] },
      { tr: { fr: "Je mange puis je vais travailler." }, tokens: [
        { thai: "{I}", rom: "{i}", gloss: { fr: "je" } },
        { thai: "กิน", rom: "kin", gloss: { fr: "manger" } },
        { thai: "ข้าว", rom: "khâao", gloss: { fr: "riz, repas" } },
        { thai: "แล้ว", rom: "lɛ́ɛo", gloss: { fr: "puis" } },
        { thai: "ไป", rom: "pai", gloss: { fr: "aller" } },
        { thai: "ทำงาน", rom: "tham-ngaan", gloss: { fr: "travailler" } },
      ] },
      { tr: { fr: "Aujourd'hui il y a une réunion." }, tokens: [
        { thai: "วันนี้", rom: "wan-níi", gloss: { fr: "aujourd'hui" } },
        { thai: "มี", rom: "mii", gloss: { fr: "il y a" } },
        { thai: "ประชุม", rom: "prà-chum", gloss: { fr: "réunion" } },
      ] },
      { tr: { fr: "Le soir, je rentre à la maison." }, tokens: [
        { thai: "ตอน", rom: "tɔɔn", gloss: { fr: "moment" } },
        { thai: "เย็น", rom: "yen", gloss: { fr: "soir" } },
        { thai: "{I}", rom: "{i}", gloss: { fr: "je" } },
        { thai: "กลับ", rom: "klàp", gloss: { fr: "rentrer" } },
        { thai: "บ้าน", rom: "bâan", gloss: { fr: "maison" } },
      ] },
      { tr: { fr: "Je suis fatigué mais heureux." }, tokens: [
        { thai: "{I}", rom: "{i}", gloss: { fr: "je" } },
        { thai: "เหนื่อย", rom: "nʉ̀ai", gloss: { fr: "fatigué" } },
        { thai: "แต่", rom: "tɛ̀ɛ", gloss: { fr: "mais" } },
        { thai: "มี", rom: "mii", gloss: { fr: "avoir" } },
        { thai: "ความสุข", rom: "khwaam-sùk", gloss: { fr: "bonheur" } },
      ] },
    ],
  },
  {
    id: "r:r7", level: 4, title: { fr: "Sur le chantier" },
    sentences: [
      { tr: { fr: "Je suis ingénieur en structure." }, tokens: [
        { thai: "{I}", rom: "{i}", gloss: { fr: "je" } },
        { thai: "เป็น", rom: "pen", gloss: { fr: "être" } },
        { thai: "วิศวกร", rom: "wít-sà-wá-kɔɔn", gloss: { fr: "ingénieur" } },
        { thai: "โครงสร้าง", rom: "khroong-sâang", gloss: { fr: "structure" } },
      ] },
      { tr: { fr: "Aujourd'hui je vais inspecter un nouveau bâtiment." }, tokens: [
        { thai: "วันนี้", rom: "wan-níi", gloss: { fr: "aujourd'hui" } },
        { thai: "{I}", rom: "{i}", gloss: { fr: "je" } },
        { thai: "ไป", rom: "pai", gloss: { fr: "aller" } },
        { thai: "ตรวจสอบ", rom: "trùat-sɔ̀ɔp", gloss: { fr: "inspecter" } },
        { thai: "อาคาร", rom: "aa-khaan", gloss: { fr: "bâtiment" } },
        { thai: "ใหม่", rom: "mài", gloss: { fr: "nouveau" } },
      ] },
      { tr: { fr: "Ce bâtiment a cinq niveaux." }, tokens: [
        { thai: "อาคาร", rom: "aa-khaan", gloss: { fr: "bâtiment" } },
        { thai: "นี้", rom: "níi", gloss: { fr: "ce…-ci" } },
        { thai: "มี", rom: "mii", gloss: { fr: "avoir" } },
        { thai: "ห้า", rom: "hâa", gloss: { fr: "cinq" } },
        { thai: "ชั้น", rom: "chán", gloss: { fr: "niveau" } },
      ] },
      { tr: { fr: "Les poteaux et les poutres sont en béton armé." }, tokens: [
        { thai: "เสา", rom: "sǎo", gloss: { fr: "poteau" } },
        { thai: "และ", rom: "lɛ́", gloss: { fr: "et" } },
        { thai: "คาน", rom: "khaan", gloss: { fr: "poutre" } },
        { thai: "เป็น", rom: "pen", gloss: { fr: "être" } },
        { thai: "คอนกรีตเสริมเหล็ก", rom: "khɔɔn-krìit sə̌əm lèk", gloss: { fr: "béton armé" } },
      ] },
      { tr: { fr: "Je vois une fissure sur la poutre du deuxième niveau." }, tokens: [
        { thai: "{I}", rom: "{i}", gloss: { fr: "je" } },
        { thai: "เห็น", rom: "hěn", gloss: { fr: "voir" } },
        { thai: "รอยร้าว", rom: "rɔɔi-ráao", gloss: { fr: "fissure" } },
        { thai: "ที่", rom: "thîi", gloss: { fr: "à, sur" } },
        { thai: "คาน", rom: "khaan", gloss: { fr: "poutre" } },
        { thai: "ชั้น", rom: "chán", gloss: { fr: "niveau" } },
        { thai: "สอง", rom: "sɔ̌ɔng", gloss: { fr: "deux" } },
      ] },
      { tr: { fr: "Il faut recalculer avant de couler le béton." }, tokens: [
        { thai: "ต้อง", rom: "tɔ̂ng", gloss: { fr: "devoir" } },
        { thai: "คำนวณ", rom: "kham-nuan", gloss: { fr: "calculer" } },
        { thai: "ใหม่", rom: "mài", gloss: { fr: "à nouveau" } },
        { thai: "ก่อน", rom: "kɔ̀ɔn", gloss: { fr: "avant" } },
        { thai: "เท", rom: "thee", gloss: { fr: "verser" } },
        { thai: "คอนกรีต", rom: "khɔɔn-krìit", gloss: { fr: "béton" } },
      ] },
    ],
  },
  {
    id: "r:r8", level: 4, title: { fr: "Visite à l'hôpital" },
    sentences: [
      { tr: { fr: "Aujourd'hui je vais à l'hôpital." }, tokens: [
        { thai: "วันนี้", rom: "wan-níi", gloss: { fr: "aujourd'hui" } },
        { thai: "{I}", rom: "{i}", gloss: { fr: "je" } },
        { thai: "ไป", rom: "pai", gloss: { fr: "aller" } },
        { thai: "โรงพยาบาล", rom: "roong-phá-yaa-baan", gloss: { fr: "hôpital" } },
      ] },
      { tr: { fr: "Je vais rendre visite à un ami." }, tokens: [
        { thai: "{I}", rom: "{i}", gloss: { fr: "je" } },
        { thai: "ไป", rom: "pai", gloss: { fr: "aller" } },
        { thai: "เยี่ยม", rom: "yîam", gloss: { fr: "rendre visite" } },
        { thai: "เพื่อน", rom: "phʉ̂an", gloss: { fr: "ami" } },
      ] },
      { tr: { fr: "Mon ami est dans la chambre 502, au cinquième niveau." }, tokens: [
        { thai: "เพื่อน", rom: "phʉ̂an", gloss: { fr: "ami" } },
        { thai: "อยู่", rom: "yùu", gloss: { fr: "se trouver" } },
        { thai: "ห้อง", rom: "hɔ̂ng", gloss: { fr: "chambre" } },
        { thai: "ห้าศูนย์สอง", rom: "hâa-sǔun-sɔ̌ɔng", gloss: { fr: "cinq-zéro-deux" } },
        { thai: "ชั้น", rom: "chán", gloss: { fr: "niveau" } },
        { thai: "ห้า", rom: "hâa", gloss: { fr: "cinq" } },
      ] },
      { tr: { fr: "Le médecin dit que son état s'est amélioré." }, tokens: [
        { thai: "หมอ", rom: "mɔ̌ɔ", gloss: { fr: "médecin" } },
        { thai: "บอก", rom: "bɔ̀ɔk", gloss: { fr: "dire" } },
        { thai: "ว่า", rom: "wâa", gloss: { fr: "que" } },
        { thai: "อาการ", rom: "aa-kaan", gloss: { fr: "état, symptômes" } },
        { thai: "ดีขึ้น", rom: "dii-khʉ̂n", gloss: { fr: "s'améliorer" } },
        { thai: "แล้ว", rom: "lɛ́ɛo", gloss: { fr: "déjà" } },
      ] },
      { tr: { fr: "Je suis très content." }, tokens: [
        { thai: "{I}", rom: "{i}", gloss: { fr: "je" } },
        { thai: "ดีใจ", rom: "dii-jai", gloss: { fr: "content" } },
        { thai: "มาก", rom: "mâak", gloss: { fr: "très" } },
      ] },
    ],
  },
  {
    id: "r:r9", level: 5, title: { fr: "Voyage à Chiang Mai" },
    sentences: [
      { tr: { fr: "La semaine prochaine j'irai à Chiang Mai." }, tokens: [
        { thai: "อาทิตย์", rom: "aa-thít", gloss: { fr: "semaine" } },
        { thai: "หน้า", rom: "nâa", gloss: { fr: "prochain" } },
        { thai: "{I}", rom: "{i}", gloss: { fr: "je" } },
        { thai: "จะ", rom: "jà", gloss: { fr: "(futur)" } },
        { thai: "ไป", rom: "pai", gloss: { fr: "aller" } },
        { thai: "เชียงใหม่", rom: "chiang-mài", gloss: { fr: "Chiang Mai" } },
      ] },
      { tr: { fr: "J'irai en avion." }, tokens: [
        { thai: "{I}", rom: "{i}", gloss: { fr: "je" } },
        { thai: "จะ", rom: "jà", gloss: { fr: "(futur)" } },
        { thai: "ไป", rom: "pai", gloss: { fr: "aller" } },
        { thai: "โดย", rom: "dooi", gloss: { fr: "par" } },
        { thai: "เครื่องบิน", rom: "khrʉ̂ang-bin", gloss: { fr: "avion" } },
      ] },
      { tr: { fr: "Cela prend environ une heure." }, tokens: [
        { thai: "ใช้", rom: "chái", gloss: { fr: "utiliser" } },
        { thai: "เวลา", rom: "wee-laa", gloss: { fr: "temps" } },
        { thai: "ประมาณ", rom: "prà-maan", gloss: { fr: "environ" } },
        { thai: "หนึ่ง", rom: "nʉ̀ng", gloss: { fr: "un" } },
        { thai: "ชั่วโมง", rom: "chûa-moong", gloss: { fr: "heure" } },
      ] },
      { tr: { fr: "Là-bas il fait plus frais qu'à Bangkok." }, tokens: [
        { thai: "ที่นั่น", rom: "thîi-nân", gloss: { fr: "là-bas" } },
        { thai: "อากาศ", rom: "aa-kàat", gloss: { fr: "temps, air" } },
        { thai: "เย็น", rom: "yen", gloss: { fr: "frais" } },
        { thai: "กว่า", rom: "kwàa", gloss: { fr: "plus… que" } },
        { thai: "กรุงเทพ", rom: "krung-thêep", gloss: { fr: "Bangkok" } },
      ] },
      { tr: { fr: "J'ai envie d'aller au temple et de manger du khao soi." }, tokens: [
        { thai: "{I}", rom: "{i}", gloss: { fr: "je" } },
        { thai: "อยาก", rom: "yàak", gloss: { fr: "avoir envie de" } },
        { thai: "ไป", rom: "pai", gloss: { fr: "aller" } },
        { thai: "วัด", rom: "wát", gloss: { fr: "temple" } },
        { thai: "และ", rom: "lɛ́", gloss: { fr: "et" } },
        { thai: "กิน", rom: "kin", gloss: { fr: "manger" } },
        { thai: "ข้าวซอย", rom: "khâao-sɔɔi", gloss: { fr: "khao soi (nouilles au curry du Nord)" } },
      ] },
    ],
  },
  {
    id: "r:r10", level: 5, title: { fr: "Message à un ami" },
    sentences: [
      { tr: { fr: "Salut, quoi de neuf ?" }, tokens: [
        { thai: "สวัสดี", rom: "sà-wàt-dii", gloss: { fr: "bonjour" } },
        { thai: "เป็นไงบ้าง", rom: "pen-ngai bâang", gloss: { fr: "quoi de neuf" } },
      ] },
      { tr: { fr: "Tu es libre ce samedi ?" }, tokens: [
        { thai: "เสาร์", rom: "sǎo", gloss: { fr: "samedi" } },
        { thai: "นี้", rom: "níi", gloss: { fr: "ce…-ci" } },
        { thai: "ว่าง", rom: "wâang", gloss: { fr: "libre" } },
        { thai: "ไหม", rom: "mái", gloss: { fr: "(question)" } },
      ] },
      { tr: { fr: "J'aimerais t'inviter à aller manger." }, tokens: [
        { thai: "{I}", rom: "{i}", gloss: { fr: "je" } },
        { thai: "อยาก", rom: "yàak", gloss: { fr: "avoir envie de" } },
        { thai: "ชวน", rom: "chuan", gloss: { fr: "inviter" } },
        { thai: "ไป", rom: "pai", gloss: { fr: "aller" } },
        { thai: "กิน", rom: "kin", gloss: { fr: "manger" } },
        { thai: "ข้าว", rom: "khâao", gloss: { fr: "riz, repas" } },
      ] },
      { tr: { fr: "Un restaurant de l'Isan vient d'ouvrir près de chez moi." }, tokens: [
        { thai: "มี", rom: "mii", gloss: { fr: "il y a" } },
        { thai: "ร้านอาหาร", rom: "ráan-aa-hǎan", gloss: { fr: "restaurant" } },
        { thai: "อีสาน", rom: "ii-sǎan", gloss: { fr: "Isan (Nord-Est)" } },
        { thai: "เปิด", rom: "pə̀ət", gloss: { fr: "ouvrir" } },
        { thai: "ใหม่", rom: "mài", gloss: { fr: "nouvellement" } },
        { thai: "ใกล้", rom: "klâi", gloss: { fr: "près de" } },
        { thai: "บ้าน", rom: "bâan", gloss: { fr: "maison" } },
        { thai: "{I}", rom: "{i}", gloss: { fr: "moi" } },
      ] },
      { tr: { fr: "Si tu es libre, dis-le-moi." }, tokens: [
        { thai: "ถ้า", rom: "thâa", gloss: { fr: "si" } },
        { thai: "ว่าง", rom: "wâang", gloss: { fr: "libre" } },
        { thai: "บอก", rom: "bɔ̀ɔk", gloss: { fr: "dire" } },
        { thai: "{I}", rom: "{i}", gloss: { fr: "moi" } },
        { thai: "นะ", rom: "ná", gloss: { fr: "(adoucit)" } },
      ] },
    ],
  },
  {
    id: "r:r11", level: 2, title: { fr: "Le chat et le chien" },
    sentences: [
      { tr: { fr: "Le chat est dans la maison." }, tokens: [
        { thai: "แมว", rom: "mɛɛo", gloss: { fr: "chat" } },
        { thai: "อยู่", rom: "yùu", gloss: { fr: "se trouver" } },
        { thai: "ใน", rom: "nai", gloss: { fr: "dans" } },
        { thai: "บ้าน", rom: "bâan", gloss: { fr: "maison" } },
      ] },
      { tr: { fr: "Le chat aime manger du poisson." }, tokens: [
        { thai: "แมว", rom: "mɛɛo", gloss: { fr: "chat" } },
        { thai: "ชอบ", rom: "chɔ̂ɔp", gloss: { fr: "aimer bien" } },
        { thai: "กิน", rom: "kin", gloss: { fr: "manger" } },
        { thai: "ปลา", rom: "plaa", gloss: { fr: "poisson" } },
      ] },
      { tr: { fr: "Le chien n'aime pas le chat." }, tokens: [
        { thai: "หมา", rom: "mǎa", gloss: { fr: "chien" } },
        { thai: "ไม่", rom: "mâi", gloss: { fr: "ne… pas" } },
        { thai: "ชอบ", rom: "chɔ̂ɔp", gloss: { fr: "aimer bien" } },
        { thai: "แมว", rom: "mɛɛo", gloss: { fr: "chat" } },
      ] },
      { tr: { fr: "Le chat dort sur la chaise." }, tokens: [
        { thai: "แมว", rom: "mɛɛo", gloss: { fr: "chat" } },
        { thai: "นอน", rom: "nɔɔn", gloss: { fr: "dormir" } },
        { thai: "บน", rom: "bon", gloss: { fr: "sur" } },
        { thai: "เก้าอี้", rom: "kâo-îi", gloss: { fr: "chaise" } },
      ] },
    ],
  },
  {
    id: "r:r12", level: 3, title: { fr: "Un jour de fièvre" },
    sentences: [
      { tr: { fr: "Aujourd'hui je ne me sens pas bien." }, tokens: [
        { thai: "วันนี้", rom: "wan-níi", gloss: { fr: "aujourd'hui" } },
        { thai: "{I}", rom: "{i}", gloss: { fr: "je" } },
        { thai: "ไม่สบาย", rom: "mâi sà-baai", gloss: { fr: "ne pas se sentir bien" } },
      ] },
      { tr: { fr: "J'ai mal à la tête et de la fièvre." }, tokens: [
        { thai: "{I}", rom: "{i}", gloss: { fr: "je" } },
        { thai: "ปวดหัว", rom: "pùat-hǔa", gloss: { fr: "avoir mal à la tête" } },
        { thai: "และ", rom: "lɛ́", gloss: { fr: "et" } },
        { thai: "มี", rom: "mii", gloss: { fr: "avoir" } },
        { thai: "ไข้", rom: "khâi", gloss: { fr: "fièvre" } },
      ] },
      { tr: { fr: "Je vais à la pharmacie." }, tokens: [
        { thai: "{I}", rom: "{i}", gloss: { fr: "je" } },
        { thai: "ไป", rom: "pai", gloss: { fr: "aller" } },
        { thai: "ร้านขายยา", rom: "ráan-khǎai-yaa", gloss: { fr: "pharmacie" } },
      ] },
      { tr: { fr: "Le vendeur me donne un antidouleur." }, tokens: [
        { thai: "คนขาย", rom: "khon khǎai", gloss: { fr: "vendeur" } },
        { thai: "ให้", rom: "hâi", gloss: { fr: "donner" } },
        { thai: "ยาแก้ปวด", rom: "yaa kɛ̂ɛ pùat", gloss: { fr: "antidouleur" } },
      ] },
      { tr: { fr: "Je prends le médicament, puis je me repose." }, tokens: [
        { thai: "{I}", rom: "{i}", gloss: { fr: "je" } },
        { thai: "กิน", rom: "kin", gloss: { fr: "prendre (avaler)" } },
        { thai: "ยา", rom: "yaa", gloss: { fr: "médicament" } },
        { thai: "แล้ว", rom: "lɛ́ɛo", gloss: { fr: "puis" } },
        { thai: "นอน", rom: "nɔɔn", gloss: { fr: "dormir" } },
        { thai: "พัก", rom: "phák", gloss: { fr: "se reposer" } },
      ] },
      { tr: { fr: "Demain, ça ira sans doute mieux." }, tokens: [
        { thai: "พรุ่งนี้", rom: "phrûng-níi", gloss: { fr: "demain" } },
        { thai: "คง", rom: "khong", gloss: { fr: "sans doute" } },
        { thai: "ดีขึ้น", rom: "dii-khʉ̂n", gloss: { fr: "aller mieux" } },
      ] },
    ],
  },
  {
    id: "r:r13", level: 2, title: { fr: "Ma famille" },
    sentences: [
      { tr: { fr: "Ma famille compte quatre personnes." }, tokens: [
        { thai: "ครอบครัว", rom: "khrɔ̂ɔp-khrua", gloss: { fr: "famille" } },
        { thai: "{I}", rom: "{i}", gloss: { fr: "je, moi" } },
        { thai: "มี", rom: "mii", gloss: { fr: "avoir" } },
        { thai: "สี่", rom: "sìi", gloss: { fr: "quatre" } },
        { thai: "คน", rom: "khon", gloss: { fr: "personne" } },
      ] },
      { tr: { fr: "Mon père est médecin." }, tokens: [
        { thai: "พ่อ", rom: "phɔ̂ɔ", gloss: { fr: "père" } },
        { thai: "เป็น", rom: "pen", gloss: { fr: "être" } },
        { thai: "หมอ", rom: "mɔ̌ɔ", gloss: { fr: "médecin" } },
      ] },
      { tr: { fr: "Ma mère est enseignante." }, tokens: [
        { thai: "แม่", rom: "mɛ̂ɛ", gloss: { fr: "mère" } },
        { thai: "เป็น", rom: "pen", gloss: { fr: "être" } },
        { thai: "ครู", rom: "khruu", gloss: { fr: "enseignant" } },
      ] },
      { tr: { fr: "Ma petite sœur étudie à l'université." }, tokens: [
        { thai: "น้องสาว", rom: "nɔ́ɔng-sǎao", gloss: { fr: "petite sœur" } },
        { thai: "เรียน", rom: "rian", gloss: { fr: "étudier" } },
        { thai: "ที่", rom: "thîi", gloss: { fr: "à" } },
        { thai: "มหาวิทยาลัย", rom: "má-hǎa-wít-thá-yaa-lai", gloss: { fr: "université" } },
      ] },
      { tr: { fr: "Nous aimons manger ensemble." }, tokens: [
        { thai: "เรา", rom: "rao", gloss: { fr: "nous" } },
        { thai: "ชอบ", rom: "chɔ̂ɔp", gloss: { fr: "aimer bien" } },
        { thai: "กิน", rom: "kin", gloss: { fr: "manger" } },
        { thai: "ข้าว", rom: "khâao", gloss: { fr: "riz, repas" } },
        { thai: "ด้วยกัน", rom: "dûai-kan", gloss: { fr: "ensemble" } },
      ] },
    ],
  },
  {
    id: "r:r14", level: 3, title: { fr: "Le week-end" },
    sentences: [
      { tr: { fr: "Le samedi, je ne travaille pas." }, tokens: [
        { thai: "วันเสาร์", rom: "wan-sǎo", gloss: { fr: "samedi" } },
        { thai: "{I}", rom: "{i}", gloss: { fr: "je" } },
        { thai: "ไม่", rom: "mâi", gloss: { fr: "ne… pas" } },
        { thai: "ทำงาน", rom: "tham-ngaan", gloss: { fr: "travailler" } },
      ] },
      { tr: { fr: "Le matin, je vais courir au parc." }, tokens: [
        { thai: "ตอนเช้า", rom: "tɔɔn-cháao", gloss: { fr: "le matin" } },
        { thai: "{I}", rom: "{i}", gloss: { fr: "je" } },
        { thai: "ไป", rom: "pai", gloss: { fr: "aller" } },
        { thai: "วิ่ง", rom: "wîng", gloss: { fr: "courir" } },
        { thai: "ที่", rom: "thîi", gloss: { fr: "à" } },
        { thai: "สวน", rom: "sǔan", gloss: { fr: "parc, jardin" } },
      ] },
      { tr: { fr: "L'après-midi, je retrouve des amis." }, tokens: [
        { thai: "ตอนบ่าย", rom: "tɔɔn-bàai", gloss: { fr: "l'après-midi" } },
        { thai: "{I}", rom: "{i}", gloss: { fr: "je" } },
        { thai: "ไป", rom: "pai", gloss: { fr: "aller" } },
        { thai: "เจอ", rom: "jəə", gloss: { fr: "retrouver" } },
        { thai: "เพื่อน", rom: "phʉ̂an", gloss: { fr: "ami" } },
      ] },
      { tr: { fr: "Nous buvons un café et bavardons." }, tokens: [
        { thai: "เรา", rom: "rao", gloss: { fr: "nous" } },
        { thai: "ดื่ม", rom: "dʉ̀ʉm", gloss: { fr: "boire" } },
        { thai: "กาแฟ", rom: "kaa-fɛɛ", gloss: { fr: "café" } },
        { thai: "และ", rom: "lɛ́", gloss: { fr: "et" } },
        { thai: "คุย", rom: "khui", gloss: { fr: "bavarder" } },
        { thai: "กัน", rom: "kan", gloss: { fr: "ensemble" } },
      ] },
      { tr: { fr: "Le soir, je regarde un film à la maison." }, tokens: [
        { thai: "ตอนเย็น", rom: "tɔɔn-yen", gloss: { fr: "le soir" } },
        { thai: "{I}", rom: "{i}", gloss: { fr: "je" } },
        { thai: "ดู", rom: "duu", gloss: { fr: "regarder" } },
        { thai: "หนัง", rom: "nǎng", gloss: { fr: "film" } },
        { thai: "ที่", rom: "thîi", gloss: { fr: "à" } },
        { thai: "บ้าน", rom: "bâan", gloss: { fr: "maison" } },
      ] },
    ],
  },
  {
    id: "r:r15", level: 4, title: { fr: "Jour de coulage" },
    sentences: [
      { tr: { fr: "Aujourd'hui, l'équipe coule la dalle du troisième niveau." }, tokens: [
        { thai: "วันนี้", rom: "wan-níi", gloss: { fr: "aujourd'hui" } },
        { thai: "ทีมงาน", rom: "thiim-ngaan", gloss: { fr: "équipe" } },
        { thai: "เท", rom: "thee", gloss: { fr: "couler, verser" } },
        { thai: "พื้น", rom: "phʉ́ʉn", gloss: { fr: "dalle, sol" } },
        { thai: "ชั้น", rom: "chán", gloss: { fr: "niveau" } },
        { thai: "สาม", rom: "sǎam", gloss: { fr: "trois" } },
      ] },
      { tr: { fr: "Le camion-toupie arrive à huit heures du matin." }, tokens: [
        { thai: "รถปูน", rom: "rót puun", gloss: { fr: "camion-toupie" } },
        { thai: "มา", rom: "maa", gloss: { fr: "venir" } },
        { thai: "ถึง", rom: "thʉ̌ng", gloss: { fr: "arriver" } },
        { thai: "แปด", rom: "pɛ̀ɛt", gloss: { fr: "huit" } },
        { thai: "โมง", rom: "moong", gloss: { fr: "heure" } },
        { thai: "เช้า", rom: "cháao", gloss: { fr: "matin" } },
      ] },
      { tr: { fr: "Je contrôle les armatures avant de couler le béton." }, tokens: [
        { thai: "{I}", rom: "{i}", gloss: { fr: "je" } },
        { thai: "ตรวจ", rom: "trùat", gloss: { fr: "contrôler" } },
        { thai: "เหล็กเสริม", rom: "lèk-sə̌əm", gloss: { fr: "armatures" } },
        { thai: "ก่อน", rom: "kɔ̀ɔn", gloss: { fr: "avant" } },
        { thai: "เท", rom: "thee", gloss: { fr: "couler" } },
        { thai: "คอนกรีต", rom: "khɔɔn-krìit", gloss: { fr: "béton" } },
      ] },
      { tr: { fr: "Tout le monde doit porter un casque." }, tokens: [
        { thai: "ทุกคน", rom: "thúk khon", gloss: { fr: "tout le monde" } },
        { thai: "ต้อง", rom: "tɔ̂ng", gloss: { fr: "devoir" } },
        { thai: "ใส่", rom: "sài", gloss: { fr: "porter, mettre" } },
        { thai: "หมวกนิรภัย", rom: "mùak ní-rá-phai", gloss: { fr: "casque de chantier" } },
      ] },
      { tr: { fr: "Le travail est fini avant midi." }, tokens: [
        { thai: "งาน", rom: "ngaan", gloss: { fr: "travail" } },
        { thai: "เสร็จ", rom: "sèt", gloss: { fr: "être fini" } },
        { thai: "ก่อน", rom: "kɔ̀ɔn", gloss: { fr: "avant" } },
        { thai: "เที่ยง", rom: "thîang", gloss: { fr: "midi" } },
      ] },
    ],
  },
  {
    id: "r:r16", level: 5, title: { fr: "En train vers Ayutthaya" },
    sentences: [
      { tr: { fr: "Dimanche prochain, j'irai à Ayutthaya en train." }, tokens: [
        { thai: "วันอาทิตย์", rom: "wan-aa-thít", gloss: { fr: "dimanche" } },
        { thai: "หน้า", rom: "nâa", gloss: { fr: "prochain" } },
        { thai: "{I}", rom: "{i}", gloss: { fr: "je" } },
        { thai: "จะ", rom: "jà", gloss: { fr: "(futur)" } },
        { thai: "ไป", rom: "pai", gloss: { fr: "aller" } },
        { thai: "อยุธยา", rom: "à-yút-thá-yaa", gloss: { fr: "Ayutthaya" } },
        { thai: "โดย", rom: "dooi", gloss: { fr: "par" } },
        { thai: "รถไฟ", rom: "rót-fai", gloss: { fr: "train" } },
      ] },
      { tr: { fr: "Le train part de Bangkok à sept heures du matin." }, tokens: [
        { thai: "รถไฟ", rom: "rót-fai", gloss: { fr: "train" } },
        { thai: "ออก", rom: "ɔ̀ɔk", gloss: { fr: "partir" } },
        { thai: "จาก", rom: "jàak", gloss: { fr: "de" } },
        { thai: "กรุงเทพ", rom: "krung-thêep", gloss: { fr: "Bangkok" } },
        { thai: "เจ็ด", rom: "jèt", gloss: { fr: "sept" } },
        { thai: "โมง", rom: "moong", gloss: { fr: "heure" } },
        { thai: "เช้า", rom: "cháao", gloss: { fr: "matin" } },
      ] },
      { tr: { fr: "Le billet ne coûte pas cher." }, tokens: [
        { thai: "ตั๋ว", rom: "tǔa", gloss: { fr: "billet" } },
        { thai: "ราคา", rom: "raa-khaa", gloss: { fr: "prix" } },
        { thai: "ไม่", rom: "mâi", gloss: { fr: "ne… pas" } },
        { thai: "แพง", rom: "phɛɛng", gloss: { fr: "cher" } },
      ] },
      { tr: { fr: "Là-bas, il y a beaucoup de temples anciens." }, tokens: [
        { thai: "ที่นั่น", rom: "thîi-nân", gloss: { fr: "là-bas" } },
        { thai: "มี", rom: "mii", gloss: { fr: "il y a" } },
        { thai: "วัด", rom: "wát", gloss: { fr: "temple" } },
        { thai: "เก่า", rom: "kào", gloss: { fr: "ancien" } },
        { thai: "หลาย", rom: "lǎai", gloss: { fr: "plusieurs" } },
        { thai: "แห่ง", rom: "hɛ̀ng", gloss: { fr: "(classificateur des lieux)" } },
      ] },
      { tr: { fr: "Je louerai un vélo pour visiter la ville." }, tokens: [
        { thai: "{I}", rom: "{i}", gloss: { fr: "je" } },
        { thai: "จะ", rom: "jà", gloss: { fr: "(futur)" } },
        { thai: "เช่า", rom: "châo", gloss: { fr: "louer" } },
        { thai: "จักรยาน", rom: "jàk-krà-yaan", gloss: { fr: "vélo" } },
        { thai: "เที่ยว", rom: "thîao", gloss: { fr: "visiter, se promener" } },
        { thai: "ใน", rom: "nai", gloss: { fr: "dans" } },
        { thai: "เมือง", rom: "mʉang", gloss: { fr: "ville" } },
      ] },
    ],
  },
];

READINGS.push(...EXTRA_READINGS);
