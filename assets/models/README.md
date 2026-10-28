# 3D 모형 (GLB)

Meshy Image-to-3D 결과를 블렌더 5.2로 다듬은 파일이다. 원본은 `_source/original-glb/`(Git 제외), 생성 입력 그림은 `_source/meshy-input/`.
다듬기: 기준 지표면·크기 정렬, 질감 축소와 형상 최적화. 벚나무 전체 모델은 잎을 보존하기 위해 강한 Decimate 대신 오차 제한 단순화와 Meshopt 압축을 사용했다.

| 파일 | 쓰는 곳 | 원본 | 삼각형 | 크기 |
|---|---|---|---|---|
| `petiole_whole.glb` | 탐구3 자르기 전 잎자루 입체 관찰 | `Meshy_AI_water_hyacinth_petiol_1019113324_image-to-3d-texture.glb` | 74,484 → 11,999 | 20.9MB → 0.60MB |
| `petiole_cut.glb` | 탐구3 자른 뒤의 실제 Meshy 단면 관찰 | `petiole-cut-20261028/Meshy_AI_Plant_Pod_Cross_Secti_1028030253_image-to-3d-texture.glb` | 467,360 → 29,998 | 31.0MB → 1.10MB |
| `plant_aloe.glb` | 탐구4 정원 알로에 | `Meshy_AI_aloe_vera_plant_1019113636_image-to-3d-texture.glb` | 565,278 → 8,000 | 41.9MB → 0.62MB |
| `plant_cherry_full.glb` | 탐구4 정원 벚나무 전체(줄기·잎 포함) | `Meshy_AI_cherry_tree_sapling_1019114653_image-to-3d-texture.glb` | 7,621,184 → 399,296 | 256.19MB → 4.13MB |

2026-10-27 정원은 알로에와 벚나무 전체의 실제 GLB를 사용한다. 부레옥잠 전체 GLB는 없어 원래 관찰 그림을 표시하며, 잎자루와 도형 잎을 조합하던 임시 식물은 제거했다. 시점별 화면 맞춤은 `src/garden-view.js`에서 처리한다. 지형 GLB는 아직 없으므로 현재 지형 표현은 교체 전 상태다. 가방도 실제 GLB가 없어 기존 그림만 표시하고 코드 도형과 입체 전환 버튼을 제거했다. 새 제작 프롬프트는 `docs/meshy-assets-20261027/README.md`에 있다.

2026-10-27: 탐구3은 자르기 전 `petiole_whole.glb`, 자른 뒤 `petiole_cut.glb`를 연결했다. 두 표본의 높이를 균일 배율로 맞춘다.

2026-10-28: 납작했던 단면(깊이/폭 0.13)을 `docs/meshy-petiole-20261023/petiole-cut-reference.png`로 다시 만든 Meshy 결과로 교체했다. `scripts/blender-petiole-cut.py`로 겹친 꼭짓점 용접 → Decimate 1회(열린 모서리 0→0) → 높이 2.0·상자 중심 원점 → 질감 1024 JPEG·금속/거칠기 질감 제거를 적용했다. 원본이 이미 서 있고 잘린 면이 정면(+Z)을 향해 회전은 0°이며, 앱의 대각선 세우기 보정도 지웠다. 결과 치수 폭 1.011 × 높이 2.0 × 깊이 0.832(깊이/폭 0.82). 이전 납작한 파일은 `_source/original-glb/petiole-cut-20261028/petiole_cut-flat-20261019.glb`에 보관했다.

벚나무는 원본을 보존하고 gltfpack 1.3의 오차 제한 단순화 → Blender 기준점 정렬·질감 축소 → `EXT_meshopt_compression` 압축을 적용했다. Three.js r181 배포본의 MeshoptDecoder(24.8KB)를 함께 제공하며 라이선스는 `assets/meshopt-license.txt`다. 검증 기록은 `docs/reviews/EXISTING-MODELS-20261027.md`에 있다.

## 2026-10-25 2단계 계절 타임랩 GLB 4종

사용자가 Meshy Image-to-3D(질감 포함)로 만든 원본을 `_source/original-glb/season-20261025/`에 두고, `scripts/blender-season-glb.py`로 다듬었다. 입력 그림은 `_source/meshy-input/m2-season-20261025/M1~M4`.

| 파일 | 쓰는 곳 | 원본 | 삼각형 | 크기 |
|---|---|---|---|---|
| `season_cherry_bare.glb` | 2단계 벚나무 줄기·가지·뿌리(다섯 계절 공통) | `Meshy_AI_Bare_Cherry_Tree_with_1025133530_image-to-3d-texture.glb` | 1,390,394 → 40,000 (가지 22,584 + 줄기 17,416) | 71.6MB → 1.71MB |
| `season_sowthistle_root.glb` | 2단계 씀바귀 곧은뿌리(땅속) | `Meshy_AI_Korean_Sowthistle_Roo_1025133541_image-to-3d-texture.glb` | 882,104 → 14,000 | 56.0MB → 0.95MB |
| `season_sowthistle_rosette.glb` | 2단계 씀바귀 뿌리잎(계절별 색·크기만 바꿈) | `Meshy_AI_Korean_Sowthistle_Lea_1025133606_image-to-3d-texture.glb` | 900,306 → 11,999 | 51.3MB → 0.72MB |
| `season_sowthistle_flowers.glb` | 2단계 씀바귀 꽃줄기(여름·가을만 보임) | `Meshy_AI_Korean_Sowthistle_Flo_1025133551_image-to-3d-texture.glb` | 678,218 → 12,000 | 43.7MB → 0.76MB |

- 찢어짐 방지: 가져올 때 겹친 꼭짓점을 합치고(UV 이음새만, 1e-6 거리) Decimate는 한 번만 했다. 열린 모서리 수는 전후 0→0(뿌리잎만 0→1, 화면에서 보이지 않음). 정면·옆·위 렌더를 원본과 나란히 비교했다(`D:/iscreammedia_sc34/_scratch/leave-20261025/glb-renders/`).
- 기준: glTF +Y 위, y=0이 땅 높이, 원점은 줄기·뿌리 축. 벚나무는 전체 높이 2.0(땅 위 약 80%), 씀바귀 뿌리 1.0·뿌리잎 폭 1.0·꽃줄기 1.5. 질감 1024 JPEG, 금속·거칠기 질감 제거(거칠기 0.85).
- 벚나무 가지는 Meshy가 한 장의 평면처럼 납작하게 만들었다. 가지 갈림 위를 `crown`, 아래를 `trunk` 노드로 나눴고, 앱(`spatial.js`)이 `crown`을 60°·120° 돌린 복사본 2개를 더해 입체감을 준다(기하 공유, 추가 다운로드 없음).

2026-10-27: Meshy GLB 원본은 유지하고 `src/season-environment.js`로 흙의 지층·알갱이 질감, 계절별 잔디와 입체 풀잎, 작은 돌을 보강했다. 봄 벚꽃은 평면 송이 그림 대신 굽은 꽃잎과 꽃술을 가진 입체 꽃 1,710송이를 실제 가지 표면을 따라 배치한다. 계절 화면에만 접지·나뭇가지 그림자를 켜며, 땅속을 열면 앞쪽 잔디도 흙과 함께 숨긴다. 질감은 작은 캔버스로 한 번 생성해 재사용하고, 꽃·풀은 인스턴싱으로 묶는다.
- 잎·단풍·겨울눈은 GLB에 넣지 않고 앱이 가지 끝에 그림 카드(InstancedMesh)로 붙이며, 벚꽃은 코드로 만든 입체 꽃을 쓴다. 같은 나무 한 그루로 다섯 계절을 보여 주기 위해서다.
