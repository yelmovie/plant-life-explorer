// Stable asset keys keep the learning UI independent from its current 2D renderer.
// A future 3D viewer can consume these same keys without changing saved research data.
export const ASSETS = Object.freeze({
 ending_diary_20261023:['나의 탐험 일기','오늘의 탐험 일기. 잎을 살피고 식물을 나눴다. 겨울을 지나 다시 자란 식물도 만났다. 식물에게 맞는 정원도 꾸몄다. 연잎의 비밀로 가방까지 만들었다! 작은 발견이 멋진 발명이 되었다. 나는 초록정원의 식물 연구원!'],
 expedition_hero_20261020:['리피의 탐험길','숲길을 따라 온실로 이어지는 초록정원'],
 expedition_hyacinth_tank_20261020:['수조 속 부레옥잠','수면 위 둥근 잎과 부푼 잎자루, 물속 뿌리'],
 expedition_petiole_clear_20261023:['수조 속 잎자루 관찰 모형','투명한 배경의 잎 전체와 공기 공간이 드러난 잎자루 단면'],
 expedition_petiole_model_20261020:['입체 잎자루 관찰 모형','부푼 잎자루와 여러 공기 공간이 보이는 절단 모형'],
 expedition_restored_garden_20261020:['되살아난 초록정원','리피와 함께 다섯 연구 장소를 다시 연 초록정원'],
 expedition_tool_lens:['관찰 렌즈','손잡이가 달린 탐험용 돋보기'],
 expedition_tool_camera:['계절 관찰 수첩','잎과 계절을 기록하는 초록색 관찰 수첩'],
 expedition_tool_water:['물주기 병','물가를 만드는 눈금 물병과 물길 도구'],
 expedition_tool_fabric:['정원 도구 꾸러미','모종삽과 씨앗 주머니'],
 expedition_tool_bag:['나의 탐험 가방','연잎을 닮은 초록색 덮개가 있는 탐험 가방'],
 field_leaf_maple:['단풍나무 잎','손바닥처럼 갈라지고 가장자리에 톱니가 있는 단풍나무 잎'],
 field_leaf_pine:['소나무 잎','가늘고 긴 바늘 모양 소나무 잎 두 개'],
 field_leaf_camellia:['동백나무 잎','윤기 나는 타원형이고 가장자리에 작은 톱니가 있는 동백나무 잎'],
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
  notebook_dry: ['뽀송한 수첩', '젖지 않은 노란 탐험 수첩'],
  notebook_wet: ['젖은 수첩', '빗물이 묻고 종이가 젖은 탐험 수첩'],
  bag_lotus_open: ['연잎 코팅 가방', '연잎 무늬 겉면과 열린 입구의 초록 가방'],
  bag_lotus_closed: ['덮개와 연잎 코팅 가방', '연잎 무늬 겉면과 덮개가 있는 초록 가방'],
  water_hyacinth_whole: ['부레옥잠 전체', '둥근 잎과 부푼 잎자루, 아래로 자란 뿌리'],
  hyacinth_petiole_whole: ['부레옥잠 잎자루', '잎과 식물의 밑부분을 연결하는 부푼 잎자루'],
  hyacinth_petiole_cutaway: ['부레옥잠 잎자루 단면', '조직 사이의 공기 공간을 크게 나타낸 관찰 모형'],
  aloe_leaf_cutaway: ['알로에 잎 단면', '잎 안쪽의 수분을 머금은 조직을 보여 주는 관찰 모형'],
  research_bag_body: ['가방 본체', '입구가 열린 크림색 연구용 가방'],
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
  mood_leaf_idle: ['리피', '반갑게 서 있는 리피'],
  mood_leaf_happy: ['리피', '기뻐하는 리피'],
  mood_leaf_think: ['리피', '곰곰이 생각하는 리피'],
  mood_leaf_surprise: ['리피', '깜짝 놀란 리피'],
  mood_water_idle: ['방울', '반갑게 서 있는 방울'],
  mood_water_happy: ['방울', '기뻐하는 방울'],
  mood_water_think: ['방울', '곰곰이 생각하는 방울'],
  mood_water_surprise: ['방울', '깜짝 놀란 방울'],
  mood_flower_idle: ['꽃이', '반갑게 서 있는 꽃이'],
  mood_flower_happy: ['꽃이', '기뻐하는 꽃이'],
  mood_flower_think: ['꽃이', '곰곰이 생각하는 꽃이'],
  mood_flower_surprise: ['꽃이', '깜짝 놀란 꽃이'],
  stamp_direct: ['한 번에 찾았어 도장', '잎과 반짝이 별이 새겨진 초록 도장'],
  stamp_fixed: ['고쳐서 찾았어 도장', '돋보기와 새싹, 다시 도는 화살표가 새겨진 주황 도장'],
  stamp_complete: ['탐구 완료 도장', '유리 돔 안에서 싹이 튼 씨앗이 새겨진 연구기지 도장'],
  bg_m1_1_scan: ['표본 스캔대', '잎 표본을 올려 살펴보는 온실 관찰대'],
  bg_m1_2_sort: ['분류 연구실', '표본을 나누어 붙이는 넓은 작업대'],
  bg_m2_1_seasons: ['계절 꽃돔', '봄·가을·겨울 나무가 담긴 유리 돔'],
  bg_m2_2_evidence: ['증거 분석실', '계절 기록을 모으는 분석 보드'],
  bg_m3_1_chamber: ['환경 실험 챔버', '부레옥잠이 떠 있는 큰 수조'],
  bg_m3_2_habitat: ['서식지 판정실', '들·물가·사막이 보이는 세 창'],
  bg_m4_1_terrain: ['정원 지형 부지', '물가와 흙과 풀밭이 있는 빈 부지'],
  bg_m4_2_garden: ['완성된 연구정원', '연못과 선인장이 어우러진 정원'],
  bg_m5_1_idea: ['아이디어 공방', '식물 그림이 걸린 발명 작업대'],
  bg_m5_2_test: ['시험 센터', '비가 내리는 유리 시험 챔버'],
  cactus_plant: ['선인장', '물을 저장하는 두꺼운 줄기를 가진 선인장'],
  float_model_air: ['공기 공간 모형', '안쪽에 큰 공기 칸이 여러 개 있는 원통 모형'],
  float_model_solid: ['속을 채운 비교 모형', '같은 크기에 안쪽을 흙으로 가득 채운 원통 모형'],
  habitat_water: ['물가', '물이 고인 연못가 땅'],
  habitat_grass: ['풀밭', '흙이 촉촉한 풀밭 땅'],
  habitat_dry: ['건조 구역', '물이 적고 메마른 모래땅'],
  cloth_swatch: ['보통 천', '물이 스며들 수 있는 평범한 면 천 조각'],
  cherry_bud_spring: ['초봄의 벚나무', '겨울을 지난 가지에 새눈이 부풀어 오른 벚나무와 땅속 뿌리'],
  sowthistle_bud_spring: ['초봄의 씀바귀', '살아 있던 뿌리에서 새싹이 돋는 씀바귀'],
  season_cherry_winter_bud: ['벚나무 겨울눈', '가지 끝에 껍질로 싸인 겨울눈 세 개, 맨 위 눈이 막 열리기 시작함'],
  season_cherry_leaf_autumn: ['벚나무 단풍잎', '붉고 노랗게 물든 벚나무 잎'],
  season_cherry_blossom: ['벚꽃 송이', '분홍 벚꽃 다섯 송이와 꽃봉오리'],
  season_sowthistle_crown_bud: ['씀바귀 뿌리 머리 새눈', '겨울을 난 곧은뿌리 머리에서 돋는 작은 초록 새눈'],
});

// 240px thumbnails (`*_thumb.webp`) for small slots such as the home .mission-mini cards.
export const THUMBS = Object.freeze(['reward_observatory','reward_seasons','reward_water','reward_garden','reward_workshop']);

// eager: images shown inside dialogs/mission cards load immediately instead of lazily.
export function assetImage(key, className = '', eager = false, thumb = false) {
  const asset = ASSETS[key];
  if (!asset) return '';
  const small = thumb && THUMBS.includes(key);
  return `<img class="asset-image ${className}" src="/assets/generated/${key}${small ? '_thumb' : ''}.webp" alt="${asset[1]}" data-asset="${key}" width="${small ? 240 : 1024}" height="${small ? 240 : 1024}" decoding="async" ${eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'} draggable="false">`;
}

// Scene paintings per page (index = state.page), mirrored by --bg-activity-N in polish.css.
export const STAGE_BACKGROUNDS = Object.freeze(['bg_m1_1_scan','bg_m1_2_sort','bg_m2_1_seasons','bg_m2_2_evidence','bg_m3_1_chamber','bg_m3_2_habitat','bg_m4_1_terrain','bg_m4_2_garden','bg_m5_1_idea','bg_m5_2_test']);
const warmed = new Set();
// Fetch ahead into the HTTP cache so the next screen never opens on a blank tint. Failures are ignored.
export function warmImage(src) {
  if (warmed.has(src)) return;
  warmed.add(src);
  // Idle time only, so warming never competes with the screen the student is looking at.
  const start = () => { const image = new Image(); image.decoding = 'async'; image.src = src; };
  if (typeof requestIdleCallback === 'function') requestIdleCallback(start, {timeout: 3000}); else setTimeout(start, 600);
}
// Same idle-time warming for non-image files (the season GLBs) so stage 2 opens without waiting.
export function warmFile(src) {
  if (warmed.has(src)) return;
  warmed.add(src);
  const start = () => { fetch(src).catch(() => {}); };
  if (typeof requestIdleCallback === 'function') requestIdleCallback(start, {timeout: 3000}); else setTimeout(start, 600);
}
export const warmMission = i => STAGE_BACKGROUNDS.slice(i * 2, i * 2 + 2).forEach(key => warmImage(`/assets/generated/${key}.webp`));
