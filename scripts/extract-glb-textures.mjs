// Extrae las imágenes embebidas de un .glb para inspeccionar su layout UV
import { readFileSync, writeFileSync } from "node:fs";

const glbPath = process.argv[2] ?? "public/lanyard/card.glb";
const buf = readFileSync(glbPath);

// GLB: header (12 bytes) + chunks [length, type, data]
const jsonLength = buf.readUInt32LE(12);
const json = JSON.parse(buf.subarray(20, 20 + jsonLength).toString("utf8"));

const binStart = 20 + jsonLength + 8; // header del chunk BIN
const bin = buf.subarray(binStart);

console.log("Meshes:", json.meshes?.map((m) => m.name));
console.log("Materials:", json.materials?.map((m) => m.name));
console.log("Images:", json.images?.length ?? 0);

(json.images ?? []).forEach((img, i) => {
  const bv = json.bufferViews[img.bufferView];
  const data = bin.subarray(bv.byteOffset ?? 0, (bv.byteOffset ?? 0) + bv.byteLength);
  const ext = img.mimeType === "image/png" ? "png" : "jpg";
  const out = `scripts/glb-image-${i}-${img.name ?? "unnamed"}.${ext}`;
  writeFileSync(out, data);
  console.log(`-> ${out} (${img.mimeType}, ${(bv.byteLength / 1024).toFixed(0)} KB)`);
});
