import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import localFont from "next/font/local"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { CartProvider } from "@/components/cart/cart-context"
import { WebVitals } from "@/components/analytics/web-vitals"
import { client } from "@/cms/lib/client"
import { SITE_SETTINGS_QUERY } from "@/cms/lib/queries"

// Google fonts
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
})

import { Plus_Jakarta_Sans, IBM_Plex_Mono, Lora, Plus_Jakarta_Sans as V0_Font_Plus_Jakarta_Sans, IBM_Plex_Mono as V0_Font_IBM_Plex_Mono, Lora as V0_Font_Lora } from 'next/font/google'

// Initialize fonts
const _plusJakartaSans = V0_Font_Plus_Jakarta_Sans({ subsets: ['latin'], weight: ["200","300","400","500","600","700","800"] })
const _ibmPlexMono = V0_Font_IBM_Plex_Mono({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700"] })
const _lora = V0_Font_Lora({ subsets: ['latin'], weight: ["400","500","600","700"] })

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-mono",
})

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
})

// Local fonts
const swell = localFont({
  src: "./fonts/swell-regular.otf",
  variable: "--font-swell",
  display: "swap",
})

const calsans = localFont({
  src: "./fonts/CalSans-Regular.ttf",
  variable: "--font-calsans",
  display: "swap",
})

export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await client.fetch(SITE_SETTINGS_QUERY, {
    next: { revalidate: 60 },
  })

  return {
    title: siteSettings?.siteName || "Mernin' Coffee",
    description: siteSettings?.siteDescription || "Small batch premium coffee",
    generator: "v0.app",
    icons: {
      icon: siteSettings?.faviconUrl || "/favicon.ico",
      apple: siteSettings?.appleTouchIconUrl || "/apple-touch-icon.png",
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={[
          plusJakartaSans.variable,
          ibmPlexMono.variable,
          lora.variable,
          swell.variable,
          calsans.variable,
          "font-sans antialiased",
        ].join(" ")}
      >
        <CartProvider>{children}</CartProvider>
        <Toaster />
        <Analytics />
        <WebVitals />
      </body>
    </html>
  )
}
