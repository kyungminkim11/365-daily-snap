import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const distDir = new URL("../dist/", import.meta.url);
const indexUrl = new URL("index.html", distDir);
const appHtml = await readFile(indexUrl, "utf8");

function ensureParent(fileUrl) {
  return mkdir(dirname(fileURLToPath(fileUrl)), { recursive: true });
}

await writeFile(indexUrl, appHtml, "utf8");

for (const route of ["ko", "ja", "en"]) {
  const routeIndex = new URL(`${route}/index.html`, distDir);
  await ensureParent(routeIndex);
  await writeFile(routeIndex, appHtml, "utf8");
}

await writeFile(new URL("404.html", distDir), appHtml, "utf8");

const adminTarget = "/admin-v2.html";
const adminRedirect = `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, nofollow" />
    <meta http-equiv="refresh" content="0; url=${adminTarget}" />
    <title>365 Daily Snap Admin</title>
  </head>
  <body>
    <p>Redirecting to the admin page. <a href="${adminTarget}">Open admin</a></p>
    <script>window.location.replace(${JSON.stringify(adminTarget)});</script>
  </body>
</html>
`;

for (const path of ["admin/index.html", "manager/index.html", "admin.html"]) {
  const target = new URL(path, distDir);
  await ensureParent(target);
  await writeFile(target, adminRedirect, "utf8");
}

await writeFile(new URL("CNAME", distDir), "snap.lavalabs.co.kr\n", "utf8");
await writeFile(new URL(".nojekyll", distDir), "", "utf8");

console.log("Prepared GitHub Pages routes, admin aliases, and custom domain.");
