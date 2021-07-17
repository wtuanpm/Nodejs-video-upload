import { makeArticle } from '@/__test__/data/article';
import { makeMasterData } from '@/__test__/data/master-data';
import { makeMedias } from '@/__test__/data/media';
import { ArticleStatus } from '@/__test__/graphql/sdk';
import { getAdminAccessToken } from '@/__test__/helpers/auth';
import { delay } from '@/__test__/helpers/delay';
import { recreateDatabase } from '@/__test__/utils/databaseConnection';
import { getSDK } from '@/__test__/utils/graphqlSDK';
import { ArticleEntity } from '@database/entities/ArticleEntity';
import { MasterDataEntity } from '@database/entities/MasterDataEntity';
import { PhotoEntity } from '@database/entities/PhotoEntity';
import { seedAdmin } from '@utils/seeding';

describe('UPDATE ARTICLE MODULE', () => {
  // test data
  let masterData: MasterDataEntity[];
  let article: ArticleEntity[];
  let image: PhotoEntity[];
  // let idArticeActive:string;
  var dateFaker = new Date();
  let day = '' + dateFaker.getDate();
  if (dateFaker.getDate() < 10) {
    day = '0' + dateFaker.getDate();
  }
  let month = dateFaker.getMonth() + 1;
  const value = day + '/' + month + '/' + dateFaker.getFullYear();

  let adminToken: string;
  beforeAll(async () => {
    await recreateDatabase();
    await seedAdmin();
    article = await makeArticle(10);
    masterData = await makeMasterData(10);
    image = await makeMedias(10);
    adminToken = await getAdminAccessToken();
  }, 10000);

  test('#1:  Update status thành công thành công sang REMOVED', async () => {
    const articleRes = await getSDK(adminToken).getAllArticle();
    let idArticeActive = articleRes.adminGetAllArticle.items.find((i) => i.status !== 'REMOVED').id;
    const updateStatusRes = await getSDK(adminToken).adminChangeArticleStatus({
      id: idArticeActive,
      data: {
        status: ArticleStatus.Removed,
      },
    });
    const articleRes1 = await getSDK(adminToken).getAllArticle();
    expect(articleRes.adminGetAllArticle.items.length).toBe(articleRes1.adminGetAllArticle.items.length + 1);
  });

  test('#1:  Update status thành công thành công sang REMOVED=> k get được bài viêt ra nữa', async () => {
    try {
      const articleRes = await getSDK(adminToken).getAllArticle();
      let idArticeActive = articleRes.adminGetAllArticle.items.find((i) => i.status !== 'REMOVED').id;
      const updateStatusRes = await getSDK(adminToken).adminChangeArticleStatus({
        id: idArticeActive,
        data: {
          status: ArticleStatus.Removed,
        },
      });
      const articleRes1 = await getSDK(adminToken).getArticle({
        data: {
          id: idArticeActive,
        },
      });
      expect('Hiển thị lỗi chỗ này').toContain('123');
    } catch (error) {
      expect(error.message).toContain('Cannot return null for non-nullable');
    }
  });

  test('#2: Update status thành công thành công sang inactive', async () => {
    const updateStatusRes = await getSDK(adminToken).adminChangeArticleStatus({
      id: `${article[2].id}`,
      data: {
        status: ArticleStatus.Inactive,
      },
    });
    expect(updateStatusRes.adminChangeArticleStatus).toBeDefined();
    const articleRes = await getSDK(adminToken).getAllArticle();
    // expect(articleRes.adminGetAllArticle.items.find((i) => i.id === `${article[2].id}`).logs[0].message).toBe(value + ' ngưng kích hoạt bởi Administrator');
    expect(articleRes.adminGetAllArticle.items.find((i) => i.id === `${article[2].id}`).status).toBe('INACTIVE');
  });
  test('#3: Update status thành công thành công sang active', async () => {
    await delay(1000);
    const updateStatusRes = await getSDK(adminToken).adminChangeArticleStatus({
      id: `${article[2].id}`,
      data: {
        status: ArticleStatus.Active,
      },
    });

    expect(updateStatusRes.adminChangeArticleStatus).toBeDefined();
    const articleRes = await getSDK(adminToken).getAllArticle();
    expect(articleRes.adminGetAllArticle.items.find((i) => i.id === `${article[2].id}`).status).toBe('ACTIVE');
    // expect(articleRes.adminGetAllArticle.items.find((i) => i.id === `${article[2].id}`).logs[0].message).toBe(value + ' kích hoạt bởi Administrator');
  });
  //   test('#4: Tạo bản log khi update status', async () => {
  //     const articleRes = await getSDK(adminToken).getArticle({
  //       data: {
  //         id: `${article[1].id}`,
  //       },
  //     });
  //     await getSDK(adminToken).adminChangeArticleStatus({
  //       id: `${article[1].id}`,
  //       data: {
  //         status: ArticleStatus.Active,
  //       },
  //     });
  //     const articleRes1 = await getSDK(adminToken).getArticle({
  //       data: {
  //         id: `${article[1].id}`,
  //       },
  //     });
  //     expect(articleRes.adminGetArticle.logs.length).toBeLessThan(articleRes1.adminGetArticle.logs.length);
  //   });
});
