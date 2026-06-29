import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Camera, Check, Copy, ExternalLink, MapPin, Upload, UserRound, X } from "lucide-react";
import { CONTACT, cleanLocation } from "./siteUtils";

const INQUIRY_UI = {
  ko: {
    reviewTitle: "문의 내용 확인",
    reviewDescription: "보내기 전에 연락처와 희망 일정을 한 번만 확인해주세요.",
    reviewButton: "내용 확인하기",
    finalSubmit: "이 내용으로 문의 보내기",
    edit: "수정하기",
    copy: "내용 복사",
    copied: "복사 완료",
    kakao: "카카오톡으로 이어서 문의",
    instagram: "Instagram DM 열기",
    recommendedLocations: "촬영 선호 위치",
    summaryLabels: {
      type: "촬영 유형",
      name: "이름",
      contactMethod: "연락 방법",
      contact: "연락처",
      date: "희망 날짜",
      region: "희망 지역",
      mood: "분위기",
      purpose: "촬영 목적",
      people: "인원",
      privacy: "공개 범위",
      message: "추가 요청",
      files: "참고 이미지",
    },
  },
  en: {
    reviewTitle: "Review your inquiry",
    reviewDescription: "Please check your contact and preferred timing before sending.",
    reviewButton: "Review inquiry",
    finalSubmit: "Send this inquiry",
    edit: "Edit",
    copy: "Copy details",
    copied: "Copied",
    kakao: "Continue in KakaoTalk",
    instagram: "Open Instagram DM",
    recommendedLocations: "Preferred locations",
    summaryLabels: {
      type: "Session type",
      name: "Name",
      contactMethod: "Contact method",
      contact: "Contact",
      date: "Preferred date",
      region: "Preferred area",
      mood: "Mood",
      purpose: "Purpose",
      people: "People",
      privacy: "Publishing",
      message: "Notes",
      files: "References",
    },
  },
  ja: {
    reviewTitle: "問い合わせ内容の確認",
    reviewDescription: "送信前に連絡先と希望日程を確認してください。",
    reviewButton: "内容を確認",
    finalSubmit: "この内容で送信",
    edit: "修正",
    copy: "内容をコピー",
    copied: "コピー完了",
    kakao: "KakaoTalkで続ける",
    instagram: "Instagram DMを開く",
    recommendedLocations: "希望場所",
    summaryLabels: {
      type: "撮影タイプ",
      name: "名前",
      contactMethod: "連絡方法",
      contact: "連絡先",
      date: "希望日",
      region: "希望エリア",
      mood: "雰囲気",
      purpose: "目的",
      people: "人数",
      privacy: "公開範囲",
      message: "追加内容",
      files: "参考画像",
    },
  },
};

const LOCATION_OPTIONS = ["서울숲", "성수", "연남", "홍대", "한강", "반포대교", "잠실", "을지로", "북촌", "일산", "호수공원", "카페", "실내", "협의"];

const INQUIRY_FORM_META = {
  ko: {
    shootModeTitle: "문의 방식",
    shootModes: ["상호무페이/TFP 협업", "유료 촬영 문의", "상담 후 결정"],
    contactMethodTitle: "연락 받을 방법",
    contactMethodHelp: "선택한 수단만 입력칸이 열립니다. 여러 개 선택해도 괜찮아요.",
    datePicker: "캘린더에서 날짜 선택",
    addDate: "날짜 추가",
    selectedDates: "선택한 날짜",
    removeDate: "삭제",
    timeTitle: "가능 시간대",
    timeOptions: ["평일 저녁", "주말 오전", "주말 오후", "공휴일", "일정 협의"],
    summaryLabels: {
      shootMode: "문의 방식",
      time: "가능 시간대",
    },
  },
  en: {
    shootModeTitle: "Inquiry type",
    shootModes: ["TFP collaboration", "Paid session inquiry", "Decide after consultation"],
    contactMethodTitle: "How should I reply?",
    contactMethodHelp: "Only the selected contact fields will open. You can choose more than one.",
    datePicker: "Choose dates from calendar",
    addDate: "Add date",
    selectedDates: "Selected dates",
    removeDate: "Remove",
    timeTitle: "Available time",
    timeOptions: ["Weekday evening", "Weekend morning", "Weekend afternoon", "Holiday", "Flexible"],
    summaryLabels: {
      shootMode: "Inquiry type",
      time: "Available time",
    },
  },
  ja: {
    shootModeTitle: "お問い合わせ種別",
    shootModes: ["TFP / 相互協力", "有料撮影の相談", "相談して決定"],
    contactMethodTitle: "返信方法",
    contactMethodHelp: "選択した連絡手段だけ入力欄が表示されます。複数選択できます。",
    datePicker: "カレンダーで日付を選択",
    addDate: "日付を追加",
    selectedDates: "選択した日付",
    removeDate: "削除",
    timeTitle: "可能な時間帯",
    timeOptions: ["平日夜", "週末午前", "週末午後", "祝日", "相談して決定"],
    summaryLabels: {
      shootMode: "お問い合わせ種別",
      time: "可能な時間帯",
    },
  },
};

const getContactPlaceholder = (method, fallback) => {
  const value = String(method).toLowerCase();
  if (value.includes("instagram")) return "@your_id";
  if (value.includes("kakao") || value.includes("카카오")) return "카카오톡 ID";
  if (value.includes("phone") || value.includes("sms") || value.includes("전화") || value.includes("문자")) return "010-0000-0000";
  if (value.includes("email") || value.includes("이메일") || value.includes("メール")) return "name@example.com";
  return fallback;
};

export function Media({ src, alt, eager = false, className = "" }) {
  const isVideo = /\.(mp4|webm|mov|m4v)(\?|$)/i.test(src || "");
  const blockSave = (event) => event.preventDefault();
  if (isVideo) {
    return (
      <video
        src={src}
        className={`protected-media ${className}`}
        muted
        playsInline
        loop
        controls
        controlsList="nodownload noplaybackrate"
        preload="metadata"
        onContextMenu={blockSave}
      />
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className={`protected-media ${className}`}
      loading={eager ? "eager" : "lazy"}
      decoding={eager ? "sync" : "async"}
      fetchPriority={eager ? "high" : "auto"}
      draggable="false"
      onContextMenu={blockSave}
    />
  );
}

export function SectionHeading({ eyebrow, title, description = "" }) {
  return <header className="section-heading"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{description && <p>{description}</p>}</header>;
}

function instagramLinkFromTags(tags = []) {
  const value = tags.find((tag) => String(tag).startsWith("__instagram:"));
  return value ? String(value).slice("__instagram:".length) : "";
}

function modelInfo(model) {
  if (model && typeof model === "object") {
    const name = String(model.name || model.handle || "").replace(/^@/, "");
    return { name, url: String(model.url || model.instagramUrl || model.sns || "") };
  }
  const name = String(model || "").replace(/^@/, "");
  return { name, url: String(model || "").startsWith("@") ? `https://www.instagram.com/${name}/` : "" };
}

export function ProjectModal({ project, copy, onClose }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    setActive(0);
    if (!project) return undefined;
    const onKey = (event) => event.key === "Escape" && onClose();
    document.body.classList.add("modal-open");
    window.addEventListener("keydown", onKey);
    return () => { document.body.classList.remove("modal-open"); window.removeEventListener("keydown", onKey); };
  }, [project, onClose]);
  if (!project) return null;
  const item = project.media[active] || project.media[0];
  const location = cleanLocation(item?.location || project.location);
  const instagramUrl = item?.instagramUrl || instagramLinkFromTags(item?.tags) || project.instagramUrl || instagramLinkFromTags(project.tags);
  const models = (project.models || []).map(modelInfo).filter((model) => model.name);
  return (
    <div className="modal-backdrop" onMouseDown={onClose} role="presentation">
      <section className="project-modal" role="dialog" aria-modal="true" aria-label={project.title} onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" type="button" onClick={onClose} aria-label={copy.close}><X /></button>
        <div className="project-modal-stage"><Media src={item.src} alt={item.alt || item.caption || project.title} eager className="project-modal-main" /><span className="watermark">© 365 Daily Snap</span></div>
        <aside className="project-modal-info">
          <p className="eyebrow">{project.category || "PORTRAIT"}</p>
          <h2>{project.title}</h2>
          {project.description && <p className="modal-description">{project.description}</p>}
          <div className="project-meta">
            {location && <span><MapPin />{location}</span>}
            <span><Camera />{project.media.length} {copy.photoCount}</span>
            {models.length > 0 && <span><UserRound />{models.map((model) => model.url ? <a key={model.name} href={model.url} target="_blank" rel="noreferrer">@{model.name}</a> : `@${model.name}`).reduce((acc, item, index) => index ? [...acc, ", ", item] : [item], [])}</span>}
          </div>
          <div className="project-thumbs">{project.media.map((media, index) => <button key={`${media.src}-${index}`} type="button" className={active === index ? "active" : ""} onClick={() => setActive(index)} aria-label={`${index + 1}`}><Media src={media.src} alt="" /></button>)}</div>
          <div className="modal-actions"><a className="button primary" href="#contact" onClick={onClose}>{copy.projectInquiry}<ArrowRight /></a>{instagramUrl && <a className="button ghost" href={instagramUrl} target="_blank" rel="noreferrer">{copy.originalPost}<ExternalLink /></a>}</div>
        </aside>
      </section>
    </div>
  );
}

export function ReviewModal({ review, copy, onClose }) {
  if (!review?.reviewImage) return null;
  return <div className="modal-backdrop" onMouseDown={onClose} role="presentation"><section className="review-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" type="button" onClick={onClose} aria-label={copy.close}><X /></button><img src={review.reviewImage} alt={review.imageAlt || review.name} /></section></div>;
}

export function InquiryForm({ copy, language = "ko", onTrack = () => {} }) {
  const ui = INQUIRY_UI[language] || INQUIRY_UI.ko;
  const meta = INQUIRY_FORM_META[language] || INQUIRY_FORM_META.ko;
  const contactOptions = copy.contactMethods?.length ? copy.contactMethods : ["Instagram DM", "카카오톡", "문자·전화", "이메일"];
  const [mode, setMode] = useState("quick");
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [files, setFiles] = useState([]);
  const [form, setForm] = useState(() => ({
    shootMode: meta.shootModes[0],
    type: "",
    name: "",
    contactMethods: [contactOptions[0]],
    contacts: {},
    date: "",
    dateInput: "",
    selectedDates: [],
    timeSlots: [],
    region: "",
    mood: "",
    purpose: "",
    people: "1",
    privacy: copy.privacyOptions[0],
    message: "",
    consent: false,
  }));
  useEffect(() => {
    setForm((current) => {
      const nextMethods = (current.contactMethods || []).filter((method) => contactOptions.includes(method));
      return {
        ...current,
        shootMode: meta.shootModes.includes(current.shootMode) ? current.shootMode : meta.shootModes[0],
        privacy: copy.privacyOptions.includes(current.privacy) ? current.privacy : copy.privacyOptions[0],
        contactMethods: nextMethods.length ? nextMethods : [contactOptions[0]],
      };
    });
  }, [copy, language]);
  const update = (key, value) => {
    setReviewing(false);
    setStatus("");
    setForm((current) => ({ ...current, [key]: value }));
  };
  const toggleArrayValue = (key, value) => {
    setReviewing(false);
    setStatus("");
    setForm((current) => {
      const currentValues = current[key] || [];
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];
      return { ...current, [key]: nextValues };
    });
  };
  const updateContact = (method, value) => {
    setReviewing(false);
    setStatus("");
    setForm((current) => ({ ...current, contacts: { ...(current.contacts || {}), [method]: value } }));
  };
  const addSelectedDate = () => {
    if (!form.dateInput) return;
    setReviewing(false);
    setStatus("");
    setForm((current) => ({
      ...current,
      selectedDates: Array.from(new Set([...(current.selectedDates || []), current.dateInput])).sort(),
      dateInput: "",
    }));
  };
  const removeSelectedDate = (date) => {
    setReviewing(false);
    setStatus("");
    setForm((current) => ({ ...current, selectedDates: (current.selectedDates || []).filter((item) => item !== date) }));
  };
  const contactSummary = useMemo(() => (form.contactMethods || [])
    .map((method) => {
      const value = (form.contacts || {})[method]?.trim();
      return value ? `${method}: ${value}` : "";
    })
    .filter(Boolean)
    .join(" / "), [form.contactMethods, form.contacts]);
  const dateSummary = useMemo(() => [...(form.selectedDates || []), form.date.trim()].filter(Boolean).join(", "), [form.date, form.selectedDates]);
  const timeSummary = useMemo(() => (form.timeSlots || []).join(", "), [form.timeSlots]);
  const coreReady = Boolean(form.shootMode && form.type && form.name.trim() && contactSummary && dateSummary);
  const requiredReady = Boolean(coreReady && form.consent);
  const summaryRows = useMemo(() => [
    ["shootMode", form.shootMode],
    ["type", form.type],
    ["name", form.name],
    ["contactMethod", (form.contactMethods || []).join(", ")],
    ["contact", contactSummary],
    ["date", dateSummary],
    ["time", timeSummary],
    ["region", form.region],
    ["mood", form.mood],
    ["purpose", form.purpose],
    ["people", form.people],
    ["privacy", form.privacy],
    ["message", form.message],
    ["files", files.length ? files.map((file) => file.name).join(", ") : ""],
  ].filter(([, value]) => String(value || "").trim()), [contactSummary, dateSummary, files, form, timeSummary]);
  const summaryLabel = (key) => ui.summaryLabels[key] || meta.summaryLabels[key] || key;
  const summary = () => ["[365 Daily Snap 촬영 문의]", ...summaryRows.map(([key, value]) => `${summaryLabel(key)}: ${value}`)].join("\n");

  const uploadReferences = async () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !key || !files.length) return [];
    const uploaded = [];
    for (const file of files) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `${Date.now()}-${crypto.randomUUID()}-${safeName}`;
      const response = await fetch(`${url}/storage/v1/object/inquiry-references/${path}`, { method: "POST", headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": file.type, "x-upsert": "false" }, body: file });
      if (response.ok) uploaded.push(`${url}/storage/v1/object/public/inquiry-references/${path}`);
    }
    return uploaded;
  };

  const saveInquiry = async () => {
    const referenceImages = await uploadReferences();
    const messageWithMeta = [
      timeSummary && `${summaryLabel("time")}: ${timeSummary}`,
      form.message,
    ].filter(Boolean).join("\n");
    const payload = {
      ...form,
      contact: contactSummary,
      contactMethod: (form.contactMethods || []).join(", "),
      date: dateSummary,
      referenceImages,
      source: window.location.href,
      createdAt: new Date().toISOString(),
    };
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (url && key) {
      const response = await fetch(`${url}/rest/v1/inquiries`, { method: "POST", headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify({ name: form.name, contact: contactSummary, contact_method: (form.contactMethods || []).join(", "), inquiry_type: `${form.shootMode} / ${form.type}`, preferred_date: dateSummary, region: form.region, mood: form.mood, purpose: form.purpose, people: form.people, privacy: form.privacy, message: messageWithMeta, reference_images: referenceImages, source_url: window.location.href }) });
      if (response.ok) return true;
    }
    const legacy = await fetch("/api/inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!legacy.ok || !legacy.headers.get("content-type")?.includes("application/json")) return false;
    const result = await legacy.json();
    return Boolean(result?.ok || result?.inquiry);
  };

  const handleFiles = (event) => {
    setReviewing(false);
    setFiles([...(event.target.files || [])].filter((file) => file.type.startsWith("image/") && file.size <= 8 * 1024 * 1024).slice(0, 3));
  };
  const toggleRegion = (value) => {
    const values = new Set(String(form.region || "").split(",").map((item) => item.trim()).filter(Boolean));
    if (values.has(value)) values.delete(value);
    else values.add(value);
    update("region", Array.from(values).join(", "));
  };
  const copySummary = async () => {
    await navigator.clipboard?.writeText(summary());
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!coreReady) { setStatus("validation"); return; }
    if (!reviewing) { setReviewing(true); onTrack("Inquiry review"); return; }
    if (!requiredReady) { setStatus("validation"); return; }
    setStatus("sending");
    try { if (await saveInquiry()) { setStatus("sent"); onTrack("Inquiry sent", { type: form.type }); return; } throw new Error("storage unavailable"); }
    catch { await navigator.clipboard?.writeText(summary()); setStatus("fallback"); onTrack("Inquiry fallback"); }
  };
  const visibleStep = mode === "quick" ? 1 : step;
  const selectedRegionValues = String(form.region).split(",").map((value) => value.trim()).filter(Boolean);

  return (
    <div className="inquiry-panel">
      <div className="inquiry-mode" role="tablist">
        <button type="button" className={mode === "quick" ? "active" : ""} aria-pressed={mode === "quick"} onClick={() => { setMode("quick"); setStep(1); setReviewing(false); }}>{copy.quick}</button>
        <button type="button" className={mode === "detail" ? "active" : ""} aria-pressed={mode === "detail"} onClick={() => { setMode("detail"); setReviewing(false); }}>{copy.detail}</button>
      </div>
      {mode === "detail" && <div className="step-indicator"><span>{copy.step} {step}/3</span><div><i style={{ width: `${step * 33.333}%` }} /></div></div>}
      <form onSubmit={handleSubmit}>
        {visibleStep === 1 && (
          <div className="form-step">
            <fieldset>
              <legend>{meta.shootModeTitle} *</legend>
              <div className="choice-grid">
                {meta.shootModes.map((item) => (
                  <button type="button" key={item} className={form.shootMode === item ? "active" : ""} aria-pressed={form.shootMode === item} onClick={() => update("shootMode", item)}>
                    {form.shootMode === item && <Check />}{item}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>{copy.form.type} *</legend>
              <div className="choice-grid">
                {copy.types.map((type) => (
                  <button type="button" key={type} className={form.type === type ? "active" : ""} aria-pressed={form.type === type} onClick={() => update("type", type)}>
                    {form.type === type && <Check />}{type}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="field-grid">
              <label className="wide">{copy.form.name} *<input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder={copy.placeholders.name} /></label>
            </div>
            <fieldset className="contact-method-options">
              <legend>{meta.contactMethodTitle} *</legend>
              <p>{meta.contactMethodHelp}</p>
              <div>
                {contactOptions.map((method) => (
                  <button key={method} type="button" className={(form.contactMethods || []).includes(method) ? "active" : ""} aria-pressed={(form.contactMethods || []).includes(method)} onClick={() => toggleArrayValue("contactMethods", method)}>
                    {(form.contactMethods || []).includes(method) && <Check />}{method}
                  </button>
                ))}
              </div>
            </fieldset>
            {(form.contactMethods || []).length > 0 && (
              <div className="contact-detail-grid">
                {form.contactMethods.map((method) => (
                  <label key={method}>{method} *
                    <input value={(form.contacts || {})[method] || ""} onChange={(event) => updateContact(method, event.target.value)} placeholder={getContactPlaceholder(method, copy.placeholders.contact)} />
                  </label>
                ))}
              </div>
            )}
            <div className="date-tools">
              <div className="date-picker-row">
                <label>{meta.datePicker}<input type="date" value={form.dateInput} onInput={(event) => update("dateInput", event.target.value)} onChange={(event) => update("dateInput", event.target.value)} /></label>
                <button type="button" className="button ghost" onClick={addSelectedDate} disabled={!form.dateInput}>{meta.addDate}</button>
              </div>
              {form.selectedDates.length > 0 && (
                <div className="selected-date-list" aria-label={meta.selectedDates}>
                  {form.selectedDates.map((date) => (
                    <span key={date}>{date}<button type="button" onClick={() => removeSelectedDate(date)} aria-label={`${date} ${meta.removeDate}`}>×</button></span>
                  ))}
                </div>
              )}
            </div>
            <div className="field-grid">
              <label className="wide">{copy.form.date} *<input value={form.date} onChange={(event) => update("date", event.target.value)} placeholder={copy.placeholders.date} /></label>
            </div>
            <fieldset className="time-options">
              <legend>{meta.timeTitle}</legend>
              <div>{meta.timeOptions.map((item) => <button key={item} type="button" className={(form.timeSlots || []).includes(item) ? "active" : ""} aria-pressed={(form.timeSlots || []).includes(item)} onClick={() => toggleArrayValue("timeSlots", item)}>{item}</button>)}</div>
            </fieldset>
            <div className="field-grid">
              <label className="wide">{copy.form.region}<input value={form.region} onChange={(event) => update("region", event.target.value)} placeholder={copy.placeholders.region} /></label>
            </div>
            <fieldset className="location-options">
              <legend>{ui.recommendedLocations}</legend>
              <div>{LOCATION_OPTIONS.map((item) => <button key={item} type="button" className={selectedRegionValues.includes(item) ? "active" : ""} aria-pressed={selectedRegionValues.includes(item)} onClick={() => toggleRegion(item)}>{item}</button>)}</div>
            </fieldset>
          </div>
        )}
        {mode === "detail" && visibleStep === 2 && (
          <div className="form-step">
            <div className="field-grid">
              <label className="wide">{copy.form.mood}<input value={form.mood} onChange={(event) => update("mood", event.target.value)} placeholder={copy.placeholders.mood} /></label>
              <label className="wide">{copy.form.purpose}<input value={form.purpose} onChange={(event) => update("purpose", event.target.value)} placeholder={copy.placeholders.purpose} /></label>
              <label>{copy.form.people}<input type="number" min="1" max="20" value={form.people} onChange={(event) => update("people", event.target.value)} /></label>
              <label>{copy.form.privacy}<select value={form.privacy} onChange={(event) => update("privacy", event.target.value)}>{copy.privacyOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
            </div>
          </div>
        )}
        {mode === "detail" && visibleStep === 3 && (
          <div className="form-step">
            <label className="upload-field"><span><Upload />{copy.form.reference}</span><input type="file" accept="image/*" multiple onChange={handleFiles} /><small>{copy.uploadHint}</small>{files.length > 0 && <b>{files.map((file) => file.name).join(", ")}</b>}</label>
            <label>{copy.form.message}<textarea value={form.message} onChange={(event) => update("message", event.target.value)} placeholder={copy.placeholders.message} /></label>
          </div>
        )}
        {reviewing && <div className="inquiry-summary"><div><h3>{ui.reviewTitle}</h3><p>{ui.reviewDescription}</p></div><dl>{summaryRows.map(([key, value]) => <div key={key}><dt>{summaryLabel(key)}</dt><dd>{value}</dd></div>)}</dl><div className="summary-actions"><button type="button" className="button ghost" onClick={copySummary}><Copy />{copied ? ui.copied : ui.copy}</button><a className="button ghost" href={CONTACT.kakaoOpenChatUrl} target="_blank" rel="noreferrer" onClick={copySummary}>{ui.kakao}</a><a className="button ghost" href={CONTACT.instagramUrl} target="_blank" rel="noreferrer" onClick={copySummary}>{ui.instagram}</a></div></div>}
        {(mode === "quick" || visibleStep === 3) && <label className="consent"><input type="checkbox" checked={form.consent} onChange={(event) => update("consent", event.target.checked)} /><span><b>{copy.form.consent} *</b><small>{copy.consentDetail}</small></span></label>}
        {status === "validation" && <p className="form-message error">{copy.validation}</p>}{status === "sent" && <p className="form-message success"><Check />{copy.sent}</p>}{status === "fallback" && <div className="fallback-box"><strong>{copy.fallbackTitle}</strong><p>{copy.fallbackText}</p><div><a href={CONTACT.kakaoOpenChatUrl} target="_blank" rel="noreferrer">{copy.openKakao}</a><a href={CONTACT.instagramUrl} target="_blank" rel="noreferrer">{copy.openInstagram}</a></div></div>}
        <div className="form-navigation">{mode === "detail" && step > 1 && !reviewing && <button type="button" className="button ghost" onClick={() => setStep((value) => value - 1)}><ArrowLeft />{copy.previous}</button>}{reviewing && <button type="button" className="button ghost" onClick={() => setReviewing(false)}>{ui.edit}</button>}{mode === "detail" && step < 3 ? <button type="button" className="button primary" onClick={() => setStep((value) => value + 1)}>{copy.next}<ArrowRight /></button> : <button type="submit" className="button primary" disabled={status === "sending"}>{status === "sending" ? copy.sending : reviewing ? ui.finalSubmit : ui.reviewButton}<ArrowRight /></button>}</div>
      </form>
    </div>
  );
}
