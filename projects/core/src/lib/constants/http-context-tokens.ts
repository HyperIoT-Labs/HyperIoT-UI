import { HttpContextToken } from "@angular/common/http";
import { NotificationGlobalChannels } from "../hyperiot-service/notification-manager/models/notification.model";

export const ERROR_MESSAGES = new HttpContextToken<{
    [index: number]: {
      title: string,
      body: string
    }
} | null>(() => null);
export const IGNORE_ERROR_NOTIFY = new HttpContextToken(() => false);
export const NOTIFY_CHANNEL_ID = new HttpContextToken(() => NotificationGlobalChannels.GLOBAL_USER_TOAST);
