import { getRepository } from 'typeorm';
import { dateNow } from '@utils/date';
import faker from 'faker/locale/vi';
import { QuestionEntity } from '@database/entities/QuestionEntity';
import { LawyerMasterDataEntity } from '@database/entities/LawyerMasterDataEntity';
import { MasterDataEntity } from '@database/entities/MasterDataEntity';
import { makeLawyerLogin } from './lawyerLogin';
import { getSDK } from '../utils/graphqlSDK';
import { seedAdmin } from '@utils/seeding';
import { getAdminAccessToken } from '../helpers/auth';
import { QuestionStatus } from '@graphql/types/generated-graphql-types';

export const makeQuestion1Lawyer = async (count: number) => {
  jest.setTimeout(1000000);
  let adminToken: string;
  await seedAdmin();
  adminToken = await getAdminAccessToken();
  let masterDataL: MasterDataEntity[];
  let lawyersL: LawyerMasterDataEntity[];
  const questionRepo = getRepository(QuestionEntity);
  await makeLawyerLogin(1);
  // const l = await makeLawyerData(count);
  // masterDataL = l.masterData;
  // lawyersL = l.lawyers;
  const questionData: QuestionEntity[] = [];
  for (let i = 0; i < count; i++) {
    const lawyerRes = await getSDK(adminToken).getLawyers();
    let idLawyer = lawyerRes.adminGetAllLawyer.items.find((i) => i.email !== 'admin@comartek.com').id;
    let idMasterData = lawyerRes.adminGetAllLawyer.items[0].jobField[0].id;
    // let data = masterDataL[i].id;
    questionData.push(
      questionRepo.create({
        title: 'title ' + `${faker.commerce.productMaterial()}-${Math.random()}`,
        content: 'content' + `${faker.commerce.productMaterial()}-${Math.random()}`,
        masterDataId: parseInt(idMasterData),
        createdAt: dateNow(),
        updatedAt: dateNow(),
        status: i % 2 === 0 ? QuestionStatus.UNAPPROVED : QuestionStatus.APPROVED,
        assigneeId: parseInt(idLawyer),
      }),
    );
  }
  return questionRepo.save(questionData);
};
