# Nobert — portfolio and project site

This repository publishes the portfolio at `https://trebronwayne.github.io/`, with separate pages for the developer portfolio, Bluebird, and Remote Schools.

## Routes

- `/` — developer portfolio and selected projects
- `/cv` — print-friendly CV
- `/bluebird`, `/bluebird/home`, `/bluebird/about`, `/bluebird/support`, `/bluebird/releases` — Bluebird pages
- `/remote-schools` — Remote Schools overview and app downloads

The build creates static entry points for each route so GitHub Pages serves direct links and refreshes without a client-side 404.

## Release information and downloads

Bluebird's release history reads public release metadata from this repository. All Bluebird download links and the official Uptodown badge point to the Uptodown store page. The combined user total is manually maintained in `public/downloads.json`; update `totalUsers` there when the reported total changes.

- Bluebird's displayed total is a manually reported user count across distribution channels, not an automated download, installation, or active-device counter.
- Remote Schools releases are matched by their Remote Schools release or asset names, or by the `v1.0.x` tag series. Attach `.apk` and `.exe` assets to the published release.
- The first Remote Schools tag is expected to be `v1.0.26`. A clear release title such as `Remote Schools v1.0.26` and filenames such as `RemoteSchools-v1.0.26.apk` and `RemoteSchools-v1.0.26.exe` make the release unambiguous.

## Site development

```bash
npm install
npm run dev
npm run build
```

The site is built with React and Vite. GitHub Pages uses the `react-pages` branch. `npm run build` writes the root entry, route entry points, assets, and the SPA fallback used by unknown paths.
