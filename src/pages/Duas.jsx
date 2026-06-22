import { useState } from "react";
import { DUA_CATEGORIES } from "../lib/duaContent";
import "./Duas.css";

export default function Duas({ onBack }) {
  const [activeCategory, setActiveCategory] = useState(null);

  if (activeCategory) {
    const category = DUA_CATEGORIES.find((c) => c.id === activeCategory);
    return (
      <div className="duas-page">
        <header className="duas-header">
          <button className="duas-back" onClick={() => setActiveCategory(null)}>
            ← Catégories
          </button>
          <span className="home-eyebrow">Duas</span>
          <h1 className="duas-title">{category.icon} {category.label}</h1>
        </header>

        <ul className="dua-list">
          {category.duas.map((d, i) => (
            <li key={i} className="dua-card">
              <p className="dua-arabic" lang="ar" dir="rtl">{d.arabic}</p>
              <p className="dua-translit">{d.transliteration}</p>
              <p className="dua-translation">{d.translation}</p>
              <p className="dua-source">{d.source}</p>
            </li>
          ))}
        </ul>

        <p className="duas-note">
          Invocations largement attestées dans les recueils de hadiths
          authentiques. À visée d'étude et de pratique quotidienne, pas un
          avis savant (fatwa).
        </p>
      </div>
    );
  }

  return (
    <div className="duas-page">
      <header className="duas-header">
        <button className="duas-back" onClick={onBack}>
          ← Dhikr
        </button>
        <span className="home-eyebrow">Duas</span>
        <h1 className="duas-title">Invocations du quotidien</h1>
      </header>

      <ul className="dua-category-grid">
        {DUA_CATEGORIES.map((c) => (
          <li key={c.id}>
            <button className="dua-category-card" onClick={() => setActiveCategory(c.id)}>
              <span className="dua-category-icon">{c.icon}</span>
              <span className="dua-category-label">{c.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
