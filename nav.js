// ✦ PRISMA Systemen — Navigatie JS

// Schaduw bij scrollen
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('gescrold', window.scrollY > 10);
});

// Hamburger menu
const hamburger = document.getElementById('hamburger');
const mobielMenu = document.getElementById('mobiel-menu');

hamburger.addEventListener('click', () => {
  const open = mobielMenu.classList.toggle('open');
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
  document.body.style.overflow = open ? 'hidden' : '';
});

// Menu sluiten bij klik op link
mobielMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobielMenu.classList.remove('open');
    hamburger.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// Fade-in bij scrollen
const elementen = document.querySelectorAll('.fade-in');
const waarnemer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('zichtbaar');
      waarnemer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

elementen.forEach(el => waarnemer.observe(el));
