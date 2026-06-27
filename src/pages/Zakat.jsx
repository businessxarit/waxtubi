import { useState, useEffect } from "react";
import { fetchMetalPrices, computeZakat } from "../lib/zakat";
import "./Zakat.css";

const EMPTY_FORM = {
  cash: "",
  investments: "",
  businessAssets: "",
  goldGrams: "",
  silverGrams: "",
  debts: "",
};

export default function Zakat({ onBack }) {
  const [prices, setPrices] = useState(null);
  const [priceError, setPriceError] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [nisabBasis, setNisabBasis] = useState("silver");
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchMetalPrices()
      .then(setPrices)
      .catch((e) => setPriceError(e.message));
  }, []);

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setResult(null);
  }

  function handleCalculate() {
    if (!prices) return;
    const assets = {
      cash: parseFloat(form.cash) || 0,
      investments: parseFloat(form.investments) || 0,
      businessAssets: parseFloat(form.businessAssets) || 0,
      goldGrams: parseFloat(form.goldGrams) || 0,
      silverGrams: parseFloat(form.silverGrams) || 0,
      debts: parseFloat(form.debts) || 0,
    };
    setResult(computeZakat(assets, prices, nisabBasis));
  }

  function formatUsd(n) {
    return n.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
  }

  return (
    <div className="zakat-page">
      <header className="zakat-header">
        <button className="zakat-back" onClick={onBack}>← Retour</button>
        <span className="home-eyebrow">Zakat</span>
        <h1 className="zakat-title">Calculateur de Zakat</h1>
      </header>

      {priceError && <p className="zakat-status zakat-error">{priceError}</p>}
      {!prices && !priceError && <p className="zakat-status">Récupération des cours de l'or/argent…</p>}

      {prices && (
        <>
          <div className="zakat-nisab-switch">
            <span className="zakat-nisab-label">Seuil (Nisab) basé sur :</span>
            <div className="zakat-nisab-options">
              <button className={nisabBasis === "silver" ? "is-active" : ""} onClick={() => setNisabBasis("silver")}>
                Argent (plus prudent)
              </button>
              <button className={nisabBasis === "gold" ? "is-active" : ""} onClick={() => setNisabBasis("gold")}>
                Or
              </button>
            </div>
          </div>

          <div className="zakat-form">
            <label className="zakat-field">
              <span>Liquidités (espèces, comptes bancaires) en $</span>
              <input type="number" inputMode="decimal" value={form.cash} onChange={(e) => updateField("cash", e.target.value)} placeholder="0" />
            </label>
            <label className="zakat-field">
              <span>Or possédé (grammes)</span>
              <input type="number" inputMode="decimal" value={form.goldGrams} onChange={(e) => updateField("goldGrams", e.target.value)} placeholder="0" />
            </label>
            <label className="zakat-field">
              <span>Argent possédé (grammes)</span>
              <input type="number" inputMode="decimal" value={form.silverGrams} onChange={(e) => updateField("silverGrams", e.target.value)} placeholder="0" />
            </label>
            <label className="zakat-field">
              <span>Investissements / actions en $</span>
              <input type="number" inputMode="decimal" value={form.investments} onChange={(e) => updateField("investments", e.target.value)} placeholder="0" />
            </label>
            <label className="zakat-field">
              <span>Actifs professionnels (stock, marchandises) en $</span>
              <input type="number" inputMode="decimal" value={form.businessAssets} onChange={(e) => updateField("businessAssets", e.target.value)} placeholder="0" />
            </label>
            <label className="zakat-field">
              <span>Dettes à déduire (à payer dans l'année) en $</span>
              <input type="number" inputMode="decimal" value={form.debts} onChange={(e) => updateField("debts", e.target.value)} placeholder="0" />
            </label>
          </div>

          <button className="zakat-calculate-btn" onClick={handleCalculate}>
            Calculer
          </button>

          {result && (
            <div className="zakat-result">
              <p className="zakat-result-row">
                <span>Richesse nette</span>
                <strong>${formatUsd(result.netWealth)}</strong>
              </p>
              <p className="zakat-result-row">
                <span>Seuil du Nisab ({nisabBasis === "gold" ? "or" : "argent"})</span>
                <strong>${formatUsd(result.nisabThreshold)}</strong>
              </p>
              {result.meetsNisab ? (
                <>
                  <p className="zakat-result-due-label">Zakat dû (2,5%)</p>
                  <p className="zakat-result-due-value">${formatUsd(result.zakatDue)}</p>
                </>
              ) : (
                <p className="zakat-no-zakat">
                  Ta richesse nette est sous le seuil du Nisab — le Zakat n'est pas obligatoire cette année selon ce calcul.
                </p>
              )}
            </div>
          )}
        </>
      )}

      <div className="zakat-notes">
        <p>
          <strong>Condition du Hawl :</strong> le Zakat n'est dû que si cette
          richesse est restée au-dessus du Nisab pendant une année lunaire
          complète. Ce calculateur ne vérifie pas cette condition — à toi de
          la confirmer.
        </p>
        <p>
          <strong>Bijoux portés au quotidien :</strong> les écoles
          juridiques ne s'accordent pas sur leur statut (l'école hanafite
          les inclut dans le Zakat, les écoles malikite, chafiite et
          hanbalite les en exemptent généralement). Inclus-les ou non selon
          ce que tu suis.
        </p>
        <p className="zakat-disclaimer">
          Ce calculateur donne une estimation à visée pratique, pas un avis
          savant (fatwa). Pour une situation complexe (entreprise, dettes
          importantes, actifs multiples), consulte un savant ou une
          organisation caritative reconnue.
        </p>
      </div>
    </div>
  );
}
