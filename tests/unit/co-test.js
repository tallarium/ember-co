import co from 'ember-co';
import { module, test } from 'qunit';
import { Promise } from 'rsvp';

module('Unit | co');

// Replace this with your real tests.
test('it creates an instance of Ember.RSVP.Promise', function(assert) {
  let promise = co(function*() {
    yield [];
  });
  assert.ok(promise instanceof Promise);
});
