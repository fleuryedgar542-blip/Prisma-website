(function() {
  var STORAGE_KEY = 'prisma-reading-ease';
  var TEST_MODE_KEY = 'prisma_test_user';
  var TRACK_EVENT_BACKUP_KEY = '__prismaOriginalTrackEvent';
  var UMAMI_TRACK_BACKUP_KEY = '__prismaOriginalUmamiTrack';
  var UMAMI_SYNC_TIMER_KEY = '__prismaUmamiSyncTimer';

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

  function isTestModeEnabled() {
    try {
      return window.localStorage.getItem(TEST_MODE_KEY) === 'true';
    } catch (error) {
      return false;
    }
  }

  function shouldShowTestModeToggle() {
    return (
      window.location.hostname === 'localhost' ||
      window.location.search.indexOf('test=true') !== -1 ||
      isTestModeEnabled()
    );
  }

  function writeTestMode(enabled) {
    try {
      if (enabled) {
        window.localStorage.setItem(TEST_MODE_KEY, 'true');
      } else {
        window.localStorage.removeItem(TEST_MODE_KEY);
      }
    } catch (error) {
      return;
    }
  }

  function getTestModeLabel(enabled) {
    if (document.documentElement.lang === 'en') {
      return enabled ? 'Test mode on' : 'Test mode off';
    }
    return enabled ? 'Test mode aan' : 'Test mode uit';
  }

  function syncTrackingPreference(enabled) {
    if (enabled) {
      if (typeof window.trackEvent === 'function' && !window[TRACK_EVENT_BACKUP_KEY]) {
        window[TRACK_EVENT_BACKUP_KEY] = window.trackEvent;
      }
      window.trackEvent = function() {};

      if (window.umami && typeof window.umami.track === 'function') {
        if (!window[UMAMI_TRACK_BACKUP_KEY]) {
          window[UMAMI_TRACK_BACKUP_KEY] = window.umami.track.bind(window.umami);
        }
        window.umami.track = function() {};
      }

      if (!window[UMAMI_SYNC_TIMER_KEY]) {
        window[UMAMI_SYNC_TIMER_KEY] = window.setInterval(function() {
          if (!isTestModeEnabled()) return;
          if (!window.umami || typeof window.umami.track !== 'function') return;
          if (!window[UMAMI_TRACK_BACKUP_KEY]) {
            window[UMAMI_TRACK_BACKUP_KEY] = window.umami.track.bind(window.umami);
          }
          window.umami.track = function() {};
        }, 400);
      }
      return;
    }

    if (window[UMAMI_SYNC_TIMER_KEY]) {
      window.clearInterval(window[UMAMI_SYNC_TIMER_KEY]);
      window[UMAMI_SYNC_TIMER_KEY] = null;
    }

    if (window[TRACK_EVENT_BACKUP_KEY]) {
      window.trackEvent = window[TRACK_EVENT_BACKUP_KEY];
    }

    if (window.umami && window[UMAMI_TRACK_BACKUP_KEY]) {
      window.umami.track = window[UMAMI_TRACK_BACKUP_KEY];
    }
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

  function ensureTestModeToggle() {
    var existing = document.querySelector('[data-test-mode-toggle]');
    if (!shouldShowTestModeToggle()) {
      if (existing) {
        existing.remove();
      }
      return null;
    }

    if (existing) return existing;

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'test-mode-toggle';
    button.setAttribute('data-test-mode-toggle', '');
    button.setAttribute('aria-pressed', 'false');

    if (document.body) {
      document.body.appendChild(button);
    }

    return button;
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

  function applyTestModeState(enabled) {
    syncTrackingPreference(enabled);

    var button = ensureTestModeToggle();
    if (!button) return;

    button.textContent = getTestModeLabel(enabled);
    button.classList.toggle('active', enabled);
    button.setAttribute('aria-pressed', enabled ? 'true' : 'false');
  }

  function togglePreference() {
    var nextState = !document.body.classList.contains('reading-ease');
    applyPreference(nextState);
    writePreference(nextState);
  }

  function toggleTestMode() {
    var nextState = !isTestModeEnabled();
    writeTestMode(nextState);
    applyTestModeState(nextState);
  }

  function initReadingEase() {
    ensureToggle();
    applyPreference(readPreference());
    applyTestModeState(isTestModeEnabled());

    document.querySelectorAll('[data-reading-ease-toggle]').forEach(function(button) {
      button.addEventListener('click', togglePreference);
    });

    var testModeButton = document.querySelector('[data-test-mode-toggle]');
    if (testModeButton) {
      testModeButton.addEventListener('click', toggleTestMode);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReadingEase);
  } else {
    initReadingEase();
  }
})();
