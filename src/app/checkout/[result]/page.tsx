import { redirect } from "next/navigation";

export default function CheckoutPaymentResultPage({ params }: { params: { result: string } }) {
  redirect(`/checkout?flag=${encodeURIComponent(params.result || "success")}`);
}
