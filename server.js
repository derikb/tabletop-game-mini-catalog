import Fastify from 'fastify';
import pagesRoute from './src/routes/pages.js';
import figureRoutes from './src/routes/figures.js';
import makerRoutes from './src/routes/makers.js';
import statRoutes from './src/routes/stats.js';
import tagRoutes from './src/routes/tags.js';
import dbConnector from './src/plugins/db-connector.js';
import bootstrapTables from './src/plugins/db-bootstrap.js';
import repo from './src/plugins/db-repo.js';
import fastifyStatic from '@fastify/static';
import path from 'node:path';
import FigureSchema from './src/schemas/FigureSchema.js';

const fastify = Fastify({
    logger: true
});

fastify.register(dbConnector);
fastify.register(repo);
fastify.register(fastifyStatic, {
    root: path.join(import.meta.dirname, 'src', 'public'),
});
fastify.addSchema(FigureSchema);
fastify.register(pagesRoute);
fastify.register(tagRoutes);
fastify.register(makerRoutes);
fastify.register(figureRoutes);
fastify.register(statRoutes);

fastify.addHook('onReady', async function () {
    // Some async code
    await bootstrapTables(fastify);
});
/**
 * Run the server!
 */
const start = async () => {
    try {
        await fastify.listen({ port: 3000 });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
