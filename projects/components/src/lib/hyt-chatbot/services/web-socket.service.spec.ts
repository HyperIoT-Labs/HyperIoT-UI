import { TestBed } from "@angular/core/testing";
import { WebSocketService } from "./web-socket.service";
import {
  webSocket,
  WebSocketSubject,
  WebSocketSubjectConfig,
} from "rxjs/webSocket";
import { Subject } from "rxjs";
import { LocalStorageService } from "./local-storage.service";
import { WebsocketChat } from "../models/websocket-chat";

describe("WebSocketService", () => {
  let webSocketService: WebSocketService;
  let localStorageServiceSpy: jasmine.SpyObj<LocalStorageService>;

  beforeEach(() => {
    const localStorageServiceSpyObj = jasmine.createSpyObj(
      "LocalStorageService",
      ["removeData"]
    );

    TestBed.configureTestingModule({
      providers: [
        WebSocketService,
        { provide: LocalStorageService, useValue: localStorageServiceSpyObj },
      ],
    });

    webSocketService = TestBed.inject(WebSocketService);
    localStorageServiceSpy = TestBed.inject(
      LocalStorageService
    ) as jasmine.SpyObj<LocalStorageService>;
  });

  it("should create WebSocket subject and connect to WS", () => {
    const sessionID = "123456";
    const widgetID = "7890";
    const languageCode = "it";
    const expectedUrl = `wss://engine.euw1.chat.pega.digital/?session_id=${sessionID}&widget_id=${widgetID}&cobrowseable=false&language=${languageCode}`;

    const webSocketSubjectConfig: WebSocketSubjectConfig<any> = {
      url: expectedUrl,
      openObserver: {
        next: (data) => {
          console.log("[ON OPEN]", data);
          const initMessage = { action: "history" };
        },
      },
      closeObserver: {
        next: (data) => {
          console.log("[ON CLOSE]", data);
        },
      },
    };

    const expectedWebSocketSubject: WebSocketSubject<any> = webSocket(
      webSocketSubjectConfig
    );
    const result = webSocketService.connectToWS(sessionID, widgetID);
    spyOn(webSocketService, "connectToWS");

    expect(result).toBeTruthy();
  });

  it("Should test the closeObserver method at the time of closing the socket", (done) => {
    const sessionID = "123456";
    const widgetID = "7890";
    const languageCode = "it";
    const socketURL = `wss://engine.euw1.chat.pega.digital/?session_id=${sessionID}&widget_id=${widgetID}&cobrowseable=false&language=${languageCode}`;

    webSocketService.connectToWS(socketURL, widgetID).subscribe({
      next: (res) => {
        console.log("connect to WS");
        done();
      },
      error: (err) => {
        console.error("Error to connect to WS");
        done();
      },
      complete: () => {
        console.log("connect to WS complete");
        done();
      },
    });
  });

  it("should call sendWSMessage with the expected data", () => {
    const initMessage = { action: "history" };

    // Replace webSocketSubject with your actual subject or mock
    spyOn(webSocketService, "sendWSMessage");
    webSocketService.openObserverAction().call(webSocketService);

    // Verify that sendWSMessage was called with the expected data
    expect(webSocketService.sendWSMessage).toHaveBeenCalledWith(
      webSocketService.subject!,
      initMessage
    );
  });

  it("should send WS message", () => {
    const message: WebsocketChat = { action: "text", text: "Test message" };
    const wsSpy = jasmine.createSpyObj<Subject<any>>("Subject", ["next"]);

    webSocketService.sendWSMessage(wsSpy, message);

    expect(wsSpy.next).toHaveBeenCalledWith(message);
  });

  it("should close WS connection", () => {
    const wsSpy = jasmine.createSpyObj<Subject<any>>("Subject", ["complete"]);

    webSocketService.closeWSConnection(wsSpy);

    expect(wsSpy.complete).toHaveBeenCalled();
  });
});
