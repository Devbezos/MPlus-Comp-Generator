export type Role = 'TANK' | 'HEALER' | 'MDPS' | 'RDPS';
export type TriState = 'require' | 'prevent' | null;

export interface Spec {
  spec: string;
  class: string;
  role: Role;
  lust: boolean;
  brez: boolean;
}

export const SPECS: Spec[] = [
  // Death Knight  (Raise Ally = BRez on all specs)
  { spec: 'Blood',        class: 'Death Knight', role: 'TANK',   lust: false, brez: true  },
  { spec: 'Death Knight', class: 'Death Knight', role: 'MDPS',   lust: false, brez: true  },
  // Demon Hunter
  { spec: 'Havoc',        class: 'Demon Hunter', role: 'MDPS',   lust: false, brez: false },
  { spec: 'Vengeance',    class: 'Demon Hunter', role: 'TANK',   lust: false, brez: false },
  { spec: 'Devourer',     class: 'Demon Hunter', role: 'RDPS',   lust: false, brez: false },
  // Druid  (Rebirth = BRez on all specs)
  { spec: 'Balance',      class: 'Druid',        role: 'RDPS',   lust: false, brez: true  },
  { spec: 'Feral',        class: 'Druid',        role: 'MDPS',   lust: false, brez: true  },
  { spec: 'Guardian',     class: 'Druid',        role: 'TANK',   lust: false, brez: true  },
  { spec: 'Restoration',  class: 'Druid',        role: 'HEALER', lust: false, brez: true  },
  // Evoker  (Fury of the Aspects = Lust on all specs)
  { spec: 'Evoker',       class: 'Evoker',       role: 'RDPS',   lust: true,  brez: false },
  { spec: 'Preservation', class: 'Evoker',       role: 'HEALER', lust: true,  brez: false },
  // Hunter  (Primal Rage on all specs)
  { spec: 'Hunter',       class: 'Hunter',       role: 'RDPS',   lust: true,  brez: false },
  { spec: 'Survival',     class: 'Hunter',       role: 'MDPS',   lust: true,  brez: false },
  // Mage  (Time Warp on all specs)
  { spec: 'Mage',         class: 'Mage',         role: 'RDPS',   lust: true,  brez: false },
  // Monk
  { spec: 'Brewmaster',   class: 'Monk',         role: 'TANK',   lust: false, brez: false },
  { spec: 'Mistweaver',   class: 'Monk',         role: 'HEALER', lust: false, brez: false },
  { spec: 'Windwalker',   class: 'Monk',         role: 'MDPS',   lust: false, brez: false },
  // Paladin  (Intercession = BRez on all specs)
  { spec: 'Holy',         class: 'Paladin',      role: 'HEALER', lust: false, brez: true  },
  { spec: 'Protection',   class: 'Paladin',      role: 'TANK',   lust: false, brez: true  },
  { spec: 'Retribution',  class: 'Paladin',      role: 'MDPS',   lust: false, brez: true  },
  // Priest
  { spec: 'Priest',       class: 'Priest',       role: 'HEALER', lust: false, brez: false },
  { spec: 'Shadow',       class: 'Priest',       role: 'RDPS',   lust: false, brez: false },
  // Rogue
  { spec: 'Rogue',        class: 'Rogue',        role: 'MDPS',   lust: false, brez: false },
  // Shaman  (Bloodlust / Heroism on all specs)
  { spec: 'Elemental',    class: 'Shaman',       role: 'RDPS',   lust: true,  brez: false },
  { spec: 'Enhancement',  class: 'Shaman',       role: 'MDPS',   lust: true,  brez: false },
  { spec: 'Restoration',  class: 'Shaman',       role: 'HEALER', lust: true,  brez: false },
  // Warlock  (Soulstone = pre-cast BRez on all specs)
  { spec: 'Warlock',      class: 'Warlock',      role: 'RDPS',   lust: false, brez: true  },
  // Warrior
  { spec: 'Warrior',      class: 'Warrior',      role: 'MDPS',   lust: false, brez: false },
  { spec: 'Protection',   class: 'Warrior',      role: 'TANK',   lust: false, brez: false },
];

export const CLASS_COLORS: Record<string, string> = {
  'Death Knight': '#C41E3A',
  'Demon Hunter': '#A330C9',
  'Druid':        '#FF7C0A',
  'Evoker':       '#33937F',
  'Hunter':       '#AAD372',
  'Mage':         '#3FC7EB',
  'Monk':         '#00FF98',
  'Paladin':      '#F48CBA',
  'Priest':       '#FFFFFF',
  'Rogue':        '#FFF468',
  'Shaman':       '#0070DD',
  'Warlock':      '#8788EE',
  'Warrior':      '#C69B3A',
};

export const ROLE_COLORS: Record<Role, string> = {
  TANK:   '#4499FF',
  HEALER: '#00DD6A',
  MDPS:   '#FF7744',
  RDPS:   '#FF4444',
};

/** "Spec Class" or just "Class" when spec name equals class name */
export function specLabel(s: Spec): string {
  return s.spec === s.class ? s.class : `${s.spec} ${s.class}`;
}
