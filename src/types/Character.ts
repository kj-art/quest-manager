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
  name: string;
  type: string;
  age: number;
  homePlanet: string;
  currentHp: number;
  totalHp: number;
  ap: number;
  attack: number;
  stats: Stats;
  backstory: string;
  abilityUpgradePoints: number;
  statUpgradePoints: number;
  tags: string[];
}

export const CHARACTER_TYPES = ['player', 'NPC'] as const;
export type CharacterType = typeof CHARACTER_TYPES[number]; 