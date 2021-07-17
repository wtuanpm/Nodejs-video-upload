import { seedAdmin } from '@/__test__/data/admin';
import { makeLawyer } from '@/__test__/data/lawyer';
import { makeLawyerData } from '@/__test__/data/lawyerData';
import { makeMasterData } from '@/__test__/data/master-data';
import { LawyerStatus } from '@/__test__/graphql/sdk';
import { getAdminAccessToken } from '@/__test__/helpers/auth';
import { delay } from '@/__test__/helpers/delay';
import { recreateDatabase } from '@/__test__/utils/databaseConnection';
import { getSDK } from '@/__test__/utils/graphqlSDK';
import { createMasterData } from '@business/admin';
import { LawyerEntity } from '@database/entities/LawyerEntity';
import { LawyerMasterDataEntity } from '@database/entities/LawyerMasterDataEntity';
import { MasterDataEntity } from '@database/entities/MasterDataEntity';
import faker from 'faker/locale/vi';
import { IsNull } from 'typeorm';
import { number } from 'yup';

describe('UPDATE LAWYER MODULE', () => {
  // test data
  let masterData: MasterDataEntity[];
  let lawyers: LawyerMasterDataEntity[];
  let lawyer: LawyerEntity[];
  var dateFaker = new Date();
  let day = '' + dateFaker.getDate();
  if (dateFaker.getDate() < 10) {
    day = '0' + dateFaker.getDate();
  }
  let month = dateFaker.getMonth() + 1;
  const value = day + '/' + month + '/' + dateFaker.getFullYear();
  function makeId() {
    var result = '';
    var characters = '0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 10; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  let adminToken: string;
  beforeAll(async () => {
    await recreateDatabase();
    await seedAdmin();
    lawyer = await makeLawyer(5);
    // const l = await makeLawyerData(10);
    // masterData = l.masterData;
    // lawyers = l.lawyers;

    adminToken = await getAdminAccessToken();
  }, 10000);

  test('#1: Update status thành công thành công sang REMOVED', async () => {
    try {
      const updateStatusRes = await getSDK(adminToken).adminChangeLawyerStatus({
        id: `${lawyer[0].id}`,
        data: {
          status: LawyerStatus.Removed,
        },
      });
      await getSDK(adminToken).getLawyer({
        data: {
          id: `${lawyer[0].id}`,
        },
      });
      expect('Hiển thị lỗi chỗ này').toContain('123');
    } catch (error) {
      expect(error.message).toContain('Cannot return null for non-nullable field Query.adminGetLawyer.');
    }
  });

  test('#2: Update status thành công thành công sang inactive', async () => {
    const updateStatusRes = await getSDK(adminToken).adminChangeLawyerStatus({
      id: `${lawyer[2].id}`,
      data: {
        status: LawyerStatus.Inactive,
      },
    });
    expect(updateStatusRes.adminChangeLawyerStatus).toBeDefined();
    const lawyersRes = await getSDK(adminToken).getLawyers();
    expect(lawyersRes.adminGetAllLawyer.items.find((i) => i.id === `${lawyer[2].id}`).logs[0].message).toBe(value + ' ngưng kích hoạt bởi Administrator');
    expect(lawyersRes.adminGetAllLawyer.items.find((i) => i.id === `${lawyer[2].id}`).status).toBe('INACTIVE');
  });
  test('#3: Update status thành công thành công sang active', async () => {
    await delay(1000);
    const updateStatusRes = await getSDK(adminToken).adminChangeLawyerStatus({
      id: `${lawyer[2].id}`,
      data: {
        status: LawyerStatus.Active,
      },
    });

    expect(updateStatusRes.adminChangeLawyerStatus).toBeDefined();
    const lawyersRes = await getSDK(adminToken).getLawyers();
    expect(lawyersRes.adminGetAllLawyer.items.find((i) => i.id === `${lawyer[2].id}`).status).toBe('ACTIVE');
    expect(lawyersRes.adminGetAllLawyer.items.find((i) => i.id === `${lawyer[2].id}`).logs[0].message).toBe(value + ' kích hoạt bởi Administrator');
  });
  test('#4: Tạo bản log khi update status', async () => {
    const lawyerRes1 = await getSDK(adminToken).getLawyer({
      data: {
        id: `${lawyer[1].id}`,
      },
    });
    await getSDK(adminToken).adminChangeLawyerStatus({
      id: `${lawyer[1].id}`,
      data: {
        status: LawyerStatus.Active,
      },
    });
    const lawyerRes2 = await getSDK(adminToken).getLawyer({
      data: {
        id: `${lawyer[1].id}`,
      },
    });
    expect(lawyerRes1.adminGetLawyer.logs.length).toBeLessThan(lawyerRes2.adminGetLawyer.logs.length);
  });
});
