import jwt from 'jsonwebtoken';
import ms from 'ms';
import { genUserToken } from '@business/auth';
import { UserTokenType } from '@constants/enum';
import { RoleCodes, Jwt } from '@graphql/types/generated-graphql-types';
import { UserEntity } from '@database/entities/UserEntity';

const jwtSecretKey = process.env.JWT_SECRET_KEY;

export enum JWTAuthTokenType {
  ID_TOKEN = 'ID_TOKEN',
  REFRESH_TOKEN = 'REFRESH_TOKEN',
  RESET_PASSWORD = 'RESET_PASSWORD',
}

export interface JWTAuthTokenPayload {
  tokenId: string;
  userId: number;
  email?: string;
  username?: string;
  iat?: number;
  exp?: number;
  type: JWTAuthTokenType;
  isVerified?: boolean;
  metaId: number;
  role: RoleCodes;
}

export interface JWTClientAuthPayload {
  tokenId: string;
  clientId?: string;
  uid: number;
  iat?: number;
  exp?: number;
  type: JWTAuthTokenType;
  role: RoleCodes;
  nameOfUser?: string;
}

export interface JWTRefreshTokenPayload {
  tokenId: string;
  userId: number;
  type: JWTAuthTokenType;
  iat?: number;
  exp?: number;
}

export const verifyToken = async (token: string): Promise<JWTClientAuthPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, jwtSecretKey, { algorithms: ['HS256'] }, (err: any, payload: any) => {
      if (err) return reject(err);
      resolve(payload);
    });
  });
};

export const verifyRefreshToken = async (refreshToken: string): Promise<JWTRefreshTokenPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(refreshToken, jwtSecretKey, { algorithms: ['HS256'] }, (err: any, payload: any) => {
      if (err) return reject(err);
      resolve(payload);
    });
  });
};

export const signAuthToken = async (tokenData: { userId: number; role: RoleCodes; metaId: number }) => {
  const userToken = await genUserToken(tokenData.userId, UserTokenType.REFRESH_TOKEN);

  const data: JWTAuthTokenPayload = {
    ...tokenData,
    tokenId: userToken.tokenId,
    type: JWTAuthTokenType.ID_TOKEN,
  };

  const token = jwt.sign(data, jwtSecretKey, {
    expiresIn: process.env.JWT_ID_TOKEN_EXPIRES,
    algorithm: 'HS256',
  });

  const refreshToken = jwt.sign(
    {
      userId: data.userId,
      type: JWTAuthTokenType.REFRESH_TOKEN,
      tokenId: userToken.tokenId,
    },
    jwtSecretKey,
    {
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES,
      algorithm: 'HS256',
    },
  );

  return {
    token,
    refreshToken,
    expiresAt: Math.floor((new Date().getTime() + ms(process.env.JWT_ID_TOKEN_EXPIRES)) / 1000),
    refreshTokenExpiresAt: Math.floor((new Date().getTime() + ms(process.env.JWT_REFRESH_TOKEN_EXPIRES)) / 1000),
  };
};

export const signClientAuthToken = async (tokenData: { uid: number; clientId: string; nameOfUser: string; role: RoleCodes }) => {
  const userToken = await genUserToken(tokenData.uid, UserTokenType.REFRESH_TOKEN);

  const data: JWTClientAuthPayload = {
    ...tokenData,
    tokenId: userToken.tokenId,
    type: JWTAuthTokenType.ID_TOKEN,
  };

  const token = jwt.sign(data, jwtSecretKey, {
    expiresIn: process.env.JWT_ID_TOKEN_EXPIRES,
    algorithm: 'HS256',
  });

  const refreshToken = jwt.sign(
    {
      userId: data.uid,
      type: JWTAuthTokenType.REFRESH_TOKEN,
      tokenId: userToken.tokenId,
    },
    jwtSecretKey,
    {
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES,
      algorithm: 'HS256',
    },
  );

  return {
    token,
    refreshToken,
    expiresAt: Math.floor((new Date().getTime() + ms(process.env.JWT_ID_TOKEN_EXPIRES)) / 1000),
    refreshTokenExpiresAt: Math.floor((new Date().getTime() + ms(process.env.JWT_REFRESH_TOKEN_EXPIRES)) / 1000),
  };
};

export const signNormalToken = (data: { uid: number }, type: JWTAuthTokenType, expiresIn: string): { token: string; expiresAt: number } => {
  const idToken = jwt.sign({}, process.env.JWT_NORMAL_SECRET, {
    expiresIn,
    algorithm: 'none',
  });

  return {
    token: idToken,
    expiresAt: new Date().getTime() + ms(expiresIn),
  };
};

export const buildJWTResponse = async (user: UserEntity, metaId: number): Promise<Jwt> => {
  const token = await signAuthToken({
    userId: user.id,

    role: user.role,
    metaId,
  });
  return {
    uid: metaId,
    expiresAt: token.expiresAt,
    refreshToken: token.refreshToken,
    token: token.token,
    refreshTokenExpiresAt: token.refreshTokenExpiresAt,
  };
};
