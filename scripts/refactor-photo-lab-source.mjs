import { readFile, writeFile } from "node:fs/promises";

function replaceOnce(source, target, replacement, label) {
  const count = source.split(target).length - 1;
  if (count !== 1) throw new Error(`${label}: expected 1 match, found ${count}`);
  return source.replace(target, replacement);
}

const appPath = "src/App.jsx";
let app = await readFile(appPath, "utf8");

app = replaceOnce(
  app,
  'import { InquiryForm, Media, ProjectModal, ReviewModal, SectionHeading } from "./siteComponents";',
  'import { InquiryForm, Media, ProjectModal, ReviewModal, SectionHeading } from "./siteComponents";\nimport { PhotoLabEntry } from "./PhotoLabEntry";',
  "PhotoLabEntry import",
);

app = replaceOnce(app, "eager={index < frames.length}", "eager={index === 0}", "recent-frame eager loading");

app = replaceOnce(
  app,
  '    ["prepare", extra.prepareNav],\n    ["reviews", copy.nav.reviews],',
  '    ["prepare", extra.prepareNav],\n    ["learn", language === "ko" ? "사진 입문" : language === "ja" ? "写真入門" : "Photo Lab"],\n    ["reviews", copy.nav.reviews],',
  "Photo Lab navigation item",
);

app = replaceOnce(
  app,
  '  const openProjectPage = (project) => {',
  '  const openPhotoLab = (hash = "") => {\n    window.location.href = `/learn/${hash}`;\n  };\n\n  const openProjectPage = (project) => {',
  "openPhotoLab helper",
);

app = replaceOnce(
  app,
  '<div className="hero-actions"><button className="button primary" type="button" onClick={() => scrollTo("work")}>{copy.heroPrimary}<ArrowRight /></button><button className="button ghost" type="button" onClick={() => scrollTo("contact")}>{copy.heroSecondary}</button></div>',
  '<div className="hero-actions"><button className="button primary" type="button" onClick={() => scrollTo("work")}>{copy.heroPrimary}<ArrowRight /></button><button className="button ghost" type="button" onClick={() => scrollTo("contact")}>{copy.heroSecondary}</button><button className="button ghost photo-lab-hero-link" type="button" onClick={() => openPhotoLab()}>{language === "ko" ? "사진 입문 도구" : language === "ja" ? "写真入門ツール" : "Photo Lab"}</button></div>',
  "hero Photo Lab button",
);

app = replaceOnce(
  app,
  '      <PhotoMotionRail projects={projects} language={language} onOpenProject={openProjectPage} />\n\n      <section id="work" className="section section-wrap">',
  '      <PhotoMotionRail projects={projects} language={language} onOpenProject={openProjectPage} />\n      <PhotoLabEntry language={language} onOpen={openPhotoLab} />\n\n      <section id="work" className="section section-wrap">',
  "Photo Lab homepage section",
);

app = replaceOnce(
  app,
  '{navItems.map(([key, label]) => <button key={key} type="button" onClick={() => scrollTo(key)}>{label}</button>)}',
  '{navItems.map(([key, label]) => key === "learn" ? <button key={key} type="button" onClick={() => openPhotoLab()}>{label}</button> : <button key={key} type="button" onClick={() => scrollTo(key)}>{label}</button>)}',
  "Photo Lab header navigation behavior",
);

await writeFile(appPath, app);

const cssIndexPath = "src/index.css";
let cssIndex = await readFile(cssIndexPath, "utf8");
if (!cssIndex.includes('@import "./styles/photo-lab.css";')) {
  cssIndex = `${cssIndex.trimEnd()}\n@import "./styles/photo-lab.css";\n`;
  await writeFile(cssIndexPath, cssIndex);
}

const learnPath = "public/learn/index.html";
let learn = await readFile(learnPath, "utf8");
learn = learn
  .replace(
    'content="조리개, 셔터스피드, ISO, 심도, 화각을 직접 움직이며 배우는 365 Daily Snap 사진 입문 도구입니다."',
    'content="조리개, 셔터스피드, ISO, 심도, 화각, 렌즈 선택과 필터·마이크·조명·삼각대 등 촬영 장비를 배우는 365 Daily Snap 사진 입문 도구입니다."',
  )
  .replace(
    'content="사진의 원리를 읽지 말고 직접 움직여 보세요. 노출, 심도, 화각, 셔터 체험과 입문 카메라 추천을 제공합니다."',
    'content="노출, 심도, 화각 시뮬레이터부터 렌즈 선택과 필터·마이크·조명·삼각대 등 촬영 장비 가이드까지 제공합니다."',
  );
if (!learn.includes('./gear.css')) {
  learn = replaceOnce(
    learn,
    '<link rel="stylesheet" href="./styles.css" />',
    '<link rel="stylesheet" href="./styles.css" />\n    <link rel="stylesheet" href="./gear.css" />',
    "Photo Lab gear stylesheet",
  );
}
if (!learn.includes('./gear.js')) {
  learn = replaceOnce(
    learn,
    '<script type="module" src="./app.js"></script>',
    '<script type="module" src="./app.js"></script>\n    <script type="module" src="./gear.js"></script>',
    "Photo Lab gear script",
  );
}
await writeFile(learnPath, learn);

const viteConfig = `import { defineConfig } from "vite";\nimport react from "@vitejs/plugin-react";\n\nexport default defineConfig({\n  plugins: [react()],\n  build: {\n    assetsInlineLimit: 2048,\n    cssCodeSplit: true,\n  },\n  server: {\n    host: "0.0.0.0",\n    allowedHosts: [".trycloudflare.com"],\n    proxy: {\n      "/api": "http://localhost:5174",\n    },\n  },\n});\n`;
await writeFile("vite.config.js", viteConfig);

console.log("Photo Lab integration moved into source files successfully.");
