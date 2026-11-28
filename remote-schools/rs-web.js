// Shared by the three share pages (join, u, f). No build step: plain modules, Firebase from Google's CDN.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js';
import { getAuth, signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged }
  from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, writeBatch, increment, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js';
import { firebaseConfig, PACKAGE, SITE, VERSION_URL } from './rs-config.js';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, undefined);
export { signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, doc, getDoc, setDoc, writeBatch, increment, serverTimestamp };

export const $ = (s, r = document) => r.querySelector(s);
export function h(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) { if (v === false || v == null) continue; if (k === 'class') e.className = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v === true ? '' : v); }
  for (const kid of kids.flat()) if (kid != null && kid !== false) e.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  return e;
}
export const query = k => new URLSearchParams(location.search).get(k) || '';
export const isAndroid = /android/i.test(navigator.userAgent);
export const safeId = v => (/^[A-Za-z0-9_-]{6,128}$/.test(v) ? v : '');

/** The page chrome: a small brand bar and a container. */
export function shell(body) {
  const root = $('#app'); root.replaceChildren(h('div', { class: 'wrap' },
    h('a', { class: 'top', href: SITE }, h('div', { class: 'logo' }, 'RS'), h('div', {}, h('b', {}, 'Remote Schools'), h('br'), h('span', {}, 'Learn anywhere, even offline'))),
    body, h('p', { class: 'foot' }, h('a', { href: SITE }, 'Remote Schools'), ' · ', h('a', { href: SITE + 'privacy.html' }, 'Privacy'), ' · ', h('a', { href: SITE + 'terms.html' }, 'Terms'))));
}
export const loading = () => shell(h('div', { class: 'spin', role: 'status', 'aria-label': 'Loading' }));
export const message = (title, text) => shell(h('div', { class: 'card pad' }, h('h2', {}, title), h('p', { class: 'muted' }, text), h('a', { class: 'btn', href: SITE }, 'Go to Remote Schools')));

/** "Open in the app": on Android Chrome an intent link opens the installed app, or goes to the download page when it is not installed. */
export function openInAppButton(label = 'Open in the app') {
  const here = location.href.replace(/^https:\/\//, '');
  const href = isAndroid ? `intent://${here}#Intent;scheme=https;package=${PACKAGE};S.browser_fallback_url=${encodeURIComponent(SITE)};end` : SITE;
  return h('a', { class: 'btn', href }, isAndroid ? label : 'Get the Remote Schools app');
}
export function downloadBlock() {
  const apk = h('a', { class: 'btn alt', href: SITE }, 'Download the Android app'), exe = h('a', { class: 'btn alt', href: SITE, hidden: true }, 'Download the Windows app');
  fetch(`${VERSION_URL}?t=${Date.now()}`).then(r => r.json()).then(d => {
    if (d?.android?.url) { apk.href = d.android.url; apk.textContent = `Download the Android app ${d.android.version || ''}`.trim(); }
    if (d?.windows?.url) { exe.href = d.windows.url; exe.hidden = false; exe.textContent = `Download the Windows app ${d.windows.version || ''}`.trim(); }
  }).catch(() => {});
  return h('div', {}, apk, exe);
}

export const LEVELS = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 's1', 's2', 's3', 's4'];
const lvl = id => (id === 'all' ? 'All classes' : /^p\d$/.test(id) ? 'P.' + id[1] : /^s\d$/.test(id) ? 'S.' + id[1] : id);
export const spanLabel = (a, b) => (a === 'all' ? 'All classes' : b && b !== a && LEVELS.indexOf(b) > LEVELS.indexOf(a) ? `${lvl(a)} – ${lvl(b)}` : lvl(a));
export const KINDS = { notes: 'Notes', 'past-paper': 'Past paper', revision: 'Revision exercises', diagrams: 'Diagrams', other: 'Other' };

const SOCIAL = [/(^|\.)whatsapp\.com$/, /^wa\.me$/, /(^|\.)t\.me$/, /(^|\.)telegram\.(me|org)$/, /(^|\.)facebook\.com$/, /(^|\.)fb\.(com|me|watch)$/, /(^|\.)tiktok\.com$/, /(^|\.)youtube\.com$/, /^youtu\.be$/, /(^|\.)instagram\.com$/, /(^|\.)x\.com$/, /(^|\.)twitter\.com$/];
/** Same rule as the app: social links show straight away; other links only after a moderator approved them; rejected ones never. */
export function visibleLinks(c) {
  const list = Array.isArray(c.links) ? c.links : [], ok = new Set(c.linksApproved || []), no = new Set(c.linksRejected || []);
  return list.filter(u => { try { const x = new URL(u); if (x.protocol !== 'https:' || no.has(u)) return false; return ok.has(u) || SOCIAL.some(r => r.test(x.hostname.replace(/^www\./, ''))); } catch { return false; } }).slice(0, 3);
}
export const safePhoto = p => (typeof p === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(p) ? p : '');
export function avatar(photo, name) { const p = safePhoto(photo); return p ? h('img', { class: 'avatar', src: p, alt: '' }) : h('div', { class: 'avatar', 'aria-hidden': 'true' }, (name || '?').trim().charAt(0).toUpperCase()); }
export const hostOf = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } };
