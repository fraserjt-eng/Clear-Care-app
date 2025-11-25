import './globals.css'

export const metadata = {
  title: 'Clear & Care - Conversation Coaching for Educators',
  description: 'Navigate difficult conversations with clarity and care using the Clear & Care framework.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
