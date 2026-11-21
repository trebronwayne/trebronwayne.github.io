import { execFileSync } from 'node:child_process';
import { cpSync, copyFileSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';

const template = Buffer.from(readFileSync('site.template.b64', 'utf8').trim(), 'base64')
  .toString('utf8')
  .replace('content="#f7f8fa"', 'content="#0b0c0e"')
  .replace('content="Official Bluebird Android launcher release information, APK downloads, installation instructions, and privacy details."', 'content="Android and web software by Nobert Lamn: DropLink, Bluebird, Remote Schools Uganda, and AubreeKit."')
  .replace('content="Bluebird — Android launcher releases"', 'content="Nobert Lamn — Android and web developer"')
  .replace('content="Official release information and APK downloads for the Bluebird Android launcher."', 'content="Android and web software by Nobert Lamn: DropLink, Bluebird, Remote Schools Uganda, and AubreeKit."')
  .replace('<meta property="og:image" content="assets/img/screenshots/desktop.png" />', '')
  .replace('content="Bluebird" />', 'content="Nobert Lamn" />')
  .replace('<title>Bluebird — Android launcher releases</title>', '<title>Nobert Lamn — Android and web developer</title>')
  .replace('<link rel="icon" type="image/png" href="assets/img/logo.png" />', '<link rel="icon" type="image/svg+xml" href="/favicon.svg" />')
  .replace('</head>', `    <script>
      (() => {
        try {
          const saved = localStorage.getItem('site-theme');
          const theme = saved === 'dark' || saved === 'light'
            ? saved
            : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
          document.documentElement.dataset.theme = theme;
          document.documentElement.style.colorScheme = theme;
          document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0b0c0e' : '#f3f5f7');
        } catch {
          document.documentElement.dataset.theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
      })();
    </script>
  </head>`)
  .replace(/[ \t]+$/gm, '');
writeFileSync('index.html', template);

execFileSync('npx', ['vite', 'build'], {
  stdio: 'inherit',
  env: process.env
});

for (const entry of readdirSync('assets')) {
  if (/^index-[A-Za-z0-9_-]+\.(js|css)$/.test(entry)) rmSync(`assets/${entry}`);
}
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
    title: 'Nobert Lamn — Android and web developer',
    description: 'Android and web software by Nobert Lamn: DropLink, Bluebird, Remote Schools Uganda, and AubreeKit.'
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
    description: 'Bluebird release history and Uptodown downloads for the Android launcher.'
  },
  {
    path: '/remote-schools',
    title: 'Remote Schools — Uganda curriculum learning app',
    description: 'Explore Remote Schools: Uganda curriculum lessons, books, practice, past papers, and app downloads for offline study.'
  },
  {
    path: '/droplink',
    title: 'DropLink — Your phone. Your server. Your network.',
    description: 'DropLink turns an Android phone into a private local server for file transfers, media, and nearby devices.'
  },
  {
    path: '/cv',
    title: 'CV — Nobert Lamn',
    description: 'A project-focused CV for Nobert Lamn, with selected software projects and skills.'
  }
];

function pageHtml({ path, title, description }) {
  const canonicalPath = path === '/' ? '/' : `${path}/`;
  const siteName = path === '/remote-schools'
    ? 'Remote Schools'
    : path === '/droplink'
      ? 'DropLink'
    : path.startsWith('/bluebird')
      ? 'Bluebird'
      : 'Nobert';
  return readFileSync(builtIndex, 'utf8')
    .replace('<title>Nobert Lamn — Android and web developer</title>', `<title>${title}</title>`)
    .replace('content="Android and web software by Nobert Lamn: DropLink, Bluebird, Remote Schools Uganda, and AubreeKit."', `content="${description}"`)
    .replace('content="Nobert Lamn — Android and web developer"', `content="${title}"`)
    .replace('content="Android and web software by Nobert Lamn: DropLink, Bluebird, Remote Schools Uganda, and AubreeKit."', `content="${description}"`)
    .replace('content="Nobert Lamn" />', `content="${siteName}" />`)
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