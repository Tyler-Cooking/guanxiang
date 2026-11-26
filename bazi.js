import LunarJS from 'lunar-javascript';

const { Solar, LunarUtil } = LunarJS;
const ELEMENTS = ['木', '火', '土', '金', '水'];
const STEMS = '甲乙丙丁戊己庚辛壬癸';
const BRANCHES = '子丑寅卯辰巳午未申酉戌亥';
const JIE = ['立春', '惊蛰', '清明', '立夏', '芒种', '小暑', '立秋', '白露', '寒露', '立冬', '大雪', '小寒'];
const CHONG = ['子午', '丑未', '寅申', '卯酉', '辰戌', '巳亥'];
const HE = ['子丑', '寅亥', '卯戌', '辰酉', '巳申', '午未'];
const GAN_HE = ['甲己', '乙庚', '丙辛', '丁壬', '戊癸'];
const round = (n) => Math.round(n * 100) / 100;
const pad = (n) => String(n).padStart(2, '0');
const eGan = (g) => LunarUtil.WU_XING_GAN[g];
const eZhi = (z) => LunarUtil.WU_XING_ZHI[z];
const god = (day, stem) => LunarUtil.SHI_SHEN[day + stem];

// These are editorial reflection prompts. They are not claims about outcomes.
const GOD_READING = {
  比肩: { theme: '自主与同伴', description: '传统十神把同类力量映射为自主、平等与同伴。可以检查自己的边界，以及合作时的分工。', action: '把一个共同目标写成各自负责的明确交付物。' },
  劫财: { theme: '协作与资源边界', description: '这一符号常被用来讨论同伴竞争和资源分配。它并不等于破财；实际风险要看合同和资金安排。', action: '在投入共同项目之前，写清贡献、责任和退出条件。' },
  食神: { theme: '表达与积累', description: '传统联想偏向稳定表达、创造与日常积累。可把注意力放在能够重复的作品和习惯上。', action: '选一件能够每周完成的小作品，留下进度记录。' },
  伤官: { theme: '创意与规则', description: '这一符号可作为检视表达方式和规则关系的提示。新想法是否有效，仍需用实际反馈验证。', action: '先做一个小实验，记录新方法相对旧方法的结果。' },
  偏财: { theme: '机会与验证', description: '传统语义常联想到外部机会和资源流动。它不表示必有横财，更不提供投资方向。', action: '为一个新机会列出可核实的需求、成本和停止条件。' },
  正财: { theme: '秩序与投入', description: '这一符号可用于反思稳定投入、资源安排和日常管理。现实收益取决于能力、需求与执行。', action: '把本月的一项投入与预期产出做一次对账。' },
  七杀: { theme: '压力与应对', description: '传统语义常讨论外部要求、挑战和执行。它不意味着灾祸；可把模糊压力拆成可处理的问题。', action: '挑一个压力源，写下可控部分和下一步具体动作。' },
  正官: { theme: '责任与规范', description: '这一符号可用于观察承诺、职责和规则之间的关系。职位变化需要现实证据，不能由符号确认。', action: '核对一项承诺的标准、时限和完成凭证。' },
  偏印: { theme: '探索与辨别', description: '传统联想偏向非标准学习、独立思考与灵感。可以检查新知识是否已经转化为行动。', action: '挑一条新观点，用一个反例或实际数据检验。' },
  正印: { theme: '学习与支持', description: '这一符号可作为整理知识、接受支持和建立基础的提醒。获得支持仍需主动沟通与确认。', action: '整理一页可复用笔记，或向合适的人提出明确问题。' }
};

const DAY_MASTER_READING = {
  甲: '甲木在传统象征中像向上生长的树干，可用来思考方向、原则和持续积累。',
  乙: '乙木在传统象征中像枝蔓与花草，可用来思考适应、协作和柔韧的表达。',
  丙: '丙火在传统象征中像日光，可用来思考表达、可见度和如何分享能量。',
  丁: '丁火在传统象征中像灯烛，可用来思考专注、细节和持续照亮一件事。',
  戊: '戊土在传统象征中像山岳，可用来思考承载、边界和长期稳定。',
  己: '己土在传统象征中像田园，可用来思考照料、整合和让事情落地。',
  庚: '庚金在传统象征中像矿石与刀斧，可用来思考取舍、标准和决断。',
  辛: '辛金在传统象征中像精细金属，可用来思考品质、精度和表达的分寸。',
  壬: '壬水在传统象征中像江海，可用来思考流动、视野和面对变化的方法。',
  癸: '癸水在传统象征中像雨露，可用来思考观察、耐心和细微积累。'
};

function validateProfile(profile) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(profile.date || '');
  const tm = /^(\d{2}):(\d{2})$/.exec(profile.time || '');
  if (!match || !tm) throw new Error('请填写完整的公历日期和出生时间。');
  const [y, m, d] = match.slice(1).map(Number);
  const [h, min] = tm.slice(1).map(Number);
  if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31 || h > 23 || min > 59) throw new Error('日期范围为1900–2100年；时间需为00:00–23:59。');
  const wall = new Date(Date.UTC(y, m - 1, d, h, min));
  if (wall.getUTCFullYear() !== y || wall.getUTCMonth() !== m - 1 || wall.getUTCDate() !== d) throw new Error('该公历日期不存在，请检查月份和日期。');
  const tz = Number(profile.timezone ?? 8);
  if (!Number.isFinite(tz) || tz < -12 || tz > 14) throw new Error('请输入出生时实际生效的UTC时差（-12至+14小时，含当时夏令时）。');
  const longitude = Number(profile.longitude ?? 120);
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) throw new Error('经度须在-180至180之间，东经为正。');
  const year = Number(profile.year ?? new Date().getFullYear());
  if (!Number.isInteger(year) || year < 1900 || year > 2100) throw new Error('流年范围为1900–2100年。');
  if (!['male', 'female'].includes(profile.gender)) throw new Error('请选择用于传统大运顺逆规则的性别参数。');
  return { y, m, d, h, min, wall, tz, longitude, year };
}

const wallString = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
const solarFromWallDate = (d) => Solar.fromYmdHms(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds());

/** NOAA fractional-year approximation; minutes east-positive longitude. */
export function solarTimeCorrection(profile) {
  const p = validateProfile(profile);
  const dayOfYear = Math.floor((Date.UTC(p.y, p.m - 1, p.d) - Date.UTC(p.y, 0, 1)) / 86400000) + 1;
  const daysInYear = p.y % 4 === 0 && (p.y % 100 !== 0 || p.y % 400 === 0) ? 366 : 365;
  const gamma = 2 * Math.PI / daysInYear * (dayOfYear - 1 + ((p.h + p.min / 60) - 12) / 24);
  const eq = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma) - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma));
  const lon = 4 * p.longitude - 60 * p.tz;
  const minutes = lon + eq;
  const adjusted = new Date(p.wall.getTime() + Math.round(minutes * 60) * 1000);
  const used = profile.trueSolar ? adjusted : p.wall;
  const minuteOfDay = used.getUTCHours() * 60 + used.getUTCMinutes() + used.getUTCSeconds() / 60;
  const residue = ((minuteOfDay - 60) % 120 + 120) % 120;
  const nearestHourBoundary = Math.min(residue, 120 - residue);
  const midnight = Math.min(minuteOfDay, 1440 - minuteOfDay);
  return {
    enabled: !!profile.trueSolar,
    minutes: round(minutes),
    longitudeMinutes: round(lon),
    equationMinutes: round(eq),
    original: wallString(p.wall),
    corrected: wallString(adjusted),
    used: wallString(used),
    nearBoundary: nearestHourBoundary < 15 || midnight < 15,
    boundary: nearestHourBoundary < 15 || midnight < 15 ? '距时辰或换日边界不足15分钟，出生时间误差可能改变日柱或时柱，建议对照相邻时辰。' : '当前时刻距最近时辰及换日边界至少15分钟。',
    method: 'NOAA均时差近似＋经度修正；只校正日柱/时柱使用的本地时刻。年柱/月柱仍按出生瞬间与节气比较。'
  };
}

function diShi(day, branch) {
  const index = STEMS.indexOf(day);
  let n = LunarUtil.CHANG_SHENG_OFFSET[day] + (index % 2 === 0 ? BRANCHES.indexOf(branch) : -BRANCHES.indexOf(branch));
  n = ((n % 12) + 12) % 12;
  return LunarUtil.CHANG_SHENG[n];
}

function pillar(label, ganZhi, dayGan) {
  const [gan, zhi] = [...ganZhi];
  return {
    label, ganZhi, gan, zhi,
    ganElement: eGan(gan), zhiElement: eZhi(zhi), element: eGan(gan) + eZhi(zhi),
    tenGod: label === '日柱' ? '日主' : god(dayGan, gan),
    hiddenStems: (LunarUtil.ZHI_HIDE_GAN[zhi] || []).map(g => ({ gan: g, element: eGan(g), tenGod: god(dayGan, g) })),
    naYin: LunarUtil.NAYIN[ganZhi], diShi: diShi(dayGan, zhi)
  };
}

function relationsFor(ganZhi, pillars) {
  const [g, z] = [...ganZhi];
  const rel = [];
  pillars.forEach(p => {
    if (p.zhi === z) rel.push(`${p.label}同支（${z}）`);
    if (z !== p.zhi && CHONG.some(pair => pair.includes(z) && pair.includes(p.zhi))) rel.push(`${p.label}${p.zhi}${z}冲`);
    if (z !== p.zhi && HE.some(pair => pair.includes(z) && pair.includes(p.zhi))) rel.push(`${p.label}${p.zhi}${z}合`);
    if (g !== p.gan && GAN_HE.some(pair => pair.includes(g) && pair.includes(p.gan))) rel.push(`${p.label}${p.gan}${g}合`);
  });
  return rel;
}

function monthRows(year, dayGan) {
  const table = Solar.fromYmd(year, 6, 1).getLunar().getJieQiTable();
  return JIE.map((name, i) => {
    const start = table[i === 11 ? 'XIAO_HAN' : name];
    const gz = start.nextHour(1).getLunar().getMonthInGanZhiExact();
    const tenGod = god(dayGan, gz[0]);
    return { index: i + 1, name, ganZhi: gz, start: start.toYmdHms(), timezone: 'UTC+8', tenGod, theme: GOD_READING[tenGod].theme, action: GOD_READING[tenGod].action };
  });
}

/**
 * Calendar-derived pillars and traditional symbolic readings, no prediction API.
 * Solar terms are calculated in the library's UTC+8 convention. Birth instant is
 * converted for year/month and Yun; local wall/solar clock controls day/hour.
 */
export function calculateBazi(profile) {
  const p = validateProfile(profile);
  const correction = solarTimeCorrection(profile);
  const localClock = profile.trueSolar ? new Date(p.wall.getTime() + Math.round(correction.minutes * 60) * 1000) : p.wall;
  const cstClock = new Date(p.wall.getTime() + (8 - p.tz) * 3600000);
  const instantSolar = solarFromWallDate(cstClock);
  const calendarLunar = instantSolar.getLunar();
  const termEC = calendarLunar.getEightChar();
  const dayEC = solarFromWallDate(localClock).getLunar().getEightChar();
  const sect = Number(profile.sect) === 1 ? 1 : 2;
  dayEC.setSect(sect);
  const dayGan = dayEC.getDayGan();
  const pillars = [pillar('年柱', termEC.getYear(), dayGan), pillar('月柱', termEC.getMonth(), dayGan), pillar('日柱', dayEC.getDay(), dayGan), pillar('时柱', dayEC.getTime(), dayGan)];
  const elements = Object.fromEntries(ELEMENTS.map(e => [e, 0]));
  pillars.forEach(pil => { elements[pil.ganElement]++; elements[pil.zhiElement]++; });
  const yunObj = termEC.getYun(profile.gender === 'male' ? 1 : 0, 2);
  const cycles = yunObj.getDaYun(13).slice(1).map(c => ({
    ganZhi: c.getGanZhi(), startYear: c.getStartYear(), endYear: c.getEndYear(), startAge: c.getStartYear() - p.y + 1, endAge: c.getEndYear() - p.y + 1,
    tenGod: god(dayGan, c.getGanZhi()[0]), theme: GOD_READING[god(dayGan, c.getGanZhi()[0])].theme,
    current: p.year >= c.getStartYear() && p.year <= c.getEndYear()
  }));
  const annual = [];
  for (let y = Math.max(1900, p.year - 5); y <= Math.min(2100, p.year + 5); y++) {
    const gz = Solar.fromYmd(y, 6, 1).getLunar().getYearInGanZhiExact();
    const tenGod = god(dayGan, gz[0]);
    const rd = GOD_READING[tenGod];
    annual.push({ year: y, ganZhi: gz, age: y >= p.y ? y - p.y + 1 : null, tenGod, theme: rd.theme, description: rd.description, action: rd.action, relations: relationsFor(gz, pillars), selected: y === p.year, months: y === p.year ? monthRows(y, dayGan) : [], cycle: cycles.find(c => y >= c.startYear && y <= c.endYear)?.ganZhi || '起运前' });
  }
  const notes = [
    '八字采用节气历：立春换年、十二节换月；不以春节或公历1月1日换年。',
    `年柱/月柱及起运按出生瞬间换算至UTC+8后与节气比较；日柱/时柱采用${profile.trueSolar ? '近似真太阳时' : '填写的本地民用时'}。UTC时差须填写出生当时值，含夏令时；本程序不自动查历史时区。`,
    sect === 2 ? '日柱采用lunar第二流派（00:00换日）；晚子时的时干按库内晚子时规则计算。' : '日柱采用lunar第一流派（23:00子初换日）。',
    '大运使用阳男阴女顺、阴男阳女逆的传统规则，按相邻“节”计算起运；起运算法采用lunar sect=2分钟折算法。起运日期按库的UTC+8历法给出；流年与大运年龄统一用“公历年减出生地公历出生年+1”的年序口径，不是周岁，也不等同以春节换年的农历虚岁。大运区间按年份展示，交运年应另核实际日期。',
    '五行图只统计四柱八个表层字，各字等权；未计算月令旺衰、藏干权重及格局，不据此断喜用神，缺少的元素不等于需要补。',
    '流年是立春起算的干支年度；流月以“节”起算，表中节气时刻为UTC+8，不等于公历整月或农历初一。合冲只列符号关系，不直接推断具体事件。',
    '解读为本地规则生成的传统文化联想与反思提示；不确认性格、经历、收益、关系或未来事件。'
  ];
  if (correction.enabled) notes.splice(2, 0, `真太阳时偏移${correction.minutes >= 0 ? '+' : ''}${correction.minutes}分钟（经度${correction.longitudeMinutes >= 0 ? '+' : ''}${correction.longitudeMinutes}＋均时差${correction.equationMinutes >= 0 ? '+' : ''}${correction.equationMinutes}）。公式为NOAA近似，出生时间及经度误差仍需单独考虑。${correction.boundary}`);
  const dayMaster = { gan: dayGan, element: eGan(dayGan), yinYang: STEMS.indexOf(dayGan) % 2 === 0 ? '阳' : '阴', description: DAY_MASTER_READING[dayGan] };
  const selected = annual.find(a => a.year === p.year);
  return {
    profile: { date: profile.date, time: profile.time, gender: profile.gender, timezone: p.tz, longitude: p.longitude, trueSolar: !!profile.trueSolar, sect, year: p.year },
    pillars, lunar: `${calendarLunar.getYearInChinese()}年${calendarLunar.getMonthInChinese()}月${calendarLunar.getDayInChinese()}`, lunarConvention: '出生瞬间的中国农历（UTC+8）',
    dayMaster, elements, selectedYear: p.year, ageConvention: '公历年减出生地公历出生年+1的年序年龄；非周岁或农历虚岁',
    yun: { direction: yunObj.isForward() ? '顺行' : '逆行', startAge: `${yunObj.getStartYear()}年${yunObj.getStartMonth()}月${yunObj.getStartDay()}天${yunObj.getStartHour()}小时`, startDate: yunObj.getStartSolar().toYmd(), timezone: 'UTC+8', cycles },
    annual, months: selected.months, solarCorrection: correction, notes,
    interpretation: { title: `${dayGan}${eGan(dayGan)}日主 · ${selected.theme}`, summary: `${dayMaster.description} ${selected.description}`, action: selected.action, yearReading: selected, elementNote: '把颜色和物品当作审美与行动提醒；本程序未判喜用神，也不建议购买开运商品。' }
  };
}

export function elementAdvice(result) {
  const specs = {
    木: { color: '青绿', hex: '#7b9f79', items: ['绿植', '木质文具', '棉麻织物'], practice: '照料一株植物，或安排一次户外观察。', symbolism: '生长、舒展' },
    火: { color: '红紫', hex: '#bd7479', items: ['暖色桌灯', '红色书签', '创作便笺'], practice: '把一个想法表达出来，记录一次真实反馈。', symbolism: '表达、温暖' },
    土: { color: '黄棕', hex: '#c5a86f', items: ['陶瓷杯', '纸质计划本', '收纳盒'], practice: '整理一小块空间，落实一件有截止日的事情。', symbolism: '承载、稳定' },
    金: { color: '白金', hex: '#c4c7c9', items: ['金属笔', '白色衬衣', '简洁计时器'], practice: '给一个任务写下完成标准，删除一个无效步骤。', symbolism: '取舍、规则' },
    水: { color: '蓝黑', hex: '#7c9faf', items: ['蓝色笔记本', '水杯', '流线摆件'], practice: '留十分钟静下来观察，写出一个需要核实的问题。', symbolism: '流动、观察' }
  };
  return ELEMENTS.map(element => ({ element, count: result?.elements?.[element] ?? 0, ...specs[element], note: '传统象征配色；不构成“有利颜色”或改运效果的实证判断。' }));
}

export const BAZI_SOURCE = {
  name: '6tail/lunar-javascript', version: '1.7.7', license: 'MIT', url: 'https://github.com/6tail/lunar-javascript',
  equationOfTime: 'https://gml.noaa.gov/grad/solcalc/solareqns.PDF', range: '1900–2100',
  scope: '农历、节气、干支、藏干、纳音、十神、大运；传统解释与行动提示由本应用编辑。'
};
