import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const calculatorFields = await readFile(new URL('./calculator.html', import.meta.url), 'utf8');
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
  {
    id: 'restaurant', title: 'Ресторан', file: 'restaurant-reference.png', guests: 50,
    image: [1536, 1024], imageNote: 'Иллюстрация интерьера',
    imageAlt: 'Длинный банкетный стол в зале ресторана',
    text: 'Для семейного праздника, небольшого банкета или ужина с командой. Меню готовит кухня площадки.',
  },
  {
    id: 'summer', title: 'Летняя площадка', file: 'veranda.png', guests: 60,
    image: [1536, 1024], imageNote: 'Иллюстрация летней площадки',
    imageAlt: 'Гости за столом на крытой площадке среди деревьев',
    text: 'Летний банкет среди зелени, встреча гостей или вечерняя программа на воздухе.',
    aliases: ['verandas', 'outdoors'],
  },
  {
    id: 'dome', title: 'Купольный шатёр', file: 'dome-concept.png', guests: 150,
    image: [1536, 1024], imageNote: 'Визуализация проекта', planned: true,
    imageAlt: 'Геодезический купол с прозрачным фасадом на поляне',
    text: 'На большой поляне планируется купольный шатёр для свадеб, корпоративов и больших банкетов.',
  },
];
const gifts = [
  ['tesla.webp', 'Tesla с водителем', 'Автомобиль с личным водителем на весь день свадьбы.', [1200, 800]],
  ['couple.webp', 'Номер для молодожёнов', 'После праздника можно остаться на площадке.', [1290, 860]],
  ['spa.webp', 'Хамам и бассейн', 'Три часа отдыха на следующий день после свадьбы.', [800, 800]],
];
const pictures = [
  ['dome.webp', 'Пример сервировки в купольном шатре', 'weddings'],
  ['dancing-guests.webp', 'Вечерний ужин под гирляндами', 'weddings'],
  ['dance.webp', 'Танцы под открытым небом', 'parties'],
  ['grounds.webp', 'Столы среди деревьев', 'venue'],
  ['veranda.png', 'Вечер на веранде', 'venue'],
  ['room.webp', 'Гостевой номер', 'venue'],
];

const paperEdges = {
  eveningStart: 'M0 0H1440V42Q1428 36 1414 42L1397 46L1383 44Q1369 47 1356 53Q1348 56 1338 52L1324 50Q1308 46 1297 49L1284 46L1266 47Q1247 45 1235 39L1221 39Q1206 32 1194 38L1178 35Q1165 31 1153 40L1139 42Q1124 51 1108 48L1095 49Q1082 53 1071 50L1058 44Q1047 45 1036 39Q1029 36 1020 43L1005 48L987 48Q971 51 959 46L944 47Q929 48 916 54L904 53Q890 51 878 44L864 43Q851 36 839 41L824 44Q805 43 791 38L777 42Q759 45 748 51L733 51Q719 55 705 49L693 49Q680 56 665 51L652 47L638 48Q625 41 612 38L597 38Q585 39 568 33Q560 29 553 36L540 38Q529 46 515 46L502 48Q483 48 468 44L452 48L436 45Q422 41 412 47L396 50Q381 55 367 52L352 50Q341 55 326 50L312 46Q299 46 287 40L273 41L258 46Q244 42 231 42L216 44Q203 43 187 39L173 42Q160 41 145 36Q134 31 124 37L109 39Q96 44 82 46L68 45Q54 49 40 51L25 48Q12 51 0 49Z',
  eveningEnd: 'M0 52Q13 48 24 44L38 45Q52 41 66 38L79 39Q92 39 108 34Q117 31 126 36L142 41L157 46Q169 43 181 47L194 51Q208 54 223 50L238 49Q253 45 267 50L280 51Q294 49 306 45L318 47Q331 45 348 40L363 40Q380 40 392 35Q399 31 410 37L423 43Q436 48 448 50L463 48L477 54Q491 55 506 51L520 48Q532 42 547 45L561 46Q576 43 592 42L605 45Q617 43 629 38L644 41L655 43Q669 39 676 34Q686 30 698 36L712 41Q727 44 742 44L756 47Q768 51 781 48L797 48Q810 52 825 55Q835 56 848 52L864 53Q877 52 890 48L904 47L919 45Q933 41 946 37L961 38Q976 37 990 33Q1001 29 1009 35L1024 39Q1035 43 1049 46L1064 44Q1081 47 1094 50L1108 47L1125 48Q1138 53 1153 49L1167 47Q1183 48 1199 45Q1210 40 1224 42L1238 42Q1250 36 1261 35L1274 38Q1288 39 1303 45L1319 45L1332 47Q1345 51 1358 52L1373 50Q1387 52 1401 55L1416 52L1440 53V80H0Z',
};

function paperEdge(path, position) {
  return `<svg class="paper-edge paper-edge--${position}" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="${path}"/></svg>`;
}

function photo(base, file, alt, css = '', dimensions) {
  const size = dimensions ? ` width="${dimensions[0]}" height="${dimensions[1]}"` : '';
  return `<img class="${css}" src="${base}prototype/${file}"${size} alt="${alt}" loading="lazy" decoding="async">`;
}

function arrowIcon() {
  return `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 13 13 3M5 3h8v8"/></svg>`;
}

function ornament(name, viewBox, drawing) {
  return `<svg class="${name}" viewBox="${viewBox}" fill="none" aria-hidden="true" focusable="false">${drawing}</svg>`;
}

const brandArc = '<path fill="currentColor" d="M0 24C16 8 36 0 57 0c22 0 42 8 57 24l-14 17c-12-12-27-18-43-18-17 0-31 6-43 18Z"/>';
const spaceIcons = {
  restaurant: '<path d="M5 20h30M8 20c0-7 5-12 12-12s12 5 12 12M20 8V5M4 24h32l-3 4H7z"/>',
  summer: '<path d="M4 15 20 5l16 10M8 15h24M8 28V15m24 0v13M5 28h30M15 28v-7h10v7"/>',
  dome: '<path d="M4 27a16 16 0 0 1 32 0ZM5 23l8-10 7 14 7-14 8 10M13 13h14"/>',
};

function actionLabel(label) {
  return `<span class="sweep-label">${label}</span><span class="sweep-arrow" aria-hidden="true">${arrowIcon()}</span>`;
}

function link(href, label, css = 'text-link sweep-action') {
  return `<a class="${css} sweep-control" href="${href}">${actionLabel(label)}</a>`;
}

function plainButton(href, label) {
  return `<a class="primary tonal plain-button" href="${href}">${label}</a>`;
}

function header(base, current) {
  const primaryRoutes = routes.filter(([id]) => ['weddings', 'corporate', 'spaces', 'contacts'].includes(id));
  return `
  <a class="skip" href="#main">К содержанию</a>
  <header class="site-header"${current ? ' data-light' : ''}>
    <div class="nav-pill">
      <div class="nav-glass glass glass-nav" aria-hidden="true"></div>
      <a class="nav-logo" href="${base}" aria-label="Случайности, главная">
        <img src="${base}prototype/wordmark-light.svg?v=3" width="1376" height="222" alt="">
      </a>
      <nav class="nav-links" aria-label="Основное меню">
        ${primaryRoutes.map(([id, name], index) =>
          `<a class="nav-item" style="--i:${index}" href="${base}${id}/"${id === current ? ' aria-current="page"' : ''}>${name}</a>`
        ).join('\n')}
      </nav>
      <button class="nav-burger" type="button" aria-label="Открыть меню" aria-haspopup="dialog" aria-controls="mobile-menu" aria-expanded="false"><span></span><span></span></button>
    </div>
  </header>
  <dialog class="nav-dialog" id="mobile-menu" aria-label="Меню">
    <div class="dialog-header">
      <a href="${base}" aria-label="Случайности, главная"><img src="${base}prototype/wordmark-light.svg?v=3" width="1376" height="222" alt=""></a>
      <button class="icon-button" type="button" data-close autofocus aria-label="Закрыть меню"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button>
    </div>
    <nav aria-label="Все страницы">
      ${routes.map(([id, name], index) => `<a href="${base}${id}/" class="dialog-link" style="--i:${index}"${id === current ? ' aria-current="page"' : ''}><span class="dialog-index" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span><span>${name}</span>${arrowIcon()}</a>`).join('\n')}
    </nav>
    <div class="dialog-bottom">
      <address>${address}</address>
      <a class="primary plain-button" href="${mapUrl}" target="_blank" rel="noopener">${pinIcon()} Открыть на карте</a>
    </div>
  </dialog>`;
}

function footer(base, current) {
  const groups = [
    ['Поводы', ['weddings', 'corporate']],
    ['Площадка', ['spaces', 'menu', 'stay']],
    ['Подготовка', ['gallery', 'prices', 'contacts']],
  ];
  return `<footer class="site-footer">
    <div class="footer-panel">
      <div class="footer-intro">
        <p>Банкетная площадка в Перми</p>
        <p>Свадьбы, корпоративы и частные праздники.</p>
      </div>
      <nav class="footer-columns" aria-label="Разделы сайта и адрес площадки">
          ${groups.map(([heading, ids]) => `<div class="footer-group">
            <h2>${heading}</h2>
            <ul>${ids.map((id) => {
              const [, label] = routes.find(([route]) => route === id);
              return `<li><a class="footer-link" href="${base}${id}/"${id === current ? ' aria-current="page"' : ''}>${label}</a></li>`;
            }).join('')}</ul>
          </div>`).join('\n')}
        <div class="footer-group footer-visit">
          <h2>Как добраться</h2>
          <address>${address}</address>
          <a class="footer-link footer-map" href="${mapUrl}" target="_blank" rel="noopener">${pinIcon()} Открыть на карте</a>
        </div>
      </nav>
      <img class="footer-watermark" src="${base}prototype/wordmark.svg?v=3" width="1376" height="222" alt="" loading="lazy" decoding="async">
      <div class="footer-bottom">
        <a class="footer-brand" href="${base}"><img src="${base}prototype/wordmark.svg?v=3" width="1376" height="222" alt="Случайности, главная"></a>
        <a class="footer-link" href="${base}#event-calculator">Калькулятор</a>
        <a class="footer-link footer-top" href="#top">Наверх <span aria-hidden="true">↑</span></a>
      </div>
    </div>
  </footer>`;
}

function layout({ title, description, base = './', current = '', body, home = false, calculator = home }) {
  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f9f2ee">
  <meta name="robots" content="noindex">
  <meta name="description" content="${description}">
  <title>${title}</title>
  ${home ? '<link rel="preload" href="prototype/hero-bloom-powder.png" as="image">' : ''}
  <link rel="stylesheet" href="${base}prototype/site-effects.css?v=4">
  <link rel="preload" href="${base}prototype/fonts/manrope-cyrillic.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${base}prototype/fonts/fonts.css?v=2">
  <link rel="stylesheet" href="${base}prototype/site.css?v=20">
  ${home ? '<link rel="stylesheet" href="prototype/hero-bloom.css?v=5">' : ''}
  ${calculator ? `<link rel="stylesheet" href="${base}prototype/calculator.css?v=7">` : ''}
  <script src="${base}prototype/site.js?v=9" defer></script>
  ${home ? `<script src="${base}prototype/vendor/gsap.min.js" defer></script>
  <script src="${base}prototype/vendor/ScrollTrigger.min.js" defer></script>
  <script type="module" src="${base}prototype/venue-3d.js?v=4"></script>
  <script src="${base}prototype/home-motion.js?v=5" defer></script>` : ''}
  ${calculator ? `<script src="${base}prototype/calculator.js" defer></script>` : ''}
</head>
<body id="top"${home ? ' class="home-page"' : ''}>
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
    <div class="spaces-intro">
      <h2 id="spaces-title">Выберите своё пространство</h2>
      <p>Ужин с близкими, летний банкет или большой праздник под куполом.</p>
    </div>
    <div class="space-gallery" data-spaces>
      <div class="space-tabs" role="tablist" aria-label="Пространства площадки">
        ${spaces.map((item, index) => `<button class="space-tab" type="button" role="tab" id="space-tab-${item.id}" aria-selected="${index === 0}" tabindex="${index ? '-1' : '0'}" aria-controls="space-panel-${item.id}">
          <span class="space-tab-icon detail-icon" aria-hidden="true">${ornament('space-symbol', '0 0 40 34', `<g stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round">${spaceIcons[item.id]}</g>`)}</span>
          <span class="space-tab-title">${item.title}</span>
          <span class="space-tab-meta">До ${item.guests} гостей${item.planned ? ' <span>· В проекте</span>' : ''}</span>
        </button>`).join('\n')}
      </div>
      <div class="space-scenes">
        ${spaces.map((item, index) => `<article class="space-scene" id="space-panel-${item.id}" role="tabpanel" tabindex="0" aria-labelledby="space-tab-${item.id}" aria-hidden="${Boolean(index)}"${index ? ' inert' : ''}>
          <figure class="space-scene-media">
            <img src="${base}prototype/${item.file}" width="${item.image[0]}" height="${item.image[1]}" alt="${item.imageAlt}" loading="lazy" decoding="async">
            <figcaption>${item.imageNote}</figcaption>
          </figure>
          <div class="space-scene-copy">
            <p>${item.text}</p>
            ${plainButton(base + 'spaces/#' + item.id, 'Подробнее')}
          </div>
        </article>`).join('\n')}
      </div>
    </div>
    <noscript>${plainButton(base + 'spaces/', 'Посмотреть все пространства')}</noscript>
  </section>`;
}

function giftGallery(base, featuredIcon = '') {
  return `<div class="gift-gallery">${gifts.map(([file, title, description, dimensions], index) => `<article class="gift">
    ${photo(base, file, '', '', dimensions)}${index === 0 ? featuredIcon : ''}<h3>${title}</h3><p>${description}</p>
  </article>`).join('\n')}</div>`;
}

function stageLights() {
  return `<canvas class="stage-lights" data-stage-lights aria-hidden="true" hidden></canvas>
    <svg class="stage-lights-mobile" viewBox="0 0 1919 820" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="stage-beam" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop stop-color="#fff3d6" stop-opacity=".94"/>
          <stop offset=".35" stop-color="#ffcf9a" stop-opacity=".58"/>
          <stop offset="1" stop-color="#ffbf93" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="stage-beam-violet" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop stop-color="#f9eaff" stop-opacity=".88"/>
          <stop offset=".35" stop-color="#d9b1ff" stop-opacity=".5"/>
          <stop offset="1" stop-color="#d9b1ff" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <g transform="translate(1284 380)"><path class="stage-beam stage-beam-left" d="M-4 0H4L78 312H-78Z" fill="url(#stage-beam)"/></g>
      <g transform="translate(1401 380)"><path class="stage-beam stage-beam-center" d="M-4 0H4L66 285H-66Z" fill="url(#stage-beam-violet)"/></g>
      <g transform="translate(1508 384)"><path class="stage-beam stage-beam-right" d="M-4 0H4L82 316H-82Z" fill="url(#stage-beam)"/></g>
    </svg>`;
}

function feature({ base = './', id = '', title, text, file, alt, dimensions, href, action, variant = '', torn = false }) {
  return `<section${id ? ` id="${id}"` : ''} class="feature-section ${variant}${torn ? ' feature-torn' : ''}">
    ${torn ? paperEdge(paperEdges.eveningStart, 'top') : ''}
    ${torn ? stageLights() : ''}
    <div class="frame section feature">
      ${photo(base, file, alt, 'feature-image', dimensions)}
      <div class="feature-copy"${torn ? '' : ' data-reveal'}>
      ${torn ? `<span class="stage-icon detail-icon" aria-hidden="true">${ornament('stage-disco', '0 0 32 32', '<g stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="15" cy="17" r="9"/><ellipse cx="15" cy="17" rx="4.5" ry="9"/><path d="M6 17h18M8 12.5q7 4 14 0M8 21.5q7-4 14 0M15 8V4m12 1v6m-3-3h6M4 4v5M1.5 6.5h5"/></g>')}</span>` : ''}
      <h2>${title}</h2><p>${text}</p>
      ${href ? link(href, action) : ''}</div>
    </div>
    ${torn ? paperEdge(paperEdges.eveningEnd, 'bottom') : ''}
  </section>`;
}

function pinIcon() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M19 10c0 5-7 10.5-7 10.5S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.4"/></svg>';
}

function capacityCards() {
  const icons = {
    restaurant: '<path d="M4 16h16M6 16a6 6 0 0 1 12 0M12 10V8M3 19h18"/>',
    summer: '<path d="m3 10 9-6 9 6M5 10h14v10H5zM9 20v-6h6v6"/>',
  };
  return `<div class="hero-capacities" role="group" aria-label="Вместимость площадок">
    ${spaces.slice(0, 2).map(({ id, guests, title }) => `<a class="hero-capacity glass" href="spaces/#${id}">
      <span class="hero-capacity-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${icons[id]}</svg>${title}</span>
      <span class="hero-capacity-number">до <strong>${guests}</strong> гостей</span>
    </a>`).join('')}
  </div>`;
}

function mapLink() {
  return `<a class="map-link sweep-control" href="${mapUrl}" target="_blank" rel="noopener">
    ${pinIcon()}
    ${actionLabel('Открыть на карте')}
  </a>`;
}

function location() {
  return `<section class="location" id="location" aria-labelledby="location-title">
    <div class="location-inner frame section">
      <div class="location-heading">
        <h2 id="location-title"><span>В Перми,</span> <span>среди зелени</span></h2>
        <p>Ресторан и летняя площадка среди деревьев. На соседней поляне планируется купольный шатёр.</p>
      </div>
      <div class="location-view">
        <figure class="location-picture">
          ${photo('./', 'location-woodland.png', 'Тропинка среди деревьев ведёт к летней террасе', '', [1862, 845])}
          <canvas class="woodland-canvas" data-woodland aria-hidden="true" hidden></canvas>
        </figure>
        <div class="location-press" aria-hidden="true">
          ${ornament('pressed-leaf', '0 0 132 159', `<path d="M24 146c12-24 20-36 35-54M49 108C21 87 32 43 116 10c-4 54-23 102-67 98Z" fill="#d6dfc1" stroke="#4a694b" stroke-width="1.15" stroke-linejoin="round"/><path d="M31 134c18-31 44-58 72-108M55 101c5-15 1-29-3-41m13 28c4-15 1-30-2-39m13 23c2-13 1-24-1-32m11 16 1-21M51 107c14-8 25-10 38-13m-25-5c10-4 22-7 33-12m-22-3c7-4 18-8 27-14m-16-3 20-12" stroke="var(--ink)" stroke-width=".9" stroke-linecap="round"/>`)}
        </div>
      </div>
      <div class="location-address">
        <address><span class="detail-icon" aria-hidden="true">${pinIcon()}</span>${address}</address>
        <p><span class="detail-icon" aria-hidden="true">${ornament('parking-icon', '0 0 24 24', '<path d="M5 11l1.5-4.5h11L19 11M5 17v2m14-2v2M7.5 14h1m7 0h1M5 11h14l1 2v4H4v-4z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>')}</span>Парковка на 20 машин</p>
        ${mapLink()}
      </div>
    </div>
  </section>`;
}

function hospitality() {
  return `<section class="hospitality frame section" aria-labelledby="hospitality-title">
    <h2 id="hospitality-title">Что мы берём на себя</h2>
    <article class="hospitality-row" id="kitchen">
      <span class="hospitality-icon" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path class="cloche-lid" d="M9 31a15 15 0 0 1 30 0M24 16v-2m-2 0a2 2 0 1 1 4 0M15 27a10 10 0 0 1 5-6"/><path d="M6 34h36l-3 4H9l-3-4Z"/><path class="cloche-rays" d="m33 9 2-3m4 8 4-1"/></svg></span>
      <h3>Своя кухня</h3>
      <p>Горячие блюда готовим на площадке к подаче. Меню составляем под формат праздника.</p>
      ${plainButton('menu/', 'Посмотреть меню')}
    </article>
    <article class="hospitality-row" id="team">
      <span class="hospitality-icon" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M23 8c.9 8.7 4.3 12.1 13 13-8.7.9-12.1 4.3-13 13-.9-8.7-4.3-12.1-13-13 8.7-.9 12.1-4.3 13-13Z"/><path d="M37 7v8m-4-4h8"/><path d="M10 29v10m-5-5h10"/><path d="m34 32 2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4Z"/></svg></span>
      <h3>Организация праздника</h3>
      <p>Менеджер, ведущие, артисты, декор и сценарий. Можно собрать праздник с нашей командой или выбрать отдельные услуги.</p>
      ${plainButton('prices/', 'Цены и услуги')}
    </article>
  </section>
  <section class="stay-story" id="stay" aria-labelledby="stay-title">
    <div class="frame section stay-inner">
      <h2 id="stay-title"><span>Праздник закончился.</span> <span>Отдых продолжается.</span></h2>
      <div class="stay-media">
        <figure class="stay-picture">${photo('./', 'room.webp', 'Светлый гостевой номер')}</figure>
        <p class="stay-count">
          ${ornament('stay-cord', '0 0 88 68', '<path d="M44 62c-1-13-20-12-26-28C12 17 28 7 42 13c17 7 23 32 8 39-11 6-17-6-10-12 7-6 19 0 26-9 6-8-1-20-8-26" stroke="var(--ink)" stroke-width="2.8" stroke-linecap="round"/><path d="M44 62c-1-13-20-12-26-28C12 17 28 7 42 13c17 7 23 32 8 39-11 6-17-6-10-12 7-6 19 0 26-9 6-8-1-20-8-26" stroke="var(--line)" stroke-width="1.5" stroke-dasharray="2 3" stroke-linecap="round"/>')}
          <strong>7</strong> номеров
        </p>
      </div>
      <div class="stay-details">
        <p>Гости могут остаться после вечеринки, а молодожёнов ждёт отдельный номер.</p>
        ${plainButton('stay/', 'Посмотреть проживание')}
      </div>
    </div>
  </section>`;
}

function requestForm(base) {
  const home = base === './';
  return `<section class="request-section${home ? ' request-finale' : ''}" id="request" aria-labelledby="request-title">
    ${home ? photo(base, 'request-garden.png', '', 'request-backdrop', [1536, 1024]) : ''}
    <div class="frame section request-layout">
      <div><h2 id="request-title">Давайте устроим вашу случайность</h2>
        <p>Подготовьте параметры праздника, чтобы обсудить их с командой площадки.</p>
        ${base === '../' ? link('../#event-calculator', 'Калькулятор мероприятия') : ''}
      </div>
      <form class="request-form" data-request>
        ${home ? ornament('request-seal', '0 0 72 72', `<path d="M36 2c8 0 11 4 16 6 8 4 11 8 14 15 4 8 4 18 1 24-3 9-7 13-15 17-8 4-13 6-21 5-9-1-17-5-22-12-4-5-7-12-7-20 0-9 4-16 8-22C17 6 26 2 36 2Z" fill="var(--accent)" stroke="var(--accent-strong)"/><circle cx="36" cy="36" r="26" stroke="var(--accent-strong)"/><g transform="translate(18 29) scale(.32)" color="var(--ink)">${brandArc}</g>`) : ''}
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
        <button class="primary plain-button" type="submit">Подготовить заявку</button>
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

function calculator(standalone = false) {
  const heading = standalone ? 'h1' : 'h2';
  const fields = (standalone ? calculatorFields : calculatorFields.replaceAll('<h2 ', '<h3 ').replaceAll('</h2>', '</h3>'))
    .replace('{{requestHref}}', standalone ? '../#request' : '#request');
  return `<section class="event-calculator${standalone ? ' event-calculator-page' : ''}" id="event-calculator" aria-labelledby="calculator-title">
    <div class="frame section">
      <${heading} id="calculator-title">Калькулятор мероприятия</${heading}>
      <p class="calc-lede">Выберите формат и количество гостей, чтобы посмотреть расчёт и пример заявки для менеджера.</p>
      ${fields}
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
    description: 'Банкетная площадка «Случайности» в Перми. Ресторан, летняя площадка и проект купольного шатра.',
    home: true,
    body: `
    <section class="bloom-hero" aria-labelledby="hero-title">
      <div class="bloom-art" aria-hidden="true">
        <img src="prototype/hero-bloom-powder.png" width="1774" height="887" fetchpriority="high" alt="">
      </div>
      <div class="frame bloom-content">
        <h1 id="hero-title">Случайности,<br>которые <span class="bloom-word">становятся</span><br>воспоминаниями</h1>
        <div class="bloom-intro">
          <p>Банкетная площадка среди зелени в Перми. Для свадеб, корпоративов и частных праздников.</p>
          ${link('contacts/#request', 'Выбрать дату', 'primary')}
        </div>
      </div>
      <div class="frame bloom-bottom">
        <a class="bloom-preview" href="#spaces">
          <img src="prototype/veranda.png" width="1536" height="1024" alt="" decoding="async">
          <span>Посмотреть площадку ${arrowIcon()}</span>
        </a>
        <a class="bloom-next" href="#location">О площадке ${ornament('bloom-chevron', '0 0 16 16', '<path d="m3 6 5 5 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>')}</a>
        ${capacityCards()}
      </div>
    </section>
    ${location()}
    ${spaceGallery('./')}
    <section class="gifts-section" id="gifts">
      <div class="frame section gifts-home">
        <h2>Свадебные подарки от «Случайностей»</h2>
        ${giftGallery('./', `<span class="gift-icon detail-icon" aria-hidden="true">${ornament('gift-car', '0 0 32 32', '<path d="M5 16l2.6-6h13.8l3.6 6m-20 0h20l2 2v6H3v-6l2-2Zm2 8v2m16-2v2M7 20h2m12 0h2M26 6v6m-3-3h6" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round"/>')}</span>`)}
        ${plainButton('weddings/#gifts', 'Все свадебные подарки')}
      </div>
    </section>
    ${feature({ id: 'production', title: 'Танцы под открытым небом', text: 'Свет, звук, экраны и уличная дискотека. Диджеи и техническая команда помогают собрать программу под ваш формат.', file: 'dance-panorama.png', dimensions: [1919, 820], alt: 'Гости танцуют перед освещённой сценой среди деревьев', href: 'corporate/#production', action: 'Технические возможности', variant: 'feature-dark feature-film', torn: true })}
    ${hospitality()}
    <section class="section frame home-gallery" id="gallery"><div class="section-intro"><h2>Как может выглядеть праздник</h2>${plainButton('gallery/', 'Открыть галерею')}</div>${gallery('./')}</section>
    ${calculator()}
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
  weddings: page('weddings', 'Свадьбы', 'Свадебный банкет в ресторане или на летней площадке в Перми.',
    pageIntro('Свадьбы', 'Церемония на зелёной территории, банкет в ресторане или на летней площадке и отдых после праздника. Соберём программу вокруг вашей даты.', 'dancing-guests.webp') +
    `<section class="gifts-section" id="gifts"><div class="frame section"><h2>Три подарка к вашей свадьбе</h2>${giftGallery('../')}<p class="fine-print">Доступность подарков и условия уточняются при обсуждении даты.</p></div></section>
    <section class="frame section prose"><h2>Как проходит свадьба</h2><details><summary>Где провести церемонию?</summary><p>На зелёной территории можно устроить выездную регистрацию и фотозону.</p></details>
    <details><summary>На сколько гостей рассчитан проект купола?</summary><p>Купольный шатёр планируется на 150 гостей. Сроки и рассадку можно уточнить при обсуждении даты.</p></details>
    <details><summary>Можно остаться после свадьбы?</summary><p>На площадке семь гостевых номеров, в том числе отдельный номер для молодожёнов.</p></details>${link('../contacts/?event=wedding#request', 'Обсудить свадьбу', 'primary tonal')}</section>`),
  corporate: page('corporate', 'Корпоративы и праздники', 'Площадки и техническая команда для корпоративных мероприятий в Перми.',
    pageIntro('Корпоративы и праздники', 'Деловая встреча, ужин для команды или вечеринка на воздухе. На площадке есть пространства для разных частей одного события.', 'dance.webp') +
    feature({ base: '../', id: 'production', title: 'Свет, звук и программа', text: 'Подбираем оборудование под формат мероприятия. Можно запланировать выступления, экран для презентаций, диджей-сет и танцы под открытым небом.', file: 'dancing-guests.webp', alt: 'Вечернее событие на открытом воздухе', href: '../contacts/?event=corporate#request', action: 'Подготовить запрос', variant: 'feature-dark' }) +
    `<section class="frame section prose"><h2>Организация под ключ</h2><p>Менеджер помогает со сценарием, ведущими, декором, кухней и техническим сопровождением.</p>${link('../prices/', 'Услуги и расчёт')}</section>`),
  spaces: page('spaces', 'Наши пространства', 'Ресторан на 50 гостей, летняя площадка на 60 и проект купольного шатра на 150 гостей.',
    pageIntro('Наши пространства', 'Ресторан и летняя площадка на одной территории в Перми. На поляне рядом планируется купольный шатёр.') +
    spaces.map((item, index) => `
      ${(item.aliases ?? []).map((id) => `<div class="space-anchor" id="${id}" aria-hidden="true"></div>`).join('')}
      <section class="feature-section${index % 2 ? ' reversed feature-soft' : ''}" id="${item.id}">
        <div class="frame section feature">
          <figure class="space-scene-media">
            <img class="feature-image" src="../prototype/${item.file}" width="${item.image[0]}" height="${item.image[1]}" alt="${item.imageAlt}" loading="lazy" decoding="async">
            <figcaption>${item.imageNote}</figcaption>
          </figure>
          <div class="feature-copy">
            <h2>${item.title}</h2>
            <p><strong>До ${item.guests} гостей${item.planned ? ' · В проекте' : ''}</strong></p>
            <p>${item.text}</p>
            ${link('../contacts/#request', 'Уточнить дату и условия')}
          </div>
        </div>
      </section>`).join('')),
  menu: page('menu', 'Кухня и меню', 'Собственная кухня и индивидуальное меню для вашего мероприятия.',
    pageIntro('Кухня и меню', 'Повара работают на площадке. Горячие блюда готовятся к подаче, меню согласовывается под ваше событие.', 'kitchen.webp') +
    `<section class="frame section prose"><h2>Составим меню под ваш формат</h2><dl class="service-list">
    <div><dt>Банкет</dt><dd>Обсудим подачу, состав меню и порядок смены блюд.</dd></div>
    <div><dt>Фуршет</dt><dd>Подберём формат подачи для встречи гостей или перерыва между выступлениями.</dd></div>
    <div><dt>Пожелания гостей</dt><dd>Особые требования к блюдам можно указать при обсуждении меню.</dd></div></dl>
    ${link('../contacts/#request', 'Обсудить меню', 'primary tonal')}</section>`),
  gallery: page('gallery', 'Фото и видео', 'Фотографии свадебных и вечерних форматов и пространств площадки.',
    pageIntro('Фото и видео', 'Кадры для знакомства с форматами банкетов, летних праздников и размещения гостей.') +
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
    <div class="actions">${link('../#event-calculator', 'Калькулятор мероприятия', 'primary tonal')}${link('../contacts/#request', 'Подготовить заявку')}</div></section>`),
  contacts: page('contacts', 'Контакты', 'Адрес банкетной площадки Случайности и параметры заявки.',
    pageIntro('Контакты', address) +
    `<section class="frame contact-map" aria-label="Адрес на карте">${mapLink()}</section>` + requestForm('../')),
};

const calculatorPage = layout({
  title: 'Калькулятор мероприятия · Случайности',
  description: 'Пример расчёта стоимости мероприятия по формату и количеству гостей.',
  base: '../',
  current: 'prices',
  calculator: true,
  body: calculator(true),
});

for (const [file, html] of [
  ['index.html', home()],
  ['prototype/calculator.html', calculatorPage],
  ...Object.entries(pages).map(([id, html]) => [id + '/index.html', html]),
]) {
  const destination = resolve(root, file);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, html.replace(/[ \t]+$/gm, ''), 'utf8');
}
