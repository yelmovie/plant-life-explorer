// 겨울눈 찾기: after the winter underground check, the observation lens looks for the other parts that
// survive winter — cherry buds at twig tips, the sowthistle bud on the root crown. Coordinates are
// fractions of the winter panel in *_seasons_v2 (bottom-left). The 3D season scene reuses BUD_GOAL.
export const BUD_GOAL = Object.freeze({cherry: 3, sowthistle: 1});
const CHERRY_CROWN = {x: .5, y: .26, rx: .39, ry: .27};
const SOW_CROWN = {x: .5, y: .6, r: .085};
const SAME_SPOT = .12;
// Keyboard/hint path: twig tips around the crown, then the root crown.
export const BUD_SPOTS = Object.freeze({cherry: [[.17, .13], [.55, .07], [.87, .3], [.13, .38], [.36, .08], [.82, .14]], sowthistle: [[.5, .6]]});

const near = (found, x, y) => found.some(([fx, fy]) => Math.hypot(fx - x, fy - y) < SAME_SPOT);

export function lookForBud(plant, x, y, found = []) {
  const goal = BUD_GOAL[plant];
  if (!goal || ![x, y].every(v => Number.isFinite(v) && v >= 0 && v <= 1)) return {hit: false, message: ''};
  if (found.length >= goal) return {hit: false, message: plant === 'cherry' ? '벚나무 겨울눈 세 개를 모두 찾았어.' : '뿌리 머리의 새눈은 이미 찾았어.'};
  if (plant === 'sowthistle') {
    if (Math.hypot(x - SOW_CROWN.x, (y - SOW_CROWN.y) * 1.4) <= SOW_CROWN.r) return {hit: true, message: '뿌리 머리에서 작은 새눈을 찾았어! 봄이 되면 여기서 새잎이 돋아.'};
    if (y > .66) return {hit: false, message: '땅속 뿌리는 이미 확인했어. 땅과 만나는 뿌리 머리를 살펴봐.'};
    return {hit: false, message: '마른 잎 아래, 땅과 만나는 가운데를 살펴봐.'};
  }
  if (y > .58) return {hit: false, message: '겨울눈은 땅 위 가지에 있어. 나뭇가지를 살펴봐.'};
  const d = Math.hypot((x - CHERRY_CROWN.x) / CHERRY_CROWN.rx, (y - CHERRY_CROWN.y) / CHERRY_CROWN.ry);
  if (d > 1.1) return {hit: false, message: '그곳엔 가지가 없어. 나무 쪽으로 렌즈를 옮겨 봐.'};
  if (d < .7) return {hit: false, message: '굵은 가지와 줄기에서는 겨울눈이 잘 안 보여. 가느다란 가지 끝을 살펴봐.'};
  if (near(found, x, y)) return {hit: false, message: '여긴 이미 찾은 겨울눈이야. 다른 가지 끝을 살펴봐.'};
  const n = found.length + 1;
  return {hit: true, message: n < goal ? `가지 끝에서 겨울눈을 찾았어! (${n}/${goal}) 단단한 껍질이 봄까지 눈을 지켜.` : '겨울눈 세 개를 다 찾았어! 겨울에도 가지 끝은 살아서 봄을 준비해.'};
}

export function nextBudSpot(plant, found = []) {
  return (BUD_SPOTS[plant] || []).find(([x, y]) => !near(found, x, y)) || null;
}

export function normalizeBuds(value) {
  const out = {cherry: [], sowthistle: []};
  for (const plant of Object.keys(out)) {
    const list = Array.isArray(value?.[plant]) ? value[plant] : [];
    for (const point of list) {
      if (!Array.isArray(point) || point.length !== 2 || !point.every(v => Number.isFinite(v) && v >= 0 && v <= 1)) continue;
      if (out[plant].length < BUD_GOAL[plant] && !near(out[plant], point[0], point[1])) out[plant].push([+point[0].toFixed(3), +point[1].toFixed(3)]);
    }
  }
  return out;
}
export const budsFoundCount = s => (s.budsFound?.cherry?.length || 0) + (s.budsFound?.sowthistle?.length || 0);
export const BUD_TOTAL = BUD_GOAL.cherry + BUD_GOAL.sowthistle;
