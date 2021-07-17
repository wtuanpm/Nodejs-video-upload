// import từ ts đang bị lỗi
import 'babel-polyfill';
import env from '../../env';
import { connectDatabase } from './databaseConnection';

require('@babel/register');

const PORT = env.apiPort ? env.apiPort : 32001;

/**
 * setup graphql test server before test
 */
module.exports = async () => {
  if (process.env.NODE_ENV === 'test') {
    const { httpServer, run } = require('../../../dist/src/index');

    const connection = await connectDatabase();
    // re-create database
    await connection.dropDatabase();
    await connection.runMigrations();
    await connection.close();

    // add httpServer , databaseConnect to global variables
    (<any>global).httpServer = httpServer;
    // start graphql server test
    await run();
    console.log('Test server started');
  }
};
