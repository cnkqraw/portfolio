const menuButton = document.getElementById('menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const header = document.getElementById('site-header');
const year = document.getElementById('current-year');
const cursorLight = document.getElementById('cursor-light');
const progressBar = document.getElementById('scroll-progress-bar');
const rotatingFocus = document.getElementById('rotating-focus');
const labLogText = document.getElementById('lab-log-text');

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

const handleScroll = () => {
  if (header) {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }

  if (progressBar) {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progressBar.style.width = `${progress}%`;
  }
};

window.addEventListener('scroll', handleScroll, { passive: true });
handleScroll();

if (cursorLight && window.matchMedia('(pointer: fine)').matches) {
  window.addEventListener(
    'pointermove',
    (event) => {
      cursorLight.style.left = `${event.clientX}px`;
      cursorLight.style.top = `${event.clientY}px`;
    },
    { passive: true }
  );
}

const focusItems = ['automation', 'privacy tools', 'self-hosting', 'systems code'];
let focusIndex = 0;

if (rotatingFocus && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.setInterval(() => {
    focusIndex = (focusIndex + 1) % focusItems.length;
    rotatingFocus.textContent = focusItems[focusIndex];
  }, 2200);
}

const logMessages = [
  'All monitored services responding.',
  'Automation queue is clear.',
  'Remote access tunnel is healthy.',
  'Latest deployment completed successfully.'
];
let logIndex = 0;

if (labLogText && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.setInterval(() => {
    logIndex = (logIndex + 1) % logMessages.length;
    labLogText.textContent = logMessages[logIndex];
  }, 3000);
}

if (window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(1200px) rotateX(${y * -2.2}deg) rotateY(${x * 2.2}deg) translateY(-3px)`;
    });

    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });
}
