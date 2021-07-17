import { getRepository } from 'typeorm';
import { MasterDataEntity } from '@database/entities/MasterDataEntity';
import { MasterData, MasterDataStatus } from '@graphql/types/generated-graphql-types';
import { dateNow } from '@utils/date';
import faker from 'faker/locale/vi';

export const makeMasterData = async (count: number ) => {
  const masterDataRepo = getRepository(MasterDataEntity);

  const masterData: MasterDataEntity[] = []
  for(let i =  0; i < count; i++ ){
    masterData.push(masterDataRepo.create({ category:`${faker.commerce.productMaterial()}-${Math.random()}`,
    value:`${faker.commerce.productMaterial()}-${Math.random()}`,
    status: i !==4 ?MasterDataStatus.ACTIVE:MasterDataStatus.INACTIVE, 
    createdAt: dateNow(),
    updatedAt: dateNow(),
    createdById: 1,

  }))
  }
  return masterDataRepo.save(masterData);
};
