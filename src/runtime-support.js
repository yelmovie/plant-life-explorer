// Optional 3D must never block the underlying picture-based activity.
export async function mountSpatialSafely(load,isCurrent,mount,recover){
 try{
  const module=await load();
  if(!isCurrent())return 'stale';
  mount(module);
  return 'ready';
 }catch{
  // A delayed failure from a previous screen must not replace the current view.
  if(!isCurrent())return 'stale';
  recover();
  return 'fallback';
 }
}
