import { describe, expect, it } from 'vitest';
import { isOpenMonosyllable, isReadable, readingRequirements } from './reading';

const R = (s: string) => [...readingRequirements(s)].sort();

describe('readingRequirements', () => {
  it('consonne + voyelle simple', () => {
    expect(R('มา')).toEqual(['c:ม', 'v:–า']);
    expect(R('ดี')).toEqual(['c:ด', 'v:–ี']);
    expect(R('ปู')).toEqual(['c:ป', 'v:–ู']);
  });
  it('voyelles antéposées', () => {
    expect(R('ไป')).toEqual(['c:ป', 'v:ไ–']);
    expect(R('เรา')).toEqual(['c:ร', 'v:เ–า']);
    expect(R('แดง')).toEqual(['c:ง', 'c:ด', 'rule:final-live', 'v:แ–']);
    expect(R('โมง')).toEqual(['c:ง', 'c:ม', 'rule:final-live', 'v:โ–']);
    expect(R('เกาะ')).toEqual(['c:ก', 'v:เ–าะ']);
    expect(R('เจอ')).toEqual(['c:จ', 'v:เ–อ']);
    expect(R('เดิน')).toEqual(['c:ด', 'c:น', 'rule:final-live', 'v:เ–อ']);
    expect(R('เด็ก')).toEqual(['c:ก', 'c:ด', 'rule:final-dead', 'v:เ–ะ']);
  });
  it('marques de ton et finales', () => {
    expect(R('ไม่')).toEqual(['c:ม', 'm:1', 'v:ไ–']);
    expect(R('บ้าน')).toEqual(['c:น', 'c:บ', 'm:2', 'rule:final-live', 'v:–า']);
    expect(R('น้ำ')).toEqual(['c:น', 'm:2', 'v:–ำ']);
    expect(R('กิน')).toEqual(['c:ก', 'c:น', 'rule:final-live', 'v:–ิ']);
    expect(R('มาก')).toEqual(['c:ก', 'c:ม', 'rule:final-dead', 'v:–า']);
    expect(R('รัก')).toEqual(['c:ก', 'c:ร', 'rule:final-dead', 'v:–ะ']);
    expect(R('ข้าว')).toEqual(['c:ข', 'c:ว', 'm:2', 'rule:final-live', 'v:–า']);
    expect(R('ชอบ')).toEqual(['c:ช', 'c:บ', 'rule:final-dead', 'v:–อ']);
    expect(R('อาหาร')).toEqual(['c:ร', 'c:ห', 'c:อ', 'rule:final-irregular', 'v:–า']);
  });
  it('ห นำ, อ นำ, groupes', () => {
    expect(R('หมา')).toEqual(['c:ม', 'c:ห', 'rule:hnam', 'v:–า']);
    expect(R('อยู่')).toEqual(['c:ย', 'c:อ', 'm:1', 'rule:onam', 'v:–ู']);
    expect(R('ปลา')).toEqual(['c:ป', 'c:ล', 'rule:cluster', 'v:–า']);
    expect(R('ใกล้')).toEqual(['c:ก', 'c:ล', 'm:2', 'rule:cluster', 'v:ใ–']);
  });
  it('voyelles implicites', () => {
    expect(R('คน')).toEqual(['c:ค', 'c:น', 'rule:final-live', 'rule:implicit-o']);
    expect(R('นก')).toEqual(['c:ก', 'c:น', 'rule:final-dead', 'rule:implicit-o']);
    expect(R('สบาย')).toEqual(['c:บ', 'c:ย', 'c:ส', 'rule:final-live', 'rule:implicit-a', 'v:–า']);
    expect(R('ถนน')).toContain('rule:implicit-a');
    expect(R('ตลาด')).toEqual(['c:ด', 'c:ต', 'c:ล', 'rule:final-dead', 'rule:implicit-a', 'v:–า']);
  });
  it('diphtongues et formes fermées', () => {
    expect(R('เรียน')).toEqual(['c:น', 'c:ร', 'rule:final-live', 'v:เ–ีย']);
    expect(R('เรือ')).toEqual(['c:ร', 'v:เ–ือ']);
    expect(R('ตัว')).toEqual(['c:ต', 'v:–ัว']);
    expect(R('มือ')).toEqual(['c:ม', 'v:–ือ']);
    expect(R('คืน')).toEqual(['c:ค', 'c:น', 'rule:final-live', 'v:–ือ']);
    expect(R('สวย')).toEqual(['c:ย', 'c:ส', 'rule:final-live', 'v:–ัว']);
    expect(R('สวน')).toEqual(['c:น', 'c:ส', 'rule:final-live', 'v:–ัว']);
    expect(R('ขวา')).toEqual(['c:ข', 'c:ว', 'rule:cluster', 'v:–า']);
    expect(R('หวาน')).toEqual(['c:น', 'c:ว', 'c:ห', 'rule:final-live', 'rule:hnam', 'v:–า']);
    expect(R('เลี้ยว')).toEqual(['c:ล', 'c:ว', 'm:2', 'rule:final-live', 'v:เ–ีย']);
    expect(R('เพื่อน')).toEqual(['c:น', 'c:พ', 'm:1', 'rule:final-live', 'v:เ–ือ']);
  });
  it('jetons et lettre muette', () => {
    expect(R('สวัสดี{P}')).toContain('c:ส');
    expect(R('ยักษ์')).toContain('rule:karan');
  });
});

describe('isReadable / isOpenMonosyllable', () => {
  it('respecte les notions connues', () => {
    const known = new Set(['c:ม', 'c:ด', 'v:–า', 'v:–ี']);
    expect(isReadable('มา', known)).toBe(true);
    expect(isReadable('ดี', known)).toBe(true);
    expect(isReadable('มาก', known)).toBe(false);
    expect(isReadable('ไม่', known)).toBe(false);
  });
  it('monosyllabes ouverts', () => {
    expect(isOpenMonosyllable('มา')).toBe(true);
    expect(isOpenMonosyllable('ไป')).toBe(true);
    expect(isOpenMonosyllable('กิน')).toBe(false);
    expect(isOpenMonosyllable('สบาย')).toBe(false);
  });
});
