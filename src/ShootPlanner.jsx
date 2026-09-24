import { useEffect, useState } from "react";
import { ArrowRight, MapPin, ExternalLink, Clock3 } from "lucide-react";
import "./styles/planner.css";

export const PLACES = [
  { name: "경복궁 · 서촌", area: "서울", search: "경복궁", mood: "한옥 골목 · 차분한 영화의 한 장면", type: "인물 · 한복 · 커플", time: "평일 19시 이후 골목 야간 / 주말 협의", access: "경복궁역 인근 · 평일 저녁 우선 추천", cost: "골목 대관료 없음. 고궁 입장·한복 대여 별도", note: "고궁 내부는 개방 일정과 촬영 가능 여부 확인 후 진행합니다." },
  { name: "북촌 · 삼청동", area: "서울", search: "삼청동", mood: "전통 · 한옥 · 단정한 색감", type: "한복 · 인물 · 프로필", time: "주말 낮 협의", access: "안국역·경복궁역에서 이동", cost: "야외 대관료 없음. 유료 공간 이용료 별도", note: "주거 구역 방문 가능 시간과 현장 촬영 안내를 먼저 확인합니다." },
  { name: "광화문 · 청계천 · 종로", area: "서울", search: "광화문", mood: "도시의 불빛 · 시네마틱 · 야간", type: "야간 인물 · 커플 · 스트리트", time: "평일 19시 이후 / 주말 협의", access: "광화문역·종각역 · 퇴근 후 촬영 추천", cost: "일반 야외 대관료 없음. 주차·이동비 별도", note: "행사나 혼잡도에 따라 조용한 동선으로 조율합니다." },
  { name: "홍대 · 연남 · 경의선숲길", area: "서울", search: "홍대 연남", mood: "자유로운 거리 · 데일리 · 산책", type: "인물 · 커플 · 포트폴리오", time: "평일 저녁 이동시간 협의 / 주말 협의", access: "홍대입구역 · 경의중앙선", cost: "야외 대관료 없음. 카페 이용·대관 별도", note: "골목과 공원을 함께 담고, 실내 촬영은 공간 허가 후 진행합니다." },
  { name: "신촌 · 서강대", area: "서울", search: "신촌", mood: "청춘 · 자연스러운 표정 · 거리", type: "인물 · 프로필 · 스튜디오", time: "평일 19시 이후 이동시간 협의 / 주말 협의", access: "신촌역·서강대역 · 경의중앙선 연계", cost: "거리 대관료 없음. 스튜디오 대관료 별도", note: "캠퍼스 및 건물 내부는 사전 촬영 허가를 확인합니다." },
  { name: "일산역 · 탄현역", area: "일산·파주", search: "일산 탄현", mood: "동네의 편안함 · 일상 · 담백함", type: "인물 · 프로필 · 커플", time: "평일 저녁 이동시간 협의 / 주말 협의", access: "일산역·탄현역 · 경의중앙선", cost: "야외 대관료 없음. 실내 이용료 별도", note: "역 주변에서 만나 원하는 분위기의 동선을 함께 정합니다." },
  { name: "일산 호수공원", area: "일산·파주", search: "일산 호수공원", mood: "넓은 하늘 · 산책 · 여유로운 자연광", type: "커플 · 인물 · 프로필", time: "주말 낮·노을 협의 / 평일 야간 협의", access: "정발산역 등에서 공원으로 이동", cost: "일반 야외 대관료 없음. 주차료 별도", note: "계절별 일몰과 날씨에 맞춰 촬영 시간을 조율합니다." },
  { name: "야당역 · 파주", area: "일산·파주", search: "파주 야당", mood: "여유로운 거리 · 카페 · 컨셉", type: "인물 · 커플 · 스튜디오", time: "평일 저녁 이동시간 협의 / 주말 협의", access: "야당역 · 경의중앙선, 파주 내 장소별 협의", cost: "야외 대관료 없음. 카페·공간 대관료 별도", note: "파주 외곽은 이동 시간과 교통편을 먼저 함께 확인합니다." },
];
const MODES = [
  { name: "야외", en: "OUTDOOR", title: "거리의 빛, 당신의 분위기.", text: "골목과 공원, 도시의 조명을 배경으로 걸으며 자연스러운 순간을 담습니다.", benefits: "다양한 배경 · 편안한 움직임 · 계절감", cost: "일반 공공 야외 공간 대관료 0원부터", note: "날씨에 따라 일정·장소 조율. 입장료, 의상 대여, 주차비는 별도입니다." },
  { name: "실내", en: "INDOOR", title: "머무는 공간이 만드는 장면.", text: "카페와 촬영 가능한 실내 공간에서 차분한 표정과 일상의 결을 기록합니다.", benefits: "차분한 분위기 · 날씨 영향 적음 · 공간의 개성", cost: "음료·입장료 또는 공간별 대관료 별도", note: "상업·인물 촬영 가능 여부를 사전에 확인합니다. 일반 영업 공간은 조명·의상 교체가 제한될 수 있습니다." },
  { name: "스튜디오", en: "STUDIO", title: "빛부터 배경까지, 원하는 대로.", text: "프로필부터 컨셉 화보, 스포츠 유니폼까지. 조명과 배경을 함께 계획하는 촬영입니다.", benefits: "프라이빗 · 의상 교체 편리 · 조명과 배경 조절", cost: "계획용 대관 예산 약 1만~4만원+/시간", note: "촬영료와 별도이며 공간·시간·인원·장비에 따라 달라집니다. 최소 예약 시간과 실제 요금은 원본 페이지에서 확인해주세요. 평일 저녁은 자연광 대신 조명 촬영을 추천합니다." },
];
const MOODS = ["자연스러운", "시네마틱", "한복 화보", "야간 인물", "서울 스트리트", "커플 스냅", "스튜디오 프로필", "야구 화보"];
const searchUrl = (query) => `https://search.naver.com/search.naver?query=${encodeURIComponent(query)}`;
export const emptyPlan = { setting: "야외", region: "경복궁 · 서촌", mood: "자연스러운", portfolio: "", studioUrl: "", pinterestUrl: "" };

export function BrandMark() {
  return <><span className="brand-frame">365<i /></span><span className="brand-signature"><b>Daily Snap</b><small>PORTRAITS OF YOUR EVERYDAY</small></span></>;
}

export function ShootPlanner({ plan, onChange, onInquiry }) {
  const [query, setQuery] = useState("자연스러운 portrait photography");
  const place = PLACES.find((item) => item.name === plan.region) || PLACES[0];
  const area = place.area;
  const mode = MODES.find((item) => item.name === plan.setting) || MODES[0];
  const studioQuery = `${place.search} ${plan.mood} 렌탈스튜디오`;
  const pinterestQuery = query.trim() || `${plan.mood} portrait photography`;
  return <section id="planner" className="section section-wrap shoot-planner">
    <div className="planner-heading"><div><p className="eyebrow">YOUR NEXT SCENE / 01 — 03</p><h2>어떤 장면을<br /><em>남기고 싶나요?</em></h2></div><p>사진에서 찾은 취향에 장소와 분위기를 더해보세요.<br />선택한 내용은 촬영 문의에 그대로 이어집니다.</p></div>
    <div className="availability"><Clock3 /><strong>평일 19:00 이후 · 주말 협의</strong><span>서울 중심 / 일산·파주 가능 · 경복궁역 인근 평일 저녁 추천</span></div>
    <div className="planner-layout"><div className="planner-main">
      <h3 className="planner-step"><span>01</span> 촬영 방식</h3>
      <div className="setting-tabs" role="group" aria-label="촬영 방식">{MODES.map((item) => <button key={item.name} type="button" aria-pressed={plan.setting === item.name} onClick={() => onChange({ setting: item.name })}><small>{item.en}</small>{item.name}<span>↗</span></button>)}</div>
      <div className="setting-detail" aria-live="polite"><h3>{mode.title}</h3><p>{mode.text}</p><p className="planner-benefit">{mode.benefits}</p><strong>{mode.cost}</strong><small>{mode.note}</small>{plan.setting === "스튜디오" && <a className="planner-source" href="https://www.spacecloud.kr/host/1663819616" target="_blank" rel="noreferrer">대관 요금 참고 사례 ↗</a>}</div>
      <h3 className="planner-step"><span>02</span> 만나고 싶은 동네</h3>
      <div className="area-switch" role="group" aria-label="지역">{["서울", "일산·파주"].map((item) => <button key={item} type="button" aria-pressed={area === item} onClick={() => { onChange({ region: PLACES.find((p) => p.area === item).name }); }}>{item}</button>)}</div>
      <div className="place-grid">{PLACES.filter((item) => item.area === area).map((item) => <button key={item.name} type="button" aria-pressed={plan.region === item.name} onClick={() => onChange({ region: item.name })}><MapPin /><strong>{item.name}</strong><small>{item.mood}</small></button>)}</div>
      <article className="place-detail" aria-live="polite"><p className="eyebrow">LOCATION NOTES</p><h3>{place.name}</h3><dl><div><dt>분위기</dt><dd>{place.mood}</dd></div><div><dt>추천 촬영</dt><dd>{place.type}</dd></div><div><dt>추천 시간</dt><dd>{place.time}</dd></div><div><dt>접근성</dt><dd>{place.access}</dd></div><div><dt>공간 비용</dt><dd>{plan.setting === "야외" ? place.cost : mode.cost}</dd></div></dl><p>{place.note}</p><button type="button" className="text-link" onClick={onInquiry}>이 장소로 문의하기 <ArrowRight /></button></article>
      {plan.setting === "스튜디오" && <div className="studio-finder"><p className="eyebrow">FIND YOUR STUDIO</p><h3>{place.search}, 촬영 공간 찾아보기</h3><p>지역과 분위기를 담은 검색어로 후보를 찾아보세요. 마음에 드는 공간의 링크를 아래에 붙여주세요.</p><div className="external-searches"><a href={searchUrl(`site:spacecloud.kr ${studioQuery}`)} target="_blank" rel="noreferrer">스페이스클라우드 공간 검색 <ExternalLink /></a><a href={searchUrl(`site:hourplace.co.kr ${studioQuery}`)} target="_blank" rel="noreferrer">아워플레이스 공간 검색 <ExternalLink /></a><a href={`https://map.naver.com/p/search/${encodeURIComponent(`${place.search} 렌탈스튜디오`)}`} target="_blank" rel="noreferrer">네이버지도에서 찾기 <ExternalLink /></a></div><small>플랫폼별 검색은 네이버 검색 결과로 연결됩니다. 사진·실시간 가격은 원본에서 확인해주세요.</small><label>희망 스튜디오 링크<input type="url" value={plan.studioUrl} onChange={(e) => onChange({ studioUrl: e.target.value })} placeholder="https://…" /></label></div>}
      <h3 className="planner-step"><span>03</span> 원하는 분위기와 레퍼런스</h3>
      <div className="mood-chips" role="group" aria-label="분위기">{MOODS.map((item) => <button key={item} type="button" aria-pressed={plan.mood === item} onClick={() => { onChange({ mood: item }); setQuery(item); }}>{item}</button>)}</div>
      <form className="pinterest-search" action="https://www.pinterest.com/search/pins/" method="get" target="_blank" rel="noreferrer"><label htmlFor="pinterest-search">Pinterest에서 촬영 레퍼런스 찾기</label><div><input id="pinterest-search" name="q" value={query} placeholder={pinterestQuery} onChange={(e) => setQuery(e.target.value)} required /><button className="button primary" type="submit">검색 <ExternalLink /></button></div></form>
      <p className="reference-note">한복·야간·스트리트 등 분위기 버튼을 누르면 검색어가 채워집니다. 다른 작가의 사진은 원본 링크로 함께 봅니다.</p>
      <label className="reference-url">Pinterest / 참고 작품 링크<input type="url" value={plan.pinterestUrl} onChange={(e) => onChange({ pinterestUrl: e.target.value })} placeholder="https://www.pinterest.com/pin/…" /></label>
    </div><aside className="plan-summary"><p className="eyebrow">MY SHOOT NOTE</p><h3>당신의 다음 장면</h3><div className="note-rule" /><dl><div><dt>촬영 방식</dt><dd>{plan.setting}</dd></div><div><dt>장소</dt><dd>{plan.region}</dd></div><div><dt>분위기</dt><dd>{plan.mood}</dd></div>{plan.portfolio && <div><dt>참고 작품</dt><dd>{plan.portfolio}</dd></div>}</dl><p>평일 19시 이후 · 주말 협의<br />촬영료와 공간 이용료는 상담 후 확정합니다.</p><button className="button primary" type="button" onClick={onInquiry}>이 선택으로 문의하기 <ArrowRight /></button><small>아직 정하지 못한 항목은 문의하며 함께 정해요.</small></aside></div>
  </section>;
}

export function InstagramSyncStatus() {
  const [state, setState] = useState(null);
  useEffect(() => { const controller = new AbortController(); Promise.all([
    fetch("/portfolio/instagram-feed.json", { cache: "no-cache", signal: controller.signal }).then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
    fetch("/portfolio/instagram-status.json", { cache: "no-cache", signal: controller.signal }).then((r) => r.ok ? r.json() : {}).catch(() => ({})),
  ]).then(([feed, status]) => setState({ feed, status })).catch(() => { if (!controller.signal.aborted) setState({ error: true }); }); return () => controller.abort(); }, []);
  const count = state?.feed?.projects?.length || 0;
  return <details className="instagram-status"><summary>Instagram 연동 상태 · {state === null ? "확인 중" : count ? `${count}개 게시물` : "연결 확인 필요"}</summary><p>{state?.error ? "동기화 정보를 불러오지 못했습니다." : state?.status?.error || (count ? "동기화한 게시물을 포트폴리오에 표시합니다." : "최신 게시물 동기화 내역이 없습니다. 현재 포트폴리오는 저장된 기존 작업입니다.")}</p><p>마지막 성공: {state?.feed?.updatedAt ? new Date(state.feed.updatedAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }) + " KST" : "아직 없음"} · 게시물 {count}개</p><a href="https://instagram.com/365daily.snap" target="_blank" rel="noreferrer">Instagram에서 최신 작업 보기 ↗</a></details>;
}
