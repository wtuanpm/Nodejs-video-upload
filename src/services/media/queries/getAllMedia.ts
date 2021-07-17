import { QueryResolvers, Medias } from '@graphql/types/generated-graphql-types';
import { getMedias } from '@business/media';

export const getAllMedia: QueryResolvers['getAllMedia'] = async (_, { filter, pageIndex, pageSize }) => {
  const [medias, total] = await getMedias(pageSize, (pageIndex - 1) * pageSize, filter);

  const result: Medias = {
    items: medias,
    paginate: {
      pageIndex,
      pageSize,
      totalItems: total,
      totalPage: Math.ceil(total / pageSize),
    },
  };

  return result;
};
