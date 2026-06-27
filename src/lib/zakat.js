// Calculateur de Zakat — Waxtubi.
//
// Règles appliquées, vérifiées sur plusieurs sources concordantes :
// - Taux : 2.5% de la richesse zakatable au-dessus du Nisab
// - Nisab : équivalent de 87,48 g d'or OU 612,36 g d'argent (le plus
//   bas des deux, approche la plus prudente recommandée par de
//   nombreux savants — plus de personnes s'acquittent ainsi de leur
//   obligation)
// - Condition du Hawl : la richesse doit être restée au-dessus du
//   Nisab pendant une année lunaire complète — ce calculateur ne
//   vérifie pas cette condition automatiquement (impossible sans
//   historique), il la rappelle simplement à l'utilisateur
// - Désaccord entre écoles sur les bijoux portés au quotidien (l'école
//   hanafite les inclut, les écoles malikite/chafiite/hanbalite les
//   excluent) : ce calculateur reste neutre et laisse le choix à
//   l'utilisateur plutôt que de trancher
//
// Sources des prix : gold-api.com (gratuite, CORS activé, sans clé).
const GOLD_NISAB_GRAMS = 87.48;
const SILVER_NISAB_GRAMS = 612.36;
const ZAKAT_RATE = 0.025;
const GRAMS_PER_OUNCE = 31.1035;

const API_BASE = "https://api.gold-api.com";

/**
 * Récupère le prix actuel de l'or et de l'argent (en USD par once),
 * puis les convertit en USD par gramme.
 */
export async function fetchMetalPrices() {
  const [goldRes, silverRes] = await Promise.all([
    fetch(`${API_BASE}/price/XAU`),
    fetch(`${API_BASE}/price/XAG`),
  ]);

  if (!goldRes.ok || !silverRes.ok) {
    throw new Error("Cours de l'or/argent indisponible pour le moment");
  }

  const goldJson = await goldRes.json();
  const silverJson = await silverRes.json();

  const goldPricePerOunce = goldJson.price;
  const silverPricePerOunce = silverJson.price;

  return {
    goldPerGramUsd: goldPricePerOunce / GRAMS_PER_OUNCE,
    silverPerGramUsd: silverPricePerOunce / GRAMS_PER_OUNCE,
  };
}

/**
 * Calcule le Nisab (en USD) pour l'or et l'argent, à partir des prix
 * actuels — jamais une valeur codée en dur, puisque ça fluctue
 * quotidiennement.
 */
export function computeNisabUsd({ goldPerGramUsd, silverPerGramUsd }) {
  return {
    goldNisabUsd: goldPerGramUsd * GOLD_NISAB_GRAMS,
    silverNisabUsd: silverPerGramUsd * SILVER_NISAB_GRAMS,
  };
}

/**
 * Calcule le Zakat dû à partir des actifs déclarés par l'utilisateur.
 * @param {object} assets - { cash, gold, silver, investments, businessAssets, debts }
 *   cash, investments, businessAssets sont déjà en valeur monétaire ;
 *   gold et silver sont en grammes (convertis ici en valeur).
 * @param {object} prices - { goldPerGramUsd, silverPerGramUsd }
 * @param {"gold"|"silver"} nisabBasis - quel seuil utiliser (silver = plus prudent)
 */
export function computeZakat(assets, prices, nisabBasis = "silver") {
  const goldValue = (assets.goldGrams || 0) * prices.goldPerGramUsd;
  const silverValue = (assets.silverGrams || 0) * prices.silverPerGramUsd;
  const totalAssets =
    (assets.cash || 0) +
    (assets.investments || 0) +
    (assets.businessAssets || 0) +
    goldValue +
    silverValue;

  const netWealth = Math.max(0, totalAssets - (assets.debts || 0));

  const { goldNisabUsd, silverNisabUsd } = computeNisabUsd(prices);
  const nisabThreshold = nisabBasis === "gold" ? goldNisabUsd : silverNisabUsd;

  const meetsNisab = netWealth >= nisabThreshold;
  const zakatDue = meetsNisab ? netWealth * ZAKAT_RATE : 0;

  return {
    totalAssets,
    netWealth,
    nisabThreshold,
    meetsNisab,
    zakatDue,
    goldValue,
    silverValue,
  };
}
