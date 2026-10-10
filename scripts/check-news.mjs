import assert from 'node:assert/strict';
import fs from 'node:fs';

const path = process.argv[2] || 'news/latest.json';
const raw = fs.readFileSync(path, 'utf8');
assert(Buffer.byteLength(raw) <= 200_000, 'News feed must remain below 200 KB');
const feed = JSON.parse(raw);
const today = new Intl.DateTimeFormat('en-CA', {timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const categories = ['recruitment','education','investment','robotics'];
const text = (v, max) => typeof v === 'string' && v.trim().length > 0 && v.length <= max && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v);
const checked = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v) && Number.isFinite(Date.parse(v)) && Date.parse(v) <= Date.now()+300_000;
assert.equal(feed.schemaVersion, 1);
assert(checked(feed.checkedAt), 'Invalid feed verification time');
assert.deepEqual(Object.keys(feed.sections).sort(), [...categories].sort());
const ids = new Set();
for (const category of categories) {
  const section = feed.sections[category];
  assert(checked(section.checkedAt), category+': invalid verification time');
  assert(Array.isArray(section.items) && section.items.length <= 12, category+': invalid items');
  const urls = new Set();
  let previous = '9999-99-99';
  for (const item of section.items) {
    assert(text(item.id,120) && /^[a-z0-9][a-z0-9-]*$/.test(item.id) && !ids.has(item.id), 'Invalid/duplicate item ID'); ids.add(item.id);
    assert(text(item.publisher,160));
    assert(/^\d{4}-\d{2}-\d{2}$/.test(item.publishedOn));
    assert.equal(new Date(item.publishedOn+'T12:00:00Z').toISOString().slice(0,10),item.publishedOn);
    assert(item.publishedOn <= today, 'Future publication date');
    assert(item.publishedOn <= previous, category+': newest first'); previous=item.publishedOn;
    assert(text(item.url,2048) && !/[\\\u0000-\u0020\u007f]/.test(item.url));
    const url=new URL(item.url);
    assert(url.protocol==='https:' && !url.username && !url.password && !url.port && url.hostname.includes('.') && !urls.has(url.href), 'Unsafe/duplicate source URL'); urls.add(url.href);
    for (const lang of ['tr','en']) {
      assert(text(item.title?.[lang],240), 'Invalid bilingual headline');
      assert(text(item.summary?.[lang],1000), 'Invalid bilingual summary');
      assert(item.summary[lang].trim().split(/\s+/u).length<=35, 'Summary exceeds 35 words');
    }
  }
}
console.log(`PASS: verified news structure, dates, source URLs, bilingual summaries and ordering (${ids.size} stories).`);
