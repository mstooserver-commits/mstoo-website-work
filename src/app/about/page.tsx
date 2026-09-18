import { CmsView, cmsMetadata } from "@/components/cms/cms-view";

export const generateMetadata = () => cmsMetadata("about");
export default function Page() {
  return <CmsView slug="about" />;
}
