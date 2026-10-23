# 3D 모형 (GLB)

Meshy Image-to-3D 결과를 블렌더 5.2로 다듬은 파일이다. 원본은 `_source/original-glb/`(Git 제외), 생성 입력 그림은 `_source/meshy-input/`.
다듬기: 메시 합치기 → Decimate(Collapse) → 가장 긴 변 2로 정규화(식물은 바닥 y=0) → 텍스처 1024 JPEG, 금속/거칠기 텍스처 제거.

| 파일 | 쓰는 곳 | 원본 | 삼각형 | 크기 |
|---|---|---|---|---|
| `petiole_whole.glb` | 탐구3 자르기 전용으로 보관 — 현재 실험에서는 코드 모형 사용 | `Meshy_AI_water_hyacinth_petiol_1019113324_image-to-3d-texture.glb` | 74,484 → 11,999 | 20.9MB → 0.60MB |
| `petiole_cut.glb` | 탐구3 단면용으로 보관 — 납작한 형상 때문에 코드 모형으로 교체됨 | `Meshy_AI_water_hyacinth_cross__1019113449_image-to-3d-texture.glb` | 271,184 → 20,000 | 29.0MB → 0.96MB |
| `plant_aloe.glb` | 탐구4 정원 알로에 | `Meshy_AI_aloe_vera_plant_1019113636_image-to-3d-texture.glb` | 565,278 → 8,000 | 41.9MB → 0.62MB |

2026-10-23 정원은 알로에 GLB와 부레옥잠·벚나무의 투명 그림을 함께 쓴다. 가방은 투명 그림 네 종류를 기본으로 보여 주며 간단한 코드 입체 모형으로 전환할 수 있다. 실제 가방 GLB는 아직 없고, 입력 그림과 프롬프트는 `docs/MESHY-BAG-PROMPTS-20261023.md`에 정리했다. 새 GLB는 모양을 확인한 뒤 코드에 연결해야 하며, 파일명만 맞춘다고 자동 교체되지는 않는다.

2026-10-23 재확인: `src/spatial.js`의 탐구3 분기는 두 petiole GLB를 불러오지 않고 LatheGeometry/ExtrudeGeometry로 설명 모형을 만든다. 단면 GLB의 깊이/높이는 원본·최적화본 모두 약 0.126으로, 최적화 이전부터 납작했다. 자르기 전 GLB는 같은 비율이 약 0.864다. 재생성용 이미지·Meshy 프롬프트·치수 근거는 `docs/meshy-petiole-20261023/README.md`를 참고한다.
