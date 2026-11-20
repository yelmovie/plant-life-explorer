# 권리 장부 — 초록정원 연구기지 (2026-11-21)

운영 빌드(`dist/`)에 들어가는 그림·3D 모형·영상·음악·효과음·목소리·글꼴·라이브러리를 종류별로 묶어 출처와 이용 조건 근거를 적었다. 기준: `_shared/SCORE-110-STAGE31-20261121.md` 2절 ④.

## 조사 범위와 방법

- 대상 빌드: 지금 저장소에 있는 `dist/` (`dist/build-info.json`: version 0.5.4, commit `0d29917`, dirty, builtAt 2026-11-20T21:31Z). `dist/assets/` 안 파일을 폴더·확장자별로 셌다(`._*` 제외).
- 근거는 저장소 기록(`assets/CREDITS.md`, `assets/models/README.md`, `docs/` 프롬프트·출처 JSON, `_source/` 원본·프롬프트 파일, git 기록)과 `_shared/`의 출처 문서(`voice-provenance-20261118.md`, `sfx-library-20261117/CREDITS.md`, `reward-cards/INTEGRATION.md`)에서만 찾았다. 저장소·`_shared`에 기록이 없고 `_scratch/`에만 기록이 있는 줄은 그렇다고 적었다.
- 외부 서비스 약관 원문, 로그인 계정, 결제 내역은 열어 보지 않았다. 추측으로 채우지 않았다.
- 빌드에는 들어가지만 자료가 아닌 파일(`index.html`, `sw.js`, `manifest.webmanifest`, `build-info.json`, `src/*.js·css`, `assets/CREDITS.md`, 라이선스 원문 txt 3개)은 표에서 뺐다. 납품용 `thumbnails/`는 `dist/`에 없으므로 범위 밖이다.

### 상태 기준

| 상태 | 뜻 |
|---|---|
| 확인됨 | 이용 조건 원문이 빌드에 함께 들어 있거나(MIT·OFL 등), 출처 페이지의 라이선스(CC0)가 기록·재확인됐거나, 생성 당시 요금제가 계정 조회로 확인됐다 |
| 근거 약함 | 만든 도구·날짜·프롬프트 같은 제작 기록은 있다. 그러나 상업·회사 배포 조건이 사용자 말로만 확인됐거나, 생성 계정의 요금제·제공 범위 서류가 저장소에 없다 |
| 출처 미확인 | 무슨 도구로 누가 만들었는지 저장소·`_shared` 기록에서 찾지 못했다 |

## 1. 그림 (WebP·PNG)

`dist/assets/generated/` 90장, `combat/` 8장, `reward-cards/` 10장, `npc-dialogue/` 1장, `title-logo.webp`, `og/` 1장, `icons/` 2장, `videos/` 포스터 2장.

| ID | 파일(묶음) | 만든 곳 | 만든 날·기록 위치 | 이용 조건 | 근거 파일 경로 | 상태 |
|---|---|---|---|---|---|---|
| I1 | 기본 2D 그림 15장: `generated/water_hyacinth_whole`, `hyacinth_petiole_whole`, `hyacinth_petiole_cutaway`, `aloe_leaf_cutaway`, `aloe_plant`, `cherry_leaf`, `ginkgo_leaf`, `grass_leaf`, `cherry_tree`, `lotus_leaf_whole`, `lotus_surface_diagram`, `plant_lab_background`, `garden_hero`, `research_bag_body`, `research_bag_closed` (.webp) | OpenAI 내장 image_gen | 2026-10-14. 프롬프트 `docs/ASSET-PROMPTS-20261014.json`, 목록 `docs/ASSET-LIST-20261014.md`, PNG 원본 `_source/generated-images/` | 생성 계정의 서비스 조건·회사 이용 권한은 CREDITS에서 "배포 전 문서 확인 대상"으로 남아 있음 | `assets/CREDITS.md`(도구·라이선스 검토, 배포 전 문서 확인 목록), `docs/ASSET-LIST-20261014.md` | 근거 약함 |
| I2 | 10-15 추가 그림 12장: `mascot_leaf`, `mascot_water`, `mascot_flower`, `notebook_dry`, `notebook_wet`, `bag_lotus_open`, `bag_lotus_closed`, `reward_garden`, `reward_observatory`, `reward_seasons`, `reward_water`, `reward_workshop` | OpenAI 내장 image_gen(Codex). 캐릭터 3종은 기획자 제공 캐릭터 시트(`_source/branding/characters.png`)를 참고해 편집 생성 | 2026-10-15. 줄별 프롬프트·생성 경로 `docs/new-assets-20261015.json` | I1과 같음. 캐릭터는 기획자 제공 시트의 제공 범위도 걸림(I7과 같은 확인 대상) | `docs/new-assets-20261015.json`, `assets/CREDITS.md` | 근거 약함 |
| I3 | 보상 썸네일 5장 `generated/reward_*_thumb.webp` | I2의 보상 그림을 폭 240px로 줄임 | 2026-10-19. `assets/CREDITS.md` 10-19 절 | I2를 따름 | `assets/CREDITS.md` | 근거 약함 |
| I4 | `generated/greenhouse_studio_v1.webp` | OpenAI image_gen | 2026-10-18. `docs/new-assets-20261018.json`(프롬프트) | I1과 같음 | `docs/new-assets-20261018.json`, `assets/CREDITS.md` | 근거 약함 |
| I5 | `generated/map_trail_v2.webp`, `workshop_studio_v2.webp` | OpenAI image_gen | 2026-10-18. `docs/map_trail_v2-prompt.txt`, `docs/workshop_studio_v2-prompt.txt` | I1과 같음 | `assets/CREDITS.md`(10-18 탐구·입체 조작 개편) | 근거 약함 |
| I6 | `generated/cherry_seasons_v2.webp`, `sowthistle_seasons_v2.webp` | OpenAI image_gen(I5와 같은 작업) | 2026-10-18. 별도 프롬프트 파일은 없음, CREDITS 문장만 | I1과 같음 | `assets/CREDITS.md` | 근거 약함 |
| I7 | 활동 배경 10장 `generated/bg_m1_1_scan` … `bg_m5_2_test` | 기획자(옐샘)가 설계 대화에서 생성형 AI로 만들어 제공. 1600px WebP로 변환 | 2026-10-19 반영. 원본 `_source/original-images/chatgpt_gallery_031~040.png`, 편집본 `_source/generated-images/bg_m*.png` | 원본 권리와 회사 배포 허용 범위는 "제공자 확인 대상" | `assets/CREDITS.md`(10-19 활동 배경·표정·도장) | 근거 약함 |
| I8 | 표정 12장 `generated/mood_{leaf,water,flower}_{idle,happy,think,surprise}` | 기획자 제공 투명 표정 시트에서 잘라 냄 | 2026-10-19. 원본 `_source/original-images/chatgpt_gallery_043.png`, `_source/generated-images/mood_sheet.png` | I7과 같음 | `assets/CREDITS.md` | 근거 약함 |
| I9 | 도장 3장 `generated/stamp_direct`, `stamp_fixed`, `stamp_complete` | Higgsfield GPT Image 2.5 | 2026-10-19. `docs/icon-prompts.md`, PNG `_source/generated-images/stamp_*.png` | Higgsfield 계정의 요금제·회사 배포 조건은 "배포 전 문서 확인 대상" | `assets/CREDITS.md`, `docs/icon-prompts.md` | 근거 약함 |
| I10 | 탐험 장면 4장 `generated/expedition_hero_20261020`, `expedition_hyacinth_tank_20261020`, `expedition_petiole_model_20261020`, `expedition_restored_garden_20261020` | Higgsfield GPT Image 2.5 high/2k(수조·정원은 기존 그림 참조 업로드) | 2026-10-20. job ID·프롬프트·결과 URL·해시 `docs/ASSET-PROVENANCE-20261020.json` | I9와 같음 | `docs/ASSET-PROVENANCE-20261020.json`, `assets/CREDITS.md` | 근거 약함 |
| I11 | 도구 그림 5장 `generated/expedition_tool_{lens,camera,water,fabric,bag}` | Higgsfield 도구 아틀라스(`_source/generated-images/expedition_tools_atlas_20261020.png`)에서 분리 | 2026-10-20. `docs/ASSET-PROVENANCE-20261020.json` | I9와 같음 | 같은 파일 | 근거 약함 |
| I12 | 표본 잎 3장 `generated/field_leaf_{maple,pine,camellia}` | Higgsfield 잎 아틀라스에서 분리 | 2026-10-20. `docs/ASSET-PROVENANCE-20261020.json` | I9와 같음 | 같은 파일 | 근거 약함 |
| I13 | `generated/expedition_petiole_clear_20261023.webp` | OpenAI 내장 image_gen으로 I10의 잎자루 그림 배경만 투명 편집 | 2026-10-23. 크기·해시 `assets/CREDITS.md` 10-23 절(요약은 원문 프롬프트가 아님) | I1·I9 둘 다 걸림 | `assets/CREDITS.md` | 근거 약함 |
| I14 | CSS·SVG 대체 9장 `generated/cactus_plant`, `float_model_air`, `float_model_solid`, `habitat_water`, `habitat_grass`, `habitat_dry`, `cloth_swatch`, `cherry_bud_spring`, `sowthistle_bud_spring` | Higgsfield GPT Image 2.5(high, 2k), 커넥터 크레딧 24.75 | 2026-10-25. job 앞 8자·해시 표 `assets/CREDITS.md`, 원본 `_source/generated-images/originals-20261025/` | I9와 같음 | `assets/CREDITS.md`(10-25 절) | 근거 약함 |
| I15 | 계절 질감 4장 `generated/season_cherry_blossom`, `season_cherry_leaf_autumn`, `season_cherry_winter_bud`, `season_sowthistle_crown_bud` | Higgsfield GPT Image 2.5(앞 3장). crown_bud는 Meshy 입력 그림 `M2-sowthistle-root.png`(Higgsfield)을 잘라 만듦 | 2026-10-25. 프롬프트 `docs/meshy-season-20261025/image-prompts.txt` | I9와 같음 | `assets/CREDITS.md`(10-25 계절 타임랩 절) | 근거 약함 |
| I16 | `generated/guide_hand_leaf.webp` | OpenAI 내장 image_gen | 2026-10-31. 원문 프롬프트 `_source/generated-images/guide_hand_leaf_20261031.prompt.txt`, 커밋 `03da7ad`·`5efdd28` | I1과 같음. CREDITS에는 이 그림 줄이 없음 | `_source/generated-images/guide_hand_leaf_20261031.prompt.txt` | 근거 약함 |
| I17 | `generated/rain_cloud_clay.webp` | 기록 없음. 편집용 PNG `_source/generated-images/rain_cloud_clay.png`만 있음 | 2026-10-31 커밋 `03da7ad`. `docs/DEPLOYMENT.md` 93행에 "구름 그림 `rain_cloud_clay`" 한마디뿐 | 알 수 없음 | `docs/DEPLOYMENT.md` | **출처 미확인** |
| I18 | 지도 전투 그림 8장 `combat/map-{hero,ally}-reaction(-v2)`, `map-villain-{left,right}(-v2)` | 저장소·`_shared` 기록 없음. `_scratch/map-encounters-02-05-20261114/README.md`에 "기존 생성 악당 시안과 원본 지도 캐릭터를 바탕으로 만든 WebP 아틀라스"라는 말만 있고 도구 이름은 없음 | 2026-11-12~14 커밋 `cda96a8`, `d3b5165`, `0377505`(본문 없음) | 알 수 없음 | git 기록, `docs/MAP-COMBAT-20261109.md`(옛 `leafy-taggle.webp` 시트 기록, 지금 파일과 다름) | **출처 미확인** |
| I19 | 리피 대화 초상 `npc-dialogue/lipi.webp` | Codex 내장 이미지 도구(GPT 이미지). 내장 원본 경로가 `~/.codex/generated_images/…` | 2026-11-13 커밋 `dd99764`. 기록은 `_scratch/npc-03-04-20261113/image-origin-cleanup.json`·`HANDOFF.md`에만 있고 저장소 CREDITS에는 없음 | ChatGPT 계정 조건 미확인 | `_scratch/npc-03-04-20261113/image-origin-cleanup.json` | 근거 약함 |
| I20 | 성취 카드 10장 `reward-cards/card-1~5-*.webp`(640×960), `thumb-1~5-*.webp`(96×144) | GPT 이미지(Codex 내장 이미지 도구, `gpt-imagegen` 스킬) | 2026-11-18 커밋 `665141b`. 설정·생성 PNG는 `_scratch/reward-cards-20261118/specs/03.json`, `gen/03/` | ChatGPT 계정 조건 미확인 | `assets/CREDITS.md`(11-18 성취 카드), `_shared/reward-cards/INTEGRATION.md` | 근거 약함 |
| I21 | 제목 그림글자 `title-logo.webp` | ChatGPT 구독 계정의 Codex 내장 이미지 도구 | 2026-11-18 커밋 `24dce7f`. 원본 `_source/branding/title-logo-20261118.png` | 구독 요금제 이름·회사 이용 조건 기록 없음 | `assets/CREDITS.md`(11-18 타이틀 그림글자) | 근거 약함 |
| I22 | 공유 미리보기 `og/green-garden-og-20261027.png`(1774×887) | 기록 없음. "선택한 1번 온실 탐험형 이미지"라는 말만 있음 | 2026-10-27 커밋 `55c5fa6`. `docs/DEPLOYMENT.md` 151~161행 | 알 수 없음 | `docs/DEPLOYMENT.md` | **출처 미확인** |
| I23 | 설치 아이콘 2장 `icons/icon-192.png`, `icon-512.png` | I2의 `mascot_leaf`를 줄여 바탕색 위에 배치 | 2026-10-19. `docs/icon-prompts.md` | I2를 따름 | `assets/CREDITS.md`(10-19 설정·오프라인 정리) | 근거 약함 |
| I24 | 영상 포스터 2장 `videos/intro-poster.webp`, `outro-poster.webp` | 제공받은 원본 영상의 첫 장면(README "첫 장면 포스터") | 2026-10-23 커밋 `4c5884f` | V1을 따름 | `README.md` 11행 | **출처 미확인** |

## 2. 3D 모형 (GLB)

| ID | 파일(묶음) | 만든 곳 | 만든 날·기록 위치 | 이용 조건 | 근거 파일 경로 | 상태 |
|---|---|---|---|---|---|---|
| M1 | `models/petiole_whole.glb`, `petiole_cut.glb`, `plant_aloe.glb`, `plant_cherry_full.glb` (4개) | Meshy AI Image-to-3D(입력 그림 Higgsfield GPT Image 2.5) → 블렌더·gltfpack로 다듬음 | 2026-10-19 생성, 10-27 벚나무 연결, 10-28 단면 재제작. 원본 `_source/original-glb/`, 입력 `_source/meshy-input/m3-petiole`, `m4-garden`, 대조표 `assets/models/README.md` | 2026-10-24 사용자가 "상업 이용 가능 조건으로 제작"이라고 말로 확인. 요금제·계약 서류는 저장소에 없음 | `assets/CREDITS.md`(10-24 확인, 10-19 3D), `assets/models/README.md`, `docs/reviews/existing-models-20261027/asset-provenance.json` | 근거 약함 |
| M2 | `models/season_cherry_bare.glb`, `season_sowthistle_root.glb`, `season_sowthistle_rosette.glb`, `season_sowthistle_flowers.glb` (4개) | 사용자가 Meshy Image-to-3D로 생성(입력 그림 Higgsfield) → `scripts/blender-season-glb.py` | 2026-10-25. 원본 `_source/original-glb/season-20261025/`, 입력 `_source/meshy-input/m2-season-20261025/` | CREDITS: "10-25 계절 4종도 같은 조건 제작 전제" — 별도 확인 없음 | `assets/models/README.md`, `assets/CREDITS.md` | 근거 약함 |

## 3. 영상 (MP4)

| ID | 파일(묶음) | 만든 곳 | 만든 날·기록 위치 | 이용 조건 | 근거 파일 경로 | 상태 |
|---|---|---|---|---|---|---|
| V1 | `videos/intro.mp4`, `outro.mp4` | 그림·영상: "제공받은 원본"(`_source/videos/`). 생성 도구 이름은 저장소에 없고, 프롬프트는 외부 ChatGPT 캔버스 링크 2개(README 103~104행)로만 남음. 대사·내레이션: ElevenLabs(목소리 이름·생성 ID 없음). 영상 속 음악 출처 기록 없음. 자막(모션)은 2026-11-18 덧입힘 | 원본 2026-10-23 반영(`4c5884f`), 대사 섞은 판 11-13(`dd99764`), 자막판 11-18(`1603137`, `docs/film-captions-20261118/`) | 음성: ElevenLabs Starter 유료(2026-11-19 사용자 확인). 영상 그림·음악: 알 수 없음 | `README.md` 11·103~106행, `assets/CREDITS.md`(11-19 이야기 영상 음성), `_shared/voice-provenance-20261118.md` 3번 표 | **출처 미확인** |

## 4. 음악 (배경 음악)

| ID | 파일(묶음) | 만든 곳 | 만든 날·기록 위치 | 이용 조건 | 근거 파일 경로 | 상태 |
|---|---|---|---|---|---|---|
| A1 | `audio/main-theme.mp3`, `ending-theme.mp3` | Suno, 기획자 제공(재인코딩 없음) | 2026-10-23. 프롬프트 `docs/SUNO-PROMPTS-20261023.md`, 원본 해시 `docs/reviews/ASSET-ORGANIZATION-20261023.json` | Suno Premier(유료) — 2026-11-18 사용자 확인, 2026-10-24 상업 이용 가능 조건 사용자 확인. 요금제 화면·결제 내역은 저장소에 없음 | `assets/CREDITS.md`(10-24, 10-23 배경 음악), `_shared/voice-provenance-20261118.md`(요금제 표) | 근거 약함 |

## 5. 효과음

앱 조작음(누르기·끌기·첫 완료)은 Web Audio로 코드에서 직접 합성해 파일이 없다. 파일 효과음은 `audio/sfx/` 19개.

| ID | 파일(묶음) | 만든 곳 | 만든 날·기록 위치 | 이용 조건 | 근거 파일 경로 | 상태 |
|---|---|---|---|---|---|---|
| S1 | 지도 전투 8개: `wind-whoosh-02`, `hit-light-03`, `hit-light-02`, `hit-heavy-01`, `leaf-rustle-03`, `leaf-rustle-02`, `hurt-bump-01`, `victory-jingle-04` | Freesound(qubodup, javapimp, AlaskaRobotics, j1987, 12062703, Faulkin, mickleness)·Kenney. 과학34 공통 라이브러리에서 복사(무음 제거·페이드·음량만) | 2026-11-17. 파일별 원작자·URL 표 | CC0 1.0(라이브러리에서 재확인) | `assets/CREDITS.md`(11-17 절), `_shared/sfx-library-20261117/CREDITS.md`·`manifest.json` | 확인됨 |
| S2 | 성취 카드 5개: `wind-whoosh-03`, `reward-01`, `reward-03`, `pickup-01`, `victory-jingle-01` | Freesound(qubodup, ZenithInfinitiveStudios, CogFireStudios, DeltaCode, el_boss), 같은 라이브러리 | 2026-11-18 | CC0 1.0 | `assets/CREDITS.md`(11-18 성취 카드), `_shared/sfx-library-20261117/CREDITS.md` | 확인됨 |
| S3 | 발자국·장소 열림·정답/다시 6개: `step-01`, `step-02`, `open-01`, `twinkle-03`, `correct-01`, `retry-01` | Freesound(sgossner, Yoyodaman234, ZenithInfinitiveStudios)·Kenney Interface Sounds, 같은 라이브러리 | 2026-11-19 | CC0 1.0 | `assets/CREDITS.md`(11-19 절), `_shared/sfx-library-20261117/CREDITS.md` | 확인됨 |

## 6. 목소리

`dist/assets/audio/`의 MP3 96개 = 배경 음악 2 + 목소리 94(아래 16 + 52 + 25 + 1).

| ID | 파일(묶음) | 만든 곳 | 만든 날·기록 위치 | 이용 조건 | 근거 파일 경로 | 상태 |
|---|---|---|---|---|---|---|
| A2 | 리피 대화 16개: `lipi-welcome`, `lipi-{0..4}-goal`, `lipi-{0..4}-hint-{0,1}` | ElevenLabs Voice Library "Aria", eleven_v4 | 2026-11-13. 줄별 원문·생성 ID·해시 `assets/audio/npc-dialogue-provenance.json`(빌드에도 포함) | 11-17까지 생성분 ElevenLabs Starter(유료). 근거는 2026-11-18 계정 조회(당시 starter)와 "만든 시점에 전부 유료였다"는 사용자 확인. 11-13 당시 결제 기록은 없음 | `_shared/voice-provenance-20261118.md`(요금제 표, 3번 표), `assets/audio/npc-dialogue-provenance.json` | 근거 약함 |
| A3 | 리피 팝업·개념·노트·엔딩 52개: `lipi-*-problem`, `-reward`, `-locked`, `-concept`, `-note`, `lipi-ending-diary` 등 | ElevenLabs "Aria", eleven_v4 | 2026-11-18. 줄별 기록 `docs/VOICE-FILL-20261118.json` | ElevenLabs Creator(유료, 상업 이용 가능) — 2026-11-18 계정 조회로 확인 | `docs/VOICE-FILL-20261118.json`, `assets/CREDITS.md`(11-18 캐릭터 음성), `_shared/voice-provenance-20261118.md` | 확인됨 |
| A4 | 지도 악당(표찰 도둑) 25개: `thief-*.mp3` | ElevenLabs "Harry - Character", eleven_v4 | 2026-11-18. `docs/VOICE-FILL-20261118.json` | A3과 같음 | 같은 파일 | 확인됨 |
| A5 | `audio/npc-welcome.mp3` (지금 앱에서 안 씀, 빌드에는 들어감) | 로컬 실행 Qwen3-TTS-12Hz-1.7B-CustomVoice, 기본 음성 Sohee(사람 목소리 복제 없음) | 2026-11-09. 대본·시드·리비전 `docs/audio-provenance.json`, `docs/audio-generation-original.json` | 모델 라이선스 Apache-2.0(리비전 `0c0e3051…`, Hugging Face README 링크 기록). 기록에 모델 라이선스와 출력물 권리 판단을 구분한다고 적혀 있음 | `docs/AUDIO-PROVENANCE-20261109.md` | 확인됨 |

## 7. 글꼴

| ID | 파일(묶음) | 만든 곳 | 만든 날·기록 위치 | 이용 조건 | 근거 파일 경로 | 상태 |
|---|---|---|---|---|---|---|
| F1 | `fonts/NanumSquareNeoTTF-bRg.woff2`, `-cBd.woff2`, `-dEb.woff2` (3개) | 네이버 나눔스퀘어네오 | 라이선스 원문 내려받은 날 2026-11-10 | SIL Open Font License 1.1, 네이버 나눔글꼴 라이선스(글꼴 자체 판매 외 상업 이용 가능). 원문을 빌드에 동봉 | `assets/fonts/NanumSquareNeo-OFL.txt`(빌드 포함), `assets/CREDITS.md` | 확인됨 |

## 8. 라이브러리

| ID | 파일(묶음) | 만든 곳 | 만든 날·기록 위치 | 이용 조건 | 근거 파일 경로 | 상태 |
|---|---|---|---|---|---|---|
| L1 | `src/vendor/three/three.core.min.js`, `three.module.min.js`, `addons/loaders/GLTFLoader.js`, `addons/utils/BufferGeometryUtils.js` (4개) | Three.js r181, Copyright 2010–2025 Three.js Authors | 2026-10-18 내장 | MIT. 원문 동봉 | `assets/three-license.txt`(빌드 포함), `assets/CREDITS.md` | 확인됨 |
| L2 | `src/vendor/three/addons/libs/meshopt_decoder.module.js` | meshoptimizer, Copyright 2016–2024 Arseny Kapoulkine(Three.js r181 배포본) | 2026-10-27 | MIT. 원문 동봉 | `assets/meshopt-license.txt`(빌드 포함), `docs/reviews/existing-models-20261027/asset-provenance.json` | 확인됨 |

## 요약

전체 38줄.

| 상태 | 줄 수 | 해당 ID |
|---|---:|---|
| 확인됨 | 9 | S1, S2, S3, A3, A4, A5, F1, L1, L2 |
| 근거 약함 | 24 | I1~I16, I19, I20, I21, I23, M1, M2, A1, A2 |
| **출처 미확인** | 5 | I17, I18, I22, I24, V1 |

근거 약함 24줄 내역: 그림 20줄(I1~I16의 16줄 + I19, I20, I21, I23), 3D 2줄(M1, M2), 음악 1줄(A1), 목소리 1줄(A2).

- 그림 출처 미확인: I17 `rain_cloud_clay`, I18 지도 전투 8장, I22 OG 이미지, I24 영상 포스터 2장.
- 그림 근거 약함의 공통 이유: 만든 도구·프롬프트 기록은 있으나 OpenAI(ChatGPT·Codex)·Higgsfield 생성 계정의 요금제와 회사 배포 조건, 기획자 제공 자료의 제공 범위 서류가 저장소에 없다.
- 나머지 소리·글꼴·라이브러리는 대부분 확인됐다. 다만 Suno 배경 음악과 11-13 리피 목소리 16개는 사용자 말 확인뿐이다.

## 사용자가 줘야 하는 자료

| # | 자료 | 묶인 줄 |
|---|---|---|
| 1 | OpenAI(ChatGPT) 계정의 요금제 화면과 결제 내역 — 그림을 만든 날(2026-10-14·15·18·23·31, 11-13, 11-18) 기준. 회사 납품에 써도 되는 계정인지(개인·팀·기업) 함께 | I1~I6, I13, I16, I19, I20, I21, I23 |
| 2 | 기획자 제공 AI 그림(활동 배경 10장, 표정 시트, 캐릭터 시트·제목 원본)을 만든 도구 이름·계정 요금제와, 회사 배포·수정 허용 범위를 적은 메일이나 메모 | I2(캐릭터 3종), I7, I8, I23 |
| 3 | Higgsfield 구독·크레딧 구매 내역 화면(2026-10-19~10-25 생성분) | I9~I15, M1·M2의 입력 그림 |
| 4 | Meshy 요금제 화면·결제 내역(2026-10-19, 10-25, 10-28 생성 시점) | M1, M2 |
| 5 | Suno Premier 구독 화면·결제 내역(배경 음악 2곡 생성 시점) | A1 |
| 6 | ElevenLabs 결제 내역(2026-11-13 이전부터 유료였음을 보이는 청구서 또는 구독 기록) | A2, V1(영상 대사) |
| 7 | 인트로·아웃트로 영상: 누가 무슨 도구로 만들었는지, 그 도구의 요금제 화면, 영상 속 음악의 출처. 업체에서 받은 영상이면 계약서나 메일 | V1, I24 |
| 8 | `rain_cloud_clay` 구름 그림을 만든 도구와 날짜(생성 기록이나 대화 링크) | I17 |
| 9 | 지도 전투 그림 8장(주인공·친구 반응, 악당 좌우)을 만든 도구와 기록, 바탕이 된 악당 시안(`_scratch/villain-concepts-20261114/`)의 생성 도구 | I18 |
| 10 | 공유 미리보기 OG 그림("1번 온실 탐험형" 시안)을 만든 도구와 기록 | I22 |
| 11 | 아이스크림미디어 납품 계약서 가운데 AI 생성물·제3자 자료(CC0 효과음, 오픈 라이선스 글꼴·라이브러리) 관련 조항 | 전체 |
