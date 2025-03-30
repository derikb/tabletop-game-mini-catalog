import Figure from '../models/Figure.js';
import Tag from '../models/Tag.js';

/**
 * A plugin that provide encapsulated routes
 * @param {FastifyInstance} fastify encapsulated fastify instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */
async function routes (fastify, options) {

    // Home page
    fastify.get('/', async (request, reply) => {
        reply.sendFile('index.html');
        return reply;
    })

    fastify.get('/tags', async (request, reply) => {
        reply.sendFile('tags.html');
        return reply;
    })

    fastify.get('/test', async (request, reply) => {
        const result = fastify.dbRepo.getAllFigures();
        fastify.log.info(result);

        reply.send({
            result,
        });
    })

    fastify.get('/tags/all', async (request, reply) => {
        const result = fastify.dbRepo.getAllTags();
        return { tags: result };
    })

    fastify.post('/tag', async (request, reply) => {
        fastify.log.info(request.body);
        const model = new Tag(request.body);
        fastify.dbRepo.insertTag(model);
        if (model.getId() > 0) {
            reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({ tag: { id: model.getId(), name: model.getName() }});
            return;
        }
        reply
        .code(500)
        .header('Content-Type', 'application/json; charset=utf-8')
        .send({ error: 'failed to save' });
    })

    fastify.post('/tag/:tagId/delete', async (request, reply) => {
        fastify.log.info(`Delete tag ${request.params.tagId}`);

        fastify.dbRepo.deleteTag(Number(request.params.tagId));
        reply
            .code(200)
            .header('Content-Type', 'application/json; charset=utf-8')
            .send({ success: true});
    })

    // fastify.get('/animals/:animal', async (request, reply) => {
    //   const result = await collection.findOne({ animal: request.params.animal })
    //   if (!result) {
    //     throw new Error('Invalid value')
    //   }
    //   return result
    // })

    // const animalBodyJsonSchema = {
    //   type: 'object',
    //   required: ['animal'],
    //   properties: {
    //     animal: { type: 'string' },
    //   },
    // }

    // const schema = {
    //   body: animalBodyJsonSchema,
    // }

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

    fastify.post('/figure/:figureId', async (request, reply) => {
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
        // update model... from request.body

        fastify.dbRepo.updateFigure(model);
        if (model.getId() > 0) {
            reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({ id: model.getId() });
            return;
        }
        reply
        .code(500)
        .header('Content-Type', 'application/json; charset=utf-8')
        .send({ error: 'failed to save' });
    });
  }

export default routes;
