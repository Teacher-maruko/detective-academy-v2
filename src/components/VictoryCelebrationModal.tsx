import React, { useState, useEffect } from 'react';
import { Stars, Award, Trophy, Timer, ChevronRight, Check, User, ThumbsUp, Sparkles, Medal } from 'lucide-react';

interface LeaderboardEntry {
  playerName: string;
  time: number; // in seconds
  rankTitle: string;
  date: string;
  isPlayer?: boolean;
}

interface VictoryCelebrationModalProps {
  isOpen: boolean;
  elapsedTime: number; // seconds taken
  difficulty: number; // level 1-8
  difficultyName: string; // e.g. "基礎 [Lv1]"
  earnedCoins: number;
  earnedXp: number;
  playerRank: string;
  onClaimRewards: () => void;
  soundEnabled: boolean;
}

// Play celebrate notes sound pitch helper
const playVictoryModalSound = (type: 'applause' | 'rank' | 'badge', enabled: boolean) => {
  if (!enabled) return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    if (type === 'applause') {
      // Arpeggio chord of celebration
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C major notes
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0.12, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.3);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.3);
      });
    } else if (type === 'rank') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start();
      osc.stop(now + 0.3);
    }
  } catch (e) {
    console.warn(e);
  }
};

// Preset baseline legendary records for 8 difficulties (realistic and beatable with strategy)
const PRESET_LEADERBOARDS: Record<number, LeaderboardEntry[]> = {
  1: [
    { playerName: '神探福爾摩斯 🕵️‍♂️', time: 18, rankTitle: '傳奇偵探', date: '2026-06-01' },
    { playerName: '怪盜K 🎩', time: 28, rankTitle: '精英客卿', date: '2026-06-05' },
    { playerName: '發明家小奇 🎨', time: 42, rankTitle: '機甲神探', date: '2026-06-10' },
    { playerName: '助理小布 🐻', time: 58, rankTitle: '學院助手', date: '2026-06-12' },
    { playerName: '大偵探汪汪 🐶', time: 80, rankTitle: '學院助手', date: '2026-06-13' },
  ],
  2: [
    { playerName: '神探福爾摩斯 🕵️‍♂️', time: 35, rankTitle: '傳奇偵探', date: '2026-06-01' },
    { playerName: '怪盜K 🎩', time: 55, rankTitle: '精英客卿', date: '2026-06-05' },
    { playerName: '發明家小奇 🎨', time: 75, rankTitle: '機甲神探', date: '2026-06-10' },
    { playerName: '助理小布 🐻', time: 100, rankTitle: '學院助手', date: '2026-06-12' },
    { playerName: '大偵探汪汪 🐶', time: 135, rankTitle: '學院助手', date: '2026-06-13' },
  ],
  3: [
    { playerName: '神探福爾摩斯 🕵️‍♂️', time: 60, rankTitle: '傳奇偵探', date: '2026-06-01' },
    { playerName: '怪盜K 🎩', time: 85, rankTitle: '精英客卿', date: '2026-06-05' },
    { playerName: '發明家小奇 🎨', time: 120, rankTitle: '機甲神探', date: '2026-06-10' },
    { playerName: '助理小布 🐻', time: 165, rankTitle: '學院助手', date: '2026-06-12' },
    { playerName: '大偵探汪汪 🐶', time: 215, rankTitle: '學院助手', date: '2026-06-13' },
  ],
  4: [
    { playerName: '神探福爾摩斯 🕵️‍♂️', time: 90, rankTitle: '傳奇偵探', date: '2026-06-01' },
    { playerName: '怪盜K 🎩', time: 130, rankTitle: '精英客卿', date: '2026-06-05' },
    { playerName: '發明家小奇 🎨', time: 180, rankTitle: '機甲神探', date: '2026-06-10' },
    { playerName: '助理小布 🐻', time: 240, rankTitle: '學院助手', date: '2026-06-12' },
    { playerName: '大偵探汪汪 🐶', time: 310, rankTitle: '學院助手', date: '2026-06-13' },
  ],
  5: [
    { playerName: '神探福爾摩斯 🕵️‍♂️', time: 130, rankTitle: '傳奇偵探', date: '2026-06-01' },
    { playerName: '怪盜K 🎩', time: 190, rankTitle: '精英客卿', date: '2026-06-05' },
    { playerName: '發明家小奇 🎨', time: 260, rankTitle: '機甲神探', date: '2026-06-10' },
    { playerName: '助理小布 🐻', time: 350, rankTitle: '學院助手', date: '2026-06-12' },
    { playerName: '大偵探汪汪 🐶', time: 450, rankTitle: '學院助手', date: '2026-06-13' },
  ],
  6: [
    { playerName: '神探福爾摩斯 🕵️‍♂️', time: 180, rankTitle: '傳奇偵探', date: '2026-06-01' },
    { playerName: '怪盜K 🎩', time: 260, rankTitle: '精英客卿', date: '2026-06-05' },
    { playerName: '發明家小奇 🎨', time: 350, rankTitle: '機甲神探', date: '2026-06-10' },
    { playerName: '助理小布 🐻', time: 480, rankTitle: '學院助手', date: '2026-06-12' },
    { playerName: '大偵探汪汪 🐶', time: 610, rankTitle: '學院助手', date: '2026-06-13' },
  ],
  7: [
    { playerName: '神探福爾摩斯 🕵️‍♂️', time: 240, rankTitle: '傳奇偵探', date: '2026-06-01' },
    { playerName: '怪盜K 🎩', time: 340, rankTitle: '精英客卿', date: '2026-06-05' },
    { playerName: '發明家小奇 🎨', time: 460, rankTitle: '機甲神探', date: '2026-06-10' },
    { playerName: '助理小布 🐻', time: 600, rankTitle: '學院助手', date: '2026-06-12' },
    { playerName: '大偵探汪汪 🐶', time: 760, rankTitle: '學院助手', date: '2026-06-13' },
  ],
  8: [
    { playerName: '神探福爾摩斯 🕵️‍♂️', time: 320, rankTitle: '傳奇偵探', date: '2026-06-01' },
    { playerName: '怪盜K 🎩', time: 440, rankTitle: '精英客卿', date: '2026-06-05' },
    { playerName: '發明家小奇 🎨', time: 580, rankTitle: '機甲神探', date: '2026-06-10' },
    { playerName: '助理小布 🐻', time: 760, rankTitle: '學院助手', date: '2026-06-12' },
    { playerName: '大偵探汪汪 🐶', time: 990, rankTitle: '學院助手', date: '2026-06-13' },
  ]
};

export const VictoryCelebrationModal: React.FC<VictoryCelebrationModalProps> = ({
  isOpen,
  elapsedTime,
  difficulty,
  difficultyName,
  earnedCoins,
  earnedXp,
  playerRank,
  onClaimRewards,
  soundEnabled
}) => {
  const [nickname, setNickname] = useState<string>('小偵探');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [savedName, setSavedName] = useState<boolean>(false);
  
  // Animation metrics
  const [scorePercentile, setScorePercentile] = useState<number>(10);
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);
  const [solvedRank, setSolvedRank] = useState<number>(5);

  useEffect(() => {
    if (!isOpen) return;

    // Load custom names if registered by player
    const storedName = localStorage.getItem('detective_nickname');
    if (storedName) {
      setNickname(storedName);
    }

    // 1. Fetch current local leaderboard for this difficulty
    const savedLeaderboardStr = localStorage.getItem(`detective_leaderboard_diff_${difficulty}`);
    let list: LeaderboardEntry[] = [];
    if (savedLeaderboardStr) {
      try {
        list = JSON.parse(savedLeaderboardStr);
      } catch (err) {
        list = [...(PRESET_LEADERBOARDS[difficulty] || PRESET_LEADERBOARDS[1])];
      }
    } else {
      list = [...(PRESET_LEADERBOARDS[difficulty] || PRESET_LEADERBOARDS[1])];
    }

    // Sort to be super safe
    list.sort((a, b) => a.time - b.time);

    // 2. See if the player beats their own best time!
    const playerBestTimeStr = localStorage.getItem(`detective_best_time_diff_${difficulty}`);
    let isPersonalBest = false;
    if (playerBestTimeStr) {
      const prevBest = parseInt(playerBestTimeStr, 10);
      if (elapsedTime < prevBest) {
        isPersonalBest = true;
        localStorage.setItem(`detective_best_time_diff_${difficulty}`, String(elapsedTime));
      }
    } else {
      isPersonalBest = true;
      localStorage.setItem(`detective_best_time_diff_${difficulty}`, String(elapsedTime));
    }
    setIsNewRecord(isPersonalBest);

    // 3. Compute dynamic percentile rating compared to benchmarks
    // If elapsedTime is small, percentile rises near 99%
    const benchmarkTime = list[2]?.time || 120; // Inventor time is 3rd
    let calculatedPercentile = 50;
    if (elapsedTime <= list[0].time) {
      calculatedPercentile = 99;
    } else {
      const scale = benchmarkTime / elapsedTime;
      calculatedPercentile = Math.max(10, Math.min(98, Math.round(90 * scale)));
    }

    // 4. Find where player places on the local leaderboard
    let placement = list.length + 1;
    for (let i = 0; i < list.length; i++) {
      if (elapsedTime < list[i].time) {
        placement = i + 1;
        break;
      }
    }
    if (placement > list.length + 1) {
      placement = list.length + 1;
    }
    setSolvedRank(placement);

    // Trigger sweet sound
    playVictoryModalSound('applause', soundEnabled);

    // Animate the speedometer / percentile stats
    let currentPercent = 0;
    const interval = setInterval(() => {
      currentPercent += 3;
      if (currentPercent >= calculatedPercentile) {
        setScorePercentile(calculatedPercentile);
        clearInterval(interval);
      } else {
        setScorePercentile(currentPercent);
      }
    }, 25);

    setLeaderboard(list);

    return () => clearInterval(interval);
  }, [isOpen, elapsedTime, difficulty]);

  if (!isOpen) return null;

  const handleSubmitScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;

    // Save custom preferred nickname
    localStorage.setItem('detective_nickname', nickname.trim());

    // Insert player into local leaderboard state
    const newEntry: LeaderboardEntry = {
      playerName: `🌟 ${nickname.trim()} (您)`,
      time: elapsedTime,
      rankTitle: playerRank || '見習小偵探',
      date: new Date().toISOString().split('T')[0],
      isPlayer: true
    };

    const updated = [...leaderboard, newEntry];
    updated.sort((a, b) => a.time - b.time);
    const topOnly = updated.slice(0, 6); // Keep top 6 fastest records!

    setLeaderboard(topOnly);
    setSavedName(true);

    // Recalculate rank placement inside the top Only list
    const finalPlacement = topOnly.findIndex(entry => entry.isPlayer && entry.time === elapsedTime) + 1;
    if (finalPlacement > 0) {
      setSolvedRank(finalPlacement);
    }

    // Save back to local storage
    localStorage.setItem(`detective_leaderboard_diff_${difficulty}`, JSON.stringify(topOnly));
    playVictoryModalSound('rank', soundEnabled);
  };

  return (
    <div id="victory-modal-overlay" className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in font-sans select-none">
      
      {/* Absolute floating graphics background */}
      <div className="absolute top-12 left-12 text-6xl animate-pulse pointer-events-none opacity-20">🌟</div>
      <div className="absolute top-36 right-16 text-5xl animate-bounce-slow pointer-events-none opacity-25" style={{ animationDelay: '0.8s' }}>⭐️</div>
      <div className="absolute bottom-24 left-20 text-5xl animate-bounce-slow pointer-events-none opacity-25" style={{ animationDelay: '1.4s' }}>✨</div>

      <div className="bg-[#FFF8E7] border-4 border-slate-950 rounded-[44px] p-5 sm:p-7 max-w-2xl w-full shadow-[10px_10px_0px_rgba(15,23,42,1)] relative flex flex-col gap-5 my-8 sm:my-auto animate-scale-up border-b-[12px]">
        
        {/* Colorful topper accent decoration */}
        <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 bg-[#FFD93D] border-4 border-slate-950 text-slate-950 font-black px-8 py-2.5 rounded-full text-base sm:text-lg animate-bounce shadow-[3px_3px_0_rgba(15,23,42,1)] tracking-widest uppercase">
          🎉 結案推演成功！ 🎉
        </div>

        {/* Top summary section */}
        <div className="text-center mt-4">
          <p className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wide">
            難度等級：{difficultyName} • 主線故事推理
          </p>
          <h2 className="font-extrabold text-3xl text-slate-950 mt-1 flex items-center justify-center gap-1.5">
            <span>真相大白，順利結案！</span>
            <span className="animate-spin text-amber-500">✨</span>
          </h2>
          <p className="text-slate-600 font-bold text-xs max-w-md mx-auto mt-1">
            小助理小布🐶 在一旁跳起了快樂的偵探舞！在你的縝密思維下，雜亂無章的矛盾證言，在頃刻間得到了最完美合理的妥協排除！
          </p>
        </div>

        {/* Dynamic speedometer / progress analytics cards */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
          
          {/* Left panel: Your Speed results */}
          <div className="md:col-span-5 bg-white border-3 border-slate-950 rounded-[32px] p-4 flex flex-col items-center justify-center relative shadow-[4px_4px_0_rgba(15,23,42,1)] min-h-[170px]">
            
            {/* Speedometer circle badge */}
            <div className="relative w-24 h-24 mb-2 flex items-center justify-center">
              <span className="absolute text-3xl animate-pulse">⏰</span>
              {/* Radial spinner ring layout */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="38"
                  stroke="#E2E8F0"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="38"
                  stroke="#5B8DEF"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="238"
                  strokeDashoffset={238 - (238 * scorePercentile) / 100}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="font-black text-xs text-slate-400 uppercase tracking-tighter">比速度</span>
                <span className="font-black text-xl text-[#5B8DEF]">{Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}</span>
              </div>
            </div>

            {/* Percentile Rank Label */}
            <div className="text-center">
              <span className="bg-[#6BCB77]/10 text-emerald-700 border border-emerald-300 font-bold px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs">
                ⚡ 領先全球 {scorePercentile}% 的探員速度！
              </span>
              
              {isNewRecord && (
                <div className="mt-1 flex items-center justify-center gap-1">
                  <span className="bg-[#FFD93D] border border-slate-900 text-[9px] font-black px-1.5 rounded uppercase animate-bounce">
                    🌟 創下歷史個人新紀錄
                  </span>
                </div>
              )}
            </div>

          </div>

          {/* Right panel: Single-player Best completion time leaderboard list */}
          <div className="md:col-span-7 bg-white border-3 border-slate-950 rounded-[32px] p-4 flex flex-col shadow-[4px_4px_0_rgba(15,23,42,1)]">
            <h3 className="font-black text-slate-950 text-xs flex items-center justify-between border-b border-slate-150 pb-2 mb-2">
              <span className="flex items-center gap-1 text-[#5B8DEF]">
                <Trophy className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                <span>一決雌雄！最佳神速排行榜</span>
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full">
                難度 Lv.{difficulty}
              </span>
            </h3>

            {/* Ranking listings */}
            <div className="flex flex-col gap-1.5">
              {leaderboard.map((entry, idx) => {
                const isThisRun = entry.isPlayer && entry.time === elapsedTime;
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-1.5 rounded-xl border text-xs transition-all ${
                      isThisRun
                        ? 'bg-amber-100/60 border-amber-400 font-black scale-[1.01]'
                        : entry.isPlayer
                        ? 'bg-[#FFF8E7] border-[#FFD93D] font-bold'
                        : 'bg-slate-50 border-slate-150 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {/* Rank Medal index design */}
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] ${
                        idx === 0 ? 'bg-[#FFD93D] text-amber-950' :
                        idx === 1 ? 'bg-slate-300 text-slate-900' :
                        idx === 2 ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="truncate max-w-[130px] sm:max-w-[170px] font-black text-[11px] sm:text-xs">
                        {entry.playerName}
                      </span>
                      <span className="hidden sm:inline-block text-[9px] font-bold text-slate-400 capitalize bg-slate-100 px-1 py-0.5 rounded">
                        {entry.rankTitle}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] sm:text-xs font-black text-slate-800">
                        ⏱️ {Math.floor(entry.time / 60)}分{(entry.time % 60).toString().padStart(2, '0')}秒
                      </span>
                      {entry.isPlayer && <span className="text-[10px] text-emerald-600 font-extrabold">🏆</span>}
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Prompt form for custom score registration */}
            {!savedName && solvedRank <= 6 && (
              <form onSubmit={handleSubmitScore} className="mt-3 bg-[#FFF8E7]/50 border-2 border-[#FFD93D] border-dashed rounded-2xl p-2 flex items-center gap-2 animate-pulse">
                <input
                  type="text"
                  maxLength={10}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="輸入你的大偵探暱稱..."
                  className="bg-white border-2 border-slate-900 rounded-lg py-1 px-2.5 text-xs font-black text-slate-850 flex-1 focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-[#5B8DEF] hover:bg-blue-600 border-2 border-slate-900 text-white font-black text-[11px] py-1 px-3 rounded-lg cursor-pointer flex items-center gap-1 shrink-0 shadow-[1px_1px_0_rgba(15,23,42,1)]"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>登錄排行榜</span>
                </button>
              </form>
            )}

          </div>

        </div>

        {/* Case story evaluation cards / rewards */}
        <div className="bg-white border-3 border-slate-950 rounded-[32px] p-4 flex flex-col sm:flex-row items-center justify-around gap-4 shadow-[4px_4px_0_rgba(15,23,42,1)]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#FFD93D] border-3 border-slate-950 rounded-2xl flex items-center justify-center shadow-[2px_2px_0_rgba(15,23,42,1)]">
              <span className="text-2xl animate-spin" style={{ animationDuration: '3s' }}>🪙</span>
            </div>
            <div className="text-left">
              <span className="text-[10px] text-slate-400 font-black block leading-none">獲得金幣酬金</span>
              <span className="text-base font-black text-emerald-600">💰 +{earnedCoins} 金幣</span>
            </div>
          </div>

          <div className="h-[2px] w-full sm:h-10 sm:w-[2px] bg-slate-200" />

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#5B8DEF] border-3 border-slate-950 rounded-2xl flex items-center justify-center shadow-[2px_2px_0_rgba(15,23,42,1)]">
              <span className="text-2xl animate-bounce">⚡️</span>
            </div>
            <div className="text-left">
              <span className="text-[10px] text-slate-400 font-black block leading-none">獲得偵查經驗</span>
              <span className="text-base font-black text-indigo-650">🏆 +{earnedXp} 經驗值</span>
            </div>
          </div>

          <div className="h-[2px] w-full sm:h-10 sm:w-[2px] bg-slate-200" />

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#6BCB77] border-3 border-slate-950 rounded-2xl flex items-center justify-center shadow-[2px_2px_0_rgba(15,23,42,1)]">
              <span className="text-2xl">🌱</span>
            </div>
            <div className="text-left">
              <span className="text-[10px] text-slate-400 font-black block leading-none">體力補給回饋</span>
              <span className="text-sm font-black text-[#6BCB77]">🔋 補給 +1 點 stamina</span>
            </div>
          </div>
        </div>

        {/* Claim button */}
        <div className="text-center mt-2">
          <button
            onClick={onClaimRewards}
            className="w-full sm:w-auto bg-[#6BCB77] hover:bg-emerald-500 text-slate-950 border-4 border-slate-950 font-black text-sm py-4 px-12 rounded-[24px] cursor-pointer shadow-[4px_4px_0_rgba(15,23,42,1)] hover:scale-105 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 mx-auto"
          >
            <span>太棒了！領取報酬並載入下一案 🚀</span>
            <ChevronRight className="w-4 h-4 stroke-[3.5]" />
          </button>
        </div>

      </div>
    </div>
  );
};
