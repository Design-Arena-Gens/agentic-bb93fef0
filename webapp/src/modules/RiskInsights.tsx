'use client';

import { useMemo } from "react";
import { usePlatform } from "../context/PlatformContext";

export function RiskInsights() {
  const { policies, claims, commissions } = usePlatform();

  const metrics = useMemo(() => {
    const activePolicies = policies.filter((policy) => policy.status === "Active");
    const totalPremium = activePolicies.reduce((sum, policy) => sum + policy.premium, 0);
    const lossRatio =
      claims.reduce((sum, claim) => sum + claim.amount, 0) /
      Math.max(1, totalPremium);
    const avgCommission =
      commissions.reduce((sum, record) => sum + record.amount, 0) /
      Math.max(1, commissions.length);

    const heatmapData = activePolicies.map((policy) => ({
      label: policy.product,
      value: Math.min(100, Math.round((policy.premium / totalPremium) * 100)),
    }));

    return {
      activePolicies: activePolicies.length,
      totalPremium,
      lossRatio: Math.min(1.5, lossRatio),
      avgCommission,
      heatmapData,
    };
  }, [policies, claims, commissions]);

  return (
    <div className="glass-panel p-6">
      <header>
        <h2 className="font-heading text-2xl text-neutral-800">
          Risk Insights
        </h2>
        <p className="text-sm text-neutral-500">
          Portfolio pulse, trending loss ratios, and policy heatmaps without
          leaving the workspace.
        </p>
      </header>

      <section className="mt-6 grid gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-neutral-100 bg-white/80 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-neutral-400">
            Active Policies
          </p>
          <p className="mt-2 text-3xl font-bold text-neutral-800">
            {metrics.activePolicies}
          </p>
          <p className="text-xs text-neutral-400">Live revenue streams</p>
        </div>
        <div className="rounded-2xl border border-neutral-100 bg-white/80 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-neutral-400">
            Annualized Premium
          </p>
          <p className="mt-2 text-3xl font-bold text-neutral-800">
            ${metrics.totalPremium.toLocaleString()}
          </p>
          <p className="text-xs text-neutral-400">Current fiscal</p>
        </div>
        <div className="rounded-2xl border border-neutral-100 bg-white/80 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-neutral-400">
            Loss Ratio
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500"
              style={{ width: `${Math.min(100, metrics.lossRatio * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-2xl font-bold text-neutral-800">
            {(metrics.lossRatio * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-neutral-400">Industry target: 65%</p>
        </div>
        <div className="rounded-2xl border border-neutral-100 bg-white/80 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-neutral-400">
            Avg Commission
          </p>
          <p className="mt-2 text-3xl font-bold text-neutral-800">
            ${metrics.avgCommission.toFixed(0)}
          </p>
          <p className="text-xs text-neutral-400">Per policy</p>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-neutral-100 bg-white/80 p-5 shadow-sm">
          <h3 className="font-heading text-lg text-neutral-800">
            Premium Heatmap
          </h3>
          <p className="text-sm text-neutral-500">
            Understand concentration by product line to inform diversification strategy.
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {metrics.heatmapData.map((item) => (
              <div key={item.label} className="rounded-xl border border-neutral-100 p-4">
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span className="font-semibold text-neutral-600">{item.label}</span>
                  <span>{item.value}%</span>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent-500 to-primary-500"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
                <p className="mt-3 text-xs text-neutral-400">
                  Atlas tip:{" "}
                  {item.value > 40
                    ? "Consider cross-selling to spread exposure."
                    : "Healthy diversification pattern."}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-neutral-100 bg-white/80 p-5 shadow-sm">
          <h3 className="font-heading text-lg text-neutral-800">
            Emerging Signals
          </h3>
          <ul className="mt-3 space-y-3 text-sm text-neutral-500">
            <li className="rounded-xl bg-neutral-50 px-4 py-3">
              📈 Cyber premiums climbed 18% QoQ. Atlas suggests packaging incident
              response retainers.
            </li>
            <li className="rounded-xl bg-neutral-50 px-4 py-3">
              🛡️ Claims severity trending upward on marine cargo. Recommend loss
              control visit and updated risk survey.
            </li>
            <li className="rounded-xl bg-neutral-50 px-4 py-3">
              🤝 Partner Nexus indicates three carriers launching renewable energy
              products. Add to cross-sell campaigns.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
