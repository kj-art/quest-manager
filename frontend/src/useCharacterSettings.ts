// useCharacterSettings.ts
/*import { useSettings } from './contexts/CharacterSettingsContext';
import type { Character } from './Character';

export function useCharacterSettings() {
  const { settings, updateSettings } = useSettings();

  function exportSetting(key: keyof typeof settings, value: number) {
    updateSettings({
      ...settings,
      [key]: value,
    });
  }

  function setTotalStatPoints(points: number) {
    if (points < 0) throw new Error("Total stat points must be non-negative");
    exportSetting('statTotal', points);
  }

  function getTotalStatPoints() {
    return settings.statTotal;
  }

  function setAbilityUpgradeMax(points: number) {
    if (points < 0) throw new Error("Ability upgrade max must be non-negative");
    exportSetting('abilityUpgradeMax', points);
  }

  function getAbilityUpgradeMax() {
    return settings.abilityUpgradeMax;
  }

  function setStatUpgradeMax(points: number) {
    if (points < 0) throw new Error("Stat upgrade max must be non-negative");
    exportSetting('statUpgradeMax', points);
  }

  function getStatUpgradeMax() {
    return settings.statUpgradeMax;
  }

  function validateStatAllocation(character: Character) {
    const totalAssigned = Object.values(character.stats).reduce((sum, val) => sum + val, 0);
    const expectedTotal = settings.statTotal;

    return {
      isValid: totalAssigned === expectedTotal,
      totalAssigned,
      expectedTotal,
    };
  }

  return {
    settings,
    setTotalStatPoints,
    getTotalStatPoints,
    setAbilityUpgradeMax,
    getAbilityUpgradeMax,
    setStatUpgradeMax,
    getStatUpgradeMax,
    validateStatAllocation,
  };
}
*/