'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
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
        // Felhasználó profiljának és családjának betöltése
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const familyDoc = await getDoc(doc(db, 'families', userData.familyId));
          if (familyDoc.exists()) {
            setFamilyData({ id: familyDoc.id, ...familyDoc.data() });
          }
        }
      } else {
        setUser(null);
        setFamilyData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Család létrehozása
  const createFamily = async (familyName, userName, color) => {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const familyRef = doc(collection(db, 'families'));
    
    await setDoc(familyRef, {
      name: familyName,
      inviteCode: inviteCode,
      createdAt: new Date().toISOString()
    });

    return familyRef.id;
  };

  // Családhoz csatlakozás kód alapján
  const joinFamilyByCode = async (code) => {
    const q = query(collection(db, 'families'), where('inviteCode', '==', code.toUpperCase()));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      throw new Error('Érvénytelen családi meghívókód!');
    }
    return querySnapshot.docs[0].id;
  };

  // Regisztráció (Új család vagy Csatlakozás)
  const register = async (email, password, userName, familyOption, familyNameOrCode, color = '#3B82F6') => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const userId = res.user.uid;
    let familyId = '';

    if (familyOption === 'create') {
      familyId = await createFamily(familyNameOrCode, userName, color);
    } else {
      familyId = await joinFamilyByCode(familyNameOrCode);
    }

    // Családtag hozzáadása a családhoz
    await setDoc(doc(db, 'families', familyId, 'members', userId), {
      name: userName,
      role: familyOption === 'create' ? 'admin' : 'member',
      color: color,
      email: email
    });

    // Felhasználó alaprekordja
    await setDoc(doc(db, 'users', userId), {
      name: userName,
      email: email,
      familyId: familyId
    });
  };

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, familyData, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
