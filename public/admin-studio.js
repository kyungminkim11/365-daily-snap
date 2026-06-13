const API_CONTENT_URL = "/api/content";
const API_UPLOAD_URL = "/api/upload-media";
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
}

function renderProjectEditor() {
  const project = selectedProject();
  const locations = state.content?.taxonomy?.locations || [];
  if (!project) return;
  $("#projectStatusSelect").value = project.status || "published";
  $("#projectCategorySelect").value = project.category || state.content.taxonomy.categories[0] || "";
  $("#projectTitleInput").value = project.title || "";
  $("#projectSubtitleInput").value = project.subtitle || "";
  $("#projectDescriptionInput").value = project.description || "";
  $("#projectTagsInput").value = (project.tags || []).join(", ");
  const locationIndex = Math.max(0, locations.findIndex((location) => locationKey(location) === locationKey(project.location)));
  $("#projectLocationSelect").value = String(locationIndex);
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

function bindEvents() {
  bootAdvancedStyle();
  $("#adminKey").value = localStorage.getItem(STORAGE_KEY) || "";
  $("#reloadButton").addEventListener("click", loadContent);
  $("#createProjectButton").addEventListener("click", createProject);
  $("#applyProjectEditButton").addEventListener("click", applyProjectEdit);
  $("#duplicateProjectButton").addEventListener("click", duplicateProject);
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
  window.addEventListener("beforeunload", (event) => {
    if (!state.isDirty) return;
    event.preventDefault();
    event.returnValue = "";
  });
  document.addEventListener("keydown", (event) => {
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
