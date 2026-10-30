import { describe, expect, it } from "vitest";
import {
  experienceEntrySchema,
  findRetractedClaims,
  formatYearMonth,
  getAbout,
  getExperience,
  getSkillGroups,
  identity,
  profileSchema,
  RETRACTED_PHRASES,
  type ExperienceEntry,
} from "./profile";

const validEntry: ExperienceEntry = {
  company: "Example Co",
  title: "Engineer",
  start: "2020-01",
  end: "2021-06",
  bullets: ["Did a thing"],
};

describe("identity", () => {
  it("has the name and title shown in the hero", () => {
    expect(identity.name).toBe("Christian Gonzalez Lopez");
    expect(identity.title).toBe("Full-Stack Software Engineer");
  });

  it("serves the resume from a stable PDF path", () => {
    expect(identity.links.resume.href).toBe(identity.resumePath);
    expect(identity.resumePath).toMatch(/^\/[\w-]+\.pdf$/);
  });

  it("links to GitHub, LinkedIn, and email", () => {
    const { github, linkedin, email } = identity.links;
    expect(github.href).toMatch(/^https:\/\/github\.com\//);
    expect(linkedin.href).toMatch(/^https:\/\/www\.linkedin\.com\/in\//);
    expect(email.href).toBe(`mailto:${identity.email}`);
  });
});

describe("profile schema", () => {
  it("accepts the real profile data", () => {
    const result = profileSchema.safeParse({
      identity,
      experience: getExperience(),
      skillGroups: getSkillGroups(),
      about: getAbout(),
    });
    expect(result.success).toBe(true);
  });

  it("accepts a role with no formal title", () => {
    expect(experienceEntrySchema.safeParse({ ...validEntry, title: "" }).success).toBe(true);
  });

  it("rejects an entry missing a company", () => {
    const noCompany: Partial<ExperienceEntry> = { ...validEntry };
    delete noCompany.company;
    expect(experienceEntrySchema.safeParse(noCompany).success).toBe(false);
    expect(experienceEntrySchema.safeParse({ ...validEntry, company: "  " }).success).toBe(false);
  });

  it.each([
    ["free text", { start: "March 2023" }],
    ["an out-of-range month", { start: "2023-13" }],
    ["a full date", { end: "2021-06-01" }],
    ["an end before the start", { start: "2022-01", end: "2021-12" }],
  ])("rejects bad dates: %s", (_label, dates) => {
    expect(experienceEntrySchema.safeParse({ ...validEntry, ...dates }).success).toBe(false);
  });

  it("rejects empty bullets", () => {
    expect(experienceEntrySchema.safeParse({ ...validEntry, bullets: [] }).success).toBe(false);
    expect(experienceEntrySchema.safeParse({ ...validEntry, bullets: [" "] }).success).toBe(false);
  });
});

describe("getExperience", () => {
  it("returns roles most recent first", () => {
    expect(getExperience().map((entry) => entry.company)).toEqual([
      "American Express",
      "VMware",
      "FIU Applied Research Center / Pacific Northwest National Laboratory",
    ]);
  });

  it("orders every adjacent pair by descending end date", () => {
    const entries = getExperience();
    for (let i = 1; i < entries.length; i++) {
      expect(entries[i - 1].end >= entries[i].end).toBe(true);
    }
  });

  it("returns a copy that callers cannot use to reorder the source", () => {
    getExperience().reverse();
    expect(getExperience()[0].company).toBe("American Express");
  });
});

describe("formatYearMonth", () => {
  it("formats YYYY-MM as a short month and year", () => {
    expect(formatYearMonth("2023-03")).toBe("Mar 2023");
    expect(formatYearMonth("2026-05")).toBe("May 2026");
  });
});

describe("retracted-claims guard", () => {
  it("finds no retracted claims in the real experience text", () => {
    expect(findRetractedClaims(getExperience())).toEqual([]);
  });

  it.each(RETRACTED_PHRASES)("flags %j in a bullet", (phrase) => {
    const entry = { ...validEntry, bullets: [`Did a thing and ${phrase.toUpperCase()} it`] };
    expect(findRetractedClaims([entry]).map((claim) => claim.phrase)).toContain(phrase);
  });

  it("flags retracted phrasing in a title", () => {
    const entry = { ...validEntry, title: "Engineer who spearheaded things" };
    expect(findRetractedClaims([entry])).toEqual([
      { phrase: "spearheaded", company: "Example Co", text: entry.title },
    ]);
  });
});
