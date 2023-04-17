import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'hyt-icon-button',
  templateUrl: './hyt-icon-button.component.html',
  styleUrls: ['./hyt-icon-button.component.css']
})
export class HytIconButtonComponent {
  /** Specifies button color: primary, accent or warn */
  @Input() color: string;

  /** Disables the button */
  @Input() isDisabled: boolean;

  /** Button type */
  @Input() type: string;

  /** Button icon */
  @Input() icon;

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
