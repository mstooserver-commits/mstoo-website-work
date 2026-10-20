"use client";

import { Copy, Share2, Users, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/stores/auth";
import { useConfigStore } from "@/lib/stores/config";
import { APP_URL } from "@/lib/constants";
import { formatInr } from "@/lib/currency";

export default function ReferEarnPage() {
  const user = useAuthStore((state) => state.user);
  const config = useConfigStore((state) => state.config);
  const code = user?.refer_code || user?.ref_code || "";
  const reward = Number(config?.referral_value_per_currency_unit || 0);
  const message = `Join MSTOO with my referral code ${code}: ${APP_URL}/register?referral=${encodeURIComponent(code)}`;

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    toast.success("Referral code copied");
  };

  const share = async () => {
    if (navigator.share) {
      await navigator.share({ title: "Join MSTOO", text: message });
      return;
    }
    await navigator.clipboard.writeText(message);
    toast.success("Invite copied");
  };

  return (
    <div className="container-page max-w-2xl py-10">
      <div className="rounded-3xl bg-gradient-to-br from-brand to-brand-dark p-7 text-center text-white shadow-soft">
        <Users className="mx-auto h-12 w-12" />
        <h1 className="mt-3 text-3xl font-extrabold">Refer &amp; earn</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-white/85">
          Invite friends and businesses to MSTOO. Share your personal code and earn rewards when
          eligible referrals complete the required activity.
        </p>
      </div>

      <div className="card mt-6 p-6 text-center">
        <p className="text-sm text-muted">Your personal referral code</p>
        {code ? (
          <>
            <div className="mx-auto mt-3 flex max-w-md items-center justify-between rounded-xl border border-dashed border-brand bg-brand-soft/40 px-4 py-3">
              <strong className="text-xl tracking-[0.2em] text-brand">{code}</strong>
              <button type="button" className="btn-secondary gap-2" onClick={() => void copy()}>
                <Copy className="h-4 w-4" /> Copy
              </button>
            </div>
            <button type="button" className="btn-primary mt-4 gap-2" onClick={() => void share()}>
              <Share2 className="h-4 w-4" /> Share invite
            </button>
          </>
        ) : (
          <p className="mt-3 text-sm text-muted">
            Your referral code will appear after your profile is loaded.
          </p>
        )}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          "Share your code",
          "Friend registers",
          reward > 0 ? `Earn up to ${formatInr(reward)}` : "Earn rewards",
        ].map((step, index) => (
          <div key={step} className="card p-4 text-center text-sm">
            <Wallet className="mx-auto mb-2 h-5 w-5 text-brand" />
            <strong>{index + 1}.</strong> {step}
          </div>
        ))}
      </div>
    </div>
  );
}
