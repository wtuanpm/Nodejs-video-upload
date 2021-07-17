import { makeLawyerLogin } from '@/__test__/data/lawyerLogin';
import { makeMasterData } from '@/__test__/data/master-data';
import { makeQuestion } from '@/__test__/data/question';
import { makeStatusQuestion } from '@/__test__/data/statusQuestion';
import { getAdminAccessToken } from '@/__test__/helpers/auth';
import { delay } from '@/__test__/helpers/delay';
import { recreateDatabase } from '@/__test__/utils/databaseConnection';
import { getSDK } from '@/__test__/utils/graphqlSDK';
import { MasterDataEntity } from '@database/entities/MasterDataEntity';
import { QuestionEntity } from '@database/entities/QuestionEntity';
import { adminLogin } from '@services/auth/mutations/adminLogin';
import { seedAdmin } from '@utils/seeding';
import faker from 'faker/locale/vi';

describe('Assign QUESTION MODULE', () => {
  jest.setTimeout(90000000);
  // test data
  var dateFaker = new Date();
  let day = '' + dateFaker.getDate();
  if (dateFaker.getDate() < 10) {
    day = '0' + dateFaker.getDate();
  }
  let month = dateFaker.getMonth() + 1;
  const value = day + '/' + month + '/' + dateFaker.getFullYear();
  let adminToken: string;
  let idQuestionRep: string;
  let idQuestionAdmin: string;
  beforeAll(async () => {
    await recreateDatabase();
    await seedAdmin();
    // await makeLawyerLogin(30);
    await makeStatusQuestion(10);
    adminToken = await getAdminAccessToken();
  }, 10000);

  test('#1: Admin tự trả lời cầu hỏi', async () => {
    const questionRes = await getSDK(adminToken).getAllQuestions();
    idQuestionAdmin = questionRes.adminGetAllQuestion.items.find((i) => i.status === 'UNAPPROVED').id;
    const answerQuestionRes = await getSDK(adminToken).adminAnswerQuestion({
      data: {
        id: idQuestionAdmin,
        content: '123',
      },
    });

    expect(answerQuestionRes.adminAnswerQuestion.id).toBeDefined();
    expect(answerQuestionRes.adminAnswerQuestion.content).toBe('123');
    expect(answerQuestionRes.adminAnswerQuestion.answeredBy).toBeDefined();
    expect(answerQuestionRes.adminAnswerQuestion.answeredById).toBeDefined();
    const questionRes1 = await getSDK(adminToken).getAllQuestions();
    expect(questionRes1.adminGetAllQuestion.items.find((j) => j.id === idQuestionAdmin).status).toContain('ANSWERED');
  });

  test('#1: Admin chỉnh sửa câu trả lời của mình', async () => {
    const answerQuestionRes = await getSDK(adminToken).adminAnswerQuestion({
      data: {
        id: idQuestionAdmin,
        content: 'Update',
      },
    });

    expect(answerQuestionRes.adminAnswerQuestion.id).toBeDefined();
    expect(answerQuestionRes.adminAnswerQuestion.content).toBe('Update');
    expect(answerQuestionRes.adminAnswerQuestion.answeredBy).toBeDefined();
    expect(answerQuestionRes.adminAnswerQuestion.answeredById).toBeDefined();
    const questionRes1 = await getSDK(adminToken).getAllQuestions();
    expect(questionRes1.adminGetAllQuestion.items.find((j) => j.id === idQuestionAdmin).status).toContain('ANSWERED');
    expect(questionRes1.adminGetAllQuestion.items.find((j) => j.id === idQuestionAdmin).answer.content).toContain('Update');
  });

  test('#1: Luật sư trả lời câu hỏi được gán cho mình', async () => {
    const questionRes = await getSDK(adminToken).getAllQuestions();
    let idQuestion = questionRes.adminGetAllQuestion.items.find((i) => i.assigneeId !== null && i.status == 'APPROVED').id;
    const question = await getSDK(adminToken).getQuestion({
      data: {
        id: idQuestion,
      },
    });
    let emailLawyer = question.adminGetQuestion.assignee.email;
    // expect(emailLawyer).toBe('123');

    const lawyerLogin = await getSDK().adminLogin({
      data: {
        email: emailLawyer,
        password: '123456',
      },
    });
    const answerQuestionRes = await getSDK(lawyerLogin.adminLogin.token).adminAnswerQuestion({
      data: {
        id: idQuestion,
        content: 'Lawyer',
      },
    });

    expect(answerQuestionRes.adminAnswerQuestion.id).toBeDefined();
    expect(answerQuestionRes.adminAnswerQuestion.content).toBe('Lawyer');
    expect(answerQuestionRes.adminAnswerQuestion.answeredBy).toBeDefined();
    expect(answerQuestionRes.adminAnswerQuestion.answeredById).toBeDefined();
    const question2 = await getSDK(adminToken).getQuestion({
      data: {
        id: idQuestion,
      },
    });
    expect(question2.adminGetQuestion.status).toContain('ANSWERED');
    expect(question2.adminGetQuestion.answer.content).toContain('Lawyer');
  });

  test('#1: Luật sư update câu trả lời của mình', async () => {
    const questionRes = await getSDK(adminToken).getAllQuestions();
    let idQuestion = questionRes.adminGetAllQuestion.items.find((i) => i.assigneeId !== null && i.status == 'ANSWERED').id;
    const question = await getSDK(adminToken).getQuestion({
      data: {
        id: idQuestion,
      },
    });
    let emailLawyer = question.adminGetQuestion.assignee.email;
    const lawyerLogin = await getSDK().adminLogin({
      data: {
        email: emailLawyer,
        password: '123456',
      },
    });
    const answerQuestionRes = await getSDK(lawyerLogin.adminLogin.token).adminAnswerQuestion({
      data: {
        id: idQuestion,
        content: 'Lawyer Update',
      },
    });
    expect(answerQuestionRes.adminAnswerQuestion.id).toBeDefined();
    expect(answerQuestionRes.adminAnswerQuestion.content).toBe('Lawyer Update');
    expect(answerQuestionRes.adminAnswerQuestion.answeredBy.id).toBe(idQuestionRep);
    expect(answerQuestionRes.adminAnswerQuestion.answeredById).toBe(idQuestionRep);
    const question2 = await getSDK(adminToken).getQuestion({
      data: {
        id: idQuestion,
      },
    });
    expect(question2.adminGetQuestion.status).toContain('ANSWERED');
    expect(question2.adminGetQuestion.answer.content).toContain('Lawyer Update');
    expect(question2.adminGetQuestion.updatedAt).toBeGreaterThan(question.adminGetQuestion.updatedAt);
  });
  test('#1: Admin chỉnh sửa câu hỏi của người khác', async () => {
    const questionRes = await getSDK(adminToken).getAllQuestions();
    let idQuestion = questionRes.adminGetAllQuestion.items.find((i) => i.status === 'ANSWERED' && i.answerId !== '1').id;
    const answerQuestionRes = await getSDK(adminToken).adminAnswerQuestion({
      data: {
        id: idQuestion,
        content: 'Admin update',
      },
    });
    expect(answerQuestionRes.adminAnswerQuestion.id).toBeDefined();
    expect(answerQuestionRes.adminAnswerQuestion.content).toBe('Admin update');
    expect(answerQuestionRes.adminAnswerQuestion.answeredBy).toBeDefined();
    expect(answerQuestionRes.adminAnswerQuestion.answeredById).toBeDefined();
    const question2 = await getSDK(adminToken).getQuestion({
      data: {
        id: idQuestion,
      },
    });
    expect(question2.adminGetQuestion.status).toContain('ANSWERED');
    expect(question2.adminGetQuestion.answer.content).toContain('Admin update');
  });

  test('#1: Luật sư trả lời câu hỏi không phải của mình', async () => {
    try {
      const questionRes = await getSDK(adminToken).getAllQuestions();
      let idLawyer = questionRes.adminGetAllQuestion.items.find((i) => i.assigneeId !== null && i.status == 'APPROVED').assigneeId;
      let idLawyer2 = questionRes.adminGetAllQuestion.items.find((i) => i.assigneeId !== null && i.assigneeId !== idLawyer).assigneeId;
      const questionRes2 = await getSDK(adminToken).getAllQuestions();
      let idQuestion = questionRes2.adminGetAllQuestion.items.find((i) => i.assigneeId === idLawyer).id;
      const lawyerRes = await getSDK(adminToken).getLawyer({
        data: {
          id: idLawyer2,
        },
      });
      let emailLawyer = lawyerRes.adminGetLawyer.email;
      const lawyerLogin = await getSDK().adminLogin({
        data: {
          email: emailLawyer,
          password: '123456',
        },
      });
      const answerQuestionRes = await getSDK(lawyerLogin.adminLogin.token).adminAnswerQuestion({
        data: {
          id: idQuestion,
          content: 'Lawyer Update',
        },
      });
      expect('Hiển thị lỗi').toBe('123');
    } catch (error) {
      expect(error.message).toContain('Forbidden');
    }
  });
  test('#1: Câu trả lời null=> K thể trả lời nếu content=null', async () => {
    try {
      const questionRes = await getSDK(adminToken).getAllQuestions();
      idQuestionAdmin = questionRes.adminGetAllQuestion.items.find((i) => i.status === 'UNAPPROVED').id;
      const answerQuestionRes = await getSDK(adminToken).adminAnswerQuestion({
        data: {
          id: idQuestionAdmin,
          content: '',
        },
      });
      expect('Hiển thị lỗi').toBe('123');
    } catch (error) {
      expect(error.message).toContain('321');
    }
  });

  test('#1:Admin trả lời câu hỏi không tồn tại=> Thông báo lỗi', async () => {
    try {
      const questionRes = await getSDK(adminToken).getAllQuestions();
      idQuestionAdmin = questionRes.adminGetAllQuestion.items.find((i) => i.status === 'UNAPPROVED').id;
      const answerQuestionRes = await getSDK(adminToken).adminAnswerQuestion({
        data: {
          id: '10000',
          content: '',
        },
      });
      expect('Hiển thị lỗi').toBe('123');
    } catch (error) {
      expect(error.message).toContain('Something went wrong, please try again!');
    }
  });
});
