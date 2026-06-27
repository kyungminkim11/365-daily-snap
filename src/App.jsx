import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, Camera, Check, ChevronDown, ChevronUp, Clock3, ExternalLink, Globe2, Instagram, MapPin, Menu, MessageCircle, ShieldCheck, X } from "lucide-react";
import { fallbackContent, normalizeContent } from "./siteContent";
import { COPY } from "./siteCopy";
import { BUSINESS, CONTACT, cleanLocation, createProjectGroups, setMeta, useLanguage } from "./siteUtils";
import { InquiryForm, Media, ProjectModal, ReviewModal, SectionHeading } from "./siteComponents";

function App() {
  const [language, setLanguage] = useLanguage();
  const copy = COPY[language];
  const [content, setContent] = useState(() => normalizeContent(fallbackContent));
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [projectModal, setProjectModal] = useState(null);
  const [reviewModal, setReviewModal] = useState(null);
  const [faqOpen, setFaqOpen] = useState(0);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch("/portfolio/portfolio.json")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("content")))
      .then((data) => mounted && setContent(normalizeContent(data)))
      .catch(() => mounted && setContent(normalizeContent(fallbackContent)));
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === "ja" ? "ja" : language;
    document.title = copy.title;
    setMeta("description", copy.description);
    setMeta("og:title", copy.title, true);
    setMeta("og:description", copy.description, true);
    setMeta("og:locale", language === "ko" ? "ko_KR" : language === "ja" ? "ja_JP" : "en_US", true);
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = `https://snap.lavalabs.co.kr/${language}`;
  }, [language, copy]);

  const projects = useMemo(() => createProjectGroups(content), [content]);
  const visibleProjects = showAllProjects ? projects : projects.slice(0, 6);
  const reviews = content.testimonials || [];
  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 3);
  const heroProject = projects[0];
  const heroMedia = heroProject?.media || [];

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div className="site-shell">
      <header className="site-header">
        <button className="brand" type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><span>365</span><b>Daily Snap</b></button>
        <nav className={menuOpen ? "open" : ""} aria-label="Primary navigation">
          {Object.entries(copy.nav).map(([key, label]) => <button key={key} type="button" onClick={() => scrollTo(key)}>{label}</button>)}
        </nav>
        <div className="header-tools">
          <div className="language-switch" aria-label="Language"><Globe2 />{Object.keys(COPY).map((code) => <button key={code} type="button" className={language === code ? "active" : ""} onClick={() => setLanguage(code)}>{code.toUpperCase()}</button>)}</div>
          <button type="button" className="button compact primary desktop-cta" onClick={() => scrollTo("contact")}>{copy.heroSecondary}</button>
          <button type="button" className="menu-button" onClick={() => setMenuOpen((value) => !value)} aria-label="Menu">{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </header>

      <main>
        <section className="hero section-wrap">
          <div className="hero-copy">
            <p className="eyebrow">{copy.heroEyebrow}</p>
            <h1>{copy.heroTitle.split("\n").map((line) => <span key={line}>{line}</span>)}</h1>
            <p className="hero-description">{copy.heroDescription}</p>
            <div className="hero-actions"><button className="button primary" type="button" onClick={() => scrollTo("work")}>{copy.heroPrimary}<ArrowRight /></button><button className="button ghost" type="button" onClick={() => scrollTo("contact")}>{copy.heroSecondary}</button></div>
            <div className="trust-row">{copy.trust.map((item) => <span key={item}><Check />{item}</span>)}</div>
          </div>
          <div className="hero-collage" aria-label="Featured photography">
            {heroMedia[0]?.src && <div className="hero-photo hero-photo-main"><Media src={heroMedia[0].src} alt={heroMedia[0].alt || heroProject.title} eager /><span className="watermark">© 365 Daily Snap</span></div>}
            <div className="hero-photo-stack">{heroMedia.slice(1, 3).map((item, index) => <div className="hero-photo" key={item.src}><Media src={item.src} alt={item.alt || heroProject.title} eager={index === 0} /><span className="watermark">© 365 Daily Snap</span></div>)}</div>
          </div>
        </section>

        <section id="work" className="section section-wrap">
          <SectionHeading eyebrow={copy.workEyebrow} title={copy.workTitle} description={copy.workDescription} />
          <div className="project-grid">{visibleProjects.map((project, index) => <article className={`project-card ${index === 0 ? "featured" : ""}`} key={project.id}><button type="button" className="project-cover" onClick={() => setProjectModal(project)}><Media src={project.cover || project.media[0]?.src} alt={project.title} eager={index < 2} /><span className="watermark">© 365 Daily Snap</span><span className="project-number">{String(index + 1).padStart(2, "0")}</span></button><div className="project-card-copy"><div><p>{project.category || "Portrait"}</p><h3>{project.title}</h3></div><div className="project-card-meta">{cleanLocation(project.location) && <span><MapPin />{cleanLocation(project.location)}</span>}<span><Camera />{project.media.length} {copy.photoCount}</span></div><button className="text-link" type="button" onClick={() => setProjectModal(project)}>{copy.viewProject}<ArrowRight /></button></div></article>)}</div>
          {projects.length > 6 && <button className="button ghost centered" type="button" onClick={() => setShowAllProjects((value) => !value)}>{showAllProjects ? copy.lessProjects : copy.moreProjects}{showAllProjects ? <ChevronUp /> : <ChevronDown />}</button>}
        </section>

        <section className="why-section"><div className="section-wrap section"><SectionHeading eyebrow={copy.whyEyebrow} title={copy.whyTitle} /><div className="why-grid">{copy.whyItems.map((item, index) => <article key={item.title}><span>0{index + 1}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></div></section>
        <section id="sessions" className="section section-wrap"><SectionHeading eyebrow={copy.sessionsEyebrow} title={copy.sessionsTitle} description={copy.sessionsDescription} /><div className="session-grid">{copy.sessions.map((session) => { const Icon = session.icon; return <article key={session.name}><div className="session-icon"><Icon /></div><p className="eyebrow">{session.name}</p><h3>{session.title}</h3><span className="session-time"><Clock3 />{session.time}</span><p>{session.text}</p><div className="tag-row">{session.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></article>; })}</div></section>
        <section className="process-section"><div className="section section-wrap"><SectionHeading eyebrow={copy.processEyebrow} title={copy.processTitle} /><div className="process-grid">{copy.process.map((item) => <article key={item.number}><span>{item.number}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></div></section>
        <section id="reviews" className="section section-wrap"><SectionHeading eyebrow={copy.reviewsEyebrow} title={copy.reviewsTitle} description={copy.reviewsDescription} /><div className="review-grid">{visibleReviews.map((review) => <article className="review-card" key={`${review.name}-${review.date}`}><div className="quote-mark">“</div><p>{review.content}</p><footer><div><strong>{review.name}</strong><span>{review.type} · {review.date}</span></div>{review.reviewImage && <button type="button" onClick={() => setReviewModal(review)}>{copy.reviewOriginal}<ExternalLink /></button>}</footer></article>)}</div>{reviews.length > 3 && <button className="button ghost centered" type="button" onClick={() => setShowAllReviews((value) => !value)}>{showAllReviews ? copy.lessProjects : copy.moreReviews}{showAllReviews ? <ChevronUp /> : <ChevronDown />}</button>}</section>
        <section id="about" className="about-section"><div className="section section-wrap about-grid"><div className="about-visual"><div className="about-monogram">K<br />M</div><Camera /></div><div><p className="eyebrow">{copy.aboutEyebrow}</p><h2>{copy.aboutTitle}</h2><p>{copy.aboutText}</p><div className="about-facts">{copy.aboutFacts.map((fact) => <span key={fact}><Check />{fact}</span>)}</div><a className="text-link" href={CONTACT.instagramUrl} target="_blank" rel="noreferrer"><Instagram />{CONTACT.instagramHandle}<ExternalLink /></a></div></div></section>
        <section id="faq" className="section section-wrap"><SectionHeading eyebrow={copy.faqEyebrow} title={copy.faqTitle} /><div className="faq-list">{copy.faqs.map((item, index) => <article key={item.q} className={faqOpen === index ? "open" : ""}><button type="button" onClick={() => setFaqOpen(faqOpen === index ? -1 : index)}><span>{String(index + 1).padStart(2, "0")}</span><b>{item.q}</b>{faqOpen === index ? <ChevronUp /> : <ChevronDown />}</button>{faqOpen === index && <p>{item.a}</p>}</article>)}</div></section>
        <section id="contact" className="contact-section"><div className="section section-wrap contact-grid"><div><p className="eyebrow">{copy.inquiryEyebrow}</p><h2>{copy.inquiryTitle}</h2><p>{copy.inquiryDescription}</p><div className="contact-direct"><a href={CONTACT.kakaoOpenChatUrl} target="_blank" rel="noreferrer"><MessageCircle /><span><b>KakaoTalk</b><small>Open chat</small></span><ExternalLink /></a><a href={CONTACT.instagramUrl} target="_blank" rel="noreferrer"><Instagram /><span><b>Instagram DM</b><small>{CONTACT.instagramHandle}</small></span><ExternalLink /></a></div></div><InquiryForm copy={copy} /></div></section>
      </main>

      <footer className="site-footer section-wrap"><div><b>365 Daily Snap</b><p>{copy.footerLine}</p></div><div className="footer-business"><span>{BUSINESS.name} · {copy.aboutTitle.includes("김경민") ? "대표" : "Representative"} {BUSINESS.representative}</span><span>{BUSINESS.registration} · {BUSINESS.onlineSales}</span><span>{BUSINESS.email}</span></div><button type="button" onClick={() => setPrivacyOpen(true)}>{copy.privacy}</button><p>© 2026 365 Daily Snap. All rights reserved.</p></footer>
      <div className="mobile-contact-bar"><button type="button" onClick={() => scrollTo("contact")}><CalendarDays />{copy.heroSecondary}</button><a href={CONTACT.kakaoOpenChatUrl} target="_blank" rel="noreferrer"><MessageCircle />Kakao</a></div>
      <ProjectModal project={projectModal} copy={copy} onClose={() => setProjectModal(null)} />
      <ReviewModal review={reviewModal} copy={copy} onClose={() => setReviewModal(null)} />
      {privacyOpen && <div className="modal-backdrop" onMouseDown={() => setPrivacyOpen(false)} role="presentation"><section className="privacy-modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}><button className="modal-close" type="button" onClick={() => setPrivacyOpen(false)}><X /></button><ShieldCheck /><h2>{copy.privacy}</h2><p>{copy.consentDetail}</p><dl><dt>Controller</dt><dd>{BUSINESS.name} · {BUSINESS.representative}</dd><dt>Contact</dt><dd>{BUSINESS.email}</dd><dt>Business address</dt><dd>{BUSINESS.address}</dd></dl></section></div>}
    </div>
  );
}

export default App;
