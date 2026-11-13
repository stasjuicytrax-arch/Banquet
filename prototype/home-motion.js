const { gsap, ScrollTrigger } = window;

if (gsap && ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);

  const motion = gsap.matchMedia();
  motion.add({
    enabled: '(prefers-reduced-motion: no-preference)',
    desktop: '(min-width: 761px)',
  }, ({ conditions }) => {
    if (!conditions.enabled) return;

    const desktop = conditions.desktop;
    const location = document.querySelector('#location');
    const layers = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: location, start: 'top bottom', end: 'center 38%', scrub: true },
    });
    layers.from(location.querySelector('.location-leaves'), {
      x: desktop ? 42 : 21, y: desktop ? -45 : -18, rotation: 5,
    }, 0);
    layers.from(location.querySelector('.location-picture'), { y: desktop ? 36 : 14 }, 0);

    gsap.from('.gift', {
      y: desktop ? 34 : 15,
      opacity: .6,
      stagger: .11,
      duration: .74,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.gift-gallery', start: 'top 84%', once: true },
    });

    gsap.fromTo('.feature-film .feature-image',
      { yPercent: desktop ? -5 : -2.5, scale: desktop ? 1.12 : 1.06 },
      {
        yPercent: desktop ? 5 : 2.5,
        ease: 'none',
        scrollTrigger: { trigger: '.feature-film', start: 'top bottom', end: 'bottom top', scrub: true },
      },
    );

    gsap.from('.hospitality-icon svg', {
      rotation: -13,
      scale: .82,
      stagger: .12,
      duration: .66,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.hospitality-row', start: 'top 87%', once: true },
    });
  });
}
