// Représentation visuelle progressive du streak — un arbre stylisé qui
// gagne des branches/feuilles à mesure que la série de jours augmente.
// Conçu dans l'esprit géométrique Waxtubi (cuivre/laiton sur fond sapin),
// pas une reproduction d'un concept visuel d'une autre app.

const STAGES = [
  { min: 0, label: "Une graine plantée" },
  { min: 1, label: "Premier bourgeon" },
  { min: 3, label: "Jeune pousse" },
  { min: 7, label: "Petit arbre" },
  { min: 15, label: "Arbre qui s'épanouit" },
  { min: 30, label: "Arbre en pleine force" },
  { min: 60, label: "Arbre porteur de fruits" },
];

function getStage(streak) {
  let current = STAGES[0];
  for (const stage of STAGES) {
    if (streak >= stage.min) current = stage;
  }
  return current;
}

export default function StreakTree({ streak, size = 140 }) {
  const stage = getStage(streak);
  const stageIndex = STAGES.indexOf(stage);
  const branchCount = Math.min(stageIndex, 5);
  const hasFruit = stageIndex >= 6;
  const trunkHeight = 20 + stageIndex * 8;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width={size} height={size} viewBox="0 0 140 140">
        {/* Sol */}
        <line x1="20" y1="120" x2="120" y2="120" stroke="var(--ink-raised)" strokeWidth="2" />

        {/* Tronc */}
        <line
          x1="70" y1="120" x2="70" y2={120 - trunkHeight}
          stroke="var(--brass)" strokeWidth="4" strokeLinecap="round"
        />

        {/* Branches, une par palier atteint */}
        {Array.from({ length: branchCount }).map((_, i) => {
          const y = 120 - trunkHeight + 8 + i * (trunkHeight / (branchCount + 1));
          const side = i % 2 === 0 ? 1 : -1;
          const length = 14 + i * 2;
          return (
            <g key={i}>
              <line
                x1="70" y1={y}
                x2={70 + side * length} y2={y - length * 0.5}
                stroke="var(--brass)" strokeWidth="2.5" strokeLinecap="round"
              />
              <circle
                cx={70 + side * length} cy={y - length * 0.5}
                r={hasFruit ? 5 : 4}
                fill={hasFruit ? "var(--copper)" : "var(--sage)"}
              />
            </g>
          );
        })}

        {/* Bourgeon au sommet si le streak vient juste de démarrer */}
        {stageIndex === 0 && (
          <circle cx="70" cy={120 - trunkHeight} r="3" fill="var(--sage)" opacity="0.6" />
        )}
        {stageIndex >= 1 && (
          <circle cx="70" cy={120 - trunkHeight} r="5" fill="var(--copper-bright)" />
        )}
      </svg>
      <span style={{ fontFamily: "var(--font-display)", fontSize: 14, color: "var(--copper-bright)", textAlign: "center" }}>
        {stage.label}
      </span>
    </div>
  );
}
