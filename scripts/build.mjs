import { execFileSync } from 'node:child_process';
import { cpSync, copyFileSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';

const template = Buffer.from(readFileSync('site.template.b64', 'utf8').trim(), 'base64')
  .toString('utf8')
  .replace('content="Official Bluebird Android launcher release information, APK downloads, installation instructions, and privacy details."', 'content="Portfolio, CV, and selected software projects by Nobert."')
  .replace('content="Bluebird — Android launcher releases"', 'content="Nobert — Developer portfolio"')
  .replace('content="Official release information and APK downloads for the Bluebird Android launcher."', 'content="Selected software projects, skills, and CV for Nobert."')
  .replace('<meta property="og:image" content="assets/img/screenshots/desktop.png" />', '')
  .replace('content="Bluebird" />', 'content="Nobert" />')
  .replace('<title>Bluebird — Android launcher releases</title>', '<title>Nobert — Developer portfolio</title>')
  .replace('<link rel="icon" type="image/png" href="assets/img/logo.png" />', '<link rel="icon" type="image/svg+xml" href="/favicon.svg" />')
  .replace(/[ \t]+$/gm, '');
writeFileSync('index.html', template);

execFileSync('npx', ['vite', 'build'], {
  stdio: 'inherit',
  env: process.env
});

cpSync('dist/assets', 'assets', { recursive: true });
for (const entry of readdirSync('dist')) {
  if (entry === 'assets') continue;
  const source = `dist/${entry}`;
  if (statSync(source).isFile()) copyFileSync(source, entry);
}

const builtIndex = 'dist/index.html';
const routePages = [
  {
    path: '/',
    title: 'Nobert — Developer portfolio',
    description: 'Portfolio, CV, and selected software projects by Nobert.'
  },
  {
    path: '/bluebird',
    title: 'Bluebird — Android launcher',
    description: 'Bluebird is a desktop-style Android launcher with floating windows, a taskbar, and built-in applications.'
  },
  {
    path: '/bluebird/home',
    title: 'Bluebird — Android launcher',
    description: 'Bluebird is a desktop-style Android launcher with floating windows, a taskbar, and built-in applications.'
  },
  {
    path: '/bluebird/about',
    title: 'About Bluebird — Android launcher',
    description: 'Explore Bluebird features, screenshots, and privacy information.'
  },
  {
    path: '/bluebird/support',
    title: 'Bluebird support and installation',
    description: 'Installation steps and community support for the Bluebird Android launcher.'
  },
  {
    path: '/bluebird/releases',
    title: 'Bluebird releases',
    description: 'Bluebird Android APK releases, version history, and download information.'
  },
  {
    path: '/remote-schools',
    title: 'Remote Schools — Uganda curriculum learning',
    description: 'An e-learning platform for Uganda’s curriculum with offline support and Android and Windows downloads.'
  },
  {
    path: '/cv',
    title: 'CV — Nobert',
    description: 'A project-focused CV for Nobert, with verified skills and selected software projects.'
  }
];

function pageHtml({ path, title, description }) {
  const canonicalPath = path === '/' ? '/' : `${path}/`;
  return readFileSync(builtIndex, 'utf8')
    .replace('<title>Nobert — Developer portfolio</title>', `<title>${title}</title>`)
    .replace('content="Portfolio, CV, and selected software projects by Nobert."', `content="${description}"`)
    .replace('</head>', `  <link rel="canonical" href="https://trebronwayne.github.io${canonicalPath}" />\n  </head>`);
}

for (const page of routePages) {
  const html = pageHtml(page);
  if (page.path === '/') {
    writeFileSync('index.html', html);
  } else {
    const directory = page.path.slice(1);
    mkdirSync(directory, { recursive: true });
    writeFileSync(`${directory}/index.html`, html);
  }
}

writeFileSync('404.html', pageHtml({
  path: '/404',
  title: 'Page not found — Nobert',
  description: 'This page could not be found.'
}));

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...routePages.map(({ path }) => `  <url><loc>https://trebronwayne.github.io${path === '/' ? '/' : `${path}/`}</loc></url>`),
  '</urlset>',
  ''
].join('\n');
writeFileSync('sitemap.xml', sitemap);