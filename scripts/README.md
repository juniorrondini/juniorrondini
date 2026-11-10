# Profile artwork

The README combines animated SVG artwork, individual technology icons and native Markdown. All displayed assets live in `assets/`; `<picture>` selects light and dark variants. The name, roles, social buttons, circuit dividers and project accents animate inside standard SVG images. Reduced-motion preferences reveal static versions.

Regenerate and validate with Node.js 24:

```sh
node scripts/generate-commit-trail.mjs
node --test scripts/profile.test.mjs
```

Edit `profile-design.mjs` for the name effects, social buttons, terminal, project cards and charts. Edit `generate-commit-trail.mjs` for themes, project metadata and the snake. Commit regenerated assets with source changes. The validation workflow checks tests and reproducibility.

## Technology icons

`assets/icons/` contains 46 individually wrapped Devicon SVGs, the upstream MIT license and attribution with the source commit. `node scripts/sync-icons.mjs` explicitly refreshes these assets. Normal artwork generation and CI do not download icons.

## Public GitHub statistics

`node scripts/update-metrics.mjs` fetches public profile metadata, all paginated public repositories and language-byte maps for non-fork repositories. It saves `assets/github-metrics.json` and regenerates the statistics cards. If any API request fails, the existing snapshot is retained. No private data is requested.

The `metrics.yml` workflow refreshes this snapshot daily and commits changes using the repository's built-in Actions token. No personal access token or external image-rendering service is required. Language proportions describe source bytes; other metrics show public repositories, stars received, followers and forks of original projects.

## Snake timing

The grid is custom pixel art spelling `JUNIOR RONDINI`; it does not claim to show live contributions. The snake follows a continuous column-by-column path through every cell. Each cell's arrival time is calculated from its cumulative distance on that same path.

The head's motion, the body's dash offset and each cell's disappearance all use the same 24-second timeline. The first 2.4 seconds hold the complete name; the snake then eats the signature, leaves the grid, and fades before the name returns. Browsers with reduced motion enabled show the complete static signature.

The existing `output` branch remains historical artwork. The README and snake use the assets committed to `main`.
