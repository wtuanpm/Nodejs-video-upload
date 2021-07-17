import { VideoPreset } from '@constants/enum';

export interface TakeVideoScreenshotsPayload {
  mediaId: number;
  videoDir: string;
  folderDir: string;
  filename: string;
}

export interface HandleVideoResolutionsPaylaod {
  mediaId: number;
  folderDir: string;
  filename: string;
  videoPath: string;
  preset: VideoPreset;
}
