import React, { useState } from 'react';
import { Puzzle } from '../types';
import { HelpCircle } from 'lucide-react';

interface MatrixViewProps {
  puzzle: Puzzle;
  answers: number[][];
  matrix: Record<string, number>; // key: `${catAIdx}_${itemAIdx}_${catBIdx}_${itemBIdx}` -> state (0=?, 1=✖, 2=✔)
  onMatrixCellToggle: (catAIdx: number, itemAIdx: number, catBIdx: number, itemBIdx: number, forceState?: number) => void;
  onClearMatrix: () => void;
}

export const MatrixView: React.FC<MatrixViewProps> = ({
  puzzle,
  matrix,
  onMatrixCellToggle,
  onClearMatrix,
}) => {
  const categories = puzzle.categories;
  const numCats = categories.length;

  // Generate all pairs of categories (catA < catB)
  const pairs: { catAIdx: number; catBIdx: number; name: string }[] = [];
  for (let i = 0; i < numCats; i++) {
    for (let j = i + 1; j < numCats; j++) {
      pairs.push({
        catAIdx: i,
        catBIdx: j,
        name: `${categories[i].name} × ${categories[j].name}`,
      });
    }
  }

  const [activePairIdx, setActivePairIdx] = useState(0);

  if (pairs.length === 0) return null;

  const currentPair = pairs[activePairIdx];
  const catA = categories[currentPair.catAIdx];
  const catB = categories[currentPair.catBIdx];

  const getCellState = (rIdx: number, cIdx: number) => {
    const key = `${currentPair.catAIdx}_${rIdx}_${currentPair.catBIdx}_${cIdx}`;
    return matrix[key] || 0;
  };

  const handleCellClick = (rIdx: number, cIdx: number) => {
    onMatrixCellToggle(currentPair.catAIdx, rIdx, currentPair.catBIdx, cIdx);
  };

  // Quick Action: Fill rest of row/column with X if cell marked V
  const handleAutoFillExclusions = (rIdx: number, cIdx: number) => {
    // Force set active cell to ✔ (2), and all other cells in same row/col for this pair to ✖ (1)
    for (let i = 0; i < puzzle.size; i++) {
      if (i === cIdx) {
        onMatrixCellToggle(currentPair.catAIdx, rIdx, currentPair.catBIdx, i, 2);
      } else {
        onMatrixCellToggle(currentPair.catAIdx, rIdx, currentPair.catBIdx, i, 1);
      }
    }
    for (let j = 0; j < puzzle.size; j++) {
      if (j !== rIdx) {
        onMatrixCellToggle(currentPair.catAIdx, j, currentPair.catBIdx, cIdx, 1);
      }
    }
  };

  // Render symbol classes
  const getSymbolDecoration = (state: number) => {
    switch (state) {
      case 1: // ✖ Exclude
        return 'text-rose-500 font-extrabold text-base';
      case 2: // ✔ Match
        return 'text-emerald-500 font-black text-lg bg-emerald-50';
      default: // 0 = ?
        return 'text-slate-300 font-bold';
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <span>📋 邏輯推理排除格 (Draft Matrix)</span>
          </h3>
          <p className="text-slate-500 font-bold text-xs mt-1">
            愛因斯坦棋盤的核心草稿簿。點擊儲存格切換：<span className="text-slate-400">? (未知)</span> ➜ <span className="text-rose-500">✖ (排除)</span> ➜ <span className="text-emerald-600">✔ (配對)</span>。
          </p>
        </div>
        <button
          onClick={onClearMatrix}
          className="text-xs bg-slate-100 border-2 border-slate-950 font-extrabold py-1.5 px-3 rounded-xl hover:bg-slate-200 cursor-pointer shadow-[2px_2px_0px_rgba(15,23,42,1)] active:translate-y-0.5 active:shadow-none"
        >
          🗑️ 清空所有草稿
        </button>
      </div>

      {/* Category Pairs Select Rail */}
      <div className="flex flex-wrap gap-1.5 border-b-2 border-slate-200 pb-2 overflow-x-auto">
        {pairs.map((pair, idx) => (
          <button
            key={idx}
            onClick={() => setActivePairIdx(idx)}
            className={`font-black text-xs py-1.5 px-3 rounded-xl border-2 transition-all cursor-pointer ${
              activePairIdx === idx
                ? 'bg-slate-900 text-amber-300 border-slate-900 shadow-[2px_2px_0px_rgba(15,23,42,1)]'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
            }`}
          >
            {pair.name}
          </button>
        ))}
      </div>

      {/* Pair Matrix Panel */}
      <div className="bg-slate-50 border-4 border-slate-900 rounded-3xl p-4 shadow-[6px_6px_0px_rgba(15,23,42,1)] overflow-x-auto">
        <div className="min-w-[450px]">
          {/* Header Row: Column Labels (Category B items) */}
          <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: `140px repeat(${puzzle.size}, 1fr)` }}>
            {/* Top-left corner */}
            <div className="bg-slate-900 text-white font-extrabold text-[10px] p-2 rounded-xl flex items-center justify-center text-center">
              <div>
                <span className="text-pink-300">{catA.name}</span>
                <span className="text-slate-400 font-normal"> / </span>
                <span className="text-amber-300">{catB.name}</span>
              </div>
            </div>

            {/* Column labels */}
            {catB.items.map((item, idx) => (
              <div
                key={idx}
                className="bg-amber-100 border-2 border-slate-900 rounded-xl p-1.5 flex flex-col items-center justify-center text-center shadow-[1px_1px_0px_rgba(15,23,42,1)]"
                title={item}
              >
                <span className="text-xl mb-0.5 leading-none">{catB.icons[idx] || '❓'}</span>
                <span className="text-[10px] font-black text-slate-800 line-clamp-1 max-w-[55px] break-all leading-tight">
                  {item}
                </span>
              </div>
            ))}
          </div>

          {/* Table Data Rows */}
          <div className="flex flex-col gap-2">
            {catA.items.map((rowItem, rIdx) => {
              return (
                <div
                  key={rIdx}
                  className="grid gap-2 items-center"
                  style={{ gridTemplateColumns: `140px repeat(${puzzle.size}, 1fr)` }}
                >
                  {/* Row header (Category A item) */}
                  <div className="bg-indigo-50 border-2 border-slate-900 rounded-xl p-2 flex items-center gap-1.5 shadow-[1px_1px_0px_rgba(15,23,42,1)]">
                    <span className="text-lg leading-none shrink-0">{catA.icons[rIdx] || '❓'}</span>
                    <span className="text-[10px] font-black text-slate-800 truncate" title={rowItem}>
                      {rowItem}
                    </span>
                  </div>

                  {/* Intersections (interactive cells) */}
                  {catB.items.map((_, cIdx) => {
                    const state = getCellState(rIdx, cIdx);

                    return (
                      <div key={cIdx} className="relative group">
                        <button
                          onClick={() => handleCellClick(rIdx, cIdx)}
                          onDoubleClick={() => handleAutoFillExclusions(rIdx, cIdx)}
                          className={`w-full h-11 border-2 border-slate-900 rounded-xl flex items-center justify-center transition-all cursor-pointer relative shadow-[1px_1px_0px_rgba(15,23,42,1)] ${
                            state === 2
                              ? 'bg-emerald-50 border-emerald-500 scale-[1.02] z-10'
                              : state === 1
                              ? 'bg-rose-50/50 border-slate-400'
                              : 'bg-white hover:bg-slate-100'
                          }`}
                        >
                          {state === 2 && <span className="font-black text-emerald-600 text-lg">✔</span>}
                          {state === 1 && <span className="font-extrabold text-rose-500 text-sm">✖</span>}
                          {state === 0 && <span className="text-slate-300 font-normal text-xs hover:text-slate-400">?</span>}
                        </button>

                        {/* Double tap hint */}
                        <div className="absolute left-1/2 -translate-x-1/2 -top-8 bg-slate-900 text-white font-bold text-[8px] px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-20 whitespace-nowrap">
                          雙擊 💡 自動填充行列 ✖
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Help box */}
      <div className="bg-amber-50 border-2 border-amber-300 p-2.5 rounded-2xl flex items-center gap-2 text-[11px] text-amber-800 font-bold">
        <HelpCircle className="w-4 h-4 shrink-0 text-amber-500" />
        <span>雙擊 (Double Click) 任何格子以將其標記為 ✔，且系統會貼心地自動幫你把該格所在的行與列其他格子全部填入 ✖ 排除！</span>
      </div>

    </div>
  );
};
