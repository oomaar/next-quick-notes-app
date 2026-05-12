import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "./components/layout/navbar";
import { Sidebar } from "./components/layout/sidebar";
import { ThemeProvider } from "./providers/theme-provider";
import { themeInitScript } from "./providers/theme-init-script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Quick Notes",
    template: "%s · Quick Notes",
  },
  description: "Jot down notes and check off tasks — fast.",
  applicationName: "Quick Notes",
  keywords: ["notes", "tasks", "todo", "productivity"],
  openGraph: {
    title: "Quick Notes",
    description: "Jot down notes and check off tasks — fast.",
    type: "website",
    siteName: "Quick Notes",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
          suppressHydrationWarning
        />
      </head>
      <body className="h-dvh overflow-hidden font-sans">
        <ThemeProvider>
          <div className="flex h-full flex-col">
            <Navbar />
            <div className="flex min-h-0 flex-1">
              <Sidebar />
              <main className="flex-1 overflow-auto">{children}</main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
