import test from 'node:test';
import assert from 'node:assert/strict';
import LunarJS from 'lunar-javascript';
import { calculateBazi, elementAdvice, solarTimeCorrection } from './bazi.js';

const base = { date: '1990-06-15', time: '12:00', gender: 'male', timezone: 8, longitude: 120, trueSolar: false, year: 2026 };
const calc = (patch = {}) => calculateBazi({ ...base, ...patch });

test('synthetic round-coordinate fixture checks true-solar clock and four-pillar output', () => {
  const b = calc({ date: '2000-01-15', time: '12:00', longitude: 110, trueSolar: true });
  assert.deepEqual(b.pillars.map(p => p.ganZhi), ['己卯', '丁丑', '壬申', '丙午']);
  assert.ok(b.solarCorrection.minutes > -50 && b.solarCorrection.minutes < -47);
  assert.equal(b.solarCorrection.longitudeMinutes, -40);
  assert.equal(b.solarCorrection.corrected, '2000-01-15 11:11');
  assert.equal(b.dayMaster.gan, '壬');
  assert.deepEqual(b.elements, { 木: 1, 火: 3, 土: 2, 金: 1, 水: 1 });
});

test('2024 Lichun changes year/month at the computed instant, not midnight or lunar new year', () => {
  const before = calc({ date: '2024-02-04', time: '16:26' });
  const after = calc({ date: '2024-02-04', time: '16:28' });
  assert.deepEqual(before.pillars.slice(0, 2).map(p => p.ganZhi), ['癸卯', '乙丑']);
  assert.deepEqual(after.pillars.slice(0, 2).map(p => p.ganZhi), ['甲辰', '丙寅']);
  assert.equal(before.pillars[2].ganZhi, after.pillars[2].ganZhi);
});

test('birth instant normalized for UTC offset before solar-term comparison', () => {
  const cst = calc({ date: '2024-02-04', time: '16:28', timezone: 8 });
  const utc = calc({ date: '2024-02-04', time: '08:28', timezone: 0, longitude: 0 });
  const nepal = calc({ date: '2024-02-04', time: '14:13', timezone: 5.75, longitude: 85.32 });
  assert.deepEqual(cst.pillars.slice(0, 2), utc.pillars.slice(0, 2));
  assert.deepEqual(cst.pillars.slice(0, 2), nepal.pillars.slice(0, 2));
  assert.notEqual(cst.pillars[3].ganZhi, utc.pillars[3].ganZhi);
});

test('same physical instant across midnight uses term year/month and local civil day separately', () => {
  const cst = calc({ date: '2024-02-05', time: '01:00', timezone: 8 });
  const utc = calc({ date: '2024-02-04', time: '17:00', timezone: 0, longitude: 0 });
  assert.deepEqual(cst.pillars.slice(0, 2).map(p => p.ganZhi), utc.pillars.slice(0, 2).map(p => p.ganZhi));
  assert.notEqual(cst.pillars[2].ganZhi, utc.pillars[2].ganZhi);
});

test('birth instant crossing CST New Year still uses one stated local-birth-year age convention', () => {
  const b = calc({ date: '1999-12-31', time: '20:00', timezone: 0, longitude: 0 });
  assert.equal(b.annual.find(a => a.selected).age, 28);
  for (const c of b.yun.cycles) {
    assert.equal(c.startAge, c.startYear - 1999 + 1);
    assert.equal(c.endAge, c.endYear - 1999 + 1);
  }
});

test('late Zi hour: sect=2 midnight day rollover and sect=1 23:00 day rollover', () => {
  const earlier = calc({ date: '2024-06-01', time: '22:59' });
  const zi2 = calc({ date: '2024-06-01', time: '23:30' });
  const zi1 = calc({ date: '2024-06-01', time: '23:30', sect: 1 });
  const next = calc({ date: '2024-06-02', time: '00:30' });
  assert.equal(earlier.pillars[2].ganZhi, zi2.pillars[2].ganZhi);
  assert.equal(zi1.pillars[2].ganZhi, next.pillars[2].ganZhi);
  assert.notEqual(zi1.pillars[2].ganZhi, zi2.pillars[2].ganZhi);
  assert.equal(zi2.pillars[3].ganZhi, next.pillars[3].ganZhi);
});

test('true-solar correction crosses civil date without moving physical solar-term comparison', () => {
  const p = { date: '2024-02-04', time: '00:20', timezone: 8, longitude: 90 };
  const plain = calc(p);
  const sun = calc({ ...p, trueSolar: true });
  assert.match(sun.solarCorrection.corrected, /^2024-02-03/);
  assert.deepEqual(plain.pillars.slice(0, 2).map(p => p.ganZhi), sun.pillars.slice(0, 2).map(p => p.ganZhi));
  assert.notEqual(plain.pillars[2].ganZhi, sun.pillars[2].ganZhi);
});

test('near-boundary metadata flags uncertainty instead of inventing precision', () => {
  assert.equal(calc({ time: '11:00' }).solarCorrection.nearBoundary, true);
  assert.equal(calc({ time: '12:00' }).solarCorrection.nearBoundary, false);
});

test('five-element summary counts exactly eight surface characters; hidden stems do not inflate it', () => {
  const b = calc();
  assert.equal(Object.values(b.elements).reduce((a, x) => a + x, 0), 8);
  assert.equal(b.pillars.length, 4);
  for (const p of b.pillars) {
    assert.ok(p.hiddenStems.length >= 1 && p.hiddenStems.length <= 3);
    assert.ok(p.hiddenStems.every(s => s.gan && s.element && s.tenGod));
    assert.ok(p.naYin);
  }
});

test('annual and monthly pillars use exact year and solar-term months', () => {
  const b = calc();
  assert.equal(b.annual.length, 11);
  const selected = b.annual.find(a => a.selected);
  assert.equal(selected.ganZhi, '丙午');
  assert.equal(selected.months.length, 12);
  assert.equal(selected.months[0].ganZhi, '庚寅');
  assert.equal(selected.months[11].ganZhi, '辛丑');
  assert.equal(selected.months[0].name, '立春');
  assert.match(selected.months[0].start, /^2026-02-04 04:02/);
  assert.match(selected.months[11].start, /^2027-01/);
  assert.deepEqual(b.months, selected.months);
});

test('Yun direction changes with traditional gender parameter and has contiguous decade rows', () => {
  const m = calc({ gender: 'male' });
  const f = calc({ gender: 'female' });
  assert.equal(m.yun.direction, '顺行');
  assert.equal(f.yun.direction, '逆行');
  assert.notEqual(m.yun.startDate, f.yun.startDate);
  assert.equal(m.yun.cycles.length, 12);
  m.yun.cycles.slice(1).forEach((c, i) => assert.equal(c.startYear, m.yun.cycles[i].endYear + 1));
});

test('Yun computation is tied to the absolute birth instant, not true-solar clock formatting', () => {
  const p = { date: '2000-01-15', time: '12:00', longitude: 110 };
  assert.deepEqual(calc(p).yun, calc({ ...p, trueSolar: true }).yun);
});

test('same branch is not mislabeled as self Chong or Liu He', () => {
  const b = calc({ date: '2000-01-15', time: '12:00', longitude: 110, trueSolar: true });
  assert.ok(b.annual.flatMap(a => a.relations).every(s => !/([子丑寅卯辰巳午未申酉戌亥])\1[冲合]/.test(s)));
});

test('colors describe symbolic palette and never assert a missing element as a favorable god', () => {
  const advice = elementAdvice(calc());
  assert.equal(advice.length, 5);
  assert.ok(advice.every(x => x.items.length === 3 && /^#[a-f\d]{6}$/i.test(x.hex)));
  assert.ok(calc().notes.some(x => x.includes('不据此断喜用神')));
});

test('invalid dates, offsets, time, gender and year are rejected', () => {
  for (const patch of [
    { date: '2023-02-29' }, { date: '2100-02-29' }, { date: '1899-01-01' },
    { date: '2024-13-01' }, { time: '24:00' }, { time: '01:60' }, { timezone: 15 },
    { longitude: 181 }, { gender: 'unknown' }, { year: 2101 }, { date: '' }
  ]) assert.throws(() => calc(patch));
  assert.equal(calc({ date: '2000-02-29' }).pillars.length, 4);
});

test('NOAA offset handles historical manually supplied DST and fractional offset', () => {
  const standard = solarTimeCorrection({ ...base, date: '1990-07-01', timezone: 8 });
  const dst = solarTimeCorrection({ ...base, date: '1990-07-01', timezone: 9 });
  assert.ok(Math.abs(dst.minutes - standard.minutes + 60) < 0.02);
});

test('default China standard-clock pillars agree with library across representative dates', () => {
  const dates = ['1901-01-01', '1949-10-01', '2000-02-29', '2024-02-10', '2026-12-31', '2098-12-30'];
  for (const date of dates) {
    const [y, m, d] = date.split('-').map(Number);
    const b = calc({ date });
    const ec = LunarJS.Solar.fromYmdHms(y, m, d, 12, 0, 0).getLunar().getEightChar();
    assert.deepEqual(b.pillars.map(p => p.ganZhi), [ec.getYear(), ec.getMonth(), ec.getDay(), ec.getTime()]);
    assert.ok(!JSON.stringify(b).includes('NaN'));
  }
});
