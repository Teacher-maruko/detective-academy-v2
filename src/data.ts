import { ThemeConfig, CollectionItem, Achievement } from './types';

export const DETECTIVE_CHAPTERS = [
  {
    chapter: 1,
    title: '第一章 校園謎案',
    caseName: '失蹤的冠軍獎盃',
    themeId: 'campus',
    description: '神探學院即將迎來一年一度的校慶，此時在榮譽展覽櫃中的「學院金獎盃」突然消失了！現場只留下了幾組怪異的泥腳印。校長、風紀與教職員各執一詞，你必須在混亂的校園中找出真正的拿走者、他藏寶的位置以及原因。',
    targetDifficulty: 1,
    rewardGold: 100,
    rewardXp: 150,
  },
  {
    chapter: 2,
    title: '第二章 神秘圖書館',
    caseName: '消失的黃銅鑰匙',
    themeId: 'magic',
    description: '傳說中藏有禁忌魔法書的奧秘圖書館被下了鎖，唯一一把「黃銅齒輪鑰匙」竟從管理員的手中不翼而飛！現場還有魔力的餘溫，嫌疑人都擁有不同的法術資質，請你解開咒語，找出是誰拿走了鑰匙。',
    targetDifficulty: 2,
    rewardGold: 150,
    rewardXp: 200,
  },
  {
    chapter: 3,
    title: '第三章 海洋研究所',
    caseName: '失蹤的研究資料',
    themeId: 'ocean',
    description: '在深海研究所的無菌艙內，用來開發淨化海洋的「潮汐配方晶片」遭到了竊取。當晚值班的人員中有人攜帶著奇特的海洋生物，地板上還殘留著特殊的熒光液體，透過線索排查出真兇吧！',
    targetDifficulty: 3,
    rewardGold: 200,
    rewardXp: 250,
  },
  {
    chapter: 4,
    title: '第四章 魔法學院',
    caseName: '被偷走的魔法書',
    themeId: 'magic',
    description: '大巫師精心保管的《無限真理之書》被偷走了。在星象閣裡，三位不同元素屬性的學徒與精靈都曾路過。現場殘留的元素微粒，將是拼湊出完整真相的唯一線索。',
    targetDifficulty: 4,
    rewardGold: 250,
    rewardXp: 300,
  },
  {
    chapter: 5,
    title: '第五章 時光列車',
    caseName: '消失的乘客',
    themeId: 'travel',
    description: '穿梭在世界歷史之流中的「克羅諾斯號列車」上，一名手握珍貴懷錶的英國富商在經過埃及站時離奇消失了！列車上的各國旅行者都心懷鬼胎，請用你的懷錶追尋時空的裂痕。',
    targetDifficulty: 5,
    rewardGold: 300,
    rewardXp: 350,
  },
  {
    chapter: 6,
    title: '第六章 太空基地',
    caseName: '神秘訊號事件',
    themeId: 'space',
    description: '銀河二號太空站接收到了一串神祕的外星加密電波。密碼解鎖權限被分散在了值班的太空人、科學家與機械寵物身上。你必須釐清當晚他們的對話順序與位置，才能阻止系統超載！',
    targetDifficulty: 6,
    rewardGold: 350,
    rewardXp: 400,
  },
  {
    chapter: 7,
    title: '第七章 恐龍博物館',
    caseName: '失竊化石事件',
    themeId: 'dino',
    description: '鎮館之寶「黃金暴龍眼眶化石」在暴風雨夜被盜。盜賊巧妙地避開了紅外線，展覽廳中各色恐龍玩偶被移動了位置。到底是哪位狂熱的考古學家或者恐龍愛好者所為？',
    targetDifficulty: 7,
    rewardGold: 400,
    rewardXp: 450,
  },
  {
    chapter: 8,
    title: '第八章 童話王國',
    caseName: '失落的皇冠',
    themeId: 'fairytale',
    description: '國王加冕大典前夕，藏在璀璨城堡頂端、鑲著紅藍寶石的「誓約皇冠」消失了。美麗的公主、忠誠的騎士、淘氣的精靈，他們每個人都曾出入過寶物庫。找出守護王國的關鍵。',
    targetDifficulty: 8,
    rewardGold: 500,
    rewardXp: 500,
  },
  {
    chapter: 9,
    title: '第九章 忍者村',
    caseName: '秘密卷軸事件',
    themeId: 'ninja',
    description: '影之卷軸，記載著村落古老奧秘的禁術，在滿月之夜被更換了。痕跡顯示竊賊擅長替身術。透過上忍、中忍、醫忍攜帶的忍具和守護獸，揪出出賣村莊的叛徒！',
    targetDifficulty: 5,
    rewardGold: 600,
    rewardXp: 600,
  },
  {
    chapter: 10,
    title: '第十章 未來城市',
    caseName: 'AI失控事件',
    themeId: 'future',
    description: '新賽博市的中央AI控制台「伊甸」被輸入了自毀病毒。工程師、發明家和高階仿生人曾先後進出主機室。在霓虹流光、數據閃爍的背後，到底誰是渴望機械自由的幕後黑手？',
    targetDifficulty: 6,
    rewardGold: 700,
    rewardXp: 700,
  },
  {
    chapter: 11,
    title: '第十一章 深海文明',
    caseName: '遺跡之謎',
    themeId: 'ocean',
    description: '在亞特蘭提斯千米海底的遺跡神殿中，用於維持海洋氣泡屏障的「海神之淚」水晶柱被不速之客拔除。海豚長老、海之女巫、人魚戰士紛紛指控對方，真相正被海水漸漸掩蓋。',
    targetDifficulty: 7,
    rewardGold: 800,
    rewardXp: 800,
  },
  {
    chapter: 12,
    title: '第十二章 平行宇宙',
    caseName: '最終真相',
    themeId: 'future',
    description: '虛無之門正緩慢打開，所有的時空坐標、主題、人物與物品發生了量子糾纏！在最後的調查中，你發現自己正處於所有時空交錯的核心。理清多元時空中的多重關聯，徹底揭開「無限解謎者」的終極目的！',
    targetDifficulty: 8,
    rewardGold: 1000,
    rewardXp: 1000,
  },
];

export const THEMES: Record<string, ThemeConfig> = {
  campus: {
    id: 'campus',
    name: '校園生活',
    icon: '🏫',
    bgGradient: 'from-blue-50 to-indigo-100',
    bannerEmoji: '🏫🎨📚',
    categories: [
      {
        name: '探員/涉案人',
        key: 'people',
        items: ['小明', '小華', '小強', '小莉', '風紀班長', '體育老師', '圖書管理員', '保健室阿姨', '守衛大叔', '天才轉學生', '校長先生', '幽靈同學'],
        icons: ['👦', '🧑', '👨', '👧', '👮', '🤸', '🧙', '👩‍⚕️', '🕵️', '👓', '👴', '👻']
      },
      {
        name: '代表顏色',
        key: 'color',
        items: ['紅色', '藍色', '綠色', '黃色', '橙色', '紫色', '粉色', '棕色', '黑色', '白色', '灰色', '金色'],
        icons: ['🔴', '🔵', '🟢', '🟡', '🟠', '🟣', '🌸', '🟤', '⚫', '⚪', '🪙', '⭐']
      },
      {
        name: '失蹤物品',
        key: 'item',
        items: ['冠軍獎盃', '金色懷錶', '理科考卷', '黃銅鑰匙', '神秘日記', '體育跳繩', '音樂大笛', '美術畫布', '校長鋼筆', '生化燒杯', '精緻便當', '校園播音機'],
        icons: ['🏆', '⏱️', '📝', '🔑', '📔', '🪢', '🎺', '🎨', '✒️', '🧪', '🍱', '📻']
      },
      {
        name: '攜帶寵物',
        key: 'pet',
        items: ['吉娃娃', '波斯貓', '小綠龜', '黃鸚鵡', '愛因斯坦倉鼠', '白長兔', '小柴犬', '金魚姬', '黑影蛛', '迷你蜥蜴', '花班天竺鼠', '迷路肥鴿'],
        icons: ['🐕', '🐈', '🐢', '🦜', '🐹', '🐇', '🐶', '🐠', '🕷️', '🦎', '🐖', '🐦']
      },
      {
        name: '目擊地點',
        key: 'place',
        items: ['校長室', '三年二班', '保健室', '風雨操場', '科學大樓', '神秘圖書館', '音樂教室', '生化閣樓', '噴水廣場', '地下檔案室', '空中花園', '學校大門口'],
        icons: ['🏢', '🚪', '🏥', '🏟️', '🔬', '📚', '🎹', '🧬', '⛲', '🗄️', '🌻', '⛩️']
      }
    ]
  },
  animal: {
    id: 'animal',
    name: '動物王國',
    icon: '🦁',
    bgGradient: 'from-green-50 to-emerald-100',
    bannerEmoji: '🦁🐼🦊',
    categories: [
      {
        name: '首領動物',
        key: 'people',
        items: ['獅子王', '熊貓阿寶', '機靈狐狸', '高傲貓咪', '忠誠柴犬', '長頸鹿大叔', '樹懶閃電', '浣熊酷哥', '鸚鵡導師', '猛毒響尾蛇', '白斑猛虎', '無尾熊寶寶'],
        icons: ['🦁', '🐼', '🦊', '🐱', '🐶', '🦒', '🦥', '🦝', '🦜', '🐍', '🐯', '🐨']
      },
      {
        name: '圖騰顏色',
        key: 'color',
        items: ['烈焰紅', '海洋藍', '森林綠', '向日黃', '紫羅蘭', '櫻花粉', '泥土棕', '深邃黑', '雪山白', '火山灰', '落日橘', '璀璨金'],
        icons: ['🔴', '🔵', '🟢', '🟡', '🟣', '🌸', '🟤', '⚫', '⚪', '🪙', '🟠', '⭐']
      },
      {
        name: '珍貴寶物',
        key: 'item',
        items: ['黃金香蕉', '極品竹筍', '七彩羽毛', '深海大珍珠', '神秘琥珀', '紅寶石骨頭', '生命之樹葉', '遠古化石', '冰山雪蓮', '智慧松果', '黑珍珠魚子', '星河碎片'],
        icons: ['🍌', '🎍', '🪶', '🦪', '💎', '🦴', '🍃', '🦴', '🪷', '🌰', '🐟', '☄️']
      },
      {
        name: '護衛跟班',
        key: 'pet',
        items: ['小蜜蜂', '瓢蟲妹', '獨角仙', '閃電螢火蟲', '毛毛蟲隊長', '粉紅小豬', '小鴨呱呱', '小雞啾啾', '松鼠飛飛', '黑蝙蝠', '青蛙王子', '金蟬子'],
        icons: ['🐝', '🐞', ' beetle', '🪰', '🐛', '🐖', '🦆', '🐥', '🐿️', '🦇', '🐸', '🦗']
      },
      {
        name: '領地之所',
        key: 'place',
        items: ['萬獸神殿', '青翠竹林', '迷霧森林', '日光草坪', '月影幽谷', '迴音山洞', '黃沙荒漠', '寒冰雪原', '溫泉溪流', '彩虹瀑布', '紅樹林沼澤', '萬蛇枯骨'],
        icons: ['🏛️', '🎋', '🌲', '🌱', '🌙', '🪨', '🏜️', '❄️', '♨️', '🌊', '🛶', '💀']
      }
    ]
  },
  dino: {
    id: 'dino',
    name: '恐龍世界',
    icon: '🦖',
    bgGradient: 'from-amber-50 to-orange-150',
    bannerEmoji: '🦖🦕🌋',
    categories: [
      {
        name: '巨無霸龍',
        key: 'people',
        items: ['霸王龍', '三角龍', '腕龍長脖', '副櫛龍音波', '迅猛龍閃電', '翼龍滑翔', '劍龍重甲', '甲龍大槌', '棘龍水霸', '厚頭龍鐵頭', '滄龍巨浪', '雷龍震撼'],
        icons: ['🦖', '🦕', '🦕', '🐊', '🐆', '🦅', '🛡️', '🔨', '🐊', '🐏', '🐬', '🌋']
      },
      {
        name: '恐龍蛋色',
        key: 'color',
        items: ['硫磺黃', '熔岩紅', '毒霧綠', '冰河藍', '煙幕灰', '焦炭黑', '磷光紫', '珊瑚粉', '泥沙棕', '雲霧白', '黏土橘', '鉑金閃'],
        icons: ['🟡', '🔴', '🟢', '🔵', '🪙', '⚫', '🟣', '🌸', '🟤', '⚪', '🟠', '⭐']
      },
      {
        name: '巢穴食物',
        key: 'item',
        items: ['巨型蘇鐵葉', '始祖鳥羽毛', '遠古蜻蜓', '發光蘑菇', '火山黑曜石', '猛獁牙齒', '琥珀松脂', '菊石化石', '三葉蟲乾', '熱帶芭蕉', '隕石殘片', '深海大王烏賊'],
        icons: ['🌿', '🪶', '🪰', '🍄', '🪨', '🦴', '🏺', '🐚', '🦂', '🍌', '☄️', '🦑']
      },
      {
        name: '共生夥伴',
        key: 'pet',
        items: ['始祖鳥小飛', '三葉蟲爬爬', '史前蜻蜓', '遠古跳蚤', '鸚鵡螺軟軟', '盾皮魚骨骨', '恐鳥大跑', '水獺始祖', '小鼩鼱球球', '猛獁象鼻鼻', '劍齒虎牙牙', '蛇頸龍水水'],
        icons: ['🦅', '🐞', '🦗', '🐜', '🐚', '🐟', '🦉', '🦦', '🐭', '🐘', '🐯', '🐉']
      },
      {
        name: '恐龍領域',
        key: 'place',
        items: ['蕨類森林', '沸騰熔岩河', '雷鳴峽谷', '碎骨沼澤', '始祖鳥峭壁', '巨足足印泥譚', '隕石撞擊坑', '滄龍深海溝', '極光凍土', '微風沙丘', '大風暴平原', '巨木枯林'],
        icons: ['🌳', '🔥', '🧗', '🐊', '⛰️', '👣', '🎯', '🌊', '🌌', '🏜️', '🌪️', '🪵']
      }
    ]
  },
  ocean: {
    id: 'ocean',
    name: '海洋探險',
    icon: '🐬',
    bgGradient: 'from-cyan-50 to-sky-200',
    bannerEmoji: '🐬🐳🐙',
    categories: [
      {
        name: '深海住民',
        key: 'people',
        items: ['海豚音速', '大白鯊教父', '殺人鯨警長', '百歲海龜仙', '章魚博士', '美麗人魚姬', '海馬巡邏員', '刺豚氣鼓鼓', '燈籠魚使者', '海星上尉', '水母幻影', '儒艮大媽'],
        icons: ['🐬', '🦈', '🐋', '🐢', '🐙', '🧜‍♀️', '🐴', '🐡', '🐟', '⭐', '🎐', '🦦']
      },
      {
        name: '珊瑚顏色',
        key: 'color',
        items: ['蔚藍色', '珊瑚橘', '深海黑', '浪花白', '海藻綠', '海葵粉', '夜光黃', '風暴紫', '流星銀', '貝殼珍珠白', '金砂黃', '胭脂紅'],
        icons: ['🔵', '🟠', '⚫', '⚪', '🟢', '🌸', '🟡', '🟣', '🪙', '🐚', '🟡', '🔴']
      },
      {
        name: '遺落沉船',
        key: 'item',
        items: ['海盜金幣寶箱', '皇家航海圖', '三叉戟神杖', '失傳美人魚歌譜', '海葵淨化珍珠', '深海沉木羅盤', '百年望遠鏡', '船長佩劍', '深淵沉沒黃金杯', '巨蟹黃金盾', '極地冰封魔笛', '亞特蘭提斯水晶'],
        icons: ['🪙', '📜', '🔱', '🎶', '🦪', '🧭', '🔭', '⚔️', '🏆', '🛡️', '🪈', '💎']
      },
      {
        name: '寵物魚類',
        key: 'pet',
        items: ['小丑魚尼莫', '飛魚滑翔仔', '清潔蝦剪刀', '寄居蟹搬家', '軟萌海蛞蝓', '海膽刺頭', '玻璃小蝦', '魔鬼魚飛飛', '吸盤魚貼貼', '翻車魚呆呆', '鸚鵡螺圓圓', '海天使冰冰'],
        icons: ['🐠', '🐟', '🦐', '🦀', '🐌', '🧆', '🦐', '🐟', '🐟', '🐟', '🐚', '🧚']
      },
      {
        name: '海洋底域',
        key: 'place',
        items: ['大堡礁淺灘', '海盜王沉船骸', '亞特蘭提斯神殿', '馬里亞納萬米深淵', '海底熱泉噴口', '發光海藻森林', '巨浪海上漩渦', '神秘幽靈島礁', '極地浮冰水域', '美人魚藍洞', '海神水晶宮', '大白鯊巨牙洞'],
        icons: ['🪸', '🚢', '🏛️', '🕳️', '🌋', '🌲', '🌀', '🏝️', '❄️', '🔵', '💎', '🦈']
      }
    ]
  },
  space: {
    id: 'space',
    name: '太空基地',
    icon: '🚀',
    bgGradient: 'from-slate-800 to-indigo-950 text-white',
    bannerEmoji: '🚀🛸🧑‍🚀',
    categories: [
      {
        name: '太空職群',
        key: 'people',
        items: ['王牌航天員', '天體物理學家', 'AI工程師', '太空地質學家', '基地指揮官', '外星植物學家', '導航通信員', '機械維修師', '太空醫療軍醫', '星際外交官', '星原開拓者', '神秘異星來客'],
        icons: ['🧑‍🚀', '👩‍🔬', '👨‍💻', '👩‍🚀', '🕵️', '👩‍🌾', '🎧', '🔧', '👩‍⚕️', '👽', '🤠', '👾']
      },
      {
        name: '星雲顏色',
        key: 'color',
        items: ['星際黑', '超新星紅', '宇宙藍', '星塵銀', '極光綠', '反射白', '暗物質紫', '中子橙', '奇異夸克粉', '星爆黃', '超巨星金', '彗星灰'],
        icons: ['⚫', '🔴', '🔵', '🪙', '🟢', '⚪', '🟣', '🟠', '🌸', '🟡', '⭐', '🟤']
      },
      {
        name: '科研星器',
        key: 'item',
        items: ['量子加密晶片', '重力調節手環', '星圖羅盤', '反物質電池', '火星岩石樣本', '異星種子艙', '激光切割刀', '微型微波雷達', '星河望遠鏡', '太空宇航記錄筆', '黑洞引力計', '核融合啟動匙'],
        icons: ['💾', '⌚', '🧭', '🔋', '🪨', '🌱', '🔪', '📡', '🔭', '🖋️', '🌪️', '🔑']
      },
      {
        name: '機械寵物',
        key: 'pet',
        items: ['機械狗多克', '多功能球球AI', '蜘蛛勘探儀', '太空飄浮水母', '光能電子鳥', '變色星塵獸', '重力史萊姆', '微秒晶片鼠', '浮空機械貓', '折疊小恐龍', '星核晶體蟲', '異星毛球喵'],
        icons: ['🤖', '🔮', '🕷️', '🎐', '🦅', '🦁', '🦠', '🐭', '🐈', '🦖', '🐛', '🐑']
      },
      {
        name: '艙內空間',
        key: 'place',
        items: ['一號發射艙', '科學研究實驗室', '中央機房與主機區', '溫室生態植物園', '生活重力休閒艙', '太空雷達通訊塔', '推進火箭引擎室', '星外樣本隔離間', '星河觀景瞭望台', '能源電池補給站', '氣閘出入艙口', '指揮官作戰室'],
        icons: ['🚀', '🔬', '💻', '🌴', '🛋️', '📡', '⚙️', '🚪', '🌌', '🔋', '🚪', '⚔️']
      }
    ]
  },
  magic: {
    id: 'magic',
    name: '魔法學院',
    icon: '🔮',
    bgGradient: 'from-purple-50 to-violet-100',
    bannerEmoji: '🔮🧙🧙‍♀️',
    categories: [
      {
        name: '魔法使者',
        key: 'people',
        items: ['精靈祭司', '大賢者梅林', '巨龍人形導師', '半獸人守衛長', '黑巫師德古拉', '占星魔女', '白袍大法師', '火元素精靈', '羽翼守護天使', '魔藥煉金學徒', '幻獸馴養師', '貓頭鷹信差長'],
        icons: ['🧝', '🧙', '🐉', '🐗', '🦇', '🧙‍♀️', '👨‍🎓', '🔥', '👼', '🧪', '🤠', '🦉']
      },
      {
        name: '魔法光芒',
        key: 'color',
        items: ['秘法紫', '熾焰紅', '冰晶藍', '聖光白', '劇毒綠', '幽影黑', '風暴青', '大地棕', '幻影粉', '旭日黃', '琥珀橘', '炫彩霓'],
        icons: ['🟣', '🔴', '🔵', '⚪', '🟢', '⚫', '🔵', '🟤', '🌸', '🟡', '🟠', '⭐']
      },
      {
        name: '施法道具',
        key: 'item',
        items: ['星空預言水晶球', '老橡木魔杖', '真理至高魔法書', '龍鱗防禦盾牌', '鳳凰羽毛筆', '永恆時間沙漏', '賢者之石吊墜', '星辰紫金冠', '海神眼淚藍寶石', '時空傳送符咒', '元素大釜罐', '精靈妖精吊墜'],
        icons: ['🔮', '🪄', '📖', '🛡️', '🪶', '⏳', '📿', '👑', '💎', '📜', '🥣', '🏺']
      },
      {
        name: '召喚神獸',
        key: 'pet',
        items: ['三尾冰狐', '噴火小幼龍', '雙頭地獄犬', '幽靈飛飄貓', '預言貓頭鷹', '獨角獨角獸', '尋寶黏土史萊姆', '噬魔小蝙蝠', '彩虹聖甲蟲', '千面變色天馬', '魔力晶石蛛', '夢境引路蝶'],
        icons: ['🦊', '🐉', '🐕', '🐈', '🦉', '🦄', '🔮', '🦇', '🪲', '🐎', '🕷️', '🦋']
      },
      {
        name: '神祕場所',
        key: 'place',
        items: ['星象占星閣', '遠古魔藥噴泉室', '禁忌浩瀚藏書閣', '巨龍孵化神殿', '大禮結界講堂', '鍊金符文熔爐間', '精靈巨樹迷宮', '神聖獨角獸湖畔', '風暴獅鷲飛行場', '鐘樓時光齒輪頂', '暗影毒沼密室', '真理決鬥聖所'],
        icons: ['🌌', '⛲', '📚', '🥚', '🏛️', '🔥', '🌲', '🌅', '🦅', '🔔', '☠️', '⚔️']
      }
    ]
  },
  ninja: {
    id: 'ninja',
    name: '忍者村',
    icon: '🥷',
    bgGradient: 'from-amber-50 to-stone-200',
    bannerEmoji: '🥷🗡️🪵',
    categories: [
      {
        name: '忍者眾生',
        key: 'people',
        items: ['影之首領', '傳奇上忍', '醫療精銳女忍', '暗部刺客', '熱血中忍', '迷糊下忍', '機關道具師', '秘密情報探子', '鑄劍流大師', '流浪武士長', '神社守護巫女', '神祕叛逃忍者'],
        icons: ['🥷', '👴', '👩‍⚕️', '🗡️', '🧑', '👦', '🔧', '👂', '⚒️', '👳', '⛩️', '👺']
      },
      {
        name: '忍裝顏色',
        key: 'color',
        items: ['隱形墨黑', '朱砂烈紅', '竹海深綠', '夜行幽藍', '月牙雪白', '風暴土棕', '手裏劍鋼灰', '毒蛛幽紫', '雷切黃', '落日橘', '桃花粉', '燦爛金'],
        icons: ['⚫', '🔴', '🟢', '🔵', '⚪', '🟤', '🪙', '🟣', '🟡', '🟠', '🌸', '⭐']
      },
      {
        name: '必備忍具',
        key: 'item',
        items: ['千鳥手裏劍', '鬼切武士刀', '劇毒吹針筒', '秘密結界卷軸', '迷霧遁逃彈', '替身防禦木盾', '攀爬鐵鎖鏈', '火遁爆炸引爆符', '軍糧丸妙藥', '神社神樂鈴', '解毒辟邪古玉', '風魔巨手裏劍'],
        icons: ['📐', '🗡️', '🧪', '📜', '💣', '🪵', '⛓️', '🔥', '💊', '🔔', '📿', '🎯']
      },
      {
        name: '守護通靈',
        key: 'pet',
        items: ['鐮刀神鼬', '劇毒暗影蛙', '搜救追蹤犬', '送信傳訊鷹', '巨大怪力蛞蝓', '遁地穿山甲', '幻術妖尾狐', '情報黑夜鴉', '千咬食腐蟻', '花紋巨忍蛇', '深山白猿王', '劇毒霧隱蛛'],
        icons: ['🦦', '🐸', '🐶', '🦅', '🐛', '🦫', '🦊', '🐦', '🐜', '🐍', '🐒', '🕷️']
      },
      {
        name: '修練地帶',
        key: 'place',
        items: ['首領影之辦公室', '竹影幽深試煉林', '神聖天照大神社', '地下水牢密室', '暗部中央基地', '斷崖瀑布打坐處', '忍具鍛造精鐵坊', '戰術沙盤演練堂', '軍糧丸藥草園', '終結之極限谷', '秘密地下密道', '溫泉療傷庭院'],
        icons: ['🏢', '🎋', '⛩️', '🌊', '🛖', '🌊', '⚒️', '🗺️', '🌿', '⛰️', '🕳️', '♨️']
      }
    ]
  },
  fairytale: {
    id: 'fairytale',
    name: '童話王國',
    icon: '👑',
    bgGradient: 'from-rose-50 to-pink-100',
    bannerEmoji: '👑🧚🏰',
    categories: [
      {
        name: '王國角色',
        key: 'people',
        items: ['璀璨白雪公主', '冷酷灰姑娘', '忠貞玫瑰騎士', '和藹老國王', '邪惡蜘蛛王后', '淘氣林間小精靈', '長髮高塔姑娘', '神勇吹笛人', '溫暖小紅帽', '神祕神燈精靈', '瘋狂下午茶帽客', '純潔美人魚艾莉'],
        icons: ['👸', '👡', '💂', '👑', '🧙‍♀️', '🧚', '👱‍♀️', '🪈', '👧', '🧞', '🎩', '🧜‍♀️']
      },
      {
        name: '夢幻色彩',
        key: 'color',
        items: ['皇家金黃', '玫瑰鮮紅', '夢境深藍', '仙女粉紅', '薄荷嫩綠', '幽影漆黑', '純潔雪白', '魔鏡亮銀', '薰衣草紫', '珊瑚甜橘', '大地煙灰', '古銅棕色'],
        icons: ['🟡', '🔴', '🔵', '🌸', '🟢', '⚫', '⚪', '🪙', '🟣', '🟠', '🪙', '🟤']
      },
      {
        name: '關鍵證物',
        key: 'item',
        items: ['紅寶石誓約皇冠', '晶瑩閃亮玻璃鞋', '命運魔力毒蘋果', '古老閣樓紡織機', '真理至高金魔鏡', '許願阿拉丁神燈', '七彩神秘玫瑰花', '巨型馬車金南瓜', '糖果屋美味薑餅', '小紅帽愛心籃子', '黃金獵龍獵槍', '三隻小豬堅固磚'],
        icons: ['👑', '👡', '🍎', '🧵', '🪞', '🪔', '🌹', '🎃', '🍪', '🧺', '🔫', '🧱']
      },
      {
        name: '靈性寵物',
        key: 'pet',
        items: ['青蛙王子咕呱', '穿靴子劍客貓', '尋路小藍青鳥', '大灰狼大嘴', '七矮人小鏟', '噴火小火龍', '極速神速白兔', '拉車神駿飛馬', '睡鼠睡嘟嘟', '薑餅小人跑跑', '溫和天鵝小白', '守庫金蟾蛛'],
        icons: ['🐸', '🐱', '🐦', '🐺', '⛏️', '🐉', '🐇', '🐎', '🐭', '🍪', '🦢', '🕷️']
      },
      {
        name: '童話地標',
        key: 'place',
        items: ['黃金加冕大禮堂', '玫瑰璀璨城堡花園', '迷霧森林矮人木屋', '荊棘長髮高塔', '王后陰森地下魔室', '精靈螢光螢火湖', '午夜夢迴大舞廳', '好吃薑餅糖果屋', '三隻小豬稻草房', '神秘巨石許願洞', '糖果小鎮麵包坊', '海底璀璨海神殿'],
        icons: ['🏛️', '🏰', '🏠', '🗼', '🕳️', '🏞️', '💃', '🍭', '🛖', '🪨', '🍞', '🧜‍♀️']
      }
    ]
  },
  food: {
    id: 'food',
    name: '美食小鎮',
    icon: '🍔',
    bgGradient: 'from-orange-50 to-amber-100',
    bannerEmoji: '🍔🍕🍰',
    categories: [
      {
        name: '頂級廚藝家',
        key: 'people',
        items: ['米其林星級主廚', '法式金牌甜點師', '帥氣花式調酒師', '冠軍咖啡拉花師', '日料壽司巨匠', '美式柴燒烤肉大師', '義式披薩甩餅手', '養生藥膳藥劑師', '中式頂端麵點王', '街頭創意小吃達人', '暗黑搞怪大廚', '嚴苛美食評鑑家'],
        icons: ['👨‍🍳', '👩‍🍳', '🤵', '☕', '🍣', '🍖', '🍕', '🥣', '🥟', '🍳', '👺', '🧐']
      },
      {
        name: '食材色澤',
        key: 'color',
        items: ['草莓亮紅', '芥末黃綠', '藍莓幽藍', '芝士香黃', '奶油脂白', '巧克力深棕', '香草粉白', '墨魚汁黑', '香橙嫩柑', '紫薯香紫', '焦糖閃金', '抹茶淡綠'],
        icons: ['🔴', '🟢', '🔵', '🟡', '⚪', '🟤', '🌸', '⚫', '🟠', '🟣', '🪙', '🟢']
      },
      {
        name: '廚神廚具',
        key: 'item',
        items: ['珍貴隕鐵廚神刀', '大富豪黃金炒鍋', '法式精密打蛋器', '奢華橡木調酒壺', '古老松木壽司板', '大容量美味烤爐', '意式大圓披薩鏟', '極速研磨咖啡機', '蒸汽騰騰大蒸籠', '極冷液態氮氣瓶', '美味神秘配方本', '亮金米其林星獎章'],
        icons: ['🔪', '🍳', '🌪️', '🏺', '🪵', '🔥', '🧹', '☕', '🍲', '🧪', '📖', '🎖️']
      },
      {
        name: '萌系萌寵',
        key: 'pet',
        items: ['廚師帽料理鼠', '香草冰淇淋兔', '芝士起司流口水貓', '棉花脆糖小綿羊', '愛吃骨頭大柴犬', '偷吃堅果小肥鼠', '咖啡拉花飛鷹', '彩虹軟糖變色蜥', '茶杯香豬球球', '吐司大熊麵包', '小魚乾金魚', '蜂蜜小蜜蜂'],
        icons: ['🐀', '🐇', '🐈', '🐑', '🐶', '🐹', '🦅', '🦎', '🐖', '🐻', '🐠', '🐝']
      },
      {
        name: '狂歡餐廳',
        key: 'place',
        items: ['星級全景旋轉餐廳', '法式露天香甜沙龍', '深夜寂靜霓虹酒吧', '微風午後咖啡館', '櫻之築地壽司坊', '柴火熊熊燒烤莊園', '義式手工窯烤披薩店', '中式宮廷大宴會廳', '熱鬧霓虹美食夜市', '創意料理實驗廚房', '暗黑神秘女巫湯館', '世界美食評審總部'],
        icons: ['🏢', '🌅', '🍹', '☕', '🍣', '🏕️', '🍕', '🏛️', '🏮', '🧪', '🥣', '🏢']
      }
    ]
  },
  jobs: {
    id: 'jobs',
    name: '職業城市',
    icon: '💼',
    bgGradient: 'from-blue-50 to-slate-200',
    bannerEmoji: '💼🚒👮',
    categories: [
      {
        name: '專業人士',
        key: 'people',
        items: ['王牌急診醫生', '英勇消防隊長', '硬核刑警隊長', '特級明星空姐', '金牌精英律師', '摩天大樓建築師', '流行音樂搖滾巨星', '探險野生攝影師', '金牌投資分析師', '特技頂尖賽車手', '頂尖白帽黑客', '資深神秘偵探'],
        icons: ['👨‍⚕️', '👨‍🚒', '👮', '👩‍✈️', '💼', '👷', '👨‍🎤', '📷', '📈', '🏎️', '💻', '🕵️']
      },
      {
        name: '制服色彩',
        key: 'color',
        items: ['警衛藏藍', '警戒鮮紅', '急救純白', '反光螢光綠', '安全暖澄', '律政墨黑', '空乘雅灰', '搖滾魅紫', '沙漠迷彩棕', '賽車霓虹黃', '天空透藍', '璀璨亮金'],
        icons: ['🔵', '🔴', '⚪', '🟢', '🟠', '⚫', '⚪', '🟣', '🟤', '🟡', '🔵', '⭐']
      },
      {
        name: '核心裝備',
        key: 'item',
        items: ['聽診診斷器', '高壓滅火槍', '合金辦案手銬', '極速救生直升機', '至高法律大法典', '摩天高樓設計圖', '酷炫簽名電吉他', '長焦遠攝相機', '高算力手提電腦', '定製賽車頭盔', '萬能解密鑰匙盤', '傳家黃金望遠鏡'],
        icons: ['🩺', '🔫', '⛓️', '🚁', '📖', '📜', '🎸', '📷', '💻', '🪖', '💾', '🔭']
      },
      {
        name: '排班警犬',
        key: 'pet',
        items: ['搜救金毛大狗', '防護猛犬德牧', '聽音偵查獵犬', '排雷高靈敏豬', '警長機靈波斯貓', '醫療安撫白兔', '消防警報金金鶯', '高空偵查無人鳥', '排障機械小萌蛛', '秘密保密倉鼠', '避難爬爬松鼠', '高敏嗅覺小青蛙'],
        icons: ['🐶', '🐕', '🐶', '🐖', '🐈', '🐇', '🐦', '🦅', '🤖', '🐹', '🐿', '🐸']
      },
      {
        name: '工作據點',
        key: 'place',
        items: ['市立綜合大醫院', '核心第一消防局', '特警刑偵總部', '國際虹橋機場', '最高法院審判庭', '摩天大樓建築工地', '萬人搖滾演唱會場', '熱熱帶原始森林', '紐約華爾街交易所', '專業極速賽車場', '暗黑科技網絡主機房', '神探事務所'],
        icons: ['🏥', '🚒', '🏢', '✈️', '⚖️', '🚧', '🎸', '🌲', '🏦', '🏎️', '💻', '🕵️']
      }
    ]
  },
  travel: {
    id: 'travel',
    name: '世界旅行',
    icon: '✈️',
    bgGradient: 'from-amber-50 to-sky-100',
    bannerEmoji: '✈️🗼🗻',
    categories: [
      {
        name: '環球旅人',
        key: 'people',
        items: ['和服美子', '高雅法國紳士', '神秘埃及探險家', '威尼斯水手長', '櫻之國著名忍者', '浪漫意國藝術家', '倫敦鐘樓老紳士', '巴西桑巴舞女王', '肯尼亞野生巡獵員', '紐西蘭牧場青年', '冰島極光追逐者', '宇宙流浪探險家'],
        icons: ['👩', '🤵', '🤠', '🚣', '🥷', '🎨', '👴', '💃', '👮', '🤠', '🧥', '🧑‍🚀']
      },
      {
        name: '國旗色澤',
        key: 'color',
        items: ['櫻花淡粉', '楓葉火紅', '蔚藍海岸色', '尼羅河金沙', '愛爾蘭草綠', '富士雪白', '阿爾卑斯冰藍', '撒哈拉赤橙', '威尼斯暗紫', '巴西狂歡綠', '北極星光銀', '夜空墨黑'],
        icons: ['🌸', '🔴', '🔵', '🟡', '🟢', '⚪', '🔵', '🟠', '🟣', '🟢', '🪙', '⚫']
      },
      {
        name: '各國手信',
        key: 'item',
        items: ['頂級宇治抹茶', '巴黎微縮艾菲爾鐵塔', '法老黃金面具', '貢多拉手工划槳', '著名浮世繪畫卷', '大理石維納斯雕像', '大笨鐘紀念懷錶', '嘉年華繽紛羽毛面具', '斑馬條紋草帽', '純淨黃油羊毛毯', '精美極光玻璃瓶', '全息星際旅行機票'],
        icons: ['🍵', '🗼', '👺', '🛶', '📜', '🗿', '⏱️', '🎭', '👒', '🧶', '🧪', '🎫']
      },
      {
        name: '海外旅伴',
        key: 'pet',
        items: ['和歌山秋田犬', '巴黎優雅黑貓', '沙漠耐旱駱駝', '聖馬可廣場白鴿', '奈良親人小鹿', '西西里斑駁獵犬', '泰國森林戴冠大象', '亞馬遜五彩金剛鸚鵡', '塞倫蓋蒂草原小獅', '紐西蘭卷毛喜羊羊', '南極可愛帝企鵝', '星際高維旅行史萊姆'],
        icons: ['🐶', '🐈', '🐪', '🐦', '🦌', '🐕', '🐘', '🦜', '🦁', '🐑', '🐧', '🔮']
      },
      {
        name: '世界奇觀',
        key: 'place',
        items: ['古老京都清水寺', '巴黎鐵塔凱旋門', '吉薩胡夫金字塔', '威尼斯黃金大運河', '神聖富士山五合目', '羅馬恢弘鬥獸場', '倫敦威斯敏斯特鐘樓', '里約熱內盧基督山', '塞倫蓋蒂國家公園', '皇后鎮魔戒雪山', '雷克雅維克極光藍湖', '星原跨時空傳送門'],
        icons: ['⛩️', '🗼', '🔺', '🚣', '🗻', '🏛️', '⏰', '⛰️', '🌴', '❄️', '♨️', '🛸']
      }
    ]
  },
  future: {
    id: 'future',
    name: '未來科技',
    icon: '🤖',
    bgGradient: 'from-slate-900 to-cyan-950 text-white',
    bannerEmoji: '🤖🛸🔌',
    categories: [
      {
        name: '科技先鋒',
        key: 'people',
        items: ['高階仿生人10號', '瘋狂量子發明家', '生化微調改造人', '新賽博執法官', '全息虛擬人工歌姬', '黑光冷壁黑客', '纳米科技醫療大師', '星軌空間站工程師', '時間奇異旅行者', '超智慧腦盤科學家', '超導微晶研發者', '未知矽基生命矩陣'],
        icons: ['🤖', '👨‍🔬', '🧙', '👮', '🎤', '💻', '👩‍⚕️', '🔧', '🧥', '🧠', '👓', '👾']
      },
      {
        name: '霓虹色澤',
        key: 'color',
        items: ['賽博高壓藍', '數據晶透綠', '高能光束紅', '流光霓虹粉', '低感亞光黑', '液態金屬銀', '量子金光黃', '超離子高亮紫', '警告醒目橘', '超低溫晶耀白', '介質斑駁灰', '極光幻彩藍'],
        icons: ['🔵', '🟢', '🔴', '🌸', '⚫', '🪙', '🟡', '🟣', '🟠', '⚪', '🪙', '🔵']
      },
      {
        name: '高超代科技',
        key: 'item',
        items: ['高頻粒子光束刃', '量子位反重力核心', '記憶存儲意識晶片', '人體全像投影投影手環', '超導懸浮推進鞋', '多維電磁防護盾', '高功率激光焊槍', '智能重編碼病毒盤', '時空跳躍極致手錶', '多功能全自動大釜', '超材料納米醫療注射槍', '宇宙終極源代碼矩陣'],
        icons: ['⚔️', '🔮', '💾', '⌚', '👟', '🛡️', '🔫', '💿', '⏱️', '🥣', '💉', '🧬']
      },
      {
        name: '仿生伴侶',
        key: 'pet',
        items: ['仿生機械電子羊', '漂浮氣流萌萌水母', '量子全息動態小狗', '微電路追蹤芯片倉鼠', '光纖五彩尾羽飛鳥', '折疊戰鬥機械蜘蛛', '安撫流光流體貓', '重載物資運輸機械龜', '大容量數據核心浮空球', '納米微型自組裝蟻群', '磁懸浮偵察小蝙蝠', '能量溢流史萊姆'],
        icons: ['🐑', '🎐', '🐶', '🐹', '🐦', '🕷️', '🐈', '🐢', '🔮', '🐜', '🦇', '🦠']
      },
      {
        name: '未來領域',
        key: 'place',
        items: ['新賽博市核心控制室', '超潔淨量子浮空實驗室', '生化基因微調修復室', '新賽博市特警指揮部', '全息炫彩虛擬演藝廳', '暗無天日邊緣地下城', '納米機器人自動化組裝車間', '高軌同步環形空間站', '時空奇點漩渦物理艙', '腦機接口思維融合矩陣', '核聚變超級反應爐區', '最終真理之主控機房'],
        icons: ['🖥️', '🔬', '🏥', '🏢', '🎪', '🏚️', '🏭', '🛰️', '🌀', '🧠', '☢️', '💻']
      }
    ]
  }
};

// 100 achievements dynamically grouped and defined!
export const ACHIEVEMENTS_TEMPLATES: Omit<Achievement, 'currentCount' | 'unlocked'>[] = [
  // 1. Progress achievements
  { id: 'solve_1', title: '初試身手', description: '成功破解 1 個案子', targetCount: 1, goldReward: 50 },
  { id: 'solve_10', title: '探案新秀', description: '成功破解 10 個案子', targetCount: 10, goldReward: 200 },
  { id: 'solve_50', title: '王牌探員', description: '成功破解 50 個案子', targetCount: 50, goldReward: 1000 },
  { id: 'solve_100', title: '神探崛起', description: '成功破解 100 個案子', targetCount: 100, goldReward: 3000 },
  { id: 'solve_500', title: '無限推理之王', description: '成功破解 500 個案子', targetCount: 500, goldReward: 10000 },
  
  // 2. Story achievements
  { id: 'story_ch1', title: '校園和平守護者', description: '完成第一章「失蹤的冠軍獎盃」', targetCount: 1, goldReward: 100 },
  { id: 'story_ch2', title: '奧秘解密者', description: '完成第二章「消失的黃銅鑰匙」', targetCount: 1, goldReward: 150 },
  { id: 'story_ch3', title: '深海救星', description: '完成第三章「失蹤的研究資料」', targetCount: 1, goldReward: 200 },
  { id: 'story_ch4', title: '真理研究員', description: '完成第四章「被偷走的魔法書」', targetCount: 1, goldReward: 250 },
  { id: 'story_ch5', title: '時間旅行領航員', description: '完成第五章「消失的乘客」', targetCount: 1, goldReward: 300 },
  { id: 'story_ch6', title: '太空解鎖大師', description: '完成第六章「神秘訊號事件」', targetCount: 1, goldReward: 350 },
  { id: 'story_ch7', title: '考古達人', description: '完成第七章「失竊化石事件」', targetCount: 1, goldReward: 400 },
  { id: 'story_ch8', title: '皇冠衛士', description: '完成第八章「失落的皇冠」', targetCount: 1, goldReward: 500 },
  { id: 'story_ch9', title: '忍道大師', description: '完成第九章「秘密卷軸事件」', targetCount: 1, goldReward: 600 },
  { id: 'story_ch10', title: '賽博救世主', description: '完成第十章「AI失控事件」', targetCount: 1, goldReward: 700 },
  { id: 'story_ch11', title: '古文明調查員', description: '完成第十一章「遺跡之謎」', targetCount: 1, goldReward: 800 },
  { id: 'story_ch12', title: '宇宙真相發現者', description: '完成第十二章「最終真相」並晉升傳奇', targetCount: 1, goldReward: 1500 },

  // 3. Difficulties achievements
  { id: 'diff_lv1', title: '基礎偵破者', description: '完成 5 題「Lv1 基礎」難度挑戰', targetCount: 5, goldReward: 100 },
  { id: 'diff_lv2', title: '簡單掌握者', description: '完成 5 題「Lv2 簡單」難度挑戰', targetCount: 5, goldReward: 150 },
  { id: 'diff_lv3', title: '普通進階人', description: '完成 5 題「Lv3 普通」難度挑戰', targetCount: 5, goldReward: 200 },
  { id: 'diff_lv4', title: '中堅骨幹級', description: '完成 5 題「Lv4 困難」難度挑戰', targetCount: 5, goldReward: 300 },
  { id: 'diff_lv5', title: '名偵探級別', description: '完成 5 題「Lv5 專家」難度挑戰', targetCount: 5, goldReward: 400 },
  { id: 'diff_lv6', title: '大英博物館神探', description: '完成 3 題「Lv6 大師」難度挑戰', targetCount: 3, goldReward: 600 },
  { id: 'diff_lv7', title: '傳奇締造者', description: '完成 3 題「Lv7 傳奇」難度挑戰', targetCount: 3, goldReward: 1000 },
  { id: 'diff_lv8', title: '愛因斯坦繼承人', description: '完成 2 題「Lv8 非常困難」終極挑戰', targetCount: 2, goldReward: 2000 },

  // 4. Special skills and stats
  { id: 'no_hint_10', title: '絕對自信', description: '累計 10 題在「無提示」的情況下通關', targetCount: 10, goldReward: 500 },
  { id: 'gold_1000', title: '小有資產', description: '金幣累計獲取達到 1000 枚', targetCount: 1000, goldReward: 200 },
  { id: 'gold_5000', title: '富豪大偵探', description: '金幣累計獲取達到 5000 枚', targetCount: 5000, goldReward: 800 },
  { id: 'gold_20000', title: '金庫爆滿', description: '金幣累計獲取達到 20000 枚', targetCount: 20000, goldReward: 2500 },
  { id: 'level_5', title: '神探實習生', description: '偵探等級達到 5 級', targetCount: 5, goldReward: 150 },
  { id: 'level_15', title: '王牌調查官', description: '偵探等級達到 15 級', targetCount: 15, goldReward: 500 },
  { id: 'level_30', title: '神探院長', description: '偵探等級達到 30 級', targetCount: 30, goldReward: 1500 },
  
  // 5. Daily Challenge & Streaks
  { id: 'daily_5', title: '每日巡邏員', description: '完成 5 次每日挑戰', targetCount: 5, goldReward: 300 },
  { id: 'daily_20', title: '風雨無阻', description: '完成 20 次每日挑戰', targetCount: 20, goldReward: 1000 },
  { id: 'streak_3', title: '神清氣爽', description: '連續 3 題無失誤迅速破解', targetCount: 3, goldReward: 200 },
  { id: 'streak_10', title: '思維之泉', description: '連續 10 題通關', targetCount: 10, goldReward: 800 },

  // 6. Theme mastery
  { id: 'theme_campus', title: '校園通', description: '通關 10 次校園主題案件', targetCount: 10, goldReward: 200 },
  { id: 'theme_animal', title: '百獸之友', description: '通關 10 次動物主題案件', targetCount: 10, goldReward: 200 },
  { id: 'theme_dino', title: '侏儸紀導遊', description: '通關 10 次恐龍主題案件', targetCount: 10, goldReward: 200 },
  { id: 'theme_ocean', title: '海中蛟龍', description: '通關 10 次海洋主題案件', targetCount: 10, goldReward: 200 },
  { id: 'theme_space', title: '漫步群星', description: '通關 10 次太空主題案件', targetCount: 10, goldReward: 250 },
  { id: 'theme_magic', title: '魔導師大師', description: '通關 10 次魔法主題案件', targetCount: 10, goldReward: 250 },
  { id: 'theme_ninja', title: '忍界傳奇', description: '通關 10 次忍者主題案件', targetCount: 10, goldReward: 250 },
  { id: 'theme_fairytale', title: '格林守護人', description: '通關 10 次童話主題案件', targetCount: 10, goldReward: 250 },
  { id: 'theme_food', title: '食神降世', description: '通關 10 次美食主題案件', targetCount: 10, goldReward: 250 },
  { id: 'theme_jobs', title: '社會精英', description: '通關 10 次職業城市主題案件', targetCount: 10, goldReward: 250 },
  { id: 'theme_travel', title: '環球旅行家', description: '通關 10 次世界旅行主題案件', targetCount: 10, goldReward: 250 },
  { id: 'theme_future', title: '未來先知', description: '通關 10 次未來科技主題案件', targetCount: 10, goldReward: 300 }
];

export const INITIAL_COLLECTIONS: CollectionItem[] = [
  // Badges
  { id: 'b_recruit', category: 'badge', name: '學院徽章', description: '神探學院新生專屬徽章。', unlocked: true, rarity: 'common' },
  { id: 'b_bronze', category: 'badge', name: '銅牌偵探手銬', description: '表揚順利偵破初級事件的偵探。', unlocked: false, cost: 200, rarity: 'common' },
  { id: 'b_silver', category: 'badge', name: '銀質放大鏡', description: '具有出色觀察力與細心排查的象徵。', unlocked: false, cost: 500, rarity: 'rare' },
  { id: 'b_gold', category: 'badge', name: '皇家金菸斗', description: '唯有推理嚴密、思維奇特的頂尖偵探能攜帶。', unlocked: false, cost: 1200, rarity: 'epic' },
  { id: 'b_diamond', category: 'badge', name: '量子真相寶石', description: '能夠洞穿並重塑時空真相的無限光芒。', unlocked: false, cost: 3000, rarity: 'legendary' },

  // Characters
  { id: 'char_self', category: 'character', name: '預備學員（你）', description: '剛剛進入神探學院，身著經典的風衣，手捧筆記。', unlocked: true, rarity: 'common' },
  { id: 'char_watson', category: 'character', name: '華生仿生汪', description: '配備量子核心的偵查AI警犬，最愛吃起司骨頭。', unlocked: false, cost: 400, rarity: 'rare' },
  { id: 'char_sherlock', category: 'character', name: '夏洛克前輩', description: '傳奇神探，性格冷靜毒舌，能一秒看出你昨晚吃了甜點。', unlocked: false, cost: 1500, rarity: 'epic' },
  { id: 'char_morarty', category: 'character', name: '貓教授莫里亞蒂', description: '神祕而迷人的數學犯罪大師，也是一隻擁有異瞳的黑貓。', unlocked: false, cost: 2500, rarity: 'legendary' },

  // Titles
  { id: 't_rookie', category: 'title', name: '邏輯新秀', description: '掛在嘴邊的徽章，剛剛掌握1✖1的奧秘。', unlocked: true, rarity: 'common' },
  { id: 't_puzzler', category: 'title', name: '解謎愛好者', description: '對一切謎團充滿熱情。', unlocked: false, cost: 150, rarity: 'common' },
  { id: 't_brain', category: 'title', name: '高速運算腦', description: '自帶CPU的強悍存在，看線索如代碼。', unlocked: false, cost: 800, rarity: 'rare' },
  { id: 't_insane', category: 'title', name: '矛盾終結者', description: '任何虛假的邏輯、錯誤的偏漏都逃不過你的雙眼。', unlocked: false, cost: 1500, rarity: 'epic' },
  { id: 't_god', category: 'title', name: '無限偵破神話', description: '他來了，他看了，他點了✔，案件便破解了。', unlocked: false, cost: 4000, rarity: 'legendary' },

  // Avatar Frames
  { id: 'f_classic', category: 'avatar_frame', name: '經典風衣棕', description: '沉穩優雅的英倫風衣格調。', unlocked: true, rarity: 'common' },
  { id: 'f_neon', category: 'avatar_frame', name: '賽博流光電', description: '藍紫偏光閃爍的未來感特效裝飾。', unlocked: false, cost: 600, rarity: 'rare' },
  { id: 'f_gold', category: 'avatar_frame', name: '至臻黃金璀璨', description: '鑲嵌了極高貴的微調紋章，金光流轉。', unlocked: false, cost: 2000, rarity: 'epic' },

  // Illustrations
  { id: 'ill_academy', category: 'illustration', name: '神探學院全景圖', description: '雄偉的哥德式建築，聳立於智慧迷霧山丘。', unlocked: true, rarity: 'common' },
  { id: 'ill_lab', category: 'illustration', name: '時光裂痕研究室', description: '擺滿量子儀器、齒輪鐘錶與歷史文物的主控室。', unlocked: false, cost: 1000, rarity: 'rare' },
  { id: 'ill_truth', category: 'illustration', name: '無限邏輯的終點', description: '多重宇宙交織成的璀璨莫比烏斯環畫布。', unlocked: false, cost: 2500, rarity: 'legendary' }
];

export const DETECTIVE_RANKS = [
  { xpNeeded: 0, title: '實習偵探' },
  { xpNeeded: 100, title: '助理調查員' },
  { xpNeeded: 300, title: '初階破案手' },
  { xpNeeded: 600, title: '中階分析師' },
  { xpNeeded: 1000, title: '高階邏輯官' },
  { xpNeeded: 1500, title: '犯罪調查專家' },
  { xpNeeded: 2200, title: '名聲大噪偵探' },
  { xpNeeded: 3000, title: '御前神探' },
  { xpNeeded: 4500, title: '世紀邏輯泰斗' },
  { xpNeeded: 7000, title: '傳奇神探' }
];
