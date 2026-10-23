import {STORIES, captionAt} from './story-data.js';
import {isSoundOn, setSound, stopFeedback, suspendMusic} from './audio.js';

let activeCleanup;

// Cutscenes live outside the dialog and leave research records untouched.
export function playStory(kind, {onFinish = () => {}, replay = false} = {}) {
  const story = STORIES[kind];
  if (!story) return;
  const resumeMusic = suspendMusic();
  activeCleanup?.();
  stopFeedback();
  const previousFocus = document.activeElement;
  const app = document.querySelector('#app');
  const wasInert = app.inert;
  const events = new AbortController();
  const screen = document.createElement('section');
  screen.className = 'story-screen';
  screen.dataset.story = kind;
  screen.tabIndex = -1;
  screen.setAttribute('aria-label', `${story.chapter} · ${story.title}`);
  const exitLabel = replay ? '돌아가기' : kind === 'intro' ? '건너뛰고 탐험 시작' : '탐구 기록 보기';
  screen.innerHTML = `
    <video class="story-video" playsinline preload="auto" poster="${story.poster}" aria-label="${story.title}" aria-describedby="story-caption"><source src="${story.src}" type="video/mp4"></video>
    <header class="story-heading"><div><span>${story.chapter}</span><h1>${story.title}</h1></div>
      <button class="story-button story-exit" data-story-action="exit" ${kind === 'intro' && !replay ? 'data-action="intro-start"' : ''}>${exitLabel}<span aria-hidden="true"> →</span></button>
    </header>
    <div class="story-message" role="status"><p>리피의 이야기를 준비하고 있어…</p><button class="story-button" data-story-action="retry" hidden>영상 재생하기</button></div>
    <div class="story-caption" id="story-caption"><span class="story-speaker">리피</span><p></p></div>
    <footer class="story-controls" aria-label="영상 조작">
      <button class="story-button" data-story-action="play" aria-label="일시 정지">Ⅱ <span>일시 정지</span></button>
      <button class="story-button" data-story-action="sound"></button>
      <label class="story-timeline"><span class="sr-only">영상 재생 위치</span><input type="range" min="0" max="${story.duration}" step="0.1" value="0" aria-label="영상 재생 위치"></label>
      <span class="story-time">0:00 / ${clock(story.duration)}</span>
      <button class="story-button" data-story-action="captions" aria-pressed="true">자막 켜짐</button>
    </footer>`;
  document.querySelector('#dialog')?.close();
  app.inert = true;
  document.body.classList.add('story-playing');
  document.body.append(screen);
  screen.focus({preventScroll: true});
  const video = screen.querySelector('video');
  const caption = screen.querySelector('.story-caption');
  const message = screen.querySelector('.story-message');
  const retry = screen.querySelector('[data-story-action="retry"]');
  const playButton = screen.querySelector('[data-story-action="play"]');
  const soundButton = screen.querySelector('[data-story-action="sound"]');
  const range = screen.querySelector('input');
  let finished = false, captionsOn = true;
  video.volume = 0.65;
  video.muted = !isSoundOn();
  // Supply a real caption track for assistive players; the styled copy stays in sync.
  if (globalThis.VTTCue) {
    const track = video.addTextTrack('captions', '한국어', 'ko');
    for (const [start, end, text] of story.captions) track.addCue(new VTTCue(start, end, text));
    track.mode = 'hidden';
  }
  const listen = (target, event, fn) => target.addEventListener(event, fn, {signal: events.signal});
  function cleanup() {
    events.abort();
    video.pause();
    screen.remove();
    video.querySelector('source').removeAttribute('src');
    video.load();
    resumeMusic();
    app.inert = wasInert;
    document.body.classList.remove('story-playing');
    if (previousFocus?.isConnected) previousFocus.focus({preventScroll: true});
    if (activeCleanup === cleanup) activeCleanup = undefined;
  }
  function finish() {
    if (finished) return;
    finished = true;
    cleanup();
    onFinish();
  }
  function update() {
    const time = video.currentTime;
    const text = captionAt(kind, time);
    caption.querySelector('p').textContent = text;
    caption.hidden = !captionsOn || !text;
    range.max = String(Number.isFinite(video.duration) ? video.duration : story.duration);
    range.value = String(time);
    range.style.setProperty('--story-progress', `${100 * time / Number(range.max)}%`);
    screen.querySelector('.story-time').textContent = `${clock(time)} / ${clock(Number(range.max))}`;
    playButton.innerHTML = video.paused ? '▶ <span>계속 보기</span>' : 'Ⅱ <span>일시 정지</span>';
    playButton.setAttribute('aria-label', video.paused ? '계속 보기' : '일시 정지');
    soundButton.textContent = video.muted ? '소리 꺼짐' : '소리 켜짐';
    soundButton.setAttribute('aria-label', video.muted ? '영상 소리 켜기' : '영상 소리 끄기');
    soundButton.setAttribute('aria-pressed', String(!video.muted));
  }
  function notice(text, canRetry = false) {
    message.hidden = false;
    message.querySelector('p').textContent = text;
    retry.hidden = !canRetry;
  }
  async function play() {
    try { await video.play(); }
    catch (error) {
      if (finished || error.name === 'AbortError') return;
      notice('재생 버튼을 누르면 이야기가 시작돼.', true);
    }
  }
  listen(video, 'timeupdate', update);
  listen(video, 'loadedmetadata', update);
  listen(video, 'playing', () => { message.hidden = true; update(); });
  listen(video, 'pause', update);
  listen(video, 'ended', finish);
  listen(video, 'waiting', () => notice('이야기를 조금 더 불러오고 있어…'));
  listen(video, 'error', () => notice('영상을 불러오지 못했어. 다시 재생하거나 다음으로 넘어가도 괜찮아.', true));
  listen(range, 'input', () => { video.currentTime = Number(range.value); update(); });
  listen(screen, 'click', event => {
    event.stopPropagation();
    switch (event.target.closest('[data-story-action]')?.dataset.storyAction) {
      case 'exit': finish(); break;
      case 'play': if (video.paused) void play(); else video.pause(); break;
      case 'retry': video.load(); void play(); break;
      case 'sound': video.muted = !video.muted; setSound(!video.muted); update(); break;
      case 'captions':
        captionsOn = !captionsOn;
        event.target.closest('button').setAttribute('aria-pressed', String(captionsOn));
        event.target.closest('button').textContent = captionsOn ? '자막 켜짐' : '자막 꺼짐';
        update(); break;
    }
  });
  listen(screen, 'keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); finish(); }
    if (event.key === ' ' && event.target === screen) { event.preventDefault(); if (video.paused) void play(); else video.pause(); }
    if (event.key === 'Tab') {
      const controls = [...screen.querySelectorAll('button:not([hidden]), input')].filter(el => !el.closest('[hidden]'));
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && (event.target === first || event.target === screen)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && event.target === last) { event.preventDefault(); first.focus(); }
    }
    event.stopPropagation();
  });
  listen(document, 'visibilitychange', () => { if (document.hidden) video.pause(); });
  activeCleanup = cleanup;
  update();
  void play();
  return cleanup;
}

function clock(seconds) {
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}
