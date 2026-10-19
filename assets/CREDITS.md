# 이미지 및 콘텐츠 출처

## 도구·라이선스 검토 (2026-10-19)

| 항목 | 라이선스 | 판정 |
|---|---|---|
| Three.js r181 (`src/vendor/three/`) | MIT | 사용 가능, 원문 `assets/three-license.txt` 동봉 |
| Jua 글꼴 | SIL Open Font License 1.1 | 사용 가능, 원문 `assets/fonts/Jua-OFL.txt` 동봉 |
| Pretendard 글꼴 | SIL Open Font License 1.1 | 사용 가능, 원문 `assets/fonts/Pretendard-OFL.txt` 동봉 |
| 생성 이미지 (`generated/`, `icons/`) | 프로젝트 자체 AI 생성물 | 화면 고지: 설정 > 이미지·소리·저작권 고지 |
| 효과음 | 앱 코드(Web Audio)로 직접 합성 | 외부 음원 없음 |
| npm 의존성 | 없음 (`package.json`에 dependencies 없음) | 해당 없음 |

- `generated/`: OpenAI 내장 이미지 생성 도구로 제작한 기본 2D 그림 17종(2026-10-14)과 추가 그림 13종(2026-10-15). 추가 그림은 캐릭터 3종, 시설 5종, 지도 1종, 수첩 2종, 코팅 가방 2종이다. PNG 원본과 화면용 WebP를 함께 보관한다.
- `title.png`(제목 로고), `characters.png`(캐릭터 시트): 기획자(옐샘)가 생성형 AI 이미지 생성으로 제작한 자료. 화면용 캐릭터 3종은 이 시트를 참고해 새로 생성했다. 캐릭터 시트 WebP는 화면에서 쓰지 않아 `_unused/`로 옮겼다.
- 생성 그림은 교육용 관찰 모형이다. 단면·표면 확대는 실제 현미경 사진이 아니며 크기와 구조를 이해하기 쉽게 단순화했다.
- 독립 캐릭터 3종은 제공된 캐릭터 시트를 참고하여 편집 생성했다. 배경 투명도와 전신 여백은 실제 알파 픽셀로 확인했다.
- 앱 코드의 도형과 아이콘은 프로젝트 내 SVG/CSS로 구성한다. 글꼴은 `assets/fonts/`에 함께 넣어 외부 글꼴 서버나 추적 서비스를 요청하지 않는다.
- 생성 프롬프트와 3D 교체 위치: `docs/ASSET-PROMPTS-20261014.json`, `src/asset-catalog.js`.

## 2026-10-18 태블릿 탐험판
- greenhouse_studio_v1: OpenAI image_gen으로 새로 생성한 온실 작업대 배경. 생성 프롬프트와 파일 정보는 docs/new-assets-20261018.json. 관찰 표본이나 과학적 증거가 아닌 장면 배경으로 사용.

## 2026-10-18 탐구·입체 조작 개편

- `map_trail_v2`, `workshop_studio_v2`: 앞선 작업에서 OpenAI image_gen으로 생성한 탐험 지도와 발명 공방 배경. 프롬프트는 `docs/map_trail_v2-prompt.txt`, `docs/workshop_studio_v2-prompt.txt`에 보관한다.
- `cherry_seasons_v2`, `sowthistle_seasons_v2`: 같은 작업에서 생성한 벚나무·씀바귀의 네 계절 관찰 그림. 실제 연속 촬영 사진이 아닌 학습용 그림이다.
- 생성 이미지의 PNG 원본은 로컬 `assets/generated/`에 보관하며 Git에는 실행용 WebP를 포함한다.
- `src/vendor/three/`: Three.js r181, Copyright 2010–2025 Three.js Authors, MIT License. 배포 시 `assets/three-license.txt`의 원문을 함께 제공한다. 원문: https://github.com/mrdoob/three.js/blob/r181/LICENSE
- 입체 잎·잎자루·정원·가방은 앱 코드로 만든 단순화 모형이며 실제 생육·유체·부력 시뮬레이션이 아니다.

## 2026-10-19 설정·오프라인 정리

- 글꼴: **Jua** (Google Fonts, SIL Open Font License 1.1), **Pretendard** (SIL Open Font License 1.1). 원문은 `assets/fonts/Jua-OFL.txt`, `assets/fonts/Pretendard-OFL.txt`.
- `icons/icon-192.png`, `icons/icon-512.png`: 설치형 앱(PWA) 아이콘. 생성 캐릭터 `mascot_leaf`를 축소해 바탕색 위에 배치했다.
- `generated/reward_*_thumb.webp`: 보상 그림 5종을 폭 240px로 줄인 썸네일. 원본과 같은 그림이다.
- 쓰지 않는 그림 `map_island`, `research_bag_flap`, `aloe_leaf_whole`은 저장소 `_unused/`로 옮겨 배포에서 뺐다.

## 2026-10-19 활동 배경·표정·도장

- 활동 배경 10장 `generated/bg_m1_1_scan` … `bg_m5_2_test`: 기획자(옐샘)가 설계 대화에서 생성형 AI로 만든 글자 없는 배경(`image/chatgpt_gallery_031~040.png`)을 1600px WebP로 변환. 원본 PNG는 같은 이름으로 보관(Git 제외).
- 캐릭터 표정 12장 `generated/mood_{leaf|water|flower}_{idle|happy|think|surprise}`: 같은 대화의 투명 표정 시트(`image/chatgpt_gallery_043.png`, 보관본 `generated/mood_sheet.png`)에서 잘라 냄.
- 도장 3장 `generated/stamp_direct`, `stamp_fixed`, `stamp_complete`: Higgsfield(GPT Image 2.5, 투명 배경, 글자 없음)로 생성. 원본 PNG 보관.
