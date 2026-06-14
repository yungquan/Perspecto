import { useState, useRef, useEffect, useCallback } from "react";
import {
  RotateCcw, Upload, ImageIcon, Layers, Sliders, Eye,
  Download, Share2, X, Loader, Droplets, Monitor,
  Undo2, ZoomIn, ChevronRight, Code2, Copy, ClipboardCopy,
  Lock, Sparkles, CheckCircle2, Link2, ChevronDown, Zap,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// FREEMIUM CONFIG
// ─────────────────────────────────────────────────────────────

const FREE_EXPORTS   = 3;   // exports before paywall
const FREE_SCALE     = 1;   // 1× resolution for free
const PRO_SCALE      = 2;   // 2× retina for pro

// !! REPLACE THIS with your actual Polar.sh product checkout URL
// Get it from: polar.sh → Products → your product → "Buy" button URL
const POLAR_CHECKOUT_URL = "https://buy.polar.sh/REPLACE_WITH_YOUR_PRODUCT_ID";

const LS_PRO_KEY     = "perspecto_pro";      // localStorage keys
const LS_EXPORT_KEY  = "perspecto_exports";

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

const DEFAULTS = {
  perspective: 1000,
  rotateX: 18,
  rotateY: -22,
  rotateZ: 0,
  shadowIntensity: 0.45,
  layerSep: 40,
  bgBlur: 0,
  glassBorder: false,
  showFrame: false,
  curveScreen: false,
  curveIntensity: 40,
  showWatermark: true,
  exportBg: "transparent",
  zoom: 100,
};

const PRESETS = [
  { label: "Flat",         rotateX: 0,  rotateY: 0,   rotateZ: 0, perspective: 1000 },
  { label: "Hero",         rotateX: 8,  rotateY: -15,  rotateZ: 0, perspective: 1200 },
  { label: "Product Hunt", rotateX: 20, rotateY: -30,  rotateZ: 0, perspective: 900  },
  { label: "Side View",    rotateX: 20, rotateY: 30,   rotateZ: 0, perspective: 900  },
  { label: "Top Down",     rotateX: 55, rotateY: 0,    rotateZ: 0, perspective: 800  },
  { label: "Floating",     rotateX: 12, rotateY: -22,  rotateZ: 2, perspective: 1000 },
];

const T_SLIDERS = [
  { key: "perspective",     label: "Perspective",  min: 500, max: 2000, step: 10,   unit: "px", dec: 0 },
  { key: "rotateX",         label: "Rotate X",     min: -90, max: 90,   step: 1,    unit: "°",  dec: 0 },
  { key: "rotateY",         label: "Rotate Y",     min: -90, max: 90,   step: 1,    unit: "°",  dec: 0 },
  { key: "rotateZ",         label: "Rotate Z",     min: -90, max: 90,   step: 1,    unit: "°",  dec: 0 },
  { key: "shadowIntensity", label: "Shadow Depth", min: 0,   max: 1,    step: 0.01, unit: "",   dec: 2 },
  { key: "zoom",            label: "Preview Zoom", min: 40,  max: 160,  step: 5,    unit: "%",  dec: 0 },
];

const L_SLIDERS = [
  { key: "layerSep", label: "Layer Depth",      min: 0, max: 150, step: 1,   unit: "px", dec: 0 },
  { key: "bgBlur",   label: "Background Blur",  min: 0, max: 20,  step: 0.5, unit: "px", dec: 1 },
];

// ─────────────────────────────────────────────────────────────
// DEMO IMAGE — fake SaaS dashboard SVG embedded as data URL
// ─────────────────────────────────────────────────────────────
const DEMO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
  <rect width="1280" height="800" fill="#0a0a14"/>
  <!-- Sidebar -->
  <rect width="220" height="800" fill="#0f0f1c"/>
  <rect x="18" y="18" width="36" height="36" rx="9" fill="#4f46e5"/>
  <rect x="26" y="26" width="20" height="4" rx="2" fill="#fff" opacity=".9"/>
  <rect x="26" y="34" width="14" height="4" rx="2" fill="#fff" opacity=".6"/>
  <rect x="62" y="22" width="90" height="10" rx="5" fill="#e0e0f8"/>
  <rect x="62" y="38" width="60" height="7" rx="3" fill="#50508a"/>
  <rect x="12" y="76" width="196" height="38" rx="7" fill="#1a1a38"/>
  <rect x="28" y="89" width="14" height="14" rx="3" fill="#4f46e5"/>
  <rect x="50" y="92" width="70" height="8" rx="4" fill="#e0e0f8"/>
  <rect x="28" y="130" width="14" height="14" rx="3" fill="#32325a"/>
  <rect x="50" y="133" width="90" height="8" rx="4" fill="#50508a"/>
  <rect x="28" y="166" width="14" height="14" rx="3" fill="#32325a"/>
  <rect x="50" y="169" width="55" height="8" rx="4" fill="#50508a"/>
  <rect x="28" y="202" width="14" height="14" rx="3" fill="#32325a"/>
  <rect x="50" y="205" width="75" height="8" rx="4" fill="#50508a"/>
  <rect x="28" y="238" width="14" height="14" rx="3" fill="#32325a"/>
  <rect x="50" y="241" width="65" height="8" rx="4" fill="#50508a"/>
  <rect x="12" y="720" width="196" height="38" rx="7" fill="#0f0f1c"/>
  <rect x="28" y="733" width="30" height="30" rx="15" fill="#1e1e3a"/>
  <rect x="66" y="737" width="80" height="8" rx="4" fill="#e0e0f8"/>
  <rect x="66" y="750" width="55" height="6" rx="3" fill="#50508a"/>
  <!-- Topbar -->
  <rect x="220" y="0" width="1060" height="58" fill="#0e0e1a"/>
  <rect x="240" y="16" width="220" height="26" rx="7" fill="#141428"/>
  <rect x="256" y="24" width="12" height="12" rx="2" fill="#32325a"/>
  <rect x="274" y="27" width="80" height="6" rx="3" fill="#32325a"/>
  <rect x="1060" y="9" width="80" height="40" rx="7" fill="#4f46e5"/>
  <rect x="1075" y="22" width="50" height="8" rx="4" fill="#fff" opacity=".9"/>
  <rect x="1150" y="11" width="36" height="36" rx="18" fill="#1a1a38"/>
  <!-- Metric cards -->
  <rect x="228" y="74" width="228" height="108" rx="10" fill="#0f0f1c"/>
  <rect x="244" y="90" width="90" height="8" rx="4" fill="#50508a"/>
  <rect x="244" y="108" width="130" height="24" rx="6" fill="#e0e0f8"/>
  <rect x="244" y="144" width="14" height="14" rx="3" fill="#22c55e" opacity=".8"/>
  <rect x="264" y="148" width="70" height="6" rx="3" fill="#22c55e" opacity=".8"/>
  <rect x="464" y="74" width="228" height="108" rx="10" fill="#0f0f1c"/>
  <rect x="480" y="90" width="80" height="8" rx="4" fill="#50508a"/>
  <rect x="480" y="108" width="110" height="24" rx="6" fill="#e0e0f8"/>
  <rect x="480" y="144" width="14" height="14" rx="3" fill="#f59e0b" opacity=".8"/>
  <rect x="500" y="148" width="80" height="6" rx="3" fill="#f59e0b" opacity=".8"/>
  <rect x="700" y="74" width="228" height="108" rx="10" fill="#0f0f1c"/>
  <rect x="716" y="90" width="95" height="8" rx="4" fill="#50508a"/>
  <rect x="716" y="108" width="120" height="24" rx="6" fill="#e0e0f8"/>
  <rect x="716" y="144" width="14" height="14" rx="3" fill="#4f46e5" opacity=".8"/>
  <rect x="736" y="148" width="60" height="6" rx="3" fill="#4f46e5" opacity=".8"/>
  <rect x="936" y="74" width="240" height="108" rx="10" fill="#0f0f1c"/>
  <rect x="952" y="90" width="70" height="8" rx="4" fill="#50508a"/>
  <rect x="952" y="108" width="100" height="24" rx="6" fill="#e0e0f8"/>
  <rect x="952" y="144" width="14" height="14" rx="3" fill="#ef4444" opacity=".8"/>
  <rect x="972" y="148" width="85" height="6" rx="3" fill="#ef4444" opacity=".8"/>
  <!-- Chart -->
  <rect x="228" y="198" width="636" height="290" rx="10" fill="#0f0f1c"/>
  <rect x="244" y="216" width="130" height="12" rx="6" fill="#e0e0f8"/>
  <rect x="244" y="236" width="85" height="7" rx="3" fill="#50508a"/>
  <line x1="248" y1="460" x2="848" y2="460" stroke="#1e1e34" stroke-width="1"/>
  <line x1="248" y1="420" x2="848" y2="420" stroke="#1e1e34" stroke-width="1"/>
  <line x1="248" y1="380" x2="848" y2="380" stroke="#1e1e34" stroke-width="1"/>
  <line x1="248" y1="340" x2="848" y2="340" stroke="#1e1e34" stroke-width="1"/>
  <line x1="248" y1="300" x2="848" y2="300" stroke="#1e1e34" stroke-width="1"/>
  <rect x="268" y="380" width="44" height="80" rx="5" fill="#4f46e5" opacity=".65"/>
  <rect x="332" y="340" width="44" height="120" rx="5" fill="#4f46e5" opacity=".75"/>
  <rect x="396" y="295" width="44" height="165" rx="5" fill="#4f46e5" opacity=".85"/>
  <rect x="460" y="315" width="44" height="145" rx="5" fill="#4f46e5" opacity=".8"/>
  <rect x="524" y="270" width="44" height="190" rx="5" fill="#4f46e5"/>
  <rect x="588" y="300" width="44" height="160" rx="5" fill="#4f46e5" opacity=".9"/>
  <rect x="652" y="255" width="44" height="205" rx="5" fill="#818cf8"/>
  <rect x="716" y="285" width="44" height="175" rx="5" fill="#818cf8" opacity=".9"/>
  <rect x="780" y="265" width="44" height="195" rx="5" fill="#818cf8"/>
  <!-- Table -->
  <rect x="872" y="198" width="304" height="290" rx="10" fill="#0f0f1c"/>
  <rect x="888" y="216" width="110" height="12" rx="6" fill="#e0e0f8"/>
  <rect x="888" y="246" width="75" height="7" rx="3" fill="#32325a"/>
  <rect x="1050" y="246" width="55" height="7" rx="3" fill="#32325a"/>
  <rect x="888" y="266" width="272" height="1" fill="#1e1e34"/>
  <rect x="888" y="275" width="130" height="7" rx="3" fill="#9090c0"/>
  <rect x="1050" y="275" width="45" height="7" rx="4" fill="#22c55e" opacity=".9"/>
  <rect x="888" y="296" width="272" height="1" fill="#1e1e34"/>
  <rect x="888" y="305" width="115" height="7" rx="3" fill="#9090c0"/>
  <rect x="1050" y="305" width="55" height="7" rx="4" fill="#f59e0b" opacity=".9"/>
  <rect x="888" y="326" width="272" height="1" fill="#1e1e34"/>
  <rect x="888" y="335" width="145" height="7" rx="3" fill="#9090c0"/>
  <rect x="1050" y="335" width="38" height="7" rx="4" fill="#ef4444" opacity=".9"/>
  <rect x="888" y="356" width="272" height="1" fill="#1e1e34"/>
  <rect x="888" y="365" width="125" height="7" rx="3" fill="#9090c0"/>
  <rect x="1050" y="365" width="50" height="7" rx="4" fill="#4f46e5" opacity=".9"/>
  <rect x="888" y="386" width="272" height="1" fill="#1e1e34"/>
  <rect x="888" y="395" width="155" height="7" rx="3" fill="#9090c0"/>
  <rect x="1050" y="395" width="42" height="7" rx="4" fill="#22c55e" opacity=".9"/>
  <rect x="888" y="416" width="272" height="1" fill="#1e1e34"/>
  <rect x="888" y="425" width="100" height="7" rx="3" fill="#9090c0"/>
  <rect x="1050" y="425" width="60" height="7" rx="4" fill="#f59e0b" opacity=".9"/>
  <rect x="888" y="446" width="272" height="1" fill="#1e1e34"/>
  <rect x="888" y="455" width="135" height="7" rx="3" fill="#9090c0"/>
  <rect x="1050" y="455" width="35" height="7" rx="4" fill="#ef4444" opacity=".9"/>
  <!-- Bottom chart -->
  <rect x="228" y="504" width="948" height="210" rx="10" fill="#0f0f1c"/>
  <rect x="244" y="520" width="110" height="12" rx="6" fill="#e0e0f8"/>
  <rect x="244" y="540" width="70" height="7" rx="3" fill="#50508a"/>
  <line x1="248" y1="570" x2="1160" y2="570" stroke="#1e1e34" stroke-width="1"/>
  <line x1="248" y1="600" x2="1160" y2="600" stroke="#1e1e34" stroke-width="1"/>
  <line x1="248" y1="630" x2="1160" y2="630" stroke="#1e1e34" stroke-width="1"/>
  <line x1="248" y1="660" x2="1160" y2="660" stroke="#1e1e34" stroke-width="1"/>
  <polyline points="260,670 340,630 420,645 500,595 580,608 660,555 740,568 820,520 900,534 980,488 1060,502 1140,460" fill="none" stroke="#4f46e5" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
  <polyline points="260,690 340,670 420,678 500,658 580,665 660,642 740,650 820,628 900,636 980,610 1060,618 1140,595" fill="none" stroke="#818cf8" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" opacity=".55"/>
</svg>`;

const DEMO_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(DEMO_SVG)}`;

// ─────────────────────────────────────────────────────────────
// EXPORT ENGINE — custom Canvas 2D renderer with real 3D math
// Replaces html2canvas entirely. Produces pixel-perfect output.
// ─────────────────────────────────────────────────────────────

function rotatePoint(x, y, z, rxDeg, ryDeg, rzDeg) {
  const rx = rxDeg * Math.PI / 180;
  const ry = ryDeg * Math.PI / 180;
  const rz = rzDeg * Math.PI / 180;
  // CSS order: first Z, then Y, then X (right-to-left matrix multiply)
  let [px, py, pz] = [x, y, z];
  // rotateZ
  [px, py] = [Math.cos(rz) * px - Math.sin(rz) * py,
              Math.sin(rz) * px + Math.cos(rz) * py];
  // rotateY
  [px, pz] = [Math.cos(ry) * px + Math.sin(ry) * pz,
             -Math.sin(ry) * px + Math.cos(ry) * pz];
  // rotateX
  [py, pz] = [Math.cos(rx) * py - Math.sin(rx) * pz,
              Math.sin(rx) * py + Math.cos(rx) * pz];
  return [px, py, pz];
}

function perspDiv(px, py, pz, P, cx, cy, scale) {
  const w = 1 - pz / P;
  if (w <= 0.001) return { x: cx, y: cy };
  return { x: cx + (px / w) * scale, y: cy + (py / w) * scale };
}

function getCorners(dispW, dispH, tz, rotX, rotY, rotZ, P, cx, cy, scale) {
  const hw = dispW / 2, hh = dispH / 2;
  return [
    [-hw, -hh, tz], [hw, -hh, tz],
    [ hw,  hh, tz], [-hw,  hh, tz],
  ].map(([x, y, z]) => {
    const [rx, ry, rz] = rotatePoint(x, y, z, rotX, rotY, rotZ);
    return perspDiv(rx, ry, rz, P, cx, cy, scale);
  });
}

function bilerp(corners, u, v) {
  const [tl, tr, br, bl] = corners;
  return {
    x: (1-u)*(1-v)*tl.x + u*(1-v)*tr.x + u*v*br.x + (1-u)*v*bl.x,
    y: (1-u)*(1-v)*tl.y + u*(1-v)*tr.y + u*v*br.y + (1-u)*v*bl.y,
  };
}

function drawAffineTriangle(ctx, src, sx0,sy0, sx1,sy1, sx2,sy2,
                                       dx0,dy0, dx1,dy1, dx2,dy2) {
  const dsx=sx1-sx0, dsy=sy1-sy0, dtx=sx2-sx0, dty=sy2-sy0;
  const ddx1=dx1-dx0, ddy1=dy1-dy0, ddx2=dx2-dx0, ddy2=dy2-dy0;
  const det = dsx*dty - dtx*dsy;
  if (Math.abs(det) < 0.01) return;
  const a=(ddx1*dty - ddx2*dsy)/det, b=(ddx2*dsx - ddx1*dtx)/det;
  const c=(ddy1*dty - ddy2*dsy)/det, d=(ddy2*dsx - ddy1*dtx)/det;
  const e=dx0 - a*sx0 - b*sy0,      f=dy0 - c*sx0 - d*sy0;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(dx0,dy0); ctx.lineTo(dx1,dy1); ctx.lineTo(dx2,dy2);
  ctx.closePath(); ctx.clip();
  ctx.transform(a, c, b, d, e, f);
  ctx.drawImage(src, 0, 0);
  ctx.restore();
}

function drawProjectedLayer(ctx, src, corners, alpha, filterStr, subdivs=16) {
  const sw = src.naturalWidth || src.width;
  const sh = src.naturalHeight || src.height;
  ctx.save();
  ctx.globalAlpha = alpha;
  if (filterStr) ctx.filter = filterStr;
  for (let yi=0; yi<subdivs; yi++) {
    for (let xi=0; xi<subdivs; xi++) {
      const u0=xi/subdivs, u1=(xi+1)/subdivs;
      const v0=yi/subdivs, v1=(yi+1)/subdivs;
      const p00=bilerp(corners,u0,v0), p10=bilerp(corners,u1,v0);
      const p01=bilerp(corners,u0,v1), p11=bilerp(corners,u1,v1);
      drawAffineTriangle(ctx,src,
        u0*sw,v0*sh, u1*sw,v0*sh, u0*sw,v1*sh,
        p00.x,p00.y, p10.x,p10.y, p01.x,p01.y);
      drawAffineTriangle(ctx,src,
        u1*sw,v0*sh, u1*sw,v1*sh, u0*sw,v1*sh,
        p10.x,p10.y, p11.x,p11.y, p01.x,p01.y);
    }
  }
  ctx.restore();
}

// Bakes browser chrome frame onto a fresh canvas on top of the image
function buildSourceCanvas(imgEl, showFrame) {
  const iw = imgEl.naturalWidth, ih = imgEl.naturalHeight;
  const fh = showFrame ? Math.round(iw * 0.044) : 0;
  const c = document.createElement("canvas");
  c.width = iw; c.height = ih + fh;
  const ctx = c.getContext("2d");
  if (showFrame) {
    ctx.fillStyle = "#1c1c1e";
    ctx.fillRect(0, 0, iw, fh);
    const dr = fh * 0.17, dotY = fh * 0.5;
    [["#ff5f57", fh*0.5], ["#ffbd2e", fh*0.5+dr*2.8], ["#28c841", fh*0.5+dr*5.6]]
      .forEach(([col, dx]) => {
        ctx.beginPath(); ctx.arc(dx, dotY, dr, 0, Math.PI*2);
        ctx.fillStyle = col; ctx.fill();
      });
    const bx=fh*1.3+dr*6, bw=iw-bx-fh*0.5, bh=fh*0.44, by=dotY-bh/2, br=bh/2;
    ctx.fillStyle = "#2c2c30";
    ctx.beginPath();
    ctx.moveTo(bx+br,by); ctx.lineTo(bx+bw-br,by);
    ctx.arcTo(bx+bw,by,bx+bw,by+br,br); ctx.lineTo(bx+bw,by+bh-br);
    ctx.arcTo(bx+bw,by+bh,bx+bw-br,by+bh,br); ctx.lineTo(bx+br,by+bh);
    ctx.arcTo(bx,by+bh,bx,by+bh-br,br); ctx.lineTo(bx,by+br);
    ctx.arcTo(bx,by,bx+br,by,br); ctx.closePath(); ctx.fill();
  }
  ctx.drawImage(imgEl, 0, fh);
  return c;
}

function drawCheckerBg(ctx, w, h, light, dark) {
  const cs = 26;
  for (let y=0; y<h; y+=cs)
    for (let x=0; x<w; x+=cs) {
      ctx.fillStyle = ((Math.floor(x/cs)+Math.floor(y/cs))%2===0) ? light : dark;
      ctx.fillRect(x, y, cs, cs);
    }
}

async function renderExport({ imgEl, ctrl, showWatermark, scale=2 }) {
  const { perspective:P, rotateX, rotateY, rotateZ,
          shadowIntensity, layerSep, showFrame, exportBg } = ctrl;

  const src = buildSourceCanvas(imgEl, showFrame);
  const ar = src.width / src.height;
  const MAX = 700;
  const dispW = ar>=1 ? Math.min(src.width, MAX) : Math.min(src.height, MAX)*ar;
  const dispH = ar>=1 ? dispW/ar : Math.min(src.height, MAX);
  const PAD = 150;
  const cW = Math.round((dispW + PAD*2) * scale);
  const cH = Math.round((dispH + PAD*2) * scale);
  const cx = cW/2, cy = cH/2;

  const canvas = document.createElement("canvas");
  canvas.width = cW; canvas.height = cH;
  const ctx = canvas.getContext("2d");

  if (exportBg === "dark") {
    ctx.fillStyle = "#09090c"; ctx.fillRect(0,0,cW,cH);
    drawCheckerBg(ctx, cW, cH, "#0e0e12", "#0b0b0f");
  } else if (exportBg === "light") {
    ctx.fillStyle = "#f4f4f6"; ctx.fillRect(0,0,cW,cH);
    drawCheckerBg(ctx, cW, cH, "#ebebee", "#e2e2e6");
  }

  const gc = (tz) => getCorners(dispW, dispH, tz, rotateX, rotateY, rotateZ, P, cx, cy, scale);

  // Shadow
  if (shadowIntensity > 0) {
    const sY = shadowIntensity * 24 * scale;
    const sBlur = shadowIntensity * 55;
    const sOp = shadowIntensity * 0.6;
    const bc = gc(0).map(p => ({ x:p.x, y:p.y+sY }));
    ctx.save();
    ctx.filter = `blur(${sBlur}px)`;
    ctx.globalAlpha = sOp;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    bc.forEach((p,i) => i===0 ? ctx.moveTo(p.x,p.y) : ctx.lineTo(p.x,p.y));
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  // Behind layer
  if (layerSep > 0) {
    const blur = Math.max(8, layerSep * 0.18);
    const op = Math.min(0.55, 0.12 + layerSep * 0.003);
    drawProjectedLayer(ctx, src, gc(-layerSep), op,
      `blur(${blur}px) brightness(0.4) saturate(1.6)`, 10);
  }

  // Base layer
  drawProjectedLayer(ctx, src, gc(0), 1, null, 22);

  // Glass layer
  if (layerSep > 0) {
    const op = Math.min(0.18, 0.03 + layerSep * 0.001);
    drawProjectedLayer(ctx, src, gc(layerSep), op,
      "brightness(1.6) saturate(0.3)", 8);
  }

  // Watermark
  if (showWatermark) {
    const fs = 11 * scale;
    ctx.save();
    ctx.font = `500 ${fs}px 'IBM Plex Mono', monospace`;
    ctx.fillStyle = exportBg === "light" ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.55)";
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText("via Perspecto", cW - 18*scale, cH - 14*scale);
    ctx.restore();
  }

  return canvas;
}

// ─────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────

export default function App() {
  const [ctrl, setCtrl]           = useState(DEFAULTS);
  const [image, setImage]         = useState(null);
  const [isDragging, setDrag]     = useState(false);
  const [exporting, setExp]       = useState(false);
  const [exportDone, setExpDone]  = useState(false);
  const [exportingHTML, setExpHTML]     = useState(false);
  const [exportHTMLDone, setExpHTMLDone] = useState(false);
  const [copiedCSS, setCopiedCSS] = useState(false);
  const [copiedImg, setCopiedImg] = useState(false);
  const [showModal, setModal]     = useState(false);
  const [panelOpen, setPanel]     = useState(false);
  const [canUndo, setCanUndo]     = useState(false);
  const [toast, setToast]         = useState(null);

  // ── Pro / freemium state ────────────────────────────────────
  const [isPro, setIsPro]               = useState(false);
  const [exportCount, setExportCount]   = useState(0);
  const [showUpgrade, setShowUpgrade]   = useState(false);
  const [showActivate, setShowActivate] = useState(false);
  const [licenseKey, setLicenseKey]     = useState("");
  const [licenseError, setLicenseError] = useState("");
  const [licenseLoading, setLicLoading] = useState(false);
  const [licenseSuccess, setLicSuccess] = useState(false);

  // ── Close Actions dropdown on outside click ──────────────────
  useEffect(() => {
    const handler = (e) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target))
        setShowActions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Load pro status + export count from localStorage ────────
  useEffect(() => {
    try {
      const pro = localStorage.getItem(LS_PRO_KEY);
      if (pro) setIsPro(true);
      const count = parseInt(localStorage.getItem(LS_EXPORT_KEY) || "0", 10);
      setExportCount(isNaN(count) ? 0 : count);
    } catch {}
  }, []);

  const [showActions, setShowActions]   = useState(false);
  const actionsRef  = useRef(null);

  const imgRef         = useRef(null);
  const prevCtrl       = useRef(null);
  const dragState      = useRef({ active: false, startX: 0, startY: 0, startRX: 0, startRY: 0 });
  const pendingCanvas  = useRef(null);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [previewUrl, setPreviewUrl]   = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputId = "mex-file";

  // ── URL hash sync — read on mount ────────────────────────────
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    try {
      const p = new URLSearchParams(hash);
      const m = { rx:"rotateX", ry:"rotateY", rz:"rotateZ", pv:"perspective",
                  sep:"layerSep", bl:"bgBlur", gb:"glassBorder", sf:"showFrame",
                  cs:"curveScreen", ci:"curveIntensity", z:"zoom" };
      const updates = {};
      for (const [short, long] of Object.entries(m)) {
        const val = p.get(short);
        if (val !== null)
          updates[long] = (long==="glassBorder"||long==="showFrame") ? val==="1" : Number(val);
      }
      if (Object.keys(updates).length) setCtrl(prev => ({ ...prev, ...updates }));
    } catch {}
  }, []);

  // ── URL hash sync — write only when different from defaults ──
  useEffect(() => {
    const m = { rotateX:"rx", rotateY:"ry", rotateZ:"rz", perspective:"pv",
                layerSep:"sep", bgBlur:"bl", glassBorder:"gb", showFrame:"sf",
                curveScreen:"cs", curveIntensity:"ci", zoom:"z" };
    const params = new URLSearchParams();
    let hasChanges = false;
    for (const [long, short] of Object.entries(m)) {
      const val = ctrl[long];
      const def = DEFAULTS[long];
      if (val !== undefined && val !== def) {
        params.set(short, typeof val === "boolean" ? (val?"1":"0") : val);
        hasChanges = true;
      }
    }
    // Only update URL if something changed from defaults
    if (hasChanges) {
      window.history.replaceState(null, "", "#" + params.toString());
    } else {
      // Clean URL — remove hash entirely
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [ctrl]);

  const set = (key, val) =>
    setCtrl(p => ({ ...p, [key]: typeof val === "boolean" ? val : Number(val) }));

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const loadDemo = () => {
    setImage(DEMO_URL);
    setPanel(false);
    showToast("Demo loaded — try dragging to rotate!");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Link copied — anyone who opens it gets your exact settings ✓");
    } catch { showToast("Could not copy link", "error"); }
  };

  // ── Pro gate helpers ────────────────────────────────────────
  const exportsLeft = Math.max(0, FREE_EXPORTS - exportCount);
  const canExportFree = isPro || exportCount < FREE_EXPORTS;

  const bumpExportCount = () => {
    if (isPro) return;
    const next = exportCount + 1;
    setExportCount(next);
    try { localStorage.setItem(LS_EXPORT_KEY, String(next)); } catch {}
  };

  // ── Activate license ────────────────────────────────────────
  const handleActivateLicense = async () => {
    if (!licenseKey.trim()) {
      setLicenseError("Please enter your license key.");
      return;
    }
    setLicLoading(true);
    setLicenseError("");
    try {
      const res = await fetch("/api/validate-license", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: licenseKey.trim() }),
      });
      const data = await res.json();
      if (data.valid) {
        setIsPro(true);
        try { localStorage.setItem(LS_PRO_KEY, "1"); } catch {}
        setLicSuccess(true);
        setTimeout(() => {
          setShowActivate(false);
          setShowUpgrade(false);
          setLicSuccess(false);
          setLicenseKey("");
          showToast("🎉 Perspecto Pro activated — enjoy unlimited exports!");
        }, 1800);
      } else {
        setLicenseError(data.error || "Invalid license key. Check for typos and try again.");
      }
    } catch {
      setLicenseError("Could not reach validation server. Check your connection.");
    } finally {
      setLicLoading(false);
    }
  };

  const applyPreset = (pr) =>
    setCtrl(p => ({ ...p, rotateX:pr.rotateX, rotateY:pr.rotateY,
                           rotateZ:pr.rotateZ, perspective:pr.perspective }));

  const reset = () => {
    prevCtrl.current = ctrl;
    setCtrl(DEFAULTS);
    setCanUndo(true);
    setTimeout(() => setCanUndo(false), 6000);
  };

  const undo = () => {
    if (prevCtrl.current) {
      setCtrl(prevCtrl.current);
      prevCtrl.current = null;
      setCanUndo(false);
    }
  };

  const loadFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setImage(URL.createObjectURL(file));
    setPanel(false);
  }, []);

  useEffect(() => {
    const onPaste = (e) => {
      const item = [...(e.clipboardData?.items||[])].find(i => i.type.startsWith("image/"));
      if (item) loadFile(item.getAsFile());
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [loadFile]);

  // ── Drag-to-rotate ─────────────────────────────────────────
  const onCanvasDragStart = useCallback((e) => {
    if (!image) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragState.current = {
      active: true,
      startX: clientX,
      startY: clientY,
      startRX: ctrl.rotateX,
      startRY: ctrl.rotateY,
    };
    setIsDraggingCanvas(true);
  }, [image, ctrl.rotateX, ctrl.rotateY]);

  useEffect(() => {
    const SENSITIVITY = 0.38;
    const onMove = (e) => {
      if (!dragState.current.active) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = clientX - dragState.current.startX;
      const dy = clientY - dragState.current.startY;
      setCtrl(p => ({
        ...p,
        rotateY: Math.max(-90, Math.min(90, dragState.current.startRY + dx * SENSITIVITY)),
        rotateX: Math.max(-90, Math.min(90, dragState.current.startRX + dy * SENSITIVITY)),
      }));
    };
    const onUp = () => {
      dragState.current.active = false;
      setIsDraggingCanvas(false);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  const handleExport = async () => {
    if (!imgRef.current || exporting) return;
    if (!canExportFree) { setShowUpgrade(true); return; }
    setExp(true);
    const scale = isPro ? PRO_SCALE : FREE_SCALE;
    try {
      const canvas = await renderExport({
        imgEl: imgRef.current, ctrl,
        showWatermark: isPro ? ctrl.showWatermark : true,
        scale,
      });
      pendingCanvas.current = canvas;
      setPreviewUrl(canvas.toDataURL("image/png"));
      setShowPreview(true);
    } catch(err) { console.error(err); showToast("Render failed — try again", "error"); }
    finally { setExp(false); }
  };

  const handleDownloadConfirmed = () => {
    if (!pendingCanvas.current) return;
    const a = document.createElement("a");
    a.download = "perspecto.png";
    a.href = pendingCanvas.current.toDataURL("image/png");
    a.click();
    bumpExportCount();
    setShowPreview(false);
    setPreviewUrl(null);
    setExpDone(true);
    const res = isPro ? "2×" : "1×";
    const newLeft = isPro ? 0 : exportsLeft - 1;
    const leftStr = isPro ? "" : ` · ${newLeft} free export${newLeft===1?"":"s"} remaining`;
    showToast(`PNG saved at ${res} resolution ✓${leftStr}`);
    setTimeout(() => setExpDone(false), 3000);
  };

  // ── Copy CSS ────────────────────────────────────────────────
  const handleCopyCSS = async () => {
    const css =
`/* Generated by Perspecto — perspecto.com */
.your-mockup {
  transform: perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg);
  transform-style: preserve-3d;${sO > 0 ? `\n  box-shadow: 0 ${sY.toFixed(1)}px ${sB.toFixed(1)}px ${sS.toFixed(1)}px rgba(0,0,0,${sO.toFixed(2)});` : ""}
}`;
    try {
      await navigator.clipboard.writeText(css);
      setCopiedCSS(true);
      setTimeout(() => setCopiedCSS(false), 2200);
    } catch(e) { console.error(e); }
  };

  // ── Copy PNG to Clipboard (Pro only) ────────────────────────
  const handleCopyImage = async () => {
    if (!isPro) { setShowUpgrade(true); return; }
    if (!imgRef.current || exporting) return;
    try {
      const canvas = await renderExport({ imgEl: imgRef.current, ctrl, showWatermark: ctrl.showWatermark, scale: PRO_SCALE });
      canvas.toBlob(async (blob) => {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        setCopiedImg(true);
        showToast("Image copied — paste into Figma, Notion or Slack ✓");
        setTimeout(() => setCopiedImg(false), 2200);
      }, "image/png");
    } catch(e) { console.error(e); showToast("Copy failed — browser may not support this", "error"); }
  };

  // ── Export HTML (Pro only) ───────────────────────────────────
  const handleExportHTML = async () => {
    if (!isPro) { setShowUpgrade(true); return; }
    if (!imgRef.current || exportingHTML) return;
    setExpHTML(true);
    try {
      // Embed image as base64 (capped at 1200px wide for file size)
      const iw = imgRef.current.naturalWidth;
      const ih = imgRef.current.naturalHeight;
      const MAX = 1200;
      const scale = iw > MAX ? MAX / iw : 1;
      const tmpCanvas = document.createElement("canvas");
      tmpCanvas.width = Math.round(iw * scale);
      tmpCanvas.height = Math.round(ih * scale);
      tmpCanvas.getContext("2d").drawImage(imgRef.current, 0, 0, tmpCanvas.width, tmpCanvas.height);
      const base64 = tmpCanvas.toDataURL("image/png");

      const sep = layerSep;
      const blurAmt = Math.max(8, sep * 0.18).toFixed(1);
      const behindOp = Math.min(0.55, 0.12 + sep * 0.003).toFixed(2);
      const frontOp  = Math.min(0.22, 0.03 + sep * 0.0013).toFixed(2);
      const floatRX  = (rotateX - 3).toFixed(1);
      const floatRY  = (rotateY + 5).toFixed(1);
      const hasShadow = sO > 0;

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Perspecto Mockup</title>
  <!--
    Generated by Perspecto — perspecto.com
    Settings: perspective=${perspective}px | X=${rotateX}° | Y=${rotateY}° | Z=${rotateZ}° | depth=${sep}px

    HOW TO USE IN YOUR PROJECT:
    1. Copy the CSS block below into your stylesheet
    2. Copy the HTML structure into your page
    3. Replace src="data:..." with your own image path
    The hover transition is built in — customize the :hover values to change the float effect.
  -->
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #13131c;
      padding: 60px 40px;
    }

    /* ── Perspecto 3D Wrapper ── */
    .perspecto-wrapper {
      transform: perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg);
      transform-style: preserve-3d;
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.7s cubic-bezier(0.23, 1, 0.32, 1);
    }

    /* Hover: gentle float — customize these values */
    .perspecto-wrapper:hover {
      transform: perspective(${perspective}px) rotateX(${floatRX}deg) rotateY(${floatRY}deg) rotateZ(${rotateZ}deg);
    }

    /* ── Base image (main layer) ── */
    .perspecto-base {
      position: relative;
      transform: translateZ(0px);
      backface-visibility: hidden;
      display: flex;
      align-items: center;
      justify-content: center;${hasShadow ? `\n      box-shadow: 0 ${sY.toFixed(1)}px ${sB.toFixed(1)}px ${sS.toFixed(1)}px rgba(0,0,0,${sO.toFixed(2)});` : ""}
    }

    /* ── Behind layer (ambient glow) ── */
    .perspecto-behind {
      position: absolute;
      inset: 0;
      transform: translateZ(${-sep}px);
      backface-visibility: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }

    .perspecto-behind img {
      filter: blur(${blurAmt}px) brightness(0.42) saturate(1.6);
      opacity: ${behindOp};
    }

    /* ── Front glass layer ── */
    .perspecto-front {
      position: absolute;
      inset: 0;
      transform: translateZ(${sep}px);
      backface-visibility: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }

    .perspecto-front img {
      opacity: ${frontOp};
      filter: brightness(1.6) saturate(0.3);
      mix-blend-mode: screen;
    }

    .perspecto-glass {
      position: absolute;
      inset: 0;
      border-radius: 4px;
      background: linear-gradient(135deg,
        rgba(255,255,255,0.05) 0%,
        rgba(255,255,255,0.01) 50%,
        rgba(160,140,255,0.03) 100%);
      pointer-events: none;
    }

    /* ── Shared image styles ── */
    .perspecto-img {
      display: block;
      max-width: min(72vw, 680px);
      max-height: 70vh;
      object-fit: contain;
      border-radius: 3px;
      user-select: none;
      -webkit-user-drag: none;
    }
  </style>
</head>
<body>

  <div class="perspecto-wrapper">

    <!-- Layer 1: Behind — blurred ambient glow -->
    <div class="perspecto-behind">
      <img src="${base64}" class="perspecto-img" alt="" aria-hidden="true" draggable="false">
    </div>

    <!-- Layer 2: Base — main image -->
    <div class="perspecto-base">
      <img src="${base64}" class="perspecto-img" alt="3D mockup" draggable="false">
    </div>

    <!-- Layer 3: Front — glass overlay -->
    <div class="perspecto-front">
      <img src="${base64}" class="perspecto-img" alt="" aria-hidden="true" draggable="false">
      <div class="perspecto-glass"></div>
    </div>

  </div>

</body>
</html>`;

      const blob = new Blob([html], { type: "text/html" });
      const a = document.createElement("a");
      a.download = "perspecto-mockup.html";
      a.href = URL.createObjectURL(blob);
      a.click();
      setExpHTMLDone(true);
      showToast("HTML file saved — open it in any browser ✓");
      setTimeout(() => setExpHTMLDone(false), 3000);
    } catch(e) { console.error(e); showToast("Export failed — try again", "error"); }
    finally { setExpHTML(false); }
  };

  const toggleWatermark = () => {
    if (ctrl.showWatermark) { set("showWatermark", false); setModal(true); }
    else set("showWatermark", true);
  };

  const { perspective, rotateX, rotateY, rotateZ, shadowIntensity,
          layerSep, bgBlur, glassBorder, showFrame, showWatermark,
          curveScreen, curveIntensity, exportBg, zoom } = ctrl;

  const sY=shadowIntensity*28, sB=shadowIntensity*90,
        sS=shadowIntensity*24, sO=shadowIntensity*0.72;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

        .root{display:flex;height:100vh;width:100vw;font-family:'IBM Plex Sans',sans-serif;
          background:#13131c;color:#e0e0f0;overflow:hidden;position:relative}

        /* ── PANEL ─────────────────────────── */
        .panel{width:276px;min-width:276px;background:#1a1a26;border-right:1px solid #32324a;
          display:flex;flex-direction:column;overflow:hidden;z-index:20;
          transition:transform .32s cubic-bezier(.4,0,.2,1)}
        .ph{padding:18px 20px 15px;border-bottom:1px solid #32324a;flex-shrink:0;
          display:flex;align-items:flex-start;justify-content:space-between}
        .eyebrow{font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:.18em;
          color:#7070a0;text-transform:uppercase;margin-bottom:3px}
        .ptitle{font-size:16px;font-weight:600;color:#f0f0ff;letter-spacing:-.01em}
        .ptag{font-size:10px;font-family:'IBM Plex Mono',monospace;color:#505080;margin-top:2px}
        .ptagline{font-size:11px;color:#8080b0;margin-top:8px;line-height:1.5;
          padding:8px 10px;background:#13132a;border-radius:6px;border:1px solid #28284a}
        .ph-close{background:transparent;border:none;color:#7070a0;cursor:pointer;
          display:none;padding:2px;margin-top:1px;transition:color .15s}
        .ph-close:hover{color:#b0b0d0}

        /* toast */
        .toast{position:absolute;bottom:56px;left:50%;transform:translateX(-50%);
          z-index:60;padding:9px 18px;border-radius:8px;font-family:'IBM Plex Mono',monospace;
          font-size:11px;letter-spacing:.03em;white-space:nowrap;pointer-events:none;
          animation:toastIn .25s ease-out;box-shadow:0 8px 32px rgba(0,0,0,.6)}
        .toast.success{background:#142e18;border:1px solid #2a7030;color:#80e090}
        .toast.error{background:#2e1414;border:1px solid #7a2020;color:#e08080}
        @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}

        .ca{flex:1;overflow-y:auto;padding:16px 20px 10px;
          display:flex;flex-direction:column;gap:20px;
          scrollbar-width:thin;scrollbar-color:#32324a transparent}

        .sec{display:flex;flex-direction:column;gap:14px}
        .slbl{font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:.16em;
          color:#9090c0;text-transform:uppercase;display:flex;align-items:center;
          gap:7px;margin-bottom:-2px}
        .slbl::after{content:'';flex:1;height:1px;background:#34344e}

        /* presets */
        .preset-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:5px}
        .pbtn{padding:7px 4px;border-radius:5px;border:1px solid #38385a;background:#22223a;
          color:#b0b0d8;font-family:'IBM Plex Mono',monospace;font-size:10px;
          letter-spacing:.04em;cursor:pointer;transition:all .15s;text-align:center}
        .pbtn:hover{border-color:#6060c0;background:#2a2a50;color:#d8d8ff}
        .pbtn.active{border-color:#7070d0;background:#20205a;color:#c8d0ff}

        /* slider */
        .sw{display:flex;flex-direction:column;gap:6px}
        .sm{display:flex;justify-content:space-between;align-items:baseline}
        .sl{font-size:11px;color:#b0b0d0;letter-spacing:.02em}
        .sv{font-family:'IBM Plex Mono',monospace;font-size:11px;color:#e0e0ff;
          min-width:50px;text-align:right}
        .tw{position:relative;height:18px;display:flex;align-items:center}
        .tbg{position:absolute;left:0;right:0;height:2px;background:#2a2a40;border-radius:2px;pointer-events:none}
        .tf{position:absolute;left:0;height:2px;background:linear-gradient(90deg,#4f46e5,#a5b4fc);
          border-radius:2px;pointer-events:none}
        input[type=range]{position:absolute;left:0;width:100%;height:18px;opacity:0;cursor:ew-resize}

        /* toggle */
        .trow{display:flex;align-items:center;justify-content:space-between;
          padding:8px 11px;background:#1e1e2e;border:1px solid #32324a;border-radius:7px;
          cursor:pointer;transition:border-color .15s,background .15s;user-select:none}
        .trow:hover{border-color:#5050a0;background:#242438}
        .tleft{display:flex;align-items:center;gap:9px}
        .tlbl{font-size:11px;color:#b0b0d0;letter-spacing:.02em}
        .ttrack{width:32px;height:17px;border-radius:9px;background:#2a2a40;
          border:1px solid #404060;position:relative;transition:background .2s,border-color .2s;flex-shrink:0}
        .ttrack.on{background:#4f46e5;border-color:#6060ff}
        .tthumb{position:absolute;top:2px;left:2px;width:11px;height:11px;border-radius:50%;
          background:#7070a0;transition:transform .2s,background .2s}
        .ttrack.on .tthumb{transform:translateX(15px);background:#e0e8ff}

        /* export bg pills */
        .bg-pills{display:flex;gap:5px}
        .bgp{flex:1;padding:7px 4px;border-radius:5px;border:1px solid #32324a;
          background:#1e1e2e;color:#9090c0;font-family:'IBM Plex Mono',monospace;
          font-size:9px;letter-spacing:.06em;cursor:pointer;transition:all .15s;
          text-align:center;text-transform:uppercase}
        .bgp:hover{border-color:#5050a0;color:#c0c0f0}
        .bgp.sel{border-color:#6060c0;background:#20205a;color:#a0a8ff}

        /* footer buttons */
        .pf{padding:11px 20px 16px;border-top:1px solid #32324a;display:flex;flex-direction:column;gap:6px;flex-shrink:0}
        .btn{display:flex;align-items:center;justify-content:center;gap:7px;
          padding:9px 14px;border-radius:6px;font-family:'IBM Plex Sans',sans-serif;
          font-size:12px;cursor:pointer;border:1px solid #3a3a58;background:#1e1e32;
          color:#a8a8d0;transition:all .15s;width:100%;letter-spacing:.01em;text-decoration:none}
        .btn:hover{background:#282842;border-color:#6060a8;color:#d0d0f0}
        .btn:disabled{opacity:.35;cursor:not-allowed}
        .btn-upload{background:#1c1c4a;border-color:#5050b8;color:#a8b0ff}
        .btn-upload:hover{background:#24246a;border-color:#7070d8;color:#d0d8ff}
        .btn-export{background:#0f2e13;border-color:#307838;color:#78e088}
        .btn-export:hover:not(:disabled){background:#163c1a;border-color:#48a858;color:#98f8a8}
        .btn-export.done{background:#163c1a;border-color:#48a858;color:#98f8a8}
        .btn-html{background:#0e1e42;border-color:#3858a8;color:#88a8f0}
        .btn-html:hover:not(:disabled){background:#162860;border-color:#5878c8;color:#a8c8ff}
        .btn-html.done{background:#162860;border-color:#5878c8;color:#a8c8ff}
        .btn-row{display:flex;gap:6px}
        .btn-row .btn{font-size:11px;padding:7px 10px}
        .btn-copied{background:#1a2e1a;border-color:#3a7030;color:#80d070}
        .btn-undo{background:#2e2006;border-color:#806018;color:#f0b038;animation:undoPulse 1s ease-out}
        .btn-undo:hover{background:#382808;border-color:#b08828;color:#ffd058}
        @keyframes undoPulse{0%{box-shadow:0 0 0 0 rgba(224,160,48,.5)}100%{box-shadow:0 0 0 6px transparent}}
        .spin{animation:spin .9s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}

        /* ── CANVAS ────────────────────────── */
        .cvs{flex:1;display:flex;align-items:center;justify-content:center;
          position:relative;overflow:hidden;background-color:#18182a;
          background-image:repeating-conic-gradient(#1e1e30 0% 25%,#18182a 0% 50%);
          background-size:26px 26px}
        .vig{position:absolute;inset:0;pointer-events:none;z-index:0;
          background:radial-gradient(ellipse 80% 80% at 50% 50%,transparent 40%,rgba(0,0,0,.55) 100%)}

        /* drop zone */
        .dz{position:relative;display:flex;flex-direction:column;align-items:center;
          gap:14px;padding:48px 40px;border:1.5px dashed #40408a;border-radius:12px;
          cursor:pointer;transition:all .2s;text-align:center;width:100%}
        .dz:hover,.dz.drag{border-color:#7070e0;background:rgba(79,70,229,.08)}
        .di{color:#5050a0;transition:color .2s}
        .dz:hover .di,.dz.drag .di{color:#8080e0}
        .dp{font-size:13px;color:#9090c0;line-height:1.65;transition:color .2s}
        .dz:hover .dp,.dz.drag .dp{color:#c0c0f0}
        .dp-sub{font-size:11px;color:#6060a0;margin-top:2px}
        .dh{font-family:'IBM Plex Mono',monospace;font-size:10px;color:#5050a0;letter-spacing:.06em}
        .fpill{font-family:'IBM Plex Mono',monospace;font-size:9px;padding:2px 6px;
          border:1px solid #40408a;border-radius:3px;color:#7070b0;text-transform:uppercase;letter-spacing:.08em}
        .btn-demo{display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:6px;
          border:1px solid #40408a;background:#1a1a38;color:#9090e0;font-size:11px;
          font-family:'IBM Plex Mono',monospace;cursor:pointer;transition:all .15s;
          letter-spacing:.04em;margin-top:2px}
        .btn-demo:hover{border-color:#7070e0;background:#20204a;color:#c0c0ff}

        /* stage */
        .stage{position:relative;z-index:2;display:flex;align-items:center;
          justify-content:center;width:100%;height:100%}
        .stage.has-image{cursor:grab}
        .stage.has-image.grabbing{cursor:grabbing}

        /* watermark */
        .wm{position:absolute;bottom:12px;right:14px;z-index:5;display:flex;
          align-items:center;gap:5px;font-family:'IBM Plex Mono',monospace;font-size:11px;
          color:rgba(255,255,255,.45);letter-spacing:.06em;pointer-events:none;user-select:none;
          text-shadow:0 1px 4px rgba(0,0,0,.8)}
        .wm-dot{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.35)}

        /* status */
        .statbar{position:absolute;bottom:12px;left:50%;transform:translateX(-50%);z-index:5;
          display:flex;align-items:center;gap:13px;padding:5px 13px;
          background:rgba(20,20,34,.96);border:1px solid #44448a;border-radius:20px;
          font-family:'IBM Plex Mono',monospace;font-size:10px;color:#a0a0c8;
          letter-spacing:.05em;white-space:nowrap}
        .dot{color:#44448a}

        /* badge */
        .badge{position:absolute;top:13px;right:14px;z-index:5;display:flex;
          align-items:center;gap:6px;padding:4px 10px;background:rgba(20,20,34,.96);
          border:1px solid #44448a;border-radius:20px;font-family:'IBM Plex Mono',monospace;
          font-size:10px;color:#a0a0c8;letter-spacing:.05em}
        .ldot{width:6px;height:6px;border-radius:50%;background:#6060e0;box-shadow:0 0 6px #8080ff}

        /* remove image button */
        .remove-img-btn{position:absolute;top:13px;left:14px;z-index:10;
          display:flex;align-items:center;gap:5px;padding:4px 10px;
          background:rgba(20,20,34,.96);border:1px solid #44448a;border-radius:20px;
          font-family:'IBM Plex Mono',monospace;font-size:10px;color:#a0a0c8;
          cursor:pointer;letter-spacing:.04em;opacity:0;
          transition:opacity .2s,border-color .15s,color .15s,background .15s}
        .cvs:hover .remove-img-btn{opacity:1}
        .remove-img-btn:hover{border-color:#c04040;color:#ffb0b0;background:rgba(42,12,12,.96)}

        /* fab */
        .fab{display:none;position:absolute;top:13px;left:13px;z-index:30;
          width:40px;height:40px;border-radius:50%;background:rgba(26,26,40,.96);
          border:1px solid #40408a;color:#8080b8;align-items:center;justify-content:center;
          cursor:pointer;transition:all .15s}
        .fab:hover{background:#242438;color:#c0c0f0}

        /* modal */
        .mbk{position:absolute;inset:0;z-index:50;background:rgba(0,0,0,.75);
          display:flex;align-items:center;justify-content:center;padding:20px}
        .mdl{background:#1a1a28;border:1px solid #40408a;border-radius:14px;
          padding:26px 26px 22px;width:100%;max-width:370px;display:flex;
          flex-direction:column;gap:16px;position:relative;
          box-shadow:0 28px 60px rgba(0,0,0,.75)}
        .mclose{position:absolute;top:13px;right:13px;width:27px;height:27px;
          border-radius:50%;border:1px solid #40408a;background:transparent;
          color:#8080b8;display:flex;align-items:center;justify-content:center;
          cursor:pointer;transition:all .15s}
        .mclose:hover{background:#242438;color:#c0c0f0}
        .mico{width:42px;height:42px;border-radius:50%;background:#1e1e40;
          border:1px solid #5050a0;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .mtitle{font-size:15px;font-weight:600;color:#f0f0ff;letter-spacing:-.01em}
        .msub{font-size:10px;font-family:'IBM Plex Mono',monospace;color:#7070a0;
          margin-top:3px;letter-spacing:.04em}
        .mbody{font-size:12px;color:#a0a0c0;line-height:1.65}
        .mbody strong{color:#a0a0ff;font-weight:500}
        .btn-share{display:flex;align-items:center;justify-content:center;gap:8px;
          padding:10px 18px;border-radius:7px;font-family:'IBM Plex Sans',sans-serif;
          font-size:12px;cursor:pointer;background:#1a1a4a;border:1px solid #5050c0;
          color:#a0a0ff;transition:all .15s;width:100%;text-decoration:none}
        .btn-share:hover{background:#20206a;border-color:#7070e0;color:#d0d0ff}
        .btn-maybe{background:transparent;border:1px solid #32324a;color:#7070a0;
          font-size:11px;padding:8px;border-radius:6px;cursor:pointer;
          font-family:'IBM Plex Mono',monospace;transition:all .15s;letter-spacing:.05em}
        .btn-maybe:hover{color:#b0b0d0;border-color:#5050a0}

        /* ── LOGO ───────────────────────────────── */
        .logo-mark{flex-shrink:0;display:flex;align-items:center;justify-content:center}
        .logo-img{height:52px;width:auto;object-fit:contain;display:block}
        .logo-fallback{width:40px;height:40px;border-radius:10px;
          background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);
          display:flex;align-items:center;justify-content:center}

        /* ── ACTIONS BUTTON + DROPDOWN ──────────── */
        .actions-wrap{position:absolute;top:12px;right:14px;z-index:25;
          display:flex;align-items:center;gap:8px}

        .actions-btn{display:flex;align-items:center;gap:7px;padding:9px 18px;
          background:rgba(22,22,40,.97);border:1px solid #5858b0;border-radius:20px;
          font-family:'IBM Plex Mono',monospace;font-size:11px;color:#d0d0f8;
          cursor:pointer;transition:all .15s;letter-spacing:.05em;white-space:nowrap;
          box-shadow:0 2px 8px rgba(0,0,0,.5);font-weight:500}
        .actions-btn:hover{border-color:#9090d8;color:#f0f0ff;background:rgba(34,34,60,.97)}
        .actions-btn.open{border-color:#9090d8;color:#f0f0ff;background:rgba(30,30,58,.98)}

        .actions-dd{position:absolute;top:calc(100% + 10px);right:0;
          background:#16162c;border:1px solid #383870;border-radius:14px;
          padding:8px;min-width:250px;
          box-shadow:0 24px 64px rgba(0,0,0,.92);
          animation:ddSlide .18s cubic-bezier(.34,1.2,.64,1);
          transform-origin:top right}
        @keyframes ddSlide{from{opacity:0;transform:scale(.95) translateY(-6px)}to{opacity:1;transform:scale(1) translateY(0)}}

        .dd-section{font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:.16em;
          color:#8080b0;text-transform:uppercase;padding:7px 10px 4px;margin-top:2px}
        .dd-section:first-child{margin-top:0}

        .dd-divider{height:1px;background:#28285a;margin:6px 0}

        .dd-item{display:flex;align-items:center;gap:10px;padding:11px 10px;
          border-radius:8px;cursor:pointer;transition:background .12s,color .12s;
          font-size:13px;color:#c8c8f0;border:none;background:transparent;
          width:100%;text-align:left;font-family:'IBM Plex Sans',sans-serif}
        .dd-item:hover{background:#20203e;color:#eeeeff}
        .dd-item:disabled{opacity:.4;cursor:not-allowed}

        .dd-item.green{color:#70f090;font-weight:500}
        .dd-item.green:hover{background:#0c2218;color:#98ffa8}

        .dd-item.blue{color:#98c0ff}
        .dd-item.blue:hover{background:#0e1840;color:#c0d8ff}

        .dd-item.locked{color:#60608a}
        .dd-item.locked:hover{background:#181840;color:#9090c0}

        .dd-item.amber{color:#f8c840;font-weight:500}
        .dd-item.amber:hover{background:#221a04;color:#ffe060}

        .dd-item.danger{color:#f09090}
        .dd-item.danger:hover{background:#240c0c;color:#ffc0c0}

        .dd-pro-pill{font-family:'IBM Plex Mono',monospace;font-size:9px;
          letter-spacing:.1em;padding:2px 8px;border-radius:4px;text-transform:uppercase;
          font-weight:600;background:#1c1c50;border:1px solid #4040a0;
          color:#9090e0;margin-left:auto;flex-shrink:0}

        .dd-item-label{flex:1}
        .dd-spin{animation:spin .9s linear infinite}
        .pro-badge{display:inline-flex;align-items:center;gap:3px;padding:2px 7px;
          background:linear-gradient(135deg,#3730a3,#6d28d9);border-radius:4px;
          font-family:'IBM Plex Mono',monospace;font-size:8px;letter-spacing:.1em;
          color:#e0d8ff;font-weight:600;margin-left:6px;vertical-align:middle;
          text-transform:uppercase}

        /* ── EXPORT COUNT ────────────────────────── */
        .export-count{font-family:'IBM Plex Mono',monospace;font-size:10px;
          text-align:center;padding:3px 0 1px;letter-spacing:.03em}
        .export-count.green{color:#60b870}
        .export-count.amber{color:#c49030}
        .export-count.red{color:#e06060}

        /* ── LOCK STATE ──────────────────────────── */
        .btn-locked{background:#141424 !important;border-color:#252540 !important;
          color:#404068 !important;cursor:pointer !important;opacity:1 !important}
        .btn-locked:hover{background:#1c1c34 !important;border-color:#4040a0 !important;
          color:#7070b0 !important}

        /* ── UPGRADE MODAL ───────────────────────── */
        .upg-backdrop{position:absolute;inset:0;z-index:60;background:rgba(0,0,0,.85);
          display:flex;align-items:center;justify-content:center;padding:16px;
          animation:fadeIn .18s ease-out}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}

        .upg-modal{background:#141422;border:1px solid #2a2a50;border-radius:16px;
          width:100%;max-width:460px;overflow:hidden;
          box-shadow:0 40px 80px rgba(0,0,0,.85);
          animation:slideUp .28s cubic-bezier(.34,1.4,.64,1)}
        @keyframes slideUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}

        .upg-head{padding:22px 24px 18px;
          background:linear-gradient(135deg,rgba(79,70,229,.18),rgba(109,40,217,.12));
          border-bottom:1px solid #1e1e38;position:relative}
        .upg-close{position:absolute;top:14px;right:14px;width:26px;height:26px;
          border-radius:50%;border:1px solid #30305a;background:transparent;
          color:#6060a0;display:flex;align-items:center;justify-content:center;
          cursor:pointer;transition:all .15s}
        .upg-close:hover{background:#1e1e38;color:#a0a0d0}
        .upg-eyebrow{font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:.18em;
          color:#6060c0;text-transform:uppercase;margin-bottom:5px}
        .upg-title{font-size:20px;font-weight:700;color:#f0f0ff;letter-spacing:-.02em;
          display:flex;align-items:center;gap:8px}
        .upg-sub{font-size:12px;color:#7070a0;margin-top:4px}

        .upg-body{padding:18px 24px 22px}

        .upg-compare{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:18px}
        .upg-col{padding:12px 14px;border-radius:10px;border:1px solid #1e1e2e}
        .upg-col.free{background:#0f0f1a}
        .upg-col.pro{background:#12123a;border-color:#2a2a80;
          box-shadow:inset 0 0 0 1px rgba(100,100,255,.15)}
        .upg-col-hd{font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;
          margin-bottom:10px;display:flex;align-items:center;gap:6px}
        .upg-col.free .upg-col-hd{color:#404060}
        .upg-col.pro .upg-col-hd{color:#9090ff}
        .upg-row{font-size:11px;padding:2px 0;display:flex;align-items:center;gap:6px;line-height:1.5}
        .upg-row.f{color:#404060;text-decoration:line-through}
        .upg-row.p{color:#c0c0f0}
        .upg-row.p::before{content:'✓';color:#6060e0;font-weight:700;flex-shrink:0}

        .upg-price-row{text-align:center;margin-bottom:14px}
        .upg-price-num{font-size:40px;font-weight:800;color:#f0f0ff;letter-spacing:-.03em;line-height:1}
        .upg-price-num sup{font-size:18px;font-weight:500;vertical-align:super;color:#a0a0c0}
        .upg-price-note{font-family:'IBM Plex Mono',monospace;font-size:11px;color:#6060a0;
          letter-spacing:.06em;margin-top:4px}

        .upg-cta{display:flex;align-items:center;justify-content:center;gap:8px;
          width:100%;padding:13px;border-radius:8px;border:none;cursor:pointer;
          background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);
          color:#fff;font-size:14px;font-weight:600;letter-spacing:.01em;
          transition:all .2s;text-decoration:none;margin-bottom:10px}
        .upg-cta:hover{opacity:.9;transform:translateY(-1px);
          box-shadow:0 8px 28px rgba(79,70,229,.5)}

        .upg-divider{display:flex;align-items:center;gap:10px;color:#2a2a40;
          font-size:10px;margin-bottom:10px;font-family:'IBM Plex Mono',monospace}
        .upg-divider::before,.upg-divider::after{content:'';flex:1;height:1px;background:#1e1e30}

        .upg-act-btn{width:100%;padding:9px;border-radius:7px;border:1px solid #30305a;
          background:transparent;color:#7070b0;font-size:12px;cursor:pointer;
          font-family:'IBM Plex Sans',sans-serif;transition:all .15s}
        .upg-act-btn:hover{border-color:#6060c0;color:#b0b0f0;background:#14143a}

        /* ── ACTIVATE LICENSE MODAL ──────────────── */
        .act-modal{background:#141422;border:1px solid #2a2a50;border-radius:14px;
          padding:26px;width:100%;max-width:360px;position:relative;
          box-shadow:0 40px 80px rgba(0,0,0,.85);
          animation:slideUp .28s cubic-bezier(.34,1.4,.64,1)}
        .act-title{font-size:15px;font-weight:600;color:#f0f0ff;margin-bottom:5px}
        .act-sub{font-size:12px;color:#7070a0;line-height:1.6;margin-bottom:16px}
        .act-input-wrap{position:relative;margin-bottom:6px}
        .act-input{width:100%;padding:11px 14px;background:#0d0d1c;border:1px solid #303060;
          border-radius:7px;color:#e0e0ff;font-family:'IBM Plex Mono',monospace;font-size:12px;
          letter-spacing:.08em;outline:none;transition:border-color .15s}
        .act-input:focus{border-color:#7070e0}
        .act-input.err{border-color:#a03030}
        .act-err{font-size:11px;color:#e06060;margin-bottom:10px;
          font-family:'IBM Plex Mono',monospace;letter-spacing:.02em;line-height:1.5}
        .act-validate-btn{width:100%;padding:11px;border-radius:7px;border:none;
          background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;
          font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;margin-bottom:8px}
        .act-validate-btn:hover:not(:disabled){opacity:.9}
        .act-validate-btn:disabled{opacity:.5;cursor:not-allowed}
        .act-back{width:100%;padding:8px;border-radius:6px;border:1px solid #25253a;
          background:transparent;color:#505080;font-size:11px;cursor:pointer;
          font-family:'IBM Plex Mono',monospace;transition:all .15s;letter-spacing:.04em}
        .act-back:hover{color:#8080b0;border-color:#40406a}
        .act-success{display:flex;flex-direction:column;align-items:center;gap:10px;
          padding:10px 0 6px;text-align:center}
        .act-success-icon{animation:popIn .35s cubic-bezier(.34,1.56,.64,1)}
        @keyframes popIn{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
        .act-success-title{font-size:16px;font-weight:600;color:#e0f8e8}
        .act-success-sub{font-size:11px;color:#60a070;font-family:'IBM Plex Mono',monospace;letter-spacing:.04em}

        /* ── EXPORT PREVIEW MODAL ───────────────── */
        .prev-backdrop{position:absolute;inset:0;z-index:55;background:rgba(0,0,0,.88);
          display:flex;align-items:center;justify-content:center;padding:20px;
          animation:fadeIn .18s ease-out}
        .prev-modal{background:#141422;border:1px solid #2a2a50;border-radius:14px;
          width:100%;max-width:680px;overflow:hidden;
          box-shadow:0 40px 80px rgba(0,0,0,.85);
          animation:slideUp .25s cubic-bezier(.34,1.4,.64,1);
          display:flex;flex-direction:column}
        .prev-header{padding:14px 18px;border-bottom:1px solid #1e1e30;
          display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
        .prev-title{font-size:13px;font-weight:600;color:#d0d0f0}
        .prev-badge{font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:.1em;
          padding:2px 8px;border-radius:4px;text-transform:uppercase;font-weight:600}
        .prev-badge.free{background:#1a1a28;border:1px solid #303050;color:#6060a0}
        .prev-badge.pro{background:linear-gradient(135deg,#3730a3,#6d28d9);
          border:1px solid #5050c0;color:#d0d0ff}
        .prev-img-wrap{padding:16px;background:#0c0c14;display:flex;
          align-items:center;justify-content:center;min-height:200px;max-height:52vh;overflow:hidden}
        .prev-img{max-width:100%;max-height:50vh;object-fit:contain;border-radius:3px;
          box-shadow:0 8px 32px rgba(0,0,0,.6)}
        .prev-footer{padding:14px 18px;border-top:1px solid #1e1e30;display:flex;
          align-items:center;gap:10px;flex-shrink:0}
        .prev-note{flex:1;font-size:11px;color:#505080;font-family:'IBM Plex Mono',monospace;
          letter-spacing:.02em;line-height:1.5}
        .prev-note strong{color:#8080c0}
        .prev-download{display:flex;align-items:center;gap:7px;padding:9px 18px;
          border-radius:7px;border:none;background:linear-gradient(135deg,#166534,#15803d);
          color:#d0f8e0;font-size:12px;font-weight:600;cursor:pointer;
          transition:all .2s;white-space:nowrap}
        .prev-download:hover{opacity:.9;transform:translateY(-1px);
          box-shadow:0 6px 20px rgba(22,101,52,.4)}
        .prev-cancel{padding:9px 14px;border-radius:7px;border:1px solid #252540;
          background:transparent;color:#505080;font-size:12px;cursor:pointer;
          transition:all .15s;white-space:nowrap}
        .prev-cancel:hover{border-color:#404070;color:#9090b0}

        /* ── UPGRADE BUTTON GLOW ────────────────── */
        .btn-upgrade-pro{
          background:linear-gradient(135deg,#3730a3 0%,#6d28d9 100%) !important;
          border:1px solid #5050d0 !important;color:#e0d8ff !important;
          font-size:12px !important;font-weight:600 !important;
          padding:11px 14px !important;letter-spacing:.02em !important;
          box-shadow:0 0 0 0 rgba(99,102,241,.5);
          animation:proPulse 2.8s ease-in-out infinite !important}
        .btn-upgrade-pro:hover{
          background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%) !important;
          transform:translateY(-1px);
          box-shadow:0 6px 20px rgba(99,102,241,.4) !important}
        @keyframes proPulse{
          0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,.4)}
          50%{box-shadow:0 0 0 6px rgba(99,102,241,0)}}

        /* ── COPY LINK BUTTON ───────────────────── */
        .copy-link-btn{display:flex;align-items:center;gap:5px;padding:4px 10px;
          background:rgba(20,20,34,.95);border:1px solid #303060;border-radius:20px;
          font-family:'IBM Plex Mono',monospace;font-size:10px;color:#6060a0;
          cursor:pointer;transition:all .15s;letter-spacing:.04em}
        .copy-link-btn:hover{border-color:#6060c0;color:#a0a0e0;background:rgba(30,30,50,.95)}

        /* frame chrome overlay (CSS preview only) */
        .frame-bar{position:absolute;top:0;left:0;right:0;background:#1c1c1e;
          border-radius:3px 3px 0 0;display:flex;align-items:center;gap:0;
          padding:0 10px;z-index:2;overflow:hidden}
        .frame-dots{display:flex;align-items:center;gap:5px;flex-shrink:0}
        .fd{border-radius:50%;flex-shrink:0}
        .frame-bar-url{flex:1;margin:0 10px;background:#2c2c30;border-radius:20px}

        /* ── RESPONSIVE ─────────────────────── */
        @media(max-width:860px){
          .panel{position:absolute;top:0;bottom:0;left:0;transform:translateX(-100%);
            box-shadow:8px 0 48px rgba(0,0,0,.85)}
          .panel.open{transform:translateX(0)}
          .ph-close{display:block !important}
          .fab{display:flex}
          .statbar{font-size:9px;gap:9px;padding:4px 10px;bottom:9px}
          .wm{font-size:10px;bottom:9px}
          .dz{padding:36px 28px}
        }
        @media(max-width:480px){
          .panel{width:100vw;min-width:unset}
          .statbar{display:none}
          .badge{top:9px;right:9px}
        }
      `}</style>

      <div className="root">

        {/* ══ EXPORT PREVIEW MODAL ═════════════════════════════ */}
        {showPreview && previewUrl && (
          <div className="prev-backdrop" onClick={e => e.target===e.currentTarget && setShowPreview(false)}>
            <div className="prev-modal">
              <div className="prev-header">
                <span className="prev-title">Export Preview</span>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span className={`prev-badge ${isPro?"pro":"free"}`}>
                    {isPro ? "2× Retina" : "1× Standard"}
                  </span>
                  <button className="upg-close" style={{position:"static"}}
                    onClick={() => setShowPreview(false)}><X size={12}/></button>
                </div>
              </div>
              <div className="prev-img-wrap">
                <img src={previewUrl} className="prev-img" alt="Export preview" draggable={false}/>
              </div>
              <div className="prev-footer">
                <div className="prev-note">
                  {isPro
                    ? <><strong>2× retina</strong> · transparent background · watermark {ctrl.showWatermark?"on":"off"}</>
                    : <><strong>1× standard quality</strong> · watermark on · <span
                        style={{color:"#7070e0",cursor:"pointer",textDecoration:"underline"}}
                        onClick={() => { setShowPreview(false); setShowUpgrade(true); }}>
                        Upgrade for 2× retina →
                      </span></>
                  }
                </div>
                <button className="prev-cancel" onClick={() => setShowPreview(false)}>Cancel</button>
                <button className="prev-download" onClick={handleDownloadConfirmed}>
                  <Download size={13}/> Save PNG
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══ UPGRADE MODAL ════════════════════════════════════ */}
        {showUpgrade && !showActivate && (
          <div className="upg-backdrop" onClick={e => e.target===e.currentTarget && setShowUpgrade(false)}>
            <div className="upg-modal">
              <div className="upg-head">
                <button className="upg-close" onClick={() => setShowUpgrade(false)}><X size={12}/></button>
                <div className="upg-eyebrow">Perspecto Pro</div>
                <div className="upg-title">
                  <Sparkles size={18} style={{color:"#8080ff"}}/>
                  Unlock the full tool
                </div>
                <div className="upg-sub">
                  {exportsLeft === 0 ? "You've used all 3 free exports." : "Get unlimited exports, 2× quality, and more."}
                  {" "}One payment. Yours forever.
                </div>
              </div>
              <div className="upg-body">
                <div className="upg-compare">
                  <div className="upg-col free">
                    <div className="upg-col-hd">Free</div>
                    <div className="upg-row f">3 exports total</div>
                    <div className="upg-row f">1× resolution</div>
                    <div className="upg-row f">Watermark locked on</div>
                    <div className="upg-row f">PNG only</div>
                    <div className="upg-row f">No clipboard copy</div>
                  </div>
                  <div className="upg-col pro">
                    <div className="upg-col-hd"><Sparkles size={9}/> Pro</div>
                    <div className="upg-row p">Unlimited exports</div>
                    <div className="upg-row p">2× retina quality</div>
                    <div className="upg-row p">Remove watermark</div>
                    <div className="upg-row p">Export HTML file</div>
                    <div className="upg-row p">Copy image to clipboard</div>
                    <div className="upg-row p">Lifetime updates</div>
                  </div>
                </div>
                <div className="upg-price-row">
                  <div className="upg-price-num"><sup>$</sup>19</div>
                  <div className="upg-price-note">one-time · no subscription · yours forever</div>
                </div>
                <a className="upg-cta" href={POLAR_CHECKOUT_URL} target="_blank" rel="noopener noreferrer">
                  <Sparkles size={14}/> Get Perspecto Pro — $19
                </a>
                <div className="upg-divider">already purchased?</div>
                <button className="upg-act-btn" onClick={() => setShowActivate(true)}>
                  Activate my license key
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══ ACTIVATE LICENSE MODAL ═══════════════════════════ */}
        {showActivate && (
          <div className="upg-backdrop" onClick={e => e.target===e.currentTarget && setShowActivate(false)}>
            <div className="act-modal">
              <button className="upg-close" onClick={() => { setShowActivate(false); setLicenseError(""); }}
                style={{position:"absolute",top:14,right:14}}><X size={12}/></button>
              {licenseSuccess ? (
                <div className="act-success">
                  <CheckCircle2 size={52} className="act-success-icon" style={{color:"#60e080"}}/>
                  <div className="act-success-title">Pro Activated! 🎉</div>
                  <div className="act-success-sub">Enjoy unlimited exports ✦</div>
                </div>
              ) : (
                <>
                  <div className="act-title">Activate License Key</div>
                  <div className="act-sub">
                    After purchasing, you'll receive a license key by email from Polar.sh.
                    Paste it below to unlock Pro on this browser.
                  </div>
                  <input
                    className={`act-input${licenseError ? " err" : ""}`}
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    value={licenseKey}
                    onChange={e => { setLicenseKey(e.target.value); setLicenseError(""); }}
                    onKeyDown={e => e.key === "Enter" && handleActivateLicense()}
                    autoFocus spellCheck={false}
                  />
                  {licenseError && <div className="act-err">{licenseError}</div>}
                  <button className="act-validate-btn" onClick={handleActivateLicense}
                    disabled={licenseLoading || !licenseKey.trim()}>
                    {licenseLoading
                      ? <><Loader size={13} className="spin" style={{display:"inline",marginRight:6}}/>Validating…</>
                      : "Activate License"}
                  </button>
                  <button className="act-back"
                    onClick={() => { setShowActivate(false); setLicenseError(""); }}>
                    ← Back to upgrade options
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ══ SHARE MODAL ══════════════════════════════════════ */}
        {showModal && (
          <div className="mbk" onClick={e => e.target===e.currentTarget && setModal(false)}>
            <div className="mdl">
              <button className="mclose" onClick={() => setModal(false)}><X size={13}/></button>
              <div style={{display:"flex",alignItems:"center",gap:13}}>
                <div className="mico"><Share2 size={17} style={{color:"#6060cc"}}/></div>
                <div>
                  <div className="mtitle">Watermark removed!</div>
                  <div className="msub">free forever · no sign-up</div>
                </div>
              </div>
              <div className="mbody">
                If you find this useful, sharing it helps keep
                <strong> Perspecto</strong> free for everyone.
                Takes 10 seconds&thinsp;🙏
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                <a className="btn-share"
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("Just made this 3D UI mockup with Perspecto — free tool, no sign-up 🚀 ")}&url=${encodeURIComponent(typeof window!=="undefined"?window.location.href:"")}`}
                  target="_blank" rel="noopener noreferrer" onClick={() => setModal(false)}>
                  <Share2 size={13}/> Share on X / Twitter
                </a>
                <button className="btn-maybe" onClick={() => setModal(false)}>maybe later</button>
              </div>
            </div>
          </div>
        )}

        {/* ══ MOBILE FAB ═══════════════════════════════ */}
        <button className="fab" onClick={() => setPanel(v => !v)} aria-label="Controls">
          <Sliders size={16}/>
        </button>

        {/* ══ SIDEBAR PANEL ════════════════════════════ */}
        <aside className={`panel${panelOpen?" open":""}`}>
          <div className="ph">
            <div style={{display:"flex",alignItems:"center",gap:14,flex:1}}>
              {/* Logo — place your logo as /public/logo.png to replace this */}
              <LogoMark/>
              <div>
                <div className="eyebrow">Perspecto</div>
                <div className="ptitle">
                  3D Mockup Tool
                  {isPro && <span className="pro-badge"><Sparkles size={8}/> PRO</span>}
                </div>
                <div className="ptag">Free · no sign-up</div>
              </div>
            </div>
            <button className="ph-close" onClick={() => setPanel(false)}><X size={14}/></button>
          </div>
          {/* Tagline below header */}
          <div style={{padding:"8px 16px 14px",borderBottom:"1px solid #32324a"}}>
            <div className="ptagline">Turn any screenshot into a stunning 3D marketing visual in seconds.</div>
          </div>

          <div className="ca">

            {/* ── Presets ── */}
            <div className="sec">
              <div className="slbl"><ChevronRight size={9} style={{opacity:.4,flexShrink:0}}/>Quick Presets</div>
              <div style={{fontSize:10,color:"#8080b8",fontFamily:"'IBM Plex Mono',monospace",lineHeight:1.5,marginBottom:2}}>One click to a great starting angle.</div>
              <div className="preset-grid">
                {PRESETS.map(pr => {
                  const active = Math.round(ctrl.rotateX)===pr.rotateX &&
                                 Math.round(ctrl.rotateY)===pr.rotateY &&
                                 Math.round(ctrl.rotateZ)===pr.rotateZ;
                  return (
                    <button key={pr.label} className={`pbtn${active?" active":""}`}
                      onClick={() => applyPreset(pr)}>{pr.label}</button>
                  );
                })}
              </div>
            </div>

            {/* ── Transform ── */}
            <div className="sec">
              <div className="slbl"><Sliders size={9} style={{opacity:.4,flexShrink:0}}/>Camera &amp; Transform</div>
              <div style={{fontSize:10,color:"#8080b8",fontFamily:"'IBM Plex Mono',monospace",lineHeight:1.5,marginBottom:2}}>Rotate and tilt your image in 3D space. Drag the canvas too.</div>
              {T_SLIDERS.map(cfg => (
                <SliderW key={cfg.key} cfg={cfg} val={ctrl[cfg.key]} onChange={v => set(cfg.key, v)}/>
              ))}
            </div>

            {/* ── Depth Stack ── */}
            <div className="sec">
              <div className="slbl"><Layers size={9} style={{opacity:.4,flexShrink:0}}/>Layer Effects</div>
              <div style={{fontSize:10,color:"#8080b8",fontFamily:"'IBM Plex Mono',monospace",lineHeight:1.5,marginBottom:2}}>Separate the image into floating depth layers for a 3D feel.</div>
              {L_SLIDERS.map(cfg => (
                <SliderW key={cfg.key} cfg={cfg} val={ctrl[cfg.key]} onChange={v => set(cfg.key, v)}/>
              ))}
              <Toggle icon={<Eye size={12} style={{color:glassBorder?"#818cf8":"#7070a0"}}/>}
                label="Glass Edge Glow" val={glassBorder} onToggle={() => set("glassBorder",!glassBorder)}/>
              <Toggle icon={<Monitor size={12} style={{color:showFrame?"#818cf8":"#7070a0"}}/>}
                label="Browser Chrome Frame" val={showFrame} onToggle={() => set("showFrame",!showFrame)}/>
              <Toggle
                icon={<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={curveScreen?"#818cf8":"#7070a0"} strokeWidth="1.5" strokeLinecap="round"><path d="M1 6 Q3 2 6 2 Q9 2 11 6"/><path d="M1 6 Q3 10 6 10 Q9 10 11 6"/></svg>}
                label="Curved Screen Effect" val={curveScreen} onToggle={() => set("curveScreen",!curveScreen)}/>
              {curveScreen && (
                <SliderW
                  cfg={{ key:"curveIntensity", label:"Curve Amount", min:10, max:100, step:1, unit:"%", dec:0 }}
                  val={curveIntensity}
                  onChange={v => set("curveIntensity", v)}
                />
              )}
            </div>

            {/* ── Export ── */}
            <div className="sec">
              <div className="slbl"><Download size={9} style={{opacity:.4,flexShrink:0}}/>Export</div>
              <div style={{fontSize:10,color:"#8080b8",fontFamily:"'IBM Plex Mono',monospace",lineHeight:1.5,marginBottom:2}}>Save your mockup. PNG exports at {isPro ? "2×" : "1×"} resolution{isPro ? "" : " — upgrade for 2× retina"}.</div>
              <div>
                <div className="sm" style={{marginBottom:8}}>
                  <span className="sl">Export Background</span>
                </div>
                <div className="bg-pills">
                  {["transparent","dark","light"].map(bg => (
                    <button key={bg} className={`bgp${exportBg===bg?" sel":""}`}
                      onClick={() => set("exportBg", bg)}>{bg}</button>
                  ))}
                </div>
              </div>
              {isPro ? (
                <Toggle icon={<Droplets size={12} style={{color:showWatermark?"#818cf8":"#7070a0"}}/>}
                  label="Include Watermark" val={showWatermark} onToggle={toggleWatermark}/>
              ) : (
                <div className="trow" onClick={() => setShowUpgrade(true)} style={{cursor:"pointer"}}>
                  <div className="tleft">
                    <Droplets size={12} style={{color:"#404068"}}/>
                    <span className="tlbl" style={{color:"#505070"}}>Remove Watermark</span>
                  </div>
                  <span style={{fontSize:9,fontFamily:"'IBM Plex Mono',monospace",
                    color:"#5050a0",letterSpacing:".08em",background:"#1a1a38",
                    padding:"2px 6px",borderRadius:4,border:"1px solid #2a2a60"}}>PRO</span>
                </div>
              )}
            </div>

            {/* ── Dev + Designer Tools ── */}
            <div className="sec">
              <div className="slbl"><Code2 size={9} style={{opacity:.4,flexShrink:0}}/>Dev &amp; Designer Tools</div>
              <div style={{fontSize:10,color:"#8080b8",fontFamily:"'IBM Plex Mono',monospace",lineHeight:1.5,marginBottom:2}}>Copy-paste ready snippets for your project or design tool.</div>
              <div className="btn-row">
                <button className="btn" onClick={handleCopyCSS} disabled={!image}
                  title="Copy the CSS transform — free">
                  <Copy size={12}/>{copiedCSS ? "Copied!" : "Copy CSS"}
                </button>
                <button
                  className={`btn${!isPro ? " btn-locked" : copiedImg ? " btn-copied" : ""}`}
                  onClick={handleCopyImage} disabled={!image}
                  title={isPro ? "Copy PNG to clipboard" : "Pro feature — upgrade to unlock"}>
                  {!isPro ? <Lock size={12} className="lock-icon"/> : <ClipboardCopy size={12}/>}
                  {copiedImg ? "Copied!" : "Copy Image"}
                  {!isPro && <span style={{fontSize:8,fontFamily:"'IBM Plex Mono',monospace",
                    color:"#4040a0",letterSpacing:".08em",background:"#14143a",
                    padding:"1px 5px",borderRadius:3,border:"1px solid #252560",marginLeft:2}}>PRO</span>}
                </button>
              </div>
              <div style={{fontSize:10,color:"#404060",fontFamily:"'IBM Plex Mono',monospace",
                lineHeight:1.5,letterSpacing:".02em"}}>
                <span style={{color:"#7070a0"}}>Copy CSS</span> — paste into any stylesheet (free)<br/>
                <span style={{color:isPro?"#7070a0":"#404060"}}>Copy Image</span> — paste into Figma, Notion, Slack {!isPro && <span style={{color:"#4040a0"}}>(Pro)</span>}
              </div>
            </div>

          </div>

          {/* ── Footer ── */}
          <div className="pf">
            {/* File input hidden — accessible via Actions dropdown and canvas drop zone */}
            <input id={fileInputId} type="file" accept="image/*"
              onChange={e => loadFile(e.target.files[0])} style={{display:"none"}}/>
            {!isPro && (
              <button className="btn btn-upgrade-pro" onClick={() => setShowUpgrade(true)}>
                <Sparkles size={13}/> Upgrade to Pro — $19
              </button>
            )}
            {isPro && (
              <div style={{textAlign:"center",fontFamily:"'IBM Plex Mono',monospace",
                fontSize:10,color:"#6060a0",letterSpacing:".04em",padding:"4px 0"}}>
                <Sparkles size={10} style={{display:"inline",marginRight:5,color:"#8080c0"}}/> 
                Pro active — unlimited exports
              </div>
            )}
          </div>
        </aside>

        {/* ══ CANVAS WORKSPACE ═════════════════════════ */}
        <main className="cvs"
          onDrop={e => { e.preventDefault(); setDrag(false); loadFile(e.dataTransfer.files[0]); }}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={e => { if(!e.currentTarget.contains(e.relatedTarget)) setDrag(false); }}
          onClick={() => panelOpen && setPanel(false)}
          style={bgBlur>0 ? {position:"relative"} : {}}>

          {bgBlur>0 && (
            <div style={{position:"absolute",inset:0,zIndex:1,pointerEvents:"none",
              backdropFilter:`blur(${bgBlur}px)`,WebkitBackdropFilter:`blur(${bgBlur}px)`}}/>
          )}
          <div className="vig"/>

          {/* ══ ACTIONS BUTTON + DROPDOWN ══════════════════════ */}
          <div className="actions-wrap" ref={actionsRef}>
            {image && (
              <button className="copy-link-btn" onClick={handleCopyLink}
                title="Copy shareable link with your exact settings">
                <Link2 size={9}/> Share settings
              </button>
            )}
            <button
              className={`actions-btn${showActions?" open":""}`}
              onClick={() => setShowActions(v => !v)}>
              <Zap size={11}/> Actions
              <ChevronDown size={10} style={{transition:"transform .2s",transform:showActions?"rotate(180deg)":"rotate(0deg)"}}/>
            </button>
            {showActions && (
              <div className="actions-dd">
                <div className="dd-section">Export</div>
                <button className="dd-item green"
                  onClick={() => { setShowActions(false); handleExport(); }}
                  disabled={!image||exporting}>
                  {exporting ? <Loader size={13} className="dd-spin"/> : <Download size={13}/>}
                  <span className="dd-item-label">Export PNG {isPro?"(2×)":"(1×)"}</span>
                  {!isPro && exportsLeft > 0 && (
                    <span style={{fontSize:9,color:"#60a870",fontFamily:"'IBM Plex Mono',monospace"}}>{exportsLeft} left</span>
                  )}
                </button>
                <button
                  className={`dd-item${!isPro?" locked":exportHTMLDone?" blue":""}`}
                  onClick={() => { setShowActions(false); handleExportHTML(); }}
                  disabled={!image||exportingHTML}>
                  {exportingHTML ? <Loader size={13} className="dd-spin"/> : !isPro ? <Lock size={13}/> : <Code2 size={13}/>}
                  <span className="dd-item-label">{exportHTMLDone?"HTML Saved!":"Export HTML"}</span>
                  {!isPro && <span className="dd-pro-pill">PRO</span>}
                </button>

                <div className="dd-divider"/>
                <div className="dd-section">Tools</div>
                <button className="dd-item"
                  onClick={() => { setShowActions(false); handleCopyCSS(); }}
                  disabled={!image}>
                  <Copy size={13}/>
                  <span className="dd-item-label">{copiedCSS?"CSS Copied!":"Copy CSS"}</span>
                  <span style={{fontSize:9,color:"#505078",fontFamily:"'IBM Plex Mono',monospace",marginLeft:"auto"}}>free</span>
                </button>
                <button
                  className={`dd-item${!isPro?" locked":""}`}
                  onClick={() => { setShowActions(false); handleCopyImage(); }}
                  disabled={!image}>
                  {!isPro ? <Lock size={13}/> : <ClipboardCopy size={13}/>}
                  <span className="dd-item-label">{copiedImg?"Image Copied!":"Copy Image"}</span>
                  {!isPro && <span className="dd-pro-pill">PRO</span>}
                </button>

                <div className="dd-divider"/>
                <div className="dd-section">Manage</div>
                <label className="dd-item blue" htmlFor={fileInputId} style={{cursor:"pointer"}}>
                  <Upload size={13}/>
                  <span className="dd-item-label">{image?"Replace Image":"Upload Image"}</span>
                </label>
                {canUndo ? (
                  <button className="dd-item amber" onClick={() => { setShowActions(false); undo(); }}>
                    <Undo2 size={13}/>
                    <span className="dd-item-label">Undo Reset</span>
                  </button>
                ) : (
                  <button className="dd-item" onClick={() => { setShowActions(false); reset(); }}>
                    <RotateCcw size={13}/>
                    <span className="dd-item-label">Reset Defaults</span>
                  </button>
                )}
                {image && (
                  <button className="dd-item danger" onClick={() => { setShowActions(false); setImage(null); }}>
                    <X size={13}/>
                    <span className="dd-item-label">Remove Image</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Remove pill — always visible when image loaded */}
          {image && (
            <button className="remove-img-btn" onClick={() => setImage(null)}
              style={{opacity:1}} title="Remove image">
              <X size={9}/> Remove
            </button>
          )}

          {!image ? (
            <div style={{position:"relative",zIndex:3,display:"flex",flexDirection:"column",
              alignItems:"center",gap:14,width:"100%",maxWidth:500,padding:"0 20px"}}>
              <label className={`dz${isDragging?" drag":""}`} htmlFor={fileInputId}
                style={{width:"100%"}}>
                <ImageIcon size={36} strokeWidth={1} className="di"/>
                <div className="dp">
                  Drop a screenshot to begin
                  <div className="dp-sub">or click to browse your files</div>
                </div>
                <div className="dh">Ctrl+V to paste from clipboard</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap",justifyContent:"center"}}>
                  {["PNG","JPG","WebP","SVG"].map(f => <span key={f} className="fpill">{f}</span>)}
                </div>
              </label>
              <button className="btn-demo" onClick={e => { e.preventDefault(); loadDemo(); }}
                style={{width:"100%",justifyContent:"center",padding:"12px 20px",fontSize:12}}>
                <ZoomIn size={13}/> Try with demo screenshot
              </button>
            </div>
          ) : (
            <div
              className={`stage has-image${isDraggingCanvas?" grabbing":""}`}
              onMouseDown={onCanvasDragStart}
              onTouchStart={onCanvasDragStart}>
              <div style={{transform:`scale(${zoom/100})`,transformOrigin:"center center"}}>
                <LayerStack
                  image={image} imgRef={imgRef}
                  perspective={perspective}
                  rotateX={rotateX} rotateY={rotateY} rotateZ={rotateZ}
                  layerSep={layerSep}
                  shadowY={sY} shadowBlur={sB} shadowSpread={sS} shadowOpacity={sO}
                  shadowIntensity={shadowIntensity}
                  glassBorder={glassBorder}
                  showFrame={showFrame}
                  curveScreen={curveScreen}
                  curveIntensity={curveIntensity}
                />
              </div>
            </div>
          )}

          {/* ══ ACTIONS BUTTON + DROPDOWN ══════════════════════ */}
          <div className="actions-wrap" ref={actionsRef}>
            {/* Share settings pill */}
            {image && (
              <button className="copy-link-btn" onClick={handleCopyLink}
                title="Copy shareable link with your exact settings">
                <Link2 size={9}/> Share settings
              </button>
            )}

            {/* Actions button */}
            <button
              className={`actions-btn${showActions?" open":""}`}
              onClick={() => setShowActions(v => !v)}>
              <Zap size={11}/> Actions <ChevronDown size={10} style={{transition:"transform .2s",transform:showActions?"rotate(180deg)":"rotate(0deg)"}}/>
            </button>

            {/* Dropdown */}
            {showActions && (
              <div className="actions-dd">

                {/* ── Export ── */}
                <div className="dd-section">Export</div>

                <button
                  className="dd-item green"
                  onClick={() => { setShowActions(false); handleExport(); }}
                  disabled={!image||exporting}>
                  {exporting ? <Loader size={13} className="dd-spin"/> : <Download size={13}/>}
                  <span className="dd-item-label">
                    Export PNG {isPro ? "(2×)" : "(1×)"}
                  </span>
                  {!isPro && exportsLeft > 0 && (
                    <span style={{fontSize:9,color:"#60a070",fontFamily:"'IBM Plex Mono',monospace"}}>
                      {exportsLeft} left
                    </span>
                  )}
                </button>

                <button
                  className={`dd-item${!isPro?" locked":exportHTMLDone?" blue":""}`}
                  onClick={() => { setShowActions(false); handleExportHTML(); }}
                  disabled={!image||exportingHTML}>
                  {exportingHTML
                    ? <Loader size={13} className="dd-spin"/>
                    : !isPro ? <Lock size={13}/>
                    : <Code2 size={13}/>}
                  <span className="dd-item-label">
                    {exportHTMLDone ? "HTML Saved!" : "Export HTML"}
                  </span>
                  {!isPro && <span className="dd-pro-pill">PRO</span>}
                </button>

                <div className="dd-divider"/>

                {/* ── Tools ── */}
                <div className="dd-section">Tools</div>

                <button
                  className="dd-item"
                  onClick={() => { setShowActions(false); handleCopyCSS(); }}
                  disabled={!image}>
                  <Copy size={13}/>
                  <span className="dd-item-label">{copiedCSS ? "CSS Copied!" : "Copy CSS"}</span>
                  <span style={{fontSize:9,color:"#606090",fontFamily:"'IBM Plex Mono',monospace",marginLeft:"auto"}}>free</span>
                </button>

                <button
                  className={`dd-item${!isPro?" locked":""}`}
                  onClick={() => { setShowActions(false); handleCopyImage(); }}
                  disabled={!image}>
                  {!isPro ? <Lock size={13}/> : <ClipboardCopy size={13}/>}
                  <span className="dd-item-label">{copiedImg ? "Image Copied!" : "Copy Image"}</span>
                  {!isPro && <span className="dd-pro-pill">PRO</span>}
                </button>

                <div className="dd-divider"/>

                {/* ── Manage ── */}
                <div className="dd-section">Manage</div>

                <label className="dd-item blue" htmlFor={fileInputId} style={{cursor:"pointer"}}>
                  <Upload size={13}/>
                  <span className="dd-item-label">{image ? "Replace Image" : "Upload Image"}</span>
                </label>

                {canUndo ? (
                  <button className="dd-item amber"
                    onClick={() => { setShowActions(false); undo(); }}>
                    <Undo2 size={13}/>
                    <span className="dd-item-label">Undo Reset</span>
                  </button>
                ) : (
                  <button className="dd-item"
                    onClick={() => { setShowActions(false); reset(); }}>
                    <RotateCcw size={13}/>
                    <span className="dd-item-label">Reset Defaults</span>
                  </button>
                )}

                {image && (
                  <button className="dd-item danger"
                    onClick={() => { setShowActions(false); setImage(null); }}>
                    <X size={13}/>
                    <span className="dd-item-label">Remove Image</span>
                  </button>
                )}

              </div>
            )}
          </div>

          {/* Remove image — visible when image loaded */}
          {image && (
            <button className="remove-img-btn" onClick={() => setImage(null)}
              style={{opacity:1}}
              title="Remove image — return to drop zone">
              <X size={9}/> Remove
            </button>
          )}

          {image && <>
            {/* Drag to rotate badge */}
            <div className="badge">
              <div className="ldot"/>
              {isDraggingCanvas ? "rotating…" : "drag to rotate"}
            </div>

            {isPro && showWatermark && (
              <div className="wm"><div className="wm-dot"/>via Perspecto</div>
            )}
            {!isPro && (
              <div className="wm"><div className="wm-dot"/>via Perspecto</div>
            )}

            <div className="statbar">
              <span>P {Math.round(perspective)}px</span><span className="dot">·</span>
              <span>X {Math.round(rotateX)}°</span><span className="dot">·</span>
              <span>Y {Math.round(rotateY)}°</span><span className="dot">·</span>
              <span>Z {Math.round(rotateZ)}°</span><span className="dot">·</span>
              <span>SEP {Math.round(layerSep)}px</span><span className="dot">·</span>
              <span>ZOOM {Math.round(zoom)}%</span>
            </div>
          </>}

          {toast && (
            <div className={`toast ${toast.type}`}>{toast.msg}</div>
          )}
        </main>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// LOGO MARK
// To use your own logo: drop logo.png (or logo.svg) into the
// /public/ folder of this project, then redeploy.
// It auto-sizes to match the sidebar header text height.
// ─────────────────────────────────────────────────────────────

function LogoMark() {
  const [useFallback, setUseFallback] = useState(false);
  if (useFallback) {
    return (
      <div className="logo-fallback">
        <svg viewBox="0 0 18 22" width="13" height="16" fill="white">
          <path fillRule="evenodd" d="M0 22V0h9C13.4 0 17 2.5 17 6.5S13.4 13 9 13H3v9H0zm3-12h5.5c3 0 5.5-1.1 5.5-3.5S11.5 3 8.5 3H3v7z"/>
        </svg>
      </div>
    );
  }
  return (
    <div className="logo-mark">
      <img src="/logo.png" alt="Perspecto" className="logo-img"
        onError={() => setUseFallback(true)} draggable={false}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LAYER STACK — CSS 3D live preview
// ─────────────────────────────────────────────────────────────

function LayerStack({ image, imgRef, perspective, rotateX, rotateY, rotateZ,
                      layerSep, shadowY, shadowBlur, shadowSpread, shadowOpacity,
                      shadowIntensity, glassBorder, showFrame,
                      curveScreen, curveIntensity }) {

  // Compute frame bar height relative to image natural size → we'll use 4.4% of CSS width
  // We don't know exact CSS render width up front, so use a ref to measure
  const baseImgRef = useRef(null);
  const [frameH, setFrameH] = useState(0);

  useEffect(() => {
    if (!showFrame || !baseImgRef.current) { setFrameH(0); return; }
    const update = () => {
      const w = baseImgRef.current?.offsetWidth || 0;
      setFrameH(Math.round(w * 0.044));
    };
    update();
    const ro = new ResizeObserver(update);
    if (baseImgRef.current) ro.observe(baseImgRef.current);
    return () => ro.disconnect();
  }, [showFrame, image]);

  const wrap = {
    transform:`perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`,
    transformStyle:"preserve-3d",
    position:"relative",
    display:"inline-flex",
    alignItems:"center",
    justifyContent:"center",
  };

  const imgStyle = {
    display:"block",
    maxWidth:"min(76vw,800px)",
    maxHeight:"68vh",
    objectFit:"contain",
    userSelect:"none",
    WebkitUserDrag:"none",
    borderRadius: curveScreen ? Math.round(4 + curveIntensity * 0.12) : 3,
    marginTop: showFrame ? frameH : 0,
  };

  // ── Curve effect values ────────────────────────────────────
  // scaleX compression: simulates the image wrapping around a curve
  const curveScaleX = curveScreen ? 1 - (curveIntensity * 0.0008) : 1;
  // Edge shadow spread: darker edges = more pronounced curve feel
  const curveEdgeOpacity = curveScreen ? Math.min(0.72, curveIntensity * 0.007) : 0;
  // Center highlight width: thinner highlight = subtler curve
  const curveHighlightW = curveScreen ? Math.max(8, 30 - curveIntensity * 0.2) : 0;
  // Corner radius on the curve container
  const curveRadius = curveScreen ? Math.round(6 + curveIntensity * 0.14) : 4;

  // The curve overlay sits on top of the base image
  const CurveOverlay = curveScreen ? (
    <div style={{
      position:"absolute",
      inset:0,
      borderRadius: curveRadius,
      pointerEvents:"none",
      // Edge darkening — simulates the screen curving away from viewer
      background:`radial-gradient(
        ellipse 110% 100% at 50% 50%,
        transparent 30%,
        rgba(0,0,0,${(curveEdgeOpacity * 0.5).toFixed(3)}) 70%,
        rgba(0,0,0,${curveEdgeOpacity.toFixed(3)}) 100%
      )`,
      zIndex:2,
    }}>
      {/* Center highlight strip — light reflecting off the curve apex */}
      <div style={{
        position:"absolute",
        top:"8%", bottom:"8%",
        left:`calc(50% - ${curveHighlightW / 2}px)`,
        width: curveHighlightW,
        background:`linear-gradient(180deg,
          transparent 0%,
          rgba(255,255,255,${(curveIntensity * 0.0012).toFixed(4)}) 20%,
          rgba(255,255,255,${(curveIntensity * 0.0018).toFixed(4)}) 50%,
          rgba(255,255,255,${(curveIntensity * 0.0012).toFixed(4)}) 80%,
          transparent 100%
        )`,
        borderRadius:"50%",
        filter:`blur(${Math.round(curveIntensity * 0.08)}px)`,
        pointerEvents:"none",
        mixBlendMode:"screen",
      }}/>
    </div>
  ) : null;

  return (
    <div style={wrap}>

      {/* Layer 0 — Behind: blurred ambient glow */}
      <div style={{position:"absolute",inset:0,
        transform:`translateZ(${-layerSep}px)`,backfaceVisibility:"hidden",
        display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
        <img src={image} alt="" draggable={false} style={{
          ...imgStyle, marginTop:0,
          filter:`blur(${Math.max(8,layerSep*0.18)}px) brightness(0.42) saturate(1.6)`,
          opacity:Math.min(0.58,0.12+layerSep*0.003),
        }}/>
      </div>

      {/* Layer 1 — Base image */}
      <div style={{position:"relative",transform:`translateZ(0px) scaleX(${curveScaleX})`,
        backfaceVisibility:"hidden",display:"flex",alignItems:"center",
        justifyContent:"center",
        boxShadow:shadowIntensity>0
          ?`0 ${shadowY.toFixed(1)}px ${shadowBlur.toFixed(1)}px ${shadowSpread.toFixed(1)}px rgba(0,0,0,${shadowOpacity.toFixed(2)})`
          :"none"}}>

        {/* Browser chrome bar */}
        {showFrame && frameH > 0 && (
          <div className="frame-bar" style={{height:frameH, top:-frameH}}>
            <div className="frame-dots">
              {[["#ff5f57",frameH*.16],["#ffbd2e",frameH*.16],["#28c841",frameH*.16]].map(([c,r],i) => (
                <div key={i} className="fd" style={{width:r*2,height:r*2,background:c}}/>
              ))}
            </div>
            <div className="frame-bar-url" style={{height:frameH*0.44,borderRadius:frameH*0.22}}/>
          </div>
        )}

        <div style={{position:"relative",display:"inline-flex"}}>
          <img ref={(el) => { baseImgRef.current=el; if(imgRef) imgRef.current=el; }}
            src={image} alt="3D base layer" draggable={false} style={imgStyle}/>
          {/* Curve overlay — edge darkening + center highlight */}
          {CurveOverlay}
        </div>
      </div>

      {/* Layer 2 — Foreground glass pane */}
      {layerSep > 0 && (
        <div style={{position:"absolute",inset:0,
          transform:`translateZ(${layerSep}px)`,backfaceVisibility:"hidden",
          display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
          <div style={{position:"relative",display:"inline-flex",
            alignItems:"center",justifyContent:"center"}}>
            <img src={image} alt="" draggable={false} style={{
              ...imgStyle, marginTop:0,
              opacity:Math.min(0.22,0.03+layerSep*0.0013),
              filter:"brightness(1.6) saturate(0.3)",
              mixBlendMode:"screen",
            }}/>
            <div style={{
              position:"absolute",inset:0,borderRadius:4,
              background:`linear-gradient(135deg,
                rgba(255,255,255,${Math.min(.07,layerSep*.0004)}) 0%,
                rgba(255,255,255,.007) 50%,
                rgba(160,140,255,${Math.min(.04,layerSep*.0002)}) 100%)`,
              backdropFilter:layerSep>18?`blur(${Math.min(layerSep*.09,7)}px)`:"none",
              WebkitBackdropFilter:layerSep>18?`blur(${Math.min(layerSep*.09,7)}px)`:"none",
              border:glassBorder
                ?`1px solid rgba(255,255,255,${Math.min(.30,.08+layerSep*.0016)})`
                :"1px solid transparent",
              boxShadow:glassBorder
                ?`0 0 ${Math.min(22,layerSep*.28)}px rgba(160,160,255,${Math.min(.2,layerSep*.0016)}),inset 0 1px 0 rgba(255,255,255,.1)`
                :"none",
              transition:"border .28s,box-shadow .28s",
              pointerEvents:"none",
            }}/>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SLIDER WIDGET
// ─────────────────────────────────────────────────────────────
function SliderW({ cfg, val, onChange }) {
  const { label, min, max, step, unit, dec } = cfg;
  const pct = ((val-min)/(max-min))*100;
  const display = dec>0 ? val.toFixed(dec) : Math.round(val);
  return (
    <div className="sw">
      <div className="sm">
        <span className="sl">{label}</span>
        <span className="sv">{display}{unit}</span>
      </div>
      <div className="tw">
        <div className="tbg"/>
        <div className="tf" style={{width:`${pct}%`}}/>
        <input type="range" min={min} max={max} step={step} value={val}
          onChange={e => onChange(e.target.value)}/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TOGGLE ROW
// ─────────────────────────────────────────────────────────────
function Toggle({ icon, label, val, onToggle }) {
  return (
    <div className="trow" onClick={onToggle} role="switch" aria-checked={val}
      tabIndex={0} onKeyDown={e => e.key===" " && onToggle()}>
      <div className="tleft">{icon}<span className="tlbl">{label}</span></div>
      <div className={`ttrack${val?" on":""}`}><div className="tthumb"/></div>
    </div>
  );
}
