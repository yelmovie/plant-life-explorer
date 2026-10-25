# 이미지 및 콘텐츠 출처

## 2026-10-24 확인 사항과 고지 갱신

- 기획자(사용자)는 이 대화에서 **Suno 음원 2곡과 Meshy 3D 모두 상업 이용 가능한 조건으로 제작했다**고 확인했다. 근거는 2026-10-24 사용자 답변이며, 요금제명·결제 내역·회사 계약 세부까지 열람했다는 뜻은 아니다. 아래 2026-10-20의 Meshy 확인 대기는 이 진술로 갱신한다.
- Suno 메인·엔딩 2곡은 프로젝트 자체 AI 생성 음원으로 설정에 고지했다. 음원 원본 파일명·크기·SHA-256은 `docs/reviews/ASSET-ORGANIZATION-20261023.json`, 재생 검증은 `docs/reviews/ASSET-AUDIO-CHECK-20261023.md`에 있다.
- OpenAI·Higgsfield 이미지의 생성 당시 계정·회사 이용 조건은 이번 사용자 답변의 대상이 아니다. 제작 기록과 아래의 별도 확인 목록을 유지한다. 특정 제한이 있다고 추정하거나 확인하지 않은 계정 조건을 확정하지 않는다.
- 화면 저작권 표시는 `ⓒ 2026 옐샘 & 아이스크림미디어`로 정리했다. 자체 화면·그림·음원에 관한 안내와 Three.js·글꼴·교육 참고 자료의 원저작자 이용 조건은 별도 문단으로 구분한다.

## 도구·라이선스 검토 (2026-10-20)

아래는 저장소에 남아 있는 원문과 제작 기록을 대조한 결과다. 생성 도구의 계정·요금제·회사 계약은 이 저장소에 없으므로, AI 생성물의 저작권 소유나 모든 상업 이용 조건을 이 표만으로 확정하지 않는다. 현재 확인된 비상업 제한이나 유료 전용 자료는 없으며, 계정별 이용 조건은 아래의 배포 전 문서 확인 목록으로 남긴다.

| 항목 | 라이선스 | 판정 |
|---|---|---|
| Three.js r181 (`src/vendor/three/`) | MIT | 사용 가능, 원문 `assets/three-license.txt` 동봉 |
| Jua 글꼴 | SIL Open Font License 1.1 | 사용 가능, 원문 `assets/fonts/Jua-OFL.txt` 동봉 |
| Pretendard 글꼴 | SIL Open Font License 1.1 | 사용 가능, 원문 `assets/fonts/Pretendard-OFL.txt` 동봉 |
| 화면 글꼴 `gg-display-*`(Jua 기반)·`gg-text-*`(Pretendard 기반) | SIL OFL 1.1 수정본 | 앱 글자만 남긴 서브셋. 두 글꼴 모두 예약 이름(RFN)이 있어 수정본 이름을 'GG Display'·'GG Text'로 바꿈. 원본 `assets/fonts/source/`, 다시 만들기 `python scripts/subset-fonts.py` |
| GLTFLoader·BufferGeometryUtils (`src/vendor/three/addons/`) | MIT (Three.js r181) | 원문 `assets/three-license.txt` |
| OpenAI 생성 이미지 (`generated/`), 이를 가공한 설치 아이콘 (`icons/`) | 제작 기록이 있는 AI 생성물·가공본 | 화면 AI 고지 있음. 생성 당시 계정의 회사 이용 권한은 배포 전 문서 확인 대상 |
| 기획자 제공 제목·캐릭터·활동 배경·표정 시트 | 기획자 제공 AI 제작 자료 | 제공 사실·제작 기록 보존. 원본 권리와 제공 범위는 제공자 확인 대상 |
| Higgsfield 도장 3종·3D 생성 입력 그림 | Higgsfield GPT Image 2.5 제작 기록 | 제작 도구 기록 있음. 계정별 상업 이용 조건은 배포 전 문서 확인 대상 |
| Meshy GLB 3종 (`models/`) | Meshy AI 생성·Blender 가공 기록 | 생성·입력·가공 기록 보존. 상업 이용 가능한 조건으로 제작했음을 2026-10-24 사용자 확인. 파일 존재와 현재 런타임 연결 여부는 `models/README.md`에서 구분 |
| Suno 배경 음악 2곡 (`audio/`) | 기획자 자체 AI 생성 음원 | 상업 이용 가능한 조건으로 제작했음을 2026-10-24 사용자 확인. 요금제·계약 세부는 저장소에 없음 |
| 효과음 | 앱 코드(Web Audio)로 직접 합성 | 외부 음원 없음 |
| npm 의존성 | 없음 (`package.json`에 dependencies 없음) | 하위 작업 폴더까지 `package.json` 정적 탐색 시 본 앱 1개. 직접 동봉한 Three.js는 위에서 별도 검토 |

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

- 활동 배경 10장 `generated/bg_m1_1_scan` … `bg_m5_2_test`: 기획자(옐샘)가 설계 대화에서 생성형 AI로 만든 글자 없는 배경(`_source/original-images/chatgpt_gallery_031~040.png`)을 1600px WebP로 변환. 원본 PNG는 같은 이름으로 보관(Git 제외).
- 캐릭터 표정 12장 `generated/mood_{leaf|water|flower}_{idle|happy|think|surprise}`: 같은 대화의 투명 표정 시트(`_source/original-images/chatgpt_gallery_043.png`, 보관본 `generated/mood_sheet.png`)에서 잘라 냄.
- 도장 3장 `generated/stamp_direct`, `stamp_fixed`, `stamp_complete`: Higgsfield(GPT Image 2.5, 투명 배경, 글자 없음)로 생성. 원본 PNG 보관.

## 2026-10-19 3D 모형

- `models/petiole_whole.glb`, `petiole_cut.glb`, `plant_aloe.glb`: 기획자(옐샘)가 Meshy AI Image-to-3D로 생성(입력 그림은 Higgsfield GPT Image 2.5 생성), 블렌더로 축소·정리. 대조표는 `models/README.md`.

## 배포 전 문서 확인 목록 (2026-10-20)

| 자료 | 저장소에서 확인한 사실 | 담당자가 보관할 확인 자료 |
|---|---|---|
| OpenAI 내장 생성 도구 결과물 | 2026-10-14~18 프롬프트와 제작 파일, 캐릭터 참조 편집 기록 | 생성 계정에 적용된 서비스 이용 조건·회사 이용 권한 확인 기록 |
| 기획자 제공 AI 제작 자료 | 제목·캐릭터 시트·2026-10-19 활동 배경과 표정 원본의 제공 기록 | 제공자가 확인한 사용·수정·회사 배포 허용 범위 |
| Higgsfield 결과물 | 2026-10-19 도장과 Meshy 입력 그림의 제작 도구 기록 | 생성 당시 요금제와 해당 결과물의 회사 배포 허용 조건 |
| Meshy 결과물 | 2026-10-19 생성 원본 3종, Blender 가공본 3종 | 2026-10-24 상업 이용 가능 조건 제작 사용자 확인으로 갱신. 구체 요금제·계약 서류는 제공자 보관 |

- 이 목록은 권리 미확인을 기록한 것이며, 자료에 특정 비상업 제한이 있다고 추정한 판정은 아니다. 실제 적용 조건과 계약이 확인되면 이 문서를 갱신한다.
- 이번 점검은 저장소 기록과 동봉 라이선스를 확인했다. 외부 서비스 약관의 최신 원문·로그인 계정·구매 내역은 확인하지 않았다.
- 파일별 크기·형식·해시·그림 크기와 정적 참조 근거: `docs/reviews/asset-audit-20261020.json`. 검토 요약: `docs/reviews/ASSET-AUDIT-20261020.md`.

## 2026-10-20 탐험 고도화·영상 참조

- `generated/expedition_leafy_sheet_20261020`: 사용자가 제공한 기존 `mascot_leaf.webp`를 명시 승인 후 Higgsfield에 참조 업로드하여 GPT Image 2.5 high/2k로 생성한 리피 캐릭터 일관성 시트. 정면 몸·의상(머리 없음), 전신 후면, 얼굴 클로즈업의 정확히 3패널이다.
- 원본 PNG와 폭 1920px WebP를 보관한다. WebP는 sharp quality 88로 변환했으며 자르기·색변경·배경제거를 하지 않았다. 영상 제작용 참조 자료로 사용하며 영상 자체는 생성하지 않았다.
- 업로드한 기존 이미지 3개(리피·지도·부레옥잠)의 confirmed media ID, 새 생성 job ID·프롬프트·결과 URL·파일 해시·시각검수는 `docs/ASSET-PROVENANCE-20261020.json`에 기록한다.
- 신규 장면 6종 `expedition_hero_20261020`, `expedition_trail_20261020`, `expedition_hyacinth_tank_20261020`, `expedition_petiole_model_20261020`, `expedition_tools_atlas_20261020`, `expedition_restored_garden_20261020`: Higgsfield GPT Image 2.5 high/2k. 앞선 불확실 응답은 사용자 승인으로 생성 이력 1페이지를 확인해 완료 4개 job을 회수했고 미접수 2개만 추가하여 중복 생성을 피했다. 수조는 기존 부레옥잠, 복구 정원은 기존 리피를 참조했다. 다른 4장은 글로 새로 생성했다.
- `expedition_tool_{lens,camera,water,fabric,bag}.webp`: 도구 아틀라스에서 추출한 투명 그림 5종. 실제 내용은 돋보기·관찰수첩·물병·모종삽과 씨앗주머니·가방이다. `camera`·`fabric`은 런타임용 별칭으로, 해당 물건의 사진기·천 그림을 의미하지 않는다.
- `expedition_field_leaf_atlas_20261020` 및 분리본 `field_leaf_{maple,pine,camellia}.webp`: 단풍나무·소나무·동백나무 잎을 Higgsfield GPT Image 2.5 high/2k로 새로 생성. 세 표본을 실제로 분리해 관찰 활동에 사용한다.
- 과학 그림은 관찰을 돕는 교육용 모형이며 실제 식물 사진·현미경 사진 또는 독립적인 실험 증거가 아니다. 잎자루 단면의 공기 공간은 이해를 돕기 위해 확대·단순화한 표현이다.

## 2026-10-23 배경 음악
- 기획자 제공: `Main_Botanical Adventure.mp3` → `audio/main-theme.mp3`, `Ending_Earned Discovery.mp3` → `audio/ending-theme.mp3`. 제공된 MP3를 재인코딩하지 않고 사용한다. 프롬프트 기록: `docs/SUNO-PROMPTS-20261023.md`.

정리 이후 편집용 PNG는 `_source/generated-images/`, 제목·캐릭터 PNG는 `_source/branding/`에 보관한다. 현재 사용하지 않는 합본 그림은 `_unused/assets/generated/`로 분리했다.

## 2026-10-23 투명 관찰 그림·엔딩 일기 (2026-10-24 보강 기록)

두 결과물은 OpenAI 내장 `image_gen` 도구로 제작했다. 편집 원본은 `_source/generated-images/`에 보존하고 화면용 WebP만 배포한다. 생성 대화의 작업 의도 요약을 아래에 남긴다. **요약은 원문 프롬프트의 완전한 사본이 아니다.**

| 결과물 | 입력·요청 요약 | 쓰임 |
|---|---|---|
| `expedition_petiole_clear_20261023` | 기존 `expedition_petiole_model_20261020`의 왼쪽 온전한 잎·잎자루와 오른쪽 단면을 유지하고 크림색 배경·바닥 그림자만 제거. 참조 식물을 새로 그리거나 배열을 바꾸지 않고 실제 투명 배경으로 편집 | 수조 속 관찰 그림. 실제 단면 사진이나 실측 자료가 아닌 교육용 재현 모형 |
| `ending_diary_20261023` | 아이보리색 말린 종이 쪽지에 초등학생이 쓴 듯한 초록색 한글 탐험 일기. 새싹·별의 작은 장식, 투명 배경. 지정된 다섯 탐구의 짧은 문장을 읽을 수 있게 구성 | 복구된 정원 배경 위 엔딩 쪽지. 실제 학생이 작성한 원문은 아니며 활동을 정리하는 예시 일기 |

엔딩 글: “오늘의 탐험 일기 / 잎을 살피고 식물을 나눴다. / 겨울을 지나 다시 자란 식물도 만났다. / 식물에게 맞는 정원도 꾸몄다. / 연잎의 비밀로 가방까지 만들었다! / 작은 발견이 멋진 발명이 되었다. / 나는 초록정원의 식물 연구원!” 화면 접근성 설명에도 같은 내용을 제공한다.

| 파일 | 크기 | 해상도 | SHA-256 |
|---|---:|---|---|
| `_source/generated-images/expedition_petiole_clear_20261023.png` | 1,152,754 B | 1451×1084 | `8322fb92d938efa0e0586f65eba29ecf622da6befb5bf31b22dd3f68fe5b0274` |
| `generated/expedition_petiole_clear_20261023.webp` | 192,636 B | 1451×1084 | `d267e8e35e0a6b4831d97b0214a0dc5eaea402364ff5d11df3ec9bb3186aceae` |
| `_source/generated-images/ending_diary_20261023.png` | 2,356,718 B | 1254×1254 | `9f9a16cc9926c247791908dad5634c3f4a1184696d43000ade082a270dd3d0a1` |
| `generated/ending_diary_20261023.webp` | 369,556 B | 1254×1254 | `c79197d12a3c25fa5ef61706703a35fc08900a877cd11b275790e48b5afbdd28` |

2026-10-24 직접 확인: 두 PNG·WebP 모두 알파 채널이 있다. 잎자루의 완전 투명/부분 투명 픽셀은 각각 1,068,469/503,577개, 일기는 241,438/1,330,050개로 각 원본과 WebP가 일치한다. 해상도도 유지했다. 알파 존재 검증은 과학적 정확성이나 시각 품질 검증을 대신하지 않는다.

## 2026-10-25 CSS·SVG 대체 그림 9장

납품 전 디자인 고도화에서 CSS·SVG로 그렸던 부분을 같은 화풍의 생성 그림으로 교체했다. 모두 Higgsfield GPT Image 2.5(high, 2k)로 생성했고 글자를 넣지 않았다. 2k 원본 PNG는 `_source/generated-images/originals-20261025/`, 여백을 자르고 줄인 편집용 PNG는 `_source/generated-images/`에 보관하고 `npm run assets:optimize`로 WebP를 만들었다.

- 선인장(마지막 적용 문제의 SVG 대체), 공기 공간 모형·속을 채운 비교 모형(현장 3 SVG 대체, 비교 모형은 공기 모형 결과를 참조해 같은 크기·각도로 생성), 물가·풀밭·건조 구역 지형 3종(서식지 연결판·정원 붓·현장 환경 카드), 보통 천 조각(연잎 비교의 CSS 줄무늬 대체).
- 초봄의 벚나무·씀바귀(현장 2 순서 맞추기의 SVG 새싹 대체): 기존 `cherry_seasons_v2`·`sowthistle_seasons_v2`를 참조 이미지로 올려 같은 구도·화풍의 한 장면으로 생성했다. 학습 정확성 기준: 벚나무는 꽃이 피기 전 부푼 겨울눈과 막 나온 잎끝, 씀바귀는 살아 있던 뿌리에서 돋는 새 잎(꽃줄기 없음).
- 학습 판단에 쓰이는 단서가 그림에 미리 드러나지 않도록 지형 그림에는 해당 식물(부레옥잠·벚나무·선인장)을 넣지 않았다.
- 사용 크레딧: 9장 × 2.75 = 24.75 (힉스필드 커넥터 크레딧). 계정의 회사 배포 조건은 위 "배포 전 문서 확인 목록"의 Higgsfield 항목과 같이 제공자 확인 대상이다.

| 파일 | job 앞 8자 | 화면용 크기 | 알파 | WebP SHA-256 앞 16자 |
|---|---|---|---|---|
| `generated/cactus_plant.webp` | 45519eda | 414×700 | 있음 | `44c1dce92bf3da25` |
| `generated/float_model_air.webp` | 8adecd7a | 392×640 | 있음 | `60fac01b4d18d971` |
| `generated/float_model_solid.webp` | 24a39b0f | 392×640 | 있음 | `2e506bb33f588f7a` |
| `generated/habitat_water.webp` | dfa6dd22 | 360×318 | 있음 | `8009adf37fae159c` |
| `generated/habitat_grass.webp` | d90a0472 | 360×318 | 있음 | `55a30cad66c5f2a3` |
| `generated/habitat_dry.webp` | fcf9f932 | 360×318 | 있음 | `89e17781437cc927` |
| `generated/cloth_swatch.webp` | 8f743d4d | 400×359 | 있음 | `a303560d708f6837` |
| `generated/cherry_bud_spring.webp` | fe12ed8c | 768×510 | 없음(장면) | `f800dc94f7726ba4` |
| `generated/sowthistle_bud_spring.webp` | 4a6e74a3 | 768×510 | 없음(장면) | `0b48260f9bdd2f42` |

## 2026-10-25 계절 타임랩 3D 준비 그림 7장 (아직 앱에 연결 전)

2단계 계절 타임랩 3D의 Meshy 입력 4장과 코드용 질감 3장을 Higgsfield GPT Image 2.5(2k, 투명 배경)로 생성했다. 사용 크레딧은 14(high 4장 × 2.75 + medium 3장 × 1)이다. 원본은 `_source/meshy-input/meshy_m2_*.png`와 `_source/generated-images/season_*.png`에 있다. 프롬프트와 참고 그림은 `docs/meshy-season-20261025/image-prompts.txt`에 있다. 씀바귀 꽃줄기는 생성본 둘레의 흰 번짐을 투명도 정리로 지웠고, 정리 전 원본도 보관했다. GLB는 사용자가 Meshy에서 제작할 예정이며, 앱 연결·WebP 변환은 아직 하지 않았다.

| 원본 | job 앞 8자 | SHA-256 앞 16자 |
|---|---|---|
| `meshy-input/meshy_m2_cherry_bare_roots.png` | a3dc83e7 | `0619d2756a4176a5` |
| `meshy-input/meshy_m2_sowthistle_root.png` | c0ed764b | `33b07d6bea6e131f` |
| `meshy-input/meshy_m2_sowthistle_rosette.png` | b199ef5b | `602e4067040fe565` |
| `meshy-input/meshy_m2_sowthistle_flowers.png`(번짐 정리) | 5843cdde | `212103f4bca40de8` |
| `generated-images/season_cherry_leaf_autumn.png` | f60f99ad | `c0559a48dcc845cd` |
| `generated-images/season_cherry_blossom.png` | 9c31d1bf | `6a344c25e1cd4ae1` |
| `generated-images/season_cherry_winter_bud.png` | 58ccad1a | `646879bf602107a1` |
