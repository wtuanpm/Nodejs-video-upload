import { makeStatusQuestion } from '@/__test__/data/statusQuestion';
import { LawyerStatus } from '@/__test__/graphql/sdk';
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
  test('#1: Assign câu hỏi thành công', async () => {
    const questionRes = await getSDK(adminToken).getAllQuestions();
    let idQuestion = questionRes.adminGetAllQuestion.items.find((i) => i.status === 'UNAPPROVED').id;
    let idMasterData = questionRes.adminGetAllQuestion.items.find((i) => i.id === idQuestion).masterData.id;
    const lawyerRes = await getSDK(adminToken).getLawyers();
    let idLawyer = lawyerRes.adminGetAllLawyer.items.find((i) => i.jobField.find((j) => j.id == idMasterData)).id;
    const assignQuestionRes = await getSDK(adminToken).adminAssignQuestion({
      data: {
        id: idQuestion,
        lawyerId: idLawyer,
      },
    });
    const questionRes1 = await getSDK(adminToken).getAllQuestions();

    expect(questionRes1.adminGetAllQuestion.items.find((i) => i.id === idQuestion).masterDataId).toContain(lawyerRes.adminGetAllLawyer.items.find((i) => i.id === idLawyer).jobField[0].id);
    expect(questionRes1.adminGetAllQuestion.items.find((i) => i.id === idQuestion).status).toBe('APPROVED');
    // expect(questionRes1.adminGetAllQuestion.items[0].assignee.id).toBe(idLawyer);
  });

  // test('#1: Assign câu hỏi cho luật sư không tồn tại=>k thay đổi dữ liệu khi luật sư k tồn tại', async () => {
  //   const questionRes = await getSDK(adminToken).getAllQuestions();
  //   let idQuestion = questionRes.adminGetAllQuestion.items.find((i) => i.status === 'UNAPPROVED').id;
  //   await getSDK(adminToken).adminAssignQuestion({
  //     data: {
  //       id: idQuestion,
  //       lawyerId: '20',
  //     },
  //   });
  //   const question = await getSDK(adminToken).getQuestion({
  //     data: {
  //       id: idQuestion,
  //     },
  //   });
  //   expect(question.adminGetQuestion.assigneeId).toBe(null);
  //   expect(question.adminGetQuestion.assignee).toBe(null);
  // });

  test('#1: Assign câu hỏi với luật sư không cùng lĩnh vực', async () => {
    try {
      const questionRes = await getSDK(adminToken).getAllQuestions();
      let idQuestion = questionRes.adminGetAllQuestion.items.find((i) => i.status === 'UNAPPROVED').id;
      let idMasterData = questionRes.adminGetAllQuestion.items.find((i) => i.id === idQuestion).masterData.id;
      const lawyerRes = await getSDK(adminToken).getLawyers();
      let idLawyer = lawyerRes.adminGetAllLawyer.items.find((i) => i.jobField.find((j) => j.id !== idMasterData)).id;
      const assignQuestionRes = await getSDK(adminToken).adminAssignQuestion({
        data: {
          id: idQuestion,
          lawyerId: idLawyer,
        },
      });
      expect('Hiển thị lỗi ở đây').toContain('123');
    } catch (error) {
      expect(error.message).toContain('sa');
    }
  });

  test('#1: Assign câu hỏi với luật sư INACTIVE', async () => {
    try {
      const questionRes = await getSDK(adminToken).getAllQuestions();
      let idQuestion = questionRes.adminGetAllQuestion.items.find((i) => i.status === 'UNAPPROVED').id;
      let idMasterData = questionRes.adminGetAllQuestion.items.find((i) => i.id === idQuestion).masterData.id;
      const lawyerRes = await getSDK(adminToken).getLawyers();
      let idLawyer = lawyerRes.adminGetAllLawyer.items.find((i) => i.jobField.find((j) => j.id == idMasterData)).id;
      const updateStatus = await getSDK(adminToken).adminChangeLawyerStatus({
        id: idLawyer,
        data: {
          status: LawyerStatus.Inactive,
        },
      });
      await getSDK(adminToken).adminAssignQuestion({
        data: {
          id: idQuestion,
          lawyerId: idLawyer,
        },
      });
      expect('Hiển thị lỗi ở đây').toContain('123');
    } catch (error) {
      expect(error.message).toContain('sa');
    }
  });

  test('#1: Assign câu hỏi với luật sư REMOVED', async () => {
    try {
      const questionRes = await getSDK(adminToken).getAllQuestions();
      let idQuestion = questionRes.adminGetAllQuestion.items.find((i) => i.status === 'UNAPPROVED').id;
      let idMasterData = questionRes.adminGetAllQuestion.items.find((i) => i.id === idQuestion).masterData.id;
      const lawyerRes = await getSDK(adminToken).getLawyers();
      let idLawyer = lawyerRes.adminGetAllLawyer.items.find((i) => i.jobField.find((j) => j.id == idMasterData)).id;
      const updateStatus = await getSDK(adminToken).adminChangeLawyerStatus({
        id: idLawyer,
        data: {
          status: LawyerStatus.Removed,
        },
      });
      await getSDK(adminToken).adminAssignQuestion({
        data: {
          id: idQuestion,
          lawyerId: idLawyer,
        },
      });
      expect('Hiển thị lỗi ở đây').toContain('123');
    } catch (error) {
      expect(error.message).toContain('sa');
    }
  });

  test('#1: Assign với câu hỏi đã duyệt', async () => {
    const questionRes = await getSDK(adminToken).getAllQuestions();
    let idQuestion = questionRes.adminGetAllQuestion.items.find((i) => i.status === 'APPROVED').id;
    let idMasterData = questionRes.adminGetAllQuestion.items.find((j) => j.id === idQuestion).masterData.id;
    const lawyerRes = await getSDK(adminToken).getLawyers();
    let idLawyer = lawyerRes.adminGetAllLawyer.items.find((i) => i.jobField.find((j) => j.id === idMasterData)).id;
    const assignQuestionRes = await getSDK(adminToken).adminAssignQuestion({
      data: {
        id: idQuestion,
        lawyerId: idLawyer,
      },
    });
    const questionRes1 = await getSDK(adminToken).getAllQuestions();
    expect(questionRes1.adminGetAllQuestion.items.find((j) => j.id === idQuestion).masterDataId).toContain(lawyerRes.adminGetAllLawyer.items.find((i) => i.id === idLawyer).jobField[0].id);
    expect(questionRes1.adminGetAllQuestion.items.find((j) => j.id === idQuestion).status).toBe('APPROVED');
  });

  test('#1: Assign với câu hỏi đã Reject', async () => {
    const questionRes = await getSDK(adminToken).getAllQuestions();
    let idQuestion = questionRes.adminGetAllQuestion.items.find((i) => i.status === 'REJECTED').id;
    const question = await getSDK(adminToken).getQuestion({
      data: {
        id: idQuestion,
      },
    });

    let idMasterData = question.adminGetQuestion.masterDataId;
    const lawyerRes = await getSDK(adminToken).getLawyers({
      filter: {
        masterDataId: idMasterData,
      },
    });
    let idLawyer = lawyerRes.adminGetAllLawyer.items[0].id;
    // expect(idLawyer).toBe(idQuestion);
    await getSDK(adminToken).adminAssignQuestion({
      data: {
        id: idQuestion,
        lawyerId: idLawyer,
      },
    });
    const questionRes1 = await getSDK(adminToken).getAllQuestions();
    expect(questionRes1.adminGetAllQuestion.items.find((j) => j.id === idQuestion).masterDataId).toContain(lawyerRes.adminGetAllLawyer.items.find((i) => i.id === idLawyer).jobField[0].id);
    expect(questionRes1.adminGetAllQuestion.items.find((j) => j.id === idQuestion).status).toBe('APPROVED');
  });

  test('#1: Assign với câu hỏi đã trả lời=> không thể assign', async () => {
    try {
      const questionRes = await getSDK(adminToken).getAllQuestions();
      let idQuestion = questionRes.adminGetAllQuestion.items.find((i) => i.status === 'ANSWERED').id;
      let idMasterData = questionRes.adminGetAllQuestion.items.find((j) => j.id === idQuestion).masterData.id;
      const lawyerRes = await getSDK(adminToken).getLawyers();
      let idLawyer = lawyerRes.adminGetAllLawyer.items.find((i) => i.jobField.find((j) => j.id !== idMasterData)).id;
      const assignQuestionRes = await getSDK(adminToken).adminAssignQuestion({
        data: {
          id: idQuestion,
          lawyerId: idLawyer,
        },
      });
      expect('Hiển thị lỗi ở đây').toContain('123');
    } catch (error) {
      expect(error.message).toContain('sa');
    }
  });

  test('#1: Luật sư tự assgin câu hỏi => không thể assign', async () => {
    try {
      const questionRes = await getSDK(adminToken).getAllQuestions();
      let idQuestion = questionRes.adminGetAllQuestion.items.find((i) => i.status === 'APPROVED').id;
      const question = await getSDK(adminToken).getQuestion({
        data: {
          id: idQuestion,
        },
      });

      let idMasterData = question.adminGetQuestion.masterDataId;
      const lawyerRes = await getSDK(adminToken).getLawyers({
        filter: {
          masterDataId: idMasterData,
        },
      });
      let emailLawyer = lawyerRes.adminGetAllLawyer.items[0].email;
      const lawyerLogin = await getSDK().adminLogin({
        data: {
          email: emailLawyer,
          password: '123456',
        },
      });
      const assignQuestionRes = await getSDK(lawyerLogin.adminLogin.token).adminAssignQuestion({
        data: {
          id: idQuestion,
          lawyerId: lawyerRes.adminGetAllLawyer.items[0].id,
        },
      });
      expect('Hiển thị lỗi ở đây').toContain('123');
    } catch (error) {
      expect(error.message).toContain('Không xác thực!');
    }
  });
});
