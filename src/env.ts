import path from 'path';
import dotenv from 'dotenv';

const cwd = process.cwd();
const environment = process.env.NODE_ENV;
let envFile = '.env';
if (environment == 'test') {
  envFile = '.env.test';
}

if (environment == 'staging') {
  envFile = '.env.staging';
}

const envPath = path.join(cwd, envFile);
dotenv.config({ path: envPath });

export enum Stage {
  Production = 'production',
  Dev = 'development',
  Staging = 'staging',
}

export interface ENV {
  apiPort?: string;
  stage: Stage;
  databaseServer?: string;
  databaseName?: string;
  databaseUsername?: string;
  databasePassword?: string;
  databasePort?: number;

  root: string;

  redisPort: number;
  redisHost: string;

  typeormEntitiesDir: string;
  typeormMigrationsDir: string;
  typeormMigrations: string;
  typeormEntities: string;

  videoDir: string;
  imageDir: string;

  videoScreenshotsDir: string;
  cdnImageDomain: string;
  cdnVideoDomain: string;
}

const root = __dirname.replace(`${cwd}`, '.');
const env: ENV = {
  stage: process.env.STAGE ? (process.env.STAGE as Stage) : Stage.Dev,
  root,
  databaseServer: process.env.DATABASE_SERVER,
  databaseName: process.env.DATABASE_NAME,
  databaseUsername: process.env.DATABASE_USERNAME,
  databasePassword: process.env.DATABASE_PASSWORD,
  databasePort: parseInt(process.env.DATABASE_PORT),
  apiPort: process.env.API_PORT,
  redisPort: parseInt(process.env.REDIS_PORT),
  redisHost: process.env.REDIS_HOST,
  typeormEntitiesDir: process.env.TYPEORM_ENTITIES_DIR,
  typeormMigrationsDir: process.env.TYPEORM_MIGRATIONS_DIR,
  typeormEntities: process.env.TYPEORM_ENTITIES,
  typeormMigrations: process.env.TYPEORM_MIGRATIONS,
  videoDir: process.env.VIDEO_DIR,
  imageDir: process.env.IMAGE_DIR,
  videoScreenshotsDir: process.env.VIDEO_SCREENSHOTS_DIR,
  cdnImageDomain: process.env.CDN_IMAGE_DOMAIN,
  cdnVideoDomain: process.env.CDN_VIDEO_DOMAIN,
};

for (const e in env) {
  if (!env[e]) {
    throw new Error(`Missing ${e} env var`);
  }
}

export default env;
