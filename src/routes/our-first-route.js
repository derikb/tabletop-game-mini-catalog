import Figure from '../models/Figure.js';
import Maker from '../models/Maker.js';
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
  }

export default routes;
