"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/stores/auth";

export default function VerifyOtpPage() {
  const router = useRouter();
  const persist = useAuthStore((s) => s.persistSession);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [identity, setIdentity] = useState("");
  const [type, setType] = useState("phone");
  const [purpose, setPurpose] = useState("verify");

  useEffect(() => {
    setIdentity(sessionStorage.getItem("mstoo.otp.identity") || "");
    setType(sessionStorage.getItem("mstoo.otp.type") || "phone");
    setPurpose(sessionStorage.getItem("mstoo.otp.purpose") || "verify");
  }, []);

  const resend = async () => {
    if (!identity) return;
    try {
      if (purpose === "forgot") {
        await authApi.forgetSendOtp({ identity, identity_type: type, signature_id: "" });
      } else {
        await authApi.sendOtp({ identity, identity_type: type, signature_id: "" });
      }
      toast.success("OTP sent again");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not resend OTP");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity) {
      toast.error("Start from login or create account");
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
        toast.success("Account verified. You can log in now.");
        router.push(token ? "/" : "/login");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-page py-10 pb-28">
      <form onSubmit={submit} className="mx-auto max-w-md card space-y-4 p-6">
        <h1 className="text-2xl font-bold">Verify OTP</h1>
        <p className="text-sm text-muted">Sent to {identity || "your phone"}</p>
        <input
          className="input tracking-[0.4em]"
          placeholder="••••••"
          inputMode="numeric"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        {purpose === "forgot" ? (
          <input
            type="password"
            className="input"
            placeholder="New password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        ) : null}
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? "Please wait…" : "Verify"}
        </button>
        <button type="button" className="w-full text-sm font-medium text-brand" onClick={() => void resend()}>
          Resend OTP
        </button>
      </form>
    </div>
  );
}
