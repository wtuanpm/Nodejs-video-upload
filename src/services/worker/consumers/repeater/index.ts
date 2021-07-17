import Queues, { RepeaterQueueNames } from '@services/worker/typed-queue';
import { HEAR_BEAT } from '@constants/cronTimes';

export const CronTimes = {
  hearBeat: HEAR_BEAT,
};

export const startRepaters = () => {
  for (const [key, queueName] of Object.entries(RepeaterQueueNames)) {
    Queues[key]
      .getRepeatableJobs()
      .then((jobs) => {
        if (jobs.length && jobs[0].id === queueName) {
          return Queues[key].removeRepeatableByKey(jobs[0].key);
        }
        return null;
      })
      .then(() => {
        return Queues[key].add(
          {},
          {
            jobId: queueName,
            repeat: {
              cron: CronTimes[key],
            },
            delay: 1000,
          },
        );
      });
  }
};
