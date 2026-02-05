import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PETCOM - Tienda Premium para Mascotas',
  description: 'Tu tienda de confianza para todo lo que tu mascota necesita. Productos premium para perros, gatos y más.',
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
        <script src="https://api.abacus.ai/api/v0/getChatBotWidgetSDKLink?externalApplicationId=6b3291c6" async></script>
      </head>
      <body className={`${inter.className} bg-white text-gray-900 antialiased`}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
