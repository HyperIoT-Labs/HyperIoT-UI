import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, QueryList, Renderer2, ViewChild, ViewChildren, ViewEncapsulation} from "@angular/core";
import { Logger, LoggerService } from "core";
import { WebsocketChat } from "./models/websocket-chat";
import { Subject, takeUntil } from "rxjs";
import { PageStatus } from "./models/page-status";
import * as moment from "moment";
import { CatClient } from 'ccat-api'

@Component({
  selector: "hyt-chatbot",
  templateUrl: "./hyt-chatbot.component.html",
  styleUrls: ["./hyt-chatbot.component.scss"],
  encapsulation: ViewEncapsulation.None,
})

export class HytChatbotComponent implements OnInit, OnDestroy, AfterViewInit {

  /** HYOT logger */
  private logger: Logger;

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

  /** An array to store received WebSocket messages. */
  received: WebsocketChat[] = [];

  /** Subject for managing WebSocket messages. */
  public messages!: Subject<WebsocketChat>;

  /** Represents the current page status (e.g., LOADING, READY, ERROR). */
  pageStatus: PageStatus = PageStatus.LOADING;

  /** Flag to indicate if it's the first interaction with the input. */
  firstTouch = false;

  /** Timer for typing indicator. */
  typingTimer: any;

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
    private renderer2: Renderer2,
    private changeDetector: ChangeDetectorRef,
    loggerService: LoggerService
  ) {
    this.logger = new Logger(loggerService);
    this.logger.registerClass("HytChatbotComponent");
    moment.locale("it");
  }

  /** 
  * At chatbot window opening 
  */
  ngOnInit(): void {
    this.cat.init();
    this.cat.onConnected(() => {
        this.firstMessage(); /* "Ciao, chi sei?" */
      }).onMessage(msg => {
        this.handleWSMessage(msg);
      }).onError(err => {
        this.handleError(err);
      }).onDisconnected(() => {
        this.logger.warn('Disconnected from Cheshire-cat-ai');
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
  * First Message sent by user (but hidden to him) in order to let introduce chatbot itself 
  */
  firstMessage(){
    this.logger.debug("Connected to Cheshire-cat-ai")
    /* First message in ITALIANO */
    this.cat.send('Ciao, chi sei?');
    this.pageStatus = PageStatus.READY;
  }

  /** 
  * Check if the WS message has to be showed or not into the chat
  * @param msg The WebSocket message indicating the message type.
  */
  handleWSMessage(msg){
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
      this.received.splice(this.received.length - 1, 1);
      this.previous_message_type = 'chat'
      action = 'text';
      show = true;
      this.logger.info(msg.content);
    }

    // Choose to show message, adding to relative
    if (show == true) {
      this.textMessageHandling({
        action: action,
        text: msg.content,
        author: "csr",
        timestamp: new Date().getTime(),
        });
    }
  }

  /**
   * Handles text messages received from the chatbot.
   * @param message The WebSocket message containing text from the chatbot.
   */
  textMessageHandling(message: WebsocketChat) {
    this.received.push(message);
  }

  /**
  * Sends a user message to the WebSocket and resets the input field.
  */
  sendMessage() {
    this.inputMsg = this.inputMsgEl?.nativeElement.value;
    this.logger.info(this.inputMsg);
    
    // Send message to ccat
    this.cat.send(this.inputMsg);

    this.textMessageHandling({
        action: "text",
        text: this.inputMsg,
        author: "cx",
        timestamp: new Date().getTime(),
      });

    if (this.inputMsgEl) this.inputMsgEl.nativeElement.value = "";

    // Disable send button
    this.inputMsgEl?.nativeElement.focus();
  }

  /**
  * Handle error and tries to re-connect to ccat
  * @param error received by the WS message from ccat
  */
  handleError(err){
    this.pageStatus = PageStatus.ERROR;
    this.logger.error(err);
    /* TO DO RECONNECT (?)*/
  }

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
    this.logger.info("Retry connection to cheshire cat");
    if (this.retryAttempts >= 3 && !forceRetry) {
      this.pageStatus = PageStatus.ERROR;
      return;
    }

    this.pageStatus = PageStatus.RETRYING;
    this.retryAttempts++;
    this.changeDetector.detectChanges();
  }

  /**
  * Close chat window 
  */
  onClose() {    
    console.info("closeChatbot");
    this.collapsedOutput.emit(true);
  }
}