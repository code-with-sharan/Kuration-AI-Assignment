"use client";

import { useState, useEffect } from "react";
import { auth } from ".";

import {
  onAuthStateChanged as _onAuthStateChanged,
  AuthProvider,
  User,
} from "firebase/auth";
import { signOut as _signOut } from "firebase/auth";
import { signInWithPopup as _signInWithPopup } from "firebase/auth";

export default function useFirebaseAuth() {
  const [authUser, setAuthUser] = useState<{
    uid: string;
    email: string | null;
    token: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const authStateChanged = async (authState: User | null) => {
    if (!authState) {
      setLoading(false);
      return;
    }

    if (authState) {
      setLoading(true);

      setAuthUser({
        uid: authState.uid,
        email: authState.email,
        token: await authState.getIdToken(),
      });

      setLoading(false);
    }
  };

  const clear = () => {
    setAuthUser(null);
    setLoading(false);
  };

  const onAuthStateChanged = (cb: (authUser: User | null) => void) => {
    return _onAuthStateChanged(auth, cb);
  };

  const signOut = () => {
    return _signOut(auth).then(() => {
      clear();
    });
  };

  const signInWithPopup = (provider: AuthProvider) => {
    return _signInWithPopup(auth, provider).then((response) => {
      authStateChanged(response.user);
      return response.user;
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authStateChanged);
    return () => unsubscribe();
  }, []);

  return {
    authUser,
    loading,
    signInWithPopup,
    signOut,
  };
}
