import { UserEntity } from '@database/entities/UserEntity';
import { hashPassword } from '@utils/password';
import { getRepository } from 'typeorm';

export const seedAdmin = async () => {
  const userRepo = getRepository(UserEntity);
  const created = userRepo.create({ email: 'admin@comartek.com', password: hashPassword('admin@123') });
  await userRepo.save(created);
};
