# 3D 모형 (GLB)

Meshy Image-to-3D 결과를 블렌더 5.2로 다듬은 파일이다. 원본은 `_source/original-glb/`(Git 제외), 생성 입력 그림은 `_source/meshy-input/`.
다듬기: 메시 합치기 → Decimate(Collapse) → 가장 긴 변 2로 정규화(식물은 바닥 y=0) → 텍스처 1024 JPEG, 금속/거칠기 텍스처 제거.

| 파일 | 쓰는 곳 | 원본 | 삼각형 | 크기 |
|---|---|---|---|---|
| `petiole_whole.glb` | 탐구3 잎자루(자르기 전) | `Meshy_AI_water_hyacinth_petiol_1019113324_image-to-3d-texture.glb` | 74,484 → 11,999 | 20.9MB → 0.60MB |
| `petiole_cut.glb` | 탐구3 잎자루(자른 뒤) | `Meshy_AI_water_hyacinth_cross__1019113449_image-to-3d-texture.glb` | 271,184 → 20,000 | 29.0MB → 0.96MB |
| `plant_aloe.glb` | 탐구4 정원 알로에 | `Meshy_AI_aloe_vera_plant_1019113636_image-to-3d-texture.glb` | 565,278 → 8,000 | 41.9MB → 0.62MB |

아직 코드 도형으로 그리는 것: 정원의 부레옥잠·벚나무, 탐구5 가방 4종 → `plant_hyacinth.glb`, `plant_cherry.glb`, `bag_{plain|lotus}_{open|closed}.glb` 이름으로 넣으면 같은 방식으로 교체한다.
