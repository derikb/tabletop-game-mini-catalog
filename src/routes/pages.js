import { getPage } from '../services/pageService.js';

/**
 * A plugin that provide encapsulated routes
 * @param {FastifyInstance} fastify encapsulated fastify instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */
async function routes (fastify) {
    fastify.get('/', async (request, reply) => {
        reply.header('Content-Type', 'text/html');
        reply.send(
            await getPage(
                'Figures',
                '/',
                'figures',
            )
        );
    });

    fastify.get('/new', async (request, reply) => {
        reply.header('Content-Type', 'text/html');
        reply.send(
            await getPage(
                'Add Figure',
                '/new',
                'new',
            )
        );
    });

    fastify.get('/edit', async (request, reply) => {
        reply.header('Content-Type', 'text/html');
        reply.send(
            await getPage(
                'Edit Figure',
                '/edit',
                'new',
            )
        );
    });

    fastify.get('/tags', async (request, reply) => {
        reply.header('Content-Type', 'text/html');
        reply.send(
            await getPage(
                'Manage Tags',
                '/tags',
                'tags',
            )
        );
    });

    fastify.get('/makers', async (request, reply) => {
        reply.header('Content-Type', 'text/html');
        reply.send(
            await getPage(
                'Manage Makers',
                '/maker',
                'makers',
            )
        );
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
