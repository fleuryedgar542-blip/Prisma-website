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

  function applyPreference(enabled) {
    if (!document.body) return;
    document.body.classList.toggle('reading-ease', enabled);
    document.documentElement.classList.toggle('reading-ease', enabled);

    document.querySelectorAll('[data-reading-ease-toggle]').forEach(function(button) {
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
