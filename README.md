# Feature requirement

This fastify plugin checks if a user meets the required browser features or redirects him to [browser-update.org](browser-update.org). You can also determine what should happen if the user doesn't meet the requirements. 

## Usage

```javascript
const fastify = require("fastify")();

fastify.register(require("fastify-require-feature"), {
	features: ["flexbox"], // features which need to be supported 100% 
	partially: ["fetch"], // feature which can be supported partially
	action: "http://link.org" // or
	action: (request, reply, done) => {
		// Like a fastify hook
		done();
	}
});

// Your stuff

fastify.listen(8888, () => console.log("Ready"));
```

## Used modules

- [caniuse-api](https://github.com/Nyalab/caniuse-api)
- [fastify-plugin](https://github.com/fastify/fastify-plugin)
- [lodash.get](https://github.com/lodash/lodash)
- [useragent](https://github.com/3rd-Eden/useragent)