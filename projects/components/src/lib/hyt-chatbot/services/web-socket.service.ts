import { Injectable } from "@angular/core";
import { WebsocketChat } from "../models/websocket-chat";
import { webSocket, WebSocketSubjectConfig } from "rxjs/webSocket";
import { Subject } from "rxjs";
import { LocalStorageService } from "./local-storage.service";
import { ApiConnect } from "../models/api-connect";

/**
 * @Description Service for WebSocket communication.
 */
@Injectable({
  providedIn: "root",
})
export class WebSocketService {
  /** A subject for WebSocket communication. */
  subject?: Subject<WebsocketChat>;

  /** Key for storing the chat session ID in local storage. */
  localStorageKeySession = "chatSessionID";

  /** Configuration for connecting to the API. */
  apiConnect: ApiConnect;

  constructor(private localStorageService: LocalStorageService) {
    // Initialize API configuration.
    //this.apiConnect = FreyaAppConfig.getConfigByKey("apiConnect");
  }

  /**
   * Creates a WebSocket subject configuration.
   *
   * @param url - The URL to connect to via WebSocket.
   * @returns The WebSocket subject configuration.
   */
  createWebsocketSubjectConfig(url: string): WebSocketSubjectConfig<any> {
    const webSocketSubjectConfig: WebSocketSubjectConfig<any> = {
      url: url,
      openObserver: {
        next: this.openObserverAction(),
      },
      closeObserver: {
        next: (data) => {
          console.log(
            "[createWebsocketSubjectConfig - closeObserver] ON CLOSE",
            data
          );
          this.localStorageService.removeData(this.localStorageKeySession);
          console.log("[ON CLOSE] removed localStorage Session Key", data);
        },
      },
    };
    return webSocketSubjectConfig;
  }

  /**
   * Function to perform actions when the WebSocket connection is opened.
   *
   * @returns The action to perform when the connection is opened.
   */
  openObserverAction() {
    return () => {
      const initMessage = { action: "history" };
      this.sendWSMessage(this.subject!, initMessage);
    };
  }

  /**
   * Connect to the WebSocket.
   *
   * @param sessionID - The session ID for the WebSocket connection.
   * @param widgetID - The widget ID for the WebSocket connection.
   * @param languageCode - (Optional) The language code for the WebSocket connection (default: "it").
   * @returns A subject for WebSocket chat communication.
   */
  connectToWS(
    sessionID: string,
    widgetID: string,
    languageCode: string = "it"
  ): Subject<WebsocketChat> {
    const WS_URL =
      this.apiConnect.baseWSUrl +
      "?session_id=" +
      sessionID +
      "&widget_id=" +
      widgetID +
      "&cobrowseable=false&language=" +
      languageCode;
    const webSocketSubjectConfig = this.createWebsocketSubjectConfig(WS_URL);

    this.subject = webSocket(webSocketSubjectConfig);
    return this.subject;
  }

  /**
   * Send a WebSocket message.
   *
   * @param ws - The WebSocket subject.
   * @param message - The WebSocket message to send.
   */
  sendWSMessage(ws: Subject<any>, message: WebsocketChat) {
    console.log("[sendWSMessage]", JSON.stringify(message));
    ws.next(message);
  }

  /**
   * Close the WebSocket connection.
   *
   * @param ws - The WebSocket subject to close.
   */
  closeWSConnection(ws: Subject<any>) {
    console.log("[closeWSConnection]");
    ws.complete();
  }
}
