import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const distDir = new URL("../dist/", import.meta.url);
const indexUrl = new URL("index.html", distDir);
const sourceHtml = await readFile(indexUrl, "utf8");
const shimTag = '    <script src="/github-pages-shim.js"></script>\n';

function injectShim(html) {
  if (html.includes("/github-pages-shim.js")) return html;
  return html.replace("  </head>", `${shimTag}  </head>`);
}

const appHtml = injectShim(sourceHtml);
await writeFile(indexUrl, appHtml, "utf8");

for (const route of ["ko", "ja", "en"]) {
  const routeIndex = new URL(`${route}/index.html`, distDir);
  await mkdir(dirname(routeIndex.pathname), { recursive: true });
  await writeFile(routeIndex, appHtml, "utf8");
}

await writeFile(new URL("404.html", distDir), appHtml, "utf8");

const adminTarget = "https://365dailysnap.netlify.app/admin-v2.html";
const adminRedirect = `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, nofollow" />
    <meta http-equiv="refresh" content="0; url=${adminTarget}" />
    <title>365 Daily Snap 관리자 이동</title>
  </head>
  <body>
    <p>관리자 페이지로 이동 중입니다. <a href="${adminTarget}">바로 이동</a></p>
    <script>window.location.replace(${JSON.stringify(adminTarget)});</script>
  </body>
</html>
`;

for (const path of ["admin/index.html", "manager/index.html", "admin.html", "admin-v2.html"]) {
  const target = new URL(path, distDir);
  await mkdir(dirname(target.pathname), { recursive: true });
  await writeFile(target, adminRedirect, "utf8");
}

await writeFile(new URL("CNAME", distDir), "snap.lavalabs.co.kr\n", "utf8");
await writeFile(new URL(".nojekyll", distDir), "", "utf8");

console.log("Prepared GitHub Pages routes, API shim, admin redirect, and custom domain.");
