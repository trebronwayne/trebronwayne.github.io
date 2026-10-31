# Nobert — portfolio and project site

This repository publishes the portfolio at `https://trebronwayne.github.io/`, with separate pages for the developer portfolio, Bluebird, and Remote Schools.

## Routes

- `/` — developer portfolio and selected projects
- `/cv` — print-friendly CV
- `/bluebird`, `/bluebird/home`, `/bluebird/about`, `/bluebird/support`, `/bluebird/releases` — Bluebird pages
- `/remote-schools` — Remote Schools overview and app downloads

The build creates static entry points for each route so GitHub Pages serves direct links and refreshes without a client-side 404.

## GitHub releases

Bluebird and Remote Schools releases are published from this public repository. The pages read release assets from the GitHub API at runtime; no site rebuild is needed when a release is published.

- Bluebird releases are matched by their Bluebird release or asset names. Only Bluebird APK assets contribute to Bluebird's download totals.
- Remote Schools releases are matched by a release or asset name containing “Remote Schools”, or by the `v1.0.x` tag series. Attach `.apk` and `.exe` assets to the published release.
- The first Remote Schools tag is expected to be `v1.0.26`. A clear release title such as `Remote Schools v1.0.26` and filenames such as `RemoteSchools-v1.0.26.apk` and `RemoteSchools-v1.0.26.exe` make the release unambiguous.
- The displayed download counts are asset-download totals, not unique users, installations, or active devices.

`downloads.json` remains a static fallback for Bluebird when GitHub's release API is temporarily unavailable.

## Site development

```bash
npm install
npm run dev
npm run build
```

The site is built with React and Vite. GitHub Pages uses the `react-pages` branch. `npm run build` writes the root entry, route entry points, assets, and the SPA fallback used by unknown paths.
