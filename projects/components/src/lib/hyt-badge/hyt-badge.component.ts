import { Component, Input, OnInit } from "@angular/core";
import { Logger, LoggerService } from "core";

/**
 * @Description Enum for declare the shape, pills(suggested for text with a lot of padding horizontal), square, round(border-radius: .3rem), circle(default)
 */
export enum HytBadgeShape {
  PILLS = "pills",
  SQUARE = "square",
  ROUND = "round",
  CIRCLE = "circle",
}

/**
 * @Description Enum for declare the size, xs & sm(suggested for icon), md(default), lg
 */
export enum HytBadgeSize {
  XSMALL = "xs",
  SMALL = "sm",
  MEDIUM = "md",
  LARGE = "lg",
}

/**
 * @Description
 * Component for print small detail with strong visibility and appearence
 */
@Component({
  selector: "hyt-badge",
  templateUrl: "./hyt-badge.component.html",
  styleUrls: ["./hyt-badge.component.scss"],
})
export class HytBadgeComponent {
  private logger: Logger;
  /**
   * @param {string} label - Source tag in the translation file of the project
   */
  @Input() label: string = "";
  /**
   * @param {boolean} keyLabel - Id tag in the translation file
   */
  @Input() keyLabel: string = "";
  /**
   * @param {boolean} icon - If icon has a value, an icon will be render and label will be ignored
   */
  @Input() icon: string = "";
  /**
   * @property {HytBadgeShape} shape - Enum for declare the shape, pills(suggested for text with a lot of padding horizontal), square, round(border-radius: .3rem), circle(default)
   */
  @Input() shape: HytBadgeShape = HytBadgeShape.CIRCLE;
  /**
   * @property {HytBadgeSize} size - Enum for declare the size, xs & sm(suggested for icon), md(default), lg
   */
  @Input() size: HytBadgeSize = HytBadgeSize.MEDIUM;
  /**
   * @property {HytBadgeSize} size - gradient direction for background
   */
  @Input() gradientDirection: 'top'|'left'|'bottom'|'right' = 'bottom';

  constructor(loggerService: LoggerService) {
    this.logger = new Logger(loggerService);
    this.logger.registerClass("HytBadgeComponent");
  }
}
