import { makeStatusQuestion } from '@/__test__/data/statusQuestion';
import { LawyerStatus, QuestionStatus } from '@/__test__/graphql/sdk';
import { getAdminAccessToken } from '@/__test__/helpers/auth';
import { recreateDatabase } from '@/__test__/utils/databaseConnection';
import { getSDK } from '@/__test__/utils/graphqlSDK';
import { MasterDataEntity } from '@database/entities/MasterDataEntity';
import { QuestionEntity } from '@database/entities/QuestionEntity';
import { seedAdmin } from '@utils/seeding';

describe('Assign QUESTION MODULE', () => {
  jest.setTimeout(1000000);
  // test data
  var dateFaker = new Date();
  let day = '' + dateFaker.getDate();
  if (dateFaker.getDate() < 10) {
    day = '0' + dateFaker.getDate();
  }
  let month = dateFaker.getMonth() + 1;
  const value = day + '/' + month + '/' + dateFaker.getFullYear();
  let adminToken: string;
  let masterData: MasterDataEntity[];
  let question: QuestionEntity[];
  beforeAll(async () => {
    await recreateDatabase();
    await seedAdmin();
    // question = await makeQuestion(10);

    await makeStatusQuestion(10);
    adminToken = await getAdminAccessToken();
  }, 1000000);
  test('#1: Thay đổi trạng thái sang APPROVED thành công', async () => {
    const questionRes = await getSDK(adminToken).getAllQuestions();
    let idQuestion = questionRes.adminGetAllQuestion.items.find((i) => i.status === 'UNAPPROVED').id;
    const statusRes = await getSDK(adminToken).adminChangeQuestionStatus({
      data: {
        id: idQuestion,
        status: QuestionStatus.Approved,
      },
    });
    const questionRes1 = await getSDK(adminToken).getQuestion({
      data: {
        id: idQuestion,
      },
    });

    expect(questionRes1.adminGetQuestion.status).toBe('APPROVED');
  });

  test('#1: Thay đổi trạng thái sang REJECTED thành công', async () => {
    const questionRes = await getSDK(adminToken).getAllQuestions();
    let idQuestion = questionRes.adminGetAllQuestion.items.find((i) => i.status === 'UNAPPROVED').id;
    const statusRes = await getSDK(adminToken).adminChangeQuestionStatus({
      data: {
        id: idQuestion,
        status: QuestionStatus.Rejected,
      },
    });
    const questionRes1 = await getSDK(adminToken).getQuestion({
      data: {
        id: idQuestion,
      },
    });
    expect(questionRes1.adminGetQuestion.status).toBe('REJECTED');
  });
});
