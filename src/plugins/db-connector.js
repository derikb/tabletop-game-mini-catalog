
import fastifyBetterSqlite3 from '@punkish/fastify-better-sqlite3';
import Database from 'better-sqlite3';
import fastifyPlugin from 'fastify-plugin';

// provide fastifyBetterSqlite3Opts
//
const fastifyBetterSqlite3Opts = {

    // The Database class imported above
    //
    "class": Database,

    // if db file doesn't exist, it will be created unless
    // `betterSqlite3options.fileMustExist: true`
    //
    "pathToDb": './db.sqlite',

    // The following options are passed on to `better-sqlite3`.
    // The default values are shown below, and none are required.
    // Check better-sqlite3 documentation for details.
    //
    // betterSqlite3options: {
    //     readonly: false,
    //     fileMustExist: false,
    //     timeout: 5000,
    //     verbose: null
    // }
};

/**
 * @param {FastifyInstance} fastify
 * @param {Object} options
 */
async function dbConnector (fastify) {
    fastify.register(fastifyBetterSqlite3, fastifyBetterSqlite3Opts);
}

// Wrapping a plugin function with fastify-plugin exposes the decorators
// and hooks, declared inside the plugin to the parent scope.
export default fastifyPlugin(dbConnector)
