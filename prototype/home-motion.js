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
    gsap.fromTo(location.querySelector('.location-picture img'), { scale: 1.12 }, {
      scale: 1,
      ease: 'none',
      scrollTrigger: { trigger: '.location-picture', start: 'top bottom', end: 'center 48%', scrub: true },
    });

    gsap.fromTo('.location-press', { y: -36, rotate: -7 }, {
      y: 0,
      rotate: 0,
      ease: 'none',
      scrollTrigger: { trigger: '.location-view', start: 'top bottom', end: 'center 48%', scrub: true },
    });

    gsap.fromTo('.stage-wave path', { strokeDasharray: '1 1', strokeDashoffset: 1 }, {
      strokeDashoffset: 0,
      duration: 1.15,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.stage-wave', start: 'top 88%', once: true },
    });

    gsap.fromTo('.stay-count', { rotation: -13 }, {
      rotation: 0,
      duration: .95,
      ease: 'elastic.out(1, .63)',
      transformOrigin: '48% 12%',
      scrollTrigger: { trigger: '.stay-count', start: 'top 86%', once: true },
    });

    gsap.from('.home-gallery .photo-grid figure', {
      y: desktop ? 24 : 13,
      rotation: (index) => [5, -5, -7][index],
      duration: .78,
      ease: 'power3.out',
      stagger: .1,
      scrollTrigger: { trigger: '.home-gallery .photo-grid', start: 'top 84%', once: true },
    });

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

    const kitchen = document.querySelector('#kitchen');
    const cloche = gsap.timeline({ paused: true });
    cloche.to(kitchen.querySelector('.cloche-lid'), { y: -4, rotation: -11, transformOrigin: '5% 100%', duration: .25, ease: 'power2.out' })
      .to(kitchen.querySelector('.cloche-rays'), { opacity: .25, duration: .22 }, 0)
      .to(kitchen.querySelector('.cloche-lid'), { y: 0, rotation: 0, duration: .46, ease: 'back.out(1.5)' })
      .to(kitchen.querySelector('.cloche-rays'), { opacity: 1, duration: .3 }, '<');

    const team = document.querySelector('#team');
    const sparkles = gsap.timeline({ paused: true });
    sparkles.to(team.querySelectorAll('.hospitality-icon path'), {
      keyframes: [{ scale: .5, opacity: .42, duration: .15 }, { scale: 1, opacity: 1, duration: .5, ease: 'back.out(1.8)' }],
      stagger: .065, transformOrigin: '50% 50%',
    });

    const listeners = new AbortController();
    for (const [row, animation] of [[kitchen, cloche], [team, sparkles]]) {
      const play = () => { if (!animation.isActive()) animation.restart(); };
      ScrollTrigger.create({ trigger: row, start: 'top 86%', once: true, onEnter: play });
      row.addEventListener('pointerenter', (event) => { if (event.pointerType === 'mouse') play(); }, { signal: listeners.signal });
      row.addEventListener('focusin', play, { signal: listeners.signal });
    }
    return () => listeners.abort();
  });
}

const bloom = document.querySelector('.bloom-hero');
if (bloom) {
  const art = bloom.querySelector('.bloom-art');
  const preciseMotion = matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)');
  let frame;

  function resetBloom() {
    cancelAnimationFrame(frame);
    art.style.removeProperty('--art-x');
    art.style.removeProperty('--art-y');
  }

  bloom.addEventListener('pointermove', (event) => {
    if (!preciseMotion.matches || event.pointerType !== 'mouse') return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const bounds = bloom.getBoundingClientRect();
      art.style.setProperty('--art-x', `${((event.clientX - bounds.left) / bounds.width - .5) * 16}px`);
      art.style.setProperty('--art-y', `${((event.clientY - bounds.top) / bounds.height - .5) * 9}px`);
    });
  });
  bloom.addEventListener('pointerleave', resetBloom);
  preciseMotion.addEventListener('change', resetBloom);
}
