import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  forwardRef,
  ViewEncapsulation
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormGroupDirective,
  NgForm,
  FormControl,
  Validators,
  FormGroup
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { Observable } from 'rxjs';
import { LoggerService, Logger } from 'core';
import '@angular/localize/init';

/**
 * Custom provider for NG_VALUE_ACCESSOR
 */
export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR_INPUT_TEMPLATE: any = {
  provide: NG_VALUE_ACCESSOR,
  // tslint:disable-next-line: no-use-before-declare
  useExisting: forwardRef(() => HytInputTemplateComponent),
  multi: true
};

/**
 * Error when invalid control is dirty, touched, or submitted
 */
export class CustomErrorStateMatcherInputTemplate implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

/**
 * Wrapper for text input, this component allows to insert a text field.
 * Input validation is performed using an attribute that specifies validation type.
 * Supported validations are:
 *
 * isRequired: mandatory field
 * isEmail: email validation
 * isPassword: password validation
 * isInputPassword: password without validators
 */
@Component({
  selector: "hyt-input-template",
  templateUrl: "./hyt-input-template.component.html",
  styleUrls: ["./hyt-input-template.component.scss"],
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR_INPUT_TEMPLATE],
  encapsulation: ViewEncapsulation.None,
})
export class HytInputTemplateComponent implements OnInit, ControlValueAccessor {
  /** Foloating label of the input */
  @Input() placeholder: any = "";

  /** Initial field value */
  @Input() fieldValue: string;

  /** Element id */
  @Input() id = "";

  /** Element name, connected to the formcontrol */
  @Input() name = "";

  /** Type of the input: text or passowrd */
  @Input() type = "";

  /** Optional additional hint */
  @Input() hint = "";

  /** If 'bottom' is specified errors appears at the bottom */
  @Input() errorPosition = "";

  /** ViewChild */
  @ViewChild("input") private inputElement: ElementRef;

  /** Applies required validation */
  @Input() isRequired = false;

  /** Disabled option */
  @Input() isDisabled = false;

  /** Applies pattern validation */
  @Input() pattern: RegExp;

  /** The internal data */
  private innerValue: any = "";

  /** Custom error matcher */
  matcher = new CustomErrorStateMatcherInputTemplate();

  /** The password visibility icon */
  visibilityIcon = "visibility";

  /** Map error type with default error string */
  errorMap = {
    required: $localize`:@@HYT_field_required:The field is required`, // 'The field is required.',
    validateRequired: $localize`:@@HYT_field_required:The field is required`,
    email: $localize`:@@HYT_valid_email:Please enter a valid email address`,
    minlength: $localize`:@@HYT_min_length:At least 8 character length`,
    validateNumber: $localize`:@@HYT_min_one_number:At least one number`,
    validateUperCase: $localize`:@@HYT_upper_case:At least one uppercase character`,
    validateSpecialChar: $localize`:@@HYT_special_char:At least one special character`,
    validateConfirmPassword: "Password Mismatch",
    validatePassword: "Password must be valid",
    validateInjectedError: "",
  };

  /**
   * Default errors are displayed at the top of the field
   */
  private defaultErrors: string[] = [
    "required",
    "validateRequired",
    "email",
    "validateConfirmPassword",
    "validatePassword",
    "validateInjectedError",
  ];

  /** Callback function for change event */
  private onChangeFn = (_: any) => {};

  /** Callback function for blur event */
  private onTouchedFn = () => {};

  private logger: Logger;

  /**
   * Constructor
   */
  constructor(private loggerService: LoggerService) {
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass("HytInputTemplateComponent");
  }

  /**
   * ngOnInit
   */
  ngOnInit() {
    if (this.fieldValue !== undefined) {
      this.innerValue = this.fieldValue;
    }
  }

  /** get accessor */
  get value(): any {
    return this.innerValue;
  }

  /** set accessor including call the onchange callback  */
  set value(v: any) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      this.onChangeFn(v);
    }
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

  /** onChange callback */
  onChange(event: any) {
    this.logger.info("onChange method called");
    this.logger.debug(JSON.stringify(event));
    this.onChangeFn(event);
  }

  /** onKeyup callback */
  onKeyup(event: any) {
    this.logger.info("onKeyup method called");
    this.onChangeFn(event.target.value);
  }

  /** onBlur callback */
  onBlur() {
    this.logger.info("onBlur method called");
    this.onTouchedFn();
  }
}
