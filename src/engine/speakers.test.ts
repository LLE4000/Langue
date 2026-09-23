import { describe, expect, it } from 'vitest';
import { dialogOtherGender, genderFromRole } from './speakers';
import { chooseVoice, guessVoiceGender } from './audio/tts';
import { th } from '@/content/th';

describe('genre des locuteurs', () => {
  it('rôle en français', () => {
    expect(genderFromRole('Vendeuse')).toBe('f');
    expect(genderFromRole('Serveur')).toBe('m');
    expect(genderFromRole('Chauffeur')).toBe('m');
    expect(genderFromRole('Amie')).toBe('f');
    expect(genderFromRole('Ami thaï')).toBe('m');
    expect(genderFromRole('Collègue')).toBe(null);
  });
  it('les particules des répliques priment sur le rôle', () => {
    const d = { other: { fr: 'Collègue' }, lines: [{ who: 'other' as const, thai: 'สวัสดีค่ะ', rom: '', tr: { fr: '' } }] };
    expect(dialogOtherGender(d)).toBe('f');
    const d2 = { other: { fr: 'Vendeuse' }, lines: [{ who: 'other' as const, thai: 'สวัสดีครับ', rom: '', tr: { fr: '' } }] };
    expect(dialogOtherGender(d2)).toBe('m');
  });
  it('tous les dialogues du contenu ont un interlocuteur cohérent avec ses particules', () => {
    for (const d of th.DIALOGS) {
      const g = dialogOtherGender(d);
      const f = d.lines.filter((l) => l.who === 'other' && /(ค่ะ|คะ)(\s|$)/.test(l.thai)).length;
      const m = d.lines.filter((l) => l.who === 'other' && /ครับ(\s|$)/.test(l.thai)).length;
      if (f && !m) expect(g, d.id).toBe('f');
      if (m && !f) expect(g, d.id).toBe('m');
    }
  });
});

describe('choix de la voix', () => {
  const voices = [
    { id: 'kanya', name: 'Kanya', local: true, lang: 'th-TH' },
    { id: 'niwat', name: 'Microsoft Niwat Online (Natural) - Thai (Thailand)', local: false, lang: 'th-TH' },
    { id: 'goo', name: 'Google ไทย', local: false, lang: 'th-TH' },
  ];
  it('devine le genre d’après le nom', () => {
    expect(guessVoiceGender('Kanya')).toBe('f');
    expect(guessVoiceGender('Microsoft Niwat Online (Natural)')).toBe('m');
    expect(guessVoiceGender('Microsoft Premwadee Online (Natural)')).toBe('f');
    expect(guessVoiceGender('Google ไทย')).toBe(undefined);
  });
  it('préfère une voix du genre voulu, même en ligne', () => {
    expect(chooseVoice(voices, { gender: 'm', speechLang: 'th-TH' })).toMatchObject({ voice: { id: 'niwat' }, approx: false });
    expect(chooseVoice(voices, { gender: 'f', speechLang: 'th-TH' })).toMatchObject({ voice: { id: 'kanya' }, approx: false });
  });
  it('sans voix du genre voulu : meilleure voix, à ajuster', () => {
    const only = [voices[0]];
    expect(chooseVoice(only, { gender: 'm', speechLang: 'th-TH' })).toMatchObject({ voice: { id: 'kanya' }, approx: true });
    expect(chooseVoice(only, { gender: 'f', speechLang: 'th-TH' })).toMatchObject({ approx: false });
    expect(chooseVoice(only, { speechLang: 'th-TH' })).toMatchObject({ approx: false });
  });
  it('un genre attribué à la main compte', () => {
    expect(chooseVoice([voices[2]], { gender: 'm', voiceGenders: { goo: 'm' }, speechLang: 'th-TH' })).toMatchObject({ approx: false });
  });
  it('une voix choisie explicitement est toujours respectée', () => {
    expect(chooseVoice(voices, { voiceId: 'goo', gender: 'm', speechLang: 'th-TH' }).voice?.id).toBe('goo');
  });
});
