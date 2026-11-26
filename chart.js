import { astro } from 'iztro';
import { calculateBazi } from './bazi.js';

export const example = {
  date: '2000-01-15', time: '12:00', gender: 'male', timezone: 8,
  longitude: 110, trueSolar: false, sect: 2, year: 2026,
};

export function charts(input) {
  const bazi = calculateBazi(input);
  const [date, time] = bazi.solarCorrection.used.split(' ');
  const hour = Number(time.slice(0, 2));
  const period = Math.floor((hour + 1) / 2);
  const gender = bazi.profile.gender === 'male' ? '男' : '女';
  const ziwei = astro.bySolar(date, period, gender, true, 'zh-CN');
  return { bazi, ziwei, date, time };
}
