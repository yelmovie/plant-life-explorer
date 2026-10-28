export const GARDEN_BOUNDS={min:[-3.25,-.55,-2.25],max:[3.25,2.1,2.25]};
export const GARDEN_VIEWS={
 perspective:{label:'사선에서',yaw:.4,pitch:.7},
 top:{label:'위에서',yaw:0,pitch:1.52},
 front:{label:'앞에서',yaw:0,pitch:.22},
 back:{label:'뒤에서',yaw:Math.PI,pitch:.22},
 left:{label:'왼쪽에서',yaw:-Math.PI/2,pitch:.3},
 right:{label:'오른쪽에서',yaw:Math.PI/2,pitch:.3}
};

// Fit the complete board and plants in a perspective camera at any selected angle.
// Fixed distances make the board tiny in wide windows and crop it in narrow ones.
export function gardenCameraFrame(aspect,yaw,pitch,fov=34,points){
 const tan=Math.tan(fov*Math.PI/360),sy=Math.sin(yaw),cy=Math.cos(yaw),sp=Math.sin(pitch),cp=Math.cos(pitch);
 const corners=points||[GARDEN_BOUNDS.min[0],GARDEN_BOUNDS.max[0]].flatMap(x=>[GARDEN_BOUNDS.min[1],GARDEN_BOUNDS.max[1]].flatMap(y=>[GARDEN_BOUNDS.min[2],GARDEN_BOUNDS.max[2]].map(z=>[x,y,z])));
 const projected=corners.map(([x,y,z])=>({right:x*cy-z*sy,up:-x*sy*sp+y*cp-z*cy*sp,depth:x*sy*cp+y*sp+z*cy*cp}));
 const kx=tan*Math.max(.2,aspect)*.91,ky=tan*.88;
 // Intersect the possible camera centers at each distance. This also centers the
 // nearer board edge, which perspective projects farther than its opposite edge.
 function ranges(distance){
  let left=-Infinity,right=Infinity,bottom=-Infinity,top=Infinity;
  for(const p of projected){const depth=distance-p.depth;left=Math.max(left,p.right-kx*depth);right=Math.min(right,p.right+kx*depth);bottom=Math.max(bottom,p.up-ky*depth);top=Math.min(top,p.up+ky*depth);}
  return {left,right,bottom,top};
 }
 let low=Math.max(...projected.map(p=>p.depth))+.2,high=low+100;
 for(let i=0;i<22;i++){const middle=(low+high)/2,r=ranges(middle);if(r.left<=r.right&&r.bottom<=r.top)high=middle;else low=middle;}
 const r=ranges(high),x=(r.left+r.right)/2,y=(r.bottom+r.top)/2;
 return {distance:high,target:[cy*x-sy*sp*y,cp*y,-sy*x-cy*sp*y]};
}
