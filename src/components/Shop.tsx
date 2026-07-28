import React, { useState } from 'react';
import { SavedGameState } from '../types';
import { CLICK_UPGRADES, AUTO_GENERATORS, SPECIAL_UPGRADES } from '../data/shopItems';
import { COSMETICS, CosmeticItem } from '../data/cosmetics';
import { MASTER_COMPOSERS } from '../data/musicLegends';
import { getItemCost, getMaxAffordable, formatNumber } from '../utils/gameMath';
import { audio } from '../services/audio';
import * as Icons from 'lucide-react';

interface ShopProps {
  gameState: SavedGameState;
  onBuyItem: (itemId: string, category: 'click' | 'auto', amount: number, cost: number) => void;
  onBuyUpgrade: (upgradeId: string, cost: number) => void;
  onUnlockCosmetic: (cosmeticId: string, cost: number) => void;
  onEquipCosmetic: (category: 'skin' | 'particle' | 'theme' | 'sfx', cosmeticId: string) => void;
  onUnlockComposer?: (composerId: string, cost: number) => void;
}

export const Shop: React.FC<ShopProps> = ({
  gameState,
  onBuyItem,
  onBuyUpgrade,
  onUnlockCosmetic,
  onEquipCosmetic,
  onUnlockComposer,
}) => {
  const [activeTab, setActiveTab] = useState<'click' | 'auto' | 'special' | 'cosmetics' | 'music'>('click');
  const [cosmeticCategory, setCosmeticCategory] = useState<'all' | 'skin' | 'particle' | 'sfx'>('all');
  const [bulkMode, setBulkMode] = useState<1 | 10 | 100 | 'max'>(1);

  // Dynamic Lucide Icon component renderer
  const renderIcon = (name: string, className: string = 'w-5 h-5') => {
    const IconComponent = (Icons as Record<string, React.ComponentType<{ className?: string }>>)[name] || Icons.Zap;
    return <IconComponent className={className} />;
  };

  const unlockedCosmetics = gameState.cosmeticsUnlocked || ['cyber_crystal', 'neon_sparks', 'cyberpunk', 'synth'];
  const unlockedComposers = gameState.unlockedComposers || [];

  const filteredCosmetics = COSMETICS.filter((item) => {
    if (cosmeticCategory === 'all') return true;
    return item.category === cosmeticCategory;
  });

  return (
    <div className="bg-[#0b0f19]/95 border border-cyan-500/20 rounded-2xl p-3 flex flex-col h-full shadow-2xl backdrop-blur-md font-mono">
      {/* Shop Header & Tabs */}
      <div className="flex flex-col gap-2.5 pb-2.5 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icons.Music className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-slate-100 tracking-wider uppercase font-mono">
              SHOP & MASTER LEGENDS
            </h2>
          </div>

          {/* Bulk Buying Selector (Only for Click & Auto) */}
          {(activeTab === 'click' || activeTab === 'auto') && (
            <div className="flex items-center bg-[#060911] p-0.5 rounded border border-slate-800 text-[10px] font-mono">
              {[1, 10, 100, 'max'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setBulkMode(mode as 1 | 10 | 100 | 'max')}
                  className={`px-2 py-0.5 rounded transition-all font-bold ${
                    bulkMode === mode
                      ? 'bg-cyan-500 text-slate-950 shadow-[0_0_8px_rgba(0,243,255,0.4)]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mode === 'max' ? 'MAX' : `x${mode}`}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Category Tabs */}
        <div className="grid grid-cols-5 gap-1 bg-[#060911] p-1 rounded-xl border border-slate-800/90 text-[10px] sm:text-[11px] font-semibold">
          <button
            onClick={() => setActiveTab('click')}
            className={`flex items-center justify-center gap-1 py-1.5 rounded transition-all ${
              activeTab === 'click'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(0,243,255,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Icons.Pointer className="w-3.5 h-3.5" />
            <span>CLICK</span>
          </button>

          <button
            onClick={() => setActiveTab('auto')}
            className={`flex items-center justify-center gap-1 py-1.5 rounded transition-all ${
              activeTab === 'auto'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(0,243,255,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Icons.Bot className="w-3.5 h-3.5" />
            <span>AUTO</span>
          </button>

          <button
            onClick={() => setActiveTab('special')}
            className={`flex items-center justify-center gap-1 py-1.5 rounded transition-all ${
              activeTab === 'special'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(0,243,255,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Icons.Sparkles className="w-3.5 h-3.5" />
            <span>RELICS</span>
          </button>

          <button
            onClick={() => setActiveTab('music')}
            className={`flex items-center justify-center gap-1 py-1.5 rounded transition-all ${
              activeTab === 'music'
                ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-slate-950 font-bold shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                : 'text-amber-400 hover:text-amber-200 hover:bg-amber-950/30'
            }`}
          >
            <Icons.Radio className="w-3.5 h-3.5" />
            <span>LEGENDS</span>
          </button>

          <button
            onClick={() => setActiveTab('cosmetics')}
            className={`flex items-center justify-center gap-1 py-1.5 rounded transition-all ${
              activeTab === 'cosmetics'
                ? 'bg-gradient-to-r from-fuchsia-500 to-pink-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(217,70,239,0.4)]'
                : 'text-fuchsia-400 hover:text-fuchsia-200 hover:bg-fuchsia-950/30'
            }`}
          >
            <Icons.Palette className="w-3.5 h-3.5" />
            <span>STYLE</span>
          </button>
        </div>

        {/* Cosmetics Category Sub-Filter */}
        {activeTab === 'cosmetics' && (
          <div className="flex items-center justify-between gap-1 bg-slate-950/80 p-1 rounded border border-fuchsia-500/20 text-[9px] sm:text-[10px]">
            {[
              { id: 'all', label: 'ALL' },
              { id: 'skin', label: 'SKINS' },
              { id: 'particle', label: 'PARTICLES' },
              { id: 'sfx', label: 'SFX' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCosmeticCategory(cat.id as 'all' | 'skin' | 'particle' | 'sfx')}
                className={`flex-1 py-1 rounded font-mono font-bold transition-all ${
                  cosmeticCategory === cat.id
                    ? 'bg-fuchsia-950 border border-fuchsia-500/50 text-fuchsia-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Shop Content List */}
      <div className="flex-1 overflow-y-auto pr-1 mt-2.5 space-y-2 custom-scrollbar">
        {/* TAB 1: Click Upgrades */}
        {activeTab === 'click' &&
          CLICK_UPGRADES.map((item) => {
            const owned = gameState.itemsOwned[item.id] || 0;
            const amountToBuy =
              bulkMode === 'max'
                ? getMaxAffordable(item.baseCost, item.costMultiplier, owned, gameState.points)
                : bulkMode;
            const totalCost = getItemCost(item.baseCost, item.costMultiplier, owned, amountToBuy);
            const canAfford = gameState.points >= totalCost && totalCost > 0;

            return (
              <div
                key={item.id}
                className={`group relative p-2.5 rounded border transition-all duration-150 ${
                  canAfford
                    ? 'bg-[#060911]/80 border-slate-800 hover:border-cyan-500/50 hover:bg-[#0b0f19]'
                    : 'bg-[#060911]/40 border-slate-900 opacity-55'
                }`}
              >
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`p-2 rounded border ${
                        canAfford
                          ? 'bg-cyan-950/80 border-cyan-500/40 text-cyan-400'
                          : 'bg-slate-900 border-slate-800 text-slate-600'
                      }`}
                    >
                      {renderIcon(item.iconName, 'w-4 h-4')}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-bold text-slate-100 truncate font-mono">
                          {item.name}
                        </h3>
                        {owned > 0 && (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                            x{owned}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                      <p className="text-[10px] font-mono text-cyan-400/90 mt-0.5">
                        +{formatNumber(item.power * amountToBuy)} PPC (Tot: +
                        {formatNumber(item.power * owned)})
                      </p>
                    </div>
                  </div>

                  {/* Purchase Button */}
                  <button
                    disabled={!canAfford}
                    onClick={() => {
                      if (canAfford) {
                        onBuyItem(item.id, 'click', amountToBuy, totalCost);
                        audio.playBuySound();
                      }
                    }}
                    className={`shrink-0 px-2.5 py-1.5 rounded font-mono font-bold text-[11px] flex flex-col items-center justify-center transition-all ${
                      canAfford
                        ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_10px_rgba(0,243,255,0.3)] active:scale-95'
                        : 'bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-800'
                    }`}
                  >
                    <span className="text-[9px] opacity-80">
                      BUY {amountToBuy > 1 ? `x${amountToBuy}` : ''}
                    </span>
                    <span className="flex items-center gap-0.5 mt-0.5">
                      <Icons.Zap className="w-3 h-3" />
                      {formatNumber(totalCost)}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}

        {/* TAB 2: Auto Generators */}
        {activeTab === 'auto' &&
          AUTO_GENERATORS.map((item) => {
            const owned = gameState.itemsOwned[item.id] || 0;
            const amountToBuy =
              bulkMode === 'max'
                ? getMaxAffordable(item.baseCost, item.costMultiplier, owned, gameState.points)
                : bulkMode;
            const totalCost = getItemCost(item.baseCost, item.costMultiplier, owned, amountToBuy);
            const canAfford = gameState.points >= totalCost && totalCost > 0;

            return (
              <div
                key={item.id}
                className={`group relative p-2.5 rounded border transition-all duration-150 ${
                  canAfford
                    ? 'bg-[#060911]/80 border-slate-800 hover:border-cyan-500/50 hover:bg-[#0b0f19]'
                    : 'bg-[#060911]/40 border-slate-900 opacity-55'
                }`}
              >
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`p-2 rounded border ${
                        canAfford
                          ? 'bg-cyan-950/80 border-cyan-500/40 text-cyan-400'
                          : 'bg-slate-900 border-slate-800 text-slate-600'
                      }`}
                    >
                      {renderIcon(item.iconName, 'w-4 h-4')}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-bold text-slate-100 truncate font-mono">
                          {item.name}
                        </h3>
                        {owned > 0 && (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                            x{owned}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                      <p className="text-[10px] font-mono text-cyan-400/90 mt-0.5">
                        +{formatNumber(item.power * amountToBuy)} PPS (Tot: +
                        {formatNumber(item.power * owned)}/s)
                      </p>
                    </div>
                  </div>

                  <button
                    disabled={!canAfford}
                    onClick={() => {
                      if (canAfford) {
                        onBuyItem(item.id, 'auto', amountToBuy, totalCost);
                        audio.playBuySound();
                      }
                    }}
                    className={`shrink-0 px-2.5 py-1.5 rounded font-mono font-bold text-[11px] flex flex-col items-center justify-center transition-all ${
                      canAfford
                        ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_10px_rgba(0,243,255,0.3)] active:scale-95'
                        : 'bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-800'
                    }`}
                  >
                    <span className="text-[9px] opacity-80">
                      BUY {amountToBuy > 1 ? `x${amountToBuy}` : ''}
                    </span>
                    <span className="flex items-center gap-0.5 mt-0.5">
                      <Icons.Zap className="w-3 h-3" />
                      {formatNumber(totalCost)}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}

        {/* TAB 3: Special Upgrades & Relics */}
        {activeTab === 'special' &&
          SPECIAL_UPGRADES.map((upgrade) => {
            const isOwned = gameState.upgradesPurchased.includes(upgrade.id);
            const canAfford = gameState.points >= upgrade.cost && !isOwned;

            return (
              <div
                key={upgrade.id}
                className={`p-2.5 rounded border transition-all ${
                  isOwned
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : canAfford
                    ? 'bg-[#060911]/80 border-slate-800 hover:border-amber-500/50'
                    : 'bg-[#060911]/40 border-slate-900 opacity-55'
                }`}
              >
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`p-2 rounded border ${
                        isOwned
                          ? 'bg-emerald-900/40 border-emerald-500/40 text-emerald-400'
                          : canAfford
                          ? 'bg-amber-950/80 border-amber-500/40 text-amber-400'
                          : 'bg-slate-900 border-slate-800 text-slate-600'
                      }`}
                    >
                      {renderIcon(upgrade.iconName, 'w-4 h-4')}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-bold text-slate-100 truncate font-mono">
                          {upgrade.name}
                        </h3>
                        {isOwned && (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                            UNLOCKED
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-300 mt-0.5">
                        {upgrade.description}
                      </p>
                    </div>
                  </div>

                  {!isOwned ? (
                    <button
                      disabled={!canAfford}
                      onClick={() => {
                        if (canAfford) {
                          onBuyUpgrade(upgrade.id, upgrade.cost);
                          audio.playBuySound();
                        }
                      }}
                      className={`shrink-0 px-2.5 py-1.5 rounded font-mono font-bold text-[11px] flex flex-col items-center justify-center transition-all ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.3)] active:scale-95'
                          : 'bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-800'
                      }`}
                    >
                      <span className="text-[9px] opacity-80">RESEARCH</span>
                      <span className="flex items-center gap-0.5 mt-0.5">
                        <Icons.Zap className="w-3 h-3" />
                        {formatNumber(upgrade.cost)}
                      </span>
                    </button>
                  ) : (
                    <div className="shrink-0 p-1 text-emerald-400">
                      <Icons.CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

        {/* TAB 4: Master Composers & Virtuosos */}
        {activeTab === 'music' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-1.5 mb-2 pb-1 border-b border-purple-500/30 text-purple-300 font-bold text-xs uppercase">
                <Icons.Award className="w-4 h-4 text-purple-400" />
                <span>MASTER LEGENDS & CHARACTERS (PASSIVE MULTIPLIERS)</span>
              </div>
              <div className="space-y-2.5">
                {MASTER_COMPOSERS.map((comp) => {
                  const isUnlocked = unlockedComposers.includes(comp.id);
                  const canAfford = gameState.points >= comp.cost && !isUnlocked;

                  return (
                    <div
                      key={comp.id}
                      className={`p-3 rounded-2xl border transition-all ${
                        isUnlocked
                          ? 'bg-gradient-to-r from-purple-950/40 via-slate-900/80 to-amber-950/20 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                          : canAfford
                          ? 'bg-[#0a0f1d]/90 border-purple-500/30 hover:border-purple-400/60'
                          : 'bg-[#060911]/50 border-slate-900 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          {/* Avatar Circle with Real Photo */}
                          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${comp.avatarBg} border-2 border-purple-400/50 overflow-hidden shrink-0 shadow-lg relative group`}>
                            {comp.imageUrl ? (
                              <img
                                src={comp.imageUrl}
                                alt={comp.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white">
                                {renderIcon(comp.iconName, 'w-5 h-5')}
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-xs font-bold text-slate-100 font-mono">
                                {comp.name}
                              </h3>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-500/40 font-semibold uppercase">
                                {comp.era}
                              </span>
                              {isUnlocked && (
                                <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/50 font-bold">
                                  ACTIVE PASSIVE
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] font-semibold text-amber-300 mt-1">
                              {comp.description}
                            </p>
                            <p className="text-[10px] text-slate-400 italic mt-0.5 line-clamp-1">
                              "{comp.quote}"
                            </p>
                          </div>
                        </div>

                        {/* Unlock Button */}
                        {!isUnlocked ? (
                          <button
                            disabled={!canAfford}
                            onClick={() => {
                              if (canAfford && onUnlockComposer) {
                                onUnlockComposer(comp.id, comp.cost);
                                audio.playAchievementSound();
                              }
                            }}
                            className={`shrink-0 px-3 py-2 rounded-xl font-mono font-bold text-[11px] flex flex-col items-center justify-center transition-all ${
                              canAfford
                                ? 'bg-gradient-to-r from-purple-500 to-amber-500 hover:from-purple-400 hover:to-amber-400 text-slate-950 shadow-[0_0_12px_rgba(168,85,247,0.4)] active:scale-95'
                                : 'bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-800'
                            }`}
                          >
                            <span className="text-[8px] opacity-80">PATRONIZE</span>
                            <span className="flex items-center gap-0.5 mt-0.5">
                              <Icons.Zap className="w-3 h-3" />
                              {formatNumber(comp.cost)}
                            </span>
                          </button>
                        ) : (
                          <div className="shrink-0 p-1.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                            <Icons.CheckCircle2 className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Cosmetics & Visual Customization */}
        {activeTab === 'cosmetics' &&
          filteredCosmetics.map((cosmetic: CosmeticItem) => {
            const isUnlocked = unlockedCosmetics.includes(cosmetic.id) || cosmetic.cost === 0;
            const equippedMap = {
              skin: gameState.equippedSkin || 'cyber_crystal',
              particle: gameState.equippedParticle || 'neon_sparks',
              theme: gameState.equippedTheme || 'cyberpunk',
              sfx: gameState.equippedSfx || 'synth',
            };
            const isEquipped = equippedMap[cosmetic.category] === cosmetic.id;
            const canAfford = gameState.points >= cosmetic.cost && !isUnlocked;

            return (
              <div
                key={`${cosmetic.category}_${cosmetic.id}`}
                className={`p-2.5 rounded border transition-all ${
                  isEquipped
                    ? 'bg-fuchsia-950/30 border-fuchsia-500/60 shadow-[0_0_12px_rgba(217,70,239,0.2)]'
                    : isUnlocked
                    ? 'bg-[#060911]/90 border-slate-800 hover:border-fuchsia-500/40'
                    : canAfford
                    ? 'bg-[#060911]/70 border-slate-800 hover:border-fuchsia-500/30'
                    : 'bg-[#060911]/40 border-slate-900 opacity-55'
                }`}
              >
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="p-2 rounded border border-slate-800 flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: cosmetic.previewColor ? `${cosmetic.previewColor}15` : '#0f172a',
                        borderColor: cosmetic.previewColor ? `${cosmetic.previewColor}50` : '#334155',
                        color: cosmetic.previewColor || '#f43f5e',
                      }}
                    >
                      {renderIcon(cosmetic.iconName, 'w-4 h-4')}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-bold text-slate-100 truncate font-mono">
                          {cosmetic.name}
                        </h3>
                        <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-slate-900 text-fuchsia-300 border border-fuchsia-500/30 uppercase">
                          {cosmetic.category}
                        </span>
                        {isEquipped && (
                          <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/50 font-bold">
                            EQUIPPED
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        {cosmetic.description}
                      </p>
                    </div>
                  </div>

                  {/* Cosmetic Action Buttons */}
                  <div className="shrink-0 flex items-center gap-1.5">
                    {cosmetic.category === 'sfx' && (
                      <button
                        type="button"
                        onClick={() => audio.playClickSound(cosmetic.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 hover:text-cyan-200 transition-all active:scale-95"
                        title="Test Sound Effect"
                      >
                        <Icons.Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {isEquipped ? (
                      <div className="px-2.5 py-1.5 rounded bg-fuchsia-950/80 border border-fuchsia-500/40 text-fuchsia-300 text-[10px] font-mono font-bold flex items-center gap-1">
                        <Icons.Check className="w-3.5 h-3.5 text-fuchsia-400" />
                        <span>ACTIVE</span>
                      </div>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => {
                          onEquipCosmetic(cosmetic.category, cosmetic.id);
                          audio.playClickSound(cosmetic.id);
                        }}
                        className="px-2.5 py-1.5 rounded bg-fuchsia-900/50 hover:bg-fuchsia-800/80 border border-fuchsia-500/40 text-fuchsia-200 text-[10px] font-mono font-bold transition-all shadow-[0_0_8px_rgba(217,70,239,0.2)] active:scale-95"
                      >
                        EQUIP
                      </button>
                    ) : (
                      <button
                        disabled={!canAfford}
                        onClick={() => {
                          if (canAfford) {
                            onUnlockCosmetic(cosmetic.id, cosmetic.cost);
                            onEquipCosmetic(cosmetic.category, cosmetic.id);
                            audio.playBuySound();
                          }
                        }}
                        className={`px-2.5 py-1.5 rounded font-mono font-bold text-[10px] flex flex-col items-center justify-center transition-all ${
                          canAfford
                            ? 'bg-fuchsia-500 hover:bg-fuchsia-400 text-slate-950 shadow-[0_0_10px_rgba(217,70,239,0.4)] active:scale-95'
                            : 'bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-800'
                        }`}
                      >
                        <span className="text-[8px] opacity-80">UNLOCK</span>
                        <span className="flex items-center gap-0.5 mt-0.5">
                          <Icons.Zap className="w-3 h-3" />
                          {formatNumber(cosmetic.cost)}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
