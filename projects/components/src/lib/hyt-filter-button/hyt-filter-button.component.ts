import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export enum HytFilterButtonShape{
  SQUARE="square",
  ROUND="round",
  CIRCLE="circle"
}

export interface HytFilterButtonFilter{ 
  value: string,
  label?: string, 
  keyLabel?: string,
  icon?: string, 
  tooltip?: string
}
@Component({
  selector: 'hyt-filter-button',
  templateUrl: './hyt-filter-button.component.html',
  styleUrls: ['./hyt-filter-button.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => HytFilterButtonComponent),
      multi: true,
    },
  ],
})
export class HytFilterButtonComponent implements ControlValueAccessor {
  @Input() options: HytFilterButtonFilter[];
  @Input() label: string;
  @Input() shape: HytFilterButtonShape = HytFilterButtonShape.CIRCLE;
  @Input() formControlName: string;
  private _value;

  get value(): any { 
    return this._value;
  }
  
  @Input()
  set value(val: string) {
    this._value = val || this.options[0]?.value;
  }
  disabled: boolean = false;
  
  // Function to call when the value changes.
  onChange: any = () => {};

  // Function to call when the component is touched.
  onTouched: any = () => {};

  // Write value upon external change.
  writeValue(value: any): void {
    console.log("writeValue");
    
    this.value = value;
  }

  // Register a callback function to be called when the value changes.
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  // Register a callback function to be called when the component is touched.
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // Update the value and call the onChange callback when the radio button changes.
  onRadioChange(data: HytFilterButtonFilter): void {
    this.value = data.value;
    this.onChange(data.value);
    this.onTouched();
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
