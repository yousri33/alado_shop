import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: {
    default: 'Alado Shop | ألادو ستور',
    template: '%s | Alado Shop'
  },
  description: 'متجر ألادو – أفضل المنتجات بأسعار رائعة مع توصيل سريع لجميع ولايات الجزائر. Livraison rapide dans toute l\'Algérie.',
  keywords: ['متجر', 'ألادو', 'جزائر', 'ترمس', 'alado', 'algerie', 'livraison'],
  openGraph: {
    siteName: 'Alado Shop',
    locale: 'ar_DZ',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
