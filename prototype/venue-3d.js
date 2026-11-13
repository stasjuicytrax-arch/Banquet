const motion = matchMedia('(prefers-reduced-motion: reduce)');
const launch = document.querySelector('[data-dome-launch]');
const dialog = document.querySelector('#dome-preview');
const domeCanvas = dialog.querySelector('[data-dome-canvas]');
const domeStatus = dialog.querySelector('.dome-status');
const domeControls = dialog.querySelector('.dome-controls');
const fallback = dialog.querySelector('.dome-fallback');
let dome;
let opening = 0;

function resetDome() {
  dome?.dispose();
  dome = undefined;
  domeCanvas.hidden = true;
  domeControls.hidden = true;
  fallback.hidden = false;
}

launch.hidden = false;
launch.addEventListener('click', async () => {
  if (dialog.open) return;
  resetDome();
  const attempt = ++opening;
  domeStatus.hidden = false;
  domeStatus.textContent = 'Загружаем 3D-модель…';
  dialog.showModal();

  try {
    const { createDome } = await import('./venue-scenes.js');
    if (!dialog.open || attempt !== opening) return;
    domeCanvas.hidden = false;
    dome = createDome(domeCanvas, dialog, motion);
    fallback.hidden = true;
    domeStatus.hidden = true;
    domeControls.hidden = false;
  } catch {
    if (attempt !== opening || !dialog.open) return;
    domeCanvas.hidden = true;
    domeStatus.textContent = '3D-модель недоступна в этом браузере.';
  }
});

dialog.addEventListener('close', () => {
  if (dialog.open) return;
  ++opening;
  resetDome();
});

const lightsCanvas = document.querySelector('[data-stage-lights]');
const stage = lightsCanvas.closest('section');
let lights;
let visible = false;
let loading = false;
let unavailable = false;

async function syncLights() {
  if (motion.matches) {
    lights?.dispose();
    lights = undefined;
    lightsCanvas.hidden = true;
    return;
  }
  if (lights || loading || unavailable || !visible) return;

  loading = true;
  try {
    const { createStageLights } = await import('./venue-scenes.js');
    if (!visible || motion.matches) return;
    lightsCanvas.hidden = false;
    lights = createStageLights(lightsCanvas, stage);
  } catch {
    unavailable = true;
    lightsCanvas.hidden = true;
  } finally {
    loading = false;
  }
}

new IntersectionObserver(([entry]) => {
  visible = entry.isIntersecting;
  lights?.setVisible(visible);
  syncLights();
}).observe(stage);
motion.addEventListener('change', syncLights);
