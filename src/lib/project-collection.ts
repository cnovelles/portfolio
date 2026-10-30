import { getCollection, type CollectionEntry } from "astro:content";
import { findBySlug, missingBodySections, selectFeatured, sortProjects, toCatalog } from "./projects";

export type Project = CollectionEntry<"projects">;

/** Loads every write-up and fails the build if one lacks a required section. */
async function load(): Promise<Project[]> {
  const entries = await getCollection("projects");
  for (const entry of entries) {
    const missing = missingBodySections(entry.body ?? "");
    if (missing.length > 0) {
      throw new Error(
        `Project "${entry.id}" is missing body section(s): ${missing.map((s) => `## ${s}`).join(", ")}`,
      );
    }
  }
  return entries;
}

export async function getAllProjects(): Promise<Project[]> {
  return sortProjects(await load());
}

export async function getFeaturedProjects(): Promise<Project[]> {
  return selectFeatured(await load());
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  return findBySlug(await load(), slug);
}

export async function getProjectCatalog() {
  return toCatalog(await load());
}
