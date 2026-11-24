import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { PLANT_CONCEPTS } from '../src/plant-concepts.js';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const url = process.env.VIDEO_URL || 'http://127.0.0.1:4369/';
const output = process.env.VIDEO_OUTPUT;
if (output) await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.BROWSER_EXECUTABLE,
  args: ['--disable-webgl', '--disable-breakpad', '--disable-crash-reporter'],
});
const sizes = [[1893,935], [1280,720], [1024,768], [844,390], [390,844], [320,568]];

const overlaps = (a, b) => Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x) > 1 &&
  Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y) > 1;

async function noOverlap(elements, label) {
  const boxes = await Promise.all(elements.map(element => element.boundingBox()));
  assert.ok(boxes.every(Boolean), label + ' is visible');
  for (const [i, box] of boxes.entries()) {
    assert.ok(boxes.slice(i + 1).every(other => !overlaps(box, other)), label + ' has no overlapping elements');
  }
}

async function reachable(control) {
  await control.scrollIntoViewIfNeeded();
  assert.ok(await control.evaluate(el => {
    const { x, y, width, height } = el.getBoundingClientRect();
    return x >= -1 && x + width <= innerWidth + 1 && height >= 43.5 &&
      el.contains(document.elementFromPoint(x + width / 2, y + height / 2));
  }), await control.textContent() || 'Playback position');
}

async function verifyStory(page, kind, size) {
  const story = page.locator(`[data-story="${kind}"]`);
  const video = story.locator('video');
  const title = story.locator('h1');
  const exit = story.locator('[data-story-action="exit"]');
  const play = story.locator('[data-story-action="play"]');
  const sound = story.locator('[data-story-action="sound"]');
  const timeline = story.locator('input[type="range"]');
  await video.waitFor();
  await page.waitForFunction(() => document.querySelector('.story-video')?.readyState >= 2);
  if (!await video.evaluate(el => el.paused)) await play.click();
  await timeline.evaluate(el => {
    el.value = '10';
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.waitForFunction(() => {
    const el = document.querySelector('.story-video');
    return el.paused && !el.seeking && Math.abs(el.currentTime - 10) < .15;
  });
  assert.equal(await story.locator('[data-story-action="captions"]').count(), 0);
  const caption = story.locator('#story-caption.sr-only');
  assert.ok((await caption.textContent()).trim());
  assert.ok(await caption.evaluate(el => el.getBoundingClientRect().height <= 1 && getComputedStyle(el).overflow === 'hidden'));
  assert.ok(await video.evaluate(el => !el.controls && Array.from(el.textTracks).every(track => track.mode !== 'showing')));
  await noOverlap([video, title, exit, play, sound, timeline, story.locator('.story-time')], kind);
  for (const control of [exit, play, sound, timeline]) await reachable(control);
  if (output) await page.screenshot({ path: join(output, `${size}-${kind}.png`) });
  await play.click();
  await page.waitForFunction(() => {
    const el = document.querySelector('.story-video');
    return !el.paused && el.currentTime > 10;
  });
  await noOverlap([video, exit, play, sound, timeline], kind + ' during playback');
  await exit.click();
  await story.waitFor({ state: 'detached' });
}

async function verifyConcepts(page, size) {
  const report = page.locator('main.ending [data-action="report"]');
  await reachable(report);
  await report.click();
  for (const [chapter, concept] of PLANT_CONCEPTS.entries()) {
    await page.locator(`main [data-action="note-open"][data-id="${chapter}"]`).click();
    const dialog = page.locator('#dialog[open]');
    await dialog.locator('.note-content-summary summary').click();
    const player = dialog.locator('plant-concept-player');
    const caption = player.locator('.plant-concept-caption');
    const frames = await player.locator('[data-frame]').all();
    const play = player.locator('[data-plant-play]');
    assert.equal(await caption.count(), 1);
    assert.equal(frames.length, 3);
    await noOverlap([caption, ...frames, play], `concept ${chapter + 1}`);
    for (const [i, frame] of frames.entries()) {
      await reachable(frame);
      await frame.click();
      assert.equal(await caption.textContent(), concept.frames[i][2]);
      assert.equal(await player.locator('[aria-pressed="true"]').count(), 1);
    }
    await reachable(play);
    await play.click();
    assert.equal(await caption.textContent(), concept.frames[0][2]);
    assert.equal(await play.textContent(), '일시정지');
    await play.click();
    if (output && chapter === 4) await page.screenshot({ path: join(output, `${size}-concept.png`) });
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' });
  }
}

try {
  for (const [width, height] of sizes) {
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: true });
    try {
      const page = await context.newPage();
      page.setDefaultTimeout(10000);
      const pageErrors = [];
      page.on('pageerror', error => pageErrors.push(error.message));
      await page.goto(url);
      await page.evaluate(() => document.fonts.ready);
      const size = `${width}x${height}`;
      await page.locator('main.home [data-action="begin"]').click();
      await verifyStory(page, 'intro', size);
      await page.locator('main.stage-map').waitFor();
      await page.evaluate(() => localStorage.setItem('green-garden-mvp-v2', JSON.stringify({
        version: 1, screen: 'ending', completed: Array(10).fill(true), finished: true,
      })));
      await page.reload();
      await page.locator('main.ending [data-action="outro-replay"]').click();
      await verifyStory(page, 'outro', size);
      await verifyConcepts(page, size);
      assert.deepEqual(pageErrors, []);
      console.log(`${size}: intro, outro, and all five concept players passed`);
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}
