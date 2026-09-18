"use client";

import { useState } from "react";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/stores/auth";

export default function EditProfilePage() {
  const user = useAuthStore((s) => s.user);
  const refresh = useAuthStore((s) => s.refreshUser);
  const [first, setFirst] = useState(user?.first_name || "");
  const [last, setLast] = useState(user?.last_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [busy, setBusy] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await authApi.updateProfile({
        first_name: first,
        last_name: last,
        email,
        _method: "put",
      });
      await refresh();
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm("Delete your account permanently?")) return;
    try {
      await authApi.removeAccount();
      await useAuthStore.getState().logout();
      window.location.href = "/";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete account");
    }
  };

  return (
    <div className="container-page py-8">
      <form onSubmit={save} className="mx-auto max-w-lg card space-y-4 p-6">
        <h1 className="text-2xl font-bold">Edit profile</h1>
        <input className="input" value={first} onChange={(e) => setFirst(e.target.value)} placeholder="First name" />
        <input className="input" value={last} onChange={(e) => setLast(e.target.value)} placeholder="Last name" />
        <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <button className="btn-primary w-full" disabled={busy}>
          Save
        </button>
        <button type="button" className="w-full text-sm text-danger" onClick={remove}>
          Delete account
        </button>
      </form>
    </div>
  );
}
