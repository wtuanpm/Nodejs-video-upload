import 'cross-fetch/polyfill';
import ApolloClient from 'apollo-boost';
import env from '../../env';
const PORT = env.apiPort ? env.apiPort : 32001;

/**
 * create graphql client for test
 * @param token when use for request api with authentication
 */
export const getClient = (token?: string) => {
  return new ApolloClient({
    uri: `http://localhost:${PORT}/graphql`,
    request: (operation) => {
      if (token) {
        operation.setContext({
          headers: {
            Authorization: `${token}`,
          },
        });
      }
    },
  });
};
