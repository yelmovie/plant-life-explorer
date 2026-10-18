import {readFileSync,writeFileSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8').replaceAll('\r\n','\n');
let a=read('src/app.js');
const rep=(x,y)=>{if(!a.includes(x))throw Error('Missing app anchor '+x.slice(0,70));a=a.replace(x,y);};
rep('import {STORAGE_KEY,','import {STORAGE_KEY,LEGACY_STORAGE_KEY,');
rep("import {renderDesign,renderTests} from './invention.js';","import {renderActivity,renderReport,renderFinal,renderEnding,learningAction,nextHint} from './learning.js';");
rep('restoreState(localStorage.getItem(STORAGE_KEY))','restoreState(localStorage.getItem(STORAGE_KEY)??localStorage.getItem(LEGACY_STORAGE_KEY))');
rep("testing:false};","testing:false,paused:false,region:'shape',bubbling:false};");
rep('if(state.finished&&!canFinish(state))','if(state.finished&&!state.legacyFinished&&!canFinish(state))');
rep('function cancelTest(){testRun++;ui.testing=false;}','function cancelTest(){testRun++;ui.testing=false;ui.paused=false;ui.bubbling=false;ui.replaying=false;}');
rep("ui.plant='cherry';ui.zoom=1;","ui.plant='cherry';ui.region='shape';ui.zoom=1;");
a=a.replace('<small>SCIENCE WORLD</small>','').replace('OUR LITTLE ADVENTURE','함께하는 탐구').replaceAll('MISSION 0','탐구 ');
const grid=a.slice(a.indexOf('function gardenGrid('),a.indexOf('function gardenBuild('));
a=a.slice(0,a.indexOf('function specimen('))+grid+`function activity(){return renderActivity(state,ui,gardenGrid);}
function report(){return renderReport(state);}
function finalPage(){return renderFinal(state,gardenGrid);}
function ending(){return renderEnding(state,gardenGrid);}
`+a.slice(a.indexOf('function render()'));
const hs=a.indexOf("if(!pageReady(state,p)){const hints="),he=a.indexOf('\n if(p%2',hs);
a=a.slice(0,hs)+"if(!pageReady(state,p)){toast(nextHint(state,p));return;}"+a.slice(he);
rep("async function action(a,id,el){\n switch(a){",`async function action(a,id,el){
 const result=learningAction(state,ui,a,id);
 if(result!==false){save();render();if(result)toast(result);return;}
 switch(a){
 case 'press-petiole':{if(state.experiment.step<3)return;state.experiment.step=Math.max(4,state.experiment.step);ui.bubbling=true;save();render();const run=testRun;setTimeout(()=>{if(run===testRun&&state.screen==='activity'&&state.page===4){ui.bubbling=false;render();}},1700);return;}
 case 'pause-test':ui.paused=!ui.paused;render();return;
 case 'replay-test':ui.replaying=!ui.replaying;render();return;`);
rep("case 'specimen':ui.plant=id;ui.zoom=1;ui.rotation=0;render();return;","case 'specimen':ui.plant=id;ui.region='shape';ui.zoom=1;ui.rotation=0;render();return;");
rep("case 'start-final':if(state.reportSubmitted.length===5)nav('final');return;","case 'start-final':if(['shared','later'].includes(state.sharing.status))nav('final');return;");
rep("toast('네 가지 연구 모듈을 먼저 연결해 줘.')","toast('새 식물의 환경과 내 결과물을 확인해 줘.')");
rep("await new Promise(resolve=>setTimeout(resolve,2100));if(run!==testRun)return;",`let elapsed=0;while(elapsed<2100){await new Promise(resolve=>setTimeout(resolve,100));if(run!==testRun)return;if(!ui.paused)elapsed+=100;}if(run!==testRun)return;`);
rep("ui.testing=true;render();","ui.testing=true;ui.paused=false;ui.replaying=false;state.testExplanation=null;render();");
rep("case 'surface':if(ui.testing||!['plain','lotus'].includes(id))return;state.design.surface=id;","case 'surface':if(ui.testing||!['plain','lotus'].includes(id))return;state.design.surface=id;state.testExplanation=null;ui.replaying=false;");
rep("case 'cover':if(ui.testing||!['open','flap'].includes(id))return;state.design.cover=id;","case 'cover':if(ui.testing||!['open','flap'].includes(id))return;state.design.cover=id;state.testExplanation=null;ui.replaying=false;");
for(const key of ['observe','rule','assign-group','season-plant','record-season','link-evidence','experiment-step','habitat','garden-reason','submit-evidence'])a=a.replace(new RegExp("^ case '"+key+"':.*\\n",'m'),'');
const cs=a.indexOf("document.addEventListener('change'"),bs=a.indexOf('function bindDrag()',cs);
a=a.slice(0,cs)+`document.addEventListener('change',e=>{if(e.target.id==='season-range'){state.season=[1,2,3,0][Number(e.target.value)];save();render();}});
document.addEventListener('input',e=>{if(e.target.id==='zoom'){ui.zoom=Number(e.target.value);$('#specimen-art').style.transform=\`scale(\${ui.zoom}) rotate(\${ui.rotation}deg)\`;$('#zoom-value').textContent=\`\${Math.round(ui.zoom*100)}%\`;}if(e.target.id==='season-range'){state.season=[1,2,3,0][Number(e.target.value)];$('#season-art').innerHTML=seasonArt(state.seasonPlant,state.season,state.underground);$('#season-label').textContent=state.season===0?'다음 해 봄':SEASONS[state.season];$('#season-caption').textContent='시간을 움직이며 같은 식물의 변화를 살펴봐.';}});
`+a.slice(bs);
rep('function render(){const focus=',"function render(){document.body.classList.toggle('activity-open',state.screen==='activity');const focus=");
rep('render();\n\n// Failed assets','save();render();\n\n// Failed assets');
writeFileSync(new URL('src/app.js',root),a);
console.log('Tablet screens wired.');
