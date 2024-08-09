export class Notification {
    channelId: string;
    message?: {
      title: string;
      body: string;
    };
    severity?: NotificationSeverity;
    type?: NotificationType;
    keepAfterRouteChange?: boolean;
    clear: boolean;
}

export enum NotificationType {
    TOAST,
    BANNER,
    MODAL,
    OVERLAY
}

export enum NotificationSeverity {
    Success,
    Error,
    Info,
    Warning
}

export enum NotifyPosition {
    TOP_CENTER    = "notify-top-center",
    BOTTOM_CENTER = "notify-bottom-center",
    TOP_FW        = "notify-top-full-width",
    BOTTOM_FW     = "notify-bottom-full-width",
    TOP_LEFT      = "notify-top-left",
    TOP_RIGHT     = "notify-top-right",
    BOTTOM_RIGHT  = "notify-bottom-right",
    BOTTOM_LEFT   = "notify-bottom-left"
}

export enum NotificationGlobalChannels {
    GLOBAL_USER_TOAST = 'global-user-toast'
} 