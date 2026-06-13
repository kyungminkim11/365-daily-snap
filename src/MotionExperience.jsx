import { useEffect } from "react";
import "./motion-experience.css";

const REVEAL_SELECTORS = [
  "section",
  ".panel-card",
  ".portfolio-card",
  ".item-card",
  ".process-card",
  ".review-card",
  ".growth-card",
  ".package-card",
  ".faq-item",
  ".hero-gallery > *",
];

function isFinePointer() {
  return window.matchMedia?.("(pointer: fine)").matches;
}

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

export default function MotionExperience() {
  useEffect(() => {
    if (typeof window === "undefined" || prefersReducedMotion()) {
      document.documentElement.classList.add("motion-reduced");
      return undefined;
    }

    const root = document.documentElement;
    root.classList.add("motion-ready");

    const updateScrollProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      root.style.setProperty("--scroll-progress", String(Math.min(1, Math.max(0, progress))));
    };

    const handlePointerMove = (event) => {
      if (!isFinePointer()) return;
      root.style.setProperty("--pointer-x", `${event.clientX}px`);
      root.style.setProperty("--pointer-y", `${event.clientY}px`);
    };

    const revealTargets = Array.from(document.querySelectorAll(REVEAL_SELECTORS.join(","))).filter(
      (element) => !element.closest(".language-switcher, .instagram-quick-link, .chatbot, dialog, [data-no-motion]"),
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("motion-in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12%", threshold: 0.12 },
    );

    revealTargets.forEach((element, index) => {
      element.classList.add("motion-reveal");
      element.style.setProperty("--reveal-delay", `${Math.min(index % 8, 7) * 48}ms`);
      observer.observe(element);
    });

    const handleCardMove = (event) => {
      const card = event.target.closest?.(".portfolio-card, .gallery-card, .package-card, .growth-card, .review-card");
      if (!card || !isFinePointer()) return;
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      card.style.setProperty("--tilt-x", `${(-y * 4).toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${(x * 5).toFixed(2)}deg`);
      card.style.setProperty("--card-glow-x", `${event.clientX - rect.left}px`);
      card.style.setProperty("--card-glow-y", `${event.clientY - rect.top}px`);
    };

    const handleCardLeave = (event) => {
      const card = event.target.closest?.(".portfolio-card, .gallery-card, .package-card, .growth-card, .review-card");
      if (!card) return;
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    };

    updateScrollProgress();
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", updateScrollProgress);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("pointermove", handleCardMove, { passive: true });
    document.addEventListener("pointerleave", handleCardLeave, true);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", updateScrollProgress);
      window.removeEventListener("resize", updateScrollProgress);
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointermove", handleCardMove);
      document.removeEventListener("pointerleave", handleCardLeave, true);
      root.classList.remove("motion-ready");
    };
  }, []);

  return (
    <div className="motion-experience" aria-hidden="true" data-no-motion="true">
      <div className="motion-scroll-progress" />
      <div className="motion-pointer-aura" />
      <div className="motion-grain" />
      <div className="motion-orbit motion-orbit-one">
        <span />
      </div>
      <div className="motion-orbit motion-orbit-two">
        <span />
      </div>
      <div className="motion-frame motion-frame-one" />
      <div className="motion-frame motion-frame-two" />
      <div className="motion-film-strip">
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}
