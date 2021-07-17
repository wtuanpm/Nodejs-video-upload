import { ConnectionOptions } from 'typeorm';
import './src/alias-modules';
import './src/env';
import dotenv from 'dotenv';
import * as fs from 'fs';

let environment = process.env.NODE_ENV;

let envFile = '.env';
if (environment == 'test') {
  envFile = '.env.test';
}

if (environment == 'staging') {
  envFile = '.env.staging';
}

if (environment == 'production') {
  envFile = '.env.production';
}

const envVariables = dotenv.parse(fs.readFileSync(envFile));

const config: ConnectionOptions = {
  host: envVariables.DATABASE_SERVER,
  username: envVariables.DATABASE_USERNAME,
  password: envVariables.DATABASE_PASSWORD,
  database: envVariables.DATABASE_NAME,
  type: 'mysql',
  port: parseInt(envVariables.DATABASE_PORT),
  entities: [envVariables.TYPEORM_ENTITIES],
  migrations: [envVariables.TYPEORM_MIGRATIONS],
  cli: {
    migrationsDir: envVariables.TYPEORM_MIGRATIONS_DIR,
    entitiesDir: envVariables.TYPEORM_ENTITIES_DIR,
  },
};

export = config;
