# 이미지 및 콘텐츠 출처

- `generated/`: OpenAI 내장 이미지 생성 도구로 제작한 기본 2D 그림 17종(2026-10-14)과 추가 그림 13종(2026-10-15). 추가 그림은 캐릭터 3종, 시설 5종, 지도 1종, 수첩 2종, 코팅 가방 2종이다. PNG 원본과 화면용 WebP를 함께 보관한다.
- `title.png`, `characters.png`: 기존 프로젝트 제공 자료. 제공자의 사용 권한 및 최종 납품 범위 확인이 필요하다.
- 생성 그림은 교육용 관찰 모형이다. 단면·표면 확대는 실제 현미경 사진이 아니며 크기와 구조를 이해하기 쉽게 단순화했다.
- 독립 캐릭터 3종은 제공된 캐릭터 시트를 참고하여 편집 생성했다. 배경 투명도와 전신 여백은 실제 알파 픽셀로 확인했다.
- 앱 코드의 도형과 아이콘은 프로젝트 내 SVG/CSS로 구성한다. 외부 폰트나 추적 서비스를 요청하지 않는다.
- 생성 프롬프트와 3D 교체 위치: `docs/ASSET-PROMPTS-20261014.json`, `src/asset-catalog.js`.

## 2026-10-18 태블릿 탐험판
- greenhouse_studio_v1: OpenAI image_gen으로 새로 생성한 온실 작업대 배경. 생성 프롬프트와 파일 정보는 docs/new-assets-20261018.json. 관찰 표본이나 과학적 증거가 아닌 장면 배경으로 사용.

## 2026-10-18 탐구·입체 조작 개편

- `map_trail_v2`, `workshop_studio_v2`: 앞선 작업에서 OpenAI image_gen으로 생성한 탐험 지도와 발명 공방 배경. 프롬프트는 `docs/map_trail_v2-prompt.txt`, `docs/workshop_studio_v2-prompt.txt`에 보관한다.
- `cherry_seasons_v2`, `sowthistle_seasons_v2`: 같은 작업에서 생성한 벚나무·씀바귀의 네 계절 관찰 그림. 실제 연속 촬영 사진이 아닌 학습용 그림이다.
- 생성 이미지의 PNG 원본은 로컬 `assets/generated/`에 보관하며 Git에는 실행용 WebP를 포함한다.
- `src/vendor/three/`: Three.js r181, Copyright 2010–2025 Three.js Authors, MIT License. 배포 시 `assets/three-license.txt`의 원문을 함께 제공한다. 원문: https://github.com/mrdoob/three.js/blob/r181/LICENSE
- 입체 잎·잎자루·정원·가방은 앱 코드로 만든 단순화 모형이며 실제 생육·유체·부력 시뮬레이션이 아니다.

