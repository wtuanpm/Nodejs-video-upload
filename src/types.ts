import { User } from '@graphql/types/generated-graphql-types';

export enum RegisterTokenType {
  REGISTER_TOKEN = 'REGISTER_TOKEN',
  INVITE_PROJECT = 'INVITE_PROJECT',
  INVITE_ORGANIZATION = 'INVITE_ORGANIZATION ',
}

export interface IAuth {
  uid: number;
  ipAddress?: string | string[];
  // user: User;
}
