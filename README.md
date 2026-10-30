# Portfolio

Personal portfolio site for Christian Gonzalez Lopez, Full-Stack Software Engineer.

**Stack:** Astro (static) · React islands · TypeScript (strict) · Tailwind CSS · Vitest · Vercel

Work is planned in [`PRD-portfolio-site.md`](./PRD-portfolio-site.md) and tracked in GitHub Issues.

## Development

Requires the Node version in [`.nvmrc`](./.nvmrc).

```bash
nvm use
npm install
npm run dev
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run check` | Type-check (`astro check`) |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest) |
| `npm run build` | Production build to `dist/` |

CI runs check, lint, test, and build on every pull request and push to `main`.

## Resume

The resume is served at `/Christian-Gonzalez-Resume.pdf`. To update it, replace the file in `public/` and keep the filename, so links never break.
