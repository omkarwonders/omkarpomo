import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pomodoro — Stay Focused",
  description:
    "A minimal, aesthetic Pomodoro timer with focus and break modes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
