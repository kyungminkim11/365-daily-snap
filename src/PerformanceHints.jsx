import { useEffect } from "react";

export default function PerformanceHints() {
  useEffect(() => {
    const applyHints = () => {
      const images = Array.from(document.querySelectorAll("img"));
      images.forEach((image, index) => {
        image.setAttribute("decoding", "async");
        if (index > 2 && !image.hasAttribute("loading")) {
          image.setAttribute("loading", "lazy");
        }
      });
    };

    applyHints();
    const timer = window.setInterval(applyHints, 1600);
    return () => window.clearInterval(timer);
  }, []);

  return null;
}
