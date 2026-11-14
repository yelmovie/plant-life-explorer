# AGENTS.md — 초록정원 연구기지 (leafy-garden)

이 문서는 사람과 AI 에이전트(Codex·Claude Code 등)가 이 프로젝트를 Mac mini(집)와 Windows(직장) 사이에서 외장 SSD로 옮겨 가며 안전하게 개발하기 위한 지침이다. 기능 설명·변경 이력은 `README.md`, 배포 절차와 기록은 `docs/DEPLOYMENT.md`, 디자인 규칙은 `docs/DESIGN-SYSTEM.md`를 따른다. 이 문서와 README가 다르면 저장소의 실제 파일(package.json, scripts/)을 기준으로 확인한다.

작성 기준: 2026-10-30, Windows 11에서 저장소를 읽고 정리했다. Mac에서 명령을 실제로 실행해 확인한 내용은 아니다(Mac 관련 내용은 `docs/DEPLOYMENT.md`의 기록을 옮긴 것이다).

## A. 프로젝트 개요

- 초등 3학년 대상 식물 탐구 교육용 웹게임. 태블릿 가로 화면(16:9) 기준 PWA. 5개 장소(미션)·현장 임무·본 탐구·선인장 적용 문제·엔딩·연구노트로 구성된다.
- 프로젝트 루트: 이 파일이 있는 폴더(`3 leave`). 상위 폴더(`iscreammedia_sc34`)는 여러 프로젝트를 묶은 폴더이므로 이 지침을 상위 폴더나 다른 프로젝트에 적용하지 않는다.
- Git 원격: https://github.com/yelmovie/plant-life-explorer · 운영 주소: https://leafy-garden.pages.dev (Cloudflare Pages 프로젝트 `leafy-garden`).
- 기술 스택: 프레임워크·번들러 없는 바닐라 ES 모듈(HTML·CSS·JS). Three.js r181은 `src/vendor/three/`에 내장되어 있다. 개발 서버 `server.mjs`와 빌드 `scripts/build.mjs`는 Node 내장 모듈만 사용한다. `package.json`에 dependencies가 없고 lockfile도 없다.

### 주요 폴더

| 경로 | 내용 | Git |
|---|---|---|
| `src/` | 앱 코드·CSS·이야기 데이터. `src/vendor/three/`는 내장 라이브러리 | 포함 |
| `tests/` | `*.test.mjs`(node:test 단위 테스트), `*.browser.mjs`(Playwright 브라우저 검사), `final-review.html`·`scene-preview.html`(검증용 페이지) | 포함 |
| `scripts/` | 빌드·문법 검사·에셋 압축·폰트 서브셋, 일회성 변환 스크립트, Blender 스크립트 | 포함 |
| `docs/` | 기획·디자인 시스템·배포 기록·점검 보고서 | 포함(일부 제외, 아래 참고) |
| `assets/` | 실행용 WebP·GLB·MP3·MP4·글꼴·아이콘·OG 이미지 | 포함(PNG는 아이콘·OG만) |
| `index.html`, `sw.js`, `manifest.webmanifest` | 앱 진입점·서비스워커·PWA 정보 | 포함 |
| `server.mjs`, `package.json`, `wrangler.jsonc` | 로컬 서버·스크립트·Cloudflare 설정 | 포함 |

### 사용자 작성 원본과 자동 생성 파일

- 사용자 작성·제공 원본(직접 편집 대상): `src/`, `tests/`, `scripts/`, `docs/`, `index.html`, `sw.js`(빌드 전 원본), `manifest.webmanifest`, `server.mjs`, `package.json`, `wrangler.jsonc`, `README.md`, `_source/`(제공 영상·편집용 PNG·Meshy GLB·설계 원본), `_reference/`(참고 교재·샘플 화면), `assets/fonts/source/`(공식 글꼴 원본).
- 원본에서 생성하지만 Git에 보관하는 파일(재생성 시 원본과 도구가 필요): `assets/generated/*.webp`, `assets/title.webp`(`npm run assets:optimize`, sharp 필요), `assets/fonts/gg-*.woff2`(이전 화면 보관용 `python scripts/subset-fonts.py`, fontTools 필요). 현재 앱은 나눔스퀘어네오만 사용하고 제목은 화면 글자로 표시한다. 원본 없이 지우면 복구할 수 없으므로 삭제하지 않는다.
- 완전 자동 생성(Git 제외, 다시 만들 수 있음): `dist/`(`npm run build`), `graphify-out/`(`graphify update .`).

## B. 실행 환경

- Node.js: 버전 조건 **미지정**(`package.json`에 `engines` 없음, `.nvmrc`·`.node-version`·`.tool-versions` 없음). 임의로 버전을 고정하지 않는다.
  - 참고로 확인된 버전: Windows `v24.14.0`(npm 11.9.0, 2026-10-30, `C:\Users\user`)·`v24.11.0`(2026-10-31, `C:\Users\bongb`), Mac은 SSD의 `DevCaches/tools/node-v24.22.2-darwin-arm64`(`docs/DEPLOYMENT.md` 기록).
  - `npm test`는 `node --test tests/*.test.mjs`이다. Windows의 npm은 cmd.exe로 스크립트를 실행하며 cmd는 `*`를 펼치지 않으므로, Node 자체의 테스트 파일 glob 지원(Node 21 이상)에 의존한다. 그보다 낮은 Node에서는 Windows에서 테스트가 실패할 수 있다.
- 패키지 관리자: npm(스크립트 실행용). 설치할 의존성이 없으므로 `npm install`/`npm ci`가 필요 없다. lockfile을 새로 만들거나 패키지 관리자를 바꾸지 않는다.
- 선택 도구(앱 실행·테스트·빌드에는 필수 아님):
  - esbuild: `npm run build`가 찾으면 JS·CSS를 하나로 묶고 압축한다. 없으면 경고만 내고 묶지 않은 모듈로 빌드한다. wrangler에 포함된 esbuild를 `ESBUILD_MODULE_PATH`로 지정해 쓴다.
  - wrangler 4.154.0: 배포용. Mac은 SSD의 `DevCaches/tools/wrangler-4.154.0`(exFAT라 `--no-bin-links`로 설치), 로그인 정보는 `HOME=DevCaches/tools/wrangler-home`. `C:\Users\user` 계정의 Windows PC에서는 PATH에 wrangler가 없었다. `C:\Users\bongb` 계정의 Windows PC(2026-10-31 확인)에는 전역 wrangler 4.151.1이 설치·로그인되어 있어(`%APPDATA%\xdg.config\.wrangler`) 여기서도 배포할 수 있고, 그 안의 esbuild 0.28.2(win32-x64)를 `ESBUILD_MODULE_PATH=C:/Users/bongb/AppData/Roaming/npm/node_modules/wrangler/node_modules/esbuild`로 빌드에 쓸 수 있다.
  - sharp: `npm run assets:optimize`, `scripts/check-new-alpha.mjs`에서만 사용(`SHARP_MODULE_PATH`).
  - Playwright + Chrome: `tests/*.browser.mjs`에서만 사용(`PLAYWRIGHT_MODULE_PATH`, `BROWSER_EXECUTABLE`).
  - Python + fontTools: `scripts/subset-fonts.py`에서만 사용. `C:\Users\user` 계정의 Windows PC에는 Python이 없었다(Microsoft Store 실행 스텁만 있음). `C:\Users\bongb` 계정의 Windows PC에는 Python 3.14.0과 fontTools 4.64.0·brotli가 있어 서브셋을 만들 수 있다(2026-10-31 확인).
  - Blender: `scripts/blender-*.py`(3D 모형 제작용, 앱 실행과 무관).
- Python·Flutter 앱 코드는 없다. Python은 위 보조 스크립트에만 쓰인다.

## C. 명령어

모든 명령은 프로젝트 루트에서 실행한다. 경로에 공백이 있으므로(`3 leave`) 셸에서는 반드시 따옴표로 감싼다.

| 목적 | 명령 | 비고 |
|---|---|---|
| 개발 서버 | `npm start` | http://127.0.0.1:4318, 로컬에서만 열림. 패키지 설치 불필요 |
| 빌드 결과 미리보기 | `npm run preview` | `dist/`만 제공. 기본 포트 4318 |
| 문법 검사 | `npm run check` | `node --check`로 `server.mjs`·`src/`·`scripts/`의 JS와 three 파일 검사 |
| 단위 테스트 | `npm test` | `node --test tests/*.test.mjs` |
| 빌드 | `npm run build` | `dist/` 생성. 버전 일치·참조 파일 존재 검사 포함 |
| 에셋 압축 | `npm run assets:optimize` | `_source/`의 PNG → WebP. sharp 경로 지정 필요 |
| 이전 글꼴 서브셋 | `python scripts/subset-fonts.py` | 보관본 재생성 전용. 앱 빌드에는 나눔스퀘어네오만 포함 |
| 지식 그래프 갱신 | `graphify update .` | 코드 수정 후(상위 폴더 CLAUDE.md 규칙) |
| 린트·타입 검사 | 없음 | 스크립트가 없으므로 실행했다고 기록하지 않는다 |

### OS별로 다른 부분

포트 바꿔 실행(`start`와 `preview`를 동시에 쓸 때):

```powershell
# Windows PowerShell
$env:PORT='4323'; npm run preview
```

```bash
# Mac (zsh/bash)
PORT=4323 npm run preview
```

선택 도구 경로 지정(실제 설치 경로로 바꿔서 사용):

```powershell
# Windows PowerShell
$env:ESBUILD_MODULE_PATH='<wrangler 설치 경로>\node_modules\esbuild'; npm run build
```

```bash
# Mac — SSD의 도구 사용
ESBUILD_MODULE_PATH="<SSD>/DevCaches/tools/wrangler-4.154.0/node_modules/esbuild" npm run build
```

브라우저 테스트는 QA 포트에 서버를 띄운 뒤 실행한다(예: `PORT=4328`/`4351`, 각 파일 상단의 `JOURNEY_URL` 등 기본값 참고). Mac에서는 `BROWSER_EXECUTABLE`과 `PLAYWRIGHT_MODULE_PATH`를 반드시 지정한다(기본값이 Windows 경로다).

### 설치·배포 명령(설명만, 요청 없이 실행 금지)

- 의존성 설치: 필요 없음.
- 배포: `npm run check` → `npm test` → `npm run build` → `wrangler pages deploy dist --project-name leafy-garden --branch main`. GitHub push로 자동 배포되지 않는다. 자세한 절차·확인 항목은 `docs/DEPLOYMENT.md`. 배포·커밋·푸시는 사용자가 요청할 때만 한다.

## D. 두 OS를 오갈 때의 규칙

### 유지·공유하는 것

소스, 원본 에셋, 설정(`package.json`, `wrangler.jsonc`, `manifest.webmanifest`), 문서, 테스트는 SSD에 그대로 두고 두 OS에서 공유한다. lockfile은 없으므로 새로 만들지 않는다.

### 재생성 가능한 폴더(문제가 있으면 다시 만들어도 됨)

| 폴더 | 다시 만드는 방법 | 주의 |
|---|---|---|
| `dist/` | `npm run build` | build는 `dist/`에 이번 빌드 목록에 없는 파일이 있으면 지우지 않고 중단한다. 내용을 확인한 뒤 옮긴다 |
| `.npm-cache/` | 자동 생성 | 다른 OS의 캐시를 신뢰하지 않는다 |
| `.tmp/`, `.wrangler/` | 도구가 자동 생성 | `.wrangler/`는 wrangler 로컬 상태 |
| `node_modules/` | 현재 없음(의존성 0개) | 생겨도 다른 OS에서 만든 것은 재사용하지 않는다 |
| `graphify-out/` | `graphify update .` | |

다른 OS에서 만든 `node_modules`, Python 가상환경(`.venv`), 플랫폼별 바이너리(sharp·esbuild의 네이티브 모듈 등)는 재사용하지 않는다. 이 프로젝트는 그런 도구를 저장소 밖(`DevCaches/tools/` 등)에서 env로 지정해 쓰므로, 각 OS에 맞는 설치본을 따로 둔다.

### 절대 삭제하면 안 되는 폴더·파일

Git에서 제외되어 있어 **SSD가 유일한 사본일 수 있는** 것들이다. 설치·빌드 오류가 나도 지우지 않는다.

- `_source/` — 제공받은 원본 영상(`videos/`), 편집용 PNG(`generated-images/`), 제목·캐릭터 원본(`branding/`), Meshy 원본 GLB와 입력 그림
- `_reference/` — 참고 교재(`files/`)·샘플 화면(`samplepages/`)
- `assets/**/*.png`(아이콘·OG 제외) — 생성 PNG 원본
- `_unused/` — 쓰지 않지만 보관하는 그림·옛 납품 zip·배포 잔여물(README: 지우지 않고 보관)
- `docs/implementation-backup-*/`, `docs/reviews/**/*.png`(검증 캡처), `docs/sources/*.hwp`(교육과정 원본)
- `output/` — 로컬 생성 미리보기·캡처
- `.claude/` — 로컬 에이전트 설정(`launch.json`)
- Git 추적 파일 전체, 특히 `src/`, `assets/`, `tests/`, `docs/`

### 하드코딩된 절대경로(주의)

아래 기본값은 다른 Windows 계정(`C:/Users/bongb/...`) 기준이라 현재 Windows(`C:\Users\user`)와 Mac 어느 쪽에서도 존재하지 않는다. 쓸 때마다 env로 경로를 지정한다. 애플리케이션 코드(`src/`)에는 절대경로가 없다.

| 파일 | env | 기본값이 없을 때 동작 |
|---|---|---|
| `scripts/build.mjs`(72행) | `ESBUILD_MODULE_PATH` | 경고만 내고 번들 없이 빌드 → **OS·PC마다 `dist/` 결과(파일 수·요청 수)가 달라질 수 있다**. 배포 전 출력에 `esbuild not found`가 있는지 확인한다 |
| `scripts/optimize-assets.mjs`(9행), `scripts/check-new-alpha.mjs`(4행) | `SHARP_MODULE_PATH` | 오류로 중단(패키지를 설치하지 않음) |
| `tests/*.browser.mjs` | `PLAYWRIGHT_MODULE_PATH` | 모듈을 못 찾아 중단. `pacing-runtime.browser.mjs`는 기본값이 없어 env 필수 |
| `tests/*.browser.mjs` | `BROWSER_EXECUTABLE` | 기본값 `C:/Program Files/Google/Chrome/Application/chrome.exe` → Mac에서는 반드시 지정 |
| `.claude/launch.json`(Git 제외) | — | `green-garden-codex-node`, `green-garden-dist-ssd-node`, `green-garden-test` 구성은 Mac 전용 `/Users/yel/.local/node/bin/node`를 쓴다. Windows에서는 `green-garden`, `green-garden-qa`, `green-garden-fixture`, `green-garden-dist`(PATH의 `node`)를 쓴다 |

새 코드에 드라이브 문자(`D:`, `F:`), `/Volumes/...`, 사용자 홈 경로를 넣지 않는다. 경로는 `import.meta.url` 기준 상대 경로나 env로 받는다.

### 파일명·import 대소문자, 공백·한글 경로

- Mac(APFS 기본)과 Windows는 대소문자를 구분하지 않지만 배포 서버(Cloudflare)는 URL 대소문자를 구분한다. import 경로와 `/assets/...` 참조는 실제 파일명과 대소문자까지 일치시킨다. 2026-10-30에 `src/`·`tests/`·`scripts/`의 상대 import 162개를 확인했을 때 실제 import의 대소문자 불일치는 없었다.
- 로컬 Git 설정은 `core.ignorecase=true`라서 대소문자만 바꾼 파일명 변경을 Git이 놓칠 수 있다. 이름의 대소문자만 바꿀 때는 `git mv`를 쓴다.
- 프로젝트 경로에 공백이 있다. 스크립트에서 경로는 항상 따옴표로 감싸고 `path`/`URL` API로 다룬다. 문서 파일명에 한글이 있다(`docs/제작기.md` 등).

### Windows 전용 의존성

- npm 스크립트에는 `.bat`·`.cmd`·`.ps1`·PowerShell 의존이 없다(2026-10-30 확인).
- README·DEPLOYMENT.md의 PowerShell 예시(`$env:PORT=...`)는 Mac에서 위 C절의 Mac 형식으로 바꿔 쓴다.
- 브라우저 테스트의 Chrome 기본 경로만 Windows 전용이다(위 표).

### exFAT·Git

- SSD는 exFAT이다. 심볼릭 링크를 만들지 않는다(`core.symlinks=false`, build는 심볼릭 링크를 만나면 중단한다). 파일 권한(`chmod`)은 의미가 없다(`core.filemode=false`).
- exFAT는 소유자를 기록하지 않아 Git이 `dubious ownership` 오류를 낸다. 전역 설정을 바꾸지 말고 명령마다 지정한다: `git -c "safe.directory=F:/iscreammedia_sc34/3 leave" status`(Mac에서는 그 OS의 실제 경로). `scripts/build.mjs`도 같은 방식이다.
- Mac은 exFAT에 `._*` 파일을 만든다. 배포 전 `dist/`에서 제거한다(`docs/DEPLOYMENT.md`). `.git/` 안에 생긴 `._*`는 Windows에서 Git 명령마다 "non-monotonic index" 오류를 내므로 지운다(2026-10-31에 6개 삭제). 원본 폴더에서는 내용을 확인하지 않고 일괄 삭제하지 않는다.

### 줄바꿈

- 2026-10-31에 루트에 `.gitattributes`(`* text=auto eol=lf` + 바이너리 확장자)를 추가했다. `.editorconfig`는 없다. 이 Windows의 전역 Git 설정은 `core.autocrlf=true`이고 Mac 설정은 확인하지 않았다. 그래서 OS를 바꾸면 내용이 같아도 줄바꿈 차이로 파일이 수정됨으로 보일 수 있다(`docs/DEPLOYMENT.md`에 `build-info.json`의 `dirty=true`가 CRLF/LF 차이 때문이라는 기록이 있다).
- 전체 파일 줄바꿈 변환, 전역 Git 설정 변경을 임의로 하지 않는다.
- 제안(사용자 승인 후에만 적용): 루트에 `* text=auto eol=lf`와 바이너리 확장자(`*.webp *.png *.glb *.mp3 *.mp4 *.woff2 *.zip binary`)를 지정한 `.gitattributes`를 추가하고, 적용 시 `git add --renormalize .` 결과를 별도 커밋으로 검토한다.

## E. 환경변수·저장 데이터

- 앱 실행에 필요한 비밀값은 없다. `.env`를 쓰지 않으며 `.gitignore`가 `.env`, `.env.*`를 제외한다. `.env`·API 키·인증서·wrangler 로그인 정보를 출력하거나 커밋하지 않는다. 기존 `.env`가 생기더라도 덮어쓰지 않는다.
- 사용하는 환경변수 이름(값은 각 PC의 경로):
  - 서버: `PORT`
  - 빌드·에셋: `ESBUILD_MODULE_PATH`, `SHARP_MODULE_PATH`
  - 브라우저 테스트: `PLAYWRIGHT_MODULE_PATH`, `BROWSER_EXECUTABLE`, `JOURNEY_URL`, `JOURNEY_OUTPUT`, `EXPEDITION_URL`, `EXPEDITION_OUTPUT`, `STAGE_MAP_URL`, `LAYOUT_SIZES`, `LAYOUT_SCENARIOS`, `LAYOUT_REPORT`
  - 배포(Mac): `HOME`을 `DevCaches/tools/wrangler-home`으로 지정해 wrangler 로그인 정보를 SSD에 둔다
- 학생 데이터: 진행·보상·소리 설정은 각 브라우저의 localStorage에만 저장된다(키 `green-garden-mvp-v2`, 이전 형식 `green-garden-mvp-v1`, `green-garden-music`, `green-garden-music-volume`, `green-garden-sound` 등). 서버·계정·동기화는 없다.
  - 저장 형식을 바꿀 때는 이전 기록(v1·v2, 예전 흐름으로 마친 기록)을 보존·변환한다. 오류를 피하려고 저장소를 초기화하거나 완료값을 강제로 채우지 않는다.
  - `tests/final-review.html`은 검증용 기록을 심으므로 학생이 쓰는 주소(origin)에서 열지 않는다. 검증은 별도 포트(4328·4331·4351 등)에서 한다.
  - 운영 주소나 실제 학생 기기의 기록을 테스트용으로 지우지 않는다.

## F. 검증과 작업 종료

### 수정 후 검증

1. `npm run check`
2. `npm test`
3. 배포물에 영향이 있으면 `npm run build`(출력의 `esbuild not found` 여부 확인), 필요하면 `npm run preview`로 `dist/` 확인
4. 화면 문구를 바꿨으면 나눔스퀘어네오 적용 상태와 줄바꿈을 브라우저에서 함께 확인한다.
5. 버전을 올릴 때는 `package.json`의 `version`과 `src/settings-content.js`의 `APP_VERSION`을 함께 바꾼다(테스트·빌드가 일치를 검사한다)
6. 화면·조작 변경은 브라우저 테스트(`tests/*.browser.mjs`)나 직접 조작으로 확인한다. 실행하지 못했으면 그렇다고 기록한다

### 결과 기록 원칙

- 실제로 실행한 검사만 통과로 기록한다. 실행한 OS(Windows/Mac)와 Node 버전을 함께 적는다.
- 한 OS에서 통과한 결과를 다른 OS의 통과로 확대하지 않는다.
- 태블릿 웹앱이므로 **화면 크기 검사**(브라우저 창·에뮬레이션: 1280×800, 1024×768, 1280×720 등)와 **실물 태블릿 손가락 터치 검증**(iPad Safari·Android Chrome)을 구분해 기록한다. 터치 에뮬레이션·마우스·스크립트 포인터 결과는 실제 터치 통과가 아니다.
- 소프트웨어 WebGL 결과는 실제 태블릿 GPU 성능 통과가 아니다. 3D가 없을 때 2D 대체 경로도 확인한다.

### SSD 분리 전 확인

- 실행 중인 개발 서버(`npm start`/`preview`, 포트 4318·4323·4328·4331·4351·4352 등), 빌드, 파일 감시, 브라우저 테스트, `wrangler` 배포, 에이전트 작업이 남아 있지 않은지 확인하고 종료한다.
- 편집기·터미널이 SSD 안 경로를 열고 있지 않은지 확인한다.
- `git -c "safe.directory=<경로>" status`로 미커밋 변경을 확인하고 필요하면 기록해 둔다(커밋·푸시는 사용자 판단).
- OS의 안전 제거(Windows: 하드웨어 안전 제거, Mac: Finder 꺼내기)를 거친 뒤 분리한다.

### 다음 컴퓨터에서 이어갈 때 최소 작업

1. 프로젝트 루트와 OS·셸·CPU 아키텍처를 확인한다(Mac은 arm64).
2. `node -v`로 Node가 있는지 확인한다(Mac은 SSD의 `DevCaches/tools/node-...` 경로를 PATH에 넣거나 직접 호출).
3. `git -c "safe.directory=<이 OS의 프로젝트 경로>" status`로 브랜치와 변경을 확인한다. 줄바꿈만 바뀐 파일이 보이면 내용 변경과 구분한다.
4. 의존성 설치는 필요 없다. `npm run check`와 `npm test`로 이 OS에서 동작을 확인한다.
5. 빌드·에셋·브라우저 테스트가 필요하면 이 OS에 맞는 `ESBUILD_MODULE_PATH`·`SHARP_MODULE_PATH`·`PLAYWRIGHT_MODULE_PATH`·`BROWSER_EXECUTABLE`을 지정한다.
6. 작업 종료 시 변경 파일, 실제 실행한 검사(OS 포함), 남은 문제, 다음 컴퓨터에서 필요한 작업을 짧게 남긴다.
