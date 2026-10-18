// Short interface feedback only. Audio starts after a user gesture, never on load.
let context;
export function playClick(enabled){
  if(!enabled)return;
  const AudioContext=window.AudioContext||window.webkitAudioContext;
  if(!AudioContext)return;
  try{
    context ||= new AudioContext();
    if(context.state==='suspended')void context.resume().catch(()=>{});
    const tone=context.createOscillator(),volume=context.createGain(),now=context.currentTime;
    tone.type='sine';tone.frequency.setValueAtTime(620,now);tone.frequency.exponentialRampToValueAtTime(440,now+.065);
    volume.gain.setValueAtTime(0,now);volume.gain.linearRampToValueAtTime(.035,now+.006);volume.gain.exponentialRampToValueAtTime(.0001,now+.075);
    tone.connect(volume);volume.connect(context.destination);tone.start(now);tone.stop(now+.08);
    tone.onended=()=>{tone.disconnect();volume.disconnect();};
  }catch{/* Keep controls usable on browsers without audio support. */}
}
export function muteAudio(){if(context?.state==='running')void context.suspend().catch(()=>{});}
