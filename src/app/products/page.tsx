"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getAllMarbles, getCommentsByMarbleId } from "@/services/marbles";
import { t, type Locale } from "@/i18n";
import { getClientLocale } from "@/i18n/client";
import { Search, Filter, Star, Eye, ShoppingCart, Grid, List, ChevronLeft, ChevronRight } from "lucide-react";
import { useCart } from "@/contexts/cart-context";

// Product interface for type safety
interface Product {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  price: string; // Assuming API returns price as string; parse to number if needed
  imageurl: string;
  rating?: number; // Optional, as rating isn't guaranteed
  reviewCount?: number; // Optional
}

// Debounce utility
function debounce(func: (...args: any[]) => void, delay: number) {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

// Filters Section Component
function FiltersSection({
  searchTerm,
  setSearchTerm,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  totalProducts,
  filteredCount,
  locale,
}: {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  priceRange: string;
  setPriceRange: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  totalProducts: number;
  filteredCount: number;
  locale: Locale;
}) {
  const debouncedSetSearchTerm = useCallback(debounce(setSearchTerm, 300), []);

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6 mb-8">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder={t(locale, "common.searchPlaceholder")}
            defaultValue={searchTerm}
            onChange={(e) => debouncedSetSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-500 focus:ring-2 focus:ring-neutral-500 focus:border-transparent transition-all"
            aria-label="Search for products"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-neutral-500" aria-hidden="true" />
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{t(locale, "common.filters")}</span>
          </div>

          {/* Price Filter */}
          <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:ring-2 focus:ring-neutral-500"
            aria-label="Filter by price range"
          >
            <option value="all">{t(locale, "common.allPrices")}</option>
            <option value="under-25">{t(locale, "common.under25")}</option>
            <option value="25-50">{t(locale, "common.between25_50")}</option>
            <option value="over-50">{t(locale, "common.over50")}</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:ring-2 focus:ring-neutral-500"
            aria-label="Sort products"
          >
            <option value="name">{t(locale, "common.sortByName")}</option>
            <option value="price-low">{t(locale, "common.priceLow")}</option>
            <option value="price-high">{t(locale, "common.priceHigh")}</option>
          </select>

          {/* View Toggle */}
          <div className="flex border border-neutral-300 dark:border-neutral-600 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 transition-colors ${
                viewMode === "grid"
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "bg-white text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
              }`}
              aria-label="Switch to grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 transition-colors ${
                viewMode === "list"
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "bg-white text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
              }`}
              aria-label="Switch to list view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {t(locale, "common.showing")} {filteredCount} {t(locale, "common.of")} {totalProducts} {t(locale, "common.productsWord")} {searchTerm && ` "${searchTerm}"`}
        </p>
      </div>
    </div>
  );
}

// Product Card Component
function ProductCard({ product, viewMode, locale, rating, reviewCount }: { product: Product; viewMode: "grid" | "list"; locale: Locale; rating?: number; reviewCount?: number }) {
  const { addItem } = useCart()
  const numberLocale = useMemo(() => {
    switch (locale) {
      case "fr":
        return "fr-FR" as const
      case "tn":
        return "ar-TN" as const
      case "it":
        return "it-IT" as const
      case "zh":
        return "zh-CN" as const
      default:
        return "en-US" as const
    }
  }, [locale])
  const renderStars = (rating: number = 0) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? "fill-amber-400 text-amber-400" : "text-neutral-300"}`}
        aria-hidden="true"
      />
    ));
  };

  return (
    <div
      className={`group transition-all duration-300 hover:shadow-lg border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 ${
        viewMode === "grid" ? "hover:-translate-y-1 rounded-xl" : "hover:shadow-md rounded-lg"
      } ${viewMode === "list" ? "flex flex-row overflow-hidden" : ""}`}
      role="article"
  aria-labelledby={`product-${String(product._id || (product as any).id)}-title`}
    >
      <div className={`p-0 ${viewMode === "list" ? "w-48 flex-shrink-0" : ""}`}>
        <div
          className={`relative overflow-hidden ${
            viewMode === "grid" ? "w-full h-48 rounded-t-xl" : "w-full h-full rounded-l-lg"
          }`}
        >
          <Image
            src={product.imageurl || "/placeholder-image.jpg"} // Fallback image
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD/4QAuRXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAAqADAAQAAAABAAAAAAAAD..."
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
              aria-label={`Quick view ${product.name}`}
            >
              <Eye className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
            </button>
          </div>
        </div>
      </div>

      <div className={`${viewMode === "grid" ? "p-5" : "p-6 flex-1"}`}>
        <div className={viewMode === "list" ? "flex justify-between items-start h-full" : ""}>
          <div className={viewMode === "list" ? "flex-1 pr-4" : ""}>
            <h3
              id={`product-${String(product._id || (product as any).id)}-title`}
              className="text-lg font-semibold text-neutral-900 dark:text-white mb-2 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors"
            >
              {product.name}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-3 leading-relaxed line-clamp-2">
              {product.description}
            </p>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">{renderStars(rating ?? product.rating ?? 0)}</div>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                {(rating ?? product.rating ?? 0).toFixed(1)} ({reviewCount ?? product.reviewCount ?? 0} reviews)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {formatPrice(product.price, { locale: numberLocale, minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <div className={`flex gap-3 ${viewMode === "list" ? "flex-col w-32" : "w-full mt-4"}`}>
            <Link
              href={`/products/${String(product._id || (product as any).id)}`}
              className="inline-flex items-center justify-center gap-2 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-300 border rounded-md px-4 py-2 flex-1 self-stretch"
              aria-label={`View details for ${product.name}`}
            >
              <Eye className="w-4 h-4" />
              {t(locale, "common.view")}
            </Link>
            <Button
              size="sm"
              className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all duration-300 text-xs flex-1 self-stretch"
              aria-label={`Add ${product.name} to cart`}
              onClick={() =>
                addItem(
                  {
                    id: product._id || (product as any).id,
                    name: product.name,
                    price: parseFloat(product.price as any),
                    imageurl: product.imageurl,
                    description: product.description,
                  },
                  1,
                )
              }
            >
              <ShoppingCart className="w-3 h-3 mr-1" />
              {viewMode === "grid" ? t(locale, "common.addToCart") : t(locale, "common.addToCart")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Pagination Controls Component
function PaginationControls({
  currentPage,
  totalPages,
  goToPage,
  locale,
}: {
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
  locale: Locale;
}) {
  const getVisiblePageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots.filter((v, i, a) => a.indexOf(v) === i);
  };

  return (
    <nav aria-label="Product pagination" className="flex justify-center items-center mt-12 space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="border-neutral-300 dark:border-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        {t(locale, "common.previous")}
      </Button>

      <div className="flex space-x-1">
  {getVisiblePageNumbers().map((pageNumber, index) => (
          <div key={index}>
            {pageNumber === "..." ? (
              <span className="px-3 py-2 text-neutral-500 dark:text-neutral-400">...</span>
            ) : (
              <Button
                variant={currentPage === pageNumber ? "default" : "outline"}
                size="sm"
    onClick={() => goToPage(pageNumber as number)}
                className={`min-w-[40px] ${
                  currentPage === pageNumber
                    ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                    : "border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
                aria-label={`Page ${pageNumber}`}
                aria-current={currentPage === pageNumber ? "page" : undefined}
              >
                {pageNumber}
              </Button>
            )}
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="border-neutral-300 dark:border-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        {t(locale, "common.next")}
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </nav>
  );
}

// Loading Skeleton Component
function LoadingSkeleton({ viewMode }: { viewMode: "grid" | "list" }) {
  return (
    <div
      className={
        viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-4"
      }
      role="status"
      aria-label="Loading products"
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 ${
            viewMode === "grid" ? "rounded-xl" : "flex flex-row rounded-lg"
          }`}
        >
          <div
            className={`bg-neutral-300 dark:bg-neutral-700 ${
              viewMode === "grid" ? "w-full h-48 rounded-t-xl" : "w-48 h-32 rounded-l-lg"
            }`}
          ></div>
          <div className={viewMode === "grid" ? "p-5" : "p-6 flex-1"}>
            <div className="h-6 bg-neutral-300 dark:bg-neutral-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-neutral-300 dark:bg-neutral-700 rounded w-full mb-3"></div>
            <div className="h-4 bg-neutral-300 dark:bg-neutral-700 rounded w-1/2 mb-4"></div>
            <div className="h-6 bg-neutral-300 dark:bg-neutral-700 rounded w-1/4"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Main Products Page Component
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [locale, setLocale] = useState<Locale>("en");
  const numberLocale = useMemo(() => {
    switch (locale) {
      case "fr":
        return "fr-FR" as const
      case "tn":
        return "ar-TN" as const
      case "it":
        return "it-IT" as const
      case "zh":
        return "zh-CN" as const
      default:
        return "en-US" as const
    }
  }, [locale])
  const productsPerPage = 12;

  // Fetch products
  const fetchProducts = useCallback(() => {
    setLoading(true);
    getAllMarbles()
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load products:", err);
        setError("Failed to load products. Please try again.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setLocale(getClientLocale());
    fetchProducts();
  }, [fetchProducts]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesSearch =
          product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesPrice = true;
        if (priceRange !== "all") {
          const price = parseFloat(product.price);
          switch (priceRange) {
            case "under-25":
              matchesPrice = price < 25;
              break;
            case "25-50":
              matchesPrice = price >= 25 && price <= 50;
              break;
            case "over-50":
              matchesPrice = price > 50;
              break;
          }
        }

        return matchesSearch && matchesPrice;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "price-low":
            return parseFloat(a.price) - parseFloat(b.price);
          case "price-high":
            return parseFloat(b.price) - parseFloat(a.price);
          case "name":
            return a.name.localeCompare(b.name);
          default:
            return 0;
        }
      });
  }, [products, searchTerm, priceRange, sortBy]);

  // Pagination logic
  const totalProducts = filteredAndSortedProducts.length;
  const totalPages = Math.ceil(totalProducts / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredAndSortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  // Ratings map per product id for visible products
  const [ratings, setRatings] = useState<Record<string, { avg: number; count: number }>>({})

  useEffect(() => {
    let cancelled = false
    const ids = currentProducts
      .map((p) => String(p._id || (p as any).id))
      .filter((id) => id)
    const idsToFetch = ids.filter((id) => ratings[id] === undefined)
    if (idsToFetch.length === 0) return
    ;(async () => {
      try {
        const results = await Promise.all(
          idsToFetch.map(async (id) => {
            try {
              const comments = await getCommentsByMarbleId(id)
              const count = comments?.length || 0
              const avg = count > 0 ? comments.reduce((a, c) => a + (Number((c as any).rating) || 0), 0) / count : 0
              return { id, avg, count }
            } catch {
              return { id, avg: 0, count: 0 }
            }
          })
        )
        if (!cancelled) {
          setRatings((prev) => {
            const next = { ...prev }
            for (const r of results) next[r.id] = { avg: r.avg, count: r.count }
            return next
          })
        }
      } catch {
        // ignore
      }
    })()
    return () => {
      cancelled = true
    }
  }, [currentProducts, ratings])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, priceRange, sortBy]);

  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Hero Section */}
  <div className="relative bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
      {t(locale, "common.products")}
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              {t(locale, "common.productsHeroDescription")}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters Section */}
        <FiltersSection
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          sortBy={sortBy}
          setSortBy={setSortBy}
          viewMode={viewMode}
          setViewMode={setViewMode}
          totalProducts={products.length}
          filteredCount={filteredAndSortedProducts.length}
          locale={locale}
        />

        {/* Loading State */}
        {loading && <LoadingSkeleton viewMode={viewMode} />}

        {/* Error State */}
        {error && (
          <div className="text-center py-16" role="alert">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-8 max-w-md mx-auto border border-red-200 dark:border-red-800">
              <p className="text-red-600 dark:text-red-400 font-medium mb-4">{error}</p>
              <Button
                variant="outline"
                onClick={fetchProducts}
                className="border-neutral-300 dark:border-neutral-600"
                aria-label="Retry loading products"
              >
                {t(locale, "common.retry")}
              </Button>
            </div>
          </div>
        )}

        {/* Products Grid/List */}
        {!loading && !error && (
          <>
            {currentProducts.length > 0 ? (
              <>
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                      : "space-y-4"
                  }
                >
                  {currentProducts.map((product) => {
                    const id = String(product._id || (product as any).id)
                    const r = ratings[id]
                    return (
                      <ProductCard
                        key={id}
                        product={product}
                        viewMode={viewMode}
                        locale={locale}
                        rating={r?.avg}
                        reviewCount={r?.count}
                      />
                    )
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <PaginationControls currentPage={currentPage} totalPages={totalPages} goToPage={goToPage} locale={locale} />
                )}
              </>
            ) : (
              <div className="text-center py-16" role="alert">
                <div className="bg-neutral-100 dark:bg-neutral-800 rounded-xl p-12 max-w-md mx-auto">
                  <Search className="w-12 h-12 text-neutral-400 mx-auto mb-4" aria-hidden="true" />
                  <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                    {/* Optional: translate later */}
                    No products found
                  </h3>
                  <p className="text-neutral-500 dark:text-neutral-400 mb-4">
                    {/* Optional: translate later */}
                    Try adjusting your search terms or filters
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setPriceRange("all");
                      setSortBy("name");
                      setCurrentPage(1);
                    }}
                    className="border-neutral-300 dark:border-neutral-600"
                    aria-label="Clear all filters"
                  >
                    {/* Optional: translate later */}
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}