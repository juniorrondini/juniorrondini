import {mkdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {STACK} from './profile-design.mjs';

const headers={'User-Agent':'juniorrondini-profile'};
const response=await fetch('https://api.github.com/repos/devicons/devicon/commits/master',{headers});
if(!response.ok)throw Error(`Devicon version lookup: ${response.status}`);
const {sha}=await response.json();
const base=`https://raw.githubusercontent.com/devicons/devicon/${sha}`;
const output=fileURLToPath(new URL('../assets/icons/',import.meta.url));
mkdirSync(output,{recursive:true});
const names={html5:'HTML',css3:'CSS',javascript:'JavaScript',typescript:'TypeScript',angular:'Angular',react:'React',nextjs:'Next.js',tailwindcss:'Tailwind',bootstrap:'Bootstrap',vitejs:'Vite',csharp:'C#',dotnetcore:'.NET',java:'Java',nodejs:'Node.js',python:'Python',php:'PHP',spring:'Spring',express:'Express',mysql:'MySQL',postgresql:'PostgreSQL',mongodb:'MongoDB',sqlite:'SQLite',redis:'Redis',firebase:'Firebase',git:'Git',github:'GitHub',docker:'Docker',kubernetes:'Kubernetes',linux:'Linux',bash:'Bash',nginx:'Nginx',grafana:'Grafana',postman:'Postman',azure:'Azure',flutter:'Flutter',androidstudio:'Android',electron:'Electron',unity:'Unity',rust:'Rust',go:'Go',zig:'Zig',kotlin:'Kotlin',swift:'Swift',lua:'Lua',nim:'Nim',haskell:'Haskell'};
const icons=[...new Set(STACK.flatMap(s=>s.icons))];
for(let i=0;i<icons.length;i+=6){
  await Promise.all(icons.slice(i,i+6).map(async id=>{
    let content;
    for(const variant of ['original','plain','original-wordmark','plain-wordmark']){
      const r=await fetch(`${base}/icons/${id}/${id}-${variant}.svg`);
      if(r.ok){content=await r.text();break;}
    }
    if(!content||!content.includes('<svg')||/<script|foreignObject|<image|@import|href="https?:/i.test(content))throw Error(`Invalid icon: ${id}`);
    content=content.replace(/<\?xml[^>]*>|<!DOCTYPE[^>]*>/g,'');
    content=content.replace(/<svg\b([^>]*)>/,(_,attrs)=>`<svg x="10" y="9" width="44" height="44" ${attrs.replace(/\s(?:width|height)="[^"]*"/g,'')}>`);
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="82" viewBox="0 0 64 82" role="img"><title>${names[id]}</title><rect x=".5" y=".5" width="63" height="76" rx="12" fill="#111e30" stroke="#263c56"/><rect x="6" y="5" width="52" height="52" rx="10" fill="#f4f8ff"/>${content}<text x="32" y="70" text-anchor="middle" fill="#d9eaff" font-family="Arial,Helvetica,sans-serif" font-size="9">${names[id]}</text></svg>\n`;
    writeFileSync(output+id+'.svg',svg);
  }));
}
const license=await fetch(`${base}/LICENSE`);
if(!license.ok)throw Error('Missing Devicon license');
writeFileSync(output+'LICENSE',await license.text());
writeFileSync(output+'NOTICE.md',`Technology marks are from [Devicon](https://github.com/devicons/devicon), commit ${sha}, under its MIT license. Original marks belong to their owners. Icons are wrapped in local presentation tiles; the original paths are preserved.\n`);
console.log(`Saved ${icons.length} technology icons with Devicon attribution.`);
