export enum Difficulty {
  Lv1 = 1,
  Lv2 = 2,
  Lv3 = 3,
  Lv4 = 4,
  Lv5 = 5,
  Lv6 = 6,
  Lv7 = 7,
  Lv8 = 8,
}

export interface Achievement {
  id: string; // e.g., 'complete_5'
  title: string;
  description: string;
  difficulty?: Difficulty;
  theme?: string;
  targetCount: number;
  currentCount: number;
  unlocked: boolean;
  unlockedAt?: string;
  goldReward: number;
}

export interface CollectionItem {
  id: string;
  category: 'badge' | 'character' | 'title' | 'avatar_frame' | 'illustration';
  name: string;
  description: string;
  unlocked: boolean;
  cost?: number; // can buy with coins
  image?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface PlayerStats {
  level: number;
  xp: number;
  coins: number;
  stamina: number;
  maxStamina: number;
  detectiveRank: string; // e.g. "新進偵探", "助理探員", "資深神探", "傳奇偵探"
  solvedCount: number;
  solvedByDifficulty: Record<Difficulty, number>;
  solvedByTheme: Record<string, number>;
  unstoppableStreak: number;
  lastLoginDate: string;
  dailyChallengeDoneDate?: string;
  hintsUsed: number;
  isDailyDoneToday: boolean;
}

export interface SoundState {
  soundEnabled: boolean;
}

export interface Clue {
  id: string;
  text: string;
  type: ClueType;
  params: Record<string, any>;
}

export enum ClueType {
  Pair = 'PAIR',                         // A is B (e.g., Alice has Red)
  Exclude = 'EXCLUDE',                   // A is not B (e.g., Bob does not have Blue)
  LeftOf = 'LEFT_OF',                    // A is immediately left of B
  RightOf = 'RIGHT_OF',                  // A is immediately right of B
  Adjacent = 'ADJACENT',                 // A and B are next to each other
  NotAdjacent = 'NOT_ADJACENT',           // A and B are not next to each other
  SpecificPosition = 'SPECIFIC_POSITION', // A is at slot index X (0-based)
  AtFirst = 'AT_FIRST',                  // A is at slot index 0
  AtLast = 'AT_LAST',                    // A is at slot index N-1
  AtMiddle = 'AT_MIDDLE',                // A is in the middle slot
  DistanceTwo = 'DISTANCE_TWO',          // Distance between A and B is exactly 2 slots
  EitherOrRightLeft = 'EITHER_OR_RL',    // A is either left of B or right of B (adjacent)
  EitherOrPosition = 'EITHER_OR_POS',    // A is either at position X or Y
  OddPosition = 'ODD_POSITION',          // A is at odd position (1, 3, ...)
  EvenPosition = 'EVEN_POSITION',        // A is at even position (0, 2, ...)
  GreaterThan = 'GREATER_THAN',          // A is at slot > B
  LessThan = 'LESS_THAN',                // A is at slot < B
  OneOfTwoExclude = 'ONE_OF_TWO_EXCLUDE',// A can be B or C, but is not D
  CategoryExclusion = 'CAT_EXCLUDE',     // A's item is not from set X
}

export interface ThemeConfig {
  id: string;
  name: string;
  icon: string;
  bgGradient: string;
  bannerEmoji: string;
  categories: {
    name: string;
    key: string;
    items: string[];
    icons?: string[]; // corresponding emoji/icons
  }[];
}

export interface Puzzle {
  id: string;
  difficulty: Difficulty;
  themeId: string;
  size: number; // N
  categories: {
    name: string;
    key: string;
    items: string[];
    icons: string[];
  }[];
  clues: Clue[];
  solution: number[][]; // [slot][category] mapping to itemIndex
}

export interface GameState {
  currentPuzzle: Puzzle | null;
  // Solution board representing player answers
  // answers[categoryIndex][slotIndex] = itemIndex (-1 for empty)
  answers: number[][];
  
  // Exclude matrix representing user drafts
  // key: `catA_itemA_catB_itemB` value: 0 for ?, 1 for X, 2 for O
  matrix: Record<string, number>;
  
  status: 'playing' | 'solved' | 'failed';
  hintsRemaining: number;
  elapsedTime: number; // seconds
  selectedCell: { rowIdx: number; colIdx: number } | null;
  selectedTool: 'pencil_x' | 'pencil_o' | 'eraser';
}

export interface GameModeState {
  mode: 'story' | 'endless' | 'daily' | 'timer' | 'master';
  currentChapter: number; // 1-12
  timerRemaining?: number; // for timer mode
}
