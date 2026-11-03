import type { Metadata, Viewport } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "side/b · Records",
  description: "A catalogue of records, one disc at a time.",
}

export const viewport: Viewport = {
  themeColor: "#f1efeb",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="h-full w-full">{children}</body>
    </html>
  )
}
