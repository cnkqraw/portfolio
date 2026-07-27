const body = document.body;
const header = document.getElementById('site-header');
const menuButton = document.getElementById('menu-button');
const mobileDrawer = document.getElementById('mobile-drawer');
const drawerClose = document.getElementById('drawer-close');
const themeButton = document.getElementById('theme-button');
const themeIcon = themeButton?.querySelector('i');
const year = document.getElementById('current-year');
const desktopLinks = [...document.querySelectorAll('.desktop-links a')];
const sections = [...document.querySelectorAll('main section[id]')];

if (year) year.textContent = String(new Date().getFullYear());

const savedTheme = localStorage.getItem('portfolio-theme');
const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
body.dataset.theme = savedTheme || (systemDark ? 'dark' : 'light');
updateThemeIcon();

function updateThemeIcon() {
  if (!themeIcon) return;
  themeIcon.className = body.dataset.theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

if (themeButton) {
  themeButton.addEventListener('click', () => {
    body.dataset.theme = body.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('portfolio-theme', body.dataset.theme);
    updateThemeIcon();
  });
}

function openMenu() {
  if (!menuButton || !mobileDrawer) return;
  menuButton.setAttribute('aria-expanded', 'true');
  mobileDrawer.hidden = false;
  body.classList.add('menu-open');
}

function closeMenu() {
  if (!menuButton || !mobileDrawer) return;
  menuButton.setAttribute('aria-expanded', 'false');
  mobileDrawer.hidden = true;
  body.classList.remove('menu-open');
}

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  open ? closeMenu() : openMenu();
});

drawerClose?.addEventListener('click', closeMenu);
mobileDrawer?.addEventListener('click', (event) => {
  if (event.target === mobileDrawer) closeMenu();
});
mobileDrawer?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

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

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      desktopLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: '-44% 0px -44% 0px' }
);

sections.forEach((section) => sectionObserver.observe(section));

function handleScroll() {
  header?.classList.toggle('scrolled', window.scrollY > 40);
}

window.addEventListener('scroll', handleScroll, { passive: true });
handleScroll();
