import type { Metadata } from "next";
import "./globals.css";
import Provider from "@/provider";
import StoreProvider from "@/redux/StoreProvider";
import InitUser from "@/InitUser";
import { Toaster } from "react-hot-toast";

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
      <body className="w-full min-h-screen bg-linear-to-b from-gray-100">
        <Provider>
          <StoreProvider>
            <InitUser/>
            <Toaster position="top-right" toastOptions={{ duration: 3000 }}/>
            {children}
          </StoreProvider>
        </Provider>
      </body>
    </html>
  );
}
