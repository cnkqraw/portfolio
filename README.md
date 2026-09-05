# Muhammad Mustaqim Chowdhury — Portfolio

Personal developer portfolio showcasing my projects, technical skills, certifications, learning journey, automation systems, and self-hosted infrastructure.

### [Visit the live portfolio →](https://mustaqim.is-a.dev)

![Portfolio Preview](assets/link-preview.jpg)

---

## About

I'm a student developer and automation builder based in Qatar with roots in Bangladesh.

I enjoy building practical systems and experimenting with:

- Python
- Rust
- JavaScript
- Backend development
- Automation
- AI integrations
- Linux
- Docker
- APIs
- Self-hosted infrastructure

Most of my projects start with an idea or problem I want to solve, then grow through testing, troubleshooting, and iteration.

---

## Featured Projects

### QuantumGPT

An AI-powered Discord bot built with JavaScript that connects Discord conversations to external language-model APIs.

The bot runs continuously on Linux as a managed background service.

**Technologies:** JavaScript · Discord.js · REST APIs · Linux · systemd

---

### My Home Lab

A self-hosted Ubuntu Server environment used for running Docker services, automation workflows, monitoring tools, remote development, and experimental backend applications.

**Technologies:** Ubuntu Server · Docker · Tailscale · Redis · Cloudflare · systemd

---

### Newton Competition Project

A team project created for an Inter-Newton school competition.

The project combined a website and game to present the story of Dr. Jabr and the development of the school.

The project achieved **2nd place**.

**Technologies:** HTML · CSS · GameMaker · itch.io

---

### Automated Short-Video Pipeline

An automation workflow for generating narrated short-form videos using text-to-speech, subtitles, automated rendering, and media processing.

**Technologies:** n8n · Python · FastAPI · Edge TTS · FFmpeg

---

## Contact System

The portfolio includes a real server-side contact form rather than relying only on a `mailto:` link.

### How It Works

**Visitor** → **Contact Form** → **Cloudflare Turnstile** → **POST `/api/contact`** → **Cloudflare Pages Function** → **Validation & Spam Protection** → **Rate Limiting** → **Resend API** → **Email**

The endpoint is implemented using Cloudflare Pages Functions.

### Protection

The contact system includes:

- Cloudflare Turnstile verification
- Honeypot spam detection
- Per-IP rate limiting
- SHA-256 hashing of IP identifiers before rate-limit storage
- Request body size protection
- Server-side input validation
- Content-Type validation
- Same-origin checks
- Cloudflare environment secrets
- Cloudflare KV rate-limit storage
- Resend API credentials kept entirely server-side

---

## Tech Stack

### Frontend

- HTML
- CSS
- JavaScript
- Responsive design
- Intersection Observer API
- Open Graph metadata
- Schema.org structured data

### Backend

- Cloudflare Pages Functions
- REST API
- Cloudflare KV
- Cloudflare Turnstile
- Resend

### Infrastructure & Deployment

- Cloudflare Pages
- GitHub
- `is-a.dev` custom domain
- Linux
- Docker
- systemd
- Tailscale

---

## SEO & Social Sharing

The portfolio includes:

- Canonical URL
- Open Graph metadata
- Twitter / X metadata
- Custom 1200 × 630 social-share image
- Schema.org structured data
- `sitemap.xml`
- `robots.txt`
- Google Search Console verification
- Custom 404 page

---

## Project Structure

```text
portfolio/
├── .well-known/
├── assets/
│   ├── profile.jpeg
│   ├── link-preview.jpg
│   ├── quantumgpt.webp
│   ├── home-lab.webp
│   ├── newton-competition.webp
│   └── short-video-pipeline.webp
│
├── certificates/
│
├── functions/
│   ├── _middleware.js
│   └── api/
│       └── contact.js
│
├── 404.html
├── favicon.png
├── index.html
├── README.md
├── robots.txt
└── sitemap.xml
```

---

## Cloudflare Configuration

The contact system requires configuration through Cloudflare.

### Secrets / Variables

```text
RESEND_API_KEY
CONTACT_TO
TURNSTILE_SECRET
```

### KV Binding

```text
CONTACT_RATE_LIMIT
```

Sensitive credentials are not stored in this repository.

---

## Deployment

The portfolio is deployed through Cloudflare Pages and connected to this GitHub repository.

Changes pushed to the production branch are deployed to:

**[https://mustaqim.is-a.dev](https://mustaqim.is-a.dev)**

---

## Certificates

The portfolio currently includes certificates and credentials from:

- OpenAI Academy
- Google for Education
- Cisco Networking Academy / NDG
- Anthropic

Certificate PDFs and optimized preview images are stored in the `certificates/` directory.

---

## Contact

- **Portfolio:** [mustaqim.is-a.dev](https://mustaqim.is-a.dev)
- **GitHub:** [github.com/mztaq](https://github.com/mztaq)
- **LinkedIn:** [Muhammad Mustaqim Chowdhury](https://www.linkedin.com/in/muhammad-mustaqim-chowdhury/)

---

Built and maintained by **Muhammad Mustaqim Chowdhury**.
