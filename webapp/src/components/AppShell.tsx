'use client';

import Image from "next/image";
import { useMemo, useState } from "react";
import { usePlatform } from "../context/PlatformContext";
import type { ModuleKey } from "../lib/types";
import modulesRegistry from "../modules";
import { AiAssistant } from "../modules/AiAssistant";

interface AppShellProps {
  activeModule: ModuleKey;
  onModuleChange: (module: ModuleKey) => void;
}

const themeSwatches: Record<string, string> = {
  Aurora: "from-primary-600 via-accent-500 to-primary-400",
  Midnight: "from-neutral-900 via-primary-700 to-neutral-800",
  Pearl: "from-neutral-100 via-white to-neutral-200",
};

const NullModule = () => null;

export function AppShell({ activeModule, onModuleChange }: AppShellProps) {
  const { modules, platformConfig, globalSearch } = usePlatform();
  const ModuleComponent = modulesRegistry[activeModule] ?? NullModule;
  const [search, setSearch] = useState("");
  const [aiOpen, setAiOpen] = useState(false);
  const suggestions = useMemo(
    () => (search ? globalSearch(search) : []),
    [search, globalSearch],
  );

  const colors =
    themeSwatches[platformConfig.theme] ?? themeSwatches["Aurora"];

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className={`brand-gradient ${colors} absolute inset-x-0 top-0 h-[320px]`} />
      <div className="relative z-10 mx-auto max-w-[1400px] px-6 pb-16 pt-10 lg:px-10">
        <header className="rounded-3xl border border-white/30 bg-white/40 p-6 shadow-xl backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Image
                src="/logo.svg"
                alt="SureSphere Atlas Logo"
                width={52}
                height={52}
                className="rounded-2xl border border-white/60 bg-white/80 p-2 shadow-md"
              />
              <div>
                <h1 className="font-heading text-2xl text-neutral-800">
                  {platformConfig.brandName}
                </h1>
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
                  Insurance Broking Control Center
                </p>
              </div>
            </div>
            <div className="flex flex-1 items-center justify-end gap-3 md:max-w-lg">
              <div className="relative flex-1">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder='Natural language search e.g. "Show Willowbrook quotes"'
                  className="w-full rounded-full border border-white/60 bg-white/80 px-5 py-3 text-sm text-neutral-700 shadow-inner outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100/70"
                />
                {suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-12 z-20 rounded-2xl border border-neutral-100 bg-white shadow-lg">
                    <ul className="divide-y divide-neutral-100 text-sm">
                      {suggestions.map((item) => (
                        <li
                          key={item.id}
                          className="cursor-pointer px-4 py-3 text-neutral-500 hover:bg-primary-50 hover:text-primary-700"
                          onClick={() => {
                            setSearch("");
                            setAiOpen(true);
                          }}
                        >
                          {item.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <button
                onClick={() => setAiOpen(true)}
                  className="hidden rounded-full bg-neutral-900 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-neutral-700 md:block"
                >
                  Atlas Copilot
                </button>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
            <span className="rounded-full bg-white/80 px-3 py-1 font-semibold text-neutral-600 shadow-sm">
              Theme · {platformConfig.theme}
            </span>
            <span className="rounded-full bg-white/80 px-3 py-1 font-semibold text-neutral-600 shadow-sm">
              Accent · {platformConfig.accentMode}
            </span>
            {Object.entries(platformConfig.toggles)
              .filter(([, value]) => value)
              .map(([toggle]) => (
                <span
                  key={toggle}
                  className="rounded-full bg-primary-50 px-3 py-1 font-semibold text-primary-700 shadow-sm"
                >
                  {toggle === "aiCopilot" ? "AI Copilot" : ""}
                  {toggle === "ocrExtraction" ? "Instant OCR" : ""}
                  {toggle === "predictiveAlerts" ? "Predictive Alerts" : ""}
                </span>
              ))}
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="space-y-4">
            <nav className="rounded-2xl border border-white/60 bg-white/70 p-3 shadow-lg backdrop-blur">
              <p className="px-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Navigation
              </p>
              <ul className="mt-3 space-y-2">
                {modules.map((module) => (
                  <li key={module.id}>
                    <button
                      onClick={() => onModuleChange(module.id)}
                      className={`w-full rounded-2xl px-4 py-3 text-left text-sm transition ${
                        activeModule === module.id
                          ? "bg-neutral-900 text-white shadow-lg"
                          : "bg-white/70 text-neutral-600 hover:bg-primary-50 hover:text-primary-700"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-lg">{module.icon}</span>
                        <span>
                          <span className="block font-semibold">{module.name}</span>
                          <span className="block text-[11px] text-neutral-400">
                            {module.description}
                          </span>
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            <section className="rounded-2xl border border-white/60 bg-white/70 p-4 text-sm text-neutral-600 shadow-lg backdrop-blur">
              <h3 className="font-heading text-base text-neutral-800">
                Quick Automations
              </h3>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <button
                  className="rounded-full border border-primary-200 bg-primary-50 px-3 py-2 font-semibold text-primary-700 transition hover:border-primary-300 hover:bg-primary-100"
                  onClick={() => onModuleChange("flowAutomator")}
                >
                  Build Renewal Plan
                </button>
                <button
                  className="rounded-full border border-primary-200 bg-primary-50 px-3 py-2 font-semibold text-primary-700 transition hover:border-primary-300 hover:bg-primary-100"
                  onClick={() => setAiOpen(true)}
                >
                  Open Atlas Copilot
                </button>
                <button
                  className="rounded-full border border-primary-200 bg-primary-50 px-3 py-2 font-semibold text-primary-700 transition hover:border-primary-300 hover:bg-primary-100"
                  onClick={() => onModuleChange("docuVault")}
                >
                  Upload Policy Pack
                </button>
              </div>
              <div className="mt-4 rounded-xl bg-neutral-50/80 px-3 py-3 text-[11px] text-neutral-500">
                Tip: Drag modules inside Control Studio to match your client workshop
                flow.
              </div>
            </section>
          </aside>

          <main className="space-y-4">
            <ModuleComponent />
          </main>
        </div>
      </div>
      <button
        onClick={() => setAiOpen((prev) => !prev)}
        className="fixed bottom-8 right-8 flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-neutral-700"
      >
        <span>Atlas Copilot</span>
        <span className="text-lg">✨</span>
      </button>
      {aiOpen && (
        <div className="fixed bottom-24 right-8 z-30 w-full max-w-md rounded-3xl border border-neutral-100 bg-white/90 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3">
            <div>
              <p className="font-heading text-sm text-neutral-800">Atlas Copilot</p>
              <p className="text-[11px] uppercase tracking-wide text-neutral-400">
                Conversational workspace intelligence
              </p>
            </div>
            <button
              onClick={() => setAiOpen(false)}
              className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-500 hover:bg-neutral-200"
            >
              Close
            </button>
          </div>
          <AiAssistant />
        </div>
      )}
    </div>
  );
}
