// ✦ PRISMA Systemen — Navigatie JS

const nav = document.getElementById('nav');
const hamburger = document.getElementById('hamburger');
const mobielMenu = document.getElementById('mobiel-menu');

function getCurrentLanguage() {
  const htmlLang = document.documentElement.lang;
  if (htmlLang === 'nl' || htmlLang === 'en') return htmlLang;
  const saved = localStorage.getItem('prisma-language');
  if (saved === 'nl' || saved === 'en') return saved;
  return navigator.language && navigator.language.toLowerCase().startsWith('nl') ? 'nl' : 'en';
}

function getMenuLabel(isOpen) {
  const lang = getCurrentLanguage();
  if (lang === 'en') return isOpen ? 'Close menu' : 'Open menu';
  return isOpen ? 'Menu sluiten' : 'Menu openen';
}

function syncHamburgerLabel() {
  if (!hamburger) return;
  hamburger.setAttribute('aria-label', getMenuLabel(hamburger.classList.contains('open')));
}

function buildLanguageUrl(baseUrl, lang) {
  try {
    const url = new URL(baseUrl);
    if (lang === 'en') url.searchParams.set('lang', 'en');
    else url.searchParams.delete('lang');
    return url.toString();
  } catch (error) {
    return baseUrl;
  }
}

function syncSeoMetadata() {
  const baseUrl = document.documentElement.dataset.seoBase;
  if (!baseUrl) return;

  const lang = getCurrentLanguage();
  const canonicalUrl = buildLanguageUrl(baseUrl, lang);
  const title = document.title;
  const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';

  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.setAttribute('href', canonicalUrl);

  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((link) => {
    const hreflang = link.getAttribute('hreflang');
    if (hreflang === 'en') link.setAttribute('href', buildLanguageUrl(baseUrl, 'en'));
    else link.setAttribute('href', buildLanguageUrl(baseUrl, 'nl'));
  });

  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');
  const ogUrl = document.querySelector('meta[property="og:url"]');
  const ogLocale = document.querySelector('meta[property="og:locale"]');
  const twitterTitle = document.querySelector('meta[name="twitter:title"]');
  const twitterDescription = document.querySelector('meta[name="twitter:description"]');

  if (ogTitle) ogTitle.setAttribute('content', title);
  if (ogDescription) ogDescription.setAttribute('content', description);
  if (ogUrl) ogUrl.setAttribute('content', canonicalUrl);
  if (ogLocale) ogLocale.setAttribute('content', lang === 'en' ? 'en_US' : 'nl_NL');
  if (twitterTitle) twitterTitle.setAttribute('content', title);
  if (twitterDescription) twitterDescription.setAttribute('content', description);
}

// Schaduw bij scrollen (alleen wanneer nav aanwezig is)
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('gescrold', window.scrollY > 10);
  });
}

// Hamburger menu (alleen wanneer elementen aanwezig zijn)
if (hamburger && mobielMenu) {
  syncHamburgerLabel();
  hamburger.addEventListener('click', () => {
    const open = mobielMenu.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    syncHamburgerLabel();
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Menu sluiten bij klik op link
  mobielMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobielMenu.classList.remove('open');
      hamburger.classList.remove('open');
      syncHamburgerLabel();
      document.body.style.overflow = '';
    });
  });
}

window.addEventListener('storage', (event) => {
  if (event.key === 'prisma-language') {
    syncHamburgerLabel();
    syncSeoMetadata();
  }
});

// Fade-in bij scrollen
const elementen = document.querySelectorAll('.fade-in');
if (elementen.length) {
  const waarnemer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('zichtbaar');
        waarnemer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  elementen.forEach((el) => waarnemer.observe(el));
}

const htmlObserver = new MutationObserver(() => {
  syncHamburgerLabel();
  syncSeoMetadata();
});
htmlObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

document.addEventListener('DOMContentLoaded', syncSeoMetadata);
