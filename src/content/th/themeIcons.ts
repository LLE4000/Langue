/**
 * Pictogramme de chaque thème de vocabulaire, pris dans le jeu d'icônes de l'application (ui.tsx),
 * pour les lignes d'interface (listes, recherche) à la place des émojis. Repli : 'word'.
 */
export const THEME_ICON: Record<string, string> = {
  sal: 'chat', pres: 'user', fam: 'users', food: 'bowl', drink: 'cup', resto: 'clipboard', market: 'bag', shop: 'bag', price: 'coin',
  num: 'hash', color: 'palette', date: 'calendar', time: 'clock', weather: 'sun', trans: 'train', taxi: 'car', grab: 'phone', hotel: 'bed',
  home: 'home', work: 'briefcase', eng: 'building', health: 'medical', hosp: 'medical', travel: 'globe', airport: 'plane', dir: 'compass',
  sos: 'alert', friends: 'users', out: 'music', feel: 'heart', verbs: 'bolt', adj: 'sparkles', small: 'link', body: 'user', clothes: 'shirt',
  animals: 'paw', places: 'pin', qw: 'help', fruit: 'apple', adv: 'hourglass', tech: 'phone', nature: 'leaf', money: 'coin', hobby: 'ball',
  culture: 'star',
};

export const themeIcon = (id: string): string => THEME_ICON[id] ?? 'word';
