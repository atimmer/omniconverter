"use client";

import { useEffect, useMemo, useState } from "react";

type SuggestionFormProps = {
  input: string;
  variant?: "standalone" | "inline";
  title?: string;
};

export function SuggestionForm({
  input,
  variant = "standalone",
  title,
}: SuggestionFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [expectedOutput, setExpectedOutput] = useState("");

  const trimmedInput = useMemo(() => input.trim(), [input]);

  useEffect(() => {
    setShowForm(false);
    setExpectedOutput("");
  }, [trimmedInput]);

  const handleSuggestionSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const subject = "Converter suggestion";
    const body = `Input: ${input || "(empty)"}\nExpected output: ${expectedOutput || "(empty)"}`;
    const mailtoLink = `mailto:converter-suggestion@24letters.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoLink;
  };

  if (trimmedInput.length === 0) return null;

  const isInline = variant === "inline";

  const containerClasses = isInline
    ? "space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
    : "space-y-4 rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm";

  const header = title ?? "Missing a converter or output?";

  return (
    <div className={containerClasses}>
      {isInline ? null : <p>We couldn&apos;t detect that input yet.</p>}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm font-medium text-slate-800">{header}</div>
        <button
          type="button"
          onClick={() => setShowForm((previous) => !previous)}
          aria-expanded={showForm}
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 active:translate-y-px"
        >
          Give a suggestion
        </button>
      </div>

      {showForm ? (
        <form
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          onSubmit={handleSuggestionSubmit}
        >
          <div className="space-y-2 text-sm text-slate-700">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Input
              </label>
              <textarea
                readOnly
                aria-readonly
                value={input}
                className="h-20 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Expected output
              </label>
              <textarea
                required
                value={expectedOutput}
                onChange={(event) => setExpectedOutput(event.target.value)}
                placeholder="Tell us what you expected to see here."
                className="h-28 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-800 shadow-inner"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:translate-y-px"
            >
              Send suggestion
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
