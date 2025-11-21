import OmniConverter from "../components/OmniConverter";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <main className="mx-auto flex w-full max-w-3xl grow flex-col gap-8 px-4 py-16">
        <header className="space-y-3 text-center sm:text-left">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Converter Unlimited
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            Convert anything in one paste
          </h1>
          <p className="text-base text-slate-600">
            Drop in colors, weights, JWTs, and more. We auto-detect the format,
            show rich previews (like color swatches), and give you the exact values to copy.
          </p>
        </header>

        <OmniConverter />
      </main>
    </div>
  );
}
