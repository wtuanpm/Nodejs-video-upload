import { LawyerEntity } from '@database/entities/LawyerEntity';
import { LawyerMasterDataEntity } from '@database/entities/LawyerMasterDataEntity';
import { dateNow } from '@utils/date';
import { getRepository } from 'typeorm';

export const makeLawyerMasterData = (lawyerId: number, masterDataIds: number[]) => {
  //   const lawyerRepo = getRepository(LawyerEntity);
  const lawyerMasterDataRepo = getRepository(LawyerMasterDataEntity);

  const created: LawyerMasterDataEntity[] = [];
  masterDataIds.forEach((masterDataId) => {
    created.push(lawyerMasterDataRepo.create({ lawyerId, masterDataId, createdAt: dateNow(), updatedAt: dateNow() }));
  });

  return lawyerMasterDataRepo.save(created);
};
