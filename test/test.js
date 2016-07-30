
require('dotenv').config({ path: 'test/test.env' })

const test = require('tape')
const P = require('bluebird')
const redis = require('redis')
const co = require('co')
const Mulla = require('../index')

const aFunc = () => {
  const result = {
    foo: 'bar'
  }
  return P.resolve(result)
}

P.promisifyAll(redis.RedisClient.prototype)

test('it works', t => {
  co(function*() {
    const client = redis.createClient()
    const key = 'afunc'
    const url = process.env.REDIS_URL
    const cache = Mulla({ url }).withKey(key).wrap(aFunc)
    const result = yield cache.run()
    const cacheKey = cache.getKey()
    const val = yield client.getAsync(cacheKey)
    t.ok(val, 'the expected key data exists')
    const parsedVal = JSON.parse(val)
    t.ok(parsedVal.foo, `the 'foo' key exists`)
    t.equal(parsedVal.foo, 'bar', `foo='bar'`)
    // cleanup
    cache.quit(true)
    client.end(true)
    t.end()
})
  .catch((err) => t.fail(err))
})
