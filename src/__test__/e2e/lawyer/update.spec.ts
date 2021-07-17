import { seedAdmin } from '@/__test__/data/admin';
import { makeLawyer } from '@/__test__/data/lawyer';
import { makeLawyerData } from '@/__test__/data/lawyerData';
import { makeMasterData } from '@/__test__/data/master-data';
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
    lawyer = await makeLawyer(3);
    const l = await makeLawyerData(10);
    masterData = l.masterData;
    lawyers = l.lawyers;
    adminToken = await getAdminAccessToken();
  }, 10000);

  test('#1: Update lawyer thành công thành công', async () => {
    const updateLawyerRes = await getSDK(adminToken).adminUpdateLawyer({
      id: `${lawyer[0].id}`,
      data: {
        fullName: '123',
        phoneNumber: makeId(),
        masterDataIds: [`${masterData[0].id}`],
      },
    });
    const lawyerRes = await getSDK(adminToken).getLawyers();
    expect(updateLawyerRes.adminUpdateLawyer).toBeDefined();
    expect(lawyerRes.adminGetAllLawyer.items.find((i) => i.id === `${lawyer[0].id}`).logs[0].message).toBe(value + ' cập nhật bởi  Administrator');
    expect(lawyerRes.adminGetAllLawyer.items.find((i) => i.id === `${lawyer[0].id}`).fullName).toBe('123');
  });
  test('#2: Bản log được tạo khi update', async () => {
    const lawyerRes1 = await getSDK(adminToken).getLawyers();
    const updateLawyerRes = await getSDK(adminToken).adminUpdateLawyer({
      id: `${lawyer[0].id}`,
      data: {
        fullName: '123',
        phoneNumber: makeId(),
        masterDataIds: [`${masterData[0].id}`],
      },
    });
    const lawyerRes2 = await getSDK(adminToken).getLawyers();
    expect(updateLawyerRes.adminUpdateLawyer).toBeDefined();
    expect(lawyerRes1.adminGetAllLawyer.items.find((i) => i.id === `${lawyer[0].id}`).logs.length).toBe(lawyerRes2.adminGetAllLawyer.items[0].logs.length - 1);
  });
  test('#3: Bản log được tạo hiển thị lên đầu khi update', async () => {
    await delay(1000);
    const lawyerRes1 = await getSDK(adminToken).getLawyers();
    const updateLawyerRes = await getSDK(adminToken).adminUpdateLawyer({
      id: `${lawyer[0].id}`,
      data: {
        fullName: '123',
        phoneNumber: makeId(),
        masterDataIds: [`${masterData[0].id}`],
      },
    });
    const lawyerRes2 = await getSDK(adminToken).getLawyers();
    expect(updateLawyerRes.adminUpdateLawyer).toBeDefined();
    expect(lawyerRes1.adminGetAllLawyer.items.find((i) => i.id === `${lawyer[0].id}`).logs[0].createdAt).toBeLessThan(lawyerRes2.adminGetAllLawyer.items[0].logs[0].createdAt);
  });

  test('#4: Update fullname= null', async () => {
    try {
      await getSDK(adminToken).adminUpdateLawyer({
        id: `${lawyer[0].id}`,
        data: {
          fullName: '',
          phoneNumber: makeId(),
          masterDataIds: [`${masterData[0].id}`],
        },
      });
      expect('Hiển thị lỗi chỗ này').toContain('123');
    } catch (error) {
      expect(error.message).toContain('fullName is a required field');
    }
  });

  test('#5: Update phoneNumber thành công', async () => {
    await getSDK(adminToken).adminUpdateLawyer({
      id: `${lawyer[0].id}`,
      data: {
        fullName: faker.commerce.productMaterial() + Math.random(),
        phoneNumber: '123456789',
        masterDataIds: [`${masterData[0].id}`],
      },
    });
    const lawyerRes = await getSDK(adminToken).getLawyers();

    expect(lawyerRes.adminGetAllLawyer.items.find((i) => i.id === `${lawyer[0].id}`).phoneNumber).toBe('123456789');
  });

  test('#7: Update phoneNumber=null', async () => {
    try {
      await getSDK(adminToken).adminUpdateLawyer({
        id: `${lawyer[0].id}`,
        data: {
          fullName: faker.commerce.productMaterial() + Math.random(),
          phoneNumber: '',
          masterDataIds: [`${masterData[0].id}`],
        },
      });
      expect('Hiển thị lỗi chỗ này').toContain('123');
    } catch (error) {
      expect(error.message).toContain('Số điện thoại phải có ít nhất 9 kí tự!');
    }
  });

  test('#8: Update phoneNumber < 9 ký tự', async () => {
    try {
      const lawyerRes1 = await getSDK(adminToken).getLawyers();
      const updateLawyerRes = await getSDK(adminToken).adminUpdateLawyer({
        id: `${lawyer[0].id}`,
        data: {
          fullName: faker.commerce.productMaterial() + Math.random(),
          phoneNumber: '123',
          masterDataIds: [`${masterData[0].id}`],
        },
      });
      expect('Hiển thị lỗi chỗ này').toContain('123');
    } catch (error) {
      expect(error.message).toContain('Số điện thoại phải có ít nhất 9 kí tự!');
    }
  });
  // test('#11: Update masterData=null', async () => {
  //   try {
  //     const lawyerRes1 = await getSDK(adminToken).getLawyers();
  //     const updateLawyerRes = await getSDK(adminToken).adminUpdateLawyer({
  //       id: `${lawyer[0].id}`,
  //       data: {
  //         fullName: faker.commerce.productMaterial() + Math.random(),
  //         phoneNumber: makeId(),
  //         masterDataIds: [],
  //       },
  //     });
  //     expect('Hiển thị lỗi chỗ này').toContain('123');
  //   } catch (error) {
  //     expect(error.message).toContain('Không có giá trị nào tồn tại trong danh mục này!');
  //   }
  // });

  test('#12: Update masterData không tồn tại', async () => {
    try {
      const updateLawyerRes = await getSDK(adminToken).adminUpdateLawyer({
        id: `${lawyer[0].id}`,
        data: {
          fullName: faker.commerce.productMaterial() + Math.random(),
          phoneNumber: makeId(),
          masterDataIds: ['432'],
        },
      });
      expect('Hiển thị lỗi chỗ này').toContain('123');
    } catch (error) {
      expect(error.message).toContain('Không có giá trị nào tồn tại trong danh mục này!');
    }
  });

  test('#13: Update masterData inactive', async () => {
    try {
      const masterRes = await getSDK(adminToken).getMasterData();
      let idMasterData = masterRes.adminGetAllMasterData.items.find((i) => i.status === 'INACTIVE').id;
      const updateLawyerRes = await getSDK(adminToken).adminUpdateLawyer({
        id: `${lawyer[0].id}`,
        data: {
          fullName: faker.commerce.productMaterial() + Math.random(),
          phoneNumber: makeId(),
          masterDataIds: [idMasterData],
        },
      });
      expect('Hiển thị lỗi chỗ này').toContain('123');
    } catch (error) {
      expect(error.message).toContain('Không có giá trị nào tồn tại trong danh mục này!');
    }
  });
  test('#14: Update mảng masterData có phần tử inactive', async () => {
    const masterRes = await getSDK(adminToken).getMasterData();
    let idMasterData = masterRes.adminGetAllMasterData.items.find((i) => i.status === 'INACTIVE').id;
    const updateLawyerRes = await getSDK(adminToken).adminUpdateLawyer({
      id: `${lawyer[0].id}`,
      data: {
        fullName: faker.commerce.productMaterial() + Math.random(),
        phoneNumber: makeId(),
        masterDataIds: [idMasterData, `${masterData[0].id}`, `${masterData[1].id}`],
      },
    });
    const lawyerRes = await getSDK(adminToken).getLawyers();
    expect(lawyerRes.adminGetAllLawyer.items.find((i) => i.id === `${lawyer[0].id}`).jobField.length).toBe(2);
  });
  test('#9: Update phoneNumber không đúng định dạng', async () => {
    try {
      const lawyerRes1 = await getSDK(adminToken).getLawyers();
      const updateLawyerRes = await getSDK(adminToken).adminUpdateLawyer({
        id: `${lawyer[0].id}`,
        data: {
          fullName: faker.commerce.productMaterial() + Math.random(),
          phoneNumber: '1233e3ee33',
          masterDataIds: [`${masterData[0].id}`],
        },
      });
      expect('Hiển thị lỗi chỗ này').toContain('123');
    } catch (error) {
      expect(error.message).toContain('Cannot add or update a child row');
    }
  });
  test('#10: Update master data thành công', async () => {
    const updateLawyerRes = await getSDK(adminToken).adminUpdateLawyer({
      id: `${lawyer[0].id}`,
      data: {
        fullName: faker.commerce.productMaterial() + Math.random(),
        phoneNumber: makeId(),
        masterDataIds: [`${masterData[1].id}`],
      },
    });
    const lawyerRes = await getSDK(adminToken).getLawyers();
    expect(lawyerRes.adminGetAllLawyer.items.find((i) => i.id === `${lawyer[0].id}`).jobField[0].id).toBe(`${masterData[1].id}`);
  });

  test('#15: Update email thành công', async () => {
    const updateLawyerRes = await getSDK(adminToken).adminUpdateLawyer({
      id: `${lawyer[0].id}`,
      data: {
        fullName: faker.commerce.productMaterial() + Math.random(),
        phoneNumber: makeId(),
        masterDataIds: [`${masterData[0].id}`, `${masterData[1].id}`],
        email: 'thu@gmail.com',
      },
    });
    const lawyerRes = await getSDK(adminToken).getLawyers();
    expect(lawyerRes.adminGetAllLawyer.items.find((i) => i.id === `${lawyer[0].id}`).email).toBe('thu@gmail.com');
  });
  test('#6: Update email đã tồn tại', async () => {
    try {
      await getSDK(adminToken).adminUpdateLawyer({
        id: `${lawyer[0].id}`,
        data: {
          fullName: faker.commerce.productMaterial() + Math.random(),
          email: `${lawyer[2].email}`,
          masterDataIds: [`${masterData[0].id}`],
        },
      });
      expect('Hiển thị lỗi chỗ này').toContain('123');
    } catch (error) {
      expect(error.message).toContain('Email này đã có tài khoản sử dụng');
    }
  });
  test('#16: Update email=null', async () => {
    const updateLawyerRes = await getSDK(adminToken).adminUpdateLawyer({
      id: `${lawyer[0].id}`,
      data: {
        fullName: faker.commerce.productMaterial() + Math.random(),
        phoneNumber: makeId(),
        masterDataIds: [`${masterData[0].id}`, `${masterData[1].id}`],
        email: '',
      },
    });
    const lawyerRes = await getSDK(adminToken).getLawyers();
    expect(lawyerRes.adminGetAllLawyer.items.find((i) => i.id === `${lawyer[0].id}`).email).toBe('');
  });
  test('#17: Update email không đúng định dạng', async () => {
    try {
      const updateLawyerRes = await getSDK(adminToken).adminUpdateLawyer({
        id: `${lawyer[0].id}`,
        data: {
          fullName: faker.commerce.productMaterial() + Math.random(),
          phoneNumber: makeId(),
          masterDataIds: [`${masterData[0].id}`, `${masterData[1].id}`],
          email: 'thu',
        },
      });
      expect('Hiển thị lỗi chỗ này').toContain('123');
    } catch (error) {
      expect(error.message).toContain('email must be a valid email');
    }
  });
  test('#18: Update level thành công', async () => {
    const updateLawyerRes = await getSDK(adminToken).adminUpdateLawyer({
      id: `${lawyer[0].id}`,
      data: {
        fullName: faker.commerce.productMaterial() + Math.random(),
        phoneNumber: makeId(),
        masterDataIds: [`${masterData[0].id}`, `${masterData[1].id}`],
        level: '3',
      },
    });
    const lawyerRes = await getSDK(adminToken).getLawyers();
    expect(lawyerRes.adminGetAllLawyer.items.find((i) => i.id === `${lawyer[0].id}`).level).toBe('3');
  });
  test('#19: Update level =null', async () => {
    const updateLawyerRes = await getSDK(adminToken).adminUpdateLawyer({
      id: `${lawyer[0].id}`,
      data: {
        fullName: faker.commerce.productMaterial() + Math.random(),
        phoneNumber: makeId(),
        masterDataIds: [`${masterData[0].id}`, `${masterData[1].id}`],
        level: '',
      },
    });
    const lawyerRes = await getSDK(adminToken).getLawyers();
    expect(lawyerRes.adminGetAllLawyer.items.find((i) => i.id === `${lawyer[0].id}`).level).toBe('');
  });
  test('#20: Update school thành công', async () => {
    const updateLawyerRes = await getSDK(adminToken).adminUpdateLawyer({
      id: `${lawyer[0].id}`,
      data: {
        fullName: faker.commerce.productMaterial() + Math.random(),
        phoneNumber: makeId(),
        masterDataIds: [`${masterData[0].id}`, `${masterData[1].id}`],
        school: 'HVKTMM',
      },
    });
    const lawyerRes = await getSDK(adminToken).getLawyers();
    expect(lawyerRes.adminGetAllLawyer.items.find((i) => i.id === `${lawyer[0].id}`).school).toBe('HVKTMM');
  });
  test('#21: Update school=null', async () => {
    const updateLawyerRes = await getSDK(adminToken).adminUpdateLawyer({
      id: `${lawyer[0].id}`,
      data: {
        fullName: faker.commerce.productMaterial() + Math.random(),
        phoneNumber: makeId(),
        masterDataIds: [`${masterData[0].id}`, `${masterData[1].id}`],
        school: '',
      },
    });
    const lawyerRes = await getSDK(adminToken).getLawyers();
    expect(lawyerRes.adminGetAllLawyer.items.find((i) => i.id === `${lawyer[0].id}`).school).toBe('');
  });
  test('#22: Update jobTitle thành công', async () => {
    const updateLawyerRes = await getSDK(adminToken).adminUpdateLawyer({
      id: `${lawyer[0].id}`,
      data: {
        fullName: faker.commerce.productMaterial() + Math.random(),
        phoneNumber: makeId(),
        masterDataIds: [`${masterData[0].id}`, `${masterData[1].id}`],
        jobTitle: 'luat su',
      },
    });
    const lawyerRes = await getSDK(adminToken).getLawyers();
    expect(lawyerRes.adminGetAllLawyer.items.find((i) => i.id === `${lawyer[0].id}`).jobTitle).toBe('luat su');
  });
  test('#23: Update jobTitle=null', async () => {
    const updateLawyerRes = await getSDK(adminToken).adminUpdateLawyer({
      id: `${lawyer[0].id}`,
      data: {
        fullName: faker.commerce.productMaterial() + Math.random(),
        phoneNumber: makeId(),
        masterDataIds: [`${masterData[0].id}`, `${masterData[1].id}`],
        jobTitle: '',
      },
    });
    const lawyerRes = await getSDK(adminToken).getLawyers();
    expect(lawyerRes.adminGetAllLawyer.items.find((i) => i.id === `${lawyer[0].id}`).jobTitle).toBe('');
  });
  test('#24: Update company thành công', async () => {
    const updateLawyerRes = await getSDK(adminToken).adminUpdateLawyer({
      id: `${lawyer[0].id}`,
      data: {
        fullName: faker.commerce.productMaterial() + Math.random(),
        phoneNumber: makeId(),
        masterDataIds: [`${masterData[0].id}`, `${masterData[1].id}`],
        company: 'company',
      },
    });
    const lawyerRes = await getSDK(adminToken).getLawyers();
    expect(lawyerRes.adminGetAllLawyer.items.find((i) => i.id === `${lawyer[0].id}`).company).toBe('company');
  });
  test('#25: Update company=null', async () => {
    const updateLawyerRes = await getSDK(adminToken).adminUpdateLawyer({
      id: `${lawyer[0].id}`,
      data: {
        fullName: faker.commerce.productMaterial() + Math.random(),
        phoneNumber: makeId(),
        masterDataIds: [`${masterData[0].id}`, `${masterData[1].id}`],
        company: '',
      },
    });
    const lawyerRes = await getSDK(adminToken).getLawyers();
    expect(lawyerRes.adminGetAllLawyer.items.find((i) => i.id === `${lawyer[0].id}`).company).toBe('');
  });
  test('#26: Update address thành công', async () => {
    const updateLawyerRes = await getSDK(adminToken).adminUpdateLawyer({
      id: `${lawyer[0].id}`,
      data: {
        fullName: faker.commerce.productMaterial() + Math.random(),
        phoneNumber: makeId(),
        masterDataIds: [`${masterData[0].id}`, `${masterData[1].id}`],
        address: 'HN',
      },
    });
    const lawyerRes = await getSDK(adminToken).getLawyers();
    expect(lawyerRes.adminGetAllLawyer.items.find((i) => i.id === `${lawyer[0].id}`).address).toBe('HN');
  });
  test('#27: Update address=null', async () => {
    const updateLawyerRes = await getSDK(adminToken).adminUpdateLawyer({
      id: `${lawyer[0].id}`,
      data: {
        fullName: faker.commerce.productMaterial() + Math.random(),
        phoneNumber: makeId(),
        masterDataIds: [`${masterData[0].id}`, `${masterData[1].id}`],
        address: '',
      },
    });
    const lawyerRes = await getSDK(adminToken).getLawyers();
    expect(lawyerRes.adminGetAllLawyer.items.find((i) => i.id === `${lawyer[0].id}`).address).toBe('');
  });
  test('#28: Update experience thành công', async () => {
    const updateLawyerRes = await getSDK(adminToken).adminUpdateLawyer({
      id: `${lawyer[0].id}`,
      data: {
        fullName: faker.commerce.productMaterial() + Math.random(),
        phoneNumber: makeId(),
        masterDataIds: [`${masterData[0].id}`, `${masterData[1].id}`],
        experience: 5,
      },
    });
    const lawyerRes = await getSDK(adminToken).getLawyers();
    expect(lawyerRes.adminGetAllLawyer.items.find((i) => i.id === `${lawyer[0].id}`).experience).toBe(5);
  });
  // test('#29: Update experience=null', async () => {
  //   const updateLawyerRes = await getSDK(adminToken).adminUpdateLawyer({
  //     id: `${lawyer[0].id}`,
  //     data: {
  //       fullName: faker.commerce.productMaterial() + Math.random(),
  //       phoneNumber: makeId(),
  //       masterDataIds: [`${masterData[0].id}`, `${masterData[1].id}`],
  //       experience: null,
  //     },
  //   });
  //   const lawyerRes = await getSDK(adminToken).getLawyers();
  //   expect(lawyerRes.adminGetAllLawyer.items.find((i) => i.id === `${lawyer[0].id}`).email).toBe(null);
  // });

  test('#30: Update experience < 0', async () => {
    try {
      const updateLawyerRes = await getSDK(adminToken).adminUpdateLawyer({
        id: `${lawyer[0].id}`,
        data: {
          fullName: faker.commerce.productMaterial() + Math.random(),
          phoneNumber: makeId(),
          masterDataIds: [`${masterData[0].id}`, `${masterData[1].id}`],
          experience: -1,
        },
      });
      expect('Hiển thị lỗi').toContain('123');
    } catch (error) {
      expect(error.message).toContain('123');
    }
  });

  test('#31: Update description thành công', async () => {
    const updateLawyerRes = await getSDK(adminToken).adminUpdateLawyer({
      id: `${lawyer[0].id}`,
      data: {
        fullName: faker.commerce.productMaterial() + Math.random(),
        phoneNumber: makeId(),
        masterDataIds: [`${masterData[0].id}`, `${masterData[1].id}`],
        description: 'hihi',
      },
    });
    const lawyerRes = await getSDK(adminToken).getLawyers();
    expect(lawyerRes.adminGetAllLawyer.items.find((i) => i.id === `${lawyer[0].id}`).description).toBe('hihi');
  });
  test('#32: Update description=null', async () => {
    const updateLawyerRes = await getSDK(adminToken).adminUpdateLawyer({
      id: `${lawyer[0].id}`,
      data: {
        fullName: faker.commerce.productMaterial() + Math.random(),
        phoneNumber: makeId(),
        masterDataIds: [`${masterData[0].id}`, `${masterData[1].id}`],
        description: '',
      },
    });
    const lawyerRes = await getSDK(adminToken).getLawyers();
    expect(lawyerRes.adminGetAllLawyer.items.find((i) => i.id === `${lawyer[0].id}`).description).toBe('');
  });
});
