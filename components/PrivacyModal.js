'use client';
import { X, ShieldCheck, Lock, Database, UserCheck, Scale } from 'lucide-react';

export default function PrivacyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col space-y-4 my-auto">
        
        {/* Fejléc */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Adatkezelési Tájékoztató</h3>
              <p className="text-xs text-slate-400">famity.hu — Hatályos: 2026. január 1-től</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Görgethető tartalom */}
        <div className="overflow-y-auto pr-2 space-y-5 text-xs text-slate-600 leading-relaxed font-sans">
          
          <section className="space-y-1.5">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-blue-600" /> 1. Az Adatkezelő adatai
            </h4>
            <p>
              A <strong>famity.hu</strong> weboldal és alkalmazás üzemeltetője elkötelezett a felhasználók és családjaik személyes adatainak védelme iránt. 
              Kapcsolattartási e-mail cím: <a href="mailto:info@famity.hu" className="text-blue-600 font-bold underline">info@famity.hu</a>.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-blue-600" /> 2. A kezelt adatok köre és célja
            </h4>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Fiókadatok:</strong> E-mail cím, választott név, jelszó (kriptográfiai hálózati hash formájában tárolva), egyedi családi színkód. Célja: a felhasználó azonosítása és a családhoz való csatlakozás.</li>
              <li><strong>Családi tartalom:</strong> Naptári események, bevásárlólisták tételei, heti menütervek, házimunka feladatok és pontszámok, üzenőfali jegyzetek. Célja: a közös családi szervezés megvalósítása.</li>
              <li><strong>Eszköz- és értesítési adatok:</strong> Push értesítési tokenek (FCM). Célja: a családi eseményekről és teendőkről szóló valós idejű értesítések elküldése.</li>
            </ul>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-blue-600" /> 3. Az adatkezelés jogalapja és biztonsága
            </h4>
            <p>
              Az adatkezelés jogalapja a Felhasználó önkéntes hozzájárulása (GDPR 6. cikk (1) a) pont). 
              Minden adat átvitele HTTPS / SSL/TLS titkosítással történik. Az adatokat zárt, európai szerverterületen működő adatbázis-infrastruktúrában (Google Firebase Cloud Platform) tároljuk.
            </p>
            <p className="font-semibold text-slate-800 bg-amber-50 p-2.5 rounded-xl border border-amber-100">
              🔒 A famity.hu garantálja, hogy a családi adatokat harmadik fél részére marketing célból NEM értékesíti, és az alkalmazás felületén semmilyen harmadik féltől származó reklámot nem jelenít meg.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-blue-600" /> 4. Az Érintettek jogai és törlés
            </h4>
            <p>
              A felhasználó bármikor jogosult:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>A róla tárolt személyes adatokról tájékoztatást kérni.</li>
              <li>A téves adatainak helyesbítését kérni.</li>
              <li>Fiókjának és az ahhoz kapcsolódó adatok végleges törlését kezdeményezni az <span className="font-mono text-blue-600">info@famity.hu</span> címen.</li>
            </ul>
          </section>

          <section className="space-y-1 border-t border-slate-100 pt-3">
            <p className="text-[11px] text-slate-400">
              Jogorvoslati lehetőséggel a Nemzeti Adatvédelmi és Információszabadság Hatóságnál (NAIH, www.naih.hu) lehet élni.
            </p>
          </section>

        </div>

        {/* Lábléc gomb */}
        <div className="pt-2 border-t border-slate-100 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs transition cursor-pointer"
          >
            Értettem, bezárás
          </button>
        </div>

      </div>
    </div>
  );
}
