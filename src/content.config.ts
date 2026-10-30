import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { createProjectSchema } from "./lib/projects";

// Files starting with "_" (like _template.md) are ignored.
const projects = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/projects" }),
  schema: ({ image }) => createProjectSchema(image()),
});

export const collections = { projects };
