import type { MetadataRoute } from "next";
import { getAllMarbles } from "@/services/marbles";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://marimexste.com";
  const now = new Date();

  let products: any[] = [];
  try {
    products = await getAllMarbles();
  } catch {
    products = [];
  }

  const productEntries: MetadataRoute.Sitemap = products.map((p: any) => {
    const id = String(p._id || p.id);
    const last = p.updatedAt || p.createdAt || now.toISOString();
    return {
      url: `${base}/products/${id}`,
      lastModified: new Date(last),
      changeFrequency: "weekly",
      priority: 0.8,
    };
  });

  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/products`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    ...productEntries,
  ];
}
