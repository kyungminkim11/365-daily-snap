const apertureValues = [1.4, 1.7, 2, 2.8, 4, 5.6, 8, 11, 16, 22, 32];
const shutterValues = [30, 15, 8, 4, 2, 1, 1 / 2, 1 / 4, 1 / 8, 1 / 15, 1 / 30, 1 / 60, 1 / 125, 1 / 250, 1 / 500, 1 / 1000, 1 / 2000, 1 / 4000, 1 / 8000];
const shutterLabels = ["30초", "15초", "8초", "4초", "2초", "1초", "1/2초", "1/4초", "1/8초", "1/15초", "1/30초", "1/60초", "1/125초", "1/250초", "1/500초", "1/1000초", "1/2000초", "1/4000초", "1/8000초"];
const isoValues = [100, 200, 400, 800, 1600, 3200, 6400, 12800, 25600];

const scenarios = [
  { title: "야외 인물", desc: "배경을 부드럽게, 눈 초점을 우선", values: ["F1.8~2.8", "1/250초 이상", "ISO AUTO"] },
  { title: "실내 카페", desc: "흔들림을 막고 자연광을 활용", values: ["F2~4", "1/125초 이상", "ISO 400~1600"] },
  { title: "야간 인물", desc: "빛이 부족하면 ISO를 과감하게", values: ["F1.4~2.8", "1/160초 이상", "ISO 1600~6400"] },
  { title: "스포츠", desc: "움직임 정지와 연속 AF가 핵심", values: ["F2.8~5.6", "1/1000초 이상", "ISO AUTO"] },
  { title: "풍경", desc: "화면 전체 선명도와 안정성 우선", values: ["F8~11", "삼각대에 맞춤", "ISO 100"] },
];

const exposurePresets = {
  "인물": { aperture: 2, shutter: 13, iso: 1 },
  "카페": { aperture: 3, shutter: 12, iso: 3 },
  "야경": { aperture: 2, shutter: 12, iso: 5 },
  "스포츠": { aperture: 4, shutter: 15, iso: 4 },
  "풍경": { aperture: 6, shutter: 12, iso: 0 },
};

const cameraData = [
  { name: "Canon EOS R50", budget: 1, purposes: ["portrait", "travel"], balance: ["photo", "hybrid"], priorities: ["light", "af", "evf"], tags: ["가벼운 입문기", "뷰파인더", "쉬운 조작"], reason: "작고 가벼우면서 자동초점과 안내형 UI가 쉬워 첫 렌즈교환식 카메라로 접근하기 좋습니다." },
  { name: "Canon EOS R10", budget: 2, purposes: ["portrait", "action", "travel"], balance: ["photo", "hybrid"], priorities: ["af", "evf"], tags: ["빠른 연사", "자동초점", "성장형"], reason: "R50보다 조작계와 연사 성능이 여유로워 사진을 오래 배울 입문자에게 적합합니다." },
  { name: "Sony ZV-E10 II", budget: 2, purposes: ["video", "travel", "portrait"], balance: ["video", "hybrid"], priorities: ["light", "af"], tags: ["영상 중심", "가벼움", "E마운트"], reason: "셀프 촬영과 영상 기능이 강하고 E마운트 렌즈 선택지가 넓습니다. 다만 전자식 뷰파인더는 없습니다." },
  { name: "Sony α6700", budget: 4, purposes: ["portrait", "action", "video", "travel"], balance: ["photo", "hybrid", "video"], priorities: ["af", "evf"], tags: ["강력한 AF", "손떨림 보정", "상급 APS-C"], reason: "예산은 높지만 자동초점, 사진과 영상, 렌즈 확장성까지 균형이 좋아 오래 쓰기 좋은 성장형 선택입니다." },
  { name: "Nikon Z50II", budget: 3, purposes: ["portrait", "action", "travel", "video"], balance: ["photo", "hybrid"], priorities: ["af", "evf"], tags: ["피사체 인식", "뷰파인더", "안정적 조작성"], reason: "사진 촬영 조작이 편하고 피사체 인식 성능이 좋아 가족, 반려동물, 여행 촬영을 폭넓게 다룹니다." },
  { name: "Fujifilm X-M5", budget: 2, purposes: ["travel", "video", "portrait"], balance: ["hybrid", "video"], priorities: ["light", "color"], tags: ["필름 시뮬레이션", "초경량", "영상"], reason: "작고 가벼우며 후지필름 특유의 색감과 영상 기능이 매력적입니다. 뷰파인더가 없다는 점은 확인해야 합니다." },
  { name: "OM SYSTEM OM-D E-M10 IV", budget: 1, purposes: ["travel", "portrait"], balance: ["photo", "hybrid"], priorities: ["light", "evf"], tags: ["손떨림 보정", "작은 렌즈", "여행"], reason: "바디와 렌즈가 작고 손떨림 보정이 있어 여행과 일상 기록에 부담이 적습니다." },
  { name: "Panasonic LUMIX G100D", budget: 1, purposes: ["video", "travel"], balance: ["video", "hybrid"], priorities: ["light", "evf"], tags: ["브이로그", "소형", "뷰파인더"], reason: "소형 브이로그 바디를 찾으면서 뷰파인더도 필요한 사용자에게 실용적인 선택입니다." },
];

const quizQuestions = [
  { q: "달리는 사람을 선명하게 멈추고 싶을 때 가장 먼저 확인할 값은 무엇일까요?", options: ["화이트밸런스", "셔터스피드", "화소 수", "파일 형식"], answer: 1, explanation: "움직임을 멈추는 핵심은 빠른 셔터스피드입니다. 달리는 사람은 1/500초 이상부터 시작하고, 빛이 부족하면 조리개나 ISO로 보완합니다." },
  { q: "배경을 더 흐리게 만들기 쉬운 설정은 무엇일까요?", options: ["F값을 낮춘다", "ISO를 낮춘다", "셔터를 빠르게 한다", "화이트밸런스를 흐림으로 바꾼다"], answer: 0, explanation: "F값이 낮은 큰 조리개는 심도를 얕게 만듭니다. 피사체에 가까이 가고 배경과 피사체 거리를 늘리면 효과가 더 커집니다." },
  { q: "사진이 어둡고 셔터스피드를 더 느리게 하면 흔들릴 상황입니다. 가장 실용적인 선택은?", options: ["ISO를 올린다", "렌즈캡을 닫는다", "화각을 넓힌다", "JPEG를 RAW로 바꾼다"], answer: 0, explanation: "ISO를 올리면 노이즈가 늘 수 있지만, 흔들려 실패한 사진보다 선명한 고ISO 사진이 대체로 낫습니다." },
  { q: "APS-C 카메라에서 56mm 렌즈의 풀프레임 환산 화각은 약 얼마일까요?", options: ["35mm", "56mm", "84mm", "112mm"], answer: 2, explanation: "1.5배 APS-C 기준으로 56 × 1.5 = 84mm입니다. 환산값은 화각 비교를 위한 값이며 실제 렌즈 초점거리가 바뀌는 것은 아닙니다." },
  { q: "풍경을 화면 전체에 비교적 선명하게 담고 싶을 때 좋은 시작점은?", options: ["F1.4", "F2", "F8", "ISO 25600"], answer: 2, explanation: "풍경에서는 F8 전후가 심도와 렌즈 해상력의 균형이 좋은 경우가 많습니다. 빛이 부족하면 삼각대를 사용하는 편이 안정적입니다." },
  { q: "망원렌즈로 촬영할 때 최소 셔터스피드를 더 빠르게 잡는 주된 이유는?", options: ["색온도가 변해서", "작은 흔들림이 크게 보이기 때문에", "파일이 커져서", "배터리를 아끼기 위해"], answer: 1, explanation: "초점거리가 길수록 작은 카메라 흔들림도 화면에서 크게 보입니다. 손떨림 보정이 있더라도 움직이는 피사체에는 빠른 셔터가 필요합니다." },
  { q: "과초점 거리는 주로 어떤 촬영에서 유용할까요?", options: ["풍경과 거리 촬영", "스튜디오 플래시 동조", "화이트밸런스 보정", "연속 촬영 버퍼 관리"], answer: 0, explanation: "과초점 거리에 맞추면 특정 거리부터 무한대까지 허용 가능한 선명도를 확보할 수 있어 풍경과 스냅에 유용합니다." },
];

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

function setRoute(route, push = true) {
  const valid = $(`.page[data-page="${route}"]`) ? route : "home";
  $$(".page").forEach((page) => page.classList.toggle("active", page.dataset.page === valid));
  $$('[data-route]').forEach((button) => button.classList.toggle("active", button.dataset.route === valid));
  if (push) history.replaceState(null, "", valid === "home" ? "#home" : `#${valid}`);
  const mobile = $("#mobile-menu");
  mobile.hidden = true;
  $(".menu-toggle").setAttribute("aria-expanded", "false");
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.title = `${routeTitle(valid)} | 365 Daily Snap`;
}

function routeTitle(route) {
  return ({ home: "Photo Lab", exposure: "노출 3요소", dof: "심도 시뮬레이터", focal: "화각 시뮬레이터", motion: "셔터스피드 체험", calculators: "사진 계산기", finder: "입문 카메라 추천", quiz: "사진 입문 퀴즈" })[route] || "Photo Lab";
}

$$('[data-route]').forEach((button) => button.addEventListener("click", () => setRoute(button.dataset.route)));
$(".menu-toggle").addEventListener("click", () => {
  const menu = $("#mobile-menu");
  const next = menu.hidden;
  menu.hidden = !next;
  $(".menu-toggle").setAttribute("aria-expanded", String(next));
});
window.addEventListener("hashchange", () => setRoute(location.hash.slice(1) || "home", false));

function renderScenarios() {
  $("#scenario-grid").innerHTML = scenarios.map((item) => `<article class="scenario-card"><div><h3>${item.title}</h3><p>${item.desc}</p></div><div class="scenario-values">${item.values.map((value) => `<span>${value}</span>`).join("")}</div></article>`).join("");
}

function formatShutter(seconds) {
  if (seconds >= 1) return `${Number.isInteger(seconds) ? seconds : seconds.toFixed(1)}초`;
  return `1/${Math.round(1 / seconds)}초`;
}

function updateExposure() {
  const aIndex = +$("#aperture-range").value;
  const sIndex = +$("#shutter-range").value;
  const iIndex = +$("#iso-range").value;
  const aperture = apertureValues[aIndex];
  const shutter = shutterValues[sIndex];
  const iso = isoValues[iIndex];
  $("#aperture-output").textContent = `F${aperture}`;
  $("#shutter-output").textContent = shutterLabels[sIndex];
  $("#iso-output").textContent = `ISO ${iso}`;

  const ev = Math.log2((aperture * aperture) / shutter) - Math.log2(iso / 100);
  const targetEv = 8.5;
  const difference = targetEv - ev;
  const scene = $("#exposure-scene");
  const brightness = Math.max(.42, Math.min(1.75, 1 + difference * .16));
  scene.style.filter = `brightness(${brightness})`;
  $(".scene-background").style.filter = `blur(${Math.max(0, (5.6 - aperture) * 1.55)}px)`;
  $(".moving-ball").style.filter = `blur(${Math.max(0, (shutter - 1 / 250) * 18)}px)`;
  $(".noise-layer").style.opacity = String(Math.max(0, Math.min(.58, (Math.log2(iso / 100) - 2) * .1)));
  $("#meter-value").textContent = `${difference >= 0 ? "+" : ""}${difference.toFixed(1)} EV`;

  const status = difference < -1 ? "노출 부족" : difference > 1 ? "노출 과다" : "적정 노출";
  $("#exposure-status").textContent = status;
  $("#brightness-result").textContent = difference < -1 ? "어두움" : difference > 1 ? "밝음" : "적정";
  $("#blur-result").textContent = aperture <= 2 ? "매우 흐림" : aperture <= 4 ? "부드러움" : aperture <= 8 ? "보통" : "넓게 선명";
  $("#motion-result").textContent = shutter <= 1 / 500 ? "정지" : shutter <= 1 / 125 ? "약간 흐림" : "흐름";
  $("#noise-result").textContent = iso <= 400 ? "낮음" : iso <= 1600 ? "보통" : iso <= 6400 ? "높음" : "매우 높음";

  let advice = "세 값의 균형이 안정적입니다. 촬영 목적에 따라 배경 흐림이나 움직임 표현을 우선 조정해 보세요.";
  if (difference < -1) advice = "사진이 어둡습니다. 조리개를 더 열거나, 셔터를 느리게 하거나, ISO를 올려 보세요.";
  if (difference > 1) advice = "사진이 너무 밝습니다. 조리개를 조이거나, 셔터를 빠르게 하거나, ISO를 낮춰 보세요.";
  if (shutter > 1 / 60) advice += " 현재 셔터는 손으로 들고 촬영할 때 흔들림에 특히 주의해야 합니다.";
  $("#exposure-note").textContent = advice;
}

function setupExposure() {
  $("#exposure-presets").innerHTML = Object.keys(exposurePresets).map((name) => `<button type="button" data-preset="${name}">${name}</button>`).join("");
  ["#aperture-range", "#shutter-range", "#iso-range"].forEach((id) => $(id).addEventListener("input", updateExposure));
  $$('[data-preset]').forEach((button) => button.addEventListener("click", () => {
    const preset = exposurePresets[button.dataset.preset];
    $("#aperture-range").value = preset.aperture;
    $("#shutter-range").value = preset.shutter;
    $("#iso-range").value = preset.iso;
    updateExposure();
  }));
  updateExposure();
}

function circleOfConfusion(crop) {
  return .03 / crop;
}

function formatDistance(meters) {
  if (!Number.isFinite(meters)) return "∞";
  if (meters < 1) return `${Math.round(meters * 100)}cm`;
  if (meters > 999) return "∞";
  return `${meters.toFixed(meters < 10 ? 2 : 1)}m`;
}

function updateDof() {
  const crop = +$("#sensor-select").value;
  const focal = +$("#dof-focal").value;
  const aperture = apertureValues[+$("#dof-aperture").value];
  const distanceM = +$("#dof-distance").value / 100;
  const s = distanceM * 1000;
  const coc = circleOfConfusion(crop);
  const hyperfocalMm = (focal * focal) / (aperture * coc) + focal;
  const nearMm = (hyperfocalMm * s) / (hyperfocalMm + (s - focal));
  const farMm = hyperfocalMm <= s ? Infinity : (hyperfocalMm * s) / (hyperfocalMm - (s - focal));
  const totalMm = Number.isFinite(farMm) ? farMm - nearMm : Infinity;

  $("#dof-focal-output").textContent = `${focal}mm`;
  $("#dof-aperture-output").textContent = `F${aperture}`;
  $("#dof-distance-output").textContent = `${distanceM.toFixed(distanceM < 10 ? 1 : 0)}m`;
  $("#near-limit").textContent = formatDistance(nearMm / 1000);
  $("#far-limit").textContent = formatDistance(farMm / 1000);
  $("#total-dof").textContent = formatDistance(totalMm / 1000);
  $("#hyperfocal").textContent = formatDistance(hyperfocalMm / 1000);

  const normalizedSubject = Math.min(.78, .2 + Math.log10(distanceM + 1) * .28);
  $("#subject-mark").style.left = `${normalizedSubject * 100}%`;
  const nearRatio = Math.max(.08, Math.min(.86, (nearMm / s) * normalizedSubject));
  const farRatio = Number.isFinite(farMm) ? Math.max(normalizedSubject + .04, Math.min(.94, (farMm / s) * normalizedSubject)) : .94;
  $("#focus-zone").style.left = `${nearRatio * 100}%`;
  $("#focus-zone").style.width = `${Math.max(5, (farRatio - nearRatio) * 100)}%`;

  const totalM = totalMm / 1000;
  const summary = !Number.isFinite(totalM) || totalM > distanceM * 2 ? "매우 깊은 심도" : totalM < .2 ? "매우 얕은 심도" : totalM < 1 ? "얕은 심도" : "넓은 심도";
  $("#dof-summary").textContent = summary;
  $("#dof-note").textContent = `${focal}mm · F${aperture} · ${distanceM.toFixed(1)}m 기준입니다. 실제 체감 배경 흐림은 배경과 피사체 사이 거리, 배경 형태에도 영향을 받습니다.`;
}

function setupDof() {
  const presets = [
    { name: "A6700 + 18mm", crop: 1.5, focal: 18, aperture: 3, distance: 200 },
    { name: "A6700 + 56mm", crop: 1.5, focal: 56, aperture: 1, distance: 200 },
    { name: "A6700 + 135mm", crop: 1.5, focal: 135, aperture: 4, distance: 600 },
  ];
  $("#gear-presets").innerHTML = presets.map((p, i) => `<button type="button" data-gear="${i}">${p.name}</button>`).join("");
  ["#sensor-select", "#dof-focal", "#dof-aperture", "#dof-distance"].forEach((id) => $(id).addEventListener("input", updateDof));
  $$('[data-gear]').forEach((button) => button.addEventListener("click", () => {
    const p = presets[+button.dataset.gear];
    $("#sensor-select").value = p.crop;
    $("#dof-focal").value = p.focal;
    $("#dof-aperture").value = p.aperture;
    $("#dof-distance").value = p.distance;
    updateDof();
  }));
  updateDof();
}

function focalInfo(equivalent) {
  if (equivalent < 24) return { type: "초광각", title: "넓은 공간과 강한 원근감", use: "건축·풍경", desc: "아주 넓은 범위를 담지만 프레임 가장자리의 인물은 늘어나 보일 수 있습니다." };
  if (equivalent < 35) return { type: "광각", title: "공간과 상황을 함께 담는 화각", use: "여행·거리", desc: "인물과 주변 환경을 함께 보여주기 좋아 여행과 공간 스냅에 편리합니다." };
  if (equivalent < 60) return { type: "표준", title: "눈에 익숙한 자연스러운 화각", use: "일상·인물", desc: "과도하게 넓거나 좁지 않아 처음 한 렌즈로 연습하기 좋은 범위입니다." };
  if (equivalent < 100) return { type: "준망원", title: "인물에 집중하기 좋은 화각", use: "인물·디테일", desc: "얼굴 비율을 안정적으로 표현하고 배경을 정돈하기 쉬워 인물 촬영에 자주 사용됩니다." };
  if (equivalent < 200) return { type: "망원", title: "멀리 있는 피사체를 또렷하게", use: "공연·스포츠", desc: "시야가 좁고 흔들림에 민감해 빠른 셔터스피드와 안정적인 자세가 중요합니다." };
  return { type: "초망원", title: "멀리 있는 순간을 크게 포착", use: "야생동물·경기", desc: "아주 좁은 화각으로 피사체 추적과 손떨림 관리가 촬영 성공률을 좌우합니다." };
}

function updateFocal() {
  const focal = +$("#focal-range").value;
  const crop = +$("#focal-sensor").value;
  const equivalent = focal * crop;
  const info = focalInfo(equivalent);
  const width = Math.max(12, Math.min(88, 82 * Math.sqrt(24 / equivalent)));
  $("#view-frame").style.width = `${width}%`;
  $("#frame-label").textContent = `${focal}mm`;
  $("#focal-output").textContent = `${focal}mm`;
  $("#equivalent-output").textContent = `약 ${Math.round(equivalent)}mm`;
  $("#focal-type").textContent = `${info.type} 화각`;
  $("#focal-title").textContent = info.title;
  $("#focal-description").textContent = info.desc;
  $("#focal-use").textContent = info.use;
  $$('[data-focal]').forEach((button) => button.classList.toggle("active", +button.dataset.focal === focal));
}

function setupFocal() {
  const quick = [14, 18, 24, 35, 50, 85, 135, 200, 300];
  $("#quick-focals").innerHTML = quick.map((value) => `<button type="button" data-focal="${value}">${value}mm</button>`).join("");
  ["#focal-range", "#focal-sensor"].forEach((id) => $(id).addEventListener("input", updateFocal));
  $$('[data-focal]').forEach((button) => button.addEventListener("click", () => { $("#focal-range").value = button.dataset.focal; updateFocal(); }));
  updateFocal();
}

function updateMotion() {
  const speed = +$("#subject-speed").value;
  const shutterIndex = +$("#motion-shutter").value;
  const shutter = shutterValues[shutterIndex];
  const reciprocal = shutter >= 1 ? 1 / shutter : 1 / shutter;
  const required = [125, 250, 500, 1000, 2000][speed - 1];
  const blur = Math.max(0, Math.min(24, (required / reciprocal - 1) * 3.4));
  $("#runner").style.filter = `blur(${blur}px)`;
  $("#runner").style.transform = `translateX(${Math.min(14, blur)}px)`;
  $("#motion-shutter-output").textContent = shutterLabels[shutterIndex];
  const status = reciprocal >= required ? "선명하게 정지" : reciprocal >= required / 2 ? "약한 움직임" : reciprocal >= required / 5 ? "움직임이 보임" : "강한 모션 블러";
  $("#motion-status").textContent = status;
  $("#motion-note").textContent = `이 피사체에는 약 1/${required}초 이상을 시작점으로 권장합니다. 패닝 촬영처럼 의도적으로 흐름을 만들 때는 더 느린 셔터를 사용하세요.`;
  $("#shutter-guide").innerHTML = [
    ["일상적인 걸음", "1/125~1/250초"],
    ["달리기·반려동물", "1/500~1/1000초"],
    ["스포츠·빠른 공", "1/1000~1/2000초"],
    ["물의 흐름·궤적", "1/4초 이하"],
  ].map(([name, value]) => `<div><span>${name}</span><b>${value}</b></div>`).join("");
}

function setupMotion() {
  ["#subject-speed", "#motion-shutter"].forEach((id) => $(id).addEventListener("input", updateMotion));
  updateMotion();
}

function updateCalculators() {
  const focal = Math.max(1, +$("#crop-focal").value || 1);
  const crop = +$("#crop-factor").value;
  $("#crop-result").textContent = `약 ${Math.round(focal * crop)}mm 화각`;

  const minimumFocal = Math.max(1, +$("#minimum-focal").value || 1);
  const safety = +$("#safety-factor").value;
  const denominator = Math.ceil(minimumFocal * safety);
  $("#minimum-result").textContent = `최소 약 1/${denominator}초`;

  const current = +$("#nd-shutter").value;
  const stops = +$("#nd-stops").value;
  const next = current * 2 ** stops;
  $("#nd-result").textContent = `새 셔터 약 ${formatShutter(next)}`;
}

function setupCalculators() {
  $("#nd-shutter").innerHTML = shutterValues.map((value, i) => `<option value="${value}" ${i === 13 ? "selected" : ""}>${shutterLabels[i]}</option>`).join("");
  ["#crop-focal", "#crop-factor", "#minimum-focal", "#safety-factor", "#nd-shutter", "#nd-stops"].forEach((id) => $(id).addEventListener("input", updateCalculators));
  updateCalculators();
}

function cameraScore(camera, answers) {
  let score = 0;
  const budgetGap = answers.budget - camera.budget;
  score += budgetGap >= 0 ? 5 - Math.abs(budgetGap) : -Math.abs(budgetGap) * 3;
  if (camera.purposes.includes(answers.purpose)) score += 7;
  if (camera.balance.includes(answers.balance)) score += 5;
  if (camera.priorities.includes(answers.priority)) score += 5;
  if (answers.priority === "evf" && !camera.priorities.includes("evf")) score -= 5;
  return score;
}

function setupFinder() {
  $("#finder-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const answers = { budget: +data.get("budget"), purpose: data.get("purpose"), balance: data.get("balance"), priority: data.get("priority") };
    const ranked = cameraData.map((camera) => ({ ...camera, score: cameraScore(camera, answers) })).sort((a, b) => b.score - a.score).slice(0, 3);
    const labels = ["가장 적합", "가성비 대안", "성장형 선택"];
    $("#finder-results").innerHTML = `<div class="recommendation-head"><div><h2>추천 결과</h2><p>선택한 조건을 기준으로 우선순위를 계산했습니다.</p></div></div><div class="camera-result-list">${ranked.map((camera, index) => `<article class="camera-result"><span class="camera-rank">${index + 1}</span><div><small>${labels[index]}</small><h3>${camera.name}</h3><p>${camera.reason}</p><div class="camera-tags">${camera.tags.map((tag) => `<span>${tag}</span>`).join("")}</div></div><a href="https://search.naver.com/search.naver?query=${encodeURIComponent(camera.name)}" target="_blank" rel="noreferrer">정보 확인</a></article>`).join("")}</div>`;
  });
}

let quizState = { index: 0, score: 0, answered: false, selected: null };
const dailyQuiz = quizQuestions.slice(0, 5);

function renderQuiz() {
  const current = dailyQuiz[quizState.index];
  if (!current) {
    $("#quiz-card").innerHTML = `<span class="quiz-number">COMPLETE</span><h2>오늘의 퀴즈를 완료했습니다.</h2><div class="quiz-explanation"><strong>${quizState.score} / ${dailyQuiz.length}점</strong><p>틀린 문제는 점수보다 해설을 다시 읽는 편이 훨씬 중요합니다. 촬영 현장에서는 완벽한 숫자보다 상황에 맞는 우선순위를 기억하세요.</p></div><button class="primary-action quiz-next" type="button" id="quiz-again">다시 풀기</button>`;
    $("#quiz-again").addEventListener("click", resetQuiz);
    $("#quiz-progress-text").textContent = `${dailyQuiz.length} / ${dailyQuiz.length}`;
    $("#quiz-progress-bar").style.width = "100%";
    $("#quiz-score").textContent = `최종 ${quizState.score}점`;
    localStorage.setItem("photoLabQuizScore", String(quizState.score));
    return;
  }
  $("#quiz-card").innerHTML = `<span class="quiz-number">QUESTION ${String(quizState.index + 1).padStart(2, "0")}</span><h2>${current.q}</h2><div class="quiz-options">${current.options.map((option, index) => `<button type="button" data-option="${index}">${option}</button>`).join("")}</div><div class="quiz-explanation" ${quizState.answered ? "" : "hidden"}><strong>${quizState.selected === current.answer ? "정답입니다." : "다시 기억해 두세요."}</strong><p>${current.explanation}</p></div>${quizState.answered ? `<button class="primary-action quiz-next" type="button" id="quiz-next">${quizState.index === dailyQuiz.length - 1 ? "결과 보기" : "다음 문제"}</button>` : ""}`;
  $$('[data-option]', $("#quiz-card")).forEach((button) => {
    const optionIndex = +button.dataset.option;
    if (quizState.answered) {
      if (optionIndex === current.answer) button.classList.add("correct");
      if (optionIndex === quizState.selected && optionIndex !== current.answer) button.classList.add("wrong");
      button.disabled = true;
    } else {
      button.addEventListener("click", () => {
        quizState.selected = optionIndex;
        quizState.answered = true;
        if (optionIndex === current.answer) quizState.score += 1;
        renderQuiz();
      });
    }
  });
  $("#quiz-next")?.addEventListener("click", () => { quizState.index += 1; quizState.answered = false; quizState.selected = null; renderQuiz(); });
  $("#quiz-progress-text").textContent = `${quizState.index + 1} / ${dailyQuiz.length}`;
  $("#quiz-progress-bar").style.width = `${((quizState.index + 1) / dailyQuiz.length) * 100}%`;
  $("#quiz-score").textContent = `현재 ${quizState.score}점`;
}

function resetQuiz() {
  quizState = { index: 0, score: 0, answered: false, selected: null };
  renderQuiz();
}

function setupQuiz() {
  $("#quiz-reset").addEventListener("click", resetQuiz);
  renderQuiz();
}

renderScenarios();
setupExposure();
setupDof();
setupFocal();
setupMotion();
setupCalculators();
setupFinder();
setupQuiz();
setRoute(location.hash.slice(1) || "home", false);
