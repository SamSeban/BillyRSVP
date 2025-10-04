import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bar Mitzvah de Billy',
  description: 'RSVP pour la Bar Mitzvah de Billy',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-[100%] m-0 p-0">
      <head>
        <link href="https://fonts.cdnfonts.com/css/coca-cola-ii" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="min-h-screen min-h-dvh h-[100%] m-0 p-0">
        {children}
      </body>
    </html>
  )
} 