import Figure from '../models/Figure.js';
import Maker from '../models/Maker.js';

/**
 * A plugin that provide encapsulated routes
 * @param {FastifyInstance} fastify encapsulated fastify instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */
async function routes (fastify, options) {

    fastify.get('/figures/all', async (request, reply) => {
        const result = fastify.dbRepo.getAllFigures();
        return { figures: result };
    });

    fastify.get('/figure/:figureId', async (request, reply) => {
        const { figureId } = request.params;
        const model = fastify.dbRepo.getFigure(figureId);
        if (!model) {
            reply
            .code(404)
            .header('Content-Type', 'application/json; charset=utf-8')
                .send({ error: 'Figure not found' });
            return;
        }
        return { figure: model };
    });

    fastify.post('/figure', { schema: { body: fastify.getSchema('figure') }}, async (request, reply) => {
        fastify.log.info(request.body);
        const model = new Figure(request.body);
        fastify.dbRepo.insertFigure(model);

        if (model.getId() <= 0) {
            reply
                .code(500)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({ error: 'failed to save' });
        }

        if (model.getTagIds().length > 0) {
            fastify.dbRepo.assignTags(model.getTagIds(), model.getId());
        }

        reply
            .code(200)
            .header('Content-Type', 'application/json; charset=utf-8')
            .send({ id: model.getId() });
        return;
    });

    fastify.post('/figure/:figureId', { schema: { body: fastify.getSchema('figure') }}, async (request, reply) => {
        fastify.log.info(request.body);

        const { figureId } = request.params;
        const model = fastify.dbRepo.getFigure(figureId);
        if (!model) {
            reply
            .code(500)
            .header('Content-Type', 'application/json; charset=utf-8')
                .send({ error: 'Figure not found' });
            return;
        }
        model.updateFromForm(request.body);
        fastify.dbRepo.updateFigure(model);
        fastify.dbRepo.assignTags(model.getTagIds(), model.getId());
        reply
            .code(200)
            .header('Content-Type', 'application/json; charset=utf-8')
            .send({ id: model.getId() });
    });

    fastify.post('/figure/:figureId/delete', async (request, reply) => {
        const { figureId } = request.params;
        if (!fastify.dbRepo.deleteFigure(figureId)) {
            reply
            .code(500)
            .header('Content-Type', 'application/json; charset=utf-8')
                .send({ error: 'Failed to delete the Figure.' });
            return;
        }
        reply
            .code(200)
            .header('Content-Type', 'application/json; charset=utf-8')
            .send({ id: figureId });
    });
}

export default routes;
