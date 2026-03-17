(function () {
  const FEEDBACK_ENDPOINT = 'https://formspree.io/f/xwvrwvqw';
  const FEEDBACK_VERSION = '2026-03-17';
  const FEEDBACK_EMAIL = 'fleur@prismasystemen.nl';
  const FEEDBACK_STORAGE_KEY = 'prisma-feedback-pending-v1';

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
        error: 'Sending did not work just now. Please try again.',
        pending: 'Your feedback has not fully sent yet. We saved it temporarily on this device.',
        quota: 'It looks like the feedback system has reached a temporary limit. Your feedback has been saved on this device.',
        retry: 'Try again',
        copy: 'Copy feedback',
        copied: 'Feedback copied.',
        copyError: 'Copying did not work just now. You can try again.'
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
      error: 'Versturen lukt nu even niet. Probeer het zo nog eens.',
      pending: 'Je feedback is nog niet helemaal verstuurd. We hebben hem tijdelijk op dit apparaat bewaard.',
      quota: 'Er lijkt tijdelijk een limiet bereikt te zijn bij het feedbacksysteem. Je feedback is op dit apparaat bewaard.',
      retry: 'Opnieuw proberen',
      copy: 'Kopieer feedback',
      copied: 'Feedback gekopieerd.',
      copyError: 'Kopieren lukt nu even niet. Probeer het zo nog eens.'
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

  function readPendingFeedback() {
    try {
      const raw = window.localStorage.getItem(FEEDBACK_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function writePendingFeedback(items) {
    try {
      window.localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      // If storage is unavailable we quietly skip local persistence.
    }
  }

  function getPendingKey(payload) {
    return [payload.tool, payload.page, payload.lang].join('::');
  }

  function savePendingFeedback(payload, failureKind) {
    const items = readPendingFeedback().filter((item) => item.key !== getPendingKey(payload));
    items.push({
      key: getPendingKey(payload),
      status: 'pending',
      failure_kind: failureKind,
      saved_at: new Date().toISOString(),
      payload: payload
    });
    writePendingFeedback(items);
  }

  function removePendingFeedback(payload) {
    const items = readPendingFeedback().filter((item) => item.key !== getPendingKey(payload));
    writePendingFeedback(items);
  }

  function findPendingFeedback(payload) {
    return readPendingFeedback().find((item) => item.key === getPendingKey(payload)) || null;
  }

  function getFormIdentity(form) {
    return {
      tool: form.elements.tool.value,
      page: form.elements.page.value,
      lang: form.elements.lang.value
    };
  }

  function formDataToObject(formData) {
    const payload = {};
    formData.forEach((value, key) => {
      payload[key] = value;
    });
    return payload;
  }

  function createFormDataFromObject(payload) {
    const formData = new FormData();
    Object.keys(payload).forEach((key) => {
      formData.append(key, payload[key]);
    });
    return formData;
  }

  function getFailureKind(statusCode, message) {
    const text = normalizeText(message);
    if (!statusCode && containsAny(text, ['failed to fetch', 'networkerror', 'load failed'])) {
      return 'network';
    }
    if (
      statusCode === 429 ||
      containsAny(text, ['quota', 'limit', 'exceeded', 'too many', 'rate limit', 'submission limit', 'blocked'])
    ) {
      return 'quota';
    }
    return 'submit';
  }

  function getFailureMessage(labels, failureKind) {
    if (failureKind === 'quota') return labels.quota;
    return labels.pending;
  }

  function formatFeedbackForCopy(payload) {
    return [
      `Tool: ${payload.tool || ''}`,
      `Page: ${payload.page || ''}`,
      `Language: ${payload.lang || ''}`,
      `Version: ${payload.version || ''}`,
      `Clarity: ${payload.clarity_score || ''}`,
      `Reuse: ${payload.reuse_score || ''}`,
      `Type: ${payload.feedback_type || ''}`,
      `Severity: ${payload.severity || ''}`,
      `Submitted at: ${payload.submitted_at || ''}`,
      'Message:',
      payload.message || ''
    ].join('\n');
  }

  async function copyText(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return;
    }

    const fallbackField = document.createElement('textarea');
    fallbackField.value = text;
    fallbackField.setAttribute('readonly', 'true');
    fallbackField.style.position = 'fixed';
    fallbackField.style.opacity = '0';
    document.body.appendChild(fallbackField);
    fallbackField.select();
    document.execCommand('copy');
    document.body.removeChild(fallbackField);
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
    const submittedAt = form.elements.submitted_at.value || new Date().toISOString();
    const feedbackType = inferFeedbackType(message, clarityScore, reuseScore);
    const severity = inferSeverity(message, feedbackType, clarityScore, reuseScore);

    form.elements.feedback_type.value = feedbackType;
    form.elements.severity.value = severity;
    form.elements.submitted_at.value = submittedAt;
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

        <div class="prisma-feedback-status" aria-live="polite" hidden>
          <div class="prisma-feedback-status-text"></div>
          <div class="prisma-feedback-actions" hidden></div>
        </div>
      </form>
    `;
  }

  function setStatus(form, options) {
    const status = form.querySelector('.prisma-feedback-status');
    const statusText = form.querySelector('.prisma-feedback-status-text');
    const actions = form.querySelector('.prisma-feedback-actions');

    status.hidden = false;
    status.dataset.state = options.state || '';
    statusText.textContent = options.message || '';

    if (!options.actions || options.actions.length === 0) {
      actions.hidden = true;
      actions.innerHTML = '';
      return;
    }

    actions.hidden = false;
    actions.innerHTML = options.actions.map((action, index) => (
      `<button type="button" class="prisma-feedback-action" data-action-index="${index}">${escapeHtml(action.label)}</button>`
    )).join('');

    actions.querySelectorAll('[data-action-index]').forEach((button) => {
      const action = options.actions[Number(button.dataset.actionIndex)];
      if (!action) return;
      button.addEventListener('click', action.onClick);
    });
  }

  async function submitFeedback(formData, labels) {
    try {
      const response = await fetch(FEEDBACK_ENDPOINT, {
        method: 'POST',
        headers: {
          Accept: 'application/json'
        },
        body: formData
      });

      if (!response.ok) {
        let message = '';
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
          // Keep the response classification based on status if the body is not JSON.
        }

        const failureKind = getFailureKind(response.status, message || String(response.status));
        const submitError = new Error(message || labels.error);
        submitError.failureKind = failureKind;
        throw submitError;
      }
    } catch (error) {
      if (error && error.failureKind) throw error;
      const submitError = new Error(labels.error);
      submitError.failureKind = getFailureKind(0, error && error.message ? error.message : '');
      throw submitError;
    }
  }

  function populateFormFromPayload(form, payload) {
    if (!payload) return;
    if (payload.message) form.elements.message.value = payload.message;
    if (payload.clarity_score) form.elements.clarity_score.value = payload.clarity_score;
    if (payload.reuse_score) form.elements.reuse_score.value = payload.reuse_score;
    if (payload.feedback_type) form.elements.feedback_type.value = payload.feedback_type;
    if (payload.severity) form.elements.severity.value = payload.severity;
    if (payload.submitted_at) form.elements.submitted_at.value = payload.submitted_at;
  }

  async function retryPendingFeedback(form) {
    const labels = getDefaultLabels(form.elements.lang.value);
    const submitButton = form.querySelector('.prisma-feedback-submit');
    const pending = findPendingFeedback(getFormIdentity(form));
    if (!pending || form.dataset.submitting === 'true') return;

    form.dataset.submitting = 'true';
    submitButton.disabled = true;

    try {
      await submitFeedback(createFormDataFromObject(pending.payload), labels);
      removePendingFeedback(pending.payload);
      form.reset();
      form.querySelector('.prisma-feedback-fields').hidden = true;
      setStatus(form, {
        state: 'success',
        message: labels.success
      });
    } catch (error) {
      savePendingFeedback(pending.payload, error.failureKind || 'submit');
      setStatus(form, {
        state: 'pending',
        message: getFailureMessage(labels, error.failureKind || 'submit'),
        actions: buildPendingActions(form, pending.payload, labels)
      });
      submitButton.disabled = false;
      form.dataset.submitting = 'false';
      return;
    }

    form.dataset.submitting = 'false';
  }

  function buildPendingActions(form, payload, labels) {
    return [
      {
        label: labels.retry,
        onClick: () => {
          retryPendingFeedback(form);
        }
      },
      {
        label: labels.copy,
        onClick: async () => {
          try {
            await copyText(formatFeedbackForCopy(payload));
            setStatus(form, {
              state: 'pending',
              message: labels.copied,
              actions: buildPendingActions(form, payload, labels)
            });
          } catch (error) {
            setStatus(form, {
              state: 'pending',
              message: labels.copyError,
              actions: buildPendingActions(form, payload, labels)
            });
          }
        }
      }
    ];
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const fields = form.querySelector('.prisma-feedback-fields');
    const submitButton = form.querySelector('.prisma-feedback-submit');
    const lang = form.elements.lang.value;
    const labels = getDefaultLabels(lang);

    if (form.dataset.submitting === 'true') return;
    if (!form.reportValidity()) return;

    applyDerivedFields(form);
    const formData = new FormData(form);
    const payload = formDataToObject(formData);
    form.dataset.submitting = 'true';
    form.querySelector('.prisma-feedback-status').hidden = true;
    submitButton.disabled = true;

    try {
      await submitFeedback(formData, labels);
      removePendingFeedback(payload);

      form.reset();
      fields.hidden = true;
      setStatus(form, {
        state: 'success',
        message: labels.success
      });
    } catch (error) {
      savePendingFeedback(payload, error.failureKind || 'submit');
      setStatus(form, {
        state: 'pending',
        message: getFailureMessage(labels, error.failureKind || 'submit'),
        actions: buildPendingActions(form, payload, labels)
      });
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
    const pending = findPendingFeedback(getFormIdentity(form));
    if (pending && pending.payload) {
      populateFormFromPayload(form, pending.payload);
      setStatus(form, {
        state: 'pending',
        message: getFailureMessage(getDefaultLabels(form.elements.lang.value), pending.failure_kind || 'submit'),
        actions: buildPendingActions(form, pending.payload, getDefaultLabels(form.elements.lang.value))
      });
    }
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
