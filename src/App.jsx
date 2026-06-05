import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarCheck,
  Camera,
  CheckCircle2,
  ExternalLink,
  FolderOpen,
  Heart,
  MapPin,
  Menu,
  MessageCircle,
  Send,
  Share2,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { fallbackContent, normalizeContent } from "./siteContent";

const CONTACT = {
  instagramHandle: "@365daily.snap",
  instagramUrl: "https://www.instagram.com/365daily.snap/",
  kakaoOpenChatUrl: "https://open.kakao.com/o/sV8I6vmi",
  kakaoOpenChatLabel: "카카오톡 오픈채팅",
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const PROCESS_ICONS = {
  message: MessageCircle,
  calendar: CalendarCheck,
  camera: Camera,
  folder: FolderOpen,
  check: CheckCircle2,
  heart: Heart,
  sliders: SlidersHorizontal,
  send: Send,
};

const PROCESS_ICON_SEQUENCE = ["message", "calendar", "camera", "folder", "check", "heart", "sliders", "send"];

const PREP_GUIDE_ITEMS = [
  {
    icon: "folder",
    title: "원하는 분위기",
    description: "마음에 드는 사진, 색감, 포즈를 3~5장 정도 모아두면 촬영 방향을 빠르게 잡을 수 있어요.",
  },
  {
    icon: "heart",
    title: "의상",
    description: "움직이기 편하고 본인 분위기와 잘 맞는 옷을 추천해요. 고민된다면 1~2벌을 함께 준비해도 좋습니다.",
  },
  {
    icon: "sliders",
    title: "헤어 / 메이크업",
    description: "과하게 바꾸기보다 평소보다 조금 정돈된 느낌이면 충분해요. 피부 표현은 보정에서 자연스럽게 맞춥니다.",
  },
  {
    icon: "camera",
    title: "소품",
    description: "꽃, 책, 헤드폰처럼 익숙한 물건이 있으면 손 위치와 시선이 편해져 자연스러운 컷을 만들기 좋아요.",
  },
  {
    icon: "calendar",
    title: "촬영 당일",
    description: "약속 시간보다 조금 여유 있게 도착하면 표정과 분위기가 훨씬 편해집니다.",
  },
  {
    icon: "check",
    title: "사진 사용 범위",
    description: "SNS 업로드, 포트폴리오 공개, 비공개 요청 등 사용 범위는 촬영 전에 편하게 조율할 수 있어요.",
  },
];

const CHATBOT_STARTERS = [
  "처음인데 어떻게 문의하면 돼요?",
  "상호무페이 협업 가능해요?",
  "주말이나 퇴근 후 촬영 가능해요?",
  "어떤 장소가 잘 어울릴까요?",
  "사진이 어색해도 괜찮나요?",
  "보정본은 어떻게 받아요?",
];

const CHATBOT_TOPICS = [
  {
    id: "inquiry",
    label: "문의 방법",
    keywords: ["문의", "예약", "신청", "연락", "상담", "촬영문의", "어떻게", "처음", "방법", "폼"],
    answer:
      "처음 문의하신다면 이름/닉네임, 연락 받을 방법, 희망 날짜, 촬영 목적, 원하는 분위기만 먼저 보내주시면 충분해요. 장소나 콘셉트가 아직 정해지지 않아도 대화하면서 같이 정리할 수 있습니다.",
    ctaLabel: "문의 폼 작성하기",
    ctaHref: "#collab",
    ctaExternal: false,
    suggestions: ["상호무페이도 가능한가요?", "가능한 날짜는 어떻게 고르면 돼요?", "참고 사진도 보내도 되나요?"],
  },
  {
    id: "collab",
    label: "상호무페이 협업",
    keywords: ["상호무페이", "무페이", "tfp", "협업", "모델", "포트폴리오", "일반인", "모델구함", "컨셉촬영"],
    answer:
      "상호무페이/TFP 협업 촬영도 진행합니다. 서로 필요한 포트폴리오 방향이 맞는지 먼저 확인하고, 콘셉트·일정·장소·사진 사용 범위를 촬영 전에 정리해요.",
    ctaLabel: "협업 문의하기",
    ctaHref: "#collab",
    ctaExternal: false,
    suggestions: ["사진 사용 범위는 어떻게 정해요?", "촬영 전에 뭘 준비하면 좋나요?", "후기를 볼 수 있나요?"],
  },
  {
    id: "prep",
    label: "촬영 준비",
    keywords: ["준비", "의상", "옷", "레퍼런스", "참고", "컨셉", "콘셉트", "헤어", "메이크업", "소품"],
    answer:
      "촬영 전에는 원하는 분위기, 참고 이미지 3~5장, 의상 1~2벌 정도만 준비해도 좋아요. 과하게 꾸미기보다 본인에게 익숙한 분위기를 기준으로 잡으면 사진이 더 편하게 나옵니다.",
    ctaLabel: "촬영 전 준비 안내 보기",
    ctaHref: "#guide",
    ctaExternal: false,
    suggestions: ["의상은 몇 벌 준비하면 돼요?", "포즈가 어색하면 어떡해요?", "장소 추천도 받을 수 있나요?"],
  },
  {
    id: "delivery",
    label: "원본/보정본",
    keywords: ["보정", "셀렉", "원본", "전달", "구글", "드라이브", "보정본", "파일", "사진받기", "기간"],
    answer:
      "요청 시 촬영 원본 전체를 먼저 전달드릴 수 있어요. 이후 작가가 1차 후보를 정리하고, 모델이 원하는 컷을 고른 뒤 색감·피부·분위기를 자연스럽게 보정합니다. 최종본은 Google Drive 또는 카카오톡 오픈채팅으로 전달드려요.",
    ctaLabel: "촬영 프로세스 보기",
    ctaHref: "#process",
    ctaExternal: false,
    suggestions: ["원본 전체도 받을 수 있나요?", "보정은 자연스럽게 되나요?", "촬영 과정이 궁금해요"],
  },
  {
    id: "schedule",
    label: "일정/지역",
    keywords: ["지역", "장소", "서울", "수도권", "도쿄", "마포", "성수", "홍대", "일산", "고양", "시간", "일정", "주말", "평일", "퇴근", "저녁", "공휴일"],
    answer:
      "촬영은 서울·수도권을 중심으로 진행하고, 일산·고양 지역도 편하게 문의하실 수 있어요. 주말과 공휴일, 평일 저녁 촬영을 중심으로 운영하며 그 외 지역이나 시간대는 일정에 따라 조율합니다.",
    ctaLabel: "가능한 날짜 남기기",
    ctaHref: "#collab",
    ctaExternal: false,
    suggestions: ["장소 추천도 받을 수 있나요?", "평일 낮도 가능할까요?", "서울숲이나 한강 촬영은 어때요?"],
  },
  {
    id: "pose",
    label: "포즈/표정",
    keywords: ["어색", "포즈", "처음", "긴장", "표정", "못찍", "부담", "낯가림", "자연스럽게", "얼굴"],
    answer:
      "사진이 어색한 분도 괜찮아요. 정해진 포즈를 억지로 만들기보다 걷기, 시선, 손 위치처럼 작은 움직임부터 안내합니다. 편안한 얼굴이 남는 시간을 만드는 쪽에 더 가깝게 촬영해요.",
    ctaLabel: "이 분위기로 문의하기",
    ctaHref: "#collab",
    ctaExternal: false,
    suggestions: ["처음 촬영이면 뭘 준비해요?", "포트폴리오를 보고 싶어요", "후기를 볼 수 있나요?"],
  },
  {
    id: "price",
    label: "촬영 구성",
    keywords: ["가격", "비용", "유료", "금액", "얼마", "페이", "돈", "촬영비", "구성"],
    answer:
      "촬영 구성은 목적, 시간, 장소 이동, 보정 범위에 따라 달라집니다. 상호무페이 협업과 유료 촬영 문의를 모두 구분해서 받고 있으니, 문의 폼에서 촬영 형태를 선택해주시면 상황에 맞게 안내드릴게요.",
    ctaLabel: "촬영 형태 선택하기",
    ctaHref: "#collab",
    ctaExternal: false,
    suggestions: ["상호무페이도 가능한가요?", "어떤 정보를 보내야 하나요?", "촬영 시간은 얼마나 걸려요?"],
  },
  {
    id: "reviews",
    label: "후기",
    keywords: ["후기", "리뷰", "믿을", "신뢰", "평가", "촬영후기", "실제", "경험"],
    answer:
      "후기 섹션에서 실제 함께 촬영한 분들의 리뷰와 원본 캡처를 볼 수 있어요. 촬영 분위기, 소통 방식, 결과물에 대한 느낌을 확인하기 좋습니다.",
    ctaLabel: "후기 보기",
    ctaHref: "#reviews",
    ctaExternal: false,
    suggestions: ["촬영 과정도 볼 수 있나요?", "포즈가 어색해도 괜찮나요?", "문의하려면 뭘 보내요?"],
  },
  {
    id: "portfolio",
    label: "포트폴리오",
    keywords: ["포트폴리오", "사진", "작업", "예시", "샘플", "결과물", "필터", "태그", "카페", "야간", "한복", "바다", "프로필"],
    answer:
      "포트폴리오에서는 인물, 프로필, 카페, 거리, 야외, 실내, 낮, 밤, 자연광, 클로즈업 같은 태그로 사진을 나눠볼 수 있어요. 마음에 드는 사진이 있다면 문의할 때 함께 알려주시면 콘셉트 잡기가 쉬워집니다.",
    ctaLabel: "포트폴리오 보기",
    ctaHref: "#portfolio",
    ctaExternal: false,
    suggestions: ["카페 사진만 볼 수 있나요?", "밤 촬영도 가능해요?", "이런 분위기로 문의하고 싶어요"],
  },
  {
    id: "privacy",
    label: "사진 공개 범위",
    keywords: ["비공개", "공개", "업로드", "sns", "인스타", "초상권", "사용범위", "사용", "저작권", "공유"],
    answer:
      "사진 공개 범위는 촬영 전에 조율할 수 있어요. SNS 공개 가능 여부, 포트폴리오 사용 여부, 비공개 요청처럼 민감한 부분은 문의 단계에서 편하게 남겨주세요.",
    ctaLabel: "사용 범위 남기기",
    ctaHref: "#collab",
    ctaExternal: false,
    suggestions: ["비공개 촬영도 가능한가요?", "후보정 후 공유 가능한가요?", "문의 폼을 작성하고 싶어요"],
  },
];

const CHATBOT_FALLBACK =
  "질문을 완전히 이해하진 못했지만 촬영 목적, 희망 날짜, 장소, 원하는 분위기를 알려주시면 바로 상담으로 이어갈 수 있어요. 아래 질문 중 가까운 내용을 눌러도 됩니다.";

function getChatbotReply(question) {
  const normalizedQuestion = question.replace(/\s/g, "").toLowerCase();
  const scoredTopics = CHATBOT_TOPICS.map((topic) => {
    const score = topic.keywords.reduce((total, keyword) => {
      const normalizedKeyword = keyword.replace(/\s/g, "").toLowerCase();
      if (!normalizedKeyword || !normalizedQuestion.includes(normalizedKeyword)) {
        return total;
      }
      return total + Math.max(2, normalizedKeyword.length);
    }, 0);
    return { ...topic, score };
  }).sort((a, b) => b.score - a.score);
  const topic = scoredTopics[0]?.score > 0 ? scoredTopics[0] : null;

  return {
    text: topic?.answer || CHATBOT_FALLBACK,
    ctaLabel: topic?.ctaLabel || "문의 폼 작성하기",
    ctaHref: topic?.ctaHref || "#collab",
    ctaExternal: topic?.ctaExternal ?? false,
    suggestions: topic?.suggestions || ["처음인데 어떻게 문의하면 돼요?", "촬영 전에 뭘 준비하면 좋나요?", "포트폴리오를 보고 싶어요"],
    intentLabel: topic?.label || "상담 안내",
  };
}

function InstagramIcon({ className = "icon" }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="4.1" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17.35" cy="6.65" r="1.1" fill="currentColor" />
    </svg>
  );
}

function isVideo(src = "") {
  return /\.(mp4|m4v|mov|webm|ogg)(\?|#|$)/i.test(src);
}

function buildPortfolioItems(content = {}) {
  if (Array.isArray(content.projects) && content.projects.length > 0) {
    return content.projects.flatMap((project) =>
      (project.media || [])
        .filter((media) => media.src)
        .map((media, index) => ({
          category: project.category || "Portrait",
          title: media.caption || project.title || "365 Daily Snap",
          description: media.caption || project.description || project.subtitle || "",
          image: media.src,
          type: media.type || (isVideo(media.src) ? "video" : "image"),
          tags: Array.from(new Set([...(project.tags || []), ...(media.tags || [])].filter(Boolean))),
          models: Array.from(new Set([...(project.models || []), ...(media.models || [])].filter(Boolean))),
          location: media.location || project.location || {},
          projectTitle: project.title,
          instagramUrl: media.instagramUrl || project.instagramUrl || "",
          key: `${project.id || project.title}-${index}`,
        })),
    );
  }

  return (content.portfolioItems || []).map((item, index) => ({
    ...item,
    type: "image",
    key: `${item.category}-${index}`,
  }));
}

function getLocationLabel(location = {}) {
  return [location.city, location.district, location.place].filter(Boolean).join(" · ");
}

function PhotoFrame({ item, className = "", loading = "lazy" }) {
  const hasMedia = Boolean(item?.image);

  return (
    <figure className={`photo-frame ${className}`} data-protected-media={hasMedia ? "true" : undefined}>
      {hasMedia && item.type === "video" ? (
        <>
          <video
            src={item.image}
            aria-label={`${item.category} - ${item.title}`}
            className="protected-media"
            controls={false}
            controlsList="nodownload noplaybackrate"
            disablePictureInPicture
            loop
            muted
            playsInline
            preload="metadata"
            autoPlay
          />
          <span className="media-badge">Video</span>
          <span className="photo-watermark">© 365 Daily Snap</span>
        </>
      ) : hasMedia ? (
        <>
          <img src={item.image} alt={`${item.category} - ${item.title}`} loading={loading} draggable="false" className="protected-media" />
          <span className="photo-watermark">© 365 Daily Snap</span>
        </>
      ) : (
        <div className="photo-placeholder">
          <span>365 Daily Snap</span>
          <strong>사진 교체 영역</strong>
          <p>관리자 페이지에서 사진을 올리면 이 자리에 표시됩니다.</p>
        </div>
      )}
    </figure>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <motion.div className="section-heading" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </motion.div>
  );
}

function ProcessCard({ step, index }) {
  const iconKey = step.icon || PROCESS_ICON_SEQUENCE[index] || "message";
  const Icon = PROCESS_ICONS[iconKey] || MessageCircle;

  return (
    <motion.article
      className="process-card"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-70px" }}
      variants={fadeUp}
      transition={{ duration: 0.28, delay: index * 0.035, ease: "easeOut" }}
    >
      <div className="process-card-top">
        <span className="process-number">{step.number}</span>
        <span className="process-icon" aria-hidden="true">
          <Icon className="icon" />
        </span>
      </div>
      <h3>{step.title}</h3>
      <p>{step.description}</p>
    </motion.article>
  );
}

function PrepGuideCard({ item }) {
  const Icon = PROCESS_ICONS[item.icon] || CheckCircle2;

  return (
    <motion.article className="prep-card" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp}>
      <span className="prep-icon" aria-hidden="true">
        <Icon className="icon" />
      </span>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
    </motion.article>
  );
}

function PortfolioModal({ item, onClose }) {
  if (!item) {
    return null;
  }

  const locationLabel = getLocationLabel(item.location);
  const hasMapPoint =
    item.location?.lat !== "" &&
    item.location?.lng !== "" &&
    item.location?.lat != null &&
    item.location?.lng != null &&
    Number.isFinite(Number(item.location.lat)) &&
    Number.isFinite(Number(item.location.lng));
  const mapUrl = hasMapPoint ? `https://www.google.com/maps?q=${item.location.lat},${item.location.lng}` : "";

  return (
    <div className="modal-backdrop portfolio-backdrop" role="presentation" onClick={onClose}>
      <motion.div
        className="portfolio-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`${item.title} 상세 보기`}
        onClick={(event) => event.stopPropagation()}
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        <div className="portfolio-modal-media-shell" data-protected-media="true">
          {item.type === "video" ? (
            <video
              src={item.image}
              className="portfolio-modal-media"
              controls
              controlsList="nodownload noplaybackrate"
              disablePictureInPicture
              playsInline
              preload="metadata"
            />
          ) : (
            <img src={item.image} alt={`${item.category} - ${item.title}`} draggable="false" className="portfolio-modal-media" />
          )}
          <span className="photo-watermark">© 365 Daily Snap</span>
        </div>

        <aside className="portfolio-modal-info">
          <div className="modal-header compact">
            <div>
              <p className="eyebrow">{item.category}</p>
              <h2>{item.title}</h2>
            </div>
            <button type="button" onClick={onClose} aria-label="포트폴리오 상세 닫기" className="icon-button">
              <X className="icon" />
            </button>
          </div>

          <div className="portfolio-modal-body">
            {item.description ? <p>{item.description}</p> : null}
            {item.projectTitle ? (
              <dl>
                <dt>Project</dt>
                <dd>{item.projectTitle}</dd>
              </dl>
            ) : null}
            {locationLabel ? (
              <dl>
                <dt>Location</dt>
                <dd>
                  {hasMapPoint ? (
                    <a href={mapUrl} target="_blank" rel="noreferrer">
                      <MapPin className="icon" />
                      {locationLabel}
                    </a>
                  ) : (
                    <span>
                      <MapPin className="icon" />
                      {locationLabel}
                    </span>
                  )}
                </dd>
              </dl>
            ) : null}
            {item.models?.length ? (
              <dl>
                <dt>Model</dt>
                <dd>{item.models.map((model) => (model.startsWith("@") ? model : `@${model}`)).join(", ")}</dd>
              </dl>
            ) : null}
            {item.tags?.length ? (
              <div className="portfolio-modal-tags" aria-label="사진 태그">
                {item.tags.slice(0, 10).map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="portfolio-modal-actions">
            <a href={CONTACT.kakaoOpenChatUrl} target="_blank" rel="noreferrer" className="primary-button">
              이 사진 분위기로 문의하기
              <MessageCircle className="icon" />
            </a>
            <a href="#collab" onClick={onClose} className="secondary-button">
              문의 폼 작성
              <ArrowRight className="icon" />
            </a>
            {item.instagramUrl ? (
              <a href={item.instagramUrl} target="_blank" rel="noreferrer" className="text-button">
                Instagram 원본 보기
                <ExternalLink className="icon" />
              </a>
            ) : null}
          </div>
        </aside>
      </motion.div>
    </div>
  );
}

function ReviewCard({ review, onOpen }) {
  return (
    <motion.article className="review-card" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp}>
      <div className="review-meta">
        <span>{review.type}</span>
        {review.date ? <span>{review.date}</span> : null}
      </div>
      <blockquote>{review.content}</blockquote>
      <div className="review-footer">
        <div>
          <strong>{review.name}</strong>
          {review.handle && review.handle !== review.name ? <span>{review.handle}</span> : null}
        </div>
        {review.reviewImage ? (
          <button type="button" onClick={() => onOpen(review)} className="text-button">
            후기 원본 보기
            <ExternalLink className="icon" />
          </button>
        ) : null}
      </div>
    </motion.article>
  );
}

function ReviewModal({ review, onClose }) {
  if (!review) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <motion.div
        className="review-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`${review.name} 후기 원본`}
        onClick={(event) => event.stopPropagation()}
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">Original Review</p>
            <h2>{review.name}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="후기 원본 닫기" className="icon-button">
            <X className="icon" />
          </button>
        </div>
        <img src={review.reviewImage} alt={review.imageAlt || `${review.name} 후기 원본 캡처`} className="review-original" />
      </motion.div>
    </div>
  );
}

const CONTACT_FIELDS = [
  { key: "instagram", label: "Instagram ID", placeholder: "@your_id" },
  { key: "phone", label: "핸드폰 번호", placeholder: "010-0000-0000" },
  { key: "kakaoId", label: "카카오톡 ID", placeholder: "카카오톡 ID" },
  { key: "email", label: "이메일", placeholder: "name@example.com" },
];

const CONTACT_METHOD_OPTIONS = [
  { method: "Instagram DM", fieldKey: "instagram" },
  { method: "카카오톡", fieldKey: "kakaoId" },
  { method: "전화", fieldKey: "phone" },
  { method: "문자", fieldKey: "phone" },
  { method: "이메일", fieldKey: "email" },
];

const TIME_SLOT_OPTIONS = ["오전", "낮", "오후", "해질녘", "저녁", "야간", "평일", "주말"];

const LOCATION_OPTIONS = [
  "서울숲",
  "성수",
  "연남",
  "홍대",
  "망원한강공원",
  "반포대교",
  "잠수교",
  "여의도 한강공원",
  "노들섬",
  "북촌",
  "서촌",
  "익선동",
  "을지로",
  "잠실",
  "올림픽공원",
  "선유도공원",
];

const MOOD_OPTIONS = ["자연스러운", "차분한", "시네마틱", "따뜻한", "도시적인", "필름 느낌", "프로필용", "커플 스냅", "야간 무드"];

const INQUIRY_TYPE_OPTIONS = ["상호무페이 / TFP", "유료 촬영", "상담 후 결정"];

const initialInquiryForm = {
  name: "",
  inquiryType: "",
  instagram: "",
  phone: "",
  kakaoId: "",
  email: "",
  contactPreference: [],
  dates: [],
  dateNote: "",
  timeSlots: [],
  selectedLocations: [],
  customLocation: "",
  departureArea: "",
  mood: [],
  moodNote: "",
  shootPurpose: "",
  people: "1명",
  usage: "",
  privacy: "상담 후 결정",
  message: "",
  referenceImages: [],
};

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, type: file.type, size: file.size, dataUrl: reader.result });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function InquiryForm() {
  const [form, setForm] = useState({ name: "", contact: "", preferredDate: "", area: "", message: "" });
  const [status, setStatus] = useState("");

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("sending");

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          contactMethod: "인스타그램/카카오톡",
          shootType: "모델 포트폴리오 협업",
          people: "1명",
          page: typeof window !== "undefined" ? window.location.href : "",
        }),
      });

      if (!response.ok) {
        throw new Error("failed");
      }

      setForm({ name: "", contact: "", preferredDate: "", area: "", message: "" });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <form className="inquiry-form" onSubmit={handleSubmit}>
      <label>
        이름 / 닉네임
        <input value={form.name} onChange={(event) => updateField("name", event.target.value)} placeholder="성함 또는 닉네임" />
      </label>
      <label>
        인스타그램 ID
        <input value={form.contact} onChange={(event) => updateField("contact", event.target.value)} placeholder="@your_id" />
      </label>
      <label>
        가능한 날짜
        <input value={form.preferredDate} onChange={(event) => updateField("preferredDate", event.target.value)} placeholder="예: 6월 주말 오후" />
      </label>
      <label>
        희망 지역
        <input value={form.area} onChange={(event) => updateField("area", event.target.value)} placeholder="예: 마포, 성수, 한강" />
      </label>
      <label className="wide">
        문의 내용
        <textarea
          value={form.message}
          onChange={(event) => updateField("message", event.target.value)}
          placeholder="원하는 분위기, 촬영 목적, 참고 이미지가 있다면 적어주세요."
        />
      </label>
      <button type="submit" className="primary-button" disabled={status === "sending"}>
        {status === "sending" ? "보내는 중" : "문의 남기기"}
        <ArrowRight className="icon" />
      </button>
      {status === "sent" ? <p className="form-status">문의가 접수됐습니다. 확인 후 연락드릴게요.</p> : null}
      {status === "error" ? <p className="form-status error">저장에 실패했습니다. 카카오톡 오픈채팅 또는 인스타그램 DM으로 보내주세요.</p> : null}
    </form>
  );
}

function ImprovedInquiryForm() {
  const [form, setForm] = useState(initialInquiryForm);
  const [dateInput, setDateInput] = useState("");
  const [fileNotice, setFileNotice] = useState("");
  const [status, setStatus] = useState("");
  const selectedContactFieldKeys = useMemo(
    () =>
      new Set(
        form.contactPreference
          .map((method) => CONTACT_METHOD_OPTIONS.find((option) => option.method === method)?.fieldKey)
          .filter(Boolean),
      ),
    [form.contactPreference],
  );
  const selectedContactFields = useMemo(
    () => CONTACT_FIELDS.filter((field) => selectedContactFieldKeys.has(field.key)),
    [selectedContactFieldKeys],
  );

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleArrayValue = (field, value) => {
    setForm((current) => {
      const list = current[field] || [];

      return {
        ...current,
        [field]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value],
      };
    });
  };

  const addDate = () => {
    if (!dateInput) {
      return;
    }

    setForm((current) => ({
      ...current,
      dates: current.dates.includes(dateInput) ? current.dates : [...current.dates, dateInput].sort(),
    }));
    setDateInput("");
  };

  const removeDate = (date) => {
    setForm((current) => ({ ...current, dates: current.dates.filter((item) => item !== date) }));
  };

  const handleReferenceImages = async (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    const remainingSlots = Math.max(0, 6 - form.referenceImages.length);
    const files = selectedFiles.slice(0, remainingSlots).filter((file) => file.type.startsWith("image/") && file.size <= 10 * 1024 * 1024);

    if (selectedFiles.length > files.length) {
      setFileNotice("이미지는 최대 6장, 장당 10MB 이하로 올릴 수 있어요.");
    } else {
      setFileNotice("");
    }

    const images = await Promise.all(files.map(readFileAsDataUrl));
    setForm((current) => ({ ...current, referenceImages: [...current.referenceImages, ...images].slice(0, 6) }));
    event.target.value = "";
  };

  const removeReferenceImage = (name) => {
    setForm((current) => ({ ...current, referenceImages: current.referenceImages.filter((image) => image.name !== name) }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const contacts = CONTACT_FIELDS.reduce(
      (nextContacts, field) => ({
        ...nextContacts,
        [field.key]: selectedContactFieldKeys.has(field.key) ? form[field.key] : "",
      }),
      {},
    );
    const contactSummary = selectedContactFields
      .map((field) => (form[field.key] ? `${field.label}: ${form[field.key]}` : ""))
      .filter(Boolean)
      .join(" / ");

    if (!form.contactPreference.length) {
      setStatus("missingContactMethod");
      return;
    }

    if (!contactSummary) {
      setStatus("missingContact");
      return;
    }

    setStatus("sending");

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          contact: contactSummary,
          contacts,
          contactMethod: form.contactPreference.length ? form.contactPreference.join(", ") : "연락 가능 수단 전체",
          inquiryType: form.inquiryType,
          shootType: [form.inquiryType, form.shootPurpose].filter(Boolean).join(" / ") || "모델/포트폴리오 촬영 문의",
          preferredDate: [...form.dates, form.dateNote].filter(Boolean).join(" / "),
          preferredDates: form.dates,
          preferredDateNote: form.dateNote,
          preferredTimeSlots: form.timeSlots,
          area: [...form.selectedLocations, form.customLocation].filter(Boolean).join(", "),
          preferredLocations: form.selectedLocations,
          customLocation: form.customLocation,
          departureArea: form.departureArea,
          mood: form.mood,
          moodNote: form.moodNote,
          people: form.people,
          usage: form.usage,
          privacy: form.privacy,
          message: form.message,
          referenceImages: form.referenceImages,
          page: typeof window !== "undefined" ? window.location.href : "",
        }),
      });

      if (!response.ok) {
        throw new Error("failed");
      }

      setForm(initialInquiryForm);
      setDateInput("");
      setFileNotice("");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <form className="inquiry-form improved-inquiry-form" onSubmit={handleSubmit}>
      <div className="form-section wide">
        <div className="form-section-head">
          <span>01</span>
          <div>
            <strong>연락 받을 방법</strong>
            <p>가능한 연락 수단을 여러 개 적어도 괜찮아요.</p>
          </div>
        </div>
        <div className="inquiry-type-field">
          <strong>문의 유형</strong>
          <div className="chip-group inquiry-type-group" aria-label="촬영 문의 유형">
            {INQUIRY_TYPE_OPTIONS.map((type) => (
              <button
                key={type}
                type="button"
                className={form.inquiryType === type ? "is-active" : ""}
                onClick={() => updateField("inquiryType", form.inquiryType === type ? "" : type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        <label>
          이름 / 닉네임
          <input value={form.name} onChange={(event) => updateField("name", event.target.value)} placeholder="성함 또는 닉네임" />
        </label>
        <div className="chip-group contact-method-group" aria-label="선호 연락 수단">
          {CONTACT_METHOD_OPTIONS.map((option) => (
            <button
              key={option.method}
              type="button"
              className={form.contactPreference.includes(option.method) ? "is-active" : ""}
              onClick={() => toggleArrayValue("contactPreference", option.method)}
            >
              {option.method}
            </button>
          ))}
        </div>
        <div className="contact-field-grid">
          {selectedContactFields.map((field) => (
            <label key={field.key}>
              {field.label}
              <input value={form[field.key]} onChange={(event) => updateField(field.key, event.target.value)} placeholder={field.placeholder} />
            </label>
          ))}
        </div>
        {!selectedContactFields.length ? <p className="contact-field-empty">연락 받을 방식을 먼저 선택하면 필요한 입력칸이 열립니다.</p> : null}
      </div>

      <div className="form-section wide">
        <div className="form-section-head">
          <span>02</span>
          <div>
            <strong>가능한 날짜와 시간대</strong>
            <p>주말·공휴일·평일 저녁을 중심으로 후보 날짜를 골라주세요. 그 외 시간은 메모에 적어주시면 확인합니다.</p>
          </div>
        </div>
        <div className="date-picker-row">
          <input type="date" value={dateInput} onChange={(event) => setDateInput(event.target.value)} aria-label="가능한 날짜 선택" />
          <button type="button" className="secondary-button" onClick={addDate}>
            날짜 추가
          </button>
        </div>
        {form.dates.length ? (
          <div className="selected-chip-row" aria-label="선택한 날짜">
            {form.dates.map((date) => (
              <button key={date} type="button" onClick={() => removeDate(date)}>
                {date}
                <X className="icon" />
              </button>
            ))}
          </div>
        ) : null}
        <div className="chip-group" aria-label="가능한 시간대">
          {TIME_SLOT_OPTIONS.map((slot) => (
            <button key={slot} type="button" className={form.timeSlots.includes(slot) ? "is-active" : ""} onClick={() => toggleArrayValue("timeSlots", slot)}>
              {slot}
            </button>
          ))}
        </div>
        <label>
          날짜 메모
          <input value={form.dateNote} onChange={(event) => updateField("dateNote", event.target.value)} placeholder="예: 공휴일 가능, 평일 낮 조율 희망, 퇴근 후 7시 이후" />
        </label>
      </div>

      <div className="form-section wide">
        <div className="form-section-head">
          <span>03</span>
          <div>
            <strong>희망 지역</strong>
            <p>장소를 잘 몰라도 괜찮아요. 가까운 역이나 출발지만 알려주셔도 추천할 수 있어요.</p>
          </div>
        </div>
        <div className="chip-group location-chip-group" aria-label="촬영 선호 위치">
          {LOCATION_OPTIONS.map((location) => (
            <button
              key={location}
              type="button"
              className={form.selectedLocations.includes(location) ? "is-active" : ""}
              onClick={() => toggleArrayValue("selectedLocations", location)}
            >
              {location}
            </button>
          ))}
        </div>
        <label>
          직접 입력
          <input value={form.customLocation} onChange={(event) => updateField("customLocation", event.target.value)} placeholder="예: 마포구 카페, 강남역 근처, 실내 스튜디오" />
        </label>
        <label>
          선택 사항: 출발지 / 가까운 역
          <input value={form.departureArea} onChange={(event) => updateField("departureArea", event.target.value)} placeholder="예: 신촌역 근처, 분당 출발, 마포구 거주" />
        </label>
      </div>

      <div className="form-section wide">
        <div className="form-section-head">
          <span>04</span>
          <div>
            <strong>원하는 분위기와 참고 이미지</strong>
            <p>정확히 정하지 못해도 괜찮아요. 가까운 느낌만 골라주세요.</p>
          </div>
        </div>
        <div className="chip-group" aria-label="원하는 분위기">
          {MOOD_OPTIONS.map((mood) => (
            <button key={mood} type="button" className={form.mood.includes(mood) ? "is-active" : ""} onClick={() => toggleArrayValue("mood", mood)}>
              {mood}
            </button>
          ))}
        </div>
        <div className="contact-field-grid">
          <label>
            촬영 목적
            <input value={form.shootPurpose} onChange={(event) => updateField("shootPurpose", event.target.value)} placeholder="예: 프로필, 포트폴리오, 커플, SNS" />
          </label>
          <label>
            인원 수
            <input value={form.people} onChange={(event) => updateField("people", event.target.value)} placeholder="예: 1명, 2명" />
          </label>
          <label>
            결과물 사용 용도
            <input value={form.usage} onChange={(event) => updateField("usage", event.target.value)} placeholder="예: 인스타 업로드, 모델 포트폴리오, 비공개" />
          </label>
          <label>
            공개 범위
            <select value={form.privacy} onChange={(event) => updateField("privacy", event.target.value)}>
              <option>상담 후 결정</option>
              <option>작가 포트폴리오 공개 가능</option>
              <option>일부 컷만 공개 가능</option>
              <option>비공개 희망</option>
            </select>
          </label>
        </div>
        <label>
          분위기 메모
          <textarea value={form.moodNote} onChange={(event) => updateField("moodNote", event.target.value)} placeholder="원하는 색감, 피하고 싶은 느낌, 참고 계정이나 링크를 적어주세요." />
        </label>
        <label className="reference-upload">
          참고 이미지 업로드
          <input type="file" accept="image/*" multiple onChange={handleReferenceImages} />
          <span>최대 6장, 장당 10MB 이하</span>
        </label>
        {fileNotice ? <p className="form-status">{fileNotice}</p> : null}
        {form.referenceImages.length ? (
          <div className="reference-preview-grid" aria-label="첨부한 참고 이미지">
            {form.referenceImages.map((image) => (
              <figure key={image.name}>
                <img src={image.dataUrl} alt={`${image.name} 참고 이미지`} />
                <figcaption>{image.name}</figcaption>
                <button type="button" onClick={() => removeReferenceImage(image.name)} aria-label={`${image.name} 삭제`}>
                  <X className="icon" />
                </button>
              </figure>
            ))}
          </div>
        ) : null}
      </div>

      <label className="wide">
        추가로 남길 말
        <textarea
          value={form.message}
          onChange={(event) => updateField("message", event.target.value)}
          placeholder="촬영에서 걱정되는 점, 꼭 원하는 컷, 일정 관련 메모를 자유롭게 적어주세요."
        />
      </label>
      <button type="submit" className="primary-button" disabled={status === "sending"}>
        {status === "sending" ? "문의 보내는 중" : "촬영 문의 보내기"}
        <ArrowRight className="icon" />
      </button>
      {status === "missingContactMethod" ? <p className="form-status error">연락 받을 방식을 하나 이상 선택해주세요.</p> : null}
      {status === "missingContact" ? <p className="form-status error">연락 받을 수단을 하나 이상 입력해주세요.</p> : null}
      {status === "sent" ? <p className="form-status">문의가 접수되었습니다. 확인 후 연락드릴게요.</p> : null}
      {status === "error" ? <p className="form-status error">저장에 실패했습니다. 카카오톡 오픈채팅 또는 Instagram DM으로 보내주세요.</p> : null}
    </form>
  );
}

function ChatbotWidget({ portfolioCount, reviewCount }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "안녕하세요. 촬영 방식, 협업 문의, 보정본 전달, 준비물처럼 자주 묻는 내용을 바로 안내드릴게요.",
    },
  ]);
  const messageListRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messageListRef.current?.scrollTo({ top: messageListRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const sendMessage = (text) => {
    const question = text.trim();

    if (!question) {
      return;
    }

    const reply = getChatbotReply(question);

    setMessages((current) => [
      ...current,
      { role: "user", text: question },
      { role: "bot", ...reply },
    ]);
    setInput("");
    setIsOpen(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(input);
  };

  return (
    <aside className={`chatbot ${isOpen ? "is-open" : ""}`} aria-label="촬영 상담 챗봇">
      {isOpen ? (
        <motion.div
          className="chatbot-panel"
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <div className="chatbot-header">
            <div>
              <span>365 Daily Snap</span>
              <strong>촬영 상담 도우미</strong>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="챗봇 닫기" className="chatbot-close">
              <X className="icon" />
            </button>
          </div>

          <div className="chatbot-summary" aria-label="사이트 요약">
            <span>{portfolioCount} photos</span>
            <span>{reviewCount} reviews</span>
            <span>Seoul / Capital Area</span>
          </div>

          <div className="chatbot-messages" ref={messageListRef} aria-live="polite">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`chatbot-message ${message.role}`}>
                {message.intentLabel ? <span className="chatbot-message-intent">{message.intentLabel}</span> : null}
                <p>{message.text}</p>
                {message.ctaHref ? (
                  <a
                    href={message.ctaHref}
                    target={message.ctaExternal ? "_blank" : undefined}
                    rel={message.ctaExternal ? "noreferrer" : undefined}
                    className="chatbot-message-cta"
                    onClick={() => {
                      if (!message.ctaExternal) {
                        setIsOpen(false);
                      }
                    }}
                  >
                    {message.ctaLabel}
                    <ArrowRight className="icon" />
                  </a>
                ) : null}
                {message.suggestions?.length ? (
                  <div className="chatbot-suggestions" aria-label="추천 질문">
                    {message.suggestions.map((suggestion) => (
                      <button key={suggestion} type="button" onClick={() => sendMessage(suggestion)}>
                        {suggestion}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="chatbot-starters" aria-label="빠른 질문">
            {CHATBOT_STARTERS.map((starter) => (
              <button key={starter} type="button" onClick={() => sendMessage(starter)}>
                {starter}
              </button>
            ))}
          </div>

          <form className="chatbot-form" onSubmit={handleSubmit}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="궁금한 내용을 입력해보세요"
              aria-label="챗봇 질문 입력"
            />
            <button type="submit" aria-label="질문 보내기">
              <Send className="icon" />
            </button>
          </form>

          <div className="chatbot-actions">
            <a href={CONTACT.kakaoOpenChatUrl} target="_blank" rel="noreferrer">
              카카오톡 문의
            </a>
            <a href={CONTACT.instagramUrl} target="_blank" rel="noreferrer">
              Instagram DM
            </a>
          </div>
        </motion.div>
      ) : null}

      <button
        type="button"
        className="chatbot-toggle"
        onClick={() => setIsOpen((value) => !value)}
        aria-label={isOpen ? "촬영 상담 챗봇 닫기" : "촬영 상담 챗봇 열기"}
        aria-expanded={isOpen}
      >
        <MessageCircle className="icon" />
        <span>상담</span>
      </button>
    </aside>
  );
}

function App() {
  const [content, setContent] = useState(() => normalizeContent(fallbackContent));
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("전체");
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);

  const portfolioItems = useMemo(() => buildPortfolioItems(content), [content]);

  const filters = useMemo(() => {
    const itemTags = portfolioItems.flatMap((item) => item.tags || []);
    const preferredFilters = Array.isArray(content.portfolioFilters) ? content.portfolioFilters : [];
    return Array.from(new Set(["전체", ...preferredFilters, ...itemTags].filter(Boolean)));
  }, [content.portfolioFilters, portfolioItems]);

  const visiblePortfolioItems = useMemo(
    () =>
      activeFilter === "전체"
        ? portfolioItems
        : portfolioItems.filter((item) => item.tags?.includes(activeFilter)),
    [activeFilter, portfolioItems],
  );

  useEffect(() => {
    let isMounted = true;

    const loadContent = async () => {
      try {
        const response = await fetch(`/api/content?updated=${Date.now()}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("API content load failed");
        }

        const data = await response.json();

        if (isMounted) {
          setContent(normalizeContent(data));
        }
      } catch (error) {
        console.warn("API 콘텐츠를 불러오지 못해 기본 JSON을 사용합니다.", error);

        try {
          const fallbackResponse = await fetch(`/portfolio/portfolio.json?updated=${Date.now()}`, {
            cache: "no-store",
          });

          const fallbackData = fallbackResponse.ok ? await fallbackResponse.json() : fallbackContent;

          if (isMounted) {
            setContent(normalizeContent(fallbackData));
          }
        } catch {
          if (isMounted) {
            setContent(normalizeContent(fallbackContent));
          }
        }
      }
    };

    loadContent();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const targetMap = {
      "/portfolio": "portfolio",
      "/projects": "portfolio",
      "/process": "process",
      "/guide": "guide",
      "/reviews": "reviews",
      "/collab": "collab",
      "/contact": "contact",
    };

    const target = targetMap[window.location.pathname];

    if (target) {
      window.requestAnimationFrame(() =>
        document.getElementById(target)?.scrollIntoView({ behavior: "smooth" }),
      );
    }
  }, []);

  const heroItems = portfolioItems.slice(0, 3);

  const shareReviews = async () => {
    const url = `${window.location.origin}/reviews`;

    if (navigator.share) {
      await navigator.share({
        title: "365 Daily Snap 촬영 후기",
        text: "함께 촬영한 분들이 남긴 실제 후기입니다.",
        url,
      });
      return;
    }

    await navigator.clipboard?.writeText(url);
  };

  return (
    <div
      className="site"
      onContextMenu={(event) =>
        event.target.closest("[data-protected-media='true']") && event.preventDefault()
      }
    >
      <header className="site-header">
        <a href="/" className="brand" onClick={() => setMenuOpen(false)}>
          365 Daily Snap
          <span>Portrait Photography</span>
        </a>

        <nav className={menuOpen ? "is-open" : ""} aria-label="주요 메뉴">
          <a href="#portfolio" onClick={() => setMenuOpen(false)}>
            Portfolio
          </a>
          <a href="#process" onClick={() => setMenuOpen(false)}>
            Process
          </a>
          <a href="#guide" onClick={() => setMenuOpen(false)}>
            Guide
          </a>
          <a href="#reviews" onClick={() => setMenuOpen(false)}>
            Reviews
          </a>
          <a href="#collab" onClick={() => setMenuOpen(false)}>
            Collaboration
          </a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>
            Contact
          </a>
        </nav>

        <a href="#collab" className="header-cta">
          협업 문의
        </a>

        <button
          type="button"
          className="menu-button"
          onClick={() => setMenuOpen((value) => !value)}
          aria-label="모바일 메뉴 열기"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="icon" /> : <Menu className="icon" />}
        </button>
      </header>

      <main>
        <section className="hero">
          <motion.div className="hero-copy" initial="hidden" animate="visible" variants={fadeUp}>
            <p className="eyebrow">{content.hero.eyebrow}</p>
            <h1>{content.hero.title}</h1>
            <p>{content.hero.description}</p>

            <div className="hero-actions">
              <a href="#portfolio" className="primary-button">
                포트폴리오 보기
                <ArrowRight className="icon" />
              </a>
              <a href="#reviews" className="secondary-button">
                실제 후기 보기
              </a>
              <a href="#collab" className="secondary-button">
                협업 문의하기
              </a>
            </div>

            <div className="hero-stats">
              <span>Seoul</span>
              <span>{portfolioItems.length} Photos</span>
              <span>{content.testimonials.length} Reviews</span>
            </div>
          </motion.div>

          <div className="hero-gallery">
            <PhotoFrame item={heroItems[0]} className="hero-main" loading="eager" />
            <div>
              <PhotoFrame item={heroItems[1]} loading="eager" />
              <PhotoFrame item={heroItems[2]} loading="eager" />
            </div>
          </div>
        </section>

        <section id="portfolio" className="section">
          <SectionHeading
            eyebrow="Portfolio"
            title={content.portfolioIntro.title}
            description={content.portfolioIntro.description}
          />

          <div className="filter-row" aria-label="포트폴리오 필터">
            {filters.slice(0, 18).map((filter) => (
              <button
                key={filter}
                type="button"
                className={activeFilter === filter ? "is-active" : ""}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="portfolio-grid">
            {visiblePortfolioItems.slice(0, 18).map((item) => (
              <article className="portfolio-card" key={item.key}>
                <button
                  type="button"
                  className="portfolio-card-button"
                  onClick={() => setSelectedPortfolio(item)}
                  aria-label={`${item.title} 크게 보기`}
                >
                  <PhotoFrame item={item} />
                  <div>
                    <span>{item.category}</span>
                    <h3>{item.title}</h3>
                    {getLocationLabel(item.location) ? (
                      <p className="location-line">
                        <MapPin className="icon" />
                        {getLocationLabel(item.location)}
                      </p>
                    ) : null}
                  </div>
                </button>
              </article>
            ))}
          </div>
        </section>

        <section id="process" className="section process-section">
          <div className="process-heading">
            <SectionHeading
              eyebrow="Process"
              title={content.shootingProcess.title}
              description={content.shootingProcess.description}
            />
            <a href="#collab" className="secondary-button">
              {content.shootingProcess.ctaLabel}
              <ArrowRight className="icon" />
            </a>
          </div>

          <div className="process-grid" aria-label="촬영 프로세스 단계">
            {content.shootingProcess.steps.map((step, index) => (
              <ProcessCard key={`${step.number}-${step.title}`} step={step} index={index} />
            ))}
          </div>
        </section>

        <section id="guide" className="section prep-section">
          <div className="prep-heading">
            <SectionHeading
              eyebrow="Before Shoot"
              title="촬영 전 준비 안내"
              description="처음 촬영하는 분도 부담 없이 준비할 수 있도록 꼭 필요한 내용만 정리했습니다."
            />

            <div className="prep-note">
              <strong>문의할 때 함께 보내면 좋아요</strong>
              <p>
                희망 날짜, 장소, 촬영 목적, 참고 이미지, 공개 가능 범위를 알려주시면 상담이 훨씬
                빨라집니다.
              </p>
              <a href="#collab" className="text-button">
                준비 내용으로 문의하기
                <ArrowRight className="icon" />
              </a>
            </div>
          </div>

          <div className="prep-grid">
            {PREP_GUIDE_ITEMS.map((item) => (
              <PrepGuideCard key={item.title} item={item} />
            ))}
          </div>
        </section>

        <section id="reviews" className="section reviews-section">
          <div className="reviews-heading">
            <SectionHeading
              eyebrow="Reviews"
              title={content.testimonialsIntro.title}
              description={content.testimonialsIntro.description}
            />

            <button type="button" onClick={shareReviews} className="secondary-button">
              후기 공유
              <Share2 className="icon" />
            </button>
          </div>

          <div className="review-grid">
            {content.testimonials.map((review) => (
              <ReviewCard
                key={`${review.name}-${review.date}`}
                review={review}
                onOpen={setSelectedReview}
              />
            ))}
          </div>
        </section>

        <section id="collab" className="section collab-section">
          <div>
            <p className="eyebrow">Model Collaboration</p>
            <h2>모델 협업 촬영 문의</h2>
            <p>
              365 Daily Snap은 인물 중심의 포트폴리오 협업 촬영을 진행합니다. 촬영 목적과 콘셉트를
              먼저 정리하고, 현장에서는 자연스러운 표정과 흐름을 함께 만들어갑니다.
            </p>

            <div className="availability-note">
              <p className="eyebrow">Schedule</p>
              <h3>촬영 일정 안내</h3>
              <p>
                365 Daily Snap은 사전 조율된 일정에 맞춰 촬영을 진행합니다. 주말과 공휴일, 평일
                저녁 시간대 촬영을 중심으로 운영하며, 평일 낮 촬영은 가능한 일정에 한해 별도
                조율합니다.
              </p>
              <p>
                서울과 수도권을 중심으로 촬영하며, 일산·고양 지역도 편하게 문의하실 수 있습니다. 그
                외 지역이나 시간대는 일정에 따라 조율 가능하니 희망 날짜와 장소를 함께 보내주세요.
              </p>
            </div>

            <div className="contact-actions">
              <a href={CONTACT.kakaoOpenChatUrl} target="_blank" rel="noreferrer" className="primary-button">
                <MessageCircle className="icon" />
                카카오톡 문의
              </a>
              <a href={CONTACT.instagramUrl} target="_blank" rel="noreferrer" className="secondary-button">
                <InstagramIcon />
                {CONTACT.instagramHandle}
              </a>
            </div>
          </div>

          <ImprovedInquiryForm />
        </section>

        <section id="contact" className="section contact-section">
          <Camera className="contact-mark" />
          <h2>사진이 필요한 순간을 보내주세요.</h2>
          <p>촬영 목적, 희망 날짜, 장소를 남겨주시면 확인 후 답변드립니다.</p>

          <div className="contact-actions center">
            <a href={CONTACT.kakaoOpenChatUrl} target="_blank" rel="noreferrer" className="primary-button">
              {CONTACT.kakaoOpenChatLabel}
              <ExternalLink className="icon" />
            </a>
            <a href={CONTACT.instagramUrl} target="_blank" rel="noreferrer" className="secondary-button">
              <InstagramIcon />
              Instagram DM
            </a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>© 365 Daily Snap. Portrait Photography.</p>
        <p>Seoul / Capital Area / Model Collaboration</p>
      </footer>

      <ChatbotWidget portfolioCount={portfolioItems.length} reviewCount={content.testimonials.length} />
      <PortfolioModal item={selectedPortfolio} onClose={() => setSelectedPortfolio(null)} />
      <ReviewModal review={selectedReview} onClose={() => setSelectedReview(null)} />
    </div>
  );
}

export default App;
