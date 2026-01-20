import { AuthProvider } from "@/lib/context/auth-context";
import { QueryProvider } from "@/lib/providers/query-provider";
import type { Metadata } from "next";
import { Noto_Sans_Arabic } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "HR Management System",
  description: "Employee & Attendance Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body className={notoArabic.className}>
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-center" richColors />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
