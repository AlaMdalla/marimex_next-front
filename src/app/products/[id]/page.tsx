import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Star, Heart, ShoppingCart, Share2, Truck, Shield, RotateCcw } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { getMarbleById, getCommentsByMarbleId, getMarblesByTag, getAllMarbles } from "@/services/marbles";
import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/components/ui/add-to-cart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { cookies } from "next/headers";
import { t, type Locale } from "@/i18n";
import type { Metadata } from "next";

type Params = { params: { id: string } };

// Revalidate product pages periodically for freshness
export const revalidate = 3600; // 1 hour

// Pre-generate static params for faster TTFB and indexing
export async function generateStaticParams() {
  try {
    const marbles = await getAllMarbles();
    return (Array.isArray(marbles) ? marbles : []).map((m: any) => ({ id: String(m._id || m.id) }));
  } catch {
    return [] as { id: string }[];
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = params
  // Best-effort fetch for title/description
  let product: any = null
  try {
    product = await getMarbleById(id)
  } catch { }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://marimexste.com"
  const titleBase = product?.name ? `${product.name} | Marbre Tunisie – Marimex` : "Produit | Marimex"
  const desc = product?.description || product?.descriptions || "Découvrez nos produits en marbre et outillage en Tunisie."
  const images: string[] = product?.imageurl ? [product.imageurl] : ["/images/logo.jpeg"]
  return {
    title: titleBase,
    description: desc,
    alternates: { canonical: `/products/${id}` },
    openGraph: {
      title: titleBase,
      description: desc,
      url: `${siteUrl}/products/${id}`,
      images,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: titleBase,
      description: desc,
      images,
    },
  }
}

export default async function ProductDetailsPage({ params }: Params) {
  const { id } = params;
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("locale")?.value as Locale | undefined;
  const locale: Locale = cookieLocale === "fr" || cookieLocale === "tn" || cookieLocale === "it" || cookieLocale === "zh" ? (cookieLocale as Locale) : "en";
  let product: any = null;
  try {
    product = await getMarbleById(id);
  } catch (e) {
    // ignore, will show not found UI
  }
  // Related products by shared tag(s): merge results across all tags
  let related: any[] = []
  try {
    const tags: string[] = Array.isArray(product?.tags) ? product.tags : ([] as string[])
    const useTags = tags.filter((t) => t && t !== "All")
    if (useTags.length > 0) {
      const lists = await Promise.all(
        useTags.map(async (tag) => {
          try {
            return await getMarblesByTag(tag)
          } catch {
            return [] as any[]
          }
        })
      )
      const map: Record<string, any> = {}
      const currentId = String(product._id || product.id)
      for (const arr of lists) {
        for (const m of arr || []) {
          const mid = String(m._id || m.id)
          if (mid === currentId) continue
          if (!map[mid]) map[mid] = m
        }
      }
      related = Object.values(map).slice(0, 8)
    }
  } catch {
    // ignore related failures
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 py-16 text-center text-foreground">
          <div className="mb-8">
            <div className="mx-auto h-24 w-24 bg-accent rounded-full flex items-center justify-center mb-6">
              <ShoppingCart className="h-12 w-12 text-accent-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-4">
              {t(locale, "common.notFoundTitle")}
            </h1>
            <p className="text-muted-foreground mb-8">
              {t(locale, "common.notFoundDesc")}
            </p>
            <Link href="/products">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t(locale, "common.backToProducts")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Compute rating from comments
  let avgRating = 0;
  let reviewsCount = 0;
  try {
    const comments = await getCommentsByMarbleId(id);
    reviewsCount = comments?.length || 0;
    if (reviewsCount > 0) {
      const sum = comments.reduce((acc: number, c: any) => acc + (Number(c?.rating) || 0), 0);
      avgRating = sum / reviewsCount;
    }
  } catch {
    // ignore rating errors, default to 0
  }
  const mockFeatures = [
    "Premium quality materials",
    "Expert craftsmanship",
    "Durable construction",
    "Easy maintenance"
  ];
  const mockSpecs = {
    "Material": "Natural marble",
    "Finish": "Polished",
    "Origin": "Premium quarry",
    "Certification": "Quality assured"
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Structured data: Product + Breadcrumb */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            image: product.imageurl ? [product.imageurl] : [],
            description: product.description || product.descriptions,
            brand: { "@type": "Brand", name: "Marimex" },
            sku: String(product._id || product.id),
            offers: {
              "@type": "Offer",
              priceCurrency: "TND",
              price: Number(product.price || 0),
              availability: "https://schema.org/InStock",
              url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://marimexste.com"}/products/${String(product._id || product.id)}`,
            },
            aggregateRating: (reviewsCount > 0)
              ? { "@type": "AggregateRating", ratingValue: Number(avgRating.toFixed(1)), reviewCount: reviewsCount }
              : undefined,
          })
        }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: `${process.env.NEXT_PUBLIC_SITE_URL || "https://marimexste.com"}/` },
              { "@type": "ListItem", position: 2, name: "Produits", item: `${process.env.NEXT_PUBLIC_SITE_URL || "https://marimexste.com"}/products` },
              { "@type": "ListItem", position: 3, name: product.name, item: `${process.env.NEXT_PUBLIC_SITE_URL || "https://marimexste.com"}/products/${String(product._id || product.id)}` },
            ],
          })
        }}
      />
      {/* Breadcrumb */}
      <div className="bg-background border-b border">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t(locale, "common.backToProducts")}
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted shadow-lg">
              <Image
                src={product.imageurl || "/placeholder-image.jpg"}
                alt={product.name}
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
                priority
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="bg-background/90 hover:bg-background backdrop-blur-sm rounded-full shadow-md"
                >
                  <Heart className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="bg-background/90 hover:bg-background backdrop-blur-sm rounded-full shadow-md"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold mb-3">
                {product.name}
              </h1>

              {/* Rating from comments */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.floor(avgRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                        }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">
                  {avgRating.toFixed(1)} ({reviewsCount} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="text-3xl font-bold mb-6">
                {formatPrice(product.price, { locale: locale === "fr" ? "fr-FR" : locale === "tn" ? "ar-TN" : locale === "it" ? "it-IT" : locale === "zh" ? "zh-CN" : "en-US", minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                {t(locale, "common.description")}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description || product.descriptions}
              </p>
            </div>

            <Separator className="bg-border" />

            {/* Features */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {t(locale, "common.keyFeatures")}
              </h3>
              <ul className="space-y-3">
                {mockFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-muted-foreground">
                    <div className="h-2 w-2 bg-gray-400 dark:bg-gray-600 rounded-full flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator className="bg-border" />

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <AddToCartButton
                  locale={locale}
                  product={{ id: product._id || product.id, name: product.name, price: Number(product.price), imageurl: product.imageurl, description: product.description || product.descriptions }}
                />
                <Button variant="outline" size="lg" className="h-12">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>

              {/* Service Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Truck className="h-4 w-4" />
                  <span>{t(locale, "common.freeShipping")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>{t(locale, "common.warranty")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RotateCcw className="h-4 w-4" />
                  <span>{t(locale, "common.easyReturns")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Specifications */}
        <Card className="mt-12 border">
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              {t(locale, "common.productSpecifications")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(mockSpecs).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center py-2 border-b border last:border-b-0">
                  <span className="font-medium text-muted-foreground">{key}</span>
                  <span className="font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Comments */}
        <CommentsSection marbleId={String(product._id || product.id)} />

        {/* Related Products Section based on tags */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">
              {t(locale, "common.youMightAlsoLike")}
            </h2>
            <Link href="/products">
              <Button variant="outline">
                {t(locale, "common.viewAllProducts")}
              </Button>
            </Link>
          </div>

          {related.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No related products found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p: any) => {
                const rid = String(p._id || p.id)
                return (
                  <Link key={rid} href={`/products/${rid}`} className="group rounded-xl border overflow-hidden hover:shadow-md transition">
                    <div className="relative aspect-square bg-muted">
                      <Image src={p.imageurl || "/placeholder-image.jpg"} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="p-3">
                      <div className="text-sm font-medium line-clamp-1">{p.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">{Array.isArray(p.tags) ? p.tags.slice(0, 2).join(", ") : ""}</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}