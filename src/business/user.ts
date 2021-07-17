import { getRepository } from 'typeorm';
import { UserEntity } from '@database/entities/UserEntity';
import { dateNow } from '@utils/date';

export const getUserByEmail = async (email: string) => {
  const userRepo = getRepository(UserEntity);
  return userRepo.findOne({
    where: {
      email,
    },
  });
};

export const updateUser = async (id: number, input: { isEmailVerified?: boolean }) => {
  const userRepo = getRepository(UserEntity);
  return userRepo.update({ id }, { ...input, updatedAt: dateNow() });
};
