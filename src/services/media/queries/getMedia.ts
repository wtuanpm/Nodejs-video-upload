import { QueryResolvers, Medias } from '@graphql/types/generated-graphql-types';
import { getMedia as getMediaBusiness } from '@business/media';

export const getMedia: QueryResolvers['getMedia'] = async (_, { id }) => {
  const media = await getMediaBusiness(id);

  return media;
};
