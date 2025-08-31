import { cookies } from "next/headers";
import { t, type Locale } from "@/i18n";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("locale")?.value as Locale | undefined;
  const locale: Locale = cookieLocale === "fr" || cookieLocale === "tn" || cookieLocale === "it" || cookieLocale === "zh" ? (cookieLocale as Locale) : "en";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <div className="relative bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t(locale, "aboutPage.heroTitle")}</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">{t(locale, "aboutPage.heroSubtitle")}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
        {/* Story */}
        <section className="p-6 rounded-xl border bg-background">
          <h2 className="text-2xl font-semibold mb-4">{t(locale, "aboutPage.storyTitle")}</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>{t(locale, "aboutPage.story.p1")}</p>
            <p>{t(locale, "aboutPage.story.p2")}</p>
            <p>{t(locale, "aboutPage.story.p3")}</p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="p-6 rounded-xl border bg-background">
          <h2 className="text-2xl font-semibold mb-4">{t(locale, "aboutPage.missionTitle")}</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>{t(locale, "aboutPage.mission.p1")}</p>
            <p>{t(locale, "aboutPage.mission.p2")}</p>
            <p>{t(locale, "aboutPage.mission.p3")}</p>
          </div>
        </section>

        {/* Values */}
        <section className="p-6 rounded-xl border bg-background">
          <h2 className="text-2xl font-semibold mb-4">{t(locale, "aboutPage.valuesTitle")}</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-lg border p-4 bg-background">
              <h3 className="font-semibold mb-1">{t(locale, "aboutPage.values.quality.title")}</h3>
              <p className="text-muted-foreground text-sm">{t(locale, "aboutPage.values.quality.desc")}</p>
            </div>
            <div className="rounded-lg border p-4 bg-background">
              <h3 className="font-semibold mb-1">{t(locale, "aboutPage.values.innovation.title")}</h3>
              <p className="text-muted-foreground text-sm">{t(locale, "aboutPage.values.innovation.desc")}</p>
            </div>
            <div className="rounded-lg border p-4 bg-background">
              <h3 className="font-semibold mb-1">{t(locale, "aboutPage.values.customer.title")}</h3>
              <p className="text-muted-foreground text-sm">{t(locale, "aboutPage.values.customer.desc")}</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="p-6 rounded-xl border bg-background flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">{t(locale, "about.ctaTitle")}</h3>
            <p className="text-sm text-muted-foreground">{t(locale, "about.subtitle")}</p>
          </div>
          <Link href="/products">
            <Button>{t(locale, "about.ctaButton")}</Button>
          </Link>
        </section>
      </div>
    </div>
  );
}
