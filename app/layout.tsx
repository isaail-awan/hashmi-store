import { Navbar } from "@/components/Navbar";
import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { PwaRegister } from "@/components/PwaRegister";
import { WishlistSync } from "@/components/WishlistSync";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Hashmi Store — Premium Essentials, Delivered in Pindi",
  description:
    "Rawalpindi ka apna online kiryana store. Grocery, household aur roz-marra ki zaroriyat, seedha aapke darwaze par.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Hashmi Store",
  },
};

export const viewport: Viewport = {
  themeColor: "#17281b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <PwaRegister />
        <WishlistSync />
        <Navbar />
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            classNames: {
              toast:
                "bg-card rounded-full px-6 py-4 shadow-2xl font-sans text-ink font-bold flex items-center gap-3 border-2 border-border",
              success: "border-leaf",
              error: "border-chili",
            },
          }}
        />
      </body>
    </html>
  );
}
