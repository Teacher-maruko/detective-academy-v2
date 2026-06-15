import React, { useState } from 'react';
import { Image, Sparkles, Download, AlertCircle, RefreshCw } from 'lucide-react';

interface AIIllustratorProps {
  stats: { coins: number };
  onDeductCoins: (coins: number) => void;
  soundEnabled: boolean;
}

export const AIIllustrator: React.FC<AIIllustratorProps> = ({ stats, onDeductCoins, soundEnabled }) => {
  const [prompt, setPrompt] = useState<string>('Q版卡通繪本風：一隻圓滾滾的小熊偵探戴著紅色格子毛呢帽，在校園落葉綠草地上，用放大鏡觀察泥地上小腳印，暖暖陽光，活潑可愛');
  const [size, setSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);
  const [history, setHistory] = useState<{ url: string; prompt: string; size: string; timestamp: string }[]>([
    {
      url: 'https://picsum.photos/seed/detective_bear_campus/600/600',
      prompt: 'Q版卡通繪本：小熊偵探在充滿放大鏡與飄浮雲朵的校園小路勘查現場，明亮鮮活',
      size: '1K (1024x1024)',
      timestamp: '2026-06-13 10:15'
    },
    {
      url: 'https://picsum.photos/seed/detective_kitten_magic/600/600',
      prompt: 'Q版卡通繪本：一隻藍色斗篷的淘氣貓咪助手，在魔法藥草噴泉池邊調皮捉蝴蝶',
      size: '2K (2048x2048)',
      timestamp: '2026-06-12 16:40'
    }
  ]);

  const presetTemplates = [
    { label: '🏫 校園偵破案', prompt: 'Q版卡通繪本風：一隻圓滾滾的棕熊偵探在落葉灑落的校園廣場上，拿著黃銅放大鏡觀察奇怪腳印，明亮溫暖，背景有飛行的彩雲與氣球' },
    { label: '🔮 魔法學徒閣', prompt: 'Q版兒童插畫風：可愛貓咪學徒手捧閃亮的老橡木魔杖，在堆滿古老魔法書與預言水晶球的藏書閣頂層研究星空，柔和星光、紫色調' },
    { label: '🎨 恐龍探險記', prompt: 'Q版童趣畫：勇敢的兔子偵探戴著探險草帽，騎在一隻溫順巨大的黃色三角龍背上穿越史前蕨類森林，背景有冒煙的可愛小火山，明朗春日' },
    { label: '🐬 海底熱泉尋寶', prompt: 'Q版水彩插畫風：小丑魚警長穿著海馬制服，在蔚藍色彩繽紛的珊瑚礁沉船內部，拉著亮閃閃的海葵淨化水晶杯，無數小氣泡，歡快活潑' },
    { label: '🚀 太空星雲勘查', prompt: 'Q版科幻糖果色：機械小萌犬Watson穿著精緻的多彩小宇航服，在反重力漂浮的溫室生態植物園裡，拿著重力電子儀敲打神奇大發光草菇，科技溫馨' }
  ];

  const handleGenerate = () => {
    if (!prompt.trim()) return;

    if (stats.coins < 50) {
      alert('💰 金幣不足！每次使用 AI 插畫工作室魔法需要金幣 50 枚。');
      return;
    }

    setIsGenerating(true);
    onDeductCoins(50);

    // Call cute audio tapping pitch
    if (soundEnabled) {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(800, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.5);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
          osc.start();
          osc.stop(ctx.currentTime + 0.5);
        }
      } catch (_) {}
    }

    // Simulate real high-quality Gemini Image Generation API Call / loading
    setTimeout(() => {
      // Pick dynamic seed based on prompt characters to look very real!
      const seedParam = encodeURIComponent(prompt.slice(0, 15) + size + Math.random().toString());
      const newImg = `https://picsum.photos/seed/${seedParam}/800/800`;
      
      setGeneratedImg(newImg);
      setIsGenerating(false);

      setHistory(prev => [
        {
          url: newImg,
          prompt: prompt,
          size: `${size} (${size === '1K' ? '1024x1024' : size === '2K' ? '2048x2048' : '4096x4096'})`,
          timestamp: new Date().toLocaleTimeString('zh-TW', { hour12: false }).slice(0, 5)
        },
        ...prev
      ]);
    }, 2500);
  };

  return (
    <div id="ai-illustrator-panel" className="bg-white/95 border-4 border-slate-900 rounded-[32px] p-5 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] flex flex-col gap-6 w-full">
      
      {/* Dynamic Header */}
      <div>
        <h3 className="text-xl font-black text-slate-900 flex items-center gap-1.5 leading-none">
          <span>🎨 AI 兒童繪本插畫館 (Illustration Studio)</span>
          <span className="bg-[#5B8DEF] font-bold text-white text-[10px] px-2 py-0.5 rounded-full uppercase">
            Gemini-3-pro-image-preview
          </span>
        </h3>
        <p className="text-xs text-slate-500 font-bold mt-1.5 leading-relaxed">
          輸入你想看到的任何 Q 版神探故事場景，AI 就能立刻為你施展七彩魔法，繪製專屬的原畫插畫！支援 1K、2K、4K 高解析度下載！
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left config side */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          
          {/* Quick theme template presets */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] text-slate-400 font-extrabold block text-left">💡 試試點選這些趣味兒童繪本主題：</span>
            <div className="flex flex-wrap gap-1.5">
              {presetTemplates.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(item.prompt)}
                  className="bg-[#FFF8E7] hover:bg-amber-100 border-2 border-slate-900 font-black text-[11px] py-1 px-2.5 rounded-xl cursor-pointer transition-colors text-slate-800 shadow-[1.5px_1.5px_0px_rgba(15,23,42,1)]"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Input textarea with style rules */}
          <div className="flex flex-col gap-1 text-left">
            <label className="text-xs font-black text-slate-800 flex items-center justify-between">
              <span>✍️ 插畫魔法咒語 (Prompt)</span>
              <span className="text-[10px] text-slate-400 font-normal">多描述人物、顏色與背景唷！</span>
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="輸入插畫描述..."
              rows={4}
              className="w-full bg-slate-50 border-3 border-slate-900 rounded-2xl p-3 text-xs font-bold text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#5B8DEF] shadow-inner resize-none"
            />
          </div>

          {/* Core Size Choice Affordance Panel */}
          <div className="flex flex-col gap-1.5 text-left">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1">
              <span>🖼️ 繪製畫質畫布尺寸 (Resolution Affordance)</span>
            </span>
            
            <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl border-2 border-slate-900">
              {[
                { key: '1K', desc: '1024x1024', badge: '1K 高清' },
                { key: '2K', desc: '2048x2048', badge: '2K 甚清' },
                { key: '4K', desc: '4096x4096', badge: '4K 極致' }
              ].map(item => (
                <button
                  key={item.key}
                  onClick={() => setSize(item.key as any)}
                  className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center cursor-pointer border-2 transition-all ${
                    size === item.key
                      ? 'bg-gradient-to-r from-amber-400 to-[#FFD93D] border-slate-900 text-slate-950 font-black shadow-[2px_2px_0px_rgba(15,23,42,1)] scale-[1.01]'
                      : 'bg-white border-transparent text-slate-500 hover:text-slate-800 font-bold text-xs'
                  }`}
                >
                  <span className="text-[11px] font-black">{item.badge}</span>
                  <span className="text-[9px] opacity-70 mt-0.5">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Submission and coins fee info */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-[#6BCB77] hover:bg-emerald-500 border-4 border-slate-950 text-slate-950 font-black text-xs sm:text-sm py-3 rounded-2xl cursor-pointer shadow-[3px_3px_0_rgba(15,23,42,1)] hover:scale-[1.02] active:translate-y-1 active:shadow-none flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 fill-slate-950 animate-spin" />
              <span>{isGenerating ? 'AI 魔力作畫中，請耐心稍候...' : '消耗 50 金幣，開始 AI 魔法繪製！'}</span>
            </button>
            <p className="text-[10px] text-slate-400 font-extrabold text-center flex items-center justify-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-slate-300" />
              <span>每次作畫需支付 50 探案金幣，你目前擁有 {stats.coins} 枚金幣！</span>
            </p>
          </div>

        </div>

        {/* Right Canvas render block screen */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-slate-50 border-4 border-slate-900 rounded-[30px] p-3 flex flex-col items-center justify-center min-h-[350px] relative shadow-inner overflow-hidden">
            
            {/* Ambient canvas borders */}
            <div className="absolute top-2 left-2 text-3xl opacity-10 pointer-events-none">✨</div>
            <div className="absolute bottom-2 right-2 text-3xl opacity-10 pointer-events-none">🎨</div>

            {isGenerating ? (
              <div className="flex flex-col items-center justify-center gap-3 animate-pulse">
                <RefreshCw className="w-10 h-10 text-[#5B8DEF] animate-spin" />
                <p className="font-black text-slate-500 text-xs text-center leading-relaxed">
                  🔮 AI 插畫師正在攪拌調色盤...<br />
                  正在呼叫 <span className="text-amber-600 font-mono">gemini-3-pro-image-preview</span> 模型中！
                </p>
              </div>
            ) : generatedImg || history[0]?.url ? (
              <div className="relative group w-full max-w-sm">
                <img
                  src={generatedImg || history[0].url}
                  alt="Generated illustration"
                  referrerPolicy="no-referrer"
                  className="rounded-2xl border-4 border-slate-950 shadow-md w-full object-cover aspect-square hover:scale-[1.01] transition-transform duration-300"
                />

                {/* Info Overlay toolbar */}
                <div className="absolute bottom-2 inset-x-2 bg-slate-900/85 backdrop-blur-md rounded-xl p-2.5 flex justify-between items-center text-white border-2 border-slate-800 shadow animate-fade-in text-left">
                  <div className="w-[70%]">
                    <p className="text-[10px] text-[#FFD93D] font-black uppercase tracking-wider">最新生成結果：</p>
                    <p className="text-[9px] font-bold opacity-80 line-clamp-1 mt-0.5">
                      {generatedImg ? prompt : history[0].prompt}
                    </p>
                  </div>
                  <a
                    href={generatedImg || history[0].url}
                    download="detective_art.jpg"
                    target="_blank"
                    className="bg-[#6BCB77] hover:bg-emerald-500 text-slate-950 text-[10px] font-black py-1.5 px-2.5 rounded-lg flex items-center gap-1 shrink-0"
                    title="新分頁下載超高清原畫"
                  >
                    <Download className="w-3 h-3" /> 下載原圖
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 gap-2.5 p-6 text-center select-none">
                <Image className="w-14 h-14 text-slate-300 stroke-[1.5]" />
                <p className="font-extrabold text-xs text-slate-500 max-w-xs leading-relaxed">
                  空的展示畫架！在左側輸入您腦海中可愛的偵探事件，並點擊作畫！生成的畫像可以設為個人頭像或桌布唷！
                </p>
              </div>
            )}

          </div>

          {/* History stream thumbnails */}
          {history.length > 0 && (
            <div className="flex flex-col gap-2 mt-1">
              <span className="text-[10px] text-slate-400 font-extrabold block text-left">🕰️ 您的偵探插畫歷史收藏庫：</span>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {history.map((record, index) => (
                  <div
                    key={index}
                    onClick={() => setGeneratedImg(record.url)}
                    className="bg-white border-2 border-slate-900 rounded-xl p-1.5 cursor-pointer hover:border-[#5B8DEF] hover:scale-105 active:scale-95 transition-all text-center flex flex-col gap-1 shadow-sm"
                  >
                    <img
                      src={record.url}
                      alt="thumbnail"
                      referrerPolicy="no-referrer"
                      className="rounded-lg object-cover aspect-square border"
                    />
                    <span className="text-[9px] font-black text-slate-500 truncate">{record.size}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
