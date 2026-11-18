// The map award plays once on the last hit. It never changes learning or certificate progress.
// The film carries its own captions, so it fills the screen (contain) and stays muted.
export function openMapFinale(host, source) {
 const doc=host.ownerDocument;
 if(!host.isConnected||doc.querySelector('.map-finale-dialog'))return;
 const dialog=doc.createElement('dialog');dialog.className='map-finale-dialog';
 dialog.setAttribute('aria-label','지도 모험 피날레');
 Object.assign(dialog.style,{position:'fixed',inset:'0',width:'100vw',height:'100dvh',maxWidth:'none',maxHeight:'none',margin:'0',padding:'0',border:'0',borderRadius:'0',background:'#000',color:'#fff',overflow:'hidden',zIndex:'999'});
 const title=doc.createElement('h2');title.textContent='모든 악당을 물리쳤어!';
 Object.assign(title.style,{position:'absolute',top:'max(16px,env(safe-area-inset-top))',left:'max(20px,env(safe-area-inset-left))',right:'240px',margin:'0',fontSize:'clamp(18px,2.2vw,26px)',textShadow:'0 2px 8px #000',zIndex:'1',pointerEvents:'none'});
 const video=doc.createElement('video');video.src=source;video.playsInline=true;video.muted=true;video.autoplay=true;video.preload='metadata';video.setAttribute('aria-label','지도 탐험 피날레 영상');
 Object.assign(video.style,{position:'absolute',inset:'0',display:'block',width:'100%',height:'100%',objectFit:'contain',background:'#000'});
 // Native controls only while paused, so nothing sits on the captions during playback. A tap pauses.
 const sync=()=>{video.controls=video.paused;};
 video.addEventListener('play',sync);video.addEventListener('pause',sync);
 video.addEventListener('click',()=>{if(!video.controls)video.pause();});
 const status=doc.createElement('p');status.hidden=true;status.role='status';
 Object.assign(status.style,{position:'absolute',top:'45%',left:'50%',transform:'translateX(-50%)',margin:'0',padding:'14px 24px',borderRadius:'14px',background:'#10251de6',fontSize:'18px',textAlign:'center',zIndex:'1'});
 const close=doc.createElement('button');close.type='button';close.textContent='지도로 돌아가기';
 Object.assign(close.style,{position:'absolute',top:'max(14px,env(safe-area-inset-top))',right:'max(16px,env(safe-area-inset-right))',minHeight:'48px',padding:'8px 20px',border:'1px solid #fffced66',borderRadius:'24px',color:'#fffced',background:'#10251dd9',fontSize:'16px',fontWeight:'700',cursor:'pointer',zIndex:'2'});
 dialog.append(video,title,status,close);doc.body.append(dialog);dialog.showModal();
 close.focus({preventScroll:true});
 close.addEventListener('click',()=>dialog.close());
 video.addEventListener('error',()=>{status.hidden=false;status.textContent='지금은 영상을 열 수 없어. 지도 퇴치 기록은 저장됐어.';});
 dialog.addEventListener('close',()=>{video.pause();dialog.remove();},{once:true});
 video.play().catch(()=>{video.controls=true;});
}
