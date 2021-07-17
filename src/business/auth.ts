import { getRepository } from 'typeorm';
import { dateNow } from '@utils/date';
import { v4 } from 'uuid';
import { UserTokenEntity } from '@database/entities/UserTokenEntity';
import { UserTokenType, RoleCodes } from '@constants/enum';

import { UserEntity } from '@database/entities/UserEntity';
import { hashPassword } from '@utils/password';
import { ClientEntity } from '@database/entities/ClientEntity';

export const genUserToken = async (parentId: number, userTokenType: UserTokenType, expiresInSeconds: number = 600) => {
  const userToken = getRepository(UserTokenEntity);
  const tokenCreated = userToken.create({
    expiresAt: dateNow() + expiresInSeconds,
    tokenId: `${v4()}-${v4()}`,
    type: userTokenType,
    parentId,
    createdAt: dateNow(),
  });
  return userToken.save(tokenCreated);
};

export const createUser = async (input: { fullName?: string; phoneNumber?: string; email: string; password: string; isEmailVerified: boolean; role: RoleCodes }) => {
  const userRepo = getRepository(UserEntity);
  const created = userRepo.create({ ...input, password: hashPassword(input.password), createdAt: dateNow(), updatedAt: dateNow() });
  return userRepo.save(created);
};

export const getClient = async (condition: { clientId: string; secretKey: string }) => {
  const { clientId, secretKey } = condition;
  const clientRepo = getRepository(ClientEntity);
  return clientRepo.findOne({ where: { clientId, secretKey } });
};
