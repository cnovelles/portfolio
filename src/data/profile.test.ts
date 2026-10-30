import { describe, expect, it } from "vitest";
import { identity } from "./profile";

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
