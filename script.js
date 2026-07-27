const body = document.body;
const header = document.getElementById('site-header');
const menuButton = document.getElementById('menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle?.querySelector('i');
const typewriter = document.getElementById('typewriter');
const timeline = document.getElementById('timeline');
const timelineProgress = document.getElementById('timeline-progress');
const year = document.getElementById('current-year');
const toast = document.getElementById('toast');
const navLinks = [...document.querySelectorAll('.nav-link')];
const navMarker = document.querySelector('.nav-marker');
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');
const canvas = document.getElementById('particle-canvas');

if (year) year.textContent = String(new Date().getFullYear());

const preferredTheme = localStorage.getItem('portfolio-theme');
const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const initialTheme = preferredTheme || (systemDark ? 'dark' : 'light');
body.dataset.theme = initialTheme;
updateThemeIcon();

function updateThemeIcon() {
  if (!themeIcon) return;
  themeIcon.className = body.dataset.theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 1800);
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    body.dataset.theme = body.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('portfolio-theme', body.dataset.theme);
    updateThemeIcon();
    showToast(`${body.dataset.theme === 'dark' ? 'Dark' : 'Light'} theme enabled`);
  });
}

if (menuButton && mobileMenu) {
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    mobileMenu.hidden = open;
    body.classList.toggle('menu-open', !open);
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuButton.setAttribute('aria-expanded', 'false');
      mobileMenu.hidden = true;
      body.classList.remove('menu-open');
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
  { threshold: 0.14 }
);

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const roles = ['Python developer', 'Rust learner', 'Linux builder', 'automation enthusiast'];
let roleIndex = 0;
let charIndex = 0;
let deleting = false;

function runTypewriter() {
  if (!typewriter) return;
  const current = roles[roleIndex];

  if (deleting) {
    charIndex -= 1;
  } else {
    charIndex += 1;
  }

  typewriter.textContent = current.slice(0, charIndex);

  let delay = deleting ? 45 : 85;

  if (!deleting && charIndex === current.length) {
    deleting = true;
    delay = 1500;
  } else if (deleting && charIndex === 0) {
    deleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    delay = 350;
  }

  window.setTimeout(runTypewriter, delay);
}

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  runTypewriter();
} else if (typewriter) {
  typewriter.textContent = roles[0];
}

function moveMarker(link) {
  if (!navMarker || !link) return;
  navMarker.style.width = `${link.offsetWidth}px`;
  navMarker.style.left = `${link.offsetLeft}px`;
  navMarker.style.opacity = '1';
}

navLinks.forEach((link) => {
  link.addEventListener('mouseenter', () => moveMarker(link));
  link.addEventListener('click', () => {
    navLinks.forEach((item) => item.classList.remove('active'));
    link.classList.add('active');
    moveMarker(link);
  });
});

const desktopNav = document.querySelector('.desktop-nav');
desktopNav?.addEventListener('mouseleave', () => moveMarker(document.querySelector('.nav-link.active')));
window.addEventListener('load', () => moveMarker(document.querySelector('.nav-link.active')));
window.addEventListener('resize', () => moveMarker(document.querySelector('.nav-link.active')));

const sections = [...document.querySelectorAll('main section[id]')];
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const active = navLinks.find((link) => link.getAttribute('href') === `#${entry.target.id}`);
      if (!active) return;
      navLinks.forEach((link) => link.classList.remove('active'));
      active.classList.add('active');
      moveMarker(active);
    });
  },
  { rootMargin: '-45% 0px -45% 0px' }
);
sections.forEach((section) => sectionObserver.observe(section));

function handleScroll() {
  header?.classList.toggle('scrolled', window.scrollY > 45);

  if (timeline && timelineProgress) {
    const rect = timeline.getBoundingClientRect();
    const start = window.innerHeight * 0.62;
    const progress = Math.min(1, Math.max(0, (start - rect.top) / rect.height));
    timelineProgress.style.height = `${progress * 100}%`;
  }
}

window.addEventListener('scroll', handleScroll, { passive: true });
handleScroll();

if (window.matchMedia('(pointer: fine)').matches) {
  window.addEventListener(
    'pointermove',
    (event) => {
      if (cursorDot) {
        cursorDot.style.left = `${event.clientX}px`;
        cursorDot.style.top = `${event.clientY}px`;
      }
      if (cursorOutline) {
        cursorOutline.animate(
          { left: `${event.clientX}px`, top: `${event.clientY}px` },
          { duration: 420, fill: 'forwards' }
        );
      }
    },
    { passive: true }
  );

  document.querySelectorAll('a, button, .tilt-card').forEach((element) => {
    element.addEventListener('mouseenter', () => body.classList.add('cursor-hover'));
    element.addEventListener('mouseleave', () => body.classList.remove('cursor-hover'));
  });
}

if (window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.tilt-card').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(1000px) rotateX(${y * -5}deg) rotateY(${x * 5}deg) translateY(-5px)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });
}

if (canvas) {
  const context = canvas.getContext('2d');
  const particles = [];
  const count = 65;

  function resizeCanvas() {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  }

  class Particle {
    constructor() {
      this.x = Math.random() * window.innerWidth;
      this.y = Math.random() * window.innerHeight;
      this.vx = (Math.random() - 0.5) * 0.28;
      this.vy = (Math.random() - 0.5) * 0.28;
      this.size = Math.random() * 1.5 + 0.4;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > window.innerWidth) this.vx *= -1;
      if (this.y < 0 || this.y > window.innerHeight) this.vy *= -1;
    }
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  for (let index = 0; index < count; index += 1) particles.push(new Particle());

  function animateParticles() {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const dark = body.dataset.theme === 'dark';
    const point = dark ? '255,255,255' : '15,23,42';

    particles.forEach((particle, index) => {
      particle.update();
      context.fillStyle = `rgba(${point},0.42)`;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.fill();

      for (let otherIndex = index + 1; otherIndex < particles.length; otherIndex += 1) {
        const other = particles[otherIndex];
        const dx = particle.x - other.x;
        const dy = particle.y - other.y;
        const distance = Math.hypot(dx, dy);
        if (distance > 115) continue;
        context.strokeStyle = `rgba(${point},${0.12 - distance / 1100})`;
        context.beginPath();
        context.moveTo(particle.x, particle.y);
        context.lineTo(other.x, other.y);
        context.stroke();
      }
    });

    window.requestAnimationFrame(animateParticles);
  }

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) animateParticles();
}
