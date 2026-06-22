import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, ensureAnonymousAuth } from "../lib/firebase";
import { AuthContext } from "./authContextValue";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ensureAnonymousAuth().catch(() => {
      // Si même l'auth anonyme échoue (ex: clés Firebase non configurées),
      // l'app continue de fonctionner sans persistance cross-device —
      // les autres fonctionnalités (horaires, Coran, Qibla) restent utilisables.
    });

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
