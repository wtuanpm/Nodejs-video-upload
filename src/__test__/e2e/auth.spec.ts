import { recreateDatabase } from '../utils/databaseConnection';
import { getSDK } from '../utils/graphqlSDK';
import { seedAdmin } from '@utils/seeding';

describe('AUTH MODULE', () => {
  // test data
  jest.setTimeout(10000);
  beforeAll(async () => {
    await recreateDatabase();
    await seedAdmin();
    // await masterData([{category:'cat1', }])
  });

  test('#1 Đăng nhập vào admin thành công', async () => {
    const res = await getSDK().adminLogin({
      data: {
        email: 'admin@comartek.com',
        password: 'admin@123',
      },
    });
    // expect(res.adminLogin.token).toBeUndefined();
    expect(res.adminLogin.uid).toBe('1');
  });

  test('#2 Đăng nhập vào admin với mật khẩu k chính xác', async () => {
    try {
      const res = await getSDK().adminLogin({
        data: {
          email: 'admin@comartek.com',
          password: 'admin@1234',
        },
      });
      expect('Hiển thị lỗi').toBe('1');
    } catch (error) {
      expect(error.message).toContain('Tài khoản hoặc mật khẩu không chính xác!');
    }
  });

  test('#3 Đăng nhập vào admin với email k chính xác', async () => {
    try {
      const res = await getSDK().adminLogin({
        data: {
          email: 'admin@comartek.comn',
          password: 'admin@123',
        },
      });
      expect('Hiển thị lỗi').toBe('1');
    } catch (error) {
      expect(error.message).toContain('Tài khoản hoặc mật khẩu không chính xác!');
    }
  });
});
