import { createQueue } from './create';
import { USER_SEND_OTP_MAIL, HEART_BEAT, HANDLE_VIDEO_RESOLUTIONS, TAKE_VIDEO_SCREENSHOTS } from './names';
import { HandleVideoResolutionsPaylaod, TakeVideoScreenshotsPayload } from './consumers/media/type';

interface IQueues {
  takeVideoScreenshots: {
    add: (data: TakeVideoScreenshotsPayload) => void;
  };
  handleVideoResolutions: {
    add: (data: HandleVideoResolutionsPaylaod) => void;
  };
}

export const RepeaterQueueNames = {
  hearBeat: HEART_BEAT,
};

export const QueueNames = {
  userSendOTPMail: USER_SEND_OTP_MAIL,
  handleVideoResolutions: HANDLE_VIDEO_RESOLUTIONS,
  takeVideoScreenshots: TAKE_VIDEO_SCREENSHOTS,
};

const Queues: IQueues = {
  handleVideoResolutions: createQueue(QueueNames.handleVideoResolutions),
  takeVideoScreenshots: createQueue(QueueNames.takeVideoScreenshots),
};

export default Queues;
