import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildMatrix, buildRoute, arrivalTime, renderSnake, GRID, TIME, THEMES } from './generate-commit-trail.mjs';
import { renderHero, languageSlices, STACK } from './profile-design.mjs';

test('signature spells the full name with a visible word gap', () => {
  const matrix = buildMatrix();
  assert.equal(matrix.length, 7);
  assert.equal(new Set(matrix.map(row => row.length)).size, 1);
  assert.equal(matrix[0].length, 79);
  for (const row of matrix) assert.equal(row.slice(35, 38).join(''), '000');
  assert.throws(() => buildMatrix('JUNIOR?'), /Unsupported/);
});

test('snake visits every cell exactly once along an adjacent route', () => {
  const matrix = buildMatrix();
  const route = buildRoute(matrix);
  const cells = route.filter(p => p.row !== undefined);
  assert.equal(new Set(cells.map(p => `${p.row}:${p.column}`)).size, matrix[0].length * 7);
  for (let i = 1; i < cells.length; i++) {
    assert.equal(Math.abs(cells[i].row - cells[i - 1].row) + Math.abs(cells[i].column - cells[i - 1].column), 1);
    assert.equal(cells[i].distance - cells[i - 1].distance, GRID.step);
  }
  assert.ok(cells.every(p => p.x > 10 && p.x < GRID.width - 10));
});

test('every eaten pixel matches the exact head distance and body tip', () => {
  const route = buildRoute(buildMatrix());
  for (const cell of route.slice(1, -1)) {
    const progress = (arrivalTime(cell, route) - TIME.start) / (TIME.finish - TIME.start);
    assert.ok(Math.abs(progress * route.at(-1).distance - cell.distance) < 1e-9);
    const dashOffset = GRID.step * 8 - progress * route.at(-1).distance;
    assert.ok(Math.abs(GRID.step * 8 - dashOffset - cell.distance) < 1e-9);
  }
  assert.ok(TIME.finish < TIME.fade && TIME.fade < TIME.restore && TIME.restored < TIME.duration);
});

test('all SVG timelines have valid increasing keyframes and a static fallback', () => {
  for (const theme of Object.values(THEMES)) {
    const svg = renderSnake(theme);
    assert.ok(svg.includes('prefers-reduced-motion:reduce'));
    assert.ok(svg.includes('<g class="still"><rect'));
    for (const tag of svg.matchAll(/<(?:animate|animateMotion)\b[^>]+>/g)) {
      const times = tag[0].match(/keyTimes="([^"]+)"/)[1].split(';').map(Number);
      const values = tag[0].match(/(?:values|keyPoints)="([^"]+)"/)[1].split(';');
      assert.equal(times.length, values.length);
      assert.equal(times[0], 0);
      assert.equal(times.at(-1), 1);
      assert.ok(times.every((value, i) => i === 0 || value > times[i - 1]));
    }
    assert.ok(!/script|foreignObject|https?:/.test(svg.replace('http://www.w3.org/2000/svg', '')));
  }
});

test('every local README image exists in the repository', () => {
  const root = new URL('../', import.meta.url);
  const readme = readFileSync(new URL('README.md', root), 'utf8');
  for (const [, path] of readme.matchAll(/(?:src|srcset)="(assets\/[^"]+)"/g)) {
    assert.ok(existsSync(fileURLToPath(new URL(path, root))), `Missing README image: ${path}`);
  }
  assert.ok(!readme.includes('raw.githubusercontent.com'));
});

test('name animation and rotating roles keep a readable reduced-motion version', () => {
  for (const theme of Object.values(THEMES)) {
    const hero = renderHero(theme);
    assert.ok(hero.includes('id="name-trace"'));
    assert.ok(hero.includes('attributeName="stroke-dashoffset"'));
    assert.ok(hero.includes('attributeName="x1"'));
    assert.ok(hero.includes('<g class="still"><text'));
    assert.ok(hero.includes('>JUNIOR RONDINI</text>'));
    assert.ok(!/NaN|undefined|<script|foreignObject/.test(hero));
  }
});

test('public statistics are complete and language slices account for all source bytes', () => {
  const metrics = JSON.parse(readFileSync(new URL('../assets/github-metrics.json',import.meta.url),'utf8'));
  for (const key of ['publicRepos','stars','followers','forks','repositoriesMeasured']) {
    assert.ok(Number.isSafeInteger(metrics[key]) && metrics[key] >= 0, `Invalid metric ${key}`);
  }
  assert.ok(Object.values(metrics.languages).every(bytes=>Number.isSafeInteger(bytes) && bytes>0));
  const slices = languageSlices(metrics);
  const total = Object.values(metrics.languages).reduce((a,b)=>a+b,0);
  assert.equal(slices.reduce((sum,s)=>sum+s.bytes,0),total);
  assert.ok(Math.abs(slices.reduce((sum,s)=>sum+s.ratio,0)-1) < 1e-9);
});

test('all technology icons are local and retain their source license', () => {
  for (const icon of new Set(STACK.flatMap(group=>group.icons))) {
    const source = readFileSync(new URL(`../assets/icons/${icon}.svg`,import.meta.url),'utf8');
    assert.ok(source.includes('<title>'));
    assert.ok(!/<script|foreignObject|<image|@import|href="https?:/i.test(source));
  }
  assert.ok(existsSync(new URL('../assets/icons/LICENSE',import.meta.url)));
});
