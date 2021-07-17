module.exports = (shipit) => {
  require('shipit-deploy')(shipit);

  shipit.initConfig({
    default: {
      dirToCopy: './dist',
      deployTo: '/home/projects/vod-api', // duong dan den thu muc chua code tren server
      repositoryUrl: 'git@github.com:ixo-software/vod-api.git',
      ignores: ['.git', 'node_modules'],
      keepReleases: 2,
      shallowClone: true,
      branch: 'develop',
      // key: ' /Users/macpm/Documents/comartek/onplan-key/OnPlan.pem',
    },
    develop: {
      // enviroment name ~ yarn deploy:develop
      branch: 'develop',
      servers: [
        {
          host: 'vod.trucdev.com',
          user: 'root',
        },
      ],
    },

  });

  shipit.blTask('deploy:init', async () => {
    // // create folder src/database
    // await shipit.remote(`cd /home/projects/onplan-api/develop/active && mkdir src && cd src && mkdir database`);
    // // copy src/database folder from local to remote active folder
    // await shipit.copyToRemote(`./src/database/`, `/home/projects/onplan-api/develop/active/src/database/`);
    shipit.config.rootPath = shipit.config.deployTo;
    shipit.config.deployTo = `${shipit.config.deployTo}/${shipit.config.branch}`;
  });

  shipit.blTask('deploy:copy', async () => {
    // copy file .env tương ứng
    //await shipit.local(`cp -r .env.${shipit.environment} ${shipit.workspace}/.env`);
  });

  shipit.blTask('deploy:install', () => {
    return shipit.local(`cd ${shipit.workspace} && yarn install`);
  });

  shipit.blTask('deploy:build', () => {
    return shipit.local(`cd ${shipit.workspace} && yarn gen:server:types && yarn build`);
  });

  shipit.blTask('deploy:remote:install', async () => {

    await shipit.remote(`rm -rf ${shipit.config.deployTo}/active/*`);
    // tạo folder active trên remote
    await shipit.remote(`
      cd ${shipit.config.deployTo} &&
      [ -d "${shipit.config.deployTo}/active" ] || mkdir ${shipit.config.deployTo}/active
    `);
    // xóa code cũ trong folder active
    await shipit.remote(`rm -rf ${shipit.config.deployTo}/active/*`);
    // copy package.json lên remote
    await shipit.copyToRemote(`package.json`, `${shipit.config.deployTo}/active/package.json`);
    // tạo folder dist trong thư mục active
    await shipit.remote(`cd ${shipit.config.deployTo}/active && mkdir dist`);
    // copy code từ folder release sang folder active
    await shipit.remote(`cd ${shipit.config.deployTo} && cp -r ${shipit.releasePath}/* ${shipit.config.deployTo}/active/dist`);
    // install package
    await shipit.remote(`cd ${shipit.config.deployTo}/active && nvm use v12.18.2 && yarn --production`);
    // copy file env
    await shipit.remote(`cd ${shipit.config.rootPath}/env && cp -r .env.${shipit.environment} ${shipit.config.deployTo}/active/.env`);
    // run migration
    await shipit.remote(`cd ${shipit.config.deployTo}/active && yarn migration:run:deploy`);
    // run migration
    // await shipit.remote(`cd ${shipit.config.deployTo}/active && ${yarn} migration:run:deploy`);
    // kill port 32001 và start pm2
    await shipit.remote(`cd ${shipit.config.deployTo}/active && pm2 stop vod_api --silent && NODE_PORT=32001 pm2 start dist/src/index.js --name vod_api`);
    await shipit.remote(`cd ${shipit.config.deployTo}/active && pm2 stop vod_worker --silent && pm2 start dist/src/services/worker/index.js --name vod_worker`);
    return;
  });

  shipit.task('deploy', [
    //
    'deploy:init',
    'deploy:fetch',
    'deploy:install',
    'deploy:copy',
    'deploy:build',
    'deploy:update',
    'deploy:publish',
    'deploy:remote:install',
  ]);

  shipit.task('rollback', ['rollback:init', 'deploy:publish', 'deploy:clean', 'deploy:finish', 'deploy:serve']);
};
