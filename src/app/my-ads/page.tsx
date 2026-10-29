"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { providerApi } from "@/lib/api";
import { ensureRazorpayScript } from "@/lib/api/payment";
import { serviceImageSources } from "@/lib/media";
import { SafeImage } from "@/components/ui/safe-image";
import { EmptyState } from "@/components/ui/states";
import type { Service } from "@/types";
import { PostAdChooser } from "@/components/post-ad/post-ad-chooser";
import { LoaderCircle, Star } from "lucide-react";
import { toast } from "sonner";

export default function MyAdsPage() {
  const queryClient = useQueryClient();
  const q = useQuery({
    queryKey: ["my-ads"],
    queryFn: () => providerApi.myAds(),
  });
  const payload = q.data as { content?: Service[] } | Service[] | undefined;
  const items = (Array.isArray(payload) ? payload : payload?.content || []) as Service[];
  const featureAd = useMutation({
    mutationFn: async (service: Service) => {
      await ensureRazorpayScript();
      const Razorpay = window.Razorpay;
      if (!Razorpay) throw new Error("Razorpay checkout could not load");
      const envelope = await providerApi.existingFeaturedAdOrder(service.id);
      const order = envelope.content;
      if (!order?.key || !order.order_id || !order.amount) {
        throw new Error("Could not create featured ad order");
      }

      await new Promise<void>((resolve, reject) => {
        const checkout = new Razorpay({
          key: order.key,
          order_id: order.order_id,
          amount: order.amount,
          currency: order.currency || "INR",
          name: "MSTOO",
          description: `Feature ${service.name}`,
          handler: async (response: {
            razorpay_payment_id?: string;
            razorpay_order_id?: string;
            razorpay_signature?: string;
          }) => {
            try {
              await providerApi.activateFeaturedAd(service.id, {
                payment_id: response.razorpay_payment_id,
                order_id: response.razorpay_order_id || order.order_id,
                signature: response.razorpay_signature,
              });
              resolve();
            } catch (error) {
              reject(error);
            }
          },
          modal: { ondismiss: () => reject(new Error("Payment was cancelled")) },
        });
        checkout.on?.("payment.failed", () => reject(new Error("Featured payment failed")));
        checkout.open();
      });
    },
    onSuccess: async () => {
      toast.success("Your ad is now featured");
      await queryClient.invalidateQueries({ queryKey: ["my-ads"] });
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not feature ad"),
  });
  return (
    <div className="container-page py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My ads</h1>
        <PostAdChooser className="btn-post">Post ad</PostAdChooser>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {items.map((s) => {
          const featured = s.is_featured === "yes" || s.is_featured === 1;
          const pending = featureAd.isPending && featureAd.variables?.id === s.id;
          return (
            <article key={s.id} className="card flex items-center gap-3 p-3">
              <Link href={`/service/${s.id}`} className="flex min-w-0 flex-1 gap-3">
                <SafeImage
                  src={serviceImageSources(s)}
                  alt={s.name}
                  className="h-20 w-24 rounded-md bg-white"
                  fallback="/cover-img.png"
                  fallbackClassName="object-contain"
                />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{s.name}</p>
                  <p className="text-sm text-muted">{s.availability}</p>
                  {featured ? <p className="mt-1 text-xs font-bold text-brand">Featured</p> : null}
                </div>
              </Link>
              {!featured ? (
                <button
                  type="button"
                  className="btn-post shrink-0 gap-2 px-3 py-2 text-sm"
                  disabled={featureAd.isPending}
                  onClick={() => featureAd.mutate(s)}
                >
                  {pending ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Star className="h-4 w-4" />
                  )}
                  Feature
                </button>
              ) : null}
            </article>
          );
        })}
      </div>
      {q.isFetched && items.length === 0 ? (
        <EmptyState title="You have not posted any ads" className="mt-6" />
      ) : null}
    </div>
  );
}
