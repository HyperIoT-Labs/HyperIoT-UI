import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
} from "@angular/core";

  import { WebSocketService } from "./services/web-socket.service";
  import { LocalStorageService } from "./services/local-storage.service";
  import { WebsocketChat } from "./models/websocket-chat";
  import { Subject, takeUntil } from "rxjs";
  import { v4 as uuidv4 } from "uuid";
  import { PageStatus } from "./models/page-status";
  import * as moment from "moment";
  import { DOCUMENT, LocationStrategy } from "@angular/common";
  import { ActivatedRoute } from "@angular/router";
  import { HostParameters } from "./models/host-parameters";
  import { SessionService } from "./services/session.service";
  import { ParameterizedService } from "./services/parameterized.service";
  import { CatClient } from 'ccat-api'

  export interface UserContacts {
    name: string;
    telephone: number;
  }
  
  @Component({
    selector: "hyt-chatbot",
    templateUrl: "./hyt-chatbot.component.html",
    styleUrls: ["./hyt-chatbot.component.scss"],
    encapsulation: ViewEncapsulation.None,
  })
  export class HytChatbotComponent implements OnInit, OnDestroy, AfterViewInit {

    /** To open/close chatbot */
    @Output() collapsedOutput = new EventEmitter<boolean>();

    /** Reference to the "content" container for messages. */
    @ViewChild("content") content?: ElementRef;
  
    /** Reference to the floating pill displaying message dates. */
    @ViewChild("floatingPill") floatingPill?: ElementRef;
  
    /** QueryList containing rendered messages. */
    @ViewChildren("messagelist") messageList?: QueryList<any>;
  
    /** QueryList containing message date elements. */
    @ViewChildren("dayDate") dayDate?: QueryList<any>;
  
    /** Reference to the input element where the user types messages. */
    @ViewChild("inputMsg") inputMsgEl?: ElementRef;
  
    /** The current input message text. */
    inputMsg: string = "";
  
    // sessionID?: string;
  
    /** Local storage key for the chat session ID. */
    localStorageKeySession = "chatSessionID";
  
    /** An array to store received WebSocket messages. */
    received: WebsocketChat[] = [];
  
    /** Subject for managing WebSocket messages. */
    public messages!: Subject<WebsocketChat>;
  
    /** Represents the current page status (e.g., LOADING, READY, ERROR). */
    pageStatus: PageStatus = PageStatus.LOADING;
  
    /** ID of the typing message. */
    isTypingMessageId = "";
  
    /** Flag to indicate if it's the first interaction with the input. */
    firstTouch = false;
  
    /** Timer for typing indicator. */
    typingTimer: any;
  
    /** Base URL for the application. */
    applicationBaseUrl = "";
  
    /** Unique identifier for parameterizedService. */
    elementContent = "ab14f6bb-c1d0-4179-8a7e-90d83e8f86b6";
  
    /** Flag to determine if the component is embedded in a web page. */
    webEmbedded = false;
  
    /** Number of retry attempts to regenerate the session before going into error. */
    retryAttempts = 0;

    /** Save previous message type in order to show or not typing token*/
    previous_message_type = "";
  
    /** Subject for managing open subscriptions. */
    protected ngUnsubscribe: Subject<void> = new Subject<void>();
  
    /** Margin between the message list and the chat container. */
    readonly MARGIN_TOP_UL = 15;
  
    /** Top position of the fixed pills. */
    readonly FIXED_TOP_PILLS = 15;
  
    /** Cat variables to establish connection */
    readonly baseUrlCat = 'localhost';
    readonly userCat = 'user'

    /* Declare cat client API */
    cat = new CatClient({
      baseUrl: this.baseUrlCat,
      user: this.userCat
    });

    constructor(
      public websocketService: WebSocketService,
      public localStorageService: LocalStorageService,
      private renderer2: Renderer2,
      @Inject(DOCUMENT) private document: Document,
      private changeDetector: ChangeDetectorRef
    ) {
      moment.locale("it");
    }
  
    /** OPEN CHATBOT */
    ngOnInit(): void {

      this.cat.init();
      this.cat.onConnected(() => {
            console.log('Socket connected');
            /* First message in ITALIANO */
            this.cat.send('Ciao, chi sei?');
            this.pageStatus = PageStatus.READY;

        }).onMessage(msg => {
            console.log(msg);
            const randomUUID: string = uuidv4();

            // Variable that enable show/hidden message/token:
            let show : boolean;
            let action : string;
            
            // SHOW just 1 for time
            if (msg.type == 'chat_token' && this.previous_message_type != 'chat_token') {
              this.previous_message_type = 'chat_token'
              action = 'typing_indicator';
              show = true;
            }

            // Always show
            else if (msg.type == 'chat'){
              this.received.splice(this.received.length-1, 1);
              this.previous_message_type = 'chat'
              action = 'text';
              show = true;
            }

            // Choose to show message
            if (show == true) {
              this.textMessageHandling({
                action: action,
                text: msg.content,
                author: "csr",
                messageId: randomUUID,
                timestamp: new Date().getTime(),
                });
            }

        }).onError(err => {
            console.log(err)
        }).onDisconnected(() => {
            console.log('Socket disconnected')
        });
    }
  
    ngAfterViewInit() {
      this.renderer2.listen(this.content?.nativeElement, "scroll", (e) =>
        this.floatDatePills(this.getContentYPosition(e))
      );
  
      this.messageList?.changes
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((res) => {
          console.log("[ngAfterViewInit] CHANGE LIST", res);
          this.autoScrollDown();
        });
    }
  
    ngOnDestroy(){}

  
    /**
     * Manages the floating pill that displays message dates as the chat content is scrolled.
     * @param currentContentScrollTop The current scroll offset from the top of the chat container.
     */
    floatDatePills(currentContentScrollTop: number) {
      let currentLabel = "";
      this.dayDate?.toArray().forEach((dateLabel, idx) => {
        // Height of the pills we are scrolling
        const PILLS_HEIGHT = dateLabel.nativeElement.offsetHeight - 1;
        // The formula PILLS_HEIGHT + this.FIXED_TOP_PILLS + 2
        // accurately calculates when a pill would
        // collide with the fixed one, and the date-pill
        // will be hidden 2px before the collision (hence the + 2)
        if (
          (idx == 0 && currentContentScrollTop < PILLS_HEIGHT * 2) ||
          currentContentScrollTop >=
            dateLabel.nativeElement.offsetTop -
              (PILLS_HEIGHT + this.FIXED_TOP_PILLS + 2)
        ) {
          // Set new label
          currentLabel = dateLabel.nativeElement.innerText;
        }
  
        // The floating pill is hidden until the user
        // scrolls at least the margin-top of the ul
        if (currentContentScrollTop > this.MARGIN_TOP_UL) {
          this.floatingPill!.nativeElement.style.opacity = "1";
          this.floatingPill!.nativeElement.innerText = currentLabel;
          // Set Pill Left position
          this.floatingPill!.nativeElement.style.left =
            "calc(50% - ( " +
            this.floatingPill?.nativeElement.offsetWidth / 2 +
            "px - 18px))";
        } else {
          this.floatingPill!.nativeElement.style.opacity = "0";
        }
  
        // If the currentLabel is the element we are scrolling
        // and the ul margin has already been scrolled,
        // only the fixed pill will be shown, not the span
        if (
          currentLabel === dateLabel.nativeElement.innerText &&
          currentContentScrollTop > this.MARGIN_TOP_UL
        ) {
          dateLabel.nativeElement.classList.add("disappear");
        } else {
          dateLabel.nativeElement.classList.remove("disappear");
        }
      });
    }
  
    /**
     * Handles incoming WebSocket messages by dispatching them to appropriate methods based on their action.
     * @param message The WebSocket message received.
     */
    incomingMessageHandling(message: WebsocketChat) {
      switch (message.action) {
        case "history":
          this.historyMessageHandling(message.history!);
          break;
        case "text":
          this.textMessageHandling(message);
          break;
        case "menu":
          this.menuMessageHandling(message);
          break;
        case "message_delivery":
          this.messageDeliveryHandling(message);
          break;
        case "typing_indicator":
          this.typingIndicatorHandling(message);
          break;
        case "postback_disable":
          this.postbackDisabledHandling(message.messageId!);
          break;
        case "link_button":
          this.linkButtonMessageHandling(message);
          break;
        case "postback":
          this.postbackMessageHandling(message);
          break;
        case "csr_end_session":
          this.csrEndSessionMessageHandling(message);
          break;
        default:
          console.error(
            "[incomingMessageHandling] case not handled",
            message.action
          );
      }
    }
  
    /**
     * Sends a user message to the WebSocket and resets the input field.
     */
    sendMessage() {
      const randomUUID: string = uuidv4();
      this.inputMsg = this.inputMsgEl?.nativeElement.value;
      console.log("[sendMessage] message", this.inputMsg);
      
      // mando messaggio al gatto
      this.cat.send(this.inputMsg);

      this.textMessageHandling({
          action: "text",
          text: this.inputMsg,
          author: "cx",
          messageId: randomUUID,
          timestamp: new Date().getTime(),
        });

      if (this.inputMsgEl) this.inputMsgEl.nativeElement.value = "";
      // Disable send button
      this.inputMsgEl?.nativeElement.focus();
    }
  
    /*** MANAGE ACTION TYPE ***/
  
    /**
     * Handles the "history" action, displaying the chat history.
     * @param message The WebSocket message containing the chat history.
     */
    historyMessageHandling(message: WebsocketChat[]) {
      // I call the slice method before the reverse to create a copy
      // of the message array, suggested edit by ESLint.
      for (let x of message.slice().reverse()) {
        this.incomingMessageHandling(x);
      }
    }
  
    /**
     * Handles text messages received from the chatbot.
     * @param message The WebSocket message containing text from the chatbot.
     */
    textMessageHandling(message: WebsocketChat) {
      this.received.push(message);
      if (message.author === "csr" && !message.read) {
        // Response
        this.messages.next({
          action: "read_receipt",
          messageIds: [message.messageId!],
        });
      }
    }
  
    /**
     * Handles the delivery confirmation of a message.
     * @param message The WebSocket message indicating message delivery.
     */
    messageDeliveryHandling(message: WebsocketChat) {
      const textMessageFound = this.received.find(
        (data) => data.messageId === message.messageId
      );
      if (textMessageFound) {
        textMessageFound.messageStatus = "delivery_success";
        console.log("[messageDeliveryHandling]", textMessageFound);
      } else {
        console.error("[messageDeliveryHandling] MESSAGE NOT FOUND");
      }
    }
  
    /**
     * Handles typing indicator messages from the chatbot.
     * @param message The WebSocket message indicating typing activity.
     */
    typingIndicatorHandling(message: WebsocketChat) {
      let oldTypingMessage = this.received.filter(
        (message) => message.action === "typing_indicator"
      );
      if (oldTypingMessage.length > 0) {
        this.received.forEach((oldMessage, index) => {
          console.log(
            "[typingIndicatorHandling] Old message index",
            oldMessage.messageId,
            index
          );
          if (oldMessage.action === "typing_indicator") {
            this.received.splice(index, 1);
          }
        });
      }
      console.log("[typingIndicatorHandling] Old message", oldTypingMessage);
      console.log("[typingIndicatorHandling]", message);
      this.isTypingMessageId = message.messageId!;
      this.received.push(message);
      this.setSecureTypingTimer(this.isTypingMessageId);
    }
  
    /**
     * Handles postback_disable action, removing a message from the conversation.
     * @param messageId The ID of the message to be removed.
     */
    postbackDisabledHandling(messageId: string) {
      const menuElIndexFound = this.received.findIndex(
        (data) => data.messageId === messageId
      );
      if (menuElIndexFound) {
        console.log(
          "[postbackDisabledHandling] message founded",
          this.received[menuElIndexFound]
        );
        this.received.splice(menuElIndexFound, 1);
      } else {
        console.error("[postbackDisabledHandling] message NOT founded");
      }
    }
  
    /**
     * Handles menu messages from the chatbot.
     * @param message The WebSocket message representing a menu of options.
     */
    menuMessageHandling(message: WebsocketChat) {
      if (!message.disabled) {
        console.log("[menuMessageHandling]", message);
        this.received.push(message);
      }
    }
  
    /**
     * Handles link button messages received from the chatbot.
     * @param message The WebSocket message containing a link button.
     */
    linkButtonMessageHandling(message: WebsocketChat) {
      console.log("[linkButtonMessageHandling]", message);
      this.received.push(message);
    }
  
    /**
     * Handles postback messages received from the chatbot.
     * @param message The WebSocket message containing a postback action.
     */
    postbackMessageHandling(message: WebsocketChat) {
      console.log("[postbackMessageHandling] postback message received", message);
    }
  
    /**
     * Handles the end of a CSR session (not currently implemented).
     * @param message The WebSocket message indicating the end of a CSR session.
     */
    csrEndSessionMessageHandling(message: WebsocketChat) {
      console.log(
        "[csrEndSessionMessageHandling] CSR END SESSION message received",
        message
      );
    }
  
    /*** END MANAGE ACTION TYPE ***/
  
    /**
     * Sends a postback message to the WebSocket when a menu item is clicked.
     * @param event The event triggered by clicking a menu item.
     */
    sendPostbackMenuMessage(event: any) {
      console.log("[sendPostbackMenuMessage] clicked!", event);
      console.log(
        "[sendPostbackMenuMessage] data",
        event.target.dataset.messageid
      );
      const randomUUID: string = uuidv4();
      const messageId = event.target.dataset.messageid;
      const payload = event.target.dataset.payload;
      const text = event.target.dataset.text;
      this.messages.next({
        action: "postback",
        messageId: messageId,
        postback: payload,
        postbackMessageId: randomUUID,
        text: text,
        pageTags: {
        },
      });
      // Get element from MENU message
      const itemFound = this.received.find(
        (data) => data.messageId === messageId
      );
      if (itemFound) {
        this.messages.next({
          action: "postback_disable",
          author: itemFound.author,
          items: itemFound.items,
          messageId: itemFound.messageId,
          displayHint: itemFound.displayHint,
          timestamp: itemFound.timestamp,
          title: itemFound.text,
        });
      } else {
        console.error("[sendPostbackMenuMessage] Item Not Found");
      }
    }
  
    /**
     * Sets a secure typing timer for the chatbot's typing indicator.
     * @param messageId The ID of the message associated with typing indicator.
     */
    setSecureTypingTimer(messageId: string) {
      this.typingTimer = setTimeout(() => {
        this.resetTypingIndicator(messageId);
      }, 10000);
    }
  
    /**
     * If the bot takes too long to respond, cancel the typing event and
     * the related messages that were generated
     * @param messageId the id of the message that triggered this event
     */
    resetTypingIndicator(messageId: string) {
      const typingMessageFoundIndex = this.received.findIndex(
        (data) => data.messageId === messageId
      );
      if (typingMessageFoundIndex) {
        console.log(
          "[resetTypingIndicator] typing index founded",
          this.received[typingMessageFoundIndex]
        );
        this.received.splice(typingMessageFoundIndex, 1);
        this.isTypingMessageId = "";
        // Reset Secure Timer
        clearTimeout(this.typingTimer);
      } else {
        this.isTypingMessageId = "";
        console.warn(
          "[resetTypingIndicator] TYPING NOT FOUND, messageId:",
          messageId
        );
      }
    }
  
    /**
     * Prints the name of the user who sent the message
     * @param idAuthor the sender's id
     */
    returnAuthor(idAuthor: string): string {
      switch (idAuthor) {
        case "csr":
          return "Loriana";
        case "cx":
          return "Tu";
        default:
          return idAuthor;
      }
    }
  
    /**
     * Returns a string in HH:MM format of the message timestamp
     * @param timestamp the timestamp that contains the message time
     */
    returnTimeMessage(timestamp: number): string {
      const newTimestamp = new Date(timestamp);
      const minutes = ("0" + newTimestamp.getMinutes()).slice(-2);
      const hours = ("0" + newTimestamp.getHours()).slice(-2);
      return hours + ":" + minutes;
    }
  
    /**
     * If the chat container has already been rendered,
     * scroll to the last sent/received message,
     * and update the value of the messageList.
     */
    autoScrollDown(): void {
      try {
        this.content!.nativeElement.scrollTop =
          this.content?.nativeElement.scrollHeight;
      } catch (error) {
        console.log("[autoScrollDown] Error", error);
      }
    }
  
    /**
     * Event emitted on input keyup when the user starts typing a message.
     * Sends a WebSocket notification that the user is typing.
     * @param event Event emitted from input keyup
     */
    startTypingIndicator(event: any) {
      if (event.target.value.length > 0 && this.firstTouch) {
        // Send TYPING INDICATOR message
        console.log(
          "[startTypingIndicator] SEND TYPING INDICATOR MESSAGE",
          event.target.value.length
        );
        this.messages.next({ action: "typing_indicator" });
        console.log("[startTypingIndicator] Set first touch to false");
        this.firstTouch = false;
      }
    }
  
    /**
     * Upon the first input focus by the user, set the 'firstTouch' flag to true.
     * @param event Event emitted on input focus
     */
    inputOnFocus(event: any) {
      this.firstTouch = true;
      console.log("[inputOnFocus] FOCUS", event);
    }
  
    /**
     * Event emitted on clicking a link returned by the server.
     * @param url The URL to navigate to
     */
    onClickButtonLink(url: string) {
      console.log("[onClickButtonLink] URL", url);
      window.open(url, "_blank");
    }
  
    /**
     * Prints a human-readable string in the date pills, possible values:
     * - Today
     * - Yesterday
     * - The day's name if it's within the last seven days (e.g., Monday, Tuesday...)
     * - Date in the "DD-MMM-YYYY" format
     *
     * @param timestamp Date in timestamp format to print
     */
    returnMessageDate(timestamp: number): string {
      const today = moment().format("DD-MMM-YYYY");
      const dataMomentFormat = moment(timestamp).format("DD-MMMM-YYYY");
  
      const diffDate = moment(today, "DD-MMM-YYYY").diff(
        moment(dataMomentFormat, "DD-MMM-YYYY"),
        "days"
      );
  
      if (diffDate === 0) {
        return "Oggi";
      } else if (diffDate === 1) {
        return "Ieri";
      } else if (diffDate > 1 && diffDate < 7) {
        const daysOfWeek = moment.weekdays();
        const numberOfDay = moment(dataMomentFormat, "DD-MMM-YYYY").day();
        return daysOfWeek[numberOfDay];
      } else if (diffDate >= 7 && diffDate < 365) {
        const daysOfWeek = moment.weekdays();
        const numberOfDay = moment(dataMomentFormat, "DD-MMM-YYYY").day();
        const daysOfWeekName = daysOfWeek[numberOfDay].substring(0, 3);
        return (
          daysOfWeekName +
          " " +
          dataMomentFormat.substring(0, dataMomentFormat.length - 5)
        );
      } else if (diffDate >= 365) {
        const daysOfWeek = moment.weekdays();
        const numberOfDay = moment(dataMomentFormat, "DD-MMM-YYYY").day();
        const daysOfWeekName = daysOfWeek[numberOfDay].substring(0, 3);
        return daysOfWeekName + " " + dataMomentFormat;
      } else {
        console.warn("[returnMessageDate] not handled data", diffDate);
        return dataMomentFormat;
      }
    }
  
    /**
     * If it's the first message of a new day, return true to print the date pill.
     * @param arrayMsg List of currently displayed messages
     * @param index Index of the message about to be printed from arrayMsg
     */
    displayMessageDateBox(arrayMsg: WebsocketChat[], index: number): boolean {
      if (index === 0) {
        return true;
      } else if (index > 0) {
        return this.itsNewDay(
          arrayMsg[index].timestamp!,
          arrayMsg[index - 1].timestamp!
        );
      } else {
        console.error("[displayMessageDateBox] negative message index", index);
        return false;
      }
    }
  
    /**
     * Returns true if the message to be printed is from a new day compared to the previous message.
     * @param oldDate Timestamp of the previous message
     * @param newDate Timestamp of the message about to be printed
     */
    itsNewDay(oldDate: number, newDate: number): boolean {
      const oldDateMomentFormat = moment(oldDate).format("DD-MMM-YYYY");
      const newDateMomentFormat = moment(newDate).format("DD-MMM-YYYY");
  
      const diffDate = moment(newDateMomentFormat, "DD-MMM-YYYY").diff(
        moment(oldDateMomentFormat, "DD-MMM-YYYY"),
        "days"
      );
  
      return diffDate != 0;
    }
  
    /**
     * Returns the offset to the top of the chat container
     * on the scroll event to manage the floatPills.
     * @param e Event emitted by the scroll listener
     */
    getContentYPosition(e: Event): number {
      return (e.target as Element).scrollTop;
    }
  
    /**
     * Reset the sessionId & retrieve again value from cookie.
     * @param forceRetry (optional) A boolean flag indicating whether to force a retry even if maximum retry attempts have been reached.
     * @returns void
     */
    retryConnection(forceRetry = false): void {
      console.log("[retryConnection]Start retry");
      if (this.retryAttempts >= 3 && !forceRetry) {
        this.pageStatus = PageStatus.ERROR;
        return;
      }
  
      this.pageStatus = PageStatus.RETRYING;
      this.retryAttempts++;
      this.changeDetector.detectChanges();
      this.localStorageService.removeData(this.localStorageKeySession);
      //this.SessionService.initCookieValues();
      //this.SessionService.createSession(this.sessionIdObserver);
    }

    onClose() {    
      console.info("closeChatbot");
      this.collapsedOutput.emit(true);
    }
}
  