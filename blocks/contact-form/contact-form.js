/**
 * contact-form — Puntos.net contact page: a validated contact form that,
 * on successful submit, swaps to a "Thank You" confirmation (mirrors the
 * React ContactPage's mailSend toggle between FormContactComponent and
 * ThankYouContactComponent).
 *
 * The form POSTs its JSON payload to a configurable endpoint. Set the URL via
 * the block's `data-endpoint` (Section Metadata "endpoint" row) — if none is
 * configured the form still validates and shows the Thank You view.
 *
 * Class names and structure mirror the source components (form-contact-pn,
 * thankyou-pn, btn-red, bg-pn-dot) so the styling matches exactly.
 */

// ---- inline Ant Design icons used as input prefixes ----
const ICONS = {
  user: '<svg viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M858.5 763.6a374 374 0 00-80.6-119.5 375.63 375.63 0 00-119.5-80.6c-.4-.2-.8-.3-1.2-.5C719.5 518 760 444.7 760 362c0-137-111-248-248-248S264 225 264 362c0 82.7 40.5 156 102.8 201.1-.4.2-.8.3-1.2.5-44.8 18.9-85 46-119.5 80.6a375.63 375.63 0 00-80.6 119.5A371.7 371.7 0 00136 901.8a8 8 0 008 8.2h60c4.4 0 7.9-3.5 8-7.8 2-77.2 33-149.5 87.8-204.3 56.7-56.7 132-87.9 212.2-87.9s155.5 31.2 212.2 87.9C779 752.7 810 825 812 902.2c.1 4.3 3.6 7.8 8 7.8h60a8 8 0 008-8.2c-1-47.8-10.9-94.3-29.5-138.2zM512 534c-45.9 0-89.1-17.9-121.6-50.4S340 407.9 340 362c0-45.9 17.9-89.1 50.4-121.6S466.1 190 512 190s89.1 17.9 121.6 50.4S684 316.1 684 362c0 45.9-17.9 89.1-50.4 121.6S557.9 534 512 534z"/></svg>',
  mail: '<svg viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M928 160H96c-17.7 0-32 14.3-32 32v640c0 17.7 14.3 32 32 32h832c17.7 0 32-14.3 32-32V192c0-17.7-14.3-32-32-32zm-40 110.8V792H136V270.8l-27.6-21.5 39.3-50.5 42.8 33.3h643.1l42.8-33.3 39.3 50.5-27.7 21.5zM833.6 232L512 482 190.4 232l-42.8-33.3-39.3 50.5 27.6 21.5 341.6 265.6a55.99 55.99 0 0068.7 0L855.5 270.8l27.6-21.5-39.3-50.5-42.2 33.2z"/></svg>',
  build: '<svg viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M946.5 505L560.1 118.8l-25.9-25.9a31.5 31.5 0 00-44.4 0L77.5 505a63.9 63.9 0 00-18.8 46c.4 35.2 29.7 63.3 64.9 63.3h42.5V940h691.8V614.3h43.4c17.1 0 33.2-6.7 45.3-18.8a63.6 63.6 0 0018.7-45.3c0-17-6.7-33.1-18.8-45.2zM568 868H456V664h112v204zm217.9-325.7V868H632V640c0-22.1-17.9-40-40-40H432c-22.1 0-40 17.9-40 40v228H238.1V542.3h-96l370-369.7 23.1 23.1L882 542.3h-96.1z"/></svg>',
  phone: '<svg viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M877.1 238.7L770.6 132.3c-13-13-30.4-20.3-48.8-20.3s-35.8 7.2-48.8 20.3L558.3 246.8c-13 13-20.3 30.5-20.3 48.9 0 18.5 7.2 35.8 20.3 48.9l89.6 89.7a405.46 405.46 0 01-86.4 127.3c-36.7 36.9-79.6 66-127.2 86.6l-89.6-89.7c-13-13-30.4-20.3-48.8-20.3a68.2 68.2 0 00-48.8 20.3L132.3 673c-13 13-20.3 30.5-20.3 48.9 0 18.5 7.2 35.8 20.3 48.9l106.4 106.4c22.2 22.2 52.8 34.9 84.2 34.9 6.5 0 12.8-.5 19.2-1.6 132.4-21.8 263.8-92.3 369.9-198.3C818 606.1 888.4 474.9 910.5 342.3c6.3-37.6-6.3-76.3-33.4-103.6z"/></svg>',
  tag: '<svg viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M938 458.8l-29.6-312.6c-1.5-16.2-14.4-29-30.6-30.6L565.2 86h-.4c-8.4 0-16.4 3.3-22.4 9.3L83.3 554.7a32.05 32.05 0 000 45.3l340.7 340.7c6.3 6.3 14.5 9.4 22.7 9.4s16.4-3.1 22.7-9.4l459.3-459.3c6.6-6.5 9.9-15.5 9-24.6zM459.7 834.7L189.3 564.3 589 164.6 836 188l23.4 247-399.7 399.7zM680 256c-48.5 0-88 39.5-88 88s39.5 88 88 88 88-39.5 88-88-39.5-88-88-88zm0 120c-17.6 0-32-14.4-32-32s14.4-32 32-32 32 14.4 32 32-14.4 32-32 32z"/></svg>',
  down: '<svg viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3.1-12.7-6.4-12.7z"/></svg>',
};

// profile icon for the "What Happens Next" card title
const PROFILE_ICON = '<svg viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M885.2 446.3l-.2-.8-112.2-285.1c-5-16.1-19.9-27.2-36.8-27.2H281.2c-17 0-32 11.3-36.9 27.6L139.4 443l-.3.7-.2.8c-1.3 4.9-1.7 9.9-1 14.8-.1 1.6-.2 3.2-.2 4.8V830a60.9 60.9 0 0060.8 60.8h627.2c33.5 0 60.8-27.3 60.9-60.8V464.1c0-1.3 0-2.6-.1-3.7.4-4.9 0-9.6-1.3-14.1zm-295.8-43l-.3 15.7c-.8 44.9-31.8 75.1-77.1 75.1-22.1 0-41.1-7.1-54.8-20.6S436 441.2 435.6 419l-.3-15.7H229.5L309 210h406.2l81.4 193.3H589.4zm-375 76.8h157.3c24.3 57.1 76 90.8 140.4 90.8 33.7 0 65-9.4 90.3-27.2 22.2-15.6 39.5-37.4 50.7-63.6h156.5V814H214.4V480.1z"/></svg>';

const SUBJECT_OPTIONS = [
  { value: 'asesoria', label: 'Agendar una asesoria' },
  { value: 'cotizacion', label: 'Solicitar una cotización' },
  { value: 'redes', label: 'Redes sociales' },
  { value: 'mensaje', label: 'Deja un mensaje' },
  { value: 'llamenme', label: 'Llamenme' },
];

const STEPS = [
  { title: 'Requirement Review', description: 'Our team reviews your information and project requirements to select the right expert for your industry.' },
  { title: 'Customized Response', description: 'We prepare a technical response tailored to your business context and LATAM market specifics.' },
  { title: 'Direct Contact', description: "You'll hear from an Adobe Certified Architect via your provided email or phone number." },
];

const BADGES = [
  { text: 'Adobe Platinum Partner', d: '<path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' },
  { text: 'GDPR & LGPD Compliant', d: '<path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 8V12L14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' },
  { text: '24/7 Technical Support', d: '<path d="M3 9H21M6 3H7M17 3H18M12 5V8M12 21C7 21 5 19 5 14V9H19V14C19 19 17 21 12 21Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 16H8.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 16H16.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' },
];

// key filters (mirror the React onKeyDown handlers)
const LETTERS_RE = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]$/;
const PHONE_RE = /^[0-9+\s()-]$/;
const EMAIL_RE = /^[a-zA-Z0-9@._%+-]$/;
const NAV_KEYS = ['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight'];

function keyFilter(re) {
  return (e) => {
    if (e.ctrlKey || e.metaKey || e.key.length > 1) return;
    if (!re.test(e.key) && !NAV_KEYS.includes(e.key)) e.preventDefault();
  };
}

function pasteSanitize(type) {
  const map = {
    letters: /[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]/g,
    numbers: /[^0-9+\s()-]/g,
    email: /[^a-zA-Z0-9@._%+-]/g,
    text: /[<>{}[\]\\`;'"&]/g,
  };
  return (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData('text');
    const clean = pasted.replace(map[type], '');
    const input = e.target;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    input.value = input.value.slice(0, start) + clean + input.value.slice(end);
    input.setSelectionRange(start + clean.length, start + clean.length);
  };
}

/** builds a labelled field with an optional prefix icon */
function field({
  name, label, icon, placeholder, type = 'text',
}) {
  const item = document.createElement('div');
  item.className = 'form-item';
  item.innerHTML = `<label class="form-label" for="cf-${name}">${label}</label>`;

  const wrap = document.createElement('div');
  wrap.className = 'input-wrap';
  if (icon) wrap.insertAdjacentHTML('beforeend', `<span class="input-prefix">${ICONS[icon]}</span>`);

  let input;
  if (type === 'textarea') {
    input = document.createElement('textarea');
    input.rows = 8;
    input.maxLength = 500;
  } else if (type === 'select') {
    input = document.createElement('select');
    input.innerHTML = `<option value="" disabled selected>${placeholder}</option>${
      SUBJECT_OPTIONS.map((o) => `<option value="${o.value}">${o.label}</option>`).join('')}`;
  } else {
    input = document.createElement('input');
    input.type = 'text';
    input.placeholder = placeholder;
  }
  input.id = `cf-${name}`;
  input.name = name;
  input.required = true;
  wrap.append(input);

  if (type === 'select') wrap.insertAdjacentHTML('beforeend', `<span class="select-arrow">${ICONS.down}</span>`);

  const error = document.createElement('div');
  error.className = 'form-error';

  item.append(wrap, error);
  return { item, input, error };
}

function buildForm(block, endpoint, onSuccess) {
  const root = document.createElement('div');
  root.className = 'form-contact-pn';
  root.innerHTML = `
    <div class="fc-pn-header">
      <div class="title">Contáctanos</div>
      <div class="subtitle">Déjanos tus datos y uno de nuestros especialistas se comunicará contigo</div>
    </div>`;

  const form = document.createElement('form');
  form.className = 'form-pn';
  form.noValidate = true;

  const fName = field({
    name: 'name', label: 'Nombre Completo', icon: 'user', placeholder: 'Nombre Completo',
  });
  const fEmail = field({
    name: 'email', label: 'Correo electrónico', icon: 'mail', placeholder: 'correo@empresa.com',
  });
  const fCompany = field({
    name: 'company', label: 'Empresa', icon: 'build', placeholder: 'Mi Empresa',
  });
  const fPhone = field({
    name: 'phone', label: 'Teléfono', icon: 'phone', placeholder: '+52 0123456789',
  });
  const fSubject = field({
    name: 'subject', label: 'Asunto', icon: 'tag', placeholder: 'Selecciona el motivo de tu mensaje', type: 'select',
  });
  const fComment = field({
    name: 'comment', label: 'Comentario', placeholder: 'Cuéntanos sobre tu proyecto o consulta...', type: 'textarea',
  });

  // key + paste guards
  fName.input.addEventListener('keydown', keyFilter(LETTERS_RE));
  fName.input.addEventListener('paste', pasteSanitize('letters'));
  fCompany.input.addEventListener('keydown', keyFilter(LETTERS_RE));
  fCompany.input.addEventListener('paste', pasteSanitize('letters'));
  fEmail.input.addEventListener('keydown', keyFilter(EMAIL_RE));
  fEmail.input.addEventListener('paste', pasteSanitize('email'));
  fPhone.input.addEventListener('keydown', keyFilter(PHONE_RE));
  fPhone.input.addEventListener('paste', pasteSanitize('numbers'));
  fPhone.input.maxLength = 14;
  fComment.input.addEventListener('paste', pasteSanitize('text'));

  // char counter for the comment
  const counter = document.createElement('div');
  counter.className = 'char-count';
  counter.textContent = '0 / 500';
  fComment.item.append(counter);
  fComment.input.addEventListener('input', () => {
    counter.textContent = `${fComment.input.value.length} / 500`;
  });

  form.append(fName.item, fEmail.item, fCompany.item, fPhone.item, fSubject.item, fComment.item);

  const btn = document.createElement('button');
  btn.type = 'submit';
  btn.className = 'btn-red';
  btn.textContent = 'Enviar mensaje';
  form.append(btn);

  const setError = (f, msg) => {
    f.error.textContent = msg || '';
    f.item.classList.toggle('has-error', !!msg);
  };

  const validate = () => {
    let ok = true;
    const req = (f, msg) => { if (!f.input.value.trim()) { setError(f, msg); ok = false; } else setError(f, ''); };
    req(fName, 'Por favor ingresa tu nombre');
    req(fEmail, 'Por favor ingresa tu correo electrónico');
    if (fEmail.input.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fEmail.input.value.trim())) {
      setError(fEmail, 'Ingresa un correo electrónico válido'); ok = false;
    }
    req(fCompany, 'Por favor ingresa el nombre de tu empresa');
    // phone: required + digit-count + leading-plus rules
    const phone = fPhone.input.value.trim();
    if (!phone) { setError(fPhone, 'Por favor ingresa tu teléfono'); ok = false; } else {
      const digits = phone.replace(/[+\s()-]/g, '');
      if (phone.indexOf('+') > 0) { setError(fPhone, 'El símbolo + solo puede ir al inicio'); ok = false; } else if (digits.length < 10) { setError(fPhone, 'El teléfono debe tener al menos 10 dígitos'); ok = false; } else if (digits.length > 12) { setError(fPhone, 'El teléfono no puede tener más de 12 dígitos'); ok = false; } else setError(fPhone, '');
    }
    req(fSubject, 'Por favor selecciona un asunto');
    req(fComment, 'Por favor ingresa un comentario');
    return ok;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;
    btn.classList.add('loading');
    btn.disabled = true;
    const payload = {
      name: fName.input.value.trim().slice(0, 120),
      email: fEmail.input.value.trim().slice(0, 254),
      company: fCompany.input.value.trim().slice(0, 160),
      phone: fPhone.input.value.trim().slice(0, 40),
      subject: fSubject.input.value.trim().slice(0, 180),
      comment: fComment.input.value.trim().slice(0, 500),
    };
    try {
      if (endpoint) {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Request failed');
      }
      onSuccess();
    } catch {
      btn.classList.remove('loading');
      btn.disabled = false;
      let toast = root.querySelector('.form-toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.className = 'form-toast';
        root.prepend(toast);
      }
      toast.textContent = 'Hubo un error al enviar el mensaje. Por favor, intenta nuevamente.';
    }
  });

  root.append(form);
  return root;
}

function buildThankYou() {
  const root = document.createElement('div');
  root.className = 'thankyou-pn';
  root.innerHTML = `
    <div class="thankyou-icon">
      <div class="icon-outer"><div class="icon-inner"><span class="check">✓</span></div></div>
      <h1 class="title">Thank You for Your Interest</h1>
      <p class="subtitle">Your consultation request has been received. Our Adobe Platinum experts are already reviewing your project goals.</p>
    </div>
    <div class="center-container mt-10">
      <div class="thankyou-card">
        <div class="card-title"><span class="card-icon">${PROFILE_ICON}</span>What Happens Next</div>
        <ol class="custom-steps">
          ${STEPS.map((s) => `<li class="step-item"><div class="step-title">${s.title}</div><div class="step-desc">${s.description}</div></li>`).join('')}
        </ol>
      </div>
    </div>
    <div class="center-container mt-10">
      <div class="thankyou-callout">
        <div class="callout-content">
          <span class="callout-icon">⚡</span>
          <div class="callout-text">
            <div class="callout-title">Expected Response Time: 2 Hours</div>
            <div class="callout-subtitle">During business hours (9AM-6PM LATAM time, Mon-Fri)</div>
          </div>
        </div>
      </div>
    </div>
    <div class="center-container mt-10">
      <div class="thankyou-actions">
        <button class="btn-outline-cyan">Explore Our Insights</button>
        <button class="btn-outline-green">View Case Studies</button>
        <a class="btn-red" href="/">Return to Home</a>
      </div>
    </div>
    <div class="center-container mt-10">
      <div class="thankyou-trust">
        <span class="trust-title">Questions?</span>
        <p class="trust-text">Check our FAQ or reach out directly via our contact page. We're here to help clarify any questions about your digital transformation roadmap and Adobe ecosystem strategy.</p>
        <a href="/" class="trust-link">Still have questions? Click here</a>
      </div>
    </div>
    <div class="thankyou-badges mt-10">
      ${BADGES.map((b) => `<div class="badge"><div class="badge-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">${b.d}</svg></div><p class="badge-text">${b.text}</p></div>`).join('')}
    </div>`;
  return root;
}

export default function decorate(block) {
  const endpoint = block.dataset.endpoint || block.closest('.section')?.dataset.endpoint || '';

  const shell = document.createElement('div');
  shell.className = 'contact-pn';
  const inner = document.createElement('div');
  inner.className = 'bg-pn-dot py-12 px-12';
  shell.append(inner);

  const showThankYou = () => {
    inner.textContent = '';
    inner.append(buildThankYou());
    inner.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  inner.append(buildForm(block, endpoint, showThankYou));

  block.textContent = '';
  block.append(shell);
}
