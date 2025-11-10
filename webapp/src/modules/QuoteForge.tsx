'use client';

import { useState } from "react";
import { usePlatform } from "../context/PlatformContext";

interface QuoteFormState {
  id?: string;
  clientId: string;
  product: string;
  coverage: string;
  premiumEstimate: string;
  notes: string;
}

const defaultQuote: QuoteFormState = {
  clientId: "",
  product: "",
  coverage: "",
  premiumEstimate: "",
  notes: "",
};

export function QuoteForge() {
  const { clients, quotes, upsertQuote, aiSuggest, partners } = usePlatform();
  const [form, setForm] = useState<QuoteFormState>(defaultQuote);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const coverage = Number(form.coverage.replace(/,/g, ""));
    const premium = Number(form.premiumEstimate.replace(/,/g, ""));
    const record = upsertQuote({
      id: form.id,
      clientId: form.clientId,
      product: form.product,
      coverage,
      premiumEstimate: premium,
      probability: 0.65,
      notes: form.notes || "AI generating strategy playbook...",
    });
    setMessage(
      record.id === form.id ? "Quote updated successfully." : "Quote created.",
    );
    setForm(defaultQuote);
  };

  const applyCoverageSuggestion = (suggestion: string) => {
    const value = suggestion.replace(/[^\d]/g, "");
    setForm((prev) => ({ ...prev, coverage: value }));
    const premiumSuggestions = aiSuggest("premiumEstimate", {
      coverage: value,
    });
    if (premiumSuggestions.length > 0) {
      setForm((prev) => ({
        ...prev,
        premiumEstimate: premiumSuggestions[1] ?? premiumSuggestions[0],
      }));
    }
  };

  const loadQuote = (id: string) => {
    const quote = quotes.find((item) => item.id === id);
    if (!quote) return;
    setForm({
      id: quote.id,
      clientId: quote.clientId,
      product: quote.product,
      coverage: quote.coverage.toString(),
      premiumEstimate: quote.premiumEstimate.toString(),
      notes: quote.notes,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="glass-panel p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl text-neutral-800">Quote Forge</h2>
          <p className="text-sm text-neutral-500">
            Craft proposals with instant coverage benchmarks and AI pricing cues.
          </p>
        </div>
        <span className="rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold text-accent-700">
          Win rate boost: +12%
        </span>
      </header>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-neutral-100 bg-white/80 p-5 shadow-sm"
        >
          <h3 className="font-heading text-lg text-neutral-800">
            Configure Quote
          </h3>
          <div className="mt-4 grid gap-3">
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
                <option value="">Select client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold uppercase text-neutral-400">
              Product
              <input
                value={form.product}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, product: event.target.value }))
                }
                placeholder="Enterprise Risk Umbrella"
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-accent-400 focus:ring-4 focus:ring-accent-100/70"
                required
              />
            </label>
            <label className="text-xs font-semibold uppercase text-neutral-400">
              Coverage Limit
              <div className="relative">
                <input
                  value={form.coverage}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, coverage: event.target.value }))
                  }
                  placeholder="5000000"
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-accent-400 focus:ring-4 focus:ring-accent-100/70"
                  required
                />
                <span className="pointer-events-none absolute right-4 top-3 text-sm text-neutral-400">
                  USD
                </span>
              </div>
            </label>
            <label className="text-xs font-semibold uppercase text-neutral-400">
              Premium Estimate
              <input
                value={form.premiumEstimate}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    premiumEstimate: event.target.value,
                  }))
                }
                placeholder="64000"
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-accent-400 focus:ring-4 focus:ring-accent-100/70"
                required
              />
            </label>
            <label className="text-xs font-semibold uppercase text-neutral-400">
              Narrative & Notes
              <textarea
                value={form.notes}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, notes: event.target.value }))
                }
                rows={4}
                placeholder="Bundled cyber rider reduces overall spend by 12%."
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-accent-400 focus:ring-4 focus:ring-accent-100/70"
              />
            </label>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              type="submit"
              className="rounded-full bg-accent-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700"
            >
              {form.id ? "Save Quote" : "Generate Quote"}
            </button>
            <button
              type="button"
              onClick={() => setForm(defaultQuote)}
              className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-500 transition hover:border-neutral-300 hover:text-neutral-700"
            >
              Clear
            </button>
          </div>
          {message && (
            <p className="mt-3 rounded-xl bg-accent-50 px-4 py-3 text-sm text-accent-700">
              {message}
            </p>
          )}
        </form>

        <div className="rounded-2xl border border-neutral-100 bg-white/80 p-5 shadow-sm">
          <h3 className="font-heading text-lg text-neutral-800">
            Atlas Recommendations
          </h3>
          <p className="text-sm text-neutral-500">
            Tap a suggestion to auto-fill coverage and pricing benchmarks.
          </p>
          <div className="mt-4 space-y-4">
            <div>
              <h4 className="text-xs font-semibold uppercase text-neutral-400">
                Coverage Benchmarks
              </h4>
              <div className="mt-2 flex flex-wrap gap-2">
                {aiSuggest("coverage").map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => applyCoverageSuggestion(suggestion)}
                    className="rounded-full border border-accent-200 bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700 transition hover:border-accent-300 hover:bg-accent-100"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase text-neutral-400">
                Recent Quotes
              </h4>
              <div className="mt-3 space-y-3">
                {quotes.map((quote) => (
                  <article
                    key={quote.id}
                    className="flex items-center justify-between rounded-xl border border-neutral-100 bg-white px-4 py-3 text-sm text-neutral-600 shadow-sm transition hover:border-accent-200"
                  >
                    <div>
                      <p className="font-semibold text-neutral-700">
                        {quote.product}
                      </p>
                      <p className="text-xs text-neutral-400">
                        Coverage ${quote.coverage.toLocaleString()} · Premium $
                        {quote.premiumEstimate.toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => loadQuote(quote.id)}
                      className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-500 transition hover:bg-accent-100 hover:text-accent-700"
                    >
                      Load
                    </button>
                  </article>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase text-neutral-400">
                Carrier Matchmaking
              </h4>
              <div className="mt-3 space-y-3">
                {partners.map((partner) => (
                  <article
                    key={partner.id}
                    className="flex items-center justify-between rounded-xl border border-neutral-100 bg-white px-4 py-3 text-xs text-neutral-500 shadow-sm"
                  >
                    <div>
                      <p className="font-semibold text-neutral-700">
                        {partner.name}
                      </p>
                      <p>{partner.specialization}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-neutral-600">
                        ⭐ {partner.rating.toFixed(1)}
                      </p>
                      <p>{partner.coverageAreas[0]}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
