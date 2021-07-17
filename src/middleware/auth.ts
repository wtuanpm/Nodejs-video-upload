import { Request, Response, NextFunction } from 'express';
import { User, RoleCodes } from '@graphql/types/generated-graphql-types';
import { verifyToken, JWTAuthTokenType } from '@utils/jwt';
import { UserEntity } from '@database/entities/UserEntity';
import { getRepository } from 'typeorm';

import { GraphqlContextAuth } from '@graphql/types/graphql';
import { ClientEntity } from '@database/entities/ClientEntity';
export default {
  async process(
    req: Request & {
      auth?: GraphqlContextAuth;
    },
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (!req.headers.authorization || !req.headers.authorization.replace('Bearer', '')) {
        return next();
      }
      const decodedToken = await verifyToken(req.headers.authorization.replace('Bearer', ''));
      if (decodedToken.type === JWTAuthTokenType.ID_TOKEN && decodedToken && decodedToken.role && decodedToken.uid) {
        const { clientId, role, uid, nameOfUser } = decodedToken;
        if (role === RoleCodes.CLIENT) {
          const clientRepo = getRepository(ClientEntity);
          const client = await clientRepo.findOne({ where: { id: uid } });

          if (client) {
            req.auth = {
              uid: client.id,
              ipAddress: req.headers['x-real-ip'] || req.connection.remoteAddress,
              role: decodedToken.role,
              clientId,
              metaData: { nameOfUser },
            };
          }
        } else {
          const userRepo = getRepository(UserEntity);
          const user: User = await userRepo.findOne({
            where: {
              id: decodedToken.uid,
            },
          });

          if (user) {
            req.auth = {
              uid: user.id,
              ipAddress: req.headers['x-real-ip'] || req.connection.remoteAddress,
              role: decodedToken.role,
              metaData: { user: user },
            };
          }
        }
      }
      return next();
    } catch (err) {
      return next();
    }
  },
};

export const subscriptionsAuthentication = async (authorization: string) => {
  // const decodedToken = await verifyToken(authorization.replace('Bearer', ''));
  // if (decodedToken.type === JWTAuthTokenType.ID_TOKEN && decodedToken && decodedToken.userId) {
  //   const userRepo = getRepository(UserEntity);
  //   const user: User = await userRepo.findOne({
  //     where: {
  //       id: decodedToken.userId,
  //     },
  //   });
  //   if (user) {
  //     return {
  //       userId: user.id,
  //       user,
  //       role: user.role,
  //     };
  //   }
  // }
  // throw makeGraphqlError('Có lỗi xảy ra, vui lòng thử lại sau!', ErrorCodes.Unauthenticated);
};
