
/**
 * A plugin that provide encapsulated routes
 * @param {FastifyInstance} fastify encapsulated fastify instance
 */
async function routes (fastify) {

    fastify.get('/stats/all', async () => {
        const result = fastify.dbRepo.getStats();
        return { stats: result };
    });
}

export default routes;
