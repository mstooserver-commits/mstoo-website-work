"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import { isValidIndiaPhone, normalizeIndiaPhone } from "@/lib/phone";
import { useAuthStore } from "@/lib/stores/auth";
import { useCartStore } from "@/lib/stores/cart";

const schema = z.object({
  identity: z.string().min(8, "Enter phone or email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type Form = z.infer<typeof schema>;

function tokenOf(payload: unknown) {
  const body = payload as { content?: { token?: string }; token?: string };
  return body?.content?.token || body?.token;
}

export default function LoginClient() {
  const router = useRouter();
  const params = useSearchParams();
  const persist = useAuthStore((s) => s.persistSession);
  const loadCart = useCartStore((s) => s.load);
  const form = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Form) => {
    const identity = isValidIndiaPhone(values.identity)
      ? normalizeIndiaPhone(values.identity)
      : values.identity.trim();
    try {
      const res = await authApi.login({
        email_or_phone: identity,
        phone: identity,
        password: values.password,
        device_token: "web",
        signature_id: "",
      });
      const token = tokenOf(res);
      if (!token) throw new Error((res as { message?: string }).message || "Login failed");
      await persist(token);
      await loadCart();
      toast.success("Welcome back");
      router.push(params.get("redirect") || "/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div className="container-page flex min-h-[70vh] items-center py-10">
      <div className="mx-auto w-full max-w-md card p-6">
        <h1 className="text-2xl font-bold">Log in to MSTOO</h1>
        <p className="mt-1 text-sm text-muted">Use the same account as the mobile app.</p>
        <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <label className="label">Phone or email</label>
            <input className="input" placeholder="+91 98XXXXXXXX" {...form.register("identity")} />
            {form.formState.errors.identity ? (
              <p className="mt-1 text-xs text-danger">{form.formState.errors.identity.message}</p>
            ) : null}
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" className="input" {...form.register("password")} />
            {form.formState.errors.password ? (
              <p className="mt-1 text-xs text-danger">{form.formState.errors.password.message}</p>
            ) : null}
          </div>
          <div className="text-right text-sm">
            <Link href="/forgot-password" className="text-brand">
              Forgot password?
            </Link>
          </div>
          <button className="btn-primary w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Signing in…" : "Login"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-muted">
          New to MSTOO?{" "}
          <Link href="/register" className="font-semibold text-brand">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
