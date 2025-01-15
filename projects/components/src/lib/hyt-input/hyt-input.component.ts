import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  forwardRef,
  ViewEncapsulation,
  Output,
  EventEmitter,
} from "@angular/core";
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormGroupDirective,
  NgForm,
  FormControl,
  Validators,
  FormGroup,
} from "@angular/forms";
import { ErrorStateMatcher } from "@angular/material/core";

import { Logger, LoggerService } from "core";

/**
 * Custom provider for NG_VALUE_ACCESSOR
 */
export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR_INPUT: any = {
  provide: NG_VALUE_ACCESSOR,
  // tslint:disable-next-line: no-use-before-declare
  useExisting: forwardRef(() => HytInputComponent),
  multi: true,
};

/**
 * Error when invalid control is dirty, touched, or submitted
 */
export class CustomErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
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
  selector: "hyt-input-text",
  templateUrl: "./hyt-input.component.html",
  styleUrls: ["./hyt-input.component.scss"],
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR_INPUT],
  encapsulation: ViewEncapsulation.None,
})
export class HytInputComponent implements OnInit, ControlValueAccessor {
  private logger: Logger;

  /** FormGroup */
  @Input() form: FormGroup;

  /** FormControl */
  @Input() formControl: FormControl;

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

  @Input() externalHint = null;

  /** Autocomplete attribute value */
  @Input() autocomplete = "";

  @Output() outHint: EventEmitter<string> = new EventEmitter<string>();

  /** ViewChild */
  @ViewChild("input") private inputElement: ElementRef;

  /** This error appears in case of injected error */
  @Input()
  set injectedErrorMsg(msg: string) {
    this.injectedError = msg;
    this.errorMap.validateInjectedError = msg;
  }

  /** Applies required validation */
  @Input() isRequired = false;

  /** Disabled option */
  isDisabled: boolean;
  @Input()
  set disabled(d: boolean) {
    this.isDisabled = d;
  }
  get disabled(): boolean {
    return this.isDisabled;
  }

  /** Applies email validation */
  @Input() isEmail = false;

  /** Applies password validation */
  @Input() isPassword = false;

  /** Applies regex validation */
  @Input() pattern = "";

  /** Applies regex validation */
  @Input() patternErrorMessage = "";

  /** Applies password type but not password validation */
  @Input() isInputPassword = false;

  /**
   * Applies password type and add confirm validation.
   * Validation will compare the actual value with the formControl specified by this field
   */
  @Input() confirmPassword = "";

  /*
   * Adds password validation to match confirm password
   */
  @Input() password = "";

  /* Variable used to determine focus in and out of the input */
  public inputFocused: boolean = false;

  /** The internal data */
  private innerValue: any = "";

  private injectedError = "";

  /** Custom error matcher */
  matcher = new CustomErrorStateMatcher();

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
    pattern: $localize`:@@HYT_pattern_error_default_message:Invalid input`,
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

  /**
   * Constructor
   */
  constructor(private loggerService: LoggerService) {
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass("HytInputComponent");
  }

  /**
   * ngOnInit
   */
  ngOnInit() {
    const validators = [];
    const self = this;

    let confirmPasswordSelector;

    function validateUperCase(c: FormControl) {
      const PASS_REGEX: RegExp = new RegExp("^(?=.*[a-z])(?=.*[A-Z]).*$");
      return PASS_REGEX.test(c.value) || !c.value || c.value.length === 0
        ? null
        : {
            validateUperCase: {
              valid: false,
            },
          };
    }
    function validateNumber(c: FormControl) {
      const PASS_REGEX: RegExp = new RegExp("^(?=.*[a-z])(?=.*[0-9]).*$");
      return PASS_REGEX.test(c.value) || !c.value || c.value.length === 0
        ? null
        : {
            validateNumber: {
              valid: false,
            },
          };
    }
    function validateSpecialChar(c: FormControl) {
      const PASS_REGEX: RegExp = new RegExp("[^A-Za-z0-9]");
      return PASS_REGEX.test(c.value) || !c.value || c.value.length === 0
        ? null
        : {
            validateSpecialChar: {
              valid: false,
            },
          };
    }

    function validatePassword(c: FormControl) {
      if (c.dirty) {
        const field = self.password ? self.password : self.confirmPassword;
        const passwordForm = self.form.get(field);
        let password = "";
        let passwordValid = true;
        const validateConfirmPassword = {
          validateConfirmPassword: { valid: false },
        };
        if (passwordForm) {
          password = passwordForm.value;
          passwordValid = passwordForm.valid;
        }
        return passwordValid || c.value.length === 0
          ? c.value !== password
            ? confirmPasswordSelector
              ? self.form
                  .get(confirmPasswordSelector)
                  .setErrors(validateConfirmPassword)
              : validateConfirmPassword
            : null
          : c.value === password
          ? self.form.get(field).updateValueAndValidity()
          : null;
      }
    }

    if (this.isRequired) {
      validators.push(Validators.required);
      this.placeholder += " *";
    }
    if (this.isEmail) {
      validators.push(Validators.email);
    }
    if (this.pattern) {
      validators.push(Validators.pattern(new RegExp(this.pattern)));
      if (this.patternErrorMessage) {
        this.errorMap.pattern = this.patternErrorMessage;
      }
    }
    if (this.isPassword) {
      validators.push(Validators.minLength(8));
      validators.push(validateUperCase);
      validators.push(validateNumber);
      validators.push(validateSpecialChar);
    }

    if (this.password !== "" || this.confirmPassword !== "") {
      if (this.password !== "") confirmPasswordSelector = this.password;
      validators.push(validatePassword);
    }

    if (this.injectedErrorMsg) {
      this.errorMap.validateInjectedError = this.injectedErrorMsg;
    }

    this.formControl = new FormControl(
      { value: "", disabled: this.isDisabled },
      Validators.compose(validators)
    );
    if (this.fieldValue) {
      this.formControl.setValue(this.fieldValue);
    }

    if (this.form) {
      this.form.addControl(this.name, this.formControl);
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

  /** returns the errors to be displayed in the mat-error tag */
  getMultiErrorList(): string[] {
    const errorList: string[] = [];

    for (const key in this.formControl.errors) {
      if (
        this.formControl.errors.hasOwnProperty(key) &&
        !this.defaultErrors.includes(key)
      ) {
        if (this.errorMap.hasOwnProperty(key)) {
          errorList.push(this.errorMap[key]);
        }
      }
    }
    return errorList;
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

  /** Toggle the state of the input between text and password */
  tooglePassword() {
    if (this.type === "password") {
      this.type = "text";
      this.visibilityIcon = "visibility_off";
    } else {
      this.type = "password";
      this.visibilityIcon = "visibility";
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
    this.logger.debug("onChange method event: ", JSON.stringify(event));
    this.onChangeFn(event);
  }

  /** onKeyup callback */
  onKeyup(event: any) {
    this.onChangeFn(event.target.value);
  }

  /** onBlur callback */
  onBlur() {
    this.outHint.emit(null);
    this.onTouchedFn();
    this.inputFocused = false;
  }

  onFocus() {
    this.outHint.emit(this.externalHint);
    this.inputFocused = true;
  }
}
