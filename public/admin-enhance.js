(() => {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  function clickTab(tabName) {
    const button = document.querySelector(`.tab-button[data-tab="${tabName}"]`);
    button?.click();
  }

  function copyText(text, message) {
    navigator.clipboard?.writeText(text).then(() => {
      const status = $('#status');
      if (status) {
        status.textContent = message;
        status.className = 'status is-good';
      }
    });
  }

  function getCounts() {
    return {
      projects: $('#projectCount')?.textContent || '0',
      media: $('#mediaCount')?.textContent || '0',
      models: $('#modelCount')?.textContent || '0',
      inquiries: $('#inquiryCount')?.textContent || '0',
    };
  }

  function buildBoostPanel() {
    if ($('.admin-boost-panel')) return;

    const hero = $('.hero');
    if (!hero) return;

    const panel = document.createElement('section');
    panel.className = 'admin-boost-panel';
    panel.innerHTML = `
      <div class="admin-boost-head">
        <div>
          <p class="eyebrow">Workflow command center</p>
          <h2>오늘 할 일을 바로 처리하세요.</h2>
          <p class="hint">프로젝트, 사진, 문구, 문의를 빠르게 이동하고 현재 콘텐츠 상태를 점검합니다.</p>
        </div>
        <div class="admin-search-box">
          <label>프로젝트 빠른 검색
            <input id="adminProjectSearch" type="search" placeholder="프로젝트명, 설명, 태그 검색" autocomplete="off" />
          </label>
        </div>
      </div>
      <div class="admin-boost-grid" aria-label="관리 요약">
        <article class="admin-boost-card"><strong id="boostProjectCount">0 Projects</strong><p>공개 포트폴리오에 연결되는 촬영 단위입니다.</p></article>
        <article class="admin-boost-card"><strong id="boostMediaCount">0 Media</strong><p>사진·영상 수입니다. 대표 이미지를 먼저 정리하세요.</p></article>
        <article class="admin-boost-card"><strong id="boostInquiryCount">0 Inquiries</strong><p>문의가 쌓이면 먼저 답장하고 상태를 읽음 처리하세요.</p></article>
        <article class="admin-boost-card"><strong>KO / JP / EN</strong><p>일본 활동 대비 문구는 3개 언어 기준으로 점검하세요.</p></article>
      </div>
      <div class="admin-boost-actions">
        <button class="button compact" type="button" data-admin-jump="projects">프로젝트 관리</button>
        <button class="button compact secondary" type="button" data-admin-jump="copy">문구 수정</button>
        <button class="button compact secondary" type="button" data-admin-jump="options">태그·모델</button>
        <button class="button compact secondary" type="button" data-admin-jump="inquiries">문의함</button>
        <a class="button compact secondary" href="/ko" target="_blank" rel="noreferrer">KO 미리보기</a>
        <a class="button compact secondary" href="/ja" target="_blank" rel="noreferrer">JP 미리보기</a>
        <a class="button compact secondary" href="/en" target="_blank" rel="noreferrer">EN 미리보기</a>
      </div>
    `;

    hero.insertAdjacentElement('afterend', panel);
  }

  function buildFloatingTools() {
    if ($('.admin-floating-tools')) return;

    const tools = document.createElement('aside');
    tools.className = 'admin-floating-tools';
    tools.setAttribute('aria-label', '빠른 관리자 도구');
    tools.innerHTML = `
      <button class="button secondary" type="button" data-scroll-top>맨 위</button>
      <button class="button secondary" type="button" data-save-shortcut>저장</button>
    `;
    document.body.appendChild(tools);

    const watermark = document.createElement('div');
    watermark.className = 'admin-page-watermark';
    watermark.textContent = 'Admin · 저장 전 공개 반영 안 됨';
    document.body.appendChild(watermark);
  }

  function refreshBoostCounts() {
    const counts = getCounts();
    const project = $('#boostProjectCount');
    const media = $('#boostMediaCount');
    const inquiry = $('#boostInquiryCount');
    if (project) project.textContent = `${counts.projects} Projects`;
    if (media) media.textContent = `${counts.media} Media`;
    if (inquiry) inquiry.textContent = `${counts.inquiries} Inquiries`;
  }

  function filterProjects(query) {
    const normalized = query.trim().toLowerCase();
    const cards = $$('#projectList .item-card');

    cards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      card.classList.toggle('admin-hidden-by-search', Boolean(normalized) && !text.includes(normalized));
    });
  }

  function bindEnhancements() {
    document.addEventListener('click', (event) => {
      const jump = event.target.closest('[data-admin-jump]');
      if (jump) {
        clickTab(jump.dataset.adminJump);
        window.scrollTo({ top: $('.tabs')?.offsetTop || 0, behavior: 'smooth' });
        return;
      }

      if (event.target.closest('[data-scroll-top]')) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (event.target.closest('[data-save-shortcut]')) {
        $('#saveButton')?.click();
      }
    });

    document.addEventListener('input', (event) => {
      if (event.target.id === 'adminProjectSearch') {
        clickTab('projects');
        filterProjects(event.target.value);
      }
    });

    document.addEventListener('keydown', (event) => {
      const isMac = navigator.platform.toLowerCase().includes('mac');
      const saveShortcut = (isMac ? event.metaKey : event.ctrlKey) && event.key.toLowerCase() === 's';
      if (saveShortcut) {
        event.preventDefault();
        $('#saveButton')?.click();
      }

      const projectShortcut = event.altKey && event.key === '1';
      const copyShortcut = event.altKey && event.key === '2';
      const inquiryShortcut = event.altKey && event.key === '3';
      if (projectShortcut) clickTab('projects');
      if (copyShortcut) clickTab('copy');
      if (inquiryShortcut) clickTab('inquiries');
    });

    $('#copyPublicLinkButton')?.addEventListener('click', () => {
      copyText(`${window.location.origin}/ko`, '한국어 공개 사이트 링크를 복사했습니다.');
    }, true);
  }

  function improveStaticCopy() {
    const linkButton = $('#copyPublicLinkButton');
    if (linkButton) linkButton.textContent = 'KO 링크 복사';

    const publicButton = document.querySelector('.topbar .actions a.button');
    if (publicButton) publicButton.setAttribute('href', '/ko');

    const notice = $('.notice');
    if (notice && !notice.dataset.enhanced) {
      notice.dataset.enhanced = 'true';
      notice.innerHTML = '저장 전 변경사항은 공개 사이트에 반영되지 않습니다. 사진·문구 수정 후 <strong>변경사항 저장</strong>을 누르고, KO/JP/EN 미리보기로 화면을 확인하세요.';
    }
  }

  function boot() {
    buildBoostPanel();
    buildFloatingTools();
    bindEnhancements();
    improveStaticCopy();
    refreshBoostCounts();
    window.setInterval(refreshBoostCounts, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
