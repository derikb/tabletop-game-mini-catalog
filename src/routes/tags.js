import Tag from '../models/Tag.js';

/**
 * A plugin that provide encapsulated routes
 * @param {FastifyInstance} fastify encapsulated fastify instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */
async function routes (fastify, options) {

    fastify.get('/tags/all', async (request, reply) => {
        const result = fastify.dbRepo.getAllTags();
        return { tags: result };
    });

    fastify.post('/tag', async (request, reply) => {
        fastify.log.info(request.body);
        const model = new Tag(request.body);
        fastify.dbRepo.insertTag(model);
        if (model.getId() > 0) {
            reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({ tag: { id: model.getId(), name: model.getName() } });
            return;
        }
        reply
            .code(500)
            .header('Content-Type', 'application/json; charset=utf-8')
            .send({ error: 'failed to save' });
    });

    fastify.post('/tag/:tagId/delete', async (request, reply) => {
        fastify.log.info(`Delete tag ${request.params.tagId}`);

        fastify.dbRepo.deleteTag(Number(request.params.tagId));
        reply
            .code(200)
            .header('Content-Type', 'application/json; charset=utf-8')
            .send({ success: true });
    });

}

export default routes;
