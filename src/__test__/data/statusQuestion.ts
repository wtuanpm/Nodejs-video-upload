import { QuestionEntity } from '@database/entities/QuestionEntity';
import { QuestionStatus } from '../graphql/sdk';
import { getAdminAccessToken } from '../helpers/auth';
import { getSDK } from '../utils/graphqlSDK';
import { seedAdmin } from '@utils/seeding';
import { makeQuestion } from './question';

export const makeStatusQuestion = async (count: number) => {
  jest.setTimeout(1000000);

  let question: QuestionEntity[];
  let adminToken: string;
  await seedAdmin();
  adminToken = await getAdminAccessToken();

  question = await makeQuestion(count);
  for (let i = 0; i < count - 1; i++) {
    await getSDK(adminToken).adminChangeQuestionStatus({
      data: {
        id: `${question[i].id}`,
        status: QuestionStatus.Unapproved,
      },
    });
    if (i % 2 == 0 && i < 19) {
      const questionRes = await getSDK(adminToken).getAllQuestions();
      let idMasterData = questionRes.adminGetAllQuestion.items.find((j) => j.id == `${question[i].id}`).masterDataId;
      const lawyerRes = await getSDK(adminToken).getLawyers();
      let idLawyer = lawyerRes.adminGetAllLawyer.items.find((m) => m.jobField.find((n) => n.id == idMasterData)).id;
      await getSDK(adminToken).adminAssignQuestion({
        data: {
          id: `${question[i].id}`,
          lawyerId: idLawyer,
        },
      });

      // await getSDK(adminToken).adminChangeQuestionStatus({
      //   data: {
      //     id: `${question[i].id}`,
      //     status: QuestionStatus.Approved,
      //   },
      // });
      // await getSDK(adminToken).adminAssignQuestion({
      //   data:{
      //     id:`${question[i].id}`,
      //     lawyerId:
      //   }
      // })
    }
    if (i % 6 == 0) {
      await getSDK(adminToken).adminChangeQuestionStatus({
        data: {
          id: `${question[i].id}`,
          status: QuestionStatus.Answered,
        },
      });
    }
    if (i % 8 == 0) {
      await getSDK(adminToken).adminChangeQuestionStatus({
        data: {
          id: `${question[i].id}`,
          status: QuestionStatus.Rejected,
        },
      });
    }
  }
};
