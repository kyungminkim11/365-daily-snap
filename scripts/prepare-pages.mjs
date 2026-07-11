import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const distDir = new URL("../dist/", import.meta.url);

function ensureParent(fileUrl) {
  return mkdir(dirname(fileURLToPath(fileUrl)), { recursive: true });
}

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

console.log("Preserved generated route metadata and prepared GitHub Pages aliases.");
