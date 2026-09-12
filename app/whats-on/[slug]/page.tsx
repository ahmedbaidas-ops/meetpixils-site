import { ObjectDetail } from "@/components/meetpixils/detail";
import { DEFAULTS } from "@/lib/defaults";

/** Static export: pre-render every known object; admin-added ones need a rebuild. */
export function generateStaticParams() {
  return DEFAULTS.objects.filter((o) => o.type !== "Competition").map((o) => ({ slug: o.id }));
}
export default function Page() { return <ObjectDetail />; }
