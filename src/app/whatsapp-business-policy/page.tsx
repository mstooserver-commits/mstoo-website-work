import { CmsView, cmsMetadata } from "@/components/cms/cms-view";

export const generateMetadata = () => cmsMetadata("whatsappBusiness");

export default function Page() {
  return <CmsView slug="whatsappBusiness" />;
}
