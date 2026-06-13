# 365 Daily Snap 관리자 페이지 보호 설정

관리자 페이지는 프론트엔드에서 가리는 방식이 아니라 Cloudflare Access 같은 접근 제어로 먼저 막아야 합니다.

## 보호해야 하는 경로

아래 경로를 Cloudflare Access Application에 포함하세요.

- `snap.lavalabs.co.kr/admin`
- `snap.lavalabs.co.kr/admin.html`
- `snap.lavalabs.co.kr/admin-v2.html`
- `snap.lavalabs.co.kr/manager`
- `snap.lavalabs.co.kr/api/content`
- `snap.lavalabs.co.kr/api/inquiries`
- `snap.lavalabs.co.kr/api/upload-media`

## 허용할 계정

권장 허용 계정:

- `lavalabs.ceo@gmail.com`

## Cloudflare Access 권장 정책

- Application type: Self-hosted
- Application domain: `snap.lavalabs.co.kr`
- Path: `/admin*`
- 추가 Application 또는 정책으로 `/api/content`, `/api/inquiries`, `/api/upload-media` 보호
- Policy action: Allow
- Include: Emails
- Email: `lavalabs.ceo@gmail.com`
- Session duration: 24 hours 또는 7 days

## 왜 코드만으로 막으면 안 되는가

현재 관리자 페이지는 정적 파일입니다. 프론트엔드에서 입력창을 먼저 보여주더라도, 정적 파일 주소를 직접 열면 우회가 가능합니다.
따라서 관리자 화면이 렌더링되기 전에 Cloudflare Access가 요청 자체를 차단해야 합니다.

## 완료 후 확인 방법

1. 시크릿 창에서 `https://snap.lavalabs.co.kr/admin` 접속
2. Cloudflare 로그인 또는 이메일 인증 화면이 먼저 떠야 함
3. 인증 전에는 관리자 화면이 보이면 안 됨
4. 허용된 이메일로 인증 후에만 관리자 페이지가 보여야 함
5. `https://snap.lavalabs.co.kr/admin.html` 직접 접속도 같은 방식으로 막혀야 함

## 기존 관리자 토큰의 역할

Cloudflare Access는 관리자 페이지 접근 자체를 막습니다.
기존 관리자 토큰은 API 저장/수정 요청을 한 번 더 보호하는 2차 안전장치로 유지합니다.
