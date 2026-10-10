/* Curated public news: one remote check per page view, with a saved local edition. */
(function () {
  'use strict';
  const runtime = globalThis.GlobalistihdamRuntime;
  if (!runtime) return;
  const remoteFeed = 'https://raw.githubusercontent.com/mayhewforever/globalistihdam.com/main/news/latest.json';
  const categories = ['recruitment', 'education', 'investment', 'robotics'];
  const labels = {
    tr: { title: 'Güncel Haberler', recruitment: 'İstihdam', education: 'Uluslararası Eğitim', investment: 'Yatırım Danışmanlığı', robotics: 'İnsansı Robotlar', loading: 'Haberler yükleniyor…', unavailable: 'Haberler şu anda yüklenemiyor. Lütfen daha sonra tekrar deneyin.', fallback: 'Güncel akışa erişilemiyor. Kayıtlı sürüm gösteriliyor.', checked: 'Son kontrol', stale: 'Son kontrol 48 saatten eski.', empty: 'Bu alanda henüz doğrulanmış bir haber yok.', read: 'Kaynağı okuyun', published: 'Yayın tarihi' },
    en: { title: 'Latest News', recruitment: 'Recruitment', education: 'International Education', investment: 'Investment Advisory', robotics: 'Humanoid Robotics', loading: 'Loading news…', unavailable: 'News is unavailable right now. Please try again later.', fallback: 'The current feed is unavailable. Showing the saved edition.', checked: 'Last checked', stale: 'Last checked more than 48 hours ago.', empty: 'No verified updates in this area yet.', read: 'Read the source', published: 'Published' },
  };
  const byteLimit = 200_000;
  const day = 86_400_000;
  let feed, feedState = 'loading', loadPromise, mount, renderedKey, hashPage = 'home';
  function record(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
  function boundedText(value, limit) {
    return typeof value === 'string' && value.trim().length > 0 && value.length <= limit && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value);
  }
  function calendarDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const stamp = Date.parse(value + 'T00:00:00Z');
    return Number.isFinite(stamp) && new Date(stamp).toISOString().slice(0, 10) === value;
  }
  function checkedDate(value, now) {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
      && calendarDate(value.slice(0, 10)) && Number.isFinite(Date.parse(value)) && Date.parse(value) <= now + 5 * 60_000;
  }
  function sourceURL(value) {
    if (typeof value !== 'string' || value.length > 2048 || !/^https:\/\//i.test(value)) return null;
    try {
      if (/[\\\u0000-\u0020\u007f]/.test(value + decodeURIComponent(value))) return null;
      const authority = value.slice(value.indexOf('//') + 2).split(/[/?#]/, 1)[0];
      const url = new URL(value);
      if (url.protocol !== 'https:' || !url.hostname || url.username || url.password || url.port || authority.includes(':')) return null;
      return url.href;
    } catch (_) { return null; }
  }
  function validateFeed(data) {
    const now = Date.now();
    if (!record(data) || data.schemaVersion !== 1 || !checkedDate(data.checkedAt, now) || !record(data.sections)
      || Object.keys(data.sections).length !== categories.length || !categories.every(key => Object.hasOwn(data.sections, key))) throw new Error('Invalid news edition');
    const clean = { checkedAt: data.checkedAt, sections: {} };
    const today = new Date(now).toISOString().slice(0, 10);
    for (const key of categories) {
      const section = data.sections[key];
      if (!record(section) || !checkedDate(section.checkedAt, now) || !Array.isArray(section.items) || section.items.length > 12) throw new Error('Invalid news section');
      const ids = new Set();
      const items = section.items.map(item => {
        if (!record(item) || !boundedText(item.id, 120) || ids.has(item.id) || !boundedText(item.publisher, 160)
          || !calendarDate(item.publishedOn) || item.publishedOn > today || !record(item.title) || !record(item.summary)
          || !['tr', 'en'].every(lang => boundedText(item.title[lang], 240) && boundedText(item.summary[lang], 1000))) throw new Error('Invalid news item');
        const url = sourceURL(item.url);
        if (!url) throw new Error('Invalid news source');
        ids.add(item.id);
        return { id: item.id, publishedOn: item.publishedOn, publisher: item.publisher, url,
          title: { tr: item.title.tr, en: item.title.en }, summary: { tr: item.summary.tr, en: item.summary.en } };
      });
      clean.sections[key] = { checkedAt: section.checkedAt, items: items.sort((a, b) => b.publishedOn.localeCompare(a.publishedOn)) };
    }
    return clean;
  }
  async function requestFeed(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(url, { cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer', signal: controller.signal });
      if (!response.ok || Number(response.headers?.get('content-length')) > byteLimit) throw new Error('News feed unavailable');
      let text = '';
      if (response.body?.getReader) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let received = 0;
        while (true) {
          const chunk = await reader.read();
          if (chunk.done) break;
          received += chunk.value.byteLength;
          if (received > byteLimit) { await reader.cancel(); throw new Error('News feed too large'); }
          text += decoder.decode(chunk.value, { stream: true });
        }
        text += decoder.decode();
      } else {
        text = await response.text();
        if (new TextEncoder().encode(text).length > byteLimit) throw new Error('News feed too large');
      }
      return validateFeed(JSON.parse(text));
    } finally { clearTimeout(timeout); }
  }
  function load() {
    if (!loadPromise) loadPromise = (async () => {
      try { feed = await requestFeed(remoteFeed); feedState = 'current'; }
      catch (_) {
        try { feed = await requestFeed(runtime.url('/news/latest.json')); feedState = 'saved'; }
        catch (_) { feedState = 'unavailable'; }
      }
      ensureMounted();
    })();
    return loadPromise;
  }
  function visibleCategories() {
    const path = runtime.path();
    if (path === '/') {
      const matched = /^#(?:tr|en)\/([^/?#]+)/.exec(location.hash);
      if (matched) hashPage = matched[1];
      if (['home', 'insights', 'countries'].includes(hashPage)) return categories;
      if (hashPage === 'education') return ['education'];
      if (['sectors', 'employment'].includes(hashPage)) return ['recruitment'];
      if (hashPage === 'investment') return ['investment'];
      if (hashPage === 'robotics') return ['robotics'];
      return [];
    }
    if (/^\/(?:insights|countries)$/.test(path)) return categories;
    if (/^\/(?:education|universities)(?:\/|$)/.test(path)) return ['education'];
    if (/^\/sectors(?:\/|$)/.test(path)) return ['recruitment'];
    if (/^\/investment(?:\/|$)/.test(path)) return ['investment'];
    if (path === '/robotics') return ['robotics'];
    return [];
  }
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function formattedDate(value, lang, includeTime = false) {
    return new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-GB', { dateStyle: 'medium', ...(includeTime ? { timeStyle: 'short' } : {}), timeZone: 'UTC' }).format(new Date(value));
  }
  function render(keys, lang) {
    const copy = labels[lang];
    mount.replaceChildren();
    const inner = element('div', 'gi-news-inner');
    const heading = element('h2', 'gi-title gi-news-title', copy.title);
    heading.id = 'gi-news-title';
    inner.appendChild(heading);
    if (feedState === 'loading' || feedState === 'unavailable' || feedState === 'saved') {
      const message = element('p', 'gi-news-status', copy[feedState === 'saved' ? 'fallback' : feedState]);
      message.setAttribute('role', 'status');
      inner.appendChild(message);
    }
    if (feed) {
      const grid = element('div', 'gi-news-groups');
      grid.dataset.groups = String(keys.length);
      for (const key of keys) {
        const section = feed.sections[key];
        const group = element('section', 'gi-news-group');
        group.dataset.newsSection = key;
        const groupTitle = element('h3', 'gi-news-category', copy[key]);
        groupTitle.id = 'gi-news-' + key;
        group.setAttribute('aria-labelledby', groupTitle.id);
        group.appendChild(groupTitle);
        const checked = element('p', 'gi-news-checked', copy.checked + ': ');
        const checkedTime = element('time', '', formattedDate(section.checkedAt, lang, true) + ' UTC');
        checkedTime.dateTime = section.checkedAt;
        checked.appendChild(checkedTime);
        group.appendChild(checked);
        if (Date.now() - Date.parse(section.checkedAt) > 2 * day) group.appendChild(element('p', 'gi-news-stale', copy.stale));
        if (!section.items.length) group.appendChild(element('p', 'gi-news-empty', copy.empty));
        const list = element('div', 'gi-news-stories');
        for (const story of section.items.slice(0, 3)) {
          const article = element('article', 'gi-news-story');
          const meta = element('p', 'gi-news-meta');
          meta.append(element('span', 'gi-news-publisher', story.publisher), document.createTextNode(' · '));
          const published = element('time', '', formattedDate(story.publishedOn + 'T00:00:00Z', lang));
          published.dateTime = story.publishedOn;
          published.setAttribute('aria-label', copy.published + ': ' + published.textContent);
          meta.appendChild(published);
          const title = element('h4', 'gi-news-story-title', story.title[lang]);
          const summary = element('p', 'gi-news-summary', story.summary[lang]);
          const link = element('a', 'gi-news-source', copy.read + ' ↗');
          link.href = story.url;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.setAttribute('aria-label', copy.read + ': ' + story.title[lang] + ' — ' + story.publisher);
          article.append(meta, title, summary, link);
          list.appendChild(article);
        }
        group.appendChild(list);
        grid.appendChild(group);
      }
      inner.appendChild(grid);
    }
    mount.appendChild(inner);
  }
  function ensureMounted() {
    const keys = visibleCategories();
    const main = document.querySelector('main#main,main#public-content,main');
    if (!main || !keys.length) {
      if (mount?.isConnected) mount.remove();
      renderedKey = undefined;
      return;
    }
    const home = runtime.path() === '/' && hashPage === 'home';
    const before = home ? main.querySelector('.home-insight-band') || main.querySelector('.pro-contact-band') : null;
    const parent = before?.parentElement || main;
    if (!mount) {
      mount = element('section', 'gi-news');
      mount.id = 'gi-latest-news';
      mount.setAttribute('aria-labelledby', 'gi-news-title');
      renderedKey = undefined;
    }
    // Keep the homepage's final contact section last. Reuse the same mount when
    // a framework rerender replaces its parent, without a mutation/remount loop.
    if (mount.parentElement !== parent || (before && mount.nextElementSibling !== before)) {
      if (before) before.before(mount);
      else parent.appendChild(mount);
    }
    const lang = runtime.language();
    const key = [lang, keys.join(','), feedState].join('|');
    if (key !== renderedKey) { renderedKey = key; render(keys, lang); }
    load();
  }
  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    queueMicrotask(() => { queued = false; ensureMounted(); });
  };
  const root = document.getElementById('root');
  if (root) new MutationObserver(schedule).observe(root, { childList: true, subtree: true });
  window.addEventListener('globalistihdam:language', schedule);
  window.addEventListener('hashchange', schedule);
  ensureMounted();
})();
