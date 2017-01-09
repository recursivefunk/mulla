
require('dotenv').config({ path: 'test/test.env' })

const test = require('ava')
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

test('it works', async t => {
  const client = redis.createClient()
  const key = 'afunc'
  const url = process.env.REDIS_URL
  const cache = Mulla({ url }).withKey(key).wrap(aFunc)
  const result = await cache.run()
  const cacheKey = cache.getKey()
  const val = await client.getAsync(cacheKey)
  t.ok(val, 'the expected key data exists')
  const parsedVal = JSON.parse(val)
  t.truthy(parsedVal.foo, `the 'foo' key exists`)
  t.is(parsedVal.foo, 'bar', `foo='bar'`)
  // cleanup
  cache.quit(true)
  client.end(true)
})
