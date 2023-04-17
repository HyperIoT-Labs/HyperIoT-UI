import { Component, OnInit, Input, forwardRef, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'hyt-autocomplete',
  exportAs: 'hytAutocomplete',
  templateUrl: './hyt-autocomplete.component.html',
  styleUrls: ['./hyt-autocomplete.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => HytAutocompleteComponent),
      multi: true
    }
  ]
})

export class HytAutocompleteComponent implements OnInit {

  filteredOptions: Observable<string[]>;

  /** ViewChild */
  @ViewChild('auto') private matAuto: ElementRef;

  /** Function called when click event is triggered */
  @Output() optionSelected: EventEmitter<any> = new EventEmitter();

  /** FormControl */
  @Input() formControl: FormControl;

  @Input() input: any;

  /** List of suggested values */
  optionList: string[];

  @Input()
  get options() {
    return this.optionList;
  }
  set options(opts: string[]) {
    this.optionList = opts;
  }

  /** The internal data */
  private innerValue: any = '';

  /** Callback function for change event */
  private onChangeFn = (_: any) => { };

  /** Callback function for blur event */
  private onTouchedFn = () => { };

  constructor() { }

  ngOnInit() {
    this.filteredOptions = this.formControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );

    this.input.matAutocomplete = this.matAuto;
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.optionList.filter(option => option.toLowerCase().includes(filterValue));
  }

  selected(event) {
    this.optionSelected.emit(event);
  }

  /**
   * ControlValueAccessor.
   * Set the internal value
   */
  writeValue(value: any): void {
    this.innerValue = value;
  }

  /**
   * ControlValueAccessor.
   * Set onChange function
   */
  registerOnChange(fn: any): void {
    this.onChangeFn = fn;
  }

  /**
   * ControlValueAccessor.
   * Set onTouched function
   */
  registerOnTouched(fn: any): void {
    this.onTouchedFn = fn;
  }
}
