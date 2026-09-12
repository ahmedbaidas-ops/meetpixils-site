"use client";
import { FormPage } from "@/components/meetpixils/form-page";
import { LILAC } from "@/lib/ui";
export default function Page() {
  return <FormPage storeKey="be-a-judge" tint={LILAC}
    kicker={{ en: "MeetBattle", ar: "ميت باتل" }}
    title={{ en: "Be a judge", ar: "كن محكّماً" }}
    dek={{ en: "Senior designers shape the scene they came up in. Judges are named, photographed, and score on the published card.", ar: "السينيور بيساهم بالوسط اللي كبر فيه. المحكمون بالأسماء والصور، وبيحكموا على معايير منشورة." }}
    fields={[
      { id: "name", en: "Full name", ar: "الاسم الكامل" },
      { id: "email", en: "Email", ar: "الإيميل", type: "email" },
      { id: "role", en: "Current role & company", ar: "دورك الحالي والشركة" },
      { id: "years", en: "Years of experience", ar: "سنوات الخبرة", type: "select", options: [["5–8","٥–٨"],["8–12","٨–١٢"],["12+","+١٢"]] },
      { id: "portfolio", en: "Portfolio or LinkedIn", ar: "بورتفوليو أو لينكدإن" },
    ]}
    submit={{ en: "Apply to judge", ar: "قدّم كمحكّم" }} />;
}
