"use client";
import { FormPage } from "@/components/meetpixils/form-page";
import { ORANGE } from "@/lib/ui";
export default function Page() {
  return <FormPage storeKey="portfolio" tint={ORANGE}
    kicker={{ en: "My profile", ar: "ملفي" }}
    title={{ en: "Portfolio", ar: "بورتفوليو" }}
    dek={{ en: "96% of competitors carry one. Link yours once — it attaches to every entry.", ar: "٪٩٦ من المتنافسين معهم واحد. اربطه مرة — بيلحق بكل مشاركة." }}
    fields={[
      { id: "url", en: "Portfolio link (Behance, site, PDF...)", ar: "رابط البورتفوليو" },
      { id: "visible", en: "Show on my public profile?", ar: "يظهر بملفي العام؟", type: "select", options: [["Yes","نعم"],["No","لا"]] },
    ]}
    submit={{ en: "Save", ar: "احفظ" }} />;
}
