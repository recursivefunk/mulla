
const component = require('stampit')
const P = require('bluebird')
const cuid = require('cuid')
const RedisComponent = require('./redis-component')

const Mulla = component()
  .methods({

    getKey() {
      return this._key
    },

    withKey(key=`mulla:${cuid()}`) {
      this._key = key
      return this
    },

    wrap(func) {
      if (typeof func === 'function') {
        this._func = func
        return this
      } else {
        throw Error(`${func} is not a function!`)
      }
    },

    run() {
      return new P((resolve, reject) => {
        let update = false;
        this.get(this._key)
            .then((cacheHit) => {
              if (cacheHit) {
                return P.resolve(cacheHit);
            } else {
              update = true;
              return this.func();
            }
          })
          .then((data) => {
            if (update) {
              // This is an async process but we're not waiting on it to finish
              this.set(data);
            }
            return P.resolve(data);
          })
          .then((result) => resolve(result))
          .catch((err) => reject(err));
      });
    },

  }).compose(RedisComponent)

module.exports = (opts) => {
  return Mulla.create(opts)
}
