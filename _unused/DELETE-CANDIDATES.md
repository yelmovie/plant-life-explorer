# 삭제 후보 목록 (2026-10-24 갱신)

이 폴더의 파일은 지우지 않고 옮겨만 뒀다. 확인 뒤 사용자가 직접 지운다.

2026-10-20에는 현재 위치와 크기만 다시 확인했고 파일을 삭제하거나 옮기지 않았다. 아래의 미사용 근거는 정적 검색 결과다. 동적 문자열로 불러오는 캐릭터·계절 그림·표정·도장은 미사용으로 판단하지 않았다.

| 경로 (원래 위치) | 용량 | 근거 |
|---|---:|---|
| `_unused/assets/generated/map_island.webp` (`assets/generated/`) | 291,504 B | `src/`·`index.html` 어디서도 쓰지 않음. 지도는 `map_trail_v2`로 바뀜. 카탈로그 키도 제거 |
| `_unused/assets/generated/map_island.png` | 2,502,159 B | 위 그림의 원본 PNG. 두면 `npm run assets:optimize`가 WebP를 다시 만든다 |
| `_unused/assets/generated/research_bag_flap.webp` | 229,720 B | 쓰지 않음. 가방은 `research_bag_body`·`research_bag_closed`·`bag_lotus_*`만 씀. 카탈로그 키 제거 |
| `_unused/assets/generated/research_bag_flap.png` | 2,097,773 B | 위 그림의 원본 PNG |
| `_unused/assets/generated/aloe_leaf_whole.webp` | 102,514 B | 쓰지 않음. 알로에는 `aloe_plant`·`aloe_leaf_cutaway`만 씀. 카탈로그 키 제거 |
| `_unused/assets/generated/aloe_leaf_whole.png` | 1,571,852 B | 위 그림의 원본 PNG |
| `_unused/dist-leftovers/assets/generated/*.webp` (3개, `dist/`) | 623,738 B | 이전 빌드 결과에 남은 위 3개 그림. 빌드가 남은 파일을 막아서 옮김 |
| `_unused/assets/characters.webp` (`assets/`) | 199,016 B | 디자인 정리 뒤 `src/style.css`의 `.mascot` 규칙이 사라져 참조 0. 원본 `assets/characters.png`(1,718,700 B)는 `scripts/optimize-assets.mjs`가 고정 경로로 읽어서 옮기지 않음 |
| `_unused/dist-leftovers/assets/characters.webp` (`dist/`) | 199,016 B | 이전 빌드에 남은 같은 파일 |
| `_unused/old-releases-20261019/green-garden-0.2.0.zip` (이전 루트) | 3,566,743 B | 예전 납품 묶음. 현재 이 경로에 보관돼 있음. `.gitignore`의 `*.zip`으로 Git 제외 |
| `_unused/old-releases-20261019/green-garden-0.3.0.zip` (이전 루트) | 7,366,270 B | 같음 |
| `_unused/dist-leftovers/assets/fonts/` (4개, 이전 `dist/`) | 922,672 B | 개명 서브셋 적용 전 배포 잔여물. 원본 글꼴은 `assets/fonts/source/`에 남아 있으며, 이 후보를 지워도 원본 글꼴을 지우는 것은 아님 |
| `_unused/duplicates-20261019/` (PNG 5개) | 6,950,488 B | 폴더명상 기존 중복 보관본. 이번 점검에서는 대응 원본별 동일성·보관 필요성을 재판정하지 않았으므로 자동 삭제 대상 아님 |

## 삭제를 권하지 않는 현재 원본

- `assets/generated/*.png`: WebP 제작 원본·제작 이력이다. 배포 빌드에서는 제외된다.
- `assets/characters.png`: 화면에서는 사용하지 않지만 `scripts/optimize-assets.mjs`의 고정 입력 경로다.
- `assets/fonts/source/*.woff2`: `scripts/subset-fonts.py`의 글꼴 서브셋 제작 원본이다. 배포 빌드에서는 제외된다.
- `assets/generated/greenhouse_studio_v1.webp`, `plant_lab_background.webp`: 현재 CSS에 참조가 남아 있다. 새 배경이 덮어쓰는 화면이 있어도 런타임 전환·대체 경로를 확인하기 전 이동하지 않는다.

## 2026-10-23 정리분 확인

기존 `docs/reviews/ASSET-AUDIO-CHECK-20261023.md`와 `ASSET-ORGANIZATION-20261023.json`의 이동·동일성 기록을 재사용했다. 2026-10-24에는 아래 4개 현 위치·크기만 대조했으며 전체 에셋을 다시 이동하거나 삭제하지 않았다.

| 현재 경로 | 용량 | 미사용·중복 근거 |
|---|---:|---|
| `_unused/assets/generated/expedition_leafy_sheet_20261020.webp` | 124,190 B | 캐릭터 참조 합본. 현재 카탈로그·JS·CSS·HTML 정적 참조 없음. 원본 PNG는 제작 자료로 보존 |
| `_unused/assets/generated/expedition_trail_20261020.webp` | 755,994 B | 실행 참조 없는 탐험 지도 후보. 현재 지도는 기존 활성 배경·지도 데이터 사용 |
| `_unused/assets/generated/expedition_tools_atlas_20261020.webp` | 562,270 B | 합본 대신 분리된 도구 5장을 사용. 합본은 실행 참조 없음 |
| `_unused/assets/generated/expedition_field_leaf_atlas_20261020.webp` | 417,058 B | 합본 대신 분리된 잎 표본 3장을 사용. 합본은 실행 참조 없음 |
| `_unused/dist-leftovers/20261023/assets/generated/` 위 4종 | 합계 1,859,512 B | 이전 dist의 동일 SHA-256 사본. 이동 당시 해시는 정리 JSON에 기록 |

위 4종은 **삭제 가능성을 검토하는 보관본**이다. 입력 원본·제작 이력까지 함께 삭제해도 된다는 뜻은 아니다. `_source/generated-images/`, `_source/branding/`, `_source/meshy-input/`, `_source/videos/`는 재편집·납품 근거이므로 삭제를 권하지 않는다.
