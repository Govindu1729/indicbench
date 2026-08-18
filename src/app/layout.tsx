import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "IndicBench — India's AI Benchmark Suite",
  description: "India's first comprehensive AI benchmark suite evaluating LLMs on Legal, Healthcare, Fintech, Vernacular & Education tasks. Built at IIT Gandhinagar for the IndiaAI Mission.",
  keywords: ["IndicBench", "AI Benchmark", "India", "LLM", "Legal AI", "Healthcare AI", "Fintech AI", "Indian Languages", "Education AI", "IIT Gandhinagar", "IndiaAI Mission"],
  authors: [{ name: "IndicBench Team, IIT Gandhinagar" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "IndicBench — India's AI Benchmark Suite",
    description: "Evaluating AI models on India-specific tasks across Legal, Healthcare, Fintech, Vernacular & Education domains",
    url: "https://indicbench.iitgn.ac.in",
    siteName: "IndicBench",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IndicBench — India's AI Benchmark Suite",
    description: "Evaluating AI models on India-specific tasks across Legal, Healthcare, Fintech, Vernacular & Education domains",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange={false}>
          {children}
        </ThemeProvider>
        <Toaster />
        <SonnerToaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#111118",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#f5f5f7",
            },
          }}
        />
      </body>
    </html>
  );
}
