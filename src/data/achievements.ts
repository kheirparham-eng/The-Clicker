import { Achievement } from '../types';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_first_spark',
    title: 'First Spark',
    description: 'Accumulate a total of 100 Energy Points.',
    iconName: 'Zap',
    category: 'points',
    condition: (state) => state.lifetimePoints >= 100,
  },
  {
    id: 'ach_energy_tycoon',
    title: 'Energy Tycoon',
    description: 'Accumulate a total of 100,000 Energy Points.',
    iconName: 'Coins',
    category: 'points',
    condition: (state) => state.lifetimePoints >= 100000,
  },
  {
    id: 'ach_cyber_millionaire',
    title: 'Cyber Millionaire',
    description: 'Reach 1,000,000 lifetime Energy Points.',
    iconName: 'Crown',
    category: 'points',
    condition: (state) => state.lifetimePoints >= 1000000,
  },
  {
    id: 'ach_cyber_billionaire',
    title: 'Cyber Billionaire',
    description: 'Reach 1,000,000,000 lifetime Energy Points.',
    iconName: 'Globe',
    category: 'points',
    condition: (state) => state.lifetimePoints >= 1000000000,
  },
  {
    id: 'ach_manual_overdrive',
    title: 'Manual Overdrive',
    description: 'Click the Energy Core 100 times.',
    iconName: 'Pointer',
    category: 'clicks',
    condition: (state) => state.stats.totalClicks >= 100,
  },
  {
    id: 'ach_click_master',
    title: 'Click Master',
    description: 'Click the Energy Core 1,000 times.',
    iconName: 'Flame',
    category: 'clicks',
    condition: (state) => state.stats.totalClicks >= 1000,
  },
  {
    id: 'ach_critical_hit',
    title: 'Critical Fusion!',
    description: 'Land 10 Critical Energy Clicks.',
    iconName: 'Crosshair',
    category: 'clicks',
    condition: (state) => state.stats.totalCriticalClicks >= 10,
  },
  {
    id: 'ach_automation_era',
    title: 'Automation Era',
    description: 'Own at least 25 Auto Generators.',
    iconName: 'Bot',
    category: 'items',
    condition: (state) => {
      const totalAuto = Object.entries(state.itemsOwned)
        .filter(([key]) => key.startsWith('auto_'))
        .reduce((sum, [, qty]) => sum + qty, 0);
      return totalAuto >= 25;
    },
  },
  {
    id: 'ach_industrial_revolution',
    title: 'Industrial Revolution',
    description: 'Own at least 100 Auto Generators.',
    iconName: 'Server',
    category: 'items',
    condition: (state) => {
      const totalAuto = Object.entries(state.itemsOwned)
        .filter(([key]) => key.startsWith('auto_'))
        .reduce((sum, [, qty]) => sum + qty, 0);
      return totalAuto >= 100;
    },
  },
  {
    id: 'ach_lucky_catcher',
    title: 'Anomaly Hunter',
    description: 'Catch 5 Golden Cyber Anomalies.',
    iconName: 'Sparkles',
    category: 'golden',
    condition: (state) => state.stats.goldenDropsClicked >= 5,
  },
  {
    id: 'ach_ascended',
    title: 'Quantum Ascension',
    description: 'Perform your first Quantum Prestige Reset.',
    iconName: 'RotateCcw',
    category: 'prestige',
    condition: (state) => state.stats.prestigeCount >= 1,
  },
];
