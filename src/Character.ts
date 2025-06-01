import { useState, useEffect } from 'react';

let totalStatPoints: number = 1;
let abilityUpgradeMax: number = 1;
let statUpgradeMax: number = 1;

export interface CharacterSettings
{
  statTotal: number;
  abilityUpgradeMax: number;
  statUpgradeMax: number;
}

// Function to update the editable total points value:
export function setTotalStatPoints(points: number) {
  if (points < 0) throw new Error("Total stat points must be non-negative");
  totalStatPoints = points;
}

export function getTotalStatPoints()
{
  return totalStatPoints;
}

export function setAbilityUpgradeMax(points: number) {
  if (points < 0) throw new Error("Ability upgrade max must be non-negative");
  abilityUpgradeMax = points;
}

export function getAbilityUpgradeMax()
{
  return abilityUpgradeMax;
}

export function setStatUpgradeMax(points: number) {
  if (points < 0) throw new Error("Stat upgrade max must be non-negative");
  statUpgradeMax = points;
}

export function getStatUpgradeMax()
{
  return statUpgradeMax;
}

// Validation function using current totalStatPoints:
export function isValidStatAllocation(character: Character): boolean {
  const totalAllocated = Object.values(character.stats).reduce((sum, val) => sum + val, 0);
  return totalAllocated <= totalStatPoints;
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