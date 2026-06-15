import React, { useState } from 'react';
import { Puzzle } from '../types';
import { Eraser, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

interface NotebookViewProps {
  puzzle: Puzzle;
  answers: number[][]; // [categoryIndex][slotIndex] -> itemIndex
  conflictingClues: string[]; // List of clue texts that are contradicted
  conflictingCells: { catIdx: number; slotIdx: number }[]; // Coordinates of conflicting cells
  onCellSelect: (catIdx: number, slotIdx: number, val: number) => void;
}

export const NotebookView: React.FC<NotebookViewProps> = ({
  puzzle,
  answers,
  conflictingClues,
  conflictingCells,
  onCellSelect,
}) => {
  const [activeSelect, setActiveSelect] = useState<{ catIdx: number; slotIdx: number } | null>(null);

  // Check if a cell is currently in conflict
  const isConflicting = (catIdx: number, slotIdx: number) => {
    return conflictingCells.some(cell => cell.catIdx === catIdx && cell.slotIdx === slotIdx);
  };

  // Check if an item index in a category is already used in any other slot index
  const isItemUsedElsewhere = (catIdx: number, itemIdx: number, currentSlotIdx: number) => {
    return answers[catIdx].some((val, sIdx) => sIdx !== currentSlotIdx && val === itemIdx);
  };

  const handleCellClick = (catIdx: number, slotIdx: number) => {
    if (activeSelect && activeSelect.catIdx === catIdx && activeSelect.slotIdx === slotIdx) {
      setActiveSelect(null);
    } else {
      setActiveSelect({ catIdx, slotIdx });
    }
  };

  const selectValue = (catIdx: number, slotIdx: number, val: number) => {
    onCellSelect(catIdx, slotIdx, val);
    setActiveSelect(null);
  };

  // Check if all slots are fully solved
  const isFilled = answers.every(row => row.every(val => val !== -1));

  return (
    <div id="notebook-board" className="relative flex flex-col gap-6 w-full">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <span>🔍 案件解答板 (Notebook Plan)</span>
          </h3>
          <p className="text-slate-500 font-bold text-xs mt-1">
            在對應的線索位置卡片中，點擊屬性方格，將人物、物品等關聯至正確的欄位中。已在其他位置選過的項目會以灰色刪除線標記。
          </p>
        </div>
        {isFilled && conflictingClues.length === 0 && (
          <span className="bg-emerald-100 text-emerald-800 border-2 border-emerald-400 font-black text-xs px-3 py-1 rounded-full flex items-center gap-1 shrink-0 animate-bounce">
            <CheckCircle2 className="w-4 h-4" /> 恭喜！完美吻合所有線索！
          </span>
        )}
      </div>

      {/* Conflict Alarm Banner */}
      {conflictingClues.length > 0 && (
        <div className="bg-rose-50 border-4 border-rose-500 text-rose-850 p-3 rounded-2xl flex items-start gap-2.5 shadow-[4px_4px_0px_rgba(239,68,68,0.2)] animate-pulse">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="w-full">
            <h4 className="font-extrabold text-sm text-rose-900 leading-none mb-1">
              偵探筆記存在衝突懸案：
            </h4>
            <div className="flex flex-col gap-1 mt-1 font-bold text-xs">
              {conflictingClues.slice(0, 3).map((clueText, index) => (
                <div key={index} className="bg-rose-100/50 py-1 px-2 rounded-lg border border-rose-200">
                  ⚠️ 此推論與線索矛盾：{clueText}
                </div>
              ))}
              {conflictingClues.length > 3 && (
                <div className="text-rose-500">以及其他 {conflictingClues.length - 3} 個線索衝突...</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grid wrapper with RWD support (scroll container) */}
      <div className="w-full overflow-x-auto pb-4 -mx-4 px-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
        <div 
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${puzzle.size}, minmax(130px, 180px))` }}
        >
          {/* Card columns */}
          {Array.from({ length: puzzle.size }).map((_, slotIdx) => {
            return (
              <div
                key={slotIdx}
                className={`bg-slate-50/50 border-4 rounded-3xl p-3 flex flex-col gap-3 transition-all duration-300 shadow-[6px_6px_0px_rgba(15,23,42,1)] ${
                  slotIdx % 2 === 0 ? 'bg-indigo-50/30' : 'bg-pink-50/20'
                } border-slate-900 hover:scale-[1.02]`}
              >
                {/* Column header */}
                <div className="text-center font-black text-slate-800 text-sm border-b-2 border-slate-200 pb-2">
                  <span className="bg-slate-900 text-amber-300 px-3 py-0.5 rounded-full text-xs shadow-sm inline-block">
                    位置 #{slotIdx + 1}
                  </span>
                </div>

                {/* Sub-categories selections */}
                <div className="flex flex-col gap-2.5">
                  {puzzle.categories.map((cat, catIdx) => {
                    const currentVal = answers[catIdx][slotIdx];
                    const selectedItem = currentVal !== -1 ? cat.items[currentVal] : null;
                    const selectedIcon = currentVal !== -1 ? cat.icons[currentVal] : '❓';
                    const hasConflict = isConflicting(catIdx, slotIdx);

                    return (
                      <div key={cat.key} className="relative">
                        <div className="text-[10px] text-slate-500 font-extrabold mb-0.5 ml-1 flex justify-between">
                          <span>{cat.name}</span>
                          {currentVal !== -1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                selectValue(catIdx, slotIdx, -1);
                              }}
                              className="text-slate-400 hover:text-rose-500 cursor-pointer"
                              title="清除"
                            >
                              <Eraser className="w-3 h-3 inline" />
                            </button>
                          )}
                        </div>

                        {/* Cell Clickable Box */}
                        <button
                          onClick={() => handleCellClick(catIdx, slotIdx)}
                          className={`w-full text-left rounded-2xl border-2 p-2 flex flex-col items-center justify-center min-h-[64px] transition-all cursor-pointer font-bold ${
                            currentVal !== -1
                              ? hasConflict
                                ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-inner'
                                : 'bg-white border-slate-900 text-slate-800 shadow-[2px_2px_0px_rgba(15,23,42,1)]'
                              : hasConflict
                              ? 'bg-rose-100/50 border-rose-400 border-dashed animate-pulse text-rose-500'
                              : 'bg-slate-50 border-slate-300 hover:border-slate-500 border-dashed hover:bg-slate-100 text-slate-400'
                          }`}
                        >
                          <span className="text-2xl animate-pulse-slow">{selectedIcon}</span>
                          <span className="text-xs text-center leading-tight mt-1 truncate max-w-full">
                            {selectedItem || '❓ 點擊指派'}
                          </span>
                        </button>

                        {/* Dropdown Selection Panel */}
                        {activeSelect &&
                          activeSelect.catIdx === catIdx &&
                          activeSelect.slotIdx === slotIdx && (
                            <div className="absolute top-[84px] left-1/2 -translate-x-1/2 w-48 bg-white border-4 border-slate-900 rounded-2xl p-2 shadow-[4px_4px_0px_rgba(15,23,42,1)] z-40 max-h-56 overflow-y-auto scrollbar-thin">
                              <div className="text-[10px] text-slate-500 font-extrabold pb-1.5 mb-1.5 border-b border-slate-150 text-center">
                                指派屬於此欄的「{cat.name}」
                              </div>
                              <div className="flex flex-col gap-1">
                                {/* Clear Item Option */}
                                {currentVal !== -1 && (
                                  <button
                                    onClick={() => selectValue(catIdx, slotIdx, -1)}
                                    className="flex items-center gap-2 w-full p-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-300 cursor-pointer"
                                  >
                                    <Eraser className="w-3.5 h-3.5" />
                                    <span>清除當前選項</span>
                                  </button>
                                )}
                                
                                {cat.items.map((item, itemIdx) => {
                                  const isUsed = isItemUsedElsewhere(catIdx, itemIdx, slotIdx);
                                  const isCurrent = currentVal === itemIdx;

                                  return (
                                    <button
                                      key={itemIdx}
                                      onClick={() => selectValue(catIdx, slotIdx, itemIdx)}
                                      disabled={isUsed && !isCurrent}
                                      className={`flex items-center justify-between w-full p-2 rounded-xl text-xs font-bold border-2 cursor-pointer transition-all ${
                                        isCurrent
                                          ? 'bg-indigo-100 text-indigo-700 border-indigo-500'
                                          : isUsed
                                          ? 'bg-slate-100 text-slate-400 line-through border-transparent cursor-not-allowed opacity-60'
                                          : 'bg-slate-50 text-slate-700 border-transparent hover:bg-slate-150 hover:border-slate-400'
                                      }`}
                                    >
                                      <span className="truncate flex items-center gap-1.5">
                                        <span>{cat.icons[itemIdx] || '❓'}</span>
                                        <span>{item}</span>
                                      </span>
                                      {isCurrent && <span className="text-[10px] bg-indigo-500 text-white font-extrabold px-1 rounded">己選</span>}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
