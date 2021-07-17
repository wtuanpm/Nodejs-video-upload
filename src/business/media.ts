import { MediaEntity } from '@database/entities/MediaEntity';
import { getRepository } from 'typeorm';
import { dateNow } from '@utils/date';
import { MediaType, MediaFilterInput, MediaStatus } from '@graphql/types/generated-graphql-types';

export const createMedia = async (input: { path: string; createdBy: string; fileName: string; fileType: string; type: MediaType; status?: MediaStatus; duration?: number; size?: number; title?: string }) => {
  const mediaRepo = getRepository(MediaEntity);
  const created = mediaRepo.create({ ...input, createdAt: dateNow(), updatedAt: dateNow() });
  return mediaRepo.save(created);
};

export const getMedia = async (id: string) => {
  const mediaRepo = getRepository(MediaEntity);
  return mediaRepo.findOne(id);
};

export const getMedias = async (take: number, skip: number, filter?: MediaFilterInput) => {
  const mediaRepo = getRepository(MediaEntity);
  const queryBuilder = mediaRepo.createQueryBuilder('media');

  queryBuilder.select();

  if (filter) {
    const { query, type } = filter;

    if (query) {
      const _query = query.trim();
      queryBuilder.andWhere('media.createdBy like :query', { query: `%${_query}%` });
    }

    if (type) {
      queryBuilder.andWhere('media.type = :type', { type });
    }
  }

  if (!filter || !filter.query) {
    queryBuilder.orderBy('media.createdAt', 'DESC');
  }

  queryBuilder.take(take).skip(skip);
  return queryBuilder.getManyAndCount();
};
