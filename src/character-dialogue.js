/** Keep one media element per open scene and only animate after it is actually audible. */
export function mountCharacterDialogue(dialog,{characters,initial=0,enabled,hold,reduced=()=>false}){
 const root=dialog.querySelector('.npc-dialogue-view');
 const tabs=root.querySelector('.npc-dialogue-tabs'),portrait=root.querySelector('.npc-dialogue-portrait');
 const speech=root.querySelector('[data-npc-speech]'),name=root.querySelector('[data-npc-name]'),topics=root.querySelector('.npc-dialogue-topics');
 const replay=root.querySelector('[data-npc-replay]'),status=root.querySelector('[data-npc-status]');
 const events=new AbortController(),opt={signal:events.signal};
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 let picked=initial,line=0,player,release;
 function updateMotion(){
  root.dataset.speaking=String(Boolean(player?.active)&&!motion.matches&&!reduced());
 }
 function stop(){
  const previous=player;player=undefined;
  if(previous){
   const a=previous.audio;
   a.onended=a.onerror=a.onplaying=a.onpause=a.onwaiting=null;
   a.pause();a.removeAttribute('src');a.load();
  }
  release?.();release=null;
  replay.textContent='다시 듣기';replay.setAttribute('aria-pressed','false');
  updateMotion();
 }
 function listen(){
  stop();status.textContent='';
  if(!enabled()||document.hidden){if(!document.hidden)status.textContent='소리를 켜면 들을 수 있어.';return;}
  let volume=.7;
  try{const saved=localStorage.getItem('npc-narration-volume');if(saved!==null&&Number.isFinite(Number(saved)))volume=Math.min(1,Math.max(0,Number(saved)));}catch{}
  if(!volume){status.textContent='음성 크기를 높이면 들을 수 있어.';return;}
  const src=characters[picked].lines[line].src;
  if(!src)return;
  const audio=new Audio(src),current={audio,active:false};
  player=current;release=hold();
  replay.textContent='음성 멈추기';replay.setAttribute('aria-pressed','true');audio.volume=volume;
  const state=value=>{if(player===current){current.active=value;updateMotion();}};
  const unavailable=()=>{if(player===current){stop();status.textContent='음성을 들을 수 없어. 대사를 읽고 계속할 수 있어.';}};
  audio.onplaying=()=>state(!document.hidden&&!audio.paused);
  audio.onwaiting=audio.onpause=()=>state(false);
  audio.onended=()=>{if(player===current)stop();};audio.onerror=unavailable;
  try{void audio.play().catch(unavailable);}catch{unavailable();}
 }
 function button(label,fn){
  const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',fn,opt);return b;
 }
 characters.forEach((c,i)=>{
  const b=button(c.name,()=>{if(picked===i)return;picked=i;line=0;draw();});
  b.dataset.npcCharacter=c.id;tabs.append(b);
 });
 tabs.hidden=characters.length<2;
 function draw(){
  stop();status.textContent='';
  const c=characters[picked],entry=c.lines[line];
  root.dataset.npcCast=c.id;
  portrait.style.setProperty('--npc-dialogue-art',`url("${c.image}")`);
  portrait.setAttribute('aria-label',c.name);
  name.textContent=c.name;
  speech.textContent=entry.text;
  [...tabs.children].forEach((b,i)=>b.setAttribute('aria-pressed',String(i===picked)));
  const hadTopicFocus=topics.contains(document.activeElement);
  topics.replaceChildren(...c.lines.map((entry,i)=>{
   const b=button(entry.label,()=>{if(line===i)return;line=i;draw();});
   b.dataset.npcTopic=String(i);b.setAttribute('aria-pressed',String(line===i));return b;
  }));
  topics.hidden=c.lines.length<2;
  if(hadTopicFocus&&!topics.hidden)topics.children[line]?.focus({preventScroll:true});
  listen();
 }
 replay.addEventListener('click',()=>player?stop():listen(),opt);
 const hidden=()=>{if(document.hidden)stop();};
 document.addEventListener('visibilitychange',hidden,opt);
 window.addEventListener('pagehide',stop,opt);
 motion.addEventListener('change',updateMotion,opt);
 const dispose=()=>{events.abort();stop();};
 dialog.addEventListener('close',dispose,{...opt,once:true});
 dialog.addEventListener('modal-dismiss',dispose,{...opt,once:true});
 draw();
 return dispose;
}
export const characterDialogueMarkup=`<section class="npc-dialogue-view" aria-label="캐릭터 대화"><div class="npc-dialogue-portrait" role="img"></div><div class="npc-dialogue-card"><h3 data-npc-name></h3><button type="button" class="npc-dialogue-close" data-action="close" aria-label="대화 닫기">×</button><p data-npc-speech aria-live="polite" aria-atomic="true"></p><div class="npc-dialogue-controls"><div class="npc-dialogue-tabs" role="group" aria-label="친구 고르기"></div><div class="npc-dialogue-topics" role="group" aria-label="이야기 주제"></div><button type="button" data-npc-replay aria-pressed="false">다시 듣기</button></div><p data-npc-status role="status"></p></div></section>`;
