import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as design from './profile-design.mjs';

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
    bg: '#080f1c', panel: '#111e30', line: '#263c56', text: '#eaf5ff',
    muted: '#9ab2c9', accent: '#62f5b8', cyan: '#54d9ff', violet: '#bca8ff', empty: '#192b3b', snake: '#e3fff1',
    levels: ['#24976c', '#32ba84', '#43d999', '#67f0b3'],
  },
  light: {
    bg: '#f2f7ff', panel: '#ffffff', line: '#cad8ee', text: '#142b44',
    muted: '#506b86', accent: '#068156', cyan: '#007fa3', violet: '#7753ca', empty: '#e2ebf5', snake: '#123c2a',
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

export function renderHero(t) { return design.renderHero(t); }

export const PROJECTS = [
  { slug: 'zentinel', n: '01', name: 'Zentinel', category: 'SYSTEMS & SECURITY', summary: 'A fast file integrity monitor built with Zig.', stack: 'ZIG / SHA-256 / CLI', icon: 'M32 12L46 18V31C46 42 32 50 32 50S18 42 18 31V18Z M25 30L30 35L39 25' },
  { slug: 'whisper', n: '02', name: 'Whisper', category: 'SAAS & REAL-TIME', summary: 'Customer support, connected in real time.', stack: 'GO / REACT / WEBSOCKET / POSTGRESQL', icon: 'M16 16H48V39H29L20 48V39H16Z M24 25H40 M24 31H35' },
  { slug: 'esoteric', n: '03', name: 'Esoteric Suite', category: 'CREATIVE ENGINEERING', summary: 'Useful tools. Wonderfully unusual languages.', stack: 'ESOLANGS / TOOLKIT / LANGUAGE MUSEUM', icon: 'M25 17L13 31L25 45 M39 17L51 31L39 45 M35 13L29 49' },
  { slug: 'ledgerfox', n: '04', name: 'LedgerFox', category: 'DESKTOP & LEGACY', summary: 'A financial manager with a retro desktop soul.', stack: 'VISUAL FOXPRO / DBF / WINDOWS', icon: 'M14 15H50V46H14Z M14 23H50 M22 31H28 M22 38H28 M35 31H42 M35 38H42' },
];

export function renderProject(t, p) { return design.renderProject(t, p, PROJECTS.indexOf(p)); }

export function generateAssets(root = resolve(dirname(fileURLToPath(import.meta.url)), '..')) {
  const output = resolve(root, 'assets');
  mkdirSync(output, { recursive: true });
  const metricsPath = resolve(output, 'github-metrics.json');
  const metrics = existsSync(metricsPath) ? JSON.parse(readFileSync(metricsPath, 'utf8')) : null;
  for (const [name, theme] of Object.entries(THEMES)) {
    writeFileSync(resolve(output, `hero-${name}.svg`), renderHero(theme));
    writeFileSync(resolve(output, `commit-snake-${name}.svg`), renderSnake(theme));
    writeFileSync(resolve(output, `roles-${name}.svg`), design.renderRoles(theme));
    writeFileSync(resolve(output, `terminal-${name}.svg`), design.renderTerminal(theme));
    writeFileSync(resolve(output, `divider-${name}.svg`), design.renderDivider(theme));
    writeFileSync(resolve(output, `footer-${name}.svg`), design.renderFooter(theme));
    for (const social of design.SOCIALS) writeFileSync(resolve(output, `social-${social.id}-${name}.svg`), design.renderSocial(theme, social));
    if (metrics) {
      writeFileSync(resolve(output, `github-stats-${name}.svg`), design.renderGithubStats(theme, metrics));
      writeFileSync(resolve(output, `language-stats-${name}.svg`), design.renderLanguageStats(theme, metrics));
    }
    for (const project of PROJECTS) {
      writeFileSync(resolve(output, `project-${project.slug}-${name}.svg`), renderProject(theme, project));
    }
  }
  console.log('Generated animated profile artwork, social buttons, project cards and statistics.');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) generateAssets();
