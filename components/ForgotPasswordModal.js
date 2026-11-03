'use client';
import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { X, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', msg: '' });
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setStatus({
        type: 'success',
        msg: 'A jelszó-visszaállító hivatkozást kiküldtük az e-mail címedre! Ellenőrizd a fiókodat.'
      });
      setEmail('');
    } catch (err) {
      console.error(err);
      setStatus({
        type: 'error',
        msg: 'Nem található fiók ezzel az e-mail címmel, vagy hiba történt a küldés során.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
        
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-slate-900">Elfelejtett jelszó?</h3>
          <p className="text-xs text-slate-500 mt-1">
            Add meg a regisztrált e-mail címedet, és küldünk egy biztonságos hivatkozást az új jelszó megadásához.
          </p>
        </div>

        {status.msg && (
          <div className={`p-3.5 rounded-2xl text-xs font-semibold mb-4 flex items-center gap-2 border ${
            status.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
              : 'bg-rose-50 text-rose-800 border-rose-100'
          }`}>
            {status.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{status.msg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">E-mail cím</label>
            <input
              type="email"
              required
              placeholder="email@pelda.hu"
              className="w-full p-3.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-500/20 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Küldés folyamatban...' : 'Visszaállító hivatkozás küldése'}
          </button>
        </form>

      </div>
    </div>
  );
}
