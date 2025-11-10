'use client';

import { useMemo, useState } from "react";
import { usePlatform } from "../context/PlatformContext";
import type { Claim } from "../lib/types";

interface ClaimFormState {
  id?: string;
  policyId: string;
  clientId: string;
  type: string;
  amount: string;
  stage: Claim["stage"];
  handler: string;
}

const defaultClaim: ClaimFormState = {
  policyId: "",
  clientId: "",
  type: "",
  amount: "",
  stage: "Filed",
  handler: "",
};

export function ClaimsCommand() {
  const { claims, policies, clients, upsertClaim, aiSuggest } = usePlatform();
  const [form, setForm] = useState<ClaimFormState>(defaultClaim);
  const [message, setMessage] = useState<string | null>(null);

  const claimCards = useMemo(() => {
    const policyMap = new Map(policies.map((policy) => [policy.id, policy]));
    const clientMap = new Map(clients.map((client) => [client.id, client]));
    return claims.map((claim) => {
      const policy = policyMap.get(claim.policyId);
      const client = clientMap.get(claim.clientId);
      return {
        ...claim,
        policyLabel: policy ? `${policy.policyNumber} · ${policy.product}` : "Policy",
        clientName: client?.name ?? "Client",
        severity:
          claim.amount > 100000 ? "High" : claim.amount > 50000 ? "Medium" : "Low",
      };
    });
  }, [claims, policies, clients]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const claim = upsertClaim({
      id: form.id,
      policyId: form.policyId,
      clientId: form.clientId,
      type: form.type,
      amount: Number(form.amount.replace(/,/g, "")),
      stage: form.stage,
      handler: form.handler,
      lastUpdated: new Date().toISOString().slice(0, 10),
    });
    setMessage(
      claim.id === form.id
        ? `Claim ${claim.id} updated.`
        : `New claim ${claim.id} created.`,
    );
    setForm(defaultClaim);
  };

  const loadClaim = (claim: Claim) => {
    setForm({
      id: claim.id,
      policyId: claim.policyId,
      clientId: claim.clientId,
      type: claim.type,
      amount: claim.amount.toString(),
      stage: claim.stage,
      handler: claim.handler,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl text-neutral-800">Claims Command</h2>
          <p className="text-sm text-neutral-500">
            Stay ahead of severity, triage backlogs, and supercharge handlers with AI
            playbooks.
          </p>
        </div>
        <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
          {claims.length} Active
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-neutral-100 bg-white/80 p-5 shadow-sm"
        >
          <h3 className="font-heading text-lg text-neutral-800">
            {form.id ? "Update Claim" : "Log a Claim"}
          </h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="text-xs font-semibold uppercase text-neutral-400">
              Client
              <select
                value={form.clientId}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, clientId: event.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100/70"
                required
              >
                <option value="">Select client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold uppercase text-neutral-400">
              Policy
              <select
                value={form.policyId}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, policyId: event.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100/70"
                required
              >
                <option value="">Select policy</option>
                {policies.map((policy) => (
                  <option key={policy.id} value={policy.id}>
                    {policy.policyNumber} · {policy.product}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold uppercase text-neutral-400">
              Claim Type
              <input
                value={form.type}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, type: event.target.value }))
                }
                placeholder="Cargo Loss"
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100/70"
                required
              />
            </label>
            <label className="text-xs font-semibold uppercase text-neutral-400">
              Reserve Amount
              <input
                value={form.amount}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, amount: event.target.value }))
                }
                placeholder="125000"
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100/70"
                required
              />
            </label>
            <label className="text-xs font-semibold uppercase text-neutral-400">
              Stage
              <select
                value={form.stage}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, stage: event.target.value as Claim["stage"] }))
                }
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100/70"
              >
                <option value="Filed">Filed</option>
                <option value="Investigating">Investigating</option>
                <option value="Approved">Approved</option>
                <option value="Closed">Closed</option>
              </select>
            </label>
            <label className="text-xs font-semibold uppercase text-neutral-400">
              Handler
              <input
                value={form.handler}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, handler: event.target.value }))
                }
                placeholder="Aria Patel"
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100/70"
                list="handler-suggestions"
              />
              <datalist id="handler-suggestions">
                {aiSuggest("handler").map((handler) => (
                  <option key={handler} value={handler} />
                ))}
              </datalist>
            </label>
          </div>
          <button
            type="submit"
            className="mt-4 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
          >
            {form.id ? "Save Claim" : "Create Claim"}
          </button>
          {message && (
            <p className="mt-3 rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary-800">
              {message}
            </p>
          )}
        </form>

        <div className="rounded-2xl border border-neutral-100 bg-white/80 p-5 shadow-sm">
          <h3 className="font-heading text-lg text-neutral-800">Claim Radar</h3>
          <p className="text-sm text-neutral-500">
            AI surfaces severity, next best action, and stalled items.
          </p>
          <div className="mt-4 space-y-3">
            {claimCards.map((claim) => (
              <article
                key={claim.id}
                className="group rounded-xl border border-neutral-100 bg-white px-4 py-4 shadow-sm transition hover:border-primary-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-neutral-700">
                      {claim.policyLabel}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {claim.clientName} · Handler {claim.handler}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      claim.severity === "High"
                        ? "bg-rose-100 text-rose-600"
                        : claim.severity === "Medium"
                          ? "bg-amber-100 text-amber-600"
                          : "bg-emerald-100 text-emerald-600"
                    }`}
                  >
                    {claim.severity} risk
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-neutral-400">
                  <span>
                    Stage{" "}
                    <span className="font-semibold text-neutral-600">
                      {claim.stage}
                    </span>
                  </span>
                  <span>
                    Reserve{" "}
                    <span className="font-semibold text-neutral-600">
                      ${claim.amount.toLocaleString()}
                    </span>
                  </span>
                  <span>Updated {claim.lastUpdated}</span>
                </div>
                <footer className="mt-3 flex items-center justify-between text-xs text-neutral-400">
                  <span>
                    Next action:{" "}
                    <span className="font-semibold text-neutral-600">
                      {claim.stage === "Investigating"
                        ? "Schedule forensic review"
                        : claim.stage === "Filed"
                          ? "Assign adjuster"
                          : claim.stage === "Approved"
                            ? "Issue settlement pack"
                            : "Archive claim file"}
                    </span>
                  </span>
                  <button
                    onClick={() => loadClaim(claim)}
                    className="opacity-0 transition group-hover:opacity-100"
                  >
                    <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
                      Update
                    </span>
                  </button>
                </footer>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
