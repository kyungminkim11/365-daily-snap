import {
  buildInstagramProject,
  importedInstagramIds,
  instagramCaptionSummary,
  instagramDateLabel,
  instagramExternalId,
  isInstagramPostImported,
} from "./admin-instagram.js";

const API_CONTENT_URL = "/api/content";
const API_UPLOAD_URL = "/api/upload-media";
const INSTAGRAM_FEED_URL = "/portfolio/instagram-feed.json";
const STORAGE_KEY = "365-daily-snap-admin-token";

const state = {
  content: null,
  selectedProjectId: "",
  queue: [],
  selectedTags: new Set(),
  selectedModels: new Set(),
  selectedMediaIndexes: new Set(),
  isDirty: false,
  uploadBusy: false,
  instagramCategory: "",
  instagram: {
    loaded: false,
    loading: false,
    feed: { updatedAt: "", username: "", projects: [] },
    error: "",
    selectedIds: new Set(),
  },
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function bootAdvancedStyle() {
  if (document.querySelector("link[href='/admin-studio-advanced.css']")) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "/admin-studio-advanced.css";
  document.head.appendChild(link);
}

function getAdminKey() {
  return $("#adminKey").value.trim();
}

function saveAdminKey() {
  const value = getAdminKey();
  if (value) localStorage.setItem(STORAGE_KEY, value);
}

function splitList(value) {
  return String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
}

function uniqueList(values) {
  return Array.from(new Set((values || []).map((value) => String(value || "").trim()).filter(Boolean)));
}

function slugify(value) {
  return String(value || "upload")
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase()
    .slice(0, 80) || "upload";
}

function formatBytes(bytes = 0) {
  if (!bytes) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(unit ? 1 : 0)} ${units[unit]}`;
}

function locationKey(location = {}) {
  return [location.city, location.district, location.place].filter(Boolean).join(" · ") || "장소 미정";
}

function defaultLocation() {
  return state.content?.taxonomy?.locations?.[0] || { city: "서울", district: "협의", place: "장소 미정", lat: "", lng: "", mapX: 50, mapY: 50 };
}

function selectedProject() {
  return state.content?.projects?.find((project) => project.id === state.selectedProjectId) || null;
}

function setDirty(value = true) {
  state.isDirty = value;
  document.body.classList.toggle("is-dirty", value);
  document.body.classList.toggle("is-saved", !value && Boolean(state.content));
  $("#saveState").textContent = value ? "저장 필요" : state.content ? "저장됨" : "불러오기 전";
}

function setProgress(current, total, text) {
  const container = $("#uploadProgress");
  const label = $("#uploadProgressText");
  const bar = $("#uploadProgressBar");
  container.hidden = false;
  const percent = total ? Math.round((current / total) * 100) : 0;
  label.textContent = text || `${current}/${total} 업로드 중`;
  bar.style.width = `${percent}%`;
}

function hideProgress(delay = 900) {
  window.setTimeout(() => {
    $("#uploadProgress").hidden = true;
    $("#uploadProgressBar").style.width = "0%";
  }, delay);
}

async function apiFetch(url, options = {}) {
  const headers = new Headers(options.headers || {});
  const key = getAdminKey();
  if (key) headers.set("X-Admin-Token", key);
  if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const response = await fetch(url, { ...options, headers });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || "요청에 실패했습니다.");
  }

  return payload;
}

async function loadContent() {
  saveAdminKey();
  $("#saveState").textContent = "불러오는 중";
  const content = await apiFetch(API_CONTENT_URL);
  state.content = normalizeContent(content);
  state.selectedProjectId = state.content.projects[0]?.id || "";
  state.queue = [];
  state.selectedMediaIndexes.clear();
  renderAll();
  setDirty(false);
}

function normalizeContent(content = {}) {
  const taxonomy = content.taxonomy || {};
  return {
    hero: content.hero || {},
    portfolioIntro: content.portfolioIntro || {},
    portfolioFilters: Array.isArray(content.portfolioFilters) ? content.portfolioFilters : [],
    taxonomy: {
      categories: uniqueList([...(taxonomy.categories || []), "인물 사진", "커플 스냅", "프로필 촬영", "여행 스냅", "Tokyo Travel Snap"]),
      tags: uniqueList([...(taxonomy.tags || []), "인물", "프로필", "커플", "여행", "도쿄", "서울", "야외", "실내", "낮", "밤", "자연광"]),
      locations: Array.isArray(taxonomy.locations) && taxonomy.locations.length ? taxonomy.locations : [defaultLocation()],
    },
    models: Array.isArray(content.models) ? content.models : [],
    projects: Array.isArray(content.projects) ? content.projects.map(normalizeProject) : [],
    portfolioItems: Array.isArray(content.portfolioItems) ? content.portfolioItems : [],
    testimonials: Array.isArray(content.testimonials) ? content.testimonials : [],
    testimonialsIntro: content.testimonialsIntro || {},
    shootingProcess: content.shootingProcess || {},
    inquiryChecklist: Array.isArray(content.inquiryChecklist) ? content.inquiryChecklist : [],
  };
}

function normalizeProject(project = {}) {
  return {
    ...project,
    id: String(project.id || `${project.title || "project"}-${Date.now()}`).trim(),
    title: String(project.title || "새 프로젝트").trim(),
    subtitle: String(project.subtitle || "").trim(),
    description: String(project.description || "").trim(),
    category: String(project.category || "인물 사진").trim(),
    status: ["published", "draft", "private", "featured"].includes(project.status) ? project.status : "published",
    tags: Array.isArray(project.tags) ? project.tags : [],
    models: Array.isArray(project.models) ? project.models : [],
    location: project.location || defaultLocation(),
    cover: String(project.cover || "").trim(),
    media: Array.isArray(project.media) ? project.media.map((media) => ({ thumbnail: "", ...media })) : [],
  };
}

function renderAll() {
  renderCounts();
  renderProjectSelect();
  renderCreateFields();
  renderProjectEditor();
  renderBatchTools();
  renderMediaGrid();
  renderInstagramSummary();
}

function renderCounts() {
  const projects = state.content?.projects || [];
  const mediaCount = projects.reduce((sum, project) => sum + (project.media?.length || 0), 0) + state.queue.length;
  $("#projectCount").textContent = `${projects.length} 프로젝트`;
  $("#mediaCount").textContent = `${mediaCount} 사진/영상`;
  const project = selectedProject();
  const statusLabel = project ? ({ published: "공개", draft: "임시저장", private: "비공개", featured: "대표 노출" }[project.status] || "공개") : "";
  $("#selectedProjectInfo").textContent = project ? `선택됨: ${project.title} · ${statusLabel}` : "프로젝트를 선택하세요";
}

function renderProjectSelect() {
  const select = $("#projectSelect");
  const projects = state.content?.projects || [];
  select.innerHTML = projects.length
    ? projects.map((project) => `<option value="${escapeHtml(project.id)}">${escapeHtml(project.title)} · ${escapeHtml(project.status || "published")}</option>`).join("")
    : `<option value="">아직 프로젝트가 없습니다</option>`;
  select.value = state.selectedProjectId;
}

function renderCreateFields() {
  const categories = state.content?.taxonomy?.categories || [];
  const locations = state.content?.taxonomy?.locations || [];
  const categoryOptions = categories.map((item) => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`).join("");
  const locationOptions = locations.map((item, index) => `<option value="${index}">${escapeHtml(locationKey(item))}</option>`).join("");
  $("#categorySelect").innerHTML = categoryOptions;
  $("#projectCategorySelect").innerHTML = categoryOptions;
  $("#locationSelect").innerHTML = locationOptions;
  $("#batchLocationSelect").innerHTML = locationOptions;
  $("#projectLocationSelect").innerHTML = locationOptions;

  const instagramCategorySelect = $("#instagramCategorySelect");
  if (instagramCategorySelect) {
    const fallbackCategory = categories.includes("인물 사진") ? "인물 사진" : categories[0] || "";
    instagramCategorySelect.innerHTML = categoryOptions;
    const desired = state.instagramCategory || fallbackCategory;
    instagramCategorySelect.value = categories.includes(desired) ? desired : fallbackCategory;
    state.instagramCategory = instagramCategorySelect.value || fallbackCategory;
  }
}

function renderProjectEditor() {
  const project = selectedProject();
  const locations = state.content?.taxonomy?.locations || [];
  if (!project) {
    renderProjectSourceLine(null);
    return;
  }
  $("#projectStatusSelect").value = project.status || "published";
  $("#projectCategorySelect").value = project.category || state.content.taxonomy.categories[0] || "";
  $("#projectTitleInput").value = project.title || "";
  $("#projectSubtitleInput").value = project.subtitle || "";
  $("#projectDescriptionInput").value = project.description || "";
  $("#projectTagsInput").value = (project.tags || []).join(", ");
  const locationIndex = Math.max(0, locations.findIndex((location) => locationKey(location) === locationKey(project.location)));
  $("#projectLocationSelect").value = String(locationIndex);
  renderProjectSourceLine(project);
}

function renderProjectSourceLine(project) {
  const line = $("#projectInstagramLine");
  if (!line) return;
  if (!project?.instagramUrl) {
    line.hidden = true;
    line.textContent = "";
    return;
  }
  const publishedAt = project.sourcePublishedAt ? ` · ${instagramDateLabel(project.sourcePublishedAt)} 게시` : "";
  line.hidden = false;
  line.innerHTML = `인스타그램 원본${publishedAt} · <a href="${escapeHtml(project.instagramUrl)}" target="_blank" rel="noreferrer">게시물 열기 ↗</a>`;
}

function renderBatchTools() {
  const tags = state.content?.taxonomy?.tags || [];
  const models = state.content?.models?.map((model) => model.name) || [];
  renderChipPicker("#tagPicker", tags, state.selectedTags, "tag");
  renderChipPicker("#modelPicker", models, state.selectedModels, "model");
}

function renderChipPicker(selector, values, selectedSet, type) {
  $(selector).innerHTML = values.length
    ? values.map((value) => `<button type="button" class="${selectedSet.has(value) ? "is-active" : ""}" data-chip-type="${type}" data-value="${escapeHtml(value)}">${escapeHtml(value)}</button>`).join("")
    : `<span class="empty-mini">등록된 항목 없음</span>`;
}

function makePreview(media) {
  const src = media.previewSrc || media.thumbnail || media.src;
  if (!src) return `<div class="empty-state">미리보기 없음</div>`;
  if (media.type === "video") return `<video src="${escapeHtml(src)}" muted playsinline controls></video>`;
  return `<img src="${escapeHtml(src)}" alt="${escapeHtml(media.alt || media.caption || "preview")}" loading="lazy" />`;
}

function renderMediaGrid() {
  const grid = $("#mediaGrid");
  const empty = $("#emptyState");
  const project = selectedProject();
  const existing = project?.media || [];
  const items = [...state.queue.map((item) => ({ ...item, queued: true })), ...existing.map((item) => ({ ...item, queued: false }))];
  const query = $("#mediaSearch").value.trim().toLowerCase();

  const filtered = items.map((item, index) => ({ item, index })).filter(({ item }) => {
    if (!query) return true;
    const text = [item.caption, item.alt, ...(item.tags || []), ...(item.models || [])].join(" ").toLowerCase();
    return text.includes(query);
  });

  empty.hidden = filtered.length > 0;
  grid.innerHTML = "";

  filtered.forEach(({ item, index }) => {
    const card = document.importNode($("#mediaCardTemplate").content, true).querySelector(".media-card");
    card.dataset.index = String(index);
    card.dataset.queued = item.queued ? "true" : "false";
    card.dataset.status = item.queued ? "queued" : project?.status || "published";
    card.classList.toggle("is-cover", project?.cover && item.src === project.cover);
    card.classList.toggle("is-draft", project?.status === "draft");
    card.classList.toggle("is-private", project?.status === "private");
    card.classList.toggle("is-featured", project?.status === "featured");
    card.querySelector(".media-preview").innerHTML = makePreview(item);
    card.querySelector("[data-select-media]").checked = state.selectedMediaIndexes.has(index);
    card.querySelector('[data-field="caption"]').value = item.caption || "";
    card.querySelector('[data-field="alt"]').value = item.alt || "";
    card.querySelector('[data-field="tags"]').value = (item.tags || []).join(", ");
    card.querySelector('[data-field="models"]').value = (item.models || []).join(", ");
    const sizeLine = card.querySelector("[data-size-line]");
    sizeLine.textContent = item.queued
      ? `대기 · 원본 ${formatBytes(item.originalSize)} → 최적화 ${formatBytes(item.optimizedSize || item.originalSize)}`
      : item.thumbnail
        ? "썸네일 생성됨"
        : "원본 이미지";
    if (item.queued) {
      card.querySelector('[data-action="cover"]').disabled = true;
      card.querySelector('[data-action="cover"]').textContent = "업로드 대기";
    }
    grid.appendChild(card);
  });

  renderCounts();
}

function escapeHtml(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = dataUrl;
  });
}

function canvasToDataUrl(canvas, quality = 0.82) {
  return canvas.toDataURL("image/jpeg", quality);
}

async function optimizeImageFile(file, maxSize, quality) {
  const originalDataUrl = await readFileAsDataUrl(file);
  if (!file.type.startsWith("image/") || !maxSize) {
    return { dataUrl: originalDataUrl, thumbDataUrl: originalDataUrl, originalSize: file.size, optimizedSize: file.size };
  }

  const image = await loadImage(originalDataUrl);
  const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d", { alpha: false }).drawImage(image, 0, 0, width, height);
  const dataUrl = canvasToDataUrl(canvas, quality);

  const thumbScale = Math.min(1, 640 / Math.max(image.naturalWidth, image.naturalHeight));
  const thumbWidth = Math.max(1, Math.round(image.naturalWidth * thumbScale));
  const thumbHeight = Math.max(1, Math.round(image.naturalHeight * thumbScale));
  const thumbCanvas = document.createElement("canvas");
  thumbCanvas.width = thumbWidth;
  thumbCanvas.height = thumbHeight;
  thumbCanvas.getContext("2d", { alpha: false }).drawImage(image, 0, 0, thumbWidth, thumbHeight);
  const thumbDataUrl = canvasToDataUrl(thumbCanvas, 0.76);

  return {
    dataUrl,
    thumbDataUrl,
    originalSize: file.size,
    optimizedSize: Math.round((dataUrl.length * 3) / 4),
    width,
    height,
  };
}

async function addFiles(files) {
  const fileList = Array.from(files || []).filter((file) => file.type.startsWith("image/") || file.type.startsWith("video/"));
  if (!fileList.length) return;

  const commonTags = Array.from(state.selectedTags);
  const commonModels = Array.from(state.selectedModels);
  const batchLocation = getSelectedBatchLocation();
  const caption = $("#batchCaption").value.trim();
  const alt = $("#batchAlt").value.trim();
  const maxSize = Number($("#resizeMaxSelect").value);
  const quality = Number($("#jpegQualitySelect").value);

  setProgress(0, fileList.length, "업로드 대기 파일을 최적화하는 중");

  for (let index = 0; index < fileList.length; index += 1) {
    const file = fileList[index];
    setProgress(index, fileList.length, `${index + 1}/${fileList.length} 미리보기 생성 중 · ${file.name}`);
    const isVideo = file.type.startsWith("video/");
    const optimized = isVideo
      ? { dataUrl: await readFileAsDataUrl(file), thumbDataUrl: "", originalSize: file.size, optimizedSize: file.size }
      : await optimizeImageFile(file, maxSize, quality);

    state.queue.push({
      id: `queue-${crypto.randomUUID()}`,
      file,
      previewSrc: optimized.dataUrl,
      thumbDataUrl: optimized.thumbDataUrl,
      type: isVideo ? "video" : "image",
      caption: caption || file.name.replace(/\.[^.]+$/, ""),
      alt: alt || caption || file.name.replace(/\.[^.]+$/, ""),
      tags: commonTags,
      models: commonModels,
      location: batchLocation,
      originalSize: optimized.originalSize,
      optimizedSize: optimized.optimizedSize,
      width: optimized.width,
      height: optimized.height,
    });
  }

  hideProgress(700);
  setDirty(true);
  renderMediaGrid();
}

function getSelectedBatchLocation() {
  const locations = state.content?.taxonomy?.locations || [];
  return locations[Number($("#batchLocationSelect").value)] || defaultLocation();
}

function createProject() {
  if (!state.content) return;
  const title = $("#newTitle").value.trim();
  if (!title) {
    alert("프로젝트 제목을 입력해주세요.");
    $("#newTitle").focus();
    return;
  }
  const locations = state.content.taxonomy.locations || [];
  const project = {
    id: `${slugify(title)}-${Date.now()}`,
    title,
    subtitle: $("#newSubtitle").value.trim(),
    description: $("#newDescription").value.trim(),
    category: $("#categorySelect").value || state.content.taxonomy.categories[0],
    status: "draft",
    tags: Array.from(state.selectedTags),
    models: Array.from(state.selectedModels),
    location: locations[Number($("#locationSelect").value)] || defaultLocation(),
    cover: "",
    media: [],
  };
  state.content.projects.unshift(project);
  state.selectedProjectId = project.id;
  $("#newTitle").value = "";
  $("#newSubtitle").value = "";
  $("#newDescription").value = "";
  setDirty(true);
  renderAll();
}

function applyProjectEdit() {
  const project = selectedProject();
  if (!project) return;
  const locations = state.content?.taxonomy?.locations || [];
  project.status = $("#projectStatusSelect").value;
  project.category = $("#projectCategorySelect").value;
  project.title = $("#projectTitleInput").value.trim() || project.title;
  project.subtitle = $("#projectSubtitleInput").value.trim();
  project.description = $("#projectDescriptionInput").value.trim();
  project.tags = splitList($("#projectTagsInput").value);
  project.location = locations[Number($("#projectLocationSelect").value)] || project.location || defaultLocation();
  setDirty(true);
  renderAll();
}

function duplicateProject() {
  const project = selectedProject();
  if (!project || !state.content) return;
  const copy = JSON.parse(JSON.stringify(project));
  copy.id = `${slugify(copy.title)}-copy-${Date.now()}`;
  copy.title = `${copy.title} 복사본`;
  copy.status = "draft";
  state.content.projects.unshift(copy);
  state.selectedProjectId = copy.id;
  setDirty(true);
  renderAll();
}

function deleteProject() {
  const project = selectedProject();
  if (!project || !state.content) return;
  const label = project.title || project.id;
  const confirmed = confirm(
    `'${label}' 프로젝트를 목록에서 삭제할까요?\n\n· 사진 파일 자체는 서버에서 지워지지 않습니다.\n· '전체 저장'을 누르기 전에는 새로고침으로 되돌릴 수 있습니다.`,
  );
  if (!confirmed) return;
  const index = state.content.projects.findIndex((item) => item.id === project.id);
  if (index < 0) return;
  state.content.projects.splice(index, 1);
  state.selectedProjectId = state.content.projects[Math.max(0, index - 1)]?.id || state.content.projects[0]?.id || "";
  state.selectedMediaIndexes.clear();
  setDirty(true);
  renderAll();
  renderInstagramFeed();
}

async function uploadDataUrl(dataUrl, nameParts) {
  return apiFetch(API_UPLOAD_URL, {
    method: "POST",
    body: JSON.stringify({ prefix: "portfolio/uploads", nameParts, dataUrl }),
  });
}

async function uploadQueue() {
  if (!state.queue.length) {
    alert("업로드 대기 중인 사진이 없습니다.");
    return;
  }
  const project = selectedProject();
  if (!project) {
    alert("먼저 프로젝트를 선택하거나 새 프로젝트를 만들어주세요.");
    return;
  }
  if (!getAdminKey()) {
    alert("관리자 키를 입력해주세요.");
    $("#adminKey").focus();
    return;
  }

  saveAdminKey();
  state.uploadBusy = true;
  $("#uploadButton").disabled = true;
  const uploaded = [];
  const prefix = slugify($("#uploadNamePrefix").value || project.title || "portfolio");

  try {
    for (let index = 0; index < state.queue.length; index += 1) {
      const item = state.queue[index];
      setProgress(index, state.queue.length, `${index + 1}/${state.queue.length} 업로드 중 · ${item.file.name}`);
      const saved = await uploadDataUrl(item.previewSrc, [prefix, String(index + 1).padStart(2, "0"), item.file.name]);
      let thumb = null;
      if (item.thumbDataUrl && item.thumbDataUrl !== item.previewSrc) {
        thumb = await uploadDataUrl(item.thumbDataUrl, [prefix, "thumb", String(index + 1).padStart(2, "0"), item.file.name]);
      }
      uploaded.push({
        type: item.type,
        src: saved.src,
        thumbnail: thumb?.src || saved.src,
        alt: item.alt || item.caption || project.title,
        caption: item.caption || "",
        tags: uniqueList(item.tags),
        models: uniqueList(item.models),
        location: item.location || project.location || defaultLocation(),
        width: item.width || "",
        height: item.height || "",
      });
    }
    project.media.push(...uploaded);
    if (!project.cover && uploaded[0]?.src) project.cover = uploaded[0].src;
    state.queue = [];
    state.selectedMediaIndexes.clear();
    setProgress(1, 1, "업로드 완료. 전체 저장을 눌러 공개 데이터에 반영하세요.");
    setDirty(true);
    renderMediaGrid();
  } catch (error) {
    alert(error.message || "업로드 중 오류가 발생했습니다.");
  } finally {
    state.uploadBusy = false;
    $("#uploadButton").disabled = false;
    hideProgress(1400);
  }
}

async function saveContent() {
  if (!state.content) return;
  if (!getAdminKey()) {
    alert("관리자 키를 입력해주세요.");
    $("#adminKey").focus();
    return;
  }
  saveAdminKey();
  $("#saveButton").disabled = true;
  $("#saveState").textContent = "저장 중";
  try {
    state.content = normalizeContent(await apiFetch(API_CONTENT_URL, { method: "POST", body: JSON.stringify(state.content) }));
    setDirty(false);
    renderAll();
    alert("저장 완료! 공개 사이트에 반영됐습니다.");
  } catch (error) {
    alert(error.message || "저장 중 오류가 발생했습니다.");
    setDirty(true);
  } finally {
    $("#saveButton").disabled = false;
  }
}

function getExistingMedia(index) {
  const project = selectedProject();
  const queueCount = state.queue.length;
  if (!project) return null;
  if (index < queueCount) return { collection: state.queue, itemIndex: index, item: state.queue[index], queued: true };
  const itemIndex = index - queueCount;
  return { collection: project.media, itemIndex, item: project.media[itemIndex], queued: false };
}

function updateMediaField(index, field, value) {
  const target = getExistingMedia(index);
  if (!target?.item) return;
  if (field === "tags" || field === "models") target.item[field] = splitList(value);
  else target.item[field] = value;
  setDirty(true);
}

function handleMediaAction(index, action) {
  const target = getExistingMedia(index);
  const project = selectedProject();
  if (!target?.item || !project) return;
  const { collection, itemIndex, item, queued } = target;
  if (action === "delete") {
    if (!confirm("이 사진을 삭제할까요?")) return;
    collection.splice(itemIndex, 1);
    if (!queued && project.cover === item.src) project.cover = project.media[0]?.src || "";
  }
  if (action === "up" && itemIndex > 0) collection.splice(itemIndex - 1, 0, collection.splice(itemIndex, 1)[0]);
  if (action === "down" && itemIndex < collection.length - 1) collection.splice(itemIndex + 1, 0, collection.splice(itemIndex, 1)[0]);
  if (action === "cover" && !queued && item.src) project.cover = item.src;
  setDirty(true);
  renderMediaGrid();
}

function applyBatchToSelected() {
  if (!state.selectedMediaIndexes.size) {
    alert("적용할 사진을 선택해주세요.");
    return;
  }
  const caption = $("#batchCaption").value.trim();
  const alt = $("#batchAlt").value.trim();
  const tags = Array.from(state.selectedTags);
  const models = Array.from(state.selectedModels);
  const location = getSelectedBatchLocation();
  state.selectedMediaIndexes.forEach((index) => {
    const target = getExistingMedia(index);
    if (!target?.item) return;
    if (caption) target.item.caption = caption;
    if (alt) target.item.alt = alt;
    if (tags.length) target.item.tags = uniqueList([...(target.item.tags || []), ...tags]);
    if (models.length) target.item.models = uniqueList([...(target.item.models || []), ...models]);
    target.item.location = location;
  });
  setDirty(true);
  renderMediaGrid();
}

function selectAllVisible() {
  const cards = $$(".media-card");
  const allSelected = cards.every((card) => state.selectedMediaIndexes.has(Number(card.dataset.index)));
  cards.forEach((card) => {
    const index = Number(card.dataset.index);
    if (allSelected) state.selectedMediaIndexes.delete(index);
    else state.selectedMediaIndexes.add(index);
  });
  renderMediaGrid();
}

function exportBackup() {
  if (!state.content) return;
  const blob = new Blob([JSON.stringify(state.content, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `365-daily-snap-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function importBackup(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      state.content = normalizeContent(parsed);
      state.selectedProjectId = state.content.projects[0]?.id || "";
      state.queue = [];
      state.selectedMediaIndexes.clear();
      setDirty(true);
      renderAll();
      alert("백업을 불러왔습니다. 전체 저장을 눌러야 서버에 반영됩니다.");
    } catch {
      alert("JSON 파일을 확인해주세요.");
    }
  };
  reader.readAsText(file);
}

/* ── 인스타그램 피드에서 골라 가져오기 ────────────────────────── */

function instagramFeed() {
  return state.instagram.feed || { updatedAt: "", username: "", projects: [] };
}

function formatInstagramSyncedAt(value = "") {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "";
  const time = new Intl.DateTimeFormat("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Seoul" }).format(date);
  return `${instagramDateLabel(value)} ${time}`;
}

function importedInstagramExternalIds() {
  return importedInstagramIds(state.content?.projects || []);
}

function setInstagramNote(text, target = "#instagramFeedNote") {
  const element = $(target);
  if (element) element.textContent = text;
}

async function loadInstagramFeed({ force = false } = {}) {
  if (state.instagram.loading) return;
  if (state.instagram.loaded && !force) {
    renderInstagramFeed();
    renderInstagramSummary();
    return;
  }
  state.instagram.loading = true;
  setInstagramNote("인스타그램 피드를 불러오는 중입니다…");
  setInstagramNote("인스타그램 피드를 불러오는 중입니다…", "#instagramModalNote");
  renderInstagramSummary();
  try {
    const response = await fetch(`${INSTAGRAM_FEED_URL}?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const feed = await response.json();
    state.instagram.feed = {
      updatedAt: String(feed?.updatedAt || ""),
      username: String(feed?.username || ""),
      projects: Array.isArray(feed?.projects) ? feed.projects : [],
    };
    state.instagram.error = "";
    state.instagram.loaded = true;
  } catch (error) {
    state.instagram.error = error?.message || "알 수 없는 오류";
    state.instagram.loaded = true;
  } finally {
    state.instagram.loading = false;
    renderInstagramFeed();
    renderInstagramSummary();
  }
}

function renderInstagramSummary() {
  const feed = instagramFeed();
  const posts = feed.projects || [];
  const importedCount = importedInstagramExternalIds().size;
  if (state.instagram.loading) {
    setInstagramNote("인스타그램 피드를 불러오는 중입니다…");
    return;
  }
  if (state.instagram.error) {
    setInstagramNote(`피드를 불러오지 못했습니다 (${state.instagram.error}). 잠시 후 [피드 새로고침]을 눌러주세요.`);
    return;
  }
  if (!state.instagram.loaded) {
    setInstagramNote("피드를 아직 확인하지 않았습니다. [📸 인스타그램에서 가져오기]를 누르면 최근 게시물을 보여드립니다.");
    return;
  }
  if (!posts.length) {
    setInstagramNote("인스타그램 피드가 비어 있습니다. GitHub Actions의 'Sync Instagram Portfolio' 워크플로가 성공한 뒤 [피드 새로고침]을 눌러주세요. 그 전에는 관리자에서 직접 올리는 수동 등록을 쓸 수 있습니다.");
    return;
  }
  const syncedAt = formatInstagramSyncedAt(feed.updatedAt);
  setInstagramNote(`최근 게시물 ${posts.length}개${syncedAt ? ` · 마지막 동기화 ${syncedAt}` : ""} · 이미 가져온 게시물 ${importedCount}개`);
}

function visibleInstagramPosts() {
  const posts = instagramFeed().projects || [];
  const query = ($("#instagramSearch")?.value || "").trim().toLowerCase();
  const hideImported = Boolean($("#instagramHideImported")?.checked);
  const projects = state.content?.projects || [];
  return posts.filter((post) => {
    if (hideImported && isInstagramPostImported(projects, post)) return false;
    if (!query) return true;
    const haystack = [post.title, post.description, ...(Array.isArray(post.tags) ? post.tags : [])].join(" ").toLowerCase();
    return haystack.includes(query);
  });
}

function updateInstagramSelectionSummary(posts = visibleInstagramPosts()) {
  const selectedCount = posts.filter((post) => state.instagram.selectedIds.has(instagramExternalId(post))).length;
  const label = $("#instagramSelectedSummary");
  if (label) label.textContent = `선택 ${selectedCount}개 / 보이는 게시물 ${posts.length}개`;
  const importButton = $("#importInstagramButton");
  if (importButton) importButton.disabled = selectedCount === 0;
}

function renderInstagramFeed() {
  const grid = $("#instagramFeedGrid");
  if (!grid) return;
  const allPosts = instagramFeed().projects || [];
  const posts = visibleInstagramPosts();
  const projects = state.content?.projects || [];

  const visibleIds = new Set(posts.map((post) => instagramExternalId(post)));
  state.instagram.selectedIds.forEach((id) => {
    if (!visibleIds.has(id)) state.instagram.selectedIds.delete(id);
  });

  if (state.instagram.loading) {
    grid.innerHTML = `<p class="instagram-empty">피드를 불러오는 중입니다…</p>`;
    updateInstagramSelectionSummary(posts);
    return;
  }

  if (!posts.length) {
    const message = allPosts.length
      ? "조건에 맞는 게시물이 없습니다. 검색어를 지우거나 '이미 가져온 게시물 숨기기'를 해제해 보세요."
      : state.instagram.error
        ? `피드를 불러오지 못했습니다 (${state.instagram.error}). 아래 [피드 새로고침]으로 다시 시도해 주세요.`
        : "아직 인스타그램 피드가 비어 있습니다. 'Sync Instagram Portfolio' 워크플로를 한 번 실행한 뒤 [피드 새로고침]을 눌러주세요.";
    grid.innerHTML = `<p class="instagram-empty">${escapeHtml(message)}</p>`;
    updateInstagramSelectionSummary(posts);
    return;
  }

  grid.innerHTML = posts
    .map((post) => {
      const externalId = instagramExternalId(post);
      const imported = isInstagramPostImported(projects, post);
      const media = Array.isArray(post.media) ? post.media : [];
      const thumb = media[0]?.thumbnail || media[0]?.src || post.cover || "";
      const date = instagramDateLabel(post.sourcePublishedAt || post.timestamp || "");
      const checked = state.instagram.selectedIds.has(externalId);
      return `
        <article class="instagram-card${imported ? " is-imported" : ""}">
          <label class="instagram-card-check">
            <input type="checkbox" data-instagram-select="${escapeHtml(externalId)}" ${checked ? "checked" : ""} />
            <span>선택</span>
          </label>
          <div class="instagram-card-thumb">${thumb ? `<img src="${escapeHtml(thumb)}" alt="${escapeHtml(post.title || "인스타그램 사진")}" loading="lazy" />` : `<span>미리보기 없음</span>`}</div>
          <div class="instagram-card-body">
            <p class="instagram-card-meta">${escapeHtml(date || "날짜 없음")}${media.length > 1 ? ` · 사진 ${media.length}장` : ""}${imported ? " · 가져옴" : ""}</p>
            <strong class="instagram-card-title">${escapeHtml(post.title || "제목 없음")}</strong>
            <p class="instagram-card-caption">${escapeHtml(instagramCaptionSummary(post))}</p>
            <div class="instagram-card-actions">
              ${post.instagramUrl ? `<a href="${escapeHtml(post.instagramUrl)}" target="_blank" rel="noreferrer">인스타 원본 ↗</a>` : "<span></span>"}
              <button type="button" class="${imported ? "ghost-button" : "secondary-button"}" data-instagram-import="${escapeHtml(externalId)}" ${imported ? "disabled" : ""}>${imported ? "가져옴" : "프로젝트로 가져오기"}</button>
            </div>
          </div>
        </article>`;
    })
    .join("");

  updateInstagramSelectionSummary(posts);
}

function openInstagramModal() {
  const modal = $("#instagramModal");
  if (!modal) return;
  modal.hidden = false;
  document.body.classList.add("modal-open");
  renderInstagramSummary();
  loadInstagramFeed();
  window.setTimeout(() => $("#instagramSearch")?.focus(), 30);
}

function closeInstagramModal() {
  const modal = $("#instagramModal");
  if (!modal) return;
  modal.hidden = true;
  document.body.classList.remove("modal-open");
}

function instagramImportLocation(post) {
  const location = post?.location || {};
  const hasValue = [location.city, location.district, location.place].some((value) => String(value || "").trim());
  return hasValue ? location : defaultLocation();
}

function importInstagramPosts(posts = []) {
  if (!state.content) {
    alert("먼저 관리 데이터를 불러와 주세요.");
    return;
  }
  if (!posts.length) return;

  const category = state.instagramCategory || $("#instagramCategorySelect")?.value || "";
  const existing = importedInstagramExternalIds();
  const imported = [];
  let skipped = 0;

  posts.forEach((post) => {
    const externalId = instagramExternalId(post);
    if (!externalId || existing.has(externalId)) {
      skipped += 1;
      return;
    }
    const project = buildInstagramProject(post, { category, location: instagramImportLocation(post) });
    if (!project) {
      skipped += 1;
      return;
    }
    state.content.projects.unshift(project);
    existing.add(externalId);
    state.instagram.selectedIds.delete(externalId);
    imported.push(project);
  });

  if (!imported.length) {
    setInstagramNote("새로 가져올 게시물이 없습니다. 이미 가져온 게시물은 '이미 가져온 게시물 숨기기'를 해제하면 목록에서 확인할 수 있습니다.", "#instagramModalNote");
    renderInstagramFeed();
    return;
  }

  state.selectedProjectId = imported[0].id;
  state.selectedMediaIndexes.clear();
  setDirty(true);
  renderAll();
  renderInstagramFeed();
  setInstagramNote(
    `${imported.length}개 게시물을 임시저장 프로젝트로 가져왔습니다.${skipped ? ` (이미 있어 건너뜀 ${skipped}개)` : ""} 공개 상태와 카테고리를 확인한 뒤 [전체 저장]을 눌러주세요.`,
    "#instagramModalNote",
  );
}

function selectAllVisibleInstagram() {
  const posts = visibleInstagramPosts();
  const allSelected = posts.length > 0 && posts.every((post) => state.instagram.selectedIds.has(instagramExternalId(post)));
  posts.forEach((post) => {
    const externalId = instagramExternalId(post);
    if (allSelected) state.instagram.selectedIds.delete(externalId);
    else state.instagram.selectedIds.add(externalId);
  });
  renderInstagramFeed();
}

function bindEvents() {
  bootAdvancedStyle();
  $("#adminKey").value = localStorage.getItem(STORAGE_KEY) || "";
  $("#reloadButton").addEventListener("click", loadContent);
  $("#createProjectButton").addEventListener("click", createProject);
  $("#applyProjectEditButton").addEventListener("click", applyProjectEdit);
  $("#duplicateProjectButton").addEventListener("click", duplicateProject);
  $("#deleteProjectButton").addEventListener("click", deleteProject);
  $("#exportBackupButton").addEventListener("click", exportBackup);
  $("#importBackupInput").addEventListener("change", (event) => importBackup(event.target.files?.[0]));
  $("#uploadButton").addEventListener("click", uploadQueue);
  $("#saveButton").addEventListener("click", saveContent);
  $("#clearQueueButton").addEventListener("click", () => {
    if (!state.queue.length || confirm("업로드 대기 목록을 비울까요?")) {
      state.queue = [];
      renderMediaGrid();
    }
  });
  $("#projectSelect").addEventListener("change", (event) => {
    state.selectedProjectId = event.target.value;
    state.selectedMediaIndexes.clear();
    renderAll();
  });
  $("#fileInput").addEventListener("change", (event) => addFiles(event.target.files));

  const dropZone = $("#dropZone");
  ["dragenter", "dragover"].forEach((eventName) => {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.add("is-over");
    });
  });
  ["dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.remove("is-over");
    });
  });
  dropZone.addEventListener("drop", (event) => addFiles(event.dataTransfer.files));

  document.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-chip-type]");
    if (chip) {
      const set = chip.dataset.chipType === "tag" ? state.selectedTags : state.selectedModels;
      if (set.has(chip.dataset.value)) set.delete(chip.dataset.value);
      else set.add(chip.dataset.value);
      renderBatchTools();
      return;
    }
    const actionButton = event.target.closest("[data-action]");
    if (actionButton) {
      const card = actionButton.closest(".media-card");
      handleMediaAction(Number(card.dataset.index), actionButton.dataset.action);
    }
  });
  $("#mediaGrid").addEventListener("input", (event) => {
    const field = event.target.dataset.field;
    if (!field) return;
    const card = event.target.closest(".media-card");
    updateMediaField(Number(card.dataset.index), field, event.target.value);
  });
  $("#mediaGrid").addEventListener("change", (event) => {
    if (!event.target.matches("[data-select-media]")) return;
    const index = Number(event.target.closest(".media-card").dataset.index);
    if (event.target.checked) state.selectedMediaIndexes.add(index);
    else state.selectedMediaIndexes.delete(index);
  });
  $("#mediaSearch").addEventListener("input", renderMediaGrid);
  $("#selectAllButton").addEventListener("click", selectAllVisible);
  $("#applyBatchButton").addEventListener("click", applyBatchToSelected);

  $("#openInstagramPickerButton").addEventListener("click", openInstagramModal);
  $("#refreshInstagramFeedButton").addEventListener("click", () => loadInstagramFeed({ force: true }));
  $("#closeInstagramModalButton").addEventListener("click", closeInstagramModal);
  $$("[data-close-instagram-modal]").forEach((element) => element.addEventListener("click", closeInstagramModal));
  $("#instagramSearch").addEventListener("input", renderInstagramFeed);
  $("#instagramHideImported").addEventListener("change", renderInstagramFeed);
  $("#instagramCategorySelect").addEventListener("change", (event) => {
    state.instagramCategory = event.target.value;
  });
  $("#instagramSelectAllButton").addEventListener("click", selectAllVisibleInstagram);
  $("#importInstagramButton").addEventListener("click", () => {
    const posts = visibleInstagramPosts().filter((post) => state.instagram.selectedIds.has(instagramExternalId(post)));
    if (!posts.length) {
      setInstagramNote("가져올 게시물을 먼저 선택해 주세요.", "#instagramModalNote");
      return;
    }
    importInstagramPosts(posts);
  });
  $("#instagramFeedGrid").addEventListener("click", (event) => {
    const button = event.target.closest("[data-instagram-import]");
    if (!button || button.disabled) return;
    const externalId = button.dataset.instagramImport;
    const post = (instagramFeed().projects || []).find((item) => instagramExternalId(item) === externalId);
    if (post) importInstagramPosts([post]);
  });
  $("#instagramFeedGrid").addEventListener("change", (event) => {
    if (!event.target.matches("[data-instagram-select]")) return;
    const externalId = event.target.dataset.instagramSelect;
    if (event.target.checked) state.instagram.selectedIds.add(externalId);
    else state.instagram.selectedIds.delete(externalId);
    updateInstagramSelectionSummary();
  });
  window.addEventListener("beforeunload", (event) => {
    if (!state.isDirty) return;
    event.preventDefault();
    event.returnValue = "";
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !$("#instagramModal")?.hidden) {
      closeInstagramModal();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      saveContent();
    }
  });
}

bindEvents();
loadContent().catch((error) => {
  $("#saveState").textContent = "관리 키 필요";
  console.warn(error);
});
