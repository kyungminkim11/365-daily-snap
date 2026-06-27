import { useEffect, useState } from "react";
import { COPY } from "./siteCopy";

export const CONTACT = {
  instagramHandle: "@365daily.snap",
  instagramUrl: "https://www.instagram.com/365daily.snap/",
  kakaoOpenChatUrl: "https://open.kakao.com/o/sV8I6vmi",
};

export const BUSINESS = {
  name: "라바랩스(LavaLabs)",
  representative: "김경민",
  registration: "455-23-01867",
  onlineSales: "2025-고양일산서-1352",
  address: "경기도 고양시 일산서구 일현로 47, 2층 204호 1308호실",
  email: "info@lavalabs.co.kr",
};

const GENERIC_TAGS = new Set(["인물", "프로필", "데일리", "포트폴리오협업", "야외", "실내", "낮", "밤", "자연광", "클로즈업", "전신", "반신", "촬영기록"]);

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

export function createProjectGroups(content) {
  const source = Array.isArray(content.projects) ? content.projects : [];
  const groups = [];

  source.forEach((project, projectIndex) => {
    const media = (project.media || []).filter((item) => item?.src);
    const isArchive = /archive|아카이브/i.test(`${project.title} ${project.category}`) && media.length > 8;

    if (!isArchive) {
      if (media.length) groups.push({ ...project, id: project.id || `project-${projectIndex}`, media, cover: project.cover || media[0].src });
      return;
    }

    const buckets = new Map();
    media.forEach((item) => {
      const model = item.models?.[0] || "365 Daily Snap";
      const key = model.replace(/^@/, "");
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(item);
    });

    buckets.forEach((items, model) => {
      const chunkSize = 10;
      for (let index = 0; index < items.length; index += chunkSize) {
        const chunk = items.slice(index, index + chunkSize);
        const mood = dominantTag(chunk);
        const location = chunk.find((item) => cleanLocation(item.location))?.location || project.location;
        groups.push({
          id: `${project.id || "archive"}-${model}-${Math.floor(index / chunkSize) + 1}`,
          title: `@${model} · ${mood} 스냅`,
          subtitle: project.subtitle || CONTACT.instagramHandle,
          description: chunk.find((item) => item.caption)?.caption || project.description,
          category: mood,
          tags: Array.from(new Set(chunk.flatMap((item) => item.tags || []))),
          models: [model],
          location,
          cover: chunk[0]?.src,
          media: chunk,
        });
      }
    });
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
      media: [{ src: item.image, type: "image", caption: item.title, instagramUrl: item.instagramUrl }],
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
