# Cloudflare 배포

운영 주소: https://leafy-garden.pages.dev

GitHub: https://github.com/yelmovie/plant-life-explorer

Cloudflare Pages 프로젝트는 `leafy-garden`, 운영 브랜치는 `main`이다. 검증한 `dist/`를 직접 업로드한다. GitHub push만으로 자동 배포되지는 않는다.

```powershell
npm run check
npm test
npm run build
wrangler pages deploy dist --project-name leafy-garden --branch main
```

`dist/`는 빌드 산출물이며 Git에 포함하지 않는다. 실행용 이미지·모형·글꼴만 배포하고 참고 자료·교육과정 원본·검증 화면은 배포에서 제외한다. 원본과 캡처는 로컬 프로젝트에 보존한다.

## 최근 배포 — 2026-10-28 (납품 전 최소 수정)

- 기능 커밋: `daa03138c580025aab4f74013f43ffe59776ecff` (`sort-board-drag`, GitHub push 안 함)
- 배포 주소: https://2a2fa2fb.leafy-garden.pages.dev
- 운영 주소: https://leafy-garden.pages.dev
- 바뀐 것: 1장 톱니 있음/없음 통일·돋보기 4배, 3장 긋기 판정 보간·양 끝 두 번 누르기, 현장 임무 '버튼으로 하기', 팝업 버튼 고정, 2·5장 예상 단계 안내, 4장 '내 정원 확인', 3D 실패 원인 구분(README '납품 전 최소 수정' 참고).
- 빌드: 177파일·118에셋·45,570,403바이트, esbuild 번들. `dirty=true`는 추적하지 않는 `output/` 폴더 때문이다.
- 배포 전 JavaScript 45개 문법 검사, 118/118 테스트, 전체 여정 브라우저 테스트, 터치 전용 점검 24항목(`tests/delivery-touch.browser.mjs`, 로컬 dist)을 통과했다.
- 운영 주소의 `build-info.json` 커밋이 배포 커밋과 같고, `app.bundle.js` SHA-256이 로컬 dist와 같으며 새 기능 코드가 들어 있음을 확인했다. 운영 주소 첫 화면 표시와 콘솔 오류 0건을 확인했다.
- 실물 태블릿 손가락 조작·성능은 미검증이다.

## 이전 배포 — 2026-10-28

- 기능 커밋: `e87da5e0476e16efa1608316fb26d6ed2db9732e` (`main`·`sort-board-drag`, GitHub push 완료)
- 배포 주소: https://f7dc2dd0.leafy-garden.pages.dev
- 운영 주소: https://leafy-garden.pages.dev
- 바뀐 것: 정원 꾸미기를 끌어다 놓기 하나로 정리(땅 타일·식물 한 팔레트, 놓일 칸 표시, 심은 식물 옮기기·밖으로 빼서 뽑기, 같은 식물 여러 그루, 칠하기가 식물을 덮지 않음). 모든 스테이지를 마치면 홈에 처음부터 다시하기(확인 후 초기화). 5개 미션 활동 흐름 점검 반영(`docs/reviews/PLAY-REVIEW-20261028.md`).
- 빌드: 177파일·118에셋·45,550,278바이트, esbuild 번들 사용(wrangler 4.154.0에 포함된 esbuild 0.28.2). `dirty=true`는 추적하지 않는 `output/` 폴더 때문이며 배포물과 무관하다.
- 배포 전 JavaScript **45개 문법 검사**, **115/115 테스트**를 통과했다. 브라우저 테스트(`*.browser.mjs`)는 이번에 돌리지 않았다.
- 운영 주소의 `build-info.json` 커밋이 배포 커밋과 같고, `app.bundle.js`·`spatial.js`에 새 정원 조작 코드가 들어 있음을 확인했다. 운영 주소 첫 화면 표시와 페이지 오류 0건을 확인했다.
- 정원 조작은 로컬 미리보기에서 마우스·스크립트 포인터로 확인했다. 실물 태블릿 손가락 조작은 미검증이다.

## 이전 배포 — 2026-10-27 (OG 이미지)

- 기능 커밋: `55c5fa68557ac35f69ea75464e7bab66307073d6` (`main`, GitHub push 완료)
- 배포 주소: https://40bc3574.leafy-garden.pages.dev
- 운영 주소: https://leafy-garden.pages.dev
- 선택한 1번 온실 탐험형 이미지를 `assets/og/green-garden-og-20261027.png`로 배포했다. 원본과 동일한 **1774×887, 2:1 PNG**다.
- 정적 HTML에 OG 제목·설명·운영 URL·이미지 URL/크기/대체 설명과 Twitter 큰 이미지 카드를 설정했다. 공유용 PNG는 배포하되 게임의 오프라인 사전 캐시에서는 제외했다.
- JavaScript **41개 문법 검사**, 빌드, OG 태그·PNG 크기·선택 원본 해시·배포 포함 여부 검사를 통과했다.
- 빌드 시각: **2026-10-27 05:19:25 KST** (`2026-10-26T20:19:25.333Z`), `dirty=false`. 본문 170파일·116에셋과 생성 번들/메타데이터를 배포했다.
- 운영 빌드 정보 일치 및 **5개 파일**(HTML, OG PNG, 서비스워커, JS/CSS 번들)의 SHA-256 일치를 확인했다. 크롤러 User-Agent로 받은 HTML에도 OG 태그가 있고 PNG는 HTTP 200·`image/png`로 응답했다.
- 격리 Chrome에서 시작 화면 표시, OG 이미지 실제 디코딩(1774×887), 페이지 오류 0건을 확인했다. 개별 메신저의 공유 카드 캐시 갱신 여부는 확인하지 않았다.

## 이전 배포 — 2026-10-27

- 기능 커밋: `a58605da41b4c537f1d08e84954c4661aed9ddfe` (`main`, GitHub push 완료)
- 배포 주소: https://d248ad3b.leafy-garden.pages.dev
- 운영 주소: https://leafy-garden.pages.dev
- 바뀐 것: 다섯 현장 임무를 스테이지마다 다른 손 조작으로 바꿈(1 돋보기 끌기·카드 튕기기, 2 흙 문지르기·실 잇기·시간 다이얼, 3 꾹 누르고 버티기·잎자루 긋기, 4 물길 그리기·물뿌리개 기울이기·원 그려 구름 모으기, 5 톡톡 고르기·꿰매기·구름 연타·흔들기·동그라미). 리피 편지형 미션 안내(개구체 손글씨), 시작 화면·지도·설정 문구 정리.
- 빌드: 169파일·115에셋·38,386,242바이트, `dirty=true`(추적하지 않는 `output/` 폴더 때문, 배포물과 무관).
- 배포 전 JavaScript **41개 문법 검사**, **97/97 테스트**, 브라우저 테스트 **6종 통과**(expedition-core·expedition·integrity-layout 99화면·integrity-runtime·learning-journey·stage-map).
- 운영 주소의 `build-info.json` 커밋이 배포 빌드와 같고, `app.bundle.js`에 새 조작 코드가 들어 있음을 확인했다. 헤드리스 Chrome으로 운영 주소에서 시작 → 인트로 → 지도 → 1스테이지 현장 임무까지 들어가 돋보기 표시와 글꼴(GG Display·GG Hand) 로딩, 페이지 오류 0건을 확인했다.
- 실물 태블릿 손가락 조작은 미검증이다(마우스·스크립트 포인터로만 확인).

## 이전 배포 — 2026-10-24 (2)

- 기능 커밋: `49683310189e91a9944c2fe2612789cd57cfb4aa` (`main`, GitHub push 완료)
- 배포 ID: `a6a01f92-7c09-4f64-bb27-c30dd23b17f4`
- 배포 주소: https://a6a01f92.leafy-garden.pages.dev
- 운영 주소: https://leafy-garden.pages.dev
- 배포 완료: **2026-10-24 02:32 KST** (`2026-10-23T17:32:35.456655Z`).
- 빌드 정보: `2026-10-23T17:31:49.000Z`, `main`, `dirty=false`, **138파일·96에셋·32,087,708바이트**와 별도 `build-info.json`.
- 배포 전 JavaScript **35개 문법 검사**, **93/93 테스트**, 화면 **39개 조건**, 저장 **7개 시나리오**, 소프트웨어 WebGL **4종**을 통과했다.
- 운영 주소의 `build-info.json` 파일 목록·해시 정보가 배포 빌드와 완전히 일치했다. 에셋을 제외한 실행 파일 **42개**를 별도로 받아 SHA-256과 바이트 수가 모두 일치함을 확인했다.
- 격리한 Chrome에서 구버전 v1/v2 가짜 기록의 완료 **10개**와 엔딩을 보존하고, 없는 응답은 `unknown`으로 남기는 것을 확인했다. 저장 경고와 페이지 오류는 없었다.
- 운영 주소에서 새 기록으로 **5개 현장 임무 → 10개 본 탐구 → 최종 선인장 적용 문제 → 엔딩 → 연구노트**를 실제 UI로 완주했다. 장소별 새로고침 보존, 오답→힌트→수정 기록, 첫 예상 보존, 주머니만 바꾼 비교, 기존 가방 시험 재사용, 노트의 홈 복귀·재접속 보존을 확인했다. 페이지 오류 **0건**.
- 근거: `docs/reviews/integrity-20261024/production/verification.json`, `journey.json`, `completed-test-record.json`. 상세: `docs/reviews/LEARNING-INTEGRITY-20261024.md`.
- 실물 iPad Safari·Android Chrome, 태블릿 GPU 성능·학교망·실제 학생 수업은 미검증이다. Chrome의 터치 에뮬레이션과 소프트웨어 GPU 결과가 이 조건의 통과를 뜻하지 않는다.

## 이전 배포 — 2026-10-24

- 기능 커밋: `85d934d` (`main`, GitHub push 완료)
- 배포 주소: https://71b22591.leafy-garden.pages.dev
- 운영 주소: https://leafy-garden.pages.dev
- 배포 전 JavaScript 31개 문법 검사, 테스트 80/80, 133파일·96에셋 빌드를 통과했다.
- 운영 주소의 HTML·앱·3D 복구 모듈·연구노트·보정 CSS·설정·서비스워커·한글 글꼴 8파일이 배포 빌드와 바이트 단위로 일치했다.
- 음원 2곡과 영상 2개의 HTTP 200 및 MIME을 확인했다. 원격 Range 요청은 HTTP 200으로 응답하여 부분 응답(206)은 확인하지 못했다.
- 인앱 브라우저에서 첫 화면·설정·인트로 재생·자막·복귀를 직접 확인했다. 영상 시간은 11.76초까지 진행했고 영상 재생 중 BGM은 정지했다. 확인한 브라우저 warning/error 로그는 없었다.
- 실제 학생·실물 태블릿·학교망 검증 등 최종점검 보고서의 미측정 조건은 그대로 남아 있다. 배포 성공이 그 조건의 통과를 뜻하지 않는다.

## 이전에 확인한 배포

- 기능 커밋: `6cf80051212a4090b47023177a4eb6344af92f58` (`main`)
- 배포 주소: https://1fb939ba.leafy-garden.pages.dev
- 운영 주소에서 HTTP 200, 새 첫 화면 이미지, 이야기→지도→현장 입장, 관찰 조작·로컬 저장·새로고침 보존을 Chrome 독립 프로필로 확인했다. 콘솔 오류와 HTTP 오류는 없었다.
