const hero = document.querySelector('.hero');
const dropClip = document.getElementById('drop-clip');
const dropRim = document.getElementById('drop-rim');
const glint = document.getElementById('drop-glint');
const cloudOption = document.getElementById('cloud-option');
const cloudToggle = document.getElementById('cloud-toggle');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
if (/Chrome\/|Edg\/|YaBrowser\//.test(navigator.userAgent)
  && CSS.supports('backdrop-filter', 'url("#nav-liquid")')) {
  document.documentElement.classList.add('glass-svg');
}

const driftDuration = 4600;
let inView = true;
let frame = 0;
let elapsed = 0;
let lastTime = 0;
let cloudTarget = 0;
let cloudPosition = 0;

function updateCloudTarget() {
  cloudTarget = Math.min(window.scrollY * 0.22, window.innerWidth * 0.075, 100);
  syncAnimation();
}

function draw() {
  const progress = elapsed / driftDuration;
  const phase = progress === 1 ? 0 : progress * Math.PI * 2;
  const x = 1175 + Math.sin(phase) * 24 + cloudPosition * .16;
  const y = 535 - Math.sin(phase * .5) * 16 - cloudPosition * .11;
  const turn = -7 + Math.sin(phase) * 4;
  const stretch = 1 + Math.sin(phase) * .045;
  const transform = `translate(${x} ${y}) rotate(${turn}) scale(${stretch} ${2 - stretch})`;
  dropClip.setAttribute('transform', transform);
  dropRim.setAttribute('transform', transform);
  glint.setAttribute('gradientTransform', `rotate(${Math.sin(phase) * 12} .5 .5)`);
  hero.style.setProperty('--cloud-shift', `${cloudPosition.toFixed(1)}px`);
}

function needsFrame() {
  return elapsed < driftDuration || Math.abs(cloudTarget - cloudPosition) > .1;
}

function animate(time) {
  frame = 0;
  const delta = lastTime ? time - lastTime : 0;
  lastTime = time;
  elapsed = Math.min(elapsed + delta, driftDuration);
  cloudPosition += (cloudTarget - cloudPosition) * Math.min(delta / 160, 1);
  draw();
  if (needsFrame()) frame = requestAnimationFrame(animate);
}

function syncAnimation() {
  const play = !reduceMotion.matches && inView && !document.hidden && needsFrame();
  if (play && !frame) {
    lastTime = 0;
    frame = requestAnimationFrame(animate);
  } else if (!play && frame) {
    cancelAnimationFrame(frame);
    frame = 0;
  }
}

cloudOption.hidden = false;
cloudToggle.addEventListener('change', () => {
  document.body.dataset.ambient = String(cloudToggle.checked);
});
reduceMotion.addEventListener('change', () => {
  elapsed = 0;
  cloudPosition = 0;
  draw();
  syncAnimation();
});
document.addEventListener('visibilitychange', syncAnimation);
window.addEventListener('scroll', updateCloudTarget, { passive: true });
window.addEventListener('resize', updateCloudTarget, { passive: true });
new IntersectionObserver(([entry]) => {
  inView = entry.isIntersecting;
  syncAnimation();
}).observe(hero);
updateCloudTarget();
