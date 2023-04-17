import { Component, OnInit, forwardRef, ViewEncapsulation, Output, EventEmitter, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

/**
 * Custom provider for NG_VALUE_ACCESSOR
 */
export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR_CHECKBOX: any = {
  provide: NG_VALUE_ACCESSOR,
  // tslint:disable-next-line: no-use-before-declare
  useExisting: forwardRef(() => HytCheckboxComponent),
  multi: true
};

@Component({
  selector: "hyt-checkbox",
  templateUrl: "./hyt-checkbox.component.html",
  styleUrls: ["./hyt-checkbox.component.css"],
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR_CHECKBOX],
  encapsulation: ViewEncapsulation.None,
})
export class HytCheckboxComponent implements OnInit, ControlValueAccessor {
  /** Function called when click event is triggered */
  @Output() changeFn: EventEmitter<any> = new EventEmitter();

  /** The internal data */
  @Input() value: any = false;

  private onChange: (val: boolean) => void;

  private onTouched: () => void;

  constructor() {}

  ngOnInit() {}

  onClick() {
    this.onChange(!this.value);
    this.onTouched();
    this.changeFn.emit(!this.value);
  }

  /**
   * ControlValueAccessor.
   * Set the internal value
   */
  writeValue(value: any): void {
    this.value = value;
  }

  /**
   * ControlValueAccessor.
   * Set onChange function
   */
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  /**
   * ControlValueAccessor.
   * Set onTouched function
   */
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
