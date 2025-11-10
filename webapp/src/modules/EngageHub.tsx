'use client';

import { useState } from "react";
import { usePlatform } from "../context/PlatformContext";

interface ComposeState {
  title: string;
  participants: string;
  channel: "Email" | "Chat" | "Portal";
  message: string;
}

const defaultCompose: ComposeState = {
  title: "",
  participants: "",
  channel: "Email",
  message: "",
};

export function EngageHub() {
  const { communications, upsertCommunication } = usePlatform();
  const [compose, setCompose] = useState<ComposeState>(defaultCompose);
  const [status, setStatus] = useState<string | null>(null);

  const handleSend = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    upsertCommunication({
      title: compose.title,
      participants: compose.participants
        .split(",")
        .map((participant) => participant.trim()),
      channel: compose.channel,
      lastMessage: compose.message,
      sentiment: "Positive",
    });
    setStatus("Conversation opened. Atlas will monitor sentiment automatically.");
    setCompose(defaultCompose);
  };

  return (
    <div className="glass-panel p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl text-neutral-800">Engage Hub</h2>
          <p className="text-sm text-neutral-500">
            Flight deck for multichannel conversations with AI sentiment tracking.
          </p>
        </div>
        <div className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
          {communications.length} threads
        </div>
      </header>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <form
          onSubmit={handleSend}
          className="rounded-2xl border border-neutral-100 bg-white/80 p-5 shadow-sm"
        >
          <h3 className="font-heading text-lg text-neutral-800">
            Compose Conversation
          </h3>
          <div className="mt-4 grid gap-3">
            <label className="text-xs font-semibold uppercase text-neutral-400">
              Title
              <input
                value={compose.title}
                onChange={(event) =>
                  setCompose((prev) => ({ ...prev, title: event.target.value }))
                }
                placeholder="Renewal strategy | Infinite Logistics"
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100/70"
                required
              />
            </label>
            <label className="text-xs font-semibold uppercase text-neutral-400">
              Participants
              <input
                value={compose.participants}
                onChange={(event) =>
                  setCompose((prev) => ({
                    ...prev,
                    participants: event.target.value,
                  }))
                }
                placeholder="Aria Patel, Logistics CFO"
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100/70"
                required
              />
            </label>
            <label className="text-xs font-semibold uppercase text-neutral-400">
              Channel
              <select
                value={compose.channel}
                onChange={(event) =>
                  setCompose((prev) => ({
                    ...prev,
                    channel: event.target.value as ComposeState["channel"],
                  }))
                }
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100/70"
              >
                <option value="Email">Email</option>
                <option value="Chat">Chat</option>
                <option value="Portal">Portal</option>
              </select>
            </label>
            <label className="text-xs font-semibold uppercase text-neutral-400">
              Message
              <textarea
                value={compose.message}
                onChange={(event) =>
                  setCompose((prev) => ({ ...prev, message: event.target.value }))
                }
                rows={4}
                placeholder="Atlas suggests bundling cyber coverage for a 12% savings..."
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100/70"
                required
              />
            </label>
          </div>
          <button
            type="submit"
            className="mt-4 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
          >
            Launch Conversation
          </button>
          {status && (
            <p className="mt-3 rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary-800">
              {status}
            </p>
          )}
        </form>

        <div className="space-y-3">
          {communications.map((thread) => (
            <article
              key={thread.id}
              className="rounded-2xl border border-neutral-100 bg-white/80 p-5 shadow-sm"
            >
              <header className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-lg text-neutral-800">
                    {thread.title}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    {thread.participants.join(" · ")}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    thread.sentiment === "Positive"
                      ? "bg-emerald-100 text-emerald-600"
                      : thread.sentiment === "Neutral"
                        ? "bg-amber-100 text-amber-600"
                        : "bg-rose-100 text-rose-600"
                  }`}
                >
                  {thread.sentiment}
                </span>
              </header>
              <p className="mt-3 text-sm text-neutral-500">{thread.lastMessage}</p>
              <footer className="mt-4 flex items-center justify-between text-xs text-neutral-400">
                <span>Channel · {thread.channel}</span>
                <span>
                  Atlas tip: nurture cadence set to{" "}
                  <span className="font-semibold text-neutral-600">Weekly</span>
                </span>
              </footer>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
