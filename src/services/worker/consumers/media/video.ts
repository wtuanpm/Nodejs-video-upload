import { Job, DoneCallback } from 'bull';
import { TakeVideoScreenshotsPayload, HandleVideoResolutionsPaylaod } from './type';
import { getRepository } from 'typeorm';
import { MediaEntity } from '@database/entities/MediaEntity';
import ffmpeg from 'fluent-ffmpeg';
import env from '@/env';
import mkdir from 'mkdirp';
import { MediaStatus } from '@constants/enum';
import { ScreenShot, VideoProfile, VideoPreset } from '@graphql/types/generated-graphql-types';

export const takeVideoScreenshotsListener = async (job: Job<TakeVideoScreenshotsPayload>, done: DoneCallback) => {
  try {
    const mediaRepo = getRepository(MediaEntity);
    const { mediaId, videoDir, folderDir, filename } = job.data;
    const media = await mediaRepo.findOne({ id: mediaId });
    if (!mediaId) {
      done();
    }

    const { videoProfiles } = media;

    const screenshotsDir = `${env.imageDir}/${folderDir}/screenshots`;

    await mkdir(screenshotsDir);

    const count = 3;
    const timestamps = [];
    const startPositionPercent = 5;
    const endPositionPercent = 95;
    const addPercent = (endPositionPercent - startPositionPercent) / (count - 1);
    let i = 0;

    const screenShotsPath: ScreenShot[] = [];

    if (!timestamps.length) {
      let i = 0;
      while (i < count) {
        timestamps.push(`${startPositionPercent + addPercent * i}%`);
        i = i + 1;
      }
    }

    const takeScreenshots = (mediaDir: string) => {
      ffmpeg(mediaDir)
        .on('start', () => {
          if (i < 1) {
            console.log(`start taking screenshots`);
          }
        })
        .on('end', async () => {
          i = i + 1;
          screenShotsPath.push({ path: `${folderDir}/screenshots/${filename}-${i}.jpg` });

          if (i < count) {
            takeScreenshots(mediaDir);
          } else {
            let status = MediaStatus.READY;
            if (!videoProfiles || videoProfiles.length < 4) {
              status = MediaStatus.PROCESSING;
            }

            await mediaRepo.update({ id: mediaId }, { screenshots: screenShotsPath, status });
            done();
          }
        })
        .screenshots(
          {
            count: 1,
            timemarks: [timestamps[i]],
            filename: `${filename}-${i + 1}.jpg`,
          },
          screenshotsDir,
        );
    };

    takeScreenshots(videoDir);
  } catch (err) {
    done(err);
  }
};

export const handleVideoResolutionsListenser = async (job: Job<HandleVideoResolutionsPaylaod>, done: DoneCallback) => {
  try {
    const { filename, folderDir, mediaId, videoPath, preset: _presetValue } = job.data;
    const mediaRepo = getRepository(MediaEntity);

    const _filename = filename.split('.')[0];
    const videoThumbDir = `${env.videoDir}/${folderDir}/resolutions`;
    await mkdir(videoThumbDir);
    const { dimension, resolution } = getVideoDimension(_presetValue);
    if (!dimension || !resolution) {
      done();
    }

    const output = `${videoThumbDir}/${_filename}-${resolution}.mp4`;
    const path = `${folderDir}/resolutions/${_filename}-${resolution}.mp4`;

    ffmpeg(videoPath)
      .on('start', () => {
        console.log('start handle video preset');
      })

      // 1920 x 1080
      .output(output)
      .videoCodec('libx264')
      .size(dimension)
      .on('error', function (error) {
        done(error);
      })

      .on('progress', function (progress) {
        console.log('... frames: ' + progress.frames);
      })
      .on('end', async function (something) {
        console.log('Finished processing', something);
        const media = await mediaRepo.findOne({ where: { id: mediaId } });
        if (!media) {
          done();
        }

        const { videoProfiles: _videoProfiles, screenshots } = media;
        const videoProfiles = _videoProfiles ? _videoProfiles : [];

        let status = MediaStatus.READY;
        if (!screenshots || !videoProfiles || videoProfiles.length < 3) {
          status = MediaStatus.PROCESSING;
        }

        videoProfiles.push({ path, preset: _presetValue });
        await mediaRepo.update({ id: mediaId }, { status, videoProfiles });

        done();
      })
      .run();
  } catch (err) {
    done(err);
  }
};

const getVideoDimension = (preset: VideoPreset) => {
  switch (preset) {
    case VideoPreset.Video360P:
      return {
        dimension: '640x360',
        resolution: '360p',
      };
    case VideoPreset.Video480P:
      return {
        dimension: '854x480',
        resolution: '480p',
      };
    case VideoPreset.Video720P:
      return {
        dimension: '1280x720',
        resolution: '720p',
      };
    case VideoPreset.Video1080P:
      return {
        dimension: '1920x1080',
        resolution: '1080p',
      };
    default:
      return {};
  }
};
