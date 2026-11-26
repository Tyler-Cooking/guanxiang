import test from 'node:test';
import assert from 'node:assert/strict';
import { charts, example } from './chart.js';

test('synthetic demonstration yields twelve distinct palaces and four pillars', () => {
  const { ziwei, bazi } = charts(example);
  assert.equal(new Set(ziwei.palaces.map((p) => p.earthlyBranch)).size, 12);
  assert.equal(ziwei.palaces.filter((p) => p.isBodyPalace).length, 1);
  assert.equal(ziwei.palaces.filter((p) => p.name === '命宫' || p.name === '命').length, 1);
  assert.deepEqual(bazi.pillars.map((p) => p.ganZhi), ['己卯', '丁丑', '壬申', '丙午']);
});

test('changing time changes the Zi Wei chart and BaZi hour pillar', () => {
  const a = charts(example);
  const b = charts({ ...example, time: '13:00' });
  assert.notEqual(a.ziwei.earthlyBranchOfSoulPalace, b.ziwei.earthlyBranchOfSoulPalace);
  assert.notEqual(a.bazi.pillars[3].ganZhi, b.bazi.pillars[3].ganZhi);
});

test('solar correction can cross a civil date and supplies the date used by Zi Wei', () => {
  const { date, ziwei } = charts({ ...example, time: '00:10', trueSolar: true });
  assert.equal(date, '2000-01-14');
  assert.equal(ziwei.solarDate, date);
});

test('late Zi is distinct from the preceding hour', () => {
  const a = charts({ ...example, time: '22:59' });
  const b = charts({ ...example, time: '23:00' });
  assert.notEqual(a.ziwei.earthlyBranchOfSoulPalace, b.ziwei.earthlyBranchOfSoulPalace);
});
