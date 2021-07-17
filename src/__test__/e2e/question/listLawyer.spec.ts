import { makeQuestion } from '@/__test__/data/question';
import { makeQuestion1Lawyer } from '@/__test__/data/questionLawyer';
import { ArticleSortBy, Order, QuestionSortBy, QuestionStatus } from '@/__test__/graphql/sdk';
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
  let tokenLawyer: string;
  beforeAll(async () => {
    await recreateDatabase();
    await seedAdmin();
    await makeQuestion1Lawyer(10);
    question = await makeQuestion(10);
    adminToken = await getAdminAccessToken();
  }, 1000000);

  test('#1: Lawyer chỉ xem được danh sách quà của mình', async () => {
    const lawyerRes = await getSDK(adminToken).getLawyer({
      data: {
        id: '2',
      },
    });
    const loginLawyer = await getSDK().adminLogin({
      data: {
        email: lawyerRes.adminGetLawyer.email,
        password: '123456',
      },
    });
    tokenLawyer = loginLawyer.adminLogin.token;
    const questionRes = await getSDK(tokenLawyer).getAllQuestions();
    expect(questionRes.adminGetAllQuestion.items.length).toBe(10);
    expect(questionRes.adminGetAllQuestion.items[0].assigneeId).toBe('2');
    expect(questionRes.adminGetAllQuestion.paginate.pageIndex).toBe(1);
    expect(questionRes.adminGetAllQuestion.paginate.pageSize).toBe(20);
    expect(questionRes.adminGetAllQuestion.paginate.totalItems).toBe(10);
  });
  test('#2: Kiểm tra số bản ghi trên 1 page', async () => {
    const questionRes = await getSDK(tokenLawyer).getAllQuestions({
      pageIndex: 1,
      pageSize: 5,
    });
    expect(questionRes.adminGetAllQuestion.paginate.pageSize).toBe(5);
    expect(questionRes.adminGetAllQuestion.paginate.pageIndex).toBe(1);
    expect(questionRes.adminGetAllQuestion.items[0].assigneeId).toBe('2');
    expect(questionRes.adminGetAllQuestion.items[0].id).toBeDefined();
    expect(questionRes.adminGetAllQuestion.items[0].title).toBeDefined();
    expect(questionRes.adminGetAllQuestion.items[0].content).toBeDefined();
    expect(questionRes.adminGetAllQuestion.items[0].status).toBeDefined();
    expect(questionRes.adminGetAllQuestion.items[0].masterData.id).toBeDefined();
  });

  test('#3: Tìm kiếm có space đầu cuối', async () => {
    const questionRes1 = await getSDK(tokenLawyer).getAllQuestions();
    const questionRes = await getSDK(tokenLawyer).getAllQuestions({
      filter: {
        query: ' ' + questionRes1.adminGetAllQuestion.items[6].title + ' ',
      },
    });
    expect(questionRes.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes.adminGetAllQuestion.items.length; i++) {
      expect(questionRes.adminGetAllQuestion.items[i].title).toContain(questionRes1.adminGetAllQuestion.items[6].title);
      expect(questionRes.adminGetAllQuestion.items[i].assigneeId).toBe('2');
    }
  });

  test('#5: Tìm kiếm theo query với từ gần giống', async () => {
    const questionRes1 = await getSDK(tokenLawyer).getAllQuestions();
    let query = questionRes1.adminGetAllQuestion.items[6].title.slice(3);
    const questionRes = await getSDK(tokenLawyer).getAllQuestions({
      filter: {
        query: query,
      },
      pageIndex: 1,
      pageSize: 5,
    });

    expect(questionRes.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes.adminGetAllQuestion.items.length; i++) {
      expect(questionRes.adminGetAllQuestion.items[i].title).toContain(questionRes1.adminGetAllQuestion.items[6].title);
      expect(questionRes.adminGetAllQuestion.items[i].assigneeId).toBe('2');
    }
  });

  test('#7: Tìm kiếm không phân biệt hoa thường', async () => {
    const questionRes1 = await getSDK(tokenLawyer).getAllQuestions();
    let queryUpper = questionRes1.adminGetAllQuestion.items[6].title.toUpperCase();
    const questionRes = await getSDK(tokenLawyer).getAllQuestions({
      filter: {
        query: queryUpper,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(questionRes.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes.adminGetAllQuestion.items.length; i++) {
      expect(questionRes.adminGetAllQuestion.items[i].title).toContain(questionRes1.adminGetAllQuestion.items[6].title);
      expect(questionRes.adminGetAllQuestion.items[i].assigneeId).toBe('2');
    }
  });

  test('#7: Tìm kiếm query k tồn tại', async () => {
    const questionRes = await getSDK(tokenLawyer).getAllQuestions({
      filter: {
        query: 'sjhasf  akf kafljs',
      },
      pageIndex: 1,
      pageSize: 10,
    });
    expect(questionRes.adminGetAllQuestion.items.length).toBe(0);
    expect(questionRes.adminGetAllQuestion.paginate.totalItems).toBe(0);
    expect(questionRes.adminGetAllQuestion.paginate.totalPage).toBe(0);
    expect(questionRes.adminGetAllQuestion.paginate.pageIndex).toBe(1);
    expect(questionRes.adminGetAllQuestion.paginate.pageSize).toBe(10);
  });
  test('#3: Kiểm tra filter theo masterDataId', async () => {
    const questionRes1 = await getSDK(tokenLawyer).getAllQuestions();
    const questionRes = await getSDK(tokenLawyer).getAllQuestions({
      filter: {
        masterDataId: questionRes1.adminGetAllQuestion.items[1].masterDataId,
      },
    });
    expect(questionRes.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes.adminGetAllQuestion.items.length; i++) {
      expect(questionRes.adminGetAllQuestion.items[i].masterDataId).toContain(questionRes1.adminGetAllQuestion.items[1].masterDataId);
      expect(questionRes.adminGetAllQuestion.items[i].assigneeId).toBe('2');
    }
  });

  test('#4: Kiểm tra filter theo masterDataId không tồn tại', async () => {
    const questionRes = await getSDK(tokenLawyer).getAllQuestions({
      filter: {
        masterDataId: '1000',
      },
      pageIndex: 1,
      pageSize: 10,
    });
    expect(questionRes.adminGetAllQuestion.items.length).toBe(0);
    expect(questionRes.adminGetAllQuestion.paginate.totalItems).toBe(0);
    expect(questionRes.adminGetAllQuestion.paginate.totalPage).toBe(0);
    expect(questionRes.adminGetAllQuestion.paginate.pageIndex).toBe(1);
    expect(questionRes.adminGetAllQuestion.paginate.pageSize).toBe(10);
  });

  test('#11: Kiểm tra query theo query và masterId  ', async () => {
    const questionRes = await getSDK(tokenLawyer).getAllQuestions();
    const questionRes2 = await getSDK(tokenLawyer).getAllQuestions({
      filter: {
        masterDataId: questionRes.adminGetAllQuestion.items[0].masterDataId,
        query: questionRes.adminGetAllQuestion.items[0].title,
      },
    });
    expect(questionRes2.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes2.adminGetAllQuestion.items.length; i++) {
      expect(questionRes2.adminGetAllQuestion.items[i].title).toContain(questionRes.adminGetAllQuestion.items[0].title);
      expect(questionRes2.adminGetAllQuestion.items[i].masterDataId).toContain(questionRes.adminGetAllQuestion.items[0].masterDataId);
      expect(questionRes.adminGetAllQuestion.items[i].assigneeId).toBe('2');
    }
  });

  test('#13: Tìm kiếm bản ghi ở trang #1', async () => {
    const questionRes = await getSDK(tokenLawyer).getAllQuestions();
    const questionRes2 = await getSDK(tokenLawyer).getAllQuestions({
      filter: {
        query: questionRes.adminGetAllQuestion.items[7].title,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(questionRes2.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes2.adminGetAllQuestion.items.length; i++) {
      expect(questionRes2.adminGetAllQuestion.items[i].title).toContain(questionRes.adminGetAllQuestion.items[7].title);
      expect(questionRes.adminGetAllQuestion.items[i].assigneeId).toBe('2');
    }
  });

  test('#10: Tìm kiếm bản ghi theo status= UNAPPROVED', async () => {
    const questionRes = await getSDK(tokenLawyer).getAllQuestions({
      filter: {
        status: QuestionStatus.Unapproved,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(questionRes.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes.adminGetAllQuestion.items.length; i++) {
      expect(questionRes.adminGetAllQuestion.items[i].status).toBe('UNAPPROVED');
      expect(questionRes.adminGetAllQuestion.items[i].assigneeId).toBe('2');
    }
  });
  test('#10: Tìm kiếm bản ghi theo status= APPROVED', async () => {
    const questionRes = await getSDK(tokenLawyer).getAllQuestions({
      filter: {
        status: QuestionStatus.Approved,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(questionRes.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes.adminGetAllQuestion.items.length; i++) {
      expect(questionRes.adminGetAllQuestion.items[i].status).toBe('APPROVED');
      expect(questionRes.adminGetAllQuestion.items[i].assigneeId).toBe('2');
    }
  });

  test('#15: Tìm kiếm bản ghi theo to', async () => {
    const questionRes1 = await getSDK(tokenLawyer).getAllQuestions();
    const questionRes = await getSDK(tokenLawyer).getAllQuestions({
      filter: {
        to: questionRes1.adminGetAllQuestion.items[2].createdAt,
        from: 123,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(questionRes.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes.adminGetAllQuestion.items.length; i++) {
      expect(questionRes.adminGetAllQuestion.items[i].createdAt).toBeLessThanOrEqual(questionRes1.adminGetAllQuestion.items[2].createdAt);
      expect(questionRes.adminGetAllQuestion.items[i].assigneeId).toBe('2');
    }
  });

  test('#17: Tìm kiếm bản ghi trong 1 khoảng thời', async () => {
    const questionRes1 = await getSDK(tokenLawyer).getAllQuestions();
    const questionRes = await getSDK(tokenLawyer).getAllQuestions({
      filter: {
        to: questionRes1.adminGetAllQuestion.items[3].createdAt,
        from: questionRes1.adminGetAllQuestion.items[7].createdAt,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(questionRes.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes.adminGetAllQuestion.items.length; i++) {
      expect(questionRes.adminGetAllQuestion.items[i].createdAt).toBeLessThanOrEqual(questionRes1.adminGetAllQuestion.items[3].createdAt);
      expect(questionRes.adminGetAllQuestion.items[i].createdAt).toBeGreaterThanOrEqual(questionRes1.adminGetAllQuestion.items[7].createdAt);
      expect(questionRes.adminGetAllQuestion.items[i].assigneeId).toBe('2');
    }
  });

  test('#17: Tìm kiếm bản ghi trong 1 khoảng thời không tồn tại', async () => {
    const questionRes = await getSDK(tokenLawyer).getAllQuestions({
      filter: {
        to: 123,
        from: 123,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(questionRes.adminGetAllQuestion.items.length).toBe(0);
    expect(questionRes.adminGetAllQuestion.paginate.totalItems).toBe(0);
    expect(questionRes.adminGetAllQuestion.paginate.totalPage).toBe(0);
    expect(questionRes.adminGetAllQuestion.paginate.pageSize).toBe(5);
    expect(questionRes.adminGetAllQuestion.paginate.pageIndex).toBe(1);
  });

  test('#18: Tìm kiếm bản ghi theo query và masterData', async () => {
    const questionRes1 = await getSDK(tokenLawyer).getAllQuestions();
    const questionRes = await getSDK(tokenLawyer).getAllQuestions({
      filter: {
        query: questionRes1.adminGetAllQuestion.items[3].title,
        masterDataId: questionRes1.adminGetAllQuestion.items[3].masterDataId,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(questionRes.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes.adminGetAllQuestion.items.length; i++) {
      expect(questionRes.adminGetAllQuestion.items[i].masterData.id).toBe(questionRes1.adminGetAllQuestion.items[3].masterDataId);
      expect(questionRes.adminGetAllQuestion.items[i].title).toBe(questionRes1.adminGetAllQuestion.items[3].title);
      expect(questionRes.adminGetAllQuestion.items[i].assigneeId).toBe('2');
    }
  });

  test('#19: Tìm kiếm bản ghi theo query và from, to', async () => {
    const questionRes1 = await getSDK(tokenLawyer).getAllQuestions();
    const questionRes = await getSDK(tokenLawyer).getAllQuestions({
      filter: {
        to: questionRes1.adminGetAllQuestion.items[3].createdAt,
        from: questionRes1.adminGetAllQuestion.items[7].createdAt,
        query: questionRes1.adminGetAllQuestion.items[5].title,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(questionRes.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes.adminGetAllQuestion.items.length; i++) {
      expect(questionRes.adminGetAllQuestion.items[i].createdAt).toBeGreaterThanOrEqual(questionRes1.adminGetAllQuestion.items[7].createdAt);
      expect(questionRes.adminGetAllQuestion.items[i].createdAt).toBeLessThanOrEqual(questionRes1.adminGetAllQuestion.items[3].createdAt);
      expect(questionRes.adminGetAllQuestion.items[i].title).toBe(questionRes1.adminGetAllQuestion.items[5].title);
      expect(questionRes.adminGetAllQuestion.items[i].assigneeId).toBe('2');
    }
  });

  test('#20: Tìm kiếm bản ghi theo masterData và to, from', async () => {
    const questionRes1 = await getSDK(tokenLawyer).getAllQuestions();
    const questionRes = await getSDK(adminToken).getAllQuestions({
      filter: {
        to: questionRes1.adminGetAllQuestion.items[3].createdAt,
        from: questionRes1.adminGetAllQuestion.items[7].createdAt,
        masterDataId: questionRes1.adminGetAllQuestion.items[5].masterDataId,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(questionRes.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes.adminGetAllQuestion.items.length; i++) {
      expect(questionRes.adminGetAllQuestion.items[i].createdAt).toBeGreaterThanOrEqual(questionRes1.adminGetAllQuestion.items[7].createdAt);
      expect(questionRes.adminGetAllQuestion.items[i].createdAt).toBeLessThanOrEqual(questionRes1.adminGetAllQuestion.items[3].createdAt);
      expect(questionRes.adminGetAllQuestion.items[i].masterDataId).toBe(questionRes1.adminGetAllQuestion.items[5].masterDataId);
      expect(questionRes.adminGetAllQuestion.items[i].assigneeId).toBe('2');
    }
  });

  test('#20: Tìm kiếm bản ghi theo status và to, from', async () => {
    const questionRes = await getSDK(tokenLawyer).getAllQuestions();
    const questionRes1 = await getSDK(tokenLawyer).getAllQuestions({
      filter: {
        to: questionRes.adminGetAllQuestion.items[3].createdAt,
        from: questionRes.adminGetAllQuestion.items[7].createdAt,
        status: QuestionStatus.Approved,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(questionRes1.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes1.adminGetAllQuestion.items.length; i++) {
      expect(questionRes1.adminGetAllQuestion.items[i].createdAt).toBeGreaterThanOrEqual(questionRes.adminGetAllQuestion.items[7].createdAt);
      expect(questionRes1.adminGetAllQuestion.items[i].createdAt).toBeLessThanOrEqual(questionRes.adminGetAllQuestion.items[3].createdAt);
      expect(questionRes1.adminGetAllQuestion.items[i].status).toBe('APPROVED');
      expect(questionRes.adminGetAllQuestion.items[i].assigneeId).toBe('2');
    }
  });

  test('#21: Tìm kiếm bản ghi theo query và status', async () => {
    const questionRes1 = await getSDK(tokenLawyer).getAllQuestions();
    const questionRes = await getSDK(tokenLawyer).getAllQuestions({
      filter: {
        status: questionRes1.adminGetAllQuestion.items[5].status,
        query: questionRes1.adminGetAllQuestion.items[5].title,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(questionRes.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes.adminGetAllQuestion.items.length; i++) {
      expect(questionRes.adminGetAllQuestion.items[i].status).toBe(questionRes1.adminGetAllQuestion.items[5].status);
      expect(questionRes.adminGetAllQuestion.items[i].title).toBe(questionRes1.adminGetAllQuestion.items[5].title);
      expect(questionRes.adminGetAllQuestion.items[i].assigneeId).toBe('2');
    }
  });

  test('#22: Tìm kiếm bản ghi theo masterData và status', async () => {
    const questionRes1 = await getSDK(tokenLawyer).getAllQuestions();
    const questionRes = await getSDK(tokenLawyer).getAllQuestions({
      filter: {
        status: questionRes1.adminGetAllQuestion.items[6].status,
        masterDataId: questionRes1.adminGetAllQuestion.items[6].masterDataId,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(questionRes.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes.adminGetAllQuestion.items.length; i++) {
      expect(questionRes.adminGetAllQuestion.items[i].status).toBe(questionRes1.adminGetAllQuestion.items[6].status);
      expect(questionRes.adminGetAllQuestion.items[i].masterDataId).toBe(questionRes1.adminGetAllQuestion.items[6].masterDataId);
      expect(questionRes.adminGetAllQuestion.items[i].assigneeId).toBe('2');
    }
  });
  test('#23: Tìm kiếm bản ghi theo query, to, from, masterData', async () => {
    const questionRes = await getSDK(tokenLawyer).getAllQuestions();
    const questionRes1 = await getSDK(tokenLawyer).getAllQuestions({
      filter: {
        to: questionRes.adminGetAllQuestion.items[3].createdAt,
        from: questionRes.adminGetAllQuestion.items[7].createdAt,
        query: questionRes.adminGetAllQuestion.items[6].title,
        masterDataId: questionRes.adminGetAllQuestion.items[6].masterDataId,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(questionRes1.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes1.adminGetAllQuestion.items.length; i++) {
      expect(questionRes1.adminGetAllQuestion.items[i].createdAt).toBeGreaterThanOrEqual(questionRes.adminGetAllQuestion.items[7].createdAt);
      expect(questionRes1.adminGetAllQuestion.items[i].createdAt).toBeLessThanOrEqual(questionRes.adminGetAllQuestion.items[3].createdAt);
      expect(questionRes1.adminGetAllQuestion.items[i].title).toBe(questionRes.adminGetAllQuestion.items[6].title);
      expect(questionRes1.adminGetAllQuestion.items[i].masterDataId).toBe(questionRes.adminGetAllQuestion.items[6].masterDataId);
      expect(questionRes.adminGetAllQuestion.items[i].assigneeId).toBe('2');
    }
  });

  test('#24: Tìm kiếm bản ghi theo query, to, status, from', async () => {
    const questionRes = await getSDK(tokenLawyer).getAllQuestions();
    const questionRes1 = await getSDK(tokenLawyer).getAllQuestions({
      filter: {
        to: questionRes.adminGetAllQuestion.items[3].createdAt,
        from: questionRes.adminGetAllQuestion.items[7].createdAt,
        status: questionRes.adminGetAllQuestion.items[6].status,
        query: questionRes.adminGetAllQuestion.items[6].title,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(questionRes1.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes1.adminGetAllQuestion.items.length; i++) {
      expect(questionRes1.adminGetAllQuestion.items[i].createdAt).toBeGreaterThanOrEqual(questionRes.adminGetAllQuestion.items[7].createdAt);
      expect(questionRes1.adminGetAllQuestion.items[i].createdAt).toBeLessThanOrEqual(questionRes.adminGetAllQuestion.items[3].createdAt);
      expect(questionRes1.adminGetAllQuestion.items[i].status).toBe(questionRes.adminGetAllQuestion.items[6].status);
      expect(questionRes1.adminGetAllQuestion.items[i].title).toBe(questionRes.adminGetAllQuestion.items[6].title);
      expect(questionRes.adminGetAllQuestion.items[i].assigneeId).toBe('2');
    }
  });

  test('#25: Tìm kiếm bản ghi theo from to, status, masterData', async () => {
    const questionRes = await getSDK(tokenLawyer).getAllQuestions();
    const questionRes1 = await getSDK(tokenLawyer).getAllQuestions({
      filter: {
        to: questionRes.adminGetAllQuestion.items[3].createdAt,
        from: questionRes.adminGetAllQuestion.items[7].createdAt,
        status: questionRes.adminGetAllQuestion.items[6].status,
        masterDataId: questionRes.adminGetAllQuestion.items[6].masterDataId,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(questionRes1.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes1.adminGetAllQuestion.items.length; i++) {
      expect(questionRes1.adminGetAllQuestion.items[i].createdAt).toBeGreaterThanOrEqual(questionRes.adminGetAllQuestion.items[7].createdAt);
      expect(questionRes1.adminGetAllQuestion.items[i].createdAt).toBeLessThanOrEqual(questionRes.adminGetAllQuestion.items[3].createdAt);
      expect(questionRes1.adminGetAllQuestion.items[i].status).toBe(questionRes.adminGetAllQuestion.items[6].status);
      expect(questionRes1.adminGetAllQuestion.items[i].masterDataId).toBe(questionRes.adminGetAllQuestion.items[6].masterDataId);
      expect(questionRes.adminGetAllQuestion.items[i].assigneeId).toBe('2');
    }
  });

  test('#26: Tìm kiếm bản ghi theo query, to, status, masterData, from', async () => {
    const questionRes = await getSDK(tokenLawyer).getAllQuestions();
    const questionRes1 = await getSDK(tokenLawyer).getAllQuestions({
      filter: {
        to: questionRes.adminGetAllQuestion.items[3].createdAt,
        from: questionRes.adminGetAllQuestion.items[7].createdAt,
        status: questionRes.adminGetAllQuestion.items[6].status,
        masterDataId: questionRes.adminGetAllQuestion.items[6].masterDataId,
        query: questionRes.adminGetAllQuestion.items[6].title,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(questionRes1.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes1.adminGetAllQuestion.items.length; i++) {
      expect(questionRes1.adminGetAllQuestion.items[i].createdAt).toBeGreaterThanOrEqual(questionRes.adminGetAllQuestion.items[7].createdAt);
      expect(questionRes1.adminGetAllQuestion.items[i].createdAt).toBeLessThanOrEqual(questionRes.adminGetAllQuestion.items[3].createdAt);
      expect(questionRes1.adminGetAllQuestion.items[i].status).toBe(questionRes.adminGetAllQuestion.items[6].status);
      expect(questionRes1.adminGetAllQuestion.items[i].masterDataId).toBe(questionRes.adminGetAllQuestion.items[6].masterDataId);
      expect(questionRes1.adminGetAllQuestion.items[i].title).toBe(questionRes.adminGetAllQuestion.items[6].title);
      expect(questionRes.adminGetAllQuestion.items[i].assigneeId).toBe('2');
    }
  });

  test('#27: Sort theo createdAt tăng dần', async () => {
    const questionRes = await getSDK(tokenLawyer).getAllQuestions({
      filter: {
        orderBy: {
          sort: QuestionSortBy.CreatedAt,
          order: Order.Asc,
        },
      },
    });
    expect(questionRes.adminGetAllQuestion.items.length).not.toBe(0);

    for (let i = 0; i < questionRes.adminGetAllQuestion.items.length - 1; i++) {
      expect(questionRes.adminGetAllQuestion.items[i].createdAt).toBeLessThanOrEqual(questionRes.adminGetAllQuestion.items[i + 1].createdAt);
      expect(questionRes.adminGetAllQuestion.items[i].assigneeId).toBe('2');
    }
  });

  test('#28: Sort theo createdAt giảm đân', async () => {
    const questionRes = await getSDK(tokenLawyer).getAllQuestions({
      filter: {
        orderBy: {
          sort: QuestionSortBy.CreatedAt,
          order: Order.Desc,
        },
      },
    });
    expect(questionRes.adminGetAllQuestion.items.length).not.toBe(0);

    for (let i = 0; i < questionRes.adminGetAllQuestion.items.length - 1; i++) {
      expect(questionRes.adminGetAllQuestion.items[i].createdAt).toBeGreaterThanOrEqual(questionRes.adminGetAllQuestion.items[i + 1].createdAt);
      expect(questionRes.adminGetAllQuestion.items[i].assigneeId).toBe('2');
    }
  });

  test('#27: Sort theo answeredAt tăng dần', async () => {
    const questionRes = await getSDK(tokenLawyer).getAllQuestions({
      filter: {
        orderBy: {
          sort: QuestionSortBy.AnsweredAt,
          order: Order.Asc,
        },
      },
    });
    expect(questionRes.adminGetAllQuestion.items.length).not.toBe(0);

    for (let i = 0; i < questionRes.adminGetAllQuestion.items.length - 1; i++) {
      expect(questionRes.adminGetAllQuestion.items[i].answer.createdAt).toBeLessThanOrEqual(questionRes.adminGetAllQuestion.items[i + 1].answer.createdAt);
      expect(questionRes.adminGetAllQuestion.items[i].assigneeId).toBe('2');
    }
  });

  test('#28: Sort theo answeredAt giảm đân', async () => {
    const questionRes = await getSDK(tokenLawyer).getAllQuestions({
      filter: {
        orderBy: {
          sort: QuestionSortBy.AnsweredAt,
          order: Order.Desc,
        },
      },
    });
    expect(questionRes.adminGetAllQuestion.items.length).not.toBe(0);

    for (let i = 0; i < questionRes.adminGetAllQuestion.items.length - 1; i++) {
      expect(questionRes.adminGetAllQuestion.items[i].answer.createdAt).toBeGreaterThanOrEqual(questionRes.adminGetAllQuestion.items[i + 1].answer.createdAt);
    }
  });

  test('#29: Sort theo category tăng dần', async () => {
    var b = [];
    const questionRes1 = await getSDK(tokenLawyer).getAllQuestions();
    for (let i = 0; i < questionRes1.adminGetAllQuestion.items.length; i++) {
      let category = questionRes1.adminGetAllQuestion.items[i].masterData.value;
      b.push(category);
    }
    const questionRes = await getSDK(tokenLawyer).getAllQuestions({
      filter: {
        orderBy: {
          sort: QuestionSortBy.Category,
          order: Order.Asc,
        },
      },
    });
    var c = b.sort();
    expect(questionRes.adminGetAllQuestion.items.length).not.toBe(0);

    for (let i = 0; i < questionRes.adminGetAllQuestion.items.length; i++) {
      expect(c[i]).toBe(questionRes.adminGetAllQuestion.items[i].masterData.value);
      expect(questionRes.adminGetAllQuestion.items[i].assigneeId).toBe('2');
    }
  });

  test('#30: Sort theo category giảm dần', async () => {
    var b = [];
    const questionRes1 = await getSDK(tokenLawyer).getAllQuestions();
    for (let i = 0; i < questionRes1.adminGetAllQuestion.items.length; i++) {
      let category = questionRes1.adminGetAllQuestion.items[i].masterData.value;
      b.push(category);
    }
    const questionRes = await getSDK(tokenLawyer).getAllQuestions({
      filter: {
        orderBy: {
          sort: QuestionSortBy.Category,
          order: Order.Desc,
        },
      },
    });
    var c = b.sort();
    expect(questionRes.adminGetAllQuestion.items.length).not.toBe(0);

    for (let i = 0; i < questionRes.adminGetAllQuestion.items.length; i++) {
      expect(c[questionRes.adminGetAllQuestion.items.length - i - 1]).toBe(questionRes.adminGetAllQuestion.items[i].masterData.value);
      expect(questionRes.adminGetAllQuestion.items[i].assigneeId).toBe('2');
    }
  });

  test('#32: Sort theo createdAt giảm đân và query', async () => {
    const questionRes1 = await getSDK(tokenLawyer).getAllQuestions();
    const questionRes = await getSDK(tokenLawyer).getAllQuestions({
      filter: {
        query: questionRes1.adminGetAllQuestion.items[3].title,
        orderBy: {
          sort: QuestionSortBy.CreatedAt,
          order: Order.Desc,
        },
      },
    });
    expect(questionRes.adminGetAllQuestion.items.length).not.toBe(0);

    for (let i = 0; i < questionRes.adminGetAllQuestion.items.length - 1; i++) {
      expect(questionRes.adminGetAllQuestion.items[i].title).toContain(questionRes1.adminGetAllQuestion.items[3].title);
      expect(questionRes.adminGetAllQuestion.items[i].createdAt).toBeGreaterThanOrEqual(questionRes.adminGetAllQuestion.items[i + 1].createdAt);
      expect(questionRes.adminGetAllQuestion.items[i].assigneeId).toBe('2');
    }
  });
});
