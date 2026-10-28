import {assetImage} from './asset-catalog.js';
export const icon=(name,size=22)=>{
 const paths={sound:'M11 4 6 8H3v8h3l5 4V4Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14',muted:'M11 4 6 8H3v8h3l5 4V4Zm5 5 6 6m0-6-6 6',leaf:'M19 3C8 2 3 7 5 17c9 3 15-3 14-14ZM5 20 15 9',home:'m3 11 9-8 9 8M5 10v10h5v-6h4v6h5V10',book:'M12 5C8 3 4 3 2 4v15c3-1 6-1 10 1 4-2 7-2 10-1V4c-3-1-6-1-10 1Zm0 0v15',gear:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1 1-3Z',arrow:'M4 12h15m-6-6 6 6-6 6',back:'M20 12H5m6-6-6 6 6 6',check:'m5 12 4 4L19 6',lock:'M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5Zm7 4v3',unlock:'M7 10V7a5 5 0 0 1 9.6-2M5 10h14v11H5Zm7 4v3',sun:'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2',drop:'M12 2C10 7 4 10 4 15a8 8 0 0 0 16 0c0-5-6-8-8-13Z',spark:'m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z',zoom:'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm5 12 6 6M7 10h6m-3-3v6',rotate:'M20 9a8 8 0 1 0 0 7M20 3v6h-6',undo:'M8 5 3 10l5 5M3 10h12a6 6 0 0 1 0 12',flag:'M5 22V3c5-4 10 4 15 0v10c-5 4-10-4-15 0',flask:'M9 2h6m-5 0v7L3 20c0 2 18 2 18 0L14 9V2M7 15h10',print:'M7 8V2h10v6M6 17H3V8h18v9h-3M7 14h10v8H7Z',expand:'M3 9V3h6m6 0h6v6M3 15v6h6m6 0h6v-6',close:'m5 5 14 14M5 19 19 5',reset:'M4 9a8 8 0 1 1 0 7M4 3v6h6M12 12h.01',camera:'M4 8h3l2-3h6l2 3h3v11H4ZM12 10a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z',circle:'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z',download:'M12 3v12m-5-5 5 5 5-5M4 21h16'};
 return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]||paths.leaf}"/></svg>`;
};
const svg=(body,view='0 0 300 260',cls='')=>`<svg class="${cls}" viewBox="${view}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;
export function leafArt(id){return assetImage(({cherry:'cherry_leaf',ginkgo:'ginkgo_leaf',grass:'grass_leaf'})[id]||'grass_leaf','leaf-illustration');}
export function plantArt(id){return assetImage(({cherry:'cherry_tree',aloe:'aloe_plant',hyacinth:'water_hyacinth_whole'})[id]||'grass_leaf','plant-illustration');}
// Seasons 1-3 and 0 are quadrants of *_seasons_v2; 4 (초봄) is its own picture with a higher ground line.
const EARLY_SPRING_SOIL={cherry:'34%',sowthistle:'51%'};
export function seasonArt(plant,season,underground,overlay='',cls=''){
 const early=season===4,position={1:'0% 0%',2:'100% 0%',3:'0% 100%',0:'100% 100%'}[season];
 const label=['다음 봄','여름','가을','겨울','초봄'][season]||'여름';
 const picture=early?`background-image:url('/assets/generated/${plant}_bud_spring.webp');background-size:100% 100%;--soil:${EARLY_SPRING_SOIL[plant]}`:`background-image:url('/assets/generated/${plant}_seasons_v2.webp');background-position:${position}`;
 return `<div class="season-atlas ${underground?'underground-open':''} ${cls}" role="img" aria-label="${plant==='cherry'?'벚나무':'씀바귀'}의 ${label} ${underground?'땅속 포함':''} 관찰 그림" style="${picture}">${underground?'':'<span class="soil-cover">땅속에는 무엇이 있을까?</span>'}${overlay}</div>`;
}
export function bagArt(design,testing=false,result=null){
 const surface=design.surface==='lotus',cover=design.cover==='flap';
 const description=`① 겉면: ${surface?'연잎을 본뜬 겉면':'보통 천'}. ② 입구 덮개: ${cover?'닫힘':'열림'}.`;
 return `<div class="bag-art ${surface?'lotus-surface':'plain-surface'} ${cover?'with-cover':'open-cover'} ${testing?'rain-active':''}" role="img" aria-label="${description}">${assetImage(surface?(cover?'bag_lotus_closed':'bag_lotus_open'):(cover?'research_bag_closed':'research_bag_body'),'bag-product')}${result&&!(result.clean??result.rolls)?'<svg class="bag-mud" viewBox="0 0 300 220" aria-hidden="true"><g fill="#8b6644" opacity=".8"><ellipse cx="85" cy="130" rx="18" ry="9"/><circle cx="70" cy="156" r="7"/></g></svg>':''}${testing?`<div class="rain-layer" aria-hidden="true">${Array.from({length:12},(_,i)=>`<i style="left:${8+i*7}%;animation-delay:${i*.12}s"></i>`).join('')}</div>`:''}</div>`;
}
export function heroArt(){return assetImage('expedition_hero_20261020','hero-art',true);}
