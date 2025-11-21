import { notFound } from "next/navigation";
import OmniConverter from "../../components/OmniConverter";
import { CONVERSION_PAGES } from "../../conversion-pages/config";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return CONVERSION_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const config = CONVERSION_PAGES.find((page) => page.slug === slug);
  if (!config) return {};

  return {
    title: config.title,
    description: config.description,
    openGraph: {
      title: config.title,
      description: config.description,
    },
  };
}

export default async function ConversionPage({ params }: PageProps) {
  const { slug } = await params;
  const config = CONVERSION_PAGES.find((page) => page.slug === slug);
  if (!config) {
    return notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <main className="mx-auto flex w-full max-w-3xl grow flex-col gap-8 px-4 py-16">
        <header className="space-y-3 text-center sm:text-left">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Converter Unlimited
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            {config.title}
          </h1>
          <p className="text-base text-slate-600">{config.description}</p>
        </header>

        <OmniConverter
          biasModuleId={config.biasModuleId}
          preferredAlwaysModuleId={config.alwaysPossibleModuleId}
          defaultValue={config.exampleInput}
        />
      </main>
    </div>
  );
}
