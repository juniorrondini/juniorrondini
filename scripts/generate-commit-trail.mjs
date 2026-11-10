import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const GLYPHS = {
  J: ['11111', '00100', '00100', '00100', '10100', '10100', '01100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
};

export const GRID = { size: 10, step: 12, top: 82, width: 1000 };
export const TIME = { duration: 24, start: 2.4, finish: 19.2, fade: 19.6, restore: 20.2, restored: 21.2 };
export const THEMES = {
  dark: {
    bg: '#0d1117', panel: '#111b21', line: '#25343b', text: '#ecf4ef',
    muted: '#97aaa2', accent: '#55edac', empty: '#1b2b2b', snake: '#e3fff1',
    levels: ['#24976c', '#32ba84', '#43d999', '#67f0b3'],
  },
  light: {
    bg: '#f6faf7', panel: '#ffffff', line: '#d5e4db', text: '#142d23',
    muted: '#536f60', accent: '#087e54', empty: '#e4eee8', snake: '#123c2a',
    levels: ['#21966b', '#18835b', '#10734d', '#086342'],
  },
};

export function buildMatrix(value = 'JUNIOR RONDINI') {
  const glyphs = [...value.toUpperCase()].map(char => {
    if (char === ' ') return Array(7).fill('0');
    if (!GLYPHS[char]) throw new Error(`Unsupported signature character: ${char}`);
    return GLYPHS[char];
  });
  return Array.from({ length: 7 }, (_, row) => glyphs.map(g => g[row]).join('0').split(''));
}

export function buildRoute(matrix) {
  const columns = matrix[0].length;
  const left = (GRID.width - ((columns - 1) * GRID.step + GRID.size)) / 2 + GRID.size / 2;
  const route = [{ x: left - 2 * GRID.step, y: GRID.top + GRID.size / 2 }];
  for (let column = 0; column < columns; column++) {
    for (let index = 0; index < 7; index++) {
      const row = column % 2 === 0 ? index : 6 - index;
      route.push({ x: left + column * GRID.step, y: GRID.top + row * GRID.step + GRID.size / 2, row, column });
    }
  }
  const last = route.at(-1);
  route.push({ x: last.x + 8 * GRID.step, y: last.y });
  let distance = 0;
  return route.map((point, i) => {
    if (i) distance += Math.hypot(point.x - route[i - 1].x, point.y - route[i - 1].y);
    return { ...point, distance };
  });
}

export function arrivalTime(point, route) {
  return TIME.start + point.distance / route.at(-1).distance * (TIME.finish - TIME.start);
}

const fraction = seconds => (seconds / TIME.duration).toFixed(7);
const xml = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const text = (x, y, size, color, value, extra = '') => `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" ${extra}>${xml(value)}</text>`;

function openSvg(height, title, desc) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="${height}" viewBox="0 0 1000 ${height}" role="img" aria-labelledby="title desc">
<title id="title">${xml(title)}</title><desc id="desc">${xml(desc)}</desc>
<style>text{font-family:Arial,Helvetica,sans-serif}.mono{font-family:Consolas,'Courier New',monospace}</style>`;
}

export function renderSnake(theme) {
  const matrix = buildMatrix();
  const route = buildRoute(matrix);
  const distance = route.at(-1).distance;
  const path = route.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' ');
  const cells = route.filter(p => p.row !== undefined);
  const backgroundCells = cells.map(p => `<rect x="${p.x - 5}" y="${p.y - 5}" width="10" height="10" rx="2" fill="${theme.empty}"/>`).join('');
  const nameCells = animated => cells.filter(p => matrix[p.row][p.column] === '1').map(p => {
    const eat = arrivalTime(p, route);
    const animation = animated ? `<animate attributeName="opacity" values="1;1;0;0;1;1" keyTimes="0;${fraction(eat - .012)};${fraction(eat)};${fraction(TIME.restore)};${fraction(TIME.restored)};1" dur="24s" repeatCount="indefinite"/>` : '';
    return `<rect data-cell="${p.row}:${p.column}" x="${p.x - 5}" y="${p.y - 5}" width="10" height="10" rx="2" fill="${theme.levels[(p.column + p.row) % 4]}">${animation}</rect>`;
  }).join('');
  const times = `0;${fraction(TIME.start)};${fraction(TIME.finish)};1`;
  const bodyLength = GRID.step * 8;
  return `${openSvg(246, 'Junior Rondini — commit signature', 'A snake eats a custom contribution-style grid spelling Junior Rondini. The signature reappears at the end of each loop. This is pixel art, not live contribution data.')}
<style>.still{display:none}@media(prefers-reduced-motion:reduce){.motion{display:none}.still{display:inline}}</style>
<rect x=".5" y=".5" width="999" height="237" rx="16" fill="${theme.bg}" stroke="${theme.line}"/>
<circle cx="40" cy="36" r="4" fill="${theme.accent}"/>
${text(54, 40, 12, theme.accent, 'THE COMMIT SIGNATURE', 'class="mono" letter-spacing="2"')}
${text(960, 40, 12, theme.muted, 'EAT. BUILD. REPEAT.', 'class="mono" text-anchor="end"')}
${backgroundCells}
<g class="still">${nameCells(false)}</g>
<g class="motion">${nameCells(true)}
<g id="snake" opacity="0">
<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;${fraction(TIME.start - .15)};${fraction(TIME.start)};${fraction(TIME.finish)};${fraction(TIME.fade)};1" dur="24s" repeatCount="indefinite"/>
<path id="body" d="${path}" fill="none" stroke="${theme.snake}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${bodyLength} ${distance + bodyLength}" stroke-dashoffset="${bodyLength}">
<animate attributeName="stroke-dashoffset" values="${bodyLength};${bodyLength};${bodyLength - distance};${bodyLength - distance}" keyTimes="${times}" dur="24s" repeatCount="indefinite"/>
</path>
<g id="head">
<animateMotion path="${path}" keyPoints="0;0;1;1" keyTimes="${times}" calcMode="linear" rotate="auto" dur="24s" repeatCount="indefinite"/>
<rect x="-6" y="-6" width="12" height="12" rx="4" fill="${theme.snake}"/>
<circle cx="2.5" cy="-2.5" r="1.2" fill="${theme.bg}"/><circle cx="2.5" cy="2.5" r="1.2" fill="${theme.bg}"/>
</g></g></g>
<path d="M40 201H960" stroke="${theme.line}"/>
${text(40, 222, 11, theme.muted, 'JUNIOR RONDINI / CUSTOM PIXEL ART', 'class="mono" letter-spacing="1"')}
<g fill="${theme.accent}"><rect x="917" y="213" width="7" height="7" rx="1" opacity=".3"/><rect x="929" y="213" width="7" height="7" rx="1" opacity=".6"/><rect x="941" y="213" width="7" height="7" rx="1"/><rect x="953" y="213" width="7" height="7" rx="1"/></g>
</svg>\n`;
}

export function renderHero(t) {
  const grid = Array.from({ length: 9 }, (_, row) => Array.from({ length: 9 }, (_, col) => {
    const radius = Math.hypot(row - 4, col - 4);
    const active = radius > 2 && radius < 4.5 && (row + col) % 3 !== 0;
    return `<rect x="${737 + col * 18}" y="${58 + row * 18}" width="11" height="11" rx="2" fill="${active ? t.accent : t.empty}" opacity="${active ? .4 + ((row + col) % 4) * .2 : .7}"/>`;
  }).join('')).join('');
  return `${openSvg(322, 'Junior Rondini — Full Stack Developer', 'Real products. Unusual ideas. Full stack development, automation and creative engineering.')}
<defs><radialGradient id="wash"><stop stop-color="${t.accent}" stop-opacity=".13"/><stop offset="1" stop-color="${t.bg}" stop-opacity="0"/></radialGradient></defs>
<rect x=".5" y=".5" width="999" height="309" rx="18" fill="${t.bg}" stroke="${t.line}"/>
<ellipse cx="830" cy="140" rx="260" ry="200" fill="url(#wash)"/>
<path d="M42 39H66" stroke="${t.accent}" stroke-width="3"/>
${text(80, 43, 12, t.accent, 'FULL STACK DEVELOPER', 'class="mono" letter-spacing="2.2"')}
${text(40, 126, 68, t.text, 'Junior Rondini', 'font-weight="700" letter-spacing="-3"')}
${text(43, 171, 25, t.muted, 'Real products. Unusual ideas.', 'letter-spacing="-.5"')}
${text(43, 207, 15, t.muted, 'From business systems to beautifully strange experiments.')}
${grid}
<rect x="791" y="112" width="53" height="53" rx="12" fill="${t.bg}" stroke="${t.accent}"/>
${text(817, 147, 26, t.accent, '</>', 'class="mono" text-anchor="middle" font-weight="700"')}
<path d="M42 249H958" stroke="${t.line}"/>
${text(43, 280, 11, t.muted, 'SOFTWARE / AUTOMATION / CREATIVE ENGINEERING', 'class="mono" letter-spacing="1.1"')}
${text(958, 280, 11, t.accent, '@juniorrondini', 'class="mono" text-anchor="end"')}
</svg>\n`;
}

export const PROJECTS = [
  { slug: 'zentinel', n: '01', name: 'Zentinel', category: 'SYSTEMS & SECURITY', summary: 'A fast file integrity monitor built with Zig.', stack: 'ZIG / SHA-256 / CLI', icon: 'M32 12L46 18V31C46 42 32 50 32 50S18 42 18 31V18Z M25 30L30 35L39 25' },
  { slug: 'whisper', n: '02', name: 'Whisper', category: 'SAAS & REAL-TIME', summary: 'Customer support, connected in real time.', stack: 'GO / REACT / WEBSOCKET / POSTGRESQL', icon: 'M16 16H48V39H29L20 48V39H16Z M24 25H40 M24 31H35' },
  { slug: 'esoteric', n: '03', name: 'Esoteric Suite', category: 'CREATIVE ENGINEERING', summary: 'Useful tools. Wonderfully unusual languages.', stack: 'ESOLANGS / TOOLKIT / LANGUAGE MUSEUM', icon: 'M25 17L13 31L25 45 M39 17L51 31L39 45 M35 13L29 49' },
  { slug: 'ledgerfox', n: '04', name: 'LedgerFox', category: 'DESKTOP & LEGACY', summary: 'A financial manager with a retro desktop soul.', stack: 'VISUAL FOXPRO / DBF / WINDOWS', icon: 'M14 15H50V46H14Z M14 23H50 M22 31H28 M22 38H28 M35 31H42 M35 38H42' },
];

export function renderProject(t, p) {
  return `${openSvg(120, `${p.name} — ${p.category}`, `${p.summary} ${p.stack}. Open the repository to explore the project.`)}
<rect x=".5" y=".5" width="999" height="109" rx="13" fill="${t.panel}" stroke="${t.line}"/>
<rect x="1" y="22" width="3" height="66" rx="1.5" fill="${t.accent}"/>
<g transform="translate(24 23)" fill="none" stroke="${t.accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${p.icon}"/></g>
${text(108, 31, 12, t.accent, `${p.n} / ${p.category}`, 'class="mono" letter-spacing="1.3"')}
${text(108, 81, 44, t.text, p.name, 'font-weight="700" letter-spacing="-1"')}
<circle cx="945" cy="55" r="20" fill="${t.bg}" stroke="${t.line}"/>
<path d="M938 62L952 48 M938 48H952V62" fill="none" stroke="${t.accent}" stroke-width="1.5"/>
</svg>\n`;
}

export function generateAssets(root = resolve(dirname(fileURLToPath(import.meta.url)), '..')) {
  const output = resolve(root, 'assets');
  mkdirSync(output, { recursive: true });
  for (const [name, theme] of Object.entries(THEMES)) {
    writeFileSync(resolve(output, `hero-${name}.svg`), renderHero(theme));
    writeFileSync(resolve(output, `commit-snake-${name}.svg`), renderSnake(theme));
    for (const project of PROJECTS) {
      writeFileSync(resolve(output, `project-${project.slug}-${name}.svg`), renderProject(theme, project));
    }
  }
  console.log('Generated 12 profile assets (light and dark).');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) generateAssets();
