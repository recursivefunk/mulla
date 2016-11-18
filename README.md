# mulla [WIP]

Mulla uses redis to cache the results for expensive operations.

```javascript
const env = require('good-env')
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

const url = env.get('REDIS_URL', 'redis://localhost:6379')
const aFuncCache = Mulla({ url })

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

Mulla is designed to work best for side-effect-free functions calls - the same input(s) should yield the same output every 
time the function is run. Mulla also assumes promise return values

