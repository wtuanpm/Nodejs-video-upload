import { EventEmitter } from 'events';
import { createQueue } from './create';
import http from 'http';

const sumCount = (arr: any, prop: string) => {
  return arr.reduce((sum, item) => sum + item[prop], 0);
};

const createWorker = (queueMap: any, queueOptions?: any, reqHandler?: any) => {
  EventEmitter.defaultMaxListeners = 0;

  const queues = Object.keys(queueMap).map((name) => {
    const queue = createQueue(name, queueOptions);
    queue.process(queueMap[name]);
    return queue;
  });

  Promise.all(queues.map((queue) => queue.getFailed())).then((allQueueJobs) => {
    allQueueJobs.forEach((queueJobs) => {
      if (queueJobs.length === 0) return queueJobs;
      console.log(`Started retrying ${queueJobs.length} failed jobs`);
      return queueJobs.forEach((job) => {
        if (!job) return null;
        return job.retry();
      });
    });
  });

  // Return the job count when requesting anything via HTTP
  return http.createServer((req, res) => {
    const defaultReponse = () => res.setHeader('Content-type', 'application/json');
    Promise.all(queues.map((queue) => queue.getJobCounts())).then((jobCounts) => {
      const data = {
        waiting: sumCount(jobCounts, 'waiting'),
        active: sumCount(jobCounts, 'waiting'),
        completed: sumCount(jobCounts, 'waiting'),
        failed: sumCount(jobCounts, 'waiting'),
        delayed: sumCount(jobCounts, 'waiting'),
      };
      res.end(JSON.stringify(data, null, 2));
    });
    if (reqHandler) return reqHandler(req, res, defaultReponse);
    return defaultReponse();
  });
};

export default createWorker;
