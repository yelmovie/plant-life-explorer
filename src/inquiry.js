import {PLANTS,HABITAT_PLANTS} from './model.js';

export const QUESTS=[
 {problem:'표본 기록이 뒤섞였어.',task:'잎을 조사하고, 두 가지 기준으로 나누어 기록을 바로잡아 줘.',reward:'표본 온실의 불이 켜져.'},
 {problem:'겨울 뒤의 기록이 끊겼어.',task:'시간을 움직여 겨울과 다음 봄을 잇는 두 장의 증거를 찾아 줘.',reward:'계절 꽃돔이 다시 피어나.'},
 {problem:'물길 실험실의 환경 기록이 비었어.',task:'잎자루 속을 조사하고, 실험 결과로 식물이 살 곳을 판단해 줘.',reward:'연못과 물길이 다시 열려.'},
 {problem:'정원에 심을 위치가 아직 정해지지 않았어.',task:'물가·풀밭·건조 구역을 만들고, 조사한 식물의 자리를 정해 줘.',reward:'네가 설계한 정원이 연구기지에 남아.'},
 {problem:'비가 오면 탐험 가방과 수첩이 젖어.',task:'연잎의 특징을 써 보고, 부품 하나를 바꿔 같은 비로 시험해 줘.',reward:'발명 공방이 열리고 네 가방이 전시돼.'},
];
export const HABITAT_FACTS={
 hyacinth:{feature:'볼록한 잎자루 속에 공기가 있어',life:'물 위에 떠서 생활하는 데 도움이 돼',source:'잎자루를 물속에서 눌러 본 기록'},
 aloe:{feature:'두꺼운 잎에 물을 저장해',life:'물이 적은 곳에서 저장한 물을 쓸 수 있어',source:'알로에 관찰 자료'},
 cherry:{feature:'땅속으로 뻗은 뿌리가 있어',life:'흙에서 물을 빨아들여 생활해',source:'벚나무 관찰 자료'},
};
export function classificationKey(s){return `${s.rule}:${PLANTS.map(p=>s.groups[p.id]||'-').join(',')}`;}
export function checkClassification(s){
 const missing=PLANTS.filter(p=>!['yes','no'].includes(s.groups[p.id])).length;
 const conflicts=PLANTS.filter(p=>s.groups[p.id]&&s.groups[p.id]!== (p[s.rule]?'yes':'no')).length;
 return {key:classificationKey(s),missing,conflicts,valid:!missing&&!conflicts};
}
export function seasonEvidenceReady(s){return [3,0].every(n=>{const key=`${s.seasonPlant}:${n}`;return s.seasonPhotos[key]&&s.seasonalRecords.includes(key)&&s.linkedEvidence.includes(key);});}
export function habitatChain(s,id){const p=HABITAT_PLANTS.find(p=>p.id===id);return !!p&&s.habitats[id]===p.habitat&&s.habitatFeatures?.[id]===id;}
