import { makeMasterData } from './master-data';
import faker from 'faker/locale/vi';
import { getAdminAccessToken } from '../helpers/auth';
import { getSDK } from '../utils/graphqlSDK';
import { MasterDataEntity } from '@database/entities/MasterDataEntity';
import { seedAdmin } from '@utils/seeding';

export const makeLawyerLogin = async (count: number) => {
  jest.setTimeout(1000000);

  let masterData: MasterDataEntity[];
  let adminToken: string;
  await seedAdmin();
  adminToken = await getAdminAccessToken();
  masterData = await makeMasterData(count);
  function makeId() {
    var result = '';
    var characters = '0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 10; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  for (let i = 0; i < count; i++) {
    if (masterData[i].status !== 2) {
      await getSDK(adminToken).adminCreateLawyer({
        data: {
          fullName: `${faker.commerce.productMaterial()}-${Math.random()}`,
          masterDataIds: [`${masterData[i].id}`],
          phoneNumber: makeId(),
          email: `${faker.commerce.productMaterial()}-${Math.random()}` + '@gmail.com',
        },
      });
    }
  }
};
