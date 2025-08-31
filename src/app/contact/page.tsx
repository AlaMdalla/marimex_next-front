import { cookies } from "next/headers";
import { t, type Locale } from "@/i18n";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("locale")?.value as Locale | undefined;
  const locale: Locale = cookieLocale === "fr" || cookieLocale === "tn" || cookieLocale === "it" || cookieLocale === "zh" ? (cookieLocale as Locale) : "en";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t(locale, "contact.title")}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t(locale, "contact.subtitle")}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 grid gap-8 md:grid-cols-2">
        <section className="p-6 rounded-xl border bg-background">
          <h2 className="text-2xl font-semibold mb-4">{t(locale, "contact.reachUs")}</h2>
          <ul className="space-y-3 text-muted-foreground">
            <li><span className="font-medium text-foreground">{t(locale, "contact.address")}:</span> Tunis, Tunisia</li>
            <li><span className="font-medium text-foreground">{t(locale, "contact.phone")}:</span> +216 12 345 678</li>
            <li><span className="font-medium text-foreground">{t(locale, "contact.email")}:</span> hello@marimex.tn</li>
          </ul>
        </section>

        <section className="p-6 rounded-xl border bg-background">
          <h2 className="text-2xl font-semibold mb-4">{t(locale, "contact.formTitle")}</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t(locale, "contact.fields.name")}</label>
              <input className="w-full px-3 py-2 rounded-md border bg-background" placeholder={t(locale, "contact.fields.namePlaceholder")} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t(locale, "contact.fields.email")}</label>
              <input type="email" className="w-full px-3 py-2 rounded-md border bg-background" placeholder={t(locale, "contact.fields.emailPlaceholder")} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t(locale, "contact.fields.phone")}</label>
              <input type="tel" className="w-full px-3 py-2 rounded-md border bg-background" placeholder={t(locale, "contact.fields.phonePlaceholder")} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t(locale, "contact.fields.message")}</label>
              <textarea className="w-full px-3 py-2 rounded-md border bg-background min-h-32" placeholder={t(locale, "contact.fields.messagePlaceholder")} />
            </div>
            <Button type="submit">{t(locale, "contact.send")}</Button>
          </form>
        </section>
      </div>
    </div>
  );
}
