import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const address = 'Пермь, ул. Космонавта Леонова, 61/1';
const mapUrl = 'https://yandex.ru/maps/?text=' + encodeURIComponent(address);
const routes = [
  ['weddings', 'Свадьбы'],
  ['corporate', 'Корпоративы'],
  ['spaces', 'Пространства'],
  ['menu', 'Кухня и меню'],
  ['gallery', 'Фото и видео'],
  ['stay', 'Проживание'],
  ['prices', 'Цены и услуги'],
  ['contacts', 'Контакты'],
];
const spaces = [
  { id: 'dome', title: 'Купольный шатёр', file: 'dome.webp', note: 'До 150 гостей', text: 'Банкетная рассадка, свет и звук. Подходит для свадеб, корпоративов и больших праздников.' },
  { id: 'summer', title: 'Летняя площадка', file: 'dance.webp', note: 'Вечеринка на улице', text: 'Открытая площадка для танцев, диджей-сетов и вечерней программы со светом и звуком.' },
  { id: 'verandas', title: 'Веранды', file: 'veranda.webp', note: 'Для встреч и отдыха', text: 'Крытые зоны для общения, встречи гостей и паузы между частями программы.' },
  { id: 'outdoors', title: 'Под открытым небом', file: 'grounds.webp', note: 'Зелёная территория', text: 'Пространство для выездной церемонии, фотозон и праздника среди деревьев.' },
];
const gifts = [
  ['tesla.webp', 'Tesla с водителем', 'Автомобиль с личным водителем на весь день свадьбы.'],
  ['couple.webp', 'Номер для молодожёнов', 'После праздника можно остаться на площадке.'],
  ['spa.webp', 'Хамам и бассейн', 'Три часа отдыха на следующий день после свадьбы.'],
];
const pictures = [
  ['dome.webp', 'Сервировка в купольном шатре', 'weddings'],
  ['dancing-guests.webp', 'Вечерний ужин под гирляндами', 'weddings'],
  ['dance.webp', 'Танцы под открытым небом', 'parties'],
  ['grounds.webp', 'Столы среди деревьев', 'venue'],
  ['veranda.webp', 'Вечер на веранде', 'venue'],
  ['room.webp', 'Гостевой номер', 'venue'],
];

function photo(base, file, alt, css = '') {
  return `<img class="${css}" src="${base}prototype/${file}" alt="${alt}" loading="lazy" decoding="async">`;
}

function link(href, label, css = 'text-link') {
  return `<a class="${css}" href="${href}">${label}</a>`;
}

function navLinks(base, current, css) {
  return routes.map(([id, name], index) =>
    `<a href="${base}${id}/" class="${css}" style="--i:${index}"${id === current ? ' aria-current="page"' : ''}>${name}</a>`
  ).join('\n');
}

function header(base, current) {
  const primaryRoutes = routes.filter(([id]) => ['weddings', 'corporate', 'spaces', 'contacts'].includes(id));
  return `
  <a class="skip" href="#main">К содержанию</a>
  <header class="site-header"${current ? ' data-light' : ''}>
    <div class="nav-pill">
      <div class="nav-glass glass glass-nav" aria-hidden="true"></div>
      <a class="nav-logo" href="${base}" aria-label="Случайности, главная">
        <img src="${base}prototype/wordmark-light.svg" width="1376" height="222" alt="">
        <img class="nav-logo-dark" src="${base}prototype/wordmark.svg" width="1376" height="222" alt="">
      </a>
      <nav class="nav-links" aria-label="Основное меню">
        ${primaryRoutes.map(([id, name], index) =>
          `<a class="nav-item" style="--i:${index}" href="${base}${id}/"${id === current ? ' aria-current="page"' : ''}>${name}</a>`
        ).join('\n')}
      </nav>
      <a class="nav-item nav-cta primary" style="--i:4" href="${base}contacts/#request">Выбрать дату</a>
      <button class="nav-burger" type="button" aria-label="Открыть меню" aria-haspopup="dialog" aria-controls="mobile-menu" aria-expanded="false"><span></span><span></span></button>
    </div>
  </header>
  <dialog class="nav-dialog" id="mobile-menu" aria-label="Меню">
    <div class="dialog-header">
      <a href="${base}" aria-label="Случайности, главная"><img src="${base}prototype/wordmark-light.svg" width="1376" height="222" alt=""></a>
      <button class="icon-button" type="button" data-close aria-label="Закрыть меню"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button>
    </div>
    <nav aria-label="Все страницы">${navLinks(base, current, 'dialog-link')}</nav>
    ${link(base + 'contacts/#request', 'Выбрать дату', 'primary')}
  </dialog>`;
}

function footer(base, current) {
  return `<footer class="site-footer">
    <div class="frame footer-inner">
      <div><a href="${base}" aria-label="Случайности, главная"><img src="${base}prototype/wordmark-light.svg" width="1376" height="222" alt=""></a><address>${address}</address></div>
      <nav aria-label="Разделы сайта">${navLinks(base, current, 'footer-link')}</nav>
    </div>
  </footer>`;
}

function layout({ title, description, base = './', current = '', body, home = false }) {
  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#30282d">
  <meta name="robots" content="noindex">
  <meta name="description" content="${description}">
  <title>${title}</title>
  ${home ? '<link rel="preload" href="prototype/hero-background.webp" as="image">' : ''}
  <link rel="stylesheet" href="${base}prototype/site-effects.css">
  <link rel="stylesheet" href="${base}prototype/site.css">
  <script src="${base}prototype/site.js" defer></script>
</head>
<body${home ? ' class="home-page"' : ''}>
  <div class="site-grain" aria-hidden="true"></div>
  <svg class="glass-definition" width="0" height="0" aria-hidden="true" focusable="false">
    <filter id="de-liquid" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feImage id="liquid-map" x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map"/>
      <feDisplacementMap in="SourceGraphic" in2="map" scale="32" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
  </svg>
  ${header(base, current)}
  <main id="main">${body}</main>
  ${footer(base, current)}
</body>
</html>
`;
}

function spaceGallery(base) {
  return `<section class="frame section spaces" id="spaces" aria-labelledby="spaces-title">
    <h2 id="spaces-title">Выберите своё пространство</h2>
    <div class="space-strip" data-spaces data-active="0">
      ${spaces.map((item, index) => `<div class="space-tile">
        <button type="button" class="space-pick" aria-pressed="${index === 0}" aria-controls="space-details" data-space="${index}">
          ${photo(base, item.file, '')}
          <span>${item.title}</span>
        </button>
      </div>`).join('\n')}
    </div>
    <div id="space-details" class="space-details">
      ${spaces.map((item, index) => `<div class="space-info" data-space-info="${index}"${index ? ' hidden' : ''}>
        <div><h3>${item.note}</h3><p>${item.text}</p></div>
        ${link(base + 'spaces/#' + item.id, 'Подробнее', 'primary sage')}
      </div>`).join('\n')}
    </div>
  </section>`;
}

function giftGallery(base) {
  return `<div class="gift-gallery">${gifts.map(([file, title, description]) => `<article class="gift">
    ${photo(base, file, '')}<h3>${title}</h3><p>${description}</p>
  </article>`).join('\n')}</div>`;
}

function feature({ base = './', id = '', title, text, file, alt, href, action, variant = '' }) {
  return `<section${id ? ` id="${id}"` : ''} class="feature-section ${variant}">
    <div class="frame section feature">
      ${photo(base, file, alt, 'feature-image')}
      <div class="feature-copy" data-reveal><h2>${title}</h2><p>${text}</p>
      ${href ? link(href, action) : ''}</div>
    </div>
  </section>`;
}

function mapLink() {
  return `<a class="map-link" href="${mapUrl}" target="_blank" rel="noopener">
    <svg viewBox="0 0 64 64" aria-hidden="true"><path d="M4 51c14-23 28-4 40-23M7 14c16 5 17 22 39 23M23 59c0-16 23-24 33-32M9 38c5-9 11-11 23-20" fill="none" stroke="currentColor" opacity=".34"/><path d="M42 18a10 10 0 0 1 20 0c0 9-10 17-10 17S42 27 42 18Z" fill="currentColor"/><circle cx="52" cy="18" r="3.8" fill="#f9f2ee"/></svg>
    <span>Открыть на карте</span>
  </a>`;
}

function location() {
  return `<section class="location" id="location" aria-labelledby="location-title">
    <div class="location-inner frame section">
      <div data-reveal>
        <h2 id="location-title">Ближе, чем вы думаете</h2>
        <p class="distance"><strong>12</strong> минут</p><p class="origin">от центра Перми</p>
        <address>${address}</address>
        <ul class="location-facts"><li>Парковка на 20 машин</li><li>Праздники под открытым небом</li></ul>
      </div>
      <div class="location-visual">
        ${photo('./', 'grounds.webp', 'Банкетные столы среди деревьев', 'location-image')}
        ${mapLink()}
      </div>
    </div>
  </section>`;
}

function requestForm(base) {
  return `<section class="request-section" id="request" aria-labelledby="request-title">
    <div class="frame section request-layout">
      <div><h2 id="request-title">Давайте устроим вашу случайность</h2>
        <p>Подготовьте параметры праздника, чтобы обсудить их с командой площадки.</p>
        ${link(base + 'prototype/calculator.html', 'Открыть пример расчёта')}
      </div>
      <form class="request-form" data-request>
        <fieldset disabled>
        <div class="request-fields">
          <div><label for="request-event">Формат</label><select id="request-event" name="event"><option value="wedding">Свадьба</option><option value="corporate">Корпоратив</option><option value="birthday">День рождения</option><option value="other">Другое событие</option></select></div>
          <label>Количество гостей<input name="guests" type="number" inputmode="numeric" min="1" max="150" required></label>
          <label>Желаемая дата<input name="date" type="date"></label>
          <label>Имя <small>по желанию</small><input name="contact" autocomplete="given-name" maxlength="80"></label>
          <label>Телефон <small>по желанию</small><input name="phone" type="tel" autocomplete="tel" maxlength="28"></label>
          <label class="request-check"><input type="checkbox" name="fullService">Организация под ключ</label>
        </div>
        <p class="form-note">Черновик можно скачать. Данные остаются в браузере до скачивания.</p>
        <button class="primary sage" type="submit">Подготовить заявку</button>
        </fieldset>
        <noscript><p class="form-note">Для подготовки черновика включите JavaScript.</p></noscript>
        <div class="request-result" data-request-result hidden>
          <p role="status" data-request-status></p>
          <a class="text-link" data-request-download download="sluchaynosti-request.txt">Скачать черновик</a>
        </div>
      </form>
    </div>
  </section>`;
}

function gallery(base, full = false) {
  const controls = full ? `<div class="gallery-filters" aria-label="Категории фотографий">
    ${[['all', 'Все'], ['weddings', 'Свадьбы'], ['corporate', 'Корпоративы'], ['parties', 'Вечеринки'], ['venue', 'Площадка']].map(([key, label]) =>
      `<button type="button" data-filter="${key}" aria-pressed="${key === 'all'}">${label}</button>`).join('')}
  </div>` : '';
  return `<div class="gallery" data-gallery>${controls}
    <div class="photo-grid">${(full ? pictures : pictures.slice(0, 3)).map(([file, title, tag]) => `<figure data-photo-group="${tag}">
      <button type="button" data-photo data-src="${base}prototype/${file}" data-caption="${title}" aria-label="Увеличить фото: ${title}">${photo(base, file, title)}</button>
      <figcaption>${title}</figcaption>
    </figure>`).join('\n')}</div>
    <p data-gallery-empty role="status" hidden>Фотографии в этой категории пока не добавлены.</p>
    <dialog class="photo-dialog" aria-label="Просмотр фотографий">
      <button class="icon-button close-photo" type="button" data-close aria-label="Закрыть фото"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button>
      <img alt=""><div class="photo-controls"><button type="button" data-prev aria-label="Предыдущее фото">←</button><p></p><button type="button" data-next aria-label="Следующее фото">→</button></div>
    </dialog>
  </div>`;
}

function home() {
  return layout({
    title: 'Случайности · Банкетная площадка в Перми',
    description: 'Свадьбы, корпоративы и события в 12 минутах от центра Перми.',
    home: true,
    body: `
    <section class="hero" aria-labelledby="hero-title">
      <img class="hero-photo" src="prototype/hero-background.webp" width="1586" height="992" fetchpriority="high" alt="">
      <div class="hero-shade" aria-hidden="true"></div>
      <div class="cloud-seam" aria-hidden="true"><span></span><span></span></div>
      <div class="frame hero-content">
        <h1 id="hero-title"><span>Случайности,</span><span>которые становятся</span><span>воспоминаниями</span></h1>
        <p>Свадьбы, корпоративы и события<br>в 12 минутах от центра Перми</p>
        <div class="actions">${link('contacts/#request', 'Выбрать дату', 'primary')}${link('#spaces', 'Посмотреть площадку', 'secondary')}</div>
      </div>
    </section>
    ${location()}
    ${spaceGallery('./')}
    <section class="gifts-section" id="gifts">
      <div class="frame section"><div class="section-intro" data-reveal><h2>Свадебные подарки от «Случайностей»</h2>
      ${link('weddings/#gifts', 'Все свадебные подарки')}</div>${giftGallery('./')}</div>
    </section>
    ${feature({ id: 'kitchen', title: 'Своя кухня', text: 'Готовим горячие блюда прямо на площадке. Составляем меню под формат праздника и подаём блюда к столу.', file: 'kitchen.webp', alt: 'Повар готовит блюда на кухне', href: 'menu/', action: 'Посмотреть меню' })}
    ${feature({ id: 'production', title: 'Здесь праздник звучит по-настоящему', text: 'Свет, звук, экраны и уличная дискотека. Диджеи и техническая команда помогают собрать программу под ваш формат.', file: 'dance.webp', alt: 'Танцы перед сценой на открытом воздухе', href: 'corporate/#production', action: 'Технические возможности', variant: 'feature-dark reversed' })}
    ${feature({ id: 'team', title: 'От идеи до последнего танца', text: 'Персональный менеджер, ведущие, артисты, декор и сценарий. Можно доверить команде весь праздник или выбрать отдельные услуги.', file: 'team.webp', alt: 'Координатор готовит банкетный зал', href: 'prices/', action: 'Обсудить мероприятие' })}
    ${feature({ id: 'stay', title: 'Праздник закончился. Отдых продолжается.', text: 'На площадке семь номеров. Гости могут остаться после вечеринки, а молодожёнов ждёт отдельный номер.', file: 'room.webp', alt: 'Светлый гостевой номер', href: 'stay/', action: 'Посмотреть проживание', variant: 'feature-soft reversed' })}
    <section class="section frame" id="gallery"><div class="section-intro" data-reveal><h2>Здесь уже случилось счастье</h2>${link('gallery/', 'Открыть галерею')}</div>${gallery('./')}</section>
    ${requestForm('./')}`,
  });
}

function pageIntro(title, text, file) {
  return `<section class="page-intro frame section"><div><h1>${title}</h1><p>${text}</p></div>${file ? photo('../', file, '', 'page-image') : ''}</section>`;
}

function page(id, title, description, body) {
  return layout({ title: title + ' · Случайности', description, base: '../', current: id, body });
}

const pages = {
  weddings: page('weddings', 'Свадьбы', 'Свадьба в купольном шатре или под открытым небом в Перми.',
    pageIntro('Свадьбы', 'Церемония на зелёной территории, банкет под куполом и отдых после праздника. Соберём программу вокруг вашей даты.', 'dome.webp') +
    `<section class="gifts-section" id="gifts"><div class="frame section"><h2>Три подарка к вашей свадьбе</h2>${giftGallery('../')}<p class="fine-print">Доступность подарков и условия уточняются при обсуждении даты.</p></div></section>
    <section class="frame section prose"><h2>Как проходит свадьба</h2><details><summary>Где провести церемонию?</summary><p>На зелёной территории можно устроить выездную регистрацию и фотозону.</p></details>
    <details><summary>Сколько гостей помещается под куполом?</summary><p>В купольном шатре можно принять до 150 гостей. Рассадку обсудим под формат банкета.</p></details>
    <details><summary>Можно остаться после свадьбы?</summary><p>На площадке семь гостевых номеров, в том числе отдельный номер для молодожёнов.</p></details>${link('../contacts/?event=wedding#request', 'Обсудить свадьбу', 'primary sage')}</section>`),
  corporate: page('corporate', 'Корпоративы и праздники', 'Площадки и техническая команда для корпоративных мероприятий в Перми.',
    pageIntro('Корпоративы и праздники', 'Деловая встреча, ужин для команды или вечеринка на воздухе. На площадке есть пространства для разных частей одного события.', 'dance.webp') +
    feature({ base: '../', id: 'production', title: 'Свет, звук и программа', text: 'Подбираем оборудование под формат мероприятия. Можно запланировать выступления, экран для презентаций, диджей-сет и танцы под открытым небом.', file: 'dancing-guests.webp', alt: 'Вечернее событие на открытом воздухе', href: '../contacts/?event=corporate#request', action: 'Подготовить запрос', variant: 'feature-dark' }) +
    `<section class="frame section prose"><h2>Организация под ключ</h2><p>Менеджер помогает со сценарием, ведущими, декором, кухней и техническим сопровождением.</p>${link('../prices/', 'Услуги и расчёт')}</section>`),
  spaces: page('spaces', 'Наши пространства', 'Купольный шатёр, летняя площадка, веранды и зелёная территория.',
    pageIntro('Наши пространства', 'Четыре зоны для церемоний, банкетов и вечеринок в 12 минутах от центра Перми.') +
    spaces.map((item, index) => feature({ base: '../', id: item.id, title: item.title, text: item.text, file: item.file, alt: item.title, href: '../contacts/#request', action: 'Уточнить дату и условия', variant: index % 2 ? 'reversed feature-soft' : '' })).join('')),
  menu: page('menu', 'Кухня и меню', 'Собственная кухня и индивидуальное меню для вашего мероприятия.',
    pageIntro('Кухня и меню', 'Повара работают на площадке. Горячие блюда готовятся к подаче, меню согласовывается под ваше событие.', 'kitchen.webp') +
    `<section class="frame section prose"><h2>Составим меню под ваш формат</h2><dl class="service-list">
    <div><dt>Банкет</dt><dd>Обсудим подачу, состав меню и порядок смены блюд.</dd></div>
    <div><dt>Фуршет</dt><dd>Подберём формат подачи для встречи гостей или перерыва между выступлениями.</dd></div>
    <div><dt>Пожелания гостей</dt><dd>Особые требования к блюдам можно указать при обсуждении меню.</dd></div></dl>
    ${link('../contacts/#request', 'Обсудить меню', 'primary sage')}</section>`),
  gallery: page('gallery', 'Фото и видео', 'Фотографии свадебных и вечерних форматов и пространств площадки.',
    pageIntro('Фото и видео', 'Загляните в купол, на летнюю площадку и в гостевые зоны.') +
    `<section class="frame section gallery-page" aria-label="Галерея">${gallery('../', true)}<p class="fine-print">В подборке используются иллюстративные кадры.</p></section>`),
  stay: page('stay', 'Проживание', 'Семь гостевых номеров на банкетной площадке в Перми.',
    pageIntro('Проживание', 'Семь номеров для тех, кто хочет остаться после праздника. Для молодожёнов предусмотрен отдельный номер.', 'room.webp') +
    feature({ base: '../', title: 'Отдых после свадьбы', text: 'Гостям можно запланировать размещение на площадке. Молодожёны могут обсудить номер и отдых с друзьями в хамаме и бассейне на следующий день.', file: 'spa.webp', alt: 'Хамам с бассейном', href: '../weddings/#gifts', action: 'Свадебные подарки', variant: 'feature-soft' })),
  prices: page('prices', 'Цены и услуги', 'Расчёт по формату мероприятия, числу гостей и набору услуг.',
    pageIntro('Цены и услуги', 'Стоимость рассчитывается индивидуально по формату, дате, числу гостей и выбранным услугам.') +
    `<section class="frame section prose"><h2>Что входит в расчёт</h2><dl class="service-list">
    <div><dt>Площадка</dt><dd>Пространство, дата и вариант рассадки.</dd></div>
    <div><dt>Кухня</dt><dd>Банкет или фуршет, состав меню, число гостей.</dd></div>
    <div><dt>Организация</dt><dd>Сценарий, декор, техническое сопровождение и команда.</dd></div></dl>
    <div class="actions">${link('../prototype/calculator.html', 'Открыть пример калькулятора', 'primary sage')}${link('../contacts/#request', 'Подготовить заявку')}</div></section>`),
  contacts: page('contacts', 'Контакты', 'Адрес банкетной площадки Случайности и параметры заявки.',
    pageIntro('Контакты', address) +
    `<section class="frame contact-map" aria-label="Адрес на карте">${mapLink()}</section>` + requestForm('../')),
};

for (const [file, html] of [['index.html', home()], ...Object.entries(pages).map(([id, html]) => [id + '/index.html', html])]) {
  const destination = resolve(root, file);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, html.replace(/[ \t]+$/gm, ''), 'utf8');
}
