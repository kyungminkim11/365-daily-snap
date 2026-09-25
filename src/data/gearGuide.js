export const CHECKED='2026.09.25';
const canon='https://kr.canon/company/notice/detail/436415';
const fuji='https://fujifilm-korea.co.kr/products/camera?category=1006&ordering=recommend&priceLower=0';
const fl='https://fujifilm-korea.co.kr/products/lens';
const sony='https://www.sony.co.kr/interchangeable-lens-cameras/aps-c-e-mount-mirrorless';
export const BRANDS=[
 ['Canon','캐논','RF / RF-S','EOS R 카메라와 RF 렌즈를 중심으로 살펴보세요. APS-C 바디에서도 RF 렌즈를 사용할 수 있어요.','중고 EF·EF-M 렌즈는 RF와 다른 규격입니다. 이름에 캐논이 있다고 바로 결합되지는 않아요.',canon],
 ['Sony','소니','E / FE','APS-C와 풀프레임이 E 마운트를 공유합니다. FE는 풀프레임 영역까지 담는 렌즈 표기예요.','E 렌즈라도 APS-C용인지 풀프레임용인지 확인하세요. ZV 계열은 사진용 뷰파인더 유무도 살펴보세요.',sony],
 ['Nikon','니콘','Z / Z DX','Z 미러리스에서 DX는 APS-C를 뜻해요. 같은 Z 렌즈도 센서에 따라 담기는 범위가 달라져요.','DSLR용 F 마운트와 Z는 다릅니다. 어댑터 사용 시 자동초점 지원도 따로 확인하세요.','https://www.nikc.nikon.com/product/nikkor'],
 ['Fujifilm','후지필름','X','X 시리즈는 APS-C 카메라와 렌즈를 고르는 출발점입니다. 작은 단렌즈로 산책용 구성을 생각해보세요.','GFX용 GF 렌즈는 X 마운트와 다릅니다. X100 시리즈는 렌즈 교환식이 아니에요.',fuji],
 ['Panasonic','파나소닉 루믹스','L / Micro Four Thirds','S 계열의 L 마운트와 G 계열의 마이크로 포서드를 나눠 살펴보세요.','같은 LUMIX 이름이라도 S와 G 렌즈는 서로 바로 결합되지 않아요.','https://www.panasonic.com/global/consumer/lumix/s/L-Mount.html'],
 ['Sigma','시그마','제품별 마운트 선택','여러 카메라 시스템에 맞는 렌즈를 만듭니다. 밝은 단렌즈와 줌렌즈를 함께 비교할 수 있어요.','같은 초점거리·제품명에도 마운트별 버전이 있습니다. DC는 APS-C, DG는 풀프레임용 표기를 확인하세요.','https://www.sigma-global.com/en/lenses/'],
 ['Tamron','탐론','제품별 마운트 선택','여행용 줌부터 밝은 표준 줌까지, 원하는 촬영 범위를 기준으로 찾아보세요.','판매 페이지에서 카메라의 정확한 마운트와 센서 대응을 확인하세요. 모든 렌즈가 모든 마운트로 나오지는 않아요.','https://www.tamron.com/global/consumer/lenses/'],
].map(([id,name,mount,about,caution,url])=>({id,name,mount,about,caution,url}));
// Prices are documented reference figures, never live offers. Recommendations are editorial.
const camera=(id,brand,name,mount,sensor,price,basis,tags,good,caution,url)=>({id,brand,name,mount,sensor,price,basis,tags,good,caution,url,kind:'카메라'});
const lens=(id,brand,name,mount,sensor,price,tags,good,caution,url,basis='공식 표기가 · 렌즈 단품')=>({id,brand,name,mount,sensor,price,basis,tags,good,caution,url,kind:'렌즈'});
export const PRODUCTS=[
 camera('r100','Canon','EOS R100 + 18–45mm','RF','APS-C',859000,'6월 가격 공지 · 렌즈 키트',['입문','여행'],'첫 카메라와 표준 줌을 한 번에 준비하는 예산형 후보.','조작감과 화면 구동 방식은 매장에서 먼저 체험하세요.',canon),
 camera('r50','Canon','EOS R50 + 18–45mm','RF','APS-C',1219000,'6월 가격 공지 · 렌즈 키트',['입문','일상','인물'],'산책과 가족사진부터 시작할 때 비교할 기본 구성.','실내 인물의 배경 흐림이 우선이면 밝은 단렌즈를 추가로 고려하세요.',canon),
 camera('r10','Canon','EOS R10 + 18–150mm','RF','APS-C',1659000,'6월 가격 공지 · 렌즈 키트',['여행','일상'],'렌즈 교체를 줄이고 가까운 풍경부터 먼 장면까지 연습하는 구성.','넓은 줌 범위가 필요 없다면 작은 표준 줌 구성이 더 간단해요.',canon),
 camera('r7','Canon','EOS R7','RF','APS-C',1889000,'6월 가격 공지 · 바디만',['망원','여행'],'망원 촬영을 꾸준히 배워갈 때 렌즈와 함께 비교할 후보.','렌즈 비용이 별도입니다. 원하는 피사체에 맞는 망원부터 계산하세요.',canon),
 camera('r8','Canon','EOS R8 + 24–50mm','RF','풀프레임',2214000,'6월 가격 공지 · 렌즈 키트',['인물','여행'],'풀프레임과 기본 줌으로 시작하려는 사람을 위한 구성.','바디 내 손떨림 보정이 없어요. 느린 셔터에서는 자세와 렌즈 보정도 중요해요.',canon),
 camera('a6700','Sony','α6700','E','APS-C',1890000,'공식 표기가 · 바디만',['영상','여행','인물'],'사진과 영상 모두 비중이 높을 때 비교할 APS-C 후보.','렌즈는 별도예요. 촬영 시간과 해상도에 맞는 메모리도 함께 확인하세요.',sony),
 camera('zve10ii','Sony','ZV-E10 II','E','APS-C',1340000,'공식 표기가 · 바디만',['영상','입문'],'혼자 말하며 찍는 영상과 일상 기록을 중심으로 고를 때.','눈을 대는 뷰파인더가 없어요. 햇빛 아래 화면으로 찍는 방식이 편한지 확인하세요.','https://www.sony.co.kr/electronics/interchangeable-lens-cameras/zv-e10m2'),
 camera('xm5','Fujifilm','X-M5','X','APS-C',1149000,'공식 카탈로그 시작가 · 구성 확인',['입문','일상','영상'],'작은 일상용 구성을 찾는 사람의 비교 후보.','시작가는 구성에 따라 달라져요. 렌즈 포함 여부와 재고를 확인하세요.',fuji),
 camera('xs20','Fujifilm','X-S20','X','APS-C',1799000,'공식 카탈로그 시작가 · 구성 확인',['영상','여행'],'사진과 영상을 함께 익히며 렌즈를 확장할 때.','바디 크기뿐 아니라 장착할 렌즈까지 들어보고 선택하세요.','https://fujifilm-korea.co.kr/products/id/1262'),
 camera('xt50','Fujifilm','X-T50','X','APS-C',1899000,'공식 카탈로그 시작가 · 구성 확인',['일상','여행'],'4020만 화소 카메라로 풍경과 일상을 세밀하게 기록하고 싶을 때.','큰 사진 파일은 저장 공간과 보정 작업량도 늘릴 수 있어요.',fuji),
 camera('z50ii','Nikon','Z50II','Z','APS-C',null,'국내 가격 확인 필요',['입문','인물','여행'],'눈을 대고 찍는 사진 촬영을 중심으로 비교할 Z 시스템 후보.','NIKKOR Z 렌즈라도 DX와 풀프레임용의 크기·화각을 구분하세요.','https://www.nikc.nikon.com/product/mirrorless/Z50II'),
 camera('z30','Nikon','Z30','Z','APS-C',null,'국내 가격 확인 필요',['영상','입문'],'화면을 보며 일상 영상을 기록하는 방식이 편한 사람에게.','뷰파인더가 없어요. 사진 중심이라면 Z50II와 촬영 자세를 비교하세요.','https://www.nikc.nikon.com/product/mirrorless/Z30'),
 camera('z5ii','Nikon','Z5II','Z','풀프레임',2380000,'공식 스토어 표기가 · 바디만',['인물','일상'],'풀프레임 Z 시스템으로 인물과 일상을 이어가려는 사람에게.','렌즈를 더하면 총예산이 올라갑니다. 바디 가격만으로 결정하지 마세요.','https://eshop.nikc.nikon.com/product/NK0003365'),
 lens('fe50','Sony','FE 50mm F1.8','E','풀프레임',329000,['입문','인물'],'풀프레임에서는 표준, APS-C에서는 약 75mm 상당으로 인물을 연습해요.','APS-C의 좁은 방에서는 화면에 담기 어려울 수 있어요. AF 작동음도 확인하세요.','https://www.sony.co.kr/electronics/camera-lenses/sel50f18f'),
 lens('e50','Sony','E 50mm F1.8 OSS','E','APS-C',375000,['입문','인물'],'APS-C에서 인물용 화각과 렌즈 손떨림 보정을 함께 살펴볼 후보.','FE 50mm와 다른 제품입니다. 풀프레임 전체 영역을 위한 렌즈는 아니에요.','https://www.sony.co.kr/electronics/camera-lenses/sel50f18'),
 lens('rf85','Canon','RF85mm F2 MACRO IS STM','RF','풀프레임',839000,['인물','접사'],'인물과 작은 소품을 함께 찍고 싶은 사람에게.','APS-C에서는 더 좁게 담겨요. 인물을 찍을 공간을 확보하세요.',canon,'6월 가격 공지 · 렌즈 단품'),
 lens('rf100400','Canon','RF100–400mm F5.6–8 IS USM','RF','풀프레임',1099000,['망원','여행'],'먼 풍경과 야외의 피사체를 당겨 찍는 연습용 후보.','어두운 실내보다 빛이 충분한 야외에서 시작하는 편이 수월해요.',canon,'6월 가격 공지 · 렌즈 단품'),
 lens('rf2470','Canon','RF24–70mm F2.8 L IS USM','RF','풀프레임',3299000,['인물','영상'],'여러 화각을 바꾸면서 F2.8로 촬영하려는 확장 단계.','입문 필수품은 아니에요. 가격과 휴대 부담을 감수할 사용 빈도인지 살펴보세요.',canon,'6월 가격 공지 · 렌즈 단품'),
 lens('rf24105','Canon','RF24–105mm F4 L IS USM','RF','풀프레임',1759000,['여행','일상'],'렌즈 하나로 여행의 다양한 거리를 담고 싶을 때.','배경을 많이 흐리는 것이 목적이면 밝은 단렌즈와 비교하세요.',canon,'6월 가격 공지 · 렌즈 단품'),
 lens('xf16','Fujifilm','XF16mmF2.8 R WR','X','APS-C',499000,['여행','일상'],'약 24mm 상당의 넓은 화각으로 골목과 풍경을 담아요.','인물을 너무 가까이에서 찍으면 얼굴과 몸의 원근감이 과장될 수 있어요.',fl,'공식 카탈로그 시작가'),
 lens('xf23','Fujifilm','XF23mmF2 R WR','X','APS-C',599000,['입문','일상','여행'],'약 35mm 상당. 사람과 주변 분위기를 함께 남기는 산책용 후보.','줌이 안 됩니다. 직접 앞뒤로 움직여 구도를 맞춰야 해요.',fl,'공식 카탈로그 시작가'),
 lens('xf18','Fujifilm','XF18mmF2 R','X','APS-C',799000,['일상','여행'],'약 27mm 상당으로 실내와 거리의 주변 맥락을 담아요.','인물 얼굴만 크게 담으려면 더 긴 화각도 비교하세요.',fl),
 lens('z40','Nikon','NIKKOR Z 40mm f/2 (SE)','Z','풀프레임',null,['입문','일상','인물'],'풀프레임에서는 일상, DX에서는 약 60mm 상당의 화각으로 활용해요.','DX에서 좁아지는 화각을 먼저 생각하세요. 가격은 공식 판매처에서 확인하세요.','https://www.nikc.nikon.com/product/nikkor/nikkor_z_40mm_f/2_%28special_edition%29'),
 lens('sigma56','Sigma','56mm F1.4 DC DN · Sony E용','E','APS-C',null,['인물'],'밝은 조리개로 APS-C 인물 촬영을 연습할 때 비교하는 후보.','여러 마운트 버전 중 이 카드는 Sony E용입니다. 초점이 맞는 범위가 얕아질 수 있어요.','https://www.sigma-global.com/en/lenses/c018_56_14/'),
 lens('sigma12','Sigma','12mm F1.4 DC · Fujifilm X용','X','APS-C',null,['여행','영상'],'좁은 공간과 넓은 풍경을 크게 담고 싶은 사람에게.','초광각은 가장자리의 인물 형태가 늘어져 보이기 쉬워요. 이 카드는 X용입니다.','https://www.sigma-global.com/en/lenses/c025_12_14/'),
];
export const BUDGETS=[
 {title:'100만 원 안에서 시작',product:'r100',reserve:100000,text:'렌즈가 포함된 기본 구성에 메모리·가방 등의 예산을 남겨요. 스마트폰으로 먼저 연습하며 구매를 미뤄도 좋습니다.'},
 {title:'150만 원 안에서 일상 사진',product:'r50',reserve:150000,text:'표준 줌으로 좋아하는 화각부터 찾아보세요. 밝은 단렌즈는 필요가 생긴 다음 추가해도 늦지 않아요.'},
 {title:'200만 원 안에서 여행',product:'r10',reserve:200000,text:'렌즈 교체 없이 다양한 거리를 담는 구성입니다. 산책할 때는 실제 무게를 꼭 들어보세요.'},
 {title:'250만 원 안에서 풀프레임',product:'r8',reserve:200000,text:'기본 줌을 포함한 풀프레임 시작 구성. 큰 센서보다 렌즈 밝기와 촬영 환경이 더 중요한 상황도 있어요.'},
];
export const BUYING_NOTES=[
 ['첫 카메라','매장에서 손잡이·버튼·메뉴를 직접 써보세요. 오래 들고 다닐 수 있는지가 사양표만큼 중요해요.'],
 ['첫 렌즈','처음에는 표준 줌으로 좋아하는 화각을 찾으세요. 자주 쓰는 화각이 생기면 단렌즈를 추가하는 순서도 좋아요.'],
 ['바디만 / 렌즈 키트','바디만 사면 렌즈 교환식 카메라로 사진을 찍을 수 없어요. 키트는 지정된 렌즈가 포함된 구성입니다.'],
 ['단렌즈 / 줌렌즈','단렌즈는 담기는 범위가 고정돼요. 줌렌즈는 제자리에서 범위를 바꿀 수 있어 여행에서 편리해요.'],
 ['F1.8 / F2.8 / F4','작은 F값은 빛을 더 받거나 배경을 흐릴 때 유리해요. 모든 사진을 가장 작은 F값으로 찍을 필요는 없어요.'],
 ['손떨림 보정','카메라를 쥔 손의 흔들림을 줄여줍니다. 뛰는 아이를 멈춰 담는 것은 빠른 셔터 속도의 역할이에요.'],
 ['메모리 카드','카메라 설명서의 카드 규격·영상 속도 조건을 확인하세요. 용량만 크다고 모든 녹화 모드를 지원하지는 않아요.'],
 ['배터리·충전','정품 또는 제조사가 허용한 전원 구성을 확인하고, 긴 산책에는 여분 배터리 예산을 잡으세요.'],
 ['삼각대·스트랩','야경에는 안정적인 삼각대가, 긴 산책에는 편한 스트랩이 도움이 돼요. 사용 목적이 생긴 뒤 선택하세요.'],
 ['중고 확인','센서·렌즈의 흠집, 곰팡이, 버튼, 초점, 카드 기록, 충전 동작을 확인하고 반품 조건과 구성품을 기록하세요.'],
 ['영상용 장비','마이크 입력, 화면 회전, 촬영 중 충전, 녹화 제한, 발열 조건을 실제 사용할 설정에 맞춰 확인하세요.'],
 ['구매 순서','카메라와 렌즈 → 메모리 → 휴대 방법 → 부족했던 부분의 추가 장비. 첫날 모든 장비를 갖출 필요는 없어요.'],
];
