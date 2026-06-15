import { Difficulty, Clue, ClueType, Puzzle, ThemeConfig } from '../types';
import { THEMES } from '../data';

/**
 * Procedural Solver and Generator for Logic Grid Puzzles.
 */

// Helper: Shuffler
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Check if the current grid violates any clues.
 * Handles partial grids where cells can be -1.
 */
export function checkCluesConsistency(
  grid: number[][],
  clues: Clue[],
  numCategories: number
): boolean {
  const N = grid.length;

  // Helper to find slot of a specific category & item
  const findPosOfItem = (cat: number, item: number): number => {
    for (let s = 0; s < N; s++) {
      if (grid[s][cat] === item) return s;
    }
    return -1;
  };

  for (const clue of clues) {
    const { params } = clue;

    switch (clue.type) {
      case ClueType.Pair: {
        const { catA, itemA, catB, itemB } = params;
        const posA = findPosOfItem(catA, itemA);
        const posB = findPosOfItem(catB, itemB);
        if (posA !== -1 && posB !== -1) {
          if (posA !== posB) return false;
        }
        if (posA !== -1) {
          const valB = grid[posA][catB];
          if (valB !== -1 && valB !== itemB) return false;
        }
        if (posB !== -1) {
          const valA = grid[posB][catA];
          if (valA !== -1 && valA !== itemA) return false;
        }
        break;
      }

      case ClueType.Exclude: {
        const { catA, itemA, catB, itemB } = params;
        const posA = findPosOfItem(catA, itemA);
        const posB = findPosOfItem(catB, itemB);
        if (posA !== -1 && posB !== -1) {
          if (posA === posB) return false;
        }
        if (posA !== -1) {
          const valB = grid[posA][catB];
          if (valB === itemB) return false;
        }
        break;
      }

      case ClueType.LeftOf: {
        const { catA, itemA, catB, itemB } = params;
        const posA = findPosOfItem(catA, itemA);
        const posB = findPosOfItem(catB, itemB);
        if (posA !== -1 && posB !== -1) {
          if (posA !== posB - 1) return false;
        }
        if (posA === N - 1) return false; // Can't be on the rightmost
        if (posB === 0) return false;   // Can't be on the leftmost
        
        if (posA !== -1) {
          const rightValue = grid[posA + 1][catB];
          if (rightValue !== -1 && rightValue !== itemB) return false;
        }
        if (posB !== -1) {
          const leftValue = grid[posB - 1][catA];
          if (leftValue !== -1 && leftValue !== itemA) return false;
        }
        break;
      }

      case ClueType.RightOf: {
        const { catA, itemA, catB, itemB } = params;
        const posA = findPosOfItem(catA, itemA);
        const posB = findPosOfItem(catB, itemB);
        if (posA !== -1 && posB !== -1) {
          if (posA !== posB + 1) return false;
        }
        if (posA === 0) return false;
        if (posB === N - 1) return false;

        if (posA !== -1) {
          const leftValue = grid[posA - 1][catB];
          if (leftValue !== -1 && leftValue !== itemB) return false;
        }
        if (posB !== -1) {
          const rightValue = grid[posB + 1][catA];
          if (rightValue !== -1 && rightValue !== itemA) return false;
        }
        break;
      }

      case ClueType.Adjacent: {
        const { catA, itemA, catB, itemB } = params;
        const posA = findPosOfItem(catA, itemA);
        const posB = findPosOfItem(catB, itemB);
        if (posA !== -1 && posB !== -1) {
          if (Math.abs(posA - posB) !== 1) return false;
        }
        // If A is placed, check B options
        if (posA !== -1) {
          let leftPosPossible = posA > 0 && (grid[posA - 1][catB] === -1 || grid[posA - 1][catB] === itemB);
          let rightPosPossible = posA < N - 1 && (grid[posA + 1][catB] === -1 || grid[posA + 1][catB] === itemB);
          if (!leftPosPossible && !rightPosPossible) return false;
        }
        if (posB !== -1) {
          let leftPosPossible = posB > 0 && (grid[posB - 1][catA] === -1 || grid[posB - 1][catA] === itemA);
          let rightPosPossible = posB < N - 1 && (grid[posB + 1][catA] === -1 || grid[posB + 1][catA] === itemA);
          if (!leftPosPossible && !rightPosPossible) return false;
        }
        break;
      }

      case ClueType.NotAdjacent: {
        const { catA, itemA, catB, itemB } = params;
        const posA = findPosOfItem(catA, itemA);
        const posB = findPosOfItem(catB, itemB);
        if (posA !== -1 && posB !== -1) {
          if (Math.abs(posA - posB) === 1) return false;
        }
        if (posA !== -1) {
          if (posA > 0 && grid[posA - 1][catB] === itemB) return false;
          if (posA < N - 1 && grid[posA + 1][catB] === itemB) return false;
        }
        break;
      }

      case ClueType.SpecificPosition: {
        const { catA, itemA, pos } = params;
        const posA = findPosOfItem(catA, itemA);
        if (posA !== -1 && posA !== pos) return false;
        const cellValue = grid[pos][catA];
        if (cellValue !== -1 && cellValue !== itemA) return false;
        break;
      }

      case ClueType.AtFirst: {
        const { catA, itemA } = params;
        const posA = findPosOfItem(catA, itemA);
        if (posA !== -1 && posA !== 0) return false;
        const cellValue = grid[0][catA];
        if (cellValue !== -1 && cellValue !== itemA) return false;
        break;
      }

      case ClueType.AtLast: {
        const { catA, itemA } = params;
        const posA = findPosOfItem(catA, itemA);
        if (posA !== -1 && posA !== N - 1) return false;
        const cellValue = grid[N - 1][catA];
        if (cellValue !== -1 && cellValue !== itemA) return false;
        break;
      }

      case ClueType.AtMiddle: {
        const { catA, itemA } = params;
        const mid = Math.floor(N / 2);
        const posA = findPosOfItem(catA, itemA);
        if (posA !== -1 && posA !== mid) return false;
        const cellValue = grid[mid][catA];
        if (cellValue !== -1 && cellValue !== itemA) return false;
        break;
      }

      case ClueType.DistanceTwo: {
        const { catA, itemA, catB, itemB } = params;
        const posA = findPosOfItem(catA, itemA);
        const posB = findPosOfItem(catB, itemB);
        if (posA !== -1 && posB !== -1) {
          if (Math.abs(posA - posB) !== 2) return false;
        }
        if (posA !== -1) {
          let leftPosPossible = posA > 1 && (grid[posA - 2][catB] === -1 || grid[posA - 2][catB] === itemB);
          let rightPosPossible = posA < N - 2 && (grid[posA + 2][catB] === -1 || grid[posA + 2][catB] === itemB);
          if (!leftPosPossible && !rightPosPossible) return false;
        }
        break;
      }

      case ClueType.GreaterThan: {
        const { catA, itemA, catB, itemB } = params;
        const posA = findPosOfItem(catA, itemA);
        const posB = findPosOfItem(catB, itemB);
        if (posA !== -1 && posB !== -1) {
          if (posA <= posB) return false;
        }
        if (posA === 0) return false; // Can't be on leftmost if must be greater
        if (posB === N - 1) return false; // Can't be rightmost if must be less
        break;
      }

      case ClueType.LessThan: {
        const { catA, itemA, catB, itemB } = params;
        const posA = findPosOfItem(catA, itemA);
        const posB = findPosOfItem(catB, itemB);
        if (posA !== -1 && posB !== -1) {
          if (posA >= posB) return false;
        }
        if (posA === N - 1) return false;
        if (posB === 0) return false;
        break;
      }

      case ClueType.OddPosition: {
        // 1-based index is odd, i.e., 0-based index is even (0, 2, 4...)
        const { catA, itemA } = params;
        const posA = findPosOfItem(catA, itemA);
        if (posA !== -1 && posA % 2 !== 0) return false;
        break;
      }

      case ClueType.EvenPosition: {
        // 1-based index is even, i.e., 0-based index is odd (1, 3, 5...)
        const { catA, itemA } = params;
        const posA = findPosOfItem(catA, itemA);
        if (posA !== -1 && posA % 2 !== 1) return false;
        break;
      }

      default:
        break;
    }
  }

  return true;
}

/**
 * Solve logic puzzle using backtracking and return solutions.
 * To avoid performance issues with open-ended solutions, we limit search and stop once we find > 1 solution.
 */
export function countSolutions(
  clues: Clue[],
  N: number,
  C: number,
  limit: number = 2000
): { count: number; completedSolution: number[][] | null } {
  let solutionsCount = 0;
  let firstSolution: number[][] | null = null;
  let stepsCount = 0;

  // Initialize empty N x C grid
  const grid: number[][] = Array.from({ length: N }, () => Array(C).fill(-1));

  // Pre-calculate which items are assigned to which slots
  // usedItems[catIndex][itemIndex] = true/false
  const usedItems: boolean[][] = Array.from({ length: C }, () => Array(N).fill(false));

  // Fix Category 0 as 0, 1, ..., N-1 in slots 0 to N-1 to break symmetry
  for (let s = 0; s < N; s++) {
    grid[s][0] = s;
    usedItems[0][s] = true;
  }

  function backtrack(slot: number, cat: number): boolean {
    stepsCount++;
    if (stepsCount > limit) {
      // Exceeded limit, conservatively return search aborted (count as 2 to force safe generation)
      return true;
    }

    if (slot === N) {
      solutionsCount++;
      firstSolution = grid.map(row => [...row]);
      return solutionsCount >= 2; // Stop search if we find 2 solutions
    }

    // Determine next cell
    let nextSlot = slot;
    let nextCat = cat + 1;
    if (nextCat === C) {
      nextSlot = slot + 1;
      nextCat = 1; // Skip Category 0 because it's locked
    }

    // Try values for current slot & cat
    for (let val = 0; val < N; val++) {
      if (!usedItems[cat][val]) {
        grid[slot][cat] = val;
        usedItems[cat][val] = true;

        if (checkCluesConsistency(grid, clues, C)) {
          const stop = backtrack(nextSlot, nextCat);
          if (stop) return true;
        }

        // Backtrack
        grid[slot][cat] = -1;
        usedItems[cat][val] = false;
      }
    }

    return false;
  }

  // Start backtracking from slot 0, category 1 (since category 0 is locked as s)
  backtrack(0, 1);

  return {
    count: solutionsCount,
    completedSolution: firstSolution
  };
}

/**
 * Procedurally generates a unique logic puzzle
 */
export function generatePuzzle(
  difficulty: Difficulty,
  themeId: string,
  customSeed?: number
): Puzzle {
  const theme = THEMES[themeId] || THEMES.campus;

  // 1. Determine size N and category count C based on difficulty
  let N = 4;
  let C = 3;

  switch (difficulty) {
    case Difficulty.Lv1: N = 4; C = 3; break;
    case Difficulty.Lv2: N = 5; C = 3; break;
    case Difficulty.Lv3: N = 6; C = 3; break;
    case Difficulty.Lv4: N = 7; C = 4; break;
    case Difficulty.Lv5: N = 8; C = 4; break;
    case Difficulty.Lv6: N = 9; C = 4; break;
    case Difficulty.Lv7: N = 10; C = 4; break;
    case Difficulty.Lv8: N = 12; C = 5; break;
    default: N = 4; C = 3;
  }

  // Get first C categories, containing first N items
  const puzzleCategories = theme.categories.slice(0, C).map(cat => {
    return {
      name: cat.name,
      key: cat.key,
      items: cat.items.slice(0, N),
      icons: (cat.icons || Array(12).fill('❓')).slice(0, N)
    };
  });

  // 2. Generate a valid random ground-truth solution
  // For each category c, its assignment is a permutation of 0..N-1
  const solution: number[][] = Array.from({ length: N }, () => Array(C).fill(-1));
  
  // Category 0 is locked from 0..N-1 in slots 0..N-1 to break symmetry
  for (let s = 0; s < N; s++) {
    solution[s][0] = s;
  }

  // Permute other categories
  for (let c = 1; c < C; c++) {
    const perm = shuffleArray(Array.from({ length: N }, (_, i) => i));
    for (let s = 0; s < N; s++) {
      solution[s][c] = perm[s];
    }
  }

  // 3. Create a pool of "true clues" based on this solution
  const cluePool: Clue[] = [];
  let clueIdCounter = 1;

  const createClue = (type: ClueType, params: Record<string, any>, text: string): Clue => {
    return {
      id: `clue_${clueIdCounter++}`,
      text,
      type,
      params
    };
  };

  // Helper to translate names
  const getItemName = (catIdx: number, itemIdx: number): string => {
    return puzzleCategories[catIdx].items[itemIdx];
  };
  const getItemIcon = (catIdx: number, itemIdx: number): string => {
    return puzzleCategories[catIdx].icons[itemIdx];
  };
  const getItemStr = (catIdx: number, itemIdx: number): string => {
    return `${getItemIcon(catIdx, itemIdx)}【${getItemName(catIdx, itemIdx)}】`;
  };

  // Populate absolute/anchor clues
  // First, specific positions
  for (let s = 0; s < N; s++) {
    for (let c = 0; c < C; c++) {
      const itemIdx = solution[s][c];
      if (s === 0) {
        cluePool.push(createClue(ClueType.AtFirst, { catA: c, itemA: itemIdx }, `${getItemStr(c, itemIdx)} 在最左邊的第一個位置。`));
      } else if (s === N - 1) {
        cluePool.push(createClue(ClueType.AtLast, { catA: c, itemA: itemIdx }, `${getItemStr(c, itemIdx)} 在最右邊的最後一個位置。`));
      } else if (s === Math.floor(N / 2)) {
        cluePool.push(createClue(ClueType.AtMiddle, { catA: c, itemA: itemIdx }, `${getItemStr(c, itemIdx)} 正好在最中間的位置。`));
      } else {
        cluePool.push(createClue(ClueType.SpecificPosition, { catA: c, itemA: itemIdx, pos: s }, `${getItemStr(c, itemIdx)} 在從左邊數來第 ${s + 1} 個位置。`));
      }
    }
  }

  // Odd/Even positions
  for (let s = 0; s < N; s++) {
    for (let c = 0; c < C; c++) {
      const itemIdx = solution[s][c];
      if ((s + 1) % 2 === 1) {
        cluePool.push(createClue(ClueType.OddPosition, { catA: c, itemA: itemIdx }, `${getItemStr(c, itemIdx)} 在奇數（單數）的位置。`));
      } else {
        cluePool.push(createClue(ClueType.EvenPosition, { catA: c, itemA: itemIdx }, `${getItemStr(c, itemIdx)} 在偶數（雙數）的位置。`));
      }
    }
  }

  // Generate pair-wise attributes
  for (let s = 0; s < N; s++) {
    for (let c1 = 0; c1 < C; c1++) {
      for (let c2 = c1 + 1; c2 < C; c2++) {
        const item1 = solution[s][c1];
        const item2 = solution[s][c2];
        cluePool.push(createClue(ClueType.Pair, { catA: c1, itemA: item1, catB: c2, itemB: item2 }, `${getItemStr(c1, item1)} 與 ${getItemStr(c2, item2)} 在一起。`));

        // Let's also add EXCLUDE clues (pick another random item from c2)
        const wrongS = (s + 1) % N;
        const wrongItem2 = solution[wrongS][c2];
        cluePool.push(createClue(ClueType.Exclude, { catA: c1, itemA: item1, catB: c2, itemB: wrongItem2 }, `${getItemStr(c1, item1)} 不是 ${getItemStr(c2, wrongItem2)}。`));
      }
    }
  }

  // Spatial alignment clues: LEFT_OF, RIGHT_OF, ADJACENT, DISTANCE_TWO, GREATER_THAN, LESS_THAN
  for (let s = 0; s < N; s++) {
    for (let c1 = 0; c1 < C; c1++) {
      for (let c2 = 0; c2 < C; c2++) {
        const item1 = solution[s][c1];
        
        // Immediate Neighbors
        if (s < N - 1) {
          const itemRight = solution[s + 1][c2];
          cluePool.push(createClue(
            ClueType.LeftOf,
            { catA: c1, itemA: item1, catB: c2, itemB: itemRight },
            `${getItemStr(c1, item1)} 正好在 ${getItemStr(c2, itemRight)} 的左邊。`
          ));
          cluePool.push(createClue(
            ClueType.Adjacent,
            { catA: c1, itemA: item1, catB: c2, itemB: itemRight },
            `${getItemStr(c1, item1)} 與 ${getItemStr(c2, itemRight)} 在隔壁。`
          ));
        }

        if (s > 0) {
          const itemLeft = solution[s - 1][c2];
          /*
          cluePool.push(createClue(
            ClueType.RightOf,
            { catA: c1, itemA: item1, catB: c2, itemB: itemLeft },
            `${getItemStr(c1, item1)} 正好在 ${getItemStr(c2, itemLeft)} 的/點右邊一格。` === `${getItemStr(c1, item1)} 正好在 ${getItemStr(c2, itemLeft)} 的右邊一格。` ? `${getItemStr(c1, item1)} 正好在 ${getItemStr(c2, itemLeft)} 的右邊一格。` : `${getItemStr(c1, item1)} 正好在 ${getItemStr(c2, itemLeft)} 的右邊一格。` ? `${getItemStr(c1, item1)} 正好在 ${getItemStr(c2, itemLeft)} 的右邊。` : `${getItemStr(c1, item1)} 正好在 ${getItemStr(c2, itemLeft)} 的右邊。`
          */
          cluePool.push(createClue(
            ClueType.RightOf,
            { catA: c1, itemA: item1, catB: c2, itemB: itemLeft },
            `${getItemStr(c1, item1)} 正好在 ${getItemStr(c2, itemLeft)} 的右邊。`
          ));
        }

        // Distance 2
        if (s < N - 2) {
          const itemTwoRight = solution[s + 2][c2];
          cluePool.push(createClue(
            ClueType.DistanceTwo,
            { catA: c1, itemA: item1, catB: c2, itemB: itemTwoRight },
            `${getItemStr(c1, item1)} 與 ${getItemStr(c2, itemTwoRight)} 中間隔著一個位置。`
          ));
        }

        // Non adjacent exclusions
        if (s < N - 2) {
          const itemFarRight = solution[s + 2][c2];
          cluePool.push(createClue(
            ClueType.NotAdjacent,
            { catA: c1, itemA: item1, catB: c2, itemB: itemFarRight },
            `${getItemStr(c1, item1)} 與 ${getItemStr(c2, itemFarRight)} 不在隔壁。`
          ));
        }

        // Less than/greater than
        if (s < N - 1) {
          // pick a random index > s
          const higherS = Math.floor(Math.random() * (N - 1 - s)) + s + 1;
          const itemFar = solution[higherS][c2];
          cluePool.push(createClue(
            ClueType.LessThan,
            { catA: c1, itemA: item1, catB: c2, itemB: itemFar },
            `${getItemStr(c1, item1)} 在 ${getItemStr(c2, itemFar)} 的左邊。`
          ));
          cluePool.push(createClue(
            ClueType.GreaterThan,
            { catA: c2, itemA: itemFar, catB: c1, itemB: item1 },
            `${getItemStr(c2, itemFar)} 在 ${getItemStr(c1, item1)} 的右邊。`
          ));
        }
      }
    }
  }

  // 4. Select clues from shuffled pool, check unique solution until exact unique is achieved.
  const shuffledPool = shuffleArray(cluePool);
  const selectedClues: Clue[] = [];

  // Anchor Strategy:
  // To keep generation deterministic and extremely fast, we always start by adding:
  // - 1-2 Direct Absolute placement if N is large (at first, at last, specific position).
  // - 2+ Pair/Attribute connections.
  // - Then add other relative clues.
  
  // Let's filter specific/first/last/middle first
  const anchors = shuffledPool.filter(cl => 
    cl.type === ClueType.AtFirst || 
    cl.type === ClueType.AtLast || 
    cl.type === ClueType.AtMiddle || 
    cl.type === ClueType.SpecificPosition
  );
  const pairs = shuffledPool.filter(cl => cl.type === ClueType.Pair);
  const spatial = shuffledPool.filter(cl => 
    cl.type !== ClueType.AtFirst && 
    cl.type !== ClueType.AtLast && 
    cl.type !== ClueType.AtMiddle && 
    cl.type !== ClueType.SpecificPosition &&
    cl.type !== ClueType.Pair
  );

  // Let's seed selected clues with a few anchor clues
  // More anchors for larger maps to speed up solving
  const numAnchorsWanted = N <= 5 ? 1 : N <= 8 ? 2 : 3;
  const numPairsWanted = N <= 5 ? 2 : N <= 8 ? 4 : 5;

  let anchorsAdded = 0;
  for (const anc of anchors) {
    if (anchorsAdded >= numAnchorsWanted) break;
    selectedClues.push(anc);
    anchorsAdded++;
  }

  let pairsAdded = 0;
  for (const pr of pairs) {
    if (pairsAdded >= numPairsWanted) break;
    // ensure we don't conflict, although they are all true
    selectedClues.push(pr);
    pairsAdded++;
  }

  // Merge remaining clues back
  const remainingClues = shuffledPool.filter(c => !selectedClues.includes(c));

  // Verify unique solution
  let res = countSolutions(selectedClues, N, C, 1500);

  // Keep adding clues until unique solution
  for (const c of remainingClues) {
    if (res.count === 1) break;

    selectedClues.push(c);
    res = countSolutions(selectedClues, N, C, 1500);
  }

  // If there are still multiple solutions (which can happen under extreme seeds), or if they are 0 (should never happen),
  // let's add direct PAIR/SPECIFIC clues until satisfied.
  if (res.count !== 1) {
    // Inject more specific pairing rules
    for (let c1 = 0; c1 < C; c1++) {
      for (let c2 = c1 + 1; c2 < C; c2++) {
        for (let s = 0; s < N; s++) {
          const item1 = solution[s][c1];
          const item2 = solution[s][c2];
          const text = `${getItemStr(c1, item1)} 恰好與 ${getItemStr(c2, item2)} 在同一個位置。`;
          const pr = createClue(ClueType.Pair, { catA: c1, itemA: item1, catB: c2, itemB: item2 }, text);
          if (!selectedClues.some(x => x.params.catA === c1 && x.params.itemA === item1 && x.params.catB === c2 && x.params.itemB === item2)) {
            selectedClues.push(pr);
            res = countSolutions(selectedClues, N, C, 1500);
            if (res.count === 1) break;
          }
        }
        if (res.count === 1) break;
      }
      if (res.count === 1) break;
    }
  }

  // 5. Minimalization pass:
  // Remove redundant clues back-to-front if they don't break uniqueness.
  // This makes the puzzle elegant and not overly cluttered with 40 clues!
  const minimalClues: Clue[] = [];
  for (const cl of selectedClues) {
    // Try solving without 'cl'
    const tempClues = selectedClues.filter(x => x.id !== cl.id);
    const testRes = countSolutions(tempClues, N, C, 1200);
    if (testRes.count === 1) {
      // It is redundant! We can remove it from selectedClues list
      const idx = selectedClues.findIndex(x => x.id === cl.id);
      if (idx !== -1) selectedClues.splice(idx, 1);
    }
  }

  return {
    id: `puzzle_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    difficulty,
    themeId,
    size: N,
    categories: puzzleCategories,
    clues: selectedClues,
    solution: solution
  };
}
