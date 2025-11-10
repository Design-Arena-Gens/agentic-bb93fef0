'use client';

import { useMemo, useState } from "react";
import { usePlatform } from "../context/PlatformContext";
import type { PlatformConfig } from "../lib/types";

export function ControlStudio() {
  const { platformConfig, updatePlatformConfig, modules, reorderModules } =
    usePlatform();
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const themeOptions = useMemo(
    () => [
      { id: "Aurora", label: "Aurora Teal" },
      { id: "Midnight", label: "Midnight Sapphire" },
      { id: "Pearl", label: "Pearlescent Light" },
    ],
    [],
  );

  const accentModeOptions = useMemo(
    () => [
      { id: "Teal", label: "Teal Pulse" },
      { id: "Violet", label: "Violet Beacon" },
    ],
    [],
  );

  const handleDragStart = (index: number) => {
    setDraggingIndex(index);
  };

  const handleDrop = (index: number) => {
    if (draggingIndex === null || draggingIndex === index) return;
    reorderModules(draggingIndex, index);
    setDraggingIndex(null);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleThemeChange = (value: string) => {
    updatePlatformConfig({ theme: value as PlatformConfig["theme"] });
  };

  const handleAccentChange = (value: string) => {
    updatePlatformConfig({ accentMode: value as PlatformConfig["accentMode"] });
  };

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl text-neutral-800">
            Control Studio
          </h2>
          <p className="text-sm text-neutral-500">
            Organize modules, manage branding, and toggle intelligence layers
            without writing code.
          </p>
        </div>
        <button
          className="rounded-full border border-primary-200 px-4 py-2 text-sm font-semibold text-primary-700 transition hover:border-primary-400 hover:bg-primary-50"
          onClick={() => setPreviewMode((prev) => !prev)}
        >
          {previewMode ? "Hide UI Blueprint" : "Preview UI Blueprint"}
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section className="rounded-2xl border border-neutral-100 bg-white/70 p-5 shadow-sm">
          <header className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-lg text-neutral-800">
                Drag & Reorder Modules
              </h3>
              <p className="text-sm text-neutral-500">
                Rearrange navigation instantly. The new order is live
                everywhere.
              </p>
            </div>
            <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
              Live Reflow
            </span>
          </header>
          <div className="mt-4 grid gap-3">
            {modules.map((module, index) => (
              <div
                key={module.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(index)}
                className={`flex cursor-move items-center justify-between rounded-xl border border-dashed border-neutral-200 bg-white px-4 py-3 transition hover:border-primary-300 hover:shadow-md ${draggingIndex === index ? "border-primary-400 bg-primary-50" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{module.icon}</span>
                  <div>
                    <p className="font-medium text-neutral-700">
                      {module.name}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {module.description}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs uppercase text-neutral-500">
                  #{index + 1}
                </span>
              </div>
            ))}
          </div>
        </section>

        <aside className="grid gap-4">
          <div className="rounded-2xl border border-neutral-100 bg-white/80 p-5">
            <h3 className="font-heading text-lg text-neutral-800">
              Branding Palette
            </h3>
            <p className="text-sm text-neutral-500">
              Flip between curated experiences tuned for brokers.
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold uppercase text-neutral-400">
                  Theme DNA
                </label>
                <div className="mt-2 flex gap-2">
                  {themeOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleThemeChange(option.id)}
                      className={`flex-1 rounded-xl border px-3 py-3 text-sm font-medium transition ${platformConfig.theme === option.id ? "border-primary-400 bg-primary-50 text-primary-700" : "border-neutral-100 bg-white text-neutral-500 hover:border-primary-200 hover:text-primary-600"}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-neutral-400">
                  Accent Pulse
                </label>
                <div className="mt-2 flex gap-2">
                  {accentModeOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleAccentChange(option.id)}
                      className={`flex-1 rounded-xl border px-3 py-3 text-sm font-medium transition ${platformConfig.accentMode === option.id ? "border-accent-400 bg-accent-50 text-accent-700" : "border-neutral-100 bg-white text-neutral-500 hover:border-accent-200 hover:text-accent-600"}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-100 bg-white/80 p-5">
            <h3 className="font-heading text-lg text-neutral-800">
              Intelligence Layers
            </h3>
            <p className="text-sm text-neutral-500">
              Toggle AI assists. Updates propagate across every module.
            </p>
            <div className="mt-4 space-y-3">
              {Object.entries(platformConfig.toggles).map(([key, value]) => (
                <label
                  key={key}
                  className="flex items-center justify-between rounded-xl border border-neutral-100 bg-white px-4 py-3 text-sm shadow-sm transition hover:border-primary-200"
                >
                  <div>
                    <p className="font-semibold text-neutral-700">
                      {key === "aiCopilot" && "Atlas Copilot"}
                      {key === "ocrExtraction" && "Instant OCR"}
                      {key === "predictiveAlerts" && "Predictive Alerts"}
                      {key === "sandboxMode" && "Sandbox Mode"}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {value
                        ? "Enabled across workspace."
                        : "Currently disabled."}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(event) =>
                      updatePlatformConfig({
                        toggles: { [key]: event.target.checked },
                      })
                    }
                    className="h-5 w-10 cursor-pointer accent-primary-500"
                  />
                </label>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {previewMode && (
        <div className="mt-6 rounded-2xl border border-primary-100 bg-primary-50/60 p-6 text-sm text-primary-800">
          <h4 className="font-heading text-lg">UI Blueprint</h4>
          <p className="mt-1 max-w-2xl">
            Preview shows live module order, theme moodboard and toggles. Use it
            during client workshops to co-design the workspace in real time.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
            {platformConfig.moduleOrder.map((moduleKey) => (
              <span
                key={moduleKey}
                className="rounded-full bg-white px-3 py-1 text-neutral-500 shadow-sm"
              >
                {modules.find((mod) => mod.id === moduleKey)?.name ?? moduleKey}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
