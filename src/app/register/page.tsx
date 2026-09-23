"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import { ApiError, extractApiError, isLaravelOk, laravelCode } from "@/lib/errors";
import { isValidIndiaPhone, normalizeIndiaPhone } from "@/lib/phone";
import { useConfigStore } from "@/lib/stores/config";
import { isFlagOn } from "@/lib/utils";

const schema = z
  .object({
    name: z.string().trim().min(2, "Enter your name"),
    phone: z.string().refine(isValidIndiaPhone, "Enter a valid 10-digit Indian mobile number"),
    email: z.union([z.string().email("Enter a valid email"), z.literal("")]).optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string().min(8, "Confirm your password"),
    referral_code: z.string().optional(),
    accept_terms: z.boolean().refine((v) => v === true, "Please accept Terms & Conditions"),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type Form = z.infer<typeof schema>;

function splitName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    first_name: parts[0] || name.trim(),
    last_name: parts.slice(1).join(" "),
  };
}

function passwordStrength(value: string) {
  if (!value) return "";
  const hasLetter = /[A-Za-z]/.test(value);
  const hasDigit = /\d/.test(value);
  const hasSpecial = /[^A-Za-z0-9]/.test(value);
  if (value.length >= 8 && hasLetter && hasDigit && hasSpecial) return "Strong";
  if (value.length >= 8 && hasLetter && hasDigit) return "Medium";
  return "Weak";
}

function isPhoneTaken(err: unknown) {
  const payload = err instanceof ApiError ? err.payload : err;
  if (payload && typeof payload === "object") {
    const errors = (payload as { errors?: unknown }).errors;
    if (Array.isArray(errors)) {
      for (const item of errors) {
        if (!item || typeof item !== "object") continue;
        const code = String((item as { error_code?: string }).error_code || "").toLowerCase();
        const message = String((item as { message?: string }).message || "").toLowerCase();
        if (code === "phone" || message.includes("phone has already been taken")) return true;
      }
    }
  }
  const text = `${err instanceof Error ? err.message : ""} ${laravelCode(payload)}`.toLowerCase();
  return text.includes("phone has already been taken");
}

async function startPhoneOtp(phone: string) {
  sessionStorage.setItem("mstoo.otp.identity", phone);
  sessionStorage.setItem("mstoo.otp.type", "phone");
  sessionStorage.setItem("mstoo.otp.purpose", "verify");
  try {
    await authApi.sendOtp({ identity: phone, identity_type: "phone", signature_id: "" });
    toast.success("OTP sent to your phone");
  } catch (err) {
    toast.message(err instanceof Error ? err.message : "Enter the OTP sent to your phone");
  }
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-danger">{message}</p>;
}

export default function RegisterPage() {
  const router = useRouter();
  const config = useConfigStore((s) => s.config);
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
      confirm_password: "",
      referral_code: "",
      accept_terms: false,
    },
  });
  const password = form.watch("password") || "";
  const strength = useMemo(() => passwordStrength(password), [password]);

  if (config && !isFlagOn(config.customer_self_registration)) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="text-xl font-bold">Registration is currently closed</h1>
      </div>
    );
  }

  const finishSignup = async (phone: string) => {
    if (isFlagOn(config?.phone_verification) || !config) {
      await startPhoneOtp(phone);
      router.push("/verify-otp");
      return;
    }
    toast.success("Account created. Please log in.");
    router.push("/login");
  };

  const onSubmit = async (values: Form) => {
    const phone = normalizeIndiaPhone(values.phone);
    const { first_name, last_name } = splitName(values.name);
    try {
      const res = await authApi.register({
        first_name,
        last_name,
        phone,
        email: values.email || "",
        password: values.password,
        confirm_password: values.confirm_password,
        ...(values.referral_code?.trim() ? { referral_code: values.referral_code.trim() } : {}),
      });
      if (!isLaravelOk(res)) {
        throw new ApiError(extractApiError(res, "Registration failed"), 400, laravelCode(res), res);
      }
      toast.success((res as { message?: string }).message || "Account created");
      await finishSignup(phone);
    } catch (err) {
      const taken =
        (err instanceof ApiError && (err.code === "phone" || isPhoneTaken(err))) ||
        (err instanceof Error && err.message.toLowerCase().includes("phone has already been taken"));
      if (taken) {
        toast.message("This phone is already registered. Verify OTP or log in.");
        await finishSignup(phone);
        return;
      }
      toast.error(err instanceof Error ? err.message : "Registration failed");
    }
  };

  return (
    <div className="container-page py-10 pb-28">
      <div className="mx-auto w-full max-w-md card p-6">
        <h1 className="text-2xl font-bold">Create your MSTOO account</h1>
        <p className="mt-1 text-sm text-muted">Join MSTOO to post ads and book rentals.</p>
        <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <label className="label">Full name *</label>
            <input className="input" placeholder="Enter your full name" autoComplete="name" {...form.register("name")} />
            <FieldError message={form.formState.errors.name?.message} />
          </div>
          <div>
            <label className="label">Phone number *</label>
            <input className="input" placeholder="10-digit mobile number" inputMode="numeric" autoComplete="tel" {...form.register("phone")} />
            <FieldError message={form.formState.errors.phone?.message} />
          </div>
          <div>
            <label className="label">Email (optional)</label>
            <input className="input" type="email" placeholder="name@example.com" autoComplete="email" {...form.register("email")} />
            <FieldError message={form.formState.errors.email?.message} />
          </div>
          <div>
            <label className="label">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="input pr-16"
                placeholder="Min 8 characters"
                autoComplete="new-password"
                {...form.register("password")}
              />
              <button type="button" className="absolute right-3 top-2.5 text-xs font-semibold text-muted" onClick={() => setShowPassword((v) => !v)}>
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {strength ? (
              <p className={`mt-1 text-xs ${strength === "Strong" ? "text-success" : strength === "Medium" ? "text-warning" : "text-danger"}`}>
                Strength: {strength}
              </p>
            ) : null}
            <FieldError message={form.formState.errors.password?.message} />
          </div>
          <div>
            <label className="label">Confirm password *</label>
            <input type="password" className="input" placeholder="Re-enter password" autoComplete="new-password" {...form.register("confirm_password")} />
            <FieldError message={form.formState.errors.confirm_password?.message} />
          </div>
          {isFlagOn(config?.referral_earning_status) ? (
            <div>
              <label className="label">Referral code</label>
              <input className="input" {...form.register("referral_code")} />
            </div>
          ) : null}
          <label className="flex items-start gap-2 text-sm text-ink/90">
            <input type="checkbox" className="mt-1" {...form.register("accept_terms")} />
            <span>
              I agree to the{" "}
              <Link href="/terms" className="font-medium text-brand hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="font-medium text-brand hover:underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          <FieldError message={form.formState.errors.accept_terms?.message} />
          <button className="btn-primary w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Creating…" : "Create account"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
