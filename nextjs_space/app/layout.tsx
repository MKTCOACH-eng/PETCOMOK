import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { PetBotWidget } from '@/components/petbot-widget';

const inter = Inter({ subsets: ['latin'] });

const SITE_URL = process.env.NEXTAUTH_URL || 'https://petcom.mx';
const FAVICON_URL = 'https://yxdamvwvnbkukcyzcemx.supabase.co/storage/v1/object/public/LOGO/FAV.png';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#7baaf7',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'PETCOM - Tienda Premium para Mascotas | México',
    template: '%s | PETCOM',
  },
  description: 'La tienda online #1 de México para mascotas. Productos premium para perros, gatos, aves y mascotas pequeñas. Envío gratis en compras mayores a $799. ¡Compra ahora!',
  keywords: [
    'tienda mascotas México',
    'productos para perros',
    'productos para gatos',
    'alimento mascotas premium',
    'accesorios mascotas',
    'juguetes para perros',
    'camas para gatos',
    'tienda online mascotas',
    'PETCOM',
    'envío gratis mascotas',
  ],
  authors: [{ name: 'PETCOM México' }],
  creator: 'PETCOM',
  publisher: 'PETCOM México',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: FAVICON_URL, type: 'image/png' },
    ],
    shortcut: FAVICON_URL,
    apple: FAVICON_URL,
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: SITE_URL,
    siteName: 'PETCOM',
    title: 'PETCOM - Tienda Premium para Mascotas | México',
    description: 'La tienda online #1 de México para mascotas. Productos premium para perros, gatos, aves y mascotas pequeñas. Envío gratis +$799.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PETCOM - Tienda Premium para Mascotas',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PETCOM - Tienda Premium para Mascotas',
    description: 'La tienda online #1 de México para mascotas. Productos premium y envío gratis +$799.',
    images: ['/og-image.png'],
    creator: '@petcommx',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  alternates: {
    canonical: SITE_URL,
  },
  category: 'ecommerce',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js"></script>
        <link rel="icon" href="https://yxdamvwvnbkukcyzcemx.supabase.co/storage/v1/object/public/LOGO/FAV.png" type="image/png" />
        <link rel="apple-touch-icon" href="https://yxdamvwvnbkukcyzcemx.supabase.co/storage/v1/object/public/LOGO/FAV.png" />
      </head>
      <body className={`${inter.className} bg-white text-gray-900 antialiased`}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <PetBotWidget />
        </Providers>
      </body>
    </html>
  );
}
