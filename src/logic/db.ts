import { Difficulty, PlayerStats, Puzzle, Achievement, CollectionItem, Clue, ClueType } from '../types';

// Leaderboard entries
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

// Typical Taiwanese primary school names to populate mock data so teachers see a live environment instantly
const MOCK_NAMES = [
  '林育辰', '陳羽婷', '張家豪', '黃品睿', '曾宇萱', '李允傑', '王宥蓁', '吳冠廷', '劉姿妤', '蔡睿恩',
  '張佳綺', '簡柏宇', '卓妤蓁', '周柏安', '莊佩璇', '莊宇誠', '鄭佳恩', '戴廷軒', '洪郁雯', '彭楷翔'
];
const MOCK_CLASSES = ['3年甲班', '4年乙班', '5年丙班', '6年丁班'];

class DesktopDatabase {
  private sheetsUrl: string = '';

  constructor() {
    this.sheetsUrl = localStorage.getItem('detective_google_sheets_url') || (import.meta as any).env?.VITE_GOOGLE_SHEETS_API_URL || '';
  }

  // -----------------------------------------
  // GOOGLE SHEETS API SETTINGS
  // -----------------------------------------
  public getGoogleSheetsUrl(): string {
    return this.sheetsUrl;
  }

  public setGoogleSheetsUrl(url: string): void {
    this.sheetsUrl = url.trim();
    localStorage.setItem('detective_google_sheets_url', this.sheetsUrl);
  }

  public async testConnection(urlToTest: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(urlToTest, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'sync',
          studentClass: '測試班級',
          studentNo: '99',
          name: '連線測試帳號'
        })
      });
      if (!response.ok) {
        throw new Error(`HTTP 錯誤碼: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        return { success: true, message: '連線測試成功！伺服器回應已成功初始化或讀取表格。' };
      } else {
        return { success: false, message: `伺服器連線成功但回應錯誤: ${data.error || '原因未知'}` };
      }
    } catch (e: any) {
      return { success: false, message: `測試連線到 Google Sheets 失敗: ${e.message || String(e)}` };
    }
  }

  // Google Apps Script source code template for teachers to copy
  public getGASCode(): string {
    return `/**
 * 丸子老師思維數學學堂 - Google Sheets 資料同步腳本
 * 
 * 📝 設定與部署說明：
 * 1. 在 Google 雲端硬碟建立一個新的「Google 試算表」。
 * 2. 點選試算表選單：「擴充功能」 ➜ 「Apps Script」。
 * 3. 將原有的程式碼清空，並把下方腳本全部「複製」貼上，然後按「儲存」(鍵盤 Ctrl+S / Cmd+S)。
 * 4. 點選右上角的「部署」 ➜ 「新部署」。
 * 5. 點選左邊小齒輪，選擇「網頁應用程式」類型。
 * 6. 設定：
 *    - 「說明」: Maruko Detective Sync Portal
 *    - 「執行身分」: 選擇「我」(導師您的 Google 帳號)
 *    - 「誰有權限存取」: 必須選擇「任何人」(這會提供給學生裝置存取權，且不會洩露您的 Google 密碼)
 * 7. 按下「部署」並授權存取。
 * 8. 複製產生的「網頁應用程式 URL」，返回遊戲貼上即可啟用即時跨裝置雲端資料庫！
 */

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  // 建立 JSON 回應，並啟用 CORS 標頭以供網頁呼叫
  var output;
  
  try {
    var rawData = e && e.postData && e.postData.contents ? e.postData.contents : null;
    var params = {};
    if (rawData) {
      params = JSON.parse(rawData);
    } else if (e && e.parameter) {
      params = e.parameter;
    }
    
    // 取得第一個分頁
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    
    // 如果試算表是空的，則自動初始化表格頭
    if (sheet.getLastColumn() === 0) {
      sheet.appendRow([
        "班級", "座號", "姓名", "金幣", "體力", 
        "等級", "經驗值(XP)", "偵探稱號", "答對題數", 
        "成就進度(JSON)", "格子收集(JSON)", "最後更新時間"
      ]);
      // 標頭樣式美化
      sheet.getRange(1, 1, 1, 12).setFontWeight("bold").setBackground("#E2E8F0").setHorizontalAlignment("center");
    }
    
    var action = params.action || e.parameter.action || "sync";
    
    if (action === "sync") {
      var studentClass = params.studentClass || "";
      var studentNo = params.studentNo || "";
      var name = params.name || "";
      
      if (!name || !studentClass) {
        return createJsonResponse({ success: false, error: "缺少必要參數 (姓名或班級)" });
      }
      
      // 搜尋是否已有該學生 rows
      var data = sheet.getDataRange().getValues();
      var rowIndex = -1;
      for (var i = 1; i < data.length; i++) {
        if (data[i][0] == studentClass && String(data[i][1]) == String(studentNo) && data[i][2] == name) {
          rowIndex = i + 1; // 1-based index
          break;
        }
      }
      
      var nowStr = new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });
      
      if (params.stats) {
        // 儲存模式: 將數據寫入對應的資料行
        var s = params.stats;
        var rData = [
          studentClass,
          studentNo,
          name,
          s.coins !== undefined ? s.coins : 300,
          s.stamina !== undefined ? s.stamina : 5,
          s.level !== undefined ? s.level : 1,
          s.xp !== undefined ? s.xp : 0,
          s.detectiveRank || "邏輯新鮮人",
          s.solvedCount !== undefined ? s.solvedCount : 0,
          params.achievements ? JSON.stringify(params.achievements) : "[]",
          params.collections ? JSON.stringify(params.collections) : "[]",
          nowStr
        ];
        
        if (rowIndex !== -1) {
          sheet.getRange(rowIndex, 1, 1, 12).setValues([rData]);
        } else {
          sheet.appendRow(rData);
        }
        
        return createJsonResponse({ success: true, message: "資料同步儲存成功！", lastUpdated: nowStr });
      } else {
        // 讀取模式: 抓取學生現有的存檔
        if (rowIndex !== -1) {
          var rowValues = sheet.getRange(rowIndex, 1, 1, 12).getValues()[0];
          
          // 嘗試解析 JSON 字串
          var ach = [];
          try { ach = JSON.parse(rowValues[9] || "[]"); } catch(ex) {}
          var col = [];
          try { col = JSON.parse(rowValues[10] || "[]"); } catch(ex) {}
          
          var responseStats = {
            name: rowValues[2],
            studentClass: rowValues[0],
            studentNo: rowValues[1],
            level: Number(rowValues[5]) || 1,
            xp: Number(rowValues[6]) || 0,
            coins: Number(rowValues[3]) || 300,
            stamina: Number(rowValues[4]) || 5,
            maxStamina: 5,
            detectiveRank: rowValues[7] || "邏輯新鮮人",
            solvedCount: Number(rowValues[8]) || 0,
            solvedByDifficulty: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 },
            solvedByTheme: {},
            unstoppableStreak: 0,
            lastLoginDate: rowValues[11] || "",
            isDailyDoneToday: false,
            hintsUsed: 0
          };
          
          return createJsonResponse({
            success: true,
            found: true,
            stats: responseStats,
            achievements: ach,
            collections: col,
            walkthroughCompleted: true
          });
        } else {
          // 學生第一次登入
          return createJsonResponse({
            success: true,
            found: false,
            message: "找不到此探員的雲端記錄，即將在本地建立新帳號，並將在您下次通關或儲存時覆寫回雲端試算表。"
          });
        }
      }
    }
    
    if (action === "getAll") {
      var allData = sheet.getDataRange().getValues();
      var students = [];
      for (var i = 1; i < allData.length; i++) {
        students.push({
          studentClass: allData[i][0] || "",
          studentNo: allData[i][1] || "",
          name: allData[i][2] || "",
          coins: Number(allData[i][3]) || 0,
          stamina: Number(allData[i][4]) || 0,
          level: Number(allData[i][5]) || 1,
          xp: Number(allData[i][6]) || 0,
          detectiveRank: allData[i][7] || "邏輯新鮮人",
          solvedCount: Number(allData[i][8]) || 0,
          lastUpdated: allData[i][11] || ""
        });
      }
      return createJsonResponse({ success: true, data: students });
    }
    
    return createJsonResponse({ success: false, error: "不正確的操作指令" });
    
  } catch (error) {
    return createJsonResponse({ success: false, error: error.toString() });
  }
}

function createJsonResponse(obj) {
  var output = ContentService.createTextOutput(JSON.stringify(obj));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}`;
  }

  // -----------------------------------------
  // GOOGLE SHEETS CLOUD SYNCHRONIZATION (MULTIDEVICE)
  // -----------------------------------------
  public async syncStudentProfileFirestore(
    studentClass: string,
    studentNo: string,
    name: string
  ): Promise<{
    stats: any;
    achievements: any;
    collections: any;
    walkthroughCompleted: boolean;
  } | null> {
    if (!this.sheetsUrl) {
      console.log('ℹ️ Google Sheets url is not configured yet. Fallback to LocalStorage.');
      return null;
    }

    try {
      const response = await fetch(this.sheetsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          action: 'sync',
          studentClass,
          studentNo,
          name
        })
      });

      if (!response.ok) throw new Error(`HTTP 錯誤狀態碼: ${response.status}`);
      const result = await response.json();
      
      if (result.success && result.found && result.stats) {
        console.log('📊 從 Google Sheets 試算表恢復探員進度！', result);
        
        // Cache Google Sheets state to local storage for offline use
        localStorage.setItem('detective_student_profile', JSON.stringify(result.stats));
        localStorage.setItem('detective_stats', JSON.stringify(result.stats));
        localStorage.setItem('detective_nickname', result.stats.name || name);
        if (result.achievements) {
          localStorage.setItem('detective_achievements', JSON.stringify(result.achievements));
        }
        if (result.collections) {
          localStorage.setItem('detective_collections', JSON.stringify(result.collections));
        }
        localStorage.setItem('detective_walkthrough_completed', 'true');

        return {
          stats: result.stats,
          achievements: result.achievements || [],
          collections: result.collections || [],
          walkthroughCompleted: true,
        };
      } else {
        // First-time student, push local profile default on next save
        console.log('📊 第一次登入雲端帳號，建立初始化行...');
        await this.uploadStudentProfileFirestore(studentClass, studentNo, name);
      }
    } catch (e) {
      console.warn('❌ Google Sheets 同步失敗，回退至本地 LocalStorage 存檔:', e);
    }
    return null;
  }

  public async uploadStudentProfileFirestore(
    studentClass: string,
    studentNo: string,
    name: string
  ): Promise<void> {
    if (!this.sheetsUrl) return;

    try {
      const rawStats = localStorage.getItem('detective_student_profile');
      const stats = rawStats ? JSON.parse(rawStats) : this.getOrCreateStats(name, studentClass, studentNo);
      
      const rawAchievements = localStorage.getItem('detective_achievements');
      const achievements = rawAchievements ? JSON.parse(rawAchievements) : [];

      const rawCollections = localStorage.getItem('detective_collections');
      const collections = rawCollections ? JSON.parse(rawCollections) : [];

      const mainWalkthroughCompleted = localStorage.getItem('detective_walkthrough_completed') === 'true';

      await fetch(this.sheetsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          action: 'sync',
          studentClass,
          studentNo,
          name,
          stats,
          achievements,
          collections,
          walkthroughCompleted: mainWalkthroughCompleted
        })
      });

      console.log('📊 已將探員進度同步覆寫至 Google Sheets 雲端試算表！');
    } catch (e) {
      console.warn('❌ 失敗上傳至 Google Sheets:', e);
    }
  }

  public saveGameStateToCloudAndLocal(
    updatedStats: PlayerStats & { name: string; studentClass: string; studentNo: string },
    updatedAchievements: Achievement[],
    updatedCollections: CollectionItem[],
    walkthroughCompleted: boolean
  ) {
    // 1. Write to local storage
    localStorage.setItem('detective_student_profile', JSON.stringify(updatedStats));
    localStorage.setItem('detective_stats', JSON.stringify(updatedStats));
    localStorage.setItem('detective_nickname', updatedStats.name);
    localStorage.setItem('detective_achievements', JSON.stringify(updatedAchievements));
    localStorage.setItem('detective_collections', JSON.stringify(updatedCollections));
    localStorage.setItem('detective_walkthrough_completed', String(walkthroughCompleted));

    // 2. Perform Google Sheets sync if URL is loaded
    if (this.sheetsUrl) {
      fetch(this.sheetsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          action: 'sync',
          studentClass: updatedStats.studentClass,
          studentNo: updatedStats.studentNo,
          name: updatedStats.name,
          stats: updatedStats,
          achievements: updatedAchievements,
          collections: updatedCollections,
          walkthroughCompleted: walkthroughCompleted
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log('📊 Google Sheets 雲端同步完成！');
        } else {
          console.warn('📊 Google Sheets 同步回覆異常:', data);
        }
      })
      .catch(err => console.warn('❌ Google Sheets 寫入失敗 (可能處於離線狀態):', err));
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
    localStorage.setItem('detective_stats', JSON.stringify(data));
    localStorage.setItem('detective_nickname', data.name);
    
    // Async background sync
    this.uploadStudentProfileFirestore(data.studentClass, data.studentNo, data.name);
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

    // Also trigger profile write on Sheets containing stats
    if (this.sheetsUrl) {
      this.uploadStudentProfileFirestore(entry.studentClass, entry.studentNo, entry.playerName);
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

    // Generate simulated stats data
    const list: SQLLeaderboardEntry[] = [];
    const subjects = ['思考章節任務', '失蹤的金杯', '每日思維日課', '太空奧秘挑戰'];
    
    for (let i = 0; i < 40; i++) {
      const pName = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)];
      const pClass = MOCK_CLASSES[Math.floor(Math.random() * MOCK_CLASSES.length)];
      const pNo = String(Math.floor(Math.random() * 30) + 1).padStart(2, '0');
      const tSecs = Math.floor(Math.random() * 240) + 45;
      const errs = Math.floor(Math.random() * 3);
      const hints = Math.floor(Math.random() * 2);
      const score = Math.max(200, 1000 - Math.floor(tSecs / 2) - errs * 100 - hints * 50);
      
      const dateOffset = Math.floor(Math.random() * 14);
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
    
    const isThisWeek = (dateStr: string) => {
      const d = new Date(dateStr);
      const diffTime = Math.abs(today.getTime() - d.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    };

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

    if (type === 'growth') {
      filtered.sort((a, b) => {
        if (a.errorsCount !== b.errorsCount) return a.errorsCount - b.errorsCount;
        if (a.hintsCount !== b.hintsCount) return a.hintsCount - b.hintsCount;
        return a.timeSeconds - b.timeSeconds;
      });
    } else {
      filtered.sort((a, b) => b.totalScore - a.totalScore);
    }

    return filtered.slice(0, 15);
  }

  // Fetch live sheets leaderboard
  public async fetchLiveLeaderboard(): Promise<SQLLeaderboardEntry[]> {
    if (!this.sheetsUrl) return [];
    try {
      const response = await fetch(`${this.sheetsUrl}?action=getAll`);
      if (!response.ok) return [];
      const result = await response.json();
      if (result.success && result.data) {
        const entries: SQLLeaderboardEntry[] = result.data.map((s: any, idx: number) => {
          const score = (s.level || 1) * 300 + (s.solvedCount || 0) * 100 + (Number(s.coins) || 0) * 2;
          return {
            id: `sheet_${idx}_${s.studentClass}_${s.studentNo}`,
            playerName: s.name,
            studentClass: s.studentClass,
            studentNo: s.studentNo,
            puzzleName: `等 ${s.level} 級 / 已破 ${s.solvedCount} 案`,
            timeSeconds: 0,
            errorsCount: 0,
            hintsCount: 0,
            totalScore: score,
            date: s.lastUpdated ? s.lastUpdated.split(' ')[0] : '最近'
          };
        });
        entries.sort((a, b) => b.totalScore - a.totalScore);
        return entries;
      }
    } catch (e) {
      console.warn('❌ 無法抓取雲端排行:', e);
    }
    return [];
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
