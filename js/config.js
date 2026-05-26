// ─────────────────────────────────────────────────────────────────────────────
// config.js — Données de référence : grades, points, palette, thème
// ─────────────────────────────────────────────────────────────────────────────

// Points attribués selon le grade (plus le grade est élevé, plus de points)
export const GRADE_POINTS = {
  "Soldat 2e classe": 0,
  "Soldat 1re classe": 1,
  "Caporal": 2,
  "Caporal-chef": 3,
  "Caporal-chef de 1re classe": 4,
  "Sergent": 5,
  "Sergent-chef": 6,
  "Adjudant": 7,
  "Adjudant-chef": 8,
  "Major": 9,
  "Aspirant": 6,
  "Sous-lieutenant": 7,
  "Lieutenant": 8,
  "Capitaine": 9,
  "Commandant": 10,
  "Lieutenant-colonel": 11,
  "Colonel": 12,
};

export const GRADES = Object.keys(GRADE_POINTS);

// Palette camouflage / craie pour les segments de la cible
export const PALETTE = [
  "#8B1A1A", "#B8860B", "#4A6741", "#2F4F2F", "#8B6914",
  "#A0522D", "#556B2F", "#8B4513", "#6B8E23", "#704214",
  "#5F4B32", "#3B5323", "#C19A6B", "#7B4F2E", "#4E6E58",
];

// Couleurs du thème "tente militaire / tableau de briefing"
export const C = {
  bg:          "#2C2416",  // fond toile kaki foncé
  bgPanel:     "#1E1A0F",  // panneaux latéraux
  chalk:       "#E8DFC0",  // craie blanc cassé
  chalkDim:    "#A89870",  // craie atténuée
  chalkFaint:  "#6B5E42",  // craie très atténuée
  board:       "#1A2B1A",  // tableau noir vert foncé
  boardLine:   "#243824",  // lignes du tableau
  accent:      "#C8A84B",  // or kaki
  red:         "#8B2020",  // rouge bullseye
  border:      "#4A3F2A",
  borderLight: "#6B5A3A",
};

// Chemin de l'image de la saucisse
export const SAUCISSE_URL = "./assets/saucisse.png";
