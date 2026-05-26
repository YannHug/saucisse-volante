// ─────────────────────────────────────────────────────────────────────────────
// components.js — Helper createElement, chargement image, petits composants
// ─────────────────────────────────────────────────────────────────────────────

import { C, SAUCISSE_URL } from "./config.js";

const { useState, useEffect } = React;

// Helper compact pour React.createElement (évite le JSX, donc pas de build)
export function h(type, props, ...children) {
  const args = [type, props];
  children.forEach((c) => {
    if (Array.isArray(c)) {
      c.forEach((sub) => {
        if (sub !== null && sub !== false && sub !== undefined) args.push(sub);
      });
    } else if (c !== null && c !== false && c !== undefined) {
      args.push(c);
    }
  });
  return React.createElement.apply(React, args);
}

// ── Chargement de l'image saucisse (singleton partagé) ──
let _img = null;
let _loaded = false;
const _callbacks = [];

(function preload() {
  const image = new Image();
  image.onload = () => {
    _img = image;
    _loaded = true;
    _callbacks.forEach((cb) => cb(image));
  };
  image.src = SAUCISSE_URL;
})();

// Hook qui renvoie l'image une fois chargée
export function useSaucisseImg() {
  const [img, setImg] = useState(_img);
  useEffect(() => {
    if (_loaded) {
      setImg(_img);
      return;
    }
    _callbacks.push(setImg);
    return () => {
      const i = _callbacks.indexOf(setImg);
      if (i > -1) _callbacks.splice(i, 1);
    };
  }, []);
  return img;
}

// Dessine la saucisse sur le canvas (centrée, tournée, mise à l'échelle)
export function drawSaucisseImg(ctx, img, x, y, angle, scale = 1) {
  if (!img) return;
  const w = 88 * scale;
  const hgt = 88 * scale;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.drawImage(img, -w / 2, -hgt / 2, w, hgt);
  ctx.restore();
}

// ── Petit label de section ──
export function Label(props) {
  return h(
    "div",
    {
      style: {
        fontSize: 10,
        letterSpacing: 3,
        color: C.chalkFaint,
        marginBottom: 4,
        textTransform: "uppercase",
      },
    },
    props.children
  );
}

// ── Icône saucisse du header ──
export function SaucisseIcon(props) {
  const size = props.size || 40;
  return h("img", {
    src: SAUCISSE_URL,
    width: size,
    height: size,
    alt: "saucisse volante",
    style: { display: "block" },
  });
}
