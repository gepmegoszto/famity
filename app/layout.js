import { Inter } from 'next/font/google';
import Script from 'next/script'; // Importáld a Script komponenst
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'famity.hu — Családi Vezérlőpult',
  description: 'A család közös élete együtt, egyetlen helyen.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="hu">
      <head>
        {/* Google AdSense Kód */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2881984231378190"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
