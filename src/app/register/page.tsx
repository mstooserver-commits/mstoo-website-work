"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import { isValidIndiaPhone, normalizeIndiaPhone } from "@/lib/phone";
import { useAuthStore } from "@/lib/stores/auth";
import { useConfigStore } from "@/lib/stores/config";
import { isFlagOn } from "@/lib/utils";

const schema = z
  .object({
    first_name: z.string().min(2),
    last_name: z.string().min(1),
    phone: z.string().refine(isValidIndiaPhone, "Enter a valid Indian mobile number"),
    email: z.string().email().optional().or(z.literal("")),
    password: z.string().min(6),
    confirm_password: z.string().min(6),
    referral_code: z.string().optional(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type Form = z.infer<typeof schema>;

function tokenOf(payload: unknown) {
  const body = payload as { content?: { token?: string }; token?: string };
  return body?.content?.token || body?.token;
}

export default function RegisterPage() {
  const router = useRouter();
  const persist = useAuthStore((s) => s.persistSession);
  const config = useConfigStore((s) => s.config);
  const form = useForm<Form>({ resolver: zodResolver(schema) });

  if (config && !isFlagOn(config.customer_self_registration)) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="text-xl font-bold">Registration is currently closed</h1>
      </div>
    );
  }

  const onSubmit = async (values: Form) => {
    const phone = normalizeIndiaPhone(values.phone);
    try {
      const res = await authApi.register({
        first_name: values.first_name,
        last_name: values.last_name,
        phone,
        email: values.email || "",
        password: values.password,
        confirm_password: values.confirm_password,
        ...(values.referral_code ? { referral_code: values.referral_code } : {}),
      });
      const token = tokenOf(res);
      toast.success((res as { message?: string }).message || "Account created");
      if (token) await persist(token);
      if (isFlagOn(config?.phone_verification)) {
        sessionStorage.setItem("mstoo.otp.identity", phone);
        sessionStorage.setItem("mstoo.otp.type", "phone");
        await authApi.sendOtp({ identity: phone, identity_type: "phone", signature_id: "" });
        router.push("/verify-otp");
      } else {
        router.push("/");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    }
  };

  return (
    <div className="container-page py-10">
      <div className="mx-auto w-full max-w-md card p-6">
        <h1 className="text-2xl font-bold">Create your MSTOO account</h1>
        <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">First name</label>
              <input className="input" {...form.register("first_name")} />
            </div>
            <div>
              <label className="label">Last name</label>
              <input className="input" {...form.register("last_name")} />
            </div>
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" placeholder="98XXXXXXXX" {...form.register("phone")} />
            {form.formState.errors.phone ? (
              <p className="mt-1 text-xs text-danger">{form.formState.errors.phone.message}</p>
            ) : null}
          </div>
          <div>
            <label className="label">Email (optional)</label>
            <input className="input" type="email" {...form.register("email")} />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" className="input" {...form.register("password")} />
          </div>
          <div>
            <label className="label">Confirm password</label>
            <input type="password" className="input" {...form.register("confirm_password")} />
            {form.formState.errors.confirm_password ? (
              <p className="mt-1 text-xs text-danger">{form.formState.errors.confirm_password.message}</p>
            ) : null}
          </div>
          {isFlagOn(config?.referral_earning_status) ? (
            <div>
              <label className="label">Referral code</label>
              <input className="input" {...form.register("referral_code")} />
            </div>
          ) : null}
          <button className="btn-primary w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Creating…" : "Register"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
