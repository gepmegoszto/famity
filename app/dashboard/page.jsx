'use client';
import { useEffect, useState, useRef } from 'react';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, onSnapshot, addDoc, orderBy } from 'firebase/firestore';
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

  // Belső chat állapota
  const [chatProtocolId, setChatProtocolId] = useState(null);
  const [chatProtocolItemName, setChatProtocolItemName] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const chatMessagesEndRef = useRef(null);

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

  // Chat üzenetek valós idejű betöltése
  useEffect(() => {
    if (!chatProtocolId) return;
    const qMsg = query(
      collection(db, 'lending_protocols', chatProtocolId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsubMsg = onSnapshot(qMsg, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setTimeout(() => {
        chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });
    return () => unsubMsg();
  }, [chatProtocolId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatProtocolId || !user) return;

    try {
      await addDoc(collection(db, 'lending_protocols', chatProtocolId, 'messages'), {
        senderId: user.uid,
        senderEmail: user.email,
        text: newMessage.trim(),
        createdAt: new Date().toISOString()
      });
      setNewMessage('');
    } catch (err) {
      console.error("Hiba az üzenet küldésekor:", err);
      alert('Nem sikerült elküldeni az üzenetet.');
    }
  };

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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600 font-medium">Betöltés...</div>;

  const activeLenderProtocols = protocolsAsLender.filter(p => p.status !== 'Lezárva');
  const activeBorrowerProtocols = protocolsAsBorrower.filter(p => p.status !== 'Lezárva');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      
      {/* Prémium Fejléc */}
      <header className="max-w-7xl w-full mx-auto px-6 py-6 flex justify-between items-center bg-white/85 backdrop-blur-md sticky top-0 z-45 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black text-lg shadow-sm">
            F
          </div>
          <div>
            <Link href="/" className="text-lg font-black text-slate-900 tracking-tight hover:text-blue-600 transition">famity.hu</Link>
            <span className="block text-[10px] font-bold text-blue-600 uppercase tracking-widest">Vezérlőpult</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/" className="text-xs font-semibold px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition hidden sm:inline-block">
            ← Főoldal
          </Link>
          <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl font-medium hidden md:inline-block">
            {user?.email}
          </span>
          <button onClick={handleLogout} className="text-xs font-semibold px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm transition">
            Kilépés
          </button>
        </div>
      </header>

      {/* Fő tartalom */}
      <main className="max-w-6xl w-full mx-auto px-6 py-10 space-y-8 flex-1">
        
        {/* Üdvözlő & Gyorsműveletek sáv */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Üdvözlünk a Vezérlőpulton!</h1>
            <p className="text-sm text-slate-600 mt-1">Kezeld aktív bérléseidet, jegyzőkönyveidet és partnereidet biztonságosan.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/closed" className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-5 py-3 rounded-2xl text-sm transition flex items-center gap-2">
              <span>📁 Lezárt archívum</span>
            </Link>
            <Link href="/profile" className={`font-semibold px-5 py-3 rounded-2xl text-sm transition shadow-sm ${hasProfile ? 'bg-slate-100 hover:bg-slate-200 text-slate-800' : 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse'}`}>
              {hasProfile ? '⚙️ Saját adatok' : '⚠️ Profil kitöltése szükséges'}
            </Link>
            {hasProfile && (
              <Link href="/dashboard/new" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-blue-600/20 transition text-sm flex items-center gap-2">
                <span>+ Új kölcsönzés indítása</span>
              </Link>
            )}
          </div>
        </div>

        {/* Értesítések / Függőben lévő elemek */}
        {incomingRequests.length > 0 && (
          <div className="p-6 bg-blue-50 border border-blue-200 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-bold text-base text-blue-900 flex items-center gap-2">
              <span>🔔</span> Beérkező adatkérési kérelmek
            </h3>
            {incomingRequests.map(req => (
              <div key={req.id} className="bg-white p-4 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <p className="font-bold text-slate-900 text-sm">{req.lenderName || req.lenderEmail} hozzáférést kér a személyes adataihoz.</p>
                <div className="flex gap-2">
                  <button onClick={() => handleApproveRequest(req.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition">Engedélyezem</button>
                  <button onClick={() => handleRejectRequest(req.id)} className="bg-red-100 hover:bg-red-700 hover:text-white text-red-700 text-xs font-semibold px-4 py-2 rounded-xl transition">Elutasítás</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {pendingSignatures.length > 0 && (
          <div className="p-6 bg-amber-50 border border-amber-200 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-bold text-base text-amber-900 flex items-center gap-2">
              <span>✍️</span> Aláírásra váró bérleti jegyzőkönyv
            </h3>
            {pendingSignatures.map(proto => (
              <div key={proto.id} className="bg-white p-4 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="font-bold text-slate-900 text-sm">{proto.itemDetails?.name} <span className="text-xs font-mono text-slate-400">({proto.id.slice(0, 8).toUpperCase()})</span></p>
                  <p className="text-xs text-slate-500">Bérbeadó: {proto.lenderEmail}</p>
                </div>
                <button onClick={() => setSigningProtocolId(proto.id)} className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition shadow">
                  Aláírás megtekintése →
                </button>
              </div>
            ))}
          </div>
        )}

        {pendingReturnSignatures.length > 0 && (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-bold text-base text-emerald-900 flex items-center gap-2">
              <span>🔄</span> Visszavétel aláírása szükséges
            </h3>
            {pendingReturnSignatures.map(proto => (
              <div key={proto.id} className="bg-white p-4 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="font-bold text-slate-900 text-sm">{proto.itemDetails?.name} <span className="text-xs font-mono text-slate-400">({proto.id.slice(0, 8).toUpperCase()})</span></p>
                  <p className="text-xs text-slate-500">Bérbeadó: {proto.lenderEmail}</p>
                </div>
                <button onClick={() => setSigningReturnProtocolId(proto.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition shadow">
                  Visszavétel aláírása →
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Kétoszlopos elrendezés az aktív bérlésekhez */}
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Bérbeadóként indított */}
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <span>📤</span> Aktív indításaim (Bérbeadóként)
            </h2>
            {activeLenderProtocols.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-500 text-sm">
                Nincs aktív bérlésed bérbeadóként.
              </div>
            ) : (
              <div className="space-y-4">
                {activeLenderProtocols.map(p => {
                  const returnDateStr = p.rentalTerms?.expectedReturnDate ? new Date(p.rentalTerms.expectedReturnDate).toLocaleString('hu-HU') : 'Nincs megadva';
                  const uniqueId = p.id.slice(0, 8).toUpperCase();
                  return (
                    <div key={p.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-slate-900 text-base">{p.itemDetails?.name}</h3>
                          <span className="text-xs font-mono bg-slate-100 px-2.5 py-1 rounded-xl text-slate-600 font-semibold">#{uniqueId}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Bérlő: <span className="font-semibold text-slate-700">{p.borrowerData?.lastName} {p.borrowerData?.firstName}</span></p>
                        <p className="text-xs text-slate-500">Lejárat: <span className="font-semibold text-slate-800">{returnDateStr}</span></p>
                        <span className={`inline-block mt-3 text-xs px-3 py-1 rounded-full font-bold ${p.status === 'Aktív' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{p.status}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 items-center">
                        <button onClick={() => setSelectedPartnerData({ title: 'Bérlő adatai', data: p.borrowerData, email: p.borrowerEmail })} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl transition">👤 Bérlő adatai</button>
                        <button onClick={() => { setChatProtocolId(p.id); setChatProtocolItemName(p.itemDetails?.name); }} className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5">
                          <span>💬 Chat</span>
                        </button>
                        <Link href={`/dashboard/protocol/${p.id}`} className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition">Jegyzőkönyv →</Link>
                        {p.status === 'Aktív' && (
                          <Link href={`/dashboard/return/${p.id}`} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition ml-auto shadow">Visszavétel →</Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bérlőként indított */}
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <span>📥</span> Aktív bérléseim (Bérlőként)
            </h2>
            {activeBorrowerProtocols.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-500 text-sm">
                Nincs aktív bérlésed bérlőként.
              </div>
            ) : (
              <div className="space-y-4">
                {activeBorrowerProtocols.map(p => {
                  const returnDateStr = p.rentalTerms?.expectedReturnDate ? new Date(p.rentalTerms.expectedReturnDate).toLocaleString('hu-HU') : 'Nincs megadva';
                  const uniqueId = p.id.slice(0, 8).toUpperCase();
                  return (
                    <div key={p.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-slate-900 text-base">{p.itemDetails?.name}</h3>
                          <span className="text-xs font-mono bg-slate-100 px-2.5 py-1 rounded-xl text-slate-600 font-semibold">#{uniqueId}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Bérbeadó: <span className="font-semibold text-slate-700">{p.lenderData?.lastName} {p.lenderData?.firstName}</span></p>
                        <p className="text-xs text-slate-500">Lejárat: <span className="font-semibold text-slate-800">{returnDateStr}</span></p>
                        <span className={`inline-block mt-3 text-xs px-3 py-1 rounded-full font-bold ${p.status === 'Aktív' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{p.status}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 items-center">
                        <button onClick={() => setSelectedPartnerData({ title: 'Bérbeadó adatai', data: p.lenderData, email: p.lenderEmail })} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl transition">👤 Bérbeadó adatai</button>
                        <button onClick={() => { setChatProtocolId(p.id); setChatProtocolItemName(p.itemDetails?.name); }} className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5">
                          <span>💬 Chat</span>
                        </button>
                        <Link href={`/dashboard/protocol/${p.id}`} className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition">Jegyzőkönyv →</Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Partner Adatainak Modál */}
      {selectedPartnerData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-3xl max-w-md w-full space-y-6 shadow-2xl">
            <h3 className="text-xl font-extrabold text-slate-900 border-b pb-3">{selectedPartnerData.title}</h3>
            <div className="text-sm space-y-2.5 text-slate-700">
              <p><strong>Név:</strong> {selectedPartnerData.data?.lastName} {selectedPartnerData.data?.firstName}</p>
              <p><strong>Email:</strong> {selectedPartnerData.email || selectedPartnerData.data?.email || 'Nincs megadva'}</p>
              <p><strong>Telefonszám:</strong> {selectedPartnerData.data?.phone || 'Nincs megadva'}</p>
              <p><strong>Személyi igazolvány sz.:</strong> {selectedPartnerData.data?.idCardNumber || 'Nincs megadva'}</p>
              <p><strong>Anyja neve:</strong> {selectedPartnerData.data?.mothersName || 'Nincs megadva'}</p>
              <p><strong>Születési hely, idő:</strong> {selectedPartnerData.data?.birthPlace || ''}, {selectedPartnerData.data?.birthDate || ''}</p>
              <p><strong>Lakcím:</strong> {selectedPartnerData.data?.address?.zip} {selectedPartnerData.data?.address?.city}, {selectedPartnerData.data?.address?.street} {selectedPartnerData.data?.address?.houseNumber}</p>
            </div>
            <div className="pt-4 border-t flex justify-end">
              <button onClick={() => setSelectedPartnerData(null)} className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow">Bezárás</button>
            </div>
          </div>
        </div>
      )}

      {/* Belső Chat Modál */}
      {chatProtocolId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full h-[600px] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            {/* Chat Fejléc */}
            <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-base">Üzenetek: {chatProtocolItemName}</h3>
                <span className="text-xs text-slate-400 font-mono">#{chatProtocolId.slice(0, 8).toUpperCase()}</span>
              </div>
              <button onClick={() => setChatProtocolId(null)} className="text-slate-400 hover:text-white font-bold text-xl px-2">✕</button>
            </div>

            {/* Üzenetek listája */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50">
              {messages.length === 0 ? (
                <div className="text-center text-slate-400 text-xs py-10">Még nincsenek üzenetek. Írd meg az elsőt!</div>
              ) : (
                messages.map(msg => {
                  const isMe = msg.senderId === user?.uid;
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <span className="text-[10px] text-slate-400 mb-1 px-1">{msg.senderEmail}</span>
                      <div className={`max-w-[80%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'}`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatMessagesEndRef} />
            </div>

            {/* Üzenet küldő sáv */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200 flex gap-2">
              <input 
                type="text" 
                value={newMessage} 
                onChange={e => setNewMessage(e.target.value)} 
                placeholder="Írj üzenetet a partnernek..." 
                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl text-xs sm:text-sm transition shadow">
                Küldés
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Aláíró Modál (Bérlőnek) */}
      {signingProtocolId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white p-8 rounded-3xl max-w-lg w-full space-y-6 shadow-2xl my-8">
            <h3 className="text-xl font-extrabold text-slate-900">famity.hu – Aláírás és Jogi Tájékoztató</h3>
            <div className="border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 flex justify-center p-4">
              <canvas ref={canvasRef} width={420} height={180} className="cursor-crosshair touch-none bg-white rounded-xl border shadow-sm" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} />
            </div>
            <div className="flex justify-between gap-3 pt-2">
              <button type="button" onClick={clearCanvas} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold px-5 py-2.5 rounded-xl transition">Törlés</button>
              <div className="flex gap-2">
                <button type="button" onClick={() => setSigningProtocolId(null)} className="text-slate-600 px-4 py-2.5 text-sm font-medium">Mégse</button>
                <button type="button" onClick={handleBorrowerSignSubmit} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow transition">Aláírás és Véglegesítés</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visszavételi Aláíró Modál */}
      {signingReturnProtocolId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white p-8 rounded-3xl max-w-lg w-full space-y-6 shadow-2xl my-8">
            <h3 className="text-xl font-extrabold text-slate-900">famity.hu – Visszavételi Aláírás</h3>
            <div className="border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 flex justify-center p-4">
              <canvas ref={canvasRef} width={420} height={180} className="cursor-crosshair touch-none bg-white rounded-xl border shadow-sm" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} />
            </div>
            <div className="flex justify-between gap-3 pt-2">
              <button type="button" onClick={clearCanvas} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold px-5 py-2.5 rounded-xl transition">Törlés</button>
              <div className="flex gap-2">
                <button type="button" onClick={() => setSigningReturnProtocolId(null)} className="text-slate-600 px-4 py-2.5 text-sm font-medium">Mégse</button>
                <button type="button" onClick={handleBorrowerReturnSignSubmit} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow transition">Aláírás és Lezárás</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prémium Lábléc */}
      <footer className="bg-slate-100 border-t border-slate-200 py-8 mt-12">
        <div className="max-w-6xl w-full mx-auto px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 famity.hu – Minden jog fenntartva.</p>
          <div className="flex gap-6">
            <Link href="/" className="hover:underline">Főoldal</Link>
            <Link href="/dashboard/closed" className="hover:underline">Lezárt archívum</Link>
            <Link href="/profile" className="hover:underline">Profil</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
