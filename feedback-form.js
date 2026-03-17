(function () {
  const FEEDBACK_ENDPOINT = 'https://formspree.io/f/xwvrwvqw';
  const FEEDBACK_VERSION = '2026-03-17';

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
          { value: 'yes', label: 'Yes' },
          { value: 'a_little', label: 'A little' },
          { value: 'no', label: 'No' }
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
        { value: 'yes', label: 'Ja' },
        { value: 'a_little', label: 'Een beetje' },
        { value: 'no', label: 'Nee' }
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

  function createMarkup(config) {
    const labels = getDefaultLabels(config.lang);
    return `
      <form class="prisma-feedback" action="${escapeHtml(FEEDBACK_ENDPOINT)}" method="POST" novalidate>
        <input type="hidden" name="tool" value="${escapeHtml(config.tool)}">
        <input type="hidden" name="page" value="${escapeHtml(window.location.pathname)}">
        <input type="hidden" name="lang" value="${escapeHtml(config.lang)}">
        <input type="hidden" name="version" value="${escapeHtml(FEEDBACK_VERSION)}">

        <div class="prisma-feedback-title">${escapeHtml(labels.title)}</div>

        <div class="prisma-feedback-fields">
          <label class="prisma-feedback-field">
            <span class="prisma-feedback-label">${escapeHtml(labels.messageLabel)}</span>
            <textarea class="prisma-feedback-textarea" name="message" placeholder="${escapeHtml(labels.messagePlaceholder)}" required></textarea>
          </label>

          <label class="prisma-feedback-field">
            <span class="prisma-feedback-label">${escapeHtml(labels.clearLabel)}</span>
            <select class="prisma-feedback-select" name="clear">
              ${buildOptions(labels.clearOptions, labels.clearPlaceholder)}
            </select>
          </label>

          <label class="prisma-feedback-field">
            <span class="prisma-feedback-label">${escapeHtml(labels.againLabel)}</span>
            <select class="prisma-feedback-select" name="use_again">
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
            message = data.errors[0].message;
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
      console.error('Feedback submit failed', error);
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
