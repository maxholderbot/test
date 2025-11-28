import type React from "react"
import type { Metadata } from "next"
import { Providers } from "./providers"
import "./globals.css"
import DynamicFavicon from "./components/DynamicFavicon"
import { getMetadataConfig } from "@/lib/metadata-config"

const config = getMetadataConfig()

export const metadata: Metadata = {
  title: `${config.botName} - Discord Bot`,
  description: config.description,
  icons: {
    icon: [
      { url: config.favicon, type: "image/png" },
      { url: config.botLogo, type: "image/png", sizes: "512x512" },
    ],
    apple: config.botLogo,
  },
  openGraph: {
    title: `${config.botName} - Discord Bot`,
    description: config.description,
    type: "website",
    url: config.discordServerInvite,
    images: [
      {
        url: config.image,
        width: 256,
        height: 256,
        alt: config.botName,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: `${config.botName} - Discord Bot`,
    description: config.description,
    images: [config.image],
    creator: "@discord",
  },
  generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <DynamicFavicon />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
