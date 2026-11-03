'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [familyData, setFamilyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (userData.familyId) {
              const familyDocRef = doc(db, 'families', userData.familyId);
              const familyDocSnap = await getDoc(familyDocRef);
              if (familyDocSnap.exists()) {
                setFamilyData({ id: familyDocSnap.id, ...familyDocSnap.data() });
              }
            }
          }
        } catch (err) {
          console.error('Hiba az adatok betöltésekor:', err);
        }
      } else {
        setUser(null);
        setFamilyData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Bejelentkezés
  const login = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
  };

  // Regisztráció (Új család vagy csatlakozás)
  const register = async (email, password, userName, familyOption, familyNameOrCode, color) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = res.user;

    let targetFamilyId = '';

    if (familyOption === 'create') {
      const newInviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const newFamilyRef = doc(collection(db, 'families'));
      targetFamilyId = newFamilyRef.id;

      await setDoc(newFamilyRef, {
        name: familyNameOrCode || 'Család',
        inviteCode: newInviteCode,
        createdBy: newUser.uid,
        createdAt: new Date().toISOString()
      });
    } else {
      const q = query(
        collection(db, 'families'), 
        where('inviteCode', '==', familyNameOrCode.trim().toUpperCase())
      );
      const querySnap = await getDocs(q);

      if (querySnap.empty) {
        throw new Error('Érvénytelen családi meghívókód!');
      }

      targetFamilyId = querySnap.docs[0].id;
    }

    await setDoc(doc(db, 'users', newUser.uid), {
      email: email,
      name: userName,
      familyId: targetFamilyId,
      color: color || '#3B82F6',
      role: familyOption === 'create' ? 'admin' : 'member'
    });

    await setDoc(doc(db, 'families', targetFamilyId, 'members', newUser.uid), {
      email: email,
      name: userName,
      color: color || '#3B82F6',
      role: familyOption === 'create' ? 'admin' : 'member',
      pointsBalance: 0
    });

    const familySnap = await getDoc(doc(db, 'families', targetFamilyId));
    if (familySnap.exists()) {
      setFamilyData({ id: familySnap.id, ...familySnap.data() });
    }

    return newUser;
  };

  // Kijelentkezés
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setFamilyData(null);
  };

  return (
    <AuthContext.Provider value={{ user, familyData, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
