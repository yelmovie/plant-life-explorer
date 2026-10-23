import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mountSpatialSafely} from '../src/runtime-support.js';

test('optional 3D import failure recovers instead of rejecting the activity',async()=>{
 let recovered=0,mounted=0;
 const result=await mountSpatialSafely(()=>Promise.reject(new Error('offline')),()=>true,()=>mounted++,()=>recovered++);
 assert.equal(result,'fallback');assert.equal(recovered,1);assert.equal(mounted,0);
});

test('a renderer setup failure also reaches the picture recovery path',async()=>{
 let recovered=0;
 const result=await mountSpatialSafely(async()=>({}),()=>true,()=>{throw new Error('WebGL unavailable');},()=>recovered++);
 assert.equal(result,'fallback');assert.equal(recovered,1);
});

test('navigation during a pending import prevents stale setup and stale recovery',async()=>{
 for(const failed of [false,true]){
  let settle,current=true,mounted=0,recovered=0;
  const pending=new Promise((resolve,reject)=>{settle=()=>failed?reject(new Error('late network error')):resolve({});});
  const work=mountSpatialSafely(()=>pending,()=>current,()=>mounted++,()=>recovered++);
  current=false;settle();
  assert.equal(await work,'stale');assert.equal(mounted,0);assert.equal(recovered,0);
 }
});

test('successful optional 3D setup mounts exactly once without recovery',async()=>{
 const module={mountSpatial(){}};let mounted=0,recovered=0;
 const result=await mountSpatialSafely(async()=>module,()=>true,value=>{assert.equal(value,module);mounted++;},()=>recovered++);
 assert.equal(result,'ready');assert.equal(mounted,1);assert.equal(recovered,0);
});
