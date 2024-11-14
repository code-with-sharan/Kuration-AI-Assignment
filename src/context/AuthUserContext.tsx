"use client";

import { createContext, useContext } from "react";
import useFirebaseAuth from "../lib/firebase/useFirebaseAuth";
import { AuthProvider } from "firebase/auth";

const authUserContext = createContext<{
  authUser: { token: string | null; uid: string; email: string | null } | null;
  loading: boolean;
  signInWithPopup: (provider: AuthProvider) => Promise<unknown>;
  signOut: () => Promise<void>;
}>({
  authUser: null,
  loading: true,
  signInWithPopup: async () => {},
  signOut: async () => {},
});

export function AuthUserProvider({ children }: { children: React.ReactNode }) {
  const auth = useFirebaseAuth();
  return (
    <authUserContext.Provider value={auth}>{children}</authUserContext.Provider>
  );
}

// custom hook to use the authUserContext and access authUser and loading
export const useAuth = () => useContext(authUserContext);
