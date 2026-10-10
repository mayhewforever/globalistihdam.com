#!/usr/bin/env node
/**
 * Offline checks for this static export. Run from any directory with:
 *   node scripts/check-site.mjs
 * These checks execute page constructors, not a browser or external services.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const projectBase = '/globalistihdam.com/';
let checks = 0;
const checkedAssets = new Set();
const checkedExternalLinks = new Set();
const runtimeFile = path.join(root, 'assets/hosting-runtime.js');

function check(condition, message) {
  assert.ok(condition, message);
  checks += 1;
}

function filesIn(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (entry.name === '.git' || entry.name === 'node_modules') return [];
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(filename) : [filename];
  });
}

function localFile(href, from = path.join(root, 'index.html')) {
  const clean = decodeURIComponent(href.split(/[?#]/, 1)[0]);
  const relative = clean.startsWith(projectBase) ? clean.slice(projectBase.length)
    : clean.startsWith('/') ? clean.slice(1) : null;
  const filename = relative === null ? path.resolve(path.dirname(from), clean) : path.resolve(root, relative);
  check(filename === root || filename.startsWith(root + path.sep), `Path escapes the site: ${href}`);
  return filename;
}

function checkAsset(href, from) {
  if (/^(?:https?:|data:|blob:|\/\/)/.test(href)) return;
  const filename = localFile(href, from);
  check(fs.existsSync(filename) && fs.statSync(filename).isFile(), `Missing asset: ${href}`);
  checkedAssets.add(path.relative(root, filename));
}

function checkLink(href, description) {
  if (!href || href.startsWith('#')) return;
  if (/^(?:https?:)?\/\//.test(href)) {
    const url = new URL(href.startsWith('//') ? 'https:' + href : href);
    check(['https:', 'http:'].includes(url.protocol) && Boolean(url.hostname), `Invalid URL in ${description}: ${href}`);
    check(!/\s/.test(href), `Unencoded whitespace in URL in ${description}: ${href}`);
    checkedExternalLinks.add(href);
    return;
  }
  if (/^(?:mailto:|tel:)/.test(href)) return;
  if (/^\/(?:portal|admin|api|robotics)(?:[/?#]|$)/.test(href)) return;
  const filename = localFile(href);
  check(fs.existsSync(filename), `Missing link target in ${description}: ${href}`);
  if (fs.statSync(filename).isDirectory()) {
    check(fs.existsSync(path.join(filename, 'index.html')), `Missing route shell in ${description}: ${href}`);
  }
}

function checkPublishedContact(value, description) {
  check(!/(?:\+?90[\s().-]*)?533[\s().-]*924[\s().-]*75[\s().-]*19/.test(value), `Published company phone in ${description}`);
  check(!/tel:\+?\d/i.test(value), `Published telephone link in ${description}`);
  check(!/wa\.me\//i.test(value), `Public WhatsApp links must use the number-free server redirect in ${description}`);
}

function checkDataLinks(value, description, seen = new Set()) {
  if (typeof value === 'string') {
    checkPublishedContact(value, description);
    if (/^https?:\/\//.test(value)) checkLink(value, description);
    return;
  }
  if (!value || typeof value !== 'object' || seen.has(value)) return;
  seen.add(value);
  for (const [key, child] of Object.entries(value)) {
    if ((key === 'href' || key === 'src') && typeof child === 'string') {
      checkLink(child, description);
    } else {
      checkDataLinks(child, description, seen);
    }
  }
}

function runtimeContext({ pathname = '/', search = '', hash = '', saved = null, storageThrows = false } = {}) {
  const context = vm.createContext({
    location: { pathname, search, hash }, URL, URLSearchParams,
    localStorage: { getItem() { if (storageThrows) throw new Error('Storage disabled'); return saved; } },
    document: { createElement: () => ({ relList: { supports: () => true } }) },
    console, setTimeout, clearTimeout,
    fetch() { throw new Error('Network calls are forbidden in the offline checker'); },
  });
  vm.runInContext(fs.readFileSync(runtimeFile, 'utf8'), context, { timeout: 1_000, filename: runtimeFile });
  return context;
}

function checkRuntime() {
  for (const base of ['/', projectBase]) {
    const runtime = runtimeContext({ pathname: base }).GlobalistihdamRuntime;
    check(runtime.base === base, `Wrong detected base for ${base}`);
    for (const route of ['', 'education', 'education/germany', 'universities/manitoba', 'not-a-page']) {
      const expected = route ? '/' + route : '/';
      const variants = route ? [route, route + '/', route + '/index.html'] : ['', 'index.html'];
      for (const variant of variants) {
        check(runtime.path(base + variant) === expected, `Incorrect normalised path: ${base + variant}`);
      }
    }
    for (const [input, suffix] of [
      ['/', ''], ['/education', 'education/'], ['/education?lang=en#market-data', 'education/?lang=en#market-data'],
      ['/education/', 'education/'], ['/education/index.html?lang=tr', 'education/index.html?lang=tr'],
      ['/social.json', 'social.json'], ['/country-canada.jpg', 'country-canada.jpg'],
      ['/#en/home', '#en/home'],
    ]) {
      const output = runtime.url(input);
      check(output === base + suffix, `Incorrect URL conversion under ${base}: ${input}`);
      check(runtime.url(output) === output, `URL conversion is not idempotent: ${output}`);
    }
    for (const value of ['#contact', 'https://example.org/page', '//example.org/image.png', 'tel:+905339247519', 'mailto:info@example.org', 'relative.png', '', null]) {
      check(runtime.url(value) === value, `Unexpected rewrite of ${value}`);
    }
    for (const route of ['/portal?type=student&lang=en', '/admin?lang=tr', '/api/social', '/robotics?lang=en#details']) {
      check(runtime.url(route) === runtime.portalOrigin + route, `Portal route did not use the portal origin: ${route}`);
    }
  }
  for (const [configuration, expected] of [
    [{}, 'tr'], [{ saved: 'en' }, 'en'], [{ saved: 'unsupported' }, 'tr'],
    [{ search: '?lang=tr', saved: 'en' }, 'tr'], [{ search: '?lang=en', saved: 'tr' }, 'en'],
    [{ search: '?lang=invalid', saved: 'en' }, 'en'],
    [{ hash: '#tr/contact', search: '?lang=en', saved: 'en' }, 'tr'],
    [{ hash: '#en/home', search: '?lang=tr', saved: 'tr' }, 'en'],
    [{ hash: '#market-data', search: '?lang=en' }, 'en'],
    [{ storageThrows: true }, 'tr'], [{ storageThrows: true, search: '?lang=en' }, 'en'],
    [{ saved: '<img src=x onerror=alert(1)>', search: '?lang=javascript%3Aalert(1)', hash: '#evil/home' }, 'tr'],
  ]) {
    check(runtimeContext(configuration).GlobalistihdamRuntime.language() === expected,
      `Incorrect language precedence: ${JSON.stringify(configuration)}`);
  }
  check(runtimeContext({ pathname: projectBase.slice(0, -1) }).GlobalistihdamRuntime.path() === '/', 'Project root without a slash must resolve');
  check(runtimeContext({ pathname: '/globalistihdam.comic/' }).GlobalistihdamRuntime.base === '/', 'Project prefix must match a full path segment');
  const runtime = runtimeContext().GlobalistihdamRuntime;
  const configured = JSON.parse(fs.readFileSync(path.join(root, 'social.json'), 'utf8')).links;
  for (const [platform, href] of Object.entries(configured)) {
    if (href) check(runtime.socialLinks(configured)[platform] === href, `Existing social URL must remain available: ${platform}`);
  }
  for (const [platform, href] of [
    ['instagram', 'javascript:alert(1)'], ['youtube', 'data:text/html,unsafe'],
    ['tiktok', '//www.tiktok.com/profile'], ['instagram', 'http://www.instagram.com/globalistihdam/'],
    ['youtube', 'https://youtube.com.evil.test/channel'], ['youtube', 'https://www.youtube.com@evil.test/channel'],
    ['youtube', 'https://user:password@www.youtube.com/channel'], ['youtube', 'https://www.youtube.com:8443/channel'],
    ['youtube', 'https://www.youtube.com\\@evil.test/channel'], ['youtube', 'https://www.you\ntube.com/channel'],
    ['unknown', 'https://www.youtube.com/channel'], ['youtube', { toString: () => 'https://www.youtube.com/channel' }],
  ]) {
    check(Object.keys(runtime.socialLinks({ [platform]: href })).length === 0, `Unsafe social configuration accepted: ${platform}`);
  }
  check(Object.keys(runtime.socialLinks(null)).length === 0, 'Null social configuration must fail closed');
}

async function main() {
  checkRuntime();
  const htmlFiles = filesIn(root).filter(filename => filename.endsWith('.html'));
  check(htmlFiles.length > 1, 'No route shells found');
  check(fs.existsSync(path.join(root, '404.html')), 'Missing GitHub Pages fallback');
  const moduleFiles = new Set();
  const referencedFiles = new Set();
  for (const filename of htmlFiles) {
    const html = fs.readFileSync(filename, 'utf8');
    checkPublishedContact(html, filename);
    check(/<div\b[^>]*\bid=["']root["']/.test(html), `Missing application mount: ${filename}`);
    const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)];
    check(scripts.length > 0, `Missing boot script: ${filename}`);
    const policyTags = [...html.matchAll(/<meta\b[^>]*http-equiv="Content-Security-Policy"[^>]*content="([^"]+)"[^>]*>/g)];
    check(policyTags.length === 1, `Expected one Content Security Policy: ${filename}`);
    check(policyTags[0].index < html.indexOf('<script'), `Policy must precede executable content: ${filename}`);
    const directives = new Map(policyTags[0][1].split(';').map(part => {
      const [name, ...values] = part.trim().split(/\s+/); return [name, values];
    }));
    const scriptPolicy = directives.get('script-src') || [];
    check(scriptPolicy.includes("'self'") && !scriptPolicy.includes("'unsafe-inline'") && !scriptPolicy.includes("'unsafe-eval'"), `Unsafe script policy: ${filename}`);
    const inlineHashes = scripts.filter(match => !/\bsrc\s*=/.test(match[1]))
      .map(match => "'sha256-" + createHash('sha256').update(match[2]).digest('base64') + "'");
    assert.deepEqual([...new Set(scriptPolicy.filter(value => value !== "'self'"))].sort(), [...new Set(inlineHashes)].sort(), `Stale bootstrap hashes; run node scripts/update-security-policy.mjs: ${filename}`); checks++;
    for (const [name, expected] of Object.entries({ 'default-src': ["'self'"], 'object-src': ["'none'"], 'base-uri': ["'none'"], 'connect-src': ["'self'", 'https://raw.githubusercontent.com'], 'form-action': ["'self'", 'https://global-istihdam.mtoman.chatgpt.site'] })) {
      assert.deepEqual(directives.get(name), expected, `Unexpected ${name} policy: ${filename}`); checks++;
    }
    check(!directives.has('frame-ancestors'), `frame-ancestors is unsupported in meta policy: ${filename}`);
    check(/<meta name="referrer" content="strict-origin-when-cross-origin">/.test(html), `Missing referrer policy: ${filename}`);
    for (const match of scripts) {
      const src = /\bsrc=["']([^"']+)["']/.exec(match[1])?.[1];
      if (src) {
        checkAsset(src, filename);
        referencedFiles.add(localFile(src, filename));
        if (/\btype=["']module["']/.test(match[1])) moduleFiles.add(localFile(src, filename));
      } else if (/\btype=["']module["']/.test(match[1])) {
        const imports = [...match[2].matchAll(/import\(window\.__GLOBALISTIHDAM_BASE__\s*\+\s*["']([^"']+)["']\)/g)];
        check(imports.length >= 2, `Missing runtime/application imports: ${filename}`);
        check(imports[0][1] === 'assets/hosting-runtime.js', `Runtime must load before the application: ${filename}`);
        for (const imported of imports) {
          const href = '/' + imported[1];
          checkAsset(href);
          referencedFiles.add(localFile(href));
          if (/^assets\/index-[\w-]+\.js$/.test(imported[1])) moduleFiles.add(localFile(href));
        }
      } else {
        // Execute each portable shell's actual base/stylesheet/favicon setup
        // against both supported deployment paths using a minimal document.
        for (const base of ['/', projectBase]) {
          const inserted = [];
          const shell = {
            location: { pathname: base + path.relative(root, filename) },
            document: { createElement: () => ({}), head: { appendChild: node => inserted.push(node) } },
          };
          shell.window = shell;
          vm.runInNewContext(match[2], shell, { timeout: 1_000, filename });
          check(shell.__GLOBALISTIHDAM_BASE__ === base, `Incorrect shell base in ${filename}`);
          check(inserted.some(node => node.rel === 'stylesheet'), `Missing stylesheet in ${filename}`);
          check(inserted.some(node => node.rel === 'icon'), `Missing favicon in ${filename}`);
          for (const node of inserted) {
            checkAsset(node.href);
            referencedFiles.add(localFile(node.href));
          }
        }
      }
    }
    for (const match of html.matchAll(/<link\b[^>]*\bhref=["']([^"']+)["'][^>]*>/g)) {
      if (/^(?:https?:|\/\/)/.test(match[1])) continue;
      checkAsset(match[1], filename);
      referencedFiles.add(localFile(match[1], filename));
    }
  }
  check(moduleFiles.size === 1, 'Route shells must share one application bundle');
  const [bundleFile] = moduleFiles;
  const bundle = fs.readFileSync(bundleFile, 'utf8');
  const marker = bundle.lastIndexOf('// Static hosting adapter');
  const oldAdapter = bundle.lastIndexOf('var $i=');
  const adapterStart = marker >= 0 ? marker : oldAdapter;
  check(adapterStart > 0, 'Could not isolate page definitions from the static hosting adapter');

  // The preload polyfill exits immediately. React sees no window, so no DOM or
  // network activity runs while the data and page functions are evaluated.
  const context = runtimeContext();
  vm.runInContext(bundle.slice(0, adapterStart), context, { timeout: 10_000, filename: bundleFile });
  const definitions = vm.runInContext(`({
    investment: { entries: Se, page: Ui, param: 'country' },
    education: { entries: Ne, page: Ai, param: 'country' },
    universities: { entries: Pe, page: Mi, param: 'slug' },
    sectors: { entries: Ke, page: Xi, param: 'sector' },
  })`, context);
  const directories = vm.runInContext(`({ countries: ze, insights: ot, privacy: Ct, education: Si, sectors: qi, investment: zi })`, context);
  let detailPages = 0;
  let pageRenders = 0;
  for (const [family, { entries, page, param }] of Object.entries(definitions)) {
    const slugs = Array.from(entries, entry => entry.slug);
    check(new Set(slugs).size === slugs.length, `Duplicate ${family} slugs`);
    const onDisk = fs.readdirSync(path.join(root, family), { withFileTypes: true })
      .filter(entry => entry.isDirectory()).map(entry => entry.name).sort();
    assert.deepEqual([...slugs].sort(), onDisk, `${family} route data does not match static folders`);
    checks += 1;
    detailPages += slugs.length;
    checkDataLinks(entries, `${family} data`);
    for (const slug of slugs) {
      check(fs.existsSync(path.join(root, family, slug, 'index.html')), `Missing ${family}/${slug} shell`);
      for (const lang of ['tr', 'en']) {
        const input = { params: Promise.resolve({ [param]: slug }), searchParams: Promise.resolve({ lang }) };
        const metadata = await page.generateMetadata(input);
        checkDataLinks(metadata, `${family}/${slug} metadata (${lang})`);
        const tree = await page.default(input);
        check(typeof metadata?.title === 'string' && metadata.title.length > 0, `Missing title: ${family}/${slug} (${lang})`);
        check(Boolean(tree?.props), `Empty page: ${family}/${slug} (${lang})`);
        checkDataLinks(tree, `${family}/${slug} (${lang})`);
        pageRenders += 1;
      }
    }
    for (const lang of ['tr', 'en']) {
      await assert.rejects(page.default({
        params: Promise.resolve({ [param]: '__missing-route__' }),
        searchParams: Promise.resolve({ lang }),
      }), /PAGE_NOT_FOUND/, `Unknown ${family} routes must fail safely (${lang})`);
      checks += 1;
    }
  }
  const educationSlugs = new Set(Array.from(definitions.education.entries, entry => entry.slug));
  for (const university of definitions.universities.entries) {
    check(educationSlugs.has(university.country), `Unknown destination for ${university.slug}: ${university.country}`);
  }
  for (const [route, page] of Object.entries(directories)) {
    for (const lang of ['tr', 'en']) {
      const input = { params: Promise.resolve({}), searchParams: Promise.resolve({ lang }) };
      const metadata = await page.generateMetadata(input);
      checkDataLinks(metadata, `${route} metadata (${lang})`);
      const tree = await page.default(input);
      check(Boolean(metadata?.title && tree?.props), `Empty directory: ${route} (${lang})`);
      checkDataLinks(tree, `${route} (${lang})`);
      pageRenders += 1;
    }
  }

  // Check literal local file references in active scripts and CSS, including
  // assets that are rendered by a component after page construction.
  const activeScripts = [...new Set([bundleFile, path.join(root, 'site.js'), ...[...referencedFiles].filter(filename => filename.endsWith('.js'))])];
  for (const filename of activeScripts) {
    const content = fs.readFileSync(filename, 'utf8');
    checkPublishedContact(content, filename);
    const references = content.matchAll(/["'`]((?:\/|\.\.?\/)[^"'`$<>\\\s]+\.(?:png|jpe?g|webp|svg|gif|css|js|txt|json))(?:[?#][^"'`\s]*)?["'`]/g);
    for (const match of references) checkAsset(match[1], filename);
  }
  for (const filename of [...referencedFiles].filter(filename => filename.endsWith('.css'))) {
    const css = fs.readFileSync(filename, 'utf8');
    for (const match of css.matchAll(/url\(\s*["']?([^)'"\s]+)["']?\s*\)/g)) {
      checkAsset(match[1], filename);
    }
  }
  checkDataLinks(JSON.parse(fs.readFileSync(path.join(root, 'search-index.json'), 'utf8')), 'search directory');
  const social = JSON.parse(fs.readFileSync(path.join(root, 'social.json'), 'utf8'));
  check(social.links && typeof social.links === 'object', 'Invalid social.json');
  checkDataLinks(social, 'social.json');
  console.log(`PASS: ${checks} checks; ${htmlFiles.length} HTML shells; ${detailPages} detail routes; ${pageRenders} TR/EN page constructors; ${checkedAssets.size} local assets; ${checkedExternalLinks.size} external URLs validated for syntax.`);
  console.log('External availability, portal submissions, layout and interactive behaviour require separate browser checks.');
}

main().catch(error => {
  console.error(`FAIL: ${error.message}`);
  process.exitCode = 1;
});
