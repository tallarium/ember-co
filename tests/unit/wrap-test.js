import { wrap } from 'ember-co';
import { module, test } from 'qunit';
import Ember from 'ember';

module('Unit | { wrap }');

// Replace this with your real tests.
test('it creates a function which returns a promise', function(assert) {
  let f = wrap(function*() {
    yield [];
  });
  assert.ok(Ember.typeOf(f) === 'function');
  let r = f();
  assert.ok(r instanceof Ember.RSVP.Promise);
});
