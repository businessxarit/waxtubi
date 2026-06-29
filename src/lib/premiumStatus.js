import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";

const LOCAL_CACHE_KEY = "waxtubi:premium:status";

function premiumDocRef(uid) {
  return doc(db, "users", uid, "subscription", "status");
}

/**
 * Le statut Premium réel est écrit côté serveur par le webhook Polar
 * (voir api/polar-webhook.js) directement dans Firestore — jamais
 * calculé ou modifiable depuis le client, pour éviter qu'un
 * utilisateur ne puisse se l'auto-attribuer en modifiant le code JS
 * exécuté dans son navigateur.
 */
export async function fetchPremiumStatus(uid) {
  if (!isFirebaseConfigured) return loadLocalCache();
  try {
    const snap = await getDoc(premiumDocRef(uid));
    const isPremium = snap.exists() && snap.data().active === true;
    saveLocalCache(isPremium);
    return isPremium;
  } catch {
    return loadLocalCache();
  }
}

/**
 * S'abonne aux changements de statut Premium en direct (utile juste
 * après un paiement, pour refléter l'activation sans recharger l'app).
 */
export function subscribeToPremiumStatus(uid, callback) {
  if (!isFirebaseConfigured) {
    callback(loadLocalCache());
    return () => {};
  }
  return onSnapshot(premiumDocRef(uid), (snap) => {
    const isPremium = snap.exists() && snap.data().active === true;
    saveLocalCache(isPremium);
    callback(isPremium);
  });
}

function loadLocalCache() {
  // Repli hors-ligne uniquement : reflète le dernier statut connu,
  // pas une source de vérité — toujours re-vérifié dès que le réseau revient.
  return localStorage.getItem(LOCAL_CACHE_KEY) === "true";
}

function saveLocalCache(isPremium) {
  localStorage.setItem(LOCAL_CACHE_KEY, String(isPremium));
}
