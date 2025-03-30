import Fastify from 'fastify'
import firstRoute from './src/routes/our-first-route.js'
import dbConnector from './src/plugins/db-connector.js'
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
fastify.register(firstRoute);


fastify.addHook('onReady', async function () {
    // Some async code
    await bootstrapTables(fastify);
  })
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
}
start();
