import { makeLawyer } from '@/__test__/data/lawyer';
import { makeMasterData } from '@/__test__/data/master-data';
import { getAdminAccessToken } from '@/__test__/helpers/auth';
import { recreateDatabase } from '@/__test__/utils/databaseConnection';
import { getSDK } from '@/__test__/utils/graphqlSDK';
import { MasterDataEntity } from '@database/entities/MasterDataEntity';
import { PhotoEntity } from '@database/entities/PhotoEntity';
import { makeMedias } from '@/__test__/data/media';
import { delay } from '@/__test__/helpers/delay';
import { seedAdmin } from '@utils/seeding';

describe('CREATE ARTICLE', () => {
  // test data
  let masterData: MasterDataEntity[];
  let media: PhotoEntity[];
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
    masterData = await makeMasterData(10);
    media = await makeMedias(10);
    adminToken = await getAdminAccessToken();
  }, 10000);

  test('#1: Tạo article thành công', async () => {
    const createArticle = await getSDK(adminToken).adminCreateArticle({
      data: {
        title: 'title',
        note: 'note',
        content: 'content',
        masterDataId: `${masterData[0].id}`,
      },
    });
    expect(createArticle.adminCreateArticle.id).toBeDefined();
    expect(createArticle.adminCreateArticle.title).toBe('title');
    expect(createArticle.adminCreateArticle.note).toBe('note');
    expect(createArticle.adminCreateArticle.content).toBe('content');
    expect(createArticle.adminCreateArticle.masterData.id).toBe('1');
    expect(createArticle.adminCreateArticle.photo).toBe(null);
    expect(createArticle.adminCreateArticle.author).toBe(null);
  });

  test('#2: Bản ghi hiển thị đầu danh sách khi tạo', async () => {
    await delay(1000);
    const createArticle = await getSDK(adminToken).adminCreateArticle({
      data: {
        title: 'title',
        note: 'note',
        content: 'content',
        masterDataId: `${masterData[0].id}`,
      },
    });
    const articleRes = await getSDK(adminToken).getAllArticle();
    expect(articleRes.adminGetAllArticle.items[0].id).toBe(createArticle.adminCreateArticle.id);
  });

  test('#3: Tạo article có title null', async () => {
    try {
      const createArticle = await getSDK(adminToken).adminCreateArticle({
        data: {
          title: '',
          note: 'note',
          content: 'content',
          masterDataId: `${masterData[0].id}`,
        },
      });
      expect('Hiển thị lỗi chỗ này').toContain('123');
    } catch (error) {
      expect(error.message).toContain('title is a required field');
    }
  });

  // test('#1: Tạo article có title > 255 ký tự', async () => {
  //   try {
  //     const createArticle = await getSDK(adminToken).adminCreateArticle({
  //       data: {
  //         title: 'WordCounter360 ° là một truy cập các từ và các nhân vật trực tuyến và miễn phí. Nó là một công cụ để đếm có bao nhiêu ký tự, chữ cái, dấu hiệu, từ, câu và đoạn văn trong một văn bản. WordCounter360 ° cũng có thể đếm số lượng các ký tự và các từ trong ngôn  sda',
  //         note: 'note',
  //         content: 'content',
  //         masterDataId: `${masterData[0].id}`,
  //       },
  //     });
  //     expect('Hiển thị lỗi chỗ này').toContain('123');
  //   } catch (error) {
  //     expect(error.message).toContain('title must be at most 255 characters');
  //   }
  // });

  test('#4: Tạo article có note null', async () => {
    try {
      const createArticle = await getSDK(adminToken).adminCreateArticle({
        data: {
          title: 'title',
          note: '',
          content: 'content',
          masterDataId: `${masterData[0].id}`,
        },
      });
      expect('Hiển thị lỗi chỗ này').toContain('123');
    } catch (error) {
      expect(error.message).toContain('note is a required field');
    }
  });

  // test('#1: Tạo article có note > 255 ký tự', async () => {
  //   try {
  //     const createArticle = await getSDK(adminToken).adminCreateArticle({
  //       data: {
  //         note: 'WordCounter360 ° là một truy cập các từ và các nhân vật trực tuyến và miễn phí. Nó là một công cụ để đếm có bao nhiêu ký tự, chữ cái, dấu hiệu, từ, câu và đoạn văn trong một văn bản. WordCounter360 ° cũng có thể đếm số lượng các ký tự và các từ trong ngôn  sda',
  //         title: 'note',
  //         content: 'content',
  //         masterDataId: `${masterData[0].id}`,
  //       },
  //     });
  //     expect('Hiển thị lỗi chỗ này').toContain('123');
  //   } catch (error) {
  //     expect(error.message).toContain('note must be at most 255 characters');
  //   }
  // });

  test('#5: Tạo article có content null', async () => {
    try {
      const createArticle = await getSDK(adminToken).adminCreateArticle({
        data: {
          title: 'title',
          note: 'note',
          content: '',
          masterDataId: `${masterData[0].id}`,
        },
      });
      expect('Hiển thị lỗi chỗ này').toContain('123');
    } catch (error) {
      expect(error.message).toContain('content is a required field');
    }
  });

  // test('#1: Tạo article có content > 255 ký tự', async () => {
  //   const createArticle = await getSDK(adminToken).adminCreateArticle({
  //     data: {
  //       content: 'WordCounter360 êu ký tự, chữ cái, dấu hiệu, từ, câu và đoạn văn trong một văn bản. WordCounter360 ° cũng có thể đếm số lượng các ký tự và các từ trong ngôn  sda WordCounter360 ° là một truy cập các từ và các nhân vật trực tuyến và miễn phí. Nó là một công cụ để đếm có bao nhiêu ký tự, chữ cái, dấu hiệu, từ, câu và đoạn văn trong một văn bản. WordCounter360 ° cũng có thể đếm số lượng các ký tự và các từ trong ngôn  sda',
  //       title: 'note',
  //       note: 'content',
  //       masterDataId: `${masterData[0].id}`,
  //     },
  //   });
  //   expect(createArticle.adminCreateArticle.content).toBe('WordCounter360 ° là một truy cập các từ và các nhân vật trực tuyến và miễn phí. Nó là một công cụ để đếm có bao nhiêu ký tự, chữ cái, dấu hiệu, từ, câu và đoạn văn trong một văn bản. WordCounter360 ° cũng có thể đếm số lượng các ký tự và các từ trong ngôn  sda WordCounter360 ° là một truy cập các từ và các nhân vật trực tuyến và miễn phí. Nó là một công cụ để đếm có bao nhiêu ký tự, chữ cái, dấu hiệu, từ, câu và đoạn văn trong một văn bản. WordCounter360 ° cũng có thể đếm số lượng các ký tự và các từ trong ngôn  sda');
  // });

  // test('#1: Tạo article có masterDataId = null', async () => {
  //   try {
  //     await getSDK(adminToken).adminCreateArticle({
  //       data: {
  //         title: 'title',
  //         note: 'note',
  //         content: 'content',
  //         masterDataId: ``,
  //       },
  //     });
  //     expect('Hiển thị lỗi chỗ này').toContain('123');
  //   } catch (error) {
  //     expect(error.message).toContain('Master data không tồn tại!');
  //   }
  // });

  test('#6: Tạo article có masterDataId = deactive', async () => {
    try {
      const masterDataRes = await getSDK(adminToken).getMasterData();
      let idMasterData = masterDataRes.adminGetAllMasterData.items.find((i) => i.status === 'INACTIVE').id;
      const createArticle = await getSDK(adminToken).adminCreateArticle({
        data: {
          title: 'title',
          note: 'note',
          content: 'content',
          masterDataId: idMasterData,
        },
      });
      expect('Hiển thị lỗi chỗ này').toContain('123');
    } catch (error) {
      expect(error.message).toContain('Giá trị không tồn tại trong danh mục');
    }
  });

  test('#7: Tạo article có masterDataId không tồn tại', async () => {
    try {
      const createArticle = await getSDK(adminToken).adminCreateArticle({
        data: {
          title: 'title',
          note: 'note',
          content: 'content',
          masterDataId: '1000',
        },
      });
      expect('Hiển thị lỗi chỗ này').toContain('123');
    } catch (error) {
      expect(error.message).toContain('Giá trị không tồn tại trong danh mục');
    }
  });

  test('#8: Tạo article có author', async () => {
    const createArticle = await getSDK(adminToken).adminCreateArticle({
      data: {
        title: 'title',
        note: 'note',
        content: 'content',
        masterDataId: `${masterData[0].id}`,
        author: 'author',
      },
    });
    expect(createArticle.adminCreateArticle.id).toBeDefined();
    expect(createArticle.adminCreateArticle.title).toBe('title');
    expect(createArticle.adminCreateArticle.note).toBe('note');
    expect(createArticle.adminCreateArticle.content).toBe('content');
    expect(createArticle.adminCreateArticle.masterData.id).toBe('1');
    expect(createArticle.adminCreateArticle.photo).toBe(null);
    expect(createArticle.adminCreateArticle.author).toBe('author');
  });
  test('#9: Tạo article có image', async () => {
    const createArticle = await getSDK(adminToken).adminCreateArticle({
      data: {
        title: 'title',
        note: 'note',
        content: 'content',
        masterDataId: `${masterData[0].id}`,
        photoId: `${media[0].id}`,
      },
    });
    expect(createArticle.adminCreateArticle.id).toBeDefined();
    expect(createArticle.adminCreateArticle.title).toBe('title');
    expect(createArticle.adminCreateArticle.note).toBe('note');
    expect(createArticle.adminCreateArticle.content).toBe('content');
    expect(createArticle.adminCreateArticle.masterData.id).toBe('1');
    expect(createArticle.adminCreateArticle.photoId).toBeDefined();
    expect(createArticle.adminCreateArticle.photo.id).toBe('1');
  });
  test('#10: Thực hiện trimspace title', async () => {
    const createArticle = await getSDK(adminToken).adminCreateArticle({
      data: {
        title: ' title ',
        note: 'note',
        content: 'content',
        masterDataId: `${masterData[0].id}`,
      },
    });
    expect(createArticle.adminCreateArticle.id).toBeDefined();
    expect(createArticle.adminCreateArticle.title).toBe('title');
  });

  test('#11: Thực hiện trimspace content', async () => {
    const createArticle = await getSDK(adminToken).adminCreateArticle({
      data: {
        title: ' title ',
        note: ' note ',
        content: ' content ',
        masterDataId: `${masterData[0].id}`,
      },
    });
    expect(createArticle.adminCreateArticle.id).toBeDefined();
    expect(createArticle.adminCreateArticle.content).toBe('content');
  });

  test('#12: Thực hiện trimspace note', async () => {
    const createArticle = await getSDK(adminToken).adminCreateArticle({
      data: {
        title: ' title ',
        note: ' note ',
        content: ' content ',
        masterDataId: `${masterData[0].id}`,
      },
    });
    expect(createArticle.adminCreateArticle.id).toBeDefined();
    expect(createArticle.adminCreateArticle.note).toBe('note');
  });

  test('#13: Thực hiện trimspace author', async () => {
    const createArticle = await getSDK(adminToken).adminCreateArticle({
      data: {
        title: ' title ',
        note: ' note ',
        content: ' content ',
        author: ' author ',
        masterDataId: `${masterData[0].id}`,
      },
    });
    expect(createArticle.adminCreateArticle.id).toBeDefined();
    expect(createArticle.adminCreateArticle.author).toBe('author');
  });
});
