import { makeArticle } from '@/__test__/data/article';
import { makeLawyer } from '@/__test__/data/lawyer';
import { makeLawyerData } from '@/__test__/data/lawyerData';
import { makeMasterData } from '@/__test__/data/master-data';
import { makeMedias } from '@/__test__/data/media';
import { getAdminAccessToken } from '@/__test__/helpers/auth';
import { delay } from '@/__test__/helpers/delay';
import { recreateDatabase } from '@/__test__/utils/databaseConnection';
import { getSDK } from '@/__test__/utils/graphqlSDK';
import { createMasterData } from '@business/admin';
import { ArticleEntity } from '@database/entities/ArticleEntity';
import { LawyerEntity } from '@database/entities/LawyerEntity';
import { LawyerMasterDataEntity } from '@database/entities/LawyerMasterDataEntity';
import { MasterDataEntity } from '@database/entities/MasterDataEntity';
import { PhotoEntity } from '@database/entities/PhotoEntity';
import { seedAdmin } from '@utils/seeding';
import faker from 'faker/locale/vi';
import { IsNull } from 'typeorm';
import { number } from 'yup';

describe('UPDATE ARTICLE MODULE', () => {
  // test data
  let masterData: MasterDataEntity[];
  let article: ArticleEntity[];
  let image: PhotoEntity[];
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
    article = await makeArticle(10);
    masterData = await makeMasterData(10);
    image = await makeMedias(10);
    adminToken = await getAdminAccessToken();
  }, 10000);

  test('#1: Update article thành công', async () => {
    const articleRes = await getSDK(adminToken).getAllArticle();
    let idArticeActive = articleRes.adminGetAllArticle.items.find((i) => i.status === 'ACTIVE').id;
    const updateArticleRes = await getSDK(adminToken).adminUpdateArticle({
      id: idArticeActive,
      data: {
        title: 'update title',
        note: 'update note',
        content: 'update content',
        masterDataId: `${masterData[1].id}`,
      },
    });
    const articleRes1 = await getSDK(adminToken).getAllArticle();
    expect(articleRes1.adminGetAllArticle.items.find((i) => i.id === idArticeActive).title).toBe('update title');
    expect(articleRes1.adminGetAllArticle.items.find((i) => i.id === idArticeActive).note).toBe('update note');
    expect(articleRes1.adminGetAllArticle.items.find((i) => i.id === idArticeActive).content).toBe('update content');
    expect(articleRes1.adminGetAllArticle.items.find((i) => i.id === idArticeActive).masterDataId).toBe(`${masterData[1].id}`);
  });

  test('#2: Bản log được tạo khi update', async () => {
    const articleRes = await getSDK(adminToken).getAllArticle();
    await getSDK(adminToken).adminUpdateArticle({
      id: `${article[0].id}`,
      data: {
        title: 'update title',
        note: 'update note',
        content: 'update content',
        masterDataId: `${masterData[1].id}`,
      },
    });
    const articleRes1 = await getSDK(adminToken).getAllArticle();
    expect(articleRes.adminGetAllArticle.items.find((i) => i.id === `${article[0].id}`).logs.length).toBe(articleRes1.adminGetAllArticle.items[0].logs.length - 1);
  });

  test('#3: Bản log được tạo hiển thị lên đầu khi update', async () => {
    await delay(1000);
    const articleRes = await getSDK(adminToken).getAllArticle();
    await getSDK(adminToken).adminUpdateArticle({
      id: `${article[0].id}`,
      data: {
        title: 'update title',
        note: 'update note',
        content: 'update content',
        masterDataId: `${masterData[1].id}`,
      },
    });
    const articleRes1 = await getSDK(adminToken).getAllArticle();
    expect(articleRes.adminGetAllArticle.items.find((i) => i.id === `${article[0].id}`).logs[0].createdAt).toBeLessThan(articleRes1.adminGetAllArticle.items[0].logs[0].createdAt);
  });

  test('#4: Update article có tilte = null', async () => {
    try {
      const articleRes = await getSDK(adminToken).getAllArticle();
      let idArticeActive = articleRes.adminGetAllArticle.items.find((i) => i.status === 'ACTIVE').id;
      const updateArticleRes = await getSDK(adminToken).adminUpdateArticle({
        id: idArticeActive,
        data: {
          title: '',
          note: 'update note',
          content: 'update content',
          masterDataId: `${masterData[1].id}`,
        },
      });
      expect('Hiển thị lỗi chỗ này').toContain('123');
    } catch (error) {
      expect(error.message).toContain('title is a required field');
    }
  });

  test('#5: Update article có tilte > 255 ký tự', async () => {
    try {
      const articleRes = await getSDK(adminToken).getAllArticle();
      let idArticeActive = articleRes.adminGetAllArticle.items.find((i) => i.status === 'ACTIVE').id;
      const updateArticleRes = await getSDK(adminToken).adminUpdateArticle({
        id: idArticeActive,
        data: {
          title: 'WordCounter360 ° là một truy cập các từ và các nhân vật trực tuyến và miễn phí. Nó là một công cụ để đếm có bao nhiêu ký tự, chữ cái, dấu hiệu, từ, câu và đoạn văn trong một văn bản. WordCounter360 ° cũng có thể đếm số lượng các ký tự và các từ trong ngôn  sda',
          note: 'update note',
          content: 'update content',
          masterDataId: `${masterData[1].id}`,
        },
      });
      expect('Hiển thị lỗi chỗ này').toContain('123');
    } catch (error) {
      expect(error.message).toContain('title must be at most 255 characters');
    }
  });

  test('#6: Update article có note = null', async () => {
    try {
      const articleRes = await getSDK(adminToken).getAllArticle();
      let idArticeActive = articleRes.adminGetAllArticle.items.find((i) => i.status === 'ACTIVE').id;
      const updateArticleRes = await getSDK(adminToken).adminUpdateArticle({
        id: idArticeActive,
        data: {
          title: 'update title',
          note: '',
          content: 'update content',
          masterDataId: `${masterData[1].id}`,
        },
      });
      expect('Hiển thị lỗi chỗ này').toContain('123');
    } catch (error) {
      expect(error.message).toContain('note is a required field');
    }
  });
  // test('#1: Update article có note > 255 ký tự', async () => {
  //   try {
  //     const articleRes = await getSDK(adminToken).getAllArticle();
  //     let idArticeActive = articleRes.adminGetAllArticle.items.find((i) => i.status === 'ACTIVE').id;
  //     const updateArticleRes = await getSDK(adminToken).adminUpdateArticle({
  //       id: idArticeActive,
  //       data: {
  //         note: 'WordCounter360 ° là một truy cập các từ và các nhân vật trực tuyến và miễn phí. Nó là một công cụ để đếm có bao nhiêu ký tự, chữ cái, dấu hiệu, từ, câu và đoạn văn trong một văn bản. WordCounter360 ° cũng có thể đếm số lượng các ký tự và các từ trong ngôn  sda',
  //         title: 'update note',
  //         content: 'update content',
  //         masterDataId: `${masterData[1].id}`,
  //       },
  //     });
  //     expect('Hiển thị lỗi chỗ này').toContain('123');
  //   } catch (error) {
  //     expect(error.message).toContain('note must be at most 255 characters');
  //   }
  // });

  test('#7: Update article có content = null', async () => {
    try {
      const articleRes = await getSDK(adminToken).getAllArticle();
      let idArticeActive = articleRes.adminGetAllArticle.items.find((i) => i.status === 'ACTIVE').id;
      const updateArticleRes = await getSDK(adminToken).adminUpdateArticle({
        id: idArticeActive,
        data: {
          title: 'update title',
          note: 'update note',
          content: '',
          masterDataId: `${masterData[1].id}`,
        },
      });
      expect('Hiển thị lỗi chỗ này').toContain('123');
    } catch (error) {
      expect(error.message).toContain('content is a required field');
    }
  });

  // test('#1: Update article có content > 255 ký tự', async () => {
  //   const articleRes = await getSDK(adminToken).getAllArticle();
  //   let idArticeActive = articleRes.adminGetAllArticle.items.find((i) => i.status === 'ACTIVE').id;
  //   await getSDK(adminToken).adminUpdateArticle({
  //     id: idArticeActive,
  //     data: {
  //       content: 'WordCounter360 ° là một truy cập các từ và các nhân vật trực tuyến và miễn phí. Nó là một công cụ để đếm có bao nhiêu ký tự, chữ cái, dấu hiệu, từ, câu và đoạn văn trong một văn bản. WordCounter360 ° cũng có thể đếm số lượng các ký tự và các từ trong ngôn  sda,WordCounter360 ° là một truy cập các từ và các nhân vật trực tuyến và miễn phí. Nó là một công cụ để đếm có bao nhiêu ký tự, chữ cái, dấu hiệu, từ, câu và đoạn văn trong một văn bản. WordCounter360 ° cũng có thể đếm số lượng các ký tự và các từ trong ngôn  sda',
  //       note: 'update note',
  //       title: 'update content',
  //       masterDataId: `${masterData[1].id}`,
  //     },
  //   });
  //   const articleRes1 = await getSDK(adminToken).getAllArticle();
  //   expect(articleRes1.adminGetAllArticle.items.find((i) => i.id === idArticeActive).content).toBe('WordCounter360 ° là một truy cập các từ và các nhân vật trực tuyến và miễn phí. Nó là một công cụ để đếm có bao nhiêu ký tự, chữ cái, dấu hiệu, từ, câu và đoạn văn trong một văn bản. WordCounter360 ° cũng có thể đếm số lượng các ký tự và các từ trong ngôn  sda,WordCounter360 ° là một truy cập các từ và các nhân vật trực tuyến và miễn phí. Nó là một công cụ để đếm có bao nhiêu ký tự, chữ cái, dấu hiệu, từ, câu và đoạn văn trong một văn bản. WordCounter360 ° cũng có thể đếm số lượng các ký tự và các từ trong ngôn  sda');
  // });

  // test('#1: Update article có masterData = null', async () => {
  //   try {
  //     const articleRes = await getSDK(adminToken).getAllArticle();
  //     let idArticeActive = articleRes.adminGetAllArticle.items.find((i) => i.status === 'ACTIVE').id;
  //     await getSDK(adminToken).adminUpdateArticle({
  //       id: idArticeActive,
  //       data: {
  //         title: 'update title',
  //         note: 'update note',
  //         content: 'update content',
  //         masterDataId: ' ',
  //       },
  //     });
  //     expect('Hiển thị lỗi chỗ này').toContain('123');
  //   } catch (error) {
  //     expect(error.message).toContain('Master data không tồn tại!');
  //   }
  // });

  test('#8: Update article có masterData có status INACTIVE', async () => {
    try {
      const articleRes = await getSDK(adminToken).getAllArticle();
      let idArticeActive = articleRes.adminGetAllArticle.items.find((i) => i.status === 'ACTIVE').id;
      const masterDataRes = await getSDK(adminToken).getMasterData();
      let idMasterData = masterDataRes.adminGetAllMasterData.items.find((i) => i.status === 'INACTIVE').id;
      await getSDK(adminToken).adminUpdateArticle({
        id: idArticeActive,
        data: {
          title: 'update title',
          note: 'update note',
          content: 'update content',
          masterDataId: idMasterData,
        },
      });
      expect('Hiển thị lỗi chỗ này').toContain('123');
    } catch (error) {
      expect(error.message).toContain('không tồn tại');
    }
  });

  test('#9: Update article có masterData không tồn tại', async () => {
    try {
      const articleRes = await getSDK(adminToken).getAllArticle();
      let idArticeActive = articleRes.adminGetAllArticle.items.find((i) => i.status === 'ACTIVE').id;
      await getSDK(adminToken).adminUpdateArticle({
        id: idArticeActive,
        data: {
          title: 'update title',
          note: 'update note',
          content: 'update content',
          masterDataId: '10000',
        },
      });
      expect('Hiển thị lỗi chỗ này').toContain('123');
    } catch (error) {
      expect(error.message).toContain('không tồn tại');
    }
  });
  test('#10: Update article có media', async () => {
    const articleRes = await getSDK(adminToken).getAllArticle();
    let idArticeActive = articleRes.adminGetAllArticle.items.find((i) => i.status === 'ACTIVE').id;
    const updateArticleRes = await getSDK(adminToken).adminUpdateArticle({
      id: idArticeActive,
      data: {
        title: 'update title',
        note: 'update note',
        content: 'content',
        masterDataId: `${masterData[1].id}`,
        photoId: `${image[7].id}`,
      },
    });
    const articleRes1 = await getSDK(adminToken).getAllArticle();
    expect(articleRes1.adminGetAllArticle.items.find((i) => i.id === idArticeActive).photoId).toBe(`${image[7].id}`);
    expect(articleRes1.adminGetAllArticle.items.find((i) => i.id === idArticeActive).photo.id).toBe(`${image[7].id}`);
  });

  test('#11: Update article có media =null', async () => {
    const articleRes = await getSDK(adminToken).getAllArticle();
    let idArticeActive = articleRes.adminGetAllArticle.items.find((i) => i.status === 'ACTIVE').id;
    const updateArticleRes = await getSDK(adminToken).adminUpdateArticle({
      id: idArticeActive,
      data: {
        title: 'update title',
        note: 'update note',
        content: 'content',
        masterDataId: `${masterData[1].id}`,
        photoId: null,
      },
    });
    const articleRes1 = await getSDK(adminToken).getAllArticle();
    expect(articleRes1.adminGetAllArticle.items.find((i) => i.id === idArticeActive).photoId).toBe(null);
    expect(articleRes1.adminGetAllArticle.items.find((i) => i.id === idArticeActive).photo).toBe(null);
  });
  test('#12: Update article có media không tồn tại', async () => {
    try {
      const articleRes = await getSDK(adminToken).getAllArticle();
      let idArticeActive = articleRes.adminGetAllArticle.items.find((i) => i.status === 'ACTIVE').id;
      const updateArticleRes = await getSDK(adminToken).adminUpdateArticle({
        id: idArticeActive,
        data: {
          title: 'update title',
          note: 'update note',
          content: 'content',
          masterDataId: `${masterData[1].id}`,
          photoId: '10000',
        },
      });
      expect('Hiển thị lỗi chỗ này').toContain('123');
    } catch (error) {
      expect(error.message).toBe('Photo không tồn tại!');
    }
  });
});
