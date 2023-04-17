export class Notification {
    type?: NotificationType;
    title?: string;
    message?: string;
}

export enum NotificationType {
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
