import { getRepository } from 'typeorm';
import { dateNow } from '@utils/date';
import { makeMasterData } from './master-data';
import { create } from 'ts-node';
import faker from 'faker/locale/vi';
import { QuestionEntity } from '@database/entities/QuestionEntity';
import { makeLawyerData } from './lawyerData';
import { LawyerMasterDataEntity } from '@database/entities/LawyerMasterDataEntity';
import { MasterDataEntity } from '@database/entities/MasterDataEntity';
import { makeLawyerLogin } from './lawyerLogin';
import { getSDK } from '../utils/graphqlSDK';
import { seedAdmin } from '@utils/seeding';
import { getAdminAccessToken } from '../helpers/auth';

export const makeQuestion = async (count: number) => {
  jest.setTimeout(1000000);
  let adminToken: string;
  await seedAdmin();
  adminToken = await getAdminAccessToken();
  let masterDataL: MasterDataEntity[];
  let lawyersL: LawyerMasterDataEntity[];
  const questionRepo = getRepository(QuestionEntity);
  await makeLawyerLogin(count);
  // const l = await makeLawyerData(count);
  // masterDataL = l.masterData;
  // lawyersL = l.lawyers;
  const questionData: QuestionEntity[] = [];
  for (let i = 0; i < count; i++) {
    const lawyerRes = await getSDK(adminToken).getLawyers();
    if (lawyerRes.adminGetAllLawyer.items[i].jobField.length !== 0) {
      let idMasterData = lawyerRes.adminGetAllLawyer.items[i].jobField[0].id;
      // let data = masterDataL[i].id;
      questionData.push(
        questionRepo.create({
          title: 'title ' + `${faker.commerce.productMaterial()}-${Math.random()}`,
          content: 'content' + `${faker.commerce.productMaterial()}-${Math.random()}`,
          masterDataId: parseInt(idMasterData),
          createdAt: dateNow(),
          updatedAt: dateNow(),
        }),
      );
    }
  }
  return questionRepo.save(questionData);
};
