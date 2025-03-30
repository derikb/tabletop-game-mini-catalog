import Figure from '../models/Figure.js';
import Maker from '../models/Maker.js';

/**
 * A plugin that provide encapsulated routes
 * @param {FastifyInstance} fastify encapsulated fastify instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */
async function routes (fastify, options) {

    fastify.get('/makers/all', async (request, reply) => {
        const result = fastify.dbRepo.getAllMakers();
        return { makers: result };
    });

    fastify.post('/maker', async (request, reply) => {
        fastify.log.info(request.body);
        const model = new Maker(request.body);
        fastify.dbRepo.insertMaker(model);
        if (model.getId() > 0) {
            reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({ maker: { id: model.getId(), name: model.getName() } });
            return;
        }
        reply
            .code(500)
            .header('Content-Type', 'application/json; charset=utf-8')
            .send({ error: 'failed to save' });
    });

    fastify.post('/maker/:makerId/delete', async (request, reply) => {
        fastify.log.info(`Delete maker ${request.params.makerId}`);

        fastify.dbRepo.deleteMaker(Number(request.params.makerId));
        reply
            .code(200)
            .header('Content-Type', 'application/json; charset=utf-8')
            .send({ success: true });
    });
}

export default routes;
