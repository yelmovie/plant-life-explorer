import {test} from 'node:test';
import assert from 'node:assert/strict';
import {STORIES, captionAt} from '../src/story-data.js';

test('두 영상의 자막은 첫 장면부터 마지막 장면까지 끊김 없이 이어진다', () => {
  for (const [kind, story] of Object.entries(STORIES)) {
    let end = 0;
    for (const [start, nextEnd, text] of story.captions) {
      assert.equal(start, end);
      assert.ok(nextEnd > start);
      assert.ok(text.length > 0 && text.length < 50);
      assert.equal(captionAt(kind, start), text);
      assert.equal(captionAt(kind, nextEnd - 0.01), text);
      end = nextEnd;
    }
    assert.equal(end, story.duration);
    assert.equal(captionAt(kind, end), '');
    assert.equal(captionAt(kind, -1), '');
  }
});
