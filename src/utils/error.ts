import { GraphQLError } from 'graphql';

export const makeGraphqlError = (messages: string, code) => {
  return new GraphQLError(messages, null, null, null, null, null, { code });
};
