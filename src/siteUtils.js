import { useEffect, useState } from "react";
import { COPY } from "./siteCopy";

export const CONTACT = {
  instagramHandle: "@365daily.snap",
  instagramUrl: "https://www.instagram.com/365daily.snap/",
  kakaoOpenChatUrl: "https://open.kakao.com/o/sV8I6vmi",
};

export const BUSINESS = {
  name: "365 Daily Snap",
  representative: "365 Daily Snap",
  registration: "455-23-01867",
  onlineSales: "2025-고양일산서-1352",
  address: "경기도 고양시 일산서구 일현로 47, 2층 204호 1308호실",
  email: "info@lavalabs.co.kr",
};

const GENERIC_TAGS = new Set(["인물", "프로필", "데일리", "포트폴리오협업", "야외", "실내", "낮", "밤", "자연광", "클로즈업", "전신", "반신", "촬영기록"]);
const CARD_SIZE = 6;

const SCENE_LABELS = {
  웨딩무드: "웨딩 무드",
  한복: "한복 스냅",
  반려동물: "반려동물 스냅",
  바다: "바다 인물 스냅",
  카페: "카페 포트레이트",
  야간: "야간 인물 스냅",
  거리: "거리 스냅",
  플라워: "플라워 포트레이트",
  프로필: "프로필 포트레이트",
  시네마틱: "시네마틱 포트레이트",
  차분한: "차분한 인물 스냅",
  인물: "인물 스냅",
};

const SCENE_DESCRIPTIONS = {
  웨딩무드: "꽃과 조명을 활용해 부드럽고 서정적인 웨딩 무드로 담은 인물 사진입니다.",
  한복: "한복의 선과 공간의 분위기가 자연스럽게 이어지도록 기록한 인물 스냅입니다.",
  반려동물: "움직임과 표정을 놓치지 않고 자연스럽게 담은 반려동물 스냅입니다.",
  바다: "바다의 넓은 여백과 자연광을 함께 활용한 인물 스냅입니다.",
  카페: "편안한 실내 분위기와 자연스러운 표정을 중심으로 담은 카페 포트레이트입니다.",
  야간: "도시의 조명과 짙은 명암을 활용해 차분하게 완성한 야간 인물 스냅입니다.",
  거리: "일상적인 거리의 흐름 속에서 자연스러운 움직임과 표정을 기록했습니다.",
  플라워: "꽃과 인물의 색감이 조화롭게 이어지도록 구성한 포트레이트입니다.",
  프로필: "과한 연출 없이 인물의 분위기와 표정에 집중한 자연스러운 프로필 사진입니다.",
  시네마틱: "빛과 여백을 활용해 한 장면처럼 구성한 시네마틱 포트레이트입니다.",
  차분한: "부드러운 빛과 절제된 구도로 차분한 분위기를 담은 인물 사진입니다.",
  인물: "촬영 현장의 분위기와 인물의 자연스러운 순간을 중심으로 정리한 포트레이트입니다.",
};

export function cleanLocation(location = {}) {
  const values = [location.city, location.district, location.place]
    .map((value) => String(value || "").trim())
    .filter((value) => value && !/협의|미정|확인 필요/.test(value));
  return Array.from(new Set(values)).join(" · ");
}

function dominantTag(media = []) {
  const counts = new Map();
  media.flatMap((item) => item.tags || []).forEach((tag) => {
    if (!GENERIC_TAGS.has(tag)) counts.set(tag, (counts.get(tag) || 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "인물";
}

function detectScene(item = {}) {
  const tags = new Set(item.tags || []);
  if (tags.has("웨딩무드")) return "웨딩무드";
  if (tags.has("한복")) return "한복";
  if (tags.has("반려동물") || tags.has("동물스냅")) return "반려동물";
  if (tags.has("바다")) return "바다";
  if (tags.has("카페")) return "카페";
  if (tags.has("네온") || tags.has("밤")) return "야간";
  if (tags.has("거리")) return "거리";
  if (tags.has("플라워")) return "플라워";
  if (tags.has("프로필")) return "프로필";
  if (tags.has("시네마틱")) return "시네마틱";
  if (tags.has("차분한")) return "차분한";
  return "인물";
}

function sanitizeMedia(item = {}) {
  const { instagramUrl: _removedInstagramUrl, ...media } = item;
  return media;
}

function uniqueMedia(media = []) {
  const seen = new Set();
  return media
    .filter((item) => item?.src && !seen.has(item.src) && seen.add(item.src))
    .map(sanitizeMedia);
}

function seriesTitle(model, scene, part, totalParts) {
  const label = SCENE_LABELS[scene] || SCENE_LABELS.인물;
  const owner = model === "365 Daily Snap" ? "" : `@${model} · `;
  const suffix = totalParts > 1 ? ` ${part}` : "";
  return `${owner}${label}${suffix}`;
}

function makeArchiveGroups(project, projectIndex) {
  const media = uniqueMedia(project.media || []);
  const modelBuckets = new Map();

  media.forEach((item, index) => {
    const model = String(item.models?.[0] || "365 Daily Snap").replace(/^@/, "");
    if (!modelBuckets.has(model)) modelBuckets.set(model, []);
    modelBuckets.get(model).push({ ...item, _sourceIndex: index });
  });

  const groups = [];
  modelBuckets.forEach((modelItems, model) => {
    const sceneBuckets = new Map();
    modelItems.forEach((item) => {
      const scene = detectScene(item);
      if (!sceneBuckets.has(scene)) sceneBuckets.set(scene, []);
      sceneBuckets.get(scene).push(item);
    });

    const prepared = [];
    const small = [];
    sceneBuckets.forEach((items, scene) => {
      if (items.length >= 3) prepared.push({ scene, items, first: items[0]._sourceIndex });
      else small.push(...items);
    });

    if (small.length) {
      if (small.length >= 3 || prepared.length === 0) {
        prepared.push({ scene: dominantTag(small), items: small, first: small[0]._sourceIndex });
      } else {
        const last = prepared[prepared.length - 1];
        last.items.push(...small);
        last.first = Math.min(last.first, small[0]._sourceIndex);
      }
    }

    prepared.sort((a, b) => a.first - b.first).forEach(({ scene: rawScene, items }) => {
      const scene = SCENE_LABELS[rawScene] ? rawScene : detectScene(items[0]);
      const totalParts = Math.ceil(items.length / CARD_SIZE);
      for (let start = 0; start < items.length; start += CARD_SIZE) {
        const chunk = items.slice(start, start + CARD_SIZE).map(({ _sourceIndex, ...item }) => item);
        const part = Math.floor(start / CARD_SIZE) + 1;
        const location = chunk.find((item) => cleanLocation(item.location))?.location || project.location;
        groups.push({
          id: `${project.id || `archive-${projectIndex}`}-${model}-${scene}-${part}`,
          title: seriesTitle(model, scene, part, totalParts),
          subtitle: project.subtitle || CONTACT.instagramHandle,
          description: SCENE_DESCRIPTIONS[scene] || SCENE_DESCRIPTIONS.인물,
          category: SCENE_LABELS[scene] || SCENE_LABELS.인물,
          tags: Array.from(new Set(chunk.flatMap((item) => item.tags || []))),
          models: model === "365 Daily Snap" ? [] : [model],
          location,
          cover: chunk[0]?.src,
          media: chunk,
        });
      }
    });
  });

  return groups;
}

function polishProject(project, projectIndex) {
  const media = uniqueMedia(project.media || []);
  if (!media.length) return null;

  const titleMap = {
    "카페 촬영": "카페 안의 자연스러운 순간",
    "루이 반려동물 촬영": "루이와 함께한 오후",
  };
  const descriptionMap = {
    "카페 촬영": "부드러운 실내광과 자연스러운 표정을 중심으로 담은 카페 인물 스냅입니다.",
    "루이 반려동물 촬영": "햇빛 아래 자유롭게 움직이는 루이의 표정과 순간을 담은 반려동물 스냅입니다.",
  };

  return {
    ...project,
    id: project.id || `project-${projectIndex}`,
    title: titleMap[project.title] || project.title,
    description: descriptionMap[project.title] || project.description || SCENE_DESCRIPTIONS[detectScene(media[0])],
    media,
    cover: project.cover || media[0].src,
  };
}

export function createProjectGroups(content) {
  const source = Array.isArray(content.projects) ? content.projects : [];
  const groups = [];

  source.forEach((project, projectIndex) => {
    const media = uniqueMedia(project.media || []);
    const isArchive = /archive|아카이브/i.test(`${project.title} ${project.category}`) && media.length > 8;

    if (isArchive) {
      groups.push(...makeArchiveGroups({ ...project, media }, projectIndex));
      return;
    }

    const polished = polishProject({ ...project, media }, projectIndex);
    if (polished) groups.push(polished);
  });

  if (groups.length) return groups;

  return (content.portfolioItems || [])
    .filter((item) => item.image)
    .map((item, index) => ({
      id: `legacy-${index}`,
      title: item.title,
      description: item.description,
      category: item.category,
      tags: item.tags || [],
      models: item.models || [],
      location: item.location,
      cover: item.image,
      media: [{ src: item.image, type: "image", caption: item.title }],
    }));
}

export function setMeta(name, value, property = false) {
  const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(property ? "property" : "name", name);
    document.head.appendChild(element);
  }
  element.setAttribute("content", value);
}

export function useLanguage() {
  const getLanguage = () => {
    const route = window.location.pathname.split("/").filter(Boolean)[0];
    return COPY[route] ? route : "ko";
  };
  const [language, setLanguageState] = useState(getLanguage);

  const setLanguage = (next) => {
    const hash = window.location.hash;
    window.history.pushState({}, "", `/${next}${hash}`);
    setLanguageState(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handlePopState = () => setLanguageState(getLanguage());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return [language, setLanguage];
}
