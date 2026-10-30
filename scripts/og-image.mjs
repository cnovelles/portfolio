// Renders the default social preview image (public/og-default.png, 1200×630)
// with the site's fonts and tokens, using headless Chrome.
//
//   node scripts/og-image.mjs
//
// Set CHROME_PATH if Chrome isn't at the default macOS location.
// The PNG is committed; rerun this only when the name, title or design changes.
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

const root = fileURLToPath(new URL("..", import.meta.url));
const out = join(root, "public/og-default.png");
const chrome =
  process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const font = (pkg, file) =>
  pathToFileURL(join(root, "node_modules/@fontsource-variable", pkg, "files", file)).href;

// Kept in sync with src/styles/global.css (light theme) and src/data/profile.ts.
const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
@font-face { font-family: Bricolage; font-weight: 200 800;
  src: url(${font("bricolage-grotesque", "bricolage-grotesque-latin-wght-normal.woff2")}) format("woff2"); }
@font-face { font-family: Hanken; font-weight: 100 900;
  src: url(${font("hanken-grotesk", "hanken-grotesk-latin-wght-normal.woff2")}) format("woff2"); }
html, body { margin: 0; width: 1200px; height: 630px; background: #ffffff; }
body { box-sizing: border-box; padding: 88px 96px; display: flex; flex-direction: column;
  justify-content: center; color: #14232a; font-family: Hanken, sans-serif;
  border-bottom: 16px solid #0b6e73; }
.rule { width: 96px; height: 8px; background: #0b6e73; border-radius: 4px; }
h1 { font-family: Bricolage, sans-serif; font-weight: 700; font-size: 104px; line-height: 0.95;
  letter-spacing: -0.03em; margin: 48px 0 0; max-width: 900px; }
p { margin: 32px 0 0; font-size: 44px; font-weight: 600; color: #0b6e73; }
</style></head>
<body>
  <div class="rule"></div>
  <h1>Christian Gonzalez Lopez</h1>
  <p>Full-Stack Software Engineer</p>
</body></html>`;

const dir = mkdtempSync(join(tmpdir(), "og-"));
try {
  const page = join(dir, "og.html");
  const shot = join(dir, "og.png");
  writeFileSync(page, html);
  execFileSync(chrome, [
    "--headless",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--allow-file-access-from-files",
    "--virtual-time-budget=2000",
    "--window-size=1200,630",
    `--screenshot=${shot}`,
    pathToFileURL(page).href,
  ]);
  await sharp(shot)
    .resize(1200, 630, { fit: "cover", position: "top" })
    .png({ compressionLevel: 9, palette: true })
    .toFile(out);
  console.log(`Wrote ${out}`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
