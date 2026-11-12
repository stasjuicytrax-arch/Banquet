const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

// The displacement map and filter strength are carried over from DIGITAL EVENTS.
const bezel = 32;
const map = `<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256' viewBox='0 0 256 256'>
<defs>
<linearGradient id='x' x1='0' x2='1' y1='0' y2='0'><stop offset='0' stop-color='#000'/><stop offset='1' stop-color='#f00'/></linearGradient>
<linearGradient id='y' x1='0' x2='0' y1='0' y2='1'><stop offset='0' stop-color='#000'/><stop offset='1' stop-color='#0f0'/></linearGradient>
<filter id='b'><feGaussianBlur stdDeviation='${bezel / 3}'/></filter>
</defs>
<rect width='256' height='256' fill='url(#x)'/>
<rect width='256' height='256' fill='url(#y)' style='mix-blend-mode:screen'/>
<rect x='${bezel}' y='${bezel}' width='${256 - bezel * 2}' height='${256 - bezel * 2}' rx='${bezel}' fill='#808000' filter='url(#b)'/>
</svg>`;
document.getElementById('liquid-map').setAttribute('href', 'data:image/svg+xml,' + encodeURIComponent(map));
const chromium = /Chrome\/|Edg\//.test(navigator.userAgent) && !/Firefox\//.test(navigator.userAgent);
if (chromium && CSS.supports('backdrop-filter', 'url(#de-liquid)')) {
  document.documentElement.classList.add('glass-svg');
}

const pill = document.querySelector('.nav-pill');
const header = pill.closest('header');
const logo = pill.querySelector('.nav-logo');
const nav = pill.querySelector('.nav-links');
const navAction = pill.querySelector('.nav-cta');
const burger = pill.querySelector('.nav-burger');
const menu = document.getElementById('mobile-menu');
const wide = matchMedia('(min-width: 1024px)');
let compact = false;
let lastScroll = window.scrollY;
let accumulated = 0;
let scrollFrame = 0;

function measureNav() {
  const logoEnd = logo.offsetLeft + logo.offsetWidth + 8;
  const compactWidth = logoEnd + burger.offsetWidth + 8;
  pill.style.setProperty('--cut', Math.max(0, pill.offsetWidth - compactWidth) + 'px');
  pill.style.setProperty('--dx', Math.max(0, burger.offsetLeft - logoEnd) + 'px');
}

function renderNav() {
  const collapsed = wide.matches && (compact || menu.open);
  pill.toggleAttribute('data-compact', collapsed);
  nav.inert = !wide.matches || collapsed;
  navAction.inert = nav.inert;
  burger.tabIndex = !wide.matches || collapsed ? 0 : -1;
}

const hero = document.querySelector('.hero');
function updateScroll() {
  scrollFrame = 0;
  const scroll = window.scrollY;
  const backdrop = document.elementFromPoint(1, 48);
  header.toggleAttribute('data-light', !backdrop?.closest('.hero, .feature-dark, .site-footer'));
  const dy = scroll - lastScroll;
  lastScroll = scroll;
  if (dy) {
    accumulated = Math.sign(dy) === Math.sign(accumulated) ? accumulated + dy : dy;
    const next = scroll >= 80 && (accumulated >= 80 || (compact && accumulated > -40));
    if (next !== compact) {
      compact = next;
      renderNav();
    }
  }
  if (hero) {
    const shift = reducedMotion.matches ? 0 : Math.min(scroll * .21, window.innerWidth * .11, 110);
    hero.style.setProperty('--cloud-shift', shift + 'px');
  }
}

window.addEventListener('scroll', () => {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
}, { passive: true });
wide.addEventListener('change', () => { measureNav(); renderNav(); });
reducedMotion.addEventListener('change', updateScroll);
new ResizeObserver(measureNav).observe(pill);
measureNav();
renderNav();
updateScroll();

burger.addEventListener('click', () => {
  menu.showModal();
  burger.setAttribute('aria-expanded', 'true');
  menu.querySelector('nav a').focus();
  renderNav();
});
menu.querySelector('[data-close]').addEventListener('click', () => menu.close());
menu.addEventListener('close', () => {
  burger.setAttribute('aria-expanded', 'false');
  renderNav();
  (burger.tabIndex === 0 ? burger : logo).focus();
});

const reveal = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    reveal.unobserve(entry.target);
    if (!reducedMotion.matches) {
      entry.target.animate([
        { opacity: .38, transform: 'translateY(18px)' },
        { opacity: 1, transform: 'none' },
      ], { duration: 680, easing: 'cubic-bezier(.16, 1, .3, 1)' });
    }
  }
}, { threshold: .16 });
document.querySelectorAll('[data-reveal]').forEach((element) => reveal.observe(element));

document.querySelectorAll('[data-spaces]').forEach((strip) => {
  const controls = [...strip.querySelectorAll('[data-space]')];
  const details = [...strip.nextElementSibling.querySelectorAll('[data-space-info]')];
  function select(index) {
    strip.dataset.active = String(index);
    controls.forEach((button, position) => {
      button.setAttribute('aria-pressed', String(position === index));
      details[position].hidden = position !== index;
    });
  }
  controls.forEach((button, index) => {
    button.addEventListener('click', () => select(index));
    button.addEventListener('keydown', (event) => {
      const direction = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
      if (!direction) return;
      event.preventDefault();
      const next = (index + direction + controls.length) % controls.length;
      select(next);
      controls[next].focus();
    });
  });
});

document.querySelectorAll('[data-gallery]').forEach((gallery) => {
  const dialog = gallery.querySelector('dialog');
  const empty = gallery.querySelector('[data-gallery-empty]');
  const pictures = [...gallery.querySelectorAll('[data-photo]')];
  const filters = [...gallery.querySelectorAll('[data-filter]')];
  let visible = pictures;
  let current = 0;
  let trigger;

  function display(index) {
    current = (index + visible.length) % visible.length;
    const { src, caption } = visible[current].dataset;
    const image = dialog.querySelector('img');
    image.src = src;
    image.alt = caption;
    dialog.querySelector('.photo-controls p').textContent = caption;
  }

  pictures.forEach((picture) => picture.addEventListener('click', () => {
    trigger = picture;
    display(visible.indexOf(picture));
    dialog.showModal();
  }));
  filters.forEach((filter) => filter.addEventListener('click', () => {
    filters.forEach((control) => control.setAttribute('aria-pressed', String(control === filter)));
    const category = filter.dataset.filter;
    visible = pictures.filter((picture) => {
      const figure = picture.closest('figure');
      const match = category === 'all' || figure.dataset.photoGroup === category;
      figure.hidden = !match;
      return match;
    });
    empty.hidden = visible.length > 0;
  }));
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-prev]').addEventListener('click', () => display(current - 1));
  dialog.querySelector('[data-next]').addEventListener('click', () => display(current + 1));
  dialog.addEventListener('keydown', (event) => {
    const direction = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
    if (!direction) return;
    event.preventDefault();
    display(current + direction);
  });
  dialog.addEventListener('close', () => trigger?.focus());
});

const eventFormat = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'long' });
const venueDate = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Asia/Yekaterinburg', year: 'numeric', month: '2-digit', day: '2-digit',
});
document.querySelectorAll('[data-request]').forEach((form) => {
  const fields = form.elements;
  const result = form.querySelector('[data-request-result]');
  const status = result.querySelector('[data-request-status]');
  const download = result.querySelector('[data-request-download]');
  const requestedEvent = new URLSearchParams(location.search).get('event');
  let draftUrl;

  fields.date.min = venueDate.format(new Date());
  if ([...fields.event.options].some((option) => option.value === requestedEvent)) {
    fields.event.value = requestedEvent;
  }

  function clearDraft() {
    if (draftUrl) URL.revokeObjectURL(draftUrl);
    draftUrl = undefined;
    result.hidden = true;
  }

  form.addEventListener('input', clearDraft);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    clearDraft();
    const format = fields.event.selectedOptions[0].textContent;
    const date = fields.date.value ? eventFormat.format(new Date(fields.date.value + 'T12:00:00')) : 'уточняется';
    const rows = [
      'Черновик заявки в «Случайности»',
      'Формат: ' + format,
      'Гости: ' + fields.guests.value,
      'Желаемая дата: ' + date,
      'Организация под ключ: ' + (fields.fullService.checked ? 'да' : 'нет'),
    ];
    if (fields.contact.value.trim()) rows.push('Имя: ' + fields.contact.value.trim());
    if (fields.phone.value.trim()) rows.push('Телефон: ' + fields.phone.value.trim());
    draftUrl = URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/plain;charset=utf-8' }));
    download.href = draftUrl;
    result.hidden = false;
    status.textContent = `Черновик готов. ${format}, гостей: ${fields.guests.value}, дата ${date}.`;
  });
  form.querySelector('fieldset').disabled = false;
});
