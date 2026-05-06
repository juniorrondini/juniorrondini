import { mkdirSync, writeFileSync } from "node:fs";

const name = "JuniorRondini";

const letters = {
  J: ["11111", "00100", "00100", "00100", "10100", "10100", "01100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
};

const themes = {
  light: {
    file: "dist/juniorrondini-commit-snake-v3.svg",
    background: "#f6f8fa",
    panel: "#ffffff",
    panelStroke: "#d0d7de",
    text: "#24292f",
    muted: "#57606a",
    empty: "#ebedf0",
    levels: ["#baf5c5", "#71e67a", "#43e424", "#1d8f36"],
    snake: "#43e424",
    snakeHot: "#b8ff7a",
    shadow: "#43e424",
  },
  dark: {
    file: "dist/juniorrondini-commit-snake-v3-dark.svg",
    background: "#0d1117",
    panel: "#101820",
    panelStroke: "#263241",
    text: "#f0f6fc",
    muted: "#8b949e",
    empty: "#161b22",
    levels: ["#13261a", "#216b35", "#43e424", "#b8ff7a"],
    snake: "#43e424",
    snakeHot: "#b8ff7a",
    shadow: "#43e424",
  },
};

function buildMatrix(value) {
  const rows = Array.from({ length: 7 }, () => []);

  [...value.toUpperCase()].forEach((char, index) => {
    const glyph = letters[char];
    if (!glyph) {
      return;
    }

    glyph.forEach((row, rowIndex) => {
      rows[rowIndex].push(...row.split(""));
      if (index < value.length - 1) {
        rows[rowIndex].push("0");
      }
    });
  });

  return rows;
}

function cellClass(rowIndex, columnIndex) {
  return `level${((rowIndex * 3 + columnIndex * 5) % 4) + 1}`;
}

const grid = {
  size: 8,
  gap: 3,
  offsetX: 76,
  offsetY: 126,
  duration: 18,
};

function cellCenter(rowIndex, columnIndex) {
  const step = grid.size + grid.gap;

  return {
    x: grid.offsetX + columnIndex * step + grid.size / 2,
    y: grid.offsetY + rowIndex * step + grid.size / 2,
  };
}

function buildRoute(matrix) {
  const route = [];

  for (let rowIndex = 0; rowIndex < matrix.length; rowIndex += 1) {
    const columns =
      rowIndex % 2 === 0
        ? [...matrix[rowIndex].keys()]
        : [...matrix[rowIndex].keys()].reverse();

    columns.forEach((columnIndex) => {
      route.push({ rowIndex, columnIndex, ...cellCenter(rowIndex, columnIndex) });
    });
  }

  return route;
}

function buildEatOrder(route) {
  return new Map(
    route.map((point, index) => [`${point.rowIndex}:${point.columnIndex}`, index]),
  );
}

function renderCells(matrix, theme, eatOrder) {
  const lastStep = Math.max(eatOrder.size - 1, 1);

  return matrix
    .flatMap((row, rowIndex) =>
      row.map((cell, columnIndex) => {
        const x = grid.offsetX + columnIndex * (grid.size + grid.gap);
        const y = grid.offsetY + rowIndex * (grid.size + grid.gap);
        const cssClass = cell === "1" ? cellClass(rowIndex, columnIndex) : "empty";

        if (cell !== "1") {
          return `<rect class="${cssClass}" x="${x}" y="${y}" width="${grid.size}" height="${grid.size}" rx="2"/>`;
        }

        const order = eatOrder.get(`${rowIndex}:${columnIndex}`) ?? 0;
        const eatStart = Math.max((order / lastStep) * 0.9, 0.001);
        const eatEnd = Math.min(eatStart + 0.025, 0.93);
        const keyTimes = `0;${eatStart.toFixed(4)};${eatEnd.toFixed(4)};.94;1`;

        return `<rect class="${cssClass}" x="${x}" y="${y}" width="${grid.size}" height="${grid.size}" rx="2">
      <animate attributeName="opacity" values="1;1;.12;.12;1" keyTimes="${keyTimes}" dur="${grid.duration}s" repeatCount="indefinite"/>
      <animate attributeName="fill" values="${theme.levels.at(-1)};${theme.levels.at(-1)};${theme.empty};${theme.empty};${theme.levels.at(-1)}" keyTimes="${keyTimes}" dur="${grid.duration}s" repeatCount="indefinite"/>
    </rect>`;
      }),
    )
    .join("\n    ");
}

function renderSnakePath(route) {
  const leadIn = `M ${Math.max(36, route[0].x - 34)} ${route[0].y}`;
  const points = route.map((point) => `L ${point.x.toFixed(1)} ${point.y.toFixed(1)}`);

  return [leadIn, ...points].join(" ");
}

function pathLength(route) {
  const points = [{ x: Math.max(36, route[0].x - 34), y: route[0].y }, ...route];

  return points.slice(1).reduce((total, point, index) => {
    const previous = points[index];
    const dx = point.x - previous.x;
    const dy = point.y - previous.y;

    return total + Math.hypot(dx, dy);
  }, 0);
}

function renderSvg(theme) {
  const matrix = buildMatrix(name);
  const gridWidth = matrix[0].length * 11 - 3;
  const route = buildRoute(matrix);
  const eatOrder = buildEatOrder(route);
  const snakePath = renderSnakePath(route);
  const snakeHeadStart = route[0];
  const snakeLength = 92;
  const dashGap = Math.ceil(pathLength(route) + snakeLength + 80);
  const dashOffset = dashGap;

  return `<svg width="1000" height="280" viewBox="0 0 1000 280" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" role="img" aria-labelledby="title desc">
  <title id="title">Junior Rondini commit trail</title>
  <desc id="desc">A stylized contribution grid spelling JuniorRondini while a neon snake eats each commit cell.</desc>
  <style>
    .background{fill:${theme.background}}
    .panel{fill:${theme.panel};stroke:${theme.panelStroke}}
    .title{fill:${theme.text};font:700 28px Segoe UI,Arial,sans-serif}
    .subtitle{fill:${theme.muted};font:600 13px Segoe UI,Arial,sans-serif;letter-spacing:.12em}
    .caption{fill:${theme.muted};font:500 14px Segoe UI,Arial,sans-serif}
    .empty{fill:${theme.empty};opacity:.32}
    .level1{fill:${theme.levels[0]}}
    .level2{fill:${theme.levels[1]}}
    .level3{fill:${theme.levels[2]}}
    .level4{fill:${theme.levels[3]}}
    .trail-guide{fill:none;stroke:none}
    .trail{fill:none;stroke:${theme.snake};stroke-width:10;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:${snakeLength} ${dashGap};stroke-dashoffset:${dashOffset};filter:url(#glow)}
    .trail-hot{fill:none;stroke:${theme.snakeHot};stroke-width:3;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:28 ${dashGap};stroke-dashoffset:${dashOffset}}
    .head{fill:${theme.snake};filter:url(#glow)}
    .eye{fill:#0d1117}
    .spark{fill:${theme.snakeHot};animation:blink 1.8s ease-in-out infinite}
    @keyframes blink{50%{opacity:.28}}
  </style>
  <defs>
    <filter id="glow" x="-35%" y="-35%" width="170%" height="170%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect class="background" width="1000" height="280" rx="18"/>
  <rect class="panel" x="24" y="24" width="952" height="232" rx="14"/>
  <text class="subtitle" x="76" y="66">CUSTOM COMMIT TRAIL</text>
  <text class="title" x="76" y="101">${name}</text>
  <text class="caption" x="76" y="232">Snake mode: each glowing cell is eaten in sequence, then the signature respawns.</text>
  <g>
    ${renderCells(matrix, theme, eatOrder)}
  </g>
  <path id="eat-path" class="trail-guide" d="${snakePath}"/>
  <path class="trail" d="${snakePath}">
    <animate attributeName="stroke-dashoffset" values="${dashOffset};0" dur="${grid.duration}s" repeatCount="indefinite"/>
  </path>
  <path class="trail-hot" d="${snakePath}">
    <animate attributeName="stroke-dashoffset" values="${dashOffset};0" dur="${grid.duration}s" repeatCount="indefinite"/>
  </path>
  <g>
    <animateMotion dur="${grid.duration}s" repeatCount="indefinite" rotate="auto">
      <mpath href="#eat-path" xlink:href="#eat-path"/>
    </animateMotion>
    <circle class="head" cx="0" cy="0" r="13"/>
    <circle class="eye" cx="4" cy="-4" r="2.2"/>
    <circle class="eye" cx="5" cy="5" r="2.2"/>
  </g>
  <circle class="spark" cx="860" cy="86" r="4"/>
  <circle class="spark" cx="898" cy="190" r="5" style="animation-delay:.55s"/>
  <circle class="spark" cx="930" cy="132" r="3.5" style="animation-delay:1.1s"/>
  <circle class="spark" cx="${snakeHeadStart.x}" cy="${snakeHeadStart.y}" r="3" style="animation-delay:1.4s"/>
</svg>
`;
}

mkdirSync("dist", { recursive: true });

Object.values(themes).forEach((theme) => {
  writeFileSync(theme.file, renderSvg(theme), "utf8");
  console.log(`Wrote ${theme.file}`);
});
