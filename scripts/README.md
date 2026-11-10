# Profile artwork

The README images are generated SVGs committed to `assets/`. They work as ordinary GitHub images, with no external rendering service, token or publishing branch. `<picture>` selects the light or dark version.

Regenerate and validate with Node.js 24:

```sh
node scripts/generate-commit-trail.mjs
node --test scripts/profile.test.mjs
```

Edit the theme, project cards and signature in `generate-commit-trail.mjs`. Commit the regenerated assets with the source change. The workflow checks both the tests and reproducibility of the artwork.

## Snake timing

The grid is custom pixel art spelling `JUNIOR RONDINI`; it does not claim to show live contributions. The snake follows a continuous column-by-column path through every cell. Each cell's arrival time is calculated from its cumulative distance on that same path.

The head's motion, the body's dash offset and each cell's disappearance all use the same 24-second timeline. The first 2.4 seconds hold the complete name; the snake then eats the signature, leaves the grid, and fades before the name returns. Browsers with reduced motion enabled show the complete static signature.

The old scheduled publishing job is replaced by validation. The existing `output` branch can remain as historical artwork; the README no longer depends on it.
