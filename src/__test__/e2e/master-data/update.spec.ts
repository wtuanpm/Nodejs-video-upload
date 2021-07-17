import { makeMasterData } from '@/__test__/data/master-data';
import { getAdminAccessToken } from '@/__test__/helpers/auth';
import { delay } from '@/__test__/helpers/delay';
import { recreateDatabase } from '@/__test__/utils/databaseConnection';
import { getSDK } from '@/__test__/utils/graphqlSDK';
import { MasterDataEntity } from '@database/entities/MasterDataEntity';
import { seedAdmin } from '@utils/seeding';
import faker from 'faker/locale/vi';

describe('UPDATE MASTER DATA MODULE', () => {
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
  beforeAll(async () => {
    await recreateDatabase();
    await seedAdmin();
    masterData = await makeMasterData(10);
    adminToken = await getAdminAccessToken();
  }, 10000);
  test('#1: Update thành công', async () => {
    const updateDataRes = await getSDK(adminToken).adminUpdateMasterData({
      data: {
        id: `${masterData[0].id}`,
        category: 'category1',
        value: 'value1',
      },
    });
    const dataRes = await getSDK(adminToken).getMasterData();
    expect(dataRes.adminGetAllMasterData.items[0].category).toBe('category1');
    expect(dataRes.adminGetAllMasterData.items[0].value).toContain('value1');
    expect(dataRes.adminGetAllMasterData.items.find((i) => i.id === `${masterData[0].id}`).logs[0].message).toBe(value + ' cập nhật bởi Administrator');
  });

  test('#2: Bản log được tạo khi update', async () => {
    const dataRes1 = await getSDK(adminToken).getMasterData();
    await getSDK(adminToken).adminUpdateMasterData({
      data: {
        id: `${masterData[0].id}`,
        category: faker.commerce.productMaterial(),
        value: faker.commerce.productMaterial(),
      },
    });
    const dataRes2 = await getSDK(adminToken).getMasterData();
    expect(dataRes1.adminGetAllMasterData.items.find((i) => i.id === `${masterData[0].id}`).logs.length).toBeLessThan(dataRes2.adminGetAllMasterData.items[0].logs.length);
  });

  test('#3: Bản log được hiển thị lên đầu khi update', async () => {
    await delay(1000);
    const dataRes1 = await getSDK(adminToken).getMasterData();
    await getSDK(adminToken).adminUpdateMasterData({
      data: {
        id: `${masterData[0].id}`,
        category: faker.commerce.productMaterial(),
        value: faker.commerce.productMaterial(),
      },
    });
    const dataRes2 = await getSDK(adminToken).getMasterData();
    expect(dataRes1.adminGetAllMasterData.items.find((i) => i.id === `${masterData[0].id}`).logs[0].createdAt).toBeLessThan(dataRes2.adminGetAllMasterData.items[0].logs[0].createdAt);
  });

  test('#4: Update thành bản ghi đã tồn tại', async () => {
    try {
      const updateDataRes = await getSDK(adminToken).adminUpdateMasterData({
        data: {
          id: `${masterData[1].id}`,
          category: `${masterData[4].category}`,
          value: `${masterData[4].value}`,
        },
      });
      expect('Hiển thị lỗi ở đây').toContain('123');
    } catch (error) {
      expect(error.message).toContain('Giá trị đã tồn tại trong danh mục');
    }
  });
  test('#5: Update category null', async () => {
    try {
      const updateDataRes = await getSDK(adminToken).adminUpdateMasterData({
        data: {
          id: `${masterData[0].id}`,
          category: '',
          value: `${masterData[0].value}`,
        },
      });
      expect('Hiển thị lỗi ở đây').toContain('123');
    } catch (error) {
      expect(error.message).toContain('category is a required field');
    }
  });
  test('#6: Update value null', async () => {
    try {
      const updateDataRes = await getSDK(adminToken).adminUpdateMasterData({
        data: {
          id: `${masterData[0].id}`,
          category: `${masterData[0].category}`,
          value: '',
        },
      });
      expect('Hiển thị lỗi ở đây').toContain('123');
    } catch (error) {
      expect(error.message).toContain('value is a required field');
    }
  });

  test('#7: Kiểm tra parentId', async () => {
    await getSDK(adminToken).adminUpdateMasterData({
      data: {
        id: `${masterData[0].id}`,
        category: faker.commerce.productMaterial(),
        value: faker.commerce.productMaterial(),
      },
    });
    const dataRes = await getSDK(adminToken).getMasterData();
    expect(dataRes.adminGetAllMasterData.items.find((i) => i.id === `${masterData[0].id}`).logs[0].parentId).toBe(dataRes.adminGetAllMasterData.items[0].id);
  });
});
