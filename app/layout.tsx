import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { DataProvider } from "@/lib/contexts/DataContext";
import { ValidationProvider } from "@/lib/contexts/ValidationContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Data Alchemist - AI Resource Allocation Configurator",
  description:
    "Transform messy spreadsheets into intelligent resource allocation with AI-powered validation and rule generation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DataProvider>
          <ValidationProvider>
            {children}
            <Toaster />
          </ValidationProvider>
        </DataProvider>
      </body>
    </html>
  );
}
