import { charts, example } from './chart.js';

const siteUrl = 'https://tyler-cooking.github.io/guanxiang/';
const byId = (id) => document.getElementById(id);
const form = byId('birth');
form.elements.year.value = Math.max(1900, Math.min(2100, new Date().getFullYear()));
const palaceName = (palace) => palace.name.endsWith("宫") ? palace.name : palace.name + "宫";

const gridPositions = {
  巳: '1/1', 午: '1/2', 未: '1/3', 申: '1/4', 酉: '2/4', 戌: '3/4',
  亥: '4/4', 子: '4/3', 丑: '4/2', 寅: '4/1', 卯: '3/1', 辰: '2/1',
};

const stars = (list, detailed = false) => list.map((star) =>
  star.name + (detailed && star.brightness ? '·' + star.brightness : '') +
  (star.mutagen ? ' 化' + star.mutagen : '')
).join('、') || '—';

function renderZiwei(ziwei, date, time) {
  const cells = ziwei.palaces.map((p, index) => `
    <button class="palace" type="button" data-palace="${index}" aria-pressed="false" style="grid-area:${gridPositions[p.earthlyBranch]}">
      <em>${palaceName(p)}${p.isBodyPalace ? ' · 身' : ''}</em>
      ${stars(p.majorStars)}
      <small>${p.heavenlyStem}${p.earthlyBranch}</small>
    </button>`).join('');
  return `<article class="chart"><h3>紫微斗数 · 十二宫</h3>
    <p class="muted">点选一宫，查看星曜、亮度和大限。</p>
    <div class="ziwei-grid">${cells}
      <div class="chart-center"><strong>${ziwei.fiveElementsClass}</strong>
        <span>命主 ${ziwei.soul} · 身主 ${ziwei.body}</span>
        <span>${ziwei.lunarDate}</span><span>${date} ${time}</span>
      </div>
    </div><div id="palace-details" class="palace-details" aria-live="polite"></div></article>`;
}

function pickPalace(index, palaces) {
  const palace = palaces[index];
  document.querySelectorAll('[data-palace]').forEach((button) => {
    button.setAttribute('aria-pressed', String(Number(button.dataset.palace) === index));
  });
  byId('palace-details').innerHTML = `
    <p><strong>${palaceName(palace)}</strong> · ${palace.heavenlyStem}${palace.earthlyBranch} · 大限 ${palace.decadal.range.join('–')} 岁</p>
    <p>主星 ${stars(palace.majorStars, true)}</p>
    <p>辅星 ${stars(palace.minorStars, true)}</p>
    <p class="muted">杂曜 ${stars(palace.adjectiveStars, true)}</p>`;
}

function renderBazi(bazi) {
  const pillars = bazi.pillars.map((p) => `<div class="pillar">${p.label}
    <strong>${p.ganZhi}</strong>${p.tenGod}<br>${p.naYin}</div>`).join('');
  const rows = (entries, label) => `<details><summary>${label}</summary>
    <ul class="year-list">${entries.map(([left, right]) => `<li><span>${left}</span><span>${right}</span></li>`).join('')}</ul></details>`;
  return `<article class="chart"><h3>八字 · 四柱</h3>
    <p class="muted">日主 ${bazi.dayMaster.gan}${bazi.dayMaster.element} · ${bazi.annual.find((a) => a.selected).year} 年 ${bazi.annual.find((a) => a.selected).ganZhi}</p>
    <div class="pillar-grid">${pillars}</div>
    <p class="muted">五行表层计数 ${Object.entries(bazi.elements).map(([element, count]) => element + count).join(' · ')}</p>
    ${rows(bazi.pillars.map((p) => [p.label, p.hiddenStems.map((s) => s.gan + '·' + s.tenGod).join('、')]), '四柱藏干')}
    ${rows(bazi.yun.cycles.map((c) => [c.startYear + '–' + c.endYear, c.ganZhi + ' · ' + c.tenGod]), '大运 · ' + bazi.yun.direction + ' · ' + bazi.yun.startDate + ' 起运')}
    ${rows(bazi.annual.map((a) => [a.year + '年', a.ganZhi + ' · ' + a.tenGod]), '查看前后五年')}
    ${rows(bazi.months.map((m) => [m.name + ' · ' + m.start, m.ganZhi]), bazi.selectedYear + '年十二节月（UTC+8）')}
    <details><summary>本次时间口径与说明</summary><ul>${bazi.notes.map((note) => '<li>' + note + '</li>').join('')}</ul></details>
  </article>`;
}

function show(input, demo = false) {
  try {
    const { bazi, ziwei, date, time } = charts(input);
    byId('charts').innerHTML = renderZiwei(ziwei, date, time) + renderBazi(bazi);
    const palaces = ziwei.palaces;
    document.querySelectorAll('[data-palace]').forEach((button) => {
      button.addEventListener('click', () => pickPalace(Number(button.dataset.palace), palaces));
    });
    pickPalace(palaces.findIndex((p) => p.name === '命宫' || p.name === '命'), palaces);
    byId('result-mode').textContent = (demo ? '虚构示例' : '本次输入') +
      ' · ' + (input.trueSolar ? '近似真太阳时 ' + date + ' ' + time : '民用时 ' + input.date + ' ' + input.time);
    byId('status').textContent = '';
    byId('result').hidden = false;
    byId('result-heading').focus();
  } catch (error) {
    byId('result').hidden = true;
    byId('charts').replaceChildren();
    byId('status').textContent = error.message || '排盘失败，请检查日期和时间。';
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  show({ ...Object.fromEntries(data), trueSolar: data.has('trueSolar') });
});

byId('example').addEventListener('click', () => {
  for (const [field, value] of Object.entries(example)) {
    if (field === 'trueSolar') form.elements[field].checked = value;
    else form.elements[field].value = value;
  }
  show(example, true);
});

byId('share').addEventListener('click', async () => {
  const output = byId('share-status');
  try {
    await navigator.clipboard.writeText(siteUrl);
    output.textContent = '已复制体验链接。';
  } catch {
    output.textContent = siteUrl;
  }
});
