const hero = document.querySelector('.hero');
const dropClip = document.getElementById('drop-clip');
const dropRim = document.getElementById('drop-rim');
const glint = document.getElementById('drop-glint');
const motionToggle = document.getElementById('motion-toggle');
const cloudOption = document.getElementById('cloud-option');
const cloudToggle = document.getElementById('cloud-toggle');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
if (/Chrome\/|Edg\/|YaBrowser\//.test(navigator.userAgent)
  && CSS.supports('backdrop-filter', 'url("#nav-liquid")')) {
  document.documentElement.classList.add('glass-svg');
}

let paused = reduceMotion.matches;
let inView = true;
let frame = 0;
let elapsed = 0;
let lastTime = 0;
let cloudTarget = 0;
let cloudPosition = 0;

function updateCloudTarget() {
  cloudTarget = Math.min(window.scrollY * 0.22, window.innerWidth * 0.075, 100);
}

function animate(time) {
  const delta = lastTime ? Math.min(time - lastTime, 64) : 0;
  lastTime = time;
  elapsed += delta;
  const phase = elapsed / 1350;
  const x = 1175 + Math.sin(phase) * 24;
  const y = 535 + (Math.cos(phase * .82) - 1) * 13;
  const turn = -7 + Math.sin(phase * .69) * 4;
  const stretch = 1 + Math.sin(phase * .93) * .045;
  const transform = `translate(${x} ${y}) rotate(${turn}) scale(${stretch} ${2 - stretch})`;
  dropClip.setAttribute('transform', transform);
  dropRim.setAttribute('transform', transform);
  glint.setAttribute('gradientTransform', `rotate(${Math.sin(phase) * 12} .5 .5)`);
  if (Math.abs(cloudTarget - cloudPosition) > .1) {
    cloudPosition += (cloudTarget - cloudPosition) * Math.min(delta / 160, 1);
    hero.style.setProperty('--cloud-shift', `${cloudPosition.toFixed(1)}px`);
  }
  frame = requestAnimationFrame(animate);
}

function syncAnimation() {
  const play = !paused && inView && !document.hidden;
  if (play && !frame) {
    lastTime = 0;
    updateCloudTarget();
    frame = requestAnimationFrame(animate);
  } else if (!play && frame) {
    cancelAnimationFrame(frame);
    frame = 0;
  }
  document.body.dataset.paused = String(paused || document.hidden);
  motionToggle.setAttribute('aria-pressed', String(paused));
  motionToggle.setAttribute('aria-label', paused ? 'Включить анимацию' : 'Остановить анимацию');
}

motionToggle.hidden = false;
cloudOption.hidden = false;
motionToggle.addEventListener('click', () => { paused = !paused; syncAnimation(); });
cloudToggle.addEventListener('change', () => {
  document.body.dataset.ambient = String(cloudToggle.checked);
});
reduceMotion.addEventListener('change', () => { paused = reduceMotion.matches; syncAnimation(); });
document.addEventListener('visibilitychange', syncAnimation);
window.addEventListener('scroll', updateCloudTarget, { passive: true });
window.addEventListener('resize', updateCloudTarget, { passive: true });
new IntersectionObserver(([entry]) => {
  inView = entry.isIntersecting;
  syncAnimation();
}).observe(hero);
syncAnimation();
