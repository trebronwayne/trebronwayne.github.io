# Daily facts

The app reads these files straight from the public website repository, so adding a fact is just pushing a file. No app update, no server, no cost.

**Where it lives:** copy this whole `facts/` folder into your public repo `trebronwayne.github.io` as `remote-schools/facts/` (so `remote-schools/facts/daily.json` exists). The app reads
`https://raw.githubusercontent.com/trebronwayne/trebronwayne.github.io/master/remote-schools/facts/`. To use another place, build the app with `VITE_FACTS_BASE_URL=https://…/`.

## Add facts
1. Open (or add) a file in `packs/`, one per topic: `science, nature, space, body, history, africa, maths, tech, language, ideas, world`.
2. Add an object: `{ "id": "sci-125", "topic": "science", "subjects": ["Physics"], "title": "…", "body": "…" }`
   - `subjects` decides who sees it first on the "Facts for you" page (matched with the learner's favourite subjects).
   - Optional: `"image": "https://…"` (https only; hidden if it fails to load), `"credit"`, `"source"`, `"level": "secondary"` (hidden from primary classes), `"daily": false` (never the fact of the day, only on the For you page), `"date": "2026-12-25"` (use on that day).
3. Run `npm run facts:build` (checks every fact, then rewrites `index.json` and `daily.json`). Push the folder.

## Choose a day
Give a fact a `"date": "2026-12-25"` and it is the fact of that day. Other days follow a fixed rotation, and everyone gets the same fact on the same day.

## What the phone keeps
Today's fact and the next six, and the first 30 "For you" facts, so a few days still work offline. Settings > Saved for offline has a Clear button.
