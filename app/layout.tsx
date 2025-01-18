import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bored Dog Club",
  description: "Bored Dog Club Website",
  keywords: ["bored", "dog", "club", "website"],
  authors: [{ name: "Bored Dog Club" }],
  creator: "Bored Dog Club",
  publisher: "Bored Dog Club",
  robots: "index, follow",
  themeColor: "#000000",
  viewport: "width=device-width, initial-scale=1",
  openGraph: {
    title: "Bored Dog Club",
    description: "Bored Dog Club Website",
    type: "website",
    siteName: "Bored Dog Club",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
