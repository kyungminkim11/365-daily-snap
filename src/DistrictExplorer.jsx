import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, MapPin, Search, TrainFront, X, ZoomIn, ZoomOut } from "lucide-react";
import maps from "./data/districtMaps.json";
import { PLACES, STATIONS, filterPlaces, normalizeSearch } from "./data/shootPlaces";
import "./styles/district-explorer.css";

const MAPS = { "서울": maps.seoul, "일산·파주": maps.west };
const POPULAR = ["경복궁역", "홍대입구역", "한성대입구역", "일산역", "야당역"];

function StationSearch({ value, resetKey, onSelect, onClear }) {
  const id = useId();
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const input = useRef(null);
  useEffect(() => { setQuery(value); setOpen(false); setActive(-1); }, [value, resetKey]);
  const needle = normalizeSearch(query).replace(/역$/, "");
  const options = STATIONS.filter((item) => !needle || normalizeSearch(item.name).includes(needle) || item.lines.some((line) => normalizeSearch(line).includes(needle)));
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

function DistrictMap({ area, district, stationName, onSelect }) {
  const [hovered, setHovered] = useState("");
  const [zoom, setZoom] = useState(false);
  const features = MAPS[area];
  const shownName = hovered || district;
  const shownCount = filterPlaces({ area, district: shownName }).length;
  return <div className="district-map-card">
    <div className="district-map-top"><div><p className="eyebrow">{area === "서울" ? "SEOUL / 25 DISTRICTS" : "GOYANG & PAJU / 4 AREAS"}</p><h4>지도에서 만나볼까요?</h4></div><button type="button" className="map-zoom" aria-pressed={zoom} onClick={() => setZoom((value) => !value)}>{zoom ? <ZoomOut /> : <ZoomIn />}{zoom ? "전체 보기" : "지도 확대"}</button></div>
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
            <text x={feature.label[0]} y={feature.label[1]} aria-hidden="true">{feature.name}</text>
          </g>;
        })}
      </svg>
    </div>
    <div className="map-caption"><div aria-live="polite"><i /><strong>{shownName || (area === "서울" ? "서울 전체" : "고양·파주 전체")}</strong><span>촬영 후보 {shownCount}곳</span></div><small>{hovered && hovered !== district ? "클릭하면 이 지역의 장소가 보여요" : "진한 색은 선택한 지역"}</small></div>
    {district && <div className="map-district-peek" aria-live="polite"><span>{district}에서 이런 장면을 만나요</span><p>{filterPlaces({ area, district }).map((place) => place.name).join(" / ")}</p><button type="button" onClick={() => document.getElementById("location-results")?.scrollIntoView({ behavior: "smooth", block: "start" })}>촬영 장소 목록 보기 ↓</button></div>}
    <details className="map-credits"><summary>지도 안내 및 출처</summary><p>서울: JUSO 2015 · 고양/파주: KOSTAT 2013 공개 경계를 단순화한 지역 선택용 지도입니다. 정확한 길찾기는 장소별 지도 링크를 이용해주세요. <a href="/licenses/map-attribution.txt" target="_blank" rel="noreferrer">원본·라이선스 보기 ↗</a></p></details>
  </div>;
}

export default function DistrictExplorer({ selectedPlace, onSelect }) {
  const initialPlace = PLACES.find((item) => item.name === selectedPlace) || PLACES[0];
  const [area, setArea] = useState(initialPlace.area);
  const [district, setDistrict] = useState(initialPlace.districts[0]);
  const [stationName, setStationName] = useState("");
  const [searchKey, setSearchKey] = useState(0);
  const results = filterPlaces({ area, district, stationName });
  const selectDistrict = (name) => { setDistrict(name); setStationName(""); setSearchKey((value) => value + 1); };
  const selectArea = (name) => { setArea(name); selectDistrict(""); };
  const selectStation = (name) => {
    const candidates = PLACES.filter((place) => place.stations.some((station) => station.name === name));
    if (!candidates.length) return;
    const nextArea = candidates[0].area;
    const districts = [...new Set(candidates.flatMap((place) => place.districts))];
    setArea(nextArea);
    setDistrict(districts.length === 1 ? districts[0] : "");
    setStationName(name);
    setSearchKey((value) => value + 1);
  };
  return <div id="locations" className="district-explorer">
    <div className="explorer-intro"><p>가고 싶은 동네나 편한 지하철역부터 골라보세요.</p><span>{PLACES.length}개의 촬영 후보</span></div>
    <div className="area-switch" role="group" aria-label="촬영 권역">{Object.keys(MAPS).map((name) => <button key={name} type="button" aria-pressed={area === name} onClick={() => selectArea(name)}>{name === "일산·파주" ? "일산·고양·파주" : "서울 25개 구"}</button>)}</div>
    <DistrictMap key={area} area={area} district={district} stationName={stationName} onSelect={selectDistrict} />
    <div className="location-search-tools"><label className="district-select" htmlFor="district-select"><MapPin />지역구로 찾기<select id="district-select" value={district} onChange={(event) => selectDistrict(event.target.value)}><option value="">{area === "서울" ? "서울 전체" : "고양·파주 전체"}</option>{MAPS[area].map((item) => <option key={item.name} value={item.name}>{item.name} · {filterPlaces({ area, district: item.name }).length}곳</option>)}</select></label><StationSearch resetKey={searchKey} value={stationName} onSelect={selectStation} onClear={() => setStationName("")} /></div>
    <div className="popular-stations"><span>자주 찾는 역</span>{POPULAR.map((name) => <button type="button" key={name} aria-pressed={stationName === name} onClick={() => selectStation(name)}>{name}</button>)}</div>
    <p className="station-scope">등록 촬영지의 접근역을 검색합니다. 역에 따라 버스·도보 이동이 더 필요할 수 있어요.</p>
    <div id="location-results" className="location-results-heading" aria-live="polite"><div><p className="eyebrow">FIND YOUR LOCATION</p><h4>{stationName || district || (area === "서울" ? "서울" : "고양·파주")}에서 만나는 장면 <span>{results.length}</span></h4></div>{(district || stationName) && <button type="button" onClick={() => selectDistrict("")}>선택 초기화</button>}</div>
    {stationName && <div className="active-location-filter"><TrainFront /><span>{stationName} 접근 촬영지</span><button type="button" aria-label="선택한 역 해제" onClick={() => { setStationName(""); setSearchKey((value) => value + 1); }}><X /></button></div>}
    <div className="location-results" role="list" aria-label="추천 촬영 장소">{results.map((place, index) => <article className={`location-result ${selectedPlace === place.name ? "chosen" : ""}`} key={place.name} role="listitem"><button type="button" className="location-result-select" aria-pressed={selectedPlace === place.name} onClick={() => onSelect(place)}><span className="location-index">{String(index + 1).padStart(2, "0")}</span><span className="location-result-main"><small>{place.districts.join(" · ")}</small><strong>{place.name}</strong><span>{place.mood}</span><span className="station-badges">{place.stations.map((station) => <span key={station.name}><TrainFront />{station.name}</span>)}</span><span className="location-pick">{selectedPlace === place.name ? "선택한 촬영 장소" : "이 장소 살펴보기"}<ArrowRight /></span></span></button></article>)}</div>
    {!results.length && <div className="location-no-results"><p>이 조건에 등록된 촬영 후보가 없습니다.</p><button type="button" className="button ghost" onClick={() => selectDistrict("")}>이 권역의 전체 장소 보기</button></div>}
    <p className="location-editorial-note">촬영 후보는 분위기를 기준으로 제안한 장소입니다. 실제 촬영 구역과 일정은 함께 확인해요.</p>
  </div>;
}
