

const component = require('stampit')
const redis = require('redis')
const P = require('bluebird')

module.exports = component()
  .init(function({ instance }) {
     if (instance.client) {
       this._client = instance.client
     } else if (instance.url) {
       this._client = redis.createClient(instance.url)
     }
  })
  .methods({
    set(data) {
      const serialized = JSON.stringify(data);
      return new P((resolve, reject) => {
        this._clinet.set(this._key, serialized, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    },

    get() {
      return new P((resolve, reject) => {
        this._client.get(this._key, (err, reply) => {
          if (err) {
            reject(err);
          } else {
            if (reply) {
              try {
                const parsed = JSON.parse(reply);
                resolve(parsed);
              } catch(e) {
                resolve(reply);
              }
            } else {
              resolve();
            }
          }
        });
      });
    }
  });
