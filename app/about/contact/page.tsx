"use client";
import { useLang, ORANGE, CREAM } from "@/lib/ui";
import { FormPage } from "@/components/meetpixils/form-page";
import { Wrap } from "@/components/meetpixils/kit";
import { FAQ } from "@/components/meetpixils/faq";

export default function Contact() {
  const { ar } = useLang();
  return (
    <div>
      <FormPage storeKey="contact" tint={ORANGE}
        kicker={{ en: "About", ar: "مين إحنا" }}
        title={{ en: "Contact us", ar: "تواصل معنا" }}
        dek={{ en: "Press, partnerships, or just a question — it lands with a human in Amman.", ar: "صحافة، شراكات، أو مجرد سؤال — بيوصل لإنسان بعمّان." }}
        fields={[
          { id: "name", en: "Name", ar: "الاسم" },
          { id: "email", en: "Email", ar: "الإيميل", type: "email" },
          { id: "topic", en: "Topic", ar: "الموضوع", type: "select",
            options: [["General","عام"],["Press","صحافة"],["Partnership","شراكة"],["Something broke","في شي خربان"]] },
          { id: "message", en: "Message", ar: "الرسالة", type: "textarea" },
        ]}
        submit={{ en: "Send it", ar: "أرسل" }} />
      <Wrap style={{ maxWidth: 760, padding: "0 clamp(20px,5vw,64px) clamp(70px,11vh,120px)" }}>
        <FAQ dark tint={ORANGE} title={ar ? "قبل ما تكتب" : "Before you write"}
          items={ar ? [
            { q: "بدي أشارك بتحدي", a: "ما بدك إيميل — روح مباشرة على صفحة نافس وسجّل من هناك." },
            { q: "بدي أحكي مع المجتمع", a: "قروب الواتساب أسرع طريق — إحنا وكل الوسط هناك." },
          ] : [
            { q: "I want to enter a battle", a: "No email needed — go straight to Compete and enter from there." },
            { q: "I want to talk to the community", a: "The WhatsApp group is the fastest route — we're all in there." },
          ]} />
      </Wrap>
    </div>
  );
}
