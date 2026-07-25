import type { Metadata } from "next";
import { Outfit, Roboto_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI HR Interview Coach",
  description: "Practice mock HR interviews with AI face analysis, speech recognition, and personalized feedback.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${robotoMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#050505] text-slate-200 selection:bg-violet-500/30 selection:text-white">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
