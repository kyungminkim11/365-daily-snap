const defaultLocations = [
  { city: "서울", district: "마포구", place: "연남동", lat: 37.5627, lng: 126.9253, mapX: 56, mapY: 36 },
  { city: "서울", district: "마포구", place: "홍대입구", lat: 37.5572, lng: 126.9245, mapX: 54, mapY: 48 },
  { city: "서울", district: "마포구", place: "상수동", lat: 37.5477, lng: 126.9229, mapX: 51, mapY: 68 },
  { city: "서울", district: "마포구", place: "망원동", lat: 37.5568, lng: 126.9058, mapX: 24, mapY: 50 },
  { city: "서울", district: "마포구", place: "합정동", lat: 37.5496, lng: 126.914, mapX: 38, mapY: 63 },
  { city: "경기", district: "협의", place: "장소 미정", lat: "", lng: "", mapX: 50, mapY: 50 },
  { city: "도쿄", district: "시부야구", place: "시부야", lat: 35.6595, lng: 139.7005, mapX: 78, mapY: 28 },
];

export const fallbackContent = {
  hero: {
    eyebrow: "365 Daily Snap",
    title: "있는 그대로, 자연스럽게 남기는 인물 사진",
    description:
      "서울·수도권을 중심으로 인물 스냅을 촬영합니다. 어색한 포즈보다 편안한 분위기를 먼저 생각하며, 개인 프로필, 데일리 스냅, 커플 촬영까지 자연스럽게 담아냅니다.",
  },
  portfolioIntro: {
    title: "포트폴리오 보기",
    description: "촬영 분위기, 시간대, 장소, 모델 태그로 작업을 나눠볼 수 있습니다.",
  },
  portfolioFilters: ["전체", "인물", "프로필", "데일리", "카페", "거리", "야외", "실내", "낮", "밤", "자연광", "클로즈업", "시네마틱", "차분한", "웨딩무드", "한복", "반려동물", "바다"],
  taxonomy: {
    categories: ["인물 사진", "커플 스냅", "프로필 촬영", "여행 스냅", "야간 스냅", "카페 촬영", "반려동물"],
    tags: ["인물", "프로필", "데일리", "포트폴리오협업", "카페", "거리", "야외", "실내", "낮", "밤", "자연광", "클로즈업", "전신", "반신", "웨딩무드", "한복", "바다", "플라워", "시네마틱", "차분한", "움직임", "네온", "반려동물", "동물스냅", "촬영기록"],
    locations: defaultLocations,
  },
  models: [],
  projects: [],
  portfolioItems: [
    {
      category: "City Portrait",
      title: "도심 인물 스냅",
      description: "일상적인 거리에서 편안한 표정과 분위기를 담습니다.",
      image: "",
      tags: ["낮", "야외", "서울", "인물"],
      models: [],
      location: defaultLocations[0],
    },
    {
      category: "Night Mood",
      title: "야간 스냅",
      description: "밤의 조명과 그림자를 활용해 차분한 인물 사진을 만듭니다.",
      image: "",
      tags: ["밤", "야외", "서울", "인물"],
      models: [],
      location: defaultLocations[1],
    },
    {
      category: "Couple Snap",
      title: "커플 스냅",
      description: "과한 연출보다 두 사람이 편하게 느끼는 흐름을 담습니다.",
      image: "",
      tags: ["낮", "야외", "커플", "서울"],
      models: [],
      location: defaultLocations[2],
    },
    {
      category: "Travel Portrait",
      title: "여행 스냅",
      description: "장소의 분위기와 사람의 표정을 함께 기록합니다.",
      image: "",
      tags: ["낮", "야외", "여행"],
      models: [],
      location: defaultLocations[3],
    },
    {
      category: "Tokyo Selected Dates",
      title: "도쿄 스냅",
      description: "일정이 맞는 기간에 한해 도쿄 현지 촬영을 진행합니다.",
      image: "",
      tags: ["낮", "밤", "야외", "여행"],
      models: [],
      location: defaultLocations[6],
    },
    {
      category: "Personal Profile",
      title: "프로필 촬영",
      description: "SNS, 블로그, 소개용으로 쓰기 좋은 자연스러운 프로필을 촬영합니다.",
      image: "",
      tags: ["낮", "실내", "프로필", "서울"],
      models: [],
      location: defaultLocations[4],
    },
  ],
  areas: [
    { area: "Seoul", description: "서울 전 지역" },
    { area: "Gyeonggi", description: "수도권 일정 협의" },
    { area: "Tokyo", description: "선택된 일정 한정" },
  ],
  packages: [
    {
      name: "Portrait Snap",
      duration: "30-60 min",
      description: "개인 프로필이나 데일리 스냅이 필요한 분께 맞는 촬영입니다.",
      features: ["프로필", "SNS", "개인 기록"],
    },
    {
      name: "Couple Snap",
      duration: "60 min",
      description: "두 사람의 자연스러운 분위기와 움직임을 중심으로 촬영합니다.",
      features: ["데이트 스냅", "기념일", "야외 촬영"],
      featured: true,
    },
    {
      name: "Profile / Branding",
      duration: "60-90 min",
      description: "SNS, 블로그, 개인 브랜딩에 활용하기 좋은 인물 사진을 촬영합니다.",
      features: ["개인 브랜딩", "업무 프로필", "콘셉트 상담"],
    },
    {
      name: "Travel Snap",
      duration: "협의",
      description: "여행지나 이동 동선 안에서 자연스러운 인물 기록을 남깁니다.",
      features: ["서울", "수도권", "도쿄 선택 일정"],
    },
  ],
  bookingSteps: [
    {
      number: "01",
      title: "문의",
      description: "촬영 목적, 희망 날짜, 장소를 카카오톡 오픈채팅이나 인스타그램 DM으로 보내주세요.",
    },
    {
      number: "02",
      title: "일정 조율",
      description: "촬영 가능 날짜와 장소를 조율한 뒤 최종 일정을 확정합니다.",
    },
    {
      number: "03",
      title: "촬영",
      description: "현장 분위기에 맞춰 자연스러운 포즈와 표정을 함께 만들어갑니다.",
    },
    {
      number: "04",
      title: "전달",
      description: "셀렉과 보정을 거친 최종본을 온라인 링크로 전달드립니다.",
    },
  ],
  shootingProcess: {
    title: "촬영 진행 과정",
    description:
      "촬영 컨셉 문의부터 최종본 전달까지 단계별로 진행합니다. 촬영 목적과 분위기를 먼저 정리하고, 셀렉과 보정 과정도 함께 확인합니다.",
    ctaLabel: "촬영 문의하기",
    steps: [
      {
        number: "01",
        title: "촬영 컨셉 문의",
        description: "원하는 분위기, 촬영 목적, 참고 이미지를 바탕으로 방향을 정리합니다.",
      },
      {
        number: "02",
        title: "일정 및 장소 확정",
        description: "촬영 가능 날짜와 장소를 조율한 뒤 최종 일정을 확정합니다.",
      },
      {
        number: "03",
        title: "촬영 진행",
        description: "현장 분위기에 맞춰 자연스러운 포즈와 표정을 함께 만들어갑니다.",
      },
      {
        number: "04",
        title: "원본 전달",
        description: "요청 시 촬영 원본 전체를 전달드립니다.",
      },
      {
        number: "05",
        title: "작가 1차 셀렉",
        description: "작가가 먼저 결과물을 검토하고 1차 후보를 정리합니다.",
      },
      {
        number: "06",
        title: "모델 1차 셀렉",
        description: "전달받은 후보 중 원하는 컷을 직접 선택하실 수 있습니다.",
      },
      {
        number: "07",
        title: "보정 작업",
        description: "선택된 사진을 기준으로 색감, 피부, 분위기 보정을 진행합니다.",
      },
      {
        number: "08",
        title: "최종본 전달",
        description: "보정 완료 후 Google Drive 링크 또는 카카오톡 오픈채팅으로 전달드립니다.",
      },
    ],
  },
  testimonialsIntro: {
    title: "함께 촬영한 분들의 후기",
    description:
      "실제로 함께 촬영한 분들이 남겨주신 후기입니다. 촬영 분위기, 소통 방식, 결과물에 대한 경험을 확인하실 수 있습니다.",
    ctaLabel: "촬영 문의하기",
  },
  testimonials: [
    {
      name: "@ooonllii",
      handle: "@ooonllii",
      date: "2월 8일",
      type: "카페 인물 스냅",
      content:
        "저도 오늘 촬영 너무 즐거웠어요. 다음에 기회되면 또 촬영해요. 모델 필요하시면 또 연락주시고요. 100점짜리 작가님이 불러주시면 언제든 달려가겠습니다.",
      reviewImage: "/reviews/review-ooonllii.jpg",
      imageAlt: "@ooonllii 촬영 후기 원본 캡처",
    },
    {
      name: "@kylieyouk",
      handle: "@kylieyouk",
      date: "2월 17일",
      type: "야외 인물 스냅",
      content:
        "작가님 너무 고생 많으셨습니다. 추운 날씨에 촬영하시느라 정말 고생 많으셨어요. 덕분에 즐겁고 좋은 시간 보냈고, 다음 촬영도 언제든지 환영입니다.",
      reviewImage: "/reviews/review-kylieyouk.jpg",
      imageAlt: "@kylieyouk 촬영 후기 원본 캡처",
    },
    {
      name: "@new_.too",
      handle: "@new_.too",
      date: "3월 9일",
      type: "프로필 협업 촬영",
      content:
        "오늘 수고 많으셨습니다. 즐거운 촬영 시간이었습니다. 사진 전달과 확인 과정도 편하게 안내해주셔서 좋았습니다.",
      reviewImage: "/reviews/review-new-too.jpg",
      imageAlt: "@new_.too 촬영 후기 원본 캡처",
    },
    {
      name: "분다버그",
      handle: "분다버그",
      date: "3월 2일",
      type: "야외 인물 스냅",
      content:
        "잘 찍어주셔서 감사합니다. 추운 날씨에 늦은 시간까지 함께해주셔서 정말 감사했어요. 덕분에 분위기 좋은 컷 많이 나왔습니다.",
      reviewImage: "/reviews/review-bundaberg.jpg",
      imageAlt: "분다버그 촬영 후기 원본 캡처",
    },
    {
      name: "2월 14일 촬영 모델",
      handle: "2월 14일 촬영 모델",
      date: "2월 14일",
      type: "촬영·셀렉 진행 후기",
      content:
        "오늘 정말 수고 많으셨습니다. 덕분에 너무 즐거웠어요. 촬영부터 셀렉까지 원스탑으로 진행되어 편했습니다.",
      reviewImage: "/reviews/review-feb14-model.jpg",
      imageAlt: "2월 14일 촬영 후기 원본 캡처",
    },
  ],
  inquiryChecklist: [
    "희망 날짜와 시간대",
    "촬영 지역 또는 장소",
    "촬영 목적",
    "원하는 분위기나 참고 사진",
    "인원 수",
    "사진 사용 용도",
  ],
};

const defaultShootingProcess = {
  title: "촬영 프로세스",
  description: "문의부터 촬영, 셀렉, 보정본 전달까지 모든 과정은 충분한 소통을 바탕으로 단계별로 진행됩니다.",
  ctaLabel: "촬영 문의하기",
  steps: [
    {
      number: "01",
      icon: "message",
      title: "촬영 콘셉트 문의",
      description: "원하는 분위기, 의상, 장소, 레퍼런스 이미지를 바탕으로 촬영 방향을 함께 논의합니다.",
    },
    {
      number: "02",
      icon: "calendar",
      title: "촬영 일정 확정",
      description: "서로 가능한 날짜와 시간을 조율한 뒤 촬영 일자와 장소를 확정합니다.",
    },
    {
      number: "03",
      icon: "camera",
      title: "촬영 진행",
      description: "사전에 정한 콘셉트에 맞춰 촬영하고, 현장에서 포즈와 분위기를 자연스럽게 조율합니다.",
    },
    {
      number: "04",
      icon: "folder",
      title: "원본 전체 제공",
      description: "요청 시 원본 전체를 Google Drive 링크 또는 카카오톡 오픈채팅방으로 전달합니다.",
    },
    {
      number: "05",
      icon: "check",
      title: "작가 1차 셀렉",
      description: "구도, 초점, 분위기, 완성도를 기준으로 작가가 1차 후보 이미지를 선별합니다.",
    },
    {
      number: "06",
      icon: "heart",
      title: "모델 1차 셀렉",
      description: "선별된 후보 이미지 중 모델이 원하는 컷을 직접 선택합니다.",
    },
    {
      number: "07",
      icon: "sliders",
      title: "보정 작업",
      description: "색감, 피부, 분위기를 자연스럽게 보정하며 인물의 매력과 사진의 흐름을 살립니다.",
    },
    {
      number: "08",
      icon: "send",
      title: "보정본 전달",
      description: "최종 보정본은 Google Drive 링크 또는 카카오톡 오픈채팅방을 통해 전달합니다.",
    },
  ],
};

function clampMapValue(value, fallback) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.min(92, Math.max(8, number));
}

function normalizeList(list, fallback = []) {
  const source = Array.isArray(list) && list.length > 0 ? list : fallback;

  return Array.from(new Set(source.map((item) => String(item ?? "").trim()).filter(Boolean)));
}

function normalizeLocation(location = {}, fallbackLocation = {}) {
  const city = String(location.city ?? fallbackLocation.city ?? "서울").trim() || "서울";
  const district = String(location.district ?? fallbackLocation.district ?? "마포구").trim() || "마포구";
  const place = String(location.place ?? fallbackLocation.place ?? "장소 미정").trim() || "장소 미정";
  const lat = Number(location.lat ?? fallbackLocation.lat);
  const lng = Number(location.lng ?? fallbackLocation.lng);

  return {
    city,
    district,
    place,
    lat: Number.isFinite(lat) && lat !== 0 ? lat : "",
    lng: Number.isFinite(lng) && lng !== 0 ? lng : "",
    mapX: clampMapValue(location.mapX ?? fallbackLocation.mapX, 50),
    mapY: clampMapValue(location.mapY ?? fallbackLocation.mapY, 50),
  };
}

function normalizeModels(models = []) {
  if (!Array.isArray(models)) {
    return [];
  }

  return models
    .map((model) => ({
      name: String(model.name ?? "").trim(),
      url: String(model.url ?? "").trim(),
      note: String(model.note ?? "").trim(),
    }))
    .filter((model) => model.name);
}

function normalizeTaxonomy(taxonomy = {}) {
  const fallbackTaxonomy = fallbackContent.taxonomy;

  return {
    categories: normalizeList(taxonomy.categories, fallbackTaxonomy.categories),
    tags: normalizeList(taxonomy.tags, fallbackTaxonomy.tags),
    locations:
      Array.isArray(taxonomy.locations) && taxonomy.locations.length > 0
        ? taxonomy.locations.map((location, index) => normalizeLocation(location, fallbackTaxonomy.locations[index]))
        : fallbackTaxonomy.locations.map((location) => normalizeLocation(location)),
  };
}

function normalizePortfolioItem(item = {}, index = 0) {
  const fallbackItem = fallbackContent.portfolioItems[index % fallbackContent.portfolioItems.length] ?? {};

  return {
    ...fallbackItem,
    ...item,
    tags: Array.isArray(item.tags) ? item.tags : fallbackItem.tags ?? [],
    models: Array.isArray(item.models) ? item.models : fallbackItem.models ?? [],
    location: normalizeLocation(item.location, fallbackItem.location),
  };
}

function normalizeProjectMedia(media = {}, fallbackProject = {}) {
  return {
    type: media.type === "video" ? "video" : "image",
    src: String(media.src ?? media.image ?? "").trim(),
    alt: String(media.alt ?? fallbackProject.title ?? "").trim(),
    caption: String(media.caption ?? "").trim(),
    tags: Array.isArray(media.tags) ? media.tags : [],
    models: Array.isArray(media.models) ? media.models : [],
    location: normalizeLocation(media.location, fallbackProject.location),
  };
}

function normalizeProject(project = {}, index = 0) {
  const location = normalizeLocation(project.location, fallbackContent.taxonomy.locations[0]);

  return {
    id: String(project.id ?? `${project.title ?? "project"}-${index}`).trim(),
    title: String(project.title ?? `Project ${index + 1}`).trim(),
    subtitle: String(project.subtitle ?? "").trim(),
    description: String(project.description ?? "").trim(),
    category: String(project.category ?? "인물 사진").trim(),
    tags: Array.isArray(project.tags) ? project.tags : [],
    models: Array.isArray(project.models) ? project.models : [],
    location,
    cover: String(project.cover ?? "").trim(),
    media: Array.isArray(project.media) ? project.media.map((media) => normalizeProjectMedia(media, { ...project, location })) : [],
  };
}

function normalizeShootingProcess(process = {}) {
  const fallbackProcess = defaultShootingProcess;
  const sourceProcess = process === fallbackContent.shootingProcess ? defaultShootingProcess : process;
  const steps = Array.isArray(sourceProcess.steps) && sourceProcess.steps.length > 0 ? sourceProcess.steps : fallbackProcess.steps;

  return {
    ...fallbackProcess,
    ...sourceProcess,
    title: String(sourceProcess.title ?? fallbackProcess.title).trim(),
    description: String(sourceProcess.description ?? fallbackProcess.description).trim(),
    ctaLabel: String(sourceProcess.ctaLabel ?? fallbackProcess.ctaLabel).trim(),
    steps: steps
      .map((step, index) => ({
        number: String(step.number ?? String(index + 1).padStart(2, "0")).trim(),
        icon: String(step.icon ?? fallbackProcess.steps[index]?.icon ?? "").trim(),
        title: String(step.title ?? "").trim(),
        description: String(step.description ?? "").trim(),
      }))
      .filter((step) => step.title && step.description),
  };
}

function normalizeTestimonials(testimonials = []) {
  const source = Array.isArray(testimonials) && testimonials.length > 0 ? testimonials : fallbackContent.testimonials;

  return source
    .map((testimonial) => ({
      name: String(testimonial.name ?? "").trim(),
      handle: String(testimonial.handle ?? testimonial.name ?? "").trim(),
      date: String(testimonial.date ?? "").trim(),
      type: String(testimonial.type ?? "").trim(),
      content: String(testimonial.content ?? "").trim(),
      reviewImage: String(testimonial.reviewImage ?? testimonial.image ?? "").trim(),
      imageAlt: String(testimonial.imageAlt ?? "").trim(),
    }))
    .filter((testimonial) => testimonial.name && testimonial.content);
}

export function normalizeContent(content = {}) {
  const taxonomy = normalizeTaxonomy(content.taxonomy);
  const models = normalizeModels(content.models);

  return {
    ...fallbackContent,
    ...content,
    hero: {
      ...fallbackContent.hero,
      ...(content.hero ?? {}),
    },
    portfolioIntro: {
      ...fallbackContent.portfolioIntro,
      ...(content.portfolioIntro ?? {}),
    },
    portfolioFilters:
      Array.isArray(content.portfolioFilters) && content.portfolioFilters.length > 0
        ? content.portfolioFilters
        : fallbackContent.portfolioFilters,
    taxonomy,
    models,
    projects: Array.isArray(content.projects) ? content.projects.map(normalizeProject) : [],
    portfolioItems:
      Array.isArray(content.portfolioItems) && content.portfolioItems.length > 0
        ? content.portfolioItems.map(normalizePortfolioItem)
        : fallbackContent.portfolioItems.map(normalizePortfolioItem),
    areas: Array.isArray(content.areas) && content.areas.length > 0 ? content.areas : fallbackContent.areas,
    packages:
      Array.isArray(content.packages) && content.packages.length > 0
        ? content.packages
        : fallbackContent.packages,
    bookingSteps:
      Array.isArray(content.bookingSteps) && content.bookingSteps.length > 0
        ? content.bookingSteps
        : fallbackContent.bookingSteps,
    shootingProcess: normalizeShootingProcess(content.shootingProcess),
    testimonialsIntro: {
      ...fallbackContent.testimonialsIntro,
      ...(content.testimonialsIntro ?? {}),
    },
    testimonials: normalizeTestimonials(content.testimonials),
    inquiryChecklist:
      Array.isArray(content.inquiryChecklist) && content.inquiryChecklist.length > 0
        ? content.inquiryChecklist
        : fallbackContent.inquiryChecklist,
  };
}
