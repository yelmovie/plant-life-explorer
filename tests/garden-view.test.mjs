import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../src/vendor/three/three.module.min.js';
import {GARDEN_VIEWS,GARDEN_BOUNDS,gardenCameraFrame} from '../src/garden-view.js';

test('정원은 태블릿·넓은 창의 모든 기본 시점에서 받침과 식물이 화면에 들어온다',()=>{
 for(const aspect of [.65,1,1.4,2.2,3.6])for(const {yaw,pitch} of Object.values(GARDEN_VIEWS)){
  const {distance:d,target}=gardenCameraFrame(aspect,yaw,pitch),camera=new THREE.PerspectiveCamera(34,aspect,.1,100);
  camera.position.set(Math.sin(yaw)*Math.cos(pitch)*d+target[0],Math.sin(pitch)*d+target[1],Math.cos(yaw)*Math.cos(pitch)*d+target[2]);
  camera.lookAt(...target);camera.updateMatrixWorld(true);
  for(const x of [GARDEN_BOUNDS.min[0],GARDEN_BOUNDS.max[0]])for(const y of [GARDEN_BOUNDS.min[1],GARDEN_BOUNDS.max[1]])for(const z of [GARDEN_BOUNDS.min[2],GARDEN_BOUNDS.max[2]]){
   const p=new THREE.Vector3(x,y,z).project(camera);
   assert.ok(Math.abs(p.x)<=.911&&Math.abs(p.y)<=.881&&p.z<1,`clipped at aspect ${aspect}, yaw ${yaw}, pitch ${pitch}`);
  }
 }
});
