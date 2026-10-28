// Field mission 4. Every step is one plain control, so a finger, a mouse and the keyboard
// take the same path; this module only animates what the last action changed:
// 1) the cloud rains on three bare beds: water pools, soaks in, or runs off, and each bed becomes its ground;
// 2) a plant card dropped on a bed drops into the soil, a wrong bed shakes it back out;
// 3) the cloud rains on the planted garden and a rainbow follows.
const RAIN_MS=1500;

export function mountGardenHands(root,ui){
 const field=root?.querySelector('[data-garden-field]');if(!field)return ()=>{};
 const u=ui.fieldMission??={},timers=[];
 const later=(fn,ms)=>timers.push(setTimeout(fn,ms));
 const zones=[...field.querySelectorAll('.field-garden-zone')];
 const seen=u.gardenSeen,rained=field.dataset.rained==='true';u.gardenSeen={rained};
 let fresh=false;
 zones.forEach(b=>{const {zone,env,plant}=b.querySelector('[data-zone]').dataset,was=seen?.[zone];u.gardenSeen[zone]={env,plant};if(!was)return;
  if(env&&env!==was.env){fresh=true;b.classList.add('just-env',{water:'pooling',grass:'damp',dry:'dried'}[env]);}
  if(plant&&plant!==was.plant)b.classList.add('just-planted');
 });
 if(fresh||(rained&&seen&&!seen.rained)){
  field.classList.add('storm');zones.forEach(z=>z.classList.add('wet'));
  later(()=>{field.classList.remove('storm');zones.forEach(z=>z.classList.remove('wet','pooling','damp','dried'));if(rained)field.classList.add('rainbow');},RAIN_MS);
 }
 return ()=>timers.forEach(clearTimeout);
}
