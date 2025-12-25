import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import localFont from "next/font/local"

import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { CartProvider } from "@/components/cart/cart-context"

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

// Local font (Swell)
const swell = localFont({
  src: "./fonts/swell-regular.otf",
  variable: "--font-swell",
  display: "swap",
})

// Local font (Swell)
const calsans = localFont({
  src: "./fonts/CalSans-Regular.ttf",
  variable: "--font-calsans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "mernin' Coffee: Instant",
  description: "Instant coffee processor",
  generator: "v0.app",
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
          "font-sans antialiased",
        ].join(" ")}
      >
        <CartProvider>{children}</CartProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
