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
