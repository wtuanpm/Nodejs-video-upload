import { seedAdmin } from '@/__test__/data/admin';
import { makeMasterData } from '@/__test__/data/master-data';
import { MasterDataStatus } from '@/__test__/graphql/sdk';
import { getAdminAccessToken } from '@/__test__/helpers/auth';
import { delay } from '@/__test__/helpers/delay';
import { recreateDatabase } from '@/__test__/utils/databaseConnection';
import { getSDK } from '@/__test__/utils/graphqlSDK';
import { MasterDataEntity } from '@database/entities/MasterDataEntity';
import faker from 'faker/locale/vi';

describe('CHANGE STATUS MASTER DATA MODULE', () => {
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
  test('#1: Update status thành công', async () => {
    const updateDataRes = await getSDK(adminToken).adminChangeStatusMasterData({
      data: {
        id: `${masterData[0].id}`,
        status: MasterDataStatus.Inactive,
      },
    });
    const dataRes = await getSDK(adminToken).getMasterData();
    expect(dataRes.adminGetAllMasterData.items[0].status).toBe('INACTIVE');
    expect(dataRes.adminGetAllMasterData.items.find((i) => i.id === `${masterData[0].id}`).logs[0].message).toBe(value + ' ngưng kích hoạt bởi Administrator');
  });

  test('#2: Update sang active', async () => {
    await delay(1000);
    await getSDK(adminToken).adminChangeStatusMasterData({
      data: {
        id: `${masterData[0].id}`,
        status: MasterDataStatus.Active,
      },
    });
    const dataRes = await getSDK(adminToken).getMasterData();
    expect(dataRes.adminGetAllMasterData.items[0].status).toBe('ACTIVE');
    expect(dataRes.adminGetAllMasterData.items.find((i) => i.id === `${masterData[0].id}`).logs[0].message).toBe(value + ' kích hoạt bởi Administrator');
  });

  test('#3: Tạo bản log khi update status', async () => {
    const dataRes1 = await getSDK(adminToken).getMasterData();
    await getSDK(adminToken).adminChangeStatusMasterData({
      data: {
        id: `${masterData[0].id}`,
        status: MasterDataStatus.Active,
      },
    });
    const dataRes2 = await getSDK(adminToken).getMasterData();
    expect(dataRes1.adminGetAllMasterData.items.find((i) => i.id === `${masterData[0].id}`).logs.length).toBeLessThan(dataRes2.adminGetAllMasterData.items[0].logs.length);
  });

  test('#4: Bản log được hiển thị lên đầu khi update', async () => {
    await delay(1000);
    const dataRes1 = await getSDK(adminToken).getMasterData();
    await getSDK(adminToken).adminChangeStatusMasterData({
      data: {
        id: `${masterData[0].id}`,
        status: MasterDataStatus.Active,
      },
    });
    const dataRes2 = await getSDK(adminToken).getMasterData();
    expect(dataRes1.adminGetAllMasterData.items.find((i) => i.id === `${masterData[0].id}`).logs[0].createdAt).toBeLessThan(dataRes2.adminGetAllMasterData.items[0].logs[0].createdAt);
  });
});
