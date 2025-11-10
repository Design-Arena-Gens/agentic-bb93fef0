'use client';

import { useMemo, useState } from "react";
import { usePlatform } from "../context/PlatformContext";
import type { Client } from "../lib/types";

interface ClientFormState {
  id?: string;
  name: string;
  email: string;
  company: string;
  tags: string;
}

const defaultForm: ClientFormState = {
  name: "",
  email: "",
  company: "",
  tags: "",
};

export function Client360() {
  const { clients, upsertClient, removeClient } = usePlatform();
  const [form, setForm] = useState<ClientFormState>(defaultForm);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [mergeCandidate, setMergeCandidate] = useState<Client | null>(null);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);

  const sortedClients = useMemo(
    () => [...clients].sort((a, b) => b.policyCount - a.policyCount),
    [clients],
  );

  const resetForm = () => {
    setForm(defaultForm);
    setMergeCandidate(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const tags = form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    const result = upsertClient({
      ...form,
      tags,
      company: form.company || form.name,
    });

    if (result.status === "duplicate") {
      setStatusMessage(
        `Duplicate detected: ${result.record.name}. Merge to update details.`,
      );
      setMergeCandidate(result.record);
      return;
    }

    setStatusMessage(
      result.status === "created"
        ? "Client added successfully."
        : "Client updated successfully.",
    );
    resetForm();
  };

  const handleMerge = () => {
    if (!mergeCandidate) return;
    const tags = Array.from(
      new Set([
        ...mergeCandidate.tags,
        ...form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      ]),
    );
    upsertClient({
      ...mergeCandidate,
      ...form,
      tags,
      id: mergeCandidate.id,
    });
    setStatusMessage(`Merged into ${mergeCandidate.name}.`);
    setMergeCandidate(null);
    resetForm();
  };

  const handleSelect = (id: string) => {
    setSelectedClients((prev) =>
      prev.includes(id) ? prev.filter((clientId) => clientId !== id) : [...prev, id],
    );
  };

  const exportCsv = () => {
    const header = "Name,Email,Company,Status,Tags\n";
    const rows = clients
      .map(
        (client) =>
          `"${client.name}","${client.email}","${client.company}","${client.status}","${client.tags.join(" | ")}"`,
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "suresphere-clients.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const importCsv = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const [, ...lines] = text.split(/\r?\n/);
    let imported = 0;
    for (const line of lines) {
      if (!line.trim()) continue;
      const [name, email, company, status, tagLine] = line
        .split(",")
        .map((value) => value.replace(/^"|"$/g, "").trim());
      const result = upsertClient({
        name,
        email,
        company,
        status: (status as Client["status"]) || "Active",
        tags: tagLine ? tagLine.split("|").map((tag) => tag.trim()) : [],
        policyCount: 0,
      });
      if (result.status !== "duplicate") {
        imported += 1;
      }
    }
    setStatusMessage(`Imported ${imported} client records.`);
    event.target.value = "";
  };

  return (
    <div className="glass-panel p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl text-neutral-800">
            Client 360 Workspace
          </h2>
          <p className="text-sm text-neutral-500">
            Manage client dossiers, bulk imports, and AI dedupe intelligence.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-600 transition hover:border-primary-300 hover:text-primary-600"
          >
            Export CSV
          </button>
          <label className="cursor-pointer rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700">
            Bulk Import
            <input type="file" className="hidden" accept=".csv" onChange={importCsv} />
          </label>
        </div>
      </header>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-neutral-100 bg-white/80 p-5 shadow-sm"
        >
          <h3 className="font-heading text-lg text-neutral-800">
            {form.id ? "Update Client" : "Add New Client"}
          </h3>
          <p className="text-sm text-neutral-500">
            Auto-suggested industries and tags adapt as you type.
          </p>
          <div className="mt-4 grid gap-3">
            <div>
              <label className="text-xs font-semibold uppercase text-neutral-400">
                Client Name
              </label>
              <input
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Willowbrook Medical Group"
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100/70"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-neutral-400">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, email: event.target.value }))
                }
                placeholder="risk@willowbrook-med.com"
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100/70"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-neutral-400">
                Company
              </label>
              <input
                value={form.company}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, company: event.target.value }))
                }
                placeholder="Willowbrook Medical Group"
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100/70"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-neutral-400">
                Tags
              </label>
              <input
                value={form.tags}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, tags: event.target.value }))
                }
                placeholder="Healthcare, Liability"
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100/70"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3 text-sm">
            <button
              type="submit"
              className="rounded-full bg-primary-600 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-primary-700"
            >
              {form.id ? "Save Changes" : "Create Client"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-neutral-200 px-4 py-2 font-semibold text-neutral-500 transition hover:border-neutral-300 hover:text-neutral-700"
            >
              Reset
            </button>
            {mergeCandidate && (
              <button
                type="button"
                onClick={handleMerge}
                className="rounded-full bg-accent-600 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-accent-700"
              >
                Merge Duplicate
              </button>
            )}
          </div>
          {statusMessage && (
            <p className="mt-4 rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary-800">
              {statusMessage}
            </p>
          )}
        </form>

        <div className="rounded-2xl border border-neutral-100 bg-white/80 p-5 shadow-sm">
          <header className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-lg text-neutral-800">
                Smart Segments
              </h3>
              <p className="text-sm text-neutral-500">
                Select clients to build targeted renewal or upsell campaigns.
              </p>
            </div>
            <span className="rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold text-accent-700">
              {selectedClients.length} selected
            </span>
          </header>
          <div className="mt-4 space-y-3">
            {sortedClients.map((client) => (
              <label
                key={client.id}
                className="flex cursor-pointer items-start justify-between rounded-xl border border-neutral-100 bg-white px-4 py-3 transition hover:border-primary-200 hover:shadow-sm"
              >
                <div>
                  <p className="font-semibold text-neutral-700">{client.name}</p>
                  <p className="text-xs text-neutral-400">{client.email}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {client.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-primary-100 px-2 py-1 text-[11px] text-primary-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs font-semibold text-neutral-400">
                    {client.status} · {client.policyCount} policies
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedClients.includes(client.id)}
                      onChange={() => handleSelect(client.id)}
                      className="h-4 w-4 accent-primary-500"
                    />
                    <button
                      onClick={() => {
                        setForm({
                          id: client.id,
                          name: client.name,
                          email: client.email,
                          company: client.company,
                          tags: client.tags.join(", "),
                        });
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-xs font-semibold text-primary-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeClient(client.id)}
                      className="text-xs font-semibold text-neutral-400 hover:text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
