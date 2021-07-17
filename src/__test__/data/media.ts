import { PhotoEntity } from '@database/entities/PhotoEntity';
import { dateNow } from '@utils/date';
import { getRepository } from 'typeorm';

export const makeMedias = async (limit = 1) => {
  const mediaRepo = getRepository(PhotoEntity);
  const medias: PhotoEntity[] = [];
  for (let i = 0; i < limit; i++) {
    medias.push(
      mediaRepo.create({
        name: 'name.jpg',
        url: 'url',
        createdAt: dateNow(),
        updatedAt: dateNow(),
        uploadById: 1,
      }),
    );
  }
  return mediaRepo.save(medias);
};
