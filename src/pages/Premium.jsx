import { usePremium } from "../hooks/usePremium";
import { useAuth } from "../hooks/useAuth";
import "./Premium.css";

// Liens de checkout Polar — à remplacer par tes vrais liens une fois
// tes produits créés dans le dashboard Polar (Products → Checkout Links).
// Chaque lien doit transmettre l'UID Firebase de l'utilisateur en
// paramètre pour que le webhook puisse relier le paiement au compte.
const MONTHLY_CHECKOUT_BASE = "https://polar.sh/checkout/REMPLACER_PAR_TON_LIEN_MENSUEL";
const YEARLY_CHECKOUT_BASE = "https://polar.sh/checkout/REMPLACER_PAR_TON_LIEN_ANNUEL";

const PREMIUM_BENEFITS = [
  { icon: "☁️", title: "Sauvegarde cloud illimitée", text: "Compteurs Dhikr, suivi de jeûne et de prière synchronisés sans limite sur tous tes appareils." },
  { icon: "🎨", title: "Thèmes exclusifs", text: "Palettes de couleurs supplémentaires, au-delà du clair/sombre classique." },
  { icon: "⬇️", title: "Téléchargement hors-ligne sans limite", text: "Tous les récitateurs, toutes les sourates, sans restriction de quota." },
  { icon: "📖", title: "Mode Mushaf complet", text: "Pagination étendue et options de mise en page avancées." },
  { icon: "🖋️", title: "Polices arabes supplémentaires", text: "Styles calligraphiques additionnels pour la lecture du Coran." },
  { icon: "📊", title: "Statistiques détaillées", text: "Historique complet, graphiques de progression sur le long terme." },
  { icon: "🔔", title: "Toutes les tonalités de notification", text: "Choix étendu de signaux sonores pour les rappels de prière." },
];

export default function Premium({ onBack }) {
  const { isPremium, status } = usePremium();
  const { user } = useAuth();

  const monthlyUrl = user ? `${MONTHLY_CHECKOUT_BASE}?customer_external_id=${user.uid}` : MONTHLY_CHECKOUT_BASE;
  const yearlyUrl = user ? `${YEARLY_CHECKOUT_BASE}?customer_external_id=${user.uid}` : YEARLY_CHECKOUT_BASE;

  return (
    <div className="premium-page">
      <header className="premium-header">
        <button className="premium-back" onClick={onBack}>← Retour</button>
        <span className="home-eyebrow">Premium</span>
        <h1 className="premium-title">Waxtubi Premium</h1>
      </header>

      {status === "loading" && <p className="premium-status">Vérification de ton statut…</p>}

      {isPremium ? (
        <div className="premium-active-card">
          <p>✓ Tu profites déjà de Waxtubi Premium.</p>
          <p className="premium-active-note">
            Gère ou annule ton abonnement depuis l'e-mail de confirmation
            reçu lors de ton paiement (lien vers le portail client Polar).
          </p>
        </div>
      ) : (
        <>
          <ul className="premium-benefits">
            {PREMIUM_BENEFITS.map((b) => (
              <li key={b.title} className="premium-benefit-row">
                <span className="premium-benefit-icon">{b.icon}</span>
                <span className="premium-benefit-text">
                  <strong>{b.title}</strong>
                  <span>{b.text}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="premium-plans">
            <a className="premium-plan-card" href={monthlyUrl} target="_blank" rel="noopener noreferrer">
              <span className="premium-plan-label">Mensuel</span>
              <span className="premium-plan-cta">S'abonner →</span>
            </a>
            <a className="premium-plan-card is-best" href={yearlyUrl} target="_blank" rel="noopener noreferrer">
              <span className="premium-plan-badge">Économise 2 mois</span>
              <span className="premium-plan-label">Annuel</span>
              <span className="premium-plan-cta">S'abonner →</span>
            </a>
          </div>

          <p className="premium-note">
            Paiement sécurisé via Polar (carte bancaire). L'essentiel de
            Waxtubi — horaires de prière, Coran complet, Qibla, Dhikr,
            calendrier — reste et restera gratuit.
          </p>
        </>
      )}
    </div>
  );
}
