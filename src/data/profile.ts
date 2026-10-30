import { z } from "astro/zod";

/*
  Profile data: the single source for every career claim on the site.
  Wording mirrors the accurate resume (build_resume.py, ATLASSIAN_BALANCED).
  Add nothing here that isn't on that resume.
*/

const linkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});

export const identitySchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  location: z.string().min(1),
  stackLine: z.string().min(1),
  email: z.email(),
  resumePath: z.string().regex(/^\/[\w-]+\.pdf$/),
  links: z.object({
    resume: linkSchema,
    github: linkSchema,
    linkedin: linkSchema,
    email: linkSchema,
  }),
});

/** A calendar month as "YYYY-MM", which is also a valid `<time datetime>`. */
const yearMonthSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Expected a YYYY-MM date");

export const experienceEntrySchema = z
  .object({
    company: z.string().trim().min(1),
    // Some roles (e.g. research positions) have no formal title on the resume.
    title: z.string().trim(),
    location: z.string().trim().min(1).optional(),
    /** One plain sentence on what the role was about. */
    summary: z.string().trim().min(1).optional(),
    start: yearMonthSchema,
    end: yearMonthSchema,
    bullets: z.array(z.string().trim().min(1)).min(1),
    /** Technologies named in this role's bullets. */
    tech: z.array(z.string().trim().min(1)).default([]),
  })
  .refine((entry) => entry.end >= entry.start, {
    message: "End date must not be before start date",
    path: ["end"],
  });

export const skillGroupSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1).optional(),
  skills: z.array(z.string().trim().min(1)).min(1),
});

export const credentialSchema = z.object({
  kind: z.enum(["degree", "certification"]),
  name: z.string().trim().min(1),
  issuer: z.string().trim().min(1),
  /** Completion month; omit while still in progress. */
  date: yearMonthSchema.optional(),
  status: z.enum(["earned", "in-progress"]),
}).refine((c) => (c.status === "earned") === (c.date !== undefined), {
  message: "Earned credentials need a date; in-progress ones must not have one",
  path: ["date"],
});

export const profileSchema = z.object({
  identity: identitySchema,
  experience: z.array(experienceEntrySchema).min(1),
  education: z.array(credentialSchema).min(1),
  skillGroups: z.array(skillGroupSchema).min(1),
  about: z.string().trim().min(1),
});

export type Identity = z.infer<typeof identitySchema>;
export type ProfileLink = Identity["links"]["resume"];
export type ExperienceEntry = z.infer<typeof experienceEntrySchema>;
export type SkillGroup = z.infer<typeof skillGroupSchema>;
export type Credential = z.infer<typeof credentialSchema>;
export type Profile = z.infer<typeof profileSchema>;

const email = "gonzalezchristianlopez@gmail.com";

// Stable public path: replace the file in /public, never rename it.
const resumePath = "/Christian-Gonzalez-Resume.pdf";

const vmwareBullets = [
  "Built UI features for the cluster-management workflow of VMware Tanzu Community Edition, an open-source Kubernetes distribution, using React, React Hooks, the Clarity design system, and a Node.js REST API",
  "Wrote comprehensive Jest unit tests covering component behavior and edge cases, reducing bugs before release",
  "Collaborated with UX to deliver accessible, user-centered interfaces that matched design specifications",
];

const rawProfile = {
  identity: {
    name: "Christian Gonzalez Lopez",
    title: "Full-Stack Software Engineer",
    location: "Miami, FL",
    stackLine:
      "React and TypeScript on the front end, Node.js and Java REST APIs behind them. Most recently building payments experiences at American Express.",
    email,
    resumePath,
    links: {
      resume: { label: "Resume", href: resumePath },
      github: { label: "GitHub", href: "https://github.com/cnovelles" },
      linkedin: {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/christian-g-5509a013a",
      },
      email: { label: "Email", href: `mailto:${email}` },
    },
  },
  // Listed in any order; getExperience() returns them most recent first.
  experience: [
    {
      company: "FIU Applied Research Center / Pacific Northwest National Laboratory",
      title: "Undergraduate Research Fellow",
      summary: "Research software for FIU and Pacific Northwest National Laboratory teams.",
      start: "2020-11",
      end: "2021-11",
      bullets: [
        "Deployed a deep learning crack-detection model as a REST web service using C# and ASP.NET, MySQL, and Azure",
        "Implemented a published time-series algorithm to fill gaps in spatial-temporal data across PNNL and FIU research teams",
      ],
      tech: ["C#", "ASP.NET", "MySQL", "Azure"],
    },
    {
      company: "American Express",
      title: "Full Stack Software Engineer, Credit & Collections",
      summary:
        "Payments experiences for card members, from React micro-frontends to the Node.js and Java APIs behind them.",
      start: "2023-03",
      end: "2026-05",
      bullets: [
        "Built customer-facing React and TypeScript micro-frontends on One App, AmEx's open-source micro-frontend framework, and the Node.js and Java REST APIs behind them, serving millions of users across 7 international markets",
        "Helped drive a large-scale modernization of the legacy payments journeys into 10+ modern React repositories, grooming stories and independently building testable, scalable components now live in production",
        "Integrated enterprise CMS content into React applications and configured monitoring and alerts for backend services, fixing complex production bugs to keep features reliable",
        "Improved page load performance ~25% through lazy loading, Webpack code splitting, and render optimization, delivering cross-browser, accessible UIs with UX designers",
        "Owned releases end to end for each market launch: semver-versioned, synchronized deployments of interdependent modules, QE and UAT support, and off-hours production deployments validated with live accounts, shipping high-quality code through CI/CD with Jest, React Testing Library, and ESLint",
      ],
      tech: ["React", "TypeScript", "One App", "Node.js", "Java", "REST APIs", "GraphQL", "Webpack", "Jest", "React Testing Library"],
    },
    {
      company: "VMware",
      title: "Front End Software Engineering Intern",
      location: "Remote",
      summary: "Front-end internship on VMware Tanzu Community Edition, an open-source Kubernetes distribution.",
      start: "2022-06",
      end: "2022-08",
      bullets: vmwareBullets,
      tech: ["React", "React Hooks", "Clarity", "Node.js", "Jest"],
    },
  ],
  education: [
    {
      kind: "degree",
      name: "B.S. Computer Science",
      issuer: "Florida International University",
      date: "2022-12",
      status: "earned",
    },
    {
      kind: "certification",
      name: "Software Testing Foundations: Test Techniques",
      issuer: "LinkedIn Learning",
      date: "2022-04",
      status: "earned",
    },
    {
      kind: "certification",
      name: "AWS Certified Cloud Practitioner",
      issuer: "Amazon Web Services",
      status: "in-progress",
    },
  ],
  skillGroups: [
    {
      name: "Frontend",
      description: "Fast, accessible interfaces for real customers.",
      skills: ["React", "TypeScript", "JavaScript (ES6+)", "React Hooks", "Redux", "HTML5", "CSS3", "Cross-Browser", "Accessibility (WCAG)"],
    },
    {
      name: "Backend & Cloud",
      description: "The services and APIs behind the interface.",
      skills: ["Node.js", "Express", "Java", "Spring Boot", "REST APIs", "MySQL", "AWS", "Docker", "NGINX", "npm"],
    },
    {
      name: "Frontend Ecosystem",
      description: "Builds, tests, and pipelines that make releases safe.",
      skills: ["Webpack (bundling)", "ESLint", "Jest", "React Testing Library", "Feature Flags", "Jenkins", "GitHub Actions", "Git"],
    },
    {
      name: "Practices",
      description: "How I work with a team.",
      skills: ["Agile/Scrum", "Code Review", "Technical Documentation", "Monitoring & Alerting", "Performance", "Debugging"],
    },
    {
      name: "Tools",
      description: "What I reach for day to day.",
      skills: ["CMS Integration", "Figma", "Postman", "AI-Assisted Development (Claude, Cursor, Copilot)"],
    },
  ],
  about:
    "I'm a full-stack engineer based in Miami. For three years at American Express I built payments features used by millions of customers in seven international markets, from the React front end to the Node.js and Java APIs behind it, and took them through release to production. I'm bilingual in English and Spanish, and AI-assisted development with Claude, Cursor, and Copilot is part of my daily workflow.",
} satisfies Profile;

// Parsed at import, so malformed data fails the build rather than rendering.
const profile: Profile = profileSchema.parse(rawProfile);

export const identity: Identity = profile.identity;

/** Experience entries, most recent first (by end date, then start date). */
export function getExperience(): ExperienceEntry[] {
  return [...profile.experience].sort(
    (a, b) => b.end.localeCompare(a.end) || b.start.localeCompare(a.start),
  );
}

export function getEducation(): Credential[] {
  return profile.education;
}

export function getSkillGroups(): SkillGroup[] {
  return profile.skillGroups;
}

export function getAbout(): string {
  return profile.about;
}

const monthFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** Formats a "YYYY-MM" date for display, e.g. "2023-03" → "Mar 2023". */
export function formatYearMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split("-").map(Number);
  return monthFormat.format(new Date(Date.UTC(year, month - 1)));
}

/*
  Retracted claims: phrasing from older resume drafts that overstated the work.
  None of it may appear in experience text; the test suite enforces this in CI.
*/
export const RETRACTED_PHRASES = [
  "5+ teams",
  "led a self-directed migration",
  "self-directed",
  "owning it from technical design to launch",
  "launched",
  "standardized components",
  "published internal npm packages",
  "published npm packages",
  "built the complete UI",
  "complete UI workflow",
  "spearheaded",
  "pioneered",
  "design system adopted by",
] as const;

export interface RetractedClaim {
  phrase: string;
  company: string;
  text: string;
}

/** Returns every retracted phrase found (case-insensitively) in the entries' text. */
export function findRetractedClaims(entries: readonly ExperienceEntry[]): RetractedClaim[] {
  return entries.flatMap((entry) => {
    const texts = [entry.company, entry.title, entry.location ?? "", entry.summary ?? "", ...entry.bullets];
    return texts.flatMap((text) =>
      RETRACTED_PHRASES.filter((phrase) =>
        text.toLowerCase().includes(phrase.toLowerCase()),
      ).map((phrase) => ({ phrase, company: entry.company, text })),
    );
  });
}
