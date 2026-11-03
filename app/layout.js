import './globals.css';

export const metadata = {
  title: 'famity.hu — Családi Vezérlőpult',
  description: 'Közös családi naptár, élő bevásárlólista, heti menüterv és teendők egy helyen.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="hu" className="light" style={{ colorScheme: 'light' }}>
      <body className="bg-slate-50 text-slate-900 antialiased selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
