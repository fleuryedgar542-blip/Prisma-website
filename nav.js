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

const htmlObserver = new MutationObserver(syncHamburgerLabel);
htmlObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
window.addEventListener('storage', (event) => {
  if (event.key === 'prisma-language') syncHamburgerLabel();
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
