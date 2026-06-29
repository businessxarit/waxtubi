// Webhook Polar — fonction serverless Vercel.
//
// Reçoit les événements de paiement/abonnement de Polar (Merchant of
// Record) et met à jour le statut Premium de l'utilisateur dans
// Firestore. C'est la SEULE source de vérité pour activer/désactiver
// le Premium côté serveur — jamais modifiable depuis le client.
//
// Configuration requise sur Vercel (variables d'environnement) :
// - POLAR_WEBHOOK_SECRET : secret de signature du webhook (Polar dashboard)
// - FIREBASE_SERVICE_ACCOUNT_JSON : clé de service Firebase Admin (JSON, en une ligne)
//
// Configuration requise sur Polar :
// - Dashboard → Webhooks → ajouter un endpoint vers
//   https://waxtubi.vercel.app/api/polar-webhook
// - Écouter les événements : subscription.active, subscription.canceled,
//   subscription.revoked, subscription.updated
// - Lors du checkout, passer le Firebase UID de l'utilisateur en
//   `customer_external_id` ou dans les metadata du checkout, pour
//   pouvoir relier le paiement Polar à un compte Waxtubi précis.

import { Webhook } from "standardwebhooks";
import admin from "firebase-admin";

function getFirebaseAdmin() {
  if (admin.apps.length) return admin.app();
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

async function setPremiumStatus(uid, active) {
  const app = getFirebaseAdmin();
  const db = app.firestore();
  await db
    .collection("users")
    .doc(uid)
    .collection("subscription")
    .doc("status")
    .set({ active, updatedAt: Date.now() }, { merge: true });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Méthode non autorisée" });
    return;
  }

  const secret = process.env.POLAR_WEBHOOK_SECRET;
  if (!secret) {
    res.status(500).json({ error: "POLAR_WEBHOOK_SECRET non configuré" });
    return;
  }

  let event;
  try {
    const wh = new Webhook(secret);
    event = wh.verify(JSON.stringify(req.body), req.headers);
  } catch (e) {
    res.status(400).json({ error: `Signature de webhook invalide : ${e.message}` });
    return;
  }

  try {
    const uid =
      event.data?.customer?.externalId ||
      event.data?.metadata?.firebaseUid ||
      null;

    if (!uid) {
      // Pas d'UID associé — on accepte la requête (pour ne pas faire
      // réessayer Polar indéfiniment) mais on ne peut rien activer.
      res.status(200).json({ ok: true, skipped: "no uid" });
      return;
    }

    switch (event.type) {
      case "subscription.active":
      case "subscription.updated":
        await setPremiumStatus(uid, true);
        break;
      case "subscription.canceled":
      case "subscription.revoked":
        await setPremiumStatus(uid, false);
        break;
      default:
        // Autres événements (order.created, checkout.updated, etc.) :
        // ignorés ici, mais acceptés pour ne pas générer de retries inutiles.
        break;
    }

    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: `Traitement du webhook échoué : ${e.message}` });
  }
}
