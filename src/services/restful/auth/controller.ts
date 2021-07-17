import { Request, Response } from 'express';
import { getClient } from '@business/auth';
import { buildClientJWTResponse } from '@services/auth/mutations/verifyClient';
import { RoleCodes } from '@constants/enum';

export const verifyClientController = async (req: Request, res: Response) => {
  try {
    const { clientId, secretKey, nameOfUser } = req.body;
    const client = await getClient({ clientId, secretKey });
    if (!client) {
      res.status(400);
      res.send(buildError({ code: 400, message: 'Unauthenticated' }));
      return res.end();
    }

    const response = await buildClientJWTResponse({ clientId, nameOfUser, uid: client.id, role: RoleCodes.CLIENT });

    res.status(200);
    res.json(response);
    return res.end();
  } catch (err) {
    console.log('Verify Error: ', err);
    res.status(400);
    res.send(err);
    return res.end();
  }
};

const buildError = (format: { code: number; message: string }): { code: number; message: string } => {
  return format;
};
