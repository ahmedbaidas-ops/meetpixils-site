"use client";
import { FormPage } from "@/components/meetpixils/form-page";
import { ORANGE } from "@/lib/ui";
export default function Page() {
  return <FormPage storeKey="sponsor" tint={ORANGE}
    kicker={{ en: "About", ar: "مين إحنا" }}
    title={{ en: "Sponsor an event", ar: "ارعَ فعالية" }}
    dek={{ en: "400+ registered designers, 96% carrying portfolios. Put your brand in front of the season and meet validated talent.", ar: "+٤٠٠ مصمم مسجّل، ٪٩٦ منهم ببورتفوليو. حط علامتك قدام الموسم وتعرّف على مواهب مثبتة." }}
    fields={[
      { id: "company", en: "Company / university", ar: "الشركة / الجامعة" },
      { id: "name", en: "Contact name", ar: "اسم جهة التواصل" },
      { id: "email", en: "Email", ar: "الإيميل", type: "email" },
      { id: "interest", en: "Interested in", ar: "مهتمين بـ", type: "select",
        options: [["Season sponsorship","رعاية الموسم"],["Single event","فعالية واحدة"],["Academy tracks","مسارات الأكاديمية"],["Hiring access","الوصول للمواهب"]] },
    ]}
    submit={{ en: "Request the prospectus", ar: "اطلب ملف الرعاية" }} />;
}
