import { useEffect } from "react";

const HANGUL_RE = /[가-힣]/;
const SKIP_SELECTOR = [
  "script",
  "style",
  "noscript",
  "textarea",
  "input",
  "select",
  "option",
  "svg",
  "code",
  "pre",
  "[data-no-translate='true']",
  ".language-switcher",
].join(",");

const EXACT = {
  ja: {
    "포트폴리오": "ポートフォリオ",
    "포트폴리오 보기": "作品を見る",
    "진행 과정": "撮影の流れ",
    "촬영 가이드": "撮影ガイド",
    "후기": "レビュー",
    "협업": "コラボ",
    "연락": "お問い合わせ",
    "협업 문의": "コラボ相談",
    "협업 문의하기": "コラボ相談する",
    "실제 후기 보기": "レビューを見る",
    "사진 교체 영역": "写真表示エリア",
    "관리자 페이지에서 사진을 올리면 이 자리에 표시됩니다.": "管理画面で写真を追加すると、ここに表示されます。",
    "촬영 진행 과정": "撮影の流れ",
    "촬영 문의하기": "撮影相談する",
    "촬영 전 준비 안내": "撮影前の準備",
    "문의할 때 함께 보내면 좋아요": "相談時に送るとスムーズです",
    "준비 내용으로 문의하기": "準備内容で相談する",
    "함께 촬영한 분들의 후기": "撮影レビュー",
    "후기 공유": "レビューを共有",
    "모델 협업 촬영 문의": "モデルコラボ撮影の相談",
    "촬영 일정 안내": "撮影スケジュール",
    "카카오톡 문의": "KakaoTalkで相談",
    "Instagram DM": "Instagram DM",
    "카카오톡 오픈채팅": "KakaoTalkオープンチャット",
    "사진이 필요한 순간을 보내주세요.": "写真が必要な瞬間を教えてください。",
    "촬영 목적, 희망 날짜, 장소를 남겨주시면 확인 후 답변드립니다.": "撮影目的、希望日、場所を送っていただければ確認後に返信します。",
    "촬영 상담 챗봇 닫기": "撮影相談チャットを閉じる",
    "촬영 상담 챗봇 열기": "撮影相談チャットを開く",
    "상담": "相談",
    "궁금한 내용을 입력해보세요": "気になる内容を入力してください",
    "질문 보내기": "質問を送信",
    "빠른 질문": "よくある質問",
    "추천 질문": "おすすめ質問",
    "문의 폼 작성": "相談フォームを書く",
    "이 사진 분위기로 문의하기": "この雰囲気で相談する",
    "Instagram 원본 보기": "Instagramで見る",
    "후기 원본 보기": "レビュー原文を見る",
    "원본/보정본": "元データ/レタッチデータ",
    "문의 방법": "相談方法",
    "상호무페이 협업": "TFPコラボ",
    "촬영 준비": "撮影準備",
    "일정/지역": "日程/エリア",
    "포즈/표정": "ポーズ/表情",
    "촬영 구성": "撮影プラン",
    "촬영 후기": "撮影レビュー",
    "인물": "人物",
    "프로필": "プロフィール",
    "커플": "カップル",
    "여행": "旅行",
    "데일리": "日常",
    "포트폴리오협업": "ポートフォリオコラボ",
    "카페": "カフェ",
    "거리": "街",
    "야외": "屋外",
    "실내": "室内",
    "낮": "昼",
    "밤": "夜",
    "자연광": "自然光",
    "클로즈업": "クローズアップ",
    "전신": "全身",
    "반신": "半身",
    "웨딩무드": "ウェディングムード",
    "한복": "韓服",
    "바다": "海",
    "플라워": "フラワー",
    "시네마틱": "シネマティック",
    "차분한": "落ち着いた",
    "움직임": "動き",
    "네온": "ネオン",
    "반려동물": "ペット",
    "동물스냅": "ペット撮影",
    "촬영기록": "撮影記録",
    "전체": "すべて",
    "서울": "ソウル",
    "경기": "京畿",
    "도쿄": "東京",
    "수도권": "首都圏",
    "일산": "一山",
    "고양": "高陽",
    "마포구": "麻浦区",
    "연남동": "延南洞",
    "홍대입구": "弘大入口",
    "상수동": "上水洞",
    "망원동": "望遠洞",
    "합정동": "合井洞",
    "협의": "相談",
    "장소 미정": "場所未定",
    "위치 확인 필요": "場所確認中",
    "시부야구": "渋谷区",
    "시부야": "渋谷",
    "인물 사진": "ポートレート",
    "커플 스냅": "カップル撮影",
    "프로필 촬영": "プロフィール撮影",
    "여행 스냅": "旅行スナップ",
    "야간 스냅": "夜の撮影",
    "카페 촬영": "カフェ撮影",
    "동물 스냅": "ペット撮影",
    "Instagram 공개 사진 아카이브": "Instagram公開写真アーカイブ",
    "위치 확인 필요": "場所確認中",
    "도심 인물 스냅": "街のポートレート",
    "야간 스냅": "夜のポートレート",
    "도쿄 스냅": "東京スナップ",
    "프로필 촬영": "プロフィール撮影",
    "여행 스냅": "旅行スナップ",
    "커플 스냅": "カップル撮影",
  },
  en: {
    "포트폴리오": "Portfolio",
    "포트폴리오 보기": "View Portfolio",
    "진행 과정": "Process",
    "촬영 가이드": "Guide",
    "후기": "Reviews",
    "협업": "Collaboration",
    "연락": "Contact",
    "협업 문의": "Collaboration",
    "협업 문의하기": "Ask About Collaboration",
    "실제 후기 보기": "Read Reviews",
    "사진 교체 영역": "Photo Area",
    "관리자 페이지에서 사진을 올리면 이 자리에 표시됩니다.": "Photos added in the admin page will appear here.",
    "촬영 진행 과정": "How the Shoot Works",
    "촬영 문의하기": "Inquire About a Shoot",
    "촬영 전 준비 안내": "Before the Shoot",
    "문의할 때 함께 보내면 좋아요": "Helpful to Send With Your Inquiry",
    "준비 내용으로 문의하기": "Start With This Checklist",
    "함께 촬영한 분들의 후기": "Client Reviews",
    "후기 공유": "Share Reviews",
    "모델 협업 촬영 문의": "Model Collaboration Inquiry",
    "촬영 일정 안내": "Shooting Schedule",
    "카카오톡 문의": "KakaoTalk Inquiry",
    "Instagram DM": "Instagram DM",
    "카카오톡 오픈채팅": "KakaoTalk Open Chat",
    "사진이 필요한 순간을 보내주세요.": "Tell me about the moment you want photographed.",
    "촬영 목적, 희망 날짜, 장소를 남겨주시면 확인 후 답변드립니다.": "Send your purpose, preferred date, and location, and I will reply after checking.",
    "촬영 상담 챗봇 닫기": "Close shoot assistant",
    "촬영 상담 챗봇 열기": "Open shoot assistant",
    "상담": "Chat",
    "궁금한 내용을 입력해보세요": "Type your question",
    "질문 보내기": "Send question",
    "빠른 질문": "Quick questions",
    "추천 질문": "Suggested questions",
    "문의 폼 작성": "Fill Out Inquiry Form",
    "이 사진 분위기로 문의하기": "Ask About This Mood",
    "Instagram 원본 보기": "View on Instagram",
    "후기 원본 보기": "View Original Review",
    "원본/보정본": "Originals / Edited Files",
    "문의 방법": "How to Inquire",
    "상호무페이 협업": "TFP Collaboration",
    "촬영 준비": "Shoot Preparation",
    "일정/지역": "Schedule / Area",
    "포즈/표정": "Pose / Expression",
    "촬영 구성": "Shoot Options",
    "촬영 후기": "Review",
    "인물": "Portrait",
    "프로필": "Profile",
    "커플": "Couple",
    "여행": "Travel",
    "데일리": "Daily",
    "포트폴리오협업": "Portfolio Collaboration",
    "카페": "Cafe",
    "거리": "Street",
    "야외": "Outdoor",
    "실내": "Indoor",
    "낮": "Day",
    "밤": "Night",
    "자연광": "Natural Light",
    "클로즈업": "Close-up",
    "전신": "Full Body",
    "반신": "Half Body",
    "웨딩무드": "Wedding Mood",
    "한복": "Hanbok",
    "바다": "Sea",
    "플라워": "Flower",
    "시네마틱": "Cinematic",
    "차분한": "Calm",
    "움직임": "Movement",
    "네온": "Neon",
    "반려동물": "Pet",
    "동물스냅": "Pet Snap",
    "촬영기록": "Shoot Log",
    "전체": "All",
    "서울": "Seoul",
    "경기": "Gyeonggi",
    "도쿄": "Tokyo",
    "수도권": "Capital Area",
    "일산": "Ilsan",
    "고양": "Goyang",
    "마포구": "Mapo-gu",
    "연남동": "Yeonnam-dong",
    "홍대입구": "Hongdae Entrance",
    "상수동": "Sangsu-dong",
    "망원동": "Mangwon-dong",
    "합정동": "Hapjeong-dong",
    "협의": "By Arrangement",
    "장소 미정": "Location TBD",
    "위치 확인 필요": "Location TBD",
    "시부야구": "Shibuya City",
    "시부야": "Shibuya",
    "인물 사진": "Portrait",
    "커플 스냅": "Couple Snap",
    "프로필 촬영": "Profile Shoot",
    "여행 스냅": "Travel Snap",
    "야간 스냅": "Night Snap",
    "카페 촬영": "Cafe Shoot",
    "동물 스냅": "Pet Snap",
    "Instagram 공개 사진 아카이브": "Instagram Public Photo Archive",
    "도심 인물 스냅": "City Portrait",
    "야간 스냅": "Night Portrait",
    "도쿄 스냅": "Tokyo Snap",
  },
};

const PHRASES = {
  ja: [
    ["서울·수도권", "ソウル・首都圏"],
    ["서울과 수도권", "ソウルと首都圏"],
    ["도쿄 촬영", "東京撮影"],
    ["촬영", "撮影"],
    ["문의", "相談"],
    ["희망 날짜", "希望日"],
    ["장소", "場所"],
    ["목적", "目的"],
    ["분위기", "雰囲気"],
    ["참고 이미지", "参考画像"],
    ["보정", "レタッチ"],
    ["원본", "元データ"],
    ["전달", "お渡し"],
    ["작가", "フォトグラファー"],
    ["모델", "モデル"],
    ["협업", "コラボ"],
    ["가능", "可能"],
    ["사진", "写真"],
    ["자연스러운", "自然な"],
    ["프로필", "プロフィール"],
    ["커플", "カップル"],
    ["여행", "旅行"],
  ],
  en: [
    ["서울·수도권", "Seoul / Capital Area"],
    ["서울과 수도권", "Seoul and the capital area"],
    ["도쿄 촬영", "Tokyo shoot"],
    ["촬영", "shoot"],
    ["문의", "inquiry"],
    ["희망 날짜", "preferred date"],
    ["장소", "location"],
    ["목적", "purpose"],
    ["분위기", "mood"],
    ["참고 이미지", "reference images"],
    ["보정", "editing"],
    ["원본", "original files"],
    ["전달", "delivery"],
    ["작가", "photographer"],
    ["모델", "model"],
    ["협업", "collaboration"],
    ["가능", "available"],
    ["사진", "photo"],
    ["자연스러운", "natural"],
    ["프로필", "profile"],
    ["커플", "couple"],
    ["여행", "travel"],
  ],
};

function getLanguageFromPath() {
  const segment = window.location.pathname.split("/").filter(Boolean)[0];
  if (["ja", "en"].includes(segment)) return segment;
  return "ko";
}

function withOriginalWhitespace(original, translated) {
  const prefix = original.match(/^\s*/)?.[0] || "";
  const suffix = original.match(/\s*$/)?.[0] || "";
  return `${prefix}${translated}${suffix}`;
}

function normalizeText(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function translateKnown(text, language) {
  const normalized = normalizeText(text);
  const exact = EXACT[language]?.[normalized];
  if (exact) return withOriginalWhitespace(text, exact);

  let translated = normalized;
  const phraseList = PHRASES[language] || [];
  phraseList.forEach(([source, target]) => {
    translated = translated.replaceAll(source, target);
  });

  Object.entries(EXACT[language] || {})
    .sort((a, b) => b[0].length - a[0].length)
    .forEach(([source, target]) => {
      translated = translated.replaceAll(source, target);
    });

  return withOriginalWhitespace(text, translated);
}

function fallbackForElement(element, language) {
  const isJa = language === "ja";
  if (element?.closest(".portfolio-card, .portfolio-modal, .photo-frame")) {
    if (element.matches?.("h1, h2, h3") || element.parentElement?.matches?.("h1, h2, h3")) {
      return isJa ? "ポートレート撮影" : "Portrait Session";
    }
    return isJa ? "自然なポートレート撮影の記録です。" : "A natural portrait session from the portfolio.";
  }

  if (element?.closest(".review-card, .review-modal, .reviews-section")) {
    return isJa ? "撮影レビューです。" : "Client review from a previous shoot.";
  }

  if (element?.closest(".inquiry-form, .collab-section, .contact-section")) {
    return isJa ? "撮影内容を送っていただければ確認後に返信します。" : "Send your shoot details and I will reply after checking.";
  }

  if (element?.closest(".filter-row, .portfolio-modal-tags")) {
    return isJa ? "その他" : "Other";
  }

  if (element?.matches?.("h1, h2, h3") || element?.parentElement?.matches?.("h1, h2, h3")) {
    return isJa ? "ポートレート撮影" : "Portrait Photography";
  }

  return isJa ? "詳しくはお問い合わせください。" : "Please contact me for details.";
}

function translateNodeText(node, language) {
  const original = node.nodeValue;
  if (!HANGUL_RE.test(original)) return;

  const parent = node.parentElement;
  if (!parent || parent.closest(SKIP_SELECTOR)) return;

  const known = translateKnown(original, language);
  if (!HANGUL_RE.test(known)) {
    node.nodeValue = known;
    return;
  }

  node.nodeValue = withOriginalWhitespace(original, fallbackForElement(parent, language));
}

function translateAttributes(element, language) {
  ["placeholder", "aria-label", "title", "alt"].forEach((attribute) => {
    const value = element.getAttribute?.(attribute);
    if (!value || !HANGUL_RE.test(value)) return;
    const known = translateKnown(value, language);
    element.setAttribute(attribute, HANGUL_RE.test(known) ? fallbackForElement(element, language) : known.trim());
  });
}

function walkAndClean(root, language) {
  if (!root || language === "ko") return;

  if (root.nodeType === Node.ELEMENT_NODE) {
    if (root.closest?.(SKIP_SELECTOR)) return;
    translateAttributes(root, language);
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
    acceptNode(node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        return node.closest?.(SKIP_SELECTOR) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
      if (node.parentElement?.closest(SKIP_SELECTOR)) return NodeFilter.FILTER_REJECT;
      return HANGUL_RE.test(node.nodeValue || "") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    },
  });

  let current = walker.currentNode;
  while (current) {
    if (current.nodeType === Node.TEXT_NODE) translateNodeText(current, language);
    if (current.nodeType === Node.ELEMENT_NODE) translateAttributes(current, language);
    current = walker.nextNode();
  }
}

export default function LocaleNoHangulGuard() {
  useEffect(() => {
    const language = getLanguageFromPath();
    if (language === "ko") return undefined;

    const run = () => walkAndClean(document.body, language);
    run();
    const observer = new MutationObserver((mutations) => {
      window.requestAnimationFrame(() => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => walkAndClean(node, language));
          if (mutation.type === "characterData") translateNodeText(mutation.target, language);
        });
        run();
      });
    });

    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    const interval = window.setInterval(run, 1200);

    return () => {
      observer.disconnect();
      window.clearInterval(interval);
    };
  }, []);

  return null;
}
