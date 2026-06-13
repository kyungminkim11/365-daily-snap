import "./instagram-access.css";

const INSTAGRAM = {
  handle: "@365daily.snap",
  url: "https://www.instagram.com/365daily.snap/",
};

function InstagramGlyph({ className = "instagram-quick-link-icon" }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.15" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.35" cy="6.65" r="1.15" fill="currentColor" />
    </svg>
  );
}

export default function InstagramQuickLink() {
  return (
    <aside className="instagram-quick-link" aria-label="Instagram 빠른 이동">
      <a href={INSTAGRAM.url} target="_blank" rel="noreferrer" className="instagram-quick-link-card">
        <span className="instagram-quick-link-mark">
          <InstagramGlyph />
        </span>
        <span className="instagram-quick-link-copy">
          <strong>Instagram</strong>
          <span>{INSTAGRAM.handle}</span>
        </span>
        <span className="instagram-quick-link-action">보기</span>
      </a>
    </aside>
  );
}
