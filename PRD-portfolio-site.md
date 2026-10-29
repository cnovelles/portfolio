# PRD: Personal Portfolio Site

**Status:** needs-triage
**Owner:** Christian Gonzalez Lopez
**Date:** 2026-10-29

## Problem Statement

I'm a full-stack software engineer (React/TypeScript + Node.js/Java, 3+ years at American Express) actively applying to mid-level roles. My resumes are now strong and accurate, but I have no personal website. When a recruiter or hiring manager wants to learn more than a one-page resume shows, there is nowhere to send them.

Worse, the place they *do* click — my public GitHub (`cnovelle`) — only shows 2019–2022 practice repos and two abandoned portfolio attempts from 2022. That undersells me: it looks like I stopped building, when in reality my best work (One App micro-frontends, payments modernization, end-to-end market releases) lives in private corporate repos I can't show.

Recruiters scan in seconds. I need one link that tells my story fast, proves I can build polished, fast, accessible frontends, and gives me a public, well-engineered code sample.

## Solution

A clean, minimal, fast personal portfolio site on a custom domain. In a ten-second scan, a visitor sees who I am ("Full-Stack Software Engineer"), my stack, and where I've worked, with one-click access to my resume PDF, GitHub, LinkedIn, and email.

Below the fold: my experience (written to match my resume exactly — no new or inflated claims), a projects section that ships with a tasteful "more coming soon" state and lets me add project write-ups later as single content files, a grouped skills section, and a short about/contact section.

The site's own repository is public and treated as a code sample: typed, tested where it matters, CI-checked, documented, and scoring ≥95 on Lighthouse in every category.

## User Stories

1. As a recruiter, I want to see the engineer's name, title, and core stack immediately on landing, so that I can decide in seconds whether they match my role.
2. As a recruiter, I want a prominent "Resume" button, so that I can download the latest PDF without hunting for it.
3. As a recruiter, I want the resume link to always serve the current version, so that I never forward an outdated resume to a hiring manager.
4. As a recruiter, I want visible GitHub, LinkedIn, and email links in the first screen, so that I can contact or vet the candidate immediately.
5. As a recruiter on my phone, I want the site to load fast and read well on a small screen, so that I can review candidates between meetings.
6. As a hiring manager, I want a concise experience section with the company, team, title, and dates, so that I can understand career progression at a glance.
7. As a hiring manager, I want each role described with concrete, quantified impact, so that I can judge the scope of the candidate's work.
8. As a hiring manager, I want the experience text to match the resume I received, so that I trust the candidate's claims are consistent.
9. As a hiring manager, I want to see both frontend and backend work called out, so that I can confirm the candidate is genuinely full-stack.
10. As a hiring manager, I want to see release and production-ownership experience, so that I know the candidate can ship safely, not just write code.
11. As a hiring manager, I want open-source experience surfaced, so that I can see the candidate works well in public codebases.
12. As a hiring manager, I want a grouped, readable skills section, so that I can map the candidate's tools to my team's stack without wading through a keyword dump.
13. As a technical interviewer, I want project write-ups structured as problem → approach → result, so that I can prepare targeted interview questions.
14. As a technical interviewer, I want each project to link to its code and live demo when available, so that I can evaluate real work.
15. As a technical interviewer, I want the portfolio's own repository to be clean, typed, tested, and documented, so that it serves as a trustworthy code sample.
16. As a technical interviewer, I want the repo README to explain the stack and key decisions, so that I can understand the candidate's reasoning.
17. As a visitor, I want the site to respect my system light/dark preference, so that it's comfortable to read.
18. As a visitor, I want a theme toggle that remembers my choice, so that the site stays the way I set it on return visits.
19. As a visitor, I want no flash of the wrong theme on page load, so that the site feels polished.
20. As a visitor who prefers reduced motion, I want animations disabled, so that the site is comfortable to use.
21. As a keyboard-only visitor, I want every link and control reachable with visible focus states, so that I can navigate without a mouse.
22. As a screen-reader user, I want semantic headings, landmarks, and descriptive link text, so that I can understand the page structure.
23. As a visitor with low vision, I want sufficient color contrast in both themes, so that I can read all content.
24. As someone sharing the link on LinkedIn or Slack, I want a rich preview (title, description, image), so that the link looks professional when posted.
25. As a recruiter searching the candidate's name, I want the site to be indexable with proper titles and a sitemap, so that I can find it.
26. As the owner, I want to add a new project by creating one content file, so that I can grow the portfolio without touching components.
27. As the owner, I want invalid project content (missing title, bad date, broken fields) to fail the build, so that I never publish a broken page.
28. As the owner, I want to mark projects as featured and control their order, so that my strongest work appears first.
29. As the owner, I want the projects section to show a graceful "more coming soon" state when no projects exist, so that the site looks intentional while projects are on hold.
30. As the owner, I want experience, skills, and contact data in one typed source, so that updating my career info happens in one place.
31. As the owner, I want a guard that fails if experience text contains claims I've retracted (e.g. "led a self-directed migration", "5+ teams", "built the complete UI"), so that overstated language can't creep back in.
32. As the owner, I want page metadata generated from a single helper with sensible defaults, so that every page has correct titles, canonical URLs, and social tags.
33. As the owner, I want every pull request checked by CI (type-check, lint, tests, build), so that the public repo never shows a broken main branch.
34. As the owner, I want pushes to main to deploy automatically to my custom domain, so that publishing is effortless.
35. As the owner, I want the same site URL usable on my resume, LinkedIn, and GitHub profile, so that my online presence is consistent.
36. As the owner, I want the site to cost nothing beyond the domain, so that it's sustainable during my job search.
37. As the owner, I want a 404 page that matches the site design, so that broken links still feel polished.

## Implementation Decisions

**Stack**
- Astro with static output, React only for interactive islands (theme toggle; later, an optional project filter), TypeScript in strict mode, Tailwind CSS for styling.
- Hosted on Vercel, connected to a public GitHub repository under `cnovelles`; custom domain purchased by the owner and pointed at Vercel.
- Lives in its own new project folder under the owner's Development directory. The 2022 portfolio stubs are left untouched (archiving them is a separate decision).

**Modules**

1. **Profile data (deep module)**
   - Single typed source for identity (name, title, location, links, email), experience entries, skill groups, and the about blurb.
   - Validated against a schema at build time; the rest of the site only consumes typed accessors (e.g. get experience in display order, get skill groups).
   - Content mirrors the accurate resume wording: AmEx Full Stack Software Engineer, Credit & Collections (One App micro-frontends + Node.js/Java REST APIs for millions of users across 7 markets; helped drive modernization of legacy payments journeys into 10+ modern React repos; owned end-to-end market releases; ~25% page-load improvement); VMware Front End Intern (UI features for open-source Tanzu Community Edition); FIU/PNNL research (C#/ASP.NET deep-learning REST service; published time-series algorithm). End date May 2026.
   - Includes a "retracted claims" guard: a list of banned phrases checked against all experience text.

2. **Projects catalog (deep module)**
   - Astro content collection of project write-ups with a typed schema: title, summary, role, stack, dates, status (in-progress/shipped), featured flag, sort order, optional repo and live URLs, optional cover image with required alt text, body sections for problem/approach/result.
   - Interface: get featured projects (sorted), get all projects (sorted), get project by slug, and an explicit empty-state signal.
   - Ships with zero published projects; Dresser, the Miami resource finder, and an AmEx/One App case study are added later as single files.

3. **Theme resolver (deep module)**
   - Pure resolution function: given a stored preference (light/dark/none) and the system preference, returns the effective theme. Stored preference always wins; otherwise follow the system.
   - Thin adapters around it: a tiny inline pre-paint script that applies the theme class before render (prevents flash), and the React toggle island that cycles the theme and persists it.
   - Storage access is wrapped so failures (private mode, blocked storage) fall back to the system preference.

4. **SEO/meta builder (deep module)**
   - Pure function: given page input (title, description, path, optional image), returns the full meta set: document title with site-name suffix, description, canonical absolute URL, Open Graph and Twitter card tags, and a default social image.
   - Site-wide defaults live in one place; pages override only what differs.
   - Sitemap and robots generated at build.

5. **Layout and sections (presentational)**
   - Base layout (meta, theme init, skip link, header/footer) and sections: Hero, Experience, Projects, Skills, About/Contact, plus a 404 page.
   - Sections read only from the modules above; no hard-coded career content in components.
   - Design: minimal, generous whitespace, one accent color, strong type scale, light and dark themes, subtle motion gated behind reduced-motion. A design pass (type and color choices) happens at build start so it doesn't look templated.

6. **Resume asset**
   - The latest balanced resume PDF is served at a stable path under a stable filename, so the link on the site never changes when the resume is updated.

7. **CI/CD**
   - GitHub Actions on pull requests and pushes to main: type-check, lint, unit tests, production build.
   - Vercel deploys main automatically; preview deployments for pull requests.

**Quality bars**
- Lighthouse ≥95 on Performance, Accessibility, Best Practices, and SEO, both mobile and desktop.
- No axe violations; full keyboard navigation with visible focus; WCAG AA contrast in both themes.
- Page weight kept small: no client JavaScript except the theme island.

## Testing Decisions

**What makes a good test here:** tests exercise each module only through its public interface and assert observable behavior (returned data, ordering, emitted tags, resolved theme), never internal structure. They should survive refactors of how a module is implemented. Pure functions are tested directly; adapters (storage, DOM) are tested with minimal fakes.

**Modules under test** (unit tests, Vitest):
- **Profile data:** schema accepts the real data; rejects malformed entries (missing company, bad dates, empty bullets); experience returned in reverse-chronological order; the retracted-claims guard fails on banned phrases and passes on the real content.
- **Projects catalog:** featured filtering and sort order; stable ordering for ties; empty state when no projects exist; schema rejects a project missing required fields or an image without alt text.
- **Theme resolver:** every combination of stored preference × system preference; toggle cycles correctly; storage failure falls back to system preference.
- **SEO/meta builder:** defaults applied when fields are omitted; per-page overrides win; canonical and image URLs are absolute; title suffix formatting; OG and Twitter tags all present.

**Not unit-tested:** presentational section components (covered instead by the build, type-check, Lighthouse, and axe audits).

**Prior art:** none in this repo yet (new project). The owner's Dresser project (`fit-room`) already uses a PRD → issues → CI workflow with lint and accessibility checks in GitHub Actions; this project follows the same conventions.

## Out of Scope

- Writing the actual project write-ups (Dresser, Miami resource finder, AmEx/One App case study) — deferred; the catalog is built to receive them.
- Making Dresser or other private repos public, or cleaning up/archiving old GitHub repos and pinning.
- A blog, CMS, newsletter, analytics, or contact form backend (mailto is sufficient).
- Spanish translation of the site.
- Purchasing the domain (owner's action) and updating the resume header, LinkedIn, and GitHub profile with the URL after launch.

## Further Notes

- **Single source of truth for claims:** all career wording must stay consistent with the accurate resumes and the owner's confirmed facts (no "led", "self-directed", "5+ teams", "complete UI workflow", "published npm packages"). The retracted-claims guard enforces this in CI.
- **Research basis:** recruiters scan in seconds, so lead with who/what/stack and a resume link above the fold; show a few strong projects with write-ups rather than everything; make contact, GitHub, LinkedIn, and the PDF resume easy to find; keep load time under ~2s and audit accessibility; use the same URL across resume, LinkedIn, and GitHub.
- **Issue tracker:** no tracker is configured for this project yet; this PRD is saved in the project folder with a `needs-triage` status. Once the GitHub repo exists, it can be filed as an issue with the `needs-triage` label and broken into issues with `/to-issues`.
