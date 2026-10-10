#!/usr/bin/env node
/* Offline rendering/security checks. No source website or applicant data is fetched. */
import { Window } from 'happy-dom';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const root = new URL('../', import.meta.url);
const runtime = await fs.readFile(new URL('assets/hosting-runtime.js', root), 'utf8');
const newsUI = await fs.readFile(new URL('assets/latest-news.js', root), 'utf8');
const remote = 'https://raw.githubusercontent.com/mayhewforever/globalistihdam.com/main/news/latest.json';
const keys = ['recruitment', 'education', 'investment', 'robotics'];
const pause = () => new Promise(resolve => setTimeout(resolve, 30));
let checks = 0;
const check = (actual, expected, message) => { assert.deepEqual(actual, expected, message); checks++; };
function edition({ stale = false, count = 4 } = {}) {
  const checkedAt = new Date(Date.now() - (stale ? 72 * 3_600_000 : 60_000)).toISOString();
  return { schemaVersion: 1, checkedAt, sections: Object.fromEntries(keys.map(key => [key, { checkedAt,
    items: Array.from({ length: count }, (_, index) => ({ id: key + '-' + index, publishedOn: new Date(Date.now() - index * 86_400_000).toISOString().slice(0, 10), publisher: 'Official source', url: 'https://source.example/' + key + '/' + index,
      title: { tr: 'Doğrulanmış haber ' + index, en: index === 0 ? '<img id="injected-news" src=x onerror=alert(1)>' : 'Verified update ' + index },
      summary: { tr: 'Kısa haber özeti.', en: '<svg onload=alert(1)>A short summary.</svg>' } })) }])) };
}
async function open(path, { remoteData = edition(), localData = edition(), remoteResponse } = {}) {
  const win = new Window({ url: 'https://example.test' + path, settings: { disableJavaScriptFileLoading: true, disableCSSFileLoading: true, enableJavaScriptEvaluation: true, suppressInsecureJavaScriptEnvironmentWarning: true } });
  const requests = [];
  const errors = [];
  win.console.error = (...parts) => errors.push(parts.join(' '));
  win.fetch = async (url, options) => {
    requests.push({ url, options });
    if (url === remote && remoteResponse) return remoteResponse;
    const data = url === remote ? remoteData : localData;
    if (data instanceof Error) throw data;
    return { ok: true, headers: { get: () => null }, text: async () => JSON.stringify(data) };
  };
  win.document.body.innerHTML = '<div id="root" class="public-root"><main id="main"><h1>Existing title</h1><section id="existing-banner">Existing banner</section></main><footer>Existing footer</footer></div>';
  win.eval(runtime);
  win.eval(newsUI);
  await pause();
  return { win, requests, errors };
}
for (const base of ['/', '/globalistihdam.com/']) {
  const { win, requests, errors } = await open(base + '?lang=en');
  check(win.document.querySelectorAll('#gi-latest-news').length, 1, 'One news mount');
  check(win.document.querySelectorAll('.gi-news-group').length, 4);
  check(win.document.querySelectorAll('.gi-news-story').length, 12, 'Three stories per section');
  check(win.document.querySelectorAll('h1').length, 1, 'Preserve original title hierarchy');
  check(Boolean(win.document.querySelector('#existing-banner')), true, 'Preserve banners');
  check(win.document.querySelector('#gi-news-title').textContent, 'Latest News');
  check(win.document.querySelector('.gi-news-story-title').textContent, '<img id="injected-news" src=x onerror=alert(1)>');
  check(win.document.querySelectorAll('#injected-news,.gi-news img,.gi-news svg,.gi-news script').length, 0, 'News text must never become HTML');
  check(requests.length, 1);
  check(requests[0].url, remote);
  check(requests[0].options.credentials, 'omit');
  check(requests[0].options.referrerPolicy, 'no-referrer');
  check(requests[0].options.cache, 'no-store');
  for (const link of win.document.querySelectorAll('.gi-news-source')) {
    check(new URL(link.href).origin, 'https://source.example');
    check(link.rel, 'noopener noreferrer');
  }
  check(win.document.querySelectorAll('.gi-news-stale').length, 0);
  check(win.document.querySelectorAll('.gi-news-meta time[datetime]').length, 12);
  win.document.querySelector('main').innerHTML = '<h1>Rendered again</h1>';
  await pause();
  check(win.document.querySelectorAll('#gi-latest-news').length, 1, 'Remount after page render');
  check(requests.length, 1, 'Language and rerenders must not cause repeated fetches');
  win.location.hash = '#tr/home';
  win.dispatchEvent(new win.CustomEvent('globalistihdam:language'));
  await pause();
  check(win.document.querySelector('#gi-news-title').textContent, 'Güncel Haberler');
  check(win.document.querySelector('.gi-news-story-title').textContent, 'Doğrulanmış haber 0');
  win.location.hash = '#en/contact'; await pause();
  check(win.document.querySelector('#gi-latest-news'), null, 'No news on contact');
  win.location.hash = '#en/education'; await pause();
  check([...win.document.querySelectorAll('[data-news-section]')].map(node => node.dataset.newsSection), ['education']);
  check(requests.length, 1);
  check(errors, []);
  await win.happyDOM.close();
}
for (const [path, selected] of [
  ['/countries/', keys], ['/insights/', keys], ['/education/canada/', ['education']],
  ['/universities/coventry-university/', ['education']], ['/investment/canada/', ['investment']],
  ['/sectors/manufacturing/', ['recruitment']], ['/robotics/', ['robotics']],
  ['/privacy/', []], ['/portal/', []], ['/admin/', []], ['/#en/candidate', []], ['/#en/employer', []], ['/#en/corporate', []],
]) {
  for (const prefix of ['', '/globalistihdam.com']) {
    const { win, requests } = await open(prefix + path);
    check([...win.document.querySelectorAll('[data-news-section]')].map(node => node.dataset.newsSection), selected, path);
    check(requests.length, selected.length ? 1 : 0, 'Do not fetch on excluded routes');
    await win.happyDOM.close();
  }
}
{
  const { win, requests } = await open('/?lang=en', { remoteData: new Error('Offline'), localData: edition({ stale: true }) });
  check(requests.map(request => request.url), [remote, '/news/latest.json']);
  check(win.document.querySelector('.gi-news-status').textContent, 'The current feed is unavailable. Showing the saved edition.');
  check(win.document.querySelectorAll('.gi-news-stale').length, 4);
  await win.happyDOM.close();
}
{
  const { win } = await open('/?lang=en', { remoteData: new Error('Offline'), localData: new Error('Unavailable') });
  check(win.document.querySelectorAll('.gi-news-story').length, 0);
  check(win.document.querySelector('.gi-news-status').textContent, 'News is unavailable right now. Please try again later.');
  await win.happyDOM.close();
}
const invalidFeeds = [];
for (const url of ['javascript:alert(1)', 'data:text/html,unsafe', '//evil.example/', 'http://source.example/', 'https://user:pass@source.example/', 'https://source.example:8443/', 'https://source.example:443/', 'https://source.example/\\unsafe', 'https://source.example/%0Aunsafe']) {
  const data = edition(); data.sections.recruitment.items[0].url = url; invalidFeeds.push(data);
}
for (const mutate of [
  data => { data.checkedAt = new Date(Date.now() + 600_000).toISOString(); },
  data => { data.sections.education.checkedAt = '2026-02-31T12:00:00Z'; },
  data => { data.sections.investment.items[0].publishedOn = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10); },
  data => { data.sections.robotics.items[0].publishedOn = '2026-02-31'; },
  data => { data.sections.recruitment.items[0].title.en = null; },
  data => { data.sections.education.items[0].summary.tr = 'x'.repeat(1001); },
  data => { data.sections.investment.items.push(data.sections.investment.items[0]); },
  data => { delete data.sections.robotics; },
  data => { data.sections.unexpected = {}; },
  data => { data.schemaVersion = 2; },
]) { const data = edition(); mutate(data); invalidFeeds.push(data); }
invalidFeeds.push(edition({ count: 13 }));
for (const data of invalidFeeds) {
  const { win, requests } = await open('/?lang=en', { remoteData: data, localData: edition({ count: 1 }) });
  check(requests.length, 2, 'Reject the whole invalid remote edition and fall back');
  check(win.document.querySelectorAll('.gi-news-story').length, 4);
  check(Boolean(win.document.querySelector('.gi-news-status')), true);
  await win.happyDOM.close();
}
{
  let cancelled = false;
  const { win, requests } = await open('/?lang=en', { remoteResponse: { ok: true, headers: { get: () => null }, body: { getReader: () => ({ read: async () => ({ done: false, value: new Uint8Array(200_001) }), cancel: async () => { cancelled = true; } }) } } });
  check(cancelled, true, 'Stop oversized streaming response');
  check(requests.length, 2);
  check(Boolean(win.document.querySelector('.gi-news-status')), true);
  await win.happyDOM.close();
}
console.log('PASS', checks, 'offline news rendering, fallback, routing and security checks.');
