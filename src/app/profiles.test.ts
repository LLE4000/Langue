import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_ID, createProfile, deleteProfile, readRegistry, storageKeyFor, switchProfile, syncActiveName } from './profiles';

describe('profils sur un appareil', () => {
  beforeEach(() => localStorage.clear());
  it('le premier profil garde la clé historique', () => {
    expect(readRegistry().active).toBe(DEFAULT_ID);
    expect(storageKeyFor(DEFAULT_ID)).toBe('langue-v1');
  });
  it('ajouter, nommer, changer, supprimer', async () => {
    syncActiveName('Lucien');
    const id = createProfile();
    expect(readRegistry().active).toBe(id);
    expect(storageKeyFor(id)).toBe(`langue-v1:${id}`);
    syncActiveName('Marie');
    expect(readRegistry().list.map((p) => p.name)).toEqual(['Lucien', 'Marie']);
    switchProfile(DEFAULT_ID);
    expect(readRegistry().active).toBe(DEFAULT_ID);
    await deleteProfile(id);
    expect(readRegistry().list.length).toBe(1);
    await deleteProfile(DEFAULT_ID);
    expect(readRegistry().list.length).toBe(1); // jamais vide
  });
});
