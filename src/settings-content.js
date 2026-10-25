// All settings-page wording lives here (iscream-settings order). Screen text uses 해요체.
// APP_VERSION must equal package.json version — tests/settings.test.mjs and scripts/build.mjs check it.
export const APP_NAME='초록정원 연구기지';
export const APP_VERSION='0.5.0';
export const CREDIT_LINE=`${APP_NAME} v${APP_VERSION} · 기획·제작: 옐샘 & 아이스크림미디어`;
// Classroom demo gate only. Visible in client source, so it never protects data.

export const CURRICULUM='2022 개정 과학과 교육과정(교육부 고시 제2022-33호) 「(3) 식물의 생활」';
// 원문 그대로. 바꿔 쓰지 않는다.
export const STANDARDS=[
 ['4과03-01','여러 가지 식물을 관찰하여 특징에 따라 식물을 분류할 수 있다.'],
 ['4과03-02','다양한 환경에 서식하는 식물을 조사하여 식물의 생김새와 생활 방식이 환경과 관련되어 있음을 설명할 수 있다.'],
 ['4과03-03','식물의 특징을 이용하여 일상생활에서 활용할 수 있는 생활용품을 설계하여 협력적으로 소통할 수 있다.'],
];
export const STANDARDS_DISCLAIMER='이 게임만으로 성취기준 전체를 달성했다고 판단하지 않으며, 수업·토론·후속 평가와 함께 활용해 주세요.';

export const TEXT={
 title:'설정',
 music:'배경 음악',musicVolume:'배경 음악 크기',musicAbsent:'이 탐구에는 배경 음악이 없어요. 관찰에 집중하며 효과음만 들을 수 있어요.',
 map:'탐험 지도',journal:'연구 노트',activityNotes:'이번 활동의 기록',activityHelp:'이번 활동 도움말',
 sfx:'효과음',on:'켜짐',off:'꺼짐',
 largeText:'전자칠판용 큰 글자',fullscreen:'전체화면 전환',
 intro:'이 탐험을 하는 이유 다시 보기',
 ending:'엔딩 다시 보기',endingLocked:'끝까지 마치면 볼 수 있어요.',
 saveFailed:'자동 저장을 사용할 수 없어요. 브라우저 저장 설정을 확인해 주세요.',
 reset:'탐구 기록 초기화',close:'닫기',
 resetTitle:'탐구 기록을 초기화할까요?',
 resetBody:'이 기기에 저장된 잎 관찰·분류 기록, 계절 사진 기록, 잎자루 실험 기록, 내가 만든 정원과 꽃길, 가방 설계와 시험 기록, 모은 빛씨앗, 큰 글자 설정이 모두 지워져요. 소리 설정은 그대로 남아요.',
 resetCancel:'취소',resetConfirm:'기록 지우기',
teacherNote:'교사용 미리보기는 학생 기록에 반영되지 않아요. 해금을 종료하거나 새로고침하면 학생의 원래 진행으로 돌아가요.',
 teacherTools:'버튼 하나로 다섯 미션의 모든 단계를 한꺼번에 열어요. 학습 완료 기록은 자동으로 채워지지 않아요.',
 unlock:'전체 단계 해금 · 한 번에 열기',unlockOn:'전체 단계 해금 종료',
 offlinePrep:'수업 전 오프라인 준비',offlinePrepDone:'오프라인 준비 완료',
 offlinePrepNote:'학교 와이파이가 끊겨도 이어서 탐구할 수 있게 그림·입체 모형을 이 기기에 미리 저장해요. 파일을 하나씩 차례로 받아 다른 학생의 접속을 덜 방해해요. 영상은 연결될 때만 재생되고, 끊기면 건너뛸 수 있어요.',
 offlinePrepUnavailable:'이 주소에서는 오프라인 저장을 쓸 수 없어요. 수업용 배포 주소에서 한 번 연 뒤 다시 눌러 주세요.',
 offlinePrepFailed:'일부 파일을 받지 못했어요. 연결이 안정된 뒤 다시 누르면 남은 파일만 받아요.',
};

const APP_INFO=[
 ['초록정원 연구','잎·계절·환경·정원·발명 다섯 탐구를 하고, 관찰한 특징을 근거로 식물을 설명하는 힘을 연습해요.'],
 ['미션 보상','현장 임무와 연구 기록을 마치면 도구와 빛씨앗을 받아요. 모은 도구로 다음 탐구의 단서를 꺼내고, 다섯 장소를 모두 깨우면 탐험 일기와 연구 노트로 나의 발견을 돌아봐요.'],
 ['남는 배움','고른 첫 예상과 첫 응답·관찰과 시험 결과·고친 선택·새 식물에 적용한 판단이 연구 노트에 남아요. 미리 작성한 설명은 탐구 내용 정리로 구분해요. 이전에 저장하지 않은 첫 응답은 확인되지 않음으로 표시해요.'],
];
const STUDENT_GUIDE=[
 '시작 화면의 탐험 버튼을 누르고 리피와 길을 따라 다음 연구 장소로 가요.',
 '리피의 부탁을 읽고 세 가지 현장 임무를 해요. 끌어 옮기고, 순서를 잇고, 조립하고, 시험한 뒤 발견을 연구 노트에 담아요.',
 '탐구를 마치면 장소가 깨어나고 도구와 빛씨앗을 받아요. 탐험 도구를 열면 모은 도구로 다음 단서를 꺼낼 수 있어요. 기록은 이 기기에 자동 저장돼요.',
 '터치로 대상을 고른 뒤 놓을 곳을 눌러요. 키보드는 Tab으로 옮기고 Enter로 골라요.',
 '단면과 확대 그림은 원리를 보여 주려고 단순하게 나타낸 모형이에요. 실제 크기와는 달라요.',
];
const TEACHER_GUIDE=[
 '전자칠판에서는 한 단계씩 함께 읽고 학생의 선택 근거를 먼저 물어봐 주세요.',
 '서로 다른 답은 오답으로 끝내지 말고 관찰한 특징과 실험 결과를 비교하는 토론으로 연결해 주세요.',
 '활동 기록은 서버로 보내지 않고 이 브라우저에만 저장돼요.',
 '사이트 데이터를 지우면 기록도 사라져요. 혼자 마친 기록과 친구와 이야기했다는 학생 기록은 구분하고, 실제 성취는 학생의 설명과 수업 중 관찰로 확인해 주세요.',
];
const NOTICE=[
 '캐릭터·배경·장식은 프로젝트 자체 AI 생성 이미지예요.',
 '장면 그림은 실제 현장 사진이 아닌 학습용 재현 이미지예요. 단면과 확대 그림은 실제 크기·축척과 달라요.',
 '제목 로고와 캐릭터 원안도 기획자가 생성형 AI로 만든 이미지예요.',
 '메인·엔딩 배경 음악 2곡은 기획자가 Suno로 만든 프로젝트 자체 AI 생성 음원이에요. 효과음은 앱 코드에서 직접 만든 짧은 소리예요. 영상 재생 중에는 배경 음악이 멈춰요.',
 '일부 입체 식물은 Meshy AI로 생성한 뒤 가공한 모형이에요. 그림과 입체 모형은 원리를 이해하기 쉽게 단순화했어요.',
 '출처와 라이선스 상세 내용은 assets/CREDITS.md에서 확인할 수 있어요.',
];
const SOURCES=[
 ['교육 내용 참고',['미국 플로리다대학교 IFAS · ask.ifas.ufl.edu','미국 국립독성프로그램 NTP · ntp.niehs.nih.gov','연잎 표면 연구 · Planta, 1997']],
 ['프로그램과 글꼴',['Three.js r181 · MIT License','Jua · SIL Open Font License 1.1','Pretendard · SIL Open Font License 1.1']],
];
const RIGHTS=[
 'ⓒ 2026 옐샘 & 아이스크림미디어. All rights reserved.',
 '앱 화면 캡처·자체 제작 일러스트·자체 제작 음원은 무단 복제·재배포·전용·상업적 이용을 금지해요.',
 'Three.js(MIT)·글꼴(Jua, Pretendard — SIL OFL 1.1)과 참고 자료의 저작권은 각 원저작자와 소장 기관에 있으며, 각 자료의 이용 조건을 따라요.',
 '교육 내용 구성 참고: 미국 플로리다대학교 IFAS(ask.ifas.ufl.edu), 미국 국립독성프로그램 NTP(ntp.niehs.nih.gov), Planta(1997, 연잎 표면 연구).',
];

const fold=(key,title,body)=>`<details class="settings-fold" data-key="${key}"><summary>${title}</summary><div class="settings-fold-body">${body}</div></details>`;
const lines=list=>list.map(t=>`<p>${t}</p>`).join('');
// Hidden entirely while the list is empty.
export function standardsSection(list=STANDARDS){
 if(!list.length)return '';
 return fold('standards','성취기준',`<p>${CURRICULUM}과 연계한 탐구 보조 활동이에요. ${STANDARDS_DISCLAIMER}</p><ul class="standards-list">${list.map(([code,text])=>`<li><strong>[${code}]</strong> ${text}</li>`).join('')}</ul>`);
}
export const appInfoSection=(tools='')=>fold('info','앱 정보 · 배움과 보상',`<dl class="settings-info">${APP_INFO.map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl><p class="settings-credit">${CREDIT_LINE}</p>${tools}`);
export const studentSection=()=>fold('student','학생용 가이드',lines(STUDENT_GUIDE));
// teacherTools: the one-tap unlock-all demo tool, built by app.js.
export const teacherSection=teacherTools=>fold('teacher','교사용 가이드',lines(TEACHER_GUIDE)+standardsSection()+fold('tools','교사용 도구',teacherTools));
export const noticeSection=()=>fold('notice','이미지·소리·저작권 고지',lines(NOTICE)+fold('sources','자료 출처 모아 보기',`<p>미션 화면에는 출처를 표시하지 않고 이곳에 모아 두었어요.</p>${SOURCES.map(([group,items])=>`<h4>${group}</h4><ul>${items.map(i=>`<li>${i}</li>`).join('')}</ul>`).join('')}`)+`<div class="settings-rights">${lines(RIGHTS)}</div>`);
