import React, { useState } from 'react';
import { Volume2, VolumeX, CheckCircle2, AlertTriangle, Lightbulb, Play, ArrowRight, Stars, Award, Trophy } from 'lucide-react';

interface WalkthroughProps {
  soundEnabled: boolean;
  onSoundToggle: () => void;
  onComplete: (coinsAwarded: number) => void;
}

// Retro playTap pitch
const playTutorialSound = (type: 'tap' | 'error' | 'success' | 'magic', enabled: boolean) => {
  if (!enabled) return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    switch (type) {
      case 'tap': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.exponentialRampToValueAtTime(850, now + 0.1);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start();
        osc.stop(now + 0.1);
        break;
      }
      case 'error': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.setValueAtTime(180, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start();
        osc.stop(now + 0.25);
        break;
      }
      case 'success': {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C major chord arpeggio
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.12, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.25);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.25);
        });
        break;
      }
      case 'magic': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.3);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start();
        osc.stop(now + 0.3);
        break;
      }
    }
  } catch (e) {
    console.error('Audio fail', e);
  }
};

export const Walkthrough: React.FC<WalkthroughProps> = ({ soundEnabled, onSoundToggle, onComplete }) => {
  // Step navigation:
  // 0: Welcome intro
  // 1: Column explanation & assign Beary🐻 to Location #1
  // 2: Color and Tools clue & assign Yellow paint brush to Location #3
  // 3: Exclusions / Conflict warning & assign Rose Pink / Red to Location #1 (Beary's column) and Blue to Location #2
  // 4: Characters position reasoning & assign Bunny🐰 to Location #3 and Kitty🐱 to Location #2
  // 5: Final toy assignment & assign Soccer field to Location #2 and Magnifier to Location #1
  // 6: Case fully solved! Show victory click button
  // 7: Victory celebratory modal
  const [step, setStep] = useState<number>(0);
  
  // Game board states (answers[categoryIndex][slotIndex])
  // cat 0: Character / 小朋友 (0: Beary 🐻, 1: Kitty 🐱, 2: Bunny 🐰)
  // cat 1: Color / 顏色 (0: Red 🔴, 1: Blue 🔵, 2: Yellow 🟡)
  // cat 2: Toy / 玩具 (0: Soccer ⚽, 1: Brush 🎨, 2: Magnifier 🔍)
  const [answers, setAnswers] = useState<number[][]>([
    [-1, -1, -1], // Characters
    [-1, -1, -1], // Colors
    [-1, -1, -1]  // Toys
  ]);

  // Dropdown selector state
  const [selector, setSelector] = useState<{ catIdx: number; slotIdx: number } | null>(null);

  // Active step guide dialog message, targeted feedback, and targets
  const getHelperText = () => {
    switch (step) {
      case 0:
        return '嗨！你好呀！我是大偵探助理汪汪 🐶！歡迎來到神秘的「推理神探院」！在我們出發調查神奇的主線大故事之前，跟著我一起用聰明的腦袋，來解開這個超可愛的 3x3 新手練習題吧！我們會一步一步學會怎麼找出真正的解答喔！';
      case 1:
        return '看！這是我們的【答案偵探簿】。這裡有三個不同的房間位置：也就是位置 #1、位置 #2、位置 #3。\n我們先來看一個線索：\n👉【線索一：小熊 🐻 住在一號房間喔！】\n請點選位置 #1 的「小朋友」格子，然後選擇 小熊 🐻 吧！';
      case 2:
        return '太厲害了啦！第一個關聯成功囉！⭐\n現在看第二個線索：\n👉【線索二：最右邊的三號房間有著黃色 🟡 畫筆 🎨。】\n點選位置 #3 的「代表顏色」格子選擇 黃色 🟡，再點選位置 #3 的「遺失玩具」格子選擇 畫筆 🎨！';
      case 3:
        return '哇！做得非常棒！那現在怎麼推理兔子 🐰 呢？來看看：\n👉【線索三：兔子 🐰 想要住最右邊的三號房間。】\n因為三號房間已經有人住著黃色畫筆了，但那個人就是兔子 🐰 喔！請點選位置 #3 的「小朋友」，選擇 兔子 🐰！最後剩下的一格，點選 位置 #2 的「小朋友」選擇 貓咪 🐱 吧！';
      case 4:
        return '越來越接近真相了！接著看神奇的刪除線推理：\n👉【線索四：貓咪 🐱 說她最不喜歡紅色 🔴 東西了。】\n想一想，黃色 🟡 已經在位置 #3 了，這時候貓咪 🐱 在位置 #2，她不拿紅色 🔴，那她必定戴著 藍色 🔵！剩下的 紅色 🔴 就是一號房間小熊 🐻 的！\n快去把 位置 #2 設成 藍色 🔵，位置 #1 設成 紅色 🔴 吧！';
      case 5:
        return '只差最後兩個玩具格子啦！\n👉【線索五：兔子 🐱 對踢足球 ⚽ 有興趣。】\n因為兔子 🐰 在位置 #3 且不玩足球 ⚽，所以 足球 ⚽ 必定在 位置 #2 的貓咪 🐱 頂部！最後剩下的 放大鏡 🔍 必定就是位置 #1 小熊 🐻 的！\n快去指派 位置 #2 的 足球 ⚽，與 位置 #1 的 放大鏡 🔍 吧！';
      case 6:
        return '天啊！這簡直太不可思議了！所有的推理完全成立，完全沒有矛盾與任何紅色警告！這就是百分之百正確的完美推理！點選下方綠色亮眼的【送交結案】按鈕，宣誓神探的誕生吧！';
      case 7:
        return '萬歲！大成功！你真的是百年難得一見的邏輯小天才！汪汪對你的聰明才智佩服得五體投地！';
      default:
        return '';
    }
  };

  const categories = [
    { name: '小朋友', key: 'people', items: ['小熊 🐻', '貓咪 🐱', '兔子 🐰'], icons: ['🐻', '🐱', '🐰'] },
    { name: '代表顏色', key: 'color', items: ['紅色 🔴', '藍色 🔵', '黃色 🟡'], icons: ['🔴', '🔵', '🟡'] },
    { name: '遺失玩具', key: 'item', items: ['足球 ⚽', '畫筆 🎨', '放大鏡 🔍'], icons: ['⚽', '🎨', '🔍'] }
  ];

  // Helper check whether item is already used elsewhere
  const isItemUsedElsewhere = (catIdx: number, itemIdx: number, currentSlotIdx: number) => {
    return answers[catIdx].some((val, sIdx) => sIdx !== currentSlotIdx && val === itemIdx);
  };

  const handleCellSelectClick = (catIdx: number, slotIdx: number) => {
    if (step === 0 || step >= 6) return;
    
    // Strict guided validation clicks to make sure the kid is clicking the right target!
    if (step === 1) {
      if (!(catIdx === 0 && slotIdx === 0)) {
        playTutorialSound('error', soundEnabled);
        return; // ignore clicks on other cells
      }
    } else if (step === 2) {
      if (!((catIdx === 1 && slotIdx === 2) || (catIdx === 2 && slotIdx === 2))) {
        playTutorialSound('error', soundEnabled);
        return;
      }
    } else if (step === 3) {
      if (!((catIdx === 0 && slotIdx === 2) || (catIdx === 0 && slotIdx === 1))) {
        playTutorialSound('error', soundEnabled);
        return;
      }
    } else if (step === 4) {
      if (!((catIdx === 1 && slotIdx === 1) || (catIdx === 1 && slotIdx === 0))) {
        playTutorialSound('error', soundEnabled);
        return;
      }
    } else if (step === 5) {
      if (!((catIdx === 2 && slotIdx === 1) || (catIdx === 2 && slotIdx === 0))) {
        playTutorialSound('error', soundEnabled);
        return;
      }
    }

    playTutorialSound('tap', soundEnabled);
    setSelector({ catIdx, slotIdx });
  };

  const handleChooseItem = (itemIdx: number) => {
    if (!selector) return;
    const { catIdx, slotIdx } = selector;

    // Is the chose correct for this step's path?
    let correct = false;
    if (step === 1) {
      if (catIdx === 0 && slotIdx === 0 && itemIdx === 0) correct = true; // Beary Bear 🐻
    } else if (step === 2) {
      if (catIdx === 1 && slotIdx === 2 && itemIdx === 2) correct = true; // Yellow 🟡
      if (catIdx === 2 && slotIdx === 2 && itemIdx === 1) correct = true; // Brush 🎨
    } else if (step === 3) {
      if (catIdx === 0 && slotIdx === 2 && itemIdx === 2) correct = true; // Bunny 🐰
      if (catIdx === 0 && slotIdx === 1 && itemIdx === 1) correct = true; // Kitty 🐱
    } else if (step === 4) {
      if (catIdx === 1 && slotIdx === 1 && itemIdx === 1) correct = true; // Blue 🔵
      if (catIdx === 1 && slotIdx === 0 && itemIdx === 0) correct = true; // Red 🔴
    } else if (step === 5) {
      if (catIdx === 2 && slotIdx === 1 && itemIdx === 0) correct = true; // Soccer ⚽
      if (catIdx === 2 && slotIdx === 1 && itemIdx === 2) {
        // user clicked wrong item
      }
      if (catIdx === 2 && slotIdx === 0 && itemIdx === 2) correct = true; // Magnifier 🔍
    }

    if (!correct) {
      playTutorialSound('error', soundEnabled);
      // Give child guidance
      let expectation = '';
      if (step === 1) expectation = '請選擇「小熊 🐻」喔！';
      else if (step === 2) expectation = catIdx === 1 ? '一號房已經有小熊了，這裡是三號房！請選擇顏色「黃色 🟡」喔！' : '請選擇玩具「畫筆 🎨」喔！';
      else if (step === 3) expectation = catIdx === 0 && slotIdx === 2 ? '請選擇「兔子 🐰」喔！' : '三號是兔子、一號是小熊，所以位置 #2 需要點選「貓咪 🐱」喔！';
      else if (step === 4) expectation = slotIdx === 1 ? '請選擇象徵愛乾淨的「藍色 🔵」喔！' : '請選擇經典的「紅色 🔴」一號房喔！';
      else if (step === 5) expectation = slotIdx === 1 ? '請選擇戶外專用的「足球 ⚽」喔！' : '請為小熊選擇「放大鏡 🔍」來查案喔！';

      alert(`💡【汪汪汪！】這個答案和線索不符合喔！${expectation}`);
      return;
    }

    playTutorialSound('magic', soundEnabled);
    setAnswers(prev => {
      const copy = prev.map(row => [...row]);
      copy[catIdx][slotIdx] = itemIdx;
      return copy;
    });
    setSelector(null);

    // Auto progress to next state check
    // Check if the current step criteria are fully resolved to auto-forward
    setTimeout(() => {
      setAnswers(currentAnswers => {
        if (step === 1) {
          if (currentAnswers[0][0] === 0) {
            playTutorialSound('success', soundEnabled);
            setStep(2);
          }
        } else if (step === 2) {
          if (currentAnswers[1][2] === 2 && currentAnswers[2][2] === 1) {
            playTutorialSound('success', soundEnabled);
            setStep(3);
          }
        } else if (step === 3) {
          if (currentAnswers[0][2] === 2 && currentAnswers[0][1] === 1) {
            playTutorialSound('success', soundEnabled);
            setStep(4);
          }
        } else if (step === 4) {
          if (currentAnswers[1][1] === 1 && currentAnswers[1][0] === 0) {
            playTutorialSound('success', soundEnabled);
            setStep(5);
          }
        } else if (step === 5) {
          if (currentAnswers[2][1] === 0 && currentAnswers[2][0] === 2) {
            playTutorialSound('success', soundEnabled);
            setStep(6);
          }
        }
        return currentAnswers;
      });
    }, 150);
  };

  const handleFinishTutorial = () => {
    playTutorialSound('success', soundEnabled);
    onComplete(50); // Give them 50 gold coins
  };

  return (
    <div id="walkthrough-main-overlay" className="min-h-screen bg-[#FFF8E7] flex flex-col items-center justify-start p-4 md:p-8 select-none relative overflow-hidden font-sans">
      
      {/* Floating cartoon stars & cloud aesthetics */}
      <div className="absolute top-8 left-10 text-5xl animate-bounce-slow opacity-20 pointer-events-none">☁️</div>
      <div className="absolute top-24 right-14 text-6xl animate-bounce-slow opacity-15 pointer-events-none" style={{ animationDelay: '1.2s' }}>☁️</div>
      <div className="absolute bottom-16 left-12 text-5xl animate-bounce-slow opacity-20 pointer-events-none" style={{ animationDelay: '0.6s' }}>☁️</div>
      <div className="absolute bottom-32 right-10 text-5xl animate-bounce-slow opacity-15 pointer-events-none" style={{ animationDelay: '1.8s' }}>☁️</div>

      {/* Floating background props */}
      <div className="absolute top-4 border-slate-900 border-4 rounded-3xl bg-white px-4 py-2 flex items-center gap-2 shadow-[4px_4px_0_rgba(15,23,42,1)] z-10 w-[95%] max-w-4xl justify-between">
        <h2 className="font-extrabold text-[#5B8DEF] flex items-center gap-1.5 text-sm sm:text-base">
          <span>✨</span>
          <span>丸子老師的數學思考實驗室：幼苗推理引導 💡</span>
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={onSoundToggle}
            className="text-slate-900 hover:text-[#5B8DEF] flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-amber-500" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
            <span className="hidden sm:inline">{soundEnabled ? '音效開啟' : '音效關閉'}</span>
          </button>
          <span className="bg-[#FFD93D] border-2 border-slate-900 rounded-full px-3 py-0.5 text-xs font-black shadow-[2px_2px_0_rgba(15,23,42,1)]">
            新手專屬獎勵：💰 +50 金幣
          </span>
        </div>
      </div>

      <div className="m-auto w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 pt-16 items-start">
        
        {/* Left Column: Dialogue assistant box & clues board */}
        <div className="lg:col-span-5 flex flex-col gap-6 w-full">
          
          {/* Watson puppy companion comic box */}
          <div className="bg-white border-4 border-slate-900 rounded-[32px] p-4 shadow-[6px_6px_0px_rgba(15,23,42,1)] relative">
            {/* Speech bubble tail */}
            <div className="hidden lg:block absolute right-[-14px] top-10 w-0 h-0 border-y-[12px] border-y-transparent border-l-[14px] border-l-slate-900"></div>
            <div className="hidden lg:block absolute right-[-8px] top-[41px] w-0 h-0 border-y-[10px] border-y-transparent border-l-[12px] border-l-white"></div>

            <div className="flex items-center gap-3 border-b-2 border-slate-200 pb-3 mb-3">
              <div className="text-4xl animate-bounce shrink-0">🐶</div>
              <div>
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-1">
                  <span>助理王牌汪汪</span>
                  <span className="bg-[#6BCB77] text-white text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase">助手</span>
                </h3>
                <p className="text-[10px] text-slate-400 font-extrabold leading-none mt-1">「汪！跟著我的腳步就對囉！」</p>
              </div>
            </div>

            {/* Localized text narrative */}
            <div className="text-slate-800 font-bold text-xs sm:text-sm leading-relaxed whitespace-pre-line text-left bg-[#FFF8E7] rounded-2xl p-3 border-2 border-[#FFD93D] min-h-[110px] flex items-center justify-start">
              {getHelperText()}
            </div>

            {/* Manual next button for step 0 */}
            {step === 0 && (
              <button
                onClick={() => { playTutorialSound('success', soundEnabled); setStep(1); }}
                className="mt-3 w-full bg-[#6BCB77] hover:bg-emerald-500 text-white border-3 border-slate-950 font-black text-xs py-2 px-4 rounded-xl cursor-pointer hover:scale-105 active:scale-95 transition-all text-center flex items-center justify-center gap-1 shadow-[2px_2px_0_rgba(15,23,42,1)]"
              >
                <span>我想開啟推理學習！</span>
                <Play className="w-3.5 h-3.5 fill-white py-0.5" />
              </button>
            )}
          </div>

          {/* Current clues board */}
          {step > 0 && (
            <div className="bg-white border-4 border-slate-900 rounded-[32px] p-4 shadow-[6px_6px_0px_rgba(15,23,42,1)] flex flex-col gap-3">
              <h3 className="font-black text-slate-900 text-xs sm:text-sm flex items-center gap-1 border-b-2 border-slate-200 pb-2">
                <span>便條紙：偵得線索備忘錄</span>
              </h3>
              
              <div className="flex flex-col gap-2">
                {[
                  { id: 1, text: '線索一：小熊 🐻 住在一號房間位置喔！', val: step > 1 },
                  { id: 2, text: '線索二：最右邊的三號房間有著黃色 🟡 畫筆 🎨。', val: step > 2 },
                  { id: 3, text: '線索三：兔子 🐰 想要住最右邊的三號房間。', val: step > 3 },
                  { id: 4, text: '線索四：貓咪 🐱 說她最不喜歡紅色 🔴 東西了。', val: step > 4 },
                  { id: 5, text: '線索五：貓咪 🐱 對踢足球 ⚽ 有興趣。', val: step > 5 }
                ].map(item => (
                  <div
                    key={item.id}
                    className={`p-2 rounded-xl border-2 font-extrabold text-[11px] sm:text-xs transition-all flex items-center gap-2 ${
                      item.val
                        ? 'bg-slate-100 border-slate-300 text-slate-400 line-through'
                        : step === item.id
                        ? 'bg-amber-100/60 border-[#FFEDD5] text-amber-900 animate-pulse'
                        : 'bg-slate-50 border-slate-150 text-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center text-[8px] font-black shrink-0 ${
                      item.val ? 'bg-[#6BCB77] border-[#6BCB77] text-white' : 'border-slate-300 text-transparent bg-white'
                    }`}>
                      ✔
                    </div>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: 3x3 active logic grid board rendering */}
        <div className="lg:col-span-7 flex flex-col gap-6 w-full">
          <div className="bg-white border-4 border-slate-900 rounded-[40px] p-5 shadow-[8px_8px_0px_rgba(15,23,42,1)] relative">
            
            {/* Decorative magnifier stamp */}
            <div className="absolute top-4 right-6 text-2xl opacity-20 pointer-events-none">🔍</div>
            <div className="absolute top-12 right-20 text-xs text-slate-300 font-mono pointer-events-none">TEST_STUDIO</div>

            {/* Answer Notebook board title */}
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 border-b-2 border-slate-150 pb-2 mb-4">
              <span>🔍 模擬解答紙板 (3x3 Notebook)</span>
            </h3>

            {/* Conflict alarm sensor preview */}
            {step === 3 && (
              <div className="mb-4 bg-rose-50 border-3 border-[#FF6B6B] text-[#FF6B6B] p-2.5 rounded-2xl flex items-center gap-1.5 font-bold text-xs shadow-sm animate-pulse">
                <AlertTriangle className="w-4 h-4" />
                <span>這個答案和線索不符合喔！別擔心，汪汪陪你更正！</span>
              </div>
            )}

            {/* The columns of 位置 #1, 位置 #2, 位置 #3 */}
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((slotIdx) => {
                return (
                  <div
                    key={slotIdx}
                    className={`border-4 rounded-[28px] p-2.5 flex flex-col gap-3 transition-transform shadow-[4px_4px_0_rgba(15,23,42,1)] ${
                      slotIdx % 2 === 0 ? 'bg-[#FFF8E7]/40' : 'bg-[#FFF8E7]/10'
                    } border-slate-900 hover:scale-[1.01]`}
                  >
                    
                    {/* Header position label */}
                    <div className="text-center">
                      <span className="bg-slate-950 text-white px-2.5 py-0.5 rounded-full text-[10px] font-black inline-block">
                        位置 #{slotIdx + 1}
                      </span>
                    </div>

                    {/* Array of categories to select (Characters, Colors, Items) */}
                    <div className="flex flex-col gap-2">
                      {categories.map((cat, catIdx) => {
                        const cellVal = answers[catIdx][slotIdx];
                        const displayLabel = cellVal !== -1 ? cat.items[cellVal] : '❓';
                        const isAssigned = cellVal !== -1;

                        // Should we pulse-highlight this cellar button as the active click hint?
                        let isHighlighted = false;
                        if (step === 1 && catIdx === 0 && slotIdx === 0) isHighlighted = true;
                        if (step === 2 && catIdx === 1 && slotIdx === 2 && cellVal === -1) isHighlighted = true;
                        if (step === 2 && catIdx === 2 && slotIdx === 2 && cellVal === -1) isHighlighted = true;
                        if (step === 3 && catIdx === 0 && slotIdx === 2 && cellVal === -1) isHighlighted = true;
                        if (step === 3 && catIdx === 0 && slotIdx === 1 && cellVal === -1) isHighlighted = true;
                        if (step === 4 && catIdx === 1 && slotIdx === 1 && cellVal === -1) isHighlighted = true;
                        if (step === 4 && catIdx === 1 && slotIdx === 0 && cellVal === -1) isHighlighted = true;
                        if (step === 5 && catIdx === 2 && slotIdx === 1 && cellVal === -1) isHighlighted = true;
                        if (step === 5 && catIdx === 2 && slotIdx === 0 && cellVal === -1) isHighlighted = true;

                        return (
                          <div key={catIdx} className="relative">
                            <span className="text-[9px] text-slate-400 font-black block text-left ml-1 mb-0.5">
                              {cat.name}
                            </span>

                            {/* Active interactive card */}
                            <button
                              disabled={step === 0}
                              onClick={() => handleCellSelectClick(catIdx, slotIdx)}
                              className={`w-full py-2.5 px-1 rounded-xl border-2 text-[11px] font-black cursor-pointer transition-all min-h-[58px] flex flex-col items-center justify-center ${
                                isAssigned 
                                  ? 'bg-white border-slate-900 text-slate-800 shadow-[1px_1px_0_rgba(15,23,42,1)]'
                                  : isHighlighted 
                                  ? 'bg-amber-100 border-[#FF6B6B] border-dashed border-3 animate-pulse text-amber-800 font-extrabold'
                                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100 hover:border-slate-300'
                              }`}
                            >
                              <span className="text-xl mb-0.5">{isAssigned ? cat.icons[cellVal] : '❓'}</span>
                              <span className="truncate max-w-full leading-tight select-none">
                                {isAssigned ? cat.items[cellVal] : '點選指派'}
                              </span>
                            </button>

                            {/* Glowing helper pointer */}
                            {isHighlighted && (
                              <div className="absolute top-[-6px] right-[-6px] bg-[#FF6B6B] w-2.5 h-2.5 rounded-full animate-ping z-20"></div>
                            )}

                          </div>
                        );
                      })}
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Render Select Dropdown Panel inside overlay */}
            {selector && (
              <div className="absolute inset-x-0 bottom-0 top-0 bg-slate-900/40 rounded-[38px] flex items-center justify-center p-4 z-30 animate-fade-in">
                <div className="bg-white border-4 border-slate-950 rounded-2xl p-4 w-full max-w-xs shadow-[6px_6px_0px_rgba(15,23,42,1)] animate-scale-up">
                  <h4 className="font-black text-xs text-slate-400 border-b border-slate-200 pb-1.5 mb-2.5 text-center">
                    請選取填入位置 #{selector.slotIdx + 1} 的「{categories[selector.catIdx].name}」
                  </h4>
                  
                  <div className="flex flex-col gap-1.5">
                    {categories[selector.catIdx].items.map((label, itemIdx) => {
                      const isUsed = isItemUsedElsewhere(selector.catIdx, itemIdx, selector.slotIdx);
                      return (
                        <button
                          key={itemIdx}
                          disabled={isUsed}
                          onClick={() => handleChooseItem(itemIdx)}
                          className={`w-full py-2 px-3 rounded-xl text-xs font-bold border-2 cursor-pointer transition-all text-left flex items-center justify-between ${
                            isUsed 
                              ? 'bg-slate-150 border-transparent text-slate-300 cursor-not-allowed line-through'
                              : 'bg-slate-50 border-slate-350 hover:bg-amber-100 hover:border-[#FFD93D]'
                          }`}
                        >
                          <span>{label}</span>
                          {isUsed && <span className="text-[8px] bg-slate-200 text-slate-400 px-1 rounded">已被他人使用</span>}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setSelector(null)}
                    className="mt-3 w-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-[10px] py-1.5 rounded-xl cursor-pointer text-center"
                  >
                    取消選擇
                  </button>
                </div>
              </div>
            )}

            {/* Victory Submit Active Button */}
            {step === 6 && (
              <div className="mt-6 border-t-2 border-slate-150 pt-4 flex justify-center">
                <button
                  onClick={() => setStep(7)}
                  className="bg-[#6BCB77] hover:bg-emerald-500 text-slate-950 border-4 border-slate-950 font-black text-sm py-3 px-8 rounded-2xl cursor-pointer shadow-[3px_3px_0_rgba(0,0,0,1)] hover:scale-105 active:scale-95 transition-all animate-bounce"
                >
                  🚀 送交結案 (Submit Proposal)
                </button>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* STEP 7: Victory celebratory modal */}
      {step === 7 && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border-4 border-slate-900 rounded-[40px] p-6 max-w-md w-full shadow-[8px_8px_0px_rgba(15,23,42,1)] text-center relative flex flex-col items-center gap-4 animate-scale-up">
            
            {/* Happy celebration stars */}
            <Stars className="w-16 h-16 text-[#FFD93D] fill-[#FFD93D] stroke-slate-950 stroke-[2] animate-bounce" />
            <div className="absolute top-2 left-6 text-3xl animate-pulse">🌟</div>
            <div className="absolute top-12 right-8 text-2xl animate-pulse" style={{ animationDelay: '0.4s' }}>🌟</div>
            <div className="absolute bottom-16 left-10 text-3xl animate-pulse" style={{ animationDelay: '0.8s' }}>✨</div>

            <h2 className="font-extrabold text-[#5B8DEF] text-xs uppercase tracking-widest leading-none">結案評定：神級推理！</h2>
            <h3 className="font-black text-2xl text-slate-900 leading-tight">🎉 恭喜通過新生神探培訓！</h3>
            
            <p className="text-slate-600 font-bold text-xs sm:text-sm leading-relaxed max-w-xs">
              【小助理汪汪🐶】高興極了！你已經完全學會了**找線索、找屬性、排除矛盾項、配對表格**這三大偵探絕活！這意味著，你可以大展拳腳出發啦！
            </p>

            {/* Reward badges summary */}
            <div className="bg-[#FFF8E7] rounded-3xl p-3 border-2 border-[#FFD93D] w-full flex items-center justify-around gap-2 shadow-inner">
              <div className="flex flex-col items-center gap-1">
                <Trophy className="w-6 h-6 text-[#FFD93D] fill-[#FFD93D]/30 shrink-0" />
                <span className="text-[10px] text-slate-400 font-extrabold">稱號獲得</span>
                <span className="text-[11px] font-black text-[#5B8DEF]">邏輯名偵探</span>
              </div>
              <div className="h-10 w-[2px] bg-[#FFD93D]" />
              <div className="flex flex-col items-center gap-1">
                <Award className="w-6 h-6 text-[#6BCB77] shrink-0" />
                <span className="text-[10px] text-slate-400 font-extrabold">金幣獎勵</span>
                <span className="text-[11px] font-black text-emerald-600">💰 +50 金幣</span>
              </div>
              <div className="h-10 w-[2px] bg-[#FFD93D]" />
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl select-none">🎨</span>
                <span className="text-[10px] text-slate-400 font-extrabold">首發主題</span>
                <span className="text-[11px] font-black text-slate-700">校園大冒險</span>
              </div>
            </div>

            {/* Continue to main story button */}
            <button
              onClick={handleFinishTutorial}
              className="mt-2 w-full bg-[#6BCB77] hover:bg-emerald-500 text-slate-950 border-4 border-slate-950 font-black text-sm py-3.5 rounded-2xl cursor-pointer hover:scale-105 active:scale-95 transition-all text-center flex items-center justify-center gap-1.5 shadow-[3px_3px_0_rgba(15,23,42,1)]"
            >
              <span>開啟我的神探大冒險！</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
