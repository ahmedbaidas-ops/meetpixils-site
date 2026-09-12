"use client";
import { FormPage } from "@/components/meetpixils/form-page";
import { LILAC } from "@/lib/ui";
export default function Page() {
  return <FormPage storeKey="find-a-team" tint={LILAC}
    kicker={{ en: "MeetBattle", ar: "ميت باتل" }}
    title={{ en: "Find a team", ar: "دوّر على فريق" }}
    dek={{ en: "Most competitors come alone — 36 of 48 last time. Tell us your shape and we'll match you before kickoff.", ar: "أغلب المتنافسين بيجوا لحالهم. خبرنا عنك ومنوصلك بفريق قبل الانطلاق." }}
    fields={[
      { id: "name", en: "Full name", ar: "الاسم الكامل" },
      { id: "email", en: "Email", ar: "الإيميل", type: "email" },
      { id: "level", en: "Level", ar: "المستوى", type: "select", options: [["Student","طالب"],["Junior","مبتدئ"],["Mid","متوسط"],["Senior","خبير"]] },
      { id: "discipline", en: "Discipline", ar: "التخصص", type: "select", options: [["UX/UI","UX/UI"],["UX Research","بحث المستخدم"],["Branding","براندنج"],["Graphic","جرافيك"],["Motion & 3D","موشن و٣د"]] },
      { id: "notes", en: "Anything a teammate should know? (optional)", ar: "إشي لازم يعرفه فريقك؟ (اختياري)", type: "textarea" },
    ]}
    submit={{ en: "Match me", ar: "وصلوني بفريق" }} />;
}
