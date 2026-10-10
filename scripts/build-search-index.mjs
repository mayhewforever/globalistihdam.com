#!/usr/bin/env node
/** Rebuild the public bilingual search index from the deployed page metadata. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const shell = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const bundleName = shell.match(/assets\/index-[\w-]+\.js/)?.[0];
assert.ok(bundleName, 'Could not identify the application bundle in index.html');
const bundleFile = path.join(root, bundleName);
const bundle = fs.readFileSync(bundleFile, 'utf8');
const marker = bundle.lastIndexOf('// Static hosting adapter');
const adapterStart = marker >= 0 ? marker : bundle.lastIndexOf('var $i=');
assert.ok(adapterStart > 0, 'Could not isolate the public page definitions');

// Only public data and metadata functions run. No DOM rendering, network,
// account state, submissions or server records are read into this index.
const context = vm.createContext({
  document: { createElement: () => ({ relList: { supports: () => true } }) },
  location: { pathname: '/', search: '', hash: '' },
  localStorage: { getItem: () => null },
  console, URL, URLSearchParams, setTimeout, clearTimeout,
  fetch() { throw new Error('Search index generation cannot access the network'); },
});
vm.runInContext(fs.readFileSync(path.join(root, 'assets/hosting-runtime.js'), 'utf8'), context,
  { timeout: 1_000, filename: 'assets/hosting-runtime.js' });
vm.runInContext(bundle.slice(0, adapterStart), context, { timeout: 10_000, filename: bundleName });

const directories = vm.runInContext(`({
  education: Si, sectors: qi, investment: zi, countries: ze, insights: ot, privacy: Ct,
})`, context);
const details = vm.runInContext(`({
  education: { entries: Ne, page: Ai, param: 'country' },
  sectors: { entries: Ke, page: Xi, param: 'sector' },
  investment: { entries: Se, page: Ui, param: 'country' },
  universities: { entries: Pe, page: Mi, param: 'slug' },
})`, context);

const corporate = {
  tr: {
    title: 'Kurumsal',
    description: 'Globalistihdam’ın istihdam, eğitim ve yatırım danışmanlığı hizmetleri hakkında bilgi.',
  },
  en: {
    title: 'About Globalistihdam',
    description: 'Information about Globalistihdam’s recruitment, education and investment advisory services.',
  },
};
const contact = {
  tr: {
    title: 'İletişim',
    description: 'Globalistihdam’ın telefon ve adres bilgileri; hizmetler hakkında görüşme seçenekleri.',
  },
  en: {
    title: 'Contact',
    description: 'Globalistihdam’s telephone and address details, with ways to discuss its services.',
  },
};

function cleanText(value) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
}

function nodeText(node) {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join(' ');
  return node?.props ? nodeText(node.props.children) : '';
}

function firstParagraph(node) {
  if (Array.isArray(node)) return node.map(firstParagraph).find(Boolean) || '';
  if (!node?.props) return '';
  if (node.type === 'p' && !/(?:kicker|eyebrow)/.test(node.props.className || '')) {
    const text = cleanText(nodeText(node.props.children));
    if (text) return text;
  }
  return firstParagraph(node.props.children);
}

async function metadataFor(page, input) {
  const metadata = await page.generateMetadata(input);
  // The privacy page deliberately omits a search-engine description. Use its
  // existing visible introduction for the site's own search instead.
  return cleanText(metadata.description) ? metadata
    : { ...metadata, description: firstParagraph(await page.default(input)) };
}

function entry(metadata, publicPath) {
  const title = cleanText(metadata.title)
    .replace(/\s+\|\s+Globalistihdam(?: Recruitment&Investment Agency)?$/, '');
  const description = cleanText(metadata.description);
  assert.ok(title && description, `Missing search text: ${publicPath}`);
  assert.ok(!/\b(?:undefined|null)\b/.test(title + ' ' + description), `Invalid search text: ${publicPath}`);
  assert.ok(publicPath.startsWith('/'), `Search target must be root-relative: ${publicPath}`);
  const pathname = publicPath.split(/[?#]/, 1)[0];
  assert.ok(fs.existsSync(path.join(root, pathname, 'index.html')), `Missing search target: ${publicPath}`);
  return { title, description, path: publicPath };
}

async function build() {
  const output = { tr: [], en: [] };
  for (const lang of Object.keys(output)) {
    for (const [route, page] of Object.entries(directories)) {
      const metadata = await metadataFor(page, {
        params: Promise.resolve({}), searchParams: Promise.resolve({ lang }),
      });
      output[lang].push(entry(metadata, `/${route}/?lang=${lang}`));
    }
    output[lang].push(entry(corporate[lang], `/#${lang}/corporate`));
    output[lang].push(entry(contact[lang], `/#${lang}/contact`));
    for (const [family, { entries, page, param }] of Object.entries(details)) {
      for (const item of entries) {
        const metadata = await metadataFor(page, {
          params: Promise.resolve({ [param]: item.slug }), searchParams: Promise.resolve({ lang }),
        });
        output[lang].push(entry(metadata, `/${family}/${item.slug}/?lang=${lang}`));
      }
    }
    assert.equal(new Set(output[lang].map(item => item.path)).size, output[lang].length,
      `Duplicate search targets in ${lang}`);
  }
  assert.equal(output.tr.length, output.en.length, 'Language indexes have different coverage');
  const destination = path.join(root, 'search-index.json');
  fs.writeFileSync(destination, JSON.stringify(output, null, 2) + '\n');
  console.log(`Built search-index.json: ${output.tr.length} Turkish + ${output.en.length} English entries.`);
}

build().catch(error => {
  console.error(`Search index build failed: ${error.message}`);
  process.exitCode = 1;
});
