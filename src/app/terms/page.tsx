import { CmsView, cmsMetadata } from "@/components/cms/cms-view";

export const generateMetadata = () => cmsMetadata("terms");
export default function Page() {
  return <CmsView slug="terms" />;
}
