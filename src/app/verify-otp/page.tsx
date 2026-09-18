"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/stores/auth";

export default function VerifyOtpPage() {
  const router = useRouter();
  const persist = useAuthStore((s) => s.persistSession);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const identity = typeof window !== "undefined" ? sessionStorage.getItem("mstoo.otp.identity") || "" : "";
  const type = typeof window !== "undefined" ? sessionStorage.getItem("mstoo.otp.type") || "phone" : "phone";
  const purpose = typeof window !== "undefined" ? sessionStorage.getItem("mstoo.otp.purpose") || "verify" : "verify";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity) {
      toast.error("Start from login or forgot password");
      router.push("/login");
      return;
    }
    setBusy(true);
    try {
      if (purpose === "forgot") {
        await authApi.forgetVerifyOtp({ identity, identity_type: type, otp });
        if (!password) {
          toast.success("OTP verified. Set a new password.");
          setBusy(false);
          return;
        }
        await authApi.resetPassword({
          _method: "put",
          identity,
          identity_type: type,
          otp,
          password,
          confirm_password: password,
        });
        toast.success("Password updated");
        router.push("/login");
      } else {
        const res = await authApi.verifyOtp({ identity, identity_type: type, otp });
        const token =
          (res as { content?: { token?: string }; token?: string }).content?.token ||
          (res as { token?: string }).token;
        if (token) await persist(token);
        toast.success("Verified");
        router.push("/");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-page py-10">
      <form onSubmit={submit} className="mx-auto max-w-md card space-y-4 p-6">
        <h1 className="text-2xl font-bold">Verify OTP</h1>
        <p className="text-sm text-muted">Sent to {identity || "your phone"}</p>
        <input className="input tracking-[0.4em]" placeholder="••••••" value={otp} onChange={(e) => setOtp(e.target.value)} />
        {purpose === "forgot" ? (
          <input
            type="password"
            className="input"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        ) : null}
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? "Please wait…" : "Verify"}
        </button>
      </form>
    </div>
  );
}
