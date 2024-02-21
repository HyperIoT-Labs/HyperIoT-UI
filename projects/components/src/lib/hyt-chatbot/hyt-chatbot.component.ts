import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Input, QueryList, ViewChild, ViewChildren, ViewEncapsulation, Optional} from "@angular/core";
import { Logger, LoggerService } from "core";
import { WebsocketChat } from "./models/websocket-chat";
import { Subject, takeUntil } from "rxjs";
import { PageStatus } from "./models/page-status";
import { CookieService } from 'ngx-cookie-service';
import { CatClient } from 'ccat-api'
import * as moment_ from 'moment';
const moment = moment_;

@Component({
  selector: "hyt-chatbot",
  templateUrl: "./hyt-chatbot.component.html",
  styleUrls: ["./hyt-chatbot.component.scss"],
  encapsulation: ViewEncapsulation.None,
})

export class HytChatbotComponent implements OnInit, OnDestroy, AfterViewInit {

  /** HYOT logger */
  private logger: Logger;

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

  /** Url for ccat defined inside src/environments/ */
  @Input() public ccatUrl: string;

  /** An array to store received WebSocket messages. */
  received: WebsocketChat[] = [];

  /** Subject for managing WebSocket messages. */
  public messages!: Subject<WebsocketChat>;

  /** Represents the current page status (e.g., LOADING, READY, ERROR). */
  pageStatus: PageStatus = PageStatus.LOADING;

  /** Flag to indicate if it's the first interaction with the input. */
  firstTouch = false;

  /** Number of retry attempts to regenerate the session before going into error. */
  retryAttempts = 1;

  /** Save previous message type in order to show or not typing token*/
  previous_message_type = "";

  /** MUST NOT WRITE */
  canIWrite = false;

  /** Variable to collapse/show chatbot window */
  collapsed = true;

  /** Variable to indicates if connect to ccat or not (=new session or not) */
  firstOpen = true;

  /** Variables to indicates if there is a message not read from the user when window is collapsed */
  badgeContent : number;
  badgeHidden : boolean;

  /** Subject for managing open subscriptions. */
  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  /** When true, the input is focus and hide the placeholder */
  inputFocus: boolean = false;

  /** The current input message text. */
  _inputText: string = "";

  /** Margin between the message list and the chat container. */
  readonly MARGIN_TOP_UL = 0;

  /** Top position of the fixed pills. */
  readonly FIXED_TOP_PILLS = 15;

  /** Variable to show/not show disconnection advise when chatbot is collapsed */
  public disconnected: boolean = false;

  /** Variable to change the scroll animation */
  public scrollBehaviour: string = "instant";

  /** Cat variable */
  public cat: CatClient;

  /** Welcome message to send to ccat at start */
  public firstMessage: string = $localize`:@@HYT_ai_first_message:Hello, who are you?`; 

  constructor(
    private cookieService: CookieService,
    loggerService: LoggerService
  ) {
    this.badgeContent = 0;
    this.badgeHidden = true;
    this.logger = new Logger(loggerService);
    this.logger.registerClass("HytChatbotComponent");
    moment.locale("it");
  }

  /** 
  * At chatbot window opening 
  */
  ngOnInit(): void {
    /* Always declare the cat client on the first chatbot window opened */
    this.cat = new CatClient({
      baseUrl: this.ccatUrl + "/hyperiot/llm",
      user: this.cookieService.get('HIT-AUTH'),
      port: 0,
      ws : { 
        retries: 1
      }
    });
    this.initCat();
  }

  ngAfterViewInit() {
    this.messageList?.changes
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((res) => {
        this.autoScrollDown();
      });
  }

  ngOnDestroy(){
    this.cat.close();
    if (this.ngUnsubscribe) {
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
    }
  }

  /** 
  * First Message sent by user (but hidden to him) in order to let introduce chatbot itself 
  */
  sendFirstMessage(){
    this.logger.debug("Connected to Cheshire-cat-ai")
    this.cat.send(this.firstMessage);
    this.pageStatus = PageStatus.READY;
  }

  /**
   * Init the cat and open connection (1st time)
  */
  initCat(){
    this.cat.init();
    this.cat.onConnected(() => {
      this.disconnected = false;
      }).onMessage(msg => {
        this.handleWSMessage(msg);
      }).onError(err => {
        this.handleError(err);
      }).onDisconnected(() => {
        this.handleDisconnection();
      });
  }

  /**
  * Init a new cat in order to retry connection if lost.
  */
  newCat(){
    this.cat.close();
    /* Declare a new cat*/
    this.cat = new CatClient({
      baseUrl: this.ccatUrl + "/hyperiot/llm",
      user: this.cookieService.get('HIT-AUTH'),
      port: 0,
      ws : { 
        retries: 1,
        delay: 2000,
      }
    });

    this.cat.init();
    this.cat.onConnected(() => {
        this.retryAttempts = 1;
        this.disconnected = false;
        this.sendFirstMessage();
      }).onMessage(msg => {
        this.handleWSMessage(msg);
      }).onError(err => { 
        this.retryAttempts++;
        this.handleError(err);
      }).onDisconnected(() => {
        this.handleDisconnection();
      });
  }

  /** 
  * Check if the WS message has to be showed or not into the chat
  * @param msg The WebSocket message indicating the message type.
  */
  handleWSMessage(msg: WebsocketChat){
    // Variable that enable show/hidden message/token:
    let show : boolean;
    let action : string;
    
    // SHOW just 1 for time
    if (msg.type == 'chat_token' && this.previous_message_type != 'chat_token') {
      this.previous_message_type = 'chat_token'
      action = 'typing_indicator';
      show = true;
    }

    // Always show (classic message or chart)
    else if (msg.type == 'chat' || msg.type == 'linechart'){
      this.received.splice(this.received.length - 1, 1);
      this.previous_message_type = 'chat'
      action = msg.type == 'chat' ? 'text' : 'chart';
      show = true;
      this.logger.info("handleWSMessage()", msg.content);
    }

    // Choose to show message, adding to relative
    if (show == true) {
      this.received.push({
        action: action,
        text: msg.content,
        author: "bot",
        timestamp: new Date().getTime(),
        });

      this.canIWrite = true;

      if (msg.type == 'chat' || msg.type == 'linechart'){
        // add MatBadgeValue and show
        this.badgeContent++;
        this.badgeHidden = false;
      }
    }
  }

  /**
  * Sends a user message to the WebSocket and resets the input field.
  */
  sendMessage() {
    this.logger.info("sendMessage()", this.inputText);
    
    // Send message to ccat
    this.cat.send(this.inputText);

    this.received.push({
        action: "text",
        text: this.inputText,
        author: "user",
        timestamp: new Date().getTime()
      });

    if (this.inputMsgEl) {
      this.inputMsgEl.nativeElement.innerText = "";
      this.inputText = "";
    }

    // Disable send button and input text
    this.inputMsgEl?.nativeElement.focus();
    this.canIWrite = false;
  }

  /**
  * Handle error ccat
  * @param error received by the WS message from ccat
  */
  handleError(err){
    this.pageStatus = PageStatus.ERROR;
    this.logger.error("handleError()", err);
  }

  /**
  * Handle disconnection from the ccat
  */
  handleDisconnection(){
    this.pageStatus = PageStatus.ERROR;
    this.disconnected = true;
    this.badgeHidden = true;
    this.logger.warn('handleDisconnection() -> disconnected from Cheshire-cat-ai');
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
   * Prints the name of the user who sent the message
   * @param idAuthor the sender's id
   */
  returnAuthor(idAuthor: string): string {
    switch (idAuthor) {
      case "bot":
        return "Alice";
      case "user":
        return $localize`:@@HYT_ai_user_label:You`;
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
    if (!this.collapsed){
      try {
        this.content!.nativeElement!.scrollTo({
          top: this.content?.nativeElement.scrollHeight,
          behavior: this.scrollBehaviour,
        });
        // Change animation 
        if (this.scrollBehaviour == "instant") this.scrollBehaviour = "smooth";
      } catch (error) {
        this.logger.error("autoScrollDown() Error", error);
      }
    }
  }

  /**
   * Event emitted on input keyup when the user starts typing a message.
   * Sends a WebSocket notification that the user is typing.
   * @param event Event emitted from input keyup
   */
  startTypingIndicator(event: any) {
    if (event.target.innerText.length > 0 && this.firstTouch) {
      this.firstTouch = false;
    }
  }

  /**
   * Upon the first input focus by the user, set the 'firstTouch' flag to true.
   * @param event Event emitted on input focus
   */
  inputOnFocus(event: any) {
    this.firstTouch = true;
    this.logger.info("inputOnFocus() FOCUS", event);
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
      return $localize`:@@HYT_ai_today:Today`;
    } else if (diffDate === 1) {
      return $localize`:@@HYT_ai_yesterday:Yesterday`;
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
      this.logger.warn("returnMessageDate() not handled data", diffDate);
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
      this.logger.error("displayMessageDateBox() negative message index", index);
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
   * Reset the sessionId & retrieve again value from cookie.
   * @param forceRetry (optional) A boolean flag indicating whether to force a retry even if maximum retry attempts have been reached.
   * @returns void
   */
  retryConnection(): void {
    this.logger.info("retryConnection() -> retry connection to cheshire cat");
    this.pageStatus = PageStatus.RETRYING;
    // Retry connection to a new cat istance
    this.newCat();
  }

  /**
   * Return true if the input for writing message is enabled
   */
  get isEditable(): boolean {
    return this.canIWrite && this.received.length > 0;
  }

  get inputText(): string {
    return this._inputText;
  }

  set inputText(t: string) {
    this._inputText = t;
  }

  inputKeyUp(e: KeyboardEvent) {
    this.inputText = (e.target as HTMLElement)?.innerText || "";
    this.startTypingIndicator(e);
  }

  /**
   * Return if the user can send message, check if bot
   * is not writing at the moment and the user has written something
   */
  get canSendMessage(): boolean {
    if (!this.inputMsgEl) return false;
    return !(
      this.received.length == 0 ||
      this.inputMsgEl?.nativeElement.innerText === "")
  }

   /**
   * Function called on fake textarea keypress and check if
   * the user press enter for send the message
   * @param e
   */
    submitOnEnterNotShifted(e: any) {
      if (e.which === 13 && !e.shiftKey) {
        e.preventDefault();
        if (this.canSendMessage) this.sendMessage();
      }
    }

  /**
  * Open/Close chatbot window
  */
  openCloseChatbot() {
    // Only first opening
    if (this.firstOpen && this.pageStatus != PageStatus.ERROR) {
      this.pageStatus = PageStatus.LOADING;
      this.firstOpen = false;
      if (this.disconnected == false) this.sendFirstMessage();
      else this.retryConnection(); //if disconnected before, establish connection on click on icon collapsed
      this.logger.debug("openCloseChatbot() - first open");
      return this.collapsed = false;
    }
    else if (this.collapsed){
      this.badgeContent = 0;
      this.badgeHidden = true;
      //if disconnected before, establish connection on click on icon collapsed
      if (this.disconnected == true) this.retryConnection();
      this.logger.debug("openCloseChatbot() - open chatbot");
      return this.collapsed = false;
    }
    else if (!this.collapsed) {
      this.badgeContent = 0;
      this.badgeHidden = true;
      this.scrollBehaviour = "instant";
      this.logger.debug("openCloseChatbot() - collapse chatbot");
      return this.collapsed = true;
    }
  }  
}