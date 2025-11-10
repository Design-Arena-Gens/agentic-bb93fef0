'use client';

import { useMemo, useState } from "react";
import { usePlatform } from "../context/PlatformContext";
import type { Policy } from "../lib/types";

interface PolicyFormState {
  id?: string;
  clientId: string;
  carrier: string;
  product: string;
  premium: string;
  policyNumber: string;
  effectiveDate: string;
  renewalDate: string;
  status: Policy["status"];
}

const defaultPolicy: PolicyFormState = {
  clientId: "",
  carrier: "",
  product: "",
  premium: "",
  policyNumber: "",
  effectiveDate: "",
  renewalDate: "",
  status: "Active",
};

export function PolicyMatrix() {
  const { policies, clients, upsertPolicy, aiSuggest } = usePlatform();
  const [form, setForm] = useState<PolicyFormState>(defaultPolicy);
  const [message, setMessage] = useState<string | null>(null);

  const enrichedPolicies = useMemo(() => {
    const clientMap = new Map(clients.map((client) => [client.id, client.name]));
    return policies.map((policy) => ({
      ...policy,
      clientName: clientMap.get(policy.clientId) ?? "Unknown Client",
    }));
  }, [policies, clients]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const premium = Number(form.premium.replace(/,/g, ""));
    const record = upsertPolicy({
      id: form.id,
      clientId: form.clientId,
      carrier: form.carrier,
      product: form.product,
      premium,
      policyNumber: form.policyNumber,
      effectiveDate: form.effectiveDate,
      renewalDate: form.renewalDate,
      status: form.status,
    });
    setMessage(
      record.id === form.id
        ? `Policy ${record.policyNumber} updated.`
        : `Policy ${record.policyNumber} created.`,
    );
    setForm(defaultPolicy);
  };

  const loadPolicy = (policy: Policy) => {
    setForm({
      id: policy.id,
      clientId: policy.clientId,
      carrier: policy.carrier,
      product: policy.product,
      premium: policy.premium.toString(),
      policyNumber: policy.policyNumber,
      effectiveDate: policy.effectiveDate,
      renewalDate: policy.renewalDate,
      status: policy.status,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="glass-panel p-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl text-neutral-800">
            Policy Matrix
          </h2>
          <p className="text-sm text-neutral-500">
            Centralize policies, track renewal health, and leverage AI carrier
            suggestions.
          </p>
        </div>
      </header>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-neutral-100 bg-white/80 p-5 shadow-sm"
        >
          <h3 className="font-heading text-lg text-neutral-800">
            {form.id ? "Update Policy" : "Create Policy"}
          </h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="text-xs font-semibold uppercase text-neutral-400">
              Client
              <select
                value={form.clientId}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, clientId: event.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-accent-400 focus:ring-4 focus:ring-accent-100/70"
                required
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold uppercase text-neutral-400">
              Policy Number
              <input
                value={form.policyNumber}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    policyNumber: event.target.value,
                  }))
                }
                placeholder="SR-7789201"
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-accent-400 focus:ring-4 focus:ring-accent-100/70"
                required
              />
            </label>
            <label className="text-xs font-semibold uppercase text-neutral-400">
              Carrier
              <div className="relative">
                <input
                  value={form.carrier}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, carrier: event.target.value }))
                  }
                  placeholder="Guardian Mutual"
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-accent-400 focus:ring-4 focus:ring-accent-100/70"
                  list="carrier-suggestions"
                  required
                />
                <datalist id="carrier-suggestions">
                  {aiSuggest("carrier").map((carrier) => (
                    <option key={carrier} value={carrier} />
                  ))}
                </datalist>
              </div>
            </label>
            <label className="text-xs font-semibold uppercase text-neutral-400">
              Product
              <input
                value={form.product}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, product: event.target.value }))
                }
                placeholder="Cyber Liability"
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-accent-400 focus:ring-4 focus:ring-accent-100/70"
                required
              />
            </label>
            <label className="text-xs font-semibold uppercase text-neutral-400">
              Premium (annual)
              <div className="relative">
                <input
                  value={form.premium}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, premium: event.target.value }))
                  }
                  placeholder="42000"
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-accent-400 focus:ring-4 focus:ring-accent-100/70"
                  required
                />
                <div className="pointer-events-none absolute right-4 top-3 text-sm text-neutral-400">
                  USD
                </div>
              </div>
            </label>
            <label className="text-xs font-semibold uppercase text-neutral-400">
              Status
              <select
                value={form.status}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, status: event.target.value as Policy["status"] }))
                }
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-accent-400 focus:ring-4 focus:ring-accent-100/70"
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Lapsed">Lapsed</option>
              </select>
            </label>
            <label className="text-xs font-semibold uppercase text-neutral-400">
              Effective Date
              <input
                type="date"
                value={form.effectiveDate}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    effectiveDate: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-accent-400 focus:ring-4 focus:ring-accent-100/70"
                required
              />
            </label>
            <label className="text-xs font-semibold uppercase text-neutral-400">
              Renewal Date
              <input
                type="date"
                value={form.renewalDate}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    renewalDate: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-accent-400 focus:ring-4 focus:ring-accent-100/70"
                required
              />
            </label>
          </div>
          <button
            type="submit"
            className="mt-4 rounded-full bg-accent-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700"
          >
            {form.id ? "Save Policy" : "Create Policy"}
          </button>
          {message && (
            <p className="mt-3 rounded-xl bg-accent-50 px-4 py-3 text-sm text-accent-700">
              {message}
            </p>
          )}
        </form>

        <div className="rounded-2xl border border-neutral-100 bg-white/80 p-5 shadow-sm">
          <h3 className="font-heading text-lg text-neutral-800">Live Policies</h3>
          <p className="text-sm text-neutral-500">
            Hover to reveal AI renewal signals and quick actions.
          </p>
          <div className="mt-4 space-y-3">
            {enrichedPolicies.map((policy) => (
              <article
                key={policy.id}
                className="group rounded-xl border border-neutral-100 bg-white px-4 py-4 shadow-sm transition hover:border-accent-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-neutral-700">
                      {policy.policyNumber} · {policy.product}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {policy.clientName} · {policy.carrier}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${policy.status === "Active" ? "bg-primary-100 text-primary-700" : policy.status === "Pending" ? "bg-amber-50 text-amber-600" : "bg-neutral-100 text-neutral-500"}`}
                  >
                    {policy.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-neutral-400">
                  <div>
                    Effective{" "}
                    <span className="font-semibold text-neutral-600">
                      {policy.effectiveDate}
                    </span>
                  </div>
                  <div>
                    Renewal{" "}
                    <span className="font-semibold text-neutral-600">
                      {policy.renewalDate}
                    </span>
                  </div>
                  <div>
                    Premium{" "}
                    <span className="font-semibold text-neutral-600">
                      ${policy.premium.toLocaleString()}
                    </span>
                  </div>
                </div>
                <footer className="mt-3 flex items-center justify-between text-xs text-neutral-400">
                  <span>
                    AI forecast:{" "}
                    <span className="font-semibold text-neutral-600">
                      Renewal confidence {(policy.status === "Active" ? 88 : 63)}%
                    </span>
                  </span>
                  <button
                    onClick={() => loadPolicy(policy)}
                    className="opacity-0 transition group-hover:opacity-100"
                  >
                    <span className="rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold text-accent-700">
                      Edit
                    </span>
                  </button>
                </footer>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
