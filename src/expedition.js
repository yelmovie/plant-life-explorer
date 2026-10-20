import {missionDone} from './model.js';
import {icon} from './art.js';
import {ASSETS,assetImage} from './asset-catalog.js';

// One story connects the manipulation, the scientific evidence and its reward.
export const EXPEDITIONS=[
 {title:'리피의 뒤섞인 잎 서랍',problem:'잎 이름표가 섞여서 온실 문이 열리지 않아!',goal:'잎을 살펴보고, 같은 특징끼리 모아 줘.',steps:['확대경으로 단서 찾기','다른 잎에도 기준 써 보기','표본 기록으로 온실 복구'],standard:'4과03-01',tool:'관찰 렌즈',toolKey:'expedition_tool_lens',toolIcon:'zoom',use:'다음 탐구에서 겨울 땅속에 남은 부분을 살펴봐.',badge:'잎 탐정',change:'온실의 표본 서랍과 안내등이 돌아와.',next:'잎이 보이지 않는 겨울에도 식물은 살아 있을까?',hints:['모양과 가장자리는 서로 다른 단서야.','기준이 바뀌면 같은 잎도 다른 자리에 놓일 수 있어.']},
 {title:'사라진 봄을 찾아서',problem:'겨울 사진 뒤의 기록이 끊겼어. 봄은 어디로 갔을까?',goal:'겨울에 남은 부분과 다음 봄의 모습을 이어 줘.',steps:['시간을 움직여 관찰','같은 식물의 변화 연결','두 식물의 살아남기 설명'],standard:'4과03-02',tool:'계절 관찰 수첩',toolKey:'expedition_tool_camera',toolIcon:'camera',use:'다음 실험에서 바꾸기 전과 뒤를 나란히 기록해.',badge:'계절 기록가',change:'꽃돔이 깨어나고 지도에 꽃길을 꾸밀 수 있어.',next:'물 위에 사는 식물에게는 어떤 비밀이 있을까?',hints:['겨울에 잎이 보이지 않아도 뿌리와 줄기가 남아 있을 수 있어.','같은 식물의 겨울과 다음 봄을 비교해야 해.']},
 {title:'물 위에 뜨는 잎자루의 비밀',problem:'리피의 물길 기록이 비었어. 부레옥잠은 어떻게 떠 있을까?',goal:'예상하고, 물속에서 눌러 보고, 비교해 봐.',steps:['공기 모형의 뜨기 예상','같은 물에서 두 모형 시험','잎자루 속 공기로 설명'],standard:'4과03-02',tool:'물주기 병',toolKey:'expedition_tool_water',toolIcon:'drop',use:'다음 정원에서 물가를 직접 만들어 식물을 심어.',badge:'물길 연구원',change:'깨끗한 물길이 돌아와 정원에 물을 보낼 수 있어.',next:'이제 식물마다 살기 좋은 자리를 만들어 줄까?',hints:['부푼 부분은 잎을 받치는 잎자루야.','공기 방울은 속에 공기가 있다는 관찰 근거야. 모형과 실제 식물은 달라.']},
 {title:'우리가 만드는 살아 있는 정원',problem:'물가 식물과 마른 땅 식물의 자리가 뒤바뀌었어!',goal:'사는 곳의 조건을 만들고 식물을 알맞게 심어 줘.',steps:['세 가지 환경 만들기','식물의 특징으로 자리 정하기','달라진 조건에도 적용'],standard:'4과03-02',tool:'정원 도구 꾸러미',toolKey:'expedition_tool_fabric',toolIcon:'leaf',use:'정원에서 찾은 식물의 특징을 다음 공방의 설계 단서로 가져가.',badge:'정원 설계자',change:'네가 만든 모양과 배치가 정원에 그대로 남아.',next:'정원 탐험에 쓸 가방도 식물에게 배워서 만들자!',hints:['이름보다 물·땅의 조건을 먼저 살펴봐.','자리를 바꾼 뒤에도 식물의 특징과 환경이 맞는지 확인해.']},
 {title:'비에도 끄떡없는 탐험 가방',problem:'비가 오면 리피의 공책이 젖어 버려!',goal:'부품 하나만 바꾸어 시험하고 가방을 고쳐 줘.',steps:['필요한 부품 끌어 조립','같은 비로 전후 비교','시험 근거로 발명 완성'],standard:'4과03-03',tool:'나의 탐험 가방',toolKey:'expedition_tool_bag',toolIcon:'book',use:'완성한 가방과 정원을 전시하고 친구에게 설계 이유를 알려 줘.',badge:'자연 발명가',change:'완성한 가방을 전시하고 다섯 곳을 잇는 정원을 열어.',next:'네가 찾은 식물의 비밀로 초록정원을 깨우자!',hints:['연잎처럼 만든 겉면은 물방울이 굴러가는 데 도움을 줘.','입구로 들어오는 비는 덮개로 막아. 둘을 한꺼번에 바꾸면 무엇이 달라졌는지 알기 어려워.']},
];
export const earnedTools=s=>EXPEDITIONS.filter((_,i)=>missionDone(s,i));
export const TOOL_ASSISTS=[
 '렌즈로 겨울 사진의 땅속까지 보자. 잎이 없어도 남아 있는 부분을 다음 봄 사진과 이어 봐.',
 '수첩에 물에 넣기 전 예상과 실제 결과를 나란히 남겨 봐. 예상과 달라도 실험에서 찾은 사실이 더 중요해.',
 '물주기 병으로 비가 온 뒤를 상상해 보자. 물이 고이는 곳과 빠지는 곳을 먼저 만들고, 식물의 특징을 이어 봐.',
 '정원 도구로 살펴본 식물의 특징을 가져왔어. 겉면과 입구 덮개는 역할이 달라. 한 부품만 바꾸어 같은 비로 시험해 보자.',
 '완성한 가방을 학교 화단 탐험에 가져간다고 생각해 봐. 네가 바꾼 부품과 시험 결과를 친구에게 설명해 줘.',
];
export function toolPicture(plan){return ASSETS[plan.toolKey]?assetImage(plan.toolKey,'expedition-tool-image'):icon(plan.toolIcon,44);}
export function renderToolPack(s){return `<div class="expedition-pack"><p>탐구를 마쳐 얻은 도구야. 도구를 써서 다음 탐구의 단서를 꺼내 봐.</p><div class="expedition-tool-grid">${EXPEDITIONS.map((p,i)=>`<section class="expedition-tool ${missionDone(s,i)?'earned':'waiting'}"><div>${missionDone(s,i)?toolPicture(p):icon('lock',34)}</div><h3>${p.tool}</h3><span>${missionDone(s,i)?p.badge:`탐구 ${i+1} 완료 후`}</span><p>${missionDone(s,i)?p.use:p.goal}</p>${missionDone(s,i)?`<button class="btn soft" data-action="expedition-use" data-id="${i}">도구로 단서 꺼내기</button>`:''}</section>`).join('')}</div></div>`;}
export function renderMissionBrief(s,i){const p=EXPEDITIONS[i];return `<div class="expedition-brief">${assetImage('mood_leaf_think','brief-leafy')}<div><span class="eyebrow">리피의 부탁 · 탐구 ${i+1}</span><h3>${p.problem}</h3><p>${p.goal}</p><ol>${p.steps.map(t=>`<li>${t}</li>`).join('')}</ol><div class="mission-loot">${toolPicture(p)}<span>해결하면 <strong>${p.tool}</strong> + 빛씨앗<br><small>${p.change}</small></span></div></div></div>`;}
export function renderLoot(s,i){const p=EXPEDITIONS[i];return `<div class="expedition-loot"><div class="loot-tool">${toolPicture(p)}</div><div><span class="eyebrow">${p.badge}의 발견</span><h3>${p.tool} 획득!</h3><p>${p.use}</p></div></div>`;}
