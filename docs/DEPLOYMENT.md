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

## Mac에서 배포할 때

이 Mac에는 시스템 Node가 없다. 도구는 외장 SSD에만 둔다: Node `DevCaches/tools/node-v24.22.2-darwin-arm64`, wrangler `DevCaches/tools/wrangler-4.154.0`(exFAT라 `--no-bin-links`로 설치). wrangler 로그인 정보는 `HOME=DevCaches/tools/wrangler-home`으로 실행해 SSD에 저장한다. 빌드는 `ESBUILD_MODULE_PATH`를 그 wrangler의 `node_modules/esbuild`로 지정한다. exFAT가 만드는 `._*` 파일은 업로드 전에 `dist`에서 지운다.

## 배포 — 2026-11-22 (파이널 영상은 탐구를 마칠 때 한 번만)

- 커밋 `5d8f564` → https://b9920f5e.leafy-garden.pages.dev. `src/village-encounters.js`·`src/app.bundle.js` 운영 파일이 배포 빌드와 일치(cmp MATCH, index MATCH). 마지막 악당 격퇴 뒤에는 성취 카드만 나오고 지도 피날레 영상(outro.mp4)은 열리지 않는다(`requiredFoes` 5 → 0). 파이널 영상은 「초록정원 깨우기」 뒤 한 번 자동 재생된다.
- 확인(Mac, Node v24.22.2): `npm run check`, `npm test` 192/192. 헤드리스 Chrome(소리 끔, 새 컨텍스트) 로컬·운영 각 18/18 — 시나리오 1(끝낸 뒤 마지막 악당: 영상 0회), 2(마지막 단계: 영상 1회, 새로고침 뒤 0회), 3(악당 먼저 → 마지막 단계: 합계 1회), 엔딩 다시 보기 열림, 콘솔 오류 0.

## 배포 — 2026-11-21 (110점 계획 3-4단계: 코드 구조 정리, 동작 같음)

- E1 커밋 `c5001eb`·`81f7d70`·`c0a03b4`·`e5f2c79` → https://8b75b8fb.leafy-garden.pages.dev. E2 커밋 `37c5e90` → https://5fcdb322.leafy-garden.pages.dev. 운영 `build-info.json` 커밋 일치, `prodcmp` 파일 40개 일치.
- 바뀐 것: 학생이 보는 화면·소리·진행·저장은 같다. `frame.css` 뒤쪽 덮어쓰기를 원래 자리로 합침, `learning.js`의 3·4장 화면 함수를 `learning-lab-garden.js`로 옮김.
- 확인(Mac, Node v24.22.2): 이동마다 `npm run check`·`npm test`(마지막 192/192), 전 화면 기준본 144장 계산된 스타일 비교 차이 0, 저장 표본 3개 같음, 빌드 328파일. 운영: 브라우저 테스트 3개(전달 터치는 테스트 타이밍 고친 뒤 3/3), 뒤로 가기 6가지. 되돌릴 대상: https://f4d0fc65.leafy-garden.pages.dev (`f94d78a`).

## 배포 — 2026-11-21 (110점 계획 3-3b단계: 재도전 목표·5장 탐구 기록 면적)

- 커밋 `f94d78a`, 배포 https://f4d0fc65.leafy-garden.pages.dev. 운영 `build-info.json` 커밋 일치, `prodcmp` 파일 40개 일치.
- 바뀐 것: 끝낸 장의 「다시 도전」(새 저장 칸 `fieldChallenges`, 옛 저장 호환), 5장 기록 화면 기록 칸 23%(최소 236px).
- 확인(Mac, Node v24.22.2): `npm run check` 60개, `npm test` 192/192, 빌드 328파일. 브라우저 테스트 3개 로컬·운영 통과, 재도전 흐름·5장 면적·뒤로 가기 운영 측정. 되돌릴 대상: https://be4dbd41.leafy-garden.pages.dev (`1430f10`).

## 배포 — 2026-11-21 (110점 계획 3-2a단계: 뒤로 가기·첫 화면·연구 노트 48px)

- 커밋 `1430f10`, 배포 https://be4dbd41.leafy-garden.pages.dev. 운영 `build-info.json` 커밋 일치, `prodcmp` 파일 40개 일치.
- 바뀐 것: 브라우저 뒤로 가기가 앱 안 앞 화면으로(시작 화면에서는 평소처럼 나감), 시작 화면에서는 효과음 6개를 미리 받지 않음, 연구 노트 컨트롤 44~46→48px.
- 확인(Mac, Node v24.22.2): `npm run check` 59개, `npm test` 186/186, 빌드 327파일. 브라우저 테스트 3개 로컬·운영 통과, 뒤로 가기 6가지·노트 5권·첫 화면 전송량 운영 측정, 운영 전체 스윕 1280×800. 되돌릴 대상: https://582f8a11.leafy-garden.pages.dev (`2fbeb50`).

## 배포 — 2026-11-21 (110점 계획 3-1단계: 성취 카드 보관함 글자)

- 커밋 `2fbeb50`(`src/reward-cards.css`만), 배포 https://582f8a11.leafy-garden.pages.dev. 운영 `build-info.json` 커밋 일치.
- 바뀐 것: 잠긴 카드 문구 14px → 18px·색 85%, 10번 기준본의 `@container rc-locked` 묶음, 보관함 작은 카드 이름 17px·부제 16px(높이 600px 이상).
- 확인(Mac, Node v24.22.2): `npm run check` 59개, `npm test` 186/186, 빌드 327파일(esbuild 묶음). 보관함 1280×800·1024×768·1920×1080·1024×600·915×412 로컬·운영 측정(넘침 0) + 스크린숏 확인. 되돌릴 대상: https://a756c68b.leafy-garden.pages.dev (`7823969`).

## 배포 — 2026-11-21 (100점 계획 2단계: 대비·48px·토스트)

- 커밋 `7823969`, 배포 https://a756c68b.leafy-garden.pages.dev. 운영 `build-info.json` 커밋 `7823969` 일치(배포 폴더 기준이라 `dirty=true` 표시).
- 바뀐 것: 글자색 6곳(머리띠 아직 안 한 단계 번호, 1장 단서 알약·단서 계기판, 연구 노트 표지 번호, 노트 옛 답, 대화창 머리글)을 같은 색 계열에서 진하게. 머리띠 단계 동그라미·5장 연잎 단추·리피 대화창 단추(닫기 48×48) 44→48px. 리피 말풍선이 이미 같은 문장을 말하고 있으면 장면 토스트를 띄우지 않음(화면 낭독 알림 문구는 그대로). 여정 테스트 `lens()`가 잎 그림이 다시 놓인 뒤 좌표를 잼. 학습 문구·판정·저장·진행 로직은 그대로.
- 확인(Mac, Node v24.22.2): `npm run check` 59개, `npm test` 186/186, 배포 빌드 327파일(esbuild 묶음). 브라우저 테스트 3개(여정·탐험·전달 터치) 로컬 통과, 운영 재측정 값은 `docs/reviews/SCORE-20261121.md`. 되돌릴 대상: https://c7d6632c.leafy-garden.pages.dev (`7a66a50`).

## 배포 — 2026-11-20 (지도 악당 글자 18px)

- 커밋 `7a66a50`(`src/map-encounters.js`만), 배포 https://c7d6632c.leafy-garden.pages.dev, `dirty=false`. 운영 `build-info.json` 커밋 일치, `src/app.bundle.js`·`src/bundle.css` SHA-256이 로컬 빌드와 같음.
- 바뀐 것: 악당 말풍선 16px(1500px 이상만 18px) → 18px, 폭 220px → min(270px, 화면-32px)(1500px 이상 300px). 체력 표시(●●●) 10px → 18px, 악당 머리 위로 옮김. 격퇴 안내 14px → 18px(폭 최대 440px). 공격 버튼 글자 16px → 18px(지도 오른쪽 아래 도크의 아이콘 버튼은 그대로).
- 확인(Mac, Node v24.22.2): `npm run check`, `npm test` 186/186. 지도에서 걸으며 1280×800·1024×768·1920×1080 측정(로컬·운영 모두): 말풍선 18px·2줄·화면 밖 넘침 없음, 말풍선끼리 겹침 없음, 체력 18px. 아래 조작줄과의 겹침 표시는 조작줄 전체 상자 기준이었고 화면에서 방향키·버튼과 겹치지 않음을 확인. 격퇴 안내는 세 번 공격해야 나와 화면으로 띄워 보지는 못했고 CSS 값만 확인. 캡처는 `.tmp/villain-18px-20261120/`(Git 제외).

## 최근 배포 — 2026-11-18 (3초 규칙 디자인 고도화)

- 기능 커밋: `bf5f601`(지시 한 곳·진행 알약), `c760f40`(팝업 배경 0.26·의뢰 편지 3줄), `09f187d`·`8a048e7`(학생 글자 18px 이상, 완료 시 말풍선이 주 버튼 이름을 부름), `87e3fd9`(AGENTS 배포 자동 승인 문구). GitHub `main`에 푸시.
- 1차 배포 https://996f6b23.leafy-garden.pages.dev (`87e3fd9`), 그 뒤 다른 세션의 효과음 배포 `d66ffa4`, 최종 배포 https://01762ec8.leafy-garden.pages.dev (`8a048e7`, `dirty=false`). 되돌릴 대상: https://1b7d5aae.leafy-garden.pages.dev (`d66ffa4`), 그 전 https://0b0e9b9b.leafy-garden.pages.dev (`01afada`).
- 빌드는 다른 세션의 미커밋 변경이 섞이지 않게 `.tmp/deploy-wt`(해당 커밋의 git worktree)에서 했다. 운영 주소 `build-info.json` 커밋 `8a048e7`, `src/app.bundle.js`·`src/bundle.css` SHA-256이 로컬 빌드와 같음을 확인했다.
- 바뀐 것: 활동 화면 위쪽 제목 띠와 3단계 탭을 가운데 위 알약 하나(장소 이름 + 1·2·3)로 합치고 자동 진행을 오른쪽 위 줄로 올려 놀이 영역이 화면 높이의 79~84%가 됐다. 현장 임무의 지시는 리피 말풍선 한 곳(장면 안 같은 문장은 숨김), 알림은 장면 위 짧은 표시로 바꿔 말풍선을 덮어쓰지 않는다. 미션 5 첫 예상 화면에서 질문이 숨고 말풍선이 엉뚱한 안내를 하던 문제도 고쳤다. 팝업 배경은 `--scrim`(0.26) 하나로 통일, 의뢰 편지는 3줄 + 「출발」, 폭 640px(1280×800에서 면적 29%).
- 검증(Mac, Node v24.22.2): `npm run check` 57개 파일, `npm test` 158/158. 1280×800·1920×1080·1024×768에서 홈·지도·의뢰 편지·현장 임무 5개·탐구 기록 10개·보고서·최종 화면을 열어 재고 캡처했다(`.tmp/design-3sec-20261117/before`·`after`, Git 제외). 지도 장소 이름은 계산값 16px이지만 지도 확대(`--map-scale`)로 실제 표시는 약 20px이다.
- 추가 배포 https://77a75fea.leafy-garden.pages.dev (`8eb8893`, `dirty=false`): 탐구 기록 진행 중 손가락은 표식만 하고, 그 옆 짧은 안내(예: 크게 보기를 눌러 봐)는 리피 말풍선 아래 줄로 옮겼다. 운영 `build-info.json` 커밋 `8eb8893`, `src/app.bundle.js` 해시 일치. `npm test` 159/159(Mac, Node v24.22.2).
- 추가 배포 https://d3ae50c5.leafy-garden.pages.dev (`bb75ef4`, `dirty=false`): 왼쪽 「현장 임무/오늘의 연구」 패널과 「인사 듣기 · AI 합성 음성」 조작(`src/npc-narration.js`)을 없앴다. 리피·지시 말풍선·주 버튼은 아래 한 줄, 「버튼 보이기」는 아래 줄 왼쪽. 장면이 화면 너비 97%, 높이 75~78%. 작업 뒤 큰 종이판(`work-board`·현장 작업판·시간 다이얼판)을 걷어 배경 그림이 보이게 했다. 장면 안 「비 내리기」「비 뿌리기」는 도구 버튼으로 낮춰 화면마다 주 버튼 1개. 현장 임무 13단계·탐구 기록 시작/완료 20화면·홈·지도·의뢰 편지·리피 대화·보고서·최종 화면을 1280×800·1024×768·1920×1080에서 캡처(117장, `.tmp/design-3sec-20261117/stages`): 18px 미만 글자 0(지도 장소 이름 제외), 주 버튼 1개. 운영 `src/app.bundle.js`·`src/bundle.css` 해시 일치. `npm test` 159/159(Mac, Node v24.22.2). 끝낸 현장 단계로 되돌아가는 단계 목록은 이제 없다.
- 추가 배포 https://f54cebad.leafy-garden.pages.dev (`665141b`, 성취 카드): 지도 악당을 3타로 물리치면 화면 가운데에 성취 카드가 돌며 나타나고 「카드 보관함에 넣기」를 누르면 오른쪽 위 소리 버튼 앞 5칸으로 들어간다(활동 화면에는 칸 없음). 5장을 모으면 「컬렉션 완성!」, 다섯 악당 피날레 영상은 카드를 닫은 뒤에 나온다. 보유는 기존 타격 기록(`mapEncounters`=3)에서 계산해 저장 형식은 그대로다. 카드 그림 10개(`assets/reward-cards/`)와 효과음 5개가 오프라인 목록에 들어간다(precache 117). 공통 배포 스크립트(`_scratch/deploy-20261118/deploy.sh`, origin/main의 git worktree에서 esbuild 번들 빌드)로 올렸고 운영 `build-info.json` 커밋 `665141b`(`dirty=true`는 배포용 작업 트리에 exFAT가 만든 `._*` 3개 때문, 내용 차이 없음), `card-5-bag.webp`·`thumb-1-leaf.webp`·`reward-03.mp3`·`victory-jingle-01.mp3`·`src/app.bundle.js`·`src/bundle.css`·`sw.js` SHA-256이 빌드와 같음을 확인했다. 검증(Mac, Node v24.22.2): `npm run check` 58개 파일, `npm test` 162/162, 같은 코드의 `dist`를 헤드리스 Chrome(1280×800)으로 열어 실제 공격 버튼 3타 → 카드 → 칸 채움 → 새로고침 뒤 유지·재등장 없음, 5/5 완성 축하 → 피날레, 카드가 열린 동안 방향키 이동 대기, 모션 감소, 1024×768 헤더 한 줄(지도·홈)까지 57개 항목 통과(`.tmp/reward-cards/shots`, Git 제외). 소리는 파일 요청만 확인했고 귀로 듣지는 못했다.
- 추가 배포 https://ab817c6a.leafy-garden.pages.dev (`fa853f1`, 성취 카드 공통 모듈 보강본): 카드 연출 중 오류가 나도 화면이 멈춘 채 남지 않고, `inert`를 속성으로도 걸어 구형 사파리에서도 피날레 대기가 동작한다. 같은 공통 배포 스크립트로 올렸고 운영 `build-info.json` 커밋 `fa853f1`(`dirty=true`는 배포용 작업 트리의 `._*` 3개 때문), `src/app.bundle.js`·`src/bundle.css`·`src/reward-cards.js`·`src/reward-cards.css`·`sw.js` SHA-256이 빌드와 같음을 확인했다. 검증(Mac): `npm run check` 59개 파일, `npm test` 162/162, 개발 서버를 헤드리스 Chrome으로 연 카드 점검 57개 항목 통과, 운영 주소 첫 화면·지도 콘솔 오류 0과 지도의 카드 5칸·보관함 열림 확인.
- 추가 배포 https://dd75d688.leafy-garden.pages.dev (`2dbe2a2`, 조작물 크게 · 글 줄이기): 활동 화면의 「자동 진행」「버튼 보이기」를 설정 창(앱 정보)으로 옮기고, 1장 관찰 연습은 잎 위 깜빡이는 점을 직접 누른다. 장면 안 설명 글을 걷어 내 지시는 리피 말풍선 한 줄, 현장 임무 5개와 탐구 기록의 그림·카드·다이얼·수조·스위치·구름은 장면 높이(`--stage-h`)에 맞춰 키웠다(`src/frame.css` 13절). 공통 배포 스크립트(`USE_WT=1`, origin/main의 git worktree, esbuild 번들)로 올렸고 운영 `build-info.json` 커밋 `2dbe2a2`(`dirty=true`는 배포용 작업 트리의 `._*` 3개 때문), `/`·`src/app.bundle.js`·`src/bundle.css`·`sw.js` SHA-256이 빌드와 같다. 검증(Mac, Node v24.22.2): `npm run check` 59개 파일, `npm test` 162/162, 개발 서버를 헤드리스 Chrome(WebGL 끔)으로 1280×800·1024×768 전 화면 41개씩과 1920×1080 15개 캡처(18px 미만 글자 0, 주 버튼 1개), 인앱 브라우저에서 잎 점 누르기·다이얼 한 바퀴·예상 스위치·바구니 누르기·설정의 버튼 방식 스위치를 스크립트 포인터와 클릭으로 확인, 운영 주소에서 1장 관찰·시간 다이얼·식물이 사는 곳 화면 캡처 확인. 되돌릴 대상: https://ab817c6a.leafy-garden.pages.dev (`fa853f1`).
- 추가 배포 https://22cda76e.leafy-garden.pages.dev (`abb5fe2`, 5장 글 줄이기): 가방 만들기·시험·결과 비교 화면의 설명 줄을 줄이고(부품 이름 「① 겉면」「② 입구」, 시험 안내는 제목 한 줄, 완성 화면의 예상·시험 기록은 접음) 설계 화면의 가방과 결과 비교의 네 가방 그림을 키웠다. 같은 공통 배포 스크립트(`USE_WT=1`)로 올렸고 운영 `build-info.json` 커밋 `abb5fe2`(`dirty=true`는 배포용 작업 트리의 `._*` 때문), `src/app.bundle.js`·`src/bundle.css`·`sw.js` SHA-256이 빌드와 같다. 검증(Mac, Node v24.22.2): `npm run check` 59개 파일, `npm test` 162/162, 개발 서버 헤드리스 Chrome(WebGL 끔)으로 5장 설계 시작·시험 시작·완성·현장 결과 비교 화면을 1280×800·1024×768에서 캡처(결과 비교판이 장면 안에 들어옴, 페이지 오류 0), 인앱 브라우저에서 물방울 떨어뜨리기 → 특징 고르기 → 예상 화면, 결과 비교의 답 고르기 동작 확인, 운영 주소에서 설계·완성 화면 캡처 확인. 되돌릴 대상: https://dd75d688.leafy-garden.pages.dev (`2dbe2a2`).
- 추가 배포 https://b953f0ba.leafy-garden.pages.dev (`06ff85a`, 성취 카드 차례 보강 + 공통 모듈 최신본): 마지막 악당을 물리친 직후 설정창이 열려 있으면 카드가 창이 닫힐 때까지 기다렸다가 뜨고(전에는 카드 없이 칸만 채워지고 파이널이 나왔다), 그동안 악당 모듈의 `blocked`(`hold`)가 파이널을 붙잡아 카드 → 완성 축하 → 파이널 순서를 지킨다. `_scratch/deploy-20261118/deploy.sh`(`USE_WT=1`, `origin/main`만 빌드)로 배포. 운영 `build-info.json` 커밋 `06ff85a`, `src/app.bundle.js`·`src/bundle.css` SHA-256이 빌드와 같고, 운영 주소 헤드리스 확인(3타 → 0.3초 안에 설정창 → 5초 뒤 닫기 → 카드 → 축하 → 파이널, 콘솔 오류 없음) 10/10 통과. 커밋 `4e40af8`에 다른 작업의 미완성 변경 한 줄이 섞여 `06ff85a`에서 바로 뺐다(작업 폴더의 그 변경은 그대로).
- 추가 배포 https://63ae5995.leafy-garden.pages.dev (`27e8d4c`, 완료 팝업의 말하는 리피 + 작업판 키우기): 완료(보상) 팝업에서 리피가 복구한 장소 그림 앞에 서고, 음성이 읽는 두 문장(이유·다음 탐구)을 리피 말풍선에 모았다. 음성 요소의 `playing`에서만 입이 움직이고 읽는 줄이 표시되며 `waiting`·`pause`·닫기에는 멈춘다(`src/voice-lines.js`의 `speakTexts` 상태 알림, `src/character-dialogue.css`). 활동 화면은 은행잎 짝 찾기·계절 바꾸기·식물이 사는 곳·5장 현장 예상의 판과 그림을 장면 높이(`--stage-h`)에 맞춰 키우고 5장 설계·시험의 질문 칸을 세로 가운데에 두었으며, 가운데에 옅은 빛을 깔았다(`src/frame.css` 끝 절). `_scratch/deploy-20261118/deploy.sh`(`USE_WT=1`, `origin/main`만 빌드, esbuild 번들)로 배포. 운영 `build-info.json` 커밋 `27e8d4c`, `/`·`src/app.bundle.js`·`src/bundle.css`·`sw.js` SHA-256이 빌드와 같다. 검증(Mac, Node v24.22.2): `npm run check` 59개 파일, `npm test` 166/166, 인앱 브라우저로 개발 서버(4328)에서 고친 화면을 1280×800·1024×768·1280×720으로 열어 장면 넘침·화면 밖 버튼 0 확인, 완료 팝업은 실제 음성 재생 중 말하기 표시가 이유 문장 → 다음 문장 순으로 켜졌다가 끝나면 꺼지고 입 그림 위치가 0%·100% 두 값만 나오는 것을 확인. 배포본은 미리보기 주소(운영 주소와 저장 기록이 분리됨)에서 같은 팝업 동작과 콘솔 오류 0을 확인했다. 처음 완료할 때 도장 연출과 함께 뜨는 모습, 현장 임무 2·3단계 화면은 이번에 다시 열어 보지 않았다. 되돌릴 대상: https://b953f0ba.leafy-garden.pages.dev (`06ff85a`).
- 추가 배포 https://6e4c66be.leafy-garden.pages.dev (`2a22b93`, 5장 설계·시험 키우기): 설계 화면의 부품 카드(높이 88px, 그림 92×72, 글자 22px)와 예상 버튼(칸 너비, 높이 68px)을 키웠다. 시험 화면은 비교 기록의 가방 그림과 버튼을 키우되, 좁거나 낮은 화면에서 글이 줄바꿈되어 장면이 넘치므로 너비 1200px·높이 780px 이상에서만 적용한다(`src/frame.css` 끝 절). 같은 공통 배포 스크립트(`USE_WT=1`)로 올렸고 운영 `build-info.json` 커밋 `2a22b93`, `src/app.bundle.js`·`src/bundle.css`·`sw.js` SHA-256이 빌드와 같다. 검증(Mac, Node v24.22.2): `npm run check` 59개 파일, `npm test` 166/166, 인앱 브라우저로 개발 서버(4328)의 설계·시험 완료 화면을 1280×800·1024×768·1280×720·1920×1080에서 재고, 배포본 미리보기 주소에서 설계 화면(카드 333×89, 버튼 485×69, 장면 넘침 0, 콘솔 오류 0)을 확인했다. 이번 변경 전부터 있던 것: 시험 완료 화면은 1280×720에서 장면이 10px 넘친다(새 규칙을 빼고 재도 같았다. 다음 배포 `d9323d5`에서 고침). 이때 함께 적었던 「1920×1080에서 아래 줄이 화면 밖으로 11px 나간다」는 잘못 잰 것이다: 점검용 인앱 브라우저에서 화면 등장 애니메이션(`dk-enter`)이 끝나지 않은 채 재서 생긴 값이고, 애니메이션을 끝낸 뒤에는 아래 줄 끝이 1080px로 화면에 맞았다. 설계·시험의 처음 상태(아직 고르기 전) 화면은 열어 보지 않았다. 되돌릴 대상: https://63ae5995.leafy-garden.pages.dev (`27e8d4c`).
- 추가 배포 https://32adcba4.leafy-garden.pages.dev (`d9323d5`, 5장 시험 화면 넘침 고침): 물 뿌리기 그림 칸의 줄 높이가 최소 230px로 고정되어(`src/learning-integrity.css`) 1280×720에서 시험 완료 화면의 장면이 10px 넘쳤다. 최소 높이를 장면 높이(`--stage-h`)에 맞춰 145~230px로 바꿨다(`src/frame.css` 끝 절). 같은 공통 배포 스크립트(`USE_WT=1`, `origin/main`)로 올렸으므로 그 사이 `main`에 들어온 다른 작업의 커밋 `1603137`(인트로·파이널 자막 영상)도 이 배포에 들어 있다. 운영 `build-info.json` 커밋 `d9323d5`, `src/app.bundle.js`·`src/bundle.css`·`sw.js` SHA-256이 빌드와 같다. 검증(Mac, Node v24.22.2): `npm run check` 59개 파일, `npm test` 166/166, 인앱 브라우저로 개발 서버(4328)의 시험 완료 화면을 등장 애니메이션을 끝낸 뒤 재서 1280×720 장면 540/540(그림 칸 220px), 1280×680 500/500(180px), 1024×768·1280×800·1920×1080은 전과 같고 화면 밖 버튼 0·콘솔 오류 0. 시험의 다른 단계(비 뿌리기 전, 비교 전)와 `1603137`의 영상 동작은 이 작업에서 확인하지 않았다. 되돌릴 대상: https://6e4c66be.leafy-garden.pages.dev (`2a22b93`).
- 추가 배포 https://184e52b9.leafy-garden.pages.dev (`490f29b`, 놀이 화면 비율·중복 버튼 정리): 공통 기준 `_shared/LAYOUT-BALANCE-DELIVERY-20261118.md`에 따라 놀이 영역이 배경보다 작아 보이던 화면을 키웠다(`src/frame.css` 14절). 마지막 시운전은 제목을 위 줄 알약으로 올리고 판을 화면 높이에 맞춰 넓혀 놀이 영역 높이/면적이 1280×800 59%/52%→83%/78%, 1920×1080 47%/27%→86%/75%. 연구 노트 표지 칸 58%→71%(1280), 5장 현장 첫 비는 결과 칸이 비면 가방이 가운데(내용 면적 27%→39%). 탐구 기록은 1500×900 이상에서만 판을 넓혔다(1920 내용 면적 22~48%→37~66%). 중복 조작 3곳: 탐구 기록 아래 「앞 활동」은 안내 손가락이 가리킬 때만, 연구 노트 창 위 X 숨김(「노트 덮기」·Esc), 시험을 마친 가방 위 구름의 「비 내리기!」 글자 숨김. 학습 문구·판정·저장·진행 로직은 그대로. 같은 공통 배포 스크립트(`USE_WT=1`, `origin/main`, esbuild 번들)로 올렸고 운영 `build-info.json` 커밋 `490f29b`(`dirty=true`는 배포용 작업 트리의 `._*` 때문), `/`·`src/app.bundle.js`·`src/bundle.css`·`src/frame.css`·`sw.js` SHA-256이 빌드와 같다. 검증(Mac, Node v24.22.2): `npm run check` 59개 파일, `npm test` 166/166, `npm run build` 320파일. 개발 서버(4351) 헤드리스 Chrome(WebGL 끔)으로 45화면 × 1280×800·1024×768·1920×1080 전후 측정(작은 글자 0, 주 버튼 1개), 915×412 8화면 가로 스크롤 0·주 버튼 눌림, 미션 안 F5 같은 화면, 학습 여정 5미션 새로고침 유지·처음부터 엔딩까지 통과, 콘솔 오류 0. 운영 주소에서 마지막 시운전 1920×1080 놀이 영역 86%/88%와 바뀐 CSS 규칙, 서비스워커 제어 후 네트워크를 끊고 `/` 새로고침 시 같은 화면 복원을 확인했다. 기록: `docs/LAYOUT-BALANCE-20261118.md`, `docs/reviews/RELEASE-REVIEW-20261118.md`, `SCORE-20261118.md`(86/100). 이번 변경 전부터 있던 것: `?v=` 같은 쿼리가 붙은 주소는 오프라인 새로고침이 실패한다(대체 응답 `/index.html`이 Pages에서 308 리다이렉트라서), 1024×768 연구 노트 카드 제목이 한 글자 줄로 끊긴다, `tests/*.browser.mjs`가 없어진 `.today-panel`을 찾는다. 되돌릴 대상: https://32adcba4.leafy-garden.pages.dev (`d9323d5`).
- 추가 배포 https://046e5350.leafy-garden.pages.dev (`d0d6dcf`, 남은 문제 정리): ① `sw.js` 오프라인 대체 응답을 `/index.html`(Pages에서 `/`로 308 리다이렉트라 탐색 요청에 못 씀) 대신 쿼리를 무시한 같은 주소 → `/`로 바꿔 `?v=` 같은 주소도 오프라인 새로고침이 된다. ② 연구 노트 표지 제목·기록을 단어 단위 균형 줄바꿈(1024×768 「잎자루 속 / 공기 방」), 기록은 「물가 3칸 ·」처럼 덩어리째 줄을 바꾼다. 높이 520px 이하(915×412)는 표지 그림을 빼 카드가 아래 줄을 덮지 않게(이번 변경 전부터 있던 겹침). ③ 설정 창 위 X 숨김(아래 「닫기」 하나, 16개 공통 기준 `SETTINGS-CLOSE-RULE-20261119`). ④ `src/frame.css`에서 더는 그리지 않는 화면(오늘의 연구 패널·옛 단계 목록·옛 사는 곳 카드 등) 규칙 95개 삭제(1071→952줄). 삭제 선택자는 현장 15화면에서 아무것도 잡지 않았고, 같은 실행에서 전후 빌드를 캡처하니 1280×800 40화면 중 38화면 픽셀 동일, 나머지 2개(지도 의뢰 편지 74px, 계절 탐구 입체 대체 화면)는 눈으로 같은 캡처 잡음. 같은 선택자 묶기(8쌍)는 아래 줄 위치가 몇 px 바뀌어 되돌렸다. ⑤ `tests/*.browser.mjs`가 없어진 단계 목록 대신 「다음 도전」 버튼을 누른다. 검증(Mac, Node v24.22.2): `npm run check` 59개, `npm test` 166/166, 빌드 320파일(esbuild 묶음), 저장소 `learning-journey.browser.mjs` 5미션 통과, 설정 창 X 없음·「닫기」·Esc로 닫힘, `/?v=` 주소 오프라인 새로고침 통과(로컬 dist·운영 주소 모두, 콘솔 오류 0). `delivery-touch`·`expedition` 브라우저 테스트는 선택자를 고친 뒤에도 미션 재설계 전 단언(1장 틀린 바구니 말풍선, 5장 `[data-bag-dial]`)에서 멈춘다 — 테스트가 11-18 재설계를 못 따라간 것으로 보고 이번에는 손대지 않았다. 운영: `build-info.json` 커밋 `d0d6dcf`, `/`·`sw.js`·`app.bundle.js`·`bundle.css`·`frame.css`·`scene-refinements.css` SHA-256 일치(MATCH). 되돌릴 대상: https://184e52b9.leafy-garden.pages.dev (`490f29b`).
- 추가 배포 https://cf4d38e5.leafy-garden.pages.dev (`75b8869`, 소리 1차 수정): 공통 지침 `_shared/AUDIO-FIX-BRIEF-20261119.md` 03번. ① 대사(팝업·악당 말풍선·개념 자막·노트·엔딩 일기·리피 대화)가 나오는 동안 배경 음악을 멈추지 않고 평소의 1/4로 줄였다가 되돌린다(0.30 → 0.075, 0.2초에 걸쳐). 영상 때는 지금처럼 멈춘다 — 파형 대조로 인트로 영상에는 `main-theme`, 아웃트로 영상에는 `ending-theme`가 처음부터 섞여 있음을 확인했다(최고점/둘째 11.12·8.73). ② 지도 파이널 창이 열려 있는 동안 `ending-theme.mp3`, 닫으면 `main-theme.mp3`(영상은 무음 유지, 곡이 나올 때는 승리 징글이 물러남). ③ 효과음(목소리 포함)이나 헤더 소리를 끄면 읽던 대사도 바로 멈춘다. ④ 배경 음악은 첫 pointerdown·keydown(터치는 이어지는 click)에서 시작. 검증(Mac, Node v24.22.2): `npm run check` 59개 파일, `npm test` 171/171(소리 테스트 5개 추가), `npm run build` 통과. 헤드리스 Chrome(1280×800, 자동재생 정책 `document-user-activation-required`)으로 로컬과 운영 주소에서 재생 상태 값을 확인했다: 키 입력 뒤 `main-theme` 재생(0.09→0.30으로 올라옴), 누르는 순간(떼기 전) 재생, 리피 인사 중 배경 음악 재생 유지·크기 0.075 → 끝난 뒤 0.30, 인트로 영상 중 정지·지도에서 재개, 파이널 창을 열면 `ending-theme` 재생·닫으면 `main-theme`, 배경 음악 스위치를 끄면 정지하고 새로고침 뒤에도 꺼짐 유지, 효과음만 끄면 배경 음악은 계속. 로컬에서는 대사 중 헤더 소리 끄기 → 대사·배경 음악 모두 정지, 효과음만 끄기 → 대사만 정지하고 배경 음악은 0.30으로 복귀도 확인. 콘솔 오류·404 0건. 운영 `build-info.json` 커밋 `75b8869`, `src/app.bundle.js`·`src/audio.js`·`index.html` 해시가 빌드와 같다(`cmp.sh` MATCH). 귀로 듣는 확인은 하지 못했다(상태 값으로만 확인). 되돌릴 대상: https://046e5350.leafy-garden.pages.dev.
- 추가 배포 https://284ac768.leafy-garden.pages.dev (`b9011b1`, 문장 줄바꿈 균형): 공통 기준 `_shared/LINEBREAK-BALANCE-20261119.md`. 공통 `src/korean-linebreak.css`를 `index.html` 맨 앞에 링크(빌드가 `bundle.css` 맨 앞에 묶음)하고, `polish.css`의 `pretty`가 이기던 말풍선·안내·라벨 10곳에 `text-wrap: balance`, 시간 손잡이 안내는 블록으로 분리. 44화면 측정 실제 문제 1280×800 4→0, 1920×1080 13→0, 1024×768 →0(균형 잡힌 2줄 라벨만 남음). 문구·판정·진행 로직은 그대로. 검증(Mac, Node v24.22.2): `npm run check` 59개, `npm test` 171/171, 빌드 321파일. 운영 `build-info.json` 커밋 `b9011b1`, `/`·`bundle.css`·`korean-linebreak.css`·`sw.js`·`app.bundle.js` SHA-256 MATCH, 운영 주소에서 1280·1920 측정 확인. 기록: `docs/LINEBREAK-20261119.md`. 되돌릴 대상: https://cf4d38e5.leafy-garden.pages.dev (`75b8869`).
- 추가 배포 https://2545412d.leafy-garden.pages.dev (`6a28329`) → https://7729e1eb.leafy-garden.pages.dev (`90b3b23`, 소리 2차 수정): 공통 지침 `_shared/AUDIO-FIX2-BRIEF-20261119.md` 03번과 7장. ① 효과음을 세 갈래로 나눴다(`src/audio.js`): 화면 조작(누르기·끌기·정답/다시, 한 번에 하나), 전투·보상(타격·카드·징글·장소 열림, 최대 4개가 겹치고 다른 갈래에 끊기지 않음), 발자국(따로 하나). ② 지도 발자국: 걷는 동안 0.29초마다(`stage-map.js` `STEP_MS`, 걷는 그림 흔들림 0.28초) `step-01/02`를 번갈아, 속도 ±6%, 크기 0.15(대사 중 0.075). 길 끝에 막히거나 창·카드·파이널 창이 떠 있으면 안 난다. ③ 장소 열림: 지도가 새 장소를 처음 열린 모습으로 보여 줄 때 `open-01`(0.5) + 0.12초 뒤 `twinkle-03`(0.4) 한 번, 이어지는 악당 대사는 0.3초 뒤. 직전 열림 상태는 메모리에만 두어 새로고침·재방문·교사용 미리보기에서는 안 난다. ④ 판정이 있는 선택에 `correct-01`/`retry-01`(0.3). 예상·관찰 기록은 무음. ⑤ 축하 순서: 타격음 → 0.3초 뒤 퇴장 대사 → 대사가 끝난 뒤 카드 → 카드 5장 완성 징글(따로 둔 승리 징글은 내지 않음) → 파이널 창. 징글이 나는 중에 창이 열리면 엔딩 테마를 1.2초에 걸쳐 올린다. 말풍선은 음성이 끝날 때(+0.2초, 상한 6초)까지 남는다. ⑥ 엔딩 테마(68초)가 끝나면 엔딩 화면·파이널 창에 머무는 동안 메인 테마 0.45배, 떠나면 평소 크기. ⑦ 대사 차례(`voice-lines.js`): 악당의 짧은 대사는 다른 인물 대사를 끊지 않고, 시작된 악당 대사는 안내 음성이 최대 2초 기다린다. ⑧ 배경 음악 기본 음량(저장값이 없을 때) 30 → 25. 새 음원 6개는 공통 라이브러리의 CC0 파일(`assets/CREDITS.md` 2026-11-19 절). `npm run check`·`npm test` 183개(새 12개)·`npm run build`(esbuild 번들) 통과. 운영 헤드리스 확인(1280×800, 재생 호출·음량 값 기록, 귀로 듣지 않음): 발자국 간격 299~301ms(첫 간격만 263~273ms로 측정됨), 소리 끄면 0회, 장소 열림 1회·재방문 0·새로고침 0, 악당 대사는 열림 소리 301ms 뒤, 3타 뒤 대사 301ms·대사 끝 127ms 뒤 카드, 전투·카드 소리 정지 호출 0건, 파이널 창 엔딩 테마 0.063(0.3초) → 0.25(1.6초), 68초 뒤 메인 테마 0.1125 → 닫으면 0.25, 대사 중 배경 음악 0.0625, 콘솔 오류·404 없음. `cmp.sh` MATCH(`sw.js`·`index.html`·`src/app.bundle.js`·`src/voice-lines.js`·`src/map-encounters.js`), `build-info.json` 커밋 `90b3b23`. `tests/stage-map.browser.mjs`는 이번 변경 전부터 35행(잠긴 장소 → 가기 뒤 출발 창을 기다림, 지금은 바로 활동이 열림)에서 멈춘다 — 고치지 않았다.
- 추가 배포 https://7e81a1ec.leafy-garden.pages.dev (`4d21377`, 브라우저 테스트 2개 재작성): `tests/expedition.browser.mjs`·`tests/delivery-touch.browser.mjs`를 11-18 미션 재설계에 맞춰 다시 썼다. expedition은 1장 현장 2단계(세로 재분류 없음), 2장 오답 문구, 5장 예상 → 비 → 가방 카드 3장(같은 카드를 다시 누르면 「방금 비를 맞았어」로 거절). delivery-touch는 1장 오답 말풍선(「가장자리」 단서·카드 그대로), 버튼 조작을 설정 창 「현장 임무를 버튼으로 조작」으로 켜고 끄기, 3장 새로고침 뒤 바로 3단계, 끝낸 기록은 엔딩 화면의 지도 버튼으로 들어가 편지·보상 4크기 확인, 3D 대체 확인은 다시 들어간 3장 실험실에서. 테스트는 배포물에 들어가지 않아 앱 파일은 그대로이고 `build-info.json` 커밋만 바뀐다. 검증(Mac, Node v24.22.2, 개발 서버 4353, 헤드리스 Chrome): expedition 5미션 통과(손 동작·탭·키보드·오답 안내·새로고침 유지), delivery-touch 통과(검사 23개, 1180×757·1024×768·1280×800·768×1024 편지·보상 버튼 화면 안, 3D 모듈 차단·모형 차단·WebGL 끔 모두 그림 대체, 페이지 오류 0), `npm run check` 59개, `npm test` 171/171, 배포 빌드 327파일(esbuild 묶음). 운영: `build-info.json` 커밋 `4d21377`, `/`·`sw.js`·`app.bundle.js`·`bundle.css`·`frame.css`·`scene-refinements.css`·`build-info.json` SHA-256 일치(MATCH). 터치는 에뮬레이션이라 실물 태블릿 손가락 터치 통과가 아니다. 되돌릴 대상: https://7729e1eb.leafy-garden.pages.dev (`90b3b23`).
- 추가 배포 https://8a8730a0.leafy-garden.pages.dev (`af6e27a`, 소리 3차 수정): 공통 지침 `_shared/AUDIO-FIX3-BRIEF-20261120.md` 1장·03번. ① 설정 소리 항목 다섯 개: 배경 음악 스위치·크기, 효과음 스위치·크기(0~100%, 5% 단위, 기본 100%, 키 `green-garden-sfx-volume`, 모든 효과음이 지나는 한 gain에 곱함), 목소리 스위치(키 `green-garden-voice`). 효과음 스위치는 이제 효과음만 끄고, 목소리를 끄면 읽던 대사가 바로 멈추고 배경음 줄임도 풀린다. 헤더 소리 버튼은 셋 모두. ② 저장 호환: 목소리 값이 없으면 그때의 효과음 스위치 값을 이어받아 바로 기록, 효과음 크기는 100%. ③ 쓰는 화면이 없던 `npc-narration-volume`은 더 읽지 않는다(음성 0.7 고정, 전과 같은 값). ④ 첫 입력 전에 열린 창의 대사는 재생을 시도하지 않고 첫 누름·키 뒤 한 번(창이 닫혔으면 생략). ⑤ 설정 창 위 X 제거(아래 오른쪽 닫기 하나, Esc 유지). 개념 장면은 그림과 자막 음성뿐이라(영상 소리 트랙 없음) 1-2 해당 없음. 같은 배포에 다른 작업의 `023cf27`(성취 카드 잠긴 문구 줄바꿈)이 들어 있다. 검증(Mac, Node v24.22.2): `npm run check` 59개, `npm test` 186/186, 빌드 327파일(esbuild 묶음), 헤드리스 Chrome으로 개발 서버·운영 확인(재생 호출·gain 값 기록, 귀로 듣지 않음): 1280×800·1024×768·844×390 설정 창 화면 안·가로 넘침 0·48px 미만 대상 0·최소 글자 18px·위 X 0·Esc 닫기·다시 열면 맨 위, 목소리만 끄면 잠긴 장소 창 음성 0·배경음 0.25 그대로·닫기 클릭음은 남, 효과음만 끄면 리피 음성 남·효과음 0, 효과음 크기 100% → 버스 1, 50% → 0.5(발자국 0.15 × 0.5), 새로고침 뒤 유지, 3차 전 저장 효과음 끔/켬/없음 → 목소리 끔/켬/켬, 목소리 끈 채 마지막 악당 3타 → 카드 1.29초 → 파이널 6.35초(음성 재생 0). 운영 `cmp.sh` MATCH(`index.html`·`src/app.js`·`src/audio.js`·`src/voice-lines.js`·`src/polish.css`·`sw.js`·`build-info.json`), `build-info.json` 커밋 `af6e27a`. 되돌릴 대상: https://223b7bbe.leafy-garden.pages.dev (`023cf27`).
- 추가 배포 https://2e0ddea7.leafy-garden.pages.dev (`4ece429`, 소리 4차 수정): 공통 지침 `_shared/AUDIO-FIX4-BRIEF-20261120.md` 03번. 인트로·아웃트로 영상(둘 다 소리 트랙 있음, 리피 대사가 곡과 섞여 있음 — `_shared/voice-provenance-20261118.md`「인트로·아웃트로 영상 대사 ElevenLabs」, 자막도 리피 대사)은 대사만 뗄 수 없어, 목소리 스위치가 꺼져 있으면 영상을 음소거로 재생하고 배경 음악은 멈추지 않는다(`src/story.js`: `video.muted = !isVoiceOn()`, 곡은 영상 소리가 들릴 때만 멈춤). 목소리가 켜져 있으면 3차와 같다(영상 0.65·곡 멈춤). 영상 속 소리 버튼은 전과 같이 셋 다 켜고 끄며, 켤 때는 곡을 먼저 멈추고 끌 때는 스위치를 먼저 꺼서 곡이 잠깐 나지 않게 했다. 지도 파이널 창 영상은 원래 음소거라 그대로. 검증(Mac, Node v24.22.2): `npm run check` 59개, `npm test` 186/186, 빌드 327파일(esbuild 묶음). 헤드리스 Chrome(재생 호출·요소 상태 기록, 귀로 듣지 않음) 개발 서버·`dist`·운영: 목소리 끔 → 인트로·다시 보기·아웃트로 영상 `muted` true, 배경 음악 재생 0.25 그대로, 건너뛰기·끝까지 재생 뒤 지도/설정/엔딩으로 정상, 아웃트로 뒤 `ending-theme` 처음부터 0.25. 목소리 켬 → 영상 muted false·0.65, 곡 멈춤 → 끝나면 0.25 복귀(엔딩 화면은 일기 대사로 0.063). 목소리·배경 음악 끔, 전체 끔 → 곡 없음·영상 음소거·흐름 정상. 첫 입력 전 재생 시도 0, 콘솔 오류·404 0. 운영 `cmp.sh` MATCH(`index.html`·`src/app.js`·`src/audio.js`·`src/story.css`), `src/app.bundle.js`·`src/story.js`·`sw.js`(캐시 무시 요청)도 빌드와 같음, `build-info.json` 커밋 `4ece429`. 되돌릴 대상: https://8a8730a0.leafy-garden.pages.dev (`af6e27a`).
- 추가 배포 https://cdc6c298.leafy-garden.pages.dev (`0430276`, 제작·저작권 표기): 공통 지침 `_shared/CREDIT-LINE-20261120.md` 03번. 시작 화면(`src/app.js` `home()`) 우측 하단에 「기획·제작: 옐샘 & ⓒ 아이스크림미디어」 한 줄을 작게 넣었다(`src/scene-refinements.css` `.home-credit`: 글자 `clamp(10px,.9vw,13px)`·700, 오른쪽·아래 16px + safe-area, 반투명 짙은 초록 바탕, `pointer-events:none`). 설정 창의 제작 줄·저작권 줄 통일(`91fa46e`)도 이 배포에 함께 나갔다. 확인(Mac, 헤드리스 Chrome, 로컬·운영 둘 다, 새 컨텍스트): 1280×800 11.52px·1024×768 10px·1920×1080 13px·844×390 10px, 네 뷰포트 모두 화면 안·조작 요소와 겹침 0·배경 대비 최소 5.4:1, 시작을 누르면(인트로 → 지도) 표기 없음, 「탐험 이어 하기」 상태에서도 같은 자리, 콘솔 오류 0. `npm run check`·`npm test`(186개)·`npm run build`(esbuild 묶음) 통과. 운영: `cmp.sh` `src/app.js`·`index.html` MATCH, index가 `/src/app.bundle.js`를 가리킴, `build-info.json` 커밋 `0430276`. 실물 태블릿 확인은 하지 않았다.
- 추가 배포 https://71c82184.leafy-garden.pages.dev (`dbf056c`, 최종 점검 11-20 글자 하한): 운영 배포본(`fe8335e`, 634ec4da) 전체 재점검에서 지도 악당 말풍선이 모든 화면 13px(1024 하한 14px·1920 하한 18px 아래), 「정원 더 보기」 메뉴 버튼이 1920에서 16px인 것을 찾아 말풍선 16px(1500px 이상 18px)·폭 220/250px·`text-wrap: balance`, 메뉴 1500px 이상 18px로 고쳤다. 대사·판정·저장 로직은 그대로. 검증(Mac, Node v24.22.2): `npm run check` 59개, `npm test` 186/186, 배포 빌드 327파일(esbuild 묶음). 운영: `build-info.json` 커밋 `dbf056c`, `/`·JS·CSS 40개·`sw.js`·`map-encounters.js`·`layout.css` SHA-256 일치(MATCH), 말풍선 1024 16px·1920 18px 두 줄 화면 안, 메뉴 1920 18px, 여정 테스트 통과. 기록: `docs/reviews/RELEASE-REVIEW-20261120.md`, `SCORE-20261120.md`(86/100). 되돌릴 대상: https://634ec4da.leafy-garden.pages.dev (`fe8335e`).
- 미검증: 실물 iPad Safari·Android Chrome 손가락 터치, 태블릿 GPU, 학생 반응. 헤드리스 캡처는 WebGL을 끈 상태라 정원·잎자루 입체 대신 그림 화면이 나온다.

## 이전 배포 — 2026-11-01 (리피 힌트 버튼이 탐구 화면에서 사라지던 문제 수정)

- 기능 커밋: `3323a9e`(`sort-board-drag`, GitHub push 안 함). 배포 빌드 커밋 `3323a9e9d3870afdfd6e9147eb9a9f728fc29d26`, `dirty=false`.
- 배포 주소: https://cc5a6132.leafy-garden.pages.dev
- 운영 주소: https://leafy-garden.pages.dev
- 되돌릴 대상: 직전 배포 https://68a75e81.leafy-garden.pages.dev (커밋 `4747500`)
- 바뀐 것: 남은 활동 목록이 왼쪽 칸을 다 차지해 태블릿 가로에서 리피(힌트 버튼)가 0~10px로 눌리고 말풍선이 "이번 탐구는?" 위로 겹치던 문제. 리피는 84px 아래로 줄지 않고, 자리가 모자라면 "오늘의 연구" 패널만 안에서 스크롤한다(활동 6·7도 같은 방식). 패널이 스크롤되면 다음에 할 줄을 보이는 곳까지 내려 준다. 화면 문구는 바꾸지 않아 글꼴 서브셋은 다시 만들지 않았다.
- 빌드 183파일·120에셋·45,733,041바이트, esbuild 번들(전역 wrangler 4.151.1의 esbuild 0.28.2). 업로드는 바뀐 6파일.
- 배포 전 Windows(Node v24.11.0)에서 JavaScript 48개 문법 검사, 154/154 테스트 통과. QA 포트 4351에서 Playwright 1.56.1 에뮬레이션으로 확인: 6개 화면 크기(iPad 7세대·Mini·Pro 11 가로 WebKit, Galaxy Tab S4 가로 Chromium, 1280×800, 1920×1080) × 15개 활동에서 리피 84px 이상·말풍선 보임·겹침 없음·누를 수 있음, 8개 기기 × 20개 화면 재점검에서 리피 지적 42건 → 0건, 새 지적 없음. 실물 태블릿 손가락 터치는 미실행.
- 운영 주소와 배포 주소의 `build-info.json` 커밋이 `3323a9e`·`dirty=false`이고, `/`·`src/app.bundle.js`·`src/frame.css`·`src/next-step-guide.js`·`sw.js`의 SHA-256이 로컬 dist와 같음을 확인했다(`/index.html`은 `/`로 308 이동하므로 `/`로 비교).

## 이전 배포 — 2026-10-31 (2) (남은 활동 안내·손가락 포인터, 손가락은 답을 가리키지 않음)

- 기능 커밋: `5efdd28`(남은 활동 안내·손가락 포인터 추가, 손가락은 답을 가리키지 않게) + `3e34dca`(.gitattributes) + `4747500`(글꼴 서브셋 재생성). 모두 `sort-board-drag`, GitHub push 안 함. 배포 빌드 커밋은 `4747500f0fb48618589d5fce220631e780717712`.
- 배포 주소: https://68a75e81.leafy-garden.pages.dev
- 운영 주소: https://leafy-garden.pages.dev
- 되돌릴 대상: 직전 배포 https://be2222fc.leafy-garden.pages.dev (커밋 `8687094`)
- 바뀐 것: 왼쪽 "오늘의 연구" 패널에 남은 활동 목록(✓/○)과 다음에 누를 조작을 짚는 손가락·말풍선. 손가락은 선택지 버튼을 가리키지 않고(잎 살피기는 관찰 그림 아래쪽, 분류 오답은 결과 문장, 질문 문장은 위에서 내려와 짚음) 틀린 잎 이름도 말하지 않는다.
- 빌드 183파일·120에셋·45,732,809바이트, esbuild 번들(전역 wrangler 4.151.1에 포함된 esbuild 0.28.2를 `ESBUILD_MODULE_PATH`로 지정), `dirty=false`.
- 배포 전 Windows(Node v24.11.0)에서 JavaScript 48개 문법 검사, 154/154 테스트 통과. 글꼴 서브셋은 이 PC의 Python 3.14.0·fontTools 4.64.0으로 재생성(`힣` U+D7A3 누락 경고는 글꼴 원본에 없는 문자라 화면 문구와 무관). 브라우저는 QA 포트 4351, 1280×800에서 1·2·5·6번 활동의 손가락 위치만 확인했고, 브라우저 테스트(`*.browser.mjs`)와 실물 태블릿 조작은 미실행.
- 운영 주소의 `build-info.json` 커밋이 `4747500`·`dirty=false`이고 `/`(index.html)와 `src/app.bundle.js`의 SHA-256이 로컬 dist와 같음을 확인했다. 번들 안 한글은 `\uXXXX`로 저장되므로 문자열 검색으로는 보이지 않는다. 이전에 연 기기는 첫 접속 한 번은 옛 화면이 보이고 다음 새로고침부터 새 버전으로 바뀐다.
- 배포 도구: 이 Windows PC(`C:\Users\bongb`)에 전역 설치된 wrangler 4.151.1로 배포했고, 로그인 정보는 `%APPDATA%\xdg.config\.wrangler\config`에 있다(Mac의 SSD `wrangler-home`과 별개).
- 함께 정리: Mac이 `.git` 안에 남긴 `._*` 파일 6개를 지웠다(Windows에서 Git 명령마다 "non-monotonic index" 오류가 나던 원인). `.gitattributes`(`* text=auto eol=lf` + 바이너리 지정)를 추가했고 `git add --renormalize .` 결과 내용 변경은 없었다.

## 이전 배포 — 2026-10-31 (본 탐구 직접 풀기·자동 진행 관찰·가방 두 부품 판정)

- 기능 커밋: `8687094fead9f61b64673ce9fff75c1459321222` (`sort-board-drag`, GitHub push 안 함). 같은 배포에 `03da7ad`(오늘 기능 전체) 포함.
- 배포 주소: https://be2222fc.leafy-garden.pages.dev
- 운영 주소: https://leafy-garden.pages.dev
- 되돌릴 대상: 직전 배포 https://0fbc1e7f.leafy-garden.pages.dev (커밋 `1490b68`)
- 바뀐 것: 현장 결과로 본 탐구를 미리 채우거나 첫 기록 페이지를 건너뛰지 않음(10쪽 모두 직접 풀기), 자동 진행은 관찰 조작만 몸짓 애니메이션으로, 현장 임무 목표줄 제거·다음 도전 작업판 오른쪽 아래 고정·남은 단계 안내 화살표, 가방은 연잎 겉면+덮개를 함께 달아야 공책이 마름(연잎만·덮개만·둘 다 시험), 계절·정원 사진을 연구노트에 붙이기, 선생님용 자세한 기록 삭제, 과학 문구 정리(풀밭→들판 등), 현장 임무·리피의 부탁·보상 팝업 스크롤 없이 한 화면, 구름 그림 `rain_cloud_clay`.
- 빌드 180파일·119에셋·45,658,498바이트, esbuild 번들, `dirty=false`.
- 배포 전 Mac(Node v24.22.2)에서 JavaScript 47개 문법 검사, 142/142 테스트 통과. 브라우저 테스트(`*.browser.mjs`)는 Playwright(SSD의 다른 프로젝트 1.64.1)로 돌렸으나 옛 흐름을 기대하는 테스트가 있어 통과시키지 못했다(갱신 필요).
- 운영 주소의 `build-info.json` 커밋이 배포 커밋과 같고 `/`·`src/app.bundle.js`·`src/bundle.css`·`sw.js`·각 모듈·구름 그림 SHA-256이 로컬 dist와 같음을 확인했다. 첫 화면 200, 외부 요청 0, 콘솔 오류 0.
- 서비스워커: 이전에 연 기기는 배포 후 첫 접속 한 번은 옛 화면이 보이고 다음 새로고침부터 새 버전(캐시 `green-garden-0.5.0-e107bbb3`)으로 바뀐다. 이 Mac 브라우저에서 확인했다.
- wrangler 로그인은 이번에 내장 드라이브 홈(`~/Library/Preferences/.wrangler`)을 썼다(SSD `wrangler-home` 로그인이 만료됨). 실물 태블릿 조작은 미검증이다.

## 이전 배포 — 2026-10-29 (2) (연구노트 손글씨 페이지·보고서 간소화·엔딩 음악)

- 기능 커밋: `1490b68d66c2cf4fd4f4e77e68db58a7b8cfb82d` (`sort-board-drag`, GitHub push 안 함). 직전 커밋 `eda0df4`(1장 새 잎 다시 나누기 제거, 2장 겨울/봄 덮개·칸 비율)도 이번에 처음 배포됐다.
- 배포 주소: https://0fbc1e7f.leafy-garden.pages.dev
- 운영 주소: https://leafy-garden.pages.dev
- 바뀐 것: 연구노트를 왼쪽 사진·스티커·기억 퀴즈, 오른쪽 학생 손글씨 기록(처음 생각·본 것·바뀐 생각)으로 개편하고 준비된 정리·선생님용 기록은 접힌 칸으로 옮김. 보고서의 '가방 소개하기'(친구와 이야기) 단계와 인쇄 버튼 제거. 아웃트로 영상 중 엔딩 테마를 처음부터 재생.
- 빌드 177파일·118에셋·45,584,023바이트. `dirty=true`는 줄바꿈(CRLF/LF)만 다른 작업 파일과 추적하지 않는 파일 때문이며 내용은 커밋과 같다.
- 배포 전 JavaScript 45개 문법 검사, 117/117 테스트를 통과했다(보고서 친구 소개 테스트 1개 제거). 브라우저 테스트(`*.browser.mjs`)는 돌리지 않았다.
- 운영 주소의 `build-info.json` 커밋이 배포 커밋과 같고 `/`·`app.bundle.js`·`bundle.css`·`sw.js` SHA-256이 로컬 dist와 같음을 확인했다. 운영 주소 첫 화면 로드 시 콘솔 오류 0건. 연구노트·엔딩 화면 직접 조작과 실물 태블릿은 미검증이다.

## 이전 배포 — 2026-10-29 (비 내리기 버튼·인트로 배경음·지도 손바닥)

- 기능 커밋: `78ba77829ccfb58fa34b6c642f30c7706dd62ff3` (`sort-board-drag`, GitHub push 안 함)
- 배포 주소: https://e6ab0df7.leafy-garden.pages.dev
- 운영 주소: https://leafy-garden.pages.dev
- 바뀐 것: 5장 '버튼으로 하기'의 비 내리기 버튼을 결과 카드 아래(처음 가방으로 옆)로 옮겨 가방·문구 가림 해소, 인트로 영상(자체 소리 거의 무음) 중에도 메인 배경음 유지, 지도 화면 손바닥 '손으로 밀기' 토글(끌어서 지도 보기, 리피 이동 시 다시 따라가기).
- 이 Mac에서 처음 배포했다(위 'Mac에서 배포할 때'). 빌드 180파일·118에셋·45,568,498바이트, esbuild 번들. `dirty=true`는 줄바꿈(CRLF/LF)만 다른 작업 파일과 추적하지 않는 파일 때문이며 내용은 커밋과 같다.
- 배포 전 JavaScript 45개 문법 검사, 118/118 테스트를 통과했다. 브라우저 테스트(`*.browser.mjs`)는 Playwright가 없어 돌리지 않았고, 로컬 dist와 운영 주소에서 인트로 배경음·지도 손바닥 버튼·콘솔 오류 0건을 직접 확인했다.
- 운영 주소의 `build-info.json` 커밋이 배포 커밋과 같고 `/`·`app.bundle.js`·`bundle.css`·`sw.js` SHA-256이 로컬 dist와 같음을 확인했다. 실물 태블릿 조작은 미검증이다.

## 이전 배포 — 2026-10-28 (5장 간소화·꽃길·3장 배치)

- 기능 커밋: `56ad5155ac24f24f63d9e5a9aecd479efd246fd6` (`sort-board-drag`)
- 배포 주소: https://08ad75e4.leafy-garden.pages.dev
- 운영 주소: https://leafy-garden.pages.dev
- 바뀐 것: 5장 발명 공방을 예상·첫 비 → 부품 하나씩 달고 비 → 공책 지킨 부품 고르기로 간소화(기록 페이지 요약), 꽃길을 지도 화풍의 작은 들꽃 무리로 교체, 3장 현장 임무 화면 왼쪽 쏠림 수정.
- 배포 전 JavaScript 45개 문법 검사, 118/118 테스트, 전체 여정·터치 전용(26항목)·레이아웃(115항목)·런타임 브라우저 테스트를 통과했다.
- 운영 주소의 `build-info.json` 커밋이 배포 커밋과 같고 `app.bundle.js`·`bundle.css` SHA-256이 로컬 dist와 같음을 확인했다. 실물 태블릿 조작은 미검증이다.

## 이전 배포 — 2026-10-28 (납품 전 최소 수정)

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
