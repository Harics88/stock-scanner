import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from './firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);
  const [parentPin, setParentPin] = useState(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return unsubAuth;
  }, []);

  useEffect(() => {
    if (!user) { setParentPin(null); return; }
    const unsubDoc = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) {
        setParentPin(snap.data().parentPin);
      } else {
        setParentPin(undefined); // Means its explicitly not set yet
      }
    });
    return unsubDoc;
  }, [user]);

  const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
  const loginWithEmail    = (email, pass) => signInWithEmailAndPassword(auth, email, pass);
  const registerWithEmail = (email, pass) => createUserWithEmailAndPassword(auth, email, pass);
  
  const updateParentPin = async (newPin) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, { parentPin: newPin }, { merge: true });
  };

  const signOut = () => firebaseSignOut(auth);

  return (
    <AuthContext.Provider value={{ 
      user, parentPin, 
      signInWithGoogle, loginWithEmail, registerWithEmail, 
      updateParentPin, signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
