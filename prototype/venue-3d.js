const motion = matchMedia('(prefers-reduced-motion: reduce)');

function observeScene(canvas, create) {
  const container = canvas.parentElement;
  let effect;
  let visible = false;
  let loading = false;
  let unavailable = false;

  async function sync() {
    if (motion.matches) {
      effect?.dispose();
      effect = undefined;
      canvas.hidden = true;
      return;
    }
    if (effect || loading || unavailable || !visible) return;

    loading = true;
    try {
      const scenes = await import('./venue-scenes.js?v=3');
      if (!visible || motion.matches) return;
      effect = await create(scenes, canvas, container);
      effect.setVisible(visible);
      if (motion.matches) sync();
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
}

observeScene(document.querySelector('[data-stage-lights]'), ({ createStageLights }, canvas, stage) => {
  canvas.hidden = false;
  return createStageLights(canvas, stage);
});
observeScene(document.querySelector('[data-woodland]'), ({ createWoodland }, canvas, figure) => createWoodland(canvas, figure));
