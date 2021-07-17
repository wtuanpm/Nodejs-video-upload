import { createLoader, sortResults } from './buildLoader';
import { getRepository, In } from 'typeorm';
import { UserEntity } from '@database/entities/UserEntity';

export const createUsersLoader = createLoader(async (userIds: number[]) => {
  try {
    const userRepo = getRepository(UserEntity);
    const users = await userRepo.find({ id: In(userIds) });
    return sortResults(users, userIds);
  } catch (err) {
    console.log('err', err);
    return [];
  }
});
