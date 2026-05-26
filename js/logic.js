// ─────────────────────────────────────────────────────────────────────────────
// logic.js — Logique métier pure (calcul des poids, segments, tirage)
// ─────────────────────────────────────────────────────────────────────────────

// Poids INVERSÉ : plus un militaire a de points (grade + ancienneté),
// plus sa case est petite → moins de chances d'être désigné.
export function getInverseWeight(pts) {
  return Math.max(1, 100 - pts * 3);
}

// Découpe la cible en segments proportionnels au poids inverse de chaque militaire.
// Chaque segment a un start/end (fraction de 0 à 1) et un pourcentage affiché.
export function buildSegments(soldiers) {
  const total = soldiers.reduce((sum, m) => sum + getInverseWeight(m.totalPoints), 0);
  let cumul = 0;
  return soldiers.map((m) => {
    const w = getInverseWeight(m.totalPoints);
    const start = cumul / total;
    const end = (cumul + w) / total;
    cumul += w;
    return { ...m, start, end, pct: ((w / total) * 100).toFixed(1) };
  });
}

// Tire au sort un gagnant selon la répartition des segments.
export function pickWinner(segments) {
  const r = Math.random();
  return segments.find((s) => r >= s.start && r < s.end) || segments[segments.length - 1];
}
