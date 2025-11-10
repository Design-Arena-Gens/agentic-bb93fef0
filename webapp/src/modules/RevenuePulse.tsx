'use client';

import { useMemo, useState } from "react";
import { usePlatform } from "../context/PlatformContext";

interface CommissionFormState {
  id?: string;
  policyId: string;
  month: string;
  amount: string;
  status: "Projected" | "Received" | "Disputed";
}

const defaultCommission: CommissionFormState = {
  policyId: "",
  month: "",
  amount: "",
  status: "Projected",
};

export function RevenuePulse() {
  const { commissions, policies, upsertCommission } = usePlatform();
  const [form, setForm] = useState<CommissionFormState>(defaultCommission);
  const [message, setMessage] = useState<string | null>(null);

  const trend = useMemo(() => {
    const buckets = new Map<string, number>();
    commissions.forEach((record) => {
      const value = buckets.get(record.month) ?? 0;
      buckets.set(record.month, value + record.amount);
    });
    return Array.from(buckets.entries())
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .slice(-6);
  }, [commissions]);

  const summary = useMemo(() => {
    const total = commissions.reduce((sum, record) => sum + record.amount, 0);
    const projected = commissions
      .filter((record) => record.status === "Projected")
      .reduce((sum, record) => sum + record.amount, 0);
    const disputed = commissions
      .filter((record) => record.status === "Disputed")
      .reduce((sum, record) => sum + record.amount, 0);
    return { total, projected, disputed };
  }, [commissions]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = Number(form.amount.replace(/,/g, ""));
    const record = upsertCommission({
      id: form.id,
      policyId: form.policyId,
      month: form.month,
      amount,
      status: form.status,
    });
    setMessage(
      record.id === form.id
        ? "Commission record updated."
        : "Commission record captured.",
    );
    setForm(defaultCommission);
  };

  return (
    <div className="glass-panel p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl text-neutral-800">
            Revenue Pulse
          </h2>
          <p className="text-sm text-neutral-500">
            Real-time commission health, projected cash flow, and dispute watch.
          </p>
        </div>
        <div className="rounded-2xl border border-primary-100 bg-white px-4 py-2 text-xs font-semibold text-primary-700 shadow-sm">
          Forecast next 90 days: $
          {(summary.projected + summary.total).toLocaleString()}
        </div>
      </header>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-neutral-100 bg-white/80 p-5 shadow-sm"
        >
          <h3 className="font-heading text-lg text-neutral-800">
            Record Commission
          </h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
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
              Month
              <input
                type="month"
                value={form.month}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, month: event.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100/70"
                required
              />
            </label>
            <label className="text-xs font-semibold uppercase text-neutral-400">
              Amount
              <input
                value={form.amount}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, amount: event.target.value }))
                }
                placeholder="3500"
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100/70"
                required
              />
            </label>
            <label className="text-xs font-semibold uppercase text-neutral-400">
              Status
              <select
                value={form.status}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    status: event.target.value as CommissionFormState["status"],
                  }))
                }
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100/70"
              >
                <option value="Projected">Projected</option>
                <option value="Received">Received</option>
                <option value="Disputed">Disputed</option>
              </select>
            </label>
          </div>
          <button
            type="submit"
            className="mt-4 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
          >
            {form.id ? "Save Record" : "Add Record"}
          </button>
          {message && (
            <p className="mt-3 rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary-800">
              {message}
            </p>
          )}
        </form>

        <div className="rounded-2xl border border-neutral-100 bg-white/80 p-5 shadow-sm">
          <h3 className="font-heading text-lg text-neutral-800">
            Commission Snapshot
          </h3>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl bg-primary-50 p-4 text-sm text-primary-700">
              <p className="text-xs font-semibold uppercase tracking-wide">MTD</p>
              <p className="mt-1 text-2xl font-bold">
                ${summary.total.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl bg-accent-50 p-4 text-sm text-accent-700">
              <p className="text-xs font-semibold uppercase tracking-wide">
                Projected
              </p>
              <p className="mt-1 text-2xl font-bold">
                ${summary.projected.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
              <p className="text-xs font-semibold uppercase tracking-wide">
                Disputed
              </p>
              <p className="mt-1 text-2xl font-bold">
                ${summary.disputed.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-xs font-semibold uppercase text-neutral-400">
              Last 6 Months
            </h4>
            <div className="mt-3 flex items-end gap-3">
              {trend.map(([month, amount]) => (
                <div
                  key={month}
                  className="flex flex-col items-center text-xs text-neutral-400"
                >
                  <div
                    className="w-12 rounded-t-xl bg-gradient-to-t from-primary-500 to-accent-400"
                    style={{ height: `${Math.min(120, amount / 300)}px` }}
                  />
                  <span className="mt-2 font-semibold text-neutral-600">
                    ${amount.toLocaleString()}
                  </span>
                  <span>{month.replace("-", "/")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
