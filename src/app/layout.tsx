import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Converter Unlimited",
  description:
    "Convert CSS colors (hex, rgb(a), hsl(a), and named) to RGB and Hex instantly.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-100 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
