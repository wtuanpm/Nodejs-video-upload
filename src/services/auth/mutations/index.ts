import { MutationResolvers } from '@graphql/types/generated-graphql-types';
import { verifyClient } from './verifyClient';

export const authMutations: MutationResolvers = {
  verifyClient,
};
