import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Notes App",
  description: "A simple notes app with minimal UI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <div className="flex flex-col min-h-screen">
          <header className="flex items-center h-16 border-b border-gray-200 bg-background px-4 md:px-8">
            <h1 className="text-xl font-semibold text-primary tracking-tight">Notes</h1>
          </header>
          <div className="flex flex-1 min-h-0">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
