import { Connection, createConnection } from 'typeorm';
import IORedis from 'ioredis';
import env from '@/env';
export const databaseConnection = async (): Promise<Connection> => {
  return createConnection({
    host: env.databaseServer,
    username: env.databaseUsername,
    password: env.databasePassword,
    database: env.databaseName,
    type: 'mysql',
    port: env.databasePort,
    entities: [`${env.root}/database/entities/*`],
    subscribers: [`${env.root}/database/subscribers/*`],
    migrations: [`${env.root}/database/migrations-local/*`],
    charset: 'utf8mb4',
  });
};

export const createRedis = (extraConfig?: any) => {
  return new IORedis({
    port: env.redisPort,
    host: env.redisHost,
    ...extraConfig,
  });
};
