const motion = matchMedia('(prefers-reduced-motion: reduce)');

function observeScene(canvas, create, breakpoint) {
  const container = canvas.parentElement;
  let effect;
  let visible = false;
  let loading = false;
  let unavailable = false;

  async function sync() {
    if (motion.matches || breakpoint?.matches) {
      effect?.dispose();
      effect = undefined;
      canvas.hidden = true;
      return;
    }
    if (effect || loading || unavailable || !visible) return;

    loading = true;
    try {
      const scenes = await import('./venue-scenes.js?v=3');
      if (!visible || motion.matches || breakpoint?.matches) return;
      effect = await create(scenes, canvas, container);
      effect.setVisible(visible);
      if (motion.matches || breakpoint?.matches) sync();
    } catch {
      unavailable = true;
      canvas.hidden = true;
    } finally {
      loading = false;
    }
  }

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    effect?.setVisible(visible);
    sync();
  }).observe(container);
  motion.addEventListener('change', sync);
  breakpoint?.addEventListener('change', sync);
}

const stageCanvas = document.querySelector('[data-stage-lights]');
const mobileLights = document.querySelector('.stage-lights-mobile');
const mobileStage = matchMedia('(max-width: 760px)');
const stage = mobileLights.parentElement;
const stagePhoto = stage.querySelector('.feature-image');
const photoWidth = Number(stagePhoto.getAttribute('width'));
const photoHeight = Number(stagePhoto.getAttribute('height'));

observeScene(stageCanvas, ({ createStageLights }, canvas, container) => {
  canvas.hidden = false;
  return createStageLights(canvas, container);
}, mobileStage);
new ResizeObserver(() => {
  if (!mobileStage.matches) return;
  const { clientWidth: width, clientHeight: height } = stage;
  if (!width || !height) return;
  const scale = Math.max(width / photoWidth, height / photoHeight);
  const [x, y] = getComputedStyle(stagePhoto).objectPosition.split(' ').map(value => parseFloat(value) / 100);
  const cropWidth = width / scale;
  const cropHeight = height / scale;
  mobileLights.setAttribute('viewBox', `${(photoWidth - cropWidth) * x} ${(photoHeight - cropHeight) * y} ${cropWidth} ${cropHeight}`);
  mobileLights.classList.add('ready');
}).observe(stage);
new IntersectionObserver(([entry]) => {
  mobileLights.classList.toggle('in-view', entry.isIntersecting);
}, { threshold: .2 }).observe(stage);
observeScene(document.querySelector('[data-woodland]'), ({ createWoodland }, canvas, figure) => createWoodland(canvas, figure));
