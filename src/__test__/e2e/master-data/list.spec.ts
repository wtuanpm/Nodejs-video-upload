import { seedAdmin } from '@/__test__/data/admin';
import { makeMasterData } from '@/__test__/data/master-data';
import { getAdminAccessToken } from '@/__test__/helpers/auth';
import { delay } from '@/__test__/helpers/delay';
import { recreateDatabase } from '@/__test__/utils/databaseConnection';
import { getSDK } from '@/__test__/utils/graphqlSDK';
import { MasterDataEntity } from '@database/entities/MasterDataEntity';
import { Sort } from '@graphql/types/generated-graphql-types';
import faker from 'faker/locale/vi';

describe('LIST MASTER DATA MODULE', () => {
  // test data
  let adminToken: string;
  let masterData: MasterDataEntity[];
  beforeAll(async () => {
    await recreateDatabase();
    await seedAdmin();
    masterData = await makeMasterData(20);
    await seedAdmin();
    adminToken = await getAdminAccessToken();
    expect(dataRes.adminGetAllMasterData.items.length).toBe(20);
    expect(dataRes.adminGetAllMasterData.paginate.pageIndex).toBe(1);
    expect(dataRes.adminGetAllMasterData.paginate.pageSize).toBe(20);
    expect(dataRes.adminGetAllMasterData.paginate.totalItems).toBe(20);
  });

  test('#2: Kiểm tra số bản ghi trên 1 page', async () => {
    const dataRes = await getSDK(adminToken).getMasterData({
      pageIndex: 2,
      pageSize: 5,
    });

    expect(dataRes.adminGetAllMasterData.items.length).toBe(5);
    expect(dataRes.adminGetAllMasterData.paginate.pageSize).toBe(5);
    expect(dataRes.adminGetAllMasterData.paginate.pageIndex).toBe(2);
  });
  test('#3: Tìm kiếm có space đầu cuối', async () => {
    const dataRes = await getSDK(adminToken).getMasterData({
      filter: {
        query: ' ' + `${masterData[1].category}` + ' ',
      },
    });

    for (let i = 0; i < dataRes.adminGetAllMasterData.items.length; i++) {
      expect(dataRes.adminGetAllMasterData.items[i].category).toContain(`${masterData[1].category}`);
    }
  });

  test('#4: Tìm kiếm bản ghi ở trang #1', async () => {
    const dataRes = await getSDK(adminToken).getMasterData({
      filter: {
        query: ' ' + `${masterData[19].category}` + ' ',
      },
      pageIndex: 1,
      pageSize: 5,
    });

    for (let i = 0; i < dataRes.adminGetAllMasterData.items.length; i++) {
      expect(dataRes.adminGetAllMasterData.items[i].category).toContain(`${masterData[19].category}`);
    }
  });

  test('#5: Tìm kiếm theo query với từ gần giống', async () => {
    let query = `${masterData[19].category}`.slice(3);
    const dataRes = await getSDK(adminToken).getMasterData({
      filter: {
        query: query,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(dataRes.adminGetAllMasterData.items.length).not.toBe(0);

    for (let i = 0; i < dataRes.adminGetAllMasterData.items.length; i++) {
      expect(dataRes.adminGetAllMasterData.items[i].category).toContain(`${masterData[19].category}`);
    }
  });

  test('#6: Tìm kiếm theo value', async () => {
    let query = `${masterData[19].value}`.slice(3);
    const dataRes = await getSDK(adminToken).getMasterData({
      filter: {
        query: query,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(dataRes.adminGetAllMasterData.items.length).not.toBe(0);
    for (let i = 0; i < dataRes.adminGetAllMasterData.items.length; i++) {
      expect(dataRes.adminGetAllMasterData.items[i].category).toContain(`${masterData[19].category}`);
    }
  });

  test('#7: Tìm kiếm không phân biệt hoa thường', async () => {
    let queryUpper = `${masterData[19].value}`.toUpperCase();
    const dataRes = await getSDK(adminToken).getMasterData({
      filter: {
        query: queryUpper,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(dataRes.adminGetAllMasterData.items.length).not.toBe(0);
    for (let i = 0; i < dataRes.adminGetAllMasterData.items.length; i++) {
      expect(dataRes.adminGetAllMasterData.items[i].category).toContain(`${masterData[19].category}`);
    }
  });

  test('#7: Tìm kiếm bản ghi không tồn tại', async () => {
    const dataRes = await getSDK(adminToken).getMasterData({
      filter: {
        query: 'dbsakbya asd a da',
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(dataRes.adminGetAllMasterData.items.length).toBe(0);
    expect(dataRes.adminGetAllMasterData.paginate.totalItems).toBe(0);
    expect(dataRes.adminGetAllMasterData.paginate.totalPage).toBe(0);
    expect(dataRes.adminGetAllMasterData.paginate.pageSize).toBe(5);
    expect(dataRes.adminGetAllMasterData.paginate.pageIndex).toBe(1);
  });

  test('#8: Sort theo id tăng dần', async () => {
    const dataRes = await getSDK(adminToken).getMasterData({
      filter: {
        orderBy: {
          id: Sort.Asc,
        },
      },
    });
    expect(dataRes.adminGetAllMasterData.items.length).not.toBe(0);

    for (let i = 0; i < dataRes.adminGetAllMasterData.items.length - 1; i++) {
      expect(parseInt(dataRes.adminGetAllMasterData.items[i].id)).toBeLessThan(parseInt(dataRes.adminGetAllMasterData.items[i + 1].id));
    }
  });

  test('#9: Sort theo id giảm đân', async () => {
    const dataRes = await getSDK(adminToken).getMasterData({
      filter: {
        orderBy: {
          id: Sort.Desc,
        },
      },
    });
    expect(dataRes.adminGetAllMasterData.items.length).not.toBe(0);

    for (let i = 0; i < dataRes.adminGetAllMasterData.items.length - 1; i++) {
      expect(parseInt(dataRes.adminGetAllMasterData.items[i].id)).toBeGreaterThan(parseInt(dataRes.adminGetAllMasterData.items[i + 1].id));
    }
  });

  test('#10: Sort theo category tăng dần', async () => {
    var b = [];
    const dataRes1 = await getSDK(adminToken).getMasterData();
    for (let i = 0; i < dataRes1.adminGetAllMasterData.items.length; i++) {
      let category = dataRes1.adminGetAllMasterData.items[i].category;
      b.push(category);
    }
    const dataRes = await getSDK(adminToken).getMasterData({
      filter: {
        orderBy: {
          category: Sort.Asc,
        },
      },
    });
    var c = b.sort();
    expect(dataRes.adminGetAllMasterData.items.length).not.toBe(0);

    for (let i = 0; i < dataRes.adminGetAllMasterData.items.length; i++) {
      expect(c[i]).toBe(dataRes.adminGetAllMasterData.items[i].category);
    }
  });

  test('#11: Sort theo category giảm dần', async () => {
    var b = [];
    const dataRes1 = await getSDK(adminToken).getMasterData();
    for (let i = 0; i < dataRes1.adminGetAllMasterData.items.length; i++) {
      let category = dataRes1.adminGetAllMasterData.items[i].category;
      b.push(category);
    }
    const dataRes = await getSDK(adminToken).getMasterData({
      filter: {
        orderBy: {
          category: Sort.Desc,
        },
      },
    });
    var c = b.sort();
    expect(dataRes.adminGetAllMasterData.items.length).not.toBe(0);

    for (let i = 0; i < dataRes.adminGetAllMasterData.items.length; i++) {
      expect(c[dataRes.adminGetAllMasterData.items.length - i - 1]).toBe(dataRes.adminGetAllMasterData.items[i].category);
    }
  });
});
