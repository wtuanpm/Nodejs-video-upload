import { seedAdmin } from '@/__test__/data/admin';
import { makeMasterData } from '@/__test__/data/master-data';
import { getAdminAccessToken } from '@/__test__/helpers/auth';
import { delay } from '@/__test__/helpers/delay';
import { recreateDatabase } from '@/__test__/utils/databaseConnection';
import { getSDK } from '@/__test__/utils/graphqlSDK';
import faker from 'faker/locale/vi';

describe('CREATE MASTER DATA MODULE', () => {
  // test data
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
    await makeMasterData(3);
    adminToken = await getAdminAccessToken();
  }, 10000);

  test('#1: Tạo masterdata thành công', async () => {
    const createDataRes = await getSDK(adminToken).adminCreateMasterData({
      data: {
        category: value,
        value: value,
      },
    });
    expect(createDataRes.adminCreateMasterData.id).toBeDefined();
    expect(createDataRes.adminCreateMasterData.category).toBeDefined();
    expect(createDataRes.adminCreateMasterData.value).toBeDefined();
    expect(createDataRes.adminCreateMasterData.status).toBeDefined();
    expect(createDataRes.adminCreateMasterData.logs.length).toBe(1);
    expect(createDataRes.adminCreateMasterData.logs[0].id).toBeDefined();
    expect(createDataRes.adminCreateMasterData.logs[0].message).toBe(value + ' tạo mới bởi Administrator');
    expect(createDataRes.adminCreateMasterData.createdAt).toBeDefined();
  });
  test('#2: Masterdata tạo hiển thị đầu danh sách', async () => {
    await delay(1000);
    const createDataRes = await getSDK(adminToken).adminCreateMasterData({
      data: {
        category: faker.commerce.productMaterial(),
        value: faker.commerce.productMaterial(),
      },
    });
    const dataRes = await getSDK(adminToken).getMasterData();
    expect(createDataRes.adminCreateMasterData.id).toBe(dataRes.adminGetAllMasterData.items[0].id);
  });
  test('#3: Tạo masterdata đã tồn tại', async () => {
    try {
      await getSDK(adminToken).adminCreateMasterData({
        data: {
          category: value,
          value: value,
        },
      });
      expect('Thông báo lỗi ở đây').toContain('123');
    } catch (error) {
      expect(error.message).toContain('Giá trị đã tồn tại trong danh mục');
    }
  });
  test('#4: Tạo masterdata bỏ trống category', async () => {
    try {
      const createDataRes = await getSDK(adminToken).adminCreateMasterData({
        data: {
          category: '',
          value: '123',
        },
      });
      expect('Thông báo lỗi ở đây').toContain('123');
    } catch (error) {
      expect(error.message).toContain('category is a required field');
    }
  });
  test('#5: Tạo masterdata bỏ trống value', async () => {
    try {
      const createDataRes = await getSDK(adminToken).adminCreateMasterData({
        data: {
          category: '123',
          value: '',
        },
      });
      expect('Thông báo lỗi ở đây').toContain('123');
    } catch (error) {
      expect(error.message).toContain('value is a required field');
    }
  });
});
