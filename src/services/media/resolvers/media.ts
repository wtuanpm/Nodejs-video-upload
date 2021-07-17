import { MediaResolvers, ScreenShotResolvers, VideoProfileResolvers, MediaType } from '@graphql/types/generated-graphql-types';
import env from '@/env';

export const Media: MediaResolvers = {
  originUrl: ({ path, type }) => {
    if (!path) return null;

    if (type === MediaType.VIDEO) {
      return `${env.cdnVideoDomain}/${path}`;
    }

    return `${env.cdnImageDomain}/${path}`;
  },
};

export const ScreenShot: ScreenShotResolvers = {
  url: ({ path }) => {
    if (!path) return null;
    return `${env.cdnImageDomain}/${path}`;
  },
};

export const VideoProfile: VideoProfileResolvers = {
  url: ({ path }) => {
    if (!path) return null;
    return `${env.cdnVideoDomain}/${path}`;
  },
};
