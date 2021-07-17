// import { uploadPhoto } from './uploadPhoto';
import { MutationResolvers } from '@graphql/types/generated-graphql-types';
// import { uploadVideo } from './uploadVideo';
import { uploadMedia } from './uploadMedia';
import { updateMedia } from './updateMedia';

export const mediaMutaions: MutationResolvers = {
  // uploadPhoto,
  // uploadVideo,
  uploadMedia,
  updateMedia,
};
