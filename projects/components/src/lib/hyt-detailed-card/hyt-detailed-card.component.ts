import { Component, Input, Output, EventEmitter } from "@angular/core";

export interface Translation {
  /**
   * @param {Translation} label - Target tag in the translation file of the project
   */
  key: string,
  /**
   * @param {Translation} label - Source tag in the translation file of the project
   */
  label: string
}

/**
 * @Description
 * Declare the role on the project: 
 * PERSONAL = not shared
 * OWNER = you can share
 * COLLABORATOR = someone share the project with you
 */
export enum SharedRole {
  PERSONAL = "personal",
  OWNER = "owner",
  COLLABORATOR = "collaborator",
}

/**
 * @Description
 * Details printed on hover before the btn
 */
export interface DetailOnHover {
  /**
   * @param {string} icon - icon will be render before the label
   */
  icon: string,
  /**
   * @param {number} count - how many of them are in the element
   */
  count: number,
  label: Translation
}


@Component({
  selector: "hyt-detailed-card",
  templateUrl: "./hyt-detailed-card.component.html",
  styleUrls: ["./hyt-detailed-card.component.css"],
})
export class HytDetailedCardComponent {
  @Input() title : string;
  @Input() description : string;
  @Input() btnLabel : Translation;
  @Input() shared : SharedRole = SharedRole.PERSONAL;
  @Input() details : DetailOnHover[] = [];
  @Input() routerLink : string = '';
  @Input() secondaryButtonIcon : string = '';
  @Output() btnClick = new EventEmitter();
  @Output() secondaryBtnClick = new EventEmitter();
  
  
  onClick() {
    this.btnClick.emit();
  }
  onSecondaryClick() {
    this.secondaryBtnClick.emit();
  }
}
