import '../../alias-modules';
import createWorker from './worker';
import { QueueNames } from './typed-queue';

import debug from '@utils/debug';
import { databaseConnection } from '@database/index';
import { takeVideoScreenshotsListener, handleVideoResolutionsListenser } from './consumers/media/video';

const PORT: any = process.env.WORKER_PORT || 4002;

function createWorkerServer() {
  const server: any = createWorker({
    [QueueNames.takeVideoScreenshots]: takeVideoScreenshotsListener,
    [QueueNames.handleVideoResolutions]: handleVideoResolutionsListenser,
  });

  return server;
}

async function startWorkerServer() {
  const connected = await databaseConnection();
  if (!connected.isConnected) {
    throw Error('Database connected fail');
  }

  debug.worker(`Database connected from worker`);

  const workerServer = createWorkerServer();
  workerServer.listen(PORT, '0.0.0.0', () => {
    debug.worker(`Debug server running at 0.0.0.0:${workerServer.address().port}`);
  });

  // start  job repeaters
}

startWorkerServer();
