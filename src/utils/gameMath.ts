import { SavedGameState, ActiveBuff } from '../types';
import { CLICK_UPGRADES, AUTO_GENERATORS, SPECIAL_UPGRADES } from '../data/shopItems';
import { MASTER_COMPOSERS } from '../data/musicLegends';

// Number formatter
export function formatNumber(num: number): string {
  if (num < 0) return '0';
  if (num < 1000) {
    return Math.floor(num).toLocaleString();
  }

  const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
  const i = Math.floor(Math.log10(num) / 3);

  if (i >= suffixes.length) {
    return num.toExponential(2);
  }

  const formatted = (num / Math.pow(10, i * 3)).toFixed(2);
  return `${formatted} ${suffixes[i]}`;
}

// Calculate cost for bulk purchasing items
// Cost = Base * (Multiplier^Owned) * (Multiplier^Amount - 1) / (Multiplier - 1)
export function getItemCost(baseCost: number, multiplier: number, owned: number, amount: number = 1): number {
  if (amount === 1) {
    return Math.floor(baseCost * Math.pow(multiplier, owned));
  }
  const first = baseCost * Math.pow(multiplier, owned);
  return Math.floor(first * (Math.pow(multiplier, amount) - 1) / (multiplier - 1));
}

// Max affordable calculation
export function getMaxAffordable(baseCost: number, multiplier: number, owned: number, currentPoints: number): number {
  let count = 0;
  let remaining = currentPoints;
  let currentCost = getItemCost(baseCost, multiplier, owned + count, 1);

  while (remaining >= currentCost && count < 1000) {
    remaining -= currentCost;
    count++;
    currentCost = getItemCost(baseCost, multiplier, owned + count, 1);
  }
  return Math.max(1, count);
}

// Compute Base PPC from items
export function computeBasePPC(state: SavedGameState): number {
  let basePPC = 1; // Default 1 per click

  CLICK_UPGRADES.forEach((item) => {
    const owned = state.itemsOwned[item.id] || 0;
    basePPC += item.power * owned;
  });

  return basePPC;
}

// Compute Base PPS from items
export function computeBasePPS(state: SavedGameState): number {
  let basePPS = 0;

  AUTO_GENERATORS.forEach((item) => {
    const owned = state.itemsOwned[item.id] || 0;
    basePPS += item.power * owned;
  });

  return basePPS;
}

// Compute Full PPC with upgrades, multipliers, master composers, active frenzy buffs & quantum relics
export function computeTotalPPC(
  state: SavedGameState,
  activeBuffs: ActiveBuff[] = []
): { ppc: number; critChance: number; critMult: number } {
  // Base PPC + 5% of Base PPS so bots ALWAYS make manual clicking significantly stronger!
  let ppc = computeBasePPC(state) + computeBasePPS(state) * 0.05;
  let clickPercentBonus = 0;
  let globalPercentBonus = 0;
  let critChance = 0.02; // Default 2% base crit
  let critMult = 3.0; // Default 3x crit

  // Apply Special Upgrades purchased
  SPECIAL_UPGRADES.forEach((spec) => {
    if (state.upgradesPurchased.includes(spec.id)) {
      if (spec.type === 'click_percent') clickPercentBonus += spec.value;
      if (spec.type === 'global_percent') globalPercentBonus += spec.value;
      if (spec.type === 'crit_chance') critChance += spec.value;
      if (spec.type === 'crit_multiplier') critMult += spec.value;
    }
  });

  // Apply Master Composer Passive Multipliers
  const unlocked = state.unlockedComposers || [];
  MASTER_COMPOSERS.forEach((comp) => {
    if (unlocked.includes(comp.id)) {
      if (comp.multiplierType === 'ppc') clickPercentBonus += comp.multiplierValue;
      if (comp.multiplierType === 'global') globalPercentBonus += comp.multiplierValue;
      if (comp.multiplierType === 'crit') critMult += comp.multiplierValue;
    }
  });

  // Apply Quantum Relics prestige bonus (+10% permanent per relic)
  const prestigeMultiplier = 1 + state.quantumRelics * 0.10;

  // Apply Active Buffs
  let buffClickMult = 1.0;
  let buffGlobalMult = 1.0;

  activeBuffs.forEach((buff) => {
    if (buff.buffType === 'click_pts') buffClickMult *= buff.multiplier;
    if (buff.buffType === 'global_pts') buffGlobalMult *= buff.multiplier;
  });

  ppc = ppc * (1 + clickPercentBonus) * (1 + globalPercentBonus) * prestigeMultiplier * buffClickMult * buffGlobalMult;

  return {
    ppc: Math.max(1, Math.floor(ppc)),
    critChance: Math.min(0.75, critChance),
    critMult,
  };
}

// Compute Full PPS with upgrades, multipliers, master composers, active frenzy buffs & quantum relics
export function computeTotalPPS(
  state: SavedGameState,
  activeBuffs: ActiveBuff[] = []
): number {
  let pps = computeBasePPS(state);
  let autoPercentBonus = 0;
  let globalPercentBonus = 0;

  SPECIAL_UPGRADES.forEach((spec) => {
    if (state.upgradesPurchased.includes(spec.id)) {
      if (spec.type === 'auto_percent') autoPercentBonus += spec.value;
      if (spec.type === 'global_percent') globalPercentBonus += spec.value;
    }
  });

  // Apply Master Composer Passive Multipliers
  const unlocked = state.unlockedComposers || [];
  MASTER_COMPOSERS.forEach((comp) => {
    if (unlocked.includes(comp.id)) {
      if (comp.multiplierType === 'pps') autoPercentBonus += comp.multiplierValue;
      if (comp.multiplierType === 'global') globalPercentBonus += comp.multiplierValue;
    }
  });

  const prestigeMultiplier = 1 + state.quantumRelics * 0.10;

  let buffAutoMult = 1.0;
  let buffGlobalMult = 1.0;

  activeBuffs.forEach((buff) => {
    if (buff.buffType === 'auto_pts') buffAutoMult *= buff.multiplier;
    if (buff.buffType === 'global_pts') buffGlobalMult *= buff.multiplier;
  });

  pps = pps * (1 + autoPercentBonus) * (1 + globalPercentBonus) * prestigeMultiplier * buffAutoMult * buffGlobalMult;

  return Math.floor(pps * 10) / 10;
}
