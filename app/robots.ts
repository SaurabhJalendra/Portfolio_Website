import type { MetadataRoute } from "next";

// Next.js metadata route — emits /robots.txt at build time.
// Allows all crawlers and points them at the sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://saurabhjalendra.com/sitemap.xml",
    host: "https://saurabhjalendra.com",
  };
}
