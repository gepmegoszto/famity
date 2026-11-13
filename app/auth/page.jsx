'use client';
import { useState } from 'react';
import { auth } from '../../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');

    if (isRegister && password !== confirmPassword) {
      setError('A két jelszó nem egyezik meg!');
      return;
    }

    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Hiba történt a hitelesítés során.');
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">
          {isRegister ? 'Fiók létrehozása' : 'Bejelentkezés'}
        </h1>
        <p className="text-sm text-slate-600 mb-6 text-center">
          A kölcsönadási jegyzőkönyvek kitöltéséhez jelentkezz be.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email cím</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="pelda@email.hu"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Jelszó</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="••••••••"
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Jelszó ismét</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="••••••••"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow transition"
          >
            {isRegister ? 'Regisztráció' : 'Belépés'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-blue-600 hover:underline font-medium"
          >
            {isRegister ? 'Már van fiókod? Lépj be!' : 'Nincs még fiókod? Regisztrálj!'}
          </button>
        </div>
      </div>
    </main>
  );
}
