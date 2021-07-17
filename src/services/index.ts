import { Resolvers, RoleCodes, MediaType, MediaStatus, VideoPreset } from '@graphql/types/generated-graphql-types';

import { mediaMutaions } from './media/mutations';
import { authMutations } from './auth/mutations';
import { mediaQueries } from './media/queries';
import { mediaResolvers } from './media/resolvers';

const resolvers: Resolvers = {
  Mutation: {
    ...mediaMutaions,
    ...authMutations,
  },
  Query: {
    ...mediaQueries,
  },

  ...mediaResolvers,
  RoleCodes: {
    ADMIN: RoleCodes.ADMIN,
    CLIENT: RoleCodes.CLIENT,
    USER: RoleCodes.USER,
  },
  MediaType: {
    FILE: MediaType.FILE,
    PHOTO: MediaType.PHOTO,
    VIDEO: MediaType.VIDEO,
    OTHER: MediaType.OTHER,
  },
  MediaStatus: {
    FAILED: MediaStatus.FAILED,
    PROCESSING: MediaStatus.PROCESSING,
    READY: MediaStatus.READY,
  },
  VideoPreset: {
    Video1080P: VideoPreset.Video1080P,
    Video720P: VideoPreset.Video720P,
    Video480P: VideoPreset.Video480P,
    Video360P: VideoPreset.Video360P,
  },
};

export default resolvers;
