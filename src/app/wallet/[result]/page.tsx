import { redirect } from "next/navigation";

export default function WalletPaymentResultPage({ params }: { params: { result: string } }) {
  const flag = params.result || "success";
  redirect(`/wallet?flag=${encodeURIComponent(flag)}`);
}
