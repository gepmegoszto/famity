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
  const [pendingReturnSignatures, setPendingReturnSignatures] = useState([]);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  const [selectedPartnerData, setSelectedPartnerData] = useState(null);
  const [signingProtocolId, setSigningProtocolId] = useState(null);
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

  const handleBorrowerReturnSignSubmit = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !signingReturnProtocolId) return;
    const signatureDataUrl = canvas.toDataURL();

    try {
      await updateDoc(doc(db, 'lending_protocols', signingReturnProtocolId), {
        'signatures.returnBorrower': signatureDataUrl,
        'signatures.returnBorrowerTimestamp': new Date().toISOString(),
        status: 'Lezárva'
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

  // Aktív vagy nem lezártak szűrése a fő pultra
  const activeLenderProtocols = protocolsAsLender.filter(p => p.status !== 'Lezárva');
  const activeBorrowerProtocols = protocolsAsBorrower.filter(p => p.status !== 'Lezárva');

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">famity.hu – Kölcsönadási Vezérlőpult</h1>
          <p className="text-sm text-slate-600">Bejelentkezve: {user?.email}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/closed" className="bg-slate-800 hover:bg-slate-900 text-white font-semibold px-4 py-2 rounded-lg shadow text-sm transition">
            📁 Lezárt tranzakciók
          </Link>
          <Link href="/profile" className={`font-semibold px-4 py-2 rounded-lg shadow text-sm transition ${hasProfile ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-amber-600 hover:bg-amber-700 text-white'}`}>
            {hasProfile ? '⚙️ Saját adatok' : '⚠️ Add meg a személyes adataidat!'}
          </Link>
          {hasProfile && <Link href="/dashboard/new" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow text-sm transition">+ Új kölcsönzés</Link>}
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

      {pendingSignatures.length > 0 && (
        <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-2xl shadow-sm">
          <h3 className="font-bold text-lg text-amber-900 mb-2">✍️ Aláírásra váró bérleti jegyzőkönyv</h3>
          {pendingSignatures.map(proto => (
            <div key={proto.id} className="bg-white p-4 rounded-xl border flex justify-between items-center gap-4">
              <div>
                <p className="font-bold text-slate-900">{proto.itemDetails?.name} <span className="text-xs font-mono text-slate-400">({proto.id.slice(0, 8).toUpperCase()})</span></p>
                <p className="text-xs text-slate-500">Bérbeadó: {proto.lenderEmail}</p>
              </div>
              <button onClick={() => setSigningProtocolId(proto.id)} className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2 rounded-lg">
                Aláírás →
              </button>
            </div>
          ))}
        </div>
      )}

      {pendingReturnSignatures.length > 0 && (
        <div className="mb-8 p-6 bg-emerald-50 border border-emerald-200 rounded-2xl shadow-sm">
          <h3 className="font-bold text-lg text-emerald-900 mb-2">🔄 Visszavétel aláírása szükséges</h3>
          {pendingReturnSignatures.map(proto => (
            <div key={proto.id} className="bg-white p-4 rounded-xl border flex justify-between items-center gap-4">
              <div>
                <p className="font-bold text-slate-900">{proto.itemDetails?.name} <span className="text-xs font-mono text-slate-400">({proto.id.slice(0, 8).toUpperCase()})</span></p>
                <p className="text-xs text-slate-500">Bérbeadó: {proto.lenderEmail}</p>
              </div>
              <button onClick={() => setSigningReturnProtocolId(proto.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg">
                Visszavétel aláírása →
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4">Aktív indításaim (Bérbeadóként)</h2>
          {activeLenderProtocols.length === 0 ? (
            <p className="text-sm text-slate-500 bg-white p-6 rounded-xl border">Nincs aktív bérlésed.</p>
          ) : (
            <div className="space-y-3">
              {activeLenderProtocols.map(p => {
                const returnDateStr = p.rentalTerms?.expectedReturnDate ? new Date(p.rentalTerms.expectedReturnDate).toLocaleString('hu-HU') : 'Nincs megadva';
                const uniqueId = p.id.slice(0, 8).toUpperCase();
                return (
                  <div key={p.id} className="bg-white p-4 rounded-xl border flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-slate-900">{p.itemDetails?.name}</h3>
                        <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-semibold">#{uniqueId}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Bérlő: <span className="font-medium text-slate-700">{p.borrowerData?.lastName} {p.borrowerData?.firstName}</span></p>
                      <p className="text-xs text-slate-500">Lejárat: <span className="font-semibold text-slate-800">{returnDateStr}</span></p>
                      <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-semibold ${p.status === 'Aktív' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{p.status}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      <button onClick={() => setSelectedPartnerData({ title: 'Bérlő adatai', data: p.borrowerData, email: p.borrowerEmail })} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg transition">👤 Bérlő adatai</button>
                      <Link href={`/dashboard/protocol/${p.id}`} className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-2 rounded-lg transition">Jegyzőkönyv →</Link>
                      {p.status === 'Aktív' && (
                        <Link href={`/dashboard/return/${p.id}`} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition ml-auto">Visszavétel →</Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4">Aktív bérléseim (Bérlőként)</h2>
          {activeBorrowerProtocols.length === 0 ? (
            <p className="text-sm text-slate-500 bg-white p-6 rounded-xl border">Nincs aktív bérlésed bérlőként.</p>
          ) : (
            <div className="space-y-3">
              {activeBorrowerProtocols.map(p => {
                const returnDateStr = p.rentalTerms?.expectedReturnDate ? new Date(p.rentalTerms.expectedReturnDate).toLocaleString('hu-HU') : 'Nincs megadva';
                const uniqueId = p.id.slice(0, 8).toUpperCase();
                return (
                  <div key={p.id} className="bg-white p-4 rounded-xl border flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-slate-900">{p.itemDetails?.name}</h3>
                        <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-semibold">#{uniqueId}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Bérbeadó: <span className="font-medium text-slate-700">{p.lenderData?.lastName} {p.lenderData?.firstName}</span></p>
                      <p className="text-xs text-slate-500">Lejárat: <span className="font-semibold text-slate-800">{returnDateStr}</span></p>
                      <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-semibold ${p.status === 'Aktív' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{p.status}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      <button onClick={() => setSelectedPartnerData({ title: 'Bérbeadó adatai', data: p.lenderData, email: p.lenderEmail })} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg transition">👤 Bérbeadó adatai</button>
                      <Link href={`/dashboard/protocol/${p.id}`} className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-2 rounded-lg transition">Jegyzőkönyv →</Link>
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

      {signingProtocolId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-2xl max-w-lg w-full space-y-4 shadow-2xl my-8">
            <h3 className="text-lg font-bold text-slate-900">famity.hu – Aláírás és Jogi Tájékoztató</h3>
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

      {signingReturnProtocolId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-2xl max-w-lg w-full space-y-4 shadow-2xl my-8">
            <h3 className="text-lg font-bold text-slate-900">famity.hu – Visszavételi Aláírás</h3>
            <div className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 flex justify-center">
              <canvas ref={canvasRef} width={450} height={180} className="cursor-crosshair touch-none" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} />
            </div>
            <div className="flex justify-between gap-3 pt-2">
              <button type="button" onClick={clearCanvas} className="bg-slate-200 text-slate-700 text-sm font-semibold px-4 py-2 rounded-lg">Törlés</button>
              <div className="flex gap-2">
                <button type="button" onClick={() => setSigningReturnProtocolId(null)} className="text-slate-600 px-3 py-2 text-sm">Mégse</button>
                <button type="button" onClick={handleBorrowerReturnSignSubmit} className="bg-emerald-600 text-white text-sm font-semibold px-6 py-2 rounded-lg shadow">Aláírás és Lezárás</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
