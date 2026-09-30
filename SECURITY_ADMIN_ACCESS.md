# 365 Daily Snap 관리자 페이지 보호 설정

관리자 페이지는 프론트엔드에서 가리는 방식이 아니라, 요청이 정적 파일에 도달하기 전에 먼저 차단해야 합니다.
현재 저장소에는 Netlify Edge Function 기반 관리자 보호가 적용되어 있습니다.

## 현재 적용된 방식

`netlify/edge-functions/admin-protect.js`가 아래 경로에 접근하기 전에 먼저 실행됩니다.

- `snap.lavalabs.co.kr/admin`
- `snap.lavalabs.co.kr/admin.html`
- `snap.lavalabs.co.kr/admin-v2.html`
- `snap.lavalabs.co.kr/manager`
- `snap.lavalabs.co.kr/api/content`
- `snap.lavalabs.co.kr/api/inquiries`
- `snap.lavalabs.co.kr/api/upload-media`

## 사용 방법

관리자 페이지에 접속하면 브라우저 기본 인증창이 먼저 뜹니다.

- Username: 아무 값이나 입력해도 됩니다. 예: `admin`
- Password: 기존 관리자 토큰과 같은 값입니다.

인증 전에는 관리자 HTML이 내려가지 않으므로 관리자 화면이 먼저 보이지 않습니다.

## 기존 관리자 토큰의 역할

기존 `NETLIFY_ADMIN_TOKEN` 환경 변수를 그대로 사용합니다.

- Edge Function: 관리자 페이지와 관리자 API 진입 전 1차 차단
- 기존 관리자 API: 저장/수정 요청 시 `X-Admin-Token`으로 2차 확인

즉 같은 값을 사용하지만, 역할은 두 단계입니다.

## 완료 후 확인 방법

1. 시크릿 창에서 `https://snap.lavalabs.co.kr/admin` 접속
2. 브라우저 인증창이 먼저 떠야 함
3. 인증 전에는 관리자 화면이 보이면 안 됨
4. `https://snap.lavalabs.co.kr/admin.html` 직접 접속도 같은 방식으로 막혀야 함
5. 인증 후 관리자 페이지에 들어가서 기존 관리자 토큰이 다시 필요하면 같은 값을 입력하면 됨

## Cloudflare Access로 바꾸고 싶을 때

나중에 Cloudflare Zero Trust를 쓰면 이메일 로그인 기반으로 바꿀 수 있습니다.
그 경우 허용 계정은 `auth@lavalabs.co.kr`만 두는 것을 권장합니다.
