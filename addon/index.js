import Ember from 'ember';

const {
  typeOf,
  RSVP: {
    all,
    hash,
    Promise
  }
} = Ember;


/**
 * Check if `obj` is a promise.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */
function isPromise(obj) {
  return typeOf(obj.then) === 'function';
}

/**
 * Check if `obj` is a generator.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */
function isGenerator(obj) {
  return typeOf(obj.next) === 'function' && typeOf(obj.throw) === 'function';
}

/**
 * Check if `obj` is a generator function.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */
function isGeneratorFunction({ constructor }) {
  return constructor && (
      constructor.name === 'GeneratorFunction' ||
	  constructor.displayName === 'GeneratorFunction' ||
	  isGenerator(constructor.prototype)
  );
}

/**
 * Convert a `yield`ed value into a promise.
 *
 * @param {Mixed} obj
 * @return {Promise}
 * @api private
 */
function toPromise(obj) {
  if (!obj) {
    return obj;
  }
  if (isPromise(obj)) {
    return obj;
  }
  if (isGeneratorFunction(obj) || isGenerator(obj)) {
    return co.call(this, obj);
  }
  if (typeOf(obj) === 'array') {
    return arrayToPromise.call(this, obj);
  }
  if (typeOf(obj) === 'object') {
    return objectToPromise.call(this, obj);
  }
  return obj;
}

/**
 * Convert an array of "yieldables" to a promise.
 * Uses `Promise.all()` internally.
 *
 * @param {Array} obj
 * @return {Promise}
 * @api private
 */
function arrayToPromise(obj) {
  return all(obj.map(toPromise, this));
}

/**
 * Convert an object of "yieldables" to a promise.
 * Uses `Promise.all()` internally.
 *
 * @param {Object} obj
 * @return {Promise}
 * @api private
 */
function objectToPromise(obj) {
  let promises = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      promises[key] = toPromise.call(this, obj[key]);
    }
  }
  return hash(promises);
}

/**
 * Execute the generator function or a generator
 * and return a promise.
 *
 * @param {Function} fn
 * @return {Promise}
 * @api public
 */
export default function co(gen, ...args) {
  let ctx = this;

  // we wrap everything in a promise to avoid promise chaining,
  // which leads to memory leak errors.
  // see https://github.com/tj/co/issues/180
  return new Promise(function(resolve, reject) {
    if (typeof gen === 'function') {
      gen = gen.apply(ctx, args);
    }
    if (!gen || typeOf(gen.next) !== 'function') {
      return resolve(gen);
    }

    function createStepFun(genFunName) {
      return function(resOrErr) {
        let ret;
        try {
          ret = gen[genFunName](resOrErr);
        } catch (e) {
          return reject(e);
        }
        next(ret);
        return null;
      };
    }

    /**
     * @param {Mixed} res
     * @return {Promise}
     * @api private
     */
    let onFulfilled = createStepFun('next');

    /**
     * @param {Error} err
     * @return {Promise}
     * @api private
     */
    let onRejected = createStepFun('throw');

    /**
     * Get the next value in the generator,
     * return a promise.
     *
     * @param {Object} ret
     * @return {Promise}
     * @api private
     */
    function next(ret) {
      if (ret.done) {
        return resolve(ret.value);
      }
      let value = toPromise.call(ctx, ret.value);
      if (value && isPromise(value)) {
        return value.then(onFulfilled, onRejected);
      }
      let errorLabel = 'You may only yield a function, promise, generator, array, or object, ';
      errorLabel += `but the following object was passed: ${ String(ret.value) } `;
      return onRejected(new TypeError(errorLabel));
    }

    onFulfilled();

    return null;
  });
}

/**
 * Wrap the given generator `fn` into a
 * function that returns a promise.
 * This is a separate function so that
 * every `co()` call doesn't create a new,
 * unnecessary closure.
 *
 * @param {GeneratorFunction} fn
 * @return {Function}
 * @api public
 */
co.wrap = function(fn) {
  createPromise.__generatorFunction__ = fn;
  return createPromise;
  function createPromise(...args) {
    return co.call(this, fn.apply(this, args));
  }
};

const { wrap } = co;

export { wrap };
