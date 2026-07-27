export interface UserAccount {
  username: string;
  passwordHash: string;
  createdAt: number;
  lastSaved: number;
}

export interface GameStats {
  totalClicks: number;
  totalCriticalClicks: number;
  lifetimePoints: number;
  goldenDropsClicked: number;
  prestigeCount: number;
  timePlayedSeconds: number;
}

export interface SavedGameState {
  username: string;
  points: number;
  lifetimePoints: number;
  itemsOwned: Record<string, number>;
  upgradesPurchased: string[];
  achievementsUnlocked: string[];
  quantumRelics: number;
  lastSaveTime: number;
  stats: GameStats;
  equippedSkin?: string;
  equippedParticle?: string;
  equippedTheme?: string;
  equippedSfx?: string;
  cosmeticsUnlocked?: string[];
  unlockedComposers?: string[];
  equippedComposer?: string;
}

export interface ShopItem {
  id: string;
  name: string;
  category: 'click' | 'auto';
  baseCost: number;
  costMultiplier: number; // e.g. 1.15
  power: number; // PPC added or PPS added
  iconName: string;
  description: string;
  unlockRequirement?: number; // lifetime points required to reveal
}

export interface SpecialUpgrade {
  id: string;
  name: string;
  cost: number;
  type: 'click_percent' | 'auto_percent' | 'global_percent' | 'crit_chance' | 'crit_multiplier' | 'golden_buff';
  value: number; // e.g. 0.25 for +25%
  iconName: string;
  description: string;
  reqItemId?: string;
  reqItemCount?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  rewardPoints?: number;
  category: 'points' | 'clicks' | 'items' | 'golden' | 'prestige';
  condition: (state: SavedGameState, computedPPC: number, computedPPS: number) => boolean;
}

export interface ActiveBuff {
  id: string;
  name: string;
  multiplier: number;
  buffType: 'global_pts' | 'click_pts' | 'auto_pts';
  durationSeconds: number;
  remainingSeconds: number;
  color: string;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  isCrit?: boolean;
  isBonus?: boolean;
  color?: string;
}
