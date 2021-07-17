import { getRepository } from 'typeorm';
import { LawyerStatus, MasterData, MasterDataStatus } from '@graphql/types/generated-graphql-types';
import { dateNow } from '@utils/date';
import faker from 'faker/locale/vi';
import { LawyerEntity } from '@database/entities/LawyerEntity';
import { create } from 'ts-node';

export const makeLawyer = async (count: number) => {
  const lawyerRepo = getRepository(LawyerEntity);
  const lawyerData: LawyerEntity[] = [];
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
    lawyerData.push(
      lawyerRepo.create({
        fullName: `${faker.commerce.productMaterial()}-${Math.random()}`,
        phoneNumber: makeId(),
        email: `${faker.commerce.productMaterial()}-${Math.random()}` + '@gmail.com',
        status: i !== 4 ? LawyerStatus.ACTIVE : LawyerStatus.INACTIVE,
        company: `${faker.commerce.productMaterial()}-${Math.random()}`,
        createdAt: dateNow(),
        updatedAt: dateNow(),
        createdById: 1,
      }),
    );
  }
  return lawyerRepo.save(lawyerData);
};
