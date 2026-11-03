'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  onSnapshot, 
  updateDoc, 
  deleteDoc, 
  getDoc 
} from 'firebase/firestore';
import { Users, Shield, RefreshCw, Trash2, Edit3, Check, Save } from 'lucide-react';

export default function FamilySettings({ familyId, currentUserId }) {
  const [family, setFamily] = useState(null);
  const [members, setMembers] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState('member');
  
  // Szerkesztési állapotok
  const [editingFamilyName, setEditingFamilyName] = useState(false);
  const [familyNameInput, setFamilyNameInput] = useState('');
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [memberForm, setMemberForm] = useState({ name: '', role: 'member', color: '#3B82F6' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!familyId) return;

    // Család alapadatainak figyelése
    const familyRef = doc(db, 'families', familyId);
    const unsubFamily = onSnapshot(familyRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFamily(data);
        setFamilyNameInput(data.name || '');
      }
    });

    // Családtagok figyelése
    const membersRef = collection(db, 'families', familyId, 'members');
    const unsubMembers = onSnapshot(membersRef, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMembers(list);

      // Aktuális user szerepkörének beállítása
      const me = list.find(m => m.id === currentUserId);
      if (me) {
        setCurrentUserRole(me.role || 'member');
      }
    });

    return () => {
      unsubFamily();
      unsubMembers();
    };
  }, [familyId, currentUserId]);

  const isAdmin = currentUserRole === 'admin';

  // Család nevének frissítése
  const handleUpdateFamilyName = async () => {
    if (!familyNameInput.trim()) return;
    await updateDoc(doc(db, 'families', familyId), {
      name: familyNameInput.trim()
    });
    setEditingFamilyName(false);
    showMessage('Család neve frissítve!');
  };

  // Új meghívókód generálása
  const handleRegenerateCode = async () => {
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    await updateDoc(doc(db, 'families', familyId), {
      inviteCode: newCode
    });
    showMessage('Új meghívókód generálva!');
  };

  // Tag szerkesztésének elindítása
  const startEditMember = (member) => {
    setEditingMemberId(member.id);
    setMemberForm({
      name: member.name || '',
      role: member.role || 'member',
      color: member.color || '#3B82F6'
    });
  };

  // Tag adatainak mentése
  const handleSaveMember = async (memberId) => {
    await updateDoc(doc(db, 'families', familyId, 'members', memberId), {
      name: memberForm.name.trim(),
      role: memberForm.role,
      color: memberForm.color
    });

    // A felhasználó saját rekordját is frissítjük, ha van neve
    await updateDoc(doc(db, 'users', memberId), {
      name: memberForm.name.trim()
    }).catch(() => {});

    setEditingMemberId(null);
    showMessage('Családtag adatai frissítve!');
  };

  // Tag eltávolítása a családból
  const handleRemoveMember = async (memberId) => {
    if (memberId === currentUserId) {
      alert('Saját magadat nem távolíthatod el innen!');
      return;
    }
    if (!confirm('Biztosan eltávolítod ezt a családtagot?')) return;

    await deleteDoc(doc(db, 'families', familyId, 'members', memberId));
    await updateDoc(doc(db, 'users', memberId), {
      familyId: ''
    }).catch(() => {});

    showMessage('Családtag eltávolítva!');
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
      {/* Fejléc */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-800">Családkezelés & Beállítások</h2>
        </div>
        {isAdmin && (
          <span className="flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-3 py-1 rounded-full">
            <Shield className="w-3.5 h-3.5 text-amber-600" /> Adminisztrátor
          </span>
        )}
      </div>

      {message && (
        <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-xs font-semibold border border-emerald-100">
          {message}
        </div>
      )}

      {/* Család alapadatok */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase">Család Neve</span>
          {isAdmin && !editingFamilyName && (
            <button
              onClick={() => setEditingFamilyName(true)}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" /> Módosítás
            </button>
          )}
        </div>

        {editingFamilyName ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={familyNameInput}
              onChange={(e) => setFamilyNameInput(e.target.value)}
              className="p-2 border border-slate-200 rounded-lg text-sm bg-white flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleUpdateFamilyName}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
            >
              Mentés
            </button>
            <button
              onClick={() => setEditingFamilyName(false)}
              className="px-3 py-2 text-slate-500 text-xs hover:underline"
            >
              Mégse
            </button>
          </div>
        ) : (
          <p className="text-base font-bold text-slate-800">{family?.name || 'Család'}</p>
        )}

        {/* Meghívókód */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase">Meghívókód</span>
            <span className="font-mono text-base font-bold text-blue-700">{family?.inviteCode}</span>
          </div>
          {isAdmin && (
            <button
              onClick={handleRegenerateCode}
              title="Új kód generálása"
              className="flex items-center gap-1 text-xs text-slate-600 hover:text-blue-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Új kód
            </button>
          )}
        </div>
      </div>

      {/* Családtagok Listája */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-700">Családtagok ({members.length})</h3>

        <div className="space-y-2">
          {members.map((member) => {
            const isEditingThis = editingMemberId === member.id;

            return (
              <div
                key={member.id}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {isEditingThis ? (
                  /* Szerkesztő nézet */
                  <div className="space-y-3 w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={memberForm.name}
                        onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                        placeholder="Név"
                        className="p-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <select
                        value={memberForm.role}
                        onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                        className="p-2 border border-slate-200 rounded-lg text-xs bg-white"
                      >
                        <option value="member">Tag</option>
                        <option value="admin">Adminisztrátor</option>
                      </select>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={memberForm.color}
                          onChange={(e) => setMemberForm({ ...memberForm, color: e.target.value })}
                          className="h-8 w-12 border-0 rounded cursor-pointer"
                        />
                        <span className="text-xs text-slate-500">Szín</span>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleSaveMember(member.id)}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-blue-700 transition"
                      >
                        <Save className="w-3.5 h-3.5" /> Mentés
                      </button>
                      <button
                        onClick={() => setEditingMemberId(null)}
                        className="px-3 py-1.5 text-slate-500 text-xs hover:underline"
                      >
                        Mégse
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Normál megjelenítés */
                  <>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0"
                        style={{ backgroundColor: member.color || '#3B82F6' }}
                      >
                        {member.name ? member.name.substring(0, 2).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800">{member.name}</span>
                          {member.role === 'admin' && (
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                              Admin
                            </span>
                          )}
                          {member.id === currentUserId && (
                            <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                              Te
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400">{member.email}</span>
                      </div>
                    </div>

                    {/* Admin funkciók */}
                    {isAdmin && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => startEditMember(member)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 transition rounded-lg hover:bg-white"
                          title="Tag szerkesztése"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {member.id !== currentUserId && (
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 transition rounded-lg hover:bg-white"
                            title="Eltávolítás a családból"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
