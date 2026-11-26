# 观象 · Guanxiang
**面向全球华语读者。同一份出生资料，看紫微十二宫和八字四柱。**

[直接体验 · Try the live demo](https://tyler-cooking.github.io/guanxiang/)

点「试排虚构示例」，两张盘同时出现。把示例时间从 12:00 改为 13:00 再点「开始排盘」，看看命宫与时柱有何变化。也可以输入自己的公历日期和出生地钟表时间。出生资料在当前浏览器内计算，页面不上传、不保存输入。

- **紫微斗数** · 十二宫、主辅星、生年四化、命身宫与大限。点选宫位可查看星曜详情。
- **八字** · 年月日时四柱、藏干、十神、纳音、大运、流年和十二节月。
- **时间设置** · 可手动填出生当时的 UTC 时差与经度，对照近似真太阳时，或切换八字日柱换日口径。

## 来源与口径

「观象」在浏览器中计算紫微十二宫和八字四柱。公开示例由程序生成，使用虚构输入。不同地区出生时，请手动填写当地当时的 UTC 时差，并把夏令时计入。

紫微采用 [iztro 2.6.1](https://github.com/SylarLong/iztro) 的默认排盘规则，农历闰月沿用引擎的修正规则，23:00–23:59 使用晚子时索引。八字采用 [lunar-javascript 1.7.7](https://github.com/6tail/lunar-javascript)，立春换年，十二节换月。近似真太阳时参考 [NOAA 均时差公式](https://gml.noaa.gov/grad/solcalc/solareqns.PDF)，作用于紫微及八字日、时柱。输入时间靠近时辰、午夜或节气时，建议比较相邻输入。传统命理结果供文化体验。

第三方代码采用各自的 MIT 许可，全文见 [第三方许可](THIRD-PARTY-NOTICES.txt)。

## English

Guanxiang is a browser-based tool for exploring Zi Wei Dou Shu (Chinese Purple Star astrology) and BaZi (Four Pillars). Choose **试排虚构示例** to load a fictional example. Change the time from 12:00 to 13:00 and choose **开始排盘** to compare the charts. The interface is in Simplified Chinese and birth details stay in the current page. Built for Chinese-speaking readers worldwide. Enter the local UTC offset in effect at birth, including daylight saving time where applicable. Intended for cultural exploration.

## Build locally

```sh
npm ci
npm test
npm run build
```

Open `index.html` directly in a browser. The built HTML contains the app and both calculation engines. The hosted version uses the same file on GitHub Pages.
