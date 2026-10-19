import {QUESTS} from './inquiry.js';
import {ASSETS,assetImage} from './asset-catalog.js';
import {STORAGE_KEY,LEGACY_STORAGE_KEY,PLANTS,HABITAT_PLANTS,HABITATS,MISSIONS,PAGES,SEASONS,freshState,restoreState,evidenceCount,missionDone,openMission,pageReady,gardenValid,designKey,testDesign,testValid,canFinish,PAGE_ROUTES,routeIndex,previousRoute} from './model.js';
import {icon,leafArt,plantArt,seasonArt,bagArt,heroArt} from './art.js';
import {REWARDS,seedProgress,themePicker,worldMap,evidenceSummary,THEMES,stampBadges,stampBoard} from './rewards.js';
import {renderActivity,renderReport,renderFinal,renderEnding,learningAction,nextHint} from './learning.js';
import {playClick,isSoundOn,setSound,soundStored} from './audio.js';
import {TEXT,appInfoSection,studentSection,teacherSection,noticeSection} from './settings-content.js';

const app=document.querySelector('#app'),dialog=document.querySelector('#dialog');
let state=freshState(),saveFailed=false;
try{state=restoreState(localStorage.getItem(STORAGE_KEY)??localStorage.getItem(LEGACY_STORAGE_KEY));}catch{saveFailed=true;}
if(!soundStored()&&state.soundEnabled===false)setSound(false);
let ui={plant:'cherry',zoom:1,rotation:0,selected:'cherry',map:Math.min(4,evidenceCount(state)),brush:'water',undo:[],finalTab:0,testing:false,paused:false,region:'shape',bubbling:false};
let spatialModule,spatialEpoch=0,lastScreen;
let toastTimer,paintActive=false,paintLast=-1,testRun=0;
const $=(s)=>document.querySelector(s);
const btn=(label,action,cls='',attrs='')=>`<button class="btn ${cls}" data-action="${action}" ${attrs}>${label}</button>`;
const pill=(text)=>`<span class="pill">${text}</span>`;
const npcName={leaf:'리피',water:'방울',flower:'꽃이'};
const mascot=(who='leaf',large=false)=>`<div class="mascot-wrap ${large?'large':''}">${assetImage('mascot_'+who,'mascot-image',large)}</div>`;
const logo=(cls='')=>`<div class="brand-image ${cls}"><img src="/assets/title.webp" alt="초록정원 연구기지"></div>`;
function save(){if(state.finished&&!state.legacyFinished&&!canFinish(state))state.finished=false;try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch{if(!saveFailed)toast('저장 공간을 사용할 수 없어. 지금 탐구는 계속할 수 있어.');saveFailed=true;}}
function toast(message){clearTimeout(toastTimer);$('.toast')?.remove();const el=document.createElement('div');el.className='toast';el.setAttribute('role','status');el.textContent=message;document.body.append(el);$('#announcer').textContent=message;toastTimer=setTimeout(()=>el.remove(),2400);}
function modal(title,body,buttons='',cls=''){if(!body.includes('reward-scene'))dialog.classList.remove('reward-dialog');dialog.classList.toggle('settings-dialog',cls==='settings');dialog.innerHTML=`<div class="dialog-top"><span class="eyebrow">초록정원 연구기지</span>${btn(icon('close'),'close','icon-btn','aria-label="닫기"')}</div><h2>${title}</h2>${body}<div class="dialog-actions">${buttons||btn('알겠어','close','primary')}</div>`;if(!dialog.open)dialog.showModal();}
function cancelTest(){testRun++;ui.testing=false;ui.paused=false;ui.bubbling=false;ui.replaying=false;}
function nav(screen){cancelTest();state.screen=screen;save();render();window.scrollTo(0,0);}
function startPage(p){cancelTest();state.page=p;state.screen='activity';ui.selected=p===5||p===7?'hyacinth':'cherry';ui.plant='cherry';ui.region='shape';ui.zoom=1;ui.rotation=0;ui.undo=[];save();render();window.scrollTo(0,0);}
function header(){return `<header class="topbar"><div class="header-left"><nav class="page-navigation" aria-label="페이지 이동">${btn(icon('home'),'home','icon-btn','aria-label="홈으로 가기" title="홈으로 가기"')}${btn(icon('flag'),'map','icon-btn','aria-label="탐험 지도" title="탐험 지도"')}${btn(icon('back'),'back','icon-btn',`aria-label="이전 페이지로 가기" title="이전 페이지로 가기" ${state.screen==='home'?'disabled':''}`)}</nav><div class="wordmark"><span>초록정원 <strong>연구기지</strong></span></div></div><div class="subject">${state.adminUnlocked?'교사용 전체 열기 · 미리보기':'식물의 생활'}</div><span class="offline-badge" role="status" ${navigator.onLine===false?'':'hidden'}>오프라인 · 기록은 계속 저장돼요</span><nav class="header-tools" aria-label="공통 메뉴">${btn(icon('book')+'<span>연구 노트</span>','journal','quiet','aria-label="연구 노트"')}${btn(icon(isSoundOn()?'sound':'muted'),'sound','icon-btn',`aria-label="${isSoundOn()?'소리 끄기':'소리 켜기'}" aria-pressed="${isSoundOn()}" title="${isSoundOn()?'소리 끄기':'소리 켜기'}"`)}${btn(icon('gear'),'settings','icon-btn','aria-label="설정" title="설정"')}</nav></header>`;}
function openRoute(route){if(!route)return;if(route.screen==='activity')startPage(route.page);else nav(route.screen);}
function progress(){return `<div class="progress-track">${MISSIONS.map((m,i)=>`<button data-action="select-mission" data-id="${i}" ${openMission(state,i)?'':'disabled'} class="progress-stop ${missionDone(state,i)?'done':''} ${Math.floor(state.page/2)===i&&state.screen==='activity'?'current':''}"><span>${missionDone(state,i)?icon('check',16):String(i+1).padStart(2,'0')}</span>${m.short}</button>`).join('')}</div>`;}
function home(){const hasProgress=state.completed.some(Boolean)||Object.values(state.observation).some(a=>a.length);return `<main class="home"><section class="home-scene">${heroArt()}<div class="home-copy"><span class="eyebrow home-eyebrow">작은 잎에서 시작되는 커다란 발견</span>${logo('hero-logo')}<p>잠든 정원을 깨울<br><strong>꼬마 연구원을 찾습니다!</strong></p><div class="home-actions">${btn((hasProgress?'탐구 이어하기':'연구 시작하기')+icon('arrow'),'begin','primary jumbo')}<span>다섯 곳을 깨우고, 나만의 정원을 완성해 봐.</span></div></div><div class="hero-friends">${mascot('leaf',true)}${mascot('water',true)}${mascot('flower',true)}</div><div class="floating-note">${icon('leaf',17)} 오늘의 발견이 내일의 정원이 돼요</div></section><section class="home-bottom"><div class="adventure-label"><span class="eyebrow">함께하는 탐구</span><h2>다섯 번의 발견,<br>하나의 초록정원.</h2></div><div class="home-missions">${MISSIONS.map((m,i)=>`<div><span class="mission-mini m${i}">${assetImage(REWARDS[i].asset,'',false,true)}</span><small>탐구 ${i+1}</small><strong>${m.short}</strong></div>`).join('')}</div></section><footer class="home-footer"><span>식물의 생활 · 관찰에서 발명까지</span><span>${saveFailed?'자동 저장을 사용할 수 없어':'탐구 기록은 이 브라우저에 자동 저장돼'}</span></footer></main>`;}
function mapPage(){
 const current=ui.map;
 return `<main class="expedition-map"><div class="map-title"><h1>초록정원 탐험 지도</h1><p>열린 장소를 눌러 탐구를 시작해 봐.</p></div>${worldMap(state,current,ui.rewardFocus)}<div class="map-seeds">${seedProgress(state)}</div><div class="map-bottom"><span>관찰 → 계절 → 환경 → 정원 → 발명</span><div>${missionDone(state,1)?btn('꽃길 꾸미기','map-theme','soft'):''}${missionDone(state,3)?btn('내 정원','map-garden','soft'):''}${evidenceCount(state)===5?btn('발견 소개하기'+icon('arrow'),'report','primary'):''}${state.finished||state.legacyFinished?btn('완성한 정원','view-ending','soft'):''}</div></div></main>`;
}
function missionCard(){const i=ui.map,m=MISSIONS[i],r=REWARDS[i],done=missionDone(state,i);modal(r.name,`<div class="destination-card">${assetImage(r.asset,'',true)}<div><span class="pill">탐구 ${i+1} · ${done?'복구 완료':'탐구 가능'}</span><p>${done?evidenceSummary(state,i):QUESTS[i].problem}</p><p>${QUESTS[i].task}</p>${QUESTS[i].learn?`<p class="quest-learn"><strong>배울 것</strong> ${QUESTS[i].learn}</p>`:''}<p class="quest-reward">${icon('spark',16)} ${QUESTS[i].reward}</p><ol>${[i*2,i*2+1].map(p=>`<li>${state.completed[p]?icon('check',16)+' ':''}${PAGES[p][0]}</li>`).join('')}</ol></div></div>`,btn((done?'다시 탐구하기':'탐구 시작')+icon('arrow'),'enter-mission','primary'));}
function notebook(title,body){return `<aside class="notebook"><div class="notebook-heading">${icon('book',22)}<h3>${title}</h3></div>${body}</aside>`;}
function checkRow(ok,text){return `<div class="check-row ${ok?'checked':''}"><span>${ok?icon('check',16):'·'}</span>${text}</div>`;}
function choice(label,action,id,selected=false,extra=''){return btn(label,action,`choice ${selected?'selected':''}`,`data-id="${id}" aria-pressed="${selected}" ${extra}`);}
function gardenGrid(readonly=false){return `<div class="garden-grid ${readonly?'readonly':''}" aria-label="6열 4행 정원">${state.terrain.map((t,i)=>{const plant=HABITAT_PLANTS.find(p=>state.garden[p.id]===i);const label=`${Math.floor(i/6)+1}행 ${i%6+1}열 ${HABITATS[t]||'빈 땅'}${plant?' '+plant.name:''}`;return readonly?`<div class="garden-cell ${t} ${plant?'planted':''}" role="img" aria-label="${label}">${plant?plantArt(plant.id):'<span></span>'}</div>`:`<button class="garden-cell ${t} ${plant?'planted':''}" data-action="garden-cell" data-id="${i}" data-drop="garden" aria-label="${label}" title="${label}">${plant?plantArt(plant.id):'<span></span>'}</button>`;}).join('')}</div>`;}
function activity(){return renderActivity(state,ui,gardenGrid);}
function report(){return renderReport(state,ui);}
function finalPage(){return renderFinal(state,gardenGrid);}
function ending(){return renderEnding(state,gardenGrid);}
function render(){spatialModule?.unmountSpatial();const epoch=++spatialEpoch;document.body.dataset.screen=state.screen;document.body.classList.toggle('activity-open',state.screen==='activity');const focus=document.activeElement;const focusId=focus?.id;const focusAction=focus?.dataset?.action,focusData=focus?.dataset?.id;document.body.classList.toggle('large-text',state.largeText);app.innerHTML=header()+({home,map:mapPage,activity,report,final:finalPage,ending}[state.screen]||home)();if(state.screen!==lastScreen){lastScreen=state.screen;const main=app.querySelector('main');if(main){main.classList.add('screen-enter');main.addEventListener('animationend',e=>{if(e.target===main)main.classList.remove('screen-enter');});}}bindDrag();bindPinch();const host=app.querySelector('[data-spatial]');if(host)import('./spatial.js').then(module=>{spatialModule=module;if(epoch===spatialEpoch&&host.isConnected)module.mountSpatial(host,state,ui,action,cells=>{ui.undo.push({terrain:[...state.terrain],garden:{...state.garden},reasons:[...state.gardenReasons]});for(const i of cells)paintCell(i,false);render();});}).catch(()=>{host.dataset.spatialUnavailable='true';});const target=focusId?document.getElementById(focusId):focusAction?app.querySelector(`[data-action="${CSS.escape(focusAction)}"]${focusData!==undefined?`[data-id="${CSS.escape(focusData)}"]`:''}`):null;target?.focus({preventScroll:true});}

function journal(){modal('나의 연구 노트',`${seedProgress(state)}<div class="collection-row">${REWARDS.map((r,i)=>`<button class="collection-item ${missionDone(state,i)?'owned':''}" data-action="reward-detail" data-id="${i}" ${missionDone(state,i)?'':'disabled'}>${assetImage(r.asset,'',true)}<span>${missionDone(state,i)?r.name:'아직 잠든 곳'}</span></button>`).join('')}</div>${stampBoard(state)}<div class="journal-list">${MISSIONS.map((m,i)=>`<section><h3>${icon(missionDone(state,i)?'check':'lock',20)} ${m.evidence}</h3><p>${missionDone(state,i)?['벚나무·은행나무·강아지풀의 잎을 관찰하고 내가 정한 기준으로 나눴어.','겨울에 살아 있는 부분과 다음 봄 새로 자라는 모습을 연결했어.','부레옥잠의 잎자루 속 공기를 실험하고 세 식물의 환경을 연결했어.','물가·풀밭·건조 구역을 만들고 식물을 알맞게 심었어.',`가방을 ${state.tests.length}번 시험하며 바꾼 부품의 역할을 비교했어.`][i]:'이 미션을 마치면 연구 결과가 여기에 남아.'}</p></section>`).join('')}<div class="journal-details"><h3>지금까지 모은 관찰</h3>${PLANTS.map(p=>`<p><strong>${p.name}</strong> ${state.observation[p.id].map(f=>f==='shape'?p.shape:p.edgeText).join(' · ')||'아직 관찰 전'}</p>`).join('')}</div></div>`);}
// Settings follow the iscream-settings order; wording lives in settings-content.js.
function teacherTools(){
 return `<p>${TEXT.teacherTools}</p>${btn(icon(state.adminUnlocked?'check':'lock')+(state.adminUnlocked?TEXT.unlockOn:TEXT.unlock),'admin-unlock',`soft wide ${state.adminUnlocked?'selected':''}`,`aria-pressed="${state.adminUnlocked}"`)}<p class="microcopy">${TEXT.teacherNote}</p>`;
}
function settings(){
 const keep=dialog.open&&dialog.classList.contains('settings-dialog'),open=keep?[...dialog.querySelectorAll('details[open]')].map(d=>d.dataset.key):[],scroll=keep?dialog.querySelector('.settings-body')?.scrollTop:0;
 const done=state.finished||state.legacyFinished,sound=isSoundOn();
 const body=`<div class="settings-body"><section class="settings-sound">${btn(`<span>${TEXT.sfx}</span><span class="switch-state">${sound?TEXT.on:TEXT.off}</span>`,'sfx-toggle',`soft wide setting-switch ${sound?'selected':''}`,`role="switch" aria-checked="${sound}"`)}${btn((state.largeText?icon('check',18)+' ':'')+TEXT.largeText,'large-text',`soft wide ${state.largeText?'selected':''}`,`aria-pressed="${state.largeText}"`)}${btn(icon('expand')+' '+TEXT.fullscreen,'fullscreen','soft wide')}</section><section class="settings-story">${btn(TEXT.intro,'intro-replay','soft wide')}${done?btn(TEXT.ending,'view-ending','soft wide'):btn(icon('lock',18)+' '+TEXT.ending,'view-ending','soft wide',`aria-disabled="true" data-reason="${TEXT.endingLocked}"`)}</section>${saveFailed?`<p class="settings-warning">${TEXT.saveFailed}</p>`:''}${appInfoSection()}${studentSection()}${teacherSection(teacherTools())}${noticeSection()}</div>`;
 modal(TEXT.title,body,btn(TEXT.reset,'reset-prompt','soft text-danger')+btn(TEXT.close,'close','primary'),'settings');
 for(const key of open)dialog.querySelector(`details[data-key="${key}"]`)?.setAttribute('open','');
 const pane=dialog.querySelector('.settings-body');if(pane&&scroll)pane.scrollTop=scroll;
}
function intro(replay=false){modal('그린코어가 잠들었어!',`<div class="intro-dialog">${mascot('leaf',true)}<p>“안녕! 나는 식물 연구원 리피야.<br>식물 기록이 뒤섞여서 연구기지가 멈췄어.<br><strong>우리 함께 관찰하고 실험해서 정원을 깨워 줄래?”</strong></p></div><div class="intro-steps"><span>식물 탐구</span>${icon('arrow',18)}<span>증거 수집</span>${icon('arrow',18)}<span>정원 복구</span></div>`,replay?btn('설정으로 돌아가기','settings','soft')+btn('알겠어','close','primary'):btn('좋아, 함께 시작하자!','intro-start','primary'));}
function showReward(i,first=false){
 ui.rewardFocus=i;const r=REWARDS[i];dialog.classList.add('reward-dialog');
 modal(first?r.title:'내가 깨운 '+r.name,`<div class="reward-scene">${assetImage(r.asset,'reward-building',true)}${assetImage('stamp_complete','reward-complete-stamp'+(first?' stamp-in':''),true)}<span class="reward-seed">${icon('leaf',22)} ${first?'빛씨앗 +1':'획득한 빛씨앗'}</span></div><p class="reward-why">${r.why}</p><p class="reward-proof">${evidenceSummary(state,i)}</p>${QUESTS[i].life?`<p class="reward-life">${icon('leaf',16)} ${QUESTS[i].life}</p>`:''}<div class="reward-stamps">${stampBadges(state,i)}</div>${seedProgress(state)}${i===1?themePicker(state):''}${i===3?`<details class="reward-own-garden"><summary>내가 심은 정원 보기</summary>${gardenGrid(true)}</details>`:''}<p class="reward-next">${r.next}</p>`,btn('지도에서 확인하기','reward-map','primary')+btn(i===4?'최종 연구 보고':'다음 탐구',i===4?'report':'next-mission','soft',`data-id="${i}"`));
}
function complete(){
 const p=state.page;
 if(!pageReady(state,p)){toast(nextHint(state,p));return;}
 if(p%2&&!state.completed[p-1]){toast('앞 활동의 연구 기록을 먼저 마쳐 줘.');return;}
 const i=Math.floor(p/2),first=!missionDone(state,i);state.completed[p]=true;save();
 if(p%2){render();showReward(i,first);}else startPage(p+1);
}
function paintCell(i,first=true){if(state.terrain[i]===ui.brush)return;if(first)ui.undo.push({terrain:[...state.terrain],garden:{...state.garden},reasons:[...state.gardenReasons]});if(ui.undo.length>30)ui.undo.shift();state.terrain[i]=ui.brush;Object.entries(state.garden).forEach(([id,cell])=>{if(cell===i){delete state.garden[id];state.gardenReasons=state.gardenReasons.filter(x=>x!==id);}});state.finalChecks.garden=false;save();}
function onCell(i){if(state.page===6){paintCell(i);render();return;}const id=ui.selected;if(!HABITAT_PLANTS.some(p=>p.id===id))return;const occupant=Object.keys(state.garden).find(k=>state.garden[k]===i&&k!==id);if(occupant){toast('이 칸에는 다른 식물이 있어. 빈 칸을 골라 줘.');return;}if(state.terrain[i]==='empty'){toast('빈 땅이야. 먼저 지형을 만들어 줘.');return;}state.garden[id]=i;state.gardenReasons=state.gardenReasons.filter(k=>k!==id);state.finalChecks.garden=false;save();render();const p=HABITAT_PLANTS.find(p=>p.id===id);if(state.terrain[i]!==p.habitat)toast(`${p.name}의 관찰 기록을 확인해 봐. 이곳의 환경과 연결될까?`);}

async function action(a,id,el){
 const result=learningAction(state,ui,a,id);
 if(result!==false){save();render();if(result)toast(result);return;}
 switch(a){
 case 'press-petiole':{if(state.experiment.step<3)return;state.experiment.step=Math.max(4,state.experiment.step);ui.bubbling=true;save();render();const run=testRun;setTimeout(()=>{if(run===testRun&&state.screen==='activity'&&state.page===4){ui.bubbling=false;render();}},1700);return;}
 case 'pause-test':ui.paused=!ui.paused;render();return;
 case 'replay-test':ui.replaying=!ui.replaying;render();return;
 case 'close':dialog.close();return;
 case 'activity-notes':modal('이번 활동의 기록',$('.learning-note').innerHTML);return;
 case 'activity-help':modal(PAGES[state.page][0],`<p>${PAGES[state.page][1]}</p><p>${nextHint(state,state.page)}</p>`);return;
 case 'map-theme':modal('꽃길 꾸미기',themePicker(state));return;
 case 'map-garden':modal('내가 심은 정원',gardenGrid(true));return;
 case 'report-tab':ui.reportTab=id;render();return;
 case 'asset-view':if(ASSETS[id])modal(ASSETS[id][0],`<div class="asset-detail">${assetImage(id,'',true)}</div><p>${ASSETS[id][1]}</p><p class="microcopy">특징을 이해하기 쉽게 나타낸 관찰 그림이야.</p>`);return;
 case 'lotus-observe':modal('연잎에서 찾은 아이디어',`<div class="lotus-detail"><figure>${assetImage('lotus_leaf_whole','',true)}<figcaption>넓고 둥근 연잎</figcaption></figure><figure>${assetImage('lotus_surface_diagram','',true)}<figcaption>표면을 크게 나타낸 모형</figcaption></figure></div><p>연잎 위의 물방울은 둥글게 맺혀 굴러가. 이 특징을 가방 겉면에 적용하면 어떨까?</p><p class="inline-tip">겉면과 입구는 다른 부분이야. 비가 들어오는 입구도 함께 살펴봐.</p>`);return;
 case 'view-ending':if(state.finished||state.legacyFinished){if(dialog.open)dialog.close();nav('ending');}return;
 case 'home':nav('home');return;
 case 'back':if(state.screen!=='home')openRoute(previousRoute(state));return;
 case 'sound':setSound(!isSoundOn());playClick();render();return;
 case 'sfx-toggle':setSound(!isSoundOn());playClick();render();settings();return;
 case 'intro-replay':intro(true);return;
 case 'admin-unlock':state.adminUnlocked=!state.adminUnlocked;if(!state.adminUnlocked){state=restoreState(JSON.stringify(state));}save();render();settings();toast(state.adminUnlocked?'모든 미션과 페이지가 열렸어요.':'일반 탐구 모드로 돌아왔어요.');return;
 case 'admin-next':if(state.adminUnlocked)openRoute(PAGE_ROUTES[routeIndex(state)+1]);return;
 case 'map':ui.map=Math.min(4,Math.floor(state.page/2));nav('map');return;
 case 'begin':if(state.completed.some(Boolean)||Object.values(state.observation).some(a=>a.length)){nav('map');return;}intro();return;
 case 'intro-start':dialog.close();nav('map');return;
 case 'journal':journal();return;
 case 'settings':settings();return;
 case 'large-text':state.largeText=!state.largeText;save();render();settings();return;
 case 'fullscreen':try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{toast('이 브라우저에서는 전체화면 전환을 지원하지 않아.');}return;
 case 'reset-prompt':modal(TEXT.resetTitle,`<p>${TEXT.resetBody}</p>`,btn(TEXT.resetCancel,'close','soft','id="reset-cancel"')+btn(TEXT.resetConfirm,'reset','danger'));$('#reset-cancel')?.focus();return;
 case 'reset':cancelTest();state=freshState();state.screen='home';ui.undo=[];state.reportSubmitted=[];ui.map=0;save();dialog.close();render();window.scrollTo(0,0);return;
 case 'map-select':if(openMission(state,Number(id))){ui.map=Number(id);render();missionCard();}return;
 case 'select-mission':if(openMission(state,Number(id))){ui.map=Number(id);nav('map');}return;
 case 'enter-mission':dialog.close();startPage(ui.map*2+(state.completed[ui.map*2]&&!state.completed[ui.map*2+1]?1:0));return;
 case 'specimen':ui.plant=id;ui.region='shape';ui.zoom=1;ui.rotation=0;render();return;
 case 'rotate':ui.rotation=(ui.rotation+45)%360;$('#specimen-art').style.transform=`scale(${ui.zoom}) rotate(${ui.rotation}deg)`;return;
 case 'select-plant':ui.selected=id;render();return;
 case 'season':state.season=Number(id);break;
 case 'underground':state.underground=!state.underground;break;
 case 'compare':state.experiment.compared=true;break;
 case 'brush':ui.brush=id;render();return;
 case 'garden-cell':onCell(Number(id));return;
 case 'undo':{const previous=ui.undo.pop();if(previous){state.terrain=previous.terrain;state.garden=previous.garden;state.gardenReasons=previous.reasons;state.finalChecks.garden=false;}break;}
 case 'edit-terrain':startPage(6);return;
 case 'surface':if(ui.testing||!['plain','lotus'].includes(id))return;state.design.surface=id;state.testExplanation=null;ui.replaying=false;state.finalChecks.invention=false;break;
 case 'cover':if(ui.testing||!['open','flap'].includes(id))return;state.design.cover=id;state.testExplanation=null;ui.replaying=false;state.finalChecks.invention=false;break;
 case 'design-answer':state.design.linked=id==='roll';if(id!=='roll')toast('연잎의 특징은 겉면의 물방울을 굴러가게 해. 입구는 덮개로 가릴 수 있어.');break;
 case 'baseline-design':state.design.surface='plain';state.design.cover='open';state.finalChecks.invention=false;break;
 case 'run-test':{if(ui.testing)return;const testedDesign={...state.design},run=++testRun;ui.testing=true;ui.paused=false;ui.replaying=false;state.testExplanation=null;render();let elapsed=0;while(elapsed<2100){await new Promise(resolve=>setTimeout(resolve,100));if(run!==testRun)return;if(!ui.paused)elapsed+=100;}if(run!==testRun)return;state.tests.push(testDesign(testedDesign));if(state.tests.length>30)state.tests.shift();ui.testing=false;toast(state.tests.at(-1).dry&&state.tests.at(-1).clean?'두 가지 기능을 모두 확인했어. 다른 설계와도 비교해 봐.':'시험 결과가 나왔어. 부족한 기능을 보고 설계를 바꿔 봐.');break;}
 case 'edit-design':startPage(8);return;
 case 'previous':startPage(state.page-1);return;
 case 'complete':complete();return;
 case 'reward-map':dialog.close();ui.map=ui.rewardFocus??Math.floor(state.page/2);nav('map');return;
 case 'next-mission':{const next=Number(id)+1;if(next>4||!openMission(state,next))return;dialog.close();ui.map=next;nav('map');return;}
 case 'reward-detail':if(missionDone(state,Number(id)))showReward(Number(id));return;
 case 'garden-theme':if(!missionDone(state,1)||!THEMES[id])return;state.gardenTheme=id;save();render();if(dialog.open){if(dialog.classList.contains('reward-dialog'))showReward(ui.rewardFocus);else modal('꽃길 꾸미기',themePicker(state));}return;
 case 'report':dialog.close();if(evidenceCount(state)!==5){toast('먼저 다섯 가지 연구 증거를 모아 줘.');return;}nav('report');return;
 case 'start-final':if(['shared','later'].includes(state.sharing.status))nav('final');return;
 case 'final-classify':state.finalChecks.classification=id==='yes';if(id!=='yes')toast('새 표본의 잎도 가늘고 길어. 우리가 정한 기준과 비교해 봐.');break;
 case 'final-habitat':state.finalChecks.habitat=id==='dry';if(id!=='dry')toast('물을 저장하는 특징은 물이 부족한 환경과 어떻게 관련될까?');break;
 case 'final-garden':state.finalChecks.garden=pageReady(state,7);if(!state.finalChecks.garden){modal('정원의 환경을 다시 확인하자','<p>바뀐 지형이나 식물 위치가 있어. 정원으로 돌아가 배치와 근거를 확인해 줘.</p>',btn('정원 확인하기','repair-garden','primary'));return;}toast('물가·풀밭·건조 구역의 식물 배치를 확인했어!');break;
 case 'repair-garden':dialog.close();startPage(7);return;
 case 'final-invention':state.finalChecks.invention=id==='right'&&testValid(state);if(id==='wrong')toast('가방의 열린 입구는 표면을 바꿔도 막히지 않아. 덮개가 필요해.');else if(!testValid(state)){modal('현재 설계를 다시 시험하자','<p>설계가 시험 뒤 바뀌었어. 지금 가방으로 시험을 완료해 줘.</p>',btn('테스트센터로','repair-test','primary'));return;}break;
 case 'repair-test':dialog.close();startPage(9);return;
 case 'power-core':if(!canFinish(state)){toast('새 식물의 환경과 내 결과물을 확인해 줘.');return;}state.finished=true;nav('ending');return;
 case 'print':window.print();return;
 }
 save();render();
}
document.addEventListener('click',e=>{const locked=e.target.closest('[aria-disabled="true"]');if(locked){e.preventDefault();if(locked.dataset.reason)toast(locked.dataset.reason);return;}const b=e.target.closest('[data-action]');if(!b||b.disabled)return;if(!['sound','sfx-toggle'].includes(b.dataset.action))playClick();action(b.dataset.action,b.dataset.id,b);});
document.addEventListener('change',e=>{if(e.target.id==='season-range'){state.season=[1,2,3,0][Number(e.target.value)];save();render();}});
document.addEventListener('input',e=>{if(e.target.id==='zoom'){ui.zoom=Number(e.target.value);$('#specimen-art').style.transform=`scale(${ui.zoom}) rotate(${ui.rotation}deg)`;$('#zoom-value').textContent=`${Math.round(ui.zoom*100)}%`;}if(e.target.id==='season-range'){state.season=[1,2,3,0][Number(e.target.value)];$('#season-art').innerHTML=seasonArt(state.seasonPlant,state.season,state.underground);$('#season-label').textContent=state.season===0?'다음 해 봄':SEASONS[state.season];$('#season-caption').textContent='시간을 움직이며 같은 식물의 변화를 살펴봐.';}});
function bindDrag(){document.querySelectorAll('[data-drag]').forEach(el=>el.addEventListener('dragstart',e=>{ui.selected=el.dataset.drag;e.dataTransfer.setData('text/plain',ui.selected);e.dataTransfer.effectAllowed='move';}));document.querySelectorAll('[data-drop]').forEach(el=>{el.addEventListener('dragover',e=>e.preventDefault());el.addEventListener('drop',e=>{e.preventDefault();const id=e.dataTransfer.getData('text/plain');if(![...PLANTS,...HABITAT_PLANTS].some(p=>p.id===id))return;ui.selected=id;if(el.dataset.drop==='group')action('assign-group',el.dataset.id);else onCell(Number(el.dataset.id));});});}
// Pointer painting has a tap/keyboard alternative; one continuous stroke is one undo step.
document.addEventListener('pointerdown',e=>{const cell=e.target.closest('.garden-cell[data-id]');if(!cell||state.screen!=='activity'||state.page!==6)return;paintActive=true;paintLast=Number(cell.dataset.id);ui.undo.push({terrain:[...state.terrain],garden:{...state.garden},reasons:[...state.gardenReasons]});paintCell(paintLast,false);cell.className=`garden-cell ${ui.brush}`;e.preventDefault();});
document.addEventListener('pointermove',e=>{if(!paintActive)return;const cell=document.elementFromPoint(e.clientX,e.clientY)?.closest('.garden-cell[data-id]');if(!cell)return;const i=Number(cell.dataset.id);if(i!==paintLast){paintCell(i,false);cell.className=`garden-cell ${ui.brush}`;cell.innerHTML='<span></span>';paintLast=i;}});
document.addEventListener('pointerup',()=>{if(paintActive){paintActive=false;render();}});
document.addEventListener('pointercancel',()=>{if(paintActive){paintActive=false;render();}});
function bindPinch(){const area=$('.specimen-stage');if(!area)return;const points=new Map();let base=0,start=1;area.addEventListener('pointerdown',e=>{if(e.target.closest('button,.spatial-layer'))return;points.set(e.pointerId,[e.clientX,e.clientY]);area.setPointerCapture(e.pointerId);if(points.size===2){const p=[...points.values()];base=Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]);start=ui.zoom;}});area.addEventListener('pointermove',e=>{if(!points.has(e.pointerId))return;points.set(e.pointerId,[e.clientX,e.clientY]);if(points.size===2&&base){const p=[...points.values()];ui.zoom=Math.min(1.7,Math.max(1,start*Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1])/base));$('#specimen-art').style.transform=`scale(${ui.zoom}) rotate(${ui.rotation}deg)`;$('#zoom').value=ui.zoom;$('#zoom-value').textContent=`${Math.round(ui.zoom*100)}%`;}});['pointerup','pointercancel'].forEach(type=>area.addEventListener(type,e=>points.delete(e.pointerId)));}
save();render();

// Failed assets keep an accessible description instead of a broken image icon.
document.addEventListener('error',e=>{const img=e.target;if(img instanceof HTMLImageElement&&img.dataset.asset){const replacement=document.createElement('span');replacement.className='asset-fallback';replacement.setAttribute('role','img');replacement.setAttribute('aria-label',img.alt);replacement.textContent=ASSETS[img.dataset.asset]?.[0]||'관찰 그림';img.replaceWith(replacement);}},true);

// Offline badge: classroom Wi-Fi drops do not stop play because records live in localStorage.
const syncOnline=()=>{const badge=$('.offline-badge');if(badge)badge.hidden=navigator.onLine!==false;};
addEventListener('online',syncOnline);addEventListener('offline',syncOnline);
// Skipped on localhost so cache-first files never hide live edits; add ?sw to test it locally.
if('serviceWorker' in navigator&&location.protocol!=='file:'&&(!['localhost','127.0.0.1','[::1]'].includes(location.hostname)||new URLSearchParams(location.search).has('sw')))addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(()=>{});});
