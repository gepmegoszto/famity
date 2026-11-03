'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function AdBanner({ 
  familyId, 
  dataAdSlot = "1234567890", 
  dataAdFormat = 'auto', 
  dataFullWidthResponsive = 'true' 
}) {
  const [showAds, setShowAds] = useState(false);

  useEffect(() => {
    async function checkSubscription() {
      // Ha nincs familyId (pl. főoldal / landing page), akkor mutassuk a hirdetést
      if (!familyId) {
        setShowAds(true);
        return;
      }

      try {
        const familyRef = doc(db, 'families', familyId);
        const familySnap = await getDoc(familyRef);

        if (familySnap.exists()) {
          const data = familySnap.data();
          // Ha a család prémium (isPremium: true), akkor NINCS hirdetés (!isPremium)
          const isPremium = data.isPremium === true;
          setShowAds(!isPremium);
        } else {
          setShowAds(true);
        }
      } catch (error) {
        console.error("Hiba az előfizetés ellenőrzésekor:", error);
        setShowAds(true);
      }
    }

    checkSubscription();
  }, [familyId]);

  // Ha a család prémium előfizető, ne rendereljen semmit (reklámmentes)
  if (!showAds) return null;

  return (
    <div className="my-6 text-center overflow-hidden bg-slate-50/50 p-2 rounded-2xl border border-slate-100">
      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
        Hirdetés
      </span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-2881984231378190"
        data-ad-slot={dataAdSlot}
        data-ad-format={dataAdFormat}
        data-full-width-responsive={dataFullWidthResponsive}
      />
    </div>
  );
}
