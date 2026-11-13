'use client';
import { useEffect, useState, useRef } from 'react';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [protocolsAsLender, setProtocolsAsLender] = useState([]);
  const [protocolsAsBorrower, setProtocolsAsBorrower] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [pendingSignatures, setPendingSignatures] = useState([]);
  const [pendingReturnSignatures, setPendingReturnSignatures] = useState([]); // ÚJ: Visszavételi aláírásra váróknak
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  // Partner adatok megtekintése modal
  const [selectedPartnerData, setSelectedPartnerData] = useState(null);

  // Aláíró modal bérlőként (kezdeti bérlés)
  const [signingProtocolId, setSigningProtocolId] = useState(null);
  // ÚJ: Aláíró modal bérlőként (visszavétel)
  const [signingReturnProtocolId, setSigningReturnProtocolId] = useState(null);

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/auth');
      } else {
        setUser(currentUser);
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists() && userDoc.data().lastName) {
            setHasProfile(true);
          }

          const qLender = query(collection(db, 'lending_protocols'), where('lenderId', '==', currentUser.uid));
          const snapLender = await getDocs(qLender);
          setProtocolsAsLender(snapLender.docs.map(d => ({ id: d.id, ...d.data() })));

          const qBorrowerUid = query(collection(db, 'lending_protocols'), where('borrowerUid', '==', currentUser.uid));
          const snapBorrowerUid = await getDocs(qBorrowerUid);
          setProtocolsAsBorrower(snapBorrowerUid.docs.map(d => ({ id: d.id, ...d.data() })));

        } catch (err) {
          console.error("Hiba az adatok betöltésekor:", err);
        } finally {
          setLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Valós idejű figyelés (kérelmek, aláírások, visszavételi aláírások)
  useEffect(() => {
    if (!user) return;

    const qReq = query(collection(db, 'access_requests'), where('borrowerUid', '==', user.uid), where('status', '==', 'pending'));
    const unsubReq = onSnapshot(qReq, (snap) => {
      setIncomingRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const qSign = query(collection(db, 'lending_protocols'), where('borrowerUid', '==', user.uid), where('status', '==', 'Vár a bérlő aláírására'));
    const unsubSign = onSnapshot(qSign, (snap) => {
      setPendingSignatures(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // ÚJ: Figyeljük a visszavételi aláírásra várókat is bérlőként
    const qReturnSign = query(collection(db, 'lending_protocols'), where('borrowerUid', '==', user.uid), where('status', '==', 'Vár a bérlő visszavételi aláírására'));
    const unsubReturnSign = onSnapshot(qReturnSign, (snap) => {
      setPendingReturnSignatures(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubReq();
      unsubSign();
      unsubReturnSign();
    };
  }, [user]);

  const handleApproveRequest = async (reqId) => {
    await updateDoc(doc(db, 'access_requests', reqId), { status: 'approved' });
  };
  const handleRejectRequest = async (reqId) => {
    await updateDoc(doc(db, 'access_requests', reqId), { status: 'rejected' });
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0].clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0].clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };
  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0].clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0].clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  const stopDrawing = () => setIsDrawing(false);
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Kezdeti bérleti aláírás mentése
  const handleBorrowerSignSubmit = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !signingProtocolId) return;
    const signatureDataUrl = canvas.toDataURL();

    try {
      await updateDoc(doc(db, 'lending_protocols', signingProtocolId), {
        'signatures.borrower': signatureDataUrl,
        'signatures.borrowerTimestamp': new Date().toISOString(),
        status: 'Aktív'
      });
      setSigningProtocolId(null);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Hiba történt az aláírás mentésekor.');
    }
  };

  // ÚJ: Visszavételi aláírás mentése bérlőként -> Teljes lezárás
  const handleBorrowerReturnSignSubmit = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !signingReturnProtocolId) return;
    const signatureDataUrl = canvas.toDataURL();

    try {
      await updateDoc(doc(db, 'lending_protocols', signingReturnProtocolId), {
        'signatures.returnBorrower': signatureDataUrl,
        'signatures.returnBorrowerTimestamp': new Date().toISOString(),
        status: 'Lezárva' // Mindketten aláírták a visszavételt is, ügylet lezárva!
      });
      setSigningReturnProtocolId(null);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Hiba történt a visszavételi aláírás mentésekor.');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (loading) return <div className="flex-1 flex items-center justify-center p-12">Betöltés...</div>;

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kölcsönadási Vezérlőpult</h1>
          <p className="text-sm text-slate-600">Bejelentkezve: {user?.email}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/profile" className={`font-semibold px-4 py-2 rounded-lg shadow text-sm transition ${hasProfile ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-amber-600 hover:bg-amber-700 text-white'}`}>
            {hasProfile ? '⚙️ Saját adataim szerkesztése' : '⚠️ Add meg a személyes adataidat!'}
          </Link>
          {hasProfile && <Link href="/dashboard/new" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow text-sm transition">+ Új kölcsönzés indítása</Link>}
          <button onClick={handleLogout} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-lg text-sm transition">Kilépés</button>
        </div>
      </div>

      {incomingRequests.length > 0 && (
        <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-2xl shadow-sm">
          <h3 className="font-bold text-lg text-blue-900 mb-2">🔔 Beérkező adatkérési kérelmek</h3>
          {incomingRequests.map(req => (
            <div key={req.id} className="bg-white p-4 rounded-xl border flex justify-between items-center gap-4">
              <p className="font-bold text-slate-900">{req.lenderName || req.lenderEmail} kérvényezi az adataidat.</p>
              <div className="flex gap-2">
                <button onClick={() => handleApproveRequest(req.id)} className="bg-emerald-600 text-white text-xs px-4 py-2 rounded-lg">Engedélyezem</button>
                <button onClick={() => handleRejectRequest(req.id)} className="bg-red-100 text-red-700 text-xs px-4 py-2 rounded-lg">Elutasítás</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Kezdeti Aláírásra váró jegyzőkönyv */}
      {pendingSignatures.length > 0 && (
        <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-2xl shadow-sm">
          <h3 className="font-bold text-lg text-amber-900 mb-2">✍️ Aláírásra váró bérleti jegyzőkönyv</h3>
          <p className="text-sm text-amber-700 mb-4">Egy bérbeadó elküldte a jegyzőkönyvet, kérjük, ellenőrizd és írd alá:</p>
          {pendingSignatures.map(proto => (
            <div key={proto.id} className="bg-white p-4 rounded-xl border flex justify-between items-center gap-4">
              <div>
                <p className="font-bold text-slate-900">{proto.itemDetails?.name}</p>
                <p className="text-xs text-slate-500">Bérbeadó: {proto.lenderEmail}</p>
              </div>
              <button onClick={() => setSigningProtocolId(proto.id)} className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2 rounded-lg">
                Jegyzőkönyv aláírása →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ÚJ: Visszavételi aláírásra váró jegyzőkönyv */}
      {pendingReturnSignatures.length > 0 && (
        <div className="mb-8 p-6 bg-emerald-50 border border-emerald-200 rounded-2xl shadow-sm">
          <h3 className="font-bold text-lg text-emerald-900 mb-2">🔄 Eszköz visszavétel és elszámolás aláírása</h3>
          <p className="text-sm text-emerald-700 mb-4">A bérbeadó rögzítette a visszavételt és az elszámolást. Kérjük, ellenőrizd és zárd le a bérlést:</p>
          {pendingReturnSignatures.map(proto => (
            <div key={proto.id} className="bg-white p-4 rounded-xl border flex justify-between items-center gap-4">
              <div>
                <p className="font-bold text-slate-900">{proto.itemDetails?.name}</p>
                <p className="text-xs text-slate-500">Bérbeadó: {proto.lenderEmail}</p>
              </div>
              <button onClick={() => setSigningReturnProtocolId(proto.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg">
                Visszavétel aláírása és Lezárás →
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4">Indított bérléseim (Bérbeadóként)</h2>
          {protocolsAsLender.length === 0 ? (
            <p className="text-sm text-slate-500 bg-white p-6 rounded-xl border">Még nem indítottál bérlést.</p>
          ) : (
            <div className="space-y-3">
              {protocolsAsLender.map(p => {
                const returnDateStr = p.rentalTerms?.expectedReturnDate ? new Date(p.rentalTerms.expectedReturnDate).toLocaleString('hu-HU') : 'Nincs megadva';
                return (
                  <div key={p.id} className="bg-white p-4 rounded-xl border flex flex-col justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-slate-900">{p.itemDetails?.name}</h3>
                      <p className="text-xs text-slate-500 mt-1">Bérlő: <span className="font-medium text-slate-700">{p.borrowerData?.lastName} {p.borrowerData?.firstName}</span></p>
                      <p className="text-xs text-slate-500">Lejárat: <span className="font-semibold text-slate-800">{returnDateStr}</span></p>
                      <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-semibold ${p.status === 'Aktív' ? 'bg-emerald-100 text-emerald-800' : p.status === 'Lezárva' ? 'bg-slate-100 text-slate-800' : 'bg-amber-100 text-amber-800'}`}>{p.status}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      <button 
                        onClick={() => setSelectedPartnerData({ title: 'Bérlő adatai', data: p.borrowerData, email: p.borrowerEmail })}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg transition"
                      >
                        👤 Bérlő adatai
                      </button>
                      <Link href={`/dashboard/protocol/${p.id}`} className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-2 rounded-lg transition">
                        Jegyzőkönyv →
                      </Link>
                      {p.status === 'Aktív' && (
                        <Link href={`/dashboard/return/${p.id}`} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition ml-auto">
                          Eszköz visszavétele →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4">Bérléseim (Bérlőként)</h2>
          {protocolsAsBorrower.length === 0 ? (
            <p className="text-sm text-slate-500 bg-white p-6 rounded-xl border">Még nincsenek bérléseid bérlőként.</p>
          ) : (
            <div className="space-y-3">
              {protocolsAsBorrower.map(p => {
                const returnDateStr = p.rentalTerms?.expectedReturnDate ? new Date(p.rentalTerms.expectedReturnDate).toLocaleString('hu-HU') : 'Nincs megadva';
                return (
                  <div key={p.id} className="bg-white p-4 rounded-xl border flex flex-col justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-slate-900">{p.itemDetails?.name}</h3>
                      <p className="text-xs text-slate-500 mt-1">Bérbeadó: <span className="font-medium text-slate-700">{p.lenderData?.lastName} {p.lenderData?.firstName}</span></p>
                      <p className="text-xs text-slate-500">Lejárat: <span className="font-semibold text-slate-800">{returnDateStr}</span></p>
                      <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-semibold ${p.status === 'Aktív' ? 'bg-emerald-100 text-emerald-800' : p.status === 'Lezárva' ? 'bg-slate-100 text-slate-800' : 'bg-amber-100 text-amber-800'}`}>{p.status}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      <button 
                        onClick={() => setSelectedPartnerData({ title: 'Bérbeadó adatai', data: p.lenderData, email: p.lenderEmail })}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg transition"
                      >
                        👤 Bérbeadó adatai
                      </button>
                      <Link href={`/dashboard/protocol/${p.id}`} className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-2 rounded-lg transition">
                        Jegyzőkönyv →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selectedPartnerData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 border-b pb-2">{selectedPartnerData.title}</h3>
            <div className="text-sm space-y-2 text-slate-700">
              <p><strong>Név:</strong> {selectedPartnerData.data?.lastName} {selectedPartnerData.data?.firstName}</p>
              <p><strong>Email:</strong> {selectedPartnerData.email || selectedPartnerData.data?.email || 'Nincs megadva'}</p>
              <p><strong>Telefonszám:</strong> {selectedPartnerData.data?.phone || 'Nincs megadva'}</p>
              <p><strong>Személyi igazolvány sz.:</strong> {selectedPartnerData.data?.idCardNumber || 'Nincs megadva'}</p>
              <p><strong>Anyja neve:</strong> {selectedPartnerData.data?.mothersName || 'Nincs megadva'}</p>
              <p><strong>Születési hely, idő:</strong> {selectedPartnerData.data?.birthPlace || ''}, {selectedPartnerData.data?.birthDate || ''}</p>
              <p><strong>Lakcím:</strong> {selectedPartnerData.data?.address?.zip} {selectedPartnerData.data?.address?.city}, {selectedPartnerData.data?.address?.street} {selectedPartnerData.data?.address?.houseNumber}</p>
            </div>
            <div className="pt-4 flex justify-end">
              <button onClick={() => setSelectedPartnerData(null)} className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-5 py-2 rounded-lg">Bezárás</button>
            </div>
          </div>
        </div>
      )}

      {/* Kezdeti Bérlői Aláíró Modal */}
      {signingProtocolId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-2xl max-w-lg w-full space-y-4 shadow-2xl my-8">
            <h3 className="text-lg font-bold text-slate-900">Bérlői Aláírás és Jogi Tájékoztató</h3>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-900 space-y-2 max-h-40 overflow-y-auto">
              <p className="font-bold">⚠️ Fontos jogi nyilatkozat és felelősségvállalási útmutató:</p>
              <p>1. <strong>Adatok helyessége:</strong> A felek felelnek a megadott adatok valódiságáért.</p>
              <p>2. <strong>Felelősség kizárása:</strong> A platform üzemeltetője semmilyen felelősséget nem vállal.</p>
              <p>3. <strong>Jogviták:</strong> Békés úton vagy bíróság előtt rendezendő.</p>
            </div>
            <div className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 flex justify-center">
              <canvas ref={canvasRef} width={450} height={180} className="cursor-crosshair touch-none" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} />
            </div>
            <div className="flex justify-between gap-3 pt-2">
              <button type="button" onClick={clearCanvas} className="bg-slate-200 text-slate-700 text-sm font-semibold px-4 py-2 rounded-lg">Törlés</button>
              <div className="flex gap-2">
                <button type="button" onClick={() => setSigningProtocolId(null)} className="text-slate-600 px-3 py-2 text-sm">Mégse</button>
                <button type="button" onClick={handleBorrowerSignSubmit} className="bg-emerald-600 text-white text-sm font-semibold px-6 py-2 rounded-lg shadow">Aláírás és Véglegesítés</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ÚJ: Bérlői Visszavételi / Lezárási Aláíró Modal */}
      {signingReturnProtocolId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-2xl max-w-lg w-full space-y-4 shadow-2xl my-8">
            <h3 className="text-lg font-bold text-slate-900">Visszavételi Aláírás és Elszámolási Nyilatkozat</h3>
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs text-emerald-900 space-y-2">
              <p className="font-bold">✅ Pénzügyi és tárgyi elszámolási nyilatkozat:</p>
              <p>Aláírásommal megerősítem, hogy a kaució elszámolása megtörtént, minden pénzügyi és tárgyi elszámolás lezárult, a felek egymással a bérlettel kapcsolatban elszámoltak, és az ügylet véglegesen lezárható.</p>
            </div>
            <p className="text-xs text-slate-600">Kérjük, rajzolja be az aláírását az alábbi mezőbe:</p>
            <div className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 flex justify-center">
              <canvas ref={canvasRef} width={450} height={180} className="cursor-crosshair touch-none" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} />
            </div>
            <div className="flex justify-between gap-3 pt-2">
              <button type="button" onClick={clearCanvas} className="bg-slate-200 text-slate-700 text-sm font-semibold px-4 py-2 rounded-lg">Törlés</button>
              <div className="flex gap-2">
                <button type="button" onClick={() => setSigningReturnProtocolId(null)} className="text-slate-600 px-3 py-2 text-sm">Mégse</button>
                <button type="button" onClick={handleBorrowerReturnSignSubmit} className="bg-emerald-600 text-white text-sm font-semibold px-6 py-2 rounded-lg shadow">Aláírás és Ügylet Lezárása</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
