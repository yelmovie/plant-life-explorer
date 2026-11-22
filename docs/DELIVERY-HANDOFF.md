# 납품 안내 — 초록정원 연구기지 (2026-11-22)

기존 배포 기록은 `docs/DEPLOYMENT.md`(날짜별 배포 내역)와 `README.md`에 있습니다. 이 문서는 그 내용을 한 곳에 모은 요약입니다.

## 1. 한눈에

- 프로젝트: 초록정원 연구기지, 앱 버전 0.5.4
- 운영 주소: https://leafy-garden.pages.dev
- 저장소: https://github.com/yelmovie/plant-life-explorer (`main`)
- 현재 운영 앱 커밋: `a8f69ba` (2026-11-22). Pages 배포 `814be42c`의 최신 인증서 파일을 공식 운영 주소에서 다시 대조했습니다. 이후 문서 변경은 앱 재배포 없이 기록합니다.

## 2. 폴더 구조

- 배포됨: `dist/`(빌드 결과. Git에 넣지 않음). 원본은 `index.html`, `sw.js`, `manifest.webmanifest`, `src/`, `assets/`.
- `src/`: 화면·판정·저장 코드와 CSS. `src/vendor/three/`는 Three.js r181(MIT).
- `assets/`: 그림(`generated/`), 영상(`videos/`), 음악·효과음(`audio/`), 3D 모형(`models/`), 글꼴, 성취 카드(`reward-cards/`), `CREDITS.md`.
- `scripts/`: `build.mjs`, `check.mjs`, 이미지 압축 등. `tests/`: 테스트.
- `server.mjs`: 로컬 실행 서버(영상 Range 지원).
- 보관용(배포 안 됨): `_reference/`, `_source/`, `_unused/`, `output/`, `docs/`, `thumbnails/`(납품 썸네일).

## 3. 실행·빌드·검사

`package.json`에서 확인한 명령입니다. 별도 패키지 설치는 필요 없습니다.

```text
npm start          # node server.mjs, http://127.0.0.1:4318
npm run check      # node scripts/check.mjs
npm test           # node --test tests/*.test.mjs
npm run build      # node scripts/build.mjs -> dist/
npm run preview    # dist만 제공
```

- 이 Mac에는 시스템 Node가 없습니다. Node와 wrangler는 외장 SSD `DevCaches/tools/`에 있습니다(`docs/DEPLOYMENT.md` 20행). 빌드는 wrangler에 들어 있는 esbuild를 `ESBUILD_MODULE_PATH`로 지정합니다.
- 버전을 올릴 때는 `package.json`과 `src/settings-content.js`의 `APP_VERSION`을 함께 바꿉니다.

## 4. 배포

- 호스팅: Cloudflare Pages, 프로젝트 `leafy-garden`, 운영 브랜치 `main`.
- 설정 파일: `wrangler.jsonc`(`pages_build_output_dir: ./dist`).
- 명령: `wrangler pages deploy dist --project-name leafy-garden --branch main`. 검증한 `dist/`를 직접 올립니다. GitHub 푸시로는 자동 배포되지 않습니다(`.github/workflows` 없음).
- 영상 탐색 요청(Range): **처리 파일이 없습니다.** 저장소에 `functions/`·`worker/`가 없고 공통 문서 `_shared/media-range-20261119/README.md` 표에도 3번이 없습니다. 영상은 `assets/videos/intro.mp4`, `outro.mp4` 두 개이고, 마지막 확인에서 원격 Range 요청은 전체 파일(200)로 응답했습니다(`docs/DEPLOYMENT.md` 220행). 재생은 되지만 중간 이동이 느릴 수 있습니다.

## 5. 다른 호스팅으로 옮길 때

- `dist/` 폴더의 내용을 사이트 루트(`/`)에 올립니다. `/src`, `/assets` 절대경로를 쓰므로 하위 경로 배포는 경로 조정이 필요합니다.
- 서비스 워커 `sw.js`는 루트에 있어야 합니다. 빌드가 `CACHE_VERSION`을 바꿉니다. 영상은 캐시하지 않습니다.
- 영상 구간 요청(Range)을 처리하는 호스팅이 좋습니다. Cloudflare에서는 `_shared/media-range-20261119/`의 방식을 쓸 수 있습니다.
- 환경 값·계정 키는 쓰지 않습니다. 진행은 브라우저 localStorage(`green-garden-mvp-v2`)에 저장되고 서버 호출이 없습니다.

## 6. 버전과 변경 이력

`git log`에서 뽑은 주요 변경입니다.

- 2026-11-22 `152b9af`·`a8f69ba`: 식물 테두리와 A4 가로 손기입 인증서 신설, 숫자 요약 없이 굵은 제목, 인쇄·PNG
- 2026-11-22 `5b3bc82`·`82f42f5`: 인증서 안내·그림 출처와 운영 출력 검증 기록
- 2026-11-21 `37c5e90` learning.js 일부를 `learning-lab-garden.js`로 옮김(동작 같음)
- 2026-11-21 `f94d78a` 현장 임무 다시 도전, 5장 탐구 기록 장면 확대
- 2026-11-21 `1430f10` 브라우저 뒤로 가기는 앱 안 앞 화면으로, 연구 노트 컨트롤 크기
- 2026-11-21 `7823969` 대비·48px 버튼·토스트 겹침 수정
- 2026-11-21 `2fbeb50` 성취 카드 보관함 글자 크기
- 2026-11-20 효과음 크기·목소리 스위치, 소리 3차
- 2026-11-18 이야기 영상에 자막 입힘(`1603137`), 전체 화면 재생
- 2026-10-23 인트로·아웃트로 영상 반영(`4c5884f`)
- 2026-10-18 0.5 탐구·입체 조작 개편

## 7. 권리·출처

`docs/RIGHTS-LEDGER-20261121.md`에 38줄이 있습니다. 출처 미확인은 0줄이고, 근거 약함이 11줄 남아 있습니다(Higgsfield 그림 6줄, Meshy 3D 2줄, Suno 음악 1줄, ElevenLabs 리피 목소리 1줄, 영상 속 음악 1줄). 요금제 화면과 결제 내역은 사용자 자료를 기다립니다.

## 8. 알려진 한계와 남은 일

`docs/reviews/SCORE-20261121.md` 기준 총점 92, 실기기 제외 97입니다.

- 실물·자료 대기: 실제 학생 수업(A3), 40분 수업(B16), 실물 손가락·가장자리(C19), 저사양 태블릿(D10), 학교 와이파이 로딩, 생성 이미지 권리 조건(F12)
- 남은 감점: 노트 접는 제목 등 44~46px 컨트롤, 큰 파일 `app.js`, `frame.css` 보정층
- Range 처리 파일 없음(4장)

## 운영 대조 기록 (2026-11-22 12:56)

- 조율 세션이 운영 주소의 `index`와 스크립트·스타일 파일 40개를 저장소 `origin/main`과 대조했습니다. 결과는 모두 일치입니다(불일치 0).
- 위 본문에 「운영 반영 확인 필요」로 적힌 칸은 이 대조로 확인된 것입니다. 이후 앱을 다시 배포하면 `_scratch/final-recheck-20261120/prodcmp.sh 03`로 다시 대조합니다.

## 최신 인증서 운영 확인 (2026-11-22T20:22:14+09:00)

- 인증서 앱 `a8f69ba`와 기존 Pages 배포 `814be42c`를 유지했습니다. 공식 운영 `https://leafy-garden.pages.dev`의 index와 인증서 관련 코드·스타일·그림 총6개가 현재 소스 또는 검증 빌드와 SHA256 일치하고 HTTP200입니다.
- 인증서는 A4 가로, 학교·학년·반·번호·이름 손기입 빈칸, 인쇄/PDF1쪽·PNG2400×1697입니다. 진행·성취 숫자 요약은 없고 제목900 굵기와 획 보강을 화면·인쇄·PNG에 맞췄습니다.
- 기존 `.tmp/cert-design-20261122/prod.json`에서1280×800·1024×768·1920×1080의 인증서 전체 표시·숫자 요약 없음·제목900·오류0을 확인했습니다. 문법 검사64파일·테스트192/192·빌드와 PDF·PNG 출력 검증은 기존 인증서 작업 기록입니다. 이번 마무리는 문서 최신화와 운영 파일·원격main 재대조입니다.
- 실기기·수업·교사 검수·권리 증빙 자료는 기존 대기 상태를 유지합니다.
