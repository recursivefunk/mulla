
const component = require('stampit')
const P = require('bluebird')
const cuid = require('cuid')
const Redis = require('./components/redis')

const Mulla = component()
  .methods({

    getKey() {
      return this._key
    },

    withKey(key=`${cuid()}`) {
      this._key = `mulla:${key}`
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

    quit(forceEnd=false) {
      if (this._client) {
        this._client.quit()
        if (forceEnd) {
          this._client.end(true)
        }
      }
    },

    run() {
      return new P((resolve, reject) => {
        let update = false
        this.get(this._key)
            .then((cacheHit) => {
              if (cacheHit) {
                return P.resolve(cacheHit)
              } else {
                update = true
                return this._func()
              }
          })
          .then((data) => {
            if (update) {
              // This is an async process but we're not waiting on it to finish
              this.set(data)
            }
            return P.resolve(data)
          })
          .then((result) => resolve(result))
          .catch((err) => reject(err))
      })
    },

  }).compose(Redis)

module.exports = (opts) => {
  return Mulla.create(opts)
}
