// Stable asset keys keep the learning UI independent from its current 2D renderer.
// A future 3D viewer can consume these same keys without changing saved research data.
export const ASSETS = Object.freeze({
 map_trail_v2:['초록정원 탐험길','숲과 폭포를 지나 다섯 연구 장소를 잇는 길'],
 workshop_studio_v2:['발명 공방','비가 내리는 창가의 발명 작업대'],
 cherry_seasons_v2:['벚나무의 계절','같은 벚나무의 여름, 가을, 겨울, 다음 봄'],
 sowthistle_seasons_v2:['씀바귀의 계절','같은 씀바귀의 여름, 가을, 겨울, 다음 봄'],
  mascot_leaf: ['리피', '초록 잎 모자를 쓴 리피의 전신'],
  mascot_water: ['방울', '파란 물방울 친구 방울의 전신'],
  mascot_flower: ['꽃이', '분홍 꽃 모자를 쓴 꽃이의 전신'],
  reward_observatory: ['표본 온실', '식물 표본과 관찰 도구가 있는 작은 온실'],
  reward_seasons: ['계절 꽃돔', '계절의 꽃이 피어나는 유리 온실'],
  reward_water: ['물길 실험실', '맑은 연못과 수로가 있는 실험실'],
  reward_garden: ['나의 연구정원', '물가와 풀밭, 건조 구역이 있는 정원'],
  reward_workshop: ['발명 공방', '탐험 가방을 만드는 잎 지붕 공방'],
  map_island: ['초록정원 지도', '다섯 연구 장소를 잇는 정원 섬'],
  notebook_dry: ['뽀송한 수첩', '젖지 않은 노란 탐험 수첩'],
  notebook_wet: ['젖은 수첩', '빗물이 묻고 종이가 젖은 탐험 수첩'],
  bag_lotus_open: ['연잎 코팅 가방', '연잎 무늬 겉면과 열린 입구의 초록 가방'],
  bag_lotus_closed: ['덮개와 연잎 코팅 가방', '연잎 무늬 겉면과 덮개가 있는 초록 가방'],
  water_hyacinth_whole: ['부레옥잠 전체', '둥근 잎과 부푼 잎자루, 아래로 자란 뿌리'],
  hyacinth_petiole_whole: ['부레옥잠 잎자루', '잎과 식물의 밑부분을 연결하는 부푼 잎자루'],
  hyacinth_petiole_cutaway: ['부레옥잠 잎자루 단면', '조직 사이의 공기 공간을 크게 나타낸 관찰 모형'],
  aloe_leaf_whole: ['알로에 잎', '도톰한 잎과 가장자리의 작은 가시'],
  aloe_leaf_cutaway: ['알로에 잎 단면', '잎 안쪽의 수분을 머금은 조직을 보여 주는 관찰 모형'],
  research_bag_body: ['가방 본체', '입구가 열린 크림색 연구용 가방'],
  research_bag_flap: ['가방 덮개', '입구를 가릴 수 있는 별도 덮개'],
  research_bag_closed: ['덮개를 단 가방', '입구를 덮개로 가린 연구용 가방'],
  lotus_leaf_whole: ['연잎', '넓고 둥근 잎과 잎자루'],
  lotus_surface_diagram: ['연잎 표면 확대 모형', '확대한 표면 위에 맺힌 둥근 물방울'],
  cherry_leaf: ['벚나무 잎', '넓고 끝이 뾰족하며 가장자리에 톱니가 있는 잎'],
  ginkgo_leaf: ['은행나무 잎', '부채 모양이며 가장자리에 톱니가 없는 잎'],
  grass_leaf: ['강아지풀 잎', '가늘고 길쭉하며 나란한 잎맥이 보이는 잎'],
  cherry_tree: ['벚나무', '땅에 뿌리를 내리고 자라는 나무'],
  aloe_plant: ['알로에', '두꺼운 잎들이 모여 자라는 식물'],
  garden_hero: ['초록정원 연구기지', '연못과 정원 사이의 작은 식물 연구기지'],
  plant_lab_background: ['식물 연구실', '햇빛이 드는 온실의 관찰 작업대'],
});

export function assetImage(key, className = '', eager = false) {
  const asset = ASSETS[key];
  if (!asset) return '';
  return `<img class="asset-image ${className}" src="/assets/generated/${key}.webp" alt="${asset[1]}" data-asset="${key}" width="1024" height="1024" decoding="async" ${eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'} draggable="false">`;
}
