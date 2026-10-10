import { cp, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
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
// Version the complete module graph, not just the entry point: browsers also
// cache imported modules independently. The same source produces the same tag.
async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const groups = await Promise.all(entries.map(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(file) : [file];
  }));
  return groups.flat().sort();
}
const files = await sourceFiles('src');
const hash = createHash('sha256');
hash.update(await readFile('index.html'));
for (const file of files) hash.update(await readFile(file));
const version = hash.digest('hex').slice(0, 12);
for (const file of files.filter(file => file.endsWith('.js'))) {
  const source = await readFile(file, 'utf8');
  const versioned = source.replace(/(["'])(\.\/[\w./-]+\.(?:js|json))\1/g, (_, quote, url) => `${quote}${url}?v=${version}${quote}`);
  await writeFile(path.join('dist', file), versioned);
}
const html = await readFile('index.html', 'utf8');
await writeFile('dist/index.html', html.replace(/(\.\/src\/(?:app\.js|styles\.css))/g, `$1?v=${version}`));
console.log(`Aplicación estática generada en dist/ · versión ${version}`);
