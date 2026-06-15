import React from 'react';
import { Award, Play, X, Compass, ShieldAlert, Sparkles } from 'lucide-react';

interface CaseStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapterNumber: number;
  caseName: string;
  chapterTitle: string;
  description: string;
  themeId: string;
  rewardGold: number;
  rewardXp: number;
  targetDifficulty: number;
  onAcceptCase: () => void;
}

export const CaseStoryModal: React.FC<CaseStoryModalProps> = ({
  isOpen,
  onClose,
  chapterNumber,
  caseName,
  chapterTitle,
  description,
  themeId,
  rewardGold,
  rewardXp,
  targetDifficulty,
  onAcceptCase,
}) => {
  if (!isOpen) return null;

  const getThemeLabel = () => {
    if (themeId === 'campus') return '🏫 校園生活主題區';
    if (themeId === 'animal') return '🦁 動物王國主題區';
    if (themeId === 'dino') return '🦖 恐龍世界主題區';
    if (themeId === 'ocean') return '🐬 海洋探險主題區';
    if (themeId === 'space') return '🚀 太空基地主題區';
    if (themeId === 'magic') return '🔮 魔法學院主題區';
    if (themeId === 'ninja') return '🥷 忍者村主題區';
    if (themeId === 'fairytale') return '👑 童話王國主題區';
    if (themeId === 'food') return '🍔 美食小鎮主題區';
    if (themeId === 'jobs') return '💼 職業城市主題區';
    if (themeId === 'travel') return '✈️ 世界旅行主題區';
    return '🤖 未來科技主題區';
  };

  return (
    <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-md flex items-center justify-center p-4 z-55 animate-fade-in">
      <div className="bg-white border-4 border-slate-900 rounded-[32px] p-6 max-w-lg w-full shadow-[8px_8px_0px_rgba(15,23,42,1)] relative flex flex-col gap-4 animate-scale-up">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 border-2 border-slate-950 p-1.5 rounded-full cursor-pointer hover:rotate-90 transition-all"
        >
          <X className="w-5 h-5 text-slate-800" />
        </button>

        {/* Top badges header */}
        <div className="flex gap-2 items-center">
          <span className="bg-slate-950 text-amber-300 font-black text-xs px-3 py-1 rounded-full border-2 border-slate-900 shadow">
            主線任務 #{chapterNumber}
          </span>
          <span className="bg-rose-100 text-rose-800 font-extrabold text-[10px] px-2.5 py-1 rounded-full border border-rose-350 shrink-0">
            難度：Lv.{targetDifficulty}
          </span>
        </div>

        {/* Theatrical Header banner */}
        <div className="text-center bg-indigo-50 border-3 border-slate-900 rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 relative overflow-hidden shadow-inner">
          <div className="absolute top-2 left-2 text-2xl opacity-25">📁</div>
          <div className="absolute bottom-2 right-2 text-2xl opacity-25">🔍</div>
          <Sparkles className="w-8 h-8 text-amber-500 fill-amber-200 animate-pulse stroke-slate-950 stroke-[2.5]" />
          <h2 className="font-extrabold text-xs text-indigo-500 uppercase tracking-widest">{chapterTitle}</h2>
          <h3 className="font-black text-xl text-slate-900 mt-0.5">{caseName}</h3>
          <p className="text-[10px] text-slate-500 font-bold mt-1 bg-white border border-slate-200 py-0.5 px-2 rounded-full shadow-sm">
            {getThemeLabel()}
          </p>
        </div>

        {/* Dramatic Script narrative */}
        <div className="text-slate-800 font-bold text-sm leading-relaxed p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-350 shadow-inner">
          <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1 flex items-center gap-1.5 selection:disabled:">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" /> 嫌情案卷與報警背景：
          </h4>
          <p className="indent-4 text-xs font-medium text-slate-600 block">
            {description}
          </p>
        </div>

        {/* Rewards Section */}
        <div className="flex justify-between items-center bg-amber-50 rounded-2xl p-3 border-2 border-amber-300 shadow">
          <span className="font-black text-xs text-amber-900">破案結案酬金：</span>
          <div className="flex gap-3">
            <span className="flex items-center gap-1.5 bg-white border-2 border-slate-900 py-0.5 px-2.5 rounded-full text-xs font-black shadow-sm">
              💰 <span className="text-slate-800">{rewardGold} 金幣</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white border-2 border-slate-900 py-0.5 px-2.5 rounded-full text-xs font-black shadow-sm">
              🌟 <span className="text-slate-800">+{rewardXp} 經驗值</span>
            </span>
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={onAcceptCase}
          className="w-full bg-emerald-400 hover:bg-emerald-500 border-4 border-slate-950 text-slate-950 font-black text-sm py-3 px-6 rounded-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-[4px_4px_0px_rgba(15,23,42,1)] text-center flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4 fill-slate-950" /> <span>接受此案，展開現場勘查 🕵️‍♂️</span>
        </button>

      </div>
    </div>
  );
};
