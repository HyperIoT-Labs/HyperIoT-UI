import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * @Description Enum for declare how do you want your border for the single filter, square, round(border-radius: .3rem), circle(default)
 */
export enum HytFilterButtonShape{
  SQUARE="square",
  ROUND="round",
  CIRCLE="circle"
}

/**
 * @description Interface for the single filter for render it
 */
export interface HytFilterButtonFilter{ 
  /**
   * @param {string} value - The value of the filter that will be emitted to the form when selected
   */
  value: string,
  /**
   * @param {string} label - Source tag in the translation file of the project
   */
  label?: string, 
 /**
  * @param {boolean} keyLabel - Id tag in the translation file
  */
  keyLabel?: string,
  /**
   * @param {boolean} icon - If icon has a value, an icon will be render and label will be ignored
   */
  icon?: string, 
  /**
   * @param {string} tooltip - On hover, insert a little description for the filter that will popup
   */
  tooltip?: string
}

/**
 * @Description
 * Component for render filter with faster usability for the user than a dropdown, my reccomandation is to use it when you have max 6 different options
 */
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
  /**
   * @property {HytFilterButtonFilter[]} options - Filter list object
   */
  @Input() options: HytFilterButtonFilter[];
  /**
   * @property {string} label - The title of the filter that will be render on the top of the filter
   */
  @Input() label: string;
  /**
   * @property {HytFilterButtonShape} shape - This enum declare how do you want your border for the single filter, square, round(border-radius: .3rem), circle(default)
   */
  @Input() shape: HytFilterButtonShape = HytFilterButtonShape.CIRCLE;
  /**
   * @property {string} formControlName - The name that you give to the control in the form
   */
  @Input() formControlName: string;

  /**
   * @property {any} value - Default value selected, if null the first option will be selected
   */
  private _value;
  get value(): any { 
    return this._value;
  }
  /**
   * When the value is setted if is null, the component will take the first options as the active one
   */
  @Input()
  set value(val: string) {
    this._value = val || this.options[0]?.value;
  }
  
  /**
   * @property {boolean} disabled - When setted to true, block the interaction with all the filter of the FilterButtonComponent
   */
  disabled: boolean = false;
  
  /**
   * Function to call when the value changes.
   */
  onChange: any = () => {};

  /**
   * Function to call when the component is touched.
   */
  onTouched: any = () => {};

  /**
   * Write value upon external change.
   * @prop {any} fn - Used for writing value from the external of the component used by the FormControl
   */
  writeValue(value: any): void {
    this.value = value;
  }

  /**
   * Register a callback function to be called when the value changes.
   * @prop {Function} fn - Custom function that the user can customize when value change
   */
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  /**
   *  Register a callback function to be called when the component is touched.
   * @public
   * @param {HytFilterButtonFilter} data - The filter data that has been selected
   */
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  /**
   * 
   * @param tt 
   */
  test(tt: string){

  }

  /**
   * Update the value and call the onChange callback when the radio button changes.
   * @public
   * @param {HytFilterButtonFilter} data - The filter data that has been selected
   */
  onRadioChange(data: HytFilterButtonFilter): void {
    this.value = data.value;
    this.onChange(data.value);
    this.onTouched();
  }

  /**
   * Used for stop/enable the interaction with all the filter of the FilterButtonComponent
   * @public
   * @param {boolean} isDisabled - Flag that will be setted in disabled attribute
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
