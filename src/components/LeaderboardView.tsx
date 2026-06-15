import React, { useState, useEffect } from 'react';
import { dbService, SQLLeaderboardEntry } from '../logic/db';
import { Trophy, Users, CalendarDays, Award, Star, Compass, UserCheck, Flame, Medal, Clock, CheckSquare, Sparkles } from 'lucide-react';

interface LeaderboardViewProps {
  playerClass: string;
  playerName: string;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ playerClass, playerName }) => {
  const [activeTab, setActiveTab] = useState<'school' | 'class' | 'week' | 'month' | 'growth'>('school');
  const [records, setRecords] = useState<SQLLeaderboardEntry[]>([]);

  useEffect(() => {
    // Fetch rankings dynamically
    const data = dbService.getLeaderboard(activeTab, playerClass);
    setRecords(data);
  }, [activeTab, playerClass, playerName]);

  return (
    <div className="bg-[#FFFBF0] border-4 border-slate-900 rounded-[32px] p-6 shadow-[6px_6px_0px_rgba(15,23,42,1)] relative overflow-hidden">
      
      {/* Tape decoration */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 -rotate-1 bg-[#FFF066] border border-dashed border-amber-500 opacity-90 px-8 py-1.5 text-xs text-amber-900 font-bold shadow-sm select-none z-10 font-mono">
        📐 MARUKO'S THINKING SCOREBOARD 📐
      </div>

      {/* Title */}
      <div className="text-center mt-6 mb-7 relative z-10">
        <h3 className="font-extrabold text-2xl text-slate-900 flex items-center justify-center gap-2">
          <Trophy className="w-7 h-7 text-amber-500 fill-amber-300 animate-pulse" />
          <span>思維之光：丸子思考思考榜</span>
        </h3>
        <p className="text-slate-500 font-bold text-xs mt-1 max-w-md mx-auto">
          在這裡，每次挑戰所用的時間、錯誤次數與提示都會計入「總積分」！用更少的手稿和更快的思路登頂吧！
        </p>
      </div>

      {/* Tabs Menu in Notebook Style */}
      <div className="flex flex-wrap gap-2.5 justify-center mb-6">
        {[
          { key: 'school', label: '🏫 全校競速', icon: Compass, bg: 'hover:bg-amber-50' },
          { key: 'class', label: `👥 班級排行 (${playerClass || '未填'})`, icon: Users, bg: 'hover:bg-blue-50' },
          { key: 'week', label: '📆 本週特刊', icon: CalendarDays, bg: 'hover:bg-teal-50' },
          { key: 'month', label: '🏆 本月星章', icon: Star, bg: 'hover:bg-rose-50' },
          { key: 'growth', label: '🌱 精準王 (成長排行)', icon: Award, bg: 'hover:bg-emerald-50' }
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-1.5 py-2.5 px-4 rounded-xl font-bold text-xs border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'bg-slate-900 text-amber-300 border-slate-950 shadow-[3px_3px_0px_rgba(15,23,42,1)] translate-y-[-1px]'
                  : `bg-white text-slate-700 border-slate-200 ${tab.bg}`
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-300' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Ranking List Table */}
      <div className="bg-white border-3 border-slate-900 rounded-2xl overflow-hidden shadow-md">
        
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 bg-[#F1F5F9] border-b-2 border-slate-300 px-4 py-3 text-slate-500 font-black text-xs">
          <div className="col-span-2 text-center">名次</div>
          <div className="col-span-4 pl-2">學員身份</div>
          <div className="col-span-3 text-center">破案大挑戰</div>
          <div className="col-span-3 text-center">
            {activeTab === 'growth' ? '品質數據 (錯/提)' : '思考總分得分'}
          </div>
        </div>

        {/* List Body */}
        {records.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-bold text-xs flex flex-col items-center justify-center gap-2">
            <span>✨ 這裡此時十分安靜... 快去完成挑戰登入名單吧！</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto">
            {records.map((entry, idx) => {
              const isFirst = idx === 0;
              const isSecond = idx === 1;
              const isThird = idx === 2;
              const isPlayer = entry.playerName === playerName && entry.studentClass === playerClass;

              return (
                <div
                  key={entry.id || idx}
                  className={`grid grid-cols-12 gap-2 px-4 py-3 items-center text-xs border-b border-dashed transition-all ${
                    isPlayer 
                      ? 'bg-amber-100/60 font-black' 
                      : idx % 2 === 0 
                      ? 'bg-white' 
                      : 'bg-[#FAFBFD]'
                  }`}
                >
                  
                  {/* Rank medal or number */}
                  <div className="col-span-2 flex justify-center">
                    {isFirst ? (
                      <span className="w-7 h-7 rounded-lg bg-[#FFD93D] border-2 border-slate-900 flex items-center justify-center font-black text-xs text-amber-950 shadow-[1px_1px_0_rgba(15,23,42,1)]" title="冠軍金牌">
                        🥇
                      </span>
                    ) : isSecond ? (
                      <span className="w-7 h-7 rounded-lg bg-[#E2E8F0] border-2 border-slate-900 flex items-center justify-center font-black text-xs text-slate-900 shadow-[1px_1px_0_rgba(15,23,42,1)]" title="亞軍銀牌">
                        🥈
                      </span>
                    ) : isThird ? (
                      <span className="w-7 h-7 rounded-lg bg-[#EBB682] border-2 border-slate-900 flex items-center justify-center font-black text-xs text-amber-950 shadow-[1px_1px_0_rgba(15,23,42,1)]" title="季軍銅牌">
                        🥉
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-[10px] font-extrabold text-slate-500">
                        {idx + 1}
                      </span>
                    )}
                  </div>

                  {/* Student Details */}
                  <div className="col-span-4 flex flex-col pl-2">
                    <span className="font-extrabold text-slate-900 flex items-center gap-1 shrink-0">
                      {entry.playerName}
                      {isPlayer && (
                        <span className="bg-[#6BCB77] text-white font-mono text-[9px] px-1 py-0.5 rounded ml-1 animate-pulse shrink-0">
                          你
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {entry.studentClass} • {entry.studentNo}號
                    </span>
                  </div>

                  {/* Puzzle Title and timing */}
                  <div className="col-span-3 text-center flex flex-col">
                    <span className="font-extrabold text-slate-700 truncate max-w-[130px]" title={entry.puzzleName}>
                      {entry.puzzleName}
                    </span>
                    <span className="text-[10px] text-slate-450 font-bold flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3 text-[#5B8DEF]" />
                      <span>{Math.floor(entry.timeSeconds / 60)}分{(entry.timeSeconds % 60).toString().padStart(2, '0')}秒</span>
                    </span>
                  </div>

                  {/* Score or error rate */}
                  <div className="col-span-3 text-center">
                    {activeTab === 'growth' ? (
                      <div className="flex flex-col items-center">
                        <span className="text-emerald-600 font-black">
                         ❌ {entry.errorsCount} 次 / 💡 {entry.hintsCount} 次
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold">
                          正確排除比: {Math.max(0, 100 - entry.errorsCount * 15)}%
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <span className="font-black text-medium text-slate-900 bg-amber-50 border border-amber-300 rounded-lg px-2 py-0.5 flex items-center gap-0.5">
                          ⚡️ {entry.totalScore}
                        </span>
                        <span className="text-[9px] text-[#5B8DEF] font-bold mt-0.5">
                          {entry.date}
                        </span>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Classroom stats summary sticky note */}
      <div className="mt-6 bg-[#FFFFD0] border-2 border-slate-900 rounded-2xl p-4 shadow-md rotate-[-0.5deg] relative">
        <div className="absolute top-[-10px] left-5 bg-blue-400 w-10 h-4 shadow-sm opacity-80" style={{ transform: 'rotate(-5deg)' }} />
        <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5 mb-1">
          <Sparkles className="w-4 h-4 text-amber-500 fill-amber-300" />
          <span>丸子的數學提示：精準度比速度更有價值！</span>
        </h4>
        <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
          在「精準王 (成長排行)」中，我們會優先排序挑戰中<strong>最少發生錯誤</strong>、<strong>最少求助提示</strong>的優秀思考家！慢一點沒關係，冷靜推演、避免草率點擊，你就是最棒的小名偵探！
        </p>
      </div>

    </div>
  );
};
