// Seconds follow the supplied films. These story captions also work without sound.
export const STORIES = {
  intro: {
    title: '리피의 초대', chapter: '시작 이야기', duration: 23.55,
    src: '/assets/videos/intro.mp4', poster: '/assets/videos/intro-poster.webp',
    captions: [
      [0, 4, '안녕! 나는 초록정원의 식물 연구원, 리피야.'],
      [4, 8, '이곳에는 저마다 다른 비밀을 가진 식물들이 살아.'],
      [8, 12, '그런데 식물 이름표와 연구 기록이 뒤섞여 버렸어!'],
      [12, 16, '작은 잎을 자세히 보면, 다시 찾을 수 있을 거야.'],
      [16, 20, '모양과 가장자리를 살피며 식물의 비밀을 찾아보자.'],
      [20, 23.55, '너의 발견으로 초록정원을 함께 깨워 줄래?'],
    ],
  },
  outro: {
    title: '다시 깨어난 초록정원', chapter: '탐험의 끝', duration: 25.47,
    src: '/assets/videos/outro.mp4', poster: '/assets/videos/outro-poster.webp',
    captions: [
      [0, 4, '와, 우리가 초록정원을 다시 깨웠어!'],
      [4, 8, '작은 잎에서 시작한 발견이 정원 곳곳으로 이어졌네.'],
      [8, 12, '식물의 특징을 살피고, 알맞은 곳에 심어 주었지.'],
      [12, 16, '연잎에서 찾은 비밀은 비를 막는 가방이 되었어.'],
      [16, 20, '직접 관찰하고 시험하며 찾은 너의 소중한 발견이야.'],
      [20, 25.47, '고마워, 식물 연구원! 다음 발견도 함께하자.'],
    ],
  },
};

export function captionAt(kind, seconds) {
  return STORIES[kind]?.captions.find(([start, end]) => seconds >= start && seconds < end)?.[2] || '';
}
