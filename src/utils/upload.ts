import StreamToBuffer from 'stream-to-buffer';
import ImageMin from 'imagemin';
import MozJpeg from 'imagemin-mozjpeg';
const ffmpeg = require('fluent-ffmpeg');

export function arrayBufferToBufferCycle(ab: any) {
  let buffer = new Buffer(ab.length);
  let view = new Uint8Array(ab);

  const length = buffer.length;
  let i = 0;
  for (i; i < length; ++i) {
    buffer[i] = view[i];
  }
  return Buffer.from(buffer);
}

export function streamToBuffer(stream: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    StreamToBuffer(stream, (err: typeof Error, buffer: Buffer) => {
      if (err) return reject(err);
      resolve(buffer);
    });
  });
}

export const resizeImageBuffer = async (buffer: Buffer) => {
  return ImageMin.buffer(buffer, {
    plugins: [MozJpeg({ quality: 40 })],
  });
};

export const getVideoMeta = async (videoDir: string): Promise<{ duration: number; size: number }> => {
  return new Promise((resovle, reject) => {
    try {
      ffmpeg.ffprobe(videoDir, async function (err, metadata) {
        if (err) {
          reject(err);
        } else {
          const { duration, size } = metadata.format;
          resovle({ duration, size });
        }
      });
    } catch (err) {
      reject(err);
      console.log('Get video info error', err);
    }
  });
};

export const makeSlug = (title?: string) => {
  if (!title) return '';

  let str = title.toLowerCase();

  str = str.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, 'a');
  str = str.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, 'e');
  str = str.replace(/(ì|í|ị|ỉ|ĩ)/g, 'i');
  str = str.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, 'o');
  str = str.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, 'u');
  str = str.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, 'y');
  str = str.replace(/(đ)/g, 'd');

  // Xóa ký tự đặc biệt
  str = str.replace(/([^0-9a-z-\s-\.])/g, '');

  // Xóa khoảng trắng thay bằng ký tự -
  str = str.replace(/(\s+)/g, '-');

  // xóa phần dự - ở đầu
  str = str.replace(/^-+/g, '');

  // xóa phần dư - ở cuối
  str = str.replace(/-+$/g, '');

  return str;
};
