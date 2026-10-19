# 초록정원 연구기지 · 0.5

식물 관찰에서 정원 설계와 발명 개선까지 이어지는 5개 미션·10개 활동 교육용 웹게임. 0.5에서는 길을 따라 탐험하는 지도, 두 기준 분류 실행, 두 식물의 겨울·봄 사진, 예상과 공기 방울 실험, 직접 칠하는 정원, 한 부품 비교 시험을 연결한다. 잎·잎자루·정원·가방은 로컬 Three.js로 만든 입체 학습 모형이며 그림과 버튼 대안도 제공한다. 실제 GLB 에셋이나 생육·유체 시뮬레이션은 포함하지 않는다.

## 실행과 납품

Node.js 환경에서 `npm start` 후 http://127.0.0.1:4318 접속. 별도 패키지 설치는 필요 없다.

```text
npm run check
npm test
npm run build
npm run preview
```

`preview`는 같은 주소에서 dist만 제공한다. start와 동시에 쓸 때 PowerShell에서 `$env:PORT='4323'; npm run preview`로 포트를 바꾼다. 서버는 로컬에서만 열린다.

배포 파일은 `dist/`이며 **폴더 안의 내용을 사이트 루트(/)**에 올린다. `/src`, `/assets` 절대경로를 사용하므로 하위 경로 배포는 경로 조정이 필요하다. 공개 배포와 실제 호스팅 검증은 아직 수행하지 않았다.

## 파일 안내

- `src/app.js`: 화면과 사용자 동작, 저장 연결, 서비스워커 등록.
- `src/settings-content.js`: 설정 화면 문구 전부(앱 버전 `APP_VERSION`, 교사용 확인 코드 `TEACHER_CODE`, 성취기준 `STANDARDS`).
- `src/audio.js`: 효과음과 소리 켜기/끄기(기록과 별도 저장 키).
- `sw.js`, `manifest.webmanifest`, `assets/icons/`: 오프라인 캐시와 설치형 앱(PWA).
- `src/model.js`: 미션 조건·저장 복원·정원·시험 판정.
- `src/asset-catalog.js`: 생성 이미지의 고정 키·설명·표시 함수, 보상 썸네일 목록(`THUMBS`).
- `src/art.js`: SVG 도식과 표본·가방 그림 배치.
- `src/rewards.js`: 완료 기록으로 계산하는 빛씨앗, 복구 시설 지도, 꽃길 선택.
- `src/invention.js`: 그림 부품, 빗물 시험, 실패 원인과 비교 기록.
- `src/inquiry.js`: 장소별 의뢰와 환경·특징·생활 연결 자료, 분류 확인.
- `src/learning.js`: 관찰 증거·계절 사진·환경 연결·보고·새 상황 적용 화면.
- `src/spatial.js`, `src/fieldwork.css`: 입체 관찰·정원·가방과 그림 대안. Three.js r181의 MIT 라이선스는 `assets/three-license.txt`.
- `src/style.css`, `src/visuals.css`, `src/adventure.css`: 기본 디자인, 이미지 중심 지도·보상·발명 화면과 반응형.
- `assets/generated/`: 원본 PNG와 화면용 WebP. `assets/CREDITS.md`: 출처.
- `docs/ASSET-PROMPTS-20261014.json`: 이미지 생성 프롬프트 기록.
- `docs/reviews/FINAL-CHECK-20261014.md`: 통합 검증 및 남은 현장 검수.
- `docs/reviews/viewport-results.json`, `docs/reviews/screenshots/`: 실제 브라우저 검사 결과.

## 이미지 교체

현재 WebP만 바꿀 때는 같은 키·파일명을 유지한다. 원본을 바꾼 경우 `npm run assets:optimize`로 WebP를 다시 만든 뒤 빌드한다. 압축은 기존 bundled sharp를 사용하며, 다른 PC에서는 설치된 sharp 경로를 `SHARP_MODULE_PATH`에 지정한다. 실행·테스트·빌드에는 sharp가 필요 없다.

입체 모형은 활동에 들어갈 때 지연 로딩한다. WebGL을 사용할 수 없으면 기존 그림·격자·버튼으로 탐구할 수 있다. 그림 모드 선택은 활동 중 도구를 바꾸거나 식물을 심어도 유지된다. 학습 기록과 판정은 렌더링 방식과 분리되어 있다.

Git에는 코드·테스트·문서·실행용 WebP를 보관한다. `dist/`는 `npm run build`로 생성한다. 참고 교재(`_reference/files/`), 참고 이미지(`_source/original-images/`, `samplepages/`), 생성 PNG 원본, 기존 ZIP, 공유 대화 수집 원본은 로컬에 남기고 Git에서 제외한다.

## 기록과 사용 안내

진행은 현재 주소·브라우저의 localStorage에 자동 저장된다. 다른 기기와 동기화하지 않으며 브라우저 데이터를 지우면 기록이 사라진다. 계정·개인정보 입력·외부 추적 호출은 없다.

설정 화면은 iscream-settings 순서를 따른다: 효과음 켜기/끄기(기록 초기화 뒤에도 유지)·큰 글자·전체화면 → 이 탐험을 하는 이유 다시 보기·엔딩 다시 보기(완료 뒤) → 앱 정보 · 학생용 가이드 · 교사용 가이드(성취기준, 교사용 도구) · 이미지·소리·저작권 고지(자료 출처) → 기록 초기화(확인 단계)·닫기. 교사용 도구는 확인 코드(`TEACHER_CODE`) 뒤에 있으며 보안 기능이 아니다. 전체 열기는 화면 미리보기이며 완료 기록을 만들지 않는다. 단면과 가방 시험은 원리를 설명하는 학습 모형이다.

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
