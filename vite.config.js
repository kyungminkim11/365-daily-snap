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
  const teaserReplacement = `${teaserTarget}\n\n      <section className="photo-lab-entry section-wrap">\n        <div>\n          <p className="eyebrow">PHOTO LAB</p>\n          <h2>{language === "ko" ? "사진을 읽지 말고, 직접 움직여 보세요." : language === "ja" ? "写真の仕組みを、動かしながら学ぶ。" : "Learn photography by moving the controls."}</h2>\n          <p>{language === "ko" ? "조리개·셔터스피드·ISO부터 심도, 화각, 입문 카메라 추천까지 초보자를 위한 체험형 가이드를 준비했습니다." : language === "ja" ? "絞り、シャッタースピード、ISO、被写界深度、画角、初心者向けカメラ選びを体験できます。" : "Explore aperture, shutter speed, ISO, depth of field, focal length and beginner camera recommendations."}</p>\n        </div>\n        <button className="button primary" type="button" onClick={() => { window.location.href = "/learn/"; }}>{language === "ko" ? "사진 입문 시작하기" : language === "ja" ? "写真入門を始める" : "Open Photo Lab"}<ArrowRight /></button>\n      </section>`;

  const photoLabCss = `

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
        return next === code ? null : { code: next, map: null };
      }
      if (normalized.endsWith(cssPath) && !code.includes(".photo-lab-entry")) {
        return { code: `${code}${photoLabCss}`, map: null };
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [optimizeRecentFramePriority(), installPhotoLabEntryPoints(), react()],
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
