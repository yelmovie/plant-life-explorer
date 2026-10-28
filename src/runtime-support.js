// Why 3D fell back to pictures: the file never arrived (network), arrived but could not be read (model),
// or the device cannot draw 3D (webgl). The picture activity is the same in every case.
export const SPATIAL_FAIL={network:'입체 자료를 받지 못했어. 인터넷 연결을 확인하거나 그림으로 같은 탐구를 이어가 줘.',model:'입체 모형 파일을 열지 못했어. 그림으로 같은 탐구를 이어가 줘.',webgl:'이 기기에서는 입체 화면을 그릴 수 없어. 그림으로 같은 탐구를 이어가면 돼.'};
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
