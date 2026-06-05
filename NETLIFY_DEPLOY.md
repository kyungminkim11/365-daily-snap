# 365 Daily Snap Netlify 배포 순서

이 프로젝트는 단순 정적 사이트만이 아니라 관리자 페이지, 문의 저장, 사진/영상 저장, 챗봇을 함께 사용합니다.
따라서 `dist` 폴더만 Netlify에 드래그해서 올리는 방식은 피해주세요. 그 방식은 Netlify Functions가 빠져서 관리자 저장과 문의 저장이 동작하지 않습니다.

## 포함된 구조

- React/Vite 홈페이지
- `/admin.html` 관리자 페이지
- `/api/content` 포트폴리오/프로젝트 저장 API
- `/api/inquiries` 문의 저장/관리 API
- `/api/upload-media` 관리자 사진/영상 업로드 API
- `/api/media/*` 업로드된 사진/영상 보기 API
- Netlify Blobs 기반 데이터 저장
- 무료 규칙 기반 상담 챗봇

## Netlify에서 처음 배포하기

1. 이 폴더 전체를 GitHub 저장소에 올립니다.
2. Netlify에서 `Add new site` -> `Import an existing project`를 선택합니다.
3. GitHub 저장소를 연결합니다.
4. 빌드 설정은 아래처럼 둡니다.

```text
Build command: npm run build
Publish directory: dist
```

5. Netlify 사이트 설정에서 환경 변수를 추가합니다.

```text
NETLIFY_ADMIN_TOKEN=내가_정한_긴_관리자_비밀번호
```

6. Deploy를 실행합니다.
7. 배포가 끝나면 아래 주소를 엽니다.

```text
https://내사이트주소.netlify.app
https://내사이트주소.netlify.app/admin.html
```

8. 관리자 페이지에서 토큰을 물어보면 `NETLIFY_ADMIN_TOKEN`에 넣은 값을 입력합니다.
9. 관리자 페이지에서 사진/프로젝트/후기/문의 목록이 정상 저장되는지 확인합니다.

## 로컬에서 Netlify 방식으로 테스트하기

처음 한 번:

```bash
npm install
```

`.env.example`을 참고해서 로컬 `.env` 파일을 만들고 토큰을 넣습니다.

```bash
NETLIFY_ADMIN_TOKEN=내가_정한_긴_관리자_비밀번호
```

Netlify Functions까지 포함해서 실행:

```bash
npm run netlify:dev
```

브라우저에서 아래 주소를 엽니다.

```text
http://localhost:8888
http://localhost:8888/admin.html
```

일반 로컬 개발만 할 때는 기존처럼 실행해도 됩니다.

```bash
npm run dev
```

## 업로드 제한 안내

Netlify Functions에는 요청 크기 제한이 있습니다. 현재 관리자 페이지는 이미지 업로드 시 브라우저에서 크기를 줄인 뒤 파일별로 `/api/upload-media`에 먼저 저장하고, 프로젝트에는 저장된 주소만 남깁니다.
그래서 일반 사진 여러 장은 운영하기 좋습니다.

다만 긴 영상이나 원본 고화질 사진은 제한에 걸릴 수 있습니다. Netlify의 동기 함수는 요청/응답 본문이 6MB로 제한되고, 이미지 같은 바이너리 업로드는 Base64 인코딩 때문에 실제로는 약 4.5MB 이하가 안전합니다.

영상까지 안정적으로 많이 운영하려면 다음 단계에서 Cloudinary, Supabase Storage 같은 미디어 저장소를 연결하는 방식이 더 좋습니다.
지금 구조는 Netlify만으로 시작하기 좋은 1차 운영 버전입니다.

## 보안 주의

- `/admin.html` 주소 자체는 외부에서도 열릴 수 있습니다.
- 저장/문의 관리는 관리자 토큰이 있어야 동작합니다.
- 토큰은 인스타그램, 카카오톡, 공개 문서에 절대 올리지 마세요.
- 토큰이 노출되면 Netlify 환경 변수에서 새 값으로 바꾼 뒤 다시 배포하세요.
