import { Component, OnInit, forwardRef, ViewEncapsulation, Output, EventEmitter, Input, ViewChild, ElementRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { v4 as uuidv4 } from "uuid";
import { WebsocketChat } from "./models/websocket-chat";
import { Subject, takeUntil } from "rxjs";


@Component({
  selector: "hyt-chatbot",
  templateUrl: "./hyt-chatbot.component.html",
  styleUrls: ["./hyt-chatbot.component.css"],
  encapsulation: ViewEncapsulation.None,
})

export class HytChatbotComponent implements OnInit {

  /** To open/close chatbot */
  @Output() collapsedOutput = new EventEmitter<boolean>();
  
  /** ID of the typing message. */
  isTypingMessageId = "";

  /** An array to store received WebSocket messages. */
  received: WebsocketChat[] = [];

  /** Flag to indicate if it's the first interaction with the input. */
  firstTouch = false;

  /** Reference to the input element where the user types messages. */
  @ViewChild("inputMsg") inputMsgEl?: ElementRef;

  /** Subject for managing WebSocket messages. */
  public messages!: Subject<WebsocketChat>;

  /** The current input message text. */
  inputMsg: string = "";

  pageStatus: number;
  webEmbedded: any;

  constructor() {this.pageStatus = 0;}
  
  ngOnInit() {}

  /**
   * Upon the first input focus by the user, set the 'firstTouch' flag to true.
   * @param event Event emitted on input focus
   */
  inputOnFocus(event: any) {
    this.firstTouch = true;
    console.log("[inputOnFocus] FOCUS", event);
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
   * Sends a user message to the WebSocket and resets the input field.
   */
  sendMessage() {
    const randomUUID: string = uuidv4();
    this.inputMsg = this.inputMsgEl?.nativeElement.value;
    console.log("[sendMessage] message", this.inputMsg);
    this.messages.next({
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

  onClose() {    
    console.info("closeChatbot");
    this.collapsedOutput.emit(true);
  }
}
