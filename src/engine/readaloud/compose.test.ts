import { describe, expect, it } from 'vitest';
import { syllable, variantsOf } from './compose';

const s = (c: string, v: string, f = '', m = 0) => { const x = syllable(c, v, f, m); return x && [x.thai, x.rom, x.tone]; };

describe('composition des syllabes', () => {
  it('syllabes ouvertes et tons sans marque', () => {
    expect(s('ด', '–า')).toEqual(['ดา', 'daa', 'M']);
    expect(s('ข', '–า')).toEqual(['ขา', 'khǎa', 'R']);
    expect(s('อ', '–า')).toEqual(['อา', 'aa', 'M']);
    expect(s('ม', '–ือ')).toEqual(['มือ', 'mʉʉ', 'M']);
    expect(s('จ', 'เ–อ')).toEqual(['เจอ', 'jəə', 'M']);
    expect(s('ป', 'ไ–')).toEqual(['ไป', 'pai', 'M']);
    expect(s('ท', '–ำ')).toEqual(['ทำ', 'tham', 'M']);
    expect(s('ร', 'เ–า')).toEqual(['เรา', 'rao', 'M']);
    expect(s('จ', '–ะ')).toEqual(['จะ', 'jà', 'L']);
  });
  it('marques de ton : placement et règle', () => {
    expect(s('ก', '–า', '', 1)).toEqual(['ก่า', 'kàa', 'L']);
    expect(s('ม', '–า', '', 2)).toEqual(['ม้า', 'máa', 'H']);
    expect(s('ม', 'ไ–', '', 1)).toEqual(['ไม่', 'mâi', 'F']);
    expect(s('ก', '–ี', '', 1)).toEqual(['กี่', 'kìi', 'L']);
    expect(s('ก', '–า', '', 3)).toEqual(['ก๊า', 'káa', 'H']);
    expect(s('ค', '–า', '', 3)).toBeNull();
  });
  it('formes fermées devant une finale', () => {
    expect(s('ก', '–ะ', 'น')).toEqual(['กัน', 'kan', 'M']);
    expect(s('ร', '–ะ', 'ก')).toEqual(['รัก', 'rák', 'H']);
    expect(s('ม', '–า', 'ก')).toEqual(['มาก', 'mâak', 'F']);
    expect(s('ด', 'เ–ะ', 'ก')).toEqual(['เด็ก', 'dèk', 'L']);
    expect(s('ต', 'เ–ะ', 'น', 2)).toEqual(['เต้น', 'tên', 'F']);
    expect(s('ค', 'โ–ะ', 'น')).toEqual(['คน', 'khon', 'M']);
    expect(s('ด', 'เ–อ', 'น')).toEqual(['เดิน', 'dəən', 'M']);
    expect(s('ร', 'เ–ีย', 'น')).toEqual(['เรียน', 'rian', 'M']);
    expect(s('ส', '–ัว', 'น')).toEqual(['สวน', 'sǔan', 'R']);
    expect(s('ค', '–ือ', 'น')).toEqual(['คืน', 'khʉʉn', 'M']);
    expect(s('ย', '–า', 'ว')).toEqual(['ยาว', 'yaao', 'M']);
    expect(s('ก', 'ไ–', 'น')).toBeNull();
  });
  it('voisins : ton, longueur, consonne, finale', () => {
    const v = variantsOf(syllable('ม', '–า')!);
    expect(v.find((x) => x.thai === 'ม้า')).toMatchObject({ kind: 'tone' });
    expect(v.find((x) => x.thai === 'มะ')).toMatchObject({ kind: 'length' });
    expect(v.find((x) => x.thai === 'นา')).toMatchObject({ kind: 'consonant' });
    const k = variantsOf(syllable('ค', '–า')!);
    expect(k.find((x) => x.thai === 'ขา')).toMatchObject({ kind: 'tone' }); // même son kh, autre classe
    expect(k.find((x) => x.thai === 'กา')).toMatchObject({ kind: 'consonant' });
    expect(variantsOf(syllable('ก', '–า', 'น')!).find((x) => x.thai === 'กาง')).toMatchObject({ kind: 'final' });
  });
});

describe('finales ย et ว', () => {
  it('seulement les combinaisons réelles', () => {
    expect(s('ส', '–ัว', 'ย')).toEqual(['สวย', 'sǔai', 'R']);
    expect(s('ห', '–ิ', 'ว')).toEqual(['หิว', 'hǐu', 'R']);
    expect(s('ม', 'แ–', 'ว')).toEqual(['แมว', 'mɛɛo', 'M']);
    expect(s('จ', '–ี', 'ว')).toBeNull();
    expect(s('ก', '–ะ', 'ว')).toBeNull();
  });
});
