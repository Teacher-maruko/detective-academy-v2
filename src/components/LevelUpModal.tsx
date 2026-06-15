import React from 'react';
import { Award, Zap, Coins, Sparkles } from 'lucide-react';

interface LevelUpModalProps {
  isOpen: boolean;
  level: number;
  rank: string;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ isOpen, level, rank, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-55 animate-fade-in">
      <div className="bg-white border-4 border-slate-900 rounded-[36px] p-6 max-w-sm w-full shadow-[8px_8px_0px_rgba(15,23,42,1)] relative flex flex-col items-center justify-center text-center gap-5 animate-scale-up">
        
        {/* Decorative sparkles */}
        <div className="absolute -top-12 text-6xl animate-bounce-slow">🎉</div>
        
        <div className="w-20 h-20 bg-amber-400 rounded-3xl border-4 border-slate-900 flex items-center justify-center relative shadow-[4px_4px_0px_rgba(15,23,42,1)] animate-bounce">
          <Award className="w-12 h-12 text-slate-900 fill-white stroke-[2.5]" />
          <div className="absolute -bottom-2 -right-2 bg-rose-500 border-2 border-slate-900 text-white font-black text-xs px-2.5 py-0.5 rounded-full shadow">
            Lv.{level}
          </div>
        </div>

        <div>
          <h2 className="font-extrabold text-xs text-indigo-500 uppercase tracking-widest flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 fill-indigo-200" /> 恭喜晉升！LEVEL UP! <Sparkles className="w-3.5 h-3.5 fill-indigo-200" />
          </h2>
          <h3 className="font-black text-2xl text-slate-900 mt-1">
            名偵探等級上升！
          </h3>
          <p className="text-slate-500 font-bold text-xs mt-1.5 px-4">
            你在數學思考實驗室的階級已成功提升至最高榮耀！
          </p>
        </div>

        {/* Promotion details */}
        <div className="w-full bg-slate-50 border-3 border-slate-900 rounded-2xl p-4 flex flex-col gap-2.5 shadow-inner">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-500">獲得新頭銜稱號：</span>
            <span className="bg-indigo-100 text-indigo-850 font-black py-0.5 px-3 rounded-full border border-indigo-200 shadow-sm text-center">
              🎗️ {rank}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-500">學院晉升賀禮：</span>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-emerald-600 bg-white border border-slate-300 py-0.5 px-2 rounded-lg">
                💰 <span className="text-slate-800">+250 金幣</span>
              </span>
              <span className="flex items-center gap-1 text-rose-500 bg-white border border-slate-300 py-0.5 px-2 rounded-lg">
                ⚡ <span className="text-slate-800">體力補滿</span>
              </span>
            </div>
          </div>
        </div>

        {/* Confirm Button */}
        <button
          onClick={onClose}
          className="w-full bg-amber-400 hover:bg-amber-500 border-3 border-slate-900 text-slate-900 font-black text-sm py-2 px-5 rounded-2xl shadow-[3px_3px_0px_rgba(15,23,42,1)] active:translate-y-0.5 active:shadow-none hover:scale-105 transition-all cursor-pointer"
        >
          太棒了，繼續查案！ 🚀
        </button>

      </div>
    </div>
  );
};
