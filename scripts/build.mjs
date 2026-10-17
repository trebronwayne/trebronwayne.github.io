import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';

const template = Buffer.from(readFileSync('site.template.b64', 'utf8').trim(), 'base64')
  .toString('utf8')
  .replace('content="assets/img/screenshots/desktop.png"', 'content="https://trebronwayne.github.io/assets/img/screenshots/desktop.png"')
  .replace('href="assets/img/logo.png"', 'href="https://trebronwayne.github.io/assets/img/logo.png"');
writeFileSync('index.html', template);

execFileSync('npx', ['vite', 'build'], {
  stdio: 'inherit',
  env: process.env
});

copyFileSync('dist/index.html', 'index.html');