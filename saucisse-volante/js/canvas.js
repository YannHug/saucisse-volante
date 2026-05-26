// ─────────────────────────────────────────────────────────────────────────────
// canvas.js — Dessin de la cible et animation de la saucisse volante
// ─────────────────────────────────────────────────────────────────────────────

import { C, PALETTE } from "./config.js";
import { h, useSaucisseImg, drawSaucisseImg } from "./components.js";

const { useRef, useEffect, useCallback } = React;

export function TargetCanvas({ segments, winner, animating, size }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const saucisseImg = useSaucisseImg();
  const S = size, CX = S/2;
  const R_OUT = S*0.44, R_MID = S*0.30, R_IN = S*0.16;

  const drawBoard = useCallback((ctx, highlight) => {
    ctx.fillStyle = C.board;
    ctx.fillRect(0, 0, S, S);
    ctx.strokeStyle = C.boardLine; ctx.lineWidth = 1;
    for (let i = 0; i < S; i += S/16) {
      ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,S); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(S,i); ctx.stroke();
    }
    if (segments.length === 0) {
      ctx.fillStyle = C.chalkDim;
      ctx.font = `bold ${S*0.035}px 'Courier New'`;
      ctx.textAlign = "center";
      ctx.fillText("AUCUN MILITAIRE", CX, CX-10);
      ctx.fillText("ENREGISTRÉ", CX, CX+14);
      return;
    }
    segments.forEach((seg, i) => {
      const sa = seg.start*Math.PI*2 - Math.PI/2;
      const ea = seg.end  *Math.PI*2 - Math.PI/2;
      const col = PALETTE[i % PALETTE.length];
      const isW = highlight && winner && seg.id === winner.id;
      ctx.beginPath(); ctx.moveTo(CX,CX);
      ctx.arc(CX, CX, R_OUT, sa, ea); ctx.closePath();
      ctx.fillStyle = isW ? col : col+"bb";
      if (isW) { ctx.shadowColor = col; ctx.shadowBlur = 18; }
      ctx.fill(); ctx.shadowBlur = 0;
      ctx.strokeStyle = C.bgPanel; ctx.lineWidth = 1.5; ctx.stroke();
      const mid = (sa+ea)/2, frac = seg.end - seg.start;
      if (frac > 0.045) {
        const lx = CX + R_OUT*0.72*Math.cos(mid);
        const ly = CX + R_OUT*0.72*Math.sin(mid);
        ctx.save(); ctx.translate(lx,ly); ctx.rotate(mid+Math.PI/2);
        ctx.fillStyle = "#fff";
        ctx.font = `bold ${S*0.025}px 'Courier New'`;
        ctx.textAlign = "center";
        const n = seg.name.split(" ")[0];
        ctx.fillText(n.length>7 ? n.slice(0,6)+"." : n, 0, 0);
        ctx.restore();
      }
    });
    ctx.beginPath(); ctx.arc(CX,CX,R_MID,0,Math.PI*2);
    ctx.fillStyle = C.board+"ee"; ctx.fill();
    ctx.strokeStyle = C.chalkFaint; ctx.lineWidth=1.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(CX,CX,R_IN,0,Math.PI*2);
    ctx.fillStyle = C.board; ctx.fill();
    ctx.strokeStyle = C.chalkDim; ctx.lineWidth=1.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(CX,CX,S*0.045,0,Math.PI*2);
    ctx.fillStyle = C.red; ctx.shadowColor="#ff0000"; ctx.shadowBlur=12;
    ctx.fill(); ctx.shadowBlur=0;
    ctx.beginPath(); ctx.arc(CX,CX,S*0.018,0,Math.PI*2);
    ctx.fillStyle = C.chalk; ctx.fill();
    ctx.strokeStyle = C.chalkFaint; ctx.lineWidth=1;
    ctx.setLineDash([3,5]);
    ctx.beginPath(); ctx.moveTo(CX,0); ctx.lineTo(CX,S); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,CX); ctx.lineTo(S,CX); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(CX,CX,R_OUT+2,0,Math.PI*2);
    ctx.strokeStyle = C.chalkDim; ctx.lineWidth=2; ctx.stroke();
  }, [segments, winner, S, CX, R_OUT, R_MID, R_IN]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    cancelAnimationFrame(rafRef.current);

    if (!animating) {
      drawBoard(ctx, !!winner);
      if (winner) {
        const seg = segments.find(s => s.id === winner.id);
        if (seg) {
          const mid = ((seg.start+seg.end)/2)*Math.PI*2 - Math.PI/2;
          const sx = CX + R_OUT*0.72*Math.cos(mid);
          const sy = CX + R_OUT*0.72*Math.sin(mid);
          drawSaucisseImg(ctx, saucisseImg, sx, sy, mid + Math.PI/2, S/400);
        }
      }
      return;
    }

    // Animation vol
    const state = { angle: -0.3, spin: 0.06 };
    const targetSeg = winner ? segments.find(s => s.id === winner.id) : null;
    const tAngle = targetSeg
      ? ((targetSeg.start+targetSeg.end)/2)*Math.PI*2 - Math.PI/2 : 0;
    const tX = CX + R_OUT*0.72*Math.cos(tAngle);
    const tY = CX + R_OUT*0.72*Math.sin(tAngle);
    const finalAngle = tAngle + Math.PI/2;

    let t = 0, dur = 110;
    function step() {
      t++;
      const prog = t/dur;
      const ease = 1 - Math.pow(1-prog, 3);
      const wobble = (1-ease)*28;
      const cx = CX*(1-ease) + tX*ease + (Math.random()-0.5)*wobble;
      const cy = -S*0.15 + (tY+S*0.15)*ease + (Math.random()-0.5)*wobble*0.4;
      const curAngle = state.angle + (finalAngle - state.angle) * ease;
      // ailes battent en début de vol
      const wingFlap = Math.sin(t * 0.4) * (1-ease) * 0.3;

      drawBoard(ctx, false);
      // ombre
      ctx.save(); ctx.globalAlpha = 0.18;
      drawSaucisseImg(ctx, saucisseImg, cx+4, cy+6, curAngle, S/400 * (0.7 + ease*0.3));
      ctx.restore();
      ctx.globalAlpha = 1;
      drawSaucisseImg(ctx, saucisseImg, cx, cy, curAngle + wingFlap, S/400 * (0.7 + ease*0.3));

      if (t < dur) rafRef.current = requestAnimationFrame(step);
      else {
        drawBoard(ctx, true);
        drawSaucisseImg(ctx, saucisseImg, tX, tY, finalAngle, S/400);
      }
    }
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animating, segments, winner, drawBoard, S, CX, R_OUT]);

  return h('canvas', {ref:canvasRef, width:S, height:S, style:{
      width:'100%', height:'auto', borderRadius:'50%',
      border:'3px solid '+C.borderLight,
      boxShadow:'0 4px 24px rgba(0,0,0,0.5), inset 0 0 40px rgba(0,0,0,0.3)',
      display:'block'
    }});
}
