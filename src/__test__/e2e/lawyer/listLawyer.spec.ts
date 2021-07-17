import { seedAdmin } from '@/__test__/data/admin';
import { makeLawyer } from '@/__test__/data/lawyer';
import { makeLawyerData } from '@/__test__/data/lawyerData';
import { makeLawyerMasterData } from '@/__test__/data/lawyerMasterDatas';
import { makeMasterData } from '@/__test__/data/master-data';
import { LawyerSortBy, Order } from '@/__test__/graphql/sdk';
import { getAdminAccessToken } from '@/__test__/helpers/auth';
import { delay } from '@/__test__/helpers/delay';
import { recreateDatabase } from '@/__test__/utils/databaseConnection';
import { getSDK } from '@/__test__/utils/graphqlSDK';
import { createMasterData } from '@business/admin';
import { LawyerEntity } from '@database/entities/LawyerEntity';
import { LawyerMasterDataEntity } from '@database/entities/LawyerMasterDataEntity';
import { MasterDataEntity } from '@database/entities/MasterDataEntity';
import { Sort } from '@graphql/types/generated-graphql-types';
import faker from 'faker/locale/vi';
import { IsNull } from 'typeorm';
import { number } from 'yup';

describe('LIST LAWYER MODULE', () => {
  jest.setTimeout(100000);
  // test data
  let masterData: MasterDataEntity[];
  let lawyers: LawyerMasterDataEntity[];
  let lawyer: LawyerEntity[];
  let lawyerMasterData: LawyerMasterDataEntity[];
  var dateFaker = new Date();
  let day = '' + dateFaker.getDate();
  if (dateFaker.getDate() < 10) {
    day = '0' + dateFaker.getDate();
  }
  let month = dateFaker.getMonth() + 1;
  const value = day + '/' + month + '/' + dateFaker.getFullYear();
  const baseString = '0123456789';
  let phone: string;

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
    const l = await makeLawyerData(10);
    masterData = l.masterData;
    lawyers = l.lawyers;
    lawyer = await makeLawyer(8);
    makeLawyerMasterData(1, [1, 2, 3]);
    adminToken = await getAdminAccessToken();
  }, 10000);
  test('#1: Admin xem được toàn bộ danh sách', async () => {
    const LawyerRes = await getSDK(adminToken).getLawyers();
    expect(LawyerRes.adminGetAllLawyer.items.length).toBe(19);
    expect(LawyerRes.adminGetAllLawyer.paginate.pageIndex).toBe(1);
    expect(LawyerRes.adminGetAllLawyer.paginate.pageSize).toBe(20);
    expect(LawyerRes.adminGetAllLawyer.paginate.totalItems).toBe(18);
  });

  test('#2: Kiểm tra số bản ghi trên 1 page', async () => {
    const LawyerRes = await getSDK(adminToken).getLawyers({
      pageIndex: 2,
      pageSize: 5,
    });
    expect(LawyerRes.adminGetAllLawyer.items.length).toBe(5);
    expect(LawyerRes.adminGetAllLawyer.paginate.pageSize).toBe(5);
    expect(LawyerRes.adminGetAllLawyer.paginate.pageIndex).toBe(2);
  });

  test('#3: Kiểm tra filter theo masterDataId', async () => {
    const lawyerRes = await getSDK(adminToken).getLawyers({
      filter: {
        masterDataId: '2',
      },
    });
    expect(lawyerRes.adminGetAllLawyer.items.length).toBe(2);
    for (let i = 0; i < lawyerRes.adminGetAllLawyer.items.length; i++) {
      expect(lawyerRes.adminGetAllLawyer.items.find((i) => i.jobField.find((j) => j.id === '2').id).id).toBeDefined();
    }
  });

  test('#4: Kiểm tra filter theo masterDataId không tồn tại', async () => {
    const lawyerRes = await getSDK(adminToken).getLawyers({
      pageIndex: 1,
      pageSize: 10,
      filter: {
        masterDataId: '1000',
      },
    });
    expect(lawyerRes.adminGetAllLawyer.items.length).toBe(0);
    expect(lawyerRes.adminGetAllLawyer.paginate.totalItems).toBe(0);
    expect(lawyerRes.adminGetAllLawyer.paginate.totalPage).toBe(0);
    expect(lawyerRes.adminGetAllLawyer.paginate.pageIndex).toBe(1);
    expect(lawyerRes.adminGetAllLawyer.paginate.pageSize).toBe(10);
  });

  test('#5: Kiểm tra tìm kiếm theo filter không tồn tại', async () => {
    const lawyerRes = await getSDK(adminToken).getLawyers({
      pageIndex: 1,
      pageSize: 10,
      filter: {
        query: 'sajasd jsahdh asd',
      },
    });
    expect(lawyerRes.adminGetAllLawyer.items.length).toBe(0);
    expect(lawyerRes.adminGetAllLawyer.paginate.totalItems).toBe(0);
    expect(lawyerRes.adminGetAllLawyer.paginate.totalPage).toBe(0);
    expect(lawyerRes.adminGetAllLawyer.paginate.pageIndex).toBe(1);
    expect(lawyerRes.adminGetAllLawyer.paginate.pageSize).toBe(10);
  });

  test('#6: Kiểm tra query theo mã luật sư  ', async () => {
    const lawyerRes = await getSDK(adminToken).getLawyers({
      filter: {
        masterDataId: '1',
        query: '1',
      },
    });
    expect(lawyerRes.adminGetAllLawyer.items.length).toBe(1);
    expect(lawyerRes.adminGetAllLawyer.items[0].id).toBe('1');
  });

  test('#7: Kiểm tra query theo fullname luật sư  ', async () => {
    const lawyerRes1 = await getSDK(adminToken).getLawyers();
    const lawyerRes = await getSDK(adminToken).getLawyers({
      filter: {
        // masterDataId: '2',
        query: lawyerRes1.adminGetAllLawyer.items[0].fullName,
      },
    });
    expect(lawyerRes.adminGetAllLawyer.items.length).toBe(1);
    for (let i = 0; i < lawyerRes1.adminGetAllLawyer.items.length; i++) {
      expect(lawyerRes1.adminGetAllLawyer.items[0].fullName).toBe(lawyerRes.adminGetAllLawyer.items[0].fullName);
    }
  });

  test('#8: Kiểm tra query theo company luật sư  ', async () => {
    const lawyerRes1 = await getSDK(adminToken).getLawyers();
    const lawyerRes = await getSDK(adminToken).getLawyers({
      filter: {
        // masterDataId: '2',
        query: lawyerRes1.adminGetAllLawyer.items[0].company,
      },
    });
    expect(lawyerRes.adminGetAllLawyer.items.length).toBe(1);
    for (let i = 0; i < lawyerRes1.adminGetAllLawyer.items.length; i++) {
      expect(lawyerRes1.adminGetAllLawyer.items[0].company).toBe(lawyerRes.adminGetAllLawyer.items[0].company);
    }
  });
  test('#9: Kiểm tra query theo phone  ', async () => {
    const lawyerRes1 = await getSDK(adminToken).getLawyers();
    const lawyerRes = await getSDK(adminToken).getLawyers({
      filter: {
        // masterDataId: '2',
        query: lawyerRes1.adminGetAllLawyer.items[0].phoneNumber,
      },
    });
    expect(lawyerRes.adminGetAllLawyer.items.length).toBe(1);
    for (let i = 0; i < lawyerRes1.adminGetAllLawyer.items.length; i++) {
      expect(lawyerRes1.adminGetAllLawyer.items[0].phoneNumber).toBe(lawyerRes.adminGetAllLawyer.items[0].phoneNumber);
    }
  });

  test('#10: Kiểm tra trimspace', async () => {
    const lawyerRes1 = await getSDK(adminToken).getLawyers();
    const lawyerRes = await getSDK(adminToken).getLawyers({
      filter: {
        // masterDataId: '2',
        query: ' ' + lawyerRes1.adminGetAllLawyer.items[0].fullName + ' ',
      },
    });
    expect(lawyerRes.adminGetAllLawyer.items.length).toBe(1);
    for (let i = 0; i < lawyerRes1.adminGetAllLawyer.items.length; i++) {
      expect(lawyerRes1.adminGetAllLawyer.items[0].fullName).toBe(lawyerRes.adminGetAllLawyer.items[0].fullName);
    }
  });

  test('#11: Kiểm tra query theo query và masterId  ', async () => {
    const lawyerRes1 = await getSDK(adminToken).getLawyers();
    const lawyerRes = await getSDK(adminToken).getLawyers({
      filter: {
        masterDataId: lawyerRes1.adminGetAllLawyer.items[0].jobField[0].id,
        query: lawyerRes1.adminGetAllLawyer.items[0].phoneNumber,
      },
    });
    expect(lawyerRes.adminGetAllLawyer.items.length).toBe(1);
    for (let i = 0; i < lawyerRes.adminGetAllLawyer.items.length; i++) {
      expect(lawyerRes1.adminGetAllLawyer.items[0].phoneNumber).toBe(lawyerRes.adminGetAllLawyer.items[0].phoneNumber);
      expect(lawyerRes.adminGetAllLawyer.items.find((i) => i.jobField.find((j) => j.id === '2').id).id).toBeDefined();
    }
  });

  test('#12: Kiểm tra query theo query và masterId nhưng số bản ghi trả về =0 ', async () => {
    const lawyerRes1 = await getSDK(adminToken).getLawyers();
    const lawyerRes = await getSDK(adminToken).getLawyers({
      filter: {
<<<<<<< HEAD
        masterDataId: lawyerRes1.adminGetAllLawyer.items[3].phoneNumber,
=======
        masterDataId: lawyerRes1.adminGetAllLawyer.items[3].jobField[0].id,
>>>>>>> 17bbd17... question , article
        query: lawyerRes1.adminGetAllLawyer.items[0].phoneNumber,
      },
    });
    expect(lawyerRes.adminGetAllLawyer.items.length).toBe(0);
    expect(lawyerRes.adminGetAllLawyer.paginate.totalItems).toBe(0);
    expect(lawyerRes.adminGetAllLawyer.paginate.totalPage).toBe(0);
    expect(lawyerRes.adminGetAllLawyer.paginate.pageIndex).toBe(1);
    expect(lawyerRes.adminGetAllLawyer.paginate.pageSize).toBe(20);
  });

  test('#13: Tìm kiếm bản ghi ở trang #1', async () => {
    const lawyerRes1 = await getSDK(adminToken).getLawyers();
    const lawyerRes = await getSDK(adminToken).getLawyers({
      filter: {
        query: lawyerRes1.adminGetAllLawyer.items[7].phoneNumber,
      },
      pageIndex: 1,
      pageSize: 5,
    });
    expect(lawyerRes.adminGetAllLawyer.items.length).not.toBe(0);
    for (let i = 0; i < lawyerRes.adminGetAllLawyer.items.length; i++) {
      expect(lawyerRes.adminGetAllLawyer.items[i].phoneNumber).toContain(lawyerRes1.adminGetAllLawyer.items[7].phoneNumber);
    }
  });

  test('#14: Sort theo id tăng dần', async () => {
    const lawyerRes = await getSDK(adminToken).getLawyers({
      filter: {
        orderBy: {
          sort: LawyerSortBy.Id,
          order: Order.Asc,
        },
      },
    });
    expect(lawyerRes.adminGetAllLawyer.items.length).not.toBe(0);
    for (let i = 0; i < lawyerRes.adminGetAllLawyer.items.length - 1; i++) {
      expect(parseInt(lawyerRes.adminGetAllLawyer.items[i].id)).toBeLessThan(parseInt(lawyerRes.adminGetAllLawyer.items[i + 1].id));
    }
  });

  test('#15: Sort theo id giảm đân', async () => {
    const lawyerRes = await getSDK(adminToken).getLawyers({
      filter: {
        orderBy: {
          sort: LawyerSortBy.Id,
          order: Order.Desc,
        },
      },
    });
    expect(lawyerRes.adminGetAllLawyer.items.length).not.toBe(0);
    for (let i = 0; i < lawyerRes.adminGetAllLawyer.items.length - 1; i++) {
      expect(parseInt(lawyerRes.adminGetAllLawyer.items[i].id)).toBeGreaterThan(parseInt(lawyerRes.adminGetAllLawyer.items[i + 1].id));
    }
  });

  test('#16: Sort theo fullName giảm đân', async () => {
    var b = [];
    const lawyerRes1 = await getSDK(adminToken).getLawyers();
    for (let i = 0; i < lawyerRes1.adminGetAllLawyer.items.length; i++) {
      let name = lawyerRes1.adminGetAllLawyer.items[i].fullName;
      b.push(name);
    }
    const lawyerRes = await getSDK(adminToken).getLawyers({
      filter: {
        orderBy: {
          sort: LawyerSortBy.FullName,
          order: Order.Asc,
        },
      },
    });
    var c = b.sort();
    expect(lawyerRes.adminGetAllLawyer.items.length).not.toBe(0);
    for (let i = 0; i < lawyerRes.adminGetAllLawyer.items.length; i++) {
      expect(c[i]).toBe(lawyerRes.adminGetAllLawyer.items[i].fullName);
    }
  });

  test('#17: Sort theo FullName tăng đân', async () => {
    var b = [];
    const lawyerRes1 = await getSDK(adminToken).getLawyers();
    for (let i = 0; i < lawyerRes1.adminGetAllLawyer.items.length; i++) {
      let name = lawyerRes1.adminGetAllLawyer.items[i].fullName;
      b.push(name);
    }
    const lawyerRes = await getSDK(adminToken).getLawyers({
      filter: {
        orderBy: {
          sort: LawyerSortBy.FullName,
          order: Order.Desc,
        },
      },
    });
    var c = b.sort();
    expect(lawyerRes.adminGetAllLawyer.items.length).not.toBe(0);
    for (let i = 0; i < lawyerRes1.adminGetAllLawyer.items.length; i++) {
      expect(c[lawyerRes1.adminGetAllLawyer.items.length - i - 1]).toBe(lawyerRes.adminGetAllLawyer.items[i].fullName);
    }
  });

  test('#18: Tìm kiếm với từ gần giống', async () => {
    const lawyerRes1 = await getSDK(adminToken).getLawyers();
    let queryFullName = lawyerRes1.adminGetAllLawyer.items[0].fullName.slice(3);
    const lawyerRes = await getSDK(adminToken).getLawyers({
      filter: {
        query: queryFullName,
      },
    });
    expect(lawyerRes.adminGetAllLawyer.items.length).not.toBe(0);
    for (let i = 0; i < lawyerRes.adminGetAllLawyer.items.length; i++) {
      expect(lawyerRes.adminGetAllLawyer.items[i].fullName).toContain(lawyerRes1.adminGetAllLawyer.items[0].fullName);
    }
  });
});
