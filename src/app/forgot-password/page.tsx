"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import { isValidIndiaPhone, normalizeIndiaPhone } from "@/lib/phone";
import { useConfigStore } from "@/lib/stores/config";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const method = useConfigStore((s) => s.config?.forget_password_verification_method) || "phone";
  const [identity, setIdentity] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = method === "phone" ? normalizeIndiaPhone(identity) : identity.trim();
    if (method === "phone" && !isValidIndiaPhone(value)) {
      toast.error("Enter a valid Indian mobile number");
      return;
    }
    setBusy(true);
    try {
      await authApi.forgetSendOtp({ identity: value, identity_type: method, signature_id: "" });
      sessionStorage.setItem("mstoo.otp.identity", value);
      sessionStorage.setItem("mstoo.otp.type", method);
      sessionStorage.setItem("mstoo.otp.purpose", "forgot");
      toast.success("OTP sent");
      router.push("/verify-otp");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send OTP");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-page py-10">
      <form onSubmit={submit} className="mx-auto max-w-md card space-y-4 p-6">
        <h1 className="text-2xl font-bold">Reset password</h1>
        <p className="text-sm text-muted">We&apos;ll send an OTP to your {method}.</p>
        <input
          className="input"
          placeholder={method === "phone" ? "98XXXXXXXX" : "you@email.com"}
          value={identity}
          onChange={(e) => setIdentity(e.target.value)}
        />
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? "Sending…" : "Send OTP"}
        </button>
      </form>
    </div>
  );
}
