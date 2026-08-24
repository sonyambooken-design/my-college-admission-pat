import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My College Admission Path",
  description: "Personalized college discovery, major exploration, medical pathways, and admissions planning."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
