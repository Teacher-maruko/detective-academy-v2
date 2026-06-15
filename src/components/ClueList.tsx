import React, { useState } from 'react';
import { Clue } from '../types';
import { CheckCircle2, Circle, AlertTriangle, Eye, EyeOff } from 'lucide-react';

interface ClueListProps {
  clues: Clue[];
  markedClues: Record<string, boolean>; // key: clueId -> boolean (whether crossed out)
  onToggleMarkClue: (clueId: string) => void;
  highlightedClueId: string | null;
}

export const ClueList: React.FC<ClueListProps> = ({
  clues,
  markedClues,
  onToggleMarkClue,
  highlightedClueId,
}) => {
  const [hideChecked, setHideChecked] = useState(false);

  // Parse custom bracketed items like: "👦【小明】" into elegant inline badges
  const renderClueTextParser = (text: string) => {
    // Regex matches emojis followed by bracketed words, e.g., "👦【小明】" or match just "【小明】"
    // Regex: /([\p{Emoji_Presentation}\u200d]*?)【(.*?)】/gu
    const parts = [];
    let lastIndex = 0;
    
    // Simple bracket parser for robust matching of brackets
    const regex = /([\uD800-\uDBFF][\uDC00-\uDFFF]|[\p{Emoji}\u200d\uFE0F]+)?【(.*?)】/gu;
    
    let match;
    while ((match = regex.exec(text)) !== null) {
      const matchIndex = match.index;
      
      // Push text before match
      if (matchIndex > lastIndex) {
        parts.push(<span key={lastIndex}>{text.substring(lastIndex, matchIndex)}</span>);
      }
      
      const emoji = match[1] || '';
      const name = match[2];
      
      // Categorize badge color loosely by emoji type
      let badgeColor = 'bg-slate-100 text-slate-800 border-slate-300';
      if ('🔴🔴🔵🟢🟡🟠🟣🌸⚫⚪'.includes(emoji)) {
        badgeColor = 'bg-amber-50 text-amber-900 border-amber-300';
      } else if ('🏆⏱️📝🔑📔🪢🎺🎨✒️🧪🍱📻⚔️💾⌚🧭🔋🪨🌱'.includes(emoji)) {
        badgeColor = 'bg-indigo-50 text-indigo-900 border-indigo-200';
      } else if ('🏫🏫🎨📚🦁🐼🦊'.includes(emoji)) {
        badgeColor = 'bg-teal-50 text-teal-900 border-teal-200';
      } else if ('👦🧑👨👧👷👮👨‍⚕️🥷👵🧚👸🤵'.includes(emoji)) {
        badgeColor = 'bg-rose-50 text-rose-950 border-rose-300 font-extrabold';
      } else if ('🐕🐈🐢🦜🐹🐇🦉🦊'.includes(emoji)) {
        badgeColor = 'bg-emerald-50 text-emerald-950 border-emerald-300';
      }

      parts.push(
        <span
          key={`badge_${matchIndex}`}
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 mx-0.5 rounded-full border-2 text-xs font-black shadow-[1px_1px_0px_rgba(15,23,42,1)] ${badgeColor}`}
        >
          {emoji && <span className="text-sm select-none leading-none">{emoji}</span>}
          <span>{name}</span>
        </span>
      );
      
      lastIndex = regex.lastIndex;
    }
    
    if (lastIndex < text.length) {
      parts.push(<span key={lastIndex}>{text.substring(lastIndex)}</span>);
    }
    
    return parts.length > 0 ? parts : text;
  };

  const markedCount = Object.values(markedClues).filter(Boolean).length;

  return (
    <div id="clues-card-panel" className="flex flex-col gap-4 w-full">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <span>📜 查案線索清單 (Detective Clues)</span>
            <span className="text-xs bg-slate-100 border border-slate-400 py-0.5 px-2.5 rounded-full font-bold">
              得手 {markedCount} / {clues.length}
            </span>
          </h3>
          <p className="text-slate-500 font-bold text-xs">
            逐條排查證詞以解開謎題，點擊線索可將其「劃線作廢 (Strikeout)」，讓思考脈絡更清晰。
          </p>
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setHideChecked(!hideChecked)}
          className="flex items-center gap-1.5 text-xs bg-white text-slate-700 hover:text-slate-950 border-2 border-slate-900 font-extrabold py-1 px-3.5 rounded-xl cursor-pointer shadow-[2px_2px_0px_rgba(15,23,42,1)] active:translate-y-0.5 active:shadow-none shrink-0"
        >
          {hideChecked ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          {hideChecked ? '顯示已分析線索' : '隱藏已排查線索'}
        </button>
      </div>

      {/* List */}
      <div className="flex flex-col gap-2.5 max-h-[460px] overflow-y-auto pr-1">
        {clues.map((clue, idx) => {
          const isMarked = !!markedClues[clue.id];
          if (hideChecked && isMarked) return null;

          const isHighlighted = highlightedClueId === clue.id;

          return (
            <div
              key={clue.id}
              onClick={() => onToggleMarkClue(clue.id)}
              className={`group flex items-start gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                isMarked
                  ? 'bg-slate-100/70 border-slate-300 text-slate-400 opacity-60 hover:opacity-100'
                  : isHighlighted
                  ? 'bg-rose-50 border-rose-500 shadow-[4px_4px_0px_rgba(244,63,94,0.3)] scale-[1.01]'
                  : 'bg-white border-slate-900 hover:bg-amber-50/40 shadow-[4px_4px_0px_rgba(15,23,42,1)] hover:shadow-[5px_5px_0px_rgba(15,23,42,1)] hover:scale-[1.002] active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(15,23,42,1)]'
              }`}
            >
              {/* Check Indicator */}
              <button
                type="button"
                className="shrink-0 mt-0.5 text-slate-700 hover:scale-110 transition-transform"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleMarkClue(clue.id);
                }}
              >
                {isMarked ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-500 group-hover:text-amber-500" />
                )}
              </button>

              {/* Clue Index & Text */}
              <div className="flex flex-col w-full">
                <span className={`text-[10px] font-black tracking-widest leading-none mb-1 text-slate-400 font-mono flex items-center gap-1.5 ${isMarked ? 'text-slate-300' : ''}`}>
                  <span>證詞 #{idx + 1}</span>
                  {isHighlighted && (
                    <span className="bg-rose-500 text-white font-bold text-[8px] px-1 rounded animate-pulse">
                      🚨 當前衝突線索
                    </span>
                  )}
                </span>
                
                <p className={`text-sm font-bold leading-relaxed text-slate-800 ${isMarked ? 'line-through text-slate-400' : ''}`}>
                  {renderClueTextParser(clue.text)}
                </p>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
