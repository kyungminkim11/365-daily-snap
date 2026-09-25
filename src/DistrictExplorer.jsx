import { useEffect, useId, useRef, useState } from "react";
import { Search, TrainFront, X, ZoomIn, ZoomOut } from "lucide-react";
import maps from "./data/districtMaps.json";
import { STATIONS, filterPlaces, normalizeSearch } from "./data/shootPlaces";
import "./styles/district-explorer.css";

export const MAPS = { "서울": maps.seoul, "경기": maps.gyeonggi, "인천": maps.incheon };


export function StationSearch({ value, resetKey, onSelect, onClear, line = '' }) {
  const id = useId();
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const input = useRef(null);
  useEffect(() => { setQuery(value); setOpen(false); setActive(-1); }, [value, resetKey]);
  const needle = normalizeSearch(query).replace(/역$/, "");
  const options = STATIONS.filter((item) => (!line || item.lines.includes(line)) && (!needle || normalizeSearch(item.name).includes(needle) || item.lines.some((line) => normalizeSearch(line).includes(needle))));
  const choose = (station) => { setQuery(station.name); setOpen(false); setActive(-1); onSelect(station.name); };
  const closeOnLeave = (event) => { if (!event.currentTarget.contains(event.relatedTarget)) { setOpen(false); setActive(-1); setQuery(value); } };
  return <div className="station-search" onBlur={closeOnLeave}>
    <label htmlFor={`${id}-input`}><TrainFront />지하철역으로 찾기</label>
    <div className="station-input-wrap"><Search /><input ref={input} id={`${id}-input`} role="combobox" aria-autocomplete="list" aria-expanded={open} aria-controls={`${id}-list`} aria-activedescendant={open && active >= 0 ? `${id}-option-${active}` : undefined} autoComplete="off" placeholder="예: 홍대입구, 한성대입구, 경의중앙선" value={query} onFocus={() => setOpen(true)} onChange={(event) => { setQuery(event.target.value); setOpen(true); setActive(-1); }} onKeyDown={(event) => {
      if (event.key === "ArrowDown") { event.preventDefault(); setOpen(true); setActive((index) => Math.min(index + 1, options.length - 1)); }
      if (event.key === "ArrowUp" && options.length) { event.preventDefault(); setActive((index) => Math.max(index - 1, 0)); }
      if (event.key === "Escape") { setOpen(false); setQuery(value); }
      if (event.key === "Enter" && options.length) { event.preventDefault(); choose(options[Math.max(active, 0)]); }
    }} />{(query || value) && <button type="button" aria-label="역 검색 초기화" onClick={() => { setQuery(""); onClear(); setOpen(false); input.current?.focus(); }}><X /></button>}</div>
    {open && <div className="station-options" id={`${id}-list`} role="listbox" aria-label="검색된 지하철역">{options.length ? options.map((item, index) => <button type="button" role="option" id={`${id}-option-${index}`} key={item.name} aria-selected={index === active} className={index === active ? "focused" : ""} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(item)} ref={(element) => { if (index === active && element) element.scrollIntoView({ block: "nearest" }); }}><strong>{item.name}</strong><span>{item.lines.join(" · ")}</span></button>) : <p role="status">등록된 촬영지와 연결된 역이 없습니다.<br />다른 역이나 지역구로 찾아보세요.</p>}</div>}
  </div>;
}

export function DistrictMap({ area, district, stationName, onSelect }) {
  const [hovered, setHovered] = useState("");
  const [zoom, setZoom] = useState(false);
  const features = MAPS[area];
  const shownName = hovered || district;
  const shownCount = filterPlaces({ area, district: shownName }).length;
  return <div className="district-map-card">
    <div className="district-map-top"><div><p className="eyebrow">{area === '서울' ? 'SEOUL / 25 DISTRICTS' : area === '경기' ? 'GYEONGGI / 31 CITIES' : 'INCHEON / 11 AREAS'}</p><h4>지도에서 만나볼까요?</h4></div><button type="button" className="map-zoom" aria-pressed={zoom} onClick={() => setZoom((value) => !value)}>{zoom ? <ZoomOut /> : <ZoomIn />}{zoom ? "전체 보기" : "지도 확대"}</button></div>
    <p className="map-instructions">궁금한 구역을 눌러 촬영 장소를 살펴보세요.</p>
    <div className={`district-map-viewport ${zoom ? "is-zoomed" : ""}`}>
      <svg className="district-map-svg" viewBox="0 0 760 600" role="group" aria-label={`${area} 촬영 지역 지도`}>
        <g className="map-compass" aria-hidden="true"><path d="M45 72V40m-5 8 5-8 5 8" /><text x="45" y="29">N</text></g>
        {features.map((feature) => {
          const count = filterPlaces({ area, district: feature.name }).length;
          const active = district === feature.name;
          const stationMatch = stationName && filterPlaces({ area, district: feature.name, stationName }).length > 0;
          return <g className={`district-shape ${active ? "selected" : ""} ${stationMatch ? "station-match" : ""}`} key={feature.name} role="button" tabIndex={0} aria-label={`${feature.name} 촬영지 ${count}곳`} aria-pressed={active} onMouseEnter={() => setHovered(feature.name)} onMouseLeave={() => setHovered("")} onFocus={() => setHovered(feature.name)} onBlur={() => setHovered("")} onClick={() => onSelect(feature.name)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(feature.name); } }}>
            <path d={feature.path} fillRule="evenodd" />
          </g>;
        })}
        <g className="district-labels" aria-hidden="true">{features.map(f=><g key={f.name} className={`district-label ${district===f.name?'selected':''} ${hovered===f.name?'hovered':''}`}>
          {f.anchor && <path d={`M${f.anchor.join(',')}L${f.label.join(',')}`} />}
          <text x={f.label[0]} y={f.label[1]}>{f.name}</text>
        </g>)}</g>
      </svg>
    </div>
    <div className="map-caption"><div aria-live="polite"><i /><strong>{shownName || `${area} 전체`}</strong><span>촬영 후보 {shownCount}곳</span></div><small>{hovered && hovered !== district ? "클릭하면 이 지역의 장소가 보여요" : "진한 색은 선택한 지역"}</small></div>
    {district && <div className="map-district-peek" aria-live="polite"><span>{district}에서 이런 장면을 만나요</span><p>{filterPlaces({ area, district }).map((place) => place.name).join(" / ")}</p><button type="button" onClick={() => document.getElementById("location-results")?.scrollIntoView({ behavior: "smooth", block: "start" })}>촬영 장소 목록 보기 ↓</button></div>}
    <details className="map-credits"><summary>지도 안내 및 출처</summary><p>SGIS 기반 admdongkor 2026년 7월 경계를 단순화한 지역 선택용 지도입니다. 경기의 일반구는 시 단위로 합쳤으며, 인천 옹진군은 왼쪽 아래에 축소 배치했습니다. 정확한 길찾기는 장소별 지도 링크를 이용해주세요. <a href="/licenses/map-attribution.txt" target="_blank" rel="noreferrer">원본·라이선스 보기 ↗</a></p></details>
  </div>;
}
