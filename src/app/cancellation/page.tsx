import { CmsView, cmsMetadata } from "@/components/cms/cms-view";

export const generateMetadata = () => cmsMetadata("cancellation");
export default function Page() {
  return <CmsView slug="cancellation" />;
}
