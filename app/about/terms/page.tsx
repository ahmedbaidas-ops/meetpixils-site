"use client";

import * as React from "react";
import { useLang, mono, cut, CREAM, ORANGE } from "@/lib/ui";
import { Wrap, PxStyles } from "@/components/meetpixils/kit";

/** Terms & ticket policy — required by card-gateway merchant review, useful regardless. */
export default function Terms() {
  const { ar } = useLang();
  const S = ({ h, children }: { h: string; children: React.ReactNode }) => (
    <section style={{ marginBottom: 34 }}>
      <h2 style={{ margin: "0 0 10px", fontSize: 19, fontWeight: 800 }}>{h}</h2>
      <div style={{ fontSize: 14.5, lineHeight: ar ? 1.95 : 1.7, color: "rgba(255,254,236,.78)" }}>{children}</div>
    </section>
  );
  return (
    <div style={{ paddingTop: 92, minHeight: "100vh" }}>
      <PxStyles tint={ORANGE} />
      <Wrap style={{ maxWidth: 760, paddingBottom: "clamp(70px,11vh,120px)" }}>
        <span style={{ ...mono, opacity: .6 }}>{ar ? "الشروط والسياسات" : "Terms & policies"}</span>
        <h1 style={{ margin: "10px 0 30px", fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: ar ? 0 : "-.03em" }}>
          {ar ? "شروط التذاكر والاسترجاع" : "Tickets, payment & refunds"}
        </h1>
        {ar ? (
          <>
            <S h="من نحن">ميت بكسلز (MeetPixils) مجتمع إبداعي أردني مقره عمّان، تديره Pixilated. للتواصل: hello@meetpixils.com أو صفحة التواصل.</S>
            <S h="التذاكر والأسعار">أسعار تذاكر الفعاليات معروضة بالدينار الأردني وتشمل الدخول حسب نوع الباس الموضّح عند الشراء. التذكرة صالحة لحاملها المسجّل بالاسم والإيميل وقت الشراء.</S>
            <S h="الدفع">الدفع الإلكتروني يتم عبر بوابة دفع مرخّصة؛ لا نخزّن بيانات بطاقتك على خوادمنا إطلاقاً. يمكن أيضاً الحجز والدفع نقداً عند الباب ما دامت الأماكن متاحة.</S>
            <S h="الاسترجاع والإلغاء">يمكن استرجاع قيمة التذكرة كاملة حتى ٧ أيام قبل موعد الفعالية بالتواصل معنا على hello@meetpixils.com مع رقم الطلب. خلال أقل من ٧ أيام، يمكن تحويل التذكرة لشخص آخر بدل الاسترجاع. إذا ألغيت الفعالية من طرفنا يسترجع المبلغ كاملاً خلال ١٤ يوماً بنفس وسيلة الدفع.</S>
            <S h="الخصوصية">نستخدم اسمك وإيميلك لإدارة حجزك والتواصل معك بخصوص الفعالية فقط، ولا نبيع بياناتك لأي طرف ثالث.</S>
          </>
        ) : (
          <>
            <S h="Who we are">MeetPixils is a Jordanian creative community based in Amman, operated by Pixilated. Contact: hello@meetpixils.com or the contact page.</S>
            <S h="Tickets & pricing">Event ticket prices are shown in Jordanian Dinars (JOD) and include admission per the pass type described at purchase. A ticket is valid for the person named on the order.</S>
            <S h="Payment">Online payments are processed by a licensed payment gateway; your card details never touch our servers. You can also reserve and pay cash at the door while seats last.</S>
            <S h="Refunds & cancellation">Full refunds up to 7 days before the event — email hello@meetpixils.com with your order number. Within 7 days of the event, tickets can be transferred to another person instead of refunded. If we cancel the event, you get a full refund within 14 days to the original payment method.</S>
            <S h="Privacy">We use your name and email to manage your booking and contact you about the event only. Your data is never sold to third parties.</S>
          </>
        )}
        <p style={{ ...mono, opacity: .45, marginTop: 10 }}>{ar ? "آخر تحديث: آب ٢٠٢٦" : "Last updated: August 2026"}</p>
      </Wrap>
    </div>
  );
}
