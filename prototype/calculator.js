{
  const demoRates = {
    wedding: { label: 'Свадьба', perGuest: 4200 },
    corporate: { label: 'Корпоратив', perGuest: 3800 },
    birthday: { label: 'День рождения', perGuest: 3400 },
  };
  const fullServiceRate = 45000;
  const money = new Intl.NumberFormat('ru-RU', {
    style: 'currency', currency: 'RUB', maximumFractionDigits: 0,
  });
  const dateFormat = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'long' });
  const venueDate = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Yekaterinburg', year: 'numeric', month: '2-digit', day: '2-digit',
  });
  const form = document.getElementById('calculator');
  const { event: eventType, guests, guestRange, fullService, eventDate } = form.elements;
  const estimate = document.getElementById('estimate');
  const showApplication = document.getElementById('show-application');
  const application = document.getElementById('application');
  const transfer = document.getElementById('transfer-application');
  const destination = new URL(transfer.href);
  const requestForm = document.querySelector('[data-request]');
  const serviceLine = document.getElementById('service-line');
  const summary = {
    format: document.getElementById('summary-format'),
    guests: document.getElementById('summary-guests'),
    rate: document.getElementById('summary-rate'),
    service: document.getElementById('summary-service'),
  };
  const request = {
    format: document.getElementById('application-format'),
    guests: document.getElementById('application-guests'),
    date: document.getElementById('application-date'),
    service: document.getElementById('application-service'),
    estimate: document.getElementById('application-estimate'),
  };
  eventDate.min = venueDate.format(new Date());
  const requestedEvent = new URLSearchParams(window.location.search).get('event');
  if (Object.hasOwn(demoRates, requestedEvent)) eventType.value = requestedEvent;

  function render() {
    const rate = demoRates[eventType.value];
    const guestCount = guestRange.valueAsNumber;
    const serviceCost = fullService.checked ? fullServiceRate : 0;
    const total = money.format(rate.perGuest * guestCount + serviceCost);

    if (estimate.value !== total) estimate.value = total;
    summary.format.textContent = rate.label;
    summary.guests.textContent = guestCount;
    summary.rate.textContent = money.format(rate.perGuest);
    summary.service.textContent = money.format(serviceCost);
    serviceLine.hidden = !fullService.checked;

    request.format.textContent = rate.label;
    request.guests.textContent = guestCount;
    request.date.textContent = eventDate.validity.valid && eventDate.value
      ? dateFormat.format(new Date(eventDate.value + 'T12:00:00')) : 'Уточняется';
    request.service.textContent = fullService.checked ? 'Да' : 'Нет';
    request.estimate.textContent = total;
  }

  guests.addEventListener('input', () => {
    if (guests.validity.valid) guestRange.value = guests.value;
  });
  guests.addEventListener('change', () => {
    const count = guests.valueAsNumber;
    guests.value = Number.isFinite(count)
      ? Math.max(Number(guests.min), Math.min(Number(guests.max), Math.round(count)))
      : guestRange.value;
    guestRange.value = guests.value;
    render();
  });
  guestRange.addEventListener('input', () => { guests.value = guestRange.value; });
  form.addEventListener('input', render);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    render();
    application.hidden = false;
    showApplication.setAttribute('aria-expanded', 'true');
    application.focus();
  });
  transfer.addEventListener('click', () => {
    const params = {
      event: eventType.value,
      guests: guestRange.value,
      date: eventDate.validity.valid ? eventDate.value : '',
      fullService: fullService.checked ? '1' : '0',
    };
    if (requestForm) {
      for (const [name, value] of Object.entries(params)) {
        const field = requestForm.elements[name];
        if (name === 'fullService') field.checked = value === '1';
        else field.value = value;
      }
      requestForm.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      destination.search = new URLSearchParams(params);
      transfer.href = destination.href;
    }
  });
  document.getElementById('edit-calculation').addEventListener('click', () => {
    application.hidden = true;
    showApplication.setAttribute('aria-expanded', 'false');
    showApplication.focus();
  });
  showApplication.disabled = false;
  render();
}
