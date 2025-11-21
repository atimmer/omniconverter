import Script from "next/script";
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "../components/Providers";

export const metadata: Metadata = {
  title: "Converter Unlimited",
  description:
    "Convert CSS colors (hex, rgb(a), hsl(a), and named) to RGB and Hex instantly.",
};

const isProduction = process.env.NODE_ENV === "production";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {isProduction ? (
          <Script
            data-domain="omniconverter.dev"
            src="https://plausible.io/js/script.js"
          />
        ) : null}
      </head>
      <body className="min-h-screen bg-slate-100 text-slate-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
