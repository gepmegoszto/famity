'use client';
import { useState, useEffect } from 'react';
import { Cookie, Check, X } from 'lucide-react';

export default function CookieBanner({ onOpenPrivacy }) {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('famity_cookie_consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('famity_cookie_consent', 'accepted');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-2xl space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
          <Cookie className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Sütik (Cookie-k) használata</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            A famity.hu kizárólag a működéshez elengedhetetlen sütiket (bejelentkezési munkamenet, beállítások) használja. Harmadik féltől származó követő sütiket nem alkalmazunk.{' '}
            <button 
              onClick={onOpenPrivacy}
              className="text-blue-600 font-bold hover:underline cursor-pointer"
            >
              Adatkezelési tájékoztató
            </button>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleAccept}
          className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Check className="w-3.5 h-3.5 text-emerald-400" /> Elfogadom
        </button>
      </div>
    </div>
  );
}
