# 03 초록정원 연구기지 · 필요한 그림 목록 (2026-11-21, 3-1단계 ⑤)

그림은 만들지 않았다. 새 그림이 필요한 자리만 적는다. 화풍 참고: 리피 캐릭터(`assets/generated/mood_leaf_*.webp`), 온실 배경(`assets/generated/bg_m*_*.webp`), 도장(`assets/generated/stamp_*.webp`). 기존 점검(`docs/reviews/ASSET-AUDIT-20261020.md`)에서 캐릭터·배경·도장의 시각 언어가 이어진다고 확인했다.

## (가) 권리 장부에서 출처 미확인·근거 약함인 그림

`docs/RIGHTS-LEDGER-20261121.md`의 그림 줄 가운데 **출처 미확인 4줄**(I17·I18·I22·I24)이다. 결정(2026-11-21 "추천대로"): 자료가 있으면 장부에 연결하고, 없으면 3-3단계에서 새로 만들어 바꾼다. 아래는 자료가 끝내 없을 때 새로 만들 장수다.

| 장부 | 쓰이는 화면 | 지금 파일 | 필요한 크기·비율 | 화풍 참고 | 왜 |
|---|---|---|---|---|---|
| I17 | 5장 현장 「비 내리기」 구름(`src/field-hands-bag.css` `.bag-cloud`), 4장 정원 구름(`src/field-hands-garden.css` `.garden-cloud-art`) | `assets/generated/rain_cloud_clay.webp` | 640×400(16:10), 투명 배경 | `assets/generated/bag_lotus_open.webp`(점토 질감 소품) | 만든 도구 기록 없음 |
| I18 | 지도 악당 만남(리피·친구·악당 반응 그림 띠, `src/village-encounters.js`) | `assets/combat/map-hero-reaction-v2.webp`(1024×128), `map-ally-reaction-v2.webp`(512×128), `map-villain-left-v2.webp`·`map-villain-right-v2.webp`(768×128) — 4장 | 같은 크기의 가로 띠(128px 높이 칸 나눔 스프라이트), 투명 배경 | `assets/npc-dialogue/lipi.webp`, `assets/combat/leafy-taggle.webp` | 만든 도구 기록 없음. 같은 폴더의 v2가 아닌 4장(`map-*-reaction.webp`, `map-villain-left/right.webp`)은 코드가 쓰지 않는데 빌드에 들어간다 — 새로 만들 필요 없이 빌드에서 빼면 된다(3-3단계에서 확인) |
| I22 | 카카오톡·SNS 공유 미리보기(`index.html` `og:image`) | `assets/og/green-garden-og-20261027.png` | 1774×887(2:1), 글자 없는 바탕 그림 + 제목은 합성 | `assets/title.webp`, `assets/generated/greenhouse_studio_v1.webp` | 「1번 온실 탐험형 이미지」라는 말만 있고 도구 기록 없음 |
| I24 | 시작·끝 영상이 뜨기 전 첫 장면 | `assets/videos/intro-poster.webp`, `outro-poster.webp` | 1280×720(16:9) | 영상 첫 장면 그대로 | 영상(V1) 자체의 출처가 미확인이라 영상 자료가 확인되면 같이 풀린다. 영상을 바꾸게 되면 새 영상 첫 장면으로 다시 뽑으면 되므로 따로 그릴 필요는 없다 |

새로 그려야 할 수 있는 그림: **6장**(I17 1장, I18 4장, I22 1장). I24 포스터 2장은 영상이 정해지면 영상에서 뽑는다. 근거 약함 그림 20줄은 계정 요금제·제공 범위 자료만 받으면 풀리므로 새 그림 목록에 넣지 않았다.

## (나) 화풍·해상도가 튀거나 임시로 넣은 그림

없음. 근거: 2026-11-20 전체 스윕(세 화면 크기 15화면)과 오늘 2단계 스크린숏(1장 현장·3장 현장·5장 설계·연구 노트·보관함)에서 화풍이 다르거나 흐린 그림을 보지 못했다. 저장소에 「임시」·placeholder로 표시된 그림도 없다(코드·문서 검색 0건).

## (다) 게임성·화면 보강에 필요한 소품·배경

| 할 일 | 쓰이는 화면 | 지금 파일 | 필요한 크기·비율 | 화풍 참고 | 왜 / 필요 여부 |
|---|---|---|---|---|---|
| A17 재도전 목표(현장 임무 뒤 「다시 도전」 목표) | 5개 현장 임무의 마지막 단계 뒤, 장 완료 보상 창 | 도장 `stamp_complete.webp`·`stamp_fixed.webp`·`stamp_direct.webp`, 성취 카드 `assets/reward-cards/` | (선택) 도전 배지 1장, 정사각 512×512, 투명 배경 | `assets/generated/stamp_complete.webp` | **새 그림 없이 가능.** 목표 문구·진행 표시는 글자와 기존 도장 그림으로 만들 수 있다. 「도전 성공」 전용 표식을 따로 두고 싶을 때만 배지 1장(도장과 같은 둥근 새싹 화풍). |
| 5장 탐구 기록 면적 보강(8·9쪽 장면 면적 43% → 55% 이상) | 5장 「나의 탐험 가방 만들기」 설계·시험 쪽 | 배경 `bg_m5_1_idea.webp`·`bg_m5_2_test.webp`, 가방 `research_bag_*.webp`·`bag_lotus_*.webp` | 없음 | — | **새 그림 필요 없음.** 배경은 이미 화면 전체를 덮는다. 면적이 작은 원인은 오른쪽 기록 칸(43%)이 장면 옆에 붙는 배치라, 배치만 바꾸면 된다. 가방 그림은 투명 배경 WebP라 크게 놓아도 쓸 수 있다(확대 시 선명도는 바꾼 뒤 스크린숏으로 확인). |

## 문구 초안

할 일 목록에 학습 문구·피드백 줄(A4·A5·A8·A9·A13·A14·A15·B15)이 없어 `COPY-DRAFT-20261121.md`는 만들지 않았다.
