"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { chatApi } from "@/lib/api";
import { useAuthStore } from "@/lib/stores/auth";
import type { ChatMessage, Paginated } from "@/types";

export default function ChatThreadPage({ params }: { params: { id: string } }) {
  const userId = useAuthStore((s) => s.user)?.id;
  const [text, setText] = useState("");
  const q = useQuery({
    queryKey: ["conversation", params.id],
    queryFn: () => chatApi.conversation(params.id, 1),
    refetchInterval: 4000,
  });
  const items = [...(((q.data as Paginated<ChatMessage>)?.data || []) as ChatMessage[])].reverse();

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const form = new FormData();
    form.append("channel_id", params.id);
    form.append("message", text);
    try {
      await chatApi.send(form);
      setText("");
      q.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send");
    }
  };

  return (
    <div className="container-page flex min-h-[70vh] flex-col py-6">
      <h1 className="text-lg font-bold">Chat</h1>
      <div className="mt-4 flex-1 space-y-2 overflow-y-auto">
        {items.map((m) => (
          <div
            key={m.id}
            className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
              m.user_id === userId ? "ml-auto bg-brand text-white" : "bg-white border border-line"
            }`}
          >
            {m.message}
          </div>
        ))}
      </div>
      <form onSubmit={send} className="mt-4 flex gap-2">
        <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Message" />
        <button className="btn-primary">Send</button>
      </form>
    </div>
  );
}
