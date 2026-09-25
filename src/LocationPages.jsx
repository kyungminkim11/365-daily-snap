import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, MapPin, Search, TrainFront } from 'lucide-react';
import { DistrictMap, StationSearch, MAPS } from './DistrictExplorer';
import { PLACES, LINES, CATEGORIES, filterPlaces } from './data/shootPlaces';
import './styles/website.css';

export const placePath = (language, place) => `/${language}/locations/${encodeURIComponent(place.id)}`;
export function SiteLink({ href, navigate, children, ...props }) {
  return <a href={href} {...props} onClick={e => { if (!e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey && e.button === 0) { e.preventDefault(); navigate(href); } }}>{children}</a>;
}
export function PageHeading({ eyebrow, title, text, children }) {
  return <header className="page-heading section-wrap"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{text && <p>{text}</p>}{children}</header>;
}
function PlaceCard({ place, language, navigate }) {
  return <article className="catalog-card"><SiteLink href={placePath(language, place)} navigate={navigate}><div className={`place-card-art category-${CATEGORIES.indexOf(place.category)}`} aria-hidden="true"><span>{place.area}</span><b>{place.category}</b><i /><em>{place.districts[0]}</em><ArrowRight /></div><div className="place-card-copy"><small>{place.area} / {place.districts.join(' · ')}</small><h3>{place.name}</h3><p>{place.mood}</p><div className="station-badges">{place.stations.length ? place.stations.slice(0,2).map(s => <span key={s.name}><TrainFront />{s.name}</span>) : <span>버스·차량·선박 이동</span>}</div><span className="location-pick">장소 상세 보기 <ArrowRight /></span></div></SiteLink></article>;
}
export function LocationCatalog({ language, navigate }) {
  const read = () => { const q = new URLSearchParams(window.location.search); return { area: q.get('area') || '', district:q.get('district') || '', line:q.get('line') || '', stationName:q.get('station') || '', category:q.get('category') || '', query:q.get('q') || '', view:q.get('view') === 'list' ? 'list' : 'map', page:Math.max(1,Number(q.get('p')) || 1) }; };
  const [filters,setFilters] = useState(read);
  useEffect(() => { const pop = () => setFilters(read()); window.addEventListener('popstate',pop); return () => window.removeEventListener('popstate',pop); }, []);
  const change = patch => setFilters(old => {
    const next = {...old,...patch,page:patch.page || 1};
    const q = new URLSearchParams();
    for (const [key,value] of Object.entries(next)) if (value && !(key==='page' && value===1)) q.set(({stationName:'station',query:'q',page:'p'})[key] || key,value);
    window.history.replaceState({},'',`${window.location.pathname}${q.size ? '?'+q : ''}`);
    return next;
  });
  const results=filterPlaces(filters);
  const totalPages=Math.max(1,Math.ceil(results.length/12));
  const page=Math.min(filters.page,totalPages);
  const mapArea=MAPS[filters.area] ? filters.area : '서울';
  const reset=()=>change({area:'',district:'',line:'',stationName:'',category:'',query:''});
  return <main className="catalog-page"><PageHeading eyebrow="THE LOCATION ATLAS" title="어디서 만나볼까요?" text="익숙한 동네부터 조금 먼 바다까지. 당신의 장면이 될 장소를 찾아보세요."><div className="catalog-stats"><span><b>{PLACES.length}</b> 촬영 후보</span><span><b>67</b> 시·군·구</span><span><b>{LINES.length}</b> 접근 노선</span></div></PageHeading>
    <section className="section-wrap catalog-body" aria-label="촬영지 찾기"><div className="catalog-topbar"><div className="area-switch" aria-label="촬영 권역">{['','서울','경기','인천'].map(a=><button type="button" key={a} aria-pressed={filters.area===a} onClick={()=>change({area:a,district:'',stationName:''})}>{a || '수도권 전체'}</button>)}</div><div className="view-switch" aria-label="보기 방식">{[['map','지도와 함께'],['list','장소별로 보기']].map(([v,t])=><button type="button" key={v} aria-pressed={filters.view===v} onClick={()=>change({view:v})}>{t}</button>)}</div></div>
    <div className={`catalog-discovery ${filters.view==='list'?'list-only':''}`}>
      {filters.view==='map' && <div className="catalog-map"><DistrictMap area={mapArea} key={mapArea} district={filters.district} stationName={filters.stationName} onSelect={district=>change({area:mapArea,district,stationName:''})}/>{!filters.area && <p className="station-scope">현재 지도는 서울입니다. 위에서 경기·인천을 선택하면 해당 지도가 열려요. 목록은 수도권 전체를 보여드립니다.</p>}</div>}
      <aside className="catalog-filters"><p className="eyebrow">FIND YOUR SCENE</p><h2>어떤 곳을 찾으세요?</h2><label className="field-label" htmlFor="place-search">장소명·동네 검색</label><div className="catalog-search"><Search/><input id="place-search" value={filters.query} placeholder="두물머리, 송도, 성북…" onChange={e=>change({query:e.target.value})}/></div>
      <label className="field-label" htmlFor="catalog-district">시·군·구</label><select id="catalog-district" value={filters.district} onChange={e=>change({district:e.target.value, area:e.target.selectedOptions[0].dataset.area || filters.area,stationName:''})}><option value="">지역 전체</option>{Object.entries(MAPS).filter(([a])=>!filters.area || a===filters.area).map(([a,features])=><optgroup key={a} label={a}>{features.map(f=><option key={f.name} value={f.name} data-area={a}>{f.name}</option>)}</optgroup>)}</select>
      <label className="field-label" htmlFor="catalog-line">지하철·철도 호선</label><select id="catalog-line" value={filters.line} onChange={e=>change({line:e.target.value,stationName:'',district:'',area:''})}><option value="">모든 호선</option>{LINES.map(l=><option key={l}>{l}</option>)}</select>
      <StationSearch value={filters.stationName} resetKey={filters.line+filters.area+filters.district} line={filters.line} onSelect={stationName=>change({stationName,area:'',district:''})} onClear={()=>change({stationName:''})}/><p className="station-scope">호선을 고르면 해당 노선의 접근역이 있는 장소를 추천합니다. 역 선택은 권역·지역 조건을 풀고 검색하며, 버스 환승이 필요한 장소도 포함합니다.</p>
      <span className="field-label">장소의 분위기</span><div className="category-filters">{['',...CATEGORIES].map(c=><button type="button" key={c} aria-pressed={filters.category===c} onClick={()=>change({category:c})}>{c || '전체'}</button>)}</div><button className="text-link filter-reset" type="button" onClick={reset}>검색 조건 초기화 ↺</button></aside></div>
    <div id="location-results" className="catalog-result-heading" aria-live="polite"><div><p className="eyebrow">PLACES TO MEET</p><h2>{filters.stationName || filters.line || filters.district || filters.area || '모든 장소'} <em>{results.length}</em></h2></div><p>{[filters.area,filters.district,filters.line,filters.category,filters.query].filter(Boolean).join(' · ') || '마음이 가는 장소를 하나씩 살펴보세요.'}</p></div>
    <div className="catalog-grid">{results.slice((page-1)*12,page*12).map(p=><PlaceCard key={p.id} place={p} language={language} navigate={navigate}/>)}</div>
    {!results.length && <div className="location-no-results"><h3>조건에 맞는 장소가 아직 없어요.</h3><p>다른 지역이나 호선을 선택하거나 검색 조건을 풀어보세요.</p><button type="button" className="button ghost" onClick={reset}>모든 촬영지 보기</button></div>}
    {totalPages>1 && <nav className="catalog-pagination" aria-label="촬영지 목록 페이지"><button disabled={page===1} onClick={()=>{change({page:page-1});document.getElementById('location-results').scrollIntoView();}}>이전</button><span>{page} / {totalPages}</span><button disabled={page===totalPages} onClick={()=>{change({page:page+1});document.getElementById('location-results').scrollIntoView();}}>다음 <ArrowRight/></button></nav>}
    <p className="location-editorial-note">장소의 분위기는 촬영을 위한 편집 제안입니다. 실제 촬영 구역·운영 시간·입장료·상업 촬영 허가는 일정 확정 전에 확인합니다.</p></section></main>;
}
export function LocationDetail({ place, language, navigate, onInquiry }) {
  const related=PLACES.filter(p=>p.id!==place.id && p.area===place.area && p.districts.some(d=>place.districts.includes(d))).slice(0,3);
  return <main><div className="section-wrap place-breadcrumb"><SiteLink href={`/${language}/locations`} navigate={navigate}><ArrowLeft/> 촬영지 찾기</SiteLink><span>{place.area} / {place.districts.join(' · ')}</span></div><section className="section-wrap venue-hero"><div><p className="eyebrow">{place.area} / {place.category}</p><h1>{place.name}</h1><p className="venue-mood">{place.mood}</p><div className="station-badges">{place.stations.map(s=><SiteLink key={s.name} href={`/${language}/locations?station=${encodeURIComponent(s.name)}&view=list`} navigate={navigate}><TrainFront/>{s.name} · {s.lines.join(' / ')}</SiteLink>)}</div><button type="button" className="button primary" onClick={()=>onInquiry({region:place.name,setting:'야외'})}>이 장소로 촬영 문의 <ArrowRight/></button></div><div className="venue-map"><DistrictMap area={place.area} district={place.districts[0]} onSelect={district=>navigate(`/${language}/locations?area=${place.area}&district=${encodeURIComponent(district)}`)}/></div></section>
  <section className="section-wrap venue-notes"><div><p className="eyebrow">LOCATION NOTES</p><h2>이곳에서 남길 장면</h2><p>{place.mood}. 걷는 모습과 잠시 머무는 순간을 섞어 장소의 분위기와 인물을 함께 담는 코스를 제안합니다.</p><p>{place.note}</p><div className="venue-links"><a className="button ghost" href={`https://map.naver.com/p/search/${encodeURIComponent(place.search)}`} target="_blank" rel="noreferrer">위치·이동 동선 확인 ↗</a><a className="text-link" href={place.source} target="_blank" rel="noreferrer">지역 관광 안내 ↗</a></div></div><dl>{[['추천 촬영',place.type],['촬영 시간',place.time],['교통 안내',place.access],['공간 비용',place.cost]].map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></section>
  {related.length>0 && <section className="section-wrap venue-related"><p className="eyebrow">AROUND HERE</p><h2>같은 지역의 다른 장면</h2><div className="catalog-grid">{related.map(p=><PlaceCard key={p.id} place={p} language={language} navigate={navigate}/>)}</div></section>}</main>;
}
