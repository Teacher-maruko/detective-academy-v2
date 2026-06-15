import { Difficulty, PlayerStats, Puzzle, Achievement, CollectionItem, Clue, ClueType } from '../types';

// Let's define the interface for leaderboard entries
export interface SQLLeaderboardEntry {
  id?: string;
  playerName: string;
  studentClass: string;
  studentNo: string;
  puzzleName: string;
  timeSeconds: number; // in seconds
  errorsCount: number;
  hintsCount: number;
  totalScore: number;
  date: string;
}

// Teacher customized puzzle schemas
export interface TeacherPuzzle {
  id: string;
  title: string;
  category: string; // Theme e.g. "校園生活", "動物世界", "水果樂園"
  difficulty: Difficulty;
  size: number; // 3, 4, 5, 6
  mode: 'text' | 'emoji' | 'mixed';
  categories: {
    name: string;
    key: string;
    items: string[];
    icons: string[];
  }[];
  clues: Clue[];
  solution: number[][]; // true answers [slotIndex][catIndex]
  createdAt: string;
}

// Global simulated network lag for classroom gameplay
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Typical Taiwanese primary school names to populate mock data so teachers see a live environment instantly
const MOCK_NAMES = [
  '林育辰', '陳羽婷', '張家豪', '黃品睿', '曾宇萱', '李允傑', '王宥蓁', '吳冠廷', '劉姿妤', '蔡睿恩',
  '張佳綺', '簡柏宇', '卓妤蓁', '周柏安', '莊佩璇', '莊宇誠', '鄭佳恩', '戴廷軒', '洪郁雯', '彭楷翔'
];
const MOCK_CLASSES = ['3年甲班', '4年乙班', '5年丙班', '6年丁班'];

class DesktopDatabase {
  private dbInstance: any = null;
  private isFirebaseLoaded = false;

  constructor() {
    this.initFirebase();
  }

  // Lazily detect and load Firebase if present
  private async initFirebase() {
    try {
      // Dynamic import with vite-ignore is extremely robust and prevents missing file compilation errors
      const configPath = '../firebase-applet-config.json';
      const configModule = await import(/* @vite-ignore */ configPath);
      const firebaseApp = await import(/* @vite-ignore */ 'firebase/app');
      const firebaseFirestore = await import(/* @vite-ignore */ 'firebase/firestore');

      if (configModule?.default) {
        const app = firebaseApp.initializeApp(configModule.default);
        this.dbInstance = firebaseFirestore.getFirestore(app);
        this.isFirebaseLoaded = true;
        console.log('✨ Firebase Firestore initialized successfully!');
      }
    } catch (e) {
      // Graceful fallback to rich localStorage simulations
      console.log('ℹ️ Running in Local Storage database mode (Firebase is not provisioned/enabled yet).');
    }
  }

  // -----------------------------------------
  // STUDENT PROGRESS & ACCOUNT MANAGEMENT
  // -----------------------------------------
  public getOrCreateStats(initialName = '', initialClass = '', initialNo = ''): PlayerStats & { name: string; studentClass: string; studentNo: string } {
    const defaultStats = {
      name: initialName || '小推理家',
      studentClass: initialClass || '3年甲班',
      studentNo: initialNo || '01',
      level: 1,
      xp: 0,
      coins: 300,
      stamina: 5,
      maxStamina: 5,
      detectiveRank: '邏輯新鮮人',
      solvedCount: 0,
      solvedByDifficulty: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 },
      solvedByTheme: {},
      unstoppableStreak: 0,
      lastLoginDate: new Date().toDateString(),
      isDailyDoneToday: false,
      hintsUsed: 0
    };

    const saved = localStorage.getItem('detective_student_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // backward compatibility
        if (!parsed.name) parsed.name = '小推理家';
        if (!parsed.studentClass) parsed.studentClass = '3年甲班';
        if (!parsed.studentNo) parsed.studentNo = '01';
        return parsed;
      } catch (e) {
        return defaultStats;
      }
    }

    if (initialName) {
      localStorage.setItem('detective_student_profile', JSON.stringify(defaultStats));
    }
    return defaultStats;
  }

  public saveStats(data: PlayerStats & { name: string; studentClass: string; studentNo: string }) {
    localStorage.setItem('detective_student_profile', JSON.stringify(data));
    // also save stats back to original keys to maintain full system compatibility with App.tsx
    localStorage.setItem('detective_stats', JSON.stringify(data));
    localStorage.setItem('detective_nickname', data.name);
  }

  // -----------------------------------------
  // LEADERBOARDS & SCORES MANAGEMENT
  // -----------------------------------------
  public async submitScore(entry: Omit<SQLLeaderboardEntry, 'date'>): Promise<SQLLeaderboardEntry> {
    const fullEntry: SQLLeaderboardEntry = {
      ...entry,
      id: `score_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      date: new Date().toISOString().split('T')[0]
    };

    // Save to LocalStorage
    const list = this.getLocalLeaderboard();
    list.unshift(fullEntry);
    localStorage.setItem('detective_leaderboard_all', JSON.stringify(list));

    // Optional real firestore integration write
    if (this.isFirebaseLoaded && this.dbInstance) {
      try {
        const { collection, addDoc } = await import(/* @vite-ignore */ 'firebase/firestore');
        await addDoc(collection(this.dbInstance, 'leaderboards'), {
          ...fullEntry,
          timestamp: new Date()
        });
      } catch (err) {
        console.warn('Firebase sync fail, stored locally:', err);
      }
    }

    return fullEntry;
  }

  private getLocalLeaderboard(): SQLLeaderboardEntry[] {
    const saved = localStorage.getItem('detective_leaderboard_all');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }

    // Generate vibrant mock student records so teachers see a live environment instantly!
    const list: SQLLeaderboardEntry[] = [];
    const subjects = ['思考章節任務', '失蹤的金杯', '每日思維日課', '太空奧秘挑戰'];
    
    // Seed 40 random completed tasks across various days
    for (let i = 0; i < 60; i++) {
      const pName = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)];
      const pClass = MOCK_CLASSES[Math.floor(Math.random() * MOCK_CLASSES.length)];
      const pNo = String(Math.floor(Math.random() * 30) + 1).padStart(2, '0');
      const tSecs = Math.floor(Math.random() * 240) + 45; // 45s to 4m45s
      const errs = Math.floor(Math.random() * 3);
      const hints = Math.floor(Math.random() * 2);
      // Score calculation: Base 1000 - time/2 - errors*100 - hints*50
      const score = Math.max(200, 1000 - Math.floor(tSecs / 2) - errs * 100 - hints * 50);
      
      const dateOffset = Math.floor(Math.random() * 14); // up to 14 days ago
      const date = new Date(Date.now() - dateOffset * 24 * 3600 * 1000).toISOString().split('T')[0];

      list.push({
        id: `mock_score_${i}`,
        playerName: pName,
        studentClass: pClass,
        studentNo: pNo,
        puzzleName: subjects[Math.floor(Math.random() * subjects.length)],
        timeSeconds: tSecs,
        errorsCount: errs,
        hintsCount: hints,
        totalScore: score,
        date
      });
    }

    list.sort((a, b) => b.totalScore - a.totalScore);
    localStorage.setItem('detective_leaderboard_all', JSON.stringify(list));
    return list;
  }

  public getLeaderboard(type: 'school' | 'class' | 'week' | 'month' | 'growth', playerClass = ''): SQLLeaderboardEntry[] {
    const all = this.getLocalLeaderboard();
    const today = new Date();
    
    // Helper to check if date falls in current week
    const isThisWeek = (dateStr: string) => {
      const d = new Date(dateStr);
      const diffTime = Math.abs(today.getTime() - d.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    };

    // Helper to check if date falls in current month
    const isThisMonth = (dateStr: string) => {
      const d = new Date(dateStr);
      return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    };

    let filtered = [...all];

    if (type === 'class' && playerClass) {
      filtered = filtered.filter(item => item.studentClass === playerClass);
    } else if (type === 'week') {
      filtered = filtered.filter(item => isThisWeek(item.date));
    } else if (type === 'month') {
      filtered = filtered.filter(item => isThisMonth(item.date));
    }

    // Sort strategy:
    // For school, class, week, month -> sorted by totalScore descending
    // For growth -> sorted by least errorsCount, then least hintsCount, then least timeSeconds (Quality focused!)
    if (type === 'growth') {
      filtered.sort((a, b) => {
        if (a.errorsCount !== b.errorsCount) return a.errorsCount - b.errorsCount;
        if (a.hintsCount !== b.hintsCount) return a.hintsCount - b.hintsCount;
        return a.timeSeconds - b.timeSeconds;
      });
    } else {
      filtered.sort((a, b) => b.totalScore - a.totalScore);
    }

    return filtered.slice(0, 15); // Return top 15 ranks
  }

  // -----------------------------------------
  // TEACHER PUZZLES PORTAL MANAGEMENT
  // -----------------------------------------
  public getTeacherPuzzles(): TeacherPuzzle[] {
    const saved = localStorage.getItem('teacher_custom_puzzles');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  public saveTeacherPuzzle(puzzle: TeacherPuzzle) {
    const list = this.getTeacherPuzzles();
    const idx = list.findIndex(p => p.id === puzzle.id);
    if (idx !== -1) {
      list[idx] = puzzle;
    } else {
      list.push(puzzle);
    }
    localStorage.setItem('teacher_custom_puzzles', JSON.stringify(list));
  }

  public deleteTeacherPuzzle(id: string) {
    const list = this.getTeacherPuzzles();
    const filtered = list.filter(p => p.id !== id);
    localStorage.setItem('teacher_custom_puzzles', JSON.stringify(filtered));
  }

  public copyTeacherPuzzle(id: string): TeacherPuzzle | null {
    const list = this.getTeacherPuzzles();
    const original = list.find(p => p.id === id);
    if (!original) return null;

    const copy: TeacherPuzzle = {
      ...original,
      id: `teacher_puzzle_${Date.now()}_copy`,
      title: `${original.title} (複製)`,
      createdAt: new Date().toLocaleDateString()
    };

    list.push(copy);
    localStorage.setItem('teacher_custom_puzzles', JSON.stringify(list));
    return copy;
  }
}

export const dbService = new DesktopDatabase();
