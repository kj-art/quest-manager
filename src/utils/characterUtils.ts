import type { Character, Stats } from '../Character';
import { STAT_NAMES } from '../Character';

let totalStatPoints: number = 1;
let abilityUpgradeMax: number = 1;
let statUpgradeMax: number = 1;

/**
 * Updates the total available stat points
 */
export function setTotalStatPoints(points: number) {
  if (points < 0) throw new Error("Total stat points must be non-negative");
  totalStatPoints = points;
}

export function getTotalStatPoints() {
  return totalStatPoints;
}

/**
 * Updates the maximum ability upgrade points
 */
export function setAbilityUpgradeMax(points: number) {
  if (points < 0) throw new Error("Ability upgrade max must be non-negative");
  abilityUpgradeMax = points;
}

export function getAbilityUpgradeMax() {
  return abilityUpgradeMax;
}

/**
 * Updates the maximum stat upgrade points
 */
export function setStatUpgradeMax(points: number) {
  if (points < 0) throw new Error("Stat upgrade max must be non-negative");
  statUpgradeMax = points;
}

export function getStatUpgradeMax() {
  return statUpgradeMax;
}

/**
 * Validates if a character's stat allocation is within the allowed total
 */
export function isValidStatAllocation(character: Character): boolean {
  const totalAllocated = Object.values(character.stats).reduce((sum, val) => sum + val, 0);
  return totalAllocated <= totalStatPoints;
}

// Pure function for creating default stats
function defaultStats(): Stats
{
  const stats = {} as Stats;
  STAT_NAMES.forEach(stat =>
  {
    stats[stat] = 0;
  });
  return stats;
}

// Named function declaration for better Fast Refresh compatibility
export function createDefaultCharacter(): Character
{
  const chr = {
    id: '',
    name: '',
    type: 'NPC',
    age: 0,
    homePlanet: '',
    currentHp: 0,
    totalHp: 0,
    ap: 0,
    attack: 0,
    stats: defaultStats(),
    backstory: '',
    abilityUpgradePoints: 0,
    statUpgradePoints: 0,
    tags: [],
  } as Character;
  return chr;
} 