// Proxy audio — fonction serverless Vercel.
//
// Pourquoi ce fichier existe : le CDN audio (cdn.islamic.network) ne
// renvoie pas l'en-tête CORS nécessaire pour qu'un navigateur télécharge
// le fichier via fetch() depuis un autre domaine (le tien). La balise
// <audio> HTML s'en sort très bien (lecture simple, non soumise à CORS),
// mais le téléchargement programmatique (pour l'écoute hors-ligne) est
// bloqué par le navigateur sans cet en-tête.
//
// Cette fonction tourne côté serveur Vercel (pas dans le navigateur) :
// elle télécharge le fichier à la place de l'utilisateur, puis le
// renvoie avec les en-têtes CORS corrects. Le navigateur ne voit alors
// qu'une requête vers ton propre domaine — plus de blocage.
export default async function handler(req, res) {
  const { url } = req.query;

  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "Paramètre 'url' manquant" });
    return;
  }

  // Sécurité : n'autorise le relais que vers le CDN audio attendu,
  // pour éviter que cette fonction serve de proxy ouvert vers
  // n'importe quel site.
  const ALLOWED_HOST = "cdn.islamic.network";
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    res.status(400).json({ error: "URL invalide" });
    return;
  }
  if (parsed.hostname !== ALLOWED_HOST) {
    res.status(403).json({ error: "Domaine non autorisé pour ce proxy" });
    return;
  }

  try {
    const upstream = await fetch(parsed.toString());
    if (!upstream.ok) {
      res.status(upstream.status).json({ error: `Le serveur audio a répondu ${upstream.status}` });
      return;
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", upstream.headers.get("content-type") || "audio/mpeg");
    const contentLength = upstream.headers.get("content-length");
    if (contentLength) res.setHeader("Content-Length", contentLength);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.status(200).send(buffer);
  } catch (e) {
    res.status(502).json({ error: `Relais audio impossible : ${e.message}` });
  }
}
