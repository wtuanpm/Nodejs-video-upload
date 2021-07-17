import { getRepository } from 'typeorm';
import { MasterDataEntity } from '@database/entities/MasterDataEntity';
import { LawyerStatus, MasterData, MasterDataStatus } from '@graphql/types/generated-graphql-types';
import { dateNow } from '@utils/date';
import { makeMasterData } from './master-data';
import { LawyerMasterDataEntity } from '@database/entities/LawyerMasterDataEntity';
import { create } from 'ts-node';
import { makeLawyer } from './lawyer';

export const makeLawyerData = async (count: number) => {
  const lawyerRepoMasterData = getRepository(LawyerMasterDataEntity);
  const masterData = await makeMasterData(count);
  const lawyerData = await makeLawyer(count);
  const lawyers: LawyerMasterDataEntity[] = [];
  for (let i = 0; i < count; i++) {
    const data = masterData[i].id;
    const dataLawyer = lawyerData[i].id;
    // lawyers.push(
    //   lawyerRepoMasterData.create({
    //     masterDataId: data,
    //     lawyerId: dataLawyer,
    //     createdAt: dateNow(),
    //     updatedAt: dateNow(),
    //   }),
    // );
    lawyerRepoMasterData.save([{ masterDataId: data, lawyerId: dataLawyer, status: i !== 4 ? LawyerStatus.ACTIVE : LawyerStatus.INACTIVE, createdAt: dateNow(), updatedAt: dateNow() }]);
  }
  return {
    masterData,
    lawyers,
  };
};
