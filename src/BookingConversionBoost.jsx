import "./booking-conversion-boost.css";

const CONTACT = {
  instagramUrl: "https://www.instagram.com/365daily.snap/",
};

const COPY = {
  ko: {
    eyebrow: "Booking Guide",
    title: "문의 전에 이것만 정리하면 상담이 빨라집니다.",
    description: "처음 촬영하는 분도 헷갈리지 않도록 촬영 형태, 지역, 날짜, 참고 이미지를 한 번에 정리했습니다.",
    cta: "예약형 문의 작성하기",
    dm: "Instagram DM",
    tokyo: "Tokyo Available Dates",
    tokyoBody: "도쿄 촬영은 체류 일정에 맞춰 열립니다. 희망 날짜와 지역을 먼저 보내주시면 Shibuya, Shinjuku, Harajuku, Ueno, Asakusa 중심으로 가능한 동선을 제안합니다.",
    items: [
      ["촬영 형태", "개인 프로필 / 커플 / 여행 스냅 / 포트폴리오 협업"],
      ["희망 지역", "서울·수도권 또는 도쿄 희망 장소"],
      ["희망 날짜", "가능한 날짜 2~3개와 시간대"],
      ["참고 이미지", "원하는 분위기 사진 1~3장"],
    ],
  },
  ja: {
    eyebrow: "Booking Guide",
    title: "相談前にこれだけ整理するとスムーズです。",
    description: "初めての方でも迷わないよう、撮影タイプ、エリア、日程、参考写真をまとめました。",
    cta: "相談フォームへ",
    dm: "Instagram DM",
    tokyo: "Tokyo Available Dates",
    tokyoBody: "東京撮影は滞在日程に合わせて受付します。希望日とエリアを送っていただければ、Shibuya, Shinjuku, Harajuku, Ueno, Asakusaを中心に動線を提案します。",
    items: [
      ["撮影タイプ", "プロフィール / カップル / 旅行スナップ / ポートフォリオコラボ"],
      ["希望エリア", "ソウル・首都圏または東京の希望場所"],
      ["希望日", "可能な日程2〜3候補と時間帯"],
      ["参考写真", "希望する雰囲気の写真1〜3枚"],
    ],
  },
  en: {
    eyebrow: "Booking Guide",
    title: "A faster inquiry starts with these details.",
    description: "Pick the shoot type, area, dates, and references so we can quickly set a direction.",
    cta: "Open Inquiry Form",
    dm: "Instagram DM",
    tokyo: "Tokyo Available Dates",
    tokyoBody: "Tokyo sessions open depending on travel or stay schedules. Send your preferred date and area first, and I can suggest routes around Shibuya, Shinjuku, Harajuku, Ueno, and Asakusa.",
    items: [
      ["Shoot type", "Profile / Couple / Travel snap / Portfolio collaboration"],
      ["Area", "Seoul area or preferred Tokyo location"],
      ["Dates", "2–3 possible dates and time windows"],
      ["References", "1–3 images that match the mood you want"],
    ],
  },
};

function getLanguage() {
  if (typeof window === "undefined") return "ko";
  const pathLanguage = window.location.pathname.split("/").filter(Boolean)[0];
  if (["ko", "ja", "en"].includes(pathLanguage)) return pathLanguage;
  return window.localStorage.getItem("site-language") || "ko";
}

export default function BookingConversionBoost() {
  const copy = COPY[getLanguage()] || COPY.ko;

  return (
    <section className="booking-conversion-boost" aria-label="Booking guide">
      <div className="booking-copy">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2>{copy.title}</h2>
        <p>{copy.description}</p>
        <div className="booking-actions">
          <a href="#collab" className="primary-button">{copy.cta}</a>
          <a href={CONTACT.instagramUrl} target="_blank" rel="noreferrer" className="secondary-button">{copy.dm}</a>
        </div>
      </div>
      <div className="booking-checklist">
        {copy.items.map(([title, body]) => (
          <article key={title}>
            <strong>{title}</strong>
            <p>{body}</p>
          </article>
        ))}
      </div>
      <aside className="booking-tokyo-card">
        <span>Tokyo</span>
        <h3>{copy.tokyo}</h3>
        <p>{copy.tokyoBody}</p>
      </aside>
    </section>
  );
}
