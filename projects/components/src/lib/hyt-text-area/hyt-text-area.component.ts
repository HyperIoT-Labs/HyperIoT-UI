import { Component, OnInit, Input, ViewChild, ElementRef, forwardRef, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, Validators, FormGroupDirective, NgForm, FormGroup } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

/**
 * Custom provider for NG_VALUE_ACCESSOR
 */
export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => HytTextAreaComponent),
  multi: true
};

/**
 * Error when invalid control is dirty, touched, or submitted
 */
export class CustomErrorStateMatcherArea implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: "hyt-text-area",
  templateUrl: "./hyt-text-area.component.html",
  styleUrls: ["./hyt-text-area.component.scss"],
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR],
})
export class HytTextAreaComponent implements OnInit, ControlValueAccessor {
  /**
   * Binding variables with text area element
   */
  @Input() formControl: FormControl;
  @Input() form: FormGroup;
  @Input() placeholder: any = "";
  @Input() fieldValue: string;
  @Input() type: string;
  @Input() id: string;
  @Input() name: string;
  @Input() hint = "";
  @Input() externalHint = null;
  @Output() outHint: EventEmitter<string> = new EventEmitter<string>();

  /** This error appears in case of injected error */
  private injectedError = "";

  /** Map error type with default error string */
  errorMap = {
    validateInjectedError: "",
  };

  /**
   * Default errors are displayed at the top of the field
   */
  private defaultErrors: string[] = ["validateInjectedError"];

  @Input()
  set injectedErrorMsg(msg: string) {
    this.injectedError = msg;
    this.errorMap.validateInjectedError = msg;
  }

  value: any = "";

  // @ViewChild('inputElement', {}) private inputElement: ElementRef;

  @Input() isRequired = false;
  @Input() errorMsgRequired: string;
  errMsgRequired = "The field is required";

  matcher = new CustomErrorStateMatcherArea();

  constructor() {}

  ngOnInit() {
    const validators = [];
    if (this.isRequired) {
      validators.push(Validators.required);
      this.placeholder += " *";
    }

    if (this.errorMsgRequired) {
      this.errMsgRequired = this.errorMsgRequired;
    }

    this.formControl = new FormControl("", Validators.compose(validators));
    if (this.fieldValue) {
      this.formControl.setValue(this.fieldValue);
    }
    this.form.addControl(this.name, this.formControl);
  }

  private onChangeFn = (_: any) => {};
  private onTouchedFn = () => {};

  writeValue(obj: any): void {
    this.value = obj;
  }

  registerOnChange(fn: any): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedFn = fn;
  }

  onChange(event: any) {
    this.onChangeFn(event.target.value);
  }

  onKeyup(event: any) {
    this.onChangeFn(event.target.value);
  }

  /** onBlur callback */
  onBlur() {
    this.outHint.emit(null);
    this.onTouchedFn();
  }

  onFocus() {
    this.outHint.emit(this.externalHint);
  }

  getDefaultErrorList(): string[] {
    const errorList: string[] = [];

    for (const key in this.formControl.errors) {
      if (this.formControl.errors.hasOwnProperty(key)) {
        if (
          this.errorMap.hasOwnProperty(key) &&
          this.defaultErrors.includes(key)
        ) {
          errorList.push(this.errorMap[key]);
        }
      }
    }
    return errorList;
  }
}
