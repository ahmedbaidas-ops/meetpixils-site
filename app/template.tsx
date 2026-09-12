"use client";
import * as React from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  const [on, setOn] = React.useState(false);
  React.useEffect(() => {
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (calm) { setOn(true); return; }
    const id = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div style={{
      opacity: on ? 1 : 0,
      transform: on ? "none" : "translateY(14px)",
      transition: "opacity 480ms cubic-bezier(.16,1,.3,1), transform 480ms cubic-bezier(.16,1,.3,1)",
    }}>
      {children}
    </div>
  );
}
