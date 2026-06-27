import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Camera, Check, ExternalLink, MapPin, Upload, UserRound, X } from "lucide-react";
import { CONTACT, cleanLocation } from "./siteUtils";

export function Media({ src, alt, eager = false, className = "" }) {
  const isVideo = /\.(mp4|webm|mov|m4v)(\?|$)/i.test(src || "");
  if (isVideo) return <video src={src} className={className} muted playsInline loop controls preload="metadata" />;
  return <img src={src} alt={alt} className={className} loading={eager ? "eager" : "lazy"} decoding={eager ? "sync" : "async"} fetchPriority={eager ? "high" : "auto"} draggable="false" />;
}

export function SectionHeading({ eyebrow, title, description = "" }) {
  return <header className="section-heading"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{description && <p>{description}</p>}</header>;
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
  const instagramUrl = item?.instagramUrl || project.instagramUrl;
  return <div className="modal-backdrop" onMouseDown={onClose} role="presentation"><section className="project-modal" role="dialog" aria-modal="true" aria-label={project.title} onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" type="button" onClick={onClose} aria-label={copy.close}><X /></button><div className="project-modal-stage"><Media src={item.src} alt={item.alt || item.caption || project.title} eager className="project-modal-main" /><span className="watermark">© 365 Daily Snap</span></div><aside className="project-modal-info"><p className="eyebrow">{project.category || "PORTRAIT"}</p><h2>{project.title}</h2>{project.description && <p className="modal-description">{project.description}</p>}<div className="project-meta">{location && <span><MapPin />{location}</span>}<span><Camera />{project.media.length} {copy.photoCount}</span>{project.models?.length > 0 && <span><UserRound />{project.models.map((model) => `@${String(model).replace(/^@/, "")}`).join(", ")}</span>}</div><div className="project-thumbs">{project.media.map((media, index) => <button key={`${media.src}-${index}`} type="button" className={active === index ? "active" : ""} onClick={() => setActive(index)} aria-label={`${index + 1}`}><Media src={media.src} alt="" /></button>)}</div><div className="modal-actions"><a className="button primary" href="#contact" onClick={onClose}>{copy.projectInquiry}<ArrowRight /></a>{instagramUrl && <a className="button ghost" href={instagramUrl} target="_blank" rel="noreferrer">{copy.originalPost}<ExternalLink /></a>}</div></aside></section></div>;
}

export function ReviewModal({ review, copy, onClose }) {
  if (!review?.reviewImage) return null;
  return <div className="modal-backdrop" onMouseDown={onClose} role="presentation"><section className="review-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" type="button" onClick={onClose} aria-label={copy.close}><X /></button><img src={review.reviewImage} alt={review.imageAlt || review.name} /></section></div>;
}

export function InquiryForm({ copy }) {
  const [mode, setMode] = useState("quick");
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState("");
  const [files, setFiles] = useState([]);
  const [form, setForm] = useState({ type: "", name: "", contactMethod: "Instagram DM", contact: "", date: "", region: "", mood: "", purpose: "", people: "1", privacy: copy.privacyOptions[0], message: "", consent: false });
  useEffect(() => { setForm((current) => ({ ...current, privacy: copy.privacyOptions.includes(current.privacy) ? current.privacy : copy.privacyOptions[0] })); }, [copy]);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const requiredReady = Boolean(form.type && form.name.trim() && form.contact.trim() && form.date.trim() && form.consent);
  const summary = () => ["[365 Daily Snap 촬영 문의]", `유형: ${form.type}`, `이름: ${form.name}`, `연락 방법: ${form.contactMethod}`, `연락처: ${form.contact}`, `희망 날짜: ${form.date}`, form.region && `희망 지역: ${form.region}`, form.mood && `분위기: ${form.mood}`, form.purpose && `촬영 목적: ${form.purpose}`, form.people && `인원: ${form.people}`, form.privacy && `공개 범위: ${form.privacy}`, form.message && `추가 요청: ${form.message}`, files.length && `참고 이미지: ${files.map((file) => file.name).join(", ")} (메신저로 별도 전송)`].filter(Boolean).join("\n");

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
    const payload = { ...form, referenceImages, source: window.location.href, createdAt: new Date().toISOString() };
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (url && key) {
      const response = await fetch(`${url}/rest/v1/inquiries`, { method: "POST", headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify({ name: form.name, contact: form.contact, contact_method: form.contactMethod, inquiry_type: form.type, preferred_date: form.date, region: form.region, mood: form.mood, purpose: form.purpose, people: form.people, privacy: form.privacy, message: form.message, reference_images: referenceImages, source_url: window.location.href }) });
      if (response.ok) return true;
    }
    const legacy = await fetch("/api/inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!legacy.ok || !legacy.headers.get("content-type")?.includes("application/json")) return false;
    const result = await legacy.json();
    return Boolean(result?.ok || result?.inquiry);
  };

  const handleFiles = (event) => setFiles([...(event.target.files || [])].filter((file) => file.type.startsWith("image/") && file.size <= 8 * 1024 * 1024).slice(0, 3));
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!requiredReady) { setStatus("validation"); return; }
    setStatus("sending");
    try { if (await saveInquiry()) { setStatus("sent"); return; } throw new Error("storage unavailable"); }
    catch { await navigator.clipboard?.writeText(summary()); setStatus("fallback"); }
  };
  const visibleStep = mode === "quick" ? 1 : step;

  return <div className="inquiry-panel"><div className="inquiry-mode" role="tablist"><button type="button" className={mode === "quick" ? "active" : ""} onClick={() => { setMode("quick"); setStep(1); }}>{copy.quick}</button><button type="button" className={mode === "detail" ? "active" : ""} onClick={() => setMode("detail")}>{copy.detail}</button></div>{mode === "detail" && <div className="step-indicator"><span>{copy.step} {step}/3</span><div><i style={{ width: `${step * 33.333}%` }} /></div></div>}<form onSubmit={handleSubmit}>
    {visibleStep === 1 && <div className="form-step"><fieldset><legend>{copy.form.type} *</legend><div className="choice-grid">{copy.types.map((type) => <button type="button" key={type} className={form.type === type ? "active" : ""} onClick={() => update("type", type)}>{form.type === type && <Check />}{type}</button>)}</div></fieldset><div className="field-grid"><label>{copy.form.name} *<input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder={copy.placeholders.name} /></label><label>{copy.form.contactMethod}<select value={form.contactMethod} onChange={(e) => update("contactMethod", e.target.value)}>{copy.contactMethods.map((item) => <option key={item}>{item}</option>)}</select></label><label className="wide">{copy.form.contact} *<input value={form.contact} onChange={(e) => update("contact", e.target.value)} placeholder={copy.placeholders.contact} /></label><label>{copy.form.date} *<input value={form.date} onChange={(e) => update("date", e.target.value)} placeholder={copy.placeholders.date} /></label><label>{copy.form.region}<input value={form.region} onChange={(e) => update("region", e.target.value)} placeholder={copy.placeholders.region} /></label></div></div>}
    {mode === "detail" && visibleStep === 2 && <div className="form-step"><div className="field-grid"><label className="wide">{copy.form.mood}<input value={form.mood} onChange={(e) => update("mood", e.target.value)} placeholder={copy.placeholders.mood} /></label><label className="wide">{copy.form.purpose}<input value={form.purpose} onChange={(e) => update("purpose", e.target.value)} placeholder={copy.placeholders.purpose} /></label><label>{copy.form.people}<input type="number" min="1" max="20" value={form.people} onChange={(e) => update("people", e.target.value)} /></label><label>{copy.form.privacy}<select value={form.privacy} onChange={(e) => update("privacy", e.target.value)}>{copy.privacyOptions.map((item) => <option key={item}>{item}</option>)}</select></label></div></div>}
    {mode === "detail" && visibleStep === 3 && <div className="form-step"><label className="upload-field"><span><Upload />{copy.form.reference}</span><input type="file" accept="image/*" multiple onChange={handleFiles} /><small>{copy.uploadHint}</small>{files.length > 0 && <b>{files.map((file) => file.name).join(", ")}</b>}</label><label>{copy.form.message}<textarea value={form.message} onChange={(e) => update("message", e.target.value)} placeholder={copy.placeholders.message} /></label></div>}
    {(mode === "quick" || visibleStep === 3) && <label className="consent"><input type="checkbox" checked={form.consent} onChange={(e) => update("consent", e.target.checked)} /><span><b>{copy.form.consent} *</b><small>{copy.consentDetail}</small></span></label>}
    {status === "validation" && <p className="form-message error">{copy.validation}</p>}{status === "sent" && <p className="form-message success"><Check />{copy.sent}</p>}{status === "fallback" && <div className="fallback-box"><strong>{copy.fallbackTitle}</strong><p>{copy.fallbackText}</p><div><a href={CONTACT.kakaoOpenChatUrl} target="_blank" rel="noreferrer">{copy.openKakao}</a><a href={CONTACT.instagramUrl} target="_blank" rel="noreferrer">{copy.openInstagram}</a></div></div>}
    <div className="form-navigation">{mode === "detail" && step > 1 && <button type="button" className="button ghost" onClick={() => setStep((value) => value - 1)}><ArrowLeft />{copy.previous}</button>}{mode === "detail" && step < 3 ? <button type="button" className="button primary" onClick={() => setStep((value) => value + 1)}>{copy.next}<ArrowRight /></button> : <button type="submit" className="button primary" disabled={status === "sending"}>{status === "sending" ? copy.sending : copy.submit}<ArrowRight /></button>}</div>
  </form></div>;
}
