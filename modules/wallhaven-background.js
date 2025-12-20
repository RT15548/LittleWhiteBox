import { extension_settings, getContext } from "../../../../extensions.js";
import { saveSettingsDebounced } from "../../../../../script.js";
import { EXT_ID } from "../core/constants.js";
import { createModuleEvents, event_types } from "../core/event-manager.js";

const MODULE_NAME = "wallhavenBackground";
const messageEvents = createModuleEvents('wallhaven:messages');
const globalEvents = createModuleEvents('wallhaven');

const defaultSettings = {
    enabled: false,
    bgMode: false,
    category: "010",
    purity: "100",
    opacity: 0.3,
    customTags: []
};

const tagWeights = {
    custom: 3.0,
    characters: 3,
    locations: 3,
    nsfw_actions: 3,
    intimate_settings: 3,
    poses: 2,
    clothing: 2,
    nsfw_body_parts: 2,
    activities: 2,
    expressions: 1.5,
    body_features: 1.5,
    nsfw_states: 1.5,
    fetish_categories: 1.5,
    clothing_states: 1.5,
    nsfw_descriptions: 1.5,
    colors: 1,
    objects: 1,
    weather_time: 1,
    styles: 1,
    emotional_states: 1,
    romance_keywords: 1,
    body_modifications: 1,
    nsfw_sounds: 1
};

const wallhavenTags = {
    characters: {
        // 基础人称
        "女孩": "anime girl", "少女": "anime girl", "女性": "woman", "女人": "woman",
        "男孩": "boy", "少年": "boy", "男性": "man", "男人": "man",
        "美女": "beautiful woman", "帅哥": "handsome man", "女生": "girl", "男生": "boy",

        // 职业角色
        "女仆": "maid", "侍女": "maid", "佣人": "maid", "管家": "butler",
        "秘书": "secretary", "助理": "assistant", "下属": "subordinate",
        "老板": "boss", "上司": "superior", "领导": "leader", "经理": "manager",
        "同事": "colleague", "伙伴": "partner", "搭档": "partner",
        "客户": "client", "顾客": "customer", "委托人": "client",

        // 学校相关
        "学生": "student", "学员": "student", "同学": "student",
        "男同学": "male student", "女同学": "schoolgirl", "女学生": "schoolgirl", "男学生": "male student",
        "老师": "teacher", "教师": "teacher", "先生": "teacher", "导师": "mentor",
        "校长": "principal", "教授": "professor", "讲师": "lecturer",
        "学姐": "senior student", "学妹": "junior student", "学长": "senior student", "学弟": "junior student",
        "班长": "class president", "社长": "club president",

        // 医疗相关
        "护士": "nurse", "白衣天使": "nurse", "医护": "nurse",
        "医生": "doctor", "大夫": "doctor", "医师": "physician",
        "病人": "patient", "患者": "patient",

        // 家庭关系
        "母亲": "mother", "妈妈": "mother", "母": "mother", "妈": "mother",
        "父亲": "father", "爸爸": "father", "父": "father", "爸": "father",
        "姐姐": "sister", "妹妹": "sister", "哥哥": "brother", "弟弟": "brother",
        "女儿": "daughter", "闺女": "daughter", "儿子": "son",
        "妻子": "wife", "老婆": "wife", "丈夫": "husband", "老公": "husband",
        "岳母": "mother-in-law", "婆婆": "mother-in-law", "丈母娘": "mother-in-law",
        "阿姨": "aunt", "叔叔": "uncle", "表姐": "cousin", "表妹": "cousin",
        "邻居": "neighbor", "房东": "landlord", "租客": "tenant",

        // 特殊身份
        "公主": "princess", "殿下": "princess", "王女": "princess",
        "王子": "prince", "王子殿下": "prince", "皇子": "prince",
        "女王": "queen", "国王": "king", "皇帝": "emperor", "皇后": "empress",
        "贵族": "noble", "富家千金": "rich girl", "大小姐": "young lady",
        "平民": "commoner", "村民": "villager", "市民": "citizen",

        // 二次元角色
        "猫娘": "catgirl", "猫女": "catgirl", "猫咪女孩": "catgirl",
        "狐娘": "fox girl", "狐狸女孩": "fox girl", "狐仙": "fox girl",
        "兔娘": "bunny girl", "兔女郎": "bunny girl", "兔子女孩": "bunny girl",
        "狼娘": "wolf girl", "犬娘": "dog girl", "龙娘": "dragon girl",
        "魔女": "witch", "女巫": "witch", "巫女": "witch", "魔法少女": "magical girl",
        "天使": "angel", "小天使": "angel", "堕天使": "fallen angel",
        "恶魔": "demon", "魅魔": "demon", "小恶魔": "demon",
        "精灵": "elf", "森林精灵": "elf", "暗精灵": "dark elf",
        "吸血鬼": "vampire", "血族": "vampire", "僵尸": "zombie",
        "人偶": "doll", "机器人": "android", "人造人": "artificial human",
        "外星人": "alien", "异世界人": "otherworld person",

        // 职业类型
        "忍者": "ninja", "女忍": "ninja", "武士": "warrior", "剑士": "swordsman",
        "骑士": "knight", "圣骑士": "paladin", "战士": "warrior",
        "法师": "wizard", "魔法师": "wizard", "术士": "sorcerer",
        "牧师": "priest", "修女": "nun", "尼姑": "nun",
        "盗贼": "thief", "刺客": "assassin", "间谍": "spy",
        "雇佣兵": "mercenary", "佣兵": "mercenary", "赏金猎人": "bounty hunter",

        // 现代职业
        "警察": "police", "警官": "police", "侦探": "detective", "探长": "detective",
        "消防员": "firefighter", "消防": "firefighter",
        "军人": "soldier", "士兵": "soldier", "特种兵": "special forces",
        "飞行员": "pilot", "船长": "captain", "司机": "driver",
        "厨师": "chef", "料理师": "chef", "服务员": "waitress",
        "调酒师": "bartender", "咖啡师": "barista",
        "艺术家": "artist", "画家": "artist", "雕塑家": "sculptor",
        "音乐家": "musician", "歌手": "singer", "偶像": "idol",
        "演员": "actress", "模特": "model", "舞者": "dancer",
        "作家": "writer", "记者": "journalist", "编辑": "editor",
        "科学家": "scientist", "研究员": "scientist", "博士": "doctor",
        "程序员": "programmer", "工程师": "engineer", "设计师": "designer",
        "商人": "businessman", "企业家": "entrepreneur", "投资者": "investor",

        // 特殊关系
        "新娘": "bride", "新嫁娘": "bride", "新郎": "groom",
        "前女友": "ex-girlfriend", "前男友": "ex-boyfriend",
        "青梅竹马": "childhood friend", "闺蜜": "best friend", "好友": "friend",
        "对手": "rival", "敌人": "enemy", "仇人": "enemy",
        "陌生人": "stranger", "路人": "passerby", "访客": "visitor"
    },

    clothing: {
        // 裙装类
        "连衣裙": "dress", "裙子": "dress", "长裙": "long dress", "短裙": "short dress",
        "迷你裙": "mini dress", "中裙": "midi dress", "蓬蓬裙": "puffy dress",
        "紧身裙": "tight dress", "A字裙": "a-line dress", "包臀裙": "pencil skirt",
        "百褶裙": "pleated skirt", "伞裙": "circle skirt", "吊带裙": "slip dress",

        // 制服类
        "校服": "school uniform", "制服": "uniform", "学生服": "school uniform",
        "女仆装": "maid outfit", "女仆服": "maid outfit",
        "护士服": "nurse outfit", "白大褂": "nurse outfit",
        "警服": "police uniform", "军装": "military uniform",
        "空姐服": "flight attendant uniform", "服务员服": "waitress uniform",
        "OL装": "office lady outfit", "职业装": "business attire",

        // 传统服装
        "和服": "kimono", "浴衣": "kimono", "振袖": "kimono",
        "旗袍": "qipao", "中式服装": "chinese dress", "汉服": "hanfu",
        "洛丽塔": "lolita dress", "哥特装": "gothic dress",

        // 特殊场合
        "婚纱": "wedding dress", "新娘装": "wedding dress", "礼服": "evening gown",
        "晚礼服": "evening dress", "舞会裙": "ball gown", "宴会服": "party dress",
        "演出服": "performance outfit", "舞台装": "stage outfit",

        // 休闲装
        "T恤": "t-shirt", "衬衫": "shirt", "衬衣": "blouse",
        "吊带": "tank top", "背心": "vest", "卫衣": "hoodie",
        "夹克": "jacket", "外套": "coat", "风衣": "trench coat",
        "毛衣": "sweater", "针织衫": "knit sweater", "开衫": "cardigan",

        // 裤装
        "牛仔裤": "jeans", "裤子": "pants", "短裤": "shorts",
        "热裤": "hot pants", "紧身裤": "leggings", "喇叭裤": "flare pants",
        "西装裤": "suit pants", "休闲裤": "casual pants",

        // 运动装
        "运动服": "sportswear", "瑜伽服": "yoga outfit", "健身服": "gym wear",
        "田径服": "track suit", "篮球服": "basketball uniform",

        // 睡衣家居
        "睡衣": "pajamas", "居家服": "pajamas", "睡袍": "nightgown",
        "浴袍": "bathrobe", "晨袍": "morning robe", "家居服": "loungewear",

        // 泳装
        "泳装": "swimsuit", "泳衣": "swimsuit", "比基尼": "bikini",
        "连体泳衣": "one-piece swimsuit", "三点式": "bikini",

        // 内衣
        "内衣": "lingerie", "胸罩": "bra", "内裤": "panties",
        "文胸": "bra", "胖次": "panties", "三角裤": "briefs",
        "平角裤": "boxers", "内衣套装": "lingerie set",
        "情趣内衣": "sexy lingerie", "蕾丝内衣": "lace lingerie",

        // 袜类
        "丝袜": "stockings", "长筒袜": "stockings", "连裤袜": "pantyhose",
        "过膝袜": "thigh highs", "短袜": "ankle socks", "船袜": "no-show socks",
        "网袜": "fishnet stockings", "白丝": "white stockings", "黑丝": "black stockings",

        // 鞋类
        "高跟鞋": "high heels", "靴子": "boots", "凉鞋": "sandals",
        "平底鞋": "flats", "帆布鞋": "canvas shoes", "运动鞋": "sneakers",
        "马丁靴": "combat boots", "长靴": "knee boots", "短靴": "ankle boots",
        "拖鞋": "slippers", "人字拖": "flip flops",

        // 配饰
        "手套": "gloves", "帽子": "hat", "眼镜": "glasses",
        "太阳镜": "sunglasses", "发带": "headband", "头巾": "headscarf",
        "围巾": "scarf", "披肩": "shawl", "领带": "tie",
        "蝴蝶结": "bow tie", "腰带": "belt", "围裙": "apron",

        // 首饰
        "项链": "necklace", "耳环": "earrings", "戒指": "ring",
        "手镯": "bracelet", "脚链": "anklet", "发饰": "hair accessory",
        "胸针": "brooch", "手表": "watch"
    },

    body_features: {
        // 发型
        "长发": "long hair", "短发": "short hair", "中发": "medium hair",
        "马尾": "ponytail", "双马尾": "twintails", "侧马尾": "side ponytail",
        "丸子头": "bun", "包子头": "bun", "公主头": "half updo",
        "刘海": "bangs", "齐刘海": "straight bangs", "斜刘海": "side bangs",
        "卷发": "curly hair", "直发": "straight hair", "波浪发": "wavy hair",
        "盘发": "updo", "编发": "braided hair", "麻花辫": "braids",
        "单边辫": "side braid", "双辫": "twin braids",
        "蓬松发": "voluminous hair", "顺滑发": "silky hair",

        // 发色
        "黑发": "black hair", "金发": "blonde hair", "棕发": "brown hair",
        "白发": "white hair", "银发": "silver hair", "红发": "red hair",
        "蓝发": "blue hair", "粉发": "pink hair", "紫发": "purple hair",
        "绿发": "green hair", "橙发": "orange hair", "灰发": "gray hair",
        "彩虹发": "rainbow hair", "渐变发": "gradient hair",

        // 身材
        "高个": "tall", "矮个": "short", "娇小": "petite", "高挑": "tall and slender",
        "苗条": "slim", "纤细": "slim", "瘦": "thin", "骨感": "skinny",
        "丰满": "curvy", "饱满": "voluptuous", "肉感": "plump",
        "匀称": "well-proportioned", "性感": "sexy", "优美": "graceful",

        // 胸部
        "大胸": "large breasts", "巨乳": "huge breasts", "丰满": "large breasts",
        "小胸": "small breasts", "贫乳": "small breasts", "平胸": "flat chest",
        "挺拔": "perky", "坚挺": "firm", "饱满": "full",
        "柔软": "soft", "弹性": "bouncy", "深沟": "cleavage",

        // 腿部
        "美腿": "beautiful legs", "长腿": "long legs", "细腿": "slender legs",
        "修长": "slender", "笔直": "straight", "匀称": "shapely",
        "大腿": "thighs", "小腿": "calves", "脚踝": "ankles",

        // 皮肤
        "白皙": "fair", "雪白": "snow white", "透白": "translucent",
        "古铜": "tanned", "小麦色": "wheat colored", "健康": "healthy",
        "光滑": "smooth", "细腻": "delicate", "粗糙": "rough",
        "红润": "rosy", "苍白": "pale", "有光泽": "glowing",

        // 眼睛
        "大眼": "big eyes", "小眼": "small eyes", "圆眼": "round eyes",
        "细长眼": "narrow eyes", "杏眼": "almond eyes", "桃花眼": "peach blossom eyes",
        "双眼皮": "double eyelids", "单眼皮": "single eyelids",
        "长睫毛": "long eyelashes", "浓睫毛": "thick eyelashes",

        // 特殊特征
        "猫耳": "cat ears", "狐耳": "fox ears", "兔耳": "bunny ears",
        "狼耳": "wolf ears", "犬耳": "dog ears", "精灵耳": "elf ears",
        "翅膀": "wings", "天使翅膀": "angel wings", "恶魔翅膀": "demon wings",
        "尾巴": "tail", "猫尾": "cat tail", "狐尾": "fox tail",
        "角": "horns", "恶魔角": "demon horns", "独角": "unicorn horn",

        // 体格
        "肌肉": "muscular", "强壮": "muscular", "健美": "athletic",
        "结实": "sturdy", "精瘦": "lean", "厚实": "solid",
        "柔弱": "delicate", "纤弱": "fragile", "娇弱": "frail",

        // 面部特征
        "圆脸": "round face", "瓜子脸": "oval face", "方脸": "square face",
        "鹅蛋脸": "oval face", "心形脸": "heart-shaped face",
        "高鼻梁": "high nose bridge", "小鼻子": "small nose",
        "厚嘴唇": "thick lips", "薄嘴唇": "thin lips", "樱桃嘴": "cherry lips",
        "尖下巴": "pointed chin", "圆下巴": "round chin",
        "酒窝": "dimples", "笑容": "smile", "梨涡": "dimples",

        // 其他
        "胡子": "beard", "胡须": "mustache", "络腮胡": "full beard",
        "光头": "bald", "秃头": "bald", "寸头": "buzz cut",
        "疤痕": "scar", "纹身": "tattoo", "胎记": "birthmark",
        "雀斑": "freckles", "痣": "mole", "美人痣": "beauty mark",
        "虎牙": "fangs", "小虎牙": "small fangs"
    },

    expressions: {
        // 快乐情绪
        "微笑": "smile", "笑": "smile", "开心": "happy", "高兴": "happy",
        "大笑": "laughing", "窃笑": "giggling", "傻笑": "silly smile",
        "甜笑": "sweet smile", "温和笑": "gentle smile", "灿烂笑": "bright smile",
        "兴奋": "excited", "激动": "excited", "愉快": "cheerful",
        "欣喜": "delighted", "狂喜": "ecstatic", "满意": "satisfied",

        // 悲伤情绪
        "伤心": "sad", "难过": "sad", "哭": "crying", "流泪": "tears",
        "大哭": "sobbing", "抽泣": "sniffling", "眼泪汪汪": "teary eyes",
        "悲伤": "sorrowful", "沮丧": "depressed", "失落": "disappointed",
        "绝望": "despair", "痛苦": "painful", "心碎": "heartbroken",

        // 愤怒情绪
        "生气": "angry", "愤怒": "angry", "恼火": "angry",
        "暴怒": "furious", "发火": "mad", "气愤": "indignant",
        "不满": "dissatisfied", "抱怨": "complaining", "怨恨": "resentful",

        // 害羞情绪
        "害羞": "shy", "脸红": "blushing", "羞涩": "shy",
        "害臊": "bashful", "腼腆": "timid", "不好意思": "embarrassed",
        "羞耻": "ashamed", "窘迫": "flustered", "局促": "awkward",

        // 惊讶情绪
        "惊讶": "surprised", "吃惊": "surprised", "震惊": "shocked",
        "惊愕": "astonished", "惊恐": "horrified", "目瞪口呆": "stunned",
        "困惑": "confused", "疑惑": "puzzled", "迷茫": "bewildered",

        // 温柔情绪
        "温柔": "gentle", "柔和": "gentle", "亲切": "gentle",
        "慈祥": "kind", "和善": "friendly", "温暖": "warm",
        "关爱": "caring", "怜爱": "tender", "宠溺": "doting",

        // 严肃情绪
        "严肃": "serious", "认真": "serious", "冷静": "calm",
        "严厉": "stern", "冷漠": "indifferent", "无表情": "expressionless",
        "冷酷": "cold", "淡漠": "aloof", "疏远": "distant",

        // 疲倦情绪
        "困": "sleepy", "累": "tired", "疲倦": "tired",
        "疲惫": "exhausted", "困倦": "drowsy", "无精打采": "listless",
        "虚弱": "weak", "萎靡": "dispirited", "懒散": "lazy",

        // 其他情绪
        "紧张": "nervous", "担心": "worried", "焦虑": "anxious",
        "恐惧": "fearful", "害怕": "scared", "胆怯": "timid",
        "自信": "confident", "骄傲": "proud", "得意": "smug",
        "傲慢": "arrogant", "轻蔑": "contemptuous", "不屑": "disdainful",
        "好奇": "curious", "感兴趣": "interested", "专注": "focused",
        "集中": "concentrated", "沉思": "contemplating", "思考": "thinking",
        "无聊": "bored", "厌倦": "tired of", "烦躁": "irritated",
        "期待": "expectant", "渴望": "longing", "向往": "yearning"
    },

    poses: {
        // 基础姿势
        "站着": "standing", "站立": "standing", "直立": "upright",
        "坐着": "sitting", "坐下": "sitting", "端坐": "sitting properly",
        "躺着": "lying", "躺下": "lying", "平躺": "lying flat",
        "跪着": "kneeling", "下跪": "kneeling", "跪坐": "seiza",
        "蹲着": "squatting", "蹲下": "crouching", "半蹲": "half squat",

        // 动作姿势
        "走路": "walking", "行走": "walking", "漫步": "strolling",
        "跑步": "running", "奔跑": "running", "疾跑": "sprinting",
        "跳跃": "jumping", "蹦跳": "hopping", "飞跃": "leaping",
        "跳舞": "dancing", "舞蹈": "dancing", "旋转": "spinning",
        "伸展": "stretching", "弯腰": "bending", "下腰": "backbend",

        // 手部动作
        "举手": "arms up", "抬手": "arms up", "双手举起": "both arms up",
        "伸手": "reaching out", "指向": "pointing", "挥手": "waving",
        "鼓掌": "clapping", "握拳": "clenched fist", "比心": "heart gesture",
        "捂脸": "covering face", "托腮": "chin rest", "撑头": "head rest",

        // 互动姿势
        "拥抱": "hugging", "抱着": "hugging", "搂抱": "embracing",
        "牵手": "holding hands", "握手": "handshake", "搀扶": "supporting",
        "背着": "carrying on back", "抱起": "lifting up", "搂腰": "arm around waist",

        // 生活姿势
        "睡觉": "sleeping", "熟睡": "sleeping", "打盹": "napping",
        "看书": "reading", "阅读": "reading", "翻书": "turning pages",
        "写字": "writing", "书写": "writing", "画画": "drawing",
        "工作": "working", "学习": "studying", "思考": "thinking",
        "做作业": "homework", "写作业": "homework", "考试": "taking exam",

        // 运动姿势
        "游泳": "swimming", "潜水": "diving", "跳水": "diving",
        "爬山": "climbing", "攀登": "climbing", "攀岩": "rock climbing",
        "骑车": "cycling", "开车": "driving", "骑马": "horseback riding",
        "滑雪": "skiing", "滑冰": "ice skating", "溜冰": "skating",
        "健身": "exercising", "瑜伽": "yoga", "拉伸": "stretching",

        // 战斗姿势
        "战斗": "fighting", "格斗": "combat", "对战": "battle",
        "攻击": "attacking", "防御": "defending", "出拳": "punching",
        "踢腿": "kicking", "挥剑": "sword swinging", "射箭": "archery",

        // 表演姿势
        "唱歌": "singing", "演奏": "playing instrument", "表演": "performing",
        "朗诵": "reciting", "演讲": "giving speech", "主持": "hosting",

        // 特殊姿势
        "冥想": "meditation", "祈祷": "praying", "许愿": "making wish",
        "仰望": "looking up", "俯视": "looking down", "回首": "looking back",
        "侧身": "side view", "背影": "back view", "正面": "front view",
        "倚靠": "leaning", "靠墙": "leaning against wall", "趴着": "lying on stomach"
    },

    locations: {
        // 居住场所
        "卧室": "bedroom", "房间": "bedroom", "寝室": "bedroom",
        "客厅": "living room", "起居室": "living room", "大厅": "hall",
        "厨房": "kitchen", "灶间": "kitchen", "餐厅": "dining room",
        "浴室": "bathroom", "洗手间": "bathroom", "厕所": "toilet",
        "阳台": "balcony", "露台": "terrace", "庭院": "courtyard",
        "花园": "garden", "后院": "backyard", "前院": "front yard",
        "地下室": "basement", "阁楼": "attic", "储藏室": "storage room",

        // 学校场所
        "教室": "classroom", "课堂": "classroom", "学校": "school",
        "图书馆": "library", "书馆": "library", "阅览室": "reading room",
        "实验室": "laboratory", "研究室": "laboratory", "计算机房": "computer room",
        "体育馆": "gymnasium", "操场": "playground", "运动场": "sports field",
        "食堂": "cafeteria", "宿舍": "dormitory", "社团室": "club room",
        "校园": "campus", "校门": "school gate", "走廊": "corridor",

        // 工作场所
        "办公室": "office", "工作室": "office", "会议室": "meeting room",
        "公司": "company", "企业": "corporation", "工厂": "factory",
        "车间": "workshop", "仓库": "warehouse", "商店": "shop",
        "超市": "supermarket", "商场": "shopping mall", "市场": "market",
        "银行": "bank", "邮局": "post office", "政府": "government office",

        // 医疗场所
        "医院": "hospital", "诊所": "hospital", "急诊室": "emergency room",
        "病房": "hospital room", "手术室": "operating room", "药房": "pharmacy",

        // 娱乐场所
        "咖啡厅": "cafe", "咖啡店": "cafe", "茶馆": "tea house",
        "餐厅": "restaurant", "饭店": "restaurant", "快餐店": "fast food",
        "酒吧": "bar", "夜店": "nightclub", "KTV": "karaoke",
        "电影院": "cinema", "剧院": "theater", "音乐厅": "concert hall",
        "游乐园": "amusement park", "动物园": "zoo", "水族馆": "aquarium",
        "博物馆": "museum", "美术馆": "art gallery", "展览馆": "exhibition hall",

        // 自然场所
        "公园": "park", "广场": "square", "街道": "street",
        "海边": "beach", "沙滩": "beach", "海滩": "beach",
        "森林": "forest", "树林": "forest", "丛林": "jungle",
        "山": "mountain", "高山": "mountain", "山顶": "mountain peak",
        "湖边": "lake", "湖泊": "lake", "河边": "riverside",
        "河流": "river", "溪流": "stream", "瀑布": "waterfall",
        "草原": "grassland", "田野": "field", "农场": "farm",
        "沙漠": "desert", "雪山": "snowy mountain", "冰川": "glacier",

        // 交通场所
        "火车站": "train station", "地铁站": "subway station", "公交站": "bus stop",
        "机场": "airport", "港口": "port", "码头": "dock",
        "停车场": "parking lot", "加油站": "gas station",

        // 宗教场所
        "教堂": "church", "寺庙": "temple", "清真寺": "mosque",
        "神社": "shrine", "修道院": "monastery",

        // 特殊场所
        "城堡": "castle", "宫殿": "castle", "塔楼": "tower",
        "桥": "bridge", "大桥": "bridge", "隧道": "tunnel",
        "屋顶": "rooftop", "天台": "rooftop", "楼顶": "rooftop",
        "地铁": "subway", "电梯": "elevator", "楼梯": "stairs",
        "监狱": "prison", "法院": "courthouse", "警察局": "police station",
        "温泉": "hot spring", "海岛": "island", "洞穴": "cave",
        "废墟": "ruins", "遗迹": "ruins", "秘境": "secret place"
    },

    weather_time: {
        // 天气
        "晴天": "sunny", "阳光": "sunny", "晴朗": "sunny",
        "多云": "cloudy", "阴天": "cloudy", "乌云": "dark clouds",
        "下雨": "rain", "雨天": "rainy", "雨": "rain",
        "毛毛雨": "drizzle", "大雨": "heavy rain", "暴雨": "storm",
        "雷雨": "thunderstorm", "闪电": "lightning", "打雷": "thunder",
        "下雪": "snow", "雪天": "snowy", "雪": "snow",
        "暴雪": "blizzard", "雪花": "snowflakes", "雪景": "snowy scene",
        "雾": "fog", "薄雾": "mist", "浓雾": "thick fog",
        "风": "wind", "微风": "breeze", "强风": "strong wind",
        "台风": "typhoon", "龙卷风": "tornado", "沙尘暴": "sandstorm",

        // 时间
        "日出": "sunrise", "清晨": "morning", "早晨": "morning",
        "上午": "morning", "中午": "noon", "下午": "afternoon",
        "日落": "sunset", "黄昏": "sunset", "夕阳": "sunset",
        "傍晚": "evening", "夜晚": "night", "晚上": "night",
        "深夜": "night", "午夜": "midnight", "凌晨": "dawn",
        "白天": "day", "日间": "day", "夜间": "night",

        // 季节
        "春天": "spring", "春季": "spring", "初春": "early spring",
        "夏天": "summer", "夏季": "summer", "盛夏": "midsummer",
        "秋天": "autumn", "秋季": "autumn", "深秋": "late autumn",
        "冬天": "winter", "冬季": "winter", "隆冬": "midwinter",

        // 天象
        "月光": "moonlight", "满月": "full moon", "新月": "new moon",
        "星空": "starry sky", "繁星": "stars", "银河": "milky way",
        "彩虹": "rainbow", "双彩虹": "double rainbow", "流星": "meteor",
        "日食": "solar eclipse", "月食": "lunar eclipse", "极光": "aurora",

        // 气候
        "炎热": "hot", "温暖": "warm", "凉爽": "cool",
        "寒冷": "cold", "冰冷": "freezing", "严寒": "bitter cold",
        "潮湿": "humid", "干燥": "dry", "闷热": "muggy"
    },

    colors: {
        // 基础颜色
        "红色": "red", "红": "red", "朱红": "red", "深红": "dark red",
        "粉色": "pink", "粉红": "pink", "粉": "pink", "浅粉": "light pink",
        "橙色": "orange", "橘色": "orange", "橙": "orange", "橘红": "red orange",
        "黄色": "yellow", "黄": "yellow", "金黄": "golden yellow", "柠檬黄": "lemon yellow",
        "绿色": "green", "绿": "green", "翠绿": "emerald green", "深绿": "dark green",
        "蓝色": "blue", "蓝": "blue", "天蓝": "sky blue", "深蓝": "dark blue",
        "紫色": "purple", "紫": "purple", "紫罗兰": "violet", "深紫": "dark purple",
        "黑色": "black", "黑": "black", "乌黑": "jet black", "深黑": "deep black",
        "白色": "white", "白": "white", "洁白": "pure white", "雪白": "snow white",
        "灰色": "gray", "灰": "gray", "银灰": "silver gray", "深灰": "dark gray",
        "棕色": "brown", "褐色": "brown", "咖啡色": "coffee brown", "巧克力色": "chocolate",

        // 金属色
        "银色": "silver", "金色": "gold", "铜色": "copper", "青铜": "bronze",
        "铂金": "platinum", "玫瑰金": "rose gold",

        // 特殊色彩
        "彩虹色": "rainbow", "渐变色": "gradient", "透明": "transparent",
        "荧光": "fluorescent", "金属": "metallic", "珠光": "pearl",
        "哑光": "matte", "亮光": "glossy", "闪光": "glitter"
    },

    objects: {
        // 书籍文具
        "书": "book", "书本": "book", "图书": "book", "小说": "novel",
        "教科书": "textbook", "字典": "dictionary", "杂志": "magazine",
        "笔": "pen", "钢笔": "fountain pen", "铅笔": "pencil", "毛笔": "brush pen",
        "纸": "paper", "笔记本": "notebook", "日记": "diary", "便签": "sticky note",

        // 花卉植物
        "花": "flower", "鲜花": "flower", "花朵": "flower", "花束": "bouquet",
        "玫瑰": "rose", "樱花": "cherry blossom", "向日葵": "sunflower",
        "郁金香": "tulip", "百合": "lily", "菊花": "chrysanthemum",
        "树": "tree", "盆栽": "potted plant", "仙人掌": "cactus",

        // 餐具茶具
        "杯子": "cup", "茶杯": "teacup", "咖啡杯": "coffee cup",
        "水杯": "water glass", "酒杯": "wine glass", "马克杯": "mug",
        "盘子": "plate", "碗": "bowl", "勺子": "spoon", "叉子": "fork",
        "筷子": "chopsticks", "刀": "knife", "茶壶": "teapot",

        // 装饰品
        "镜子": "mirror", "时钟": "clock", "钟": "clock", "闹钟": "alarm clock",
        "相框": "photo frame", "画": "painting", "海报": "poster",
        "蜡烛": "candle", "台灯": "desk lamp", "花瓶": "vase",

        // 武器道具
        "剑": "sword", "刀": "sword", "匕首": "dagger", "长矛": "spear",
        "弓": "bow", "箭": "arrow", "盾": "shield", "铠甲": "armor",
        "魔法棒": "magic wand", "法杖": "staff", "水晶球": "crystal ball",

        // 乐器
        "吉他": "guitar", "钢琴": "piano", "小提琴": "violin",
        "笛子": "flute", "鼓": "drum", "萨克斯": "saxophone",

        // 电子设备
        "电脑": "computer", "笔记本": "laptop", "平板": "tablet",
        "手机": "phone", "相机": "camera", "照相机": "camera",
        "电视": "television", "收音机": "radio", "耳机": "headphones",

        // 日用品
        "伞": "umbrella", "雨伞": "umbrella", "遮阳伞": "parasol",
        "包": "bag", "书包": "bag", "手提包": "handbag", "背包": "backpack",
        "钱包": "wallet", "钥匙": "key", "锁": "lock",
        "枕头": "pillow", "抱枕": "pillow", "毯子": "blanket",
        "被子": "quilt", "床单": "bedsheet", "毛巾": "towel",

        // 交通工具
        "汽车": "car", "自行车": "bicycle", "摩托车": "motorcycle",
        "公交车": "bus", "出租车": "taxi", "卡车": "truck",
        "飞机": "airplane", "直升机": "helicopter", "船": "ship",
        "游艇": "yacht", "火车": "train", "地铁": "subway",

        // 食物饮品
        "咖啡": "coffee", "茶": "tea", "水": "water", "果汁": "juice",
        "蛋糕": "cake", "面包": "bread", "饼干": "cookie",
        "苹果": "apple", "香蕉": "banana", "橙子": "orange",
        "巧克力": "chocolate", "糖果": "candy", "冰淇淋": "ice cream",

        // 首饰配件
        "项链": "necklace", "手链": "bracelet", "戒指": "ring",
        "耳环": "earrings", "胸针": "brooch", "手表": "watch",
        "皇冠": "crown", "头饰": "hair accessory", "发卡": "hair clip",

        // 运动用品
        "球": "ball", "篮球": "basketball", "足球": "soccer ball",
        "网球": "tennis ball", "乒乓球": "ping pong ball",
        "球拍": "racket", "滑板": "skateboard", "轮滑鞋": "roller skates",

        // 玩具
        "玩偶": "doll", "泰迪熊": "teddy bear", "毛绒玩具": "stuffed animal",
        "积木": "building blocks", "拼图": "puzzle", "棋": "chess",
        "扑克": "playing cards", "骰子": "dice", "风筝": "kite"
    },

    styles: {
        // 美感风格
        "可爱": "cute", "美丽": "beautiful", "漂亮": "pretty",
        "美": "beautiful", "绝美": "stunning", "惊艳": "gorgeous",
        "优雅": "elegant", "高贵": "noble", "华丽": "gorgeous",
        "精致": "delicate", "完美": "perfect", "迷人": "charming",

        // 性感风格
        "性感": "sexy", "诱惑": "seductive", "魅惑": "seductive",
        "撩人": "alluring", "火辣": "hot", "妖娆": "enchanting",
        "风情": "charming", "妩媚": "seductive", "勾人": "alluring",

        // 纯真风格
        "清纯": "innocent", "纯洁": "pure", "天真": "innocent",
        "单纯": "naive", "纯真": "pure", "清新": "fresh",
        "自然": "natural", "朴素": "simple", "清雅": "elegant",

        // 成熟风格
        "成熟": "mature", "稳重": "mature", "知性": "intellectual",
        "干练": "capable", "职业": "professional", "严谨": "rigorous",
        "端庄": "dignified", "庄重": "solemn", "典雅": "elegant",

        // 活力风格
        "活泼": "lively", "开朗": "cheerful", "阳光": "bright",
        "青春": "youthful", "朝气": "energetic", "活力": "vibrant",
        "热情": "passionate", "积极": "positive", "乐观": "optimistic",

        // 冷酷风格
        "神秘": "mysterious", "冷酷": "cool", "高冷": "cold",
        "冰冷": "icy", "冷漠": "indifferent", "疏离": "distant",
        "孤独": "lonely", "忧郁": "melancholy", "深沉": "deep",

        // 温暖风格
        "温暖": "warm", "舒适": "comfortable", "宁静": "peaceful",
        "温和": "gentle", "慈祥": "kind", "亲切": "friendly",
        "贴心": "caring", "体贴": "considerate", "善良": "kind",

        // 浪漫风格
        "浪漫": "romantic", "梦幻": "dreamy", "唯美": "aesthetic",
        "诗意": "poetic", "文艺": "artistic", "小清新": "fresh",
        "治愈": "healing", "暖心": "heartwarming", "甜美": "sweet",

        // 奇幻风格
        "奇幻": "fantasy", "魔幻": "magical", "神秘": "mysterious",
        "超现实": "surreal", "梦境": "dreamlike", "虚幻": "illusory",

        // 时代风格
        "古典": "classic", "复古": "vintage", "古风": "ancient style",
        "现代": "modern", "时尚": "fashionable", "前卫": "avant-garde",
        "未来": "futuristic", "科幻": "sci-fi", "赛博朋克": "cyberpunk",

        // 男性魅力
        "帅气": "handsome", "英俊": "handsome", "潇洒": "dashing",
        "俊美": "handsome", "阳刚": "masculine", "威严": "dignified",
        "强大": "powerful", "威猛": "mighty", "勇敢": "brave",
        "绅士": "gentleman", "风度": "graceful", "魅力": "charismatic",
        "霸气": "domineering", "王者": "kingly", "领袖": "leadership"
    },

    activities: {
        // 学习活动
        "学习": "studying", "上课": "attending class", "考试": "exam",
        "复习": "reviewing", "预习": "previewing", "做题": "solving problems",
        "做作业": "homework", "写作业": "homework", "背书": "memorizing",
        "研究": "research", "实验": "experiment", "讨论": "discussion",

        // 生活活动
        "做饭": "cooking", "吃饭": "eating", "用餐": "dining",
        "喝茶": "drinking tea", "喝咖啡": "drinking coffee", "品茶": "tea tasting",
        "洗澡": "bathing", "沐浴": "bathing", "泡澡": "bathing",
        "洗漱": "washing up", "刷牙": "brushing teeth", "洗脸": "washing face",
        "睡觉": "sleeping", "午睡": "napping", "休息": "resting",
        "起床": "getting up", "醒来": "waking up",

        // 购物娱乐
        "购物": "shopping", "逛街": "shopping", "买东西": "shopping",
        "逛商场": "mall shopping", "网购": "online shopping",
        "看电影": "watching movie", "看电视": "watching TV", "追剧": "binge watching",
        "听音乐": "listening to music", "唱歌": "singing", "唱K": "karaoke",
        "游戏": "gaming", "玩耍": "playing", "娱乐": "entertainment",
        "聊天": "chatting", "谈话": "talking", "交流": "communicating",

        // 运动健身
        "运动": "sports", "健身": "fitness", "锻炼": "exercise",
        "跑步": "running", "慢跑": "jogging", "散步": "walking",
        "游泳": "swimming", "潜水": "diving", "跳水": "diving",
        "登山": "mountain climbing", "徒步": "hiking", "骑行": "cycling",
        "瑜伽": "yoga", "舞蹈": "dancing", "跳舞": "dancing",
        "太极": "tai chi", "武术": "martial arts", "拳击": "boxing",

        // 工作活动
        "工作": "working", "加班": "overtime", "会议": "meeting",
        "开会": "attending meeting", "谈判": "negotiation", "签约": "signing contract",
        "出差": "business trip", "培训": "training", "实习": "internship",

        // 社交活动
        "聚会": "party", "庆祝": "celebration", "生日": "birthday",
        "聚餐": "group dining", "野餐": "picnic", "烧烤": "barbecue",
        "约会": "dating", "恋爱": "romance", "表白": "confession",
        "求婚": "proposal", "结婚": "wedding", "婚礼": "wedding ceremony",
        "蜜月": "honeymoon", "旅行": "travel", "度假": "vacation",
        "观光": "sightseeing", "旅游": "tourism", "探险": "adventure",

        // 文艺活动
        "看书": "reading", "阅读": "reading", "写作": "writing",
        "画画": "drawing", "绘画": "painting", "摄影": "photography",
        "书法": "calligraphy", "雕刻": "carving", "手工": "handicraft",
        "编织": "knitting", "刺绣": "embroidery", "陶艺": "pottery",

        // 情感互动
        "调戏": "teasing", "戏弄": "teasing", "挑逗": "flirting",
        "撩": "flirting", "撩拨": "flirting", "勾引": "seduction",
        "诱惑": "seduction", "魅惑": "seduction", "撒娇": "acting cute",
        "卖萌": "acting cute", "害羞": "shy", "脸红": "blushing",
        "接吻": "kissing", "亲吻": "kissing", "亲": "kissing",
        "拥抱": "hugging", "抱": "hugging", "搂": "embracing",
        "牵手": "holding hands", "握手": "handshake",
        "抚摸": "caressing", "爱抚": "caressing", "按摩": "massage",
        "安慰": "comforting", "关心": "caring", "照顾": "taking care",

        // 窥视相关
        "偷看": "peeking", "窥视": "voyeur", "偷窥": "voyeur",
        "暗中观察": "secretly observing", "跟踪": "following",
        "展示": "showing", "炫耀": "showing off", "露出": "exposing",
        "表现": "performing", "演示": "demonstrating",

        // 梦境活动
        "梦": "dreaming", "做梦": "dreaming", "梦见": "dreaming",
        "梦游": "sleepwalking", "噩梦": "nightmare", "美梦": "sweet dream",

        // 思考活动
        "思考": "thinking", "考虑": "considering", "琢磨": "pondering",
        "沉思": "contemplating", "反思": "reflecting", "冥想": "meditation",
        "发呆": "daydreaming", "走神": "spacing out", "幻想": "fantasizing",

        // 创作活动
        "创作": "creating", "发明": "inventing", "设计": "designing",
        "制作": "making", "建造": "building", "构建": "constructing",
        "修理": "repairing", "维修": "fixing", "改造": "renovating"
    },

    body_parts: {
        // 头部
        "头": "head", "头部": "head", "脑袋": "head",
        "脸": "face", "面部": "face", "容颜": "face",
        "额头": "forehead", "脸颊": "cheeks", "下巴": "chin",
        "眼睛": "eyes", "眼": "eyes", "眼神": "gaze", "目光": "gaze",
        "眉毛": "eyebrows", "睫毛": "eyelashes", "眼皮": "eyelids",
        "鼻子": "nose", "鼻": "nose", "鼻梁": "nose bridge",
        "嘴": "mouth", "嘴唇": "lips", "舌头": "tongue",
        "牙齿": "teeth", "虎牙": "fangs", "门牙": "front teeth",
        "耳朵": "ears", "耳": "ears", "耳垂": "earlobes",
        "头发": "hair", "发型": "hairstyle", "刘海": "bangs",

        // 颈部胸部
        "脖子": "neck", "颈": "neck", "咽喉": "throat",
        "肩膀": "shoulders", "肩": "shoulders", "锁骨": "collarbone",
        "胸": "breasts", "胸部": "breasts", "乳房": "breasts",
        "胸膛": "chest", "胸口": "chest", "心脏": "heart",

        // 手臂手部
        "手臂": "arms", "臂": "arms", "上臂": "upper arms",
        "前臂": "forearms", "肘": "elbows", "肘部": "elbows",
        "手": "hands", "手掌": "palms", "手背": "back of hands",
        "手指": "fingers", "拇指": "thumbs", "食指": "index fingers",
        "中指": "middle fingers", "无名指": "ring fingers", "小指": "pinky fingers",
        "指甲": "nails", "手腕": "wrists", "腕": "wrists",

        // 躯干
        "身体": "body", "身材": "figure", "体型": "body type",
        "背": "back", "后背": "back", "脊背": "spine",
        "腰": "waist", "腰部": "waist", "细腰": "slim waist",
        "肚子": "belly", "腹部": "abdomen", "腹": "abdomen",
        "肚脐": "navel", "小腹": "lower abdomen",
        "臀部": "hips", "屁股": "butt", "臀": "buttocks",

        // 腿部足部
        "腿": "legs", "大腿": "thighs", "小腿": "calves",
        "膝盖": "knees", "膝": "knees", "脚踝": "ankles",
        "脚": "feet", "足": "feet", "脚掌": "soles",
        "脚趾": "toes", "脚指": "toes", "脚跟": "heels",

        // 皮肤相关
        "皮肤": "skin", "肌肤": "skin", "体肤": "skin",
        "毛孔": "pores", "汗": "sweat", "体温": "body temperature",

        // 内衣相关
        "胸罩": "bra", "文胸": "bra", "内衣": "underwear",
        "内裤": "panties", "底裤": "underwear", "三角裤": "briefs",
        "胖次": "panties", "安全裤": "safety shorts"
    },

    nsfw_actions: {
        // 基础行为
        "做爱": "sex", "性爱": "sex", "交配": "mating", "性交": "intercourse",
        "爱爱": "making love", "啪啪": "sex", "嘿咻": "sex",

        // 插入动作
        "插入": "penetration", "进入": "penetration", "插": "insertion",
        "深入": "deep penetration", "浅入": "shallow penetration",
        "刺入": "thrusting in", "顶入": "pushing in",

        // 律动动作
        "抽插": "thrusting", "律动": "thrusting", "顶": "thrusting",
        "冲撞": "pounding", "撞击": "hitting", "摩擦": "rubbing",
        "研磨": "grinding", "扭动": "twisting", "起伏": "undulating",

        // 高潮相关
        "高潮": "orgasm", "达到高潮": "climax", "巅峰": "peak",
        "射精": "ejaculation", "释放": "release", "爆发": "explosion",
        "喷": "squirting", "涌出": "gushing", "流出": "flowing",

        // 口部动作
        "口交": "oral sex", "含": "sucking", "舔": "licking",
        "吸": "sucking", "吮": "sucking", "咬": "biting",
        "亲": "kissing", "深吻": "deep kiss", "法式接吻": "french kiss",

        // 体位相关
        "肛交": "anal sex", "后入": "doggy style", "骑乘": "cowgirl",
        "传教士": "missionary", "侧位": "side position", "反向": "reverse",
        "站立": "standing position", "坐位": "sitting position",

        // 自慰相关
        "手淫": "masturbation", "自慰": "masturbation", "撸": "stroking",
        "套弄": "stroking", "摩擦": "rubbing", "刺激": "stimulation",

        // 抚摸动作
        "指交": "fingering", "抚弄": "fondling", "揉": "massaging",
        "搓": "rubbing", "捏": "pinching", "压": "pressing",
        "按": "pressing", "推": "pushing", "拉": "pulling",

        // 体液相关
        "爱液": "love juice", "精液": "semen", "体液": "bodily fluids",
        "分泌": "secretion", "润滑": "lubrication", "湿润": "moisture",

        // 状态描述
        "湿润": "wet", "润滑": "lubricated", "干燥": "dry",
        "紧": "tight", "松": "loose", "深": "deep", "浅": "shallow",
        "热": "hot", "温暖": "warm", "冰凉": "cold",
        "快": "fast", "慢": "slow", "用力": "hard", "轻": "gentle",
        "粗暴": "rough", "温柔": "gentle", "激烈": "intense", "缓慢": "slow"
    },

    nsfw_body_parts: {
        // 男性器官
        "阴茎": "penis", "鸡巴": "cock", "肉棒": "dick", "老二": "dick",
        "鸡鸡": "penis", "小弟弟": "penis", "那话儿": "penis",
        "龟头": "glans", "包皮": "foreskin", "马眼": "urethral opening",
        "睾丸": "testicles", "蛋蛋": "balls", "精囊": "seminal vesicles",

        // 女性器官
        "阴道": "vagina", "小穴": "pussy", "阴唇": "labia", "花瓣": "labia",
        "阴蒂": "clitoris", "豆豆": "clitoris", "小核": "clitoris",
        "阴户": "vulva", "私处": "private parts", "花径": "vagina",
        "子宫": "womb", "宫口": "cervix", "G点": "g-spot", "敏感点": "sensitive spot",

        // 共同部位
        "肛门": "anus", "菊花": "asshole", "后庭": "backdoor", "屁眼": "butthole",
        "会阴": "perineum", "下体": "genitals", "性器": "sex organ",
        "私密处": "intimate parts", "敏感带": "erogenous zone",

        // 胸部
        "乳头": "nipples", "奶头": "nipples", "乳晕": "areola",
        "奶子": "tits", "胸脯": "breasts", "酥胸": "soft breasts",
        "双峰": "twin peaks", "玉兔": "breasts", "雪峰": "white breasts",

        // 其他敏感部位
        "大腿根": "inner thighs", "腿间": "between legs", "股间": "crotch",
        "后穴": "back hole", "前穴": "front hole", "蜜穴": "honey pot",
        "花心": "deep inside", "花芯": "core", "深处": "deep inside",

        // 生理反应
        "勃起": "erection", "坚挺": "stiff", "充血": "engorged",
        "湿润": "wet", "分泌": "secreting", "流水": "dripping",
        "收缩": "contracting", "痉挛": "spasming", "颤抖": "trembling",

        // 特殊词汇
        "前列腺": "prostate", "尿道": "urethra", "处女膜": "hymen",
        "欲火": "lust", "春情": "arousal", "情欲": "passion"
    },

    nsfw_states: {
        // 男性状态
        "勃起": "erect", "硬": "hard", "坚挺": "stiff", "挺立": "standing",
        "半勃": "semi-erect", "软": "soft", "疲软": "limp",
        "胀大": "swollen", "充血": "engorged", "青筋暴起": "veiny",

        // 女性状态
        "湿": "wet", "潮湿": "moist", "流水": "dripping", "湿润": "lubricated",
        "干涩": "dry", "紧致": "tight", "松弛": "loose",
        "夹紧": "clenching", "收缩": "contracting", "痉挛": "spasming",

        // 共同状态
        "胀": "swollen", "肿": "enlarged", "充血": "engorged",
        "敏感": "sensitive", "酥麻": "tingling", "颤抖": "trembling",
        "战栗": "shivering", "痉挛": "convulsing", "抽搐": "twitching",

        // 情绪状态
        "兴奋": "aroused", "激动": "excited", "冲动": "horny",
        "发情": "in heat", "春心荡漾": "aroused", "欲火焚身": "lustful",
        "欲火": "lustful", "渴望": "craving", "饥渴": "thirsty",
        "急需": "desperate", "忍耐": "enduring", "煎熬": "suffering",

        // 满足状态
        "满足": "satisfied", "充实": "fulfilled", "空虚": "empty",
        "饱满": "full", "撑胀": "stretched", "填满": "filled",
        "深入": "deep", "顶到": "hitting", "碰到": "touching",

        // 感觉状态
        "疼": "painful", "痛": "aching", "酸": "sore",
        "爽": "pleasurable", "舒服": "comfortable", "快感": "pleasure",
        "酥": "tingling", "麻": "numb", "痒": "itchy",
        "热": "hot", "烫": "burning", "凉": "cool",
        "涨": "swelling", "胀": "bloated", "紧": "tight",

        // 程度状态
        "轻微": "slight", "强烈": "intense", "剧烈": "violent",
        "温和": "gentle", "激烈": "fierce", "疯狂": "crazy",
        "缓慢": "slow", "急促": "rapid", "持续": "continuous"
    },

    nsfw_sounds: {
        // 呻吟声
        "呻吟": "moaning", "叫床": "moaning", "娇喘": "panting",
        "喘息": "breathing heavily", "急喘": "panting", "粗喘": "heavy breathing",

        // 基础音节
        "哼": "humming", "嗯": "mmm", "唔": "mmm",
        "啊": "ah", "哦": "oh", "噢": "oh",
        "嘤": "whimpering", "嘤嘤": "whimpering", "嘤嘤嘤": "whimpering",

        // 高音调
        "尖叫": "screaming", "尖声": "high-pitched", "细声": "thin voice",
        "呼喊": "crying out", "大叫": "shouting", "惊叫": "exclaiming",

        // 低音调
        "低吟": "groaning", "闷哼": "muffled moan", "低喃": "mumbling",
        "嘟囔": "muttering", "咕哝": "grumbling", "轻哼": "soft humming",

        // 情绪音
        "啜泣": "sobbing", "哽咽": "choking", "抽泣": "sniffling",
        "颤音": "trembling voice", "破音": "voice breaking",

        // 生理音
        "喘气": "gasping", "倒抽气": "sharp intake", "屏息": "holding breath",
        "换气": "catching breath", "深呼吸": "deep breathing",

        // 其他音效
        "叫声": "vocal", "声音": "sounds", "噪音": "noise",
        "音调": "tone", "音量": "volume", "回音": "echo",
        "轻声": "whisper", "细语": "soft voice", "耳语": "whispering",
        "颤抖": "trembling", "战栗": "shivering", "哆嗦": "quivering"
    },

    nsfw_descriptions: {
        // 基础描述
        "色情": "pornographic", "淫荡": "lewd", "下流": "vulgar",
        "猥亵": "obscene", "淫秽": "indecent", "不雅": "improper",
        "淫乱": "promiscuous", "放荡": "wanton", "骚": "slutty",
        "浪": "naughty", "风骚": "seductive", "妖艳": "bewitching",

        // 性格特征
        "骚货": "slut", "淫娃": "sex kitten", "小妖精": "little minx",
        "小浪蹄子": "little slut", "狐狸精": "vixen", "妖女": "seductress",
        "处女": "virgin", "纯洁": "pure", "清纯": "innocent",
        "无辜": "innocent", "天真": "naive", "单纯": "simple",

        // 经验程度
        "经验": "experienced", "老练": "skilled", "熟练": "proficient",
        "熟女": "mature woman", "老司机": "experienced", "新手": "beginner",
        "生涩": "inexperienced", "青涩": "green", "稚嫩": "tender",

        // 特殊嗜好
        "禁忌": "taboo", "变态": "pervert", "扭曲": "twisted",
        "病态": "sick", "不正常": "abnormal", "特殊": "special",
        "癖好": "fetish", "嗜好": "preference", "口味": "taste",

        // 权力关系
        "调教": "training", "驯服": "taming", "征服": "conquering",
        "支配": "domination", "统治": "ruling", "控制": "control",
        "服从": "submission", "屈服": "yielding", "顺从": "obedient",
        "奴隶": "slave", "奴": "slave", "宠物": "pet",
        "主人": "master", "主": "master", "女王": "queen",
        "女主": "mistress", "王": "king", "君主": "sovereign",

        // 强度描述
        "轻柔": "gentle", "温和": "mild", "激烈": "intense",
        "粗暴": "rough", "野蛮": "savage", "狂野": "wild",
        "疯狂": "crazy", "极端": "extreme", "过分": "excessive"
    },

    intimate_settings: {
        // 私密场所
        "床": "bed", "床上": "on bed", "大床": "big bed",
        "单人床": "single bed", "双人床": "double bed", "水床": "waterbed",
        "床单": "bedsheet", "被子": "blanket", "枕头": "pillow",
        "被窝": "under blanket", "毯子": "blanket", "软垫": "soft mat",

        // 卧室环境
        "卧室": "bedroom", "主卧": "master bedroom", "客房": "guest room",
        "宿舍": "dormitory", "公寓": "apartment", "套房": "suite",
        "酒店房间": "hotel room", "民宿": "bed and breakfast",

        // 浴室场所
        "浴室": "bathroom", "洗手间": "bathroom", "淋浴间": "shower room",
        "浴缸": "bathtub", "按摩浴缸": "jacuzzi", "淋浴": "shower",
        "蒸汽浴": "steam bath", "桑拿": "sauna", "温泉": "hot spring",

        // 客厅家具
        "沙发": "sofa", "长沙发": "couch", "皮沙发": "leather sofa",
        "躺椅": "recliner", "懒人椅": "lazy chair", "摇椅": "rocking chair",
        "地毯": "carpet", "地垫": "mat", "地板": "floor",
        "茶几": "coffee table", "边桌": "side table",

        // 其他家具
        "桌子": "table", "书桌": "desk", "梳妆台": "dressing table",
        "椅子": "chair", "办公椅": "office chair", "吧台椅": "bar stool",
        "墙": "wall", "墙角": "corner", "窗台": "windowsill",
        "阳台": "balcony", "露台": "terrace", "天台": "rooftop",

        // 交通工具
        "车里": "in car", "后座": "back seat", "驾驶座": "driver seat",
        "副驾驶": "passenger seat", "货车": "truck", "面包车": "van",
        "火车": "train", "飞机": "airplane", "游艇": "yacht",

        // 户外场所
        "野外": "outdoors", "森林": "forest", "树林": "woods",
        "海滩": "beach", "沙滩": "sandy beach", "海边": "seaside",
        "草地": "grassland", "花园": "garden", "公园": "park",
        "山顶": "mountain top", "山洞": "cave", "帐篷": "tent",

        // 特殊场所
        "办公室": "office", "会议室": "meeting room", "储藏室": "storage room",
        "教室": "classroom", "图书馆": "library", "实验室": "laboratory",
        "厕所": "toilet", "洗手间": "restroom", "更衣室": "changing room",
        "试衣间": "fitting room", "化妆间": "dressing room",
        "健身房": "gym", "瑜伽室": "yoga room", "舞蹈室": "dance studio",

        // 住宿场所
        "酒店": "hotel", "旅馆": "motel", "民宿": "guesthouse",
        "度假村": "resort", "别墅": "villa", "小屋": "cabin",
        "招待所": "hostel", "青旅": "youth hostel"
    },

    fetish_categories: {
        // 服装恋物
        "丝袜": "stockings", "黑丝": "black stockings", "白丝": "white stockings",
        "连裤袜": "pantyhose", "网袜": "fishnet stockings", "过膝袜": "thigh highs",
        "高跟鞋": "high heels", "靴子": "boots", "长靴": "knee boots",
        "制服": "uniform", "学生装": "school uniform", "护士装": "nurse outfit",
        "女仆装": "maid outfit", "空姐装": "flight attendant uniform",

        // 材质恋物
        "蕾丝": "lace", "真丝": "silk", "缎子": "satin",
        "皮革": "leather", "乳胶": "latex", "橡胶": "rubber",
        "PVC": "pvc", "金属": "metal", "链条": "chain",

        // 束缚用具
        "束缚": "bondage", "绳子": "rope", "绳索": "rope",
        "手铐": "handcuffs", "脚镣": "shackles", "锁链": "chains",
        "眼罩": "blindfold", "口球": "gag", "项圈": "collar",
        "皮带": "belt", "背带": "harness", "束身衣": "corset",

        // 调教用具
        "鞭子": "whip", "皮鞭": "leather whip", "马鞭": "riding crop",
        "板子": "paddle", "藤条": "cane", "羽毛": "feather",
        "蜡烛": "candle", "蜡油": "wax", "冰块": "ice",
        "夹子": "clamps", "乳夹": "nipple clamps", "刑具": "torture device",

        // 情趣用品
        "玩具": "toy", "按摩棒": "vibrator", "震动棒": "vibrator",
        "假阳具": "dildo", "双头龙": "double dildo", "仿真器": "realistic toy",
        "跳蛋": "bullet vibrator", "遥控器": "remote control", "震动器": "vibrator",
        "肛塞": "butt plug", "前列腺": "prostate massager", "扩张器": "dilator",
        "充气娃娃": "sex doll", "飞机杯": "masturbator", "倒模": "pocket pussy",

        // 特殊恋物
        "触手": "tentacle", "怪物": "monster", "野兽": "beast",
        "异形": "alien", "机器人": "robot", "人偶": "doll",
        "机器": "machine", "机械": "mechanical", "人工": "artificial",
        "科技": "technology", "虚拟": "virtual", "全息": "holographic",

        // 材质特殊
        "毛绒": "fur", "羽毛": "feather", "丝绸": "silk",
        "天鹅绒": "velvet", "绒毛": "fuzzy", "光滑": "smooth",
        "粗糙": "rough", "硬质": "hard", "软质": "soft"
    },

    body_modifications: {
        // 纹身类型
        "纹身": "tattoo", "刺青": "tattoo", "花臂": "sleeve tattoo",
        "图腾": "tribal tattoo", "文字": "text tattoo", "图案": "pattern tattoo",
        "彩绘": "body painting", "临时纹身": "temporary tattoo",
        "传统纹身": "traditional tattoo", "日式纹身": "japanese tattoo",

        // 穿孔类型
        "穿孔": "piercing", "打洞": "piercing", "耳洞": "ear piercing",
        "鼻环": "nose ring", "唇环": "lip ring", "舌环": "tongue piercing",
        "肚脐环": "navel piercing", "乳环": "nipple piercing",
        "私处穿孔": "genital piercing", "眉环": "eyebrow piercing",

        // 自然标记
        "疤痕": "scar", "伤疤": "scar", "刀疤": "knife scar",
        "胎记": "birthmark", "痣": "mole", "黑痣": "dark mole",
        "雀斑": "freckles", "斑点": "spots", "色斑": "pigmentation",
        "美人痣": "beauty mark", "泪痣": "tear mole",

        // 肌肉特征
        "肌肉": "muscle", "腹肌": "abs", "六块腹肌": "six pack",
        "八块腹肌": "eight pack", "人鱼线": "v-line", "马甲线": "ab line",
        "肱二头肌": "biceps", "胸肌": "pectoral muscles", "背肌": "back muscles",
        "臀肌": "glutes", "大腿肌": "thigh muscles", "小腿肌": "calf muscles",

        // 骨骼特征
        "锁骨": "collarbone", "肩胛骨": "shoulder blade", "脊椎": "spine",
        "肋骨": "ribs", "髋骨": "hip bone", "颧骨": "cheekbone",
        "下颌": "jawline", "尖下巴": "pointed chin", "方下巴": "square jaw",

        // 身体凹陷
        "腰窝": "dimples", "酒窝": "dimples", "梨涡": "dimples",
        "锁骨窝": "collarbone hollow", "太阳穴": "temples",
        "颈窝": "neck hollow", "脚踝窝": "ankle hollow",

        // 特殊特征
        "虎牙": "fangs", "小虎牙": "small fangs", "门牙": "front teeth",
        "双眼皮": "double eyelids", "单眼皮": "single eyelids",
        "卧蚕": "aegyo sal", "眼袋": "eye bags", "鱼尾纹": "crow's feet",
        "法令纹": "nasolabial folds", "颈纹": "neck lines"
    },

    clothing_states: {
        // 脱衣状态
        "裸体": "nude", "全裸": "completely nude", "一丝不挂": "stark naked",
        "半裸": "topless", "上身裸体": "topless", "下身裸体": "bottomless",
        "微露": "slightly exposed", "若隐若现": "faintly visible",

        // 穿着状态
        "穿戴整齐": "fully dressed", "衣冠楚楚": "well-dressed",
        "衣衫不整": "disheveled", "衣不蔽体": "barely clothed",
        "衣衫褴褛": "ragged clothes", "破烂": "tattered",

        // 材质状态
        "透明": "transparent", "半透明": "see-through", "透视": "see-through",
        "薄": "thin", "厚": "thick", "轻薄": "light",
        "厚重": "heavy", "柔软": "soft", "粗糙": "rough",
        "光滑": "smooth", "有光泽": "glossy", "无光": "matte",

        // 合身程度
        "紧身": "tight", "贴身": "form-fitting", "修身": "slim-fit",
        "宽松": "loose", "肥大": "oversized", "合身": "well-fitted",
        "过大": "too big", "过小": "too small", "刚好": "just right",

        // 长度状态
        "短": "short", "超短": "very short", "迷你": "mini",
        "长": "long", "超长": "very long", "及地": "floor-length",
        "中等": "medium", "标准": "standard", "正常": "normal",

        // 暴露程度
        "露": "exposed", "露出": "showing", "展示": "displaying",
        "暴露": "revealing", "性感": "sexy", "保守": "conservative",
        "大胆": "bold", "开放": "open", "含蓄": "modest",
        "若隐若现": "peek-a-boo", "欲盖弥彰": "teasingly covered",

        // 穿脱动作
        "脱": "undressing", "脱下": "taking off", "褪去": "removing",
        "穿": "dressing", "穿上": "putting on", "套": "slipping on",
        "换": "changing", "更衣": "changing clothes", "试穿": "trying on",
        "扯": "pulling", "撕": "tearing", "剪": "cutting",

        // 衣物状态
        "破": "torn", "破洞": "holes", "开口": "opening",
        "裂缝": "crack", "撕裂": "ripped", "磨损": "worn",
        "湿": "wet", "潮湿": "damp", "浸湿": "soaked",
        "干": "dry", "干燥": "dried", "干净": "clean",
        "脏": "dirty", "污": "stained", "染色": "colored",
        "乱": "messy", "凌乱": "disheveled", "整齐": "neat",
        "皱": "wrinkled", "平整": "smooth", "熨烫": "ironed"
    },

    romance_keywords: {
        // 关系称谓
        "恋人": "lovers", "情侣": "couple", "爱侣": "lovers",
        "男友": "boyfriend", "女友": "girlfriend", "伴侣": "partner",
        "爱人": "lover", "心上人": "sweetheart", "意中人": "beloved",
        "真爱": "true love", "挚爱": "beloved", "最爱": "favorite",

        // 恋爱类型
        "初恋": "first love", "暗恋": "crush", "单恋": "unrequited love",
        "热恋": "passionate love", "苦恋": "painful love", "禁恋": "forbidden love",
        "师生恋": "teacher-student romance", "办公室恋情": "office romance",
        "远距离恋爱": "long distance relationship", "网恋": "online romance",

        // 情感状态
        "心动": "heartbeat", "怦然心动": "heart racing", "一见钟情": "love at first sight",
        "脸红心跳": "blushing", "心跳加速": "racing heart", "心如鹿撞": "heart pounding",
        "心花怒放": "heart blooming", "心潮澎湃": "surging emotions",
        "情不自禁": "can't help oneself", "难以自拔": "unable to extricate",

        // 甜蜜情感
        "甜蜜": "sweet", "温馨": "warm", "浪漫": "romantic",
        "幸福": "happy", "快乐": "joyful", "满足": "satisfied",
        "陶醉": "intoxicated", "沉醉": "drunk with love", "痴迷": "infatuated",
        "甜腻": "sickeningly sweet", "蜜糖": "honey", "糖分": "sweetness",

        // 思念情感
        "想念": "missing", "思念": "longing", "牵挂": "caring",
        "惦记": "thinking of", "念念不忘": "unforgettable", "朝思暮想": "thinking day and night",
        "魂牵梦绕": "haunting dreams", "日思夜想": "thinking constantly",
        "相思": "lovesickness", "离愁": "separation sorrow",

        // 嫉妒情感
        "嫉妒": "jealous", "吃醋": "jealous", "争风吃醋": "jealous rivalry",
        "醋意": "jealousy", "占有欲": "possessiveness", "独占": "monopolize",
        "不安": "unease", "担心": "worry", "猜疑": "suspicion",

        // 分合状态
        "表白": "confession", "告白": "confession", "求爱": "courtship",
        "追求": "pursuit", "示爱": "showing love", "求婚": "proposal",
        "订婚": "engagement", "结婚": "marriage", "蜜月": "honeymoon",
        "分手": "breakup", "分离": "separation", "离别": "parting",
        "复合": "reunion", "和好": "reconcile", "重归于好": "getting back together",

        // 亲密行为
        "约会": "dating", "约会": "date", "幽会": "rendezvous",
        "散步": "walk together", "看电影": "watch movie", "吃饭": "dinner date",
        "牵手": "holding hands", "拥抱": "hugging", "接吻": "kissing",
        "依偎": "cuddling", "偎依": "snuggling", "相拥": "embracing",

        // 情话表达
        "情话": "love words", "甜言蜜语": "sweet words", "告白": "confession",
        "承诺": "promise", "誓言": "vow", "山盟海誓": "eternal vow",
        "海枯石烂": "until seas dry", "天长地久": "everlasting",
        "白头偕老": "grow old together", "永结同心": "united forever",

        // 情感深度
        "深爱": "deep love", "挚爱": "cherished love", "痴情": "devoted love",
        "专情": "faithful love", "深情": "deep affection", "真情": "true feelings",
        "纯情": "pure love", "真心": "sincere heart", "诚意": "sincerity",
        "用心": "heartfelt", "全心全意": "wholeheartedly", "一心一意": "single-minded"
    },

    emotional_states: {
        // 欲望相关
        "欲望": "desire", "渴望": "longing", "冲动": "impulse",
        "饥渴": "thirsty", "急需": "desperate", "迫切": "urgent",
        "强烈": "intense", "炽热": "burning", "火热": "passionate",
        "狂野": "wild", "疯狂": "crazy", "失控": "out of control",

        // 兴奋状态
        "兴奋": "excited", "激动": "aroused", "亢奋": "euphoric",
        "刺激": "stimulation", "快感": "pleasure", "爽": "pleasurable",
        "舒服": "comfortable", "畅快": "exhilarating", "痛快": "satisfying",
        "过瘾": "addictive", "上瘾": "addicted", "沉迷": "obsessed",

        // 满足状态
        "满足": "satisfied", "充实": "fulfilled", "完整": "complete",
        "愉悦": "pleasure", "快乐": "joy", "幸福": "happiness",
        "陶醉": "intoxicated", "沉醉": "drunk", "迷醉": "enchanted",
        "销魂": "ecstatic", "飘飘然": "floating", "如痴如醉": "mesmerized",

        // 紧张焦虑
        "紧张": "nervous", "不安": "anxious", "忐忑": "restless",
        "慌张": "flustered", "手足无措": "at a loss", "局促": "awkward",
        "窘迫": "embarrassed", "尴尬": "awkward", "难堪": "mortified",
        "焦虑": "anxious", "担忧": "worried", "忧虑": "concerned",

        // 期待好奇
        "期待": "anticipation", "盼望": "looking forward", "向往": "yearning",
        "好奇": "curious", "感兴趣": "interested", "想知道": "wondering",
        "探索": "exploration", "发现": "discovery", "新奇": "novelty",
        "惊喜": "surprise", "意外": "unexpected", "震撼": "shocking",

        // 羞耻害羞
        "羞耻": "shame", "羞愧": "ashamed", "惭愧": "guilty",
        "不好意思": "embarrassed", "难为情": "shy", "脸红": "blushing",
        "害羞": "shy", "腼腆": "bashful", "扭捏": "coy",
        "矜持": "reserved", "含蓄": "modest", "内敛": "introverted",

        // 大胆主动
        "大胆": "bold", "勇敢": "brave", "无畏": "fearless",
        "主动": "proactive", "积极": "active", "进取": "aggressive",
        "直接": "direct", "坦率": "frank", "开放": "open",
        "放得开": "uninhibited", "豪放": "unrestrained", "奔放": "wild",

        // 被动顺从
        "被动": "passive", "消极": "negative", "退缩": "withdrawn",
        "顺从": "submissive", "听话": "obedient", "乖巧": "well-behaved",
        "温顺": "docile", "柔顺": "gentle", "配合": "cooperative",
        "依赖": "dependent", "依恋": "attached", "粘人": "clingy",

        // 反抗挣扎
        "反抗": "resistant", "抗拒": "resisting", "反对": "opposing",
        "挣扎": "struggling", "反抗": "rebelling", "违抗": "defying",
        "拒绝": "refusing", "推辞": "declining", "回避": "avoiding",
        "逃避": "escaping", "躲避": "hiding", "闪躲": "dodging",

        // 情感波动
        "矛盾": "conflicted", "纠结": "tangled", "复杂": "complicated",
        "混乱": "confused", "迷茫": "lost", "困惑": "puzzled",
        "犹豫": "hesitant", "踌躇": "hesitating", "不决": "undecided",
        "摇摆": "wavering", "动摇": "shaken", "不定": "unstable"
    }
};

let isProcessing = false;
let currentProgressButton = null;
let processedMessages = new Map();
let currentImageUrl = null;
let currentSettings = null;
let lastScreenSize = null;

function getCurrentScreenSize() {
    return window.innerWidth <= 1000 ? 'small' : 'large';
}

function handleWindowResize() {
    if (!isActive()) return;

    const currentScreenSize = getCurrentScreenSize();

    if (lastScreenSize && lastScreenSize !== currentScreenSize && currentImageUrl && currentSettings) {
        $('#wallhaven-app-background, #wallhaven-chat-background').remove();
        $('#wallhaven-app-overlay, #wallhaven-chat-overlay').remove();

        applyBackgroundToApp(currentImageUrl, currentSettings);
    }

    lastScreenSize = currentScreenSize;
}

function clearBackgroundState() {
    document.querySelectorAll('[id^="wallhaven-"]').forEach(el => el.remove());
    currentImageUrl = null;
    currentSettings = null;
    lastScreenSize = null;
}

function getWallhavenSettings() {
    if (!extension_settings[EXT_ID].wallhavenBackground) {
        extension_settings[EXT_ID].wallhavenBackground = structuredClone(defaultSettings);
    }
    const settings = extension_settings[EXT_ID].wallhavenBackground;
    for (const key in defaultSettings) {
        if (settings[key] === undefined) {
            settings[key] = defaultSettings[key];
        }
    }
    return settings;
}

function isActive() {
    if (!window.isXiaobaixEnabled) return false;
    const settings = getWallhavenSettings();
    return settings.enabled;
}

function isLandscapeOrientation() {
    return window.innerWidth > window.innerHeight;
}

function getRatiosForOrientation() {
    if (isLandscapeOrientation()) {
        return "16x9,16x10,21x9";
    } else {
        return "9x16,10x16,1x1,9x18";
    }
}

function showProgressInMessageHeader(messageElement, text) {
    const flexContainer = messageElement.querySelector('.flex-container.flex1.alignitemscenter');
    if (!flexContainer) return null;

    removeProgressFromMessageHeader();

    const progressButton = document.createElement('div');
    progressButton.className = 'mes_btn wallhaven_progress_indicator';
    progressButton.style.cssText = `
        color: #007acc !important;
        cursor: default !important;
        font-size: 11px !important;
        padding: 2px 6px !important;
        opacity: 0.9;
    `;
    progressButton.innerHTML = `<i class="fa-solid fa-spinner fa-spin" style="margin-right: 4px;"></i>${text}`;
    progressButton.title = '正在为消息生成配图...';

    flexContainer.appendChild(progressButton);
    currentProgressButton = progressButton;

    return progressButton;
}

function updateProgressText(text) {
    if (currentProgressButton) {
        currentProgressButton.innerHTML = `<i class="fa-solid fa-spinner fa-spin" style="margin-right: 4px;"></i>${text}`;
    }
}

function removeProgressFromMessageHeader() {
    if (currentProgressButton) {
        currentProgressButton.remove();
        currentProgressButton = null;
    }
    document.querySelectorAll('.wallhaven_progress_indicator').forEach(el => el.remove());
}

function renderCustomTagsList() {
    const settings = getWallhavenSettings();
    const container = document.getElementById('wallhaven_custom_tags_list');
    if (!container) return;

    container.innerHTML = '';

    if (!settings.customTags || settings.customTags.length === 0) {
        container.innerHTML = '<div class="custom-tags-empty">暂无自定义标签</div>';
        return;
    }

    settings.customTags.forEach(tag => {
        const tagElement = document.createElement('div');
        tagElement.className = 'custom-tag-item';
        tagElement.innerHTML = `
            <span class="custom-tag-text">${tag}</span>
            <span class="custom-tag-remove" data-tag="${tag}">×</span>
        `;
        container.appendChild(tagElement);
    });

    container.querySelectorAll('.custom-tag-remove').forEach(btn => {
        btn.addEventListener('click', function() {
            removeCustomTag(this.dataset.tag);
        });
    });
}

function addCustomTag(tag) {
    if (!tag || !tag.trim()) return;

    tag = tag.trim().toLowerCase();
    const settings = getWallhavenSettings();

    if (!settings.customTags) {
        settings.customTags = [];
    }

    if (settings.customTags.includes(tag)) {
        return false;
    }

    settings.customTags.push(tag);
    saveSettingsDebounced();
    renderCustomTagsList();
    return true;
}

function removeCustomTag(tag) {
    const settings = getWallhavenSettings();
    if (!settings.customTags) return;

    const index = settings.customTags.indexOf(tag);
    if (index > -1) {
        settings.customTags.splice(index, 1);
        saveSettingsDebounced();
        renderCustomTagsList();
    }
}

function extractTagsFromText(text, isBgMode = false) {
    const settings = getWallhavenSettings();

    const customTagObjs = (settings.customTags || []).map(tag => ({
        tag: tag,
        category: 'custom',
        weight: tagWeights.custom,
        position: text.lastIndexOf(tag)
    }));

    if (isBgMode) {
        const bgCategories = ['locations', 'weather_time', 'objects'];
        const tagsByCategory = {};

        bgCategories.forEach(category => {
            tagsByCategory[category] = [];
            if (wallhavenTags[category]) {
                Object.entries(wallhavenTags[category]).forEach(([chinese, english]) => {
                    const lastPos = text.lastIndexOf(chinese);
                    if (lastPos !== -1) {
                        tagsByCategory[category].push({
                            tag: english,
                            category: category,
                            weight: tagWeights[category] || 1,
                            position: lastPos,
                            chinese: chinese
                        });
                    }
                });
            }
        });

        const selectedTags = [...customTagObjs];

        Object.entries(tagsByCategory).forEach(([category, tags]) => {
            if (tags.length === 0) return;

            tags.sort((a, b) => b.position - a.position);

            const selectedFromCategory = tags.slice(0, 1);
            selectedFromCategory.forEach(tagObj => {
                selectedTags.push({
                    tag: tagObj.tag,
                    category: tagObj.category,
                    weight: tagObj.weight
                });
            });
        });

        if (selectedTags.length === customTagObjs.length) {
            selectedTags.push({ tag: 'landscape', category: 'background_fallback', weight: 1 });
        }

        return { tags: selectedTags };
    } else {

        const tagsByCategory = {};

        Object.keys(wallhavenTags).forEach(category => {
            tagsByCategory[category] = [];
            Object.entries(wallhavenTags[category]).forEach(([chinese, english]) => {
                const lastPos = text.lastIndexOf(chinese);
                if (lastPos !== -1) {
                    tagsByCategory[category].push({
                        tag: english,
                        category: category,
                        weight: tagWeights[category] || 1,
                        position: lastPos,
                        chinese: chinese
                    });
                }
            });
        });

        const selectedTags = [...customTagObjs];

        Object.entries(tagsByCategory).forEach(([category, tags]) => {
            if (tags.length === 0) return;

            tags.sort((a, b) => b.position - a.position);

            let maxCount = 1;
            if (['characters', 'clothing', 'body_features'].includes(category)) {
                maxCount = 2;
            }

            const selectedFromCategory = tags.slice(0, maxCount);
            selectedFromCategory.forEach(tagObj => {
                selectedTags.push({
                    tag: tagObj.tag,
                    category: tagObj.category,
                    weight: tagObj.weight
                });
            });
        });

        return { tags: selectedTags };
    }
}

async function fetchWithCFWorker(targetUrl) {
    const cfWorkerUrl = 'https://wallhaven.velure.top/?url=';
    const finalUrl = cfWorkerUrl + encodeURIComponent(targetUrl);

    const response = await fetch(finalUrl);
    if (!response.ok) {
        throw new Error(`CF Worker请求失败: HTTP ${response.status} - ${response.statusText}`);
    }
    return response;
}

async function searchSingleTag(tagObj, category, purity, isBgMode) {
    let searchTag = tagObj.tag;
    if (isBgMode) {
        searchTag = `${tagObj.tag} -girl -male -people -anime`;
    }
    const ratios = getRatiosForOrientation();
    const wallhavenUrl = `https://wallhaven.cc/api/v1/search?q=${encodeURIComponent(searchTag)}&categories=${category}&purity=${purity}&ratios=${ratios}&sorting=favorites&page=1&`;

    try {
        const response = await fetchWithCFWorker(wallhavenUrl);
        const data = await response.json();
        return {
            tagObj: tagObj,
            success: true,
            total: data.meta.total,
            images: data.data || []
        };
    } catch (error) {
        return {
            tagObj: tagObj,
            success: false,
            error: error.message,
            total: 0,
            images: []
        };
    }
}

async function intelligentTagMatching(tagObjs, settings) {
    if (!tagObjs || tagObjs.length === 0) {
        throw new Error('没有可用的标签');
    }

    const allImages = new Map();

    for (let i = 0; i < tagObjs.length; i++) {
        if (!isActive()) {
            throw new Error('功能已禁用');
        }

        const tagObj = tagObjs[i];
        const isCustom = tagObj.category === 'custom' ? '[自定义]' : '';
        updateProgressText(`搜索 ${i + 1}/${tagObjs.length}: ${isCustom}${tagObj.tag} (权重${tagObj.weight})`);
        const result = await searchSingleTag(tagObj, settings.category, settings.purity, settings.bgMode);
        if (result.success) {
            result.images.forEach(img => {
                if (!allImages.has(img.id)) {
                    allImages.set(img.id, {
                        ...img,
                        matchedTags: [tagObj],
                        weightedScore: tagObj.weight
                    });
                } else {
                    const existingImg = allImages.get(img.id);
                    existingImg.matchedTags.push(tagObj);
                    existingImg.weightedScore += tagObj.weight;
                }
            });
        }
        if (i < tagObjs.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    const allImagesArray = Array.from(allImages.values());
    if (allImagesArray.length === 0) {
        throw new Error('所有标签都没有找到匹配的图片');
    }

    allImagesArray.sort((a, b) => {
        if (b.weightedScore !== a.weightedScore) {
            return b.weightedScore - a.weightedScore;
        }
        return b.favorites - a.favorites;
    });

    const maxWeightedScore = allImagesArray[0].weightedScore;
    const bestMatches = allImagesArray.filter(img => img.weightedScore === maxWeightedScore);
    const randomIndex = Math.floor(Math.random() * bestMatches.length);

    return bestMatches[randomIndex];
}

function applyMessageStyling() {
    const mesElements = document.querySelectorAll('#chat .mes:not([data-wallhaven-styled])');
    mesElements.forEach(mes => {
        mes.style.cssText += `
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            background-color: transparent !important;
            box-shadow: none !important;
            position: relative !important;
            z-index: 1002 !important;
        `;
        mes.setAttribute('data-wallhaven-styled', 'true');
    });

    const mesTextElements = document.querySelectorAll('#chat .mes_text:not([data-wallhaven-text-styled])');
    mesTextElements.forEach(mesText => {
        mesText.style.cssText += `
            text-shadow: rgba(0, 0, 0, 0.8) 1px 1px 2px !important;
            color: inherit !important;
            position: relative !important;
            z-index: 1003 !important;
        `;
        mesText.setAttribute('data-wallhaven-text-styled', 'true');
    });

    const messageElements = document.querySelectorAll('#chat .mes, #chat .mes_text, #chat .name, #chat .mes_img, #chat .mes_avatar, #chat .mes_btn');
    messageElements.forEach(element => {
        if (element && !element.hasAttribute('data-wallhaven-z-styled')) {
            element.style.cssText += `
                position: relative !important;
                z-index: 1002 !important;
            `;
            element.setAttribute('data-wallhaven-z-styled', 'true');
        }
    });
}

function applyBackgroundToApp(imageUrl, settings) {
    currentImageUrl = imageUrl;
    currentSettings = { ...settings };
    lastScreenSize = getCurrentScreenSize();
    
    const isSmallScreen = window.innerWidth <= 1000;
    
    if (isSmallScreen) {
        const chatElement = document.getElementById('chat');
        if (!chatElement) return;
        
        const bgId = 'wallhaven-mobile-background';
        const overlayId = 'wallhaven-mobile-overlay';
        
        document.querySelectorAll('[id^="wallhaven-"]').forEach(el => el.remove());
        
        let topOffset = 0;
        const rightNavHolder = document.getElementById('rightNavHolder');
        if (rightNavHolder) {
            const rect = rightNavHolder.getBoundingClientRect();
            topOffset = rect.bottom;
        } else {
            topOffset = 50;
        }
        
        let backgroundContainer = document.getElementById(bgId);
        let overlay = document.getElementById(overlayId);
        
        if (!backgroundContainer) {
            backgroundContainer = document.createElement('div');
            backgroundContainer.id = bgId;
            backgroundContainer.style.cssText = `
                position: fixed !important;
                top: ${topOffset}px !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                width: 100vw !important;
                height: calc(100vh - ${topOffset}px) !important;
                background-size: 100% auto !important;
                background-position: top center !important;
                background-repeat: no-repeat !important;
                z-index: -1 !important;
                pointer-events: none !important;
                overflow: hidden !important;
            `;
            document.body.appendChild(backgroundContainer);
        }
        
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = overlayId;
            overlay.style.cssText = `
                position: fixed !important;
                top: ${topOffset}px !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                width: 100vw !important;
                height: calc(100vh - ${topOffset}px) !important;
                background-color: rgba(0, 0, 0, ${settings.opacity}) !important;
                z-index: 0 !important;
                pointer-events: none !important;
                overflow: hidden !important;
            `;
            document.body.appendChild(overlay);
        }
        
        backgroundContainer.style.backgroundImage = `url("${imageUrl}")`;
        overlay.style.backgroundColor = `rgba(0, 0, 0, ${settings.opacity})`;
        
        backgroundContainer.style.top = `${topOffset}px`;
        backgroundContainer.style.height = `calc(100vh - ${topOffset}px)`;
        overlay.style.top = `${topOffset}px`;
        overlay.style.height = `calc(100vh - ${topOffset}px)`;
        
        if (chatElement) {
            chatElement.style.cssText += `
                background-color: transparent !important;
                background-image: none !important;
                background: transparent !important;
                position: relative !important;
                z-index: 1 !important;
                backdrop-filter: none !important;
                -webkit-backdrop-filter: none !important;
            `;
        }
        
        applyMessageStyling();
        
    } else {
        const targetContainer = document.getElementById('expression-wrapper');
        if (!targetContainer) return;

        const bgId = 'wallhaven-app-background';
        const overlayId = 'wallhaven-app-overlay';

        let backgroundContainer = document.getElementById(bgId);
        let overlay = document.getElementById(overlayId);

        if (!backgroundContainer) {
            backgroundContainer = document.createElement('div');
            backgroundContainer.id = bgId;
            backgroundContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-size: 100% auto;
                background-position: top center;
                background-repeat: no-repeat;
                z-index: 1;
                pointer-events: none;
            `;
            targetContainer.insertBefore(backgroundContainer, targetContainer.firstChild);
        }

        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = overlayId;
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, ${settings.opacity});
                z-index: 2;
                pointer-events: none;
            `;
            targetContainer.insertBefore(overlay, targetContainer.firstChild);
        }

        backgroundContainer.style.backgroundImage = `url("${imageUrl}")`;
        overlay.style.backgroundColor = `rgba(0, 0, 0, ${settings.opacity})`;
        
        targetContainer.style.position = 'relative';
        
        const chatElement = document.getElementById('chat');
        if (chatElement) {
            chatElement.style.cssText += `
                background-color: transparent !important;
                background-image: none !important;
                background: transparent !important;
                position: relative;
                z-index: 3;
                backdrop-filter: none !important;
                -webkit-backdrop-filter: none !important;
                box-shadow: none !important;
                border: none !important;
                text-shadow: none !important;
                opacity: 1 !important;
            `;
        }
        applyMessageStyling();
    }
}

function isMessageComplete(messageElement) {
    const regenerateBtn = messageElement.querySelector('.mes_regenerate');
    const editBtn = messageElement.querySelector('.mes_edit');
    const hasButtons = regenerateBtn || editBtn;

    const mesText = messageElement.querySelector('.mes_text');
    const hasContent = mesText && mesText.textContent.trim().length > 0;

    const hasStreamingIndicator = messageElement.querySelector('.typing_indicator') ||
                                 messageElement.querySelector('.mes_loading') ||
                                 messageElement.classList.contains('streaming');

    return hasButtons && hasContent && !hasStreamingIndicator;
}

function getContentHash(text) {
    let hash = 0;
    if (text.length === 0) return hash;
    for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}

function shouldProcessMessage(messageId, messageText) {
    const contentHash = getContentHash(messageText);
    const storedHash = processedMessages.get(messageId);
    return !storedHash || storedHash !== contentHash;
}

function markMessageProcessed(messageId, messageText) {
    const contentHash = getContentHash(messageText);
    processedMessages.set(messageId, contentHash);
}

async function handleAIMessage(data) {
    if (!isActive() || isProcessing) return;

    try {
        isProcessing = true;

        const messageId = data.messageId || data;
        if (!messageId) return;

        const messageElement = document.querySelector(`div.mes[mesid="${messageId}"]`);
        if (!messageElement || messageElement.classList.contains('is_user')) return;

        let retryCount = 0;
        const maxRetries = 10;

        while (retryCount < maxRetries) {
            if (isMessageComplete(messageElement)) {
                break;
            }
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (!isActive()) return;
        }

        const mesText = messageElement.querySelector('.mes_text');
        if (!mesText) return;

        const messageText = mesText.textContent || '';
        if (!messageText.trim() || messageText.length < 10) return;

        if (!shouldProcessMessage(messageId, messageText)) {
            return;
        }

        markMessageProcessed(messageId, messageText);

        const settings = getWallhavenSettings();

        showProgressInMessageHeader(messageElement, '提取标签中...');

        const result = extractTagsFromText(messageText, settings.bgMode);
        if (result.tags.length === 0) {
            updateProgressText('未提取到标签');
            setTimeout(removeProgressFromMessageHeader, 2000);
            return;
        }

        if (!isActive()) return;

        const orientation = isLandscapeOrientation() ? '横屏' : '竖屏';
        const modeText = settings.bgMode ? '背景' : '角色';
        const totalWeight = result.tags.reduce((sum, tagObj) => sum + tagObj.weight, 0);
        const customCount = result.tags.filter(t => t.category === 'custom').length;
        updateProgressText(`${orientation}${modeText}:提取到 ${result.tags.length} 个标签 (自定义${customCount}个,总权重${totalWeight})`);
        await new Promise(resolve => setTimeout(resolve, 500));

        if (!isActive()) return;

        const selectedImage = await intelligentTagMatching(result.tags, settings);

        if (!isActive()) return;

        updateProgressText('应用背景中...');

        const imageUrl = `https://wallhaven.velure.top/?url=${encodeURIComponent(selectedImage.path)}`;

        applyBackgroundToApp(imageUrl, settings);

        const coreTagsCount = selectedImage.matchedTags.filter(t => t.weight >= 2).length;
        const customMatchCount = selectedImage.matchedTags.filter(t => t.category === 'custom').length;
        updateProgressText(`${modeText}配图完成! 核心匹配${coreTagsCount}个 自定义${customMatchCount}个 权重${selectedImage.weightedScore}`);
        setTimeout(removeProgressFromMessageHeader, 2000);

    } catch (error) {
        updateProgressText(`配图失败: ${error.message.length > 20 ? error.message.substring(0, 20) + '...' : error.message}`);
        setTimeout(removeProgressFromMessageHeader, 3000);
    } finally {
        isProcessing = false;
    }
}

function updateSettingsControls() {
    const settings = getWallhavenSettings();
    $('#wallhaven_enabled').prop('checked', settings.enabled);
    $('#wallhaven_bg_mode').prop('checked', settings.bgMode);
    $('#wallhaven_category').val(settings.category);
    $('#wallhaven_purity').val(settings.purity);
    $('#wallhaven_opacity').val(settings.opacity);
    $('#wallhaven_opacity_value').text(Math.round(settings.opacity * 100) + '%');

    // 控制后续设置的显示/隐藏
    const settingsContainer = $('#wallhaven_settings_container');
    if (settings.enabled) {
        settingsContainer.show();
    } else {
        settingsContainer.hide();
    }

    renderCustomTagsList();
}

function initSettingsEvents() {
    $('#wallhaven_enabled').off('change').on('change', function() {
        if (!window.isXiaobaixEnabled) return;

        const settings = getWallhavenSettings();
        const wasEnabled = settings.enabled;
        settings.enabled = $(this).prop('checked');
        saveSettingsDebounced();

        // 控制后续设置的显示/隐藏
        const settingsContainer = $('#wallhaven_settings_container');
        if (settings.enabled) {
            settingsContainer.show();
        } else {
            settingsContainer.hide();
        }

        if (settings.enabled && !wasEnabled) {
            bindMessageHandlers();
        } else if (!settings.enabled && wasEnabled) {
            clearBackgroundState();
            removeProgressFromMessageHeader();
            processedMessages.clear();
            isProcessing = false;
            unbindMessageHandlers();
        }
    });

    $('#wallhaven_bg_mode').off('change').on('change', function() {
        if (!window.isXiaobaixEnabled) return;
        const settings = getWallhavenSettings();
        settings.bgMode = $(this).prop('checked');
        saveSettingsDebounced();
    });

    $('#wallhaven_category').off('change').on('change', function() {
        if (!window.isXiaobaixEnabled) return;
        const settings = getWallhavenSettings();
        settings.category = $(this).val();
        saveSettingsDebounced();
    });

    $('#wallhaven_purity').off('change').on('change', function() {
        if (!window.isXiaobaixEnabled) return;
        const settings = getWallhavenSettings();
        settings.purity = $(this).val();
        saveSettingsDebounced();
    });

    $('#wallhaven_opacity').off('input').on('input', function() {
        if (!window.isXiaobaixEnabled) return;
        const settings = getWallhavenSettings();
        settings.opacity = parseFloat($(this).val());
        $('#wallhaven_opacity_value').text(Math.round(settings.opacity * 100) + '%');
        $('#wallhaven-app-overlay, #wallhaven-chat-overlay').css('background-color', `rgba(0, 0, 0, ${settings.opacity})`);
        saveSettingsDebounced();
    });

    $('#wallhaven_add_custom_tag').off('click').on('click', function() {
        if (!window.isXiaobaixEnabled) return;
        const input = document.getElementById('wallhaven_custom_tag_input');
        const tag = input.value.trim();
        if (tag) {
            if (addCustomTag(tag)) {
                input.value = '';
            } else {
                input.style.borderColor = '#ff6b6b';
                setTimeout(() => {
                    input.style.borderColor = '';
                }, 1000);
            }
        }
    });

    $('#wallhaven_custom_tag_input').off('keypress').on('keypress', function(e) {
        if (!window.isXiaobaixEnabled) return;
        if (e.which === 13) {
            $('#wallhaven_add_custom_tag').click();
        }
    });
}

function bindMessageHandlers() {
    messageEvents.cleanup();

    messageEvents.on(event_types.MESSAGE_RECEIVED, handleAIMessage);
    if (event_types.MESSAGE_SWIPED) {
        messageEvents.on(event_types.MESSAGE_SWIPED, handleAIMessage);
    }
    if (event_types.MESSAGE_EDITED) {
        messageEvents.on(event_types.MESSAGE_EDITED, handleAIMessage);
    }
    if (event_types.MESSAGE_UPDATED) {
        messageEvents.on(event_types.MESSAGE_UPDATED, handleAIMessage);
    }
}

function unbindMessageHandlers() {
    messageEvents.cleanup();
}

function handleGlobalStateChange(event) {
    const globalEnabled = event.detail.enabled;

    const wallhavenControls = [
        'wallhaven_enabled', 'wallhaven_bg_mode', 'wallhaven_category',
        'wallhaven_purity', 'wallhaven_opacity', 'wallhaven_custom_tag_input',
        'wallhaven_add_custom_tag'
    ];

    wallhavenControls.forEach(id => {
        $(`#${id}`).prop('disabled', !globalEnabled).toggleClass('disabled-control', !globalEnabled);
    });

    if (globalEnabled) {
        updateSettingsControls();
        initSettingsEvents();

        if (isActive()) {
            bindMessageHandlers();
        }
    } else {
        clearBackgroundState();
        removeProgressFromMessageHeader();
        processedMessages.clear();
        isProcessing = false;

        unbindMessageHandlers();

        $('#wallhaven_enabled, #wallhaven_bg_mode, #wallhaven_category, #wallhaven_purity, #wallhaven_opacity, #wallhaven_add_custom_tag').off();
        $('#wallhaven_custom_tag_input').off();
    }
}

function handleChatChanged() {
    processedMessages.clear();
    clearBackgroundState();
    removeProgressFromMessageHeader();
    isProcessing = false;
}

function initWallhavenBackground() {
    const globalEnabled = window.isXiaobaixEnabled !== undefined ? window.isXiaobaixEnabled : true;

    const wallhavenControls = [
        'wallhaven_enabled', 'wallhaven_bg_mode', 'wallhaven_category',
        'wallhaven_purity', 'wallhaven_opacity', 'wallhaven_custom_tag_input',
        'wallhaven_add_custom_tag'
    ];

    wallhavenControls.forEach(id => {
        $(`#${id}`).prop('disabled', !globalEnabled).toggleClass('disabled-control', !globalEnabled);
    });

    if (globalEnabled) {
        updateSettingsControls();
        initSettingsEvents();

        if (isActive()) {
            bindMessageHandlers();
        }
    }

    document.addEventListener('xiaobaixEnabledChanged', handleGlobalStateChange);
    globalEvents.on(event_types.CHAT_CHANGED, handleChatChanged);
    window.addEventListener('resize', handleWindowResize);

    lastScreenSize = getCurrentScreenSize();

    return { cleanup };
}

function cleanup() {
    messageEvents.cleanup();
    globalEvents.cleanup();
    document.removeEventListener('xiaobaixEnabledChanged', handleGlobalStateChange);
    window.removeEventListener('resize', handleWindowResize);

    clearBackgroundState();
    removeProgressFromMessageHeader();

    isProcessing = false;
    processedMessages.clear();
    currentProgressButton = null;
    currentImageUrl = null;
    currentSettings = null;
}

export { initWallhavenBackground };
