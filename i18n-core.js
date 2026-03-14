(function () {
  function getInitialLanguage() {
    var urlLang = new URLSearchParams(window.location.search).get('lang');
    if (urlLang === 'nl' || urlLang === 'en') return urlLang;
    var saved = localStorage.getItem('prisma-language');
    if (saved === 'nl' || saved === 'en') return saved;
    return navigator.language && navigator.language.toLowerCase().startsWith('nl') ? 'nl' : 'en';
  }

  function persistLanguage(lang) {
    localStorage.setItem('prisma-language', lang);
  }

  function updateLanguageLinks(currentLang) {
    document.querySelectorAll('a[href]').forEach(function (link) {
      var raw = link.getAttribute('href');
      if (!raw || raw.startsWith('#') || raw.startsWith('mailto:') || raw.startsWith('tel:')) return;
      var url;
      try {
        url = new URL(raw, window.location.href);
      } catch (e) {
        return;
      }
      var isPrisma = url.origin === window.location.origin || url.hostname.includes('prismasystemen.nl');
      if (!isPrisma) return;
      var isHtml = url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname.endsWith('/');
      if (!isHtml) return;
      if (currentLang === 'en') url.searchParams.set('lang', 'en');
      else url.searchParams.delete('lang');
      var sameOrigin = url.origin === window.location.origin;
      link.setAttribute('href', sameOrigin ? (url.pathname + url.search + url.hash) : url.toString());
    });
  }

  window.PrismaI18n = {
    getInitialLanguage: getInitialLanguage,
    persistLanguage: persistLanguage,
    updateLanguageLinks: updateLanguageLinks,
  };
})();
