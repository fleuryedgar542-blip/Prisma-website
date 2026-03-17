(function () {
  const FEEDBACK_ENDPOINT = 'https://formspree.io/f/xwvrwvqw';
  const FEEDBACK_VERSION = '2026-03-17';
  const FEEDBACK_EMAIL = 'fleur@prismasystemen.nl';

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getDefaultLabels(lang) {
    if (lang === 'en') {
      return {
        title: 'Quick feedback',
        clearLabel: 'Was this clear?',
        clearPlaceholder: 'Choose if you want',
        clearOptions: [
          { value: 'clear', label: 'Yes' },
          { value: 'somewhat_clear', label: 'A little' },
          { value: 'unclear', label: 'No' }
        ],
        againLabel: 'Would you use this again?',
        againPlaceholder: 'Choose if you want',
        againOptions: [
          { value: 'yes', label: 'Yes' },
          { value: 'maybe', label: 'Maybe' },
          { value: 'no', label: 'No' }
        ],
        messageLabel: 'What felt unclear or missing?',
        messagePlaceholder: 'A short note is enough.',
        submit: 'Send feedback',
        success: 'Thank you, this really helps.',
        error: 'Sending did not work just now. Please try again.'
      };
    }

    return {
      title: 'Korte feedback',
      clearLabel: 'Was dit duidelijk?',
      clearPlaceholder: 'Kies als je wilt',
      clearOptions: [
        { value: 'clear', label: 'Ja' },
        { value: 'somewhat_clear', label: 'Een beetje' },
        { value: 'unclear', label: 'Nee' }
      ],
      againLabel: 'Zou je dit nog eens gebruiken?',
      againPlaceholder: 'Kies als je wilt',
      againOptions: [
        { value: 'yes', label: 'Ja' },
        { value: 'maybe', label: 'Misschien' },
        { value: 'no', label: 'Nee' }
      ],
      messageLabel: 'Wat liep niet lekker of wat mis je?',
      messagePlaceholder: 'Een korte zin is genoeg.',
      submit: 'Verstuur feedback',
      success: 'Bedankt, dit helpt echt.',
      error: 'Versturen lukt nu even niet. Probeer het zo nog eens.'
    };
  }

  function buildOptions(options, placeholder) {
    const rendered = [`<option value="">${escapeHtml(placeholder)}</option>`];
    options.forEach((option) => {
      rendered.push(`<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`);
    });
    return rendered.join('');
  }

  function normalizeText(value) {
    return String(value || '').trim().toLowerCase();
  }

  function containsAny(text, patterns) {
    return patterns.some((pattern) => text.includes(pattern));
  }

  function getLanguage(config) {
    if (config && config.lang) return config.lang;
    return window.location.pathname.startsWith('/en/') ? 'en' : 'nl';
  }

  function getVersion(config) {
    if (config && config.version) return config.version;
    const pageVersion = document.documentElement.getAttribute('data-version');
    return pageVersion || FEEDBACK_VERSION;
  }

  function inferFeedbackType(message, clarityScore, reuseScore) {
    const text = normalizeText(message);

    const bugPatterns = [
      'werkt niet', 'werk niet', 'error', 'bug', 'kapot', 'doet het niet',
      'vastgelopen', 'loopt vast', 'crash', 'broken', 'not working',
      'does not work', "doesn't work", 'stuck', 'fails', 'failure'
    ];
    const confusingPatterns = [
      'snap niet', 'snap het niet', 'onduidelijk', 'verwarrend', 'begrijp niet',
      'begrijp het niet', 'niet duidelijk', 'confusing', 'unclear',
      'i do not understand', "don't understand", 'hard to follow'
    ];
    const missingFeaturePatterns = [
      'mis ', 'ik mis', 'zou handig zijn', 'zou fijn zijn', 'feature',
      'zou graag', 'mist', 'missing', 'wish it had', 'would be helpful',
      'would be nice', 'i would like'
    ];
    const emotionalPatterns = [
      'overwhelmed', 'stress', 'te veel', 'overprikkeld', 'paniek',
      'spannend', 'unsettling', 'anxious', 'anxiety', 'too much'
    ];
    const positivePatterns = [
      'alles ging goed', 'ging goed', 'fijn', 'helpt', 'goed', 'rustig',
      'duidelijk', 'prettig', 'werkt goed', 'thank you', 'helpful',
      'clear', 'calm', 'good', 'works well', 'useful'
    ];

    if (containsAny(text, bugPatterns)) return 'bug';
    if (containsAny(text, confusingPatterns) || clarityScore === 'unclear') return 'confusing';
    if (containsAny(text, missingFeaturePatterns)) return 'missing_feature';
    if (containsAny(text, emotionalPatterns)) return 'emotional_response';
    if (containsAny(text, positivePatterns) || (clarityScore === 'clear' && reuseScore === 'yes')) return 'positive';
    return 'other';
  }

  function inferSeverity(message, feedbackType, clarityScore, reuseScore) {
    const text = normalizeText(message);

    const highPatterns = [
      'kan niet verder', 'werkt niet', 'vastgelopen', 'helemaal kapot',
      'completely broken', 'blocked', 'cannot continue', "can't continue",
      'totally broken', 'stuck'
    ];
    const mediumPatterns = [
      'frustrerend', 'irritant', 'mis', 'onduidelijk', 'verwarrend',
      'stress', 'te veel', 'annoying', 'frustrating', 'unclear',
      'confusing', 'missing', 'hard to use'
    ];

    if (containsAny(text, highPatterns) || feedbackType === 'bug' && reuseScore === 'no') {
      return 'high';
    }

    if (
      containsAny(text, mediumPatterns) ||
      feedbackType === 'missing_feature' ||
      feedbackType === 'confusing' ||
      feedbackType === 'emotional_response' ||
      clarityScore === 'unclear' ||
      reuseScore === 'no'
    ) {
      return 'medium';
    }

    return 'low';
  }

  function applyDerivedFields(form) {
    const message = form.elements.message.value;
    const clarityScore = form.elements.clarity_score.value || '';
    const reuseScore = form.elements.reuse_score.value || '';
    const feedbackType = inferFeedbackType(message, clarityScore, reuseScore);
    const severity = inferSeverity(message, feedbackType, clarityScore, reuseScore);

    form.elements.feedback_type.value = feedbackType;
    form.elements.severity.value = severity;
    form.elements.submitted_at.value = new Date().toISOString();
  }

  function createMarkup(config) {
    const lang = getLanguage(config);
    const labels = getDefaultLabels(lang);
    const version = getVersion(config);
    return `
      <form class="prisma-feedback" action="${escapeHtml(FEEDBACK_ENDPOINT)}" method="POST" novalidate>
        <input type="hidden" name="tool" value="${escapeHtml(config.tool)}">
        <input type="hidden" name="page" value="${escapeHtml(window.location.pathname)}">
        <input type="hidden" name="lang" value="${escapeHtml(lang)}">
        <input type="hidden" name="version" value="${escapeHtml(version)}">
        <input type="hidden" name="email" value="${escapeHtml(FEEDBACK_EMAIL)}">
        <input type="hidden" name="feedback_type" value="">
        <input type="hidden" name="severity" value="">
        <input type="hidden" name="submitted_at" value="">

        <div class="prisma-feedback-title">${escapeHtml(labels.title)}</div>

        <div class="prisma-feedback-fields">
          <label class="prisma-feedback-field">
            <span class="prisma-feedback-label">${escapeHtml(labels.messageLabel)}</span>
            <textarea class="prisma-feedback-textarea" name="message" placeholder="${escapeHtml(labels.messagePlaceholder)}" required></textarea>
          </label>

          <label class="prisma-feedback-field">
            <span class="prisma-feedback-label">${escapeHtml(labels.clearLabel)}</span>
            <select class="prisma-feedback-select" name="clarity_score">
              ${buildOptions(labels.clearOptions, labels.clearPlaceholder)}
            </select>
          </label>

          <label class="prisma-feedback-field">
            <span class="prisma-feedback-label">${escapeHtml(labels.againLabel)}</span>
            <select class="prisma-feedback-select" name="reuse_score">
              ${buildOptions(labels.againOptions, labels.againPlaceholder)}
            </select>
          </label>

          <button type="submit" class="prisma-feedback-submit">${escapeHtml(labels.submit)}</button>
        </div>

        <div class="prisma-feedback-status" aria-live="polite" hidden></div>
      </form>
    `;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const status = form.querySelector('.prisma-feedback-status');
    const fields = form.querySelector('.prisma-feedback-fields');
    const submitButton = form.querySelector('.prisma-feedback-submit');
    const lang = form.elements.lang.value;
    const labels = getDefaultLabels(lang);

    if (form.dataset.submitting === 'true') return;
    if (!form.reportValidity()) return;

    applyDerivedFields(form);
    form.dataset.submitting = 'true';
    status.hidden = true;
    status.textContent = '';
    status.dataset.state = '';
    submitButton.disabled = true;

    try {
      const response = await fetch(form.action, {
        method: form.method,
        headers: {
          Accept: 'application/json'
        },
        body: new FormData(form)
      });

      if (!response.ok) {
        let message = labels.error;
        try {
          const data = await response.json();
          if (data && Array.isArray(data.errors) && data.errors[0] && data.errors[0].message) {
            const errorDetail = data.errors[0];
            message = errorDetail.field
              ? `${errorDetail.field} ${errorDetail.message}`
              : errorDetail.message;
          } else if (data && typeof data.error === 'string' && data.error.trim()) {
            message = data.error;
          }
        } catch (error) {
          // Keep the generic message if the response body is not JSON.
        }
        throw new Error(message);
      }

      form.reset();
      fields.hidden = true;
      status.hidden = false;
      status.dataset.state = 'success';
      status.textContent = labels.success;
    } catch (error) {
      status.hidden = false;
      status.dataset.state = 'error';
      status.textContent = error && error.message ? error.message : labels.error;
      submitButton.disabled = false;
      form.dataset.submitting = 'false';
      return;
    }

    form.dataset.submitting = 'false';
  }

  function render(config) {
    const root = document.getElementById(config.rootId);
    if (!root) return;

    root.innerHTML = createMarkup(config);
    const form = root.querySelector('form');
    if (!form) return;
    form.addEventListener('submit', handleSubmit);
  }

  function clear(rootId) {
    const root = document.getElementById(rootId);
    if (!root) return;
    root.innerHTML = '';
  }

  window.PRISMAFeedback = {
    render,
    clear
  };
})();
