import env from '@/env';
import { createRedis } from '@database/index';
import DataLoader from 'dataloader';
import { getRepository, In } from 'typeorm';
import { isArray } from 'util';

const RedisDataLoader = require('redis-dataloader')({ redis: createRedis() });

export interface CacheOptions {
  cache: boolean;
  expire: number;
  serialize: any;
  deserialize: any;
}

export const createLoader = (batchFn: (...params: any) => any) => (options?: any, useRedis = false, expire = 10) => {
  const base = new DataLoader((keys) => {
    return batchFn(keys);
  }, options);
  if (!useRedis) {
    return base;
  }
  return new RedisDataLoader(
    // set a prefix for the keys stored in redis. This way you can avoid key
    // collisions for different data-sets in your redis instance.
    'loader-prefix-key',
    // create a regular dataloader. This should always be set with caching disabled.
    base,
    // The options here are the same as the regular dataloader options, with
    // the additional option "expire"
    {
      expire,
      cache: false,
    },
  );
};

export const sortResults = (results: Array<any>, ids: Array<any>, mappingKey: string = 'id') => {
  return ids.map((id) => results.find((item) => `${item[mappingKey]}` === `${id}`));
};

export const sortRevisionResults = (results: Array<any>, ids: Array<number>, versions: Array<number>) => {
  const sortedResults = [];
  ids.map((id, index) => {
    sortedResults.push(
      results.find((item: any) => {
        return item.originalID === id && item.version === versions[index];
      }),
    );
    return id;
  });
  return sortedResults;
};

export const sortTwoDimensionalArrays = (results: Array<any>, ids: Array<any>, mappingKey: string = 'id') => {
  const sortedResult: any[][] = [];
  ids.map((id) => {
    const filteredResult = results.filter((item) => {
      return item[mappingKey] === id;
    });
    if (isArray(filteredResult)) {
      sortedResult.push(filteredResult);
    } else {
      sortedResult.push([filteredResult]);
    }
  });
  return sortedResult;
};

export const substringIdsForLoaders = (stringIds: string[]) => {
  const arrFirstIds = [];
  const arrLastIds = [];
  stringIds.forEach((strId) => {
    arrFirstIds.push(strId.split('-').shift());
    arrLastIds.push(strId.split('-').pop());
  });
  return [arrFirstIds, arrLastIds];
};

export async function entityLoaderBatchFunction<T>(entityClass: any, ids: string[], connectionName?: string): Promise<T[]> {
  try {
    const repo = getRepository(entityClass, connectionName);
    const items = await repo.find({ id: In(ids as any) } as any);
    return sortResults(items, ids);
  } catch (err) {
    console.log('err', err);
    return [];
  }
}

export function createEntityLoader<T>(entityClass: any, connectionName?: string) {
  return createLoader((ids: string[]) => {
    return entityLoaderBatchFunction(entityClass, ids, connectionName);
  });
}
