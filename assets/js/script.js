    (() => {
      'use strict';
      const header = document.getElementById('siteHeader');
      const progress = document.querySelector('.progress-bar');
      const routeFill = document.querySelector('.scroll-route-fill');
      const routeNodes = Array.from(document.querySelectorAll('.scroll-route-node'));
      const backToTop = document.getElementById('backToTop');
      const menuButton = document.querySelector('.menu-toggle');
      const navLinks = document.getElementById('navLinks');
      const navIndicator = document.querySelector('.nav-indicator');
      const navItems = Array.from(navLinks.querySelectorAll('a'));
      const sections = Array.from(document.querySelectorAll('.section-track'));
      const revealTargets = Array.from(document.querySelectorAll('.reveal'));
      const projectFilters = Array.from(document.querySelectorAll('.filter-button[data-project-filter]'));
      const projectCards = Array.from(document.querySelectorAll('.project-card'));
      const certificateCards = Array.from(document.querySelectorAll('.certificate-card'));
      const timeline = document.querySelector('.timeline');
      const heroVisual = document.getElementById('heroVisual');
      const portraitRail = document.querySelector('.portrait-rail');
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const finePointerQuery = window.matchMedia('(pointer: fine)');

      let activeProjectFilter = 'all';
      let scrollTicking = false;

      const setYear = () => {
        const yearTarget = document.getElementById('year');
        if (yearTarget) yearTarget.textContent = String(new Date().getFullYear());
      };

      const updateNavIndicator = (activeLink) => {
        if (!navIndicator || !activeLink || window.innerWidth < 900) return;
        const navRect = navLinks.getBoundingClientRect();
        const linkRect = activeLink.getBoundingClientRect();
        navLinks.style.setProperty('--nav-indicator-width', `${linkRect.width}px`);
        navLinks.style.setProperty('--nav-indicator-x', `${linkRect.left - navRect.left}px`);
        navLinks.style.setProperty('--nav-indicator-opacity', '1');
      };

      const updateScrollChrome = () => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const ratio = maxScroll > 0 ? window.scrollY / maxScroll : 0;
        const clampedRatio = Math.max(0, Math.min(1, ratio));
        progress.style.width = `${clampedRatio * 100}%`;
        if (routeFill) routeFill.style.transform = `scaleY(${clampedRatio.toFixed(4)})`;
        routeNodes.forEach((node) => {
          const threshold = Number(node.dataset.routeAt || 0);
          node.classList.toggle('active', clampedRatio >= threshold);
        });
        header.classList.toggle('scrolled', window.scrollY > 18);
        backToTop.classList.toggle('visible', window.scrollY > 520);
      };

      const requestScrollUpdate = () => {
        if (scrollTicking) return;
        scrollTicking = true;
        requestAnimationFrame(() => {
          scrollTicking = false;
          updateScrollChrome();
        });
      };

      const closeMenu = () => {
        navLinks.classList.remove('open');
        document.body.classList.remove('menu-open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Open navigation menu');
      };

      const openMenu = () => {
        navLinks.classList.add('open');
        document.body.classList.add('menu-open');
        menuButton.setAttribute('aria-expanded', 'true');
        menuButton.setAttribute('aria-label', 'Close navigation menu');
      };

      const setupNavigation = () => {
        menuButton.addEventListener('click', () => navLinks.classList.contains('open') ? closeMenu() : openMenu());
        navItems.forEach((link) => link.addEventListener('click', closeMenu));
        document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
        document.addEventListener('click', (event) => { if (!navLinks.contains(event.target) && !menuButton.contains(event.target)) closeMenu(); });
      };

      const setupSmoothScrolling = () => {
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
          anchor.addEventListener('click', (event) => {
            const href = anchor.getAttribute('href');
            const target = href ? document.querySelector(href) : null;
            if (!target) return;
            event.preventDefault();
            target.scrollIntoView({ behavior: reducedMotionQuery.matches ? 'auto' : 'smooth', block: 'start' });
          });
        });
        backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotionQuery.matches ? 'auto' : 'smooth' }));
      };

      const setupRevealAnimations = () => {
        if (!('IntersectionObserver' in window) || reducedMotionQuery.matches) {
          revealTargets.forEach((target) => target.classList.add('visible'));
          certificateCards.forEach((card) => card.classList.add('cert-visible'));
          if (timeline) timeline.classList.add('timeline-visible');
          return;
        }

        const revealObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        revealTargets.forEach((target) => revealObserver.observe(target));

        if (timeline) {
          const timelineObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              timeline.classList.add('timeline-visible');
              timelineObserver.disconnect();
            });
          }, { threshold: 0.18, rootMargin: '0px 0px -18% 0px' });
          timelineObserver.observe(timeline);
        }

        let certificatesShown = false;
        const showCertificates = () => {
          if (certificatesShown) return;
          certificatesShown = true;
          certificateCards.forEach((card, index) => window.setTimeout(() => card.classList.add('cert-visible'), index * 110));
        };
        const certificateObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            showCertificates();
            certificateObserver.disconnect();
          });
        }, { threshold: 0.08, rootMargin: '0px 0px -12% 0px' });
        const certSection = document.getElementById('certificates');
        if (certSection) certificateObserver.observe(certSection);
      };

      const setupActiveSections = () => {
        let activeNavTicking = false;

        const setActiveNav = () => {
          if (!sections.length) return;

          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          const atPageBottom = maxScroll > 0 && window.scrollY >= maxScroll - 8;
          const referenceY = window.scrollY + Math.min(window.innerHeight * 0.42, window.innerHeight - 120);
          let activeSection = atPageBottom ? sections[sections.length - 1] : sections[0];

          if (!atPageBottom) {
            sections.forEach((section) => {
              if (section.offsetTop <= referenceY) activeSection = section;
            });
          }

          let activeLink = null;
          navItems.forEach((link) => {
            const active = link.getAttribute('href') === `#${activeSection.id}`;
            link.classList.toggle('active', active);
            if (active) activeLink = link;
          });
          updateNavIndicator(activeLink);
        };

        const requestActiveNavUpdate = () => {
          if (activeNavTicking) return;
          activeNavTicking = true;
          requestAnimationFrame(() => {
            activeNavTicking = false;
            setActiveNav();
          });
        };

        setActiveNav();
        window.addEventListener('scroll', requestActiveNavUpdate, { passive: true });
        window.addEventListener('resize', requestActiveNavUpdate);
      };

      const setupProjectFilters = () => {
        const apply = () => {
          projectCards.forEach((card) => {
            const category = card.dataset.category || '';
            const shouldHide = activeProjectFilter !== 'all' && !category.includes(activeProjectFilter);
            if (shouldHide) {
              card.classList.add('filter-fading', 'hidden-by-filter');
              window.setTimeout(() => {
                if (card.classList.contains('hidden-by-filter')) card.hidden = true;
              }, reducedMotionQuery.matches ? 0 : 190);
            } else {
              card.hidden = false;
              requestAnimationFrame(() => card.classList.remove('filter-fading', 'hidden-by-filter'));
            }
          });
        };
        projectFilters.forEach((button) => {
          button.addEventListener('click', () => {
            activeProjectFilter = button.dataset.projectFilter || 'all';
            projectFilters.forEach((item) => item.classList.toggle('active', item === button));
            apply();
          });
        });
      };

      const setupPortraitMotion = () => {
        if (!heroVisual || !portraitRail || reducedMotionQuery.matches || !finePointerQuery.matches) return;
        let frameRequested = false;
        let targetX = 0;
        let targetY = 0;
        let currentX = 0;
        let currentY = 0;

        const render = () => {
          frameRequested = false;
          currentX += (targetX - currentX) * 0.12;
          currentY += (targetY - currentY) * 0.12;
          portraitRail.style.setProperty('--portrait-x', `${currentX.toFixed(2)}px`);
          portraitRail.style.setProperty('--portrait-y', `${currentY.toFixed(2)}px`);
          if (Math.abs(currentX - targetX) > 0.04 || Math.abs(currentY - targetY) > 0.04) requestFrame();
        };

        const requestFrame = () => {
          if (frameRequested) return;
          frameRequested = true;
          requestAnimationFrame(render);
        };

        heroVisual.addEventListener('pointermove', (event) => {
          const rect = heroVisual.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
          const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
          targetX = Math.max(-1, Math.min(1, x)) * 5;
          targetY = Math.max(-1, Math.min(1, y)) * 5;
          requestFrame();
        });

        heroVisual.addEventListener('pointerleave', () => {
          targetX = 0;
          targetY = 0;
          requestFrame();
        });
      };

      const setupProjectCardInteractions = () => {
        if (reducedMotionQuery.matches || !finePointerQuery.matches) return;
        projectCards.forEach((card) => {
          let frameRequested = false;
          let nextX = 50;
          let nextY = 50;
          let nextRotateX = 0;
          let nextRotateY = 0;

          const render = () => {
            frameRequested = false;
            card.style.setProperty('--pointer-x', `${nextX.toFixed(2)}%`);
            card.style.setProperty('--pointer-y', `${nextY.toFixed(2)}%`);
            card.style.setProperty('--card-rx', `${nextRotateX.toFixed(3)}deg`);
            card.style.setProperty('--card-ry', `${nextRotateY.toFixed(3)}deg`);
          };

          const requestFrame = () => {
            if (frameRequested) return;
            frameRequested = true;
            requestAnimationFrame(render);
          };

          card.addEventListener('pointermove', (event) => {
            const rect = card.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width;
            const y = (event.clientY - rect.top) / rect.height;
            nextX = x * 100;
            nextY = y * 100;
            nextRotateX = (0.5 - y) * 0.8;
            nextRotateY = (x - 0.5) * 0.8;
            requestFrame();
          });

          card.addEventListener('pointerleave', () => {
            nextX = 50;
            nextY = 50;
            nextRotateX = 0;
            nextRotateY = 0;
            requestFrame();
          });
        });
      };

      const setupMagneticButtons = () => {
        if (reducedMotionQuery.matches || !finePointerQuery.matches) return;
        document.querySelectorAll('.btn').forEach((button) => {
          let frameRequested = false;
          let nextX = 0;
          let nextY = 0;

          const render = () => {
            frameRequested = false;
            button.style.setProperty('--magnet-x', `${nextX.toFixed(2)}px`);
            button.style.setProperty('--magnet-y', `${nextY.toFixed(2)}px`);
          };

          const requestFrame = () => {
            if (frameRequested) return;
            frameRequested = true;
            requestAnimationFrame(render);
          };

          button.addEventListener('pointermove', (event) => {
            const rect = button.getBoundingClientRect();
            nextX = ((event.clientX - rect.left) / rect.width - 0.5) * 5;
            nextY = ((event.clientY - rect.top) / rect.height - 0.5) * 4;
            requestFrame();
          });

          button.addEventListener('pointerleave', () => {
            nextX = 0;
            nextY = 0;
            requestFrame();
          });
        });
      };
        const projectDetails = {
          quantumgpt: {
            title: 'QuantumGPT',
        
            intro:
              'An AI-powered Discord bot that connects Discord conversations to external language-model providers and runs continuously on Linux.',
        
            image: 'assets/quantumgpt.webp',
        
            imageAlt: 'QuantumGPT Discord bot project',
        
            tags: [
              'JavaScript',
              'Discord.js',
              'REST APIs',
              'Linux',
              'systemd'
            ],
        
            content: `
              <section>
                <h3>Overview</h3>
        
                <p>
                  QuantumGPT is an AI-integrated Discord bot designed to
                  provide language-model responses directly inside Discord.
                </p>
              </section>
        
              <section>
                <h3>The Problem</h3>
        
                <p>
                  I wanted an AI assistant that could be used directly
                  inside a Discord server without users needing to leave
                  Discord or open a separate application.
                </p>
              </section>
        
              <section>
                <h3>What I Built</h3>
        
                <p>
                  I built the bot using JavaScript and Discord.js. It listens
                  for mentions, processes the user's message, communicates
                  with an external language-model provider, and sends the
                  generated response back into Discord.
                </p>
              </section>
        
              <section>
                <h3>How It Works</h3>
        
                <p>
                  Discord user → Discord.js bot → message processing →
                  external AI API → response processing → Discord reply.
                </p>
              </section>
        
              <section>
                <h3>Key Features</h3>
        
                <ul>
                  <li>Mention-based activation</li>
                  <li>External language-model API integration</li>
                  <li>Continuous Linux hosting</li>
                  <li>systemd service management</li>
                  <li>Automatic service restarting</li>
                </ul>
              </section>
        
              <section>
                <h3>What I Learned</h3>
        
                <p>
                  Building QuantumGPT gave me more practical experience with
                  APIs, asynchronous JavaScript, Discord bot development,
                  Linux services, deployment and troubleshooting.
                </p>
              </section>
            `
          },
        
        
          'home-lab': {
            title: 'My Home Lab',
        
            intro:
              'A self-hosted Ubuntu Server environment used for running Docker services, automation workflows, monitoring and backend experiments.',
        
            image: 'assets/home-lab.webp',
        
            imageAlt: "Mustaqim's self-hosted home lab",
        
            tags: [
              'Ubuntu Server',
              'Docker',
              'Tailscale',
              'Redis',
              'Cloudflare',
              'systemd'
            ],
        
            content: `
              <section>
                <h3>Overview</h3>
        
                <p>
                  My home lab is a persistent Linux environment that I use
                  for hosting services, automation workflows, monitoring,
                  development and backend experiments.
                </p>
              </section>
        
              <section>
                <h3>The Problem</h3>
        
                <p>
                  I wanted a persistent environment where I could run
                  applications and automation workflows without depending
                  on my laptop remaining powered on.
                </p>
              </section>
        
              <section>
                <h3>What I Built</h3>
        
                <p>
                  I configured an Ubuntu Server system for running
                  containerized applications and native Linux services.
                  It hosts Docker workloads, automation services, monitoring
                  tools and experimental backend applications.
                </p>
              </section>
        
              <section>
                <h3>Infrastructure</h3>
        
                <p>
                  Docker provides isolated services, Tailscale provides
                  secure remote access, Redis is available for application
                  state and caching, and systemd manages native background
                  services.
                </p>
              </section>
        
              <section>
                <h3>Technical Challenges</h3>
        
                <ul>
                  <li>Configuring networking and service ports</li>
                  <li>Troubleshooting Docker containers</li>
                  <li>Managing persistent background services</li>
                  <li>Setting up secure remote access</li>
                  <li>Monitoring CPU, memory and storage usage</li>
                  <li>Recovering services after failures</li>
                </ul>
              </section>
        
              <section>
                <h3>What I Learned</h3>
        
                <p>
                  Maintaining the server has given me practical experience
                  with Linux administration, Docker, networking, logs,
                  systemd, remote access and troubleshooting real running
                  services.
                </p>
              </section>
            `
          },
        
        
          newton: {
            title: 'Dr. Jabr Newton Odyssey Project',
        
            intro:
              'A team competition project combining web development and game development that achieved second place.',
        
            image: 'assets/newton-competition.webp',
        
            imageAlt: 'Dr. Jabr Newton Odyssey competition project',
        
            tags: [
              'HTML',
              'CSS',
              'GameMaker',
              'itch.io'
            ],
        
            content: `
              <section>
                <h3>Overview</h3>
        
                <p>
                  This project was created with a teammate for an
                  Inter-Newton school competition.
                </p>
              </section>
        
              <section>
                <h3>The Goal</h3>
        
                <p>
                  Our goal was to create an interactive project presenting
                  the story of Dr. Jabr, the development of the school and
                  some of the challenges involved in that journey.
                </p>
              </section>
        
              <section>
                <h3>What We Built</h3>
        
                <p>
                  The project combined a web experience with an interactive
                  game created using GameMaker and published through itch.io.
                </p>
              </section>
        
              <section>
                <h3>Result</h3>
        
                <p>
                  The project achieved <strong>second place</strong> in the
                  competition.
                </p>
              </section>
        
              <section>
                <h3>What I Learned</h3>
        
                <p>
                  The project gave me experience with teamwork, combining
                  multiple technologies, planning around a deadline,
                  presenting technical work and improving a project based
                  on feedback.
                </p>
              </section>
            `
          },
        
        
          'short-video': {
            title: 'Automated Short-Video Pipeline',
        
            intro:
              'An automated workflow that turns text into narrated short-form videos using text-to-speech, subtitles and FFmpeg rendering.',
        
            image: 'assets/short-video-pipeline.webp',
        
            imageAlt: 'Automated short-video generation pipeline',
        
            tags: [
              'n8n',
              'Python',
              'FastAPI',
              'Edge TTS',
              'FFmpeg'
            ],
        
            content: `
              <section>
                <h3>Overview</h3>
        
                <p>
                  This project explores automating the process of turning
                  text into finished short-form video content.
                </p>
              </section>
        
              <section>
                <h3>The Problem</h3>
        
                <p>
                  Producing short videos manually involves repetitive steps
                  such as narration generation, subtitle creation, timing,
                  media processing and rendering.
                </p>
              </section>
        
              <section>
                <h3>What I Built</h3>
        
                <p>
                  I built an n8n workflow connected to a Python and FastAPI
                  rendering service. Narration is generated with Edge TTS,
                  while FFmpeg handles the final media processing and render.
                </p>
              </section>
        
              <section>
                <h3>Pipeline</h3>
        
                <p>
                  Text → n8n workflow → text-to-speech → subtitle generation
                  → media processing → FFmpeg → final video.
                </p>
              </section>
        
              <section>
                <h3>Technical Challenges</h3>
        
                <ul>
                  <li>Synchronising narration and subtitles</li>
                  <li>Automating FFmpeg commands</li>
                  <li>Passing media files between services</li>
                  <li>Handling failed workflow executions</li>
                  <li>Improving pacing and output quality</li>
                </ul>
              </section>
        
              <section>
                <h3>What I Learned</h3>
        
                <p>
                  The project has helped me learn more about workflow
                  automation, APIs, FastAPI, media processing and connecting
                  multiple independent tools into one system.
                </p>
              </section>
            `
          }
        };
        
        
        const setupProjectModal = () => {
          const modal = document.getElementById('projectModal');
        
          if (!modal) return;
        
          const dialog =
            modal.querySelector('.project-modal-dialog');
        
          const title =
            document.getElementById('projectModalTitle');
        
          const intro =
            document.getElementById('projectModalIntro');
        
          const image =
            document.getElementById('projectModalImage');
        
          const tags =
            document.getElementById('projectModalTags');
        
          const body =
            document.getElementById('projectModalBody');
        
          const detailButtons =
            Array.from(
              document.querySelectorAll(
                '.project-details-button'
              )
            );
        
          const closeButtons =
            Array.from(
              modal.querySelectorAll(
                '[data-project-close]'
              )
            );
        
          let lastTrigger = null;
          let closingTimer = null;
        
        
          const openModal = (projectKey, trigger) => {
            const project = projectDetails[projectKey];
        
            if (!project) return;
        
            if (closingTimer) {
              clearTimeout(closingTimer);
              closingTimer = null;
            }
        
            lastTrigger = trigger;
        
            title.textContent =
              project.title;
        
            intro.textContent =
              project.intro;
        
            image.src =
              project.image;
        
            image.alt =
              project.imageAlt;
        
            tags.innerHTML =
              project.tags
                .map(
                  tag =>
                    `<span class="tag">${tag}</span>`
                )
                .join('');
        
            body.innerHTML =
              project.content;
        
            closeMenu();
        
            modal.hidden = false;
        
            modal.setAttribute(
              'aria-hidden',
              'false'
            );
        
            document.body.classList.add(
              'project-modal-open'
            );
        
            dialog.scrollTop = 0;
        
            requestAnimationFrame(() => {
              modal.classList.add('is-open');
        
              requestAnimationFrame(() => {
                dialog.focus();
              });
            });
          };
        
        
          const closeModal = () => {
            if (
              modal.hidden ||
              !modal.classList.contains('is-open')
            ) {
              return;
            }
        
            modal.classList.remove('is-open');
        
            modal.setAttribute(
              'aria-hidden',
              'true'
            );
        
            document.body.classList.remove(
              'project-modal-open'
            );
        
            const finishClosing = () => {
              modal.hidden = true;
        
              if (lastTrigger) {
                lastTrigger.focus();
              }
            };
        
            if (reducedMotionQuery.matches) {
              finishClosing();
              return;
            }
        
            closingTimer =
              window.setTimeout(
                finishClosing,
                280
              );
          };
        
        
          detailButtons.forEach(button => {
            button.addEventListener(
              'click',
              () => {
                openModal(
                  button.dataset.project,
                  button
                );
              }
            );
          });
        
        
          closeButtons.forEach(button => {
            button.addEventListener(
              'click',
              closeModal
            );
          });
        
        
          modal.addEventListener(
            'click',
            event => {
              if (event.target === modal) {
                closeModal();
              }
            }
          );
        
        
          document.addEventListener(
            'keydown',
            event => {
              if (
                event.key === 'Escape' &&
                !modal.hidden
              ) {
                event.preventDefault();
        
                closeModal();
              }
            }
          );
        };
        const setupContactForm = () => {
          const form = document.getElementById('contactForm');
        
          if (!form) return;
        
          const status = document.getElementById('formStatus');
          const submitButton = document.getElementById('contactSubmit');
        
          const fields = {
            name: document.getElementById('name'),
            email: document.getElementById('email'),
            message: document.getElementById('message'),
            website: document.getElementById('website')
          };
        
          const setError = (field, message) => {
            field.setAttribute(
              'aria-invalid',
              message ? 'true' : 'false'
            );
        
            const target = document.getElementById(
              `${field.id}-error`
            );
        
            if (target) {
              target.textContent = message;
            }
          };
        
          const validate = () => {
            let valid = true;
        
            const name = fields.name.value.trim();
            const email = fields.email.value.trim();
            const message = fields.message.value.trim();
        
            if (!name) {
              setError(
                fields.name,
                'Please enter your name.'
              );
        
              valid = false;
            } else {
              setError(fields.name, '');
            }
        
            if (!email) {
              setError(
                fields.email,
                'Please enter your email address.'
              );
        
              valid = false;
        
            } else if (
              !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
            ) {
              setError(
                fields.email,
                'Please enter a valid email address.'
              );
        
              valid = false;
        
            } else {
              setError(fields.email, '');
            }
        
            if (!message) {
              setError(
                fields.message,
                'Please enter a message.'
              );
        
              valid = false;
        
            } else if (message.length < 10) {
              setError(
                fields.message,
                'Your message must contain at least ten characters.'
              );
        
              valid = false;
        
            } else {
              setError(fields.message, '');
            }
        
            return valid;
          };
        
          [fields.name, fields.email, fields.message]
            .forEach((field) => {
        
              field.addEventListener('input', () => {
                validate();
        
                status.textContent = '';
                status.removeAttribute('data-state');
              });
        
            });
        
          form.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!validate()) {
              status.textContent =
                'Please fix the highlighted fields.';
            
              status.dataset.state = 'error';
              return;
            }
            
            const turnstileToken =
              form.querySelector('[name="cf-turnstile-response"]')?.value || '';
            
            if (!turnstileToken) {
              status.textContent =
                'Please complete the security verification.';
            
              status.dataset.state = 'error';
              return;
            }       
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
        
            status.textContent = 'Sending your message...';
            status.removeAttribute('data-state');
        
            try {
              const response = await fetch('/api/contact', {
                method: 'POST',
        
                headers: {
                  'Content-Type': 'application/json'
                },
        
                body: JSON.stringify({
                  name: fields.name.value.trim(),
                  email: fields.email.value.trim(),
                  message: fields.message.value.trim(),
                  website: fields.website.value.trim(),
                  turnstileToken
                })
              });
        
              const result = await response.json();
        
              if (!response.ok || !result.ok) {
                throw new Error(
                  result.error || 'Message could not be sent.'
                );
              }
        
              status.textContent =
                'Message sent successfully. I’ll get back to you as soon as I can.';
        
              status.dataset.state = 'success';
        
              form.reset();
        
              [fields.name, fields.email, fields.message]
                .forEach((field) => {
                  field.setAttribute(
                    'aria-invalid',
                    'false'
                  );
                });
        
            } catch (error) {
              console.error(error);
            
              status.textContent =
                error.message ||
                'Could not send your message. Please try again or use the email link.';
            
              status.dataset.state = 'error';
        
           } finally {
              submitButton.disabled = false;
              submitButton.textContent = 'Send Message';
            
              if (window.turnstile) {
                window.turnstile.reset('#contact-turnstile');
              }
            }
          });
        };
      const boot = () => {
        setYear();
        updateScrollChrome();
        setupNavigation();
        setupSmoothScrolling();
        setupRevealAnimations();
        setupActiveSections();
        setupProjectFilters();
        setupPortraitMotion();
        setupProjectCardInteractions();
        setupProjectModal();
        setupMagneticButtons();
        setupContactForm();
        requestScrollUpdate();
        window.addEventListener('scroll', requestScrollUpdate, { passive: true });
        document.addEventListener('visibilitychange', () => document.body.classList.toggle('page-paused', document.hidden));
      };

      boot();
    })();
