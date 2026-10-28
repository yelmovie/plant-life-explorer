# Meshy 교체용 프롬프트 · 가방·정원·부레옥잠

2026-10-27 요청 반영. 실제 GLB 자산으로 교체하기 위한 **형상 9종 + 가방 재질 2종**, 총 11개 프롬프트다. 코드 도형 추가 작업은 중단했으며, 이번 요청에서는 이미지·3D 생성이나 크레딧 사용을 실행하지 않았다.

## 제작 순서

1. **B01 가방 본체 하나부터** 만들어 두께·입구·재질을 확인해.
2. B02 덮개와 B03 앞주머니를 만들어 같은 본체에 맞춰. B02를 작은 크기로 맞추면 주머니 덮개에도 재사용할 수 있어.
3. 가방 본체·덮개·주머니의 모양을 다시 만들지 않고 T01/T02로 질감 버전을 나눠. 열린/닫힌 상태는 받은 덮개 GLB를 표시하거나 숨겨서 구성해.
4. 정원 G01~G04, 부레옥잠 P01/P02를 만들어. 알로에와 벚나무는 아래의 기존 GLB를 먼저 확인하고 재사용해.

가방은 **기본 형상 3개와 재질 2세트**가 기준이야. 겉면·입구·주머니를 바꿀 때도 같은 본체가 유지되어야 공정하게 비교할 수 있어. 앱은 실제 GLB의 배치·회전·부품 표시를 제어하고, 임시 입체 도형으로 대체하지 않는 방향이야.

## 사용하는 방법

- B/G/P 파일은 **형상 생성용**, T 파일은 **기존 모델의 재질 변경용**이야. 각 TXT 내용만 복사하면 돼. 모두 영어 600자 이내로 맞췄어.
- 단독 참고 그림이 있는 P01/P02는 **Image to 3D**로 시작할 수 있어.
- 단독 그림이 없는 가방 부품·지형은 해당 문장으로 **AI 이미지에서 외형을 먼저 확인 → Image to 3D**, 또는 **Text to 3D**로 형상을 먼저 확인해.
- 덮개만 만들 때 전체 가방 사진을 그대로 넣으면 가방 전체가 다시 만들어질 수 있어. B02/B03은 부품 단독 그림이나 텍스트로 시작해.
- 다운로드는 **질감 포함 GLB 원본**으로 받아. 파일 이름·정확한 치수·부품 분리는 생성 결과에서 자동 보장되는 조건이 아니므로, 받은 뒤 정렬·검수해서 맞춰야 해.

| 번호 | 대상 | 복사용 TXT | 원본 저장명 |
|---|---|---|---|
| B01 | 가방 본체 | [B01-bag-body.txt](B01-bag-body.txt) | `bag_body_master.glb` |
| B02 | 가방 덮개 부품 | [B02-bag-flap.txt](B02-bag-flap.txt) | `bag_flap_master.glb` |
| B03 | 가방 앞주머니 부품 | [B03-bag-pocket.txt](B03-bag-pocket.txt) | `bag_pocket_master.glb` |
| G01 | 흙 지형 | [G01-soil-tile.txt](G01-soil-tile.txt) | `terrain_soil.glb` |
| G02 | 풀밭 지형 | [G02-grass-tile.txt](G02-grass-tile.txt) | `terrain_grass.glb` |
| G03 | 건조 지형 | [G03-dry-tile.txt](G03-dry-tile.txt) | `terrain_dry.glb` |
| G04 | 물 지형 | [G04-water-tile.txt](G04-water-tile.txt) | `terrain_water.glb` |
| P01 | 부레옥잠 전체 | [P01-hyacinth-whole.txt](P01-hyacinth-whole.txt) | `plant_hyacinth_whole.glb` |
| P02 | 잎자루 입체 단면 | [P02-petiole-cutaway.txt](P02-petiole-cutaway.txt) | `petiole_cutaway_volume.glb` |
| T01 | 보통 천 재질 | [T01-bag-plain-texture.txt](T01-bag-plain-texture.txt) | `*_plain.glb` |
| T02 | 연잎을 본뜬 겉면 재질 | [T02-bag-lotus-texture.txt](T02-bag-lotus-texture.txt) | `*_lotus.glb` |

## 기존 참고 그림

| 대상 | 파일 | 사용 범위 |
|---|---|---|
| 가방 본체 | [보통 천·열린 입구](../../_source/meshy-input/m5-bag/meshy_m5_bag_plain_open.png) | 깊은 입구, 아이보리 천, 초록 테두리, 갈색 손잡이. 이 그림에는 앞주머니가 없어. |
| 가방 덮개 | [보통 천·덮개](../../_source/meshy-input/m5-bag/meshy_m5_bag_plain_closed.png) | 큰 덮개의 형태·배색 참고. 부품 단독 입력 그림과 구분해. |
| 연잎 겉면 | [열린 입구](../../_source/meshy-input/m5-bag/meshy_m5_bag_lotus_open.png) · [덮개](../../_source/meshy-input/m5-bag/meshy_m5_bag_lotus_closed.png) | 올리브색과 잎맥 재질. 돌출 씨앗·장식 잎·고정 물방울은 넣지 않아. |
| 부레옥잠 전체 | [기존 전체 식물](../../_source/meshy-input/m4-garden/meshy_m4_hyacinth.png) | 둥근 잎 5장, 부푼 잎자루와 아래로 늘어진 뿌리. 배경 덩어리가 모델에 붙지 않았는지 확인해. |
| 잎자루 단면 | [입체감 보강 참고 그림](../meshy-petiole-20261023/petiole-cut-reference.png) | 볼록한 옆면·뒤쪽 두께, 깊이가 있는 불규칙 공기 공간이 핵심이야. |

열린 가방·닫힌 가방·재질이 다른 가방 네 장을 같은 물건의 앞·뒤·옆 사진처럼 한꺼번에 넣지 않아. 비교 조건이 다른 참고 그림들이야.

## 이미 있는 실제 모델

| 대상 | 확인한 파일 | 처리 |
|---|---|---|
| 가방 | 현재 프로젝트에는 가방 GLB를 찾지 못했어. 기존 PNG 네 종류는 있어. | B01~B03 새 제작 |
| 알로에 | `assets/models/plant_aloe.glb` | 정원에서 기존 GLB 사용 확인 완료 |
| 정원 벚나무 | 원본 `_source/original-glb/Meshy_AI_cherry_tree_sapling_1019114653_image-to-3d-texture.glb` → 웹용 `assets/models/plant_cherry_full.glb` | 약 256 MB → 4.13 MB로 줄여 정원 연결 완료. 새 생성 불필요 |
| 계절 벚나무 줄기·뿌리 | `assets/models/season_cherry_bare.glb` | 기존 GLB 보존 |
| 자르기 전 잎자루 | `assets/models/petiole_whole.glb` | 실험 화면 연결 완료 |
| 기존 잎자루 단면 | `assets/models/petiole_cut.glb` | 기존 GLB를 연결해 사용 중. 측면 두께 개선이 필요할 때 P02로 재제작 |
| 부레옥잠 전체 | 현재 로컬 GLB 중 잎·잎자루·뿌리가 모두 있는 전체 식물은 찾지 못했어. | 잎자루 단독 모델과 구분해 P01 제작 |

## 생성 후 맞출 기준

- 가방 본체의 상대 치수는 폭 1, 높이 약 0.75, 깊이 약 0.38. 덮개와 주머니는 이 본체에 맞춰. 재질을 바꿀 때 본체의 실루엣·입구·부품 위치는 그대로여야 해.
- 지형 네 종류는 가로·세로 1×1. 흙 표면 높이는 공통 y=0, 밑면은 약 -0.16으로 맞춰. 풀만 표면 위로 짧게 올라오게 해. 이웃 타일 사이에 큰 테두리나 돌출물이 끼면 안 돼.
- 부레옥잠은 둥근 잎, 부푼 잎자루, 뿌리가 모두 있어야 해. 옆으로 돌려도 종이처럼 납작해지면 안 돼.
- 단면은 90도 돌려도 두께가 남아야 해. 검은 점 무늬·규칙적인 구멍 배열 대신 깊은 불규칙 공기 공간을 만들어.

원본 보관 폴더: [`_source/original-glb/meshy-replacement-20261027/`](../../_source/original-glb/meshy-replacement-20261027/). 받은 원본은 덮어쓰지 않고, 검수·정렬·경량화한 사본을 앱에 연결해.

물 GLB에는 얕은 수면 형상과 질감을 만들어. 투명도·반사·물결 움직임은 가져온 모델의 재질과 재생 설정으로 조정해야 해. Meshy 파일 하나가 움직임까지 자동 완성한다는 뜻은 아니야.

## 바로 복사하는 전체 프롬프트

### B01 · 가방 본체

```text
One realistic explorer satchel body only. Rounded rectangular ivory canvas body, forest-green rim and seams, brown leather carry handle, deep side gussets and a fully open top with a visible cream lining and thick inner walls. Width:height:depth about 1:0.75:0.38. Real woven fabric, fine stitching and soft sewn corners. Leave the front panel clear for a separate pocket. No lid, flap, front pocket, water droplets or leaf ornaments. Fully volumetric from all sides, not a flat relief. One isolated complete asset, three-quarter view, no background, floor, labels or people.
```

### B02 · 가방 덮개 부품

```text
One detached explorer satchel flap ONLY. A broad flexible canvas panel with rounded front corners, forest-green stitched edging and a small brown leather pull tab. Closed-pose shape: a gently curved top panel bending down into a short front overhang. Width 1.03, top depth 0.40, front drop 0.18, visible fabric thickness about 0.02 in matching relative units. Ivory woven canvas with natural folds. Actual 3D front, back and edge surfaces. No bag body, handle, pocket, leaves or water. One isolated complete part, three-quarter view, no background, floor or text.
```

### B03 · 가방 앞주머니 부품

```text
One detached external front pocket for a canvas explorer satchel, pocket only. A rounded rectangular ivory fabric pouch, width:height:depth 0.44:0.28:0.08 relative to a bag body of width 1. Forest-green stitched border, slightly bulging front, flat attachment back and a clearly OPEN top with a dark recessed cavity and real inner walls. Soft woven canvas, visible thickness and tidy seams. No lid or flap; a separate smaller flap will cover this opening. No complete bag, handle, loose objects or water. One isolated volumetric part, three-quarter view, no background or text.
```

### G01 · 흙 지형

```text
One realistic square garden-soil terrain tile for a botanical learning game. Exact square footprint, width:length:depth about 1:1:0.16. Rich brown loam with irregular crumbs, small clods, subtle organic fibers, a few tiny pebbles and visible layered soil on the sides. Gently uneven top, low relief and straight matching boundary edges so identical tiles can meet without raised borders. Natural matte soil texture and tactile microdetail, not a smooth brown cube. No plants, roots, grass, tools, labels or pedestal. Entire isolated tile in three-quarter view, no background.
```

### G02 · 풀밭 지형

```text
One realistic square short-grass terrain tile for a botanical learning game. Same 1:1 square footprint and 0.16 soil-base depth as a matching soil tile. Dense small tufts of curved grass blades, varied green tones, fine thatch and glimpses of brown loam. Grass is actual 3D geometry about 0.03-0.07 high, not printed dots or a flat green carpet. Soil cross-section visible on the sides. Straight matching edges, no raised frame or plants crossing the tile boundary. No tree, flowers, large leaves, pot, labels or pedestal. One isolated complete tile, three-quarter view, no background.
```

### G03 · 건조 지형

```text
One realistic square dry-ground terrain tile for a botanical learning game. Same 1:1 footprint and 0.16 base depth as matching soil and grass tiles. Warm sandy ochre compact earth, shallow irregular drying cracks, fine grains, sparse small gravel and subtle earthy color variation. Low uneven relief with real thickness visible on all sides. Straight matching boundary edges so adjacent tiles join cleanly. Dry ground must read clearly beside dark moist loam and green turf. No dunes, cactus, plants, large rocks, borders, labels or pedestal. One isolated tile, three-quarter view, no background.
```

### G04 · 물 지형

```text
One square shallow-water terrain asset for a botanical learning game, footprint 1:1 and depth about 0.12. Clear blue-green water with a readable sandy bed, subtle curved ripples, gentle small wave relief and soft highlights. Visible side depth, not a flat blue painted floor. Straight unobstructed edges that join neighboring water tiles, without raised banks around each tile. Separate water surface and bed if possible. No container, glass walls, plants, fish, giant splashes, foam, labels or pedestal. One isolated complete asset, three-quarter view, no background.
```

### P01 · 부레옥잠 전체

```text
One complete water-hyacinth plant for close 3D observation. A compact rosette of five thick rounded glossy green leaf blades, each held by an obviously swollen pear-shaped petiole, connected at one crown. Real curved leaf surfaces, subtle radiating veins and rounded stalk depth from every side. A hanging brown-purple fibrous root cluster with grouped thicker strands, not a flat root picture or countless loose wires. Match the supplied whole-plant reference. Natural botanical textures, realistic but readable in an elementary science game. No flower, pot, water, soil, labels or background.
```

### P02 · 잎자루 입체 단면

```text
One swollen water-hyacinth petiole with a longitudinal wedge cutaway. Thick upright pear-shaped green stalk with short narrow ends; depth 65-80% of body width, a rounded back and curved intact side. Recessed pale-green spongy tissue with varied interconnected 3D air cavities and deep tissue walls. Enlarged teaching anatomy, not a microscopic replica. Match the cutaway reference. No rows of drilled holes, painted black dots, flat plaque, thin leaf, single hollow balloon, separate leaf blade, roots, water or labels. One isolated textured model, three-quarter view, no background.
```

### T01 · 보통 천 재질

```text
Retexture the existing satchel part without changing its geometry, seams, openings or dimensions. Warm ivory woven canvas on the main fabric, muted forest-green cloth edging and binding, brown leather on existing handles or tabs, pale cream lining. Fine visible textile fibers and stitching, natural matte roughness and subtle fabric normal detail. Preserve the original object's UV layout when suitable. No leaf-vein motif, raised seeds, extra leaves, printed water droplets, dirt patches, logos or text. Keep the same lighting-neutral botanical craft style across body, flap and pocket.
```

### T02 · 연잎을 본뜬 겉면 재질

```text
Retexture the SAME satchel part without changing any geometry, seams, openings or dimensions. Soft olive-green outer fabric with a subtle branching lotus-leaf vein pattern and gentle waxy sheen; fine tactile fabric remains visible. Keep forest-green edging, brown leather handles or tabs and pale cream lining consistent with the plain version. This is a lotus-inspired surface treatment, not a bag shaped like a leaf. Preserve the original UV layout when suitable. No raised seeds, attached leaves, fixed water beads, wet stains, extra objects, logos or text.
```

## 확인한 공식 문서

- [Text to 3D: 형상 확인 후 질감 작업](https://docs.meshy.ai/en/api/text-to-3d)
- [Image to 3D: 이미지를 모델로 변환](https://docs.meshy.ai/en/api/image-to-3d)
- [Retexture: 기존 모델의 질감 변경](https://docs.meshy.ai/en/api/retexture)

