import {isEffectsOn,duckMusic} from './audio.js';

// ElevenLabs voice lines (2026-11-18, docs/VOICE-FILL-20261118.json): exact on-screen text -> /assets/audio/<file>.mp3.
// Lipi = Aria, label thief = Harry - Character. Text that is not in this table simply stays silent.
export const VOICE_LINES={
 "잎을 살펴보고, 같은 특징끼리 모아 줘.":"lipi-0-goal",
 "겨울에 남은 부분과 다음 봄의 모습을 이어 줘.":"lipi-1-goal",
 "예상하고, 물속에서 눌러 보고, 비교해 봐.":"lipi-2-goal",
 "비를 내려 땅을 살펴보고, 식물을 알맞은 땅에 심어 줘.":"lipi-3-goal",
 "연잎 겉면과 덮개를 하나씩 달며 비를 내려 가방을 고쳐 줘.":"lipi-4-goal",
 "잎 이름표가 섞여서 온실 문이 열리지 않아!":"lipi-0-problem",
 "겨울 사진 뒤의 기록이 끊겼어. 봄은 어디로 갔을까?":"lipi-1-problem",
 "리피의 물길 기록이 비었어. 부레옥잠은 어떻게 떠 있을까?":"lipi-2-problem",
 "물가 식물과 마른 땅 식물의 자리가 뒤바뀌었어!":"lipi-3-problem",
 "비가 오면 리피의 공책이 젖어 버려!":"lipi-4-problem",
 "표본 온실에 불이 켜졌어!":"lipi-reward-0-title",
 "잎을 살피고 두 기준으로 나눈 기록을 남겼어.":"lipi-reward-0-why",
 "잎이 보이지 않는 겨울에도 식물은 살아 있을까?":"lipi-reward-0-next",
 "계절 꽃돔이 다시 피어났어!":"lipi-reward-1-title",
 "겨울과 다음 봄을 연결한 기록을 남겼어.":"lipi-reward-1-why",
 "물 위에 사는 식물에게는 어떤 비밀이 있을까?":"lipi-reward-1-next",
 "연못에 맑은 물이 돌아왔어!":"lipi-reward-2-title",
 "식물의 특징과 사는 곳을 연결한 기록을 남겼어.":"lipi-reward-2-why",
 "이제 식물마다 살기 좋은 자리를 만들어 줄까?":"lipi-reward-2-next",
 "네가 만든 정원이 생겼어!":"lipi-reward-3-title",
 "환경을 만들고 식물을 배치한 정원을 남겼어.":"lipi-reward-3-why",
 "정원 탐험에 쓸 가방도 식물에게 배워서 만들자!":"lipi-reward-3-next",
 "우리의 탐험 가방이 완성됐어!":"lipi-reward-4-title",
 "식물의 특징을 본뜬 가방과 비교 기록을 남겼어.":"lipi-reward-4-why",
 "네가 찾은 식물의 비밀로 초록정원을 깨우자!":"lipi-reward-4-next",
 "먼저 표본 온실 탐구를 마쳐 줘.":"lipi-locked-0",
 "먼저 계절 꽃돔 탐구를 마쳐 줘.":"lipi-locked-1",
 "먼저 물길 실험실 탐구를 마쳐 줘.":"lipi-locked-2",
 "먼저 나의 연구정원 탐구를 마쳐 줘.":"lipi-locked-3",
 "두 활동을 마치고 빛씨앗을 모으면 다음 장소가 열려!":"lipi-locked-rest",
 "잎을 살피고 식물을 나눴다. 겨울을 지나 다시 자란 식물도 만났다. 식물에게 맞는 정원도 꾸몄다. 연잎의 비밀로 가방까지 만들었다! 작은 발견이 멋진 발명이 되었다. 나는 초록정원의 식물 연구원!":"lipi-ending-diary",
 "잎 전체의 모양과 가장자리를 자세히 관찰해.":"lipi-concept-0-0",
 "은행나무 잎과 벚나무 잎은 모양과 가장자리가 달라.":"lipi-concept-0-1",
 "새로 만난 잎에도 같은 기준을 적용해 나누어 봐.":"lipi-concept-0-2",
 "겨울에 잎이 없어도 줄기와 겨울눈이 살아 있을 수 있어.":"lipi-concept-1-0",
 "살아 있던 줄기와 뿌리를 바탕으로 봄에 새잎과 꽃이 나와.":"lipi-concept-1-1",
 "씀바귀도 살아 있던 뿌리에서 다시 자라. 새싹이라고 모두 새로운 식물은 아니야.":"lipi-concept-1-2",
 "부레옥잠의 부푼 잎자루를 살펴봐.":"lipi-concept-2-0",
 "잎자루 안에는 공기 공간이 있어. 자른 단면에서 확인할 수 있어.":"lipi-concept-2-1",
 "잎자루 속 공기는 부레옥잠이 물에 뜨는 데 도움을 줘.":"lipi-concept-2-2",
 "부레옥잠은 물 위에 떠서 살아. 몸의 특징이 물가 생활에 도움이 돼.":"lipi-concept-3-0",
 "알로에는 두꺼운 잎에 물을 저장해. 물이 적을 때 도움이 돼.":"lipi-concept-3-1",
 "식물의 특징과 사는 곳의 물·땅 조건을 함께 생각해 봐.":"lipi-concept-3-2",
 "연잎 위에는 물방울이 둥글게 맺혀 굴러가. 그림은 표면을 확대한 모형이야.":"lipi-concept-4-0",
 "연잎을 본뜬 겉면은 물방울을 굴려 보내. 열린 입구까지 막아 주지는 않아.":"lipi-concept-4-1",
 "덮개로 입구를 막고 시험해. 겉면과 덮개는 서로 다른 일을 해.":"lipi-concept-4-2",
 "잎은 모양과 가장자리가 서로 달랐다. 같은 기준으로 모으면 식물을 나눌 수 있었다.":"lipi-note-0-found",
 "겨울에 잎이 없어도 살아 있는 줄기나 뿌리가 남았다. 봄이 되자 그곳에서 다시 자랐다.":"lipi-note-1-found",
 "공기 방울이 나왔다! 잎자루 속 공기는 부레옥잠이 물에 뜨는 데 도움을 준다.":"lipi-note-2-found",
 "부레옥잠은 물가에, 벚나무는 들판에, 알로에는 건조 구역에 어울렸다. 식물의 특징을 생각해서 자리를 골랐다.":"lipi-note-3-found",
 "연잎을 본뜬 겉면은 물방울을 굴려 보냈고, 덮개는 입구로 들어오는 비를 막았다. 두 부품이 하는 일이 달랐다.":"lipi-note-4-found",
 "생활 속에서는 어디에 쓸까?":"lipi-note-use",
 "처음 만난 잎을 같은 기준으로 나누어 보자.":"lipi-note-0-use",
 "학교 화단의 같은 자리를 겨울과 봄에 살펴보자.":"lipi-note-1-use",
 "식물마다 몸속에 무엇을 저장하는지 살펴보자.":"lipi-note-2-use",
 "식물을 기를 때 물과 땅의 조건을 살펴보자.":"lipi-note-3-use",
 "우산이나 신발에도 이 특징을 쓸 수 있을까?":"lipi-note-4-use",
 "잎맥에 가장자리까지 봤어? 뒤집은 표찰이 소용없잖아!":"thief-leaf-0",
 "다음엔 모든 표찰에 ‘수상한 잎’이라고 써야지!":"thief-leaf-1",
 "앗, 내 가짜 표찰이 돌아갔어!":"thief-leaf-2",
 "잎의 특징이 다 보이잖아!":"thief-leaf-3",
 "쳇, 표본 기록은 돌려줄게!":"thief-leaf-4",
 "겨울을 나는 방법을 알아냈어? 내 계절 뒤죽박죽 작전 실패야!":"thief-season-0",
 "다음 달력은 겨울만 열두 장이다!":"thief-season-1",
 "앗, 달력이 넘어갔어!":"thief-season-2",
 "내가 숨긴 계절 기록이 펼쳐져!":"thief-season-3",
 "흥, 겨울은 한 자리만 차지해도 돼!":"thief-season-4",
 "식물마다 사는 곳이 다르다고? 내 화분 바꿔치기 계획이 꼬였네!":"thief-tag-0",
 "연못 팻말을 사막에 꽂으면 아무도 모르겠지?":"thief-tag-1",
 "앗, 환경 팻말이 제자리로!":"thief-tag-2",
 "내가 섞은 화분이 다 들통났어!":"thief-tag-3",
 "쳇, 식물은 알맞은 곳에 돌려놓을게!":"thief-tag-4",
 "빛이랑 물까지 맞춰 정원을 만들었어? 나 몰래 정원사가 된 거야?":"thief-seedling-0",
 "악당 정원엔 내 이름표만 백 개 꽂을 테다!":"thief-seedling-1",
 "앗, 모종 상자가 열렸어!":"thief-seedling-2",
 "내가 가린 물길이 보이잖아!":"thief-seedling-3",
 "흥, 정원 설계도는 너희가 맡아!":"thief-seedling-4",
 "식물한테 배운 발명품을 시험까지 했어? 내 엉터리 부품이 들켰네!":"thief-bag-0",
 "다음엔 내 발명품도 시험 성적표를 속여야지!":"thief-bag-1",
 "앗, 시험 장치가 다시 돌아!":"thief-bag-2",
 "잘못 끼운 부품이 튀어나왔어!":"thief-bag-3",
 "쳇, 부품은 둘게. 난 새 장난을 연구하러 간다!":"thief-bag-4"
};
export const voiceSrc=text=>VOICE_LINES[String(text??'').trim()]?`/assets/audio/${VOICE_LINES[String(text).trim()]}.mp3`:null;
let player=null,release=null,dialogSig='',notify=null;
// Whose turn it is. A thief's short reaction never cuts another character's line (it is skipped), and a thief's line
// that has already started is not cut by a guide's line: the guide waits for it, GUIDE_WAIT at most.
// LINE_CAP: a line that stalls stops counting as "being said", so nothing waits on it for ever.
const GUIDE_WAIT=2000,LINE_CAP=6500;
let thief=false,thiefSince=0,turn=0,startTimer=0,waitTimer=0,host=null;
// True from the moment a thief's line is asked for (its short lead included) until it has been said.
export const villainLineOn=()=>thief&&(startTimer!==0||player!==null)&&Date.now()-thiefSince<LINE_CAP;
const volume=()=>{try{const saved=localStorage.getItem('npc-narration-volume');if(saved!==null&&Number.isFinite(Number(saved)))return Math.min(1,Math.max(0,Number(saved)));}catch{}return .7;};
// quiet: the line that is being said (or about to be) ends. A guide that is waiting for its turn keeps waiting.
// stopVoice: the popup closed, the tab was hidden or sound was turned off, so the waiting guide is dropped as well.
export function stopVoice(){clearTimeout(waitTimer);waitTimer=0;quiet();}
function quiet(){
 clearTimeout(startTimer);startTimer=0;thief=false;
 const current=player;player=null;
 if(current){current.onended=current.onerror=current.onplaying=current.onpause=current.onwaiting=null;current.pause();current.removeAttribute('src');current.load();}
 release?.();release=null;
 const told=notify;notify=null;told?.(-1,false);
}
// Plays the voiced lines among `texts` one after another; a new call (another popup or bubble) replaces the old one.
// onState(index,audible): which of `texts` is being read and whether sound is really coming out (the `playing` event,
// not buffering or paused). It ends with (-1,false). A speaking character moves its mouth from this.
// villain: a map thief's reaction (see the turn rules above). delay: ms before the line starts, so the strike or the
// place-opening cue that leads into it is heard first. Returns a probe: is this call's line still to come or being said?
export function speakTexts(texts,onState,{villain=false,delay=0}={}){
 const queue=texts.map((text,index)=>[voiceSrc(text),index]).filter(([src])=>src);
 // A popup's line that outlives its popup by a moment (the close event comes a task later) is over, not interrupted.
 if(villain&&player&&!thief){if(host&&!host.open)quiet();else return ()=>false;}
 if(!villain&&thief&&player){
  if(!queue.length)return ()=>false; // A popup without a voice leaves the thief to finish.
  const until=Date.now()+GUIDE_WAIT;clearTimeout(waitTimer);
  const again=()=>{waitTimer=0;if(thief&&player&&Date.now()<until){waitTimer=setTimeout(again,100);return;}quiet();speakTexts(texts,onState);};
  waitTimer=setTimeout(again,100);return ()=>false;
 }
 stopVoice();
 if(!queue.length||!isEffectsOn()||globalThis.document?.hidden||!volume()||typeof Audio==='undefined')return ()=>false;
 const mine=++turn;thief=villain;thiefSince=Date.now();
 release=duckMusic();notify=onState??null;
 const next=()=>{
  const item=queue.shift();if(!item){quiet();return;}
  const audio=player=new Audio(item[0]);audio.volume=volume();
  const state=audible=>{if(player===audio)notify?.(item[1],audible);};
  audio.onplaying=()=>state(!globalThis.document?.hidden&&!audio.paused);
  audio.onwaiting=audio.onpause=()=>state(false);
  audio.onended=()=>{if(player===audio)next();};audio.onerror=()=>{if(player===audio)quiet();};
  try{void audio.play()?.catch(()=>{if(player===audio)quiet();});}catch{quiet();}
 };
 if(delay>0)startTimer=setTimeout(()=>{startTimer=0;next();},delay);else next();
 return ()=>turn===mine&&(startTimer!==0||player!==null);
}
// Popups: the mission brief, reward, and locked-place dialogs read their lines when they open; closing stops the voice.
const DIALOG_LINES='#dialog-title, .lipi-letter p, .reward-why, .reward-next, .map-locked-message p';
// A re-render of the same open popup (e.g. picking a flower-path colour) does not start the lines again.
// While a line is audible the popup carries data-speaking="true" and that line data-voice-now, so a character drawn in
// the popup (the reward popup's Lipi) talks only with the real sound. The lines are looked up again on every change
// because a re-render replaces them.
export function speakDialog(dialog){
 const lines=()=>[...dialog.querySelectorAll(DIALOG_LINES)];
 const texts=lines().map(el=>el.textContent),key=texts.map(voiceSrc).filter(Boolean).join('|');
 if(key&&key===dialogSig)return;
 dialogSig=key;
 speakTexts(texts,(index,audible)=>{
  dialog.dataset.speaking=String(audible);
  lines().forEach((el,i)=>el.toggleAttribute('data-voice-now',i===index));
 });
}
export function installVoiceLines(dialog){
 host=dialog;
 // Closing a popup ends its own line and drops one that was still waiting. A thief's line on the map is not the popup's:
 // the close event arrives a task after the map is back, when the thief may already be about to speak.
 dialog.addEventListener('close',()=>{dialogSig='';clearTimeout(waitTimer);waitTimer=0;if(!thief)quiet();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopVoice();});
 window.addEventListener('pagehide',stopVoice);
 // Turning the effects (and voices) switch or the header speaker off stops the line that is being read.
 document.addEventListener('sound-effects-off',stopVoice);
 // 리피의 정리 (research notebook): opening the summary reads it; folding it stops the voice.
 document.addEventListener('toggle',e=>{
  const d=e.target;if(!(d instanceof HTMLDetailsElement)||!d.matches('.note-content-summary'))return;
  if(!d.open){stopVoice();return;}
  const [found,use]=d.querySelectorAll(':scope > p'),label=use?.querySelector('b')?.textContent??'';
  speakTexts([found?.textContent,label,use?.textContent.slice(use.textContent.indexOf(label)+label.length)]);
 },true);
}
export const speakEnding=root=>speakTexts([[...root.querySelectorAll('.ending-note p')].map(p=>p.textContent).join(' ')]);
