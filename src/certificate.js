import {canFinish} from './model.js';
import {mountCertificateWax} from './certificate-wax.js';
import {playMapEncounter} from './audio.js';
import {shownItems,wrapTabAtEnds} from './certificate-focus.js';
import {saveCertificatePng} from './certificate-png.js';
const blank=(field,label)=>`<span class="cert-field"><span class="cert-blank" data-cert-blank="${field}" aria-label="${label} 적는 빈칸"></span><span>${label}</span></span>`;

/** Reads the same completed missions as the ending; the printed name never enters the save. */
export const canIssueGardenCertificate=state=>!state.adminUnlocked&&(state.legacyFinished||(state.finished&&canFinish(state)));
export function openGardenCertificate(state,{announce,onClose}){
 if(!canIssueGardenCertificate(state))return;

 const date=new Date().toLocaleDateString('ko-KR',{timeZone:'Asia/Seoul'});
 const opener=document.activeElement;
 const overlay=document.createElement('dialog');overlay.className='certificate-layer';overlay.id='garden-certificate';overlay.setAttribute('aria-label','초록정원 식물 연구원 인증서');
 overlay.innerHTML=`<section class="force-cert-dialog"><article class="cert-paper"><img class="cert-frame" src="/assets/generated/certificate-frame-20261122.webp" alt=""><div class="cert-content"><p class="cert-world">초록정원 연구기지 · 식물 탐험대</p><h2 class="cert-title" id="garden-cert-title">초록정원 식물 연구원 인증서</h2><div class="cert-recipient"><div class="cert-school-row">${blank('school','학교')}${blank('grade','학년')}${blank('class','반')}${blank('number','번')}</div><div class="cert-name-row"><span>이름</span><span class="cert-blank" data-cert-blank="name" aria-label="이름 적는 빈칸"></span></div></div><p class="cert-award">위 연구원은 잎을 관찰하고 계절과 사는 환경을 탐구하며,<br>식물에 맞는 정원과 연잎에서 생각해 낸 가방을 완성하였으므로<br>이 인증서를 수여함.</p><div class="cert-bottom"><p class="cert-date"><small>발급일</small>${date}</p><div class="cert-stamp" aria-label="식물 탐구 인증 도장"><span>✦</span><b>식물 탐구<br>연구원 인증</b></div><p class="cert-giver"><small>수여자</small>초록정원 연구기지<br>리피와 방울</p></div><p class="cert-credit">기획·제작: 옐샘 & ⓒ 아이스크림미디어</p></div></article><p class="cert-note">인쇄한 뒤 학교·반·번호·이름을 직접 적어요.</p><div class="cert-actions"><button type="button" class="btn primary" id="certificate-print">인증서 인쇄 / PDF 저장</button><button type="button" class="btn primary" id="certificate-png">PNG 저장</button><button type="button" class="btn soft" id="certificate-close">닫기</button></div></section>`;
 const close=()=>overlay.close();
 overlay.addEventListener('close',()=>{overlay.remove();onClose?.();if(opener?.isConnected)opener.focus({preventScroll:true});},{once:true});
 overlay.addEventListener('modal-dismiss',close);
 overlay.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();close();}else if(event.key==='Tab')wrapTabAtEnds(event,shownItems(overlay,'button:not(:disabled)'));});
 overlay.querySelector('#certificate-print').onclick=()=>window.print();
 overlay.querySelector('#certificate-close').onclick=close;
 overlay.querySelector('#certificate-png').onclick=async event=>{const button=event.currentTarget;button.disabled=true;try{await saveCertificatePng(overlay.querySelector('.cert-paper'),'초록정원_식물연구원_인증서.png');announce('인증서 PNG를 저장했어요.');}catch{announce('인증서 그림을 불러오지 못했어요. 연결을 확인하고 다시 눌러 주세요.');}finally{button.disabled=false;}};
 document.body.append(overlay);overlay.showModal();mountCertificateWax(overlay.querySelector('.cert-paper'),{label:'식물 탐구\n연구원 인증',onImpact:()=>playMapEncounter('finish',3)});overlay.querySelector('#certificate-print').focus({preventScroll:true});
}
