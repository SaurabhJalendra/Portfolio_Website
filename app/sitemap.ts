import type { MetadataRoute } from "next";

// Next.js metadata route — emits /sitemap.xml at build time.
// The portfolio is a single-page IDE app, so the sitemap lists the one URL.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://saurabhjalendra.com",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
