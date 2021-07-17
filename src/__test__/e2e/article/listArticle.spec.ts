import { makeArticle } from '@/__test__/data/article';
import { makeMasterData } from '@/__test__/data/master-data';
import { ArticleSortBy, ArticleStatus } from '@/__test__/graphql/sdk';
import { getAdminAccessToken } from '@/__test__/helpers/auth';
import { delay } from '@/__test__/helpers/delay';
import { recreateDatabase } from '@/__test__/utils/databaseConnection';
import { getSDK } from '@/__test__/utils/graphqlSDK';
import { ArticleEntity } from '@database/entities/ArticleEntity';
import { MasterDataEntity } from '@database/entities/MasterDataEntity';
import { Order, Sort } from '@graphql/types/generated-graphql-types';
import { seedAdmin } from '@utils/seeding';
import faker from 'faker/locale/vi';

describe('LIST ARTICLE', () => {
  // test data
  let adminToken: string;
  let masterData: MasterDataEntity[];
  let article: ArticleEntity[];
  beforeAll(async () => {
    await recreateDatabase();
    await seedAdmin();
    masterData = await makeMasterData(20);
    article = await makeArticle(20);
    adminToken = await getAdminAccessToken();
  }, 10000);
  test('#1: Admin xem được toàn bộ danh sách', async () => {
    const articleRes = await getSDK(adminToken).getAllArticle();
    expect(articleRes.adminGetAllArticle.items.length).toBe(20);
    expect(articleRes.adminGetAllArticle.paginate.pageIndex).toBe(1);
    expect(articleRes.adminGetAllArticle.paginate.pageSize).toBe(20);
    expect(articleRes.adminGetAllArticle.paginate.totalItems).toBe(20);
  });

  test('#2: Kiểm tra số bản ghi trên 1 page', async () => {
    const articleRes = await getSDK(adminToken).getAllArticle({
      pageIndex: 2,
      pageSize: 5,
    });

    expect(articleRes.adminGetAllArticle.items.length).toBe(5);
    expect(articleRes.adminGetAllArticle.paginate.pageSize).toBe(5);
    expect(articleRes.adminGetAllArticle.paginate.pageIndex).toBe(2);
  });
  test('#3: Tìm kiếm theo tiêu đề bài viết', async () => {
    const articleRes = await getSDK(adminToken).getAllArticle({
      filter: {
        query: `${article[1].title}`,
      },
    });
    expect(articleRes.adminGetAllArticle.items.length).not.toBe(0);
    for (let i = 0; i < articleRes.adminGetAllArticle.items.length; i++) {
      expect(articleRes.adminGetAllArticle.items[i].title).toContain(`${article[1].title}`);
    }
  });
  test('#4: Tìm kiếm có space đầu cuối', async () => {
    const articleRes = await getSDK(adminToken).getAllArticle({
      filter: {
        query: ' ' + `${article[1].title}` + ' ',
      },
    });
    expect(articleRes.adminGetAllArticle.items.length).not.toBe(0);
    for (let i = 0; i < articleRes.adminGetAllArticle.items.length; i++) {
      expect(articleRes.adminGetAllArticle.items[i].title).toContain(`${article[1].title}`);
    }
  });

  test('#5: Tìm kiếm bản ghi ở trang #1', async () => {
    const articleRes = await getSDK(adminToken).getAllArticle({
      filter: {
        query: `${article[19].title}`,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(articleRes.adminGetAllArticle.items.length).not.toBe(0);
    for (let i = 0; i < articleRes.adminGetAllArticle.items.length; i++) {
      expect(articleRes.adminGetAllArticle.items[i].title).toContain(`${article[19].title}`);
    }
  });

  test('#6: Tìm kiếm theo query với từ gần giống', async () => {
    let query = `${article[0].title}`.slice(3);
    const articleRes = await getSDK(adminToken).getAllArticle({
      filter: {
        query: query,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(articleRes.adminGetAllArticle.items.length).not.toBe(0);
    for (let i = 0; i < articleRes.adminGetAllArticle.items.length; i++) {
      expect(articleRes.adminGetAllArticle.items[i].title).toContain(`${article[0].title}`);
    }
  });

  test('#7: Tìm kiếm không phân biệt hoa thường', async () => {
    let queryUpper = `${article[0].title}`.toUpperCase();
    const articleRes = await getSDK(adminToken).getAllArticle({
      filter: {
        query: queryUpper,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(articleRes.adminGetAllArticle.items.length).not.toBe(0);
    for (let i = 0; i < articleRes.adminGetAllArticle.items.length; i++) {
      expect(articleRes.adminGetAllArticle.items[i].title).toContain(`${article[0].title}`);
    }
  });

  test('#8: Tìm kiếm bản ghi không tồn tại', async () => {
    const articleRes = await getSDK(adminToken).getAllArticle({
      filter: {
        query: 'hff  hsfd ',
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(articleRes.adminGetAllArticle.items.length).toBe(0);
    expect(articleRes.adminGetAllArticle.paginate.totalItems).toBe(0);
    expect(articleRes.adminGetAllArticle.paginate.totalPage).toBe(0);
    expect(articleRes.adminGetAllArticle.paginate.pageSize).toBe(5);
    expect(articleRes.adminGetAllArticle.paginate.pageIndex).toBe(1);
  });

  test('#9: Tìm kiếm bản ghi theo masterData', async () => {
    const articleRes = await getSDK(adminToken).getAllArticle({
      filter: {
        masterDataId: `${article[0].masterDataId}`,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(articleRes.adminGetAllArticle.items.length).toBe(1);
    for (let i = 0; i < articleRes.adminGetAllArticle.items.length; i++) {
      expect(articleRes.adminGetAllArticle.items[i].masterData.id).toBe(`${article[0].masterDataId}`);
    }
  });

  test('#10: Tìm kiếm bản ghi theo status= Active', async () => {
    const articleRes = await getSDK(adminToken).getAllArticle({
      filter: {
        status: ArticleStatus.Active,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(articleRes.adminGetAllArticle.items.length).not.toBe(0);
    for (let i = 0; i < articleRes.adminGetAllArticle.items.length; i++) {
      expect(articleRes.adminGetAllArticle.items[i].status).toBe('ACTIVE');
    }
  });

  test('#11: Tìm kiếm bản ghi theo status = Inactive', async () => {
    const articleRes = await getSDK(adminToken).getAllArticle({
      filter: {
        status: ArticleStatus.Inactive,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(articleRes.adminGetAllArticle.items.length).not.toBe(0);
    for (let i = 0; i < articleRes.adminGetAllArticle.items.length; i++) {
      expect(articleRes.adminGetAllArticle.items[i].status).toBe('INACTIVE');
    }
  });

  test('#12: Tìm kiếm bản ghi theo status = Removed', async () => {
    const articleRes = await getSDK(adminToken).getAllArticle({
      filter: {
        status: ArticleStatus.Removed,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(articleRes.adminGetAllArticle.items.length).toBe(0);
    expect(articleRes.adminGetAllArticle.paginate.totalItems).toBe(0);
    expect(articleRes.adminGetAllArticle.paginate.totalPage).toBe(0);
    expect(articleRes.adminGetAllArticle.paginate.pageSize).toBe(5);
    expect(articleRes.adminGetAllArticle.paginate.pageIndex).toBe(1);
  });

  // test('#13: Tìm kiếm bản ghi theo from', async () => {
  //   const articleRes = await getSDK(adminToken).getAllArticle({
  //     filter: {
  //       from: article[17].createdAt,
  //     },
  //     pageIndex: 1,
  //     pageSize: 5,
  //   });
  //   expect(articleRes.adminGetAllArticle.items.length).not.toBe(0);
  //   for (let i = 0; i < articleRes.adminGetAllArticle.items.length; i++) {
  //     expect(articleRes.adminGetAllArticle.items[i].createdAt).toBeGreaterThanOrEqual(article[17].createdAt);
  //   }
  // });
  test('#15: Tìm kiếm bản ghi theo to', async () => {
    const articleRes = await getSDK(adminToken).getAllArticle({
      filter: {
        to: article[1].createdAt,
        from: 123,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(articleRes.adminGetAllArticle.items.length).not.toBe(0);
    for (let i = 0; i < articleRes.adminGetAllArticle.items.length; i++) {
      expect(articleRes.adminGetAllArticle.items[i].createdAt).toBeLessThanOrEqual(article[1].createdAt);
    }
  });

  test('#17: Tìm kiếm bản ghi trong 1 khoảng thời', async () => {
    const articleRes = await getSDK(adminToken).getAllArticle({
      filter: {
        to: article[5].createdAt,
        from: article[15].createdAt,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(articleRes.adminGetAllArticle.items.length).not.toBe(0);
    for (let i = 0; i < articleRes.adminGetAllArticle.items.length; i++) {
      expect(articleRes.adminGetAllArticle.items[i].createdAt).toBeGreaterThanOrEqual(article[15].createdAt);
      expect(articleRes.adminGetAllArticle.items[i].createdAt).toBeLessThanOrEqual(article[5].createdAt);
    }
  });

  test('#17: Tìm kiếm bản ghi trong 1 khoảng thời không tồn tại', async () => {
    const articleRes = await getSDK(adminToken).getAllArticle({
      filter: {
        to: 123,
        from: 123,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(articleRes.adminGetAllArticle.items.length).toBe(0);
    expect(articleRes.adminGetAllArticle.paginate.totalItems).toBe(0);
    expect(articleRes.adminGetAllArticle.paginate.totalPage).toBe(0);
    expect(articleRes.adminGetAllArticle.paginate.pageSize).toBe(5);
    expect(articleRes.adminGetAllArticle.paginate.pageIndex).toBe(1);
  });

  test('#18: Tìm kiếm bản ghi theo query và masterData', async () => {
    const articleRes = await getSDK(adminToken).getAllArticle({
      filter: {
        query: `${article[5].title}`,
        masterDataId: `${article[5].masterDataId}`,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(articleRes.adminGetAllArticle.items.length).toBe(1);
    for (let i = 0; i < articleRes.adminGetAllArticle.items.length; i++) {
      expect(articleRes.adminGetAllArticle.items[i].masterData.id).toBe(`${article[5].masterDataId}`);
      expect(articleRes.adminGetAllArticle.items[i].title).toBe(`${article[5].title}`);
    }
  });

  test('#19: Tìm kiếm bản ghi theo query và from, to', async () => {
    const articleRes = await getSDK(adminToken).getAllArticle({
      filter: {
        from: article[16].createdAt,
        query: `${article[5].title}`,
        to: article[4].createdAt,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(articleRes.adminGetAllArticle.items.length).not.toBe(0);
    for (let i = 0; i < articleRes.adminGetAllArticle.items.length; i++) {
      expect(articleRes.adminGetAllArticle.items[i].createdAt).toBeGreaterThanOrEqual(article[15].createdAt);
      expect(articleRes.adminGetAllArticle.items[i].createdAt).toBeLessThanOrEqual(article[4].createdAt);
      expect(articleRes.adminGetAllArticle.items[i].title).toBe(`${article[5].title}`);
    }
  });

  test('#20: Tìm kiếm bản ghi theo masterData và to, from', async () => {
    const articleRes = await getSDK(adminToken).getAllArticle({
      filter: {
        to: article[2].createdAt,
        from: article[16].createdAt,
        masterDataId: `${article[5].masterDataId}`,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(articleRes.adminGetAllArticle.items.length).not.toBe(0);
    for (let i = 0; i < articleRes.adminGetAllArticle.items.length; i++) {
      expect(articleRes.adminGetAllArticle.items[i].createdAt).toBeGreaterThanOrEqual(article[16].createdAt);
      expect(articleRes.adminGetAllArticle.items[i].createdAt).toBeLessThanOrEqual(article[2].createdAt);
      expect(articleRes.adminGetAllArticle.items[i].title).toBe(`${article[5].title}`);
    }
  });

  test('#20: Tìm kiếm bản ghi theo status và to, from', async () => {
    const articleRes = await getSDK(adminToken).getAllArticle({
      filter: {
        to: article[2].createdAt,
        from: article[16].createdAt,
        status: ArticleStatus.Active,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(articleRes.adminGetAllArticle.items.length).not.toBe(0);
    for (let i = 0; i < articleRes.adminGetAllArticle.items.length; i++) {
      expect(articleRes.adminGetAllArticle.items[i].createdAt).toBeGreaterThanOrEqual(article[16].createdAt);
      expect(articleRes.adminGetAllArticle.items[i].createdAt).toBeLessThanOrEqual(article[2].createdAt);
      expect(articleRes.adminGetAllArticle.items[i].status).toBe('ACTIVE');
    }
  });

  test('#21: Tìm kiếm bản ghi theo query và status', async () => {
    const articleRes = await getSDK(adminToken).getAllArticle({
      filter: {
        status: ArticleStatus.Active,
        query: `${article[8].title}`,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(articleRes.adminGetAllArticle.items.length).not.toBe(0);
    for (let i = 0; i < articleRes.adminGetAllArticle.items.length; i++) {
      expect(articleRes.adminGetAllArticle.items[i].status).toBe('ACTIVE');
      expect(articleRes.adminGetAllArticle.items[i].title).toBe(`${article[8].title}`);
    }
  });

  test('#22: Tìm kiếm bản ghi theo masterData và status', async () => {
    const articleRes = await getSDK(adminToken).getAllArticle({
      filter: {
        masterDataId: `${article[8].masterDataId}`,
        status: ArticleStatus.Active,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(articleRes.adminGetAllArticle.items.length).not.toBe(0);
    for (let i = 0; i < articleRes.adminGetAllArticle.items.length; i++) {
      expect(articleRes.adminGetAllArticle.items[i].status).toBe('ACTIVE');
      expect(articleRes.adminGetAllArticle.items[i].masterDataId).toBe(`${article[8].masterDataId}`);
    }
  });
  test('#23: Tìm kiếm bản ghi theo query, to, from, masterData', async () => {
    const articleRes = await getSDK(adminToken).getAllArticle({
      filter: {
        to: article[2].createdAt,
        from: article[16].createdAt,

        query: `${article[5].title}`,
        masterDataId: `${article[5].masterDataId}`,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(articleRes.adminGetAllArticle.items.length).not.toBe(0);
    for (let i = 0; i < articleRes.adminGetAllArticle.items.length; i++) {
      expect(articleRes.adminGetAllArticle.items[i].createdAt).toBeGreaterThanOrEqual(article[16].createdAt);
      expect(articleRes.adminGetAllArticle.items[i].createdAt).toBeLessThanOrEqual(article[2].createdAt);
      expect(articleRes.adminGetAllArticle.items[i].title).toBe(`${article[5].title}`);
      expect(articleRes.adminGetAllArticle.items[i].masterDataId).toBe(`${article[5].masterDataId}`);
    }
  });

  test('#24: Tìm kiếm bản ghi theo query, to, status, from', async () => {
    const articleRes = await getSDK(adminToken).getAllArticle({
      filter: {
        status: ArticleStatus.Active,
        to: article[2].createdAt,
        query: `${article[8].title}`,
        from: article[16].createdAt,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(articleRes.adminGetAllArticle.items.length).not.toBe(0);
    for (let i = 0; i < articleRes.adminGetAllArticle.items.length; i++) {
      expect(articleRes.adminGetAllArticle.items[i].createdAt).toBeLessThanOrEqual(article[2].createdAt);
      expect(articleRes.adminGetAllArticle.items[i].createdAt).toBeGreaterThanOrEqual(article[16].createdAt);
      expect(articleRes.adminGetAllArticle.items[i].status).toBe('ACTIVE');
      expect(articleRes.adminGetAllArticle.items[i].title).toBe(`${article[8].title}`);
    }
  });

  test('#25: Tìm kiếm bản ghi theo from to, status, masterData', async () => {
    const articleRes = await getSDK(adminToken).getAllArticle({
      filter: {
        to: article[2].createdAt,
        status: ArticleStatus.Active,
        query: `${article[8].title}`,
        from: article[16].createdAt,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(articleRes.adminGetAllArticle.items.length).not.toBe(0);
    for (let i = 0; i < articleRes.adminGetAllArticle.items.length; i++) {
      expect(articleRes.adminGetAllArticle.items[i].createdAt).toBeLessThanOrEqual(article[2].createdAt);
      expect(articleRes.adminGetAllArticle.items[i].createdAt).toBeGreaterThanOrEqual(article[16].createdAt);

      expect(articleRes.adminGetAllArticle.items[i].status).toBe('ACTIVE');
      expect(articleRes.adminGetAllArticle.items[i].title).toBe(`${article[8].title}`);
    }
  });

  test('#26: Tìm kiếm bản ghi theo query, to, status, masterData, from', async () => {
    const articleRes = await getSDK(adminToken).getAllArticle({
      filter: {
        to: article[2].createdAt,
        status: ArticleStatus.Active,
        query: `${article[8].title}`,
        masterDataId: `${article[8].masterDataId}`,
        from: article[16].createdAt,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(articleRes.adminGetAllArticle.items.length).not.toBe(0);
    for (let i = 0; i < articleRes.adminGetAllArticle.items.length; i++) {
      expect(articleRes.adminGetAllArticle.items[i].createdAt).toBeLessThanOrEqual(article[2].createdAt);
      expect(articleRes.adminGetAllArticle.items[i].createdAt).toBeGreaterThanOrEqual(article[16].createdAt);
      expect(articleRes.adminGetAllArticle.items[i].title).toBe(`${article[8].title}`);
      expect(articleRes.adminGetAllArticle.items[i].masterDataId).toBe(`${article[8].masterDataId}`);
    }
  });

  test('#27: Sort theo createdAt tăng dần', async () => {
    const articleRes = await getSDK(adminToken).getAllArticle({
      filter: {
        orderBy: {
          sort: ArticleSortBy.CreatedAt,
          order: Order.Asc,
        },
      },
    });
    expect(articleRes.adminGetAllArticle.items.length).not.toBe(0);

    for (let i = 0; i < articleRes.adminGetAllArticle.items.length - 1; i++) {
      expect(articleRes.adminGetAllArticle.items[i].createdAt).toBeLessThanOrEqual(articleRes.adminGetAllArticle.items[i + 1].createdAt);
    }
  });

  test('#28: Sort theo createdAt giảm đân', async () => {
    const articleRes = await getSDK(adminToken).getAllArticle({
      filter: {
        orderBy: {
          sort: ArticleSortBy.CreatedAt,
          order: Order.Desc,
        },
      },
    });
    expect(articleRes.adminGetAllArticle.items.length).not.toBe(0);

    for (let i = 0; i < articleRes.adminGetAllArticle.items.length - 1; i++) {
      expect(articleRes.adminGetAllArticle.items[i].createdAt).toBeGreaterThanOrEqual(articleRes.adminGetAllArticle.items[i + 1].createdAt);
    }
  });

  // test('#29: Sort theo title tăng dần', async () => {
  //   var b = [];
  //   const articleRes1 = await getSDK(adminToken).getAllArticle();
  //   for (let i = 0; i < articleRes1.adminGetAllArticle.items.length; i++) {
  //     let title = articleRes1.adminGetAllArticle.items[i].title;
  //     b.push(title);
  //   }
  //   const articleRes = await getSDK(adminToken).getAllArticle({
  //     filter: {
  //       orderBy: {
  //         sort: ArticleSortBy.Title,
  //         order: Order.Asc,
  //       },
  //     },
  //   });
  //   var c = b.sort();
  //   expect(articleRes.adminGetAllArticle.items.length).not.toBe(0);

  //   for (let i = 0; i < articleRes.adminGetAllArticle.items.length; i++) {
  //     expect(c[i]).toBe(articleRes.adminGetAllArticle.items[i].title);
  //   }
  // });

  // test('#30: Sort theo title giảm dần', async () => {
  //   var b = [];
  //   const articleRes1 = await getSDK(adminToken).getAllArticle();
  //   for (let i = 0; i < articleRes1.adminGetAllArticle.items.length; i++) {
  //     let title = articleRes1.adminGetAllArticle.items[i].title;
  //     b.push(title);
  //   }
  //   const articleRes = await getSDK(adminToken).getAllArticle({
  //     filter: {
  //       orderBy: {
  //         sort: ArticleSortBy.Title,
  //         order: Order.Desc,
  //       },
  //     },
  //   });
  //   var c = b.sort();
  //   expect(articleRes.adminGetAllArticle.items.length).not.toBe(0);

  //   for (let i = 0; i < articleRes.adminGetAllArticle.items.length; i++) {
  //     expect(c[articleRes.adminGetAllArticle.items.length - i - 1]).toBe(articleRes.adminGetAllArticle.items[i].title);
  //   }
  // });

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

  test('#31: Tìm kiếm với từ gần giống', async () => {
    let queryTitle = `${article[0].title}`.slice(7);
    const articleRes = await getSDK(adminToken).getAllArticle({
      filter: {
        query: queryTitle,
      },
    });
    expect(articleRes.adminGetAllArticle.items.length).not.toBe(0);
    for (let i = 0; i < articleRes.adminGetAllArticle.items.length; i++) {
      expect(articleRes.adminGetAllArticle.items[i].title).toContain(`${article[0].title}`);
    }
  });

  test('#32: Sort theo createdAt giảm đân và query', async () => {
    let queryTitle = `${article[0].title}`;
    const articleRes = await getSDK(adminToken).getAllArticle({
      filter: {
        query: queryTitle,
        orderBy: {
          sort: ArticleSortBy.CreatedAt,
          order: Order.Desc,
        },
      },
    });
    expect(articleRes.adminGetAllArticle.items.length).not.toBe(0);

    for (let i = 0; i < articleRes.adminGetAllArticle.items.length - 1; i++) {
      expect(articleRes.adminGetAllArticle.items[i].createdAt).toBeGreaterThanOrEqual(articleRes.adminGetAllArticle.items[i + 1].createdAt);
      expect(articleRes.adminGetAllArticle.items[i].title).toContain(queryTitle);
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
