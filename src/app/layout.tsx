import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Billy\'s RSVP',
  description: 'RSVP for Billy\'s New Year 2026 Event',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.cdnfonts.com/css/coca-cola-ii" rel="stylesheet" />
      </head>
      <body className="min-h-screen min-h-dvh bg-gradient-to-b from-red-500 to-red-700">
        {children}
      </body>
    </html>
  )
} 