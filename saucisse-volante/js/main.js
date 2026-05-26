// ─────────────────────────────────────────────────────────────────────────────
// main.js — Point d'entrée : démarrage de l'application
// ─────────────────────────────────────────────────────────────────────────────

import { SaucisseVolante } from "./app.js";

function startApp() {
  try {
    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(React.createElement(SaucisseVolante));

    // Masquer le splash screen
    setTimeout(() => {
      const s = document.getElementById("splash");
      if (s) {
        s.style.opacity = "0";
        setTimeout(() => s.remove(), 500);
      }
    }, 500);
  } catch (err) {
    console.error("Erreur au démarrage:", err);
    const s = document.getElementById("splash");
    if (s) {
      s.innerHTML =
        '<p style="color:#C8A84B;font-family:monospace;padding:20px;text-align:center;font-size:13px">⚠ Erreur: ' +
        err.message +
        "</p>";
    }
  }
}

// React et ReactDOM sont chargés en synchrone dans le <head>
if (typeof React === "undefined" || typeof ReactDOM === "undefined") {
  document.getElementById("splash").innerHTML =
    '<p style="color:#C8A84B;font-family:monospace;padding:20px;text-align:center;font-size:13px">⚠ Connexion internet requise au premier lancement.<br><br>Vérifie ta connexion et recharge la page.</p>';
} else {
  startApp();
}

// ── Service Worker (HTTPS uniquement, pour le mode hors-ligne PWA) ──
if ("serviceWorker" in navigator && location.protocol === "https:") {
  navigator.serviceWorker.register("./sw.js").catch(() => {
    /* normal en local */
  });
}
