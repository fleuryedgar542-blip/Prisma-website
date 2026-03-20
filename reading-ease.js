(function() {
  var STORAGE_KEY = 'prisma-reading-ease';

  function readPreference() {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === 'on';
    } catch (error) {
      return false;
    }
  }

  function writePreference(enabled) {
    try {
      window.localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off');
    } catch (error) {
      return;
    }
  }

  function getToggleLabel() {
    return document.documentElement.lang === 'en' ? 'Easier reading' : 'Makkelijker lezen';
  }

  function ensureToggle() {
    if (document.querySelector('[data-reading-ease-toggle]')) return;

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'reading-ease-toggle reading-ease-toggle--auto';
    button.setAttribute('data-reading-ease-toggle', '');
    button.setAttribute('data-reading-ease-auto', 'true');
    button.setAttribute('aria-pressed', 'false');
    button.textContent = getToggleLabel();

    var languageSwitch = document.querySelector('.language-switch');
    if (languageSwitch && languageSwitch.parentNode) {
      languageSwitch.insertAdjacentElement('afterend', button);
      return;
    }

    var container = document.querySelector('.content-hero .container, .pagina-hero .container, .hero .container, main .container, .sectie .container, .container');
    if (container) {
      container.insertBefore(button, container.firstChild);
      return;
    }

    if (document.body) {
      document.body.insertBefore(button, document.body.firstChild);
    }
  }

  function applyPreference(enabled) {
    if (!document.body) return;
    document.body.classList.toggle('reading-ease', enabled);
    document.documentElement.classList.toggle('reading-ease', enabled);

    document.querySelectorAll('[data-reading-ease-toggle]').forEach(function(button) {
      if (button.hasAttribute('data-reading-ease-auto')) {
        button.textContent = getToggleLabel();
      }
      button.classList.toggle('active', enabled);
      button.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    });
  }

  function togglePreference() {
    var nextState = !document.body.classList.contains('reading-ease');
    applyPreference(nextState);
    writePreference(nextState);
  }

  function initReadingEase() {
    ensureToggle();
    applyPreference(readPreference());

    document.querySelectorAll('[data-reading-ease-toggle]').forEach(function(button) {
      button.addEventListener('click', togglePreference);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReadingEase);
  } else {
    initReadingEase();
  }
})();
