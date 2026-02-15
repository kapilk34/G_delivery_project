import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "G_Delivery Project",
  description: "Grocery Delivery Project with with three Dashboards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="w-full min-h-screen bg-linear-to-b from-green-100">
        {children}
      </body>
    </html>
  );
}
