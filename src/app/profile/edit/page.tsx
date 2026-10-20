"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/stores/auth";

export default function EditProfilePage() {
  const user = useAuthStore((s) => s.user);
  const refresh = useAuthStore((s) => s.refreshUser);
  const [first, setFirst] = useState(user?.first_name || "");
  const [last, setLast] = useState(user?.last_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [document, setDocument] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState(user?.document_type || "aadhaar");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFirst(user.first_name || "");
    setLast(user.last_name || "");
    setEmail(user.email || "");
    setDocumentType(user.document_type || "aadhaar");
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const form = new FormData();
      form.append("first_name", first.trim());
      form.append("last_name", last.trim());
      form.append("email", email.trim());
      form.append("document_type", documentType);
      form.append("_method", "put");
      if (profileImage) form.append("profile_image", profileImage);
      if (document) form.append("document", document);
      await authApi.updateProfile(form);
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
        <input
          className="input"
          value={first}
          onChange={(e) => setFirst(e.target.value)}
          placeholder="First name"
        />
        <input
          className="input"
          value={last}
          onChange={(e) => setLast(e.target.value)}
          placeholder="Last name"
        />
        <input
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <label className="block">
          <span className="label">Profile photo</span>
          <input
            className="input"
            type="file"
            accept="image/jpeg,image/png,image/gif"
            onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
          />
        </label>
        <section className="rounded-xl border border-line bg-page p-4">
          <h2 className="font-semibold">Identity verification</h2>
          <p className="mt-1 text-sm text-muted">
            Status:{" "}
            <span className="font-medium capitalize text-ink">
              {user?.document_status || (user?.document ? "pending" : "not submitted")}
            </span>
          </p>
          {user?.document_status === "approved" ? (
            <p className="mt-3 text-sm text-success">Your identity document is verified.</p>
          ) : (
            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="label">Document type</span>
                <select
                  className="input"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                >
                  <option value="aadhaar">Aadhaar card</option>
                  <option value="pan">PAN card</option>
                  <option value="driving_license">Driving licence</option>
                  <option value="passport">Passport</option>
                  <option value="voter_id">Voter ID</option>
                </select>
              </label>
              <label className="block">
                <span className="label">Upload document</span>
                <input
                  className="input"
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={(e) => setDocument(e.target.files?.[0] || null)}
                />
              </label>
              <p className="text-xs text-muted">
                Upload a clear JPG, PNG, or PDF. It will be sent for admin review.
              </p>
            </div>
          )}
        </section>
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? "Saving…" : document ? "Save and submit verification" : "Save"}
        </button>
        <button type="button" className="w-full text-sm text-danger" onClick={remove}>
          Delete account
        </button>
      </form>
    </div>
  );
}
