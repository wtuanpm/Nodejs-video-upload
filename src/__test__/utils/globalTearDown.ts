/* eslint-disable no-console */
/**
 * close server and database connect after tests
 */
module.exports = async () => {
  // close server test
  if ((<any>global).httpServer) {
    await (<any>global).httpServer.close((err) => {
      if (!err) {
        console.log('GraphQL test server has been closed');
      }
    });
  }
};
