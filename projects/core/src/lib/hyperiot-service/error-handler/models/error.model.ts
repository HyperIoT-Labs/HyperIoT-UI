import { HttpErrorResponse, HttpRequest } from "@angular/common/http"
import { NotificationSeverity } from "../../notification-manager/models/notification.model";

export interface GlobalError {
    id?: string;
    originType: 'http' | 'code';
    notify: {
        show: boolean;
        channelId?: string;
        severity?: NotificationSeverity;
        message: {
            title: string; 
            body: string;
        };
    };
    component?: string;
    http?: {
      request: HttpRequest<unknown>;
      error: HttpErrorResponse;
    };
    codeError?: any;
}