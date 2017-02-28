import Ember from 'ember';
import co, { wrap } from 'ember-co';

export default Ember.Route.extend({
  afterModel() {

    let g = function*(...args) {
      yield [];
      return args[0];
    };

    let p = co(g, 'hello', 'there');

    p.then(console.info);

    let f = wrap(g, 'hi', 'there');

    f('friend').then(console.info);

    new Ember.RSVP.Promise((resolve) => resolve('yes'), 'dalabel').then(console.info);

    Ember.RSVP.reject('tada', 'anotherlabel').then(console.info);
    
  }
});
