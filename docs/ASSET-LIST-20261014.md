# 기본 2D 그림 목록과 3D 교체 지점

PNG 원본: `assets/generated/`. 실행 파일: 같은 이름의 WebP. 생성 도구: OpenAI 내장 image_gen. 총 17종. 기본 목록은 [별도 캔버스](https://chatgpt.com/space/page_6aeb2ff5e0ec81918f97156bf7a3dbbd), 프롬프트 기록은 `ASSET-PROMPTS-20261014.json`.

| 키 | 그림 | 적용 위치 |
|---|---|---|
| water_hyacinth_whole | 부레옥잠 전체 | 실험·서식지·정원 |
| hyacinth_petiole_whole | 부푼 잎자루 | 실험 시작·확대 보기 |
| hyacinth_petiole_cutaway | 잎자루 단면 | 자르기 이후·확대 보기 |
| aloe_leaf_whole | 알로에 잎 | 비교 전·확대 보기 |
| aloe_leaf_cutaway | 알로에 잎 단면 | 비교 후·확대 보기 |
| research_bag_body | 열린 가방 | 설계·시험·엔딩 |
| research_bag_flap | 가방 덮개 | 부품 선택 버튼 |
| lotus_leaf_whole | 연잎 | 설계 노트·확대 설명 |
| lotus_surface_diagram | 연잎 표면 모형 | 확대 설명 |
| plant_lab_background | 온실 작업대 | 실험·시험 배경 |
| cherry_leaf | 벚나무 잎 | 표본 관찰·분류 |
| ginkgo_leaf | 은행나무 잎 | 표본 관찰·분류 |
| grass_leaf | 강아지풀 잎 | 표본 관찰·분류 |
| aloe_plant | 알로에 전체 | 서식지·정원 |
| cherry_tree | 벚나무 전체 | 서식지·정원 |
| garden_hero | 정원 연구기지 | 메인 배경 |
| research_bag_closed | 덮개를 단 가방 | 설계·시험·엔딩 |

앞 10종이 기존 목록, 뒤 7종은 화면 적용에 필요한 보충 그림이다. 투명 배경은 물체 15종, 불투명 배경은 2종이다. 생성 도구의 중간 원본 경로와 별도로 결과 파일을 D: 프로젝트에 보관했다.

`src/asset-catalog.js`의 키를 유지하고 `src/art.js`의 leafArt/plantArt/bagArt 및 app.js의 실험 표시를 단계적으로 3D로 교체하면 된다. 회전·카메라·GLB 최적화는 후속 작업이며 현재는 2D 표시다.
