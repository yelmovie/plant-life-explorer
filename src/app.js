import {createSaveStore} from './safe-storage.js';
import {recordHint,recordResponse} from './learning-records.js';
import {carryFieldEvidence} from './field-bridge.js';
import {QUESTS} from './inquiry.js';
import {mountSpatialSafely} from './runtime-support.js';
import {ASSETS,THUMBS,assetImage,warmImage,warmMission,warmFile} from './asset-catalog.js';
const SEASON_MODELS=['season_cherry_bare','season_sowthistle_root','season_sowthistle_rosette','season_sowthistle_flowers'];
import {STORAGE_KEY,LEGACY_STORAGE_KEY,PLANTS,HABITAT_PLANTS,HABITATS,MISSIONS,PAGES,SEASONS,freshState,restoreState,evidenceCount,missionDone,openMission,pageReady,gardenValid,designKey,testDesign,testValid,canFinish,PAGE_ROUTES,routeIndex,previousRoute} from './model.js';
import {icon,leafArt,plantArt,seasonArt,bagArt,heroArt} from './art.js';
import {REWARDS,seedProgress,themePicker,worldMap,evidenceSummary,THEMES,stampBadges,stampBoard,nextMapMission,mapPrerequisite} from './rewards.js';
import {mountStageMap} from './stage-map.js';
import {fieldMissionAction,mountFieldInteractions} from './field-missions.js';
import {fieldMissionReady} from './field-missions-state.js';
import {EXPEDITIONS,TOOL_ASSISTS,earnedTools,renderToolPack,renderMissionBrief,renderLoot,toolPicture} from './expedition.js';
import {renderActivity,renderReport,renderFinal,renderEnding,learningAction,nextHint} from './learning.js';
import {playClick,playReward,isSoundOn,setSound,soundStored,hasMusic,isMusicOn,setMusic,isEffectsOn,setEffects,getMusicVolume,setMusicVolume,playMusic,unlockMusic} from './audio.js';
import {TEXT,appInfoSection,studentSection,teacherSection,noticeSection} from './settings-content.js';
import {playStory} from './story.js';
import {installCardDrag,celebrateCard} from './card-drag.js';
import {notebookEntry,NOTE_QUIZZES} from './research-notebook.js';

const app=document.querySelector('#app'),dialog=document.querySelector('#dialog');
let state=freshState(),saveFailed=false,studentState=null,studentMapDistance,mapController,fieldCleanup;
const saveStore=createSaveStore({getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value)},navigator.locks,updateSaveStatus);
state=saveStore.load();
window.addEventListener('storage',event=>saveStore.changed(event.key));
if(state.screen==='activity'&&!missionDone(state,Math.floor(state.page/2)))state.journeyRequired[Math.floor(state.page/2)]=true;
if(!soundStored()&&state.soundEnabled===false)setSound(false);
let ui={plant:'cherry',zoom:1,rotation:0,selected:'cherry',map:Math.min(4,evidenceCount(state)),brush:'water',undo:[],finalTab:0,testing:false,paused:false,region:'shape',bubbling:false};
let spatialModule,spatialEpoch=0,lastScreen,spatialFailureShown=false;
let toastTimer,paintActive=false,paintLast=-1,testRun=0;
const $=(s)=>document.querySelector(s);
const btn=(label,action,cls='',attrs='')=>`<button class="btn ${cls}" data-action="${action}" ${attrs}>${label}</button>`;
const pill=(text)=>`<span class="pill">${text}</span>`;
const npcName={leaf:'리피',water:'방울',flower:'꽃이'};
const mascot=(who='leaf',large=false)=>`<div class="mascot-wrap ${large?'large':''}">${assetImage('mascot_'+who,'mascot-image',large)}</div>`;
const logo=(cls='')=>`<div class="brand-image ${cls}"><img src="/assets/title.webp" alt="초록정원 연구기지"></div>`;
function updateSaveStatus(status){
 saveFailed=status!=='ready';
 let banner=document.getElementById('save-status');
 if(!saveFailed){banner?.remove();document.body.classList.remove('save-warning');return;}
 if(!banner){banner=document.createElement('aside');banner.id='save-status';banner.className='save-status';banner.setAttribute('role','status');app.before(banner);}
 const messages={invalid:'저장 기록을 읽지 못했어. 원본을 그대로 보존하고 자동 저장을 멈췄어.',conflict:'다른 탭에서 기록이 바뀌었어. 오래된 내용으로 덮어쓰지 않도록 저장을 멈췄어.',failed:'아직 저장되지 않았어. 이 화면을 닫기 전에 기록을 보관하거나 다시 저장해 줘.',unavailable:'저장소에 접근할 수 없어. 현재 기록을 파일로 보관해 줘.',unsupported:'이 브라우저에서 안전한 저장 잠금을 사용할 수 없어. 기록을 파일로 보관해 줘.'};
 banner.innerHTML=`<span>${messages[status]||messages.failed}</span><button class="btn soft" data-action="save-help">기록 보관·복구</button>`;
 document.body.classList.add('save-warning');
}
function save(){if(state.finished&&!state.legacyFinished&&!canFinish(state))state.finished=false;if(studentState!==null)return Promise.resolve(true);return saveStore.save(state);}
function downloadRecord(raw,name){const url=URL.createObjectURL(new Blob([raw],{type:'application/json;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function saveHelp(){modal('기록 보관과 복구',`<p>이 브라우저·주소의 기록이야. 원본 보관 파일은 읽지 못한 내용도 그대로 담으며, 파일 보관만으로 복구가 된 것은 아니야.</p><p>현재 활동 파일은 보관용이야. 앱에서 파일 가져오기는 제공하지 않아. 다른 탭의 최신 기록을 열면 이 탭에서 저장하지 못한 선택은 사라져. 먼저 파일로 보관해 줘.</p>`,btn('현재 활동 파일 보관','save-export','soft')+(saveStore.original!==null?btn('저장 원본 파일 보관','save-original','soft'):'')+(saveStore.status==='failed'?btn('다시 저장하기','save-retry','primary'):'')+(['invalid','failed'].includes(saveStore.status)&&saveStore.backup()?btn('마지막 정상 기록으로 복구','save-recover','soft'):'')+btn('저장된 최신 기록 열기','save-reload','soft')+btn('계속 살펴보기','close','soft'));}
function toast(message){if(state.screen==='activity'){const target=app.querySelector('.activity-feedback')||app.querySelector('.guide-bubble');if(target)target.textContent=message;$('#announcer').textContent=message;return;}clearTimeout(toastTimer);$('.toast')?.remove();const el=document.createElement('div');el.className='toast';el.setAttribute('aria-hidden','true');el.textContent=message;document.body.append(el);$('#announcer').textContent=message;toastTimer=setTimeout(()=>el.remove(),2400);}
function modal(title,body,buttons='',cls=''){mapController?.stop();if(!body.includes('reward-scene'))dialog.classList.remove('reward-dialog');dialog.classList.toggle('settings-dialog',cls==='settings');dialog.classList.toggle('tool-dialog',cls==='tools');dialog.classList.toggle('notebook-dialog',cls==='notebook');dialog.innerHTML=`<div class="dialog-top"><span class="eyebrow">초록정원 연구기지</span>${btn(icon('close'),'close','icon-btn','aria-label="닫기"')}</div><h2 id="dialog-title">${title}</h2>${body}<div class="dialog-actions">${buttons||btn('알겠어','close','primary')}</div>`;dialog.setAttribute('aria-labelledby','dialog-title');if(!dialog.open)dialog.showModal();}
function cancelTest(){testRun++;ui.testing=false;ui.paused=false;ui.bubbling=false;ui.replaying=false;}
function nav(screen){cancelTest();state.screen=screen;save();render();window.scrollTo(0,0);if(screen==='ending')showStory('outro');}
function startPage(p){cancelTest();const mission=Math.floor(p/2);if(!missionDone(state,mission))state.journeyRequired[mission]=true;if(Math.floor(state.page/2)!==mission)ui.fieldMission=undefined;ui.activityFeedback='';ui.activityMode=!missionDone(state,mission)&&state.journeyRequired[mission]&&!fieldMissionReady(state,mission)?'field':'explore';if(ui.activityMode==='explore'&&fieldMissionReady(state,mission))carryFieldEvidence(state,mission);state.page=p;state.screen='activity';ui.selected=p===5||p===7?'hyacinth':'cherry';ui.plant='cherry';ui.region='shape';ui.zoom=1;ui.rotation=0;ui.undo=[];ui.gardenMode=p===7||state.gardenReviewed?'plant':'terrain';save();render();window.scrollTo(0,0);}
function header(){return `<header class="topbar"><nav class="page-navigation" aria-label="페이지 이동" ${state.screen==='home'?'hidden':''}>${btn(icon('home'),'home','icon-btn','aria-label="홈으로 가기" title="홈으로 가기"')}${btn(icon('back'),'back','icon-btn','aria-label="이전 페이지로 가기" title="이전 페이지로 가기"')}</nav><nav class="header-tools" aria-label="공통 메뉴">${btn(icon(isSoundOn()?'sound':'muted'),'sound','icon-btn',`aria-label="${isSoundOn()?'소리 끄기':'소리 켜기'}" aria-pressed="${isSoundOn()}" title="${isSoundOn()?'소리 끄기':'소리 켜기'}"`)}${btn(icon('gear'),'settings','icon-btn','aria-label="설정" title="설정"')}</nav></header>`;}
function openRoute(route){if(!route)return;if(route.screen==='activity')startPage(route.page);else nav(route.screen);}
function progress(){return `<div class="progress-track">${MISSIONS.map((m,i)=>`<button data-action="select-mission" data-id="${i}" ${openMission(state,i)?'':'disabled'} class="progress-stop ${missionDone(state,i)?'done':''} ${Math.floor(state.page/2)===i&&state.screen==='activity'?'current':''}"><span>${missionDone(state,i)?icon('check',16):String(i+1).padStart(2,'0')}</span>${m.short}</button>`).join('')}</div>`;}
function home(){const hasProgress=state.completed.some(Boolean)||Object.values(state.observation).some(a=>a.length);return `<main class="home"><section class="home-scene">${heroArt()}<div class="home-copy"><span class="home-kicker">리피와 함께 떠나는 식물 탐험</span>${logo('hero-logo')}<p class="home-story">작은 잎에 숨은 비밀을 찾아<br><strong>잠든 초록정원을 깨워 줘!</strong></p><div class="home-actions">${btn((hasProgress?'탐험 이어하기':'리피와 탐험 시작')+icon('arrow'),'begin','primary jumbo')}<span>네가 찾은 발견이 정원의 빛씨앗이 돼.</span></div></div><div class="hero-friends"><span class="home-invite">나와 함께 찾아볼래?</span>${mascot('leaf',true)}</div>${saveFailed?'<span class="home-save-note">기록을 저장할 수 없어</span>':''}</section></main>`;}

function mapPage(){
 const next=nextMapMission(state),current=next<0?Math.min(ui.map,MISSIONS.length-1):next;
 const restored=ui.rewardFocus;ui.rewardFocus=undefined;
 return `<main class="expedition-map stage-map"><div class="stage-map-viewport" tabindex="0" role="region" aria-label="탐험 지도. 길을 누르거나 방향키로 이동하고 Enter로 탐구하기.">${worldMap(state,current,restored)}</div>${state.adminUnlocked?`<div class="map-preview-note" role="status">교사용 미리보기 · 학생 기록에 반영되지 않아요${btn('미리보기 종료','admin-unlock','soft')}</div>`:''}<div class="map-bottom"><div class="map-navigation"><div class="map-dpad" role="group" aria-label="길 따라 이동">${[['up','위로','↑'],['left','왼쪽으로','←'],['down','아래로','↓'],['right','오른쪽으로','→']].map(([direction,label,arrow])=>`<button class="map-direction ${direction}" data-map-direction="${direction}" aria-label="${label} 이동">${arrow}</button>`).join('')}</div><div class="map-navigation-copy"><strong>리피와 함께 탐험해 봐!</strong><span>길 누르기 · 방향키 / WASD</span>${btn('지도 한눈에 보기','map-overview','quiet','aria-pressed="false"')}</div></div><section class="map-next-card" aria-label="다음 탐구"><div><span class="map-eyebrow">${next<0?'다섯 곳의 탐구 완료':`다음 목적지 · 탐구 ${String(next+1).padStart(2,'0')}`}</span><h2>${next<0?'정원을 깨울 준비가 됐어!':REWARDS[next].name}</h2><p>${next<0?'모은 발견을 연구 노트에 담아 보자.':MISSIONS[next].desc}</p></div>${next<0?btn('연구노트 펼치기'+icon('arrow'),'report','primary'):btn(`${REWARDS[next].name}로 가기`+icon('arrow'),'map-select','primary',`data-id="${next}"`)}<div class="map-extras">${missionDone(state,1)?btn('꽃길 꾸미기','map-theme','quiet'):''}${missionDone(state,3)?btn('내 정원','map-garden','quiet'):''}${state.finished||state.legacyFinished?btn('완성한 정원','view-ending','quiet'):''}</div></section></div><p class="map-walk-status sr-only" role="status" aria-live="polite"></p></main>`;
}
function explainLockedMission(i){const prerequisite=mapPrerequisite(state,i),r=REWARDS[prerequisite];if(!r)return;modal('아직 잠든 곳이야 · '+REWARDS[i].name,`<div class="map-locked-message">${mascot('leaf')}<div><p>먼저 <strong>${r.name}</strong> 탐구를 마쳐 줘.</p><p>두 활동을 마치고 빛씨앗을 모으면 다음 장소가 열려!</p></div></div>`,btn(`${r.name}로 가기`+icon('arrow'),'map-locked-next','primary',`data-id="${prerequisite}"`)+btn('지도로 돌아가기','close','soft'));}
function missionCard(){const i=ui.map,r=REWARDS[i],done=missionDone(state,i);warmMission(i);if(i===1)SEASON_MODELS.forEach(k=>warmFile(`/assets/models/${k}.glb`));modal(r.name,renderMissionBrief(state,i),btn((done?'다시 탐험하기':'리피와 탐구 시작')+icon('arrow'),'enter-mission','primary')+(done?btn('내 보상 보기','reward-detail','soft',`data-id="${i}"`):''));}
function notebook(title,body){return `<aside class="notebook"><div class="notebook-heading">${icon('book',22)}<h3>${title}</h3></div>${body}</aside>`;}
function checkRow(ok,text){return `<div class="check-row ${ok?'checked':''}"><span>${ok?icon('check',16):'·'}</span>${text}</div>`;}
function choice(label,action,id,selected=false,extra=''){return btn(label,action,`choice ${selected?'selected':''}`,`data-id="${id}" aria-pressed="${selected}" ${extra}`);}
function gardenGrid(readonly=false){return `<div class="garden-grid ${readonly?'readonly':''}" aria-label="6열 4행 정원">${state.terrain.map((t,i)=>{const plant=HABITAT_PLANTS.find(p=>state.garden[p.id]===i);const label=`${Math.floor(i/6)+1}행 ${i%6+1}열 ${HABITATS[t]||'빈 땅'}${plant?' '+plant.name:''}`;return readonly?`<div class="garden-cell ${t} ${plant?'planted':''}" role="img" aria-label="${label}">${plant?plantArt(plant.id):'<span></span>'}</div>`:`<button class="garden-cell ${t} ${plant?'planted':''}" data-action="garden-cell" data-id="${i}" data-drop="garden" aria-label="${label}" title="${label}">${plant?plantArt(plant.id):'<span></span>'}</button>`;}).join('')}</div>`;}
function activity(){return renderActivity(state,ui,gardenGrid);}
function report(){return renderReport(state,ui);}
function finalPage(){return renderFinal(state,gardenGrid,ui);}
function ending(){return renderEnding(state,gardenGrid);}
function showSpatialFallback(host){
 spatialModule?.unmountSpatial();
 host.querySelectorAll('.spatial-layer,.spatial-controls').forEach(node=>node.remove());
 host.classList.remove('spatial-ready');host.classList.add('spatial-flat');
 host.dataset.spatialUnavailable='true';
 const controls=document.createElement('div');controls.className='spatial-controls';
 controls.innerHTML='<button type="button" data-action="spatial-retry" data-view="flat" title="그림으로 탐구를 이어가거나 입체 자료를 다시 불러올 수 있어.">입체 재시도</button>';
 host.append(controls);
 if(!spatialFailureShown){spatialFailureShown=true;toast('입체 자료를 불러오지 못했어. 그림으로 같은 탐구를 이어갈 수 있어.');}
}
function render(){playMusic(state.screen==='ending'?'ending':'main');const previousGarden=app.querySelector('[data-spatial="garden"].spatial-ready');fieldCleanup?.();fieldCleanup=null;mapController?.destroy();mapController=null;if(!previousGarden)spatialModule?.unmountSpatial();const epoch=++spatialEpoch;document.body.dataset.screen=state.screen;document.body.classList.toggle('activity-open',state.screen==='activity');const focus=document.activeElement;const focusId=focus?.id;const focusAction=focus?.dataset?.action,focusData=focus?.dataset?.id;document.body.classList.toggle('large-text',state.largeText);app.innerHTML=header()+({home,map:mapPage,activity,report,final:finalPage,ending}[state.screen]||home)();if(state.screen!==lastScreen){lastScreen=state.screen;const main=app.querySelector('main');if(main){main.classList.add('screen-enter');main.addEventListener('animationend',e=>{if(e.target===main)main.classList.remove('screen-enter');});}}bindPinch();const fieldHost=app.querySelector('.field-mission');if(fieldHost)fieldCleanup=mountFieldInteractions(fieldHost,state,ui,action);if(state.screen==='map'){mapController=mountStageMap(app.querySelector('.stage-map'),ui,i=>action('map-arrive',String(i)));warmMission(Math.max(0,nextMapMission(state)));}if(state.screen==='home')warmImage('/assets/videos/intro-poster.webp');const host=app.querySelector('[data-spatial]');const reused=previousGarden&&host?.dataset.spatial==='garden'&&spatialModule?.reuseGarden(host,state,ui);if(previousGarden&&!reused)spatialModule?.unmountSpatial();if(host&&!reused)mountSpatialSafely(()=>import('./spatial.js'),()=>epoch===spatialEpoch&&host.isConnected,module=>{spatialModule=module;module.mountSpatial(host,state,ui,action,cells=>{ui.undo.push({terrain:[...state.terrain],garden:{...state.garden},reasons:[...state.gardenReasons]});for(const i of cells)paintCell(i,false);render();});if(host.dataset.spatialUnavailable==='true'&&!host.classList.contains('spatial-ready'))throw new Error('Spatial renderer unavailable');},()=>showSpatialFallback(host));const target=focusId?document.getElementById(focusId):focusAction?app.querySelector(`[data-action="${CSS.escape(focusAction)}"]${focusData!==undefined?`[data-id="${CSS.escape(focusData)}"]`:''}`):null;target?.focus({preventScroll:true});}

function journal(){modal('나의 연구 노트',`${seedProgress(state)}${stampBoard(state)}<p>완료 수는 활동의 진행 기록이야. 이해한 내용은 처음 선택과 관찰 근거를 함께 보며 확인해.</p><div class="journal-list">${MISSIONS.map((m,i)=>`<section><h3>${m.evidence}</h3>${btn('선택·관찰 기록 펼치기','note-open','soft',`data-id="${i}"`)}</section>`).join('')}</div>`);}

function teacherTools(){
 return `${btn(icon(state.adminUnlocked?'check':'lock')+(state.adminUnlocked?TEXT.unlockOn:TEXT.unlock),'admin-unlock',`soft wide ${state.adminUnlocked?'selected':''}`,`aria-pressed="${state.adminUnlocked}"`)}${btn(icon('download')+' '+(offlinePrep.done?TEXT.offlinePrepDone:TEXT.offlinePrep),'offline-prep',`soft wide ${offlinePrep.done?'selected':''}`,'id="offline-prep"')}<p class="microcopy" id="offline-prep-status" role="status">${offlinePrep.status}</p>`;
}
// Teacher-run, one file at a time so a class sharing Wi-Fi is not flooded. Videos stay network-only (range requests).
const offlinePrep={running:false,done:false,status:''};
const OFFLINE_FILES=()=>[...Object.keys(ASSETS).map(k=>`/assets/generated/${k}.webp`),...THUMBS.map(k=>`/assets/generated/${k}_thumb.webp`),'/assets/title.webp','/assets/videos/intro-poster.webp','/assets/videos/outro-poster.webp',...['petiole_cut','petiole_whole','plant_aloe',...SEASON_MODELS].map(k=>`/assets/models/${k}.glb`),'/src/vendor/three/three.module.min.js','/src/vendor/three/three.core.min.js','/src/vendor/three/addons/loaders/GLTFLoader.js','/src/vendor/three/addons/utils/BufferGeometryUtils.js'];
async function prepareOffline(){
 if(offlinePrep.running)return;
 const show=text=>{offlinePrep.status=text;const el=document.getElementById('offline-prep-status');if(el)el.textContent=text;};
 const name=self.caches&&navigator.serviceWorker?.controller?(await caches.keys()).find(k=>k.startsWith('green-garden-')):null;
 if(!name){show(TEXT.offlinePrepUnavailable);return;}
 offlinePrep.running=true;const cache=await caches.open(name),files=OFFLINE_FILES();let failed=0;
 for(const [n,url] of files.entries()){
  show(`${n+1} / ${files.length} 저장 중…`);
  if(await cache.match(url))continue;
  try{const response=await fetch(url);if(response.ok)await cache.put(url,response);else failed++;}catch{failed++;}
 }
 offlinePrep.running=false;offlinePrep.done=!failed;show(failed?TEXT.offlinePrepFailed:`${TEXT.offlinePrepDone} · ${files.length}개 파일`);
 const button=document.getElementById('offline-prep');if(button&&!failed){button.classList.add('selected');button.lastChild.textContent=' '+TEXT.offlinePrepDone;}
}
function settings(){
 const keep=dialog.open&&dialog.classList.contains('settings-dialog'),open=keep?[...dialog.querySelectorAll('details[open]')].map(d=>d.dataset.key):[],scroll=keep?dialog.querySelector('.settings-body')?.scrollTop:0;
 const done=state.finished||state.legacyFinished,sound=isEffectsOn(),music=hasMusic()&&isMusicOn();
 const body=`<div class="settings-body"><section class="settings-sound">${btn(`<span>${TEXT.music}</span><span class="switch-state">${music?TEXT.on:TEXT.off}</span>`,'music-toggle',`soft wide setting-switch ${music?'selected':''}`,`role="switch" aria-checked="${music}" ${hasMusic()?'':'disabled'}`)}${btn(`<span>${TEXT.sfx}</span><span class="switch-state">${sound?TEXT.on:TEXT.off}</span>`,'sfx-toggle',`soft wide setting-switch ${sound?'selected':''}`,`role="switch" aria-checked="${sound}"`)}<label class="settings-volume" for="music-volume"><span>${TEXT.musicVolume}</span><output id="music-volume-value">${getMusicVolume()}%</output><input id="music-volume" type="range" min="0" max="100" step="5" value="${getMusicVolume()}" ${music?'':'disabled'}></label>${!hasMusic()?`<p class="microcopy">${TEXT.musicAbsent}</p>`:''}</section><section class="settings-story">${btn(TEXT.intro,'intro-replay','soft wide')}${done?btn(TEXT.ending,'view-ending','soft wide'):btn(icon('lock',18)+' '+TEXT.ending,'view-ending','soft wide',`aria-disabled="true" data-reason="${TEXT.endingLocked}"`)}</section>${saveFailed?`<p class="settings-warning">${TEXT.saveFailed}</p>`:''}${appInfoSection(`<div class="settings-tools">${btn(icon('flag')+' '+TEXT.map,'settings-map','soft')}${btn(icon('book')+' '+TEXT.journal,'settings-journal','soft')}${state.screen==='activity'?btn(TEXT.activityNotes,'settings-notes','soft')+btn(TEXT.activityHelp,'settings-help','soft'):''}${btn((state.largeText?icon('check',18)+' ':'')+TEXT.largeText,'large-text',`soft ${state.largeText?'selected':''}`,`aria-pressed="${state.largeText}"`)}${btn(icon('expand')+' '+TEXT.fullscreen,'fullscreen','soft')}</div>`)}${studentSection()}${teacherSection(teacherTools())}${noticeSection()}</div>`;
 modal(TEXT.title,body,btn(TEXT.reset,'reset-prompt','soft text-danger')+btn(TEXT.close,'close','primary'),'settings');
 for(const key of open)dialog.querySelector(`details[data-key="${key}"]`)?.setAttribute('open','');
 const pane=dialog.querySelector('.settings-body');if(pane&&scroll)pane.scrollTop=scroll;
}
function showStory(kind,replay=false){cancelTest();mapController?.stop();spatialModule?.unmountSpatial();playStory(kind,{replay,onFinish:()=>{if(kind==='intro'&&!replay)nav('map');else{render();if(replay)settings();}}});}
function intro(replay=false){showStory('intro',replay);}
function showReward(i,first=false){
 if(first)playReward();
 ui.rewardFocus=i;const r=REWARDS[i];dialog.classList.add('reward-dialog');
 modal(first?r.title:'내가 깨운 '+r.name,`<div class="reward-scene">${assetImage(r.asset,'reward-building',true)}${assetImage('stamp_complete','reward-complete-stamp'+(first?' stamp-in':''),true)}<span class="reward-seed">${icon('leaf',22)} ${first?'빛씨앗 +1':'획득한 빛씨앗'}</span></div><p class="reward-why">${r.why}</p><p class="reward-proof">${evidenceSummary(state,i)}</p>${QUESTS[i].life?`<p class="reward-life">${icon('leaf',16)} ${QUESTS[i].life}</p>`:''}${renderLoot(state,i)}<div class="reward-stamps">${stampBadges(state,i)}</div>${seedProgress(state)}${i===1?themePicker(state):''}${i===3?`<details class="reward-own-garden"><summary>내가 심은 정원 보기</summary>${gardenGrid(true)}</details>`:''}<p class="reward-next">${EXPEDITIONS[i].next}</p>`,btn('지도에서 확인하기','reward-map','primary')+btn(i===4?'최종 연구 보고':'다음 탐구',i===4?'report':'next-mission','soft',`data-id="${i}"`));
}
function complete(){
 const p=state.page;
 if(!pageReady(state,p)){toast(nextHint(state,p));return;}
 if(p%2&&!state.completed[p-1]){toast('앞 활동의 연구 기록을 먼저 마쳐 줘.');return;}
 const i=Math.floor(p/2),first=!missionDone(state,i);state.completed[p]=true;save();
 if(p%2){render();showReward(i,first);}else startPage(p+1);
}
function paintCell(i,first=true){if(state.terrain[i]===ui.brush)return;if(first)ui.undo.push({terrain:[...state.terrain],garden:{...state.garden},reasons:[...state.gardenReasons]});if(ui.undo.length>30)ui.undo.shift();state.terrain[i]=ui.brush;Object.entries(state.garden).forEach(([id,cell])=>{if(cell===i){delete state.garden[id];state.gardenReasons=state.gardenReasons.filter(x=>x!==id);}});state.finalChecks.garden=false;save();}
function onCell(i){if(state.page===6&&ui.gardenMode!=='plant'){paintCell(i);render();return;}const id=ui.selected;if(!HABITAT_PLANTS.some(p=>p.id===id))return;const occupant=Object.keys(state.garden).find(k=>state.garden[k]===i&&k!==id);if(occupant){toast('이 칸에는 다른 식물이 있어. 빈 칸을 골라 줘.');return;}if(state.terrain[i]==='empty'){toast('빈 땅이야. 먼저 지형을 만들어 줘.');return;}recordResponse(state,3,'core:plant:'+id,HABITATS[state.terrain[i]],state.terrain[i]===HABITAT_PLANTS.find(p=>p.id===id).habitat,HABITAT_PLANTS.find(p=>p.id===id).name+'을 심을 자리','application');state.garden[id]=i;state.gardenReasons=state.gardenReasons.filter(k=>k!==id);state.finalChecks.garden=false;save();render();const p=HABITAT_PLANTS.find(p=>p.id===id);if(state.terrain[i]!==p.habitat)toast(`${p.name}의 관찰 기록을 확인해 봐. 이곳의 환경과 연결될까?`);}

async function action(a,id,el){
 if(a.startsWith('field-')){const fieldResult=fieldMissionAction(state,ui,a,id);if(fieldResult!==false){save();render();if(fieldResult)toast(fieldResult);return;}}
 const result=learningAction(state,ui,a,id);
 if(result!==false){save();render();if(a==='assign-group'||a==='unassign-group')celebrateCard(a==='assign-group'?ui.selected:id);if(result)toast(result);return;}
 switch(a){
 case 'press-petiole':{if(state.experiment.step<3)return;state.experiment.step=Math.max(4,state.experiment.step);ui.bubbling=true;save();render();const run=testRun;setTimeout(()=>{if(run===testRun&&state.screen==='activity'&&state.page===4){ui.bubbling=false;render();}},1700);return;}
 case 'pause-test':ui.paused=!ui.paused;render();return;
 case 'replay-test':ui.replaying=!ui.replaying;render();return;
 case 'close':dialog.close();return;
 case 'activity-notes':modal('이번 활동의 기록',$('.learning-note').innerHTML);return;
 case 'journey-mode':{const m=Math.floor(state.page/2);if(id==='explore'&&!missionDone(state,m)&&state.journeyRequired[m]&&!fieldMissionReady(state,m)){toast('현장 임무의 세 단서를 마치면 다음으로 갈 수 있어.');return;}ui.activityMode=id==='field'?'field':'explore';ui.activityFeedback='';if(id==='explore')carryFieldEvidence(state,m);save();render();return;}
 case 'journey-help':{recordHint(state,Math.floor(state.page/2));save();const plan=EXPEDITIONS[Math.floor(state.page/2)];modal('리피의 탐구 힌트',`<p>${plan.goal}</p><ul>${plan.hints.map(h=>`<li>${h}</li>`).join('')}</ul>`);return;}
 case 'tool-pack':modal('우리의 탐험 도구',renderToolPack(state),'','tools');return;
 case 'expedition-use':{const i=Number(id);recordHint(state,Math.floor(state.page/2));save();if(!Number.isInteger(i)||!missionDone(state,i))return;const plan=EXPEDITIONS[i];modal(plan.tool+'의 단서',`<div class="expedition-loot"><div class="loot-tool">${toolPicture(plan)}</div><div><p>${TOOL_ASSISTS[i]}</p></div></div>`,btn('이 단서로 탐구할게','close','primary'));return;}
 case 'journey-reward':if(missionDone(state,Math.floor(state.page/2)))showReward(Math.floor(state.page/2));return;
 case 'activity-help':recordHint(state,Math.floor(state.page/2));save();modal(PAGES[state.page][0],`<p>${PAGES[state.page][1]}</p><p>${nextHint(state,state.page)}</p>`);return;
 case 'map-theme':modal('꽃길 꾸미기',themePicker(state));return;
 case 'map-garden':modal('내가 심은 정원',gardenGrid(true));return;
 case 'report-tab':ui.reportTab=id;render();return;
 case 'note-open':{const i=Math.max(0,Math.min(4,Number(id)||0));ui.notePage=i;const note=notebookEntry(state,i);modal(note.title,note.body,btn('← 앞 기록','note-open','soft',`data-id="${(i+4)%5}"`)+btn('다음 기록 →','note-open','soft',`data-id="${(i+1)%5}"`)+btn('노트 덮기','close','primary'),'notebook');return;}
 case 'note-check':{const [i,answer]=id.split(':').map(Number),question=NOTE_QUIZZES[i];if(!question||![0,1].includes(answer))return;const note=state.notebook[i];note.firstAnswer??=answer;note.answer=answer;note.attempts++;save();await action('note-open',String(i));return;}
 case 'note-sticker':{const i=ui.notePage??0;state.notebook[i].read=!state.notebook[i].read;save();await action('note-open',String(i));return;}
 case 'save-help':saveHelp();return;
 case 'save-export':downloadRecord(JSON.stringify(studentState??state,null,2),'초록정원-현재활동-보관.json');return;
 case 'save-original':if(saveStore.original!==null)downloadRecord(saveStore.original,'초록정원-저장원본-보관.json');return;
 case 'save-retry':await save();if(saveFailed)saveHelp();else{dialog.close();render();}return;
 case 'save-recover':{if(studentState!==null)return;const restored=await saveStore.recover();if(restored){cancelTest();state=restored;dialog.close();render();}else saveHelp();return;}
 case 'save-reload':location.reload();return;
 case 'asset-view':if(ASSETS[id])modal(ASSETS[id][0],`<div class="asset-detail">${assetImage(id,'',true)}</div><p>${ASSETS[id][1]}</p><p class="microcopy">특징을 이해하기 쉽게 나타낸 관찰 그림이야.</p>`);return;
 case 'lotus-observe':modal('연잎에서 찾은 아이디어',`<div class="lotus-detail"><figure>${assetImage('lotus_leaf_whole','',true)}<figcaption>넓고 둥근 연잎</figcaption></figure><figure>${assetImage('lotus_surface_diagram','',true)}<figcaption>표면을 크게 나타낸 모형</figcaption></figure></div><p>연잎 위의 물방울은 둥글게 맺혀 굴러가. 이 특징을 가방 겉면에 적용하면 어떨까?</p><p class="inline-tip">겉면과 입구는 다른 부분이야. 비가 들어오는 입구도 함께 살펴봐.</p>`);return;
 case 'view-ending':if(state.finished||state.legacyFinished){if(dialog.open)dialog.close();nav('ending');}return;
 case 'home':nav('home');return;
 case 'back':if(state.screen!=='home')openRoute(previousRoute(state));return;
 case 'sound':setSound(!isSoundOn());playClick();render();return;
 case 'music-toggle':if(hasMusic())setMusic(!isMusicOn());render();settings();return;
 case 'settings-map':dialog.close();nav('map');return;
 case 'settings-journal':journal();return;
 case 'settings-notes':modal('이번 활동의 기록',$('.learning-note')?.innerHTML||'<p>기록할 내용을 살펴보고 있어.</p>');return;
 case 'settings-help':recordHint(state,Math.floor(state.page/2));save();modal(PAGES[state.page][0],`<p>${PAGES[state.page][1]}</p><p>${nextHint(state,state.page)}</p>`);return;
 case 'sfx-toggle':setEffects(!isEffectsOn());playClick();render();settings();return;
 case 'intro-replay':intro(true);return;
 case 'outro-replay':showStory('outro');return;
 case 'admin-unlock':state.adminUnlocked=!state.adminUnlocked;if(state.adminUnlocked){studentState=structuredClone({...state,adminUnlocked:false});studentMapDistance=ui.mapDistance;}else if(studentState!==null){state=restoreState(JSON.stringify(studentState));studentState=null;ui.mapDistance=studentMapDistance;}save();render();if(dialog.open)settings();toast(state.adminUnlocked?'교사용 미리보기 · 학생 기록에 반영되지 않아요.':'학생의 원래 진행으로 돌아왔어요.');return;
 case 'offline-prep':prepareOffline();return;
 case 'admin-next':if(state.adminUnlocked)openRoute(PAGE_ROUTES[routeIndex(state)+1]);return;
 case 'map':ui.map=Math.min(4,Math.floor(state.page/2));nav('map');return;
 case 'begin':if(state.completed.some(Boolean)||Object.values(state.observation).some(a=>a.length)){nav('map');return;}intro();return;
 case 'intro-start':dialog.close();nav('map');return;
 case 'journal':journal();return;
 case 'settings':settings();return;
 case 'large-text':state.largeText=!state.largeText;save();render();settings();return;
 case 'fullscreen':try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{toast('이 브라우저에서는 전체화면 전환을 지원하지 않아.');}return;
 case 'reset-prompt':saveStore.changed(STORAGE_KEY);if(studentState===null&&saveFailed){saveHelp();return;}modal(TEXT.resetTitle,`<p>${TEXT.resetBody}</p>`,btn(TEXT.resetCancel,'close','soft','id="reset-cancel"')+btn(TEXT.resetConfirm,'reset','danger'));$('#reset-cancel')?.focus();return;
 case 'reset':saveStore.changed(STORAGE_KEY);if(studentState===null&&saveFailed){saveHelp();return;}cancelTest();state=freshState();state.adminUnlocked=studentState!==null;state.screen='home';ui.mapDistance=undefined;ui.undo=[];state.reportSubmitted=[];ui.map=0;save();dialog.close();render();window.scrollTo(0,0);return;
 case 'map-select':if(!openMission(state,Number(id))){explainLockedMission(Number(id));return;}mapController?.goTo(Number(id));return;
 case 'map-arrive':if(!openMission(state,Number(id))){explainLockedMission(Number(id));return;}ui.map=Number(id);missionCard();return;
 case 'map-locked-next':dialog.close();mapController?.goTo(Number(id));return;
 case 'map-overview':mapController?.toggleOverview();return;
 case 'map-retry':render();return;
 case 'spatial-retry':spatialFailureShown=false;render();return;
 case 'select-mission':if(openMission(state,Number(id))){ui.map=Number(id);nav('map');}return;
 case 'enter-mission':if(!openMission(state,ui.map)){explainLockedMission(ui.map);return;}dialog.close();startPage(ui.map*2+(state.completed[ui.map*2]&&!state.completed[ui.map*2+1]?1:0));return;
 case 'specimen':ui.activityFeedback='';ui.plant=id;ui.region='shape';ui.zoom=1;ui.rotation=0;render();return;
 case 'rotate':ui.rotation=(ui.rotation+45)%360;$('#specimen-art').style.transform=`scale(${ui.zoom}) rotate(${ui.rotation}deg)`;return;
 case 'select-plant':ui.activityFeedback='';ui.selected=id;render();return;
 case 'season':if([0,1,2,3,4].includes(Number(id)))state.season=Number(id);break;
 case 'underground':state.underground=!state.underground;break;
 case 'compare':state.experiment.compared=true;break;
 case 'garden-mode':if(id==='plant'&&!['water','grass','dry'].every(t=>state.terrain.filter(x=>x===t).length>=3)){toast('세 환경을 각각 3칸 이상 만들어 줘.');return;}ui.gardenMode=id==='plant'?'plant':'terrain';render();return;
 case 'brush':ui.brush=id;ui.gardenMode='terrain';render();return;
 case 'garden-cell':onCell(Number(id));return;
 case 'undo':{const previous=ui.undo.pop();if(previous){state.terrain=previous.terrain;state.garden=previous.garden;state.gardenReasons=previous.reasons;state.finalChecks.garden=false;}break;}
 case 'edit-terrain':startPage(6);return;
 case 'surface':state.activeTestKey='';if(ui.testing||!['plain','lotus'].includes(id))return;state.design.surface=id;state.testExplanation=null;ui.replaying=false;state.finalChecks.invention=false;break;
 case 'cover':state.activeTestKey='';if(ui.testing||!['open','flap'].includes(id))return;state.design.cover=id;state.testExplanation=null;ui.replaying=false;state.finalChecks.invention=false;break;
 case 'lotus-drop':ui.lotusDrop=true;ui.lotusMicro=false;state.design.observed=true;save();render();return;
 case 'idea-apply':ui.application=id;render();return;
 case 'lotus-micro':ui.lotusMicro=!ui.lotusMicro;render();return;
 case 'design-answer':if(!state.design.observed&&!state.design.linked){toast('먼저 두 표면에 물방울을 떨어뜨려 봐.');return;}state.design.linked=id==='roll';if(id!=='roll')toast('연잎의 특징은 겉면의 물방울을 굴러가게 해. 입구는 덮개로 가릴 수 있어.');break;
 case 'baseline-design':state.design.surface='plain';state.design.cover='open';state.finalChecks.invention=false;break;
 case 'use-tested-design':if(state.tests.some(t=>t.key===designKey(state.design))){state.activeTestKey=designKey(state.design);ui.activityFeedback='같은 설계·같은 비·같은 시간의 시험 기록을 다시 사용했어. 반복 시험은 늘리지 않았어.';save();render();}return;
 case 'run-test':{if(ui.testing)return;state.activeTestKey='';const testedDesign={...state.design},run=++testRun;ui.testing=true;ui.paused=false;ui.replaying=false;state.testExplanation=null;render();let elapsed=0;while(elapsed<2100){await new Promise(resolve=>setTimeout(resolve,100));if(run!==testRun)return;if(!ui.paused)elapsed+=100;}if(run!==testRun)return;state.tests.push(testDesign(testedDesign));if(state.tests.length>30)state.tests.shift();ui.testing=false;toast(state.tests.at(-1).dry&&state.tests.at(-1).clean?'물방울이 굴러가고 수첩이 말랐어. 어떤 부품의 역할인지는 비교 결과로 확인하자.':'시험 결과가 나왔어. 부족한 기능을 보고 설계를 바꿔 봐.');break;}
 case 'edit-design':startPage(8);return;
 case 'previous':startPage(state.page-1);return;
 case 'complete':complete();return;
 case 'reward-map':dialog.close();ui.map=ui.rewardFocus??Math.floor(state.page/2);nav('map');return;
 case 'next-mission':{const next=Number(id)+1;if(next>4||!openMission(state,next))return;dialog.close();ui.map=next;nav('map');return;}
 case 'reward-detail':if(missionDone(state,Number(id)))showReward(Number(id));return;
 case 'garden-theme':if(!missionDone(state,1)||!THEMES[id])return;state.gardenTheme=id;save();render();if(dialog.open){if(dialog.classList.contains('reward-dialog'))showReward(ui.rewardFocus);else modal('꽃길 꾸미기',themePicker(state));}return;
 case 'report':dialog.close();ui.reportTab='discover';if(!state.adminUnlocked&&evidenceCount(state)!==5){toast('먼저 다섯 가지 연구 증거를 모아 줘.');return;}nav('report');return;
 case 'start-final':if(['shared','later'].includes(state.sharing.status))nav('final');return;
 case 'final-classify':state.finalChecks.classification=id==='yes';if(id!=='yes')toast('새 표본의 잎도 가늘고 길어. 우리가 정한 기준과 비교해 봐.');break;
 case 'final-habitat':ui.finalFeedback=id==='dry'?'물을 저장하는 줄기와 물이 부족한 환경을 연결했어.':'물을 저장하는 특징은 물이 부족한 환경과 어떻게 관련될까?';recordResponse(state,3,'final:habitat',HABITATS[id]||id,id==='dry','새 상황 · 선인장이 사는 곳','application');state.finalChecks.habitat=id==='dry';break;
 case 'final-garden':state.finalChecks.garden=pageReady(state,7);if(!state.finalChecks.garden){modal('정원의 환경을 다시 확인하자','<p>바뀐 지형이나 식물 위치가 있어. 정원으로 돌아가 배치와 근거를 확인해 줘.</p>',btn('정원 확인하기','repair-garden','primary'));return;}toast('물가·풀밭·건조 구역의 식물 배치를 확인했어!');break;
 case 'repair-garden':dialog.close();startPage(7);return;
 case 'final-invention':state.finalChecks.invention=id==='right'&&testValid(state);if(id==='wrong')toast('가방의 열린 입구는 표면을 바꿔도 막히지 않아. 덮개가 필요해.');else if(!testValid(state)){modal('현재 설계를 다시 시험하자','<p>설계가 시험 뒤 바뀌었어. 지금 가방으로 시험을 완료해 줘.</p>',btn('테스트센터로','repair-test','primary'));return;}break;
 case 'repair-test':dialog.close();startPage(9);return;
 case 'power-core':if(!canFinish(state)){toast('새 식물의 환경과 내 결과물을 확인해 줘.');return;}state.finished=true;nav('ending');return;
 case 'print':window.print();return;
 }
 save();render();
}
document.addEventListener('click',e=>{unlockMusic();const lockedStage=e.target.closest('.world-node[aria-disabled="true"]');if(lockedStage){e.preventDefault();explainLockedMission(Number(lockedStage.dataset.id));return;}const locked=e.target.closest('[aria-disabled="true"]');if(locked){e.preventDefault();if(locked.dataset.reason)toast(locked.dataset.reason);return;}const field=e.target.closest('[data-bud-field]');if(field&&!e.target.closest('button,.spatial-layer,.spatial-controls')){const r=field.getBoundingClientRect();playClick();action('bud-look',[(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height].map(v=>Math.min(1,Math.max(0,v)).toFixed(3)).concat([Math.round(r.width),Math.round(r.height)]).join(','));return;}const b=e.target.closest('[data-action]');if(!b||b.disabled)return;if(!['sound','sfx-toggle','music-toggle'].includes(b.dataset.action))playClick();const size=b.dataset.action==='bud-hint'?$('#season-art')?.getBoundingClientRect():null;action(b.dataset.action,size?`${Math.round(size.width)},${Math.round(size.height)}`:b.dataset.id,b);});
const SEASON_STOPS=[1,2,3,4,0];
document.addEventListener('change',e=>{if(e.target.id==='season-range')action('season',String(SEASON_STOPS[Number(e.target.value)]));});
document.addEventListener('input',e=>{if(e.target.id==='music-volume'){setMusicVolume(Number(e.target.value));$('#music-volume-value').textContent=`${getMusicVolume()}%`;}if(e.target.id==='zoom'){ui.zoom=Number(e.target.value);$('#specimen-art').style.transform=`scale(${ui.zoom}) rotate(${ui.rotation}deg)`;$('#zoom-value').textContent=`${Math.round(ui.zoom*100)}%`;}if(e.target.id==='season-range'){state.season=SEASON_STOPS[Number(e.target.value)];$('#season-art').innerHTML=seasonArt(state.seasonPlant,state.season,state.underground&&(![3,4].includes(state.season)||!!state.seasonPrediction[state.seasonPlant]));$('#season-label').textContent=state.season===0?'다음 해 봄':SEASONS[state.season];$('#season-caption').textContent='시간을 움직이며 같은 식물의 변화를 살펴봐.';}});
// Mouse, pen and fingers share one card drag onto [data-drop] (native HTML drag ignores fingers on many tablets).
installCardDrag((id,el)=>{ui.selected=id;if(el.dataset.drop==='group')action('assign-group',el.dataset.id);else if(el.dataset.drop==='tray')action('unassign-group',id);else onCell(Number(el.dataset.id));});
// Pointer painting has a tap/keyboard alternative; one continuous stroke is one undo step.
document.addEventListener('pointerdown',e=>{const cell=e.target.closest('.garden-cell[data-id]');if(!cell||e.pointerType==='touch'||state.screen!=='activity'||state.page!==6||ui.gardenMode==='plant')return;paintActive=true;paintLast=Number(cell.dataset.id);ui.undo.push({terrain:[...state.terrain],garden:{...state.garden},reasons:[...state.gardenReasons]});paintCell(paintLast,false);cell.className=`garden-cell ${ui.brush}`;e.preventDefault();});
document.addEventListener('pointermove',e=>{if(!paintActive)return;const cell=document.elementFromPoint(e.clientX,e.clientY)?.closest('.garden-cell[data-id]');if(!cell)return;const i=Number(cell.dataset.id);if(i!==paintLast){paintCell(i,false);cell.className=`garden-cell ${ui.brush}`;cell.innerHTML='<span></span>';paintLast=i;}});
document.addEventListener('pointerup',()=>{if(paintActive){paintActive=false;render();}});
document.addEventListener('pointercancel',()=>{if(paintActive){paintActive=false;render();}});
function bindPinch(){const area=$('.specimen-stage');if(!area)return;const points=new Map();let base=0,start=1;area.addEventListener('pointerdown',e=>{if(e.target.closest('button,.spatial-layer'))return;points.set(e.pointerId,[e.clientX,e.clientY]);area.setPointerCapture(e.pointerId);if(points.size===2){const p=[...points.values()];base=Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]);start=ui.zoom;}});area.addEventListener('pointermove',e=>{if(!points.has(e.pointerId))return;points.set(e.pointerId,[e.clientX,e.clientY]);if(points.size===2&&base){const p=[...points.values()];ui.zoom=Math.min(1.7,Math.max(1,start*Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1])/base));$('#specimen-art').style.transform=`scale(${ui.zoom}) rotate(${ui.rotation}deg)`;$('#zoom').value=ui.zoom;$('#zoom-value').textContent=`${Math.round(ui.zoom*100)}%`;}});['pointerup','pointercancel'].forEach(type=>area.addEventListener(type,e=>points.delete(e.pointerId)));}
save();render();

// Failed assets keep an accessible description instead of a broken image icon.
document.addEventListener('error',e=>{const img=e.target;if(img instanceof HTMLImageElement&&img.dataset.asset){if(img.dataset.asset==='map_trail_v2'&&state.screen==='map'){mapController?.stop();img.remove();const failed=document.createElement('div');failed.className='map-load-error';failed.setAttribute('role','status');failed.innerHTML='<p>탐험 지도를 불러오지 못했어.<br>탐구 기록은 그대로 남아 있어.</p>'+btn('지도 다시 불러오기','map-retry','primary');app.querySelector('.stage-map')?.append(failed);return;}const replacement=document.createElement('span');replacement.className='asset-fallback';replacement.setAttribute('role','img');replacement.setAttribute('aria-label',img.alt);replacement.textContent=ASSETS[img.dataset.asset]?.[0]||'관찰 그림';img.replaceWith(replacement);}},true);

// Records stay local. Offline media still depend on previously cached resources.
const syncOnline=()=>{const badge=$('.offline-badge');if(badge)badge.hidden=navigator.onLine!==false;};
addEventListener('online',syncOnline);addEventListener('offline',syncOnline);
// Skipped on localhost so cache-first files never hide live edits; add ?sw to test it locally.
if('serviceWorker' in navigator&&location.protocol!=='file:'&&(!['localhost','127.0.0.1','[::1]'].includes(location.hostname)||new URLSearchParams(location.search).has('sw')))addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(()=>{});});
