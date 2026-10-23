import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {readFile} from 'node:fs/promises';
import {createServer} from 'node:net';

test('영상·음원은 MIME·전체 길이·구간·끝 구간·잘못된 구간을 올바르게 응답한다', async t => {
  const reservation = createServer();
  reservation.listen(0, '127.0.0.1');
  await once(reservation, 'listening');
  const port = reservation.address().port;
  await new Promise(resolve => reservation.close(resolve));
  const child = spawn(process.execPath, ['server.mjs'], {
    cwd: new URL('../', import.meta.url), env: {...process.env, PORT: String(port)}, stdio: ['ignore', 'pipe', 'inherit'],
  });
  t.after(() => child.kill());
  await once(child.stdout, 'data');
  for (const [file,mime] of [['videos/intro.mp4','video/mp4'],['videos/outro.mp4','video/mp4'],['audio/main-theme.mp3','audio/mpeg'],['audio/ending-theme.mp3','audio/mpeg']]) {
    const bytes = await readFile(new URL(`../assets/${file}`, import.meta.url));
    const url = `http://127.0.0.1:${port}/assets/${file}`;
    const head = await fetch(url, {method: 'HEAD'});
    assert.equal(head.headers.get('content-type'), mime);
    assert.equal(Number(head.headers.get('content-length')), bytes.length);
    assert.equal((await head.arrayBuffer()).byteLength, 0);
    for (const [range, start, end] of [['bytes=0-1023', 0, 1023], ['bytes=-64', bytes.length - 64, bytes.length - 1], [`bytes=${bytes.length - 32}-`, bytes.length - 32, bytes.length - 1]]) {
      const response = await fetch(url, {headers: {Range: range}});
      assert.equal(response.status, 206);
      assert.equal(response.headers.get('content-range'), `bytes ${start}-${end}/${bytes.length}`);
      assert.deepEqual(Buffer.from(await response.arrayBuffer()), bytes.subarray(start, end + 1));
    }
    for (const range of ['bytes=12-1', 'bytes=-', `bytes=${bytes.length}-`, 'bytes=0-1,4-5']) {
      const response = await fetch(url, {headers: {Range: range}});
      assert.equal(response.status, 416);
      assert.equal(response.headers.get('content-range'), `bytes */${bytes.length}`);
    }
  }
});
