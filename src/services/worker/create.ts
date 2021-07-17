import IORedis from 'ioredis';
import Queue from 'bull';
import env from '@/env';

export const createRedis = (extraConfig?: any) => {
  return new IORedis({
    port: env.redisPort,
    host: env.redisHost,
    ...extraConfig,
  });
};

// create  queue with redis option and listens queue events
export const createQueue = (name: string, queueOptions?: any): Queue.Queue => {
  const queue = new Queue(name, {
    createClient: (type: any) => {
      switch (type) {
        case 'client':
          return createRedis();
        case 'subscriber':
          return createRedis();
        default:
          return createRedis();
      }
    },
    defaultJobOptions: {
      removeOnComplete: true,
      attempts: 1,
      backoff: 2000,
    },
    ...queueOptions,
  });

  queue.on('active', (job) => {
    console.log(`Queue ${job.queue.name}-${job.id} is active... `);
  });

  queue.on('stalled', (job) => {
    console.log(`Queue ${job.queue.name}-${job.id} is stalled... `);
  });

  queue.on('progress', (job, progress) => {
    console.log(`Queue ${job.queue.name}-${job.id} is ${progress}... `);
  });

  queue.on('completed', (job) => {
    console.log(`Queue ${job.queue.name}-${job.id} is completed... `);
  });

  queue.on('failed', (job) => {
    console.log(`Queue ${job.queue.name}-${job.id} is failed... `);
  });

  queue.on('paused', () => {
    console.log('All queue are paused...');
  });

  queue.on('resumed', () => {
    console.log('All queues has been resume...');
  });

  queue.on('removed', (job) => {
    console.log(`Queue ${job.queue.name} - ${job.id} is removed`);
  });

  return queue;
};
