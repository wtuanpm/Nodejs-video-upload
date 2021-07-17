import { makeMasterData } from '@/__test__/data/master-data';
import { getAdminAccessToken } from '@/__test__/helpers/auth';
import { delay } from '@/__test__/helpers/delay';
import { recreateDatabase } from '@/__test__/utils/databaseConnection';
import { getSDK } from '@/__test__/utils/graphqlSDK';
import { MasterDataEntity } from '@database/entities/MasterDataEntity';
import { seedAdmin } from '@utils/seeding';
import faker from 'faker/locale/vi';

describe('CREATE QUESTION MODULE', () => {
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
  test('#1: Tạo câu hỏi thành công', async () => {
    const createQuestionRes = await getSDK(adminToken).createQuestion({
      data: {
        title: 'title',
        content: 'content',
        masterDataId: `${masterData[0].id}`,
      },
    });
    expect(createQuestionRes.createQuestion.id).toBeDefined();
    expect(createQuestionRes.createQuestion.title).toContain('title');
    expect(createQuestionRes.createQuestion.content).toContain('content');
    expect(createQuestionRes.createQuestion.masterData.id).toBe(`${masterData[0].id}`);
  });

  test('#1: Câu hỏi hiển thị lên đàu danh sách khi vừa tạo', async () => {
    await delay(1000);
    const createQuestionRes = await getSDK(adminToken).createQuestion({
      data: {
        title: 'title',
        content: 'content',
        masterDataId: `${masterData[0].id}`,
      },
    });
    const questionRes = await getSDK(adminToken).getAllQuestions();
    expect(createQuestionRes.createQuestion.id).toBe(questionRes.adminGetAllQuestion.items[0].id);
  });

  test('#2: Tạo câu hỏi với title null', async () => {
    try {
      await getSDK(adminToken).createQuestion({
        data: {
          title: '',
          content: 'content',
          masterDataId: `${masterData[0].id}`,
        },
      });
      expect('Hiển thị lỗi ở đây').toContain('123');
    } catch (error) {
      expect(error.message).toContain('is a required field');
    }
  });

  test('#2: Tạo câu hỏi với content null', async () => {
    try {
      await getSDK(adminToken).createQuestion({
        data: {
          title: 'title',
          content: '',
          masterDataId: `${masterData[0].id}`,
        },
      });
      expect('Hiển thị lỗi ở đây').toContain('123');
    } catch (error) {
      expect(error.message).toContain('is a required field');
    }
  });
  test('#2: Tạo câu hỏi với masterDataId không tồn tại', async () => {
    try {
      await getSDK(adminToken).createQuestion({
        data: {
          title: 'title',
          content: '',
          masterDataId: `10000`,
        },
      });
      expect('Hiển thị lỗi ở đây').toContain('123');
    } catch (error) {
      expect(error.message).toContain('Cannot add or update a child row');
    }
  });

  test('#2: Tạo câu hỏi với masterDataId đang INACTIVE', async () => {
    try {
      const masterRes = await getSDK(adminToken).getMasterData();
      let idMasterData = masterRes.adminGetAllMasterData.items.find((i) => i.status === 'INACTIVE').id;
      await getSDK(adminToken).createQuestion({
        data: {
          title: 'title',
          content: '',
          masterDataId: idMasterData,
        },
      });
      expect('Hiển thị lỗi ở đây').toContain('123');
    } catch (error) {
      expect(error.message).toContain('không tồn tại');
    }
  });
});
