import './alias-modules';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import schemaWithResolvers from '@graphql/schema';
import bodyParser from 'body-parser';
import { databaseConnection } from './database';
import { GraphQLContext, GraphqlContextAuth } from '@graphql/types/graphql';
import AuthMiddleware from '@/middleware/auth';
import loaders from '@services/loader';
import { ErrorCodes } from '@graphql/types/generated-graphql-types';
import { makeGraphqlError } from '@utils/error';
import env from './env';
import appRouter from '@services/restful';

const PORT = env.apiPort ? env.apiPort : 32001;

/**
 *
 * @param auth need to build graphql context
 */
const graphqlContext = (auth: GraphQLContext['auth']) => {
  return {
    auth,
    loaders,
  };
};

const app = express();
app.use(cors());
app.use('/upload/', express.static('public'));
app.use(AuthMiddleware.process);
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use('/', appRouter);
app.get('/', (_: express.Request, res: express.Response) => {
  return res.send('Hello site-plan Server!');
});

/**
 * create graphql server
 */
const server = new ApolloServer({
  context: ({ req, connection }: { req: express.Request & { auth?: GraphqlContextAuth }; connection: any }) => {
    if (connection) {
      return connection.context;
    }
    return graphqlContext(req.auth);
  },
  formatError: (err) => {
    if (err && err.extensions && err.extensions.exception.name === 'ValidationError') {
      return makeGraphqlError(err.message, ErrorCodes.GraphqlValidationFailed);
    }
    return err;
  },
  schema: schemaWithResolvers,
  subscriptions: {
    onConnect: async (connectionParam: any, webSocket, context) => {
      try {
        const { authorization } = connectionParam;
        if (authorization) {
          // const auth = await subscriptionsAuthentication(authorization);
          // return graphqlContext(auth);
        }
        throw makeGraphqlError('Missing authorization token', ErrorCodes.Unauthenticated);
      } catch (err) {
        throw new AuthenticationError(err);
      }
    },
  },
  playground: true,
  tracing: false,
  introspection: true,
  logger: null,
});

// apply app to apollo middleware
const httpServer = createServer(app);

/**
 * func to start server
 */
const run = async () => {
  await databaseConnection().then(async () => {
    console.log(`🌧️  Database connected on port ${env.databasePort}
    
    🌧️`);
  });
  server.installSubscriptionHandlers(httpServer);
  server.applyMiddleware({ app, cors: true });
  httpServer.listen(PORT);
  return httpServer;
};

/**
 * server will be start if run without test mode
 */
if (process.env.NODE_ENV !== 'test') {
  run()
    .then(() => {
      console.log(`🍼  GraphQL server listen at: http://localhost:${PORT}/graphql🚀 `);
    })
    .catch((err) => {
      console.log(err);
    });
}

export { httpServer, databaseConnection, run };
