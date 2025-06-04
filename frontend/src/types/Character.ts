export interface CharacterSettings {
  statTotal: number;
  abilityUpgradeMax: number;
  statUpgradeMax: number;
}

export const STAT_NAMES = ["strength", "speed", "sway", "sneak", "intelligence", "perception"] as const;

export type Stat = typeof STAT_NAMES[number];

export type Stats = Record<Stat, number>;

export interface Character {
  id: string;
  name: {
    first: string;
    nick?: string;
    last: string;
  };
  type: string;
  age: number;
  homePlanet: string;
  currentHp: number;
  totalHp: number;
  ap: number;
  attack: number;
  stats: {
    strength: number;
    speed: number;
    sway: number;
    sneak: number;
    intelligence: number;
    perception: number;
  };
  ship: {
    hp: number;
    shields: number;
    torpedoAmmo: number;
    torpedoes: number;
    stunAmmo: number;
    stun: number;
    targeting: number;
    speed: number;
    range: number;
    firepower: number;
  };
  backstory: string;
  abilityUpgradePoints: number;
  statUpgradePoints: number;
  tags: string[];
}

export const CHARACTER_TYPES = ['player', 'NPC'] as const;
export type CharacterType = typeof CHARACTER_TYPES[number]; 