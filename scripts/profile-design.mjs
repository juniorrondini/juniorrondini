const esc = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const label = (x, y, size, fill, value, attrs = '') => `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" ${attrs}>${esc(value)}</text>`;
const svg = (w, h, title, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title"><title id="title">${esc(title)}</title><style>text{font-family:Arial,Helvetica,sans-serif}.mono{font-family:Consolas,'Courier New',monospace}.still{display:none}@media(prefers-reduced-motion:reduce){.motion{display:none}.still{display:inline}*{animation:none!important}}</style>${body}</svg>\n`;

export const SOCIALS = [
  {id:'linkedin', name:'LinkedIn', href:'https://www.linkedin.com/in/juniorrondini', color:'#329bff', path:'M3 9H7V22H3Z M5 2A2.3 2.3 0 1 0 5 6.6A2.3 2.3 0 1 0 5 2 M10 9H14V11C16 7 23 8 23 14V22H19V15C19 11 14 11 14 15V22H10Z'},
  {id:'email', name:'Email me', href:'mailto:jjrondinijj@gmail.com', color:'#fc8fa5', path:'M2 5H22V20H2Z M2 6L12 14L22 6'},
  {id:'github', name:'GitHub', href:'https://github.com/juniorrondini', color:'#bca8ff', path:'M12 .8a11.3 11.3 0 0 0-3.6 22c.6.1.8-.2.8-.5v-2c-3.3.7-4-1.4-4-1.4-.5-1.3-1.3-1.6-1.3-1.6-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.4-1.3-5.4-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.9 0C15.5 5 16.5 5.3 16.5 5.3c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v2.9c0 .3.2.6.8.5A11.3 11.3 0 0 0 12 .8Z'},
];

export const STACK = [
  {title:'Frontend', icons:['html5','css3','javascript','typescript','angular','react','nextjs','tailwindcss','bootstrap','vitejs']},
  {title:'Backend', icons:['csharp','dotnetcore','java','nodejs','python','php','spring','express']},
  {title:'Data & storage', icons:['mysql','postgresql','mongodb','sqlite','redis','firebase']},
  {title:'Cloud, DevOps & tools', icons:['git','github','docker','kubernetes','linux','bash','nginx','grafana','postman','azure']},
  {title:'Mobile, desktop & engines', icons:['flutter','androidstudio','electron','unity']},
  {title:'Currently exploring', icons:['rust','go','zig','kotlin','swift','lua','nim','haskell']},
];

export function renderHero(t) {
  const dots = Array.from({length:32},(_,i)=>`<circle cx="${35+(i*137)%930}" cy="${35+(i*71)%270}" r="${i%4===0?1.8:1}" fill="${i%2?t.cyan:t.accent}" opacity="${.12+(i%4)*.09}"/>`).join('');
  const name = (attrs) => `<text x="500" y="170" text-anchor="middle" font-size="88" font-weight="900" letter-spacing="3" textLength="870" lengthAdjust="spacingAndGlyphs" ${attrs}>JUNIOR RONDINI</text>`;
  return svg(1000,350,'Junior Rondini — animated neon signature', `
<defs>
  <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="${t.line}" stroke-width=".5" opacity=".45"/></pattern>
  <radialGradient id="aura"><stop stop-color="${t.cyan}" stop-opacity=".16"/><stop offset="1" stop-color="${t.bg}" stop-opacity="0"/></radialGradient>
  <linearGradient id="ink" x1="0" y1="0" x2="1" y2="0"><stop stop-color="${t.accent}"/><stop offset=".45" stop-color="${t.cyan}"/><stop offset=".78" stop-color="${t.violet}"/><stop offset="1" stop-color="${t.accent}"/></linearGradient>
  <linearGradient id="shine" gradientUnits="userSpaceOnUse" x1="-900" y1="0" x2="0" y2="0"><stop stop-color="${t.accent}"/><stop offset=".45" stop-color="${t.cyan}"/><stop offset=".5" stop-color="${t.text}"/><stop offset=".56" stop-color="${t.violet}"/><stop offset="1" stop-color="${t.accent}"/><animate attributeName="x1" values="-900;1000;-900" dur="12s" repeatCount="indefinite"/><animate attributeName="x2" values="0;1900;0" dur="12s" repeatCount="indefinite"/></linearGradient>
  <filter id="glow" x="-20%" y="-80%" width="140%" height="260%"><feGaussianBlur stdDeviation="4"/></filter>
</defs>
<rect x=".5" y=".5" width="999" height="337" rx="18" fill="${t.bg}" stroke="${t.line}"/>
<rect x="1" y="1" width="998" height="335" rx="18" fill="url(#grid)"/>
<ellipse cx="500" cy="148" rx="470" ry="170" fill="url(#aura)"/>${dots}
<path d="M26 72V26H120 M880 26H974V72 M26 265V312H120 M880 312H974V265" fill="none" stroke="${t.accent}" stroke-width="2" opacity=".65"/>
${label(500,48,12,t.muted,'SOFTWARE ENGINEERING / AUTOMATION / EXPERIMENTS','class="mono" letter-spacing="2.2" text-anchor="middle"')}
<g opacity=".16" filter="url(#glow)">${name(`fill="url(#ink)"`)}</g>
<g class="still">${name(`fill="url(#ink)"`)}</g>
<g class="motion">
  <g opacity=".22" transform="translate(-2 0)">${name(`fill="${t.cyan}"`)}</g>
  <g opacity=".2" transform="translate(2 0)">${name(`fill="${t.violet}"`)}</g>
  ${name(`id="name-fill" fill="url(#shine)"`)}
  ${name(`id="name-trace" fill="none" stroke="${t.text}" stroke-width=".8" stroke-dasharray="1300" stroke-dashoffset="1300"`)}
  <animate href="#name-trace" attributeName="stroke-dashoffset" values="1300;0;0;1300" keyTimes="0;.22;.78;1" dur="10s" repeatCount="indefinite"/>
</g>
${label(500,211,19,t.text,'FULL STACK DEVELOPER','class="mono" text-anchor="middle" letter-spacing="5"')}
<path d="M135 242H865" stroke="${t.line}"/><path d="M135 242H865" stroke="url(#ink)" stroke-width="2" stroke-dasharray="100 630" class="motion"><animate attributeName="stroke-dashoffset" values="730;-730" dur="7s" repeatCount="indefinite"/></path>
<g transform="translate(290 271)"><circle r="4" fill="${t.accent}"/>${label(14,4,12,t.muted,'BUILD. LEARN. SHIP. REPEAT.','class="mono" letter-spacing="1.5"')}</g>
${label(958,302,10,t.muted,'JR / 01','class="mono" text-anchor="end"')}
`);
}

export function renderRoles(t) {
  const roles = ['Full Stack Developer', 'Building real business systems', 'Exploring Rust, Go, Zig & AI', 'Creating wonderfully cursed tools'];
  return svg(640,62,'Full stack development, business systems, AI and creative tools', `
<style>@keyframes role{0%,19%{opacity:1}24%,100%{opacity:0}}.role{opacity:0;animation:role 16s linear infinite}.r1{animation-delay:-12s}.r2{animation-delay:-8s}.r3{animation-delay:-4s}</style>
<rect x=".5" y=".5" width="639" height="53" rx="11" fill="${t.panel}" stroke="${t.line}"/>
${label(18,35,22,t.accent,'>_','class="mono"')}
<g class="motion">${roles.map((role,i)=>`<g class="role r${i}">${label(57,34,21,t.cyan,role,'class="mono"')}</g>`).join('')}</g>
<g class="still">${label(57,34,21,t.cyan,roles[0],'class="mono"')}</g>
<rect class="motion" x="606" y="18" width="8" height="20" fill="${t.accent}" opacity=".5"><animate attributeName="opacity" values=".25;.9;.25" dur="1.8s" repeatCount="indefinite"/></rect>`);
}

export function renderSocial(t, s) {
  return svg(180,54,`${s.name} — Junior Rondini`, `
<rect x=".5" y=".5" width="179" height="45" rx="10" fill="${t.panel}" stroke="${s.color}" stroke-opacity=".5"/>
<rect x="1" y="1" width="45" height="44" rx="9" fill="${s.color}" fill-opacity=".12"/>
<g transform="translate(12 11) scale(.95)" ${s.id==='email'?`fill="none" stroke="${s.color}" stroke-width="1.8" stroke-linejoin="round"`:`fill="${s.color}"`}><path d="${s.path}"/></g>
${label(58,29,15,t.text,s.name,'font-weight="700"')}
<path d="M155 28L163 20 M155 20H163V28" fill="none" stroke="${s.color}" stroke-width="1.5"/>
<path class="motion" d="M14 45H166" stroke="${s.color}" stroke-width="1.5" stroke-dasharray="22 152"><animate attributeName="stroke-dashoffset" values="174;-174" dur="6s" repeatCount="indefinite"/></path>`);
}

export function renderTerminal(t) {
  const code = [
    `<tspan fill="${t.violet}">const</tspan> junior = {`,
    `  name: <tspan fill="${t.accent}">"Junior Rondini"</tspan>,`,
    `  focus: <tspan fill="${t.accent}">"Full stack &amp; automation"</tspan>,`,
    `  exploring: [<tspan fill="${t.cyan}">"Rust", "Go", "Zig", "AI"</tspan>],`,
    `  sideQuest: <tspan fill="${t.accent}">"Make esolangs useful"</tspan>`,
    '};',
  ];
  return svg(800,300,'junior.config — full stack, automation, Rust, Go, Zig, AI and esoteric projects', `
<rect x=".5" y=".5" width="799" height="287" rx="14" fill="${t.panel}" stroke="${t.line}"/>
<path d="M1 45H799" stroke="${t.line}"/>
<circle cx="23" cy="23" r="5" fill="#ff718d"/><circle cx="42" cy="23" r="5" fill="#ffcf76"/><circle cx="61" cy="23" r="5" fill="${t.accent}"/>
${label(400,28,13,t.muted,'junior.config.ts','class="mono" text-anchor="middle"')}
${code.map((line,i)=>`${label(24,84+i*30,16,t.muted,String(i+1),'class="mono"')}<text x="65" y="${84+i*30}" font-size="21" fill="${t.text}" xml:space="preserve" class="mono">${line}</text>`).join('')}
<rect x="91" y="252" width="11" height="3" fill="${t.accent}" class="motion"><animate attributeName="opacity" values=".2;1;.2" dur="2s" repeatCount="indefinite"/></rect>
${label(773,272,10,t.muted,'UTF-8 / TYPESCRIPT','class="mono" text-anchor="end"')}`);
}

const PROJECT_COLORS = ['#55edac','#54d9ff','#bca8ff','#ffcc85'];
export function renderProject(t,p,index) {
  const color = PROJECT_COLORS[index];
  const summaries = [ ['Fast file integrity monitoring.', 'Snapshots. Hashes. Clear reports.'], ['Customer support in real time.', 'Internal dashboard + webchat.'], ['Useful tools. Unusual languages.', 'A toolkit and an esolang museum.'], ['A retro financial desktop app.', 'Reports, records & classic Windows.'] ];
  return svg(480,252,`${p.name} — ${p.summary} ${p.stack}`, `
<defs><radialGradient id="aura"><stop stop-color="${color}" stop-opacity=".11"/><stop offset="1" stop-color="${t.panel}" stop-opacity="0"/></radialGradient></defs>
<rect x=".5" y=".5" width="479" height="239" rx="16" fill="${t.panel}" stroke="${t.line}"/>
<ellipse cx="399" cy="52" rx="115" ry="100" fill="url(#aura)"/>
${label(23,28,10,t.muted,`${p.n} / ${p.category}`,'class="mono" letter-spacing="1.1"')}
<g transform="translate(377 33)" fill="none" stroke="${color}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${p.icon}"/></g>
${label(23,83,32,t.text,p.name,'font-weight="800" letter-spacing="-1"')}
${label(24,119,18,t.muted,summaries[index][0])}
${label(24,146,17,t.muted,summaries[index][1])}
<path d="M24 170H455" stroke="${t.line}"/>
${label(24,193,10,color,p.stack,'class="mono" letter-spacing=".5"')}
<circle cx="28" cy="217" r="3" fill="${color}"/>${label(40,221,11,t.muted,'EXPLORE THE REPOSITORY','class="mono" letter-spacing="1"')}
<path d="M438 221L450 209 M438 209H450V221" fill="none" stroke="${color}" stroke-width="1.5"/>
<path class="motion" d="M16 239H464" stroke="${color}" stroke-dasharray="60 448" stroke-width="1.5"><animate attributeName="stroke-dashoffset" values="508;-508" dur="${8+index}s" repeatCount="indefinite"/></path>`);
}

export function renderDivider(t) {
  return svg(1000,26,'Neon circuit divider',`<path d="M0 13H335L347 3H443L455 23H555L567 3H665L677 13H1000" fill="none" stroke="${t.line}"/><path class="motion" d="M0 13H335L347 3H443L455 23H555L567 3H665L677 13H1000" fill="none" stroke="${t.accent}" stroke-width="1.5" stroke-dasharray="45 1000"><animate attributeName="stroke-dashoffset" values="1045;-1045" dur="14s" repeatCount="indefinite"/></path><circle cx="500" cy="13" r="3" fill="${t.cyan}"/>`);
}

export function renderFooter(t) {
  return svg(1000,132,'Build something useful. Make something unexpected.', `<defs><linearGradient id="line"><stop stop-color="${t.accent}"/><stop offset=".5" stop-color="${t.cyan}"/><stop offset="1" stop-color="${t.violet}"/></linearGradient></defs><path d="M0 48C140 5 230 85 370 42S620 6 750 45S920 75 1000 38V132H0Z" fill="${t.panel}"/><path d="M0 48C140 5 230 85 370 42S620 6 750 45S920 75 1000 38" fill="none" stroke="url(#line)" stroke-width="1.5"/><path class="motion" d="M0 48C140 5 230 85 370 42S620 6 750 45S920 75 1000 38" fill="none" stroke="${t.text}" stroke-width="2" stroke-dasharray="70 1000"><animate attributeName="stroke-dashoffset" values="1070;-1070" dur="14s" repeatCount="indefinite"/></path>${label(500,102,19,t.text,'BUILD SOMETHING USEFUL. MAKE SOMETHING UNEXPECTED.','class="mono" text-anchor="middle" letter-spacing="1"')}`);
}

export function renderGithubStats(t,m) {
  const metrics = [[m.publicRepos,'PUBLIC REPOS'],[m.stars,'STARS RECEIVED'],[m.followers,'FOLLOWERS'],[m.forks,'PROJECT FORKS']];
  return svg(480,318,'Public GitHub statistics: repositories, stars received, followers and project forks', `
<rect x=".5" y=".5" width="479" height="305" rx="16" fill="${t.panel}" stroke="${t.line}"/>
${label(23,34,20,t.text,'GitHub / the numbers','font-weight="700"')}
<path d="M24 52H456 M240 73V257 M24 165H456" stroke="${t.line}"/>
${metrics.map(([number,name],i)=>{const x=i%2?264:24,y=i<2?113:219;return `${label(x,y,42,i%2?t.cyan:t.accent,number,'font-weight="800"')}${label(x,y+27,14,t.muted,name,'class="mono"')}`;}).join('')}
<circle cx="27" cy="282" r="3" fill="${t.accent}"/>${label(39,286,11,t.muted,`PUBLIC DATA / ${m.updatedAt.slice(0,10)}`,'class="mono"')}`);
}

const LANGUAGE_COLORS = ['#62f5b8','#54d9ff','#bca8ff','#ffcc85','#ff8fa8','#80a7ff'];
export function languageSlices(m) {
  const sorted = Object.entries(m.languages).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1] || a[0].localeCompare(b[0]));
  const total = sorted.reduce((s,[,v])=>s+v,0);
  const top = sorted.slice(0,5);
  if (sorted.length>5) top.push(['Other',sorted.slice(5).reduce((s,[,v])=>s+v,0)]);
  return top.map(([name,bytes],i)=>({name,bytes,ratio:bytes/total,color:LANGUAGE_COLORS[i]}));
}

export function renderLanguageStats(t,m) {
  const slices = languageSlices(m);
  let offset=0;
  const segments = slices.map(s=>{const length=s.ratio*100;const markup=`<circle cx="110" cy="158" r="64" fill="none" stroke="${s.color}" stroke-width="18" pathLength="100" stroke-dasharray="${length} ${100-length}" stroke-dashoffset="${-offset}" transform="rotate(-90 110 158)"/>`;offset+=length;return markup;}).join('');
  return svg(480,318,'Language composition by source bytes in public, non-fork repositories', `
<rect x=".5" y=".5" width="479" height="305" rx="16" fill="${t.panel}" stroke="${t.line}"/>
${label(23,34,20,t.text,'Languages / in the wild','font-weight="700"')}
<path d="M24 52H456" stroke="${t.line}"/>
<circle cx="110" cy="158" r="64" fill="none" stroke="${t.line}" stroke-width="18"/>${segments}
${label(110,158,29,t.text,Object.keys(m.languages).length,'text-anchor="middle" font-weight="800"')}
${label(110,179,10,t.muted,'LANGUAGES','text-anchor="middle" class="mono"')}
${slices.map((s,i)=>`<circle cx="220" cy="${87+i*29}" r="4" fill="${s.color}"/>${label(232,92+i*29,15,t.text,s.name)}${label(452,92+i*29,13,t.muted,`${(s.ratio*100).toFixed(1)}%`,'text-anchor="end" class="mono"')}`).join('')}
${label(24,282,10,t.muted,'SOURCE BYTES / PUBLIC NON-FORK REPOS','class="mono"')}`);
}
