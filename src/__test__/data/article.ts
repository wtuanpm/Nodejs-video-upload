import { getRepository } from 'typeorm';
import { dateNow } from '@utils/date';
import { makeMasterData } from './master-data';
import { create } from 'ts-node';
import { ArticleEntity } from '@database/entities/ArticleEntity';
import faker from 'faker/locale/vi';
import { ArticleStatus } from '@graphql/types/generated-graphql-types';
import { makeMedias } from './media';

export const makeArticle = async (count: number) => {
  const articleRepo = getRepository(ArticleEntity);
  const masterData = await makeMasterData(count);
  const media = await makeMedias(count);
  const articleData: ArticleEntity[] = [];
  for (let i = 0; i < count; i++) {
    const data = masterData[i].id;
    articleData.push(
      articleRepo.create({
        title: 'title ' + `${faker.commerce.productMaterial()}-${Math.random()}`,
        note: 'note',
        author: 'author' + `${faker.commerce.productMaterial()}-${Math.random()}`,
        content: 'content',
        status: i !== 4 ? ArticleStatus.ACTIVE : ArticleStatus.INACTIVE,
        photoId: media[i].id,
        masterDataId: data,
        createdAt: dateNow(),
        updatedAt: dateNow(),
      }),
    );
  }
  return articleRepo.save(articleData);
};
