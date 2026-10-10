/* Shared hosting and language rules for the static website. */
(function () {
  'use strict';
  const projectPath = '/globalistihdam.com/';
  const base = globalThis.__GLOBALISTIHDAM_BASE__ ||
    (location.pathname === projectPath.slice(0, -1) || location.pathname.startsWith(projectPath) ? projectPath : '/');
  const portalOrigin = 'https://global-istihdam.mtoman.chatgpt.site';
  const isLanguage = value => value === 'tr' || value === 'en';
  function language() {
    const hashLanguage = /^#(tr|en)\//.exec(location.hash)?.[1];
    const queryLanguage = new URLSearchParams(location.search).get('lang');
    let saved;
    try { saved = localStorage.getItem('global-language'); } catch (_) { /* Storage may be disabled. */ }
    return hashLanguage || (isLanguage(queryLanguage) ? queryLanguage : isLanguage(saved) ? saved : 'tr');
  }
  function path(pathname = location.pathname) {
    if (base !== '/' && (pathname === base.slice(0, -1) || pathname.startsWith(base))) {
      pathname = '/' + pathname.slice(base.length);
    }
    return pathname.replace(/\/index\.html$/, '').replace(/\/+$/, '') || '/';
  }
  function url(value) {
    if (!value || !value.startsWith('/') || value.startsWith('//')) return value;
    if (base !== '/' && value.startsWith(base)) return value;
    if (/^\/(portal|admin|api|robotics)([/?#]|$)/.test(value)) return portalOrigin + value;
    const match = /^([^?#]*)(.*)$/.exec(value);
    let pathname = match[1];
    // Explicit directory URLs avoid an extra Pages redirect and retain query strings.
    if (pathname !== '/' && !pathname.endsWith('/') && !/\.[^/]+$/.test(pathname)) pathname += '/';
    return base + pathname.slice(1) + match[2];
  }
  function rewrite(root) {
    const nodes = root.querySelectorAll('[href],[src],form[action]');
    for (const node of nodes) {
      for (const attribute of ['href', 'src', 'action']) {
        const oldValue = node.getAttribute(attribute);
        if (oldValue) {
          const newValue = url(oldValue);
          if (oldValue !== newValue) node.setAttribute(attribute, newValue);
        }
      }
    }
  }
  function markup(html) {
    const template = document.createElement('template');
    template.innerHTML = html;
    rewrite(template.content);
    return template.innerHTML;
  }
  // Configuration can change independently of the bundle. Only link to the
  // expected HTTPS platform; credentials, unusual ports and lookalike hosts
  // must never turn a social button into a different destination.
  function socialLinks(value) {
    const hosts = {
      instagram: ['instagram.com', 'www.instagram.com'],
      youtube: ['youtube.com', 'www.youtube.com'],
      tiktok: ['tiktok.com', 'www.tiktok.com'],
    };
    const links = {};
    for (const [platform, allowedHosts] of Object.entries(hosts)) {
      const candidate = value?.[platform];
      if (typeof candidate !== 'string' || /[\\\u0000-\u0020\u007f]/.test(candidate)) continue;
      try {
        const parsed = new URL(candidate);
        if (parsed.protocol === 'https:' && !parsed.username && !parsed.password && !parsed.port && allowedHosts.includes(parsed.hostname)) {
          links[platform] = parsed.href;
        }
      } catch (_) { /* Ignore malformed configuration. */ }
    }
    return links;
  }
  globalThis.GlobalistihdamRuntime = Object.freeze({ base, portalOrigin, language, path, url, rewrite, markup, socialLinks });
})();
