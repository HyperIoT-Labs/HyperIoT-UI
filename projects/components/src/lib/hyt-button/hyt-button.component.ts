import {
  Component,
  OnInit,
  Input,
  Output,
  ViewEncapsulation,
  EventEmitter,
} from "@angular/core";

/**
 * Wrapper for the botton element.
 */
@Component({
  selector: "hyt-button",
  templateUrl: "./hyt-button.component.html",
  styleUrls: ["./hyt-button.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class HytButtonComponent {
  /** Specifies button color: primary, accent or warn */
  @Input() color: string;

  /** Disables the button */
  @Input() isDisabled: boolean;

  /** Button type */
  @Input() type: string; //outlined

  /** Rounded border */
  @Input() rounded: boolean = false; //outlined

  /** Function called when click event is triggered */
  @Output() clickFn: EventEmitter<any> = new EventEmitter();

  /**
   * Callback for click.
   */
  clickCallback() {
    if (!this.isDisabled) {
      this.clickFn.emit();
    }
  }
}