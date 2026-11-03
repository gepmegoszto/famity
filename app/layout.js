import '@/app/globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'Famity.hu — Családi Vezérlőpult',
  description: 'Közös naptár, programtervező és hírolvasó a családnak.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="hu">
      <body className="bg-slate-50 text-slate-900 min-h-screen">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
