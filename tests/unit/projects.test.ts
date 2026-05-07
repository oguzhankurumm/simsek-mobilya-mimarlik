import { describe, expect, it } from "vitest";
import {
  PROJECTS,
  FEATURED_PROJECTS,
  PROJECT_CATEGORIES,
  getProjectBySlug,
  getNextProject,
} from "@/content/projects";

describe("projects content", () => {
  it("has at least 8 projects", () => {
    expect(PROJECTS.length).toBeGreaterThanOrEqual(8);
  });

  it("uses unique slugs", () => {
    const slugs = PROJECTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("includes both Turkish and English content for every project", () => {
    for (const p of PROJECTS) {
      expect(p.titleTr.length).toBeGreaterThan(0);
      expect(p.titleEn.length).toBeGreaterThan(0);
      expect(p.summaryTr.length).toBeGreaterThan(10);
      expect(p.summaryEn.length).toBeGreaterThan(10);
      expect(p.scopeTr.length).toBeGreaterThan(0);
      expect(p.scopeEn.length).toBe(p.scopeTr.length);
      expect(p.materialsTr.length).toBe(p.materialsEn.length);
    }
  });

  it("references categories that exist in PROJECT_CATEGORIES", () => {
    const known = new Set(PROJECT_CATEGORIES.map((c) => c.key));
    for (const p of PROJECTS) {
      expect(known.has(p.category)).toBe(true);
    }
  });

  it("FEATURED_PROJECTS is a subset of PROJECTS", () => {
    for (const p of FEATURED_PROJECTS) {
      expect(p.featured).toBe(true);
      expect(PROJECTS).toContain(p);
    }
  });

  it("getProjectBySlug returns the matching project", () => {
    const first = PROJECTS[0];
    const found = getProjectBySlug(first.slug);
    expect(found).toBeDefined();
    expect(found?.slug).toBe(first.slug);
  });

  it("getProjectBySlug returns undefined for unknown slug", () => {
    expect(getProjectBySlug("does-not-exist")).toBeUndefined();
  });

  it("getNextProject loops back to the first project", () => {
    const last = PROJECTS[PROJECTS.length - 1];
    expect(getNextProject(last.slug).slug).toBe(PROJECTS[0].slug);
  });

  it("uses HTTPS image URLs", () => {
    for (const p of PROJECTS) {
      expect(p.cover.src.startsWith("https://")).toBe(true);
      for (const g of p.gallery) {
        expect(g.src.startsWith("https://")).toBe(true);
      }
    }
  });
});
