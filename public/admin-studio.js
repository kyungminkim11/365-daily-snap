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

function getAdminKey() {
  return $("#adminKey").value.trim();
}

function saveAdminKey() {
  const value = getAdminKey();
  if (value) localStorage.setItem(STORAGE_KEY, value);
}

function splitList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
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

function hideProgress(delay = 800) {
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
    projects: Array.isArray(content.projects) ? content.projects : [],
    portfolioItems: Array.isArray(content.portfolioItems) ? content.portfolioItems : [],
  };
}

function renderAll() {
  renderCounts();
  renderProjectSelect();
  renderCreateFields();
  renderBatchTools();
  renderMediaGrid();
}

function renderCounts() {
  const projects = state.content?.projects || [];
  const mediaCount = projects.reduce((sum, project) => sum + (project.media?.length || 0), 0) + state.queue.length;
  $("#projectCount").textContent = `${projects.length} 프로젝트`;
  $("#mediaCount").textContent = `${mediaCount} 사진/영상`;
  const project = selectedProject();
  $("#selectedProjectInfo").textContent = project ? `선택됨: ${project.title}` : "프로젝트를 선택하세요";
}

function renderProjectSelect() {
  const select = $("#projectSelect");
  const projects = state.content?.projects || [];
  select.innerHTML = projects.length
    ? projects.map((project) => `<option value="${escapeHtml(project.id)}">${escapeHtml(project.title)}</option>`).join("")
    : `<option value="">아직 프로젝트가 없습니다</option>`;
  select.value = state.selectedProjectId;
}

function renderCreateFields() {
  const categories = state.content?.taxonomy?.categories || [];
  const locations = state.content?.taxonomy?.locations || [];
  $("#categorySelect").innerHTML = categories.map((item) => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`).join("");
  const locationOptions = locations.map((item, index) => `<option value="${index}">${escapeHtml(locationKey(item))}</option>`).join("");
  $("#locationSelect").innerHTML = locationOptions;
  $("#batchLocationSelect").innerHTML = locationOptions;
}

function renderBatchTools() {
  const tags = state.content?.taxonomy?.tags || [];
  const models = state.content?.models?.map((model) => model.name) || [];
  renderChipPicker("#tagPicker", tags, state.selectedTags, "tag");
  renderChipPicker("#modelPicker", models, state.selectedModels, "model");
}

function renderChipPicker(selector, values, selectedSet, type) {
  $(selector).innerHTML = values.length
    ? values
        .map((value) => `<button type="button" class="${selectedSet.has(value) ? "is-active" : ""}" data-chip-type="${type}" data-value="${escapeHtml(value)}">${escapeHtml(value)}</button>`)
        .join("")
    : `<span class="empty-mini">등록된 항목 없음</span>`;
}

function makePreview(media) {
  const src = media.previewSrc || media.src;
  if (!src) return `<div class="empty-state">미리보기 없음</div>`;
  if (media.type === "video") {
    return `<video src="${escapeHtml(src)}" muted playsinline controls></video>`;
  }
  return `<img src="${escapeHtml(src)}" alt="${escapeHtml(media.alt || media.caption || "preview")}" loading="lazy" />`;
}

function renderMediaGrid() {
  const grid = $("#mediaGrid");
  const empty = $("#emptyState");
  const project = selectedProject();
  const existing = project?.media || [];
  const items = [...state.queue.map((item) => ({ ...item, queued: true })), ...existing.map((item) => ({ ...item, queued: false }))];
  const query = $("#mediaSearch").value.trim().toLowerCase();

  const filtered = items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => {
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
    card.classList.toggle("is-cover", project?.cover && item.src === project.cover);
    card.querySelector(".media-preview").innerHTML = makePreview(item);
    card.querySelector("[data-select-media]").checked = state.selectedMediaIndexes.has(index);
    card.querySelector('[data-field="caption"]').value = item.caption || "";
    card.querySelector('[data-field="alt"]').value = item.alt || "";
    card.querySelector('[data-field="tags"]').value = (item.tags || []).join(", ");
    card.querySelector('[data-field="models"]').value = (item.models || []).join(", ");
    if (item.queued) {
      card.querySelector('[data-action="cover"]').disabled = true;
      card.querySelector('[data-action="cover"]').textContent = "업로드 대기";
    }
    grid.appendChild(card);
  });

  renderCounts();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function addFiles(files) {
  const fileList = Array.from(files || []).filter((file) => file.type.startsWith("image/") || file.type.startsWith("video/"));
  if (!fileList.length) return;

  const commonTags = Array.from(state.selectedTags);
  const commonModels = Array.from(state.selectedModels);
  const batchLocation = getSelectedBatchLocation();
  const caption = $("#batchCaption").value.trim();
  const alt = $("#batchAlt").value.trim();

  for (const file of fileList) {
    const previewSrc = await readFileAsDataUrl(file);
    state.queue.push({
      id: `queue-${crypto.randomUUID()}`,
      file,
      previewSrc,
      type: file.type.startsWith("video/") ? "video" : "image",
      caption: caption || file.name.replace(/\.[^.]+$/, ""),
      alt: alt || caption || file.name.replace(/\.[^.]+$/, ""),
      tags: commonTags,
      models: commonModels,
      location: batchLocation,
    });
  }

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
      const saved = await apiFetch(API_UPLOAD_URL, {
        method: "POST",
        body: JSON.stringify({
          prefix: "portfolio/uploads",
          nameParts: [prefix, String(index + 1).padStart(2, "0"), item.file.name],
          dataUrl: item.previewSrc,
        }),
      });

      uploaded.push({
        type: item.type,
        src: saved.src,
        alt: item.alt || item.caption || project.title,
        caption: item.caption || "",
        tags: uniqueList(item.tags),
        models: uniqueList(item.models),
        location: item.location || project.location || defaultLocation(),
      });
    }

    project.media.push(...uploaded);
    if (!project.cover && uploaded[0]?.src) project.cover = uploaded[0].src;
    state.queue = [];
    state.selectedMediaIndexes.clear();
    setProgress(1, 1, "업로드 완료. 저장 버튼을 눌러 공개 데이터에 반영하세요.");
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
    state.content = normalizeContent(await apiFetch(API_CONTENT_URL, {
      method: "POST",
      body: JSON.stringify(state.content),
    }));
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

  if (action === "up" && itemIndex > 0) {
    collection.splice(itemIndex - 1, 0, collection.splice(itemIndex, 1)[0]);
  }

  if (action === "down" && itemIndex < collection.length - 1) {
    collection.splice(itemIndex + 1, 0, collection.splice(itemIndex, 1)[0]);
  }

  if (action === "cover" && !queued && item.src) {
    project.cover = item.src;
  }

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

function bindEvents() {
  $("#adminKey").value = localStorage.getItem(STORAGE_KEY) || "";
  $("#reloadButton").addEventListener("click", loadContent);
  $("#createProjectButton").addEventListener("click", createProject);
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
    renderMediaGrid();
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
    const isSave = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s";
    if (isSave) {
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
