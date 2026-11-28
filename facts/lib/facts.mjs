// Daily facts: what a fact looks like, how it is checked, which one is "today's", and how the "For you" page orders them.
// Plain JavaScript shared by the app, the facts builder (facts/build.mjs) and the tests.

export const TOPICS = [
  { id: 'science', label: 'Science', emoji: '🔬' },
  { id: 'nature', label: 'Nature', emoji: '🌿' },
  { id: 'space', label: 'Space', emoji: '🪐' },
  { id: 'body', label: 'Human body', emoji: '🫀' },
  { id: 'history', label: 'History', emoji: '🏛️' },
  { id: 'africa', label: 'Africa', emoji: '🌍' },
  { id: 'maths', label: 'Maths', emoji: '➗' },
  { id: 'tech', label: 'Technology', emoji: '💡' },
  { id: 'language', label: 'Words and language', emoji: '📖' },
  { id: 'ideas', label: 'Ideas and philosophy', emoji: '🧠' },
  { id: 'world', label: 'Our world', emoji: '🧭' },
];
export const TOPIC_IDS = TOPICS.map(t => t.id);
export const topicLabel = id => TOPICS.find(t => t.id === id)?.label || 'Facts';

const ID = /^[a-z0-9][a-z0-9-]{1,40}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
/** Only https pictures are ever loaded. */
export const safeImage = v => { const s = str(v, 400); try { const u = new URL(s); return u.protocol === 'https:' ? u.toString() : ''; } catch { return ''; } };

/** Turns whatever came from the internet into a fact the app can trust, or null when it is not usable. */
export function cleanFact(x) {
  if (!x || typeof x !== 'object') return null;
  const id = str(x.id, 41), title = str(x.title, 90), body = str(x.body, 700), topic = str(x.topic, 20);
  if (!ID.test(id) || !title || !body || !TOPIC_IDS.includes(topic)) return null;
  const f = { id, topic, subjects: Array.isArray(x.subjects) ? x.subjects.map(s => str(s, 40)).filter(Boolean).slice(0, 4) : [], title, body };
  const image = safeImage(x.image), credit = str(x.credit, 80), source = str(x.source, 120);
  if (image) f.image = image;
  if (credit) f.credit = credit;
  if (source) f.source = source;
  if (x.level === 'secondary') f.level = 'secondary';
  if (x.daily === false) f.daily = false;
  if (DATE.test(str(x.date, 10))) f.date = x.date;
  return f;
}
/** Plain-words problems with a fact (for the builder). */
export function factProblems(x) {
  const p = [], id = str(x?.id, 60);
  if (!ID.test(id)) p.push(`"${id}" is not a good id (lowercase letters, numbers and dashes, like sci-001).`);
  if (!str(x?.title, 200)) p.push(`${id}: it needs a title.`); else if (x.title.trim().length > 90) p.push(`${id}: the title is longer than 90 characters.`);
  if (!str(x?.body, 2000)) p.push(`${id}: it needs some text.`); else if (x.body.trim().length > 700) p.push(`${id}: the text is longer than 700 characters.`);
  if (!TOPIC_IDS.includes(x?.topic)) p.push(`${id}: topic must be one of ${TOPIC_IDS.join(', ')}.`);
  if (x?.image && !safeImage(x.image)) p.push(`${id}: the image must be a full https:// link.`);
  if (x?.date && !DATE.test(x.date)) p.push(`${id}: date must look like 2027-01-31.`);
  return p;
}

/** Days since 1970 on the calendar date given (so the same date gives the same number everywhere). */
export const dayNumber = key => { const [y, m, d] = key.split('-').map(Number); return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000); };
/** Today's fact: one scheduled for that date if there is one, otherwise the next in the list. Everyone gets the same fact on the same day. */
export function pickDaily(list, schedule, day) {
  if (!list.length) return null;
  const sid = schedule && schedule[day];
  const scheduled = sid && list.find(f => f.id === sid);
  return scheduled || list[((dayNumber(day) % list.length) + list.length) % list.length];
}

const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').trim();
/** Does this fact belong to one of the learner's favourite subjects? (Matches "English" with "English Language", "Maths" with "Mathematics".) */
export function matchesFavourite(fact, favourites) {
  const favs = (favourites || []).map(norm).filter(Boolean);
  if (!favs.length) return false;
  return (fact.subjects || []).some(s => { const k = norm(s).replace(/^maths$/, 'mathematics'); return favs.some(f => f === k || f.includes(k) || k.includes(f) || (k === 'mathematics' && /^maths?\b/.test(f))); });
}

function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
/**
 * The order of the "For you" page. Favourite subjects count most, then topics the learner has hearted, then a little variety that changes
 * every day. Facts already seen sink to the bottom, and facts meant for older learners are left out for primary classes.
 * `ctx`: { favourites: string[], liked: string[] (fact ids), seen: string[] (fact ids), day: 'YYYY-MM-DD', primary: boolean, topic?: string }
 */
export function feedFor(facts, ctx) {
  const next = rng(dayNumber(ctx.day) * 2654435761 + facts.length), liked = new Set(ctx.liked || []), seen = new Set(ctx.seen || []);
  const likedTopics = new Map();
  for (const f of facts) if (liked.has(f.id)) likedTopics.set(f.topic, (likedTopics.get(f.topic) || 0) + 1);
  const scored = facts.filter(f => !(ctx.primary && f.level === 'secondary') && (!ctx.topic || f.topic === ctx.topic)).map(f => {
    let s = next() * 30;                                            // a fresh shuffle each day
    if (matchesFavourite(f, ctx.favourites)) s += 40;              // your favourite subjects
    s += Math.min(25, (likedTopics.get(f.topic) || 0) * 8);        // topics you hearted
    if (liked.has(f.id)) s -= 5;                                    // you know this one already
    if (seen.has(f.id)) s -= 60;                                    // seen: show later
    return { f, s };
  });
  return scored.sort((a, b) => b.s - a.s).map(x => x.f);
}
