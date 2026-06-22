import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  linkWithCredential,
  EmailAuthProvider,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ⚠️ Toutes les valeurs viennent de variables d'environnement Vite.
// Crée un fichier .env.local (jamais commité) avec :
// VITE_FIREBASE_API_KEY=...
// VITE_FIREBASE_AUTH_DOMAIN=...
// VITE_FIREBASE_PROJECT_ID=...
// VITE_FIREBASE_STORAGE_BUCKET=...
// VITE_FIREBASE_MESSAGING_SENDER_ID=...
// VITE_FIREBASE_APP_ID=...
// Sur Vercel : Project Settings → Environment Variables, mêmes noms.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Détecte une configuration manquante (clés .env absentes en prod) pour
// afficher un message clair plutôt qu'un plantage silencieux. Les
// fonctionnalités hors compte (horaires, Coran, Qibla...) restent
// utilisables même sans Firebase configuré.
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

if (!isFirebaseConfigured && typeof console !== "undefined") {
  console.warn(
    "[Waxtubi] Configuration Firebase absente ou incomplète — les fonctionnalités de compte et de sauvegarde cloud (Dhikr, jeûne) seront indisponibles. Vérifie les variables d'environnement VITE_FIREBASE_*."
  );
}

let app, auth, db;
if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  // Évite un crash immédiat à l'import : les fonctions qui utilisent
  // auth/db plus loin vérifient isFirebaseConfigured avant de les appeler.
  auth = null;
  db = null;
}

export { auth, db };


/**
 * S'assure qu'un utilisateur (même anonyme) est connecté.
 * Résout avec l'utilisateur dès qu'on en a un. Sert de filet de
 * sécurité : si la personne n'a jamais créé de compte, ses données
 * (compteur Dhikr, etc.) restent quand même sauvegardées sous un
 * identifiant anonyme, qu'elle pourra "promouvoir" en vrai compte
 * plus tard via createAccountFromAnonymous.
 */
export function ensureAnonymousAuth() {
  if (!isFirebaseConfigured) {
    return Promise.reject(new Error("Firebase non configuré"));
  }
  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(
      auth,
      (user) => {
        if (user) {
          unsub();
          resolve(user);
        } else {
          signInAnonymously(auth).catch(reject);
        }
      },
      reject
    );
  });
}

/**
 * Crée un vrai compte (email + mot de passe) à partir de la session
 * anonyme en cours, en LIANT le compte existant plutôt qu'en créant
 * un nouvel utilisateur — ainsi les données déjà associées à l'UID
 * anonyme (compteur Dhikr, etc.) sont conservées automatiquement.
 */
export async function createAccountFromAnonymous(email, password) {
  const current = auth.currentUser;
  const credential = EmailAuthProvider.credential(email, password);

  if (current && current.isAnonymous) {
    const result = await linkWithCredential(current, credential);
    return result.user;
  }

  // Pas de session anonyme active (cas rare) : on crée un compte classique
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
}

/**
 * Connexion à un compte existant sur un nouveau téléphone.
 * Remplace la session anonyme locale par le vrai compte — les
 * données reviennent automatiquement car elles sont stockées sous
 * l'UID du compte, pas celui de l'appareil.
 */
export async function signInWithEmail(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function signOut() {
  await firebaseSignOut(auth);
}
