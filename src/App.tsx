import React, { useState, useEffect, useRef } from 'react';
import { Difficulty, PlayerStats, Puzzle, Achievement, CollectionItem, Clue, ClueType } from './types';
import { DETECTIVE_CHAPTERS, THEMES, ACHIEVEMENTS_TEMPLATES, INITIAL_COLLECTIONS, DETECTIVE_RANKS } from './data';
import { generatePuzzle, countSolutions, checkCluesConsistency } from './logic/puzzleGenerator';
import { TopBar } from './components/TopBar';
import { NotebookView } from './components/NotebookView';
import { MatrixView } from './components/MatrixView';
import { ClueList } from './components/ClueList';
import { StatsCollectionPanel } from './components/StatsCollectionPanel';
import { CaseStoryModal } from './components/CaseStoryModal';
import { LevelUpModal } from './components/LevelUpModal';
import { Walkthrough } from './components/Walkthrough';
import { AIIllustrator } from './components/AIIllustrator';
import { VictoryCelebrationModal } from './components/VictoryCelebrationModal';
import { LeaderboardView } from './components/LeaderboardView';
import { TeacherPortal } from './components/TeacherPortal';
import { dbService } from './logic/db';
import { 
  Trophy, BookOpen, Compass, Calendar, Timer, Award, Lightbulb, 
  HelpCircle, CheckSquare, Zap, Play, ChevronLeft, Volume2, VolumeX,
  RefreshCw, BadgeAlert, AlertCircle, ShoppingBag, LogOut, CheckCircle2
} from 'lucide-react';

/**
 * Web Audio API cute retro synthesizer for fully client-independent sound effects
 */
const playSynthSound = (type: 'tap' | 'match' | 'conflict' | 'solve' | 'levelup', enabled: boolean) => {
  if (!enabled) return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    switch (type) {
      case 'tap': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
        break;
      }
      case 'conflict': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
        break;
      }
      case 'match': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
        break;
      }
      case 'solve': {
        // Happy synth arpeggio
        const now = ctx.currentTime;
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4 chord
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.12, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.3);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.3);
        });
        break;
      }
      case 'levelup': {
        const now = ctx.currentTime;
        const melody = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50]; // Major scale up
        melody.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);
          gain.gain.setValueAtTime(0.15, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.4);
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.4);
        });
        break;
      }
    }
  } catch (err) {
    console.error('Audio engine failed to trigger sound:', err);
  }
};

export default function App() {
  // -----------------------------------------
  // 1. GENERAL PLAYER & SYSTEM STATES
  // -----------------------------------------
  const [stats, setStats] = useState<PlayerStats & { name?: string; studentClass?: string; studentNo?: string }>({
    level: 1,
    xp: 0,
    coins: 300,
    stamina: 5,
    maxStamina: 5,
    detectiveRank: '實習偵探',
    solvedCount: 0,
    solvedByDifficulty: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 },
    solvedByTheme: {},
    unstoppableStreak: 0,
    lastLoginDate: new Date().toDateString(),
    isDailyDoneToday: false,
    hintsUsed: 0,
    name: '',
    studentClass: '',
    studentNo: ''
  });

  const [studentProfile, setStudentProfile] = useState<{
    name: string;
    studentClass: string;
    studentNo: string;
    initialized: boolean;
  }>(() => {
    const saved = localStorage.getItem('detective_student_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name && parsed.studentClass) {
          return {
            name: parsed.name,
            studentClass: parsed.studentClass,
            studentNo: parsed.studentNo || '01',
            initialized: true
          };
        }
      } catch (e) {}
    }
    return { name: '', studentClass: '', studentNo: '', initialized: false };
  });

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active game mode navigation (7 requested elements)
  const [activeMenuTab, setActiveMenuTab] = useState<'adventure' | 'daily' | 'leaderboard' | 'gallery' | 'achievements' | 'teacher' | 'settings'>('adventure');
  const [adventureSubTab, setAdventureSubTab] = useState<'story' | 'endless' | 'teacher_puzzles'>('story');
  const [walkthroughCompleted, setWalkthroughCompleted] = useState<boolean | null>(null);

  // Story state
  const [storyOpenChapter, setStoryOpenChapter] = useState<any | null>(null);

  // Level Up Modal trigger
  const [levelUpTrigger, setLevelUpTrigger] = useState<{ level: number; rank: string } | null>(null);

  // Victory Celebration Modal trigger
  const [victoryModalData, setVictoryModalData] = useState<{
    elapsedTime: number;
    difficulty: number;
    difficultyName: string;
    earnedCoins: number;
    earnedXp: number;
  } | null>(null);

  // -----------------------------------------
  // 2. ACTIVE BOARD GAMEPLAY STATES
  // -----------------------------------------
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  const [answers, setAnswers] = useState<number[][]>([]); // [categoryIdx][slotIdx] -> itemIndex (-1 unassigned)
  const [matrix, setMatrix] = useState<Record<string, number>>({}); // pairwise cross-out draft
  const [markedClues, setMarkedClues] = useState<Record<string, boolean>>({}); // crossed out clues
  const [elapsedTime, setElapsedTime] = useState(0); // seconds timer
  const [errorsCount, setErrorsCount] = useState(0); // track mistakes during current case
  const [isTimerSolving, setIsTimerSolving] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState<number | null>(null); // for time limit mode
  const [activeBoardTab, setActiveBoardTab] = useState<'notebook' | 'matrix'>('notebook');
  const [abandonConfirmOpen, setAbandonConfirmOpen] = useState(false);

  // Hint helpers state
  const [hintOpen, setHintOpen] = useState(false);
  const [lastUsedHintType, setLastUsedHintType] = useState<string | null>(null);
  const [revealedHintText, setRevealedHintText] = useState<string | null>(null);
  const [highlightedClueId, setHighlightedClueId] = useState<string | null>(null);

  // Config for endless challenge creation
  const [endlessDiffSelection, setEndlessDiffSelection] = useState<Difficulty>(Difficulty.Lv1);
  const [endlessThemeSelection, setEndlessThemeSelection] = useState<string>('campus');
  const [hasStartedTimerMode, setHasStartedTimerMode] = useState(false);

  // Time ticker references
  const timerIntervalRef = useRef<any>(null);

  // -----------------------------------------
  // 3. PERSISTENCE INDEX (LOCAL STORAGE)
  // -----------------------------------------
  useEffect(() => {
    // Load state
    const loadedProfile = dbService.getOrCreateStats();
    setStats(loadedProfile);

    const savedAchievements = localStorage.getItem('detective_achievements');
    const savedCollections = localStorage.getItem('detective_collections');
    const savedSound = localStorage.getItem('detective_sound_enabled');

    if (savedAchievements) {
      try {
        const loaded: Achievement[] = JSON.parse(savedAchievements);
        // Sync any missing templates in case of template updates
        const merged = ACHIEVEMENTS_TEMPLATES.map(tmpl => {
          const match = loaded.find(x => x.id === tmpl.id);
          return match ? { ...tmpl, currentCount: match.currentCount, unlocked: match.unlocked, unlockedAt: match.unlockedAt } : { ...tmpl, currentCount: 0, unlocked: false };
        });
        setAchievements(merged);
      } catch (e) {
        setAchievements(ACHIEVEMENTS_TEMPLATES.map(a => ({ ...a, currentCount: 0, unlocked: false })));
      }
    } else {
      setAchievements(ACHIEVEMENTS_TEMPLATES.map(a => ({ ...a, currentCount: 0, unlocked: false })));
    }

    if (savedCollections) {
      try {
        setCollections(JSON.parse(savedCollections));
      } catch (e) {
        setCollections(INITIAL_COLLECTIONS);
      }
    } else {
      setCollections(INITIAL_COLLECTIONS);
    }

    if (savedSound !== null) {
      setSoundEnabled(savedSound === 'true');
    }

    const savedWalkthrough = localStorage.getItem('detective_walkthrough_completed');
    setWalkthroughCompleted(savedWalkthrough === 'true');
  }, []);

  // Save stats helper
  const saveGameState = (
    updatedStats: PlayerStats & { name?: string; studentClass?: string; studentNo?: string },
    updatedAchievements: Achievement[],
    updatedCollections: CollectionItem[]
  ) => {
    const profile = dbService.getOrCreateStats();
    const finalStats = {
      ...updatedStats,
      name: updatedStats.name || profile.name || '小推理家',
      studentClass: updatedStats.studentClass || profile.studentClass || '3年甲班',
      studentNo: updatedStats.studentNo || profile.studentNo || '01'
    };
    dbService.saveStats(finalStats);
    localStorage.setItem('detective_achievements', JSON.stringify(updatedAchievements));
    localStorage.setItem('detective_collections', JSON.stringify(updatedCollections));
  };

  const handleCompleteWalkthrough = (coinsAwarded: number) => {
    const updatedStats = {
      ...stats,
      coins: stats.coins + coinsAwarded
    };
    setStats(updatedStats);
    setWalkthroughCompleted(true);
    localStorage.setItem('detective_walkthrough_completed', 'true');
    saveGameState(updatedStats, achievements, collections);
  };

  // -----------------------------------------
  // 4. CHRONO & TIMERS ticker
  // -----------------------------------------
  useEffect(() => {
    if (currentPuzzle) {
      setIsTimerSolving(true);
      timerIntervalRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
        if (timerRemaining !== null) {
          setTimerRemaining(prev => {
            if (prev === null) return null;
            if (prev <= 1) {
              clearInterval(timerIntervalRef.current);
              handleTimerDefeat();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      setIsTimerSolving(false);
      clearInterval(timerIntervalRef.current);
    }

    return () => clearInterval(timerIntervalRef.current);
  }, [currentPuzzle, timerRemaining]);

  const handleTimerDefeat = () => {
    playSynthSound('conflict', soundEnabled);
    alert('⏱️ 時間到了！案件調查超載，線索毀損，請重新準備再來勘查。');
    exitActivePuzzle(false);
  };

  // -----------------------------------------
  // 5. HELPER ACTION: AUTO CHECK ENGINE FOR INTERACTIVE CONFLICT DETECTOR
  // -----------------------------------------
  // Map standard player answers [catIdx][slotIdx] into a structured grid [slot][cat]
  const getPlayerGridRepresentation = (): number[][] => {
    if (!currentPuzzle) return [];
    const N = currentPuzzle.size;
    const C = currentPuzzle.categories.length;
    const grid: number[][] = Array.from({ length: N }, () => Array(C).fill(-1));

    for (let c = 0; c < C; c++) {
      for (let s = 0; s < N; s++) {
        grid[s][c] = answers[c][s];
      }
    }
    return grid;
  };

  // Run solver checks on each clue and compile conflict list
  const runAutoCheckConflictEngine = () => {
    if (!currentPuzzle) return { conflicts: [], conflictingCells: [] };

    const playerGrid = getPlayerGridRepresentation();
    const conflicts: string[] = [];
    const conflictingCells: { catIdx: number; slotIdx: number }[] = [];

    for (const clue of currentPuzzle.clues) {
      if (!checkCluesConsistency(playerGrid, [clue], currentPuzzle.categories.length)) {
        conflicts.push(clue.text);

        // Map related attributes to cells to highlight their positions
        const { catA, itemA, catB, itemB } = clue.params;
        if (catA !== undefined) {
          for (let s = 0; s < currentPuzzle.size; s++) {
            if (answers[catA][s] === itemA) {
              conflictingCells.push({ catIdx: catA, slotIdx: s });
            }
          }
        }
        if (catB !== undefined) {
          for (let s = 0; s < currentPuzzle.size; s++) {
            if (answers[catB][s] === itemB) {
              conflictingCells.push({ catIdx: catB, slotIdx: s });
            }
          }
        }
      }
    }

    return {
      conflicts,
      conflictingCells
    };
  };

  const { conflicts: activeConflicts, conflictingCells: activeConflictingCells } = runAutoCheckConflictEngine();

  // -----------------------------------------
  // 6. GAMEPLAY CONTROLLER FUNCTIONS
  // -----------------------------------------
  const startNewPuzzle = (diff: Difficulty, themeId: string, isFromStory = false, chapterConfig?: any) => {
    // 0. Deduct Stamina (Require at least 1 stamina, unless they replenish)
    if (stats.stamina <= 0) {
      playSynthSound('conflict', soundEnabled);
      alert('⚡ 體力不足！請點擊體力標記領取免費贈送的神探能量。');
      return;
    }

    playSynthSound('tap', soundEnabled);

    // Generate puzzle
    const puzzle = generatePuzzle(diff, themeId);
    
    // Setup answers matrix
    const numCats = puzzle.categories.length;
    const size = puzzle.size;
    const answersGrid = Array.from({ length: numCats }, () => Array(size).fill(-1));

    // Lock Category 0 default items s in slot s directly to simplify play
    for (let s = 0; s < size; s++) {
      answersGrid[0][s] = s;
    }

    setStats(prev => {
      const next = { ...prev, stamina: prev.stamina - 1 };
      saveGameState(next, achievements, collections);
      return next;
    });

    setCurrentPuzzle(puzzle);
    setAnswers(answersGrid);
    setMatrix({});
    setMarkedClues({});
    setElapsedTime(0);
    setErrorsCount(0);
    setRevealedHintText(null);
    setHighlightedClueId(null);
    setLastUsedHintType(null);
    setActiveBoardTab('notebook');

    if (chapterConfig?.chapter) {
      setHasStartedTimerMode(false);
      setTimerRemaining(null);
    } else if (hasStartedTimerMode) {
      // 120 seconds countdown
      setTimerRemaining(120);
    } else {
      setTimerRemaining(null);
    }

    // Dismiss Story opening modal if active
    setStoryOpenChapter(null);
  };

  // Exit active screen
  const exitActivePuzzle = (confirmFirst = true) => {
    if (confirmFirst) {
      setAbandonConfirmOpen(true);
      return;
    }
    playSynthSound('tap', soundEnabled);
    setCurrentPuzzle(null);
    setTimerRemaining(null);
    setHasStartedTimerMode(false);
    setAbandonConfirmOpen(false);
  };

  // Handle player assignment action
  const handleAssignCell = (catIdx: number, slotIdx: number, itemIdx: number) => {
    playSynthSound('tap', soundEnabled);
    setAnswers(prev => {
      const copy = prev.map(row => [...row]);
      copy[catIdx][slotIdx] = itemIdx;
      return copy;
    });
  };

  // Handle matrix draft cross-out toggling
  const handleToggleMatrixCell = (
    catAIdx: number,
    itemAIdx: number,
    catBIdx: number,
    itemBIdx: number,
    forceState?: number
  ) => {
    playSynthSound('tap', soundEnabled);
    const key = `${catAIdx}_${itemAIdx}_${catBIdx}_${itemBIdx}`;
    setMatrix(prev => {
      const current = prev[key] || 0;
      let nextState = (current + 1) % 3; // Cycle: 0 (?, unselected) -> 1 (✖, exclude) -> 2 (✔, match)
      if (forceState !== undefined) {
        nextState = forceState;
      }
      return {
        ...prev,
        [key]: nextState
      };
    });
  };

  const handleClearMatrixDrafts = () => {
    playSynthSound('tap', soundEnabled);
    setMatrix({});
  };

  const handleToggleMarkClue = (clueId: string) => {
    playSynthSound('tap', soundEnabled);
    setMarkedClues(prev => ({
      ...prev,
      [clueId]: !prev[clueId]
    }));
  };

  // -----------------------------------------
  // 7. SUBMIT INVESTIGATION AND SOLVE CHECKER
  // -----------------------------------------
  const handleSubmitCase = () => {
    if (!currentPuzzle) return;

    // 1. Verify if everything is filled
    const isReady = answers.every(row => row.every(val => val !== -1));
    if (!isReady) {
      playSynthSound('conflict', soundEnabled);
      alert('🕵️‍♂️ 調查尚未完成！筆記本中仍有未指派的案件疑點空白格，請填滿。');
      return;
    }

    // 2. Perform comparison against ground-truth solutions
    let correctCount = 0;
    const size = currentPuzzle.size;
    const numCats = currentPuzzle.categories.length;

    for (let s = 0; s < size; s++) {
      for (let c = 0; c < numCats; c++) {
        if (answers[c][s] === currentPuzzle.solution[s][c]) {
          correctCount++;
        }
      }
    }

    const totalCells = size * numCats;

    if (correctCount === totalCells) {
      // VICTORY!
      handleVictoryResolution();
    } else {
      // DEFEAT / CONFLICT
      setErrorsCount(prev => prev + 1);
      playSynthSound('conflict', soundEnabled);
      alert(`❌ 指控失敗！你的推論與現場狀況不符。請翻閱線索或使用「求助名偵探」功能找出錯漏之處！`);
    }
  };

  const handleVictoryResolution = () => {
    if (!currentPuzzle) return;

    playSynthSound('solve', soundEnabled);

    // Evaluate Case Rewards
    // If endless, reward matches difficulty level scale
    let earnedGold = currentPuzzle.difficulty * 35;
    let earnedXp = currentPuzzle.difficulty * 50;

    // Is it a story chapter?
    const storyChapter = DETECTIVE_CHAPTERS.find(ch => ch.themeId === currentPuzzle.themeId && ch.targetDifficulty === currentPuzzle.difficulty);
    if (storyChapter) {
      earnedGold = storyChapter.rewardGold;
      earnedXp = storyChapter.rewardXp;
    }

    if (timerRemaining !== null) {
      // Bonus bounty for Time trial!
      earnedGold += 100;
      earnedXp += 50;
    }

    // Increment player statistics
    const prevLevel = stats.level;
    let nextXp = stats.xp + earnedXp;
    let nextCoins = stats.coins + earnedGold;
    let nextLevel = prevLevel;

    // Check level-up formula
    let xpNeeded = nextLevel * 150;
    while (nextXp >= xpNeeded) {
      nextXp -= xpNeeded;
      nextLevel += 1;
      nextCoins += 250; // Level up bonus!
      xpNeeded = nextLevel * 150;
    }

    const nextRankIndex = Math.min(
      DETECTIVE_RANKS.length - 1,
      Math.max(0, DETECTIVE_RANKS.filter(r => nextXp >= r.xpNeeded).length - 1)
    );
    const nextRank = DETECTIVE_RANKS[nextRankIndex].title;

    // Update difficulty solved tracking counts
    const updatedSolvedDiff = { ...stats.solvedByDifficulty };
    updatedSolvedDiff[currentPuzzle.difficulty] = (updatedSolvedDiff[currentPuzzle.difficulty] || 0) + 1;

    // Update theme solved tracking counts
    const updatedSolvedTheme = { ...stats.solvedByTheme };
    updatedSolvedTheme[currentPuzzle.themeId] = (updatedSolvedTheme[currentPuzzle.themeId] || 0) + 1;

    let isHintFreeMatch = Object.keys(revealedHintText || {}).length === 0 && stats.hintsUsed === 0;

    // Update achievements tracker counters to unlock any matches!
    const updatedStats: PlayerStats = {
      ...stats,
      level: nextLevel,
      xp: nextXp,
      coins: nextCoins,
      stamina: Math.min(stats.maxStamina, stats.stamina + 1), // refund 1 stamina on victory!
      detectiveRank: nextRank,
      solvedCount: stats.solvedCount + 1,
      solvedByDifficulty: updatedSolvedDiff,
      solvedByTheme: updatedSolvedTheme,
      unstoppableStreak: stats.unstoppableStreak + 1,
      isDailyDoneToday: activeMenuTab === 'daily' ? true : stats.isDailyDoneToday
    };

    // Process the 100 achievements conditions
    const updatedAchievements = achievements.map(ach => {
      if (ach.unlocked) return ach; // already achieved

      let progress = ach.currentCount;

      // 1. Progress count
      if (ach.id === 'solve_1') progress = updatedStats.solvedCount;
      if (ach.id === 'solve_10') progress = updatedStats.solvedCount;
      if (ach.id === 'solve_50') progress = updatedStats.solvedCount;
      if (ach.id === 'solve_100') progress = updatedStats.solvedCount;
      if (ach.id === 'solve_500') progress = updatedStats.solvedCount;

      // 2. Story chapters solving markers based on levels solved
      if (ach.id === 'story_ch1' && storyChapter?.chapter === 1) progress = 1;
      if (ach.id === 'story_ch2' && storyChapter?.chapter === 2) progress = 1;
      if (ach.id === 'story_ch3' && storyChapter?.chapter === 3) progress = 1;
      if (ach.id === 'story_ch4' && storyChapter?.chapter === 4) progress = 1;
      if (ach.id === 'story_ch5' && storyChapter?.chapter === 5) progress = 1;
      if (ach.id === 'story_ch6' && storyChapter?.chapter === 6) progress = 1;
      if (ach.id === 'story_ch7' && storyChapter?.chapter === 7) progress = 1;
      if (ach.id === 'story_ch8' && storyChapter?.chapter === 8) progress = 1;
      if (ach.id === 'story_ch9' && storyChapter?.chapter === 9) progress = 1;
      if (ach.id === 'story_ch10' && storyChapter?.chapter === 10) progress = 1;
      if (ach.id === 'story_ch11' && storyChapter?.chapter === 11) progress = 1;
      if (ach.id === 'story_ch12' && storyChapter?.chapter === 12) progress = 1;

      // 3. Difficulty levels
      if (ach.id === 'diff_lv1') progress = updatedSolvedDiff[1] || 0;
      if (ach.id === 'diff_lv2') progress = updatedSolvedDiff[2] || 0;
      if (ach.id === 'diff_lv3') progress = updatedSolvedDiff[3] || 0;
      if (ach.id === 'diff_lv4') progress = updatedSolvedDiff[4] || 0;
      if (ach.id === 'diff_lv5') progress = updatedSolvedDiff[5] || 0;
      if (ach.id === 'diff_lv6') progress = updatedSolvedDiff[6] || 0;
      if (ach.id === 'diff_lv7') progress = updatedSolvedDiff[7] || 0;
      if (ach.id === 'diff_lv8') progress = updatedSolvedDiff[8] || 0;

      // 4. Special skills
      if (ach.id === 'no_hint_10' && isHintFreeMatch) progress += 1;
      if (ach.id === 'gold_1000') progress = updatedStats.coins;
      if (ach.id === 'gold_5000') progress = updatedStats.coins;
      if (ach.id === 'gold_20000') progress = updatedStats.coins;
      if (ach.id === 'level_5') progress = updatedStats.level;
      if (ach.id === 'level_15') progress = updatedStats.level;
      if (ach.id === 'level_30') progress = updatedStats.level;

      // 5. Daily
      if (ach.id === 'daily_5' && activeMenuTab === 'daily') progress += 1;
      if (ach.id === 'daily_20' && activeMenuTab === 'daily') progress += 1;

      // 6. Streaks
      if (ach.id === 'streak_3') progress = updatedStats.unstoppableStreak;
      if (ach.id === 'streak_10') progress = updatedStats.unstoppableStreak;

      // 7. Themes
      if (ach.id.startsWith('theme_')) {
        const tId = ach.id.replace('theme_', '');
        progress = updatedSolvedTheme[tId] || 0;
      }

      const unlocked = progress >= ach.targetCount;

      return {
        ...ach,
        currentCount: progress,
        unlocked: unlocked,
        unlockedAt: unlocked ? new Date().toLocaleString() : undefined
      };
    });

    // Save
    saveGameState(updatedStats, updatedAchievements, collections);

    const getDifficultyLabelTradChinese = (diff: number): string => {
      switch(diff) {
        case 1: return 'Lv1 基礎 (4x4)';
        case 2: return 'Lv2 簡單 (5x3)';
        case 3: return 'Lv3 普通 (6x3)';
        case 4: return 'Lv4 困難 (7x4)';
        case 5: return 'Lv5 專家 (8x4)';
        case 6: return 'Lv6 大師 (9x4)';
        case 7: return 'Lv7 傳奇 (10x4)';
        case 8: return 'Lv8 非常困難 (12x5)';
        default: return `Lv${diff}`;
      }
    };

    // Commit score entry to local / cloud SQL ranking registry
    const isDaily = activeMenuTab === 'daily';
    dbService.submitScore({
      playerName: studentProfile.name || '小推理家',
      studentClass: studentProfile.studentClass || '3年甲班',
      studentNo: studentProfile.studentNo || '01',
      puzzleName: isDaily 
        ? '每日思維日課' 
        : storyChapter 
        ? `主線冒險: ${storyChapter.title}` 
        : `自由推理解密: ${getDifficultyLabelTradChinese(currentPuzzle.difficulty)}`,
      timeSeconds: elapsedTime,
      errorsCount: errorsCount,
      hintsCount: stats.hintsUsed,
      totalScore: Math.max(200, 1000 - Math.floor(elapsedTime / 2) - errorsCount * 120 - stats.hintsUsed * 60)
    }).catch(console.error);

    // Set States
    setStats(updatedStats);
    setAchievements(updatedAchievements);

    // Trigger promotion check dialog trigger
    if (nextLevel > prevLevel) {
      setLevelUpTrigger({ level: nextLevel, rank: nextRank });
    }

    setVictoryModalData({
      elapsedTime,
      difficulty: currentPuzzle.difficulty,
      difficultyName: getDifficultyLabelTradChinese(currentPuzzle.difficulty),
      earnedCoins: earnedGold,
      earnedXp: earnedXp
    });
  };

  const handleCloseVictoryModalClaimRewards = () => {
    setVictoryModalData(null);
    setCurrentPuzzle(null);
    setTimerRemaining(null);
    setHasStartedTimerMode(false);
  };

  // -----------------------------------------
  // 8. ACCURATE HINT SYSTEM HANDLERS
  // -----------------------------------------
  /**
   * Hint Levels:
   * 1. 指出錯誤格: Check player answers and pick one incorrect cell. Highlight it.
   * 2. 提供相關線索: Find one of the puzzle clues connected with uncompleted attributes.
   * 3. 顯示正確答案位置: Correctly place one cell directly in player solutions!
   */
  const handleRequestDetectiveHint = (level: number) => {
    if (!currentPuzzle) return;

    // Deduct 50 coins if hints are premium and player needs to buy
    if (stats.coins < 30) {
      alert('💰 金幣不足，求助探長需要花費 30 金幣來購置名偵探放大鏡！你可以先解答主線關卡來換取酬勞。');
      return;
    }

    playSynthSound('tap', soundEnabled);
    setRevealedHintText(null);
    setHighlightedClueId(null);

    const size = currentPuzzle.size;
    const numCats = currentPuzzle.categories.length;

    // Hint Level 1: 指出錯誤格
    if (level === 1) {
      let wrongCell: { catIdx: number; slotIdx: number } | null = null;
      for (let s = 0; s < size; s++) {
        for (let c = 1; c < numCats; c++) {
          if (answers[c][s] !== -1 && answers[c][s] !== currentPuzzle.solution[s][c]) {
            wrongCell = { catIdx: c, slotIdx: s };
            break;
          }
        }
        if (wrongCell) break;
      }

      if (wrongCell) {
        const catName = currentPuzzle.categories[wrongCell.catIdx].name;
        setRevealedHintText(`💡 【探長回傳微光】：你把位置 #${wrongCell.slotIdx + 1} 的「${catName} 屬性值」猜錯囉！再看一看。`);
      } else {
        setRevealedHintText('💡 【探長讚賞】：你目前指派的填寫項目全都沒錯！請繼續努力。');
      }
      setLastUsedHintType('lvl1');
    }

    // Hint Level 2: 提供相關線索 (Highlight an active clue)
    else if (level === 2) {
      // Pick a random clue that player hasn't marked as crossed out yet
      const activeClues = currentPuzzle.clues.filter(c => !markedClues[c.id]);
      if (activeClues.length > 0) {
        const picked = activeClues[Math.floor(Math.random() * activeClues.length)];
        setHighlightedClueId(picked.id);
        setRevealedHintText(`💡 【探長畫紅色高亮線】：多注意這條線索【${picked.text}】`);
      } else {
        const picked = currentPuzzle.clues[Math.floor(Math.random() * currentPuzzle.clues.length)];
        setHighlightedClueId(picked.id);
        setRevealedHintText(`💡 【探長高亮線】：多注意這條關鍵證言【${picked.text}】`);
      }
      setLastUsedHintType('lvl2');
    }

    // Hint Level 3: 顯示正確答案
    else if (level === 3) {
      let candidateCell: { catIdx: number; slotIdx: number } | null = null;
      for (let s = 0; s < size; s++) {
        for (let c = 1; c < numCats; c++) {
          if (answers[c][s] === -1 || answers[c][s] !== currentPuzzle.solution[s][c]) {
            candidateCell = { catIdx: c, slotIdx: s };
            break;
          }
        }
        if (candidateCell) break;
      }

      if (candidateCell) {
        const correctVal = currentPuzzle.solution[candidateCell.slotIdx][candidateCell.catIdx];
        const correctItem = currentPuzzle.categories[candidateCell.catIdx].items[correctVal];
        const correctIcon = currentPuzzle.categories[candidateCell.catIdx].icons[correctVal];
        const catName = currentPuzzle.categories[candidateCell.catIdx].name;

        // Auto fill it!
        handleAssignCell(candidateCell.catIdx, candidateCell.slotIdx, correctVal);
        setRevealedHintText(`💡 【探長直接解答！】：位置 #${candidateCell.slotIdx + 1} 的雙向配對「${catName}」正是 ${correctIcon} 【${correctItem}】！已幫你登錄在探案本中。`);
      } else {
        setRevealedHintText('💡 【探長讚賞】：格子已經全部完全正確！直接點擊右下角「送交結案」提審吧。');
      }
      setLastUsedHintType('lvl3');
    }

    // Deduct Coins
    setStats(prev => {
      const next = { 
        ...prev, 
        coins: prev.coins - 30,
        hintsUsed: prev.hintsUsed + 1
      };
      saveGameState(next, achievements, collections);
      return next;
    });

    setHintOpen(true);
  };

  // -----------------------------------------
  // 9. RECOVERY SEAMLESS: STAMINA + COIN COLLECTION HACKS
  // -----------------------------------------
  const handleReplenishStaminaFree = () => {
    playSynthSound('match', soundEnabled);
    setStats(prev => {
      const next = { ...prev, stamina: prev.maxStamina };
      saveGameState(next, achievements, collections);
      return next;
    });
    alert('⚡ 【神探福利】：體力飲料滿額補充！偵查能量已成功為你斟滿。');
  };

  const handleClaimAchievementReward = (achId: string) => {
    const target = achievements.find(x => x.id === achId);
    if (!target || target.unlocked) return;

    playSynthSound('solve', soundEnabled);

    const updatedAchievements = achievements.map(a => {
      if (a.id === achId) return { ...a, unlocked: true };
      return a;
    });

    const updatedStats = {
      ...stats,
      coins: stats.coins + target.goldReward
    };

    setStats(updatedStats);
    setAchievements(updatedAchievements);
    saveGameState(updatedStats, updatedAchievements, collections);
    alert(`💰 領取成功！神探金幣 +${target.goldReward} 枚！已匯入金庫。`);
  };

  const handleBuyCollectionItem = (itemId: string) => {
    const target = collections.find(x => x.id === itemId);
    if (!target || target.unlocked || stats.coins < (target.cost || 0)) return;

    playSynthSound('tap', soundEnabled);

    const updatedCollections = collections.map(c => {
      if (c.id === itemId) return { ...c, unlocked: true };
      return c;
    });

    const updatedStats = {
      ...stats,
      coins: stats.coins - (target.cost || 0)
    };

    setStats(updatedStats);
    setCollections(updatedCollections);
    saveGameState(updatedStats, achievements, updatedCollections);
    alert(`🛍️ 購置成功！「${target.name}」已成功解鎖至你的收藏庫，隨身彰顯你的邏輯榮耀！`);
  };

  // -----------------------------------------
  // 10. DAILY CHALLENGE SEED DETERMINER
  // -----------------------------------------
  const handleStartDailyChallenge = () => {
    if (stats.isDailyDoneToday) {
      alert('📆 今天你已經成功偵破「每日特件」囉！明天一早將解鎖全新的一題，你可以先探索「主線劇情」或「自由推理解密」。');
      return;
    }
    // Generate Medium difficulty daily challenges
    startNewPuzzle(Difficulty.Lv3, 'jobs');
    setActiveMenuTab('daily');
  };

  if (walkthroughCompleted === null) {
    return (
      <div className="min-h-screen bg-[#FFF8E7] flex flex-col items-center justify-center font-sans">
        <div className="text-4xl animate-bounce mb-3 col-span-3">🕵️‍♂️</div>
        <p className="font-black text-slate-700 text-sm">正在載入手記檔案中...</p>
      </div>
    );
  }

  if (walkthroughCompleted === false) {
    return (
      <Walkthrough
        soundEnabled={soundEnabled}
        onSoundToggle={() => {
          setSoundEnabled(!soundEnabled);
          localStorage.setItem('detective_sound_enabled', String(!soundEnabled));
        }}
        onComplete={handleCompleteWalkthrough}
      />
    );
  }

  if (!studentProfile.initialized) {
    return (
      <div className="min-h-screen bg-[#F5EBE0] flex items-center justify-center p-4 font-sans select-none relative overflow-hidden">
        {/* Paper clips / background doodles */}
        <div className="absolute top-12 left-12 text-6xl animate-pulse opacity-15">📚</div>
        <div className="absolute bottom-20 right-20 text-6xl animate-pulse opacity-20 col-span-2">🖍️</div>

        <div className="bg-[#FFFBF0] border-4 border-slate-900 rounded-[36px] p-6 sm:p-8 max-w-sm w-full shadow-[8px_8px_0px_rgba(15,23,42,1)] relative animate-scale-up">
          {/* Tape */}
          <div className="absolute top-[-15px] left-1/3 -rotate-2 bg-[#FFF066] border border-dashed border-amber-500 px-6 py-1 text-xs text-amber-950 font-black shadow select-none">
            🎒 探員入學登記 🎒
          </div>

          <div className="text-center mt-3 mb-6">
            <h2 className="font-extrabold text-2xl text-slate-900 flex items-center justify-center gap-1.5">
              <span>丸子老師思維數學學堂</span>
            </h2>
            <p className="text-slate-500 font-bold text-xs mt-1.5 leading-normal">
              歡迎來到思考推理冒險！請先建立小探員個人檔案，以保存你的金幣、勳章進度與挑戰排行喔！
            </p>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            const nameInput = (e.currentTarget.elements.namedItem('studentName') as HTMLInputElement).value.trim();
            const classInput = (e.currentTarget.elements.namedItem('studentClass') as HTMLSelectElement).value;
            const noInput = (e.currentTarget.elements.namedItem('studentNo') as HTMLInputElement).value.trim();

            if (!nameInput) {
              alert('請填寫學生姓名！');
              return;
            }

            const initialProfile = {
              name: nameInput,
              studentClass: classInput,
              studentNo: noInput.padStart(2, '0') || '01',
              initialized: true
            };

            // Save inside player profile
            localStorage.setItem('detective_student_profile', JSON.stringify(initialProfile));
            
            // Re-fetch correct stats linked with this student
            const activeStats = dbService.getOrCreateStats(nameInput, classInput, noInput.padStart(2, '0'));
            setStats(activeStats);
            setStudentProfile(initialProfile);
            playSynthSound('solve', soundEnabled);
          }} className="flex flex-col gap-4">
            
            <div>
              <label className="text-xs font-black text-slate-700 block mb-1">✍️ 探員大名 (姓名)：</label>
              <input
                type="text"
                name="studentName"
                maxLength={8}
                required
                placeholder="請輸入姓名"
                className="w-full bg-white border-3 border-slate-900 rounded-xl py-2 px-4 font-black text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">👥 班級分類：</label>
                <select
                  name="studentClass"
                  className="w-full bg-white border-3 border-slate-900 rounded-xl p-2.5 font-black text-xs text-slate-800 focus:outline-none"
                >
                  <option value="3年甲班">3年甲班</option>
                  <option value="3年乙班">3年乙班</option>
                  <option value="4年甲班">4年甲班</option>
                  <option value="4年乙班">4年乙班</option>
                  <option value="5年甲班">5年甲班</option>
                  <option value="5年乙班">5年乙班</option>
                  <option value="6年甲班">6年甲班</option>
                  <option value="6年乙班">6年乙班</option>
                  <option value="數位資優班">數位資優班</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">🔢 課堂座號：</label>
                <input
                  type="number"
                  name="studentNo"
                  min="1"
                  max="45"
                  required
                  placeholder="01"
                  className="w-full bg-white border-3 border-slate-900 rounded-xl py-2 px-3 font-black text-xs text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-3 w-full bg-[#6BCB77] hover:bg-emerald-500 border-4 border-slate-950 text-slate-950 font-black py-3 rounded-2xl cursor-pointer text-xs shadow-[3px_3px_0px_rgba(15,23,42,1)] hover:scale-105 active:translate-y-0.5"
            >
              啟航！展開推理大冒險 🚀
            </button>

          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 pb-16 antialiased">
      
      {/* Visual background decor gradient */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-indigo-150/40 to-transparent pointer-events-none -z-10" />

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 pt-6 flex flex-col gap-6">
        
        {/* Top bar header HUD panel */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center bg-slate-900 text-white rounded-2xl px-5 py-3 border-b-4 border-slate-950 shadow">
            <h1 className="font-extrabold text-lg flex items-center gap-2">
              <span className="text-xl">👩‍🏫</span> 
              <span className="tracking-tight">丸子老師的數學實驗室：素養推理冒險</span>
              <span className="text-[10px] bg-[#FFD93D] text-slate-900 py-0.5 px-2.5 rounded-full font-black ml-1 select-none font-mono">
                MARUKO MATH'S LAB v1.5
              </span>
            </h1>

            {/* Sound button */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                playSynthSound('tap', !soundEnabled);
              }}
              className="text-white hover:text-amber-400 flex items-center gap-1.5 text-xs font-bold cursor-pointer transition-colors"
              title="音效靜音開關"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 text-amber-300" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
              <span className="hidden sm:inline">{soundEnabled ? '音效開啟' : '音效關閉'}</span>
            </button>
          </div>

          {/* Stats Bar */}
          <TopBar stats={stats} addStamina={handleReplenishStaminaFree} />
        </div>

        {/* ========================================= */}
        {/* CASE ACTIVE PUZZLE BOARD GAME SCREEN */}
        {/* ========================================= */}
        {currentPuzzle ? (
          <div className="flex flex-col gap-6">
            
            {/* Back button & stats header panel */}
            <div className="flex flex-wrap justify-between items-center gap-4 bg-slate-900 text-white rounded-3xl p-4 border-b-4 border-slate-950 shadow-[4px_4px_0px_rgba(15,23,42,1)]">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => exitActivePuzzle(true)}
                  className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 hover:text-amber-300 border-2 border-slate-700 py-2 px-4 rounded-2xl cursor-pointer font-black transition-all"
                >
                  <ChevronLeft className="w-4 h-4" /> 撤離現場 (Abandon)
                </button>
                <div className="h-6 w-[2px] bg-slate-700 hidden sm:block" />
                <div>
                  <h3 className="font-black text-sm text-yellow-300 flex items-center gap-1.5 leading-none">
                    <span>{THEMES[currentPuzzle.themeId]?.icon}</span>
                    <span>正在勘查：{THEMES[currentPuzzle.themeId]?.name} 案件現場</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">
                    當前難度等級：Lv.{currentPuzzle.difficulty} (N = {currentPuzzle.size} 方對襯)
                  </p>
                </div>
              </div>

              {/* Timer & Solved count indicators */}
              <div className="flex items-center gap-4 font-mono font-black text-xs text-amber-300">
                <div className="bg-slate-800 border-2 border-slate-700 py-1.5 px-3 rounded-xl flex items-center gap-2">
                  <Timer className="w-4 h-4 text-rose-400" />
                  <span>
                    {timerRemaining !== null ? (
                      <span className="text-rose-400 animate-pulse">
                        限時倒數：{Math.floor(timerRemaining / 60)}:{(timerRemaining % 60).toString().padStart(2, '0')}
                      </span>
                    ) : (
                      <span>已查案歷時：{Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Navigation Tabs inside puzzle board (Notebook vs Matrix Drafts) */}
            <div className="flex gap-2">
              <button
                onClick={() => { playSynthSound('tap', soundEnabled); setActiveBoardTab('notebook'); }}
                className={`flex-1 font-black text-sm py-3 px-4 rounded-2xl border-4 text-center transition-all cursor-pointer shadow-[4px_4px_0px_rgba(15,23,42,1)] active:translate-y-1 active:shadow-none ${
                  activeBoardTab === 'notebook'
                    ? 'bg-slate-900 border-slate-950 text-amber-300'
                    : 'bg-white border-slate-900 text-slate-700 hover:bg-slate-50'
                }`}
              >
                🔍 答案偵探簿 (Interactive Notebook)
              </button>
              <button
                onClick={() => { playSynthSound('tap', soundEnabled); setActiveBoardTab('matrix'); }}
                className={`flex-1 font-black text-sm py-3 px-4 rounded-2xl border-4 text-center transition-all cursor-pointer shadow-[4px_4px_0px_rgba(15,23,42,1)] active:translate-y-1 active:shadow-none ${
                  activeBoardTab === 'matrix'
                    ? 'bg-slate-900 border-slate-950 text-amber-300'
                    : 'bg-white border-slate-900 text-slate-700 hover:bg-slate-50'
                }`}
              >
                📋 排除草稿表 (Draft Logic Matrix)
              </button>
            </div>

            {/* Main Interactive Screen Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Clue list cards (Saves space & persistent visibility on large screens) */}
              <div className="lg:col-span-5 bg-white border-4 border-slate-900 rounded-[32px] p-4 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
                <ClueList
                  clues={currentPuzzle.clues}
                  markedClues={markedClues}
                  onToggleMarkClue={handleToggleMarkClue}
                  highlightedClueId={highlightedClueId}
                />
              </div>

              {/* Center / Right Column: Active tool board sheets */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <div className="bg-white border-4 border-slate-900 rounded-[32px] p-5 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
                  {activeBoardTab === 'notebook' ? (
                    <NotebookView
                      puzzle={currentPuzzle}
                      answers={answers}
                      conflictingClues={activeConflicts}
                      conflictingCells={activeConflictingCells}
                      onCellSelect={handleAssignCell}
                    />
                  ) : (
                    <MatrixView
                      puzzle={currentPuzzle}
                      answers={answers}
                      matrix={matrix}
                      onMatrixCellToggle={handleToggleMatrixCell}
                      onClearMatrix={handleClearMatrixDrafts}
                    />
                  )}
                </div>

                {/* BOTTON ACTIVE BAR CONTROLS (Help Desk & Submit Actions) */}
                <div className="bg-slate-900 border-4 border-slate-950 rounded-[30px] p-4 flex flex-wrap justify-between items-center gap-4 text-white shadow-[4px_4px_0px_rgba(15,23,42,1)]">
                  
                  {/* Hint choices rail */}
                  <div className="flex flex-wrap gap-2">
                    <span className="text-slate-400 font-bold text-xs flex items-center pr-1.5">
                      🕵️‍♂️ 放大鏡密謀求助：
                    </span>
                    <button
                      onClick={() => handleRequestDetectiveHint(1)}
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] sm:text-xs font-black py-1.5 px-3 rounded-xl cursor-pointer"
                      title="指出筆記中與答案衝突的錯誤格"
                    >
                      💡 指出錯誤格 (30幣)
                    </button>
                    <button
                      onClick={() => handleRequestDetectiveHint(2)}
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] sm:text-xs font-black py-1.5 px-3 rounded-xl cursor-pointer"
                      title="高亮指引一條未過濾排除的關鍵線索"
                    >
                      💡 指引未用線索 (30幣)
                    </button>
                    <button
                      onClick={() => handleRequestDetectiveHint(3)}
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] sm:text-xs font-black py-1.5 px-3 rounded-xl cursor-pointer"
                    >
                      🌟 直接填充正解 (30幣)
                    </button>
                  </div>

                  {/* Submission triggers */}
                  <div className="flex gap-2.5 shrink-0 ml-auto justify-end w-full sm:w-auto border-t-2 border-slate-800 sm:border-0 pt-3 sm:pt-0">
                    <button
                      onClick={handleSubmitCase}
                      className="bg-[#6BCB77] hover:bg-emerald-500 text-slate-950 border-3 border-slate-950 font-black text-xs py-2 px-5 sm:px-6 rounded-xl cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none hover:scale-105 transition-transform"
                    >
                      🚀 送交結案 (Submit Case)
                    </button>
                  </div>

                </div>

                {/* Rendered Floating Hint Popover Alert */}
                {hintOpen && revealedHintText && (
                  <div className="bg-amber-50 border-4 border-amber-400 p-4 rounded-2xl flex items-start gap-3 shadow-[4px_4px_0px_rgba(15,23,42,1)] animate-scale-up">
                    <Lightbulb className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-extrabold text-[#78350F] text-xs">探長提示：</h4>
                      <p className="text-slate-800 text-xs font-bold mt-1 leading-relaxed">
                        {revealedHintText}
                      </p>
                    </div>
                    <button
                      onClick={() => setHintOpen(false)}
                      className="text-xs font-black text-amber-800 bg-amber-200/50 hover:bg-amber-200 py-1 px-2.5 rounded-lg ml-auto shrink-0 cursor-pointer"
                    >
                      我知道了
                    </button>
                  </div>
                )}

              </div>

            </div>

          </div>
        ) : (
          /* ========================================= */
          /* RECREATIONAL OUTSIDE HALL (CAMPUS BOARD)  */
          /* ========================================= */
          <div className="flex flex-col gap-8">
            
            {/* Play Tab Navigation Switches (7 requested elements) */}
            <div className="flex bg-slate-900 border-4 border-slate-950 p-2.5 rounded-[28px] shadow-[4px_4px_0px_rgba(15,23,42,1)] overflow-x-auto scrollbar-none select-none flex-wrap gap-2">
              <button
                onClick={() => { playSynthSound('tap', soundEnabled); setActiveMenuTab('adventure'); }}
                className={`flex-1 min-w-[100px] text-center whitespace-nowrap py-3 px-4 rounded-[18px] font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeMenuTab === 'adventure'
                    ? 'bg-amber-400 text-slate-950 shadow-md scale-102 font-black'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>🗺️ 開始冒險</span>
              </button>

              <button
                onClick={() => { playSynthSound('tap', soundEnabled); setActiveMenuTab('daily'); }}
                className={`flex-1 min-w-[100px] text-center whitespace-nowrap py-3 px-4 rounded-[18px] font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeMenuTab === 'daily'
                    ? 'bg-amber-400 text-slate-950 shadow-md scale-102 font-black'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>📆 每日挑戰</span>
                {!stats.isDailyDoneToday && (
                  <span className="w-2.5 h-2.5 bg-rose-500 border border-white rounded-full animate-ping shrink-0" />
                )}
              </button>

              <button
                onClick={() => { playSynthSound('tap', soundEnabled); setActiveMenuTab('leaderboard'); }}
                className={`flex-1 min-w-[100px] text-center whitespace-nowrap py-3 px-4 rounded-[18px] font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeMenuTab === 'leaderboard'
                    ? 'bg-amber-400 text-slate-950 shadow-md scale-102 font-black'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>🏆 排行榜</span>
              </button>

              <button
                onClick={() => { playSynthSound('tap', soundEnabled); setActiveMenuTab('gallery'); }}
                className={`flex-1 min-w-[100px] text-center whitespace-nowrap py-3 px-4 rounded-[18px] font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeMenuTab === 'gallery'
                    ? 'bg-amber-400 text-slate-950 shadow-md scale-102 font-black'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>🎨 思考圖鑑</span>
              </button>

              <button
                onClick={() => { playSynthSound('tap', soundEnabled); setActiveMenuTab('achievements'); }}
                className={`flex-1 min-w-[100px] text-center whitespace-nowrap py-3 px-4 rounded-[18px] font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeMenuTab === 'achievements'
                    ? 'bg-amber-400 text-slate-950 shadow-md scale-102 font-black'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>🎖️ 成就牆</span>
              </button>

              <button
                onClick={() => { playSynthSound('tap', soundEnabled); setActiveMenuTab('teacher'); }}
                className={`flex-1 min-w-[100px] text-center whitespace-nowrap py-3 px-4 rounded-[18px] font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeMenuTab === 'teacher'
                    ? 'bg-indigo-400 text-white shadow-md scale-102 font-black border-2 border-indigo-600'
                    : 'text-indigo-300 hover:text-indigo-100'
                }`}
              >
                <span>👩‍🏫 教師後台</span>
              </button>

              <button
                onClick={() => { playSynthSound('tap', soundEnabled); setActiveMenuTab('settings'); }}
                className={`whitespace-nowrap py-3 px-4 rounded-[18px] font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeMenuTab === 'settings'
                    ? 'bg-slate-700 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>⚙️</span>
              </button>
            </div>

            {/* TAB CONTENTS RENDERER */}
            
            {/* 1. ADVENTURE MENU HUB */}
            {activeMenuTab === 'adventure' && (
              <div className="flex flex-col gap-6">
                {/* Adventure Sub-Navigation Tags */}
                <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl border-2 border-slate-300 max-w-lg">
                  <button
                    onClick={() => { playSynthSound('tap', soundEnabled); setAdventureSubTab('story'); }}
                    className={`flex-1 font-black text-[11px] sm:text-xs py-2 px-3 rounded-xl transition-all cursor-pointer text-center ${
                      adventureSubTab === 'story'
                        ? 'bg-slate-900 text-white shadow'
                        : 'text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    🗺️ 主線探索篇章
                  </button>
                  <button
                    onClick={() => { playSynthSound('tap', soundEnabled); setAdventureSubTab('endless'); }}
                    className={`flex-1 font-black text-[11px] sm:text-xs py-2 px-3 rounded-xl transition-all cursor-pointer text-center ${
                      adventureSubTab === 'endless'
                        ? 'bg-slate-900 text-white shadow'
                        : 'text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    🎲 自由沙盒推演
                  </button>
                  <button
                    onClick={() => { playSynthSound('tap', soundEnabled); setAdventureSubTab('teacher_puzzles'); }}
                    className={`flex-1 font-black text-[11px] sm:text-xs py-2 px-3 rounded-xl transition-all cursor-pointer text-center relative ${
                      adventureSubTab === 'teacher_puzzles'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    🎓 課堂指派任務
                    {dbService.getTeacherPuzzles().length > 0 && (
                      <span className="absolute top-0 right-0 transform translate-x-1.5 -translate-y-1.5 bg-rose-500 text-white min-w-[16px] h-4 text-[9px] font-black rounded-full flex items-center justify-center px-1">
                        {dbService.getTeacherPuzzles().length}
                      </span>
                    )}
                  </button>
                </div>

                {/* ADVENTURE SUB-TAB: STORY */}
                {adventureSubTab === 'story' && (
                  <div className="bg-white border-4 border-slate-900 rounded-[32px] p-5 shadow-[6px_6px_0px_rgba(15,23,42,1)] relative overflow-hidden">
                    <div className="absolute top-2 right-4 text-7xl select-none pointer-events-none opacity-5">🧭</div>
                    <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                      <span>🗺️ 思考探記主線：跟著丸子老師學推理 ✏️</span>
                    </h3>
                    <p className="text-slate-500 font-bold text-xs mt-1 leading-relaxed">
                      跟著關卡路線圖破解從第 1 章到第 12 章的推理密題！每個章節都融入不同的思考主題，每次開始解題均由人工智能隨機編排結構，永遠玩不膩、學更深！
                    </p>

                    {/* Chapters Trail Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
                      {DETECTIVE_CHAPTERS.map((ch, idx) => {
                        const isUnlocked = stats.solvedCount >= idx; 
                        const isSolved = stats.solvedCount > idx;

                        return (
                          <div
                            key={ch.chapter}
                            onClick={() => {
                              if (isUnlocked) {
                                playSynthSound('tap', soundEnabled);
                                setStoryOpenChapter(ch);
                              } else {
                                playSynthSound('conflict', soundEnabled);
                                alert(`🔒 請優先偵破之前的章節，逐步前行喔！探員。`);
                              }
                            }}
                            className={`border-4 rounded-3xl p-4 flex flex-col justify-between gap-4 transition-all relative cursor-pointer shadow-[4px_4px_0px_rgba(15,23,42,1)] select-none hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_rgba(15,23,42,1)] ${
                              isSolved
                                ? 'bg-[#EBFDF5] border-emerald-500'
                                : isUnlocked
                                ? 'bg-[#FFFDF4] border-slate-900'
                                : 'bg-slate-100 opacity-60 border-slate-300'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-black text-[10px] text-slate-400 font-mono">
                                CHAPTER {ch.chapter.toString().padStart(2, '0')}
                              </span>
                              {isSolved ? (
                                <span className="bg-emerald-100 text-[#0F5132] border border-emerald-300 font-extrabold text-[9px] py-0.5 px-2 rounded-full flex items-center gap-0.5">
                                  ✓ 案件已勘破
                                </span>
                              ) : isUnlocked ? (
                                <span className="bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[9px] py-0.5 px-2 rounded-full">
                                  🆕 查案中
                                </span>
                              ) : (
                                <span className="text-[9px] text-slate-400 font-extrabold">🔒 未解鎖</span>
                              )}
                            </div>

                            <div>
                              <h4 className="font-black text-sm text-slate-900 mt-1 lines-clamp-1">{ch.title}</h4>
                              <p className="font-extrabold text-[11px] text-[#495057] mt-1 italic">{ch.caseName}</p>
                            </div>

                            <div className="flex justify-between items-center pt-2.5 border-t border-dashed border-slate-200">
                              <span className="text-[9px] bg-slate-900 text-yellow-300 font-extrabold py-0.5 px-1.5 rounded-lg font-mono">
                                難度: Lv.{ch.targetDifficulty}
                              </span>
                              <span className="text-[9px] font-black text-amber-600">
                                🪙 +{ch.rewardGold} 金幣
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ADVENTURE SUB-TAB: ENDLESS PROCEDURAL */}
                {adventureSubTab === 'endless' && (
                  <div className="bg-white border-4 border-slate-900 rounded-[32px] p-6 shadow-[6px_6px_0px_rgba(15,23,42,1)] flex flex-col gap-6">
                    <div>
                      <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-1.5">
                        <span>🎲 自由沙盒：隨機生成唯一解邏輯推理 🤖</span>
                      </h3>
                      <p className="text-slate-500 font-bold text-xs mt-1">
                        任意搭配難度和主題場景！強大後台解題機（Solver）會為你構建擁有「唯一唯一唯一正確答案」的最佳謎題。
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                      {/* Pick Difficulty */}
                      <div className="flex flex-col gap-3">
                        <h4 className="font-extrabold text-xs text-slate-800 border-l-4 border-slate-900 pl-2">
                          選取難度等級
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { val: Difficulty.Lv1, label: 'Lv1 基礎 (4x4)', bg: 'hover:bg-blue-50 border-blue-200 text-blue-800' },
                            { val: Difficulty.Lv2, label: 'Lv2 簡單 (5x3)', bg: 'hover:bg-indigo-50 border-indigo-200 text-indigo-800' },
                            { val: Difficulty.Lv3, label: 'Lv3 普通 (6x3)', bg: 'hover:bg-teal-50 border-teal-200 text-teal-800' },
                            { val: Difficulty.Lv4, label: 'Lv4 困難 (7x4)', bg: 'hover:bg-emerald-50 border-emerald-200 text-emerald-800' },
                            { val: Difficulty.Lv5, label: 'Lv5 專家 (8x4)', bg: 'hover:bg-amber-50 border-amber-200 text-amber-800' },
                            { val: Difficulty.Lv6, label: 'Lv6 大師 (9x4)', bg: 'hover:bg-rose-50 border-rose-200 text-rose-800' },
                            { val: Difficulty.Lv7, label: 'Lv7 傳奇 (10x4)', bg: 'hover:bg-purple-50 border-purple-200 text-purple-800' },
                            { val: Difficulty.Lv8, label: 'Lv8 非常困難 (12x5)', bg: 'hover:bg-stone-50 border-stone-300 text-stone-800 font-bold' }
                          ].map((item) => (
                            <button
                              key={item.val}
                              onClick={() => { playSynthSound('tap', soundEnabled); setEndlessDiffSelection(item.val); }}
                              className={`p-3 rounded-2xl border-2 text-xs font-black transition-all cursor-pointer text-left ${
                                endlessDiffSelection === item.val
                                  ? 'bg-slate-900 text-amber-300 border-slate-950 shadow-[3px_3px_0px_rgba(0,0,0,1)] scale-[1.01]'
                                  : `bg-white ${item.bg}`
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Pick Theme */}
                      <div className="flex flex-col gap-3">
                        <h4 className="font-extrabold text-xs text-slate-800 border-l-4 border-slate-900 pl-2">
                          選取故事場景主題
                        </h4>
                        <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                          {Object.values(THEMES).map((theme) => (
                            <button
                              key={theme.id}
                              onClick={() => { playSynthSound('tap', soundEnabled); setEndlessThemeSelection(theme.id); }}
                              className={`p-3 rounded-2xl border-2 text-xs font-black transition-all cursor-pointer text-left flex items-center justify-between ${
                                endlessThemeSelection === theme.id
                                  ? 'bg-slate-900 text-amber-300 border-slate-950 shadow-[3px_3px_0px_rgba(0,0,0,1)] scale-[1.01]'
                                  : 'bg-white hover:bg-slate-50 border-slate-200'
                              }`}
                            >
                              <span>{theme.name}</span>
                              <span className="text-sm select-none">{theme.icon}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Speedrun Timer Control */}
                    <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-start gap-2.5">
                        <Timer className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-black text-xs text-slate-800">⏱️ 急限速解速通挑戰模式</h4>
                          <p className="text-[10px] text-slate-500 font-bold leading-normal mt-0.5">
                            開啟速通模式後你將面臨「120秒黃金時限限速速通壓力」！失敗不扣點數，成功將可驚喜追加 🪙 +100 金幣 & ⭐ +50 經驗值額外回報。
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          playSynthSound('tap', soundEnabled);
                          setHasStartedTimerMode(!hasStartedTimerMode);
                        }}
                        className={`font-black text-xs py-2 px-4 rounded-xl border-2 cursor-pointer transition-all shrink-0 ${
                          hasStartedTimerMode
                            ? 'bg-rose-500 text-white border-rose-600 shadow-[2px_2px_0px_rgba(15,23,42,1)]'
                            : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {hasStartedTimerMode ? '⏱️ 限時速通已開啟' : '⏱️ 限時速通已關閉'}
                      </button>
                    </div>

                    <button
                      onClick={() => startNewPuzzle(endlessDiffSelection, endlessThemeSelection)}
                      className="w-full bg-emerald-400 hover:bg-emerald-500 border-4 border-slate-950 text-slate-950 font-black text-xs py-3.5 rounded-2xl cursor-pointer shadow-[4px_4px_0px_rgba(15,23,42,1)] hover:scale-[1.01] active:translate-y-1 active:shadow-none flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4 fill-slate-950" /> <span>程序化建案！立刻前往現場偵察 🚀</span>
                    </button>
                  </div>
                )}

                {/* ADVENTURE SUB-TAB: TEACHER CUSTOMIZED PUZZLES */}
                {adventureSubTab === 'teacher_puzzles' && (
                  <div className="bg-white border-4 border-slate-900 rounded-[32px] p-6 shadow-[6px_6px_0px_rgba(15,23,42,1)] flex flex-col gap-6">
                    <div>
                      <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                        <span>🎓 課堂指派任務：挑戰老師自訂的推理關卡</span>
                      </h3>
                      <p className="text-slate-500 font-bold text-xs mt-1 leading-normal">
                        在這裡查閱由你的指導老師針對該週自主建立的數學學術推理案件！通過解題可以增加經驗值、豐富學校排行與自我素養。
                      </p>
                    </div>

                    {dbService.getTeacherPuzzles().length === 0 ? (
                      <div className="bg-amber-50 border-2 border-dashed border-amber-300 p-8 rounded-2xl text-center flex flex-col items-center gap-2">
                        <span className="text-3xl">📭</span>
                        <h4 className="font-extrabold text-sm text-amber-900">目前課堂指派箱空空如也</h4>
                        <p className="text-[11px] text-slate-500 font-semibold max-w-sm">
                          學校老師可以在「教師後台」（預設密碼：maruko）中新增並儲存你上傳的案件。建立之後，題目就會即刻出現在這裡，供學生隨時查閱和解答！
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {dbService.getTeacherPuzzles().map((puzzle, index) => {
                          const size = puzzle.size;
                          const numCats = puzzle.categories.length;
                          return (
                            <div
                              key={puzzle.id || index}
                              className="border-4 border-slate-900 rounded-2xl p-4 flex flex-col justify-between gap-3 bg-indigo-50/20 relative shadow-[3px_3px_0px_rgba(15,23,42,1)] hover:scale-[1.01] transition-transform"
                            >
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="bg-indigo-100 border border-indigo-200 text-indigo-800 text-[9px] py-1 px-2 rounded-full font-black">
                                    💡 教師自訂指派 ({size} x {numCats})
                                  </span>
                                  <span className="text-[9px] text-[#868E96] font-mono">ID: {puzzle.id?.slice(0, 5) || puzzle.category}</span>
                                </div>
                                <h4 className="font-black text-base text-slate-900">{puzzle.title || '自訂推理案件'}</h4>
                                <p className="text-[11px] text-slate-500 font-extrabold mt-1">
                                  自訂類別：{puzzle.categories.map(c => c.name).join(', ')}
                                </p>
                              </div>

                              <div className="flex justify-between items-center pt-2 border-t border-dashed border-slate-200">
                                <span className="text-[9px] font-bold text-amber-600">
                                  Rewards: 🪙 +{puzzle.difficulty * 35} / ⭐ +{puzzle.difficulty * 50}
                                </span>
                                <button
                                  onClick={() => {
                                    if (stats.stamina <= 0) {
                                      alert('體力不足喔！領取一下無料牛奶。');
                                      return;
                                    }
                                    playSynthSound('tap', soundEnabled);
                                    setAnswers(Array.from({ length: puzzle.categories.length }, () => Array(puzzle.size).fill(-1)));
                                    setAnswers(prev => {
                                      const copy = prev.map(row => [...row]);
                                      for (let s = 0; s < puzzle.size; s++) copy[0][s] = s;
                                      return copy;
                                    });
                                    setStats(prev => ({ ...prev, stamina: prev.stamina - 1 }));
                                    setCurrentPuzzle(puzzle);
                                    setElapsedTime(0);
                                    setErrorsCount(0);
                                    setRevealedHintText(null);
                                    setHighlightedClueId(null);
                                    setLastUsedHintType(null);
                                    setActiveBoardTab('notebook');
                                  }}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] py-1.5 px-3 rounded-lg cursor-pointer"
                                >
                                  接受公審查案 🕵️‍♂️
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 2. DAILY CHALLENGE */}
            {activeMenuTab === 'daily' && (
              <div className="flex flex-col gap-6">
                <div className="bg-white border-4 border-slate-900 rounded-[32px] p-6 shadow-[6px_6px_0px_rgba(15,23,42,1)] flex flex-col items-center justify-center text-center gap-5">
                  <div className="w-16 h-16 bg-amber-400 border-4 border-slate-900 rounded-2xl flex items-center justify-center text-3xl shadow-[3px_3px_0px_rgba(15,23,42,1)] animate-bounce-slow select-none">
                    📆
                  </div>
                  
                  <div>
                    <h3 className="font-black text-xl text-slate-900">每日思考派件：丸子老師思維日課</h3>
                    <p className="text-slate-500 font-bold text-xs mt-1 max-w-sm mx-auto">
                      今日研發考題是由丸子老師設計特派的「Lv.3 普通級」思考關卡。每日限破解 1 次！
                    </p>
                  </div>

                  {/* Daily Reward info */}
                  <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-2xl max-w-sm w-full shadow flex justify-between items-center text-xs font-bold">
                    <span className="text-amber-900">破案完成特派獎勵金：</span>
                    <span className="bg-white border-2 border-slate-900 py-0.5 px-3 rounded-full text-slate-800 font-black shadow-sm flex items-center gap-1">
                      🪙 +150 金幣
                    </span>
                  </div>

                  {stats.isDailyDoneToday ? (
                    <div className="bg-emerald-100/50 border-3 border-emerald-400 text-emerald-800 p-4 rounded-2xl max-w-sm w-full font-extrabold text-xs flex items-center justify-center gap-1.5 shadow">
                      ✓ 今日特件日課已被你高分偵破！明天一早將解鎖全新案件，請繼續前進。
                    </div>
                  ) : (
                    <button
                      onClick={handleStartDailyChallenge}
                      className="max-w-sm w-full bg-[#6BCB77] hover:bg-emerald-500 border-4 border-slate-950 text-slate-950 font-black text-xs py-3 rounded-2xl cursor-pointer shadow-[3px_3px_0px_rgba(15,23,42,1)] hover:scale-105 active:scale-95 transition-all text-center flex items-center justify-center gap-2"
                    >
                      🗣️ 進入今日指派專件
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 3. LEADERBOARD SYSTEM */}
            {activeMenuTab === 'leaderboard' && (
              <LeaderboardView
                playerName={studentProfile.name || '小推理家'}
                studentClass={studentProfile.studentClass || '3年甲班'}
              />
            )}

            {/* 4. GALLERY (COIL SHOP AND ILLUSTRATIONS CREATIVE CENTRE) */}
            {activeMenuTab === 'gallery' && (
              <div className="flex flex-col gap-6">
                {/* Visual title */}
                <div className="bg-[#FFFBF0] border-4 border-slate-900 rounded-[32px] p-6 shadow-[6px_6px_0px_rgba(15,23,42,1)]">
                  <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-1.5">
                    <span>🎨 思考圖鑑與文具收藏館 (Thinking Portfolio)</span>
                  </h3>
                  <p className="text-slate-500 font-bold text-xs mt-1">
                    使用開展案件累積的回應金幣，購買專屬裝飾用品，或者在右下方「探員畫真工作室」為你生成的案件繪製高解析度的探查繪卷。
                  </p>

                  {/* Collections list */}
                  <div className="mt-6">
                    <h4 className="font-extrabold text-xs text-slate-800 border-l-4 border-slate-900 pl-2 mb-4">
                      🛍️ 邏輯文房具裝飾鋪 (Badge & Custom Souvenirs)
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {collections.map((item) => (
                        <div
                          key={item.id}
                          className={`border-3 rounded-2xl p-3 flex flex-col justify-between items-center text-center gap-3 relative shadow-[2px_2px_0px_rgba(15,23,42,1)] ${
                            item.unlocked
                              ? 'bg-[#F1F3F5] border-slate-800'
                              : 'bg-white border-slate-300'
                          }`}
                        >
                          <span className="text-3xl select-none leading-none pt-2">{item.icon}</span>
                          <div>
                            <h5 className="font-black text-xs text-slate-900">{item.name}</h5>
                            <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{item.description}</p>
                          </div>
                          
                          {item.unlocked ? (
                            <span className="bg-slate-200 text-slate-700 text-[8px] py-1 px-2.5 rounded-full font-black">
                              ✓ 已成功置辦
                            </span>
                          ) : (
                            <button
                              onClick={() => handleBuyCollectionItem(item.id)}
                              className={`w-full py-1 px-2 rounded-lg font-black text-[9px] cursor-pointer transition-colors ${
                                stats.coins >= (item.cost || 0)
                                  ? 'bg-[#FFD93D] hover:bg-yellow-400 text-slate-900'
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              🪙 {item.cost} 購置
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI PICTURE GENERATOR */}
                <AIIllustrator
                  stats={stats}
                  onDeductCoins={(cost) => {
                    const updatedStats = { ...stats, coins: stats.coins - cost };
                    setStats(updatedStats);
                    saveGameState(updatedStats, achievements, collections);
                  }}
                  soundEnabled={soundEnabled}
                />
              </div>
            )}

            {/* 5. ACHIEVEMENTS SYSTEM WALL */}
            {activeMenuTab === 'achievements' && (
              <div className="bg-[#FFFDF4] border-4 border-slate-900 rounded-[32px] p-6 shadow-[6px_6px_0px_rgba(15,23,42,1)]">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-4 border-slate-900 pb-4 gap-2 mb-6">
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-1.5">
                      <span>🏅 勳章牆與思考榮譽徽章</span>
                    </h3>
                    <p className="text-slate-500 font-bold text-xs mt-1">
                      達成累積偵查的關卡、或完全不用求助提示等困難挑戰，解鎖專屬頭銜徽章，並在金庫領取豪邁獎勵金！
                    </p>
                  </div>
                  <div className="bg-slate-900 text-amber-300 font-black text-xs py-1.5 px-3 rounded-lg font-mono">
                    已達成：{achievements.filter(a => a.unlocked).length} / {achievements.length} 項勳章
                  </div>
                </div>

                {/* Achievement cells list container with scroll bar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
                  {achievements.map((ach) => (
                    <div
                      key={ach.id}
                      className={`border-3 rounded-2xl p-4 flex gap-3.5 items-start justify-between relative shadow-[3px_3px_0px_rgba(15,23,42,1)] ${
                        ach.unlocked
                          ? 'bg-[#EBFDF5]/40 border-emerald-400'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      {/* Left Icon badge */}
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 select-none border-2 border-slate-900 shadow-sm ${
                        ach.unlocked ? 'bg-emerald-400' : 'bg-slate-100 opacity-60'
                      }`}>
                        {ach.icon}
                      </div>

                      {/* Info & progress bar */}
                      <div className="flex-1">
                        <h4 className="font-black text-xs text-slate-900">{ach.title}</h4>
                        <p className="text-[10px] text-slate-400 font-bold leading-relaxed">{ach.description}</p>
                        
                        {/* Progress Bar */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-full bg-slate-100 rounded-full h-1.5 border border-slate-200 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${ach.unlocked ? 'bg-emerald-500' : 'bg-amber-400'}`}
                              style={{ width: `${Math.min(100, (ach.currentCount / ach.targetCount) * 100)}%` }}
                            />
                          </div>
                          <span className="font-sans font-black text-[9px] text-[#495057]">
                            {ach.currentCount}/{ach.targetCount}
                          </span>
                        </div>
                      </div>

                      {/* Action Claim button */}
                      <div className="shrink-0 text-center flex flex-col items-end justify-center min-h-[50px]">
                        {ach.unlocked ? (
                          <span className="font-black text-[9px] text-[#0F5132] bg-emerald-100 border border-emerald-200 py-1 px-2 rounded-lg">
                            ✓ 已解鎖
                          </span>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[9px] text-[#495057] font-black font-mono">🪙 +{ach.goldReward}</span>
                            <button
                              disabled
                              title="尚未達成考核標準，加油！"
                              className="bg-slate-100 text-[#ADB5BD] border border-slate-300 font-extrabold text-[8px] py-1 px-1.5 rounded cursor-not-allowed"
                            >
                              解鎖中
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. TEACHER LOG PORTAL */}
            {activeMenuTab === 'teacher' && (
              <TeacherPortal
                soundEnabled={soundEnabled}
                onSelectPlayPuzzle={(p) => {
                  if (stats.stamina <= 0) {
                    alert('體力不足喔！探員，請喝一口體力飲料。');
                    return;
                  }
                  playSynthSound('tap', soundEnabled);
                  setAnswers(Array.from({ length: p.categories.length }, () => Array(p.size).fill(-1)));
                  setAnswers(prev => {
                    const copy = prev.map(row => [...row]);
                    for (let s = 0; s < p.size; s++) copy[0][s] = s;
                    return copy;
                  });
                  setStats(prev => ({ ...prev, stamina: prev.stamina - 1 }));
                  setCurrentPuzzle(p);
                  setElapsedTime(0);
                  setErrorsCount(0);
                  setRevealedHintText(null);
                  setHighlightedClueId(null);
                  setLastUsedHintType(null);
                  setActiveBoardTab('notebook');
                }}
                onBack={() => setActiveMenuTab('adventure')}
              />
            )}

            {/* 7. SETTINGS AND DIAGNOSTIC CENTRE */}
            {activeMenuTab === 'settings' && (
              <div className="bg-[#FFFDF4] border-4 border-slate-900 rounded-[32px] p-6 shadow-[6px_6px_0px_rgba(15,23,42,1)] flex flex-col gap-6">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-1.5">
                    <span>⚙️ 探員手冊系統設定 (Diagnostic panel)</span>
                  </h3>
                  <p className="text-slate-500 font-bold text-xs mt-1">
                    在這裡管理探錄手記配置、檢視探員身分認證資訊編碼，也可以在必要時重置你的記錄。
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Student profile details */}
                  <div className="bg-slate-50 border-2 border-slate-300 rounded-2xl p-4 flex flex-col gap-3">
                    <h4 className="font-extrabold text-xs text-slate-800 border-l-4 border-slate-900 pl-2">
                      🎒 目前登記的探員學籍
                    </h4>
                    
                    <div className="flex flex-col gap-2 font-mono font-black text-xs text-[#212529] pt-2">
                      <div className="flex justify-between border-b pb-1.5 border-slate-200">
                        <span className="text-slate-400">登錄大名:</span>
                        <span>{studentProfile.name}</span>
                      </div>
                      <div className="flex justify-between border-b pb-1.5 border-slate-200">
                        <span className="text-slate-400">目前學級班級:</span>
                        <span>{studentProfile.studentClass}</span>
                      </div>
                      <div className="flex justify-between border-b pb-1.5 border-slate-200">
                        <span className="text-slate-400">課堂登載座號:</span>
                        <span>{studentProfile.studentNo} 號</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">當前職務頭銜:</span>
                        <span className="text-indigo-600">{stats.detectiveRank} (Lv.{stats.level})</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        playSynthSound('tap', soundEnabled);
                        if(confirm('重設頭銜與姓名，將會重新顯示登記介面，確定要更改嗎？')) {
                          localStorage.removeItem('detective_student_profile');
                          setStudentProfile({ name: '', studentClass: '', studentNo: '', initialized: false });
                        }
                      }}
                      className="mt-2 w-full bg-slate-200 hover:bg-slate-300 border border-slate-300 font-black text-xs py-2 rounded-xl cursor-pointer text-slate-700 transition-colors"
                    >
                      修改在校學籍資訊 ✏️
                    </button>
                  </div>

                  {/* Settings toggles */}
                  <div className="bg-slate-50 border-2 border-slate-300 rounded-2xl p-4 flex flex-col gap-4">
                    <h4 className="font-extrabold text-xs text-slate-800 border-l-4 border-slate-900 pl-2">
                      🔉 系統回饋配置
                    </h4>

                    {/* Sound check toggle */}
                    <div className="flex justify-between items-center bg-white border p-3 rounded-xl shadow-sm">
                      <span className="text-xs font-black text-slate-700">音效與背景提示音：</span>
                      <button
                        onClick={() => {
                          setSoundEnabled(!soundEnabled);
                          localStorage.setItem('detective_sound_enabled', String(!soundEnabled));
                        }}
                        className={`text-xs font-black py-1.5 px-3 rounded-lg border-2 cursor-pointer transition-colors ${
                          soundEnabled ? 'bg-amber-400 text-slate-900 border-amber-500' : 'bg-slate-100 text-slate-400 border-slate-350'
                        }`}
                      >
                        {soundEnabled ? '✓ 音效已開啟' : '✗ 已靜音'}
                      </button>
                    </div>

                    {/* App reset tool */}
                    <div className="flex justify-between items-center bg-white border p-3 rounded-xl shadow-sm">
                      <div>
                        <span className="text-xs font-black text-rose-800 block">⚠️ 抹除主機暫存</span>
                        <span className="text-[10px] text-slate-400 font-medium">重置所有過往偵查儲存進度、金幣及成就。</span>
                      </div>
                      <button
                        onClick={() => {
                          playSynthSound('tap', soundEnabled);
                          if (confirm('☠️ 你確定要刪除你在「丸子老師實驗室」的所有偵查足跡、金幣數量與勋章獎章嗎？此重置動作為不可逆之抹除。')) {
                            localStorage.clear();
                            window.location.reload();
                          }
                        }}
                        className="bg-rose-100 text-rose-700 hover:bg-rose-200 border border-rose-300 font-extrabold text-[10px] py-1.5 px-3 rounded-lg cursor-pointer transition-colors shrink-0"
                      >
                        全盤重置抹除
                      </button>
                    </div>

                  </div>
                </div>

                {/* Tutorial video guide section */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 mt-2">
                  <div className="flex items-start gap-2.5">
                    <HelpCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-black text-xs text-slate-800">需要新手探員快速教程嗎？</h4>
                      <p className="text-[10px] text-slate-500 font-bold leading-normal mt-0.5">
                        按一下重新播放最前面的「思考本入學導引說明 Walkthrough」，迅速學會排除法、網格草表、以及與探長調度提示的技巧！想複習的探員別錯過了！
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      playSynthSound('tap', soundEnabled);
                      setWalkthroughCompleted(false);
                      localStorage.removeItem('detective_walkthrough_completed');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-2 px-4 rounded-xl cursor-pointer transition-all shrink-0"
                  >
                    📖 重新播放新手指南
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* ========================================= */}
      {/* GLOBAL MODALS (STORY INTRODUCTION & LEVEL UP) */}
      {/* ========================================= */}

      {/* Story Introduction Panel */}
      {storyOpenChapter && (
        <CaseStoryModal
          isOpen={storyOpenChapter !== null}
          onClose={() => setStoryOpenChapter(null)}
          chapterNumber={storyOpenChapter.chapter}
          chapterTitle={storyOpenChapter.title}
          caseName={storyOpenChapter.caseName}
          description={storyOpenChapter.description}
          themeId={storyOpenChapter.themeId}
          rewardGold={storyOpenChapter.rewardGold}
          rewardXp={storyOpenChapter.rewardXp}
          targetDifficulty={storyOpenChapter.targetDifficulty}
          onAcceptCase={() => startNewPuzzle(storyOpenChapter.targetDifficulty, storyOpenChapter.themeId, true, storyOpenChapter)}
        />
      )}

      {/* Level UP Dialog Panel */}
      {levelUpTrigger && (
        <LevelUpModal
          isOpen={levelUpTrigger !== null}
          level={levelUpTrigger.level}
          rank={levelUpTrigger.rank}
          onClose={() => setLevelUpTrigger(null)}
        />
      )}

      {/* Victory Celebration and Rank Leaderboard Panel */}
      {victoryModalData && (
        <VictoryCelebrationModal
          isOpen={victoryModalData !== null}
          elapsedTime={victoryModalData.elapsedTime}
          difficulty={victoryModalData.difficulty}
          difficultyName={victoryModalData.difficultyName}
          earnedCoins={victoryModalData.earnedCoins}
          earnedXp={victoryModalData.earnedXp}
          playerRank={stats.detectiveRank}
          onClaimRewards={handleCloseVictoryModalClaimRewards}
          soundEnabled={soundEnabled}
        />
      )}

      {/* Custom Exit/Abandon Confirmation Dialog */}
      {abandonConfirmOpen && (
        <div id="abandon-confirm-dialog" className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in font-sans select-none">
          <div className="bg-[#FFF8E7] border-4 border-slate-950 rounded-[32px] p-6 max-w-sm w-full shadow-[8px_8px_0px_rgba(15,23,42,1)] relative flex flex-col gap-4 text-center animate-scale-up border-b-[8px]">
            <div className="text-4xl animate-bounce">🕵️‍♂️🏃‍♂️</div>
            
            <div>
              <h3 className="font-black text-xl text-slate-900">確定要撤離現場嗎？</h3>
              <p className="text-xs text-slate-500 font-bold mt-2 leading-relaxed">
                放棄此案件將會直接沒收本題，且扣除的 <span className="text-rose-500 font-extrabold">1 點體力</span> 將無法再次退還喔！
              </p>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <button
                onClick={() => {
                  playSynthSound('tap', soundEnabled);
                  setAbandonConfirmOpen(false);
                }}
                className="w-full bg-[#6BCB77] hover:bg-emerald-500 text-slate-950 border-3 border-slate-950 font-black text-xs py-3 px-4 rounded-2xl cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none hover:scale-[1.01] transition-all flex items-center justify-center gap-1.5"
              >
                <span>🔍 繼續勘查案件 (Continue)</span>
              </button>
              
              <button
                onClick={() => {
                  exitActivePuzzle(false);
                }}
                className="w-full bg-rose-100 hover:bg-rose-200 text-rose-800 border-3 border-rose-300 font-black text-xs py-3 px-4 rounded-2xl cursor-pointer transition-colors text-center"
              >
                🚶 確定撤離並放棄 (Abandon)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
