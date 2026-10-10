#!/usr/bin/env node
/* Regenerate policy hashes after editing an inline script in a route shell. */
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function htmlFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (entry.name === '.git' || entry.name === 'node_modules') return [];
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? htmlFiles(filename) : filename.endsWith('.html') ? [filename] : [];
  });
}
let count = 0;
for (const filename of htmlFiles(root)) {
  let html = fs.readFileSync(filename, 'utf8');
  html = html.replace(/^\s*<meta\b[^>]*(?:http-equiv="Content-Security-Policy"|name="referrer")[^>]*>\r?\n/gmi, '');
  const hashes = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)]
    .filter(match => !/\bsrc\s*=/.test(match[1]))
    .map(match => "'sha256-" + createHash('sha256').update(match[2]).digest('base64') + "'");
  const policy = [
    "default-src 'self'",
    "script-src 'self' " + [...new Set(hashes)].join(' '),
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self'",
    "font-src 'self'",
    "connect-src 'self' https://raw.githubusercontent.com",
    "object-src 'none'",
    "base-uri 'none'",
    "frame-src 'none'",
    "form-action 'self' https://global-istihdam.mtoman.chatgpt.site",
  ].join('; ');
  const metadata = '\n  <meta http-equiv="Content-Security-Policy" content="' + policy + '">'
    + '\n  <meta name="referrer" content="strict-origin-when-cross-origin">';
  if (!/<meta charset="UTF-8">/.test(html)) throw new Error('Missing charset anchor: ' + filename);
  fs.writeFileSync(filename, html.replace('<meta charset="UTF-8">', '<meta charset="UTF-8">' + metadata));
  count++;
}
console.log('Updated security policy hashes in', count, 'HTML shells.');
