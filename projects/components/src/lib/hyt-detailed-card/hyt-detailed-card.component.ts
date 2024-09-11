import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Logger, LoggerService } from "core";

/**
 * @Description
 * Details printed on hover before the btn
 */
export interface CardDetailOnHover {
  /**
   * @param {string} icon - icon will be render before the label
   */
  icon: string;
  /**
   * @param {string} label - Little description of the icon(max one line)
   */
  label: string;
}
/**
 * @Description
 * Format of emitted value from the output
 */
export interface CardEmittedValue {
  /**
   * @param {string} data - paramEmittedOnClick value passed in Input to the component
   */
  data: any;
  /**
   * @param {string} event - click event
   */
  event: any;
}

@Component({
  selector: "hyt-detailed-card",
  templateUrl: "./hyt-detailed-card.component.html",
  styleUrls: ["./hyt-detailed-card.component.scss"],
})
export class HytDetailedCardComponent {
  private logger: Logger;
  /**
   * @property {string} title - Name of the element
   */
  @Input() title: string;
  /**
   * @property {string} description - Description rendered on hover (max two line) and tooltip of the full description
   */
  @Input() description: string;
  /**
   * @property {string} btnLabel - Text of the primary button of the card that will be shown on hover
   */
  @Input() btnLabel: string;
  /**
   * @property {string} detailedIcon - Icon that will be shown as badge on top-right of the card
   */
  @Input() detailedIcon: string = "";
  /**
   * @property {CardDetailOnHover[]} details - **MAX 5** List of details of the element that will render a little icon and small description(max one line) on hover
   */
  @Input() details: CardDetailOnHover[] = [];
  /**
   * @property {string} imageFrontCard - Image that will be setted as background of the card on the front
   */
  @Input() imageFrontCard: string = "";
  /**
   * @property {string} imageHoverCard - Image that will be setted as background of the card that will be shown on hover
   */
  @Input() imageHoverCard: string = "";
  /**
   * @property {string} valRouterLink - The route that will be navigated on click of the primaryBtn
   */
  @Input() valRouterLink: string = "";
  /**
   * @property {boolean} forceHover - Force the hover state on the card
   */
  @Input() forceHover: boolean = false;
  /**
   * @property {string} secondaryButtonIcon - Render a second button on hover with an icon that can be use for extra actions
   */
  @Input() secondaryButtonIcon: string = "";
  /**
   * @property {any} paramEmittedOnClick - The value that will be emitted on every button click
   */
  @Input() paramEmittedOnClick: any = "";
  /**
   * @property {EventEmitter<CardEmittedValue>} btnClick - Emit when the primary button is clicked if valRouterLink is not passed
   */
  @Output() btnClick = new EventEmitter<CardEmittedValue>();
  /**
   * @property {EventEmitter<CardEmittedValue>} secondaryBtnClick - If secondaryButton is rendered, emit when clicked
   */
  @Output() secondaryBtnClick = new EventEmitter<CardEmittedValue>();
  /**
   * @property {EventEmitter<CardEmittedValue>} deleteClick - If secondaryButton is rendered, emit when clicked
   */
  @Output() deleteClick = new EventEmitter<CardEmittedValue>();

  constructor(loggerService: LoggerService) {
    this.logger = new Logger(loggerService);
    this.logger.registerClass("HytDetailedCardComponent");
  }

  /**
   * Emit the event that the primary button has been clicked.
   * @public
   */
  onClick(event: any) {
    this.logger.debug(
      "Primary button clicked, value emitted",
      this.paramEmittedOnClick
    );
    this.btnClick.emit(this.formatDataToEmit(event));
  }

  /**
   * Emit the event that the secondary button has been clicked.
   * @public
   */
  onSecondaryClick(event: any) {
    this.logger.debug(
      "Secondary button clicked, value emitted",
      this.paramEmittedOnClick
    );
    this.secondaryBtnClick.emit(this.formatDataToEmit(event));
  }

  /**
   * Emit the event that the delete button has been clicked
   * @public
   */
  emitDelete(event: any) {
    this.logger.debug(
      "Delete button clicked, value emitted",
      this.paramEmittedOnClick
    );
    this.deleteClick.emit(this.formatDataToEmit(event));
  }

  /**
   * Create the object that every element emit on the click
   * @param e click event object
   * @returns
   */
  private formatDataToEmit(e: any): CardEmittedValue {
    return {
      event: e,
      data: this.paramEmittedOnClick,
    };
  }

  /**
   * Return the formatted url that can be setted in attr for get in scss with attr()
   * @public
   */
  getImageUrl(image): string {
    return `url(${image})`;
  }
}