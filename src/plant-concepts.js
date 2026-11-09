import {assetImage} from './asset-catalog.js';

// An optional illustrated concept sequence, not a film or a learner's saved observation.
export const PLANT_CONCEPTS = [
 {title:'같은 기준으로 분류',terms:['모양','가장자리','같은 기준'],frames:[['cherry_leaf','모양과 가장자리','잎 전체의 모양과 가장자리를 자세히 관찰해.'],['ginkgo_leaf','서로 비교','은행나무 잎과 벚나무 잎은 모양과 가장자리가 달라.'],['field_leaf_maple','같은 기준','새로 만난 잎에도 같은 기준을 적용해 나누어 봐.']]},
 {title:'겨울을 지나 다시 자라는 식물',terms:['겨울눈','줄기','뿌리','같은 식물'],frames:[['season_cherry_winter_bud','겨울눈','겨울에 잎이 없어도 줄기와 겨울눈이 살아 있을 수 있어.'],['cherry_bud_spring','이어지는 생명','살아 있던 줄기와 뿌리를 바탕으로 봄에 새잎과 꽃이 나와.'],['sowthistle_bud_spring','같은 식물','씀바귀도 살아 있던 뿌리에서 다시 자라. 새싹이라고 모두 새로운 식물은 아니야.']]},
 {title:'잎자루 속 공기의 역할',terms:['잎자루','공기 공간','공기','물에 뜨는'],frames:[['hyacinth_petiole_whole','잎자루 관찰','부레옥잠의 부푼 잎자루를 살펴봐.'],['hyacinth_petiole_cutaway','공기 공간','잎자루 안에는 공기 공간이 있어. 자른 단면에서 확인할 수 있어.'],['water_hyacinth_whole','물에 뜨는 데 도움','잎자루 속 공기는 부레옥잠이 물에 뜨는 데 도움을 줘.']]},
 {title:'사는 곳에 알맞은 특징',terms:['물가','건조한 곳','저장','특징','사는 곳'],frames:[['water_hyacinth_whole','물가의 부레옥잠','부레옥잠은 물 위에 떠서 살아. 몸의 특징이 물가 생활에 도움이 돼.'],['aloe_leaf_cutaway','건조한 곳의 알로에','알로에는 두꺼운 잎에 물을 저장해. 물이 적을 때 도움이 돼.'],['reward_garden','특징과 사는 곳','식물의 특징과 사는 곳의 물·땅 조건을 함께 생각해 봐.']]},
 {title:'연잎의 특징을 발명에 활용',terms:['연잎','물방울','겉면','덮개','시험'],frames:[['lotus_surface_diagram','연잎 표면 확대 모형','연잎 위에는 물방울이 둥글게 맺혀 굴러가. 그림은 표면을 확대한 모형이야.'],['bag_lotus_open','겉면의 역할','연잎을 본뜬 겉면은 물방울을 굴려 보내. 열린 입구까지 막아 주지는 않아.'],['bag_lotus_closed','덮개와 함께 시험','덮개로 입구를 막고 시험해. 겉면과 덮개는 서로 다른 일을 해.']]},
];
const escape=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function plantEmphasis(text,words){let parts=[String(text)];for(const word of [...words].sort((a,b)=>b.length-a.length)){parts=parts.flatMap(part=>typeof part==='string'?part.split(word).flatMap((s,i)=>i?[{word},s]:[s]):[part]);}return parts.map(p=>typeof p==='string'?escape(p):'<mark>'+escape(p.word)+'</mark>').join('');}
export const plantConceptMarkup=i=>PLANT_CONCEPTS[i]?`<plant-concept-player data-chapter="${i}"></plant-concept-player>`:'';

if(typeof customElements!=='undefined'&&!customElements.get('plant-concept-player'))customElements.define('plant-concept-player',class extends HTMLElement{
 connectedCallback(){
  if(this.controller)return;
  const clip=PLANT_CONCEPTS[Number(this.dataset.chapter)];if(!clip)return;
  this.controller=new AbortController();this.index=0;this.playing=false;this.timer=null;
  if(!document.querySelector('link[data-plant-concepts]')){const l=document.createElement('link');l.rel='stylesheet';l.href=new URL('./plant-concepts.css',import.meta.url).href;l.dataset.plantConcepts='';document.head.append(l);}
  this.innerHTML=`<section class="plant-concept" aria-label="${clip.title} 그림 개념 설명"><header><small>그림으로 다시 발견</small><strong>${clip.title}</strong></header><div class="plant-concept-scene"></div><p class="plant-concept-caption" role="status" aria-live="polite"></p><nav aria-label="개념 장면 선택">${clip.frames.map((f,i)=>`<button type="button" data-frame="${i}">${i+1}. ${f[1]}</button>`).join('')}</nav><div class="plant-concept-controls"><button type="button" data-plant-play>장면 이어 보기</button><span>장면을 눌러 천천히 살펴봐도 좋아.</span></div></section>`;
  this.paint=()=>{const [asset,label,text]=clip.frames[this.index];this.querySelector('.plant-concept-scene').innerHTML=assetImage(asset,'',true)+`<span>${escape(label)}</span>`;this.querySelector('.plant-concept-caption').innerHTML=plantEmphasis(text,clip.terms);this.querySelectorAll('[data-frame]').forEach((b,i)=>{b.classList.toggle('current',i===this.index);b.setAttribute('aria-pressed',String(i===this.index));});this.classList.toggle('is-moving',this.playing&&!matchMedia('(prefers-reduced-motion: reduce)').matches);this.querySelector('[data-plant-play]').textContent=this.playing?'일시정지':'장면 이어 보기';};
  this.pause=()=>{clearTimeout(this.timer);this.timer=null;this.playing=false;this.classList.remove('is-moving');this.querySelector('[data-plant-play]').textContent='장면 이어 보기';};
  const tick=()=>{if(!this.isConnected||!this.playing)return;if(this.index===clip.frames.length-1){this.pause();return;}this.index++;this.paint();this.timer=setTimeout(tick,6000);};
  this.addEventListener('click',event=>{const b=event.target.closest('button');if(!b)return;event.stopPropagation();if(b.hasAttribute('data-frame')){this.pause();this.index=Number(b.dataset.frame);this.paint();}else{if(this.playing){this.pause();return;}if(this.index===clip.frames.length-1)this.index=0;this.playing=true;this.paint();this.timer=setTimeout(tick,6000);}},{signal:this.controller.signal});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)this.pause();},{signal:this.controller.signal});
  const details=this.closest('details');details?.addEventListener('toggle',()=>{if(!details.open)this.pause();},{signal:this.controller.signal});
  this.paint();
 }
 disconnectedCallback(){clearTimeout(this.timer);this.controller?.abort();this.controller=null;}
});
