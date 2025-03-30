/**
 * A plugin that provide encapsulated routes
 * @param {FastifyInstance} fastify encapsulated fastify instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */
async function routes (fastify, options) {
    fastify.get('/', async (request, reply) => {
        reply.sendFile('index.html');
        return reply;
    });

    fastify.get('/figures', async (request, reply) => {
        reply.sendFile('figures.html');
        return reply;
    });

    fastify.get('/tags', async (request, reply) => {
        reply.sendFile('tags.html');
        return reply;
    });

    fastify.get('/makers', async (request, reply) => {
        reply.sendFile('makers.html');
        return reply;
    });

    fastify.get('/test', async (request, reply) => {
        const result = fastify.dbRepo.getAllFigures();
        fastify.log.info(result);

        reply.send({
            result,
        });
    });
};

export default routes;
