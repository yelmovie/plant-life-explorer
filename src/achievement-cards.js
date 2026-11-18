// Achievement cards: one per map villain, earned on its third strike.
// Ownership is read from the existing strike record (mapEncounters[id]===3), so nothing new is saved
// and a villain that was already driven off shows its card in the header without replaying the reveal.
import {createRewardCards} from './reward-cards.js';
import {MISSIONS} from './model.js';
import {playCardSound,preloadCardSounds} from './audio.js';

// Villain ids in map order (village-encounters.js STAGES) with each card's title. Stars rise with the map order.
const CARDS=[['leaf','잎 관찰 분류 탐정'],['season','겨울눈 계절 기록가'],['tag','물에 뜨는 잎 연구원'],['seedling','알맞은 땅 정원 설계사'],['bag','초록정원 전설의 발명가']];
let set;
// Built on first use: the unit tests import this module without a document.
const cards=()=>set??=createRewardCards({
  setName:'초록정원 성취 카드',
  cards:CARDS.map(([id,title],i)=>({id,title,stage:MISSIONS[i].name,art:`/assets/reward-cards/card-${i+1}-${id}.webp`,thumb:`/assets/reward-cards/thumb-${i+1}-${id}.webp`})),
  theme:{accent:'#b78a40',accent2:'#274f3a',glow:'#dbe8b7',ink:'#293d30'},
  particles:['leaf','petal','drop','spark'],
  colors:['#9bd866','#dbe8b7','#b78a40','#badbd6','#bd805b','#ffffff'],
  // Card back: the leaf of the app icon (index.html).
  emblem:'<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M10 28Q8 9 31 8Q33 28 10 28M10 28L26 14" fill="#c9e790" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  sound:playCardSound,
  inertRoot:()=>document.querySelector('#app'),
});
// A card on its way to a slot stays empty in the header until it lands.
const flying=new Set();
export const rewardCardsOwned=progress=>CARDS.map(([id])=>progress?.[id]===3);
export const newRewardCards=(before,after)=>CARDS.flatMap(([id],i)=>before?.[id]!==3&&after?.[id]===3?[i]:[]);
export const rewardSlotsHtml=progress=>cards().slotsHtml(rewardCardsOwned(progress).map((owned,i)=>owned&&!flying.has(i)));
// Call with the strike record before and after each save. onMap: the map is still showing with no dialog over it.
export function awardRewardCards(before,after,onMap){
  preloadCardSounds(); // From the first strike, so the reveal does not start silent.
  for(const i of newRewardCards(before,after)){
    flying.add(i);
    // Wait for the villain's exit. An open card makes #app inert, which pauses the map, so the finale film follows the card.
    setTimeout(()=>{
      const owned=rewardCardsOwned(after);
      if(!onMap()){flying.delete(i);cards().syncSlots(owned);return;}
      const foe=document.querySelector(`.map-encounter-foe[data-encounter="${CARDS[i][0]}"]`),box=foe&&!foe.hidden?foe.getBoundingClientRect():null;
      void cards().reveal(i,box?{x:box.left,y:box.top-30}:undefined,owned).finally(()=>flying.delete(i));
    },matchMedia('(prefers-reduced-motion: reduce)').matches?520:760);
  }
}
