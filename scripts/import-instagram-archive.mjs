import fs from "node:fs/promises";
import path from "node:path";

const projectLocation = {
  city: "서울",
  district: "협의",
  place: "위치 확인 필요",
  lat: "",
  lng: "",
  mapX: 50,
  mapY: 50,
};

function unique(list) {
  return Array.from(new Set((list || []).filter(Boolean)));
}

function usernameFromPostUrl(postUrl = "") {
  try {
    const segments = new URL(postUrl).pathname.split("/").filter(Boolean);
    return segments[0] && !["p", "reel"].includes(segments[0]) ? segments[0] : "";
  } catch {
    return "";
  }
}

function tagsFromAlt(alt = "") {
  const lower = alt.toLowerCase();
  const tags = ["인스타그램"];

  if (/night|neon|sunset/.test(lower)) tags.push("밤");
  else tags.push("낮");

  if (/street|curb|bridge|ocean|beach|flower|bouquet|prairie|rose|carnation|ivy|brick|outdoor|road/.test(lower)) {
    tags.push("야외");
  }

  if (/phone|camera|lace|crochet|chopsticks|bottle|water bottle|cafe|coffee/.test(lower)) {
    tags.push("실내");
  }

  if (/one or more people|hair|dress|headdress|sweatshirt|turtleneck|coat|boots|skirt|wedding|person|people/.test(lower)) {
    tags.push("인물");
  }

  if (/wedding|dress|headdress|baby's-breath|bouquet/.test(lower)) tags.push("웨딩");
  if (/street|curb|bridge|brick wall/.test(lower)) tags.push("거리");
  if (/ocean|beach/.test(lower)) tags.push("바다");
  if (/flower|bouquet|prairie|rose|carnation|lily|baby's-breath/.test(lower)) tags.push("플라워");
  if (/camera|phone/.test(lower)) tags.push("촬영기록");

  if (!tags.includes("인물") && !tags.includes("촬영기록")) tags.push("인물");
  return unique(tags);
}

function captionFromItem(item) {
  const username = usernameFromPostUrl(item.postUrl);
  const tags = tagsFromAlt(item.alt);

  if (tags.includes("웨딩")) return username ? `@${username} 협업 웨딩 무드` : "인스타그램 웨딩 무드";
  if (tags.includes("바다")) return username ? `@${username} 협업 바다 스냅` : "인스타그램 바다 스냅";
  if (tags.includes("거리")) return username ? `@${username} 협업 거리 스냅` : "인스타그램 거리 스냅";
  if (tags.includes("촬영기록")) return username ? `@${username} 협업 촬영 기록` : "인스타그램 촬영 기록";

  return username ? `@${username} 협업 인물 스냅` : "인스타그램 인물 스냅";
}

const cwd = process.cwd();
const contentPath = path.join(cwd, "public/portfolio/portfolio.json");
const resultsPath = path.join(cwd, "tmp/instagram-download-results.json");
const content = JSON.parse(await fs.readFile(contentPath, "utf8"));
const results = JSON.parse(await fs.readFile(resultsPath, "utf8")).filter((item) => item.ok && item.file);

const modelNames = unique(results.map((item) => usernameFromPostUrl(item.postUrl)).filter((name) => name && name !== "365daily.snap"));
content.models = Array.isArray(content.models) ? content.models : [];

for (const name of modelNames) {
  if (!content.models.some((model) => model.name === name)) {
    content.models.push({
      name,
      url: `https://www.instagram.com/${name}/`,
      note: "Instagram 협업/태그 계정",
    });
  }
}

content.taxonomy = content.taxonomy || {};
content.taxonomy.categories = unique([...(content.taxonomy.categories || []), "Instagram Archive"]);
content.taxonomy.tags = unique([
  ...(content.taxonomy.tags || []),
  "인스타그램",
  "웨딩",
  "거리",
  "바다",
  "플라워",
  "촬영기록",
]);
content.taxonomy.locations = Array.isArray(content.taxonomy.locations) ? content.taxonomy.locations : [];

if (
  !content.taxonomy.locations.some(
    (location) =>
      location.city === projectLocation.city &&
      location.district === projectLocation.district &&
      location.place === projectLocation.place,
  )
) {
  content.taxonomy.locations.push(projectLocation);
}

content.portfolioFilters = unique([...(content.portfolioFilters || []), "인스타그램", "웨딩", "거리", "바다"]);

const media = results.map((item, index) => {
  const username = usernameFromPostUrl(item.postUrl);

  return {
    type: "image",
    src: item.file,
    alt: `Instagram ${index + 1} - ${captionFromItem(item)}`,
    caption: captionFromItem(item),
    tags: tagsFromAlt(item.alt),
    models: username && username !== "365daily.snap" ? [username] : [],
    location: projectLocation,
    instagramUrl: item.postUrl || "https://www.instagram.com/365daily.snap/",
  };
});

const project = {
  id: "instagram-365daily-snap-20260604",
  title: "Instagram 공개 사진 아카이브",
  subtitle: "@365daily.snap",
  description:
    "인스타그램 계정에 공개된 사진을 내려받아 포트폴리오용으로 정리했습니다. 정확한 촬영 위치는 확인 후 개별 사진에서 수정할 수 있습니다.",
  category: "Instagram Archive",
  tags: ["인스타그램", "인물"],
  models: [],
  location: projectLocation,
  cover: media[0]?.src || "",
  media,
};

content.projects = Array.isArray(content.projects) ? content.projects : [];
content.projects = content.projects.filter((item) => item.id !== project.id);
content.projects.unshift(project);

await fs.writeFile(contentPath, `${JSON.stringify(content, null, 2)}\n`, "utf8");

console.log(
  JSON.stringify(
    {
      project: project.title,
      media: media.length,
      models: modelNames,
      totalProjects: content.projects.length,
    },
    null,
    2,
  ),
);
