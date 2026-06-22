# Zane Neave — Portfolio

Personal site and interactive work demos. Built with Next.js 16, hand-rolled browser ML (scalar autograd playground), and a Three.js scroll atmosphere on the homepage.

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Local dev server         |
| `npm run build`| Production build         |
| `npm run start`| Serve production build   |
| `npm run lint` | ESLint                   |

## Environment

Copy `.env.example` to `.env.local` for local overrides:

```bash
cp .env.example .env.local
```

| Variable               | Required | Description                                      |
| ---------------------- | -------- | ------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL` | Deploy   | Canonical site URL for OG, sitemap, and robots   |

Example:

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Without this, metadata falls back to `http://localhost:3000` locally or your Vercel preview URL in preview deploys.

## Deploy (Vercel)

1. Import the repo in [Vercel](https://vercel.com).
2. Set **`NEXT_PUBLIC_SITE_URL`** to your production domain (e.g. `https://zane-neave.com`).
3. Deploy — Next.js app router; no extra config required.
4. After deploy, verify:
   - `/` — homepage
   - `/work/autograd-playground` — live demo
   - `/sitemap.xml` — sitemap
   - `/robots.txt` — robots
   - Paste your URL into an OG debugger to confirm social previews

## Structure

```
app/                    Routes, layout, OG images, sitemap
components/
  playground/           Autograd demo UI
  sections/             Homepage sections
  work/                 Project sub-pages
lib/
  content.ts            Site copy and project data
  playground/           Autograd, MLP, trainer
```

## Content

Edit site copy and projects in `lib/content.ts`. Project pages are generated from `PROJECTS` at `/work/[slug]`.
