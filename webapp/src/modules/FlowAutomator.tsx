'use client';

import { useState } from "react";
import { usePlatform } from "../context/PlatformContext";
import type { Workflow } from "../lib/types";

interface WorkflowFormState {
  id?: string;
  name: string;
  trigger: string;
  active: boolean;
  steps: Array<{ id: string; title: string; owner: string; sla: string }>;
}

const defaultWorkflow: WorkflowFormState = {
  name: "",
  trigger: "",
  active: true,
  steps: [
    { id: "step-1", title: "", owner: "", sla: "" },
    { id: "step-2", title: "", owner: "", sla: "" },
  ],
};

export function FlowAutomator() {
  const { workflows, upsertWorkflow } = usePlatform();
  const [form, setForm] = useState<WorkflowFormState>(defaultWorkflow);
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const record = upsertWorkflow({
      id: form.id,
      name: form.name,
      trigger: form.trigger,
      active: form.active,
      steps: form.steps,
    });
    setStatus(
      record.id === form.id
        ? "Workflow updated and synced."
        : "Workflow published to Atlas Automations.",
    );
    setForm(defaultWorkflow);
  };

  const updateStep = (index: number, key: "title" | "owner" | "sla", value: string) => {
    setForm((prev) => {
      const steps = [...prev.steps];
      steps[index] = { ...steps[index], [key]: value };
      return { ...prev, steps };
    });
  };

  const addStep = () => {
    setForm((prev) => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          id: `step-${prev.steps.length + 1}`,
          title: "",
          owner: "",
          sla: "",
        },
      ],
    }));
  };

  const loadWorkflow = (workflow: Workflow) => {
    setForm({
      id: workflow.id,
      name: workflow.name,
      trigger: workflow.trigger,
      active: workflow.active,
      steps: workflow.steps,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="glass-panel p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl text-neutral-800">
            Flow Automator
          </h2>
          <p className="text-sm text-neutral-500">
            Drag-free automation builder for onboarding, claims, and renewals.
          </p>
        </div>
        <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
          {workflows.length} live flows
        </span>
      </header>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-neutral-100 bg-white/80 p-5 shadow-sm"
        >
          <h3 className="font-heading text-lg text-neutral-800">
            {form.id ? "Update Flow" : "Create Automation"}
          </h3>
          <div className="mt-4 grid gap-3">
            <label className="text-xs font-semibold uppercase text-neutral-400">
              Flow Name
              <input
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Large Account Onboarding"
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-accent-400 focus:ring-4 focus:ring-accent-100/70"
                required
              />
            </label>
            <label className="text-xs font-semibold uppercase text-neutral-400">
              Trigger
              <input
                value={form.trigger}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, trigger: event.target.value }))
                }
                placeholder="New client > $1M premium"
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-accent-400 focus:ring-4 focus:ring-accent-100/70"
                required
              />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3 text-xs font-semibold text-neutral-500">
              Active Flow
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, active: event.target.checked }))
                }
                className="h-5 w-10 accent-primary-500"
              />
            </label>
          </div>
          <div className="mt-4 space-y-3">
            {form.steps.map((step, index) => (
              <div
                key={step.id}
                className="rounded-xl border border-neutral-100 bg-white px-4 py-4 text-sm text-neutral-600 shadow-sm"
              >
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>Step {index + 1}</span>
                  <span className="font-semibold text-neutral-600">
                    SLA {step.sla || "—"}
                  </span>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-3">
                  <input
                    value={step.title}
                    onChange={(event) => updateStep(index, "title", event.target.value)}
                    placeholder="Underwriting intake"
                    className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-accent-400 focus:ring-4 focus:ring-accent-100/70"
                    required
                  />
                  <input
                    value={step.owner}
                    onChange={(event) => updateStep(index, "owner", event.target.value)}
                    placeholder="Underwriting Desk"
                    className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-accent-400 focus:ring-4 focus:ring-accent-100/70"
                    required
                  />
                  <input
                    value={step.sla}
                    onChange={(event) => updateStep(index, "sla", event.target.value)}
                    placeholder="24 hrs"
                    className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-accent-400 focus:ring-4 focus:ring-accent-100/70"
                    required
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addStep}
              className="w-full rounded-full border border-dashed border-accent-300 px-4 py-2 text-sm font-semibold text-accent-600 transition hover:border-accent-400 hover:bg-accent-50"
            >
              + Add Step
            </button>
          </div>
          <button
            type="submit"
            className="mt-4 rounded-full bg-accent-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700"
          >
            {form.id ? "Update Flow" : "Publish Flow"}
          </button>
          {status && (
            <p className="mt-3 rounded-xl bg-accent-50 px-4 py-3 text-sm text-accent-700">
              {status}
            </p>
          )}
        </form>

        <div className="space-y-3">
          {workflows.map((workflow) => (
            <article
              key={workflow.id}
              className="group rounded-2xl border border-neutral-100 bg-white/80 p-5 shadow-sm transition hover:border-accent-200 hover:shadow-md"
            >
              <header className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-lg text-neutral-800">
                    {workflow.name}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Trigger · {workflow.trigger}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    workflow.active
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-neutral-100 text-neutral-400"
                  }`}
                >
                  {workflow.active ? "Active" : "Paused"}
                </span>
              </header>
              <ol className="mt-3 space-y-2 text-sm text-neutral-600">
                {workflow.steps.map((step, index) => (
                  <li
                    key={step.id}
                    className="rounded-xl bg-neutral-50 px-4 py-2 text-xs text-neutral-500"
                  >
                    <span className="font-semibold text-neutral-600">
                      {index + 1}. {step.title}
                    </span>{" "}
                    · {step.owner} · SLA {step.sla}
                  </li>
                ))}
              </ol>
              <footer className="mt-4 flex items-center justify-between text-xs text-neutral-400">
                <span>
                  Automations running:{" "}
                  <span className="font-semibold text-neutral-600">
                    {workflow.active ? "Real-time" : "On Hold"}
                  </span>
                </span>
                <button
                  onClick={() => loadWorkflow(workflow)}
                  className="opacity-0 transition group-hover:opacity-100"
                >
                  <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-500">
                    Edit
                  </span>
                </button>
              </footer>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
