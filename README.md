# Christian Gonzalez Lopez · Portfolio

[![CI](https://github.com/cnovelles/portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/cnovelles/portfolio/actions/workflows/ci.yml)

Personal site for a full-stack software engineer: who I am, where I've worked, what I build with, and how to reach me.

**Live:** [portfolio-xi-one-b66hmycebi.vercel.app](https://portfolio-xi-one-b66hmycebi.vercel.app)

The repository is meant to be read as a code sample too: typed end to end, tested where logic lives, accessible by default, and checked in CI on every change.

## Lighthouse

Measured on the live site, October 2026.

| Mobile | Desktop |
| --- | --- |
| ![Lighthouse mobile: 100 Performance, 100 Accessibility, 100 Best Practices, 100 SEO](docs/lighthouse-mobile.png) | ![Lighthouse desktop: 100 Performance, 100 Accessibility, 100 Best Practices, 100 SEO](docs/lighthouse-desktop.png) |

## Stack

- **[Astro](https://astro.build) 7**, static output
- **React 19** for the one interactive island (the theme toggle)
- **TypeScript** in strict mode, with **zod** schemas for content
- **Tailwind CSS 4** with design tokens in one stylesheet
- **Vitest** for unit tests, **Playwright + axe-core** for end-to-end accessibility tests
- **GitHub Actions** for CI, **Vercel** for hosting

## Key decisions

**Static HTML first, JavaScript only where it earns its place.** Every section is server-rendered Astro. The only client JavaScript is the theme toggle island plus a few lines of inline script that set the theme before first paint, so there's never a flash of the wrong theme.

**One typed source for every career claim.** Identity, experience, skills, and the about text live in [`src/data/profile.ts`](src/data/profile.ts), validated by a zod schema when the module loads. Components only read through typed accessors such as `getExperience()`, so malformed data fails the build instead of rendering.

**A guard against overstated claims.** The experience text mirrors my resume word for word. A unit test scans every title and bullet against a list of phrases I've deliberately retired, so overstated wording can't creep back in through a later edit.

**Projects as content, not code.** Projects are an [Astro content collection](https://docs.astro.build/en/guides/content-collections/) with a typed schema: required fields, valid dates, and alt text on any cover image. Adding one means adding a single Markdown file. The sorting and featured-filtering logic is pure TypeScript in [`src/lib/projects.ts`](src/lib/projects.ts), tested without Astro. Until the first write-up ships, the section shows an intentional empty state.

**Small, pure modules behind thin adapters.** Theme resolution ([`src/lib/theme.ts`](src/lib/theme.ts)) and page metadata ([`src/lib/seo.ts`](src/lib/seo.ts)) are plain functions with unit tests. The React toggle, the inline script, and the `<Seo>` component only wire them to the browser and the page head. Storage failures (private mode, blocked storage) fall back to the system theme.

**Accessibility is tested, not assumed.** Every text color meets WCAG AA in both themes. There's a skip link, landmarks, a single focus style, descriptive link names for screen readers, 44px touch targets, and reduced-motion support. The end-to-end suite fails CI if any of that regresses.

**Fast without trading away the design.** Fonts are self-hosted and the critical files are preloaded, which took mobile Performance from 93 to 100 without changing the typeface.

## Project structure

```
src/
  components/      Page sections (Hero, Experience, Projects, Skills, About, Contact),
                   Seo, and the ThemeToggle island
  content/         Project write-ups (Markdown) + a template
  data/profile.ts  Typed, validated profile data and the claims guard
  layouts/         Base layout: head, theme init, skip link, header, footer
  lib/             Pure modules: theme, seo, projects
  pages/           Home, project detail pages, 404, robots.txt
  styles/          Design tokens and global styles
e2e/               Playwright + axe accessibility tests
scripts/           Social preview image generator
```

## Running locally

Requires the Node version in [`.nvmrc`](.nvmrc).

```bash
nvm use
npm install
npm run dev
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run check` | Type-check with `astro check` |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest) |
| `npm run build` | Production build to `dist/` |
| `npm run test:e2e` | Accessibility tests against the built site (run `npm run build` first; first run needs `npx playwright install chromium`) |

CI runs all of these on every pull request and push to `main`. Vercel deploys `main` automatically and builds a preview for each pull request.

## Updating content

- **Experience, skills, about:** edit [`src/data/profile.ts`](src/data/profile.ts). The schema and tests will catch mistakes.
- **A new project:** copy [`src/content/projects/_template.md`](src/content/projects/_template.md) to `src/content/projects/<slug>.md` and fill it in. The filename becomes the URL.
- **Resume:** replace `public/Christian-Gonzalez-Resume.pdf` and keep the filename, so existing links keep working.

## Planning

The site was planned in a [PRD](PRD-portfolio-site.md) and built as a series of small vertical slices tracked in [GitHub Issues](https://github.com/cnovelles/portfolio/issues?q=is%3Aissue).
