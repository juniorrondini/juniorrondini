import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { generateAssets } from './generate-commit-trail.mjs';

const username = 'juniorrondini';
const headers = {'User-Agent':'juniorrondini-profile',Accept:'application/vnd.github+json'};
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
async function get(path) {
  const response = await fetch(`https://api.github.com${path}`,{headers,signal:AbortSignal.timeout(30000)});
  if (!response.ok) throw new Error(`GitHub public API ${response.status} for ${path}`);
  return response.json();
}

const user = await get(`/users/${username}`);
const repos = [];
for (let page=1; ;page++) {
  const batch = await get(`/users/${username}/repos?per_page=100&page=${page}&sort=full_name`);
  repos.push(...batch);
  if (batch.length<100) break;
}
const originals = repos.filter(r=>!r.fork && !r.private);
const languages = {};
// Small batches stay below GitHub's secondary rate limits.
for (let i=0;i<originals.length;i+=4) {
  const maps = await Promise.all(originals.slice(i,i+4).map(r=>get(`/repos/${username}/${encodeURIComponent(r.name)}/languages`)));
  for (const map of maps) for (const [language,bytes] of Object.entries(map)) languages[language]=(languages[language]??0)+bytes;
}
const metrics = {
  username, updatedAt:new Date().toISOString().slice(0,10)+'T00:00:00Z',
  publicRepos:user.public_repos, followers:user.followers,
  stars:originals.reduce((s,r)=>s+r.stargazers_count,0),
  forks:originals.reduce((s,r)=>s+r.forks_count,0),
  repositoriesMeasured:originals.length,
  languages:Object.fromEntries(Object.entries(languages).sort(([a],[b])=>a.localeCompare(b))),
};
if (!Number.isSafeInteger(metrics.publicRepos) || !Object.keys(languages).length) throw new Error('Incomplete public metrics; keeping existing artwork.');
writeFileSync(fileURLToPath(new URL('../assets/github-metrics.json',import.meta.url)),JSON.stringify(metrics,null,2)+'\n');
generateAssets();
console.log(`Refreshed public metrics for ${username}: ${originals.length} source repositories.`);
