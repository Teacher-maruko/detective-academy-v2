import React, { useState, useEffect } from 'react';
import { Difficulty, Clue, ClueType, Puzzle } from '../types';
import { dbService, TeacherPuzzle } from '../logic/db';
import { countSolutions } from '../logic/puzzleGenerator';
import { 
  BookOpen, Plus, Trash2, Copy, Play, CheckCircle, AlertTriangle, 
  HelpCircle, ChevronLeft, Save, Edit, Eye, FolderHeart, Laptop, 
  Tag, Compass, Smile, Type, Check, RefreshCw
} from 'lucide-react';

// Taiwan thematic categories and beautiful presets for primary students
const PRESET_THEMES: Record<string, {
  name: string;
  emoji: string;
  categories: { name: string; key: string; items: string[]; icons: string[] }[];
}> = {
  animal: {
    name: '動物世界',
    emoji: '🦁',
    categories: [
      { name: '小動物組合', key: 'character', items: ['小熊', '兔子', '貓咪', '小狗', '小豬', '猴子'], icons: ['🐻', '🐰', '🐱', '🐶', '🐷', '🐵'] },
      { name: '喜愛食物', key: 'food', items: ['蜂蜜', '胡蘿蔔', '小魚仔', '肉骨頭', '小地瓜', '香蕉'], icons: ['🍯', '🥕', '🐟', '🍖', '🍠', '🍌'] },
      { name: '居住房間', key: 'room', items: ['紅色房', '黃色房', '藍色房', '綠色房', '橙色房', '紫色房'], icons: ['🟥', '🟨', '🟦', '🟩', '🟧', '🟪'] }
    ]
  },
  fruit: {
    name: '水果樂園',
    emoji: '🍉',
    categories: [
      { name: '水果主角', key: 'fruit', items: ['蘋果', '香蕉', '西瓜', '葡萄', '草莓', '櫻桃'], icons: ['🍎', '🍌', '🍉', '🍇', '🍓', '🍒'] },
      { name: '裝盛籃子', key: 'basket', items: ['竹編籃', '木製盒', '手提袋', '塑膠籃', '玻璃盆', '鐵罐子'], icons: ['🧺', '📦', '🛍️', '🗑️', '🥣', '🥫'] },
      { name: '生產果園', key: 'farm', items: ['陽光果園', '微風山丘', '彩虹農場', '綠野山谷', '清水農場', '金沙海灘'], icons: ['☀️', '🌬️', '🌈', '🌿', '💧', '🏝️'] }
    ]
  },
  transport: {
    name: '交通工具展',
    emoji: '🚀',
    categories: [
      { name: '載具主角', key: 'vehicle', items: ['小汽車', '高鐵火車', '噴射飛機', '大輪船', '單車', '火箭'], icons: ['🚗', '🚊', '✈', '🚢', '🚲', '🚀'] },
      { name: '出發地點', key: 'origin', items: ['臺北站', '高雄港', '桃園機場', '花蓮驛站', '臺中港', '太空總署'], icons: ['🏙️', '⚓', '🛫', '⛰️', '🚢', '📡'] },
      { name: '駕駛人員', key: 'operator', items: ['老李', '老王', '陳叔叔', '林阿姨', '張哥哥', '劉姐姐'], icons: ['👨', '🧑', '💂', '👩', '👦', '👧'] }
    ]
  },
  career: {
    name: '職業小達人',
    emoji: '👮',
    categories: [
      { name: '核心職業', key: 'job', items: ['丸子老師', '李醫生', '陳消防員', '張警察', '趙廚師', '王太空人'], icons: ['🧑‍🏫', '🧑‍⚕️', '🧑‍🔥', '👮', '🧑‍🍳', '🧑‍🚀'] },
      { name: '使用工具', key: 'tool', items: ['大黑板', '聽診器', '高壓水槍', '對講機', '大湯勺', '控制台'], icons: ['📚', '🩺', '🧯', '📻', '🍳', '💻'] },
      { name: '執勤區域', key: 'location', items: ['電腦教室', '小兒科', '消防大隊', '警政派出所', '烘焙城堡', '宇宙觀測站'], icons: ['🏫', '🏥', '🚒', '🚨', '🍰', '🌌'] }
    ]
  },
  math: {
    name: '趣味數學角',
    emoji: '📐',
    categories: [
      { name: '幾何形狀', key: 'shape', items: ['三角形', '圓形', '長方形', '正方形', '星形', '梯形'], icons: ['🔺', '🟢', '🎴', '⬜', '⭐', '🎈'] },
      { name: '代表數字', key: 'number', items: ['十點', '二十點', '三十點', '四十點', '五十點', '六十點'], icons: ['🔟', '🔸', '🎟️', '🏅', '🏆', '💎'] },
      { name: '輔助文具', key: 'math_tool', items: ['三角尺', '老算盤', '直刻度尺', '圓規儀', '量角器', '大筆記本'], icons: ['📐', '🧮', '📏', '🧭', '🌀', '📘'] }
    ]
  },
  campus: {
    name: '校園生活點滴',
    emoji: '🎒',
    categories: [
      { name: '值日學生', key: 'student', items: ['曾小明', '林佳羽', '張小強', '張允傑', '李美莉', '王大維'], icons: ['👦', '👧', '🧑', '👨', '👩', '👶'] },
      { name: '負責工作', key: 'duty', items: ['擦黑板', '排課桌椅', '倒資源回收', '給盆栽澆水', '倒灰塵垃圾', '導護小尖兵'], icons: ['🧹', '🪑', '♻️', '🌱', '🗑️', '🚩'] },
      { name: '專屬道具', key: 'item', items: ['藍書包', '語文課本', '大圓規', '紅水壺', '黃雨傘', '筆記本'], icons: ['🎒', '📚', '📐', '🥛', '🌂', '📓'] }
    ]
  }
};

interface TeacherPortalProps {
  onBack: () => void;
  onSelectPlayPuzzle: (puzzle: Puzzle) => void;
  soundEnabled: boolean;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({ onBack, onSelectPlayPuzzle, soundEnabled }) => {
  const [puzzles, setPuzzles] = useState<TeacherPuzzle[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLogged, setIsLogged] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // ---------------------------------
  // FORM STATES FOR COMPOSING PUZZLE
  // ---------------------------------
  const [title, setTitle] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('animal');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Lv1);
  const [size, setSize] = useState<number>(4); // default 4 positions
  const [mode, setMode] = useState<'text' | 'emoji' | 'mixed'>('mixed');
  
  // Dynamic categories content editable by teacher
  const [categories, setCategories] = useState<{ name: string; key: string; items: string[]; icons: string[] }[]>([]);
  const [clues, setClues] = useState<Clue[]>([]);

  // Validation feedback
  const [validationResult, setValidationResult] = useState<{
    status: 'unchecked' | 'perfect' | 'multiple' | 'no_solution';
    count: number;
    message: string;
  }>({ status: 'unchecked', count: 0, message: '尚未驗證題目。' });

  // Load puzzles originally
  useEffect(() => {
    setPuzzles(dbService.getTeacherPuzzles());
  }, []);

  // Update categories form whenever Theme or Size changes
  useEffect(() => {
    if (!editingId) return;
    const themeData = PRESET_THEMES[selectedTheme] || PRESET_THEMES.animal;
    
    // Feed theme defaults but slice according to requested columns "Size"
    const loaded = themeData.categories.map(cat => ({
      name: cat.name,
      key: cat.key,
      items: cat.items.slice(0, size),
      icons: cat.icons.slice(0, size)
    }));
    setCategories(loaded);
    // Reset clues and validator
    setClues([]);
    setValidationResult({ status: 'unchecked', count: 0, message: '基礎配置變更，請重新建立並驗證線索。' });
  }, [selectedTheme, size, editingId]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'maruko' || password === '888' || password === '') {
      setIsLogged(true);
      setLoginError('');
    } else {
      setLoginError('密碼不正確哦！提示：國小教師可以直接免密碼或輸入 888 快速進入。');
    }
  };

  const handleCreateNew = () => {
    setEditingId('new_' + Date.now());
    setTitle('未命名思考大難題');
    setSelectedTheme('campus');
    setSize(4);
    setDifficulty(Difficulty.Lv2);
    setMode('mixed');
    
    const themeData = PRESET_THEMES.campus;
    const initialCats = themeData.categories.map(cat => ({
      name: cat.name,
      key: cat.key,
      items: cat.items.slice(0, 4),
      icons: cat.icons.slice(0, 4)
    }));
    setCategories(initialCats);
    setClues([]);
    setValidationResult({ status: 'unchecked', count: 0, message: '新題目建立，請填寫線索並驗證。' });
  };

  const handleEdit = (p: TeacherPuzzle) => {
    setEditingId(p.id);
    setTitle(p.title);
    setSelectedTheme(p.category);
    setSize(p.size);
    setDifficulty(p.difficulty);
    setMode(p.mode);
    setCategories(p.categories);
    setClues(p.clues);
    setValidationResult({ status: 'unchecked', count: 0, message: '載入現有案件，請點選下方驗證。' });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('確定要刪除這個自訂考題嗎？學員將無法再玩此題。')) {
      dbService.deleteTeacherPuzzle(id);
      setPuzzles(dbService.getTeacherPuzzles());
    }
  };

  const handleCopy = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dbService.copyTeacherPuzzle(id);
    setPuzzles(dbService.getTeacherPuzzles());
  };

  // ---------------------------------
  // ADDING AND COMPOSING CLUES FORM
  // ---------------------------------
  const [clueTemplate, setClueTemplate] = useState<ClueType>(ClueType.Pair);
  const [clueCatA, setClueCatA] = useState(0);
  const [clueItemA, setClueItemA] = useState(0);
  const [clueCatB, setClueCatB] = useState(1);
  const [clueItemB, setClueItemB] = useState(0);
  const [cluePos, setCluePos] = useState(0); // for specific position

  const handleAddClue = () => {
    if (categories.length === 0) return;

    let text = '';
    const itemA_Name = `${categories[clueCatA].icons[clueItemA]}【${categories[clueCatA].items[clueItemA]}】`;
    const itemB_Name = `${categories[clueCatB].icons[clueItemB]}【${categories[clueCatB].items[clueItemB]}】`;

    const params: Record<string, any> = {
      catA: clueCatA,
      itemA: clueItemA
    };

    switch (clueTemplate) {
      case ClueType.Pair:
        params.catB = clueCatB;
        params.itemB = clueItemB;
        text = `✨ ${itemA_Name} 的關聯同伴是 ${itemB_Name}。`;
        break;
      case ClueType.Exclude:
        params.catB = clueCatB;
        params.itemB = clueItemB;
        text = `❌ 可以確定的是，${itemA_Name} 不會是 ${itemB_Name} 的組合。`;
        break;
      case ClueType.LeftOf:
        params.catB = clueCatB;
        params.itemB = clueItemB;
        text = `👈 ${itemA_Name} 恰好坐在 ${itemB_Name} 正左邊的一格。`;
        break;
      case ClueType.RightOf:
        params.catB = clueCatB;
        params.itemB = clueItemB;
        text = `👉 ${itemA_Name} 恰好坐在 ${itemB_Name} 正右邊的一格。`;
        break;
      case ClueType.Adjacent:
        params.catB = clueCatB;
        params.itemB = clueItemB;
        text = `🤝 ${itemA_Name} 與 ${itemB_Name} 坐在一塊兒（相鄰）。`;
        break;
      case ClueType.NotAdjacent:
        params.catB = clueCatB;
        params.itemB = clueItemB;
        text = `🚫 聽說過，${itemA_Name} 與 ${itemB_Name} 絕對沒有坐在一塊兒（不相鄰）。`;
        break;
      case ClueType.SpecificPosition:
        params.pos = cluePos;
        text = `📍 經過確認，${itemA_Name} 的座位序號正是在第 ${cluePos + 1} 個位置。`;
        break;
      case ClueType.OddPosition:
        text = `🎈 我們知道，${itemA_Name} 的座位序號是單數（奇數位置）。`;
        break;
      case ClueType.EvenPosition:
        text = `🎈 我們知道，${itemA_Name} 的座位序號是雙數（偶數位置）。`;
        break;
      case ClueType.LessThan:
        params.catB = clueCatB;
        params.itemB = clueItemB;
        text = `🔎 ${itemA_Name} 的位置比 ${itemB_Name} 更靠左邊。`;
        break;
      case ClueType.GreaterThan:
        params.catB = clueCatB;
        params.itemB = clueItemB;
        text = `🔎 ${itemA_Name} 的位置比 ${itemB_Name} 更靠右邊。`;
        break;
      default:
        return;
    }

    const newClue: Clue = {
      id: `custom_clue_${Date.now()}_${Math.floor(Math.random() * 100)}`,
      text,
      type: clueTemplate,
      params
    };

    setClues([...clues, newClue]);
    setValidationResult({ status: 'unchecked', count: 0, message: '線索已新增，請重新執行驗證！' });
  };

  const handleRemoveClue = (id: string) => {
    setClues(clues.filter(c => c.id !== id));
    setValidationResult({ status: 'unchecked', count: 0, message: '線索已移除，請重新執行驗證！' });
  };

  // ---------------------------------
  // UNIQUE SOLUTION SOLVER VALIDATOR
  // ---------------------------------
  const handleValidatePuzzle = () => {
    if (clues.length === 0) {
      setValidationResult({
        status: 'no_solution',
        count: 0,
        message: '⚠️ 線索不能是空的！請先在上方點選新增數條邏輯線索。'
      });
      return;
    }

    const { count, completedSolution } = countSolutions(clues, size, categories.length, 3000);

    if (count === 0) {
      setValidationResult({
        status: 'no_solution',
        count: 0,
        message: '⚠️ 此題目無解！你放置的線索之間存在邏輯衝突，導致系統回溯搜尋後發現沒有任何一種填寫排列能符合全部線索！請檢查並修正線索。'
      });
    } else if (count > 1) {
      setValidationResult({
        status: 'multiple',
        count,
        message: `⚠️ 此題存在多重解（共 ${count} 種可能排法）！這意味著學生可以使用消去法推出好幾種合規排法，線索不夠嚴格。建議點選上方再添加「相鄰 / 正好在左邊 / 指名顏色 pairing 」等能鎖定位置的排除線索！`
      });
    } else {
      setValidationResult({
        status: 'perfect',
        count: 1,
        message: '✅ 完美的唯一正確解！此邏輯謎題線索環節相扣，能透過排除推理推導出唯一的精準答案，百分之百適合作為課堂推理任務！'
      });
    }
  };

  const handleSave = () => {
    const { count } = countSolutions(clues, size, categories.length, 3000);
    const hasSingleSolution = count === 1;

    // Build the virtual ground truth solution array
    let finalSolution: number[][] = Array.from({ length: size }, () => Array(categories.length).fill(0));
    const solver = countSolutions(clues, size, categories.length, 4000);
    if (solver.completedSolution) {
      finalSolution = solver.completedSolution;
    } else {
      // Create simple baseline permutation if unsolved to keep safe compile
      for (let s = 0; s < size; s++) {
        for (let c = 0; c < categories.length; c++) {
          finalSolution[s][c] = s;
        }
      }
    }

    const newPuzzle: TeacherPuzzle = {
      id: editingId!.startsWith('new_') ? `teacher_puzzle_${Date.now()}` : editingId!,
      title: title || '未命名思考考題',
      category: selectedTheme,
      difficulty,
      size,
      mode,
      categories,
      clues,
      solution: finalSolution,
      createdAt: new Date().toLocaleDateString()
    };

    dbService.saveTeacherPuzzle(newPuzzle);
    setPuzzles(dbService.getTeacherPuzzles());
    setEditingId(null);
    alert('🎉 題目已安全儲存！學員將能立刻在「開始冒險」的地圖頂部，暢玩你出題的課堂大挑戰！');
  };

  const handlePreviewPuzzle = () => {
    // Generate simulated single-play puzzle object
    const p: Puzzle = {
      id: `preview_${Date.now()}`,
      difficulty,
      themeId: selectedTheme,
      size,
      categories: categories.map(cat => ({
        name: cat.name,
        key: cat.key,
        items: cat.items,
        icons: cat.icons
      })),
      clues,
      solution: Array.from({ length: size }, () => Array(categories.length).fill(0))
    };

    const countCheck = countSolutions(clues, size, categories.length, 3000);
    if (countCheck.completedSolution) {
      p.solution = countCheck.completedSolution;
    }

    onSelectPlayPuzzle(p);
  };

  if (!isLogged) {
    return (
      <div className="bg-[#FFFBF0] border-4 border-slate-900 rounded-[32px] p-8 max-w-md mx-auto shadow-[6px_6px_0px_rgba(15,23,42,1)] text-center">
        <div className="w-16 h-16 bg-[#FFF066] border-4 border-slate-900 rounded-3xl flex items-center justify-center text-3xl mx-auto shadow-md mb-4 select-none">
          👩‍🏫
        </div>
        <h3 className="font-extrabold text-xl text-slate-900 mb-1">教師教學研究控制台</h3>
        <p className="text-slate-500 font-bold text-xs mb-6 px-2">
          歡迎進入丸子老師的推理研究室！在此可以自主命題、設計課堂考題並進行迷案解構。
        </p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="text-left">
            <label className="text-xs font-black text-slate-700 block mb-1">小提示：國小教師可以直接點選登入（免密碼）</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="請輸入教師通道防護碼..."
              className="w-full bg-white border-3 border-slate-900 rounded-xl py-2.5 px-4 font-black text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>

          {loginError && <p className="text-xs font-bold text-rose-500 text-left px-1">{loginError}</p>}

          <button
            type="submit"
            className="w-full bg-[#5B8DEF] hover:bg-blue-600 border-3 border-slate-900 text-white font-black py-3 rounded-xl cursor-pointer text-xs shadow-[2px_2px_0_rgba(15,23,42,1)]"
          >
            登入教學後台 ✨
          </button>
        </form>

        <button
          onClick={onBack}
          className="mt-6 text-slate-400 font-extrabold text-xs hover:text-slate-600 flex items-center justify-center gap-1 mx-auto"
        >
          <ChevronLeft className="w-4 h-4" /> <span>返回主選單</span>
        </button>
      </div>
    );
  }

  // ---------------------------------
  // EDITING MODE FORM PANEL
  // ---------------------------------
  if (editingId) {
    return (
      <div className="bg-[#FFFDF6] border-4 border-slate-900 rounded-[32px] p-6 shadow-[6px_6px_0px_rgba(15,23,42,1)] relative">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-dashed border-slate-300">
          <button
            onClick={() => setEditingId(null)}
            className="flex items-center gap-1 text-xs font-black text-slate-600 hover:text-slate-900 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" /> <span>取消並返回</span>
          </button>
          
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-1">
            <span>🎨 題目編輯器平台</span>
          </h3>
        </div>

        {/* Configurations Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          
          {/* Left Fields Column */}
          <div className="flex flex-col gap-4 bg-white border-2 border-slate-900 rounded-2xl p-4">
            <h4 className="font-extrabold text-xs text-slate-800 border-l-4 border-amber-400 pl-2">1. 考題基本定義</h4>
            
            <div>
              <label className="text-[10px] font-black text-slate-600 block mb-1">題目名稱</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：神奇森林的甜食配對大冒險..."
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl py-2 px-3 font-bold text-xs text-slate-800 focus:outline-none focus:border-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-black text-slate-600 block mb-1">主題分類預設</label>
                <select
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl p-2 font-bold text-xs text-slate-800 focus:outline-none focus:border-slate-900"
                >
                  <option value="campus">🎒 校園生活</option>
                  <option value="animal">🐯 動物世界</option>
                  <option value="fruit">🍉 水果樂園</option>
                  <option value="career">👮 職業小達人</option>
                  <option value="math">📐 趣味數學角</option>
                  <option value="transport">🚀 交通工具展</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-600 block mb-1">學生建議難度</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(Number(e.target.value))}
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl p-2 font-bold text-xs text-slate-800 focus:outline-none"
                >
                  <option value={1}>Lv1 基礎級 (國小三年級)</option>
                  <option value={2}>Lv2 簡單級 (國小四年級)</option>
                  <option value={3}>Lv3 普通級 (國小五年級)</option>
                  <option value={4}>Lv4 挑戰級 (國小六年級)</option>
                  <option value={5}>Lv5 專家級 (高階奧林匹克)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-black text-slate-600 block mb-1">位置格數大小 (Columns)</label>
                <select
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl p-2 font-bold text-xs text-slate-800 focus:outline-none"
                >
                  <option value={3}>3 格（超簡單/新生引導）</option>
                  <option value={4}>4 格（適中邏輯）</option>
                  <option value={5}>5 格（進階邏輯）</option>
                  <option value={6}>6 格（挑戰腦力）</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-600 block mb-1">視覺出題模式</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as any)}
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl p-2 font-bold text-xs text-slate-800 focus:outline-none"
                >
                  <option value="mixed">🖼️ 圖文組合模式 (熊 + Name)</option>
                  <option value="text">✍️ 純文字模式 (無圖片阻礙)</option>
                  <option value="emoji">🦁 僅 Emoji 模式 (適合低年級)</option>
                </select>
              </div>
            </div>

            {/* Displaying visual item preview */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase">元素內容預覽：</span>
              <div className="flex flex-col gap-1.5 mt-2">
                {categories.map((cat, ci) => (
                  <div key={ci} className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                    <span className="text-[10px] bg-slate-200 text-slate-700 rounded px-1.5 font-bold shrink-0">{cat.name}:</span>
                    {cat.items.map((it, ii) => (
                      <span key={ii} className="text-[11px] bg-white border px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 shrink-0 shadow-sm">
                        <span>{cat.icons[ii]}</span>
                        <span className="text-slate-600 text-[10px]">{it}</span>
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Adding Clues Component Builder */}
          <div className="flex flex-col gap-4 bg-white border-2 border-slate-900 rounded-2xl p-4">
            <h4 className="font-extrabold text-xs text-slate-800 border-l-4 border-amber-400 pl-2">2. 線索撰寫小幫手 (引導式表單)</h4>

            <div className="flex flex-col gap-2 bg-slate-50 border border-dashed border-slate-300 rounded-xl p-3">
              
              {/* Type Select */}
              <div>
                <label className="text-[9px] font-black text-slate-500 block mb-0.5">步驟 A: 選取線索句型</label>
                <select
                  value={clueTemplate}
                  onChange={(e) => setClueTemplate(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-semibold text-xs text-slate-800"
                >
                  <option value={ClueType.Pair}>同班關聯：「項目 A 與 項目 B 互相關聯」</option>
                  <option value={ClueType.Exclude}>排除可能：「項目 A 與 項目 B 絕對無關係」</option>
                  <option value={ClueType.LeftOf}>左鄰定位：「項目 A 正好在 項目 B 左邊一格」</option>
                  <option value={ClueType.RightOf}>右鄰定位：「項目 A 正好在 項目 B 右邊一格」</option>
                  <option value={ClueType.Adjacent}>相鄰同伴：「項目 A 與 項目 B 座位左右相鄰」</option>
                  <option value={ClueType.NotAdjacent}>分裂阻隔：「項目 A 與 項目 B 座位不相鄰」</option>
                  <option value={ClueType.SpecificPosition}>固定單座位：「項目 A 的座位在特定第幾格」</option>
                  <option value={ClueType.OddPosition}>單數奇座：「項目 A 的座位序列是單號」</option>
                  <option value={ClueType.EvenPosition}>雙數偶座：「項目 A 的座位序列是雙號」</option>
                  <option value={ClueType.LessThan}>比較靠左：「項目 A 坐得比 項目 B 靠左邊」</option>
                  <option value={ClueType.GreaterThan}>比較靠右：「項目 A 坐得比 項目 B 靠右邊」</option>
                </select>
              </div>

              {/* Elements mapping pickers */}
              {categories.length > 0 && (
                <div className="flex flex-col gap-2 mt-1">
                  
                  {/* Item A picker */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-black text-slate-500 block mb-0.5">選取 項目 A 分類</label>
                      <select
                        value={clueCatA}
                        onChange={(e) => { setClueCatA(Number(e.target.value)); setClueItemA(0); }}
                        className="w-full bg-white border border-slate-300 rounded-lg p-1 font-semibold text-xs text-slate-800"
                      >
                        {categories.map((cat, idx) => (
                          <option key={idx} value={idx}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-slate-500 block mb-0.5">選取 項目 A 目標</label>
                      <select
                        value={clueItemA}
                        onChange={(e) => setClueItemA(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg p-1 font-semibold text-xs text-slate-800"
                      >
                        {categories[clueCatA]?.items.map((it, idx) => (
                          <option key={idx} value={idx}>{categories[clueCatA].icons[idx]} {it}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Item B picker (rendered conditional on type) */}
                  {![ClueType.SpecificPosition, ClueType.OddPosition, ClueType.EvenPosition].includes(clueTemplate) && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-black text-slate-500 block mb-0.5">選取 項目 B 分類</label>
                        <select
                          value={clueCatB}
                          onChange={(e) => { setClueCatB(Number(e.target.value)); setClueItemB(0); }}
                          className="w-full bg-white border border-slate-300 rounded-lg p-1 font-semibold text-xs text-slate-800"
                        >
                          {categories.map((cat, idx) => (
                            <option key={idx} value={idx}>{cat.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[9px] font-black text-slate-500 block mb-0.5">選取 項目 B 目標</label>
                        <select
                          value={clueItemB}
                          onChange={(e) => setClueItemB(Number(e.target.value))}
                          className="w-full bg-white border border-slate-300 rounded-lg p-1 font-semibold text-xs text-slate-800"
                        >
                          {categories[clueCatB]?.items.map((it, idx) => (
                            <option key={idx} value={idx}>{categories[clueCatB].icons[idx]} {it}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Specific Position selection picker list */}
                  {clueTemplate === ClueType.SpecificPosition && (
                    <div>
                      <label className="text-[9px] font-black text-slate-500 block mb-0.5">指定第幾列格子（左起，0 為起點）</label>
                      <select
                        value={cluePos}
                        onChange={(e) => setCluePos(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg p-1 font-semibold text-xs text-slate-850"
                      >
                        {Array.from({ length: size }).map((_, idx) => (
                          <option key={idx} value={idx}>第 {idx + 1} 個格子</option>
                        ))}
                      </select>
                    </div>
                  )}

                </div>
              )}

              {/* Action Button to drop Clue */}
              <button
                type="button"
                onClick={handleAddClue}
                className="mt-2 w-full bg-[#6BCB77] hover:bg-emerald-500 border-2 border-slate-900 text-slate-950 font-black py-2 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> <span>新增這條推理線索</span>
              </button>

            </div>

          </div>

        </div>

        {/* Current Active Clues Box List */}
        <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 mb-6">
          <h4 className="font-extrabold text-xs text-slate-800 flex justify-between items-center mb-3">
            <span>📝 已加入之關卡邏輯線索 ({clues.length} 條)</span>
            <span className="text-[10px] text-slate-400 font-bold">請確保能推倒出唯一一組解</span>
          </h4>

          {clues.length === 0 ? (
            <div className="text-center py-6 text-slate-400 font-bold text-xs bg-slate-50 border border-dashed rounded-xl">
              目前尚未加入任何線索！請使用右上方幫手進行配置添加。
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
              {clues.map((c) => (
                <div key={c.id} className="bg-amber-50/40 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-750">{c.text}</span>
                  <button
                    onClick={() => handleRemoveClue(c.id)}
                    className="text-slate-400 hover:text-rose-500 transition-all p-1 cursor-pointer"
                    title="移除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Puzzle Validator Panel Checker */}
        <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-150 mb-3">
            <div>
              <h4 className="font-black text-slate-900 text-xs">🧪 Puzzle Solver Validator：唯一解合理自檢系統</h4>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                利用內嵌回溯約束求解演算法，確保教師出題不會有無解或多重答案的疏漏。
              </p>
            </div>
            <button
              type="button"
              onClick={handleValidatePuzzle}
              className="bg-[#FFF066] hover:bg-amber-400 text-slate-950 border-2 border-slate-900 font-black text-xs py-1.5 px-4 rounded-xl cursor-pointer flex items-center gap-1 shrink-0 shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" /> <span>執行題目推理驗證</span>
            </button>
          </div>

          <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs transition-all ${
            validationResult.status === 'perfect' 
              ? 'bg-emerald-50 border-emerald-300 text-emerald-850'
              : validationResult.status === 'multiple'
              ? 'bg-amber-50 border-amber-300 text-amber-850'
              : validationResult.status === 'no_solution'
              ? 'bg-rose-50 border-rose-300 text-rose-850'
              : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>
            <div className="shrink-0 mt-0.5">
              {validationResult.status === 'perfect' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
              {validationResult.status === 'multiple' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
              {validationResult.status === 'no_solution' && <AlertTriangle className="w-5 h-5 text-rose-500" />}
              {validationResult.status === 'unchecked' && <HelpCircle className="w-5 h-5 text-slate-400" />}
            </div>
            <div>
              <span className="font-black">自檢狀態回報：</span>
              <p className="font-bold text-[11px] leading-relaxed mt-1">
                {validationResult.message}
              </p>
            </div>
          </div>
        </div>

        {/* Footer actions toolbar */}
        <div className="flex justify-end items-center gap-3">
          <button
            onClick={handlePreviewPuzzle}
            disabled={clues.length === 0}
            className={`font-black text-xs py-3 px-6 rounded-2xl border-2 cursor-pointer flex items-center gap-1.5 transition-all ${
              clues.length === 0
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                : 'bg-indigo-50 border-indigo-400 text-indigo-750 hover:bg-indigo-100'
            }`}
          >
            <Eye className="w-4 h-4" /> <span>預覽測試題目</span>
          </button>

          <button
            onClick={handleSave}
            disabled={clues.length === 0}
            className={`font-black text-xs py-3 px-8 rounded-2xl border-3 border-slate-950 cursor-pointer flex items-center gap-1.5 transition-all shadow-md ${
              clues.length === 0
                ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed shadow-none'
                : 'bg-[#6BCB77] text-slate-950 hover:bg-emerald-500'
            }`}
          >
            <Save className="w-4 h-4" /> <span>發布並儲存出題</span>
          </button>
        </div>

      </div>
    );
  }

  // ---------------------------------
  // HOME / MANAGE LIST VIEW
  // ---------------------------------
  return (
    <div className="bg-[#FFFBF0] border-4 border-slate-900 rounded-[32px] p-6 shadow-[6px_6px_0px_rgba(15,23,42,1)] relative overflow-hidden">
      
      {/* Tape design */}
      <div className="absolute top-2 left-6 bg-blue-300 w-16 h-5 opacity-80" style={{ transform: 'rotate(-10deg)' }} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-5 border-b border-dashed border-slate-300">
        <div>
          <h3 className="font-extrabold text-xl text-slate-900 flex items-center gap-1.5">
            <BookOpen className="w-6 h-6 text-[#5B8DEF]" />
            <span>自製題庫管理中心 (教師後台)</span>
          </h3>
          <p className="text-slate-500 font-bold text-xs mt-0.5">
            專為課堂教學設計，教師可以在此客製化建立、複製和驗證邏輯格子的謎題。
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="bg-[#6BCB77] hover:bg-emerald-500 border-3 border-slate-950 text-slate-950 font-black text-xs py-2.5 px-5 rounded-2xl cursor-pointer shadow-[3px_3px_0_rgba(15,23,42,1)] hover:scale-105 active:scale-95 flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> <span>新增全新課堂考題</span>
        </button>
      </div>

      {puzzles.length === 0 ? (
        <div className="text-center py-16 bg-white border-2 border-dashed border-slate-300 rounded-3xl p-6 flex flex-col items-center justify-center gap-3">
          <FolderHeart className="w-14 h-14 text-slate-300" />
          <h4 className="font-extrabold text-slate-800 text-sm">目前尚無自製的推理大題目！</h4>
          <p className="text-slate-400 font-bold text-xs max-w-sm">
            點選右上方「新增全新課堂考題」來客製化一套適合你班上學生的主題，並透過唯一解系統自測試作吧！
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {puzzles.map((p) => {
            // Count validation stats
            const validation = countSolutions(p.clues, p.size, p.categories.length, 1500);
            const isSingle = validation.count === 1;

            return (
              <div
                key={p.id}
                onClick={() => handleEdit(p)}
                className="bg-white border-3 border-slate-900 rounded-2xl p-4 cursor-pointer shadow-[4px_4px_0_rgba(15,23,42,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_rgba(15,23,42,1)] transition-all flex flex-col justify-between gap-5 select-none"
              >
                
                {/* Header */}
                <div className="flex justify-between items-start gap-2">
                  <div className="flex flex-col">
                    <h4 className="font-black text-slate-900 text-sm truncate max-w-[170px]" title={p.title}>{p.title}</h4>
                    <span className="text-[10px] text-slate-400 font-bold">
                      大小: {p.size}格格子 • {p.createdAt} 建立
                    </span>
                  </div>

                  <span className={`text-[9px] font-black py-0.5 px-2 rounded-lg border-2 shrink-0 ${
                    isSingle 
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-850'
                      : 'bg-rose-100 border-rose-400 text-rose-850 animate-pulse'
                  }`}>
                    {isSingle ? '✓ 完美唯一解' : '⚡ 尚非唯一解'}
                  </span>
                </div>

                {/* Body items categories indicators */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] bg-amber-50 border text-amber-800 rounded px-1.5 py-0.5 font-bold shrink-0">
                    難度: Lv.{p.difficulty}
                  </span>
                  <span className="text-[10px] bg-blue-50 border text-blue-800 rounded px-1.5 py-0.5 font-bold shrink-0">
                    主題: {PRESET_THEMES[p.category]?.name || '自訂世界'}
                  </span>
                </div>

                {/* Actions bottom bar */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold">擁有 {p.clues.length} 條邏輯線索</span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleCopy(p.id, e)}
                      className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg border cursor-pointer hover:border-slate-300 transition-all"
                      title="複製一個草稿"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(p.id, e)}
                      className="p-1.5 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg border cursor-pointer transition-all"
                      title="移除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Close button */}
      <div className="text-center mt-12">
        <button
          onClick={onBack}
          className="py-2.5 px-6 rounded-xl border-2 border-slate-300 text-slate-500 font-bold text-xs hover:border-slate-400 cursor-pointer hover:text-slate-700 font-mono transition-all"
        >
          BACK TO RPG FRONT PAGE
        </button>
      </div>

    </div>
  );
};
