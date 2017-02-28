# ember-co

[![Build Status](https://travis-ci.org/akatov/ember-co.svg?branch=master)](https://travis-ci.org/akatov/ember-co)
[![npm Version](https://img.shields.io/npm/v/ember-co.svg?style=flat-square)](https://www.npmjs.org/package/ember-co)
[![Ember Observer Score](http://emberobserver.com/badges/ember-popout.svg)](http://emberobserver.com/addons/ember-co)

A [tj/co](https://github.com/tj/co) implementation for [Ember](http://emberjs.com/).

## Installation

```bash
ember install ember-co
```

## Usage

To create a Promise

```js
import co from 'ember-co';
...
let companyNamePromise = co(function*() {
  let user = yield this.store.findRecord('user', 'Johnny');

  // assuming the User model has an asynchronous `belongsTo` relationship with Company model
  let company = yield user.get('company');

  // name can be both a synchronous and an asynchronous property
  return company.get('name');
}, 'promise label'); // label is optional

console.assert(companyNamePromise instanceof Ember.RSVP.Promise, 'co returns an Ember promise');

companyNamePromise.then(console.log)
```

To create a function that returns a Promise

```js
import { wrap } from 'ember-co';

let UserRoute = Ember.Route.extend({
  model: wrap(function*({ id }) {
    let user = yield this.store.findRecord('user', id);
    this.set('user', user);
    let friends = user.get('friends');
    return { user, friends };
  }, 'model promise'), // label is optional

  actions: {
    updateCompanyName: wrap(function*(newName) {
      this.get('user');
      let company = yield user.get('company');
      company.set('name', newName);
    }, 'update company name action'), // label is optional
  }
});
```
