import { Component, OnInit, Input, forwardRef, ViewEncapsulation, OnChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, Validators, FormGroup } from '@angular/forms';

/** Interface for select option element */
export interface SelectOption {
  value?: string;
  label: string;
}

/** Interface for a group of select options element */
export interface SelectOptionGroup {
  disabled?: boolean;
  name: string;
  options: SelectOption[];
}

/** Custom provider for NG_VALUE_ACCESSOR */
export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR_TEMPLATE: any = {
  provide: NG_VALUE_ACCESSOR,
  // tslint:disable-next-line: no-use-before-declare
  useExisting: forwardRef(() => HytSelectTemplateComponent),
  multi: true
};

@Component({
  selector: 'hyt-select-template',
  templateUrl: './hyt-select-template.component.html',
  styleUrls: ['./hyt-select-template.component.scss'],
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR_TEMPLATE],
  encapsulation: ViewEncapsulation.None
})
export class HytSelectTemplateComponent implements OnInit, ControlValueAccessor, OnChanges {

  /** Selected element */
  selected: any;

  /** Element name, connected to the formcontrol */
  @Input() name = '';

  /** Select main label */
  @Input() label = '';

  /** Element name, connected to the formcontrol */
  @Input() placeholder = '';

  /** Array of displayed options */
  @Input() options: SelectOption[] = [];

  /** Array of displayed group options */
  @Input() groups: SelectOptionGroup[] = [];

  /** Optional select hint */
  @Input() hint: string;

  /** Specifies if the select form is required */
  @Input() isRequired: boolean;

  /** Error displayed in case of required form */
  @Input() errorMsgRequired: string;

  /** Disable the select */
  @Input() disabled = false;

  /** Specifies if it is a multiple select */
  @Input() isMultiple = false;

  /** Tells if the elements are sortable */
  @Input() isSortable = false;

  /** Specify the element sorting algorithm */
  @Input() sortingAlgorithm = 'A-Z';

  /** Function used to compare elements */
  // @Input() compareFn: Function;

  /**
   * Map an error key with the displayed message
   */
  errorMap = {
    required: 'The field is required.',
  };

  /**
   * Callback functions for change
   */
  private onChangeFn = (_: any) => { };

  /**
   * Callback functions for blur
   */
  private onTouchedFn = () => { };

  /**
   * Constructor
   */
  constructor() { }

  sortAlphabeticallyAsc (option1: SelectOption, option2: SelectOption): 1 | -1 | 0  {
    if (option1.label.localeCompare(option2.label) === 1) {
      return 1;
    } else  if (option1.label.localeCompare(option2.label) === -1) {
      return -1;
    } else {
      return 0;
    }
  }

  sortAlphabeticallyDesc (option1: SelectOption, option2: SelectOption): 1 | -1 | 0 {
    if (option1.label.localeCompare(option2.label) === 1) {
      return -1;
    } else  if (option1.label.localeCompare(option2.label) === -1) {
      return 1;
    } else {
      return 0;
    }
  }

  sortOptions() {
    if (this.isSortable) {

      let sortingFunction: (option1: SelectOption, option2: SelectOption) => 1 | -1 | 0 ;

      switch (this.sortingAlgorithm) {
        case 'A-Z':
          sortingFunction = this.sortAlphabeticallyAsc;
          break;
        case 'Z-A':
          sortingFunction = this.sortAlphabeticallyDesc;
          break;
        default:
          sortingFunction = (o1: SelectOption, o2: SelectOption) => 0;
          break;
      }

      this.options = this.options.sort(sortingFunction);
    }
  }

  ngOnChanges(): void {
    this.sortOptions();    
  }
  
  /**
   * ngOnInit
   */
  ngOnInit() {
    this.sortOptions();
  }

  /**
   * Sort the selectOptions alphabetically
   * @param order If true options are sorted asc else desc
   */
  sortOptionsAlphabetically(order: boolean) {
    let sortedSelectOptions: SelectOption[] = [];

    if (order) {
      sortedSelectOptions = this.options.sort((option1, option2) => {
        if (option1.label.localeCompare(option2.label) === 1) {
            return 1;
        } else  if (option1.label.localeCompare(option2.label) === -1) {
          return -1;
        } else {
          return 0;
        }
      });
    } else {
      sortedSelectOptions = this.options.sort((option1, option2) => {
        if (option1.label.localeCompare(option2.label) === 1) {
            return -1;
        } else  if (option1.label.localeCompare(option2.label) === -1) {
          return 1;
        } else {
          return 0;
        }
      });
    }
  }

  // get accessor
  get value(): any {
    return this.selected;
  }

  // set accessor including call the onchange callback
  set value(v: any) {
    if (v !== this.selected) {
      this.selected = v;
      this.onChangeFn(v);
    }
  }

  writeValue(value: any): void {
    this.selected = value;
  }

  registerOnChange(fn: any): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedFn = fn;
  }

}
