import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Script from 'next/script';

export const metadata = {
  title: 'famity.hu — Családi Vezérlőpult',
  description: 'Közös családi naptár, élő bevásárlólista, heti menüterv és teendők egy helyen.',
  icons: {
    icon: '/icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="hu" className="light" style={{ colorScheme: 'light' }}>
      <head>
        {/* Google AdSense Globális Szkript */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="bg-[#FAF8F4] text-slate-900 antialiased selection:bg-blue-500 selection:text-white">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
