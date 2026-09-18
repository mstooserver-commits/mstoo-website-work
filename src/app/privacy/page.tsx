import { CmsView, cmsMetadata } from "@/components/cms/cms-view";

export const generateMetadata = () => cmsMetadata("privacy");
export default function Page() {
  return <CmsView slug="privacy" />;
}
