# 초록정원 연구기지 — MVP TRD

> 다음 개편 기술 계획: [태블릿 탐구 경험 설계](docs/TABLET-EXPERIENCE-DESIGN-20261016.md)의 화면·증거 저장·판정·v1/v2 이관·구현 순서를 따른다. 신규 구조는 아직 구현되지 않았으며, 아래는 기존 MVP 기술 기준이다.

## 1. 구현 선택
설치 의존성이 없는 JavaScript ES modules + HTML/CSS + SVG + Canvas. Node 내장 HTTP 서버는 로컬 확인용이다. 정적 호스팅 가능한 구조. 초기 프로젝트에 앱 코드가 없고, 실제 3D가 제외된 범위라 Phaser/Three.js/React를 추가하지 않는다.

## 2. 파일과 책임
- `src/model.js`: 식물/미션 데이터, 상태 생성·복원, 순수 완료 판정, 저장 버전.
- `src/art.js`: 2D 식물/배경 SVG, 선택 지도 전용 저해상도 Canvas 등각 타일 렌더.
- `src/audio.js`: 사용자 클릭 후 Web Audio로 짧은 조작 효과음 생성, 음소거 시 정지.
- `src/app.js`: 화면 전환, 입력 처리, 대화상자, 상태 저장, 단계별 반응.
- `src/style.css`: 색/타이포/간격 토큰, 컴포넌트, 반응형, 인쇄.
- `assets/title.png`, `assets/characters.png`: 사용자 제공 원본 복사. 캐릭터는 CSS sprite viewport로 표시.
- `server.mjs`: localhost 한정 정적 서버. 경로 이탈/숨김 파일 접근 차단.
- `tests/model.test.mjs`: 완료 조건, 잘못된 입력, 저장 복원, 증거 의존관계 테스트.

## 3. 상태와 저장
키 `green-garden-mvp-v1`. 스키마 버전 1. JSON을 localStorage에 기록한다. 화면 이동과 의미 있는 입력마다 저장하며 실패 시 앱을 유지하고 안내한다. 파싱/유형 검증을 거쳐 알려진 필드만 복원한다. 임의의 저장 문자열을 HTML에 삽입하지 않는다.

상태: screen, completed[10], observation, rule, groups, seasonalRecords, seasonPlant, season, underground, linkedEvidence, experiment, habitats, reasons, terrain[24], garden, gardenReasons, design, tests, finalChecks, finished. 페이지 임시 선택은 필요에 따라 별도 UI 상태에 둔다.

추가 설정: soundEnabled(기본 true), adminUnlocked(기본 false). 기존 저장에서도 기본값을 복원한다. PAGE_ROUTES를 공통 이전 이동 및 관리자 전체 화면 목록의 기준으로 사용한다. 관리자 설정은 접근만 해금하며 pageReady/완료 판정은 변경하지 않는다.

완료 조건은 model의 순수 함수가 결정하고 UI와 테스트에서 공유한다. 미션 증거는 두 장 모두 완료한 경우만 인정한다. 완료 후 재탐구는 기존 검증된 성과를 보존하고 정원 등 산출물을 바꿀 때 현재 결과를 재검증한다. 발명 최종 검증은 최신 설계와 최근 시험이 일치하는지 확인한다.

## 4. 입력과 화면
DOM 버튼을 중심으로 마우스/터치/키보드 접근을 제공한다. 표본은 범위 입력 확대와 회전, 포인터 핀치 보조를 지원한다. 분류/정원은 선택→대상 누르기가 기본이며 HTML drag/drop은 마우스 보조다. 지형은 pointerdown/move/up의 격자 칠하기와 Undo를 지원한다. 실험은 순서형 상태 머신이다.

SVG는 학습 관찰 대상과 단면, 시간 변화, 테스트 현상을 표현한다. 지도 Canvas만 480×280 저해상도에 image-rendering: pixelated를 적용한다. 버튼은 지도 위 DOM 좌표에 배치하고 접근 가능한 미션 이름·상태를 제공한다. 자연·건물·높낮이를 비스듬한 타일 투영으로 표현한다.

## 5. 데이터·과학 경계
표본: 벚나무(톱니, 넓음), 은행나무(톱니 없음, 넓음), 강아지풀(톱니 없음, 좁음). 교과용 단순화 그림임을 관찰 화면에 명시한다. 계절: 벚나무와 씀바귀의 여러 해 사는 모습. MVP 생태 모델은 물가/풀밭/건조 구역 및 해당 대표 식물의 연결을 검사하며 전체 생육 조건을 계산하지 않는다.

가방 모델: 연잎 착안 표면은 물방울/먼지 제거, 덮개는 입구 보호. 단순 규칙에 따른 테스트 결과와 수정 내역을 기록한다. 물리 엔진, 실제 제품의 성능 추정 모델이 아니다.

## 6. 검증 계획
`npm run check`, `npm test`. 브라우저에서 초기 진입→10장→최종 시운전, 잘못된 분류/배치, 저장 후 새로고침, 완료 후 재탐구, 노트·설정·인쇄 UI, 1024×768·1280×800에서 겹침과 잘림 확인. 실제 터치 기기·프린터·전자칠판 검증은 별도이며 수행 여부를 README/검증 보고서에 남긴다.
