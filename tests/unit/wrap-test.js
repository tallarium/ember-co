import { wrap } from 'ember-co';
import { module, test } from 'qunit';
import { typeOf } from '@ember/utils';
import { Promise } from 'rsvp';

module('Unit | { wrap }');

// Replace this with your real tests.
test('it creates a function which returns a promise', function(assert) {
  let f = wrap(function*() {
    yield [];
  });
  assert.ok(typeOf(f) === 'function');
  let r = f();
  assert.ok(r instanceof Promise);
});
