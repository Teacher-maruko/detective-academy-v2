import React from 'react';
import { PlayerStats } from '../types';
import { Award, Zap, Coins, Clock, Sparkles } from 'lucide-react';

interface TopBarProps {
  stats: PlayerStats;
  addStamina: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ stats, addStamina }) => {
  // Calculate XP percentage
  const xpNeeded = stats.level * 150;
  const xpPercent = Math.min(100, Math.floor((stats.xp / xpNeeded) * 100));

  return (
    <div id="top-bar-panel" className="bg-white/95 backdrop-blur-md border-4 border-slate-900 rounded-3xl p-4 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] flex flex-wrap gap-4 items-center justify-between transition-all duration-300">
      
      {/* Profile & Detective Rank */}
      <div className="flex items-center gap-3">
        <div className="relative animate-bounce-slow">
          <div className="w-14 h-14 bg-amber-400 rounded-2xl border-4 border-slate-900 flex items-center justify-center font-bold text-2xl shadow-[4px_4px_0px_rgba(15,23,42,1)]">
            🕵️‍♂️
          </div>
          <div className="absolute -bottom-2 -right-2 bg-rose-500 text-white font-black text-xs px-2 py-0.5 rounded-full border-2 border-slate-900 shadow">
            Lv.{stats.level}
          </div>
        </div>
        
        <div>
          <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-1.5 leading-tight">
            <span>邏輯大冒險家</span>
            <span className="bg-amber-100 text-amber-800 text-xs py-0.5 px-2 rounded-lg border-2 border-amber-400 font-bold shrink-0">
              {stats.detectiveRank}
            </span>
          </h2>
          {/* XP Progress Bar */}
          <div className="mt-1 w-40 sm:w-48">
            <div className="flex justify-between text-[10px] text-slate-500 font-bold mb-0.5">
              <span>經驗值 (XP)</span>
              <span>{stats.xp} / {xpNeeded}</span>
            </div>
            <div className="h-4 bg-slate-100 rounded-full border-2 border-slate-900 overflow-hidden p-0.5">
              <div
                style={{ width: `${xpPercent}%` }}
                className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all duration-500 shadow-[inset_0_-2px_0_rgba(0,0,0,0.15)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stamina & Currency Statuses */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 font-black">
        {/* Stamina */}
        <div 
          onClick={addStamina}
          className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 cursor-pointer text-rose-600 border-3 border-slate-900 rounded-2xl py-1.5 px-3 shadow-[4px_4px_0px_rgba(15,23,42,1)] active:translate-y-1 active:shadow-none transition-all group"
          title="點擊補充點體力"
        >
          <Zap className="w-5 h-5 fill-rose-500 stroke-slate-900 group-hover:scale-125 transition-transform" />
          <div className="text-sm">
            <span className="text-xs text-rose-500 font-bold block leading-none">推理體力</span>
            <span className="text-base font-black">
              {stats.stamina} / {stats.maxStamina}
            </span>
          </div>
          <span className="bg-rose-500 text-white font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900 shadow -mr-1 group-hover:bg-rose-600">
            +
          </span>
        </div>

        {/* Coins */}
        <div className="flex items-center gap-2 bg-amber-50 text-amber-600 border-3 border-slate-900 rounded-2xl py-1.5 px-3 shadow-[4px_4px_0px_rgba(15,23,42,1)] hover:-translate-y-0.5 transition-transform">
          <Coins className="w-5 h-5 fill-amber-400 stroke-slate-900 animate-pulse" />
          <div>
            <span className="text-xs text-amber-500 font-bold block leading-none">神探金幣</span>
            <span className="text-base text-slate-900 font-black">{stats.coins}</span>
          </div>
        </div>

        {/* Total Solved Status */}
        <div className="flex items-center gap-2 bg-indigo-50 text-indigo-600 border-3 border-slate-900 rounded-2xl py-1.5 px-3 shadow-[4px_4px_0px_rgba(15,23,42,1)]">
          <Award className="w-5 h-5 fill-indigo-200 stroke-slate-900" />
          <div>
            <span className="text-xs text-indigo-500 font-bold block leading-none">破解案件</span>
            <span className="text-base text-slate-900 font-black">{stats.solvedCount} 關</span>
          </div>
        </div>
      </div>

    </div>
  );
};
