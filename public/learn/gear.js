const $gear = (selector, parent = document) => parent.querySelector(selector);
const $$gear = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const $ = $gear;
const $$ = $$gear;

import { lensFactors, lensProfiles, gearCategoryLabels, gearItems, starterKits } from './gear-data.js';

const lensPageHtml = '<section class="page" data-page="lenses">\n<div class="page-intro shell"><p class="section-label">LENS GUIDE</p><h1>렌즈 이름보다 먼저 봐야 할 요소를 정리했습니다.</h1><p>마운트와 센서 규격부터 초점거리, 최대 조리개, 손떨림 보정, 최소 초점거리, 필터 구경까지 확인하면 렌즈 선택 실패를 크게 줄일 수 있습니다.</p></div>\n<section class="lens-anatomy shell"><div aria-label="렌즈 구조 예시" class="lens-visual"><span class="lens-cap">필터 구경</span><span class="lens-ring focus">초점 링</span><span class="lens-ring zoom">줌 링</span><span class="lens-switch">AF/MF · OSS</span><span class="lens-mount">마운트</span></div><div><p class="section-label">WHAT TO CHECK</p><h2>렌즈 구매 전 10가지 체크</h2><div class="lens-factor-grid" id="lens-factor-grid"></div></div></section>\n<section class="lens-finder-band"><div class="shell"><div class="section-heading light"><div><p class="section-label">LENS FINDER</p><h2>촬영 목적에 맞는 렌즈 유형 찾기</h2></div><p>특정 제품이 아니라 어떤 종류의 렌즈가 필요한지 먼저 추천합니다.</p></div><div class="lens-finder-layout"><form class="lens-finder-form" id="lens-finder-form"><label><span>주요 촬영</span><select name="purpose"><option value="portrait">인물·프로필</option><option value="travel">여행·일상</option><option value="video">영상·브이로그</option><option value="action">스포츠·공연</option><option value="macro">제품·접사</option></select></label><label><span>센서</span><select name="sensor"><option value="apsc">APS-C</option><option value="full">풀프레임</option><option value="mft">마이크로포서드</option></select></label><label><span>렌즈 방식</span><select name="style"><option value="either">상관없음</option><option value="zoom">줌렌즈 선호</option><option value="prime">단렌즈 선호</option></select></label><label><span>가장 중요한 조건</span><select name="priority"><option value="versatile">한 렌즈로 다양하게</option><option value="lowlight">어두운 곳·배경 흐림</option><option value="light">작고 가벼움</option><option value="reach">멀리 있는 피사체</option><option value="close">가까운 접사</option></select></label><button class="primary-action wide" type="submit">렌즈 유형 추천</button></form><div aria-live="polite" class="lens-results" id="lens-results"></div></div></div></section>\n<section class="shell lens-types-section"><div class="section-heading"><div><p class="section-label">LENS TYPES</p><h2>대표 렌즈 유형 한눈에 보기</h2></div><p>초점거리 범위는 센서에 따라 체감 화각이 달라지므로 환산 화각도 함께 확인하세요.</p></div><div class="lens-type-grid" id="lens-type-grid"></div></section>\n<section class="shell compatibility-check"><div><p class="section-label">COMPATIBILITY</p><h2>결제 전에 반드시 확인하세요.</h2></div><ol><li><strong>마운트</strong><span>소니 E, 캐논 RF, 니콘 Z처럼 카메라와 렌즈의 결합 규격이 같아야 합니다.</span></li><li><strong>센서 커버리지</strong><span>APS-C 전용 렌즈를 풀프레임에 사용하면 크롭되거나 주변부가 검게 보일 수 있습니다.</span></li><li><strong>필터 구경</strong><span>렌즈 앞의 Ø 표기입니다. 보유 필터와 다르면 스텝업 링이 필요합니다.</span></li><li><strong>AF·손떨림 보정</strong><span>바디와 렌즈 조합에 따라 자동초점, 보정, 펌웨어 지원 범위가 달라질 수 있습니다.</span></li></ol></section>\n</section>';
const gearPageHtml = '<section class="page" data-page="gear">\n<div class="page-intro shell"><p class="section-label">CAMERA GEAR LIBRARY</p><h1>필터·마이크·조명·삼각대, 필요한 이유부터 확인하세요.</h1><p>초보자가 자주 마주치는 촬영 장비를 역할, 우선순위, 구매 체크포인트와 주의사항으로 정리했습니다. 비싼 장비보다 현재 실패 원인을 해결하는 장비가 먼저입니다.</p></div>\n<section class="gear-priority shell"><article><span>1</span><h3>실패 방지</h3><p>배터리, 메모리카드, 스트랩처럼 촬영 자체가 중단되지 않게 하는 장비</p></article><article><span>2</span><h3>품질 개선</h3><p>마이크, 조명, 삼각대처럼 소리·빛·흔들림을 직접 개선하는 장비</p></article><article><span>3</span><h3>표현 확장</h3><p>ND·CPL·디퓨전 필터, 짐벌처럼 새로운 표현을 만드는 장비</p></article></section>\n<section class="gear-library shell"><div class="gear-toolbar"><div class="gear-search"><label for="gear-search">장비 검색</label><input id="gear-search" placeholder="예: 마이크, ND, 삼각대, 배터리" type="search"/></div><label class="essential-toggle"><input id="gear-essential-only" type="checkbox"/><span>입문 필수만 보기</span></label></div><div class="gear-category-tabs" id="gear-category-tabs"></div><div class="gear-result-count" id="gear-result-count"></div><div class="gear-grid" id="gear-grid"></div></section>\n<section class="starter-kit-band"><div class="shell"><div class="section-heading light"><div><p class="section-label">STARTER KITS</p><h2>촬영 목적별 추천 장비 구성</h2></div><p>모든 장비를 한 번에 살 필요는 없습니다. 아래 순서대로 부족한 부분만 채우세요.</p></div><div class="starter-kit-tabs" id="starter-kit-tabs"></div><div class="starter-kit-result" id="starter-kit-result"></div></div></section>\n<section class="shell buying-checklist"><div><p class="section-label">BUYING CHECKLIST</p><h2>액세서리 구매 전에 확인할 공통 항목</h2></div><div class="buying-check-grid"><article><h3>규격 호환</h3><p>필터 구경, 핫슈, 단자, 케이블 규격, 배터리 모델명을 먼저 확인합니다.</p></article><article><h3>무게와 균형</h3><p>짐벌·삼각대·헤드는 바디와 렌즈, 액세서리를 모두 합친 무게를 기준으로 선택합니다.</p></article><article><h3>전원 방식</h3><p>내장 배터리, AA, NP-F, USB-C PD 등 현장에서 충전 가능한 방식을 확인합니다.</p></article><article><h3>실제 사용 빈도</h3><p>‘있으면 좋다’보다 현재 촬영에서 반복되는 문제를 해결하는 장비를 우선합니다.</p></article></div></section>\n</section>';
const gearPromoHtml = '<section class="gear-home-promo"><div class="shell"><div><p class="section-label">GEAR LIBRARY</p><h2>렌즈부터 마이크까지, 무엇을 왜 사는지 정리했습니다.</h2><p>제품 이름을 외우기 전에 초점거리, 조리개, 필터 규격, 마이크 방식, 조명과 지지 장비의 역할부터 확인하세요.</p></div><div><button class="primary-action" data-route="lenses">렌즈 가이드</button><button class="secondary-action" data-route="gear">촬영 장비 사전</button></div></div></section>';

function installGearPages() {
  const desktopNav = $gear('.desktop-nav');
  const mobileMenu = $gear('#mobile-menu');
  const motionDesktop = desktopNav?.querySelector('[data-route="motion"]');
  const motionMobile = mobileMenu?.querySelector('[data-route="motion"]');
  if (desktopNav && !$gear('[data-route="lenses"]', desktopNav)) {
    motionDesktop?.insertAdjacentHTML('beforebegin', '<button data-route="lenses">렌즈</button><button data-route="gear">장비</button>');
  }
  if (mobileMenu && !$gear('[data-route="lenses"]', mobileMenu)) {
    motionMobile?.insertAdjacentHTML('beforebegin', '<button data-route="lenses">렌즈 선택 가이드</button><button data-route="gear">필터·마이크·촬영 장비</button>');
  }

  const heroActions = $gear('.hero-actions');
  if (heroActions && !$gear('[data-route="lenses"]', heroActions)) {
    heroActions.insertAdjacentHTML('beforeend', '<button class="secondary-action" data-route="lenses">렌즈 고르는 법</button><button class="secondary-action" data-route="gear">촬영 장비 사전</button>');
  }

  const toolList = $gear('.tool-list');
  if (toolList && !$gear('[data-route="lenses"]', toolList)) {
    const calculatorButton = toolList.querySelector('[data-route="calculators"]');
    calculatorButton?.insertAdjacentHTML('beforebegin', '<button data-route="lenses"><span>렌즈</span><strong>단렌즈·줌렌즈·조리개·마운트</strong><small>목적에 맞는 렌즈 선택</small></button><button data-route="gear"><span>장비</span><strong>필터·마이크·조명·삼각대</strong><small>40개 이상의 액세서리 가이드</small></button>');
  }

  const scenario = $gear('.scenario-section');
  if (scenario && !$gear('.gear-home-promo')) scenario.insertAdjacentHTML('beforebegin', gearPromoHtml);

  const motionPage = $gear('[data-page="motion"]');
  if (motionPage && !$gear('[data-page="lenses"]')) motionPage.insertAdjacentHTML('beforebegin', `${lensPageHtml}
${gearPageHtml}`);
}

function openGearRoute(route, updateHash = true) {
  if (!['lenses', 'gear'].includes(route)) return;
  $$gear('.page').forEach((page) => page.classList.toggle('active', page.dataset.page === route));
  $$gear('[data-route]').forEach((button) => button.classList.toggle('active', button.dataset.route === route));
  if (updateHash) history.replaceState(null, '', `#${route}`);
  const mobile = $gear('#mobile-menu');
  if (mobile) mobile.hidden = true;
  $gear('.menu-toggle')?.setAttribute('aria-expanded', 'false');
  window.scrollTo({ top: 0, behavior: 'auto' });
  document.title = `${route === 'lenses' ? '렌즈 선택 가이드' : '촬영 장비 사전'} | 365 Daily Snap`;
}

function bindGearRoutes() {
  $$gear('[data-route="lenses"], [data-route="gear"]').forEach((button) => button.addEventListener('click', () => openGearRoute(button.dataset.route)));
  window.addEventListener('hashchange', () => {
    const route = location.hash.slice(1);
    if (route === 'lenses' || route === 'gear') openGearRoute(route, false);
  });
}

function lensScore(profile, answers) {
  let score = 0;
  if (profile.purposes.includes(answers.purpose)) score += 8;
  if (profile.sensors.includes(answers.sensor)) score += 3;
  if (answers.style === "either" || profile.style === answers.style) score += 4;
  if (profile.priorities.includes(answers.priority)) score += 6;
  if (answers.purpose === "action" && profile.priorities.includes("reach")) score += 3;
  if (answers.purpose === "macro" && profile.priorities.includes("close")) score += 5;
  return score;
}

function renderLensTypes() {
  $("#lens-factor-grid").innerHTML = lensFactors.map(([title, text], index) => `<article><span>${String(index + 1).padStart(2, "0")}</span><h3>${title}</h3><p>${text}</p></article>`).join("");
  $("#lens-type-grid").innerHTML = lensProfiles.map((lens) => `<article><div class="lens-type-head"><span>${lens.style === "prime" ? "단렌즈" : "줌렌즈"}</span><b>${lens.range}</b></div><h3>${lens.name}</h3><p>${lens.summary}</p><dl><div><dt>장점</dt><dd>${lens.strengths}</dd></div><div><dt>주의</dt><dd>${lens.caution}</dd></div></dl><div class="camera-tags">${lens.tags.map((tag) => `<span>${tag}</span>`).join("")}</div></article>`).join("");
}

function setupLensFinder() {
  renderLensTypes();
  const renderResult = (ranked) => {
    $("#lens-results").innerHTML = `<div class="lens-result-title"><span>추천 렌즈 유형</span><strong>제품보다 유형을 먼저 정하세요.</strong></div>${ranked.map((lens, index) => `<article><span class="camera-rank">${index + 1}</span><div><small>${index === 0 ? "가장 적합" : index === 1 ? "대안" : "확장 선택"}</small><h3>${lens.name}</h3><b>${lens.range}</b><p>${lens.summary}</p><div class="camera-tags">${lens.tags.map((tag) => `<span>${tag}</span>`).join("")}</div></div></article>`).join("")}`;
  };
  $("#lens-finder-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const answers = Object.fromEntries(data.entries());
    const ranked = lensProfiles.map((profile) => ({ ...profile, score: lensScore(profile, answers) })).sort((a, b) => b.score - a.score).slice(0, 3);
    renderResult(ranked);
  });
  const defaultAnswers = { purpose: "portrait", sensor: "apsc", style: "either", priority: "versatile" };
  renderResult(lensProfiles.map((profile) => ({ ...profile, score: lensScore(profile, defaultAnswers) })).sort((a, b) => b.score - a.score).slice(0, 3));
}

let activeGearCategory = "all";

function renderGearItems() {
  const keyword = $("#gear-search").value.trim().toLowerCase();
  const essentialOnly = $("#gear-essential-only").checked;
  const filtered = gearItems.filter((item) => {
    const categoryMatch = activeGearCategory === "all" || item.category === activeGearCategory;
    const essentialMatch = !essentialOnly || item.essential;
    const searchText = `${item.name} ${item.summary} ${item.check} ${item.caution} ${item.tags.join(" ")}`.toLowerCase();
    return categoryMatch && essentialMatch && (!keyword || searchText.includes(keyword));
  });
  $("#gear-result-count").textContent = `${filtered.length}개의 장비 가이드`;
  $("#gear-grid").innerHTML = filtered.length ? filtered.map((item) => `<article class="gear-card"><div class="gear-card-top"><span>${gearCategoryLabels[item.category]}</span><b class="${item.essential ? "essential" : ""}">${item.priority}</b></div><h3>${item.name}</h3><p>${item.summary}</p><div class="camera-tags">${item.tags.map((tag) => `<span>${tag}</span>`).join("")}</div><details><summary>구매 체크와 주의사항</summary><dl><div><dt>확인</dt><dd>${item.check}</dd></div><div><dt>주의</dt><dd>${item.caution}</dd></div></dl></details></article>`).join("") : '<div class="gear-empty"><strong>조건에 맞는 장비가 없습니다.</strong><p>검색어를 줄이거나 전체 카테고리로 변경해 보세요.</p></div>';
}

function renderStarterKit(id) {
  const kit = starterKits.find((item) => item.id === id) || starterKits[0];
  $("#starter-kit-result").innerHTML = `<div><span>${kit.name}</span><h3>${kit.desc}</h3><p>${kit.order}</p></div><ol>${kit.items.map((item) => `<li>${item}</li>`).join("")}</ol>`;
  $$('[data-kit]').forEach((button) => button.classList.toggle("active", button.dataset.kit === kit.id));
}

function setupGearLibrary() {
  $("#gear-category-tabs").innerHTML = Object.entries(gearCategoryLabels).map(([key, label]) => `<button type="button" data-gear-category="${key}" class="${key === "all" ? "active" : ""}">${label}</button>`).join("");
  $$('[data-gear-category]').forEach((button) => button.addEventListener("click", () => {
    activeGearCategory = button.dataset.gearCategory;
    $$('[data-gear-category]').forEach((item) => item.classList.toggle("active", item === button));
    renderGearItems();
  }));
  $("#gear-search").addEventListener("input", renderGearItems);
  $("#gear-essential-only").addEventListener("change", renderGearItems);
  $("#starter-kit-tabs").innerHTML = starterKits.map((kit) => `<button type="button" data-kit="${kit.id}">${kit.name}</button>`).join("");
  $$('[data-kit]').forEach((button) => button.addEventListener("click", () => renderStarterKit(button.dataset.kit)));
  renderGearItems();
  renderStarterKit(starterKits[0].id);
}

installGearPages();
bindGearRoutes();
setupLensFinder();
setupGearLibrary();
if (['lenses', 'gear'].includes(location.hash.slice(1))) openGearRoute(location.hash.slice(1), false);
