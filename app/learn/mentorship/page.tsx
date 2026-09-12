"use client";
import { FormPage } from "@/components/meetpixils/form-page";
import { PERI } from "@/lib/ui";
export default function Page() {
  return <FormPage storeKey="mentorship" tint={PERI}
    kicker={{ en: "MeetAcademy", ar: "ميت أكاديمي" }}
    title={{ en: "Mentorship", ar: "الإرشاد" }}
    dek={{ en: "A mentor who reviews your real work, weekly. Cohorts are small and open with the season — tell us you want in.", ar: "منتور بيراجع شغلك الحقيقي أسبوعياً. المجموعات صغيرة وبتفتح مع الموسم — سجّل اهتمامك." }}
    fields={[
      { id: "name", en: "Full name", ar: "الاسم الكامل" },
      { id: "email", en: "Email", ar: "الإيميل", type: "email" },
      { id: "focus", en: "What do you want to grow?", ar: "شو بدك تطوّر؟", type: "select", options: [["UX Research","بحث المستخدم"],["UI craft","صنعة الواجهات"],["Portfolio","البورتفوليو"],["Career direction","اتجاه مهني"]] },
    ]}
    submit={{ en: "Count me in", ar: "سجّلني" }} />;
}
