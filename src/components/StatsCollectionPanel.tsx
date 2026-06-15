import React, { useState } from 'react';
import { PlayerStats, Achievement, CollectionItem } from '../types';
import { Trophy, Gift, Award, ShoppingBag, Eye, Star, UserCheck } from 'lucide-react';

interface StatsCollectionPanelProps {
  stats: PlayerStats;
  achievements: Achievement[];
  collections: CollectionItem[];
  onClaimAchievementReward: (achievementId: string) => void;
  onBuyCollectionItem: (itemId: string) => void;
  onResetWalkthrough?: () => void;
}

export const StatsCollectionPanel: React.FC<StatsCollectionPanelProps> = ({
  stats,
  achievements,
  collections,
  onClaimAchievementReward,
  onBuyCollectionItem,
  onResetWalkthrough,
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'achievements' | 'shop'>('achievements');
  
  // Categorized collections
  const filterCollections = (cat: CollectionItem['category']) => {
    return collections.filter(item => item.category === cat);
  };

  // Counting unclaimed rewards
  const claimableCount = achievements.filter(ach => ach.currentCount >= ach.targetCount && !ach.unlocked).length;

  return (
    <div id="growth-center-panel" className="bg-white/95 border-4 border-slate-900 rounded-3xl p-5 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] flex flex-col gap-6 w-full">
      
      {/* Grow Center Navigation */}
      <div className="flex justify-between items-center flex-wrap gap-3 border-b-4 border-slate-900 pb-2.5">
        <div>
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-1.5 leading-none">
            <span>🏆 神探個人成長中心</span>
          </h3>
          <p className="text-xs text-slate-500 font-bold mt-1">
            在這裡，你可以查看個人破案記錄、解鎖榮譽成就領取獎勵，並前往偵探商鋪購買稀有收藏精品。
          </p>
        </div>

        {/* Tab buttons */}
        <div className="flex gap-2">
          {/* Achievements Tab */}
          <button
            onClick={() => setActiveTab('achievements')}
            className={`flex items-center gap-1.5 text-xs font-black py-2 px-3.5 rounded-xl border-2 transition-all cursor-pointer relative ${
              activeTab === 'achievements'
                ? 'bg-slate-900 text-amber-300 border-slate-900 shadow-[2px_2px_0px_rgba(15,23,42,1)]'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
            }`}
          >
            <Trophy className="w-4 h-4 fill-amber-300 stroke-slate-900" />
            <span>成就大廳</span>
            {claimableCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 border-2 border-slate-900 text-white font-bold text-[9px] w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                {claimableCount}
              </span>
            )}
          </button>

          {/* Shop/Collections Tab */}
          <button
            onClick={() => setActiveTab('shop')}
            className={`flex items-center gap-1.5 text-xs font-black py-2 px-3.5 rounded-xl border-2 transition-all cursor-pointer ${
              activeTab === 'shop'
                ? 'bg-slate-900 text-amber-300 border-slate-900 shadow-[2px_2px_0px_rgba(15,23,42,1)]'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-emerald-500" />
            <span>收藏與商圈</span>
          </button>

          {/* Stats Tab */}
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-1.5 text-xs font-black py-2 px-3.5 rounded-xl border-2 transition-all cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-slate-900 text-amber-300 border-slate-900 shadow-[2px_2px_0px_rgba(15,23,42,1)]'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
            }`}
          >
            <Award className="w-4 h-4 text-blue-500" />
            <span>偵破檔案</span>
          </button>
        </div>
      </div>

      {/* TABS CONTENTS */}
      
      {/* 1. ACHIEVEMENTS HALL */}
      {activeTab === 'achievements' && (
        <div className="flex flex-col gap-4">
          <div className="bg-amber-50 border-3 border-amber-300 p-3.5 rounded-2xl flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-amber-800 font-bold">
              <Gift className="w-5 h-5 text-amber-500 shrink-0" />
              <span>達成特殊成就即可在此領取高額「神探金幣」獎勵！多達 100 多種推理挑戰，考驗你的極限邏輯。</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[420px] overflow-y-auto pr-1">
            {achievements.map((ach) => {
              const isLocked = ach.currentCount < ach.targetCount;
              const isClaimed = ach.unlocked; 
              const isClaimable = !isLocked && !isClaimed;
              const percent = Math.min(100, Math.floor((ach.currentCount / ach.targetCount) * 105));

              let rarityColor = 'border-slate-200 bg-white';
              if (isClaimable) rarityColor = 'border-amber-400 bg-amber-50/20';
              if (isClaimed) rarityColor = 'border-slate-300 bg-slate-50/70 opacity-70';

              return (
                <div
                  key={ach.id}
                  className={`border-3 rounded-2xl p-3 flex flex-col justify-between gap-2.5 transition-all shadow-[2px_2px_0px_rgba(15,23,42,1)] ${rarityColor}`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className={`font-black text-sm text-slate-900 ${isClaimed ? 'line-through text-slate-400' : ''}`}>
                        🏆 {ach.title}
                      </h4>
                      <p className="text-[11px] font-bold text-slate-500">{ach.description}</p>
                    </div>
                    
                    {/* Golden Coins Reward Indicator */}
                    <span className="bg-amber-100 text-amber-700 font-extrabold text-[10px] py-0.5 px-2 rounded-lg border border-amber-300 whitespace-nowrap">
                      💰 +{ach.goldReward}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full">
                    <div className="flex justify-between text-[9px] text-slate-400 font-black mb-1 p-0.5">
                      <span>挑戰任務進度</span>
                      <span>{ach.currentCount} / {ach.targetCount}</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full border border-slate-300 p-0.5 relative">
                      <div
                        style={{ width: `${percent}%` }}
                        className={`h-full rounded-full transition-all duration-300 ${isClaimable ? 'bg-gradient-to-r from-teal-400 to-emerald-500' : 'bg-slate-400'}`}
                      />
                    </div>
                  </div>

                  {/* Claim Button or Claimed Stamp */}
                  <div className="flex justify-end mt-1">
                    {isClaimable ? (
                      <button
                        onClick={() => onClaimAchievementReward(ach.id)}
                        className="bg-amber-400 hover:bg-amber-500 border-2 border-slate-950 font-black text-xs py-1 px-4 rounded-xl shadow-[2px_2px_0px_rgba(15,23,42,1)] hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1 shrink-0 animate-bounce"
                      >
                        <Gift className="w-3.5 h-3.5" /> 領取獎勵
                      </button>
                    ) : isClaimed ? (
                      <span className="text-[10px] text-slate-400 font-extrabold flex items-center gap-1 select-none">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" /> 已徵收
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-extrabold">未達成</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. COLLECTION AND SHOP */}
      {activeTab === 'shop' && (
        <div className="flex flex-col gap-5">
          {/* Collections list categorizations */}
          {['badge', 'character', 'title', 'avatar_frame', 'illustration'].map((catType) => {
            const list = filterCollections(catType as CollectionItem['category']);
            const label = 
              catType === 'badge' ? '🎖️ 偵探徽章 (Badges)' :
              catType === 'character' ? '👤 收集角色 (Characters)' :
              catType === 'title' ? '🏷️ 稀有稱號 (Titles)' :
              catType === 'avatar_frame' ? '🖼️ 頭像畫框 (Avatar Frames)' : '🎨 精緻背景 (Background Art)';

            return (
              <div key={catType} className="flex flex-col gap-3">
                <h4 className="font-extrabold text-sm text-slate-800 border-l-4 border-slate-900 pl-2">
                  {label}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {list.map((item) => {
                    const isUnlocked = item.unlocked;
                    return (
                      <div
                        key={item.id}
                        className={`border-3 rounded-2xl p-3 flex flex-col justify-between items-center text-center gap-2 shadow-[2px_2px_0px_rgba(15,23,42,1)] transition-all ${
                          isUnlocked
                            ? 'bg-emerald-50/20 border-emerald-500'
                            : 'bg-slate-50 border-slate-900 group'
                        }`}
                      >
                        {/* Artwork representation */}
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center border-2 border-slate-300 text-2xl relative shadow-inner">
                          {catType === 'badge' && '🎖️'}
                          {catType === 'character' && '👤'}
                          {catType === 'title' && '🏷️'}
                          {catType === 'avatar_frame' && '🖼️'}
                          {catType === 'illustration' && '🎨'}
                          {!isUnlocked && (
                            <div className="absolute inset-0 bg-slate-900/45 rounded-xl flex items-center justify-center text-white text-xs font-black select-none">
                              🔒
                            </div>
                          )}
                        </div>

                        <div>
                          <p className="font-extrabold text-xs text-slate-800 line-clamp-1">{item.name}</p>
                          <p className="text-[9px] font-bold text-slate-400 mt-0.5 line-clamp-2 leading-tight">
                            {item.description}
                          </p>
                        </div>

                        {/* Rarity */}
                        <span className={`text-[8px] font-black uppercase tracking-wider py-0.5 px-2 rounded-full border ${
                          item.rarity === 'legendary' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                          item.rarity === 'epic' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                          item.rarity === 'rare' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {item.rarity === 'legendary' ? '傳奇' : item.rarity === 'epic' ? '史詩' : item.rarity === 'rare' ? '稀有' : '普通'}
                        </span>

                        {/* Purchase Button / Unlocked Label */}
                        <div className="w-full mt-1.5">
                          {isUnlocked ? (
                            <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[9px] py-1 px-3 rounded-xl border border-emerald-300 inline-block w-full">
                              ⭐ 已解鎖
                            </span>
                          ) : (
                            <button
                              onClick={() => onBuyCollectionItem(item.id)}
                              disabled={stats.coins < (item.cost || 0)}
                              className={`w-full text-[10px] font-black py-1 px-2 rounded-xl border-2 cursor-pointer transition-all ${
                                stats.coins >= (item.cost || 0)
                                  ? 'bg-amber-400 hover:bg-amber-500 border-slate-950 shadow-[1px_1px_0px_rgba(15,23,42,1)] active:scale-95'
                                  : 'bg-slate-150 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
                              }`}
                            >
                              💰 買下 ({item.cost})
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. HISTORIAL DOSSIER STATS */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Core numerical progress */}
          <div className="flex flex-col gap-4">
            <h4 className="font-extrabold text-sm text-slate-800 border-l-4 border-slate-900 pl-2 pb-0.5">
              破案神探數據統計 (Performance Statistics)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 border-2 border-slate-900 p-3 rounded-2xl shadow">
                <span className="text-[10px] text-slate-400 font-extrabold block">累積破解局數</span>
                <span className="text-2xl font-black text-slate-850">{stats.solvedCount} 關</span>
              </div>
              <div className="bg-slate-50 border-2 border-slate-900 p-3 rounded-2xl shadow">
                <span className="text-[10px] text-slate-400 font-extrabold block">當前連勝紀錄</span>
                <span className="text-2xl font-black text-rose-500">{stats.unstoppableStreak} 局</span>
              </div>
              <div className="bg-slate-50 border-2 border-slate-900 p-3 rounded-2xl shadow">
                <span className="text-[10px] text-slate-400 font-extrabold block">已用提示次數</span>
                <span className="text-2xl font-black text-amber-500">{stats.hintsUsed} 次</span>
              </div>
              <div className="bg-slate-50 border-2 border-slate-900 p-3 rounded-2xl shadow">
                <span className="text-[10px] text-slate-400 font-extrabold block">偵察兵體力上限</span>
                <span className="text-2xl font-black text-green-500">{stats.maxStamina} 點</span>
              </div>
            </div>

            {onResetWalkthrough && (
              <div className="mt-1">
                <button
                  onClick={onResetWalkthrough}
                  className="w-full bg-[#FFF8E7] hover:bg-amber-100 text-slate-800 font-black text-xs py-2.5 px-4 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_rgba(15,23,42,1)] hover:scale-[1.01] transition-transform cursor-pointer text-center"
                >
                  🏫 重溫新手選取教學 (Replay Walkthrough)
                </button>
              </div>
            )}
          </div>

          {/* Slices of solved counts per difficulty */}
          <div className="flex flex-col gap-4">
            <h4 className="font-extrabold text-sm text-slate-800 border-l-4 border-slate-900 pl-2 pb-0.5">
              難度進度排查 (Difficulties Mastery)
            </h4>
            <div className="flex flex-col gap-2 bg-slate-50/50 p-3 border-2 border-slate-900 rounded-2xl">
              {Object.keys(stats.solvedByDifficulty).map((diffStr) => {
                const diffKey = Number(diffStr);
                const count = stats.solvedByDifficulty[diffKey as any] || 0;
                const label = 
                  diffKey === 1 ? 'Lv1 基礎' :
                  diffKey === 2 ? 'Lv2 簡單' :
                  diffKey === 3 ? 'Lv3 普通' :
                  diffKey === 4 ? 'Lv4 困難' :
                  diffKey === 5 ? 'Lv5 專家' :
                  diffKey === 6 ? 'Lv6 大師' :
                  diffKey === 7 ? 'Lv7 傳奇' : 'Lv8 非常困難';

                const bestTimeVal = localStorage.getItem(`detective_best_time_diff_${diffKey}`);
                const bestTimeFormatted = bestTimeVal 
                  ? `${Math.floor(Number(bestTimeVal) / 60)}分${(Number(bestTimeVal) % 60).toString().padStart(2, '0')}秒`
                  : '尚無紀錄';

                return (
                  <div key={diffStr} className="flex items-center justify-between text-xs font-bold border-b border-dashed border-slate-200 pb-1.5 last:border-0 last:pb-0">
                    <span className="text-slate-700">{label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 bg-amber-50 border border-amber-200 py-0.5 px-2 rounded-md flex items-center gap-0.5">
                        ⏱️ 最快: <span className="text-amber-800 font-extrabold">{bestTimeFormatted}</span>
                      </span>
                      <span className="bg-indigo-150 text-indigo-800 font-black py-0.5 px-2.5 rounded-full border border-indigo-100">
                        獲勝 {count} 次
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
