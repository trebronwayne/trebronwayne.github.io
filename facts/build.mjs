// Checks every fact and writes the two files the app reads:  index.json (the list of packs)  and  daily.json (the facts used for "today's fact").
// Run it whenever you add or change a fact:   node build.mjs      (from this folder)
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TOPIC_IDS, TOPICS, cleanFact, factProblems } from './lib/facts.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const files = readdirSync(join(root, 'packs')).filter(f => f.endsWith('.json')).sort();
const problems = [], seen = new Set(), packs = [], all = [];
for (const file of files) {
  let list; try { list = JSON.parse(readFileSync(join(root, 'packs', file), 'utf8')); } catch (e) { problems.push(`packs/${file}: not valid JSON (${e.message}).`); continue; }
  if (!Array.isArray(list)) { problems.push(`packs/${file}: must be a list of facts.`); continue; }
  const good = [];
  for (const raw of list) {
    const p = factProblems(raw); if (p.length) { problems.push(...p.map(x => `packs/${file}: ${x}`)); continue; }
    if (seen.has(raw.id)) { problems.push(`packs/${file}: the id ${raw.id} is used twice.`); continue; }
    seen.add(raw.id); const f = cleanFact(raw); good.push(f); all.push(f);
  }
  packs.push({ file: `packs/${file}`, count: good.length, topics: [...new Set(good.map(f => f.topic))] });
}
if (problems.length) { console.error('Facts have problems:\n- ' + problems.join('\n- ')); process.exit(1); }

// Daily facts: not marked daily:false, not for older learners only, and spread so that two days in a row are rarely the same topic.
const pool = all.filter(f => f.daily !== false && f.level !== 'secondary');
const byTopic = TOPIC_IDS.map(t => pool.filter(f => f.topic === t)).filter(l => l.length);
const order = []; for (let i = 0; byTopic.some(l => i < l.length); i++) for (const l of byTopic) if (i < l.length) order.push(l[i]);
const schedule = Object.fromEntries(all.filter(f => f.date).map(f => [f.date, f.id]));
const daily = { version: 1, count: order.length, schedule, facts: order };
const index = { version: 1, updated: new Date().toISOString().slice(0, 10), total: all.length, topics: TOPICS.map(t => t.id), daily: { file: 'daily.json', count: order.length }, packs };
writeFileSync(join(root, 'daily.json'), JSON.stringify(daily));
writeFileSync(join(root, 'index.json'), JSON.stringify(index, null, 1) + '\n');
console.log(`facts: ${all.length} facts in ${packs.length} packs, ${order.length} daily (about ${Math.floor(order.length / 30)} months of different facts). Wrote index.json and daily.json.`);
