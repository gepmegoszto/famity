import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'famity.hu – Biztonságos Digitális Kölcsönadási Felület',
  description: 'Hivatalos digitális átadás-átvételi jegyzőkönyv és kölcsönadási felület magánszemélyeknek és cégeknek.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hu">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans antialiased">
        {children}
        <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} famity.hu – Minden jog fenntartva.</p>
            <div className="flex gap-4">
              <a href="/aszf" className="hover:underline">ÁSZF</a>
              <a href="/adatvedelem" className="hover:underline">Adatvédelem</a>
              <a href="/cookie" className="hover:underline">Cookie szabályzat</a>
              <a href="/biztonsag" className="hover:underline">Biztonsági instrukciók</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
