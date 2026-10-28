# 초록정원 연구기지 · 0.5

식물 관찰에서 정원 설계와 발명 개선까지 이어지는 5개 미션·10개 활동 교육용 웹게임. 0.5에서는 길을 따라 탐험하는 지도, 두 기준 분류 실행, 두 식물의 겨울·봄 사진, 예상과 공기 방울 실험, 직접 칠하는 정원, 한 부품 비교 시험을 연결한다. 잎·잎자루·정원·가방은 로컬 Three.js로 만든 입체 학습 모형이며 그림과 버튼 대안도 제공한다. 잎자루 전체·단면과 알로에, 2단계 벚나무·씀바귀는 로컬 GLB 모형을 사용한다. 생육·유체 시뮬레이션은 포함하지 않는다.

## 실행과 납품

Node.js 환경에서 `npm start` 후 http://127.0.0.1:4318 접속. 별도 패키지 설치는 필요 없다.

시작 버튼은 전체 화면 인트로 영상 → 탐험 지도, 탐구 완료는 아웃트로 영상 → 탐구 기록으로 이어진다. 설정에서 두 영상을 다시 볼 수 있고, 엔딩은 완료 후에 열린다. `src/story-data.js`에서 장면별 한국어 자막과 시간을 관리한다. 영상에는 일시 정지·소리·자막·재생 위치·건너뛰기를 제공한다.

`_source/videos/intro.mp4`·`outro.mp4`는 제공받은 원본이다. 실제 앱과 빌드는 `assets/videos/`의 720p H.264/AAC 웹용 영상과 첫 장면 포스터를 사용한다. 로컬 서버도 영상 구간 요청(HTTP Range)을 지원한다. 영상은 서비스워커 초기 캐시에서 제외하며, 불러오지 못해도 다음 화면으로 이동할 수 있다.

```text
npm run check
npm test
npm run build
npm run preview
```

`preview`는 같은 주소에서 dist만 제공한다. start와 동시에 쓸 때 PowerShell에서 `$env:PORT='4323'; npm run preview`로 포트를 바꾼다. 서버는 로컬에서만 열린다.

배포 파일은 `dist/`이며 **폴더 안의 내용을 사이트 루트(/)**에 올린다. `/src`, `/assets` 절대경로를 사용하므로 하위 경로 배포는 경로 조정이 필요하다. 운영 주소는 https://leafy-garden.pages.dev 이며 배포 절차와 확인 내역은 `docs/DEPLOYMENT.md`에 기록한다.

## 파일 안내

- `src/app.js`: 화면과 사용자 동작, 저장 연결, 서비스워커 등록.
- `src/settings-content.js`: 설정 화면 문구 전부(앱 버전 `APP_VERSION`, 성취기준 `STANDARDS`).
- `src/audio.js`: 효과음·빠른 음소거·소리 설정 보존. `assets/audio/`의 메인·엔딩 테마를 단일 플레이어로 재생하며, 영상 재생·탭 숨김 중에는 배경 음악이 멈춘다.
- `sw.js`, `manifest.webmanifest`, `assets/icons/`: 오프라인 캐시와 설치형 앱(PWA).
- `src/model.js`: 미션 조건·저장 복원·정원·시험 판정.
- `src/asset-catalog.js`: 생성 이미지의 고정 키·설명·표시 함수, 보상 썸네일 목록(`THUMBS`).
- `src/art.js`: SVG 도식과 표본·가방 그림 배치.
- `src/rewards.js`: 완료 기록으로 계산하는 빛씨앗, 복구 시설 지도, 꽃길 선택.
- `src/stage-map.js`, `src/stage-map.css`: 길을 따르는 지도 이동, 단계 안내, 전체 지도·리피 추적 보기. 교사용 전체 해금은 메모리에서만 미리 보고 종료·새로고침 시 학생 기록으로 돌아간다.
- `src/invention.js`: 그림 부품, 빗물 시험, 실패 원인과 비교 기록.
- `src/inquiry.js`: 장소별 의뢰와 환경·특징·생활 연결 자료, 분류 확인.
- `src/learning.js`: 관찰 증거·계절 사진·환경 연결·보고·새 상황 적용 화면.
- `src/spatial.js`, `src/fieldwork.css`: 입체 관찰·정원·가방과 그림 대안. Three.js r181의 MIT 라이선스는 `assets/three-license.txt`.
- `src/style.css`, `src/visuals.css`, `src/adventure.css`: 기본 디자인. `src/layout.css`는 전체 화면 틀과 태블릿별 최종 배치 규칙이다. `src/frame.css`(마지막에 읽음)는 활동 화면의 오늘의 연구·활동 무대·하단 동작 배치를 맡는다. 자세한 값은 `docs/DESIGN-SYSTEM.md`.
- `assets/generated/`: 원본 PNG와 화면용 WebP. `assets/CREDITS.md`: 출처.
- `docs/ASSET-PROMPTS-20261014.json`: 이미지 생성 프롬프트 기록.
- `docs/reviews/FINAL-CHECK-20261020.md`: 23항목 점검·수정·남은 현장 검수.
- `docs/reviews/design-20261020/`: 화면 크기별 캡처와 실측 JSON.
- `docs/기능향상기-20261020.md`: 이번 디자인과 설정 개선 내용.
- `docs/reviews/viewport-results.json`, `docs/reviews/screenshots/`: 실제 브라우저 검사 결과.

## 이미지 교체

현재 WebP만 바꿀 때는 같은 키·파일명을 유지한다. 원본을 바꾼 경우 `npm run assets:optimize`로 WebP를 다시 만든 뒤 빌드한다. 압축은 기존 bundled sharp를 사용하며, 다른 PC에서는 설치된 sharp 경로를 `SHARP_MODULE_PATH`에 지정한다. 실행·테스트·빌드에는 sharp가 필요 없다.

입체 모형은 활동에 들어갈 때 지연 로딩한다. WebGL을 사용할 수 없으면 기존 그림·격자·버튼으로 탐구할 수 있다. 그림 모드 선택은 활동 중 도구를 바꾸거나 식물을 심어도 유지된다. 학습 기록과 판정은 렌더링 방식과 분리되어 있다.

Git에는 코드·테스트·문서·실행용 WebP를 보관한다. `dist/`는 `npm run build`로 생성한다. 참고 교재(`_reference/files/`), 참고 이미지(`_source/original-images/`, `samplepages/`), 생성 PNG 원본, 기존 ZIP, 공유 대화 수집 원본은 로컬에 남기고 Git에서 제외한다.

## 기록과 사용 안내

진행은 현재 주소·브라우저의 localStorage에 자동 저장된다. 다른 기기와 동기화하지 않으며 브라우저 데이터를 지우면 기록이 사라진다. 계정·개인정보 입력·외부 추적 호출은 없다.

설정 화면은 iscream-settings 순서를 따른다: 배경음·효과음 스위치와 배경음 음량 → 시작 이야기·엔딩 다시 보기(완료 뒤) → 앱 정보·배움과 보상·학생/교사 가이드·자료 출처 → 기록 초기화(확인 단계)·닫기. 배경음 파일이 없으면 해당 스위치는 비활성화된다. 교사용 도구의 전체 열기는 화면 미리보기이며 학생의 완료·보상·저장을 바꾸지 않는다. 단면과 가방 시험은 원리를 설명하는 학습 모형이다.

버전을 올릴 때는 `package.json`과 `src/settings-content.js`의 `APP_VERSION`을 함께 바꾼다(테스트·빌드가 일치를 검사한다).

## 오프라인(PWA)

`npm run build`가 `dist/sw.js`의 `CACHE_VERSION`을 `버전-내용해시`로 바꾸고 앱 셸(HTML·JS·CSS·글꼴·첫 화면 그림) 목록을 넣는다. HTML은 네트워크 우선, 나머지는 캐시 우선이며 새 배포 때 옛 캐시를 지운다. 개발 중 캐시가 수정을 가리지 않도록 localhost에서는 등록하지 않는다(확인하려면 주소 뒤에 `?sw`). 오프라인이면 상단에 작은 안내가 뜨고 기록은 계속 이 브라우저에 저장된다.

## 검증 상태

0.2의 일반 모드 전체 경로와 기존 12개 테스트 검증은 이전 보고서에 보관했다. 0.3에서는 보상·꾸미기 저장·가방 네 가지 결과 테스트 3개를 추가했다. 변경 화면의 직접 조작과 반응형 검증은 `docs/reviews/REVISION-CHECK-20261015.md`를 참고한다. 실제 수업의 이해도와 흥미는 학생 대상 사용성 검증이 남아 있다.

## 0.4 태블릿 탐험판 (2026-10-18)
- 전체 화면 탐험 지도와 장소별 입장 안내, 큰 활동 장면과 접어 둔 기록.
- 가로형 1280×800 / 1024×768, 낮은 화면 1280×720 검증.
- 계획·변경·검증: docs/TABLET-EXPLORATION-20261018.md

## 0.5 탐구·입체 조작 개편 (2026-10-18)

- 공유 설계 반영 범위: `docs/SHARED-DESIGN-RECONCILIATION-20261018.md`.
- 중단 작업 복구·실측·제한: `docs/reviews/FINAL-CHECK-20261018.md`.
- 앱의 실행·빌드에는 패키지 설치가 필요 없다. 코드 보관용 GitHub 저장소와 실제 웹앱 공개 배포는 별개이며, 공개 호스팅은 수행하지 않았다.


## 폴더 정리 (2026-10-19)

| 폴더 | 내용 | Git |
|---|---|---|
| `assets/models/` | 3D 모형 GLB와 원본 대조표(`README.md`) | 포함 |
| `assets/fonts/` | 화면 글꼴 서브셋, `source/`에 공식 원본 | 포함 |
| `docs/planning/` | PRD·TRD·QA(0.1)·심화 통합설계 v2 | 포함 |
| `_source/` | Meshy 원본 GLB, Meshy 입력 그림, 설계 대화 원본 그림 | 제외 |
| `_reference/` | 참고 교재(`files/`)·샘플 화면(`samplepages/`) | 제외 |
| `_unused/` | 안 쓰는 그림·옛 납품 zip·예전 배포 잔여물(지우지 않고 보관) | 일부 |


## 리피의 연결 탐험 (2026-10-20)

다섯 장소마다 3단계 현장 임무와 기존 관찰·설명 기록을 연결했다. 표본 끌기/분류, 겨울과 봄 연결/사진 순서, 예상과 뜨기 비교, 환경·식물 배치 후 비 시험, 가방 부품 조립·한 부품 비교를 수행한다. 드래그와 선택 후 놓기·키보드는 같은 증거를 만든다. 새로 시작하는 탐구는 현장 임무까지 마쳐야 보상을 받고, 기존 완료 기록은 보존한다.

`src/field-missions-state.js`는 증거·판정, `src/field-missions.js`는 현장 화면·포인터, `src/expedition.js`는 리피 의뢰·도구·다음 탐구 단서를 맡는다. 도구와 빛씨앗은 실제 완료에서 계산하며 반복 열기로 늘지 않는다. 새 WebP 표본·수조·입체단면·보상·정원 이미지를 실제 화면에 적용했다. 원본과 job·프롬프트·해시는 `docs/ASSET-PROVENANCE-20261020.json`에 보존한다.

- 학습·보상 설계: [EXPEDITION-PLAN-20261020.md](docs/EXPEDITION-PLAN-20261020.md)
- 최종 검증: [FINAL-CHECK-20261020-2.md](docs/reviews/FINAL-CHECK-20261020-2.md)
- [인트로 영상 프롬프트와 참조 이미지](https://chatgpt.com/space/page_f1ad1e0ce5088191afbc32894d6ac15d)
- [아웃트로 영상 프롬프트와 참조 이미지](https://chatgpt.com/space/page_0d0c543af28c819181ccc39320034665)

인트로·아웃트로는 `assets/videos/`의 웹용 H.264 영상과 `src/story-data.js`의 한국어 자막으로 연결했다. `assets/audio/`의 Suno 메인·엔딩 테마는 전역 플레이어 하나를 공유하며 영상 중에는 멈춘다. 제공 원본과 편집 자료는 `_source/`에 보존한다.


## 운영 배포

[초록정원 연구기지](https://leafy-garden.pages.dev) · [배포 방법](docs/DEPLOYMENT.md). Cloudflare Pages의 leafy-garden 프로젝트에 검증한 dist를 직접 업로드한다.

## 원본·실행 파일 정리 (2026-10-23)

- `assets/audio/`: 앱에서 쓰는 메인·엔딩 MP3.
- `assets/videos/`: 웹용 영상·포스터. 제공 원본은 `_source/videos/`.
- `assets/generated/`: 실행용 WebP. 편집용 PNG는 `_source/generated-images/`.
- `_source/branding/`: 제목·캐릭터 PNG 원본.
- `_unused/assets/generated/`: 현재 화면·카탈로그에서 참조하지 않는 예전 합본 그림 4장.
- `docs/reviews/ASSET-ORGANIZATION-20261023.json`: 파일 이동 전후 경로·크기·SHA-256. 원본은 삭제하지 않는다.

## 최신 최종점검 (2026-10-24)

- [23항목 성적표](docs/reviews/FINAL-CHECK-20261024.md) · [11점 개선 계획](docs/FINAL-UPGRADE-PLAN-20261024.md).
- 3D 로딩 실패의 그림 대체·재시도는 `src/runtime-support.js`와 `src/app.js`에서 처리한다. 지연 응답은 현재 화면에만 적용한다.
- 화면 크기 검증은 별도 포트의 `tests/final-review.html`에서 진행한다. 이 페이지는 검증용 기록을 준비하므로 학생이 사용하는 origin에서 열지 않는다. 준비 기록의 렌더 검증은 실제 학생 완주나 수업 효과 검증과 다르다.
- 새 화면 문구를 바꾼 뒤에는 `python scripts/subset-fonts.py`로 글꼴을 갱신하고 `npm run check`, `npm test`, `npm run build`를 실행한다.


## 납품 전 디자인·교실 준비 고도화 (2026-10-25)

- 활동 화면을 샘플 화면 구성(위 여정 · 왼쪽 오늘의 연구와 리피 · 가운데 활동 무대 · 아래 할 일 하나)으로 통일했다. 리피의 반응과 다음 할 일은 말풍선 한 곳에 나온다. 배치 규칙은 `src/frame.css`, 설명은 `docs/DESIGN-SYSTEM.md`.
- CSS·SVG로 그리던 선인장·부력 모형·초봄 새싹·천 조각과 서식지 버튼을 같은 화풍의 생성 그림 9장으로 바꿨다(`assets/CREDITS.md`).
- 지도에서 다음 장소의 배경 그림을 한가할 때 미리 받아, 활동이 빈 화면으로 열리지 않는다.
- `npm run build`가 CSS를 `src/bundle.css` 하나로 합치고, 설치된 esbuild가 있으면(`ESBUILD_MODULE_PATH`, 없으면 wrangler에 포함된 것) 앱 스크립트를 `src/app.bundle.js` 하나로 묶고 압축한다. 입체 모듈(`spatial.js`)은 따로 남아 필요할 때만 받는다. esbuild가 없으면 기존 모듈 그대로 배포한다. 첫 화면 요청 36→11개.
- 설정 › 교사용 가이드 › 교사용 도구의 **수업 전 오프라인 준비**: 배포 주소에서 한 번 연 기기에서 그림·입체 모형·three.js를 하나씩 차례로 저장한다. 영상은 연결될 때만 재생되고 끊기면 건너뛸 수 있다. 서비스워커가 없는 localhost에서는 안내만 뜬다(`?sw`로 확인).
- 점검: `docs/reviews/FINAL-CHECK-20261025.md`, 증거 `docs/reviews/final-20261025/`.
- 2단계 계절 탐구: 시간 손잡이에 **초봄**(보기 전용)을 넣었다. 겨울 땅속 확인 뒤 **관찰 렌즈로 겨울눈 찾기**(벚나무 가지 끝 3·씀바귀 뿌리 머리 1, 완주 조건 아님)를 추가했다. 계절 3D 설계와 Meshy 입력은 `docs/meshy-season-20261025/`.
- 2단계 계절 타임랩 3D(2026-10-25): 같은 벚나무·씀바귀 GLB 한 벌 위에 계절별 잎·단풍·겨울눈·벚꽃을 붙여 다섯 계절을 돌려 보고, 흙 단면으로 뿌리를 보며, 렌즈로 3D 가지 끝을 눌러 겨울눈을 찾는다. WebGL이 없으면 기존 2D 그림으로 같은 탐구를 한다. GLB 대조표는 `assets/models/README.md`.

## 납품 전 최소 수정 (2026-10-28)

- 1장 톱니 기준을 "톱니가 있어/없어" 하나로 통일했다(크기는 기준이 아님). 오답 힌트는 지금 기준의 단서만 준다. 돋보기는 ×4로 동백 잎의 작은 톱니가 보이고, 잎을 톡 눌러도 돋보기가 간다.
- 현장 임무 위쪽 "버튼으로 하기"를 누르면 키보드용 고르기→놓기 버튼이 한 패널로 보인다. 3장 잎자루는 빠르게 그어도(점 사이를 이어 판정) 되고, 양 끝을 차례로 눌러도 잘린다.
- 모든 팝업은 제목·버튼을 고정하고 본문만 스크롤한다(`src/app.js` `modal`, `src/frame.css`).
- 2장·5장 첫 예상 화면의 안내를 화면에 맞췄고, 5장 비 시험 안내는 상태에 따라 바뀐다.
- 4장 탐구 기록: 현장에서 넘어온 기본 정원도 "내 정원 확인"에서 소개할 자리 하나를 골라야 기록된다(`gardenPick`, 이미 완료한 기록은 그대로).
- 3D 실패 원인을 network·model·webgl로 구분해 원인별로 한 번만 알린다(`src/runtime-support.js`).
- 점검: `tests/delivery-fixes.test.mjs`, 터치 전용 점검 `tests/delivery-touch.browser.mjs`(QA 포트에서 실행).

## 5장 발명 공방 간소화 (2026-10-28)

- 현장 임무 세 단계로 끝난다: ① 예상하고 보통 가방에 비 → ② "연잎 겉면 달기"·"덮개 달기"를 하나씩 달고 달 때마다 비 → ③ 시험 카드 3장을 보고 공책을 지킨 부품 고르기. 한 번에 한 부품만 달 수 있어 공정한 시험이 따로 설명 없이 이루어진다.
- 다이얼 조립·동그라미 그리기, 본 탐구의 물방울 실험·두 번째 비 시험은 없앴다. 현장 기록이 본 탐구로 넘어가 기록 페이지는 요약만 보여 주고 "보상 받기" 한 번으로 끝난다(예상부터 보상까지 터치 약 12번).
- 상태: `field-bag-upgrade`·`field-bag-test`·`field-bag-answer`(`src/field-missions-state.js`). 예전 흐름으로 이미 마친 현장 기록(`delivered`)은 완료로 인정한다.
