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
   * @property {string} routerLink - The route that will be navigated on click of the primaryBtn
   */
  @Input() routerLink: string = "";
  /**
   * @property {string} secondaryButtonIcon - Render a second button on hover with an icon that can be use for extra actions
   */
  @Input() secondaryButtonIcon: string = "";
  /**
   * @property {any} paramEmittedOnClick - The value that will be emitted on every button click
   */
  @Input() paramEmittedOnClick: any = "";
  /**
   * @property {string} btnClick - Emit when the primary button is clicked if routerLink is not passed
   */
  @Output() btnClick = new EventEmitter<any>();
  /**
   * @property {string} secondaryBtnClick - If secondaryButton is rendered, emit when clicked
   */
  @Output() secondaryBtnClick = new EventEmitter<any>();

  constructor(loggerService: LoggerService) {
    this.logger = new Logger(loggerService);
    this.logger.registerClass("HytDetailedCardComponent");
  }

  /**
   * Emit the event that the primary button has been clicked.
   * @public
   */
  onClick() {
    this.logger.debug("Primary button clicked");
    this.btnClick.emit(this.paramEmittedOnClick);
  }

  /**
   * Emit the event that the secondary button has been clicked.
   * @public
   */
  onSecondaryClick() {
    this.logger.debug("Secondary button clicked");
    this.secondaryBtnClick.emit(this.paramEmittedOnClick);
  }

  /**
   * Return the formatted url that can be setted in attr for get in scss with attr()
   * @public
   */
  getImageUrl(image): string {
    return `url(${image})`;
  }
}
