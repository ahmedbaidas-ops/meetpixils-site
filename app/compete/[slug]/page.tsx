import { ObjectDetail } from "@/components/meetpixils/detail";
import { DEFAULTS } from "@/lib/defaults";

export function generateStaticParams() {
  const comps = DEFAULTS.objects.filter((o) => o.type === "Competition").map((o) => ({ slug: o.id }));
  // static export needs ≥1 path; "_" renders the detail view's not-found state and is linked from nowhere
  return comps.length ? comps : [{ slug: "_" }];
}
export default function Page() { return <ObjectDetail />; }
