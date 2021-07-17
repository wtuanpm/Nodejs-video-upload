import { makeMasterData } from '@/__test__/data/master-data';
import { getAdminAccessToken } from '@/__test__/helpers/auth';
import { recreateDatabase } from '@/__test__/utils/databaseConnection';
import { getSDK } from '@/__test__/utils/graphqlSDK';
import { MasterDataEntity } from '@database/entities/MasterDataEntity';
import { seedAdmin } from '@utils/seeding';
import faker from 'faker/locale/vi';

describe('LIST CATEGORY DATA MODULE', () => {
  // test data
  let adminToken: string;
  let masterData: MasterDataEntity[];
  beforeAll(async () => {
    await recreateDatabase();
    await seedAdmin();
    masterData = await makeMasterData(30);
    adminToken = await getAdminAccessToken();
  }, 10000);
  test('#1: Admin tìm kiếm theo category', async () => {
    const dataRes = await getSDK(adminToken).getMasterData();
    const categoryRes = await getSDK(adminToken).getAllCategory({
      data: {
        category: dataRes.adminGetAllMasterData.items[0].category,
      },
    });
    expect(categoryRes.adminGetAllCategoryValue.length).toBe(1);
  });

  // test('#2: Kiểm tra số bản ghi trên 1 page', async () => {
  //   const categoryRes = await getSDK(adminToken).getAllCategory({
  //     pageIndex: 2,
  //     pageSize: 5,
  //     data: {
  //       category: '',
  //     },
  //   });

  // test('#2: Tìm kiếm có space đầu cuối', async () => {
  //   let query = `${masterData[19].category}`;
  //   const categoryRes = await getSDK(adminToken).getAllCategory({
  //     data: {
  //       category: ' ' + query + ' ',
  //     },
  //   });

  //   for (let i = 0; i < categoryRes.adminGetAllCategoryValue.length; i++) {
  //     expect(categoryRes.adminGetAllCategoryValue[i].category).toContain(`${masterData[0].category}`);
  //   }
  // });

  // // test('#4: Tìm kiếm bản ghi # trang 1', async () => {
  // //   const categoryRes = await getSDK(adminToken).getAllCategory({
  // //     data: {
  // //       category: ' ' + `${masterData[19].category}` + ' ',
  // //     },
  // //   });

  // //   for (let i = 0; i < categoryRes.adminGetAllCategoryValue.length; i++) {
  // //     expect(categoryRes.adminGetAllCategoryValue[i].category).toContain(`${masterData[19].category}`);
  // //   }
  // // });

  // test('#3: Tìm kiếm không phân biệt hoa thường', async () => {
  //   let queryUpper = `${masterData[19].value}`.toUpperCase();
  //   const categoryRes = await getSDK(adminToken).getAllCategory({
  //     data: {
  //       category: queryUpper,
  //     },
  //   });
  //   for (let i = 0; i < categoryRes.adminGetAllCategoryValue.length; i++) {
  //     expect(categoryRes.adminGetAllCategoryValue[i].category).toContain(`${masterData[19].category}`);
  //   }
  // });

  // test('#4: Tìm kiếm với từ gần giống', async () => {
  //   let query = `${masterData[10].category}`.slice(3);
  //   const categoryRes = await getSDK(adminToken).getAllCategory({
  //     data: {
  //       category: query,
  //     },
  //   });
  //   expect(categoryRes.adminGetAllCategoryValue.length).].toBe(0);
  //   for (let i = 0; i < categoryRes.adminGetAllCategoryValue.length; i++) {
  //     expect(categoryRes.adminGetAllCategoryValue[i].category).toContain(`${masterData[10].category}`);
  //   }
  // });

  test('#7: Tìm kiếm không phân biệt hoa thường', async () => {
    let queryUpper = `${masterData[19].value}`.toUpperCase();
    const categoryRes = await getSDK(adminToken).getAllCategory({
      data: {
        category: queryUpper,
      },
    });
    for (let i = 0; i < categoryRes.adminGetAllCategoryValue.length; i++) {
      expect(categoryRes.adminGetAllCategoryValue[i].category).toContain(`${masterData[19].category}`);
    }
  });
});
