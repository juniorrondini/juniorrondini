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
    file: "dist/commit-snake.svg",
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
    file: "dist/commit-snake-dark.svg",
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

function renderCells(matrix, theme) {
  const size = 8;
  const gap = 3;
  const offsetX = 76;
  const offsetY = 126;

  return matrix
    .flatMap((row, rowIndex) =>
      row.map((cell, columnIndex) => {
        const x = offsetX + columnIndex * (size + gap);
        const y = offsetY + rowIndex * (size + gap);
        const cssClass = cell === "1" ? cellClass(rowIndex, columnIndex) : "empty";
        const delay = ((rowIndex + columnIndex) % 9) * 0.08;

        return `<rect class="${cssClass}" x="${x}" y="${y}" width="${size}" height="${size}" rx="2"><animate attributeName="opacity" values=".72;1;.72" dur="2.8s" begin="${delay}s" repeatCount="indefinite"/></rect>`;
      }),
    )
    .join("\n    ");
}

function renderSvg(theme) {
  const matrix = buildMatrix(name);
  const gridWidth = matrix[0].length * 11 - 3;
  const gridStart = 76;
  const gridEnd = gridStart + gridWidth;
  const snakePath = `M ${gridStart - 26} 214 C 164 96, 250 218, 338 132 S 492 94, 586 158 S 722 218, ${gridEnd + 18} 142`;

  return `<svg width="1000" height="280" viewBox="0 0 1000 280" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc">
  <title id="title">Junior Rondini commit trail</title>
  <desc id="desc">A stylized contribution grid spelling JuniorRondini with a neon snake trail.</desc>
  <style>
    .background{fill:${theme.background}}
    .panel{fill:${theme.panel};stroke:${theme.panelStroke}}
    .title{fill:${theme.text};font:700 28px Segoe UI,Arial,sans-serif}
    .subtitle{fill:${theme.muted};font:600 13px Segoe UI,Arial,sans-serif;letter-spacing:.12em}
    .caption{fill:${theme.muted};font:500 14px Segoe UI,Arial,sans-serif}
    .empty{fill:${theme.empty};opacity:.5}
    .level1{fill:${theme.levels[0]}}
    .level2{fill:${theme.levels[1]}}
    .level3{fill:${theme.levels[2]}}
    .level4{fill:${theme.levels[3]}}
    .trail-shadow{stroke:${theme.shadow};stroke-width:20;stroke-linecap:round;stroke-linejoin:round;opacity:.18;filter:url(#glow)}
    .trail{stroke:${theme.snake};stroke-width:10;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:72 18;animation:dash 4s linear infinite;filter:url(#glow)}
    .trail-hot{stroke:${theme.snakeHot};stroke-width:3;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:18 72;animation:dash 2.2s linear infinite}
    .head{fill:${theme.snake};filter:url(#glow);animation:pulse 1.6s ease-in-out infinite}
    .eye{fill:#0d1117}
    .spark{fill:${theme.snakeHot};animation:blink 1.8s ease-in-out infinite}
    @keyframes dash{to{stroke-dashoffset:-180}}
    @keyframes pulse{50%{transform:scale(1.08);transform-origin:${gridEnd + 18}px 142px}}
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
  <text class="caption" x="76" y="232">Commit-style signature grid. Real history stays real; the profile gets the neon treatment.</text>
  <g>
    ${renderCells(matrix, theme)}
  </g>
  <path class="trail-shadow" d="${snakePath}"/>
  <path class="trail" d="${snakePath}"/>
  <path class="trail-hot" d="${snakePath}"/>
  <circle class="head" cx="${gridEnd + 18}" cy="142" r="18"/>
  <circle class="eye" cx="${gridEnd + 24}" cy="136" r="2.6"/>
  <circle class="eye" cx="${gridEnd + 25}" cy="148" r="2.6"/>
  <circle class="spark" cx="860" cy="86" r="4"/>
  <circle class="spark" cx="898" cy="190" r="5" style="animation-delay:.55s"/>
  <circle class="spark" cx="930" cy="132" r="3.5" style="animation-delay:1.1s"/>
</svg>
`;
}

mkdirSync("dist", { recursive: true });

Object.values(themes).forEach((theme) => {
  writeFileSync(theme.file, renderSvg(theme), "utf8");
  console.log(`Wrote ${theme.file}`);
});
