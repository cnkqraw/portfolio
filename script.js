const body = document.body;
const header = document.getElementById('site-header');
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuClose = document.getElementById('mobile-menu-close');
const themeToggle = document.getElementById('theme-toggle');
const timelineProgress = document.getElementById('timeline-progress');
const timeline = document.querySelector('.timeline');
const year = document.getElementById('current-year');
const canvas = document.getElementById('ambient-canvas');

if (year) year.textContent = String(new Date().getFullYear());

const savedTheme = localStorage.getItem('portfolio-theme');
const initialTheme = savedTheme || 'dark';
body.dataset.theme = initialTheme;

function setMenu(open) {
  if (!menuToggle || !mobileMenu) return;
  menuToggle.setAttribute('aria-expanded', String(open));
  mobileMenu.hidden = !open;
  body.classList.toggle('menu-open', open);
}

menuToggle?.addEventListener('click', () => {
  setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
});
mobileMenuClose?.addEventListener('click', () => setMenu(false));
mobileMenu?.addEventListener('click', (event) => {
  if (event.target === mobileMenu) setMenu(false);
});
mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));

function updateThemeIcon() {
  const path = themeToggle?.querySelector('path');
  if (!path) return;
  path.setAttribute('d', body.dataset.theme === 'light'
    ? 'M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9Z'
    : 'M12 4V2m0 20v-2m8-8h2M2 12h2m13.66-5.66 1.42-1.42M4.92 19.08l1.42-1.42m11.32 0 1.42 1.42M4.92 4.92l1.42 1.42M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z');
}
updateThemeIcon();

themeToggle?.addEventListener('click', () => {
  body.dataset.theme = body.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('portfolio-theme', body.dataset.theme);
  updateThemeIcon();
});

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    observer.unobserve(entry.target);
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

function handleScroll() {
  header?.classList.toggle('scrolled', window.scrollY > 40);
  if (!timeline || !timelineProgress) return;
  const rect = timeline.getBoundingClientRect();
  const start = window.innerHeight * 0.62;
  const progress = Math.min(1, Math.max(0, (start - rect.top) / rect.height));
  timelineProgress.style.height = `${progress * 100}%`;
}
window.addEventListener('scroll', handleScroll, { passive: true });
handleScroll();

if (window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.tilt-card').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(1100px) rotateX(${y * -3.5}deg) rotateY(${x * 3.5}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });
}

if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const ctx = canvas.getContext('2d');
  const particles = [];
  const count = 42;

  function resizeCanvas() {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(window.innerWidth * ratio);
    canvas.height = Math.floor(window.innerHeight * ratio);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  class Particle {
    constructor() {
      this.x = Math.random() * window.innerWidth;
      this.y = Math.random() * window.innerHeight;
      this.vx = (Math.random() - 0.5) * 0.16;
      this.vy = (Math.random() - 0.5) * 0.16;
      this.size = Math.random() * 1.2 + 0.35;
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
  for (let i = 0; i < count; i += 1) particles.push(new Particle());

  function draw() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const point = body.dataset.theme === 'light' ? '28,39,61' : '255,255,255';
    particles.forEach((particle, index) => {
      particle.update();
      ctx.fillStyle = `rgba(${point},0.28)`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();

      for (let j = index + 1; j < particles.length; j += 1) {
        const other = particles[j];
        const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
        if (distance > 115) continue;
        ctx.strokeStyle = `rgba(${point},${0.07 - distance / 1900})`;
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(other.x, other.y);
        ctx.stroke();
      }
    });
    requestAnimationFrame(draw);
  }
  draw();
}
