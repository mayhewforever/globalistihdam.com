/* Public content search. No enquiries or personal data are sent by this feature. */
(function () {
  'use strict';
  const runtime = GlobalistihdamRuntime;
  let indexPromise, opener;
  const dialog = document.createElement('dialog');
  dialog.id = 'gi-search-dialog';
  dialog.className = 'gi-search-dialog';
  dialog.setAttribute('aria-labelledby', 'gi-search-title');
  dialog.innerHTML = '<div class="gi-search-head"><h2 id="gi-search-title"></h2><button type="button" class="gi-search-close">×</button></div><label for="gi-search-input" id="gi-search-label"></label><input id="gi-search-input" class="gi-search-input" type="search" maxlength="120" autocomplete="off" aria-controls="gi-search-results"><p class="gi-search-status" role="status" aria-live="polite"></p><ul id="gi-search-results" class="gi-search-results"></ul>';
  document.body.appendChild(dialog);
  const input = dialog.querySelector('input');
  const results = dialog.querySelector('ul');
  const status = dialog.querySelector('[role="status"]');
  const closeButton = dialog.querySelector('button');
  const normalise = value => value.toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i');
  const isTurkish = () => runtime.language() === 'tr';
  const text = (tr, en) => isTurkish() ? tr : en;
  function searchHref(value) {
    if (typeof value !== 'string' || !value.startsWith('/')) return null;
    try {
      const decoded = decodeURIComponent(value);
      if (decoded.startsWith('//') || /[\\\u0000-\u0020\u007f]/.test(value + decoded)) return null;
      if (decoded.split(/[?#]/, 1)[0].split('/').some(segment => segment === '.' || segment === '..')) return null;
      const href = runtime.url(value);
      const resolved = new URL(href, location.href);
      if (resolved.origin !== location.origin || !resolved.pathname.startsWith(runtime.base)) return null;
      return href;
    } catch (_) { return null; }
  }
  function labelUI() {
    const labels = [
      ['#gi-search-title', text('Ne arıyorsunuz?', 'What are you looking for?')],
      ['#gi-search-label', text('Üniversite, ülke veya hizmet arayın', 'Search universities, countries or services')]
    ];
    for (const [selector, value] of labels) {
      const node = dialog.querySelector(selector);
      if (node.textContent !== value) node.textContent = value;
    }
    closeButton.setAttribute('aria-label', text('Aramayı kapat', 'Close search'));
    input.placeholder = text('Örn. Kanada, mühendislik, yatırım', 'e.g. Canada, engineering, investment');
    for (const button of document.querySelectorAll('.gi-search-toggle')) {
      button.setAttribute('aria-label', text('Sitede ara', 'Search the website'));
    }
  }
  async function loadIndex() {
    if (!indexPromise) {
      indexPromise = (async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        try {
          const response = await fetch(runtime.url('/search-index.json'), { signal: controller.signal });
          if (!response.ok) throw new Error('Search index unavailable');
          const data = await response.json();
          if (!Array.isArray(data.tr) || !Array.isArray(data.en)) throw new Error('Invalid search index');
          return data;
        } finally { clearTimeout(timeout); }
      })().catch(error => { indexPromise = undefined; throw error; });
    }
    return indexPromise;
  }
  let request = 0;
  async function search() {
    const current = ++request;
    status.textContent = text('Aranıyor…', 'Searching…');
    try {
      const index = await loadIndex();
      if (current !== request || !dialog.open) return;
      const terms = normalise(input.value.trim()).split(/\s+/).filter(Boolean);
      const matches = index[runtime.language()].filter(entry => {
        if (!entry || typeof entry.title !== 'string' || typeof entry.description !== 'string' || !searchHref(entry.path)) return false;
        const haystack = normalise(entry.title + ' ' + entry.description);
        return terms.every(term => haystack.includes(term));
      }).sort((a, b) => {
        const score = entry => terms.reduce((sum, term) => sum + (normalise(entry.title).includes(term) ? 1 : 0), 0);
        return score(b) - score(a);
      });
      results.replaceChildren();
      for (const entry of matches.slice(0, 12)) {
        const href = searchHref(entry.path);
        if (!href) continue;
        const row = document.createElement('li');
        const link = document.createElement('a');
        link.className = 'gi-search-result';
        link.href = href;
        const title = document.createElement('strong'); title.textContent = entry.title;
        const description = document.createElement('span'); description.textContent = entry.description;
        link.append(title, description); row.appendChild(link); results.appendChild(row);
        link.addEventListener('click', close);
      }
      status.textContent = terms.length ? (matches.length ? text(`${matches.length} sonuç. İlk ${Math.min(matches.length, 12)} sonuç gösteriliyor.`, `${matches.length} results. Showing the first ${Math.min(matches.length, 12)}.`) : text('Sonuç bulunamadı. Farklı bir kelime deneyin.', 'No results. Try another term.')) : text('Başlamak için bir konu seçin veya arama yapın.', 'Choose a topic to get started, or enter a search.');
    } catch (_) {
      if (current !== request) return;
      results.replaceChildren();
      status.textContent = text('Arama şu anda yüklenemedi. Menüden devam edebilir veya yeniden arayabilirsiniz.', 'Search could not load. Use the navigation or try searching again.');
    }
  }
  function open(button) {
    opener = button || document.activeElement;
    labelUI();
    if (!dialog.open) dialog.showModal();
    input.focus();
    search();
  }
  function close() {
    if (dialog.open) dialog.close();
  }
  closeButton.addEventListener('click', close);
  dialog.addEventListener('close', () => { request++; if (opener?.isConnected) opener.focus(); });
  dialog.addEventListener('click', event => { if (event.target === dialog) { const box=dialog.getBoundingClientRect(); if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom) close(); } });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); close(); }
    if (event.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll('button,input,a[href]')];
    const first = focusable[0], last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  input.addEventListener('input', search);
  document.addEventListener('keydown', event => {
    if (event.key === '/' && !event.ctrlKey && !event.altKey && !event.metaKey && !event.target.closest('input,textarea,select,[contenteditable="true"]')) {
      event.preventDefault(); open();
    }
  });
  function enhance() {
    const controls = document.querySelector('.header-controls');
    const header = document.querySelector('.pro-header .pro-container');
    if (header && !header.querySelector('.gi-search-toggle')) {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'gi-search-toggle';
      button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" stroke-width="1.7"/><path d="m16 16 5 5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
      button.setAttribute('aria-haspopup', 'dialog'); button.setAttribute('aria-controls', dialog.id);
      button.addEventListener('click', () => open(button));
      if (controls) controls.insertBefore(button, controls.firstChild);
      else header.insertBefore(button, header.querySelector('.pro-language'));
    }
    labelUI();
  }
  let scheduled = false;
  new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => { scheduled = false; enhance(); });
  }).observe(document.getElementById('root'), { childList: true, subtree: true });
  window.addEventListener('globalistihdam:language', () => { labelUI(); if (dialog.open) search(); });
  window.addEventListener('hashchange', labelUI);
  enhance();
  globalThis.GlobalistihdamSearch = Object.freeze({ open });
})();
