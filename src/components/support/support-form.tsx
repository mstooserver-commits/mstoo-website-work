"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { supportApi } from "@/lib/api";
import { useAuthStore } from "@/lib/stores/auth";

export function SupportForm() {
  const loggedIn = useAuthStore((state) => state.isLoggedIn);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (message.trim().length < 10) {
      toast.error("Please describe the issue in at least 10 characters");
      return;
    }
    setBusy(true);
    try {
      await supportApi.send(message.trim());
      setMessage("");
      toast.success("Your message was sent to MSTOO support");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send message");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mt-8 rounded-2xl border border-line bg-white p-5 shadow-card">
      <h2 className="text-xl font-bold">Contact support</h2>
      {loggedIn ? (
        <>
          <form onSubmit={submit} className="mt-4 space-y-3">
            <textarea
              className="input min-h-32"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Tell us what happened, including booking or payment details…"
            />
            <button className="btn-primary gap-2" disabled={busy}>
              <Send className="h-4 w-4" />
              {busy ? "Sending…" : "Send message"}
            </button>
          </form>
          <div className="mt-4 border-t border-line pt-4">
            <Link href="/chat" className="btn-secondary gap-2">
              <MessageCircle className="h-4 w-4" /> Open live chat
            </Link>
          </div>
        </>
      ) : (
        <p className="mt-3 text-sm text-muted">
          <Link className="font-semibold text-brand" href="/login?redirect=/support">
            Sign in
          </Link>{" "}
          to send a support request or start live chat.
        </p>
      )}
    </section>
  );
}
