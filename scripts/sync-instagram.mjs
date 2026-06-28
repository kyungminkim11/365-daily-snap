import { access, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, "public", "portfolio", "instagram-feed.json");
const mediaRoot = path.join(root, "public", "portfolio", "uploads", "instagram-live");
const publicMediaRoot = "/portfolio/uploads/instagram-live";

const token = String(process.env.INSTAGRAM_ACCESS_TOKEN || "").trim();
const accountId = String(process.env.INSTAGRAM_ACCOUNT_ID || "").trim();
const baseUrl = String(process.env.INSTAGRAM_API_BASE_URL || "https://graph.instagram.com").replace(/\/+$/, "");
const syncLimit = Math.min(100, Math.max(1, Number(process.env.INSTAGRAM_SYNC_LIMIT || 60)));

if (!token) {
  console.log("Instagram sync skipped: INSTAGRAM_ACCESS_TOKEN is not configured.");
  process.exit(0);
}

function escapeFilePart(value) {
  return String(value || "media").replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 80);
}

function mediaKind(value) {
  return String(value || "").toUpperCase() === "VIDEO" ? "video" : "image";
}

function extensionFor(contentType = "", url = "") {
  const value = contentType.toLowerCase();
  if (value.includes("webp")) return "webp";
  if (value.includes("png")) return "png";
  if (value.includes("gif")) return "gif";
  if (value.includes("jpeg") || value.includes("jpg")) return "jpg";
  const match = String(url).match(/\.([a-z0-9]{2,5})(?:[?#]|$)/i);
  return match?.[1]?.toLowerCase() || "jpg";
}

function tagsFromCaption(caption = "") {
  return Array.from(new Set((caption.match(/#[\p{L}\p{N}_]+/gu) || []).map((tag) => tag.slice(1)))).slice(0, 24);
}

function titleFromCaption(caption = "", timestamp = "") {
  const line = caption
    .split(/\r?\n/)
    .map((item) => item.replace(/#[\p{L}\p{N}_]+/gu, "").trim())
    .find(Boolean);
  if (line) return line.slice(0, 80);
  const date = timestamp ? new Date(timestamp) : new Date();
  return `Instagram · ${new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(date)}`;
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readExistingFeed() {
  try {
    const raw = await readFile(outputPath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.projects) ? parsed.projects : [];
  } catch {
    return [];
  }
}

async function graphJson(url) {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.error) {
    throw new Error(payload?.error?.message || `Instagram API request failed (${response.status})`);
  }
  return payload;
}

async function fetchPosts() {
  const fields = "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username";
  const endpoint = accountId ? `${baseUrl}/${encodeURIComponent(accountId)}/media` : `${baseUrl}/me/media`;
  let next = `${endpoint}?fields=${encodeURIComponent(fields)}&limit=100&access_token=${encodeURIComponent(token)}`;
  const posts = [];

  while (next && posts.length < syncLimit) {
    const page = await graphJson(next);
    posts.push(...(Array.isArray(page.data) ? page.data : []));
    next = page.paging?.next || "";
  }

  const selected = posts.slice(0, syncLimit);
  for (const post of selected) {
    if (String(post.media_type).toUpperCase() !== "CAROUSEL_ALBUM") continue;
    const url = `${baseUrl}/${encodeURIComponent(post.id)}/children?fields=${encodeURIComponent("id,media_type,media_url,thumbnail_url")}&limit=100&access_token=${encodeURIComponent(token)}`;
    const children = await graphJson(url);
    post.children = Array.isArray(children.data) ? children.data : [];
  }
  return selected;
}

async function existingMediaIsUsable(project, expectedCount) {
  if (!project || !Array.isArray(project.media) || project.media.length !== expectedCount) return false;
  for (const item of project.media) {
    const relative = String(item.src || "").replace(/^\//, "");
    if (!relative.startsWith("portfolio/uploads/instagram-live/")) return false;
    if (!(await exists(path.join(root, "public", relative)))) return false;
  }
  return true;
}

async function downloadImage(url, absoluteDirectory, fileStem) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Instagram media download failed (${response.status})`);
  const contentType = response.headers.get("content-type") || "image/jpeg";
  const extension = extensionFor(contentType, url);
  const fileName = `${fileStem}.${extension}`;
  const absolutePath = path.join(absoluteDirectory, fileName);
  await writeFile(absolutePath, Buffer.from(await response.arrayBuffer()));
  return fileName;
}

async function buildProject(post, existingProject) {
  const sourceItems = String(post.media_type).toUpperCase() === "CAROUSEL_ALBUM" && Array.isArray(post.children) && post.children.length
    ? post.children
    : [post];
  const caption = String(post.caption || "").trim();
  const title = titleFromCaption(caption, post.timestamp || "");

  let media = [];
  if (await existingMediaIsUsable(existingProject, sourceItems.length)) {
    media = existingProject.media.map((item) => ({ ...item, alt: title }));
  } else {
    const directory = path.join(mediaRoot, escapeFilePart(post.id));
    await rm(directory, { recursive: true, force: true });
    await mkdir(directory, { recursive: true });

    for (let index = 0; index < sourceItems.length; index += 1) {
      const item = sourceItems[index];
      const kind = mediaKind(item.media_type);
      const remoteUrl = kind === "video"
        ? item.thumbnail_url || post.thumbnail_url || ""
        : item.media_url || item.thumbnail_url || "";
      if (!remoteUrl) continue;
      const fileStem = `${String(index + 1).padStart(2, "0")}-${escapeFilePart(item.id || index + 1)}`;
      const fileName = await downloadImage(remoteUrl, directory, fileStem);
      media.push({
        type: "image",
        src: `${publicMediaRoot}/${escapeFilePart(post.id)}/${fileName}`,
        alt: title,
        caption: kind === "video" ? "Instagram Reel" : "",
        externalId: String(item.id || post.id),
      });
    }
  }

  if (!media.length) return null;
  return {
    id: `instagram-${post.id}`,
    source: "instagram",
    externalId: String(post.id),
    title,
    subtitle: post.username ? `@${post.username}` : "@365daily.snap",
    description: caption,
    category: "Instagram",
    tags: tagsFromCaption(caption),
    models: [],
    location: {},
    cover: media[0].src,
    media,
    instagramUrl: String(post.permalink || ""),
    sourcePublishedAt: String(post.timestamp || ""),
  };
}

async function cleanupRemovedPosts(activeIds) {
  await mkdir(mediaRoot, { recursive: true });
  const directories = await readdir(mediaRoot, { withFileTypes: true });
  for (const entry of directories) {
    if (entry.isDirectory() && !activeIds.has(entry.name)) {
      await rm(path.join(mediaRoot, entry.name), { recursive: true, force: true });
    }
  }
}

const existingProjects = await readExistingFeed();
const existingMap = new Map(existingProjects.map((project) => [String(project.externalId || project.id?.replace(/^instagram-/, "")), project]));
const posts = await fetchPosts();
const projects = [];

for (const post of posts) {
  const project = await buildProject(post, existingMap.get(String(post.id)));
  if (project) projects.push(project);
}

await cleanupRemovedPosts(new Set(posts.map((post) => escapeFilePart(post.id))));
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify({ updatedAt: new Date().toISOString(), username: posts[0]?.username || "365daily.snap", projects }, null, 2)}\n`, "utf8");
console.log(`Instagram sync complete: ${projects.length} posts.`);
