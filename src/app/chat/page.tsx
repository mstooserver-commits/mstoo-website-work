"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { chatApi } from "@/lib/api";
import type { ChatChannel, Paginated } from "@/types";

export default function ChatListPage() {
  const q = useQuery({
    queryKey: ["chats"],
    queryFn: () => chatApi.list(1),
    refetchInterval: 8000,
  });
  const items = ((q.data as Paginated<ChatChannel>)?.data || []) as ChatChannel[];
  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold">Messages</h1>
      <div className="mt-4 space-y-2">
        {items.map((c) => (
          <Link key={c.id} href={`/chat/${c.id}`} className="card block p-4">
            <p className="font-medium">{c.channel_users?.[0]?.provider?.company_name || "Conversation"}</p>
            <p className="text-sm text-muted">{c.last_message || "No messages yet"}</p>
          </Link>
        ))}
        {q.isFetched && items.length === 0 ? <p className="text-sm text-muted">No conversations yet.</p> : null}
      </div>
    </div>
  );
}
