import { MutationResolvers, ErrorCodes, MediaType, MediaStatus, VideoPreset } from '@graphql/types/generated-graphql-types';
import { allowedPhotoType, allowedVideoType } from '@utils/helpers';
import mkdirp from 'mkdirp';
import { makeGraphqlError } from '@utils/error';
import { MediaEntity } from '@database/entities/MediaEntity';
import { createWriteStream, unlink } from 'fs';
import { createMedia } from '@business/media';
import Queues from '@services/worker/typed-queue';
import { getVideoMeta, makeSlug } from '@utils/upload';
import env from '@/env';

export const uploadMedia: MutationResolvers['uploadMedia'] = async (_, { upload }, { auth }) => {
  const { createReadStream, filename: _filename, mimetype } = await upload;

  const stream = createReadStream();
  const { metaData } = auth;

  let uploadType: 'VIDEO' | 'IMAGE' | null = null;
  let rootDir: string = null;
  if (allowedPhotoType(mimetype)) {
    uploadType = 'IMAGE';
    rootDir = env.imageDir;
  } else if (allowedVideoType(mimetype)) {
    uploadType = 'VIDEO';
    rootDir = env.videoDir;
  }

  if (!uploadType) {
    throw makeGraphqlError('Not allowed mime type', ErrorCodes.BadUserInput);
  }

  const folderDir = `${new Date().getFullYear()}/${new Date().getMonth() + 1}/${new Date().getDate()}/${new Date().getTime()}`;

  const filename = makeSlug(_filename);
  await mkdirp(`${rootDir}/${folderDir}`);
  const mediaDir = `${rootDir}/${folderDir}/${filename}`;

  const media: MediaEntity = await new Promise((resolve, reject) => {
    const writeStream = createWriteStream(mediaDir);

    writeStream.on('finish', async () => {
      let createData = {
        createdBy: metaData.nameOfUser,
        path: `${folderDir}/${filename}`,
        fileName: filename,
        fileType: mimetype,
        type: MediaType.PHOTO,
        status: MediaStatus.READY,
        duration: undefined,
        size: undefined,
        title: filename,
      };

      if (uploadType === 'VIDEO') {
        const { duration, size } = await getVideoMeta(mediaDir);
        createData.type = MediaType.VIDEO;
        createData.status = MediaStatus.PROCESSING;
        createData.duration = duration;
        createData.size = size;
      }

      const media = await createMedia(createData);
      if (media.type === MediaType.VIDEO) {
        // take video screenshots
        Queues.takeVideoScreenshots.add({ mediaId: media.id, videoDir: mediaDir, folderDir, filename });

        // handle video resolutions
        [VideoPreset.Video1080P, VideoPreset.Video720P, VideoPreset.Video480P, VideoPreset.Video360P].forEach((value, index) => {
          const preset = Number(value);
          Queues.handleVideoResolutions.add({ filename, folderDir, mediaId: media.id, videoPath: mediaDir, preset });
        });
      }

      resolve(media);
    });

    writeStream.on('error', (error) => {
      unlink(`${mediaDir}`, () => {
        reject(error);
      });
    });

    stream.on('error', (error) => writeStream.destroy(error));
    stream.pipe(writeStream);
  });

  return media;
};
