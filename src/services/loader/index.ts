import { createEntityLoader } from './buildLoader';
import { MediaEntity } from '@database/entities/MediaEntity';

const createLoaders = (options?: { cache?: boolean }) => ({
  media: createEntityLoader(MediaEntity)(options),
});

const createLoadersWithCache = (options?: any) => ({
  //   lawyersByAccountId: createLawyersLoaderByAccountId(options),
  //   customersByAccountId: createCusomterLoaderByAccountId(options),
});

export default createLoaders({ cache: false });
