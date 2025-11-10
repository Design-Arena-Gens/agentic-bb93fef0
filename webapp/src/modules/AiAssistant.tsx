'use client';

import { useEffect, useRef, useState } from "react";
import { usePlatform } from "../context/PlatformContext";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function AiAssistant() {
  const { clients, policies, claims, globalSearch } = usePlatform();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "seed",
      role: "assistant",
      content:
        "Hi, I'm Atlas Copilot. Ask me about clients, policies, claims, or let me draft a renewal strategy.",
    },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) return;
    const prompt = input.trim();
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: prompt },
    ]);
    setInput("");
    setTimeout(() => {
      const response = generateResponse(prompt);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: response },
      ]);
    }, 600);
  };

  const generateResponse = (prompt: string) => {
    const normalized = prompt.toLowerCase();
    if (normalized.includes("renewal") || normalized.includes("strategy")) {
      return (
        "Here's a renewal approach:\n" +
        "1. Prioritize Infinite Logistics and Willowbrook Medical.\n" +
        "2. Bundle cyber with marine to offset 4.2% rate increase.\n" +
        "3. Schedule risk engineering visit before May 12.\n" +
        "I've queued these as tasks in Flow Automator."
      );
    }
    if (normalized.includes("client") || normalized.includes("policy")) {
      const searchHits = globalSearch(prompt)
        .slice(0, 3)
        .map((hit) => `• ${hit.label}`);
      if (searchHits.length > 0) {
        return `I found the following matches:\n${searchHits.join("\n")}`;
      }
    }
    if (normalized.includes("claims")) {
      const openClaims = claims.filter(
        (claim) => claim.stage === "Filed" || claim.stage === "Investigating",
      );
      return `There are ${openClaims.length} active claims. Top priority: ${openClaims[0]?.type} for ${openClaims[0]?.amount.toLocaleString()}.`;
    }
    if (normalized.includes("summary")) {
      return `Portfolio snapshot: ${clients.length} clients, ${
        policies.length
      } policies, loss ratio ${(claims.length / Math.max(1, policies.length) * 42).toFixed(1)}%.`;
    }
    return "I'm syncing your request with the latest data. Try asking about renewals, claims, or clients for more tailored responses.";
  };

  return (
    <div className="glass-panel flex h-full flex-col p-6">
      <header>
        <h2 className="font-heading text-2xl text-neutral-800">
          Atlas Copilot
        </h2>
        <p className="text-sm text-neutral-500">
          Conversational intelligence trained on your workspace.
        </p>
      </header>
      <div className="mt-4 flex-1 space-y-3 overflow-y-auto rounded-2xl border border-neutral-100 bg-white/80 p-5 shadow-inner">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              message.role === "assistant"
                ? "bg-primary-50 text-primary-800"
                : "ml-auto bg-neutral-900 text-white"
            }`}
          >
            <pre className="whitespace-pre-wrap font-body">{message.content}</pre>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-3">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask Atlas anything... e.g. “Summarize open claims”"
          className="flex-1 rounded-full border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100/70"
        />
        <button
          type="submit"
          className="rounded-full bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
        >
          Send
        </button>
      </form>
    </div>
  );
}
