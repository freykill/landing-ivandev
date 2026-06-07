// Genera las texturas personalizadas del Lanyard (card + cinta)
// Estilo "NEXTER": tipografía limpia + marca vertical + formas geométricas
// Uso: node scripts/generate-lanyard-textures.mjs
import sharp from "sharp";

const PURPLE = "#7c5cfc";
const DARK = "#18141f";
const BG = "#1a1a1a";

// ── Card (1678x1677) ─────────────────────────────────────────
// Geometría real (medida en card.glb, mesh 0):
//  - Cada cara muestrea MEDIA textura en ancho (u 0..0.5 → 839px) y solo hasta
//    v=0.7572 en alto (≈1270px). El contenido bajo y≈1270 NO se ve.
//  - La cara física mide 0.7164 ancho x 1.0 alto (aspect 0.7164:1), pero la
//    zona de textura visible es 839x1270 (aspect 0.662:1) → comprime el
//    contenido ~8% en vertical. Por eso pre-estiramos en Y (scale 1,K).
//  - mitad izquierda → CARA FRONTAL (morada), mitad derecha → trasera (oscura).
const VIS_H = 0.7572 * 1677; // alto visible de la textura ≈ 1270px
const FACE_ASPECT = 0.7164; // ancho/alto físico de la cara
const half = (ox, bg, fg, shapes) => {
  const W = 839;
  const pad = 96;
  const x = ox + pad; // borde izquierdo del contenido
  const IDEAL_H = W / FACE_ASPECT; // alto sin deformar ≈ 1171px
  const K = VIS_H / IDEAL_H; // pre-estiramiento vertical ≈ 1.083

  // Wordmark fantasma: "IVANDEV" repetido, rotado y muy tenue, llena la cara.
  const ghost = (color, op) => {
    let lines = "";
    for (let i = -1; i < 8; i++) {
      lines += `<text x="${ox + W / 2}" y="${40 + i * 230}" text-anchor="middle"
        font-family="Segoe UI, Arial, sans-serif" font-weight="800" font-size="210"
        letter-spacing="6" fill="${color}">IVANDEV</text>`;
    }
    return `<g opacity="${op}" transform="rotate(-20 ${ox + W / 2} 840)">${lines}</g>`;
  };

  // Contenido nítido en "espacio ideal" (y 0..1171) y pre-estirado en Y por K
  // para corregir el aspect ratio. Posiciones elegidas para que tras el ×K
  // queden donde estaban en el render aprobado (logo ~330, marca ~850).
  return `
  <g clip-path="url(#clip-${ox})">
    <!-- fondo a sangre + wordmark fantasma (sin corregir: es decorativo) -->
    <rect x="${ox}" y="0" width="${W}" height="1677" fill="${bg}"/>
    ${ghost(fg, bg === DARK ? 0.05 : 0.08)}

    <g transform="scale(1, ${K.toFixed(4)})">
      <!-- logo: glifo de código </> -->
      <text x="${x - 6}" y="305" font-family="Consolas, monospace"
            font-weight="700" font-size="150" fill="${shapes}">&lt;/&gt;</text>

      <!-- etiqueta de rol (pequeña, sobre la marca) -->
      <text x="${x}" y="669" font-family="Consolas, monospace" font-size="27"
            letter-spacing="8" fill="${fg}" opacity="0.65">FULL-STACK DEVELOPER</text>

      <!-- marca grande -->
      <text x="${x - 6}" y="785" font-family="Segoe UI, Arial, sans-serif"
            font-weight="800" font-size="124" letter-spacing="2" fill="${fg}">IVANDEV</text>

      <!-- divisor -->
      <rect x="${x}" y="859" width="560" height="4" fill="${shapes}"/>
    </g>
  </g>`;
};

const cardSVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="1678" height="1677">
  <defs>
    <clipPath id="clip-0"><rect x="0" y="0" width="839" height="1677"/></clipPath>
    <clipPath id="clip-839"><rect x="839" y="0" width="839" height="1677"/></clipPath>
  </defs>

  <rect width="1678" height="1677" fill="${BG}"/>

  <!-- ── FRONTAL: morado con chevrones oscuros ── -->
  ${half(0, PURPLE, "#ffffff", DARK)}

  <!-- ── TRASERA: oscura con chevrones morados ── -->
  ${half(839, DARK, "#ffffff", PURPLE)}
</svg>`;

await sharp(Buffer.from(cardSVG)).png().toFile("public/lanyard/card-texture.png");
console.log("✓ public/lanyard/card-texture.png");

// ── Cinta (1025x250) ─────────────────────────────────────────
// El meshline la muestrea espejada (repeat x negativo), así que
// pre-espejamos el texto para que se lea bien en pantalla.
// Cinta negra lisa: en una banda tan delgada cualquier figura se aplasta
// y delata la repetición de la textura, así que va sólida.
const strapSVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="1025" height="250">
  <rect width="1025" height="250" fill="#141414"/>
</svg>`;

await sharp(Buffer.from(strapSVG)).png().toFile("public/lanyard/strap.png");
console.log("✓ public/lanyard/strap.png");
