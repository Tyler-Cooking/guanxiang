import { build } from 'esbuild';
import { readFile, writeFile } from 'node:fs/promises';

const [template, styles, { outputFiles }] = await Promise.all([
  readFile('index.template.html', 'utf8'),
  readFile('style.css', 'utf8'),
  build({
    entryPoints: ['app.js'],
    bundle: true, write: false, minify: true, target: ['safari15'],
    legalComments: 'inline',
  }),
]);
const html = template
  .replace('/* STYLE */', () => styles)
  .replace('/* SCRIPT */', () => outputFiles[0].text.replace(/<\/script/gi, '<\\/script'));
const notices = (await readFile("THIRD-PARTY-NOTICES.txt", "utf8")).replace(/-->/g, "-- >");

await writeFile('index.html', html + "\n<!--" + notices + "-->\n");
await writeFile('.nojekyll', '');
