import { useCallback, useState } from "react";

const SHARE_SUPPORTED = typeof navigator !== "undefined" && "share" in navigator;

/**
 * Partage natif via l'API Web Share (ouvre le sélecteur d'apps du
 * téléphone : WhatsApp, SMS, etc.). Si non supporté (certains
 * navigateurs desktop), copie le texte dans le presse-papier à la
 * place et l'indique à l'utilisateur.
 */
export function useShare() {
  const [feedback, setFeedback] = useState(null); // "copied" | "shared" | null

  const share = useCallback(async ({ title, text }) => {
    if (SHARE_SUPPORTED) {
      try {
        await navigator.share({ title, text });
        setFeedback("shared");
      } catch {
        // L'utilisateur a annulé le partage, ou erreur — pas grave, pas de feedback
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(`${title}\n\n${text}`);
      setFeedback("copied");
      setTimeout(() => setFeedback(null), 2500);
    } catch {
      // Échec silencieux si même le presse-papier n'est pas accessible
    }
  }, []);

  return { share, supported: SHARE_SUPPORTED, feedback };
}
