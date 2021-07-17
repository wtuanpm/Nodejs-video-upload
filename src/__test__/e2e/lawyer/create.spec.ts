import { makeMasterData } from '@/__test__/data/master-data';
import { getAdminAccessToken } from '@/__test__/helpers/auth';
import { delay } from '@/__test__/helpers/delay';
import { recreateDatabase } from '@/__test__/utils/databaseConnection';
import { getSDK } from '@/__test__/utils/graphqlSDK';
import { createMasterData } from '@business/admin';
import { MasterDataEntity } from '@database/entities/MasterDataEntity';
import { seedAdmin } from '@utils/seeding';
import faker from 'faker/locale/vi';

describe('CREATE LAWYER MODULE', () => {
  // test data
  let masterData: MasterDataEntity[];
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
    masterData = await makeMasterData(10);
    adminToken = await getAdminAccessToken();
  }, 10000);

  test('#1: Tạo lawyer thành công thành công', async () => {
    const createLawyerRes = await getSDK(adminToken).adminCreateLawyer({
      data: {
        fullName: faker.commerce.productMaterial() + Math.random(),
        phoneNumber: makeId(),
        masterDataIds: [`${masterData[0].id}`],
      },
    });
    expect(createLawyerRes.adminCreateLawyer.id).toBeDefined();
    expect(createLawyerRes.adminCreateLawyer.fullName).not.toBe(null);
    expect(createLawyerRes.adminCreateLawyer.phoneNumber).not.toBe(null);
    expect(createLawyerRes.adminCreateLawyer.email).toBe(null);
    expect(createLawyerRes.adminCreateLawyer.school).toBe(null);
    expect(createLawyerRes.adminCreateLawyer.level).toBe(null);
    expect(createLawyerRes.adminCreateLawyer.jobTitle).toBe(null);
    expect(createLawyerRes.adminCreateLawyer.company).toBe(null);
    expect(createLawyerRes.adminCreateLawyer.address).toBe(null);
    expect(createLawyerRes.adminCreateLawyer.experience).toBe(null);
    expect(createLawyerRes.adminCreateLawyer.status).toBe('ACTIVE');
    expect(createLawyerRes.adminCreateLawyer.jobField[0].id).toBeDefined();
    expect(createLawyerRes.adminCreateLawyer.jobField.length).toBe(1);
    expect(createLawyerRes.adminCreateLawyer.logs[0].message).toBe(value + ' tạo mới bởi Administrator');
    // expect(createLawyerRes.adminCreateLawyer.createdAt).toBeDefined();
  });
  test('#2: Tạo lawyer phone=null', async () => {
    try {
      const createLawyerRes = await getSDK(adminToken).adminCreateLawyer({
        data: {
          fullName: faker.commerce.productMaterial() + Math.random(),
          phoneNumber: '',
          masterDataIds: [`${masterData[0].id}`],
        },
      });
      expect('Hiển thị lỗi ở đây').toContain('123');
    } catch (error) {
      expect(error.message).toContain('Số điện thoại phải có ít nhất 9 kí tự!');
    }
  });

  test('#2: Tạo lawyer phone < 9 ký tự', async () => {
    try {
      const createLawyerRes = await getSDK(adminToken).adminCreateLawyer({
        data: {
          fullName: faker.commerce.productMaterial() + Math.random(),
          phoneNumber: '123',
          masterDataIds: [`${masterData[0].id}`],
        },
      });
      expect('Hiển thị lỗi ở đây').toContain('123');
    } catch (error) {
      expect(error.message).toContain('Số điện thoại phải có ít nhất 9 kí tự!');
    }
  });

  test('#2: Tạo lawyer phone > 15 ký tự', async () => {
    try {
      const createLawyerRes = await getSDK(adminToken).adminCreateLawyer({
        data: {
          fullName: faker.commerce.productMaterial() + Math.random(),
          phoneNumber: '1234567890987654321234',
          masterDataIds: [`${masterData[0].id}`],
        },
      });
      expect('Hiển thị lỗi ở đây').toContain('123');
    } catch (error) {
      expect(error.message).toContain('Số điên thoại phải ít hơn hoặc bằng 15 kí tự!');
    }
  });

  test('#2: Tạo lawyer phone không đúng định dạng', async () => {
    try {
      const createLawyerRes = await getSDK(adminToken).adminCreateLawyer({
        data: {
          fullName: faker.commerce.productMaterial() + Math.random(),
          phoneNumber: '12345678trewd',
          masterDataIds: [`${masterData[0].id}`],
        },
      });
      expect('Hiển thị lỗi ở đây').toContain('123');
    } catch (error) {
      expect(error.message).toContain('Số điện thoại không đúng định dạng!');
    }
  });

  test('#4: Tạo lawyer masterData=null', async () => {
    try {
      const createLawyerRes = await getSDK(adminToken).adminCreateLawyer({
        data: {
          fullName: faker.commerce.productMaterial() + Math.random(),
          phoneNumber: makeId(),
          masterDataIds: [],
        },
      });
      expect('Hiển thị lỗi ở đây').toContain('123');
    } catch (error) {
      expect(error.message).toContain('Không có giá trị nào tồn tại trong danh mục này!');
    }
  });
  test('#5: Tạo lawyer fullname=null', async () => {
    try {
      const createLawyerRes = await getSDK(adminToken).adminCreateLawyer({
        data: {
          fullName: '',
          phoneNumber: makeId(),
          masterDataIds: [`${masterData[0].id}`],
        },
      });
      expect('Hiển thị lỗi ở đây').toContain('123');
    } catch (error) {
      expect(error.message).toContain('fullName is a required field');
    }
  });
  test('#6: Tạo lawyer với định dang email hợp lệ', async () => {
    const createLawyerRes = await getSDK(adminToken).adminCreateLawyer({
      data: {
        fullName: faker.commerce.productMaterial() + Math.random(),
        phoneNumber: makeId(),
        masterDataIds: [`${masterData[0].id}`],
        email: 'a@gmail.com',
      },
    });
    expect(createLawyerRes.adminCreateLawyer.id).toBeDefined();
    expect(createLawyerRes.adminCreateLawyer.fullName).not.toBe(null);
    expect(createLawyerRes.adminCreateLawyer.phoneNumber).not.toBe(null);
    expect(createLawyerRes.adminCreateLawyer.email).toBe('a@gmail.com');
    expect(createLawyerRes.adminCreateLawyer.school).toBe(null);
    expect(createLawyerRes.adminCreateLawyer.level).toBe(null);
    expect(createLawyerRes.adminCreateLawyer.jobTitle).toBe(null);
    expect(createLawyerRes.adminCreateLawyer.company).toBe(null);
    expect(createLawyerRes.adminCreateLawyer.address).toBe(null);
    expect(createLawyerRes.adminCreateLawyer.experience).toBe(null);
    expect(createLawyerRes.adminCreateLawyer.jobField[0].id).toBeDefined();
    expect(createLawyerRes.adminCreateLawyer.logs[0].message).toBe(value + ' tạo mới bởi Administrator');
    // expect(createLawyerRes.adminCreateLawyer.createdAt).toBeDefined();
  });

  test('#7: Tạo lawyer với định dang email không hợp lệ', async () => {
    try {
      const createLawyerRes = await getSDK(adminToken).adminCreateLawyer({
        data: {
          fullName: faker.commerce.productMaterial() + Math.random(),
          phoneNumber: makeId(),
          masterDataIds: [`${masterData[0].id}`],
          email: 'a@gmail',
        },
      });
      expect('Hiển thị lỗi chỗ này').toContain('123');
    } catch (error) {
      expect(error.message).toContain('email must be a valid email');
    }
  });
  test('#3: Tạo lawyer bằng email đã tồn tại', async () => {
    try {
      const lawyerRes = await getSDK(adminToken).getLawyers();
      const createLawyerRes = await getSDK(adminToken).adminCreateLawyer({
        data: {
          fullName: faker.commerce.productMaterial() + Math.random(),
          email: lawyerRes.adminGetAllLawyer.items[0].email,
          masterDataIds: [`${masterData[0].id}`],
        },
      });
      expect('Hiển thị lỗi ở đây').toContain('123');
    } catch (error) {
      expect(error.message).toContain('Email này đã có tài khoản sử dụng!');
    }
  });
  test('#8: Tạo lawyer có school', async () => {
    const createLawyerRes = await getSDK(adminToken).adminCreateLawyer({
      data: {
        fullName: faker.commerce.productMaterial() + Math.random(),
        phoneNumber: makeId(),
        masterDataIds: [`${masterData[0].id}`],
        school: 'Vietnam Academy of Cryptography Techniques',
      },
    });
    expect(createLawyerRes.adminCreateLawyer.id).toBeDefined();
    expect(createLawyerRes.adminCreateLawyer.fullName).not.toBe(null);
    expect(createLawyerRes.adminCreateLawyer.phoneNumber).not.toBe(null);
    expect(createLawyerRes.adminCreateLawyer.school).toBe('Vietnam Academy of Cryptography Techniques');
    expect(createLawyerRes.adminCreateLawyer.logs[0].message).toBe(value + ' tạo mới bởi Administrator');
    // expect(createLawyerRes.adminCreateLawyer.createdAt).toBeDefined();
  });
  test('#9: Tạo lawyer có level', async () => {
    const createLawyerRes = await getSDK(adminToken).adminCreateLawyer({
      data: {
        fullName: faker.commerce.productMaterial() + Math.random(),
        phoneNumber: makeId(),
        masterDataIds: [`${masterData[0].id}`],
        level: '24',
      },
    });
    expect(createLawyerRes.adminCreateLawyer.id).toBeDefined();
    expect(createLawyerRes.adminCreateLawyer.fullName).not.toBe(null);
    expect(createLawyerRes.adminCreateLawyer.phoneNumber).not.toBe(null);
    expect(createLawyerRes.adminCreateLawyer.level).toBe('24');
    expect(createLawyerRes.adminCreateLawyer.logs[0].message).toBe(value + ' tạo mới bởi Administrator');
    // expect(createLawyerRes.adminCreateLawyer.createdAt).toBeDefined();
  });

  test('#10: Tạo lawyer có jobTitle', async () => {
    const createLawyerRes = await getSDK(adminToken).adminCreateLawyer({
      data: {
        fullName: faker.commerce.productMaterial() + Math.random(),
        phoneNumber: makeId(),
        masterDataIds: [`${masterData[0].id}`],
        jobTitle: 'Luật sư',
      },
    });
    expect(createLawyerRes.adminCreateLawyer.id).toBeDefined();
    expect(createLawyerRes.adminCreateLawyer.fullName).not.toBe(null);
    expect(createLawyerRes.adminCreateLawyer.phoneNumber).not.toBe(null);
    expect(createLawyerRes.adminCreateLawyer.jobTitle).toBe('Luật sư');
    expect(createLawyerRes.adminCreateLawyer.jobField[0].id).toBeDefined();
    expect(createLawyerRes.adminCreateLawyer.logs[0].message).toBe(value + ' tạo mới bởi Administrator');
    // expect(createLawyerRes.adminCreateLawyer.createdAt).toBeDefined();
  });
  test('#11: Tạo lawyer có company', async () => {
    const createLawyerRes = await getSDK(adminToken).adminCreateLawyer({
      data: {
        fullName: faker.commerce.productMaterial() + Math.random(),
        phoneNumber: makeId(),
        masterDataIds: [`${masterData[0].id}`],
        company: 'Công ty',
      },
    });
    expect(createLawyerRes.adminCreateLawyer.id).toBeDefined();
    expect(createLawyerRes.adminCreateLawyer.fullName).not.toBe(null);
    expect(createLawyerRes.adminCreateLawyer.phoneNumber).not.toBe(null);
    expect(createLawyerRes.adminCreateLawyer.company).toBe('Công ty');
    expect(createLawyerRes.adminCreateLawyer.jobField[0].id).toBeDefined();
    expect(createLawyerRes.adminCreateLawyer.logs[0].message).toBe(value + ' tạo mới bởi Administrator');
    // expect(createLawyerRes.adminCreateLawyer.createdAt).toBeDefined();
  });

  test('#12: Tạo lawyer có địa chỉ', async () => {
    const createLawyerRes = await getSDK(adminToken).adminCreateLawyer({
      data: {
        fullName: faker.commerce.productMaterial() + Math.random(),
        phoneNumber: makeId(),
        masterDataIds: [`${masterData[0].id}`],
        address: 'Địa chỉ',
      },
    });
    expect(createLawyerRes.adminCreateLawyer.id).toBeDefined();
    expect(createLawyerRes.adminCreateLawyer.fullName).not.toBe(null);
    expect(createLawyerRes.adminCreateLawyer.phoneNumber).not.toBe(null);
    expect(createLawyerRes.adminCreateLawyer.email).toBe(null);
    expect(createLawyerRes.adminCreateLawyer.school).toBe(null);
    expect(createLawyerRes.adminCreateLawyer.level).toBe(null);
    expect(createLawyerRes.adminCreateLawyer.jobTitle).toBe(null);
    expect(createLawyerRes.adminCreateLawyer.company).toBe(null);
    expect(createLawyerRes.adminCreateLawyer.address).toBe('Địa chỉ');
    expect(createLawyerRes.adminCreateLawyer.experience).toBe(null);
    expect(createLawyerRes.adminCreateLawyer.jobField[0].id).toBeDefined();
    expect(createLawyerRes.adminCreateLawyer.logs[0].message).toBe(value + ' tạo mới bởi Administrator');
    // expect(createLawyerRes.adminCreateLawyer.createdAt).toBeDefined();
  });

  test('#13: Tạo lawyer có kinh nghiệm', async () => {
    const createLawyerRes = await getSDK(adminToken).adminCreateLawyer({
      data: {
        fullName: faker.commerce.productMaterial() + Math.random(),
        phoneNumber: makeId(),
        masterDataIds: [`${masterData[0].id}`],
        experience: 5,
      },
    });
    expect(createLawyerRes.adminCreateLawyer.id).toBeDefined();
    expect(createLawyerRes.adminCreateLawyer.fullName).not.toBe(null);
    expect(createLawyerRes.adminCreateLawyer.phoneNumber).not.toBe(null);
    expect(createLawyerRes.adminCreateLawyer.email).toBe(null);
    expect(createLawyerRes.adminCreateLawyer.school).toBe(null);
    expect(createLawyerRes.adminCreateLawyer.level).toBe(null);
    expect(createLawyerRes.adminCreateLawyer.jobTitle).toBe(null);
    expect(createLawyerRes.adminCreateLawyer.company).toBe(null);
    expect(createLawyerRes.adminCreateLawyer.address).toBe(null);
    expect(createLawyerRes.adminCreateLawyer.experience).toBe(5);
    expect(createLawyerRes.adminCreateLawyer.jobField[0].id).toBeDefined();
    expect(createLawyerRes.adminCreateLawyer.logs[0].message).toBe(value + ' tạo mới bởi Administrator');
    // expect(createLawyerRes.adminCreateLawyer.createdAt).toBeDefined();
  });

  test('#13: Tạo lawyer có kinh nghiệm <0(check trên front-end)', async () => {});

  test('#14: Lawyer vừa tạo hiển thị trên đầu danh sách', async () => {
    await delay(1000);
    const createLawyerRes = await getSDK(adminToken).adminCreateLawyer({
      data: {
        fullName: faker.commerce.productMaterial() + Math.random(),
        phoneNumber: makeId(),
        masterDataIds: [`${masterData[0].id}`],
        school: 'hihi',
      },
    });
    const lawyerRes = await getSDK(adminToken).getLawyers();
    expect(createLawyerRes.adminCreateLawyer.id).toBeDefined();
    expect(createLawyerRes.adminCreateLawyer.fullName).not.toBe(null);
    expect(createLawyerRes.adminCreateLawyer.phoneNumber).not.toBe(null);
    expect(createLawyerRes.adminCreateLawyer.id).toBe(lawyerRes.adminGetAllLawyer.items[0].id);
  });

  test('#15: Tạo lawyer có nhiều masterData', async () => {
    const createLawyerRes = await getSDK(adminToken).adminCreateLawyer({
      data: {
        fullName: faker.commerce.productMaterial() + Math.random(),
        phoneNumber: makeId(),
        masterDataIds: [`${masterData[0].id}`, `${masterData[1].id}`, `${masterData[2].id}`],
      },
    });
    const lawyerRes = await getSDK(adminToken).getLawyers();
    expect(createLawyerRes.adminCreateLawyer.id).toBeDefined();
    expect(createLawyerRes.adminCreateLawyer.fullName).not.toBe(null);
    expect(createLawyerRes.adminCreateLawyer.phoneNumber).not.toBe(null);
    expect(createLawyerRes.adminCreateLawyer.jobField.length).toBe(3);
  });

  test('#16: Tạo lawyer với masterData không tồn tại', async () => {
    try {
      const createLawyerRes = await getSDK(adminToken).adminCreateLawyer({
        data: {
          fullName: faker.commerce.productMaterial() + Math.random(),
          phoneNumber: makeId(),
          masterDataIds: ['100'],
        },
      });
      expect('Hiển thị lỗi chỗ này').toContain('123');
    } catch (error) {
      expect(error.message).toContain('Không có giá trị nào tồn tại trong danh mục này!');
    }
  });

  test('#17: Tạo lawyer với mảng masterData có giá trị không tồn tại => tạo mà k sử dụng giá trị không tồn tại', async () => {
    const createLawyerRes = await getSDK(adminToken).adminCreateLawyer({
      data: {
        fullName: faker.commerce.productMaterial() + Math.random(),
        phoneNumber: makeId(),
        masterDataIds: [`${masterData[0].id}`, '100'],
      },
    });
    expect(createLawyerRes.adminCreateLawyer.jobField.length).toBe(1);
    expect(createLawyerRes.adminCreateLawyer.jobField[0].id).toBe(`${masterData[0].id}`);
  });

  test('#18: Tạo lawyer với masterData đã inactive', async () => {
    try {
      const masterDataRes = await getSDK(adminToken).getMasterData();
      let idDataMaster = masterDataRes.adminGetAllMasterData.items.find((i) => i.status === 'INACTIVE').id;
      const createLawyerRes = await getSDK(adminToken).adminCreateLawyer({
        data: {
          fullName: faker.commerce.productMaterial() + Math.random(),
          phoneNumber: makeId(),
          masterDataIds: [idDataMaster],
        },
      });
      expect('Hiển thị lỗi chỗ này').toContain('123');
    } catch (error) {
      expect(error.message).toContain('Không có giá trị nào tồn tại trong danh mục này!');
    }
  });
});
