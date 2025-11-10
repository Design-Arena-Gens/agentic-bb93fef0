'use client';

import { useState } from "react";
import { usePlatform } from "../context/PlatformContext";
import type { ComplianceTask } from "../lib/types";

interface TaskFormState {
  id?: string;
  title: string;
  owner: string;
  dueDate: string;
  status: ComplianceTask["status"];
  riskLevel: ComplianceTask["riskLevel"];
}

const defaultTask: TaskFormState = {
  title: "",
  owner: "",
  dueDate: "",
  status: "Open",
  riskLevel: "Medium",
};

export function ComplianceSentinel() {
  const { complianceTasks, upsertComplianceTask } = usePlatform();
  const [form, setForm] = useState<TaskFormState>(defaultTask);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const record = upsertComplianceTask({
      id: form.id,
      title: form.title,
      owner: form.owner,
      dueDate: form.dueDate,
      status: form.status,
      riskLevel: form.riskLevel,
    });
    setMessage(
      record.id === form.id
        ? "Compliance item updated."
        : "Compliance item logged.",
    );
    setForm(defaultTask);
  };

  const loadTask = (task: ComplianceTask) => {
    setForm({
      id: task.id,
      title: task.title,
      owner: task.owner,
      dueDate: task.dueDate,
      status: task.status,
      riskLevel: task.riskLevel,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="glass-panel p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl text-neutral-800">
            Compliance Sentinel
          </h2>
          <p className="text-sm text-neutral-500">
            Maintain audit readiness with a living checklist and SLA tracking.
          </p>
        </div>
        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-500">
          {complianceTasks.filter((task) => task.riskLevel === "High").length} high risk
        </span>
      </header>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-neutral-100 bg-white/80 p-5 shadow-sm"
        >
          <h3 className="font-heading text-lg text-neutral-800">
            {form.id ? "Update Task" : "Add Task"}
          </h3>
          <div className="mt-4 grid gap-3">
            <label className="text-xs font-semibold uppercase text-neutral-400">
              Title
              <input
                value={form.title}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, title: event.target.value }))
                }
                placeholder="Annual carrier due-diligence pack"
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100/70"
                required
              />
            </label>
            <label className="text-xs font-semibold uppercase text-neutral-400">
              Owner
              <input
                value={form.owner}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, owner: event.target.value }))
                }
                placeholder="Compliance Desk"
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100/70"
                required
              />
            </label>
            <label className="text-xs font-semibold uppercase text-neutral-400">
              Due Date
              <input
                type="date"
                value={form.dueDate}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, dueDate: event.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100/70"
                required
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold uppercase text-neutral-400">
                Status
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      status: event.target.value as TaskFormState["status"],
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100/70"
                >
                  <option value="Open">Open</option>
                  <option value="In Review">In Review</option>
                  <option value="Complete">Complete</option>
                </select>
              </label>
              <label className="text-xs font-semibold uppercase text-neutral-400">
                Risk Level
                <select
                  value={form.riskLevel}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      riskLevel: event.target.value as TaskFormState["riskLevel"],
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100/70"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </label>
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
          >
            {form.id ? "Save Task" : "Add Task"}
          </button>
          {message && (
            <p className="mt-3 rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary-800">
              {message}
            </p>
          )}
        </form>

        <div className="space-y-3">
          {complianceTasks.map((task) => (
            <article
              key={task.id}
              className="group rounded-2xl border border-neutral-100 bg-white/80 p-5 shadow-sm transition hover:border-primary-200 hover:shadow-md"
            >
              <header className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-lg text-neutral-800">
                    {task.title}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Owner {task.owner} · Due {task.dueDate}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 text-xs font-semibold">
                  <span
                    className={`rounded-full px-3 py-1 ${
                      task.status === "Complete"
                        ? "bg-emerald-100 text-emerald-600"
                        : task.status === "In Review"
                          ? "bg-amber-100 text-amber-600"
                          : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {task.status}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 ${
                      task.riskLevel === "High"
                        ? "bg-red-100 text-red-500"
                        : task.riskLevel === "Medium"
                          ? "bg-amber-100 text-amber-600"
                          : "bg-emerald-100 text-emerald-600"
                    }`}
                  >
                    {task.riskLevel} risk
                  </span>
                </div>
              </header>
              <footer className="mt-4 flex items-center justify-between text-xs text-neutral-400">
                <span>
                  AI alert:{" "}
                  <span className="font-semibold text-neutral-600">
                    {task.riskLevel === "High"
                      ? "Escalate to COO for review."
                      : task.status === "Complete"
                        ? "Archive with compliance binder."
                        : "Schedule internal QA audit."}
                  </span>
                </span>
                <button
                  onClick={() => loadTask(task)}
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
