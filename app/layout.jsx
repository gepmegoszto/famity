import './globals.css';

export const metadata = {
  title: 'famity.hu – Biztonságos Digitális Kölcsönadási Felület',
  description: 'Hivatalos digitális átadás-átvételi jegyzőkönyv és kölcsönadási felület magánszemélyeknek és cégeknek.',
};
export default function RootLayout({ children }) {
  return (
    <html lang="hu">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans antialiased">
        {children}
        <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} famity.hu – Minden jog fenntartva.                  e-mail: info@famity.hu</p>
            <div className="flex gap-4">
              <a href="/aszf" className="hover:underline"></a>
              <a href="/adatvedelem" className="hover:underline"></a>
              <a href="/cookie" className="hover:underline"></a>
              <a href="/biztonsag" className="hover:underline"></a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}


