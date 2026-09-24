// Curated starting points, not a live transit/distance API. Station names refer
// to access options; walking routes and venue permissions are checked separately.
const PARKS = "https://parks.seoul.go.kr/content.do?key=2604070017";
const SEOUL = "https://www.seoul.go.kr/storyw/sasaek/list.do";
const GOYANG = "https://www.goyang.go.kr/ilswgu/index.do";
const SEONGBUK = "https://english.visitseoul.net/tours/scent-of-spring-in-seongbuk-dong-en_/9843";
const station = (name, lines) => ({ name, lines: lines.split("/") });
const s = {
  gyeongbok: station("경복궁역", "3호선"), anguk: station("안국역", "3호선"), gwanghwa: station("광화문역", "5호선"), jonggak: station("종각역", "1호선"), jongno3: station("종로3가역", "1호선/3호선/5호선"), hyehwa: station("혜화역", "4호선"),
  hongdae: station("홍대입구역", "2호선/경의중앙선/공항철도"), hapjeong: station("합정역", "2호선/6호선"), mangwon: station("망원역", "6호선"), sinchon: station("신촌역", "2호선"), sogang: station("서강대역", "경의중앙선"), worldcup: station("월드컵경기장역", "6호선"),
  cityhall: station("시청역", "1호선/2호선"), euljiro3: station("을지로3가역", "2호선/3호선"), seoul: station("서울역", "1호선/4호선/경의중앙선/공항철도"), hoehyeon: station("회현역", "4호선"), ichon: station("이촌역", "4호선/경의중앙선"), noksapyeong: station("녹사평역", "6호선"),
  seoulforest: station("서울숲역", "수인분당선"), ttukseom: station("뚝섬역", "2호선"), seongsu: station("성수역", "2호선"), eungbong: station("응봉역", "경의중앙선"), jayang: station("자양역", "7호선"), grandpark: station("어린이대공원역", "7호선"), gunja: station("군자역", "5호선/7호선"),
  hoegi: station("회기역", "1호선/경의중앙선/경춘선"), dapsimni: station("답십리역", "5호선"), meokgol: station("먹골역", "7호선"), jungnang: station("중랑역", "경의중앙선/경춘선"), yangwon: station("양원역", "경의중앙선"),
  hansung: station("한성대입구역", "4호선"), bomun: station("보문역", "6호선/우이신설선"), gireum: station("길음역", "4호선"), miasageori: station("미아사거리역", "4호선"), suyu: station("수유역", "4호선"), dobongsan: station("도봉산역", "1호선/7호선"), gongneung: station("공릉역", "7호선"), hwarangdae: station("화랑대역", "6호선"),
  gupabal: station("구파발역", "3호선"), eungam: station("응암역", "6호선"), hongje: station("홍제역", "3호선"), dokripmun: station("독립문역", "3호선"), kkachi: station("까치산역", "2호선/5호선"), magongnaru: station("마곡나루역", "9호선/공항철도"),
  hangdong: station("온수역", "1호선/7호선"), cheonwang: station("천왕역", "7호선"), geumcheon: station("금천구청역", "1호선"), seonyudo: station("선유도역", "9호선"), yeouinaru: station("여의나루역", "5호선"), nodeul: station("노들역", "9호선"), boramae: station("보라매공원역", "신림선"), nakseongdae: station("낙성대역", "2호선"), terminal: station("고속터미널역", "3호선/7호선/9호선"), yangjae: station("양재시민의숲역", "신분당선"), apgujeongrodeo: station("압구정로데오역", "수인분당선"), seonjeong: station("선정릉역", "9호선/수인분당선"), jamsil: station("잠실역", "2호선/8호선"), seokchon: station("석촌역", "8호선/9호선"), olympic: station("올림픽공원역", "5호선/9호선"), mongchon: station("몽촌토성역", "8호선"), amsa: station("암사역", "8호선"), cheonho: station("천호역", "5호선/8호선"),
  ilsan: station("일산역", "경의중앙선/서해선"), tanhyeon: station("탄현역", "경의중앙선"), jeongbalsan: station("정발산역", "3호선"), pungsan: station("풍산역", "경의중앙선/서해선"), wondang: station("원당역", "3호선"), hwajeong: station("화정역", "3호선"), yadang: station("야당역", "경의중앙선"), unjeong: station("운정역", "경의중앙선"), geumneung: station("금릉역", "경의중앙선"),
};

function place(name, districts, stations, mood, extra = {}) {
  const districtList = districts.split("/");
  const area = districtList.some((d) => ["일산서구", "일산동구", "덕양구", "파주시"].includes(d)) ? "일산·파주" : "서울";
  return {
    name, districts: districtList, stations, area, search: name,
    mood, type: "인물 · 커플 · 프로필", time: "주말 낮·노을 협의 / 평일 19시 이후 가능 여부 협의",
    access: stations.map((item) => item.name).join(" · ") + "에서 접근 · 정확한 동선은 지도에서 확인",
    cost: "입장·주차·공간 이용료 발생 시 별도 안내",
    note: "촬영 가능 구역·운영 시간·현장 혼잡도를 확인한 뒤 동선을 정합니다. 분위기와 시간대는 촬영 제안입니다.",
    source: area === "서울" ? PARKS : GOYANG,
    ...extra,
  };
}

export const PLACES = [
  place("경복궁 · 서촌", "종로구", [s.gyeongbok], "한옥 골목 · 차분한 영화의 한 장면", { time: "평일 19시 이후 서촌 골목 우선 추천 / 주말 협의", type: "인물 · 한복 · 커플", note: "고궁 내부 촬영은 개방 일정·입장권·촬영 허가를 별도로 확인합니다.", source: SEOUL }),
  place("북촌 · 삼청동", "종로구", [s.anguk], "전통 · 한옥 · 단정한 색감", { time: "주말 낮 협의", note: "주거 구역 방문 시간과 촬영 제한을 확인하고 주민의 일상을 배려합니다.", source: SEOUL }),
  place("광화문 · 청계천 · 종로", "종로구/중구", [s.gwanghwa, s.jonggak], "도시의 불빛 · 시네마틱 · 야간", { time: "평일 19시 이후 추천 / 주말 협의", source: SEOUL }),
  place("낙산공원 · 대학로", "종로구", [s.hyehwa], "성곽 · 언덕 · 노을과 야경", { note: "오르막과 계단이 있어 편한 신발을 추천하며 주거 골목은 조용히 이동합니다." }),
  place("익선동 골목", "종로구", [s.jongno3], "한옥과 도시 · 골목 · 따뜻한 조명", { note: "붐비는 시간은 피하고 가게 앞·실내 촬영은 허가 후 진행합니다.", source: SEOUL }),
  place("홍대 · 연남 · 경의선숲길", "마포구", [s.hongdae], "자유로운 거리 · 데일리 · 산책"),
  place("망원한강공원", "마포구", [s.mangwon], "넓은 강변 · 바람 · 일상의 여유", { note: "역에서 강변까지 이동이 필요합니다. 바람과 일몰 시간에 맞춰 조율합니다." }),
  place("월드컵공원 · 하늘공원", "마포구", [s.worldcup], "풀밭 · 열린 하늘 · 계절의 색", { time: "주말 낮·노을 협의", note: "하늘공원은 오르막 이동과 입장 가능 시간을 확인합니다." }),
  place("문화비축기지", "마포구", [s.worldcup], "콘크리트 · 구조물 · 모던한 화보", { note: "야외 동선 중심으로 제안하며 실내 탱크 공간과 상업 촬영은 별도 확인합니다." }),
  place("신촌 · 서강대", "서대문구/마포구", [s.sinchon, s.sogang], "청춘 · 자연스러운 표정 · 거리", { note: "신촌 거리와 서강대 인근을 잇는 코스입니다. 캠퍼스·건물 내부는 허가를 확인합니다.", source: SEOUL }),
  place("안산 자락길", "서대문구", [s.dokripmun], "숲길 · 부드러운 빛 · 산책", { time: "주말 낮 협의", note: "역에서 숲길 진입까지 추가 이동이 필요해 동선과 체력을 고려합니다.", source: SEOUL }),
  place("홍제천 산책로", "서대문구", [s.hongje], "물가 · 산책 · 편안한 일상", { source: SEOUL }),
  place("덕수궁 돌담길 · 정동", "중구", [s.cityhall], "고전적인 거리 · 담백한 커플 · 가을빛", { source: SEOUL }),
  place("을지로 골목", "중구", [s.euljiro3], "네온 · 오래된 거리 · 시네마틱", { time: "평일 19시 이후 / 주말 저녁 협의", note: "영업장·작업장 앞 촬영은 사전 동의를 구하고 통행을 방해하지 않습니다.", source: SEOUL }),
  place("서울로7017", "중구", [s.seoul, s.hoehyeon], "도시의 선 · 산책길 · 야간 조명"),
  place("용산가족공원", "용산구", [s.ichon], "잔디 · 나무 · 자연스러운 인물", { time: "주말 낮·노을 협의" }),
  place("해방촌 · 경리단길", "용산구", [s.noksapyeong], "언덕 골목 · 도시 풍경 · 데일리", { note: "언덕 이동이 있는 코스입니다. 카페와 사유지 촬영은 허가 후 진행합니다.", source: SEOUL }),
  place("이촌한강공원", "용산구", [s.ichon], "강변 · 노을 · 차분한 커플"),
  place("서울숲", "성동구", [s.seoulforest, s.ttukseom], "초록 · 산책 · 부드러운 자연광"),
  place("성수 연무장길", "성동구", [s.seongsu], "벽돌 · 스트리트 · 도시적인 프로필", { source: "https://english.visitseoul.net/other/Seongsu-Handmade-Shoes-Street/ENP027649", note: "가게와 팝업 공간은 촬영 허가가 필요할 수 있어 골목 중심으로 동선을 정합니다." }),
  place("응봉산", "성동구", [s.eungbong], "서울 전망 · 노을 · 야경", { note: "계단·오르막 이동이 있습니다. 해 진 뒤에는 안전한 동선과 조명을 먼저 확인합니다." }),
  place("뚝섬한강공원", "광진구", [s.jayang], "강변 · 넓은 하늘 · 캐주얼", { note: "자양역(옛 뚝섬유원지역)에서 접근합니다. 축제·피크닉 혼잡도를 확인합니다." }),
  place("어린이대공원", "광진구", [s.grandpark, s.gunja], "나무와 산책길 · 밝은 표정 · 계절감", { time: "주말 낮 협의" }),
  place("간데메공원", "동대문구", [s.dapsimni], "동네 공원 · 담백함 · 자연광"),
  place("배봉산 둘레길", "동대문구", [s.hoegi], "숲길 · 차분함 · 산책", { time: "주말 낮 협의", note: "회기역에서 버스 등 추가 이동 후 접근합니다. 숲길 촬영 동선은 미리 조율합니다.", source: SEOUL }),
  place("중랑장미공원", "중랑구", [s.meokgol], "장미길 · 물가 · 로맨틱", { note: "꽃의 상태는 계절마다 다릅니다. 역에서 공원까지 도보 이동을 포함해 계획합니다.", source: SEOUL }),
  place("중랑캠핑숲", "중랑구", [s.yangwon], "푸른 산책길 · 여유 · 인물", { time: "주말 낮 협의", note: "공원 산책 구역을 제안하며 예약 캠핑 구역과 이용객의 사생활은 피합니다." }),
  place("성북동 골목", "성북구", [s.hansung], "낮은 담장 · 조용한 골목 · 전통", { time: "주말 낮 협의", source: SEONGBUK }),
  place("성북천 산책로", "성북구", [s.hansung, s.bomun], "물가의 일상 · 담백한 인물 · 산책", { source: "https://stage-kr.visitseoul.net/editorspicks/2026-Seongbokdong/KON3kn4qk" }),
  place("북서울꿈의숲", "강북구", [s.miasageori, s.gireum], "넓은 잔디 · 연못 · 여유", { time: "주말 낮 협의", note: "미아사거리역 또는 길음역에서 버스 등 추가 이동이 필요합니다." }),
  place("우이천 산책로", "강북구", [s.suyu], "하천 · 일상 · 편안한 커플", { source: SEOUL }),
  place("서울창포원", "도봉구", [s.dobongsan], "정원 · 물가 · 산을 배경으로", { time: "주말 낮 협의" }),
  place("경춘선숲길 · 화랑대 철도공원", "노원구", [s.gongneung, s.hwarangdae], "철길 · 레트로 · 산책", { note: "공릉 구간과 화랑대 구간은 거리가 있으므로 출발역에 맞춰 구간을 정합니다." }),
  place("은평한옥마을", "은평구", [s.gupabal], "한옥 · 산 배경 · 단정한 인물", { time: "주말 낮 협의", note: "구파발역에서 버스 등 추가 이동이 필요합니다. 주거 공간의 촬영은 사전 확인합니다.", source: SEOUL }),
  place("불광천 산책로", "은평구", [s.eungam], "하천 · 봄빛 · 일상 스냅", { source: SEOUL }),
  place("서서울호수공원", "양천구", [s.kkachi], "호수 · 구조물 · 미니멀", { note: "까치산역에서 도보 또는 버스로 이동합니다. 비행기 소리와 현장 이용객을 고려합니다." }),
  place("서울식물원 야외공원", "강서구", [s.magongnaru], "정원 · 넓은 산책길 · 모던", { note: "야외 공원 위주로 제안합니다. 온실·주제원 입장료 및 촬영 가능 여부는 별도 확인합니다." }),
  place("푸른수목원 · 항동철길", "구로구", [s.hangdong, s.cheonwang], "정원 · 산책 · 레트로", { time: "주말 낮 협의", note: "역에서 추가 도보·버스 이동이 필요합니다. 철길은 개방된 보행 구간만 이용합니다." }),
  place("안양천 금천구청역 구간", "금천구", [s.geumcheon], "물가 · 자전거길 옆 산책 · 노을", { note: "자전거 통행을 피한 보행 구역에서 촬영하며 계절별 출입 안내를 확인합니다.", source: SEOUL }),
  place("선유도공원", "영등포구", [s.seonyudo, s.hapjeong], "콘크리트와 초록 · 수변 · 감성", { note: "선유도역 또는 합정역에서 도보 이동합니다. 공원 내 촬영 규정과 개방 시간을 확인합니다." }),
  place("여의도한강공원", "영등포구", [s.yeouinaru], "강변 · 노을 · 도시 야경"),
  place("노들나루공원", "동작구", [s.nodeul], "산책 · 강변으로 이어지는 도시 · 데일리", { source: SEOUL }),
  place("보라매공원", "동작구", [s.boramae], "공원 · 열린 하늘 · 편안한 인물"),
  place("낙성대공원", "관악구", [s.nakseongdae], "나무 · 전통적인 공간 · 차분함", { time: "주말 낮 협의", note: "낙성대역에서 추가 이동합니다. 사당·기념 구역의 촬영은 별도 확인합니다.", source: "https://gfac.or.kr/uploadfile/ecms/media/media/2025/03/4a4e93e8fd7b888cb65793cd907f8ae5.pdf" }),
  place("반포한강공원", "서초구", [s.terminal], "한강 · 노을 · 야간 커플", { note: "고속터미널역에서 공원까지 이동합니다. 분수 가동은 일정·날씨에 따라 달라집니다." }),
  place("매헌시민의숲", "서초구", [s.yangjae], "나무 사이의 빛 · 산책 · 인물", { time: "주말 낮 협의" }),
  place("도산공원", "강남구", [s.apgujeongrodeo], "도심 속 초록 · 정돈된 인물 · 산책", { time: "주말 낮 협의", source: SEOUL }),
  place("선정릉 주변 거리", "강남구", [s.seonjeong], "나무와 도시 · 담백한 프로필", { note: "주변 거리 중심 코스입니다. 왕릉 내부는 입장·촬영 규정을 별도로 확인합니다.", source: SEOUL }),
  place("석촌호수", "송파구", [s.jamsil, s.seokchon], "호수 · 계절감 · 로맨틱", { source: "https://www.songpa.go.kr/culture/" }),
  place("올림픽공원", "송파구", [s.olympic, s.mongchon], "넓은 잔디 · 산책 · 영화 같은 구도", { note: "공원이 넓어 출발역에 맞춰 촬영 구역을 정합니다. 행사·시설별 제한을 확인합니다.", source: "https://www.ksponco.or.kr/menu.es?mid=a20109000000" }),
  place("광나루한강공원", "강동구", [s.amsa], "강변 · 갈대 · 여유로운 산책"),
  place("천호공원", "강동구", [s.cheonho], "동네의 초록 · 소박함 · 데일리"),
  place("일산역 · 탄현역", "일산서구", [s.ilsan, s.tanhyeon], "동네의 편안함 · 일상 · 담백함", { note: "두 역 사이는 촬영 동선과 이동 방법을 함께 정합니다. 경의로 누리길 일부 구간을 제안합니다." }),
  place("탄현 경의로 산책길", "일산서구", [s.tanhyeon], "익숙한 동네 · 산책 · 편안한 인물"),
  place("일산 호수공원", "일산동구", [s.jeongbalsan], "넓은 하늘 · 산책 · 여유로운 자연광", { source: "https://goyang.go.kr/visitgoyang/www/tourRsrcView.do?categ=1669809941180&key=652&tourRsrcNo=545" }),
  place("밤리단길 · 정발산", "일산동구", [s.pungsan, s.jeongbalsan], "골목 · 카페 · 따뜻한 데일리", { note: "역에서 도보·버스 이동을 포함합니다. 카페 내부 촬영은 매장 허가 후 진행합니다." }),
  place("화정 문화의거리", "덕양구", [s.hwajeong], "도시의 일상 · 거리 · 캐주얼", { note: "역 앞 만남이 편리한 코스로 제안합니다. 상가·행사 동선은 현장에서 조율합니다." }),
  place("야당역 · 파주", "파주시", [s.yadang], "여유로운 거리 · 카페 · 컨셉", { source: "https://tour.paju.go.kr/", note: "야당역 주변 거리 중심으로 촬영합니다. 카페·실내 공간은 사전 허가가 필요합니다." }),
  place("운정호수공원", "파주시", [s.unjeong, s.yadang], "호수 · 산책 · 자연스러운 커플", { source: "https://www.paju.go.kr/user/board/BD_board.view.do?bbsCd=2001&seq=20251002160602183", note: "운정역·야당역에서 버스 등 추가 이동을 고려합니다. 만나는 입구는 상담 후 정합니다." }),
  place("금릉역 중앙공원 주변", "파주시", [s.geumneung], "동네 공원 · 산책 · 담백한 프로필", { source: "https://tour.paju.go.kr/", note: "역 주변과 공원을 잇는 코스로 제안합니다. 행사와 현장 이용 상황에 맞춰 조율합니다." }),
];

export const STATIONS = Object.values(s).filter((item) => PLACES.some((place) => place.stations.some((station) => station.name === item.name))).sort((a, b) => a.name.localeCompare(b.name, "ko"));
export const normalizeSearch = (value) => String(value).normalize("NFKC").replace(/\s|·/g, "").toLowerCase();
export function matchesStation(place, stationName) {
  return !stationName || place.stations.some((item) => item.name === stationName);
}
export function filterPlaces({ area = "서울", district = "", stationName = "" }) {
  return PLACES.filter((place) => place.area === area && (!district || place.districts.includes(district)) && matchesStation(place, stationName));
}

