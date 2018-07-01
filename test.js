const fastify = require("fastify")({
    logger: false
});

fastify.get("/", async () => {
    return {hello: true};
});

fastify.register(require("./index"), {
    features: ["fetch", "flexbox"],
    partially: []
});

fastify.listen(8888, function (err, address) {
    if (err) {
        console.trace(err);
        fastify.log.error(err)
        process.exit(1)
    }
    fastify.log.info(`server listening on ${address}`)
    console.log(`server listening on ${address}`)
});