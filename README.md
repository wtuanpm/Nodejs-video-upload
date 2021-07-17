# Video upload

# User manual

## install dependencies

```bash 
# using node version: 12.x.x
yarn install
```
## docker

If you do not have a docker, you can install it by following this link: https://docs.docker.com/

```bash
# docker script
docker-compose up -d 
```

## dotenv

```bash 
# create file .env
  DATABASE_SERVER=?
  DATABASE_NAME=?
  DATABASE_USERNAME=?
  DATABASE_PASSWORD=?
  API_PORT=?
```
## code structure
```bash
 src
   -- business -> access database follow workflow, without validate function
   -- constants -> include variable constants
   -- database
      - entities -> include entity files to access the database
      - migrations -> include mirgation files for automation create table on the database 
   -- graphql 
      - directive -> authenticated check
      - schema -> include graphql files to define schema for Apollo server and generate typescript
      - types -> include project type and schema type generated
   -- middleware -> handle verify token
   -- services
      - auth
         - mutations -> handle graphql mutations
         - queries -> handle graphql queries
         - resolvers -> handle grahql resolvers 
      - user
         - mutations
         - queries
         - resolvers
      - ...
   -- utils -> include util files
   -- alias-modules.ts -> config for import alias modules 
   -- env.ts -> export env values
   -- index.ts -> connect to server and database
    
  --graphql 
```

## database migration

Translation module with https://github.com/typeorm/typeorm/blob/master/docs/migrations.md

The config migration file in src/database/ormconfig.json

1. Create migration

```bash
yarn migration:create <migration name>
```
or. Generate migration

```bash
yarn typeorm:cli migration:generate -n <migration name>
```

In order to use an API to change a database schema you can use QueryRunner.

Example:

```bash
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn("answer", new TableColumn({
       name: "questionId",
       type: "int"
    }));
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("question", "questionId");
  }
```

2. Run migration

```bash
yarn typeorm:cli migration:run
```

## The steps to start project 

```bash
# create file .env
  DATABASE_SERVER=?
  DATABASE_NAME=?
  DATABASE_USERNAME=?
  DATABASE_PASSWORD=?
  API_PORT=?
  
# install dependencies
yarn install

# generate migration 
yarn typeorm:cli -- migration:generate -n <migration name> 

# run migration 
yarn typeorm:cli -- migration:run

# generate graphql types 
yarn gen:server:types

# run project in dev mode
yarn dev

# build to javascript
yarn build

# start server 
yarn start

```
# vod-api
# video-upload
