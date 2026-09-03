import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://codevisionradar.example.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/radar", "/crm", "/api"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
