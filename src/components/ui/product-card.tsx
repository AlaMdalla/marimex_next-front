import Image from "next/image";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { t, type Locale } from "@/i18n";
import { getClientLocale } from "@/i18n/client";

export function ProductCard({ product, onAddToCart }: { product: any; onAddToCart: () => void }) {
  let locale: Locale = "en";
  if (typeof window !== "undefined") {
    locale = getClientLocale();
  }
  const numberLocale =
    locale === "fr"
      ? "fr-FR"
      : locale === "tn"
      ? "ar-TN"
      : locale === "it"
      ? "it-IT"
      : locale === "zh"
      ? "zh-CN"
      : "en-US";
  return (
    <Card className="p-4 flex flex-col items-center bg-background text-foreground shadow-lg hover:shadow-xl transition-shadow">
      <div className="w-32 h-32 mb-4 relative">
        <Image
          src={product.imageurl || "/placeholder.png"}
          alt={product.name}
          fill
          className="object-cover rounded"
          sizes="128px"
        />
      </div>
      <h2 className="text-xl font-semibold mb-2 text-center">{product.name}</h2>
  <p className="mb-2 text-sm text-center text-muted-foreground">{product.description}</p>
  <span className="font-bold text-lg mb-4">{formatPrice(product.price, { locale: numberLocale })}</span>
      <button
        className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80 w-full"
        onClick={onAddToCart}
      >
        {t(locale, "common.addToCart")}
      </button>
    </Card>
  );
}
