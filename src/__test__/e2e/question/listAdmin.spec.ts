import { makeQuestion } from '@/__test__/data/question';
import { makeStatusQuestion } from '@/__test__/data/statusQuestion';
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
  beforeAll(async () => {
    await recreateDatabase();
    await seedAdmin();
    question = await makeQuestion(10);
    await makeStatusQuestion(10);

    adminToken = await getAdminAccessToken();
  }, 1000000);

  test('#1: Admin xem được toàn bộ danh sách', async () => {
    const questionRes = await getSDK(adminToken).getAllQuestions();
    expect(questionRes.adminGetAllQuestion.items.length).toBe(19);
    expect(questionRes.adminGetAllQuestion.paginate.pageIndex).toBe(1);
    expect(questionRes.adminGetAllQuestion.paginate.pageSize).toBe(20);
    expect(questionRes.adminGetAllQuestion.paginate.totalItems).toBe(19);
  });
  test('#2: Kiểm tra số bản ghi trên 1 page', async () => {
    const questionRes = await getSDK(adminToken).getAllQuestions({
      pageIndex: 1,
      pageSize: 5,
    });

    expect(questionRes.adminGetAllQuestion.items.length).toBe(5);
    expect(questionRes.adminGetAllQuestion.paginate.pageSize).toBe(5);
    expect(questionRes.adminGetAllQuestion.paginate.pageIndex).toBe(1);
  });
  test('#3: Tìm kiếm có space đầu cuối', async () => {
    const questionRes = await getSDK(adminToken).getAllQuestions({
      filter: {
        query: ' ' + `${question[6].title}` + ' ',
      },
    });
    expect(questionRes.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes.adminGetAllQuestion.items.length; i++) {
      expect(questionRes.adminGetAllQuestion.items[i].title).toContain(`${question[6].title}`);
    }
  });

  test('#4: Tìm kiếm bản ghi ở trang 1', async () => {
    const questionRes = await getSDK(adminToken).getAllQuestions({
      filter: {
        query: ' ' + `${question[0].title}` + ' ',
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(questionRes.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes.adminGetAllQuestion.items.length; i++) {
      expect(questionRes.adminGetAllQuestion.items[i].title).toContain(`${question[0].title}`);
    }
  });

  test('#5: Tìm kiếm theo query với từ gần giống', async () => {
    let query = `${question[1].title}`.slice(3);
    const questionRes = await getSDK(adminToken).getAllQuestions({
      filter: {
        query: query,
      },
      pageIndex: 1,
      pageSize: 5,
    });

    expect(questionRes.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes.adminGetAllQuestion.items.length; i++) {
      expect(questionRes.adminGetAllQuestion.items[i].title).toContain(`${question[1].title}`);
    }
  });

  test('#7: Tìm kiếm không phân biệt hoa thường', async () => {
    let queryUpper = `${question[1].title}`.toUpperCase();
    const questionRes = await getSDK(adminToken).getAllQuestions({
      filter: {
        query: queryUpper,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(questionRes.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes.adminGetAllQuestion.items.length; i++) {
      expect(questionRes.adminGetAllQuestion.items[i].title).toContain(`${question[1].title}`);
    }
  });

  test('#7: Tìm kiếm query k tồn tại', async () => {
    const questionRes = await getSDK(adminToken).getAllQuestions({
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
    const questionRes = await getSDK(adminToken).getAllQuestions({
      filter: {
        masterDataId: `${question[1].masterDataId}`,
      },
    });
    expect(questionRes.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes.adminGetAllQuestion.items.length; i++) {
      expect(questionRes.adminGetAllQuestion.items[i].masterDataId).toContain(`${question[1].masterDataId}`);
    }
  });

  test('#4: Kiểm tra filter theo masterDataId không tồn tại', async () => {
    const questionRes = await getSDK(adminToken).getAllQuestions({
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
    const questionRes = await getSDK(adminToken).getAllQuestions();
    const questionRes2 = await getSDK(adminToken).getAllQuestions({
      filter: {
        masterDataId: questionRes.adminGetAllQuestion.items[0].masterDataId,
        query: questionRes.adminGetAllQuestion.items[0].title,
      },
    });
    expect(questionRes2.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes2.adminGetAllQuestion.items.length; i++) {
      expect(questionRes2.adminGetAllQuestion.items[i].title).toContain(questionRes.adminGetAllQuestion.items[0].title);
      expect(questionRes2.adminGetAllQuestion.items[i].masterDataId).toContain(questionRes.adminGetAllQuestion.items[0].masterDataId);
    }
  });

  test('#13: Tìm kiếm bản ghi ở trang #1', async () => {
    const questionRes = await getSDK(adminToken).getAllQuestions();
    const questionRes2 = await getSDK(adminToken).getAllQuestions({
      filter: {
        query: questionRes.adminGetAllQuestion.items[7].title,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(questionRes2.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes2.adminGetAllQuestion.items.length; i++) {
      expect(questionRes2.adminGetAllQuestion.items[i].title).toContain(questionRes.adminGetAllQuestion.items[7].title);
    }
  });

  test('#10: Tìm kiếm bản ghi theo status= UNAPPROVED', async () => {
    const questionRes = await getSDK(adminToken).getAllQuestions({
      filter: {
        status: QuestionStatus.Unapproved,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(questionRes.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes.adminGetAllQuestion.items.length; i++) {
      expect(questionRes.adminGetAllQuestion.items[i].status).toBe('UNAPPROVED');
    }
  });
  test('#10: Tìm kiếm bản ghi theo status= APPROVED', async () => {
    const questionRes = await getSDK(adminToken).getAllQuestions({
      filter: {
        status: QuestionStatus.Approved,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(questionRes.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes.adminGetAllQuestion.items.length; i++) {
      expect(questionRes.adminGetAllQuestion.items[i].status).toBe('APPROVED');
    }
  });
  test('#10: Tìm kiếm bản ghi theo status= REJECTED', async () => {
    const questionRes = await getSDK(adminToken).getAllQuestions({
      filter: {
        status: QuestionStatus.Rejected,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(questionRes.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes.adminGetAllQuestion.items.length; i++) {
      expect(questionRes.adminGetAllQuestion.items[i].status).toBe('REJECTED');
    }
  });
  test('#10: Tìm kiếm bản ghi theo status= Active', async () => {
    const questionRes = await getSDK(adminToken).getAllQuestions({
      filter: {
        status: QuestionStatus.Answered,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(questionRes.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes.adminGetAllQuestion.items.length; i++) {
      expect(questionRes.adminGetAllQuestion.items[i].status).toBe('ANSWERED');
    }
  });

  test('#15: Tìm kiếm bản ghi theo to', async () => {
    const questionRes = await getSDK(adminToken).getAllQuestions({
      filter: {
        to: question[1].createdAt,
        from: 123,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(questionRes.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes.adminGetAllQuestion.items.length; i++) {
      expect(questionRes.adminGetAllQuestion.items[i].createdAt).toBeLessThanOrEqual(question[1].createdAt);
    }
  });

  test('#17: Tìm kiếm bản ghi trong 1 khoảng thời', async () => {
    const questionRes = await getSDK(adminToken).getAllQuestions({
      filter: {
        to: question[3].createdAt,
        from: question[7].createdAt,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(questionRes.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes.adminGetAllQuestion.items.length; i++) {
      expect(questionRes.adminGetAllQuestion.items[i].createdAt).toBeLessThanOrEqual(question[3].createdAt);
      expect(questionRes.adminGetAllQuestion.items[i].createdAt).toBeGreaterThanOrEqual(question[7].createdAt);
    }
  });

  test('#17: Tìm kiếm bản ghi trong 1 khoảng thời không tồn tại', async () => {
    const questionRes = await getSDK(adminToken).getAllQuestions({
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
    const questionRes = await getSDK(adminToken).getAllQuestions({
      filter: {
        query: `${question[5].title}`,
        masterDataId: `${question[5].masterDataId}`,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(questionRes.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes.adminGetAllQuestion.items.length; i++) {
      expect(questionRes.adminGetAllQuestion.items[i].masterData.id).toBe(`${question[5].masterDataId}`);
      expect(questionRes.adminGetAllQuestion.items[i].title).toBe(`${question[5].title}`);
    }
  });

  test('#19: Tìm kiếm bản ghi theo query và from, to', async () => {
    const questionRes = await getSDK(adminToken).getAllQuestions({
      filter: {
        to: question[3].createdAt,
        from: question[7].createdAt,
        query: question[5].title,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(questionRes.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes.adminGetAllQuestion.items.length; i++) {
      expect(questionRes.adminGetAllQuestion.items[i].createdAt).toBeGreaterThanOrEqual(question[7].createdAt);
      expect(questionRes.adminGetAllQuestion.items[i].createdAt).toBeLessThanOrEqual(question[3].createdAt);
      expect(questionRes.adminGetAllQuestion.items[i].title).toBe(`${question[5].title}`);
    }
  });

  test('#20: Tìm kiếm bản ghi theo masterData và to, from', async () => {
    const questionRes = await getSDK(adminToken).getAllQuestions({
      filter: {
        to: question[3].createdAt,
        from: question[7].createdAt,
        masterDataId: `${question[5].masterDataId}`,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(questionRes.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes.adminGetAllQuestion.items.length; i++) {
      expect(questionRes.adminGetAllQuestion.items[i].createdAt).toBeGreaterThanOrEqual(question[7].createdAt);
      expect(questionRes.adminGetAllQuestion.items[i].createdAt).toBeLessThanOrEqual(question[3].createdAt);
      expect(questionRes.adminGetAllQuestion.items[i].masterDataId).toBe(`${question[5].masterDataId}`);
    }
  });

  test('#20: Tìm kiếm bản ghi theo status và to, from', async () => {
    const questionRes = await getSDK(adminToken).getAllQuestions();
    const questionRes1 = await getSDK(adminToken).getAllQuestions({
      filter: {
        to: questionRes.adminGetAllQuestion.items[3].createdAt,
        from: questionRes.adminGetAllQuestion.items[17].createdAt,
        status: QuestionStatus.Answered,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(questionRes1.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes1.adminGetAllQuestion.items.length; i++) {
      expect(questionRes1.adminGetAllQuestion.items[i].createdAt).toBeGreaterThanOrEqual(questionRes.adminGetAllQuestion.items[17].createdAt);
      expect(questionRes1.adminGetAllQuestion.items[i].createdAt).toBeLessThanOrEqual(questionRes.adminGetAllQuestion.items[3].createdAt);
      expect(questionRes1.adminGetAllQuestion.items[i].status).toBe('ANSWERED');
    }
  });

  test('#21: Tìm kiếm bản ghi theo query và status', async () => {
    const questionRes1 = await getSDK(adminToken).getAllQuestions();
    const questionRes = await getSDK(adminToken).getAllQuestions({
      filter: {
        status: questionRes1.adminGetAllQuestion.items[10].status,
        query: questionRes1.adminGetAllQuestion.items[10].title,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(questionRes.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes.adminGetAllQuestion.items.length; i++) {
      expect(questionRes.adminGetAllQuestion.items[i].status).toBe(questionRes1.adminGetAllQuestion.items[10].status);
      expect(questionRes.adminGetAllQuestion.items[i].title).toBe(questionRes1.adminGetAllQuestion.items[10].title);
    }
  });

  test('#22: Tìm kiếm bản ghi theo masterData và status', async () => {
    const questionRes1 = await getSDK(adminToken).getAllQuestions();
    const questionRes = await getSDK(adminToken).getAllQuestions({
      filter: {
        status: questionRes1.adminGetAllQuestion.items[10].status,
        masterDataId: questionRes1.adminGetAllQuestion.items[10].masterDataId,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(questionRes.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes.adminGetAllQuestion.items.length; i++) {
      expect(questionRes.adminGetAllQuestion.items[i].status).toBe(questionRes1.adminGetAllQuestion.items[10].status);
      expect(questionRes.adminGetAllQuestion.items[i].masterDataId).toBe(questionRes1.adminGetAllQuestion.items[10].masterDataId);
    }
  });
  test('#23: Tìm kiếm bản ghi theo query, to, from, masterData', async () => {
    const questionRes = await getSDK(adminToken).getAllQuestions();
    const questionRes1 = await getSDK(adminToken).getAllQuestions({
      filter: {
        to: questionRes.adminGetAllQuestion.items[3].createdAt,
        from: questionRes.adminGetAllQuestion.items[17].createdAt,
        query: questionRes.adminGetAllQuestion.items[16].title,
        masterDataId: questionRes.adminGetAllQuestion.items[16].masterDataId,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(questionRes1.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes1.adminGetAllQuestion.items.length; i++) {
      expect(questionRes1.adminGetAllQuestion.items[i].createdAt).toBeGreaterThanOrEqual(questionRes.adminGetAllQuestion.items[17].createdAt);
      expect(questionRes1.adminGetAllQuestion.items[i].createdAt).toBeLessThanOrEqual(questionRes.adminGetAllQuestion.items[3].createdAt);
      expect(questionRes1.adminGetAllQuestion.items[i].title).toBe(questionRes.adminGetAllQuestion.items[16].title);
      expect(questionRes1.adminGetAllQuestion.items[i].masterDataId).toBe(questionRes.adminGetAllQuestion.items[16].masterDataId);
    }
  });

  test('#24: Tìm kiếm bản ghi theo query, to, status, from', async () => {
    const questionRes = await getSDK(adminToken).getAllQuestions();
    const questionRes1 = await getSDK(adminToken).getAllQuestions({
      filter: {
        to: questionRes.adminGetAllQuestion.items[3].createdAt,
        from: questionRes.adminGetAllQuestion.items[17].createdAt,
        status: questionRes.adminGetAllQuestion.items[16].status,
        query: questionRes.adminGetAllQuestion.items[16].title,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(questionRes1.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes1.adminGetAllQuestion.items.length; i++) {
      expect(questionRes1.adminGetAllQuestion.items[i].createdAt).toBeGreaterThanOrEqual(questionRes.adminGetAllQuestion.items[17].createdAt);
      expect(questionRes1.adminGetAllQuestion.items[i].createdAt).toBeLessThanOrEqual(questionRes.adminGetAllQuestion.items[3].createdAt);
      expect(questionRes1.adminGetAllQuestion.items[i].status).toBe(questionRes.adminGetAllQuestion.items[16].status);
      expect(questionRes1.adminGetAllQuestion.items[i].title).toBe(questionRes.adminGetAllQuestion.items[16].title);
    }
  });

  test('#25: Tìm kiếm bản ghi theo from to, status, masterData', async () => {
    const questionRes = await getSDK(adminToken).getAllQuestions();
    const questionRes1 = await getSDK(adminToken).getAllQuestions({
      filter: {
        to: questionRes.adminGetAllQuestion.items[3].createdAt,
        from: questionRes.adminGetAllQuestion.items[17].createdAt,
        status: questionRes.adminGetAllQuestion.items[16].status,
        masterDataId: questionRes.adminGetAllQuestion.items[16].masterDataId,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(questionRes1.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes1.adminGetAllQuestion.items.length; i++) {
      expect(questionRes1.adminGetAllQuestion.items[i].createdAt).toBeGreaterThanOrEqual(questionRes.adminGetAllQuestion.items[17].createdAt);
      expect(questionRes1.adminGetAllQuestion.items[i].createdAt).toBeLessThanOrEqual(questionRes.adminGetAllQuestion.items[3].createdAt);
      expect(questionRes1.adminGetAllQuestion.items[i].status).toBe(questionRes.adminGetAllQuestion.items[16].status);
      expect(questionRes1.adminGetAllQuestion.items[i].masterDataId).toBe(questionRes.adminGetAllQuestion.items[16].masterDataId);
    }
  });

  test('#26: Tìm kiếm bản ghi theo query, to, status, masterData, from', async () => {
    const questionRes = await getSDK(adminToken).getAllQuestions();
    const questionRes1 = await getSDK(adminToken).getAllQuestions({
      filter: {
        to: questionRes.adminGetAllQuestion.items[3].createdAt,
        from: questionRes.adminGetAllQuestion.items[17].createdAt,
        status: questionRes.adminGetAllQuestion.items[16].status,
        masterDataId: questionRes.adminGetAllQuestion.items[16].masterDataId,
        query: questionRes.adminGetAllQuestion.items[16].title,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(questionRes1.adminGetAllQuestion.items.length).not.toBe(0);
    for (let i = 0; i < questionRes1.adminGetAllQuestion.items.length; i++) {
      expect(questionRes1.adminGetAllQuestion.items[i].createdAt).toBeGreaterThanOrEqual(questionRes.adminGetAllQuestion.items[17].createdAt);
      expect(questionRes1.adminGetAllQuestion.items[i].createdAt).toBeLessThanOrEqual(questionRes.adminGetAllQuestion.items[3].createdAt);
      expect(questionRes1.adminGetAllQuestion.items[i].status).toBe(questionRes.adminGetAllQuestion.items[16].status);
      expect(questionRes1.adminGetAllQuestion.items[i].masterDataId).toBe(questionRes.adminGetAllQuestion.items[16].masterDataId);
      expect(questionRes1.adminGetAllQuestion.items[i].title).toBe(questionRes.adminGetAllQuestion.items[16].title);
    }
  });

  test('#27: Sort theo createdAt tăng dần', async () => {
    const questionRes = await getSDK(adminToken).getAllQuestions({
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
    }
  });

  test('#28: Sort theo createdAt giảm đân', async () => {
    const questionRes = await getSDK(adminToken).getAllQuestions({
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
    }
  });

  test('#27: Sort theo answeredAt tăng dần', async () => {
    const questionRes = await getSDK(adminToken).getAllQuestions({
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
    }
  });

  test('#28: Sort theo answeredAt giảm đân', async () => {
    const questionRes = await getSDK(adminToken).getAllQuestions({
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
    const questionRes1 = await getSDK(adminToken).getAllQuestions();
    for (let i = 0; i < questionRes1.adminGetAllQuestion.items.length; i++) {
      let category = questionRes1.adminGetAllQuestion.items[i].masterData.value;
      b.push(category);
    }
    const questionRes = await getSDK(adminToken).getAllQuestions({
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
    }
  });

  test('#30: Sort theo category giảm dần', async () => {
    var b = [];
    const questionRes1 = await getSDK(adminToken).getAllQuestions();
    for (let i = 0; i < questionRes1.adminGetAllQuestion.items.length; i++) {
      let category = questionRes1.adminGetAllQuestion.items[i].masterData.value;
      b.push(category);
    }
    const questionRes = await getSDK(adminToken).getAllQuestions({
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
    }
  });

  // test('#11: Sort theo author giảm dần', async () => {
  //   var b = [];
  //   const articleRes1 = await getSDK(adminToken).getAllArticle();
  //   for (let i = 0; i < articleRes1.adminGetAllArticle.items.length; i++) {
  //     let author = articleRes1.adminGetAllArticle.items[i].author;
  //     b.push(author);
  //   }
  //   const articleRes = await getSDK(adminToken).getAllArticle({
  //     filter: {
  //       orderBy: {
  //         sort: ArticleSortBy.Author,
  //         order: Order.Desc,
  //       },
  //     },
  //   });
  //   var c = b.sort();
  //   expect(articleRes.adminGetAllArticle.items.length).not.toBe(0);

  //   for (let i = 0; i < articleRes.adminGetAllArticle.items.length; i++) {
  //     expect(c[articleRes.adminGetAllArticle.items.length - i - 1]).toBe(articleRes.adminGetAllArticle.items[i].author);
  //   }
  // });

  // test('#10: Sort theo author tăng dần', async () => {
  //   var b = [];
  //   const articleRes1 = await getSDK(adminToken).getAllArticle();
  //   for (let i = 0; i < articleRes1.adminGetAllArticle.items.length; i++) {
  //     let author = articleRes1.adminGetAllArticle.items[i].author;
  //     b.push(author);
  //   }
  //   const articleRes = await getSDK(adminToken).getAllArticle({
  //     filter: {
  //       orderBy: {
  //         sort: ArticleSortBy.Author,
  //         order: Order.Asc,
  //       },
  //     },
  //   });
  //   var c = b.sort();
  //   expect(articleRes.adminGetAllArticle.items.length).not.toBe(0);
  //   for (let i = 0; i < articleRes.adminGetAllArticle.items.length; i++) {
  //     expect(c[i]).toBe(articleRes.adminGetAllArticle.items[i].author);
  //   }
  // });

  test('#32: Sort theo createdAt giảm đân và query', async () => {
    const questionRes = await getSDK(adminToken).getAllQuestions({
      filter: {
        query: `${question[3].title}`,
        orderBy: {
          sort: QuestionSortBy.CreatedAt,
          order: Order.Desc,
        },
      },
    });
    expect(questionRes.adminGetAllQuestion.items.length).not.toBe(0);

    for (let i = 0; i < questionRes.adminGetAllQuestion.items.length - 1; i++) {
      expect(questionRes.adminGetAllQuestion.items[i].title).toContain(`${question[3].title}`);
      expect(questionRes.adminGetAllQuestion.items[i].createdAt).toBeGreaterThanOrEqual(questionRes.adminGetAllQuestion.items[i + 1].createdAt);
    }
  });

  // test('#33: Sort theo author giảm dần và query', async () => {
  //   let queryTitle = `${article[0].title}`.slice(6, 7);
  //   const articleRes = await getSDK(adminToken).getAllArticle({
  //     filter: {
  //       query: queryTitle,
  //       orderBy: {
  //         sort: ArticleSortBy.Author,
  //         order: Order.Desc,
  //       },
  //     },
  //   });
  //   var b = [];
  //   for (let i = 0; i < articleRes.adminGetAllArticle.items.length; i++) {
  //     let author = articleRes.adminGetAllArticle.items[i].author;
  //     b.push(author);
  //   }
  //   var c = b.sort();
  //   expect(articleRes.adminGetAllArticle.items.length).not.toBe(0);

  //   for (let i = 0; i < articleRes.adminGetAllArticle.items.length; i++) {
  //     expect(c[articleRes.adminGetAllArticle.items.length - i - 1]).toBe(articleRes.adminGetAllArticle.items[i].author);
  //     expect(articleRes.adminGetAllArticle.items[i].title).toContain(queryTitle);
  //   }
  // });
});
