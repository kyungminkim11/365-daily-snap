import { ArrowRight } from "lucide-react";

const COPY = {
  ko: {
    title: "사진을 읽지 말고, 직접 움직여 보세요.",
    description: "조리개·셔터스피드·ISO부터 심도, 화각, 렌즈 선택, 필터·마이크·조명·삼각대 같은 촬영 장비까지 한 번에 배울 수 있습니다.",
    exposure: "노출 체험",
    lenses: "렌즈 가이드",
    gear: "장비 사전",
    open: "Photo Lab 둘러보기",
  },
  ja: {
    title: "写真の仕組みを、動かしながら学ぶ。",
    description: "絞り、シャッタースピード、ISO、被写界深度、画角、レンズ選び、フィルターやマイクなどの機材を体験できます。",
    exposure: "露出体験",
    lenses: "レンズガイド",
    gear: "機材ガイド",
    open: "Photo Labを見る",
  },
  en: {
    title: "Learn photography by moving the controls.",
    description: "Explore exposure, depth of field, focal length, lenses, filters, microphones, lighting and camera accessories.",
    exposure: "Exposure",
    lenses: "Lens guide",
    gear: "Gear guide",
    open: "Open Photo Lab",
  },
};

export function PhotoLabEntry({ language = "ko", onOpen }) {
  const copy = COPY[language] || COPY.ko;

  return (
    <section className="photo-lab-entry section-wrap" aria-labelledby="photo-lab-entry-title">
      <div>
        <p className="eyebrow">PHOTO LAB</p>
        <h2 id="photo-lab-entry-title">{copy.title}</h2>
        <p>{copy.description}</p>
        <div className="photo-lab-entry-links" aria-label="Photo Lab 바로가기">
          <button type="button" onClick={() => onOpen("#exposure")}>{copy.exposure}</button>
          <button type="button" onClick={() => onOpen("#lenses")}>{copy.lenses}</button>
          <button type="button" onClick={() => onOpen("#gear")}>{copy.gear}</button>
        </div>
      </div>
      <button className="button primary" type="button" onClick={() => onOpen()}>
        {copy.open}<ArrowRight />
      </button>
    </section>
  );
}
