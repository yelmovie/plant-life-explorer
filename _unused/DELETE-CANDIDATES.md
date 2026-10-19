# 삭제 후보 목록 (2026-10-19)

이 폴더의 파일은 지우지 않고 옮겨만 뒀다. 확인 뒤 사용자가 직접 지운다.

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
| `green-garden-0.2.0.zip` (루트, **이동 안 함**) | 3,566,743 B | 예전 납품 묶음. `.gitignore`의 `*.zip`으로 Git 제외. 보관 필요 여부만 결정 |
| `green-garden-0.3.0.zip` (루트, **이동 안 함**) | 7,366,270 B | 같음 |
