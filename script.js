const menuButton = document.getElementById('menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const header = document.getElementById('site-header');
const year = document.getElementById('current-year');
const pointerGlow = document.querySelector('.pointer-glow');

if (year) {
  year.textContent = new Date().getFullYear();
}

if (menuButton && mobileMenu) {
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    mobileMenu.hidden = isOpen;
    document.body.classList.toggle('menu-open', !isOpen);
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuButton.setAttribute('aria-expanded', 'false');
      mobileMenu.hidden = true;
      document.body.classList.remove('menu-open');
    });
  });
}

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach((element) => {
  revealObserver.observe(element);
});

window.addEventListener(
  'scroll',
  () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 40);
  },
  { passive: true }
);

if (pointerGlow && window.matchMedia('(pointer: fine)').matches) {
  window.addEventListener(
    'pointermove',
    (event) => {
      pointerGlow.style.left = `${event.clientX}px`;
      pointerGlow.style.top = `${event.clientY}px`;
    },
    { passive: true }
  );
}
