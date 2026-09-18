import { CmsView, cmsMetadata } from "@/components/cms/cms-view";

export const generateMetadata = () => cmsMetadata("refund");
export default function Page() {
  return <CmsView slug="refund" />;
}
