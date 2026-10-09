import { cp, mkdir } from "node:fs/promises";
await mkdir("dist", { recursive: true });
for (const file of [
  "index.html",
  "src",
  "assets",
  "Cubitos_BaseGame_Rulebook_Optimized.pdf",
  "Cubitos_Traduccion_cartas.pdf",
]) {
  await cp(file, `dist/${file}`, { recursive: true });
}
console.log("Aplicación estática generada en dist/");
