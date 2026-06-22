import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

function dhikrDocRef(uid) {
  return doc(db, "users", uid, "dhikr", "counter");
}

/**
 * Lit le compteur Dhikr sauvegardé pour cet utilisateur (0 si rien trouvé).
 */
export async function fetchDhikrCount(uid) {
  const snap = await getDoc(dhikrDocRef(uid));
  if (!snap.exists()) return 0;
  return snap.data().count ?? 0;
}

/**
 * Sauvegarde le compteur Dhikr courant pour cet utilisateur.
 */
export async function saveDhikrCount(uid, count) {
  await setDoc(dhikrDocRef(uid), { count, updatedAt: Date.now() });
}

/**
 * S'abonne aux changements du compteur Dhikr (utile si l'utilisateur
 * est connecté sur plusieurs appareils en même temps).
 * Retourne une fonction de désabonnement.
 */
export function subscribeToDhikrCount(uid, callback) {
  return onSnapshot(dhikrDocRef(uid), (snap) => {
    callback(snap.exists() ? snap.data().count ?? 0 : 0);
  });
}
