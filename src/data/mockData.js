// Minimalist, visual-first mock data styled after Jimeng AI (即梦AI)

export const PRODUCTS = [
  {
    id: 'prod-serum',
    name: '极光微囊精华',
    category: '美妆',
    svgType: 'serum',
    palette: 'lavender',
    prompt: '极光紫色玻璃精华瓶，天然白色洞石展台，清晨阳光水波纹投影，微距水珠，极简高级护肤广告'
  },
  {
    id: 'prod-coffee',
    name: '意式胶囊咖啡机',
    category: '家电',
    svgType: 'coffee',
    palette: 'cream',
    prompt: '奶油白便携意式咖啡机，原木桌面，午后百叶窗阳光，浓郁金黄咖啡油脂，温暖治愈生活感'
  },
  {
    id: 'prod-headphone',
    name: '钛晶降噪耳机',
    category: '数码',
    svgType: 'headphone',
    palette: 'glacier',
    prompt: '银白钛金属头戴耳机，悬浮于冰川蓝透明亚克力几何台，柔和轮廓光，极简工业设计大片'
  },
  {
    id: 'prod-dress',
    name: '桑蚕丝醋酸长裙',
    category: '穿搭',
    svgType: 'dress',
    palette: 'rose',
    prompt: '香槟粉重磅真丝连衣裙，法式阳光露台，微风吹拂丝滑垂坠感，自然松弛感时尚街拍'
  }
];

export const IMAGE_FEED = [
  {
    id: 'batch-1',
    prompt: '极光紫色玻璃精华瓶，天然白色洞石展台，清晨阳光水波纹投影，微距水珠',
    model: 'Seedream 3.0 电商版',
    ratio: '3:4',
    time: '刚刚',
    svgType: 'serum',
    items: [
      { id: 'img-1', palette: 'lavender', tag: '柔光微距' },
      { id: 'img-2', palette: 'botanical', tag: '森系溪流' },
      { id: 'img-3', palette: 'cream', tag: '侘寂洞石' },
      { id: 'img-4', palette: 'rose', tag: '花瓣晨露' }
    ]
  },
  {
    id: 'batch-2',
    prompt: '奶油白便携意式咖啡机，原木桌面，午后百叶窗阳光，浓郁金黄咖啡油脂',
    model: 'Seedream 3.0 电商版',
    ratio: '1:1',
    time: '10分钟前',
    svgType: 'coffee',
    items: [
      { id: 'img-5', palette: 'cream', tag: '胡桃木暖阳' },
      { id: 'img-6', palette: 'apricot', tag: '早八阳光房' },
      { id: 'img-7', palette: 'botanical', tag: '户外露营' },
      { id: 'img-8', palette: 'glacier', tag: '极简吧台' }
    ]
  }
];

export const VIDEO_FEED = [
  {
    id: 'vid-1',
    title: '微囊精华 · 水波丁达尔环绕运镜',
    prompt: '镜头缓慢360度环绕精华液瓶身，阳光穿透水珠产生折射光斑，水波纹轻柔荡漾',
    duration: '00:05',
    ratio: '9:16',
    motion: '环绕运镜',
    model: 'Video 3.0 Pro',
    svgType: 'serum',
    palette: 'lavender',
    hook: '前3秒微距水珠爆开'
  },
  {
    id: 'vid-2',
    title: '便携咖啡机 · 黄金油脂慢动作萃取',
    prompt: '特写镜头推进，浓郁金黄咖啡液缓慢流入冰牛奶杯中，形成唯美分层大理石纹',
    duration: '00:05',
    ratio: '9:16',
    motion: '推镜头',
    model: 'Video 3.0 Pro',
    svgType: 'coffee',
    palette: 'cream',
    hook: 'ASMR浓缩萃取原声'
  },
  {
    id: 'vid-3',
    title: '钛晶耳机 · 悬浮声波引力场',
    prompt: '耳机在空中轻盈悬浮旋转，浅蓝色透明声波涟漪向外扩散，金属表面高光流动',
    duration: '00:10',
    ratio: '16:9',
    motion: '悬浮环绕',
    model: 'Video 3.0 Pro',
    svgType: 'headphone',
    palette: 'glacier',
    hook: '一秒静音反差开局'
  },
  {
    id: 'vid-4',
    title: '桑蚕丝长裙 · 南法海风裙摆律动',
    prompt: '逆光慢动作抓拍，海风吹起香槟粉真丝裙摆，呈现流动珍珠光泽感',
    duration: '00:05',
    ratio: '9:16',
    motion: '手持跟随',
    model: 'Video 3.0 Pro',
    svgType: 'dress',
    palette: 'rose',
    hook: '微胖显瘦视觉反差'
  }
];

export const AUTO_SLICER_CLIPS = [
  {
    id: 'slice-1',
    title: '黄金破价片段',
    timeRange: '00:14 - 00:42',
    duration: '28s',
    score: 98,
    startPct: 6,
    widthPct: 19,
    tag: '价格锚点峰值',
    caption: '“今天买30ml直接发60ml！”',
    svgType: 'serum',
    palette: 'lavender'
  },
  {
    id: 'slice-2',
    title: '水分仪实测对比',
    timeRange: '00:55 - 01:25',
    duration: '30s',
    score: 95,
    startPct: 31,
    widthPct: 20,
    tag: '特写高光帧',
    caption: '“3秒水润度从24%飙到72%”',
    svgType: 'serum',
    palette: 'botanical'
  },
  {
    id: 'slice-3',
    title: '熬夜肌痛点共鸣',
    timeRange: '01:38 - 02:06',
    duration: '28s',
    score: 93,
    startPct: 57,
    widthPct: 18,
    tag: '高完播开头',
    caption: '“为什么涂再贵面霜都暗沉？”',
    svgType: 'serum',
    palette: 'rose'
  },
  {
    id: 'slice-4',
    title: '30秒冰美式油脂特写',
    timeRange: '02:18 - 02:50',
    duration: '32s',
    score: 96,
    startPct: 80,
    widthPct: 17,
    tag: '加购波峰',
    caption: '“看这层厚厚的黄金咖啡油脂”',
    svgType: 'coffee',
    palette: 'cream'
  }
];

export const VIRAL_INSPIRATIONS = [
  {
    id: 'ins-1',
    type: 'video',
    category: '美妆',
    title: '微距爆珠 · 黄金3秒视觉奇观',
    likes: '38.6w',
    retention: '71%',
    aspect: 'aspect-[3/4]',
    svgType: 'serum',
    palette: 'lavender',
    hook: '“你买的精华其实90%在开盖那刻就失活了”',
    prompt: '极光紫色玻璃精华瓶，微距金色爆珠悬浮，清晨柔光水波纹，高级护肤品大片'
  },
  {
    id: 'ins-2',
    type: 'copy',
    category: '家电',
    title: '早八打工人 · 30秒冰美式自由',
    likes: '41.2w',
    retention: '69%',
    aspect: 'aspect-square',
    svgType: 'coffee',
    palette: 'cream',
    hook: '“算了一笔账吓一跳，每天一杯外卖咖啡=一年扔掉一部iPhone”',
    prompt: '奶油白便携意式咖啡机，原木桌面，午后暖阳，金黄咖啡油脂特写'
  },
  {
    id: 'ins-3',
    type: 'video',
    category: '数码',
    title: '地铁一秒静音 · 降噪声场反差',
    likes: '29.4w',
    retention: '76%',
    aspect: 'aspect-[3/4]',
    svgType: 'headphone',
    palette: 'glacier',
    hook: '“早高峰地铁一秒切换到冰岛无人区是什么体验？”',
    prompt: '银白钛金属头戴耳机，悬浮于冰川蓝透明亚克力展台，柔和冷调轮廓光'
  },
  {
    id: 'ins-4',
    type: 'video',
    category: '穿搭',
    title: '梨形身材逆袭 · 斜裁真丝垂坠感',
    likes: '24.8w',
    retention: '74%',
    aspect: 'aspect-[4/5]',
    svgType: 'dress',
    palette: 'rose',
    hook: '“同样是120斤，为什么右边穿出了纸片人高定感？”',
    prompt: '香槟粉重磅桑蚕丝长裙，法式露台逆光，裙摆丝滑垂坠微风律动'
  },
  {
    id: 'ins-5',
    type: 'copy',
    category: '美妆',
    title: '森系山泉成分 · 敏感肌修护种草',
    likes: '19.5w',
    retention: '66%',
    aspect: 'aspect-square',
    svgType: 'serum',
    palette: 'botanical',
    hook: '“换季泛红烂脸期，全靠这瓶水感精华救命✨”',
    prompt: '精华液置于翠绿溪流苔藓石上，清晨阳光水雾，清透自然护肤大片'
  },
  {
    id: 'ins-6',
    type: 'video',
    category: '家电',
    title: '户外露营咖啡馆 · 无线便携实测',
    likes: '22.1w',
    retention: '68%',
    aspect: 'aspect-[3/4]',
    svgType: 'coffee',
    palette: 'apricot',
    hook: '“把精品咖啡馆装进背包，山野间也能萃出黄金油脂”',
    prompt: '便携咖啡机置于户外露营木桌，秋日暖阳草地背景，热气腾腾浓缩咖啡'
  }
];
