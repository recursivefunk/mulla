# mulla [WIP]

Mulla caches the results for expensive operations in redis.

```javascript
const P = require('bluebird')
const Mulla = require('mulla')

const aFunc = () => {
  return new P((resolve) => {
    const result = {
      foo: 'bar'
    }
    setTimeout(() => resolve(result), 3000)
  })
}

const aFuncCache = Mulla({ url: process.env.REDIS_URL })
aFuncCache.withKey('results:aFunc').wrap(aFunc)

aFuncCache.run()
  .then((result) => {
    // Cache miss! At least 3 seconds later
  })

// ... some time later

aFuncCache.run()
  .then((result) => {
    // Cache hit! Returns as fast as redis/network can deliver!
  })
```

Mulla is best used for distributed APIs. It is also designed to work best for
side-effect-free functions. The same inputs should yield the same output every 
time the function is run. Mulla also assumes promise return values

