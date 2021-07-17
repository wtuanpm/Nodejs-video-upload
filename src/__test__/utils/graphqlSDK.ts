/* eslint-disable import/no-extraneous-dependencies */
import { GraphQLClient } from 'graphql-request';
import env from '../../env';
import { getSdk } from '../graphql/sdk';

const PORT = env.apiPort || 32001;

const endpoint = `http://localhost:${PORT}/graphql`;

export const getClient = (token?: string) => {
  const headers: any = {};

  if (token) {
    headers.authorization = token;
  }

  const graphQLClient = new GraphQLClient(endpoint, {
    headers,
  });
  return graphQLClient;
};

/**
 * create graphql client for test
 * @param token when use for request api with authentication
 */
export const getSDK = (token?: string) => {
  const client = getClient(token);
  return getSdk(client);
};
