import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function optimizeRecentFramePriority() {
  const target = "eager={index < frames.length}";
  return {
    name: "optimize-recent-frame-priority",
    enforce: "pre",
    transform(code, id) {
      if (!id.replaceAll("\\", "/").endsWith("/src/App.jsx") || !code.includes(target)) return null;
      return {
        code: code.replace(target, "eager={index === 0}"),
        map: null,
      };
    },
  };
}

function installPhotoLabEntryPoints() {
  const appPath = "/src/App.jsx";
  const cssPath = "/src/index.css";
  const navTarget = '["prepare", extra.prepareNav],';
  const navReplacement = '["prepare", extra.prepareNav],\n    ["learn", language === "ko" ? "사진 입문" : language === "ja" ? "写真入門" : "Photo Lab"],';
  const navRenderTarget = '{navItems.map(([key, label]) => <button key={key} type="button" onClick={() => scrollTo(key)}>{label}</button>)}';
  const navRenderReplacement = '{navItems.map(([key, label]) => key === "learn" ? <button key={key} type="button" onClick={() => { window.location.href = "/learn/"; }}>{label}</button> : <button key={key} type="button" onClick={() => scrollTo(key)}>{label}</button>)}';
  const teaserTarget = '<PhotoMotionRail projects={projects} language={language} onOpenProject={openProjectPage} />';
  const teaserReplacement = `${teaserTarget}\n\n      <section className="photo-lab-entry section-wrap">\n        <div>\n          <p className="eyebrow">PHOTO LAB</p>\n          <h2>{language === "ko" ? "사진을 읽지 말고, 직접 움직여 보세요." : language === "ja" ? "写真の仕組みを、動かしながら学ぶ。" : "Learn photography by moving the controls."}</h2>\n          <p>{language === "ko" ? "조리개·셔터스피드·ISO부터 심도, 화각, 렌즈 선택, 필터·마이크·조명·삼각대 같은 촬영 장비까지 한 번에 배울 수 있습니다." : language === "ja" ? "絞り、シャッタースピード、ISO、被写界深度、画角、レンズ選び、フィルターやマイクなどの機材を体験できます。" : "Explore exposure, depth of field, focal length, lenses, filters, microphones, lighting and camera accessories."}</p>\n          <div className="photo-lab-entry-links">\n            <button type="button" onClick={() => { window.location.href = "/learn/#exposure"; }}>{language === "ko" ? "노출 체험" : language === "ja" ? "露出体験" : "Exposure"}</button>\n            <button type="button" onClick={() => { window.location.href = "/learn/#lenses"; }}>{language === "ko" ? "렌즈 가이드" : language === "ja" ? "レンズガイド" : "Lens guide"}</button>\n            <button type="button" onClick={() => { window.location.href = "/learn/#gear"; }}>{language === "ko" ? "장비 사전" : language === "ja" ? "機材ガイド" : "Gear guide"}</button>\n          </div>\n        </div>\n        <button className="button primary" type="button" onClick={() => { window.location.href = "/learn/"; }}>{language === "ko" ? "Photo Lab 둘러보기" : language === "ja" ? "Photo Labを見る" : "Open Photo Lab"}<ArrowRight /></button>\n      </section>`;
  const heroActionsTarget = '<div className="hero-actions"><button className="button primary" type="button" onClick={() => scrollTo("work")}>{copy.heroPrimary}<ArrowRight /></button><button className="button ghost" type="button" onClick={() => scrollTo("contact")}>{copy.heroSecondary}</button></div>';
  const heroActionsReplacement = '<div className="hero-actions"><button className="button primary" type="button" onClick={() => scrollTo("work")}>{copy.heroPrimary}<ArrowRight /></button><button className="button ghost" type="button" onClick={() => scrollTo("contact")}>{copy.heroSecondary}</button><button className="button ghost photo-lab-hero-link" type="button" onClick={() => { window.location.href = "/learn/"; }}>{language === "ko" ? "사진 입문 도구" : language === "ja" ? "写真入門ツール" : "Photo Lab"}</button></div>';

  const photoLabCss = `

.photo-lab-hero-link { border-style: dashed; }
.photo-lab-entry {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 36px;
  margin-top: 34px;
  margin-bottom: 92px;
  padding: 38px 42px;
  border: 1px solid rgba(18, 20, 17, 0.14);
  border-radius: 28px;
  background: linear-gradient(135deg, #171a16 0%, #23271f 62%, #303925 100%);
  color: #fff;
  box-shadow: 0 26px 70px rgba(18, 20, 17, 0.14);
}
.photo-lab-entry .eyebrow { color: #d9ff5b; }
.photo-lab-entry h2 {
  max-width: 760px;
  margin: 0;
  font-size: clamp(30px, 4vw, 52px);
  line-height: 1.08;
  letter-spacing: -0.05em;
}
.photo-lab-entry p:not(.eyebrow) {
  max-width: 760px;
  margin: 16px 0 0;
  color: rgba(255, 255, 255, 0.68);
}
.photo-lab-entry-links { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 22px; }
.photo-lab-entry-links button {
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid rgba(255,255,255,.24);
  border-radius: 999px;
  background: rgba(255,255,255,.06);
  color: #fff;
  cursor: pointer;
  font-weight: 800;
}
.photo-lab-entry-links button:hover { border-color: #d9ff5b; color: #d9ff5b; }
.photo-lab-entry .button.primary { background: #d9ff5b; color: #11130f; white-space: nowrap; }
@media (max-width: 760px) {
  .photo-lab-entry {
    grid-template-columns: 1fr;
    align-items: start;
    margin-top: 20px;
    margin-bottom: 72px;
    padding: 28px 24px;
    border-radius: 22px;
  }
  .photo-lab-entry .button { width: 100%; justify-content: center; }
}
`;

  return {
    name: "install-photo-lab-entry-points",
    enforce: "pre",
    transform(code, id) {
      const normalized = id.replaceAll("\\", "/");
      if (normalized.endsWith(appPath)) {
        let next = code;
        if (next.includes(navTarget) && !next.includes('["learn", language === "ko"')) next = next.replace(navTarget, navReplacement);
        if (next.includes(navRenderTarget)) next = next.replace(navRenderTarget, navRenderReplacement);
        if (next.includes(teaserTarget) && !next.includes('className="photo-lab-entry')) next = next.replace(teaserTarget, teaserReplacement);
        if (next.includes(heroActionsTarget) && !next.includes("photo-lab-hero-link")) next = next.replace(heroActionsTarget, heroActionsReplacement);
        return next === code ? null : { code: next, map: null };
      }
      if (normalized.endsWith(cssPath) && !code.includes(".photo-lab-entry")) {
        return { code: `${code}${photoLabCss}`, map: null };
      }
      return null;
    },
  };
}

function installPhotoLabGearBundle() {
  return {
    name: "install-photo-lab-gear-bundle",
    apply: "build",
    async closeBundle() {
      const indexPath = path.resolve("dist", "learn", "index.html");
      let html = await readFile(indexPath, "utf8");
      html = html
        .replace(
          'content="조리개, 셔터스피드, ISO, 심도, 화각을 직접 움직이며 배우는 365 Daily Snap 사진 입문 도구입니다."',
          'content="조리개, 셔터스피드, ISO, 심도, 화각, 렌즈 선택과 필터·마이크·조명·삼각대 등 촬영 장비를 배우는 365 Daily Snap 사진 입문 도구입니다."',
        )
        .replace(
          'content="사진의 원리를 읽지 말고 직접 움직여 보세요. 노출, 심도, 화각, 셔터 체험과 입문 카메라 추천을 제공합니다."',
          'content="노출, 심도, 화각 시뮬레이터부터 렌즈 선택과 필터·마이크·조명·삼각대 등 촬영 장비 가이드까지 제공합니다."',
        );
      if (!html.includes('./gear.css')) {
        html = html.replace('<link rel="stylesheet" href="./styles.css" />', '<link rel="stylesheet" href="./styles.css" />\n    <link rel="stylesheet" href="./gear.css" />');
      }
      if (!html.includes('./gear.js')) {
        html = html.replace('<script type="module" src="./app.js"></script>', '<script type="module" src="./app.js"></script>\n    <script type="module" src="./gear.js"></script>');
      }
      await writeFile(indexPath, html);
    },
  };
}

export default defineConfig({
  plugins: [optimizeRecentFramePriority(), installPhotoLabEntryPoints(), installPhotoLabGearBundle(), react()],
  build: {
    assetsInlineLimit: 2048,
    cssCodeSplit: true,
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: [".trycloudflare.com"],
    proxy: {
      "/api": "http://localhost:5174",
    },
  },
});
